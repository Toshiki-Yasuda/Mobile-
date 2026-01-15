/**
 * 音声ユーティリティ
 * ボタンクリック時に音を鳴らすためのヘルパー関数
 */

import { useSound } from '@/hooks/useSound';

type SoundType = 'click' | 'menuSelect' | 'stageSelect';

interface SoundConfig {
  delay: number;
}

const SOUND_CONFIGS: Record<SoundType, SoundConfig> = {
  click: { delay: 10 },
  menuSelect: { delay: 50 },
  stageSelect: { delay: 50 },
};

/**
 * 汎用の音声再生ハンドラーを作成するフック
 */
function usePlaySound(soundType: SoundType) {
  const { playClickSound, playMenuSelectSound, playStageSelectSound } = useSound();
  const config = SOUND_CONFIGS[soundType];

  const playSoundByType = () => {
    switch (soundType) {
      case 'click':
        playClickSound();
        break;
      case 'menuSelect':
        playMenuSelectSound();
        break;
      case 'stageSelect':
        playStageSelectSound();
        break;
    }
  };

  const handleAction = (callback: () => void) => {
    return () => {
      playSoundByType();
      setTimeout(() => {
        callback();
      }, config.delay);
    };
  };

  return { handleAction };
}

/**
 * ボタンクリックハンドラーを作成するフック（互換性維持）
 */
export function useButtonClick() {
  const { handleAction } = usePlaySound('click');
  return { handleClick: handleAction };
}

/**
 * メニュー選択ハンドラーを作成するフック（互換性維持）
 */
export function useMenuSelect() {
  const { handleAction } = usePlaySound('menuSelect');
  return { handleSelect: handleAction };
}

/**
 * ステージ選択ハンドラーを作成するフック（互換性維持）
 */
export function useStageSelect() {
  const { handleAction } = usePlaySound('stageSelect');
  return { handleSelect: handleAction };
}

// 汎用hookをエクスポート
export { usePlaySound };

