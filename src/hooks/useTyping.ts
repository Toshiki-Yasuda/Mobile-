/**
 * タイピングロジックを管理するカスタムフック（オーケストレーター）
 *
 * チャプター1-2: インスタントモード（1文字ずつ即時判定）
 * チャプター3以降: タイプライターモード（入力→Enter確定）
 *
 * 分割フック:
 * - useTypingState: HP・入力・キー演出の状態管理
 * - useTypingInput: ローマ字エンジンのラッパー
 * - useTypingScore: スコア計算
 * - useTypingAnimation: エフェクトトリガー
 * - useTypingKeyboard: キーボードイベントリスナー
 */

import { useCallback, useEffect, useRef } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { useProgressStore } from '@/stores/progressStore';
import { useSound } from '@/hooks/useSound';
import { useHaptics } from '@/hooks/useHaptics';
import { useTypingState } from '@/hooks/useTypingState';
import { useTypingInput } from '@/hooks/useTypingInput';
import { useTypingScore } from '@/hooks/useTypingScore';
import { useTypingAnimation } from '@/hooks/useTypingAnimation';
import { useTypingKeyboard } from '@/hooks/useTypingKeyboard';
import { processKeyInput, getCurrentValidKeys, getDisplayRomaji } from '@/engine/romajiEngine';
import { HP_CONFIG, getChapterHPConfig } from '@/constants/gameJuice';

// タイプライターモードを使用するチャプター閾値
const TYPEWRITER_MODE_THRESHOLD = 3;

export function useTyping() {
  // ストア
  const {
    session,
    selectedChapter,
    setTypingState,
    nextWord,
    endSession,
    addScore,
    incrementCombo,
    recordMiss,
    navigateTo,
  } = useGameStore();

  const { updateKeyStats } = useProgressStore();

  // サウンド・ハプティック
  const { playTypeSound, playConfirmSound, playMissSound, playComboSound } = useSound();
  const { tap, success, comboMilestone, damage, critical } = useHaptics();

  // 分割フック
  const state = useTypingState();
  const input = useTypingInput();
  const score = useTypingScore();
  const animation = useTypingAnimation();

  // タイミング用Ref
  const lastKeyTimeRef = useRef<number>(0);
  const wordStartTimeRef = useRef<number>(0);

  // 現在の単語・モード判定
  const currentWord = session?.words[session.currentWordIndex];
  const isTypewriterMode = selectedChapter >= TYPEWRITER_MODE_THRESHOLD;
  const correctRomaji = currentWord ? getDisplayRomaji(currentWord.hiragana) : '';

  // チャプター別HP設定
  const chapterHP = getChapterHPConfig(selectedChapter);

  // 単語初期化
  const initializeWord = useCallback(
    (word: typeof currentWord) => {
      if (!word) return;
      const typingState = input.createWordState(word);
      setTypingState(typingState);
      state.resetWordState();
      wordStartTimeRef.current = performance.now();
    },
    [setTypingState, input, state]
  );

  // 単語完了処理
  const handleWordComplete = useCallback(() => {
    const now = performance.now();
    const currentCombo = session?.combo || 0;
    playConfirmSound(currentCombo);
    success();
    animation.triggerSuccessShake();

    const wordTime = now - wordStartTimeRef.current;
    const wordScore = score.calculateScore(wordTime, currentCombo);
    addScore(wordScore);
    incrementCombo();

    // コンボ音（5の倍数で発動）
    const newCombo = currentCombo + 1;
    if (newCombo >= 5 && newCombo % 5 === 0) {
      playComboSound(newCombo);
      comboMilestone(newCombo);
    }

    // HP回復
    let healAmount = chapterHP.correctRecovery;
    if (newCombo >= 5 && newCombo % 5 === 0) {
      healAmount += chapterHP.comboRecoveryBonus;
    }
    state.recoverHP(healAmount);

    // 次の単語 or セッション終了
    const nextIndex = (session?.currentWordIndex || 0) + 1;
    if (nextIndex >= (session?.words.length || 0)) {
      endSession();
      navigateTo('result');
    } else {
      nextWord();
      const nextWordData = session?.words[nextIndex];
      if (nextWordData) {
        setTimeout(() => initializeWord(nextWordData), 300);
      }
    }
  }, [session, addScore, incrementCombo, nextWord, endSession, navigateTo, initializeWord,
      playConfirmSound, playComboSound, success, comboMilestone, animation, score, state, chapterHP]);

  // HP減少 + クリティカル警告
  const applyDamage = useCallback(() => {
    const newHP = state.damageHP(chapterHP.missDamage);
    if (newHP <= HP_CONFIG.criticalThreshold && newHP > 0) {
      critical();
    }
  }, [state, chapterHP, critical]);

  // インスタントモード: キー入力処理
  const handleInstantKeyInput = useCallback(
    (key: string) => {
      if (!session?.typingState || session.typingState.isComplete) return;

      const now = performance.now();
      const latency = lastKeyTimeRef.current ? now - lastKeyTimeRef.current : 0;
      lastKeyTimeRef.current = now;

      tap();

      const result = processKeyInput(session.typingState, key);
      updateKeyStats(key.toLowerCase(), result.isValid, latency);

      if (result.isMiss) {
        recordMiss();
        playMissSound();
        damage();
        applyDamage();
        return;
      }

      if (result.isValid) {
        success();
        setTypingState(result.newState);

        if (result.isWordComplete) {
          handleWordComplete();
        } else {
          playTypeSound(session?.combo || 0);
        }
      }
    },
    [session, setTypingState, recordMiss, updateKeyStats, playTypeSound, playMissSound,
     handleWordComplete, tap, success, damage, applyDamage]
  );

  // タイプライターモード: キー入力
  const handleTypewriterKeyInput = useCallback(
    (key: string) => {
      if (!currentWord) return;

      const now = performance.now();
      const latency = lastKeyTimeRef.current ? now - lastKeyTimeRef.current : 0;
      lastKeyTimeRef.current = now;

      state.setUserInput(prev => prev + key);
      playTypeSound(session?.combo || 0);
      updateKeyStats(key.toLowerCase(), true, latency);
    },
    [currentWord, state, playTypeSound, updateKeyStats, session]
  );

  // タイプライターモード: バックスペース
  const handleBackspace = useCallback(() => {
    state.setUserInput(prev => prev.length > 0 ? prev.slice(0, -1) : prev);
  }, [state]);

  // タイプライターモード: Enter確定
  const handleEnterConfirm = useCallback(() => {
    if (!currentWord || state.userInput.length === 0) return;

    const isCorrect = input.validateTypewriterInput(state.userInput, currentWord.hiragana);

    if (isCorrect) {
      // 爆発音
      const audio = new Audio(`${import.meta.env.BASE_URL}opening.mp3`);
      audio.volume = 0.3;
      audio.play().catch(() => {});

      success();
      animation.triggerExplosion(!state.hadMissThisWord);
      handleWordComplete();
      state.setHadMissThisWord(false);
    } else {
      recordMiss();
      playMissSound();
      damage();
      state.setUserInput('');
      state.setHadMissThisWord(true);
      applyDamage();
    }
  }, [currentWord, state, input, handleWordComplete, recordMiss, playMissSound,
      success, damage, animation, applyDamage]);

  // キーボードイベント
  useTypingKeyboard({
    onInstantKey: handleInstantKeyInput,
    onTypewriterKey: handleTypewriterKeyInput,
    onBackspace: handleBackspace,
    onEnter: handleEnterConfirm,
    onEscape: () => navigateTo('stageSelect'),
    onFlashKey: state.flashKey,
    isTypewriterMode,
  });

  // 最初の単語を初期化
  useEffect(() => {
    if (currentWord && !session?.typingState) {
      initializeWord(currentWord);
    }
  }, [currentWord, session?.typingState, initializeWord]);

  // 返り値インターフェース（TypingScreenとの互換性維持）
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
    validKeys: session?.typingState
      ? getCurrentValidKeys(session.typingState)
      : [],
    displayRomaji: correctRomaji,
    isTypewriterMode,
    userInput: state.userInput,
    inputStatus: input.getInputStatus(state.userInput, currentWord),
    explosionTrigger: animation.explosionTrigger,
    isPerfect: animation.lastExplosionWasPerfect,
    recentPressedKeys: state.recentPressedKeys,
    successShakeTrigger: animation.successShakeTrigger,
    currentHP: state.currentHP,
    maxHP: state.maxHP,
  };
}
