/**
 * タイピングロジックを管理するカスタムフック
 */

import { useCallback, useEffect, useRef } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { useProgressStore } from '@/stores/progressStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useSound } from '@/hooks/useSound';
import {
  createInitialState,
  processKeyInput,
  getCurrentValidKeys,
  getDisplayRomaji,
} from '@/engine/romajiEngine';
import { APP_CONFIG } from '@/constants/config';
import type { Word } from '@/types/game';

export function useTyping() {
  const {
    session,
    setTypingState,
    nextWord,
    endSession,
    addScore,
    incrementCombo,
    recordMiss,
    navigateTo,
  } = useGameStore();

  const { updateKeyStats, updateStatistics } = useProgressStore();
  const { playTypeSound, playConfirmSound, playMissSound } = useSound();

  // キー入力のタイムスタンプ
  const lastKeyTimeRef = useRef<number>(0);
  const wordStartTimeRef = useRef<number>(0);

  // 現在の単語を取得
  const currentWord = session?.words[session.currentWordIndex];

  // タイピング状態を初期化
  const initializeWord = useCallback(
    (word: Word) => {
      const state = createInitialState(word.hiragana);
      setTypingState(state);
      wordStartTimeRef.current = performance.now();
    },
    [setTypingState]
  );

  // キー入力を処理
  const handleKeyInput = useCallback(
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

      // キー統計を更新
      updateKeyStats(key.toLowerCase(), result.isValid, latency);

      if (result.isMiss) {
        // ミス処理
        recordMiss();
        playMissSound();
        return;
      }

      if (result.isValid) {
        // 正解処理
        setTypingState(result.newState);

        if (result.isWordComplete) {
          // 単語完了
          playConfirmSound();
          const wordTime = now - wordStartTimeRef.current;
          const score = calculateScore(wordTime, session.combo);
          addScore(score);
          incrementCombo();

          // 次の単語へ or 終了
          const nextIndex = session.currentWordIndex + 1;
          if (nextIndex >= session.words.length) {
            // セッション終了
            endSession();
            navigateTo('result');
          } else {
            // 次の単語
            nextWord();
            const nextWordData = session.words[nextIndex];
            setTimeout(() => initializeWord(nextWordData), 300);
          }
        } else {
          // 通常の正解入力
          playTypeSound();
        }
      }
    },
    [
      session,
      setTypingState,
      recordMiss,
      addScore,
      incrementCombo,
      nextWord,
      endSession,
      navigateTo,
      initializeWord,
      updateKeyStats,
      playTypeSound,
      playConfirmSound,
      playMissSound,
    ]
  );

  // スコア計算
  const calculateScore = (wordTime: number, combo: number): number => {
    const { BASE_SCORE, COMBO_MULTIPLIER, SPEED_BONUS_MAX, SPEED_BONUS_THRESHOLD } =
      APP_CONFIG;

    // 基本スコア
    let score = BASE_SCORE;

    // コンボボーナス
    score *= 1 + combo * COMBO_MULTIPLIER;

    // スピードボーナス
    if (wordTime < SPEED_BONUS_THRESHOLD) {
      const speedBonus =
        SPEED_BONUS_MAX * (1 - wordTime / SPEED_BONUS_THRESHOLD);
      score += speedBonus;
    }

    return Math.round(score);
  };

  // キーボードイベントリスナー
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 特殊キーを無視
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === 'Escape') {
        navigateTo('stageSelect');
        return;
      }

      // 入力可能な文字のみ処理
      if (e.key.length === 1) {
        e.preventDefault();
        handleKeyInput(e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyInput, navigateTo]);

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
    validKeys: session?.typingState
      ? getCurrentValidKeys(session.typingState)
      : [],
    displayRomaji: currentWord ? getDisplayRomaji(currentWord.hiragana) : '',
  };
}
