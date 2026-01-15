/**
 * タイピング入力処理フック
 * タイプライターモード検証とユーザー入力管理
 */

import { useCallback, useState } from 'react';
import {
  createInitialState,
  processKeyInput,
} from '@/engine/romajiEngine';
import type { TypingState } from '@/types/romaji';

export function useTypingInput() {
  // タイプライターモード用の入力テキスト
  const [userInput, setUserInput] = useState('');

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

  return {
    userInput,
    setUserInput,
    validateTypewriterInput,
  };
}
