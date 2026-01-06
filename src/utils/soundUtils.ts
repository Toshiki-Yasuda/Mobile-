/**
 * 音声ユーティリティ
 * ボタンクリック時に音を鳴らすためのヘルパー関数
 */

import { useSound } from '@/hooks/useSound';

/**
 * ボタンクリックハンドラーを作成するフック
 */
export function useButtonClick() {
  const { playClickSound } = useSound();

  const handleClick = (callback: () => void) => {
    return () => {
      playClickSound();
      callback();
    };
  };

  return { handleClick };
}

