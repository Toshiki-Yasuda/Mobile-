/**
 * Game Juice アニメーション定義
 */

import { Variants, Transition } from 'framer-motion';

// === イージング関数 ===
export const easings = {
  // 弾性のあるバウンス
  bounce: [0.34, 1.56, 0.64, 1],
  // スナップ感のある動き
  snap: [0.25, 0.46, 0.45, 0.94],
  // 柔らかいイーズアウト
  smooth: [0.4, 0, 0.2, 1],
};

// === 文字アニメーション ===

/**
 * 正解入力時の文字パルス
 */
export const charCorrectVariants: Variants = {
  initial: {
    scale: 1,
    opacity: 0.5,
  },
  correct: {
    scale: [1, 1.15, 1],
    opacity: 1,
    transition: {
      duration: 0.15,
      ease: easings.bounce,
    }
  },
};

/**
 * ミス入力時の文字シェイク
 */
export const charErrorVariants: Variants = {
  initial: { x: 0 },
  error: {
    x: [-3, 3, -2, 2, 0],
    transition: {
      duration: 0.25,
      ease: 'easeInOut',
    }
  },
};

/**
 * 単語完了時のバウンス
 */
export const wordCompleteVariants: Variants = {
  initial: {
    scale: 1,
    y: 0,
    opacity: 1,
  },
  complete: {
    scale: [1, 1.1, 0.95, 1],
    y: [0, -15, 0],
    opacity: [1, 1, 0],
    transition: {
      duration: 0.5,
      ease: easings.bounce,
    }
  },
};

/**
 * 新しい単語の登場
 */
export const wordEnterVariants: Variants = {
  initial: {
    opacity: 0,
    scale: 0.9,
    y: 20,
  },
  enter: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: easings.smooth,
    }
  },
};

// === コンボアニメーション ===

/**
 * コンボカウンター更新
 */
export const comboCounterVariants: Variants = {
  initial: { scale: 1 },
  increment: {
    scale: [1, 1.4, 1],
    transition: {
      duration: 0.2,
      ease: easings.bounce,
    }
  },
};

/**
 * コンボマイルストーン達成（5, 10, 20...）
 */
export const comboMilestoneVariants: Variants = {
  initial: {
    scale: 0,
    rotate: -180,
    opacity: 0,
  },
  milestone: {
    scale: [0, 1.5, 1],
    rotate: 0,
    opacity: [0, 1, 1],
    transition: {
      duration: 0.5,
      ease: easings.bounce,
    }
  },
  exit: {
    scale: 1.5,
    opacity: 0,
    transition: { duration: 0.3 }
  },
};

// === 念オーラアニメーション ===

/**
 * 念オーラの脈動（コンボ数で速度変化）
 */
export const createNenAuraPulse = (combo: number) => ({
  animate: {
    opacity: [0.3, 0.5 + Math.min(combo * 0.01, 0.3), 0.3],
    scale: [1, 1 + Math.min(combo * 0.005, 0.1), 1],
  },
  transition: {
    duration: Math.max(2.5 - combo * 0.03, 0.8), // コンボで速くなる
    repeat: Infinity,
    ease: 'easeInOut',
  } as Transition,
});

/**
 * 念レベルアップ時の演出
 */
export const nenLevelUpVariants: Variants = {
  initial: {
    scale: 1,
    opacity: 0,
  },
  levelUp: {
    scale: [1, 2, 1.5],
    opacity: [0, 1, 0],
    transition: {
      duration: 0.8,
      ease: easings.bounce,
    }
  },
};

// === 画面エフェクト ===

/**
 * 画面シェイク用の設定
 */
export const SHAKE_CONFIGS = {
  light: {
    x: [-2, 2, -1, 1, 0],
    duration: 0.2
  },
  medium: {
    x: [-4, 4, -3, 3, -1, 1, 0],
    duration: 0.3
  },
  heavy: {
    x: [-8, 8, -6, 6, -3, 3, -1, 1, 0],
    duration: 0.4
  },
};
