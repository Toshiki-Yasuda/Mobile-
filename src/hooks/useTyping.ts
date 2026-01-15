/**
 * タイピングロジックを管理するカスタムフック
 *
 * チャプター1-2: インスタントモード（1文字ずつ即時判定）
 * チャプター3以降: タイプライターモード（入力→Enter確定）
 *
 * 以下の4つの専門的フックを統合:
 * - useTypingInput: 入力検証ロジック
 * - useTypingScore: スコア計算と単語完了処理
 * - useTypingAnimation: 爆発やシェイク演出
 * - useTypingState: 入力状態とHP管理
 */

import { useCallback, useEffect, useRef } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { useProgressStore } from '@/stores/progressStore';
import { useSound } from '@/hooks/useSound';
import {
  createInitialState,
  processKeyInput,
  getCurrentValidKeys,
  getDisplayRomaji,
} from '@/engine/romajiEngine';
import { useTypingInput } from './useTypingInput';
import { useTypingScore } from './useTypingScore';
import { useTypingAnimation } from './useTypingAnimation';
import { useTypingState } from './useTypingState';
import { HP_CONFIG } from '@/constants/gameJuice';
import type { Word } from '@/types/game';

// タイプライターモードを使用するチャプター閾値
const TYPEWRITER_MODE_THRESHOLD = 3;

export function useTyping() {
  const {
    session,
    selectedChapter,
    setTypingState,
    nextWord,
    endSession,
    navigateTo,
  } = useGameStore();

  const { updateKeyStats } = useProgressStore();
  const { playTypeSound, playMissSound } = useSound();

  // 専門的フックの利用
  const { validateTypewriterInput } = useTypingInput();
  const { handleWordComplete } = useTypingScore();
  const { explosionTrigger, successShakeTrigger, lastExplosionWasPerfect, triggerExplosion } =
    useTypingAnimation();
  const {
    userInput,
    setUserInput,
    currentHP,
    damageHP,
    recoverHP,
    hadMissThisWord,
    setHadMissThisWord,
    resetWordState,
    recentPressedKeys,
    flashKey,
    getInputStatus,
  } = useTypingState();

  // キー入力のタイムスタンプ
  const lastKeyTimeRef = useRef<number>(0);
  const wordStartTimeRef = useRef<number>(0);

  // 現在の単語を取得
  const currentWord = session?.words[session.currentWordIndex];

  // タイピングモードを判定
  const isTypewriterMode = selectedChapter >= TYPEWRITER_MODE_THRESHOLD;

  // 正しいローマ字を取得（表示用）
  const correctRomaji = currentWord ? getDisplayRomaji(currentWord.hiragana) : '';

  // タイピング状態を初期化
  const initializeWord = useCallback(
    (word: Word) => {
      const state = createInitialState(word.hiragana);
      setTypingState(state);
      setUserInput('');
      wordStartTimeRef.current = performance.now();
    },
    [setTypingState, setUserInput]
  );

  // タイプライターモード: キー入力を処理
  const handleTypewriterKeyInput = useCallback(
    (key: string) => {
      if (!currentWord) return;

      const now = performance.now();
      const latency = lastKeyTimeRef.current ? now - lastKeyTimeRef.current : 0;
      lastKeyTimeRef.current = now;

      // 文字を追加
      const newInput = userInput + key;
      setUserInput(newInput);

      // 入力音を鳴らす（コンボ連動）
      playTypeSound(session?.combo || 0);

      // キー統計を更新（この時点では正誤は確定しない）
      updateKeyStats(key.toLowerCase(), true, latency);
    },
    [currentWord, userInput, playTypeSound, updateKeyStats, setUserInput, session?.combo]
  );

  // タイプライターモード: バックスペース処理
  const handleBackspace = useCallback(() => {
    if (userInput.length > 0) {
      setUserInput(userInput.slice(0, -1));
    }
  }, [userInput, setUserInput]);

  // タイプライターモード: Enter確定時の爆発音
  const playEnterExplosion = useCallback(() => {
    const audio = new Audio('/Mobile-/opening.mp3');
    audio.volume = 0.3;
    audio.play().catch(() => {});
  }, []);

  // タイプライターモード: Enter確定処理
  const handleEnterConfirm = useCallback(() => {
    if (!currentWord || userInput.length === 0) return;

    // romajiEngineを使って複数パターンに対応した検証
    const isCorrect = validateTypewriterInput(userInput, currentWord.hiragana);

    if (isCorrect) {
      // 正解 - 爆発演出とスコア処理
      playEnterExplosion();
      triggerExplosion(!hadMissThisWord);

      // 単語完了処理（スコア加算、HP回復、次の単語へ）
      handleWordComplete(
        () => recoverHP(HP_CONFIG.correctRecovery),
        () => navigateTo('result'),
        () => {
          nextWord();
          const nextIndex = (session?.currentWordIndex || 0) + 1;
          const nextWordData = session?.words[nextIndex];
          if (nextWordData) {
            setTimeout(() => initializeWord(nextWordData), 300);
          }
        }
      );

      // 次の単語用にミスフラグをリセット
      setHadMissThisWord(false);
      resetWordState();
    } else {
      // 不正解 - ミスを記録して入力をクリア
      playMissSound();
      setUserInput('');
      setHadMissThisWord(true);
      damageHP(HP_CONFIG.missDamage);
    }
  }, [
    currentWord,
    userInput,
    validateTypewriterInput,
    playEnterExplosion,
    triggerExplosion,
    hadMissThisWord,
    handleWordComplete,
    recoverHP,
    navigateTo,
    nextWord,
    session,
    initializeWord,
    setHadMissThisWord,
    resetWordState,
    playMissSound,
    setUserInput,
    damageHP,
  ]);

  // インスタントモード: キー入力を処理
  const handleInstantKeyInput = useCallback(
    (key: string) => {
      if (!session?.typingState || session.typingState.isComplete) {
        return;
      }

      const now = performance.now();
      const latency = lastKeyTimeRef.current ? now - lastKeyTimeRef.current : 0;
      lastKeyTimeRef.current = now;

      const result = processKeyInput(session.typingState, key);

      updateKeyStats(key.toLowerCase(), result.isValid, latency);

      if (result.isMiss) {
        playMissSound();
        damageHP(HP_CONFIG.missDamage);
        return;
      }

      if (result.isValid) {
        setTypingState(result.newState);

        if (result.isWordComplete) {
          triggerExplosion(true);
          handleWordComplete(
            () => recoverHP(HP_CONFIG.correctRecovery),
            () => navigateTo('result'),
            () => {
              nextWord();
              const nextIndex = (session?.currentWordIndex || 0) + 1;
              const nextWordData = session?.words[nextIndex];
              if (nextWordData) {
                setTimeout(() => initializeWord(nextWordData), 300);
              }
            }
          );
        } else {
          playTypeSound(session?.combo || 0);
        }
      }
    },
    [
      session,
      setTypingState,
      updateKeyStats,
      playMissSound,
      damageHP,
      playTypeSound,
      triggerExplosion,
      handleWordComplete,
      recoverHP,
      navigateTo,
      nextWord,
      initializeWord,
    ]
  );

  // キーボードイベントリスナー
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === 'Escape') {
        navigateTo('stageSelect');
        return;
      }

      if (isTypewriterMode) {
        // タイプライターモード
        if (e.key === 'Backspace') {
          e.preventDefault();
          handleBackspace();
          return;
        }

        if (e.key === 'Enter') {
          e.preventDefault();
          handleEnterConfirm();
          return;
        }

        if (e.key.length === 1) {
          e.preventDefault();
          flashKey(e.key);
          handleTypewriterKeyInput(e.key);
        }
      } else {
        // インスタントモード
        if (e.key.length === 1) {
          e.preventDefault();
          flashKey(e.key);
          handleInstantKeyInput(e.key);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    isTypewriterMode,
    handleInstantKeyInput,
    handleTypewriterKeyInput,
    handleBackspace,
    handleEnterConfirm,
    navigateTo,
    flashKey,
  ]);

  // 最初の単語を初期化
  useEffect(() => {
    if (currentWord && !session?.typingState) {
      initializeWord(currentWord);
    }
  }, [currentWord, session?.typingState, initializeWord]);

  return {
    currentWord,
    typingState: session?.typingState,
    score: session?.score || 0,
    combo: session?.combo || 0,
    maxCombo: session?.maxCombo || 0,
    missCount: session?.missCount || 0,
    correctCount: session?.correctCount || 0,
    progress: session
      ? ((session.currentWordIndex + 1) / session.words.length) * 100
      : 0,
    validKeys: session?.typingState ? getCurrentValidKeys(session.typingState) : [],
    displayRomaji: correctRomaji,
    // タイプライターモード用
    isTypewriterMode,
    userInput,
    inputStatus: getInputStatus(userInput, currentWord),
    explosionTrigger,
    isPerfect: lastExplosionWasPerfect,
    // キーボード演出用
    recentPressedKeys,
    // 正解時シェイク用
    successShakeTrigger,
    // HPシステム
    currentHP,
    maxHP: HP_CONFIG.maxHP,
  };
}
