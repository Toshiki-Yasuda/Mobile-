/**
 * タイピングキーボードイベントフック
 * キーボード入力のリスナー管理
 */

import { useEffect } from 'react';

interface KeyboardHandlers {
  onInstantKey: (key: string) => void;
  onTypewriterKey: (key: string) => void;
  onBackspace: () => void;
  onEnter: () => void;
  onEscape: () => void;
  onFlashKey: (key: string) => void;
  isTypewriterMode: boolean;
}

export function useTypingKeyboard({
  onInstantKey,
  onTypewriterKey,
  onBackspace,
  onEnter,
  onEscape,
  onFlashKey,
  isTypewriterMode,
}: KeyboardHandlers) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key === 'Escape') {
        onEscape();
        return;
      }

      if (isTypewriterMode) {
        if (e.key === 'Backspace') {
          e.preventDefault();
          onBackspace();
          return;
        }

        if (e.key === 'Enter') {
          e.preventDefault();
          onEnter();
          return;
        }

        if (e.key.length === 1) {
          e.preventDefault();
          onFlashKey(e.key);
          onTypewriterKey(e.key);
        }
      } else {
        if (e.key.length === 1) {
          e.preventDefault();
          onFlashKey(e.key);
          onInstantKey(e.key);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    isTypewriterMode,
    onInstantKey,
    onTypewriterKey,
    onBackspace,
    onEnter,
    onEscape,
    onFlashKey,
  ]);
}
