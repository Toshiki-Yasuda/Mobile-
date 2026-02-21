/**
 * キーボード入力処理の共通フック
 * romajiEngine経由でキー入力を処理し、結果をコールバックで返す
 */

import { useEffect, useCallback } from 'react';
import { processKeyInput } from '@/engine/romajiEngine';
import type { TypingState, InputResult } from '@/types/romaji';

interface UseKeyboardInputOptions {
  /** 現在のタイピング状態 */
  typingState: TypingState | null;
  /** 入力を受け付けるか */
  enabled: boolean;
  /** 正しい入力時のコールバック */
  onValidInput: (result: InputResult) => void;
  /** ミス時のコールバック */
  onMiss: (result: InputResult) => void;
  /** 任意のキー押下時のコールバック（フィルタリング前） */
  onKeyPress?: (key: string) => void;
  /** Escapeキー押下時のコールバック */
  onEscape?: () => void;
  /** Backspaceキー押下時のコールバック */
  onBackspace?: () => void;
  /** Enterキー押下時のコールバック */
  onEnter?: () => void;
}

export function useKeyboardInput({
  typingState,
  enabled,
  onValidInput,
  onMiss,
  onKeyPress,
  onEscape,
  onBackspace,
  onEnter,
}: UseKeyboardInputOptions) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === 'Escape' && onEscape) {
        onEscape();
        return;
      }

      if (e.key === 'Backspace' && onBackspace) {
        e.preventDefault();
        onBackspace();
        return;
      }

      if (e.key === 'Enter' && onEnter) {
        e.preventDefault();
        onEnter();
        return;
      }

      if (e.key.length !== 1) return;
      e.preventDefault();

      const key = e.key.toLowerCase();
      onKeyPress?.(e.key);

      if (!typingState || typingState.isComplete) return;

      const result = processKeyInput(typingState, key);

      if (result.isMiss) {
        onMiss(result);
      } else if (result.isValid) {
        onValidInput(result);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, typingState, onValidInput, onMiss, onKeyPress, onEscape, onBackspace, onEnter]);
}
