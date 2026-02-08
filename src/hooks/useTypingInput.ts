/**
 * タイピング入力処理フック
 * ローマ字エンジンのラッパー: 検証・初期化・状態表示
 */

import { useCallback } from 'react';
import {
  createInitialState,
  processKeyInput,
} from '@/engine/romajiEngine';
import type { TypingState } from '@/types/romaji';
import type { Word } from '@/types/game';

export function useTypingInput() {
  // タイプライターモード: 入力がひらがなと一致するか検証
  const validateTypewriterInput = useCallback(
    (input: string, hiragana: string): boolean => {
      if (!input || !hiragana) return false;

      let state: TypingState = createInitialState(hiragana);

      for (const char of input.toLowerCase()) {
        const result = processKeyInput(state, char);

        if (result.isMiss || !result.isValid) {
          return false;
        }

        state = result.newState;
      }

      return state.isComplete;
    },
    []
  );

  // 単語のタイピング状態を初期化
  const createWordState = useCallback((word: Word): TypingState => {
    return createInitialState(word.hiragana);
  }, []);

  // 入力の正誤状態を計算（タイプライターモード用）
  const getInputStatus = useCallback(
    (userInput: string, currentWord: Word | undefined) => {
      if (!currentWord) {
        return { chars: [] as { char: string; isCorrect: boolean }[], isPartiallyCorrect: true };
      }

      const chars: { char: string; isCorrect: boolean }[] = [];
      let state: TypingState = createInitialState(currentWord.hiragana);
      let isPartiallyCorrect = true;

      for (const char of userInput) {
        const result = processKeyInput(state, char.toLowerCase());

        if (result.isMiss || !result.isValid) {
          chars.push({ char, isCorrect: false });
          isPartiallyCorrect = false;
        } else {
          chars.push({ char, isCorrect: true });
          state = result.newState;
        }
      }

      return { chars, isPartiallyCorrect };
    },
    []
  );

  return {
    validateTypewriterInput,
    createWordState,
    getInputStatus,
  };
}
