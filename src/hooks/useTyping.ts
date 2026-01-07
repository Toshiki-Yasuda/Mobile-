/**
 * タイピングロジックを管理するカスタムフック
 * 
 * チャプター1-2: インスタントモード（1文字ずつ即時判定）
 * チャプター3以降: タイプライターモード（入力→Enter確定）
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { useProgressStore } from '@/stores/progressStore';
import { useSound } from '@/hooks/useSound';
import {
  createInitialState,
  processKeyInput,
  getCurrentValidKeys,
  getDisplayRomaji,
} from '@/engine/romajiEngine';
import { APP_CONFIG } from '@/constants/config';
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
    addScore,
    incrementCombo,
    recordMiss,
    resetCombo,
    navigateTo,
  } = useGameStore();

  const { updateKeyStats } = useProgressStore();
  const { playTypeSound, playConfirmSound, playMissSound } = useSound();

  // タイプライターモード用の入力テキスト
  const [userInput, setUserInput] = useState('');
  
  // キー入力のタイムスタンプ
  const lastKeyTimeRef = useRef<number>(0);
  const wordStartTimeRef = useRef<number>(0);

  // 現在の単語を取得
  const currentWord = session?.words[session.currentWordIndex];
  
  // タイピングモードを判定
  const isTypewriterMode = selectedChapter >= TYPEWRITER_MODE_THRESHOLD;

  // 正しいローマ字を取得
  const correctRomaji = currentWord ? getDisplayRomaji(currentWord.hiragana) : '';

  // タイピング状態を初期化
  const initializeWord = useCallback(
    (word: Word) => {
      const state = createInitialState(word.hiragana);
      setTypingState(state);
      setUserInput('');
      wordStartTimeRef.current = performance.now();
    },
    [setTypingState]
  );

  // スコア計算
  const calculateScore = (wordTime: number, combo: number): number => {
    const { BASE_SCORE, COMBO_MULTIPLIER, SPEED_BONUS_MAX, SPEED_BONUS_THRESHOLD } =
      APP_CONFIG;

    let score = BASE_SCORE;
    score *= 1 + combo * COMBO_MULTIPLIER;

    if (wordTime < SPEED_BONUS_THRESHOLD) {
      const speedBonus =
        SPEED_BONUS_MAX * (1 - wordTime / SPEED_BONUS_THRESHOLD);
      score += speedBonus;
    }

    return Math.round(score);
  };

  // 単語完了処理
  const handleWordComplete = useCallback(() => {
    const now = performance.now();
    playConfirmSound();
    const wordTime = now - wordStartTimeRef.current;
    const score = calculateScore(wordTime, session?.combo || 0);
    addScore(score);
    incrementCombo();

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
  }, [session, addScore, incrementCombo, nextWord, endSession, navigateTo, initializeWord, playConfirmSound]);

  // インスタントモード: キー入力を処理
  const handleInstantKeyInput = useCallback(
    (key: string) => {
      if (!session?.typingState || session.typingState.isComplete) {
        return;
      }

      const now = performance.now();
      const latency = lastKeyTimeRef.current
        ? now - lastKeyTimeRef.current
        : 0;
      lastKeyTimeRef.current = now;

      const result = processKeyInput(session.typingState, key);

      updateKeyStats(key.toLowerCase(), result.isValid, latency);

      if (result.isMiss) {
        recordMiss();
        playMissSound();
        return;
      }

      if (result.isValid) {
        setTypingState(result.newState);

        if (result.isWordComplete) {
          handleWordComplete();
        } else {
          playTypeSound();
        }
      }
    },
    [
      session,
      setTypingState,
      recordMiss,
      updateKeyStats,
      playTypeSound,
      playMissSound,
      handleWordComplete,
    ]
  );

  // タイプライターモード: キー入力を処理
  const handleTypewriterKeyInput = useCallback(
    (key: string) => {
      if (!currentWord) return;

      const now = performance.now();
      const latency = lastKeyTimeRef.current
        ? now - lastKeyTimeRef.current
        : 0;
      lastKeyTimeRef.current = now;

      // 文字を追加
      const newInput = userInput + key;
      setUserInput(newInput);
      
      // 入力音を鳴らす
      playTypeSound();
      
      // キー統計を更新（この時点では正誤は確定しない）
      updateKeyStats(key.toLowerCase(), true, latency);
    },
    [currentWord, userInput, playTypeSound, updateKeyStats]
  );

  // タイプライターモード: バックスペース処理
  const handleBackspace = useCallback(() => {
    if (userInput.length > 0) {
      setUserInput(userInput.slice(0, -1));
    }
  }, [userInput]);

  // タイプライターモード: Enter確定処理
  const handleEnterConfirm = useCallback(() => {
    if (!currentWord || userInput.length === 0) return;

    const isCorrect = userInput.toLowerCase() === correctRomaji.toLowerCase();

    if (isCorrect) {
      // 正解
      handleWordComplete();
    } else {
      // 不正解 - ミスを記録して入力をクリア
      recordMiss();
      playMissSound();
      setUserInput('');
    }
  }, [currentWord, userInput, correctRomaji, handleWordComplete, recordMiss, playMissSound]);

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
          handleTypewriterKeyInput(e.key);
        }
      } else {
        // インスタントモード
        if (e.key.length === 1) {
          e.preventDefault();
          handleInstantKeyInput(e.key);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isTypewriterMode,
    handleInstantKeyInput,
    handleTypewriterKeyInput,
    handleBackspace,
    handleEnterConfirm,
    navigateTo,
  ]);

  // 最初の単語を初期化
  useEffect(() => {
    if (currentWord && !session?.typingState) {
      initializeWord(currentWord);
    }
  }, [currentWord, session?.typingState, initializeWord]);

  // 入力の正誤状態を計算（タイプライターモード用）
  const getInputStatus = useCallback(() => {
    if (!isTypewriterMode || !correctRomaji) {
      return { chars: [], isPartiallyCorrect: true };
    }

    const chars = userInput.split('').map((char, index) => {
      const expectedChar = correctRomaji[index]?.toLowerCase();
      const isCorrect = char.toLowerCase() === expectedChar;
      return { char, isCorrect };
    });

    const isPartiallyCorrect = chars.every(c => c.isCorrect);

    return { chars, isPartiallyCorrect };
  }, [isTypewriterMode, userInput, correctRomaji]);

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
    // タイプライターモード用
    isTypewriterMode,
    userInput,
    inputStatus: getInputStatus(),
  };
}
