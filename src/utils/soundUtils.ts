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

/**
 * メニュー選択ハンドラーを作成するフック
 */
export function useMenuSelect() {
  const { playMenuSelectSound } = useSound();

  const handleSelect = (callback: () => void) => {
    return () => {
      playMenuSelectSound();
      setTimeout(() => {
        callback();
      }, 50);
    };
  };

  return { handleSelect };
}

/**
 * ステージ選択ハンドラーを作成するフック
 */
export function useStageSelect() {
  const { playStageSelectSound } = useSound();

  const handleSelect = (callback: () => void) => {
    return () => {
      playStageSelectSound();
      setTimeout(() => {
        callback();
      }, 50);
    };
  };

  return { handleSelect };
}

