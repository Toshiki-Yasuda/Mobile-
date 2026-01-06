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
      // 音を先に鳴らしてからコールバックを実行
      playClickSound();
      // 少し遅延させてからコールバックを実行（音が確実に鳴るように）
      setTimeout(() => {
        callback();
      }, 10);
    };
  };

  return { handleClick };
}

