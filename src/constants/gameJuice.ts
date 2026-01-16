/**
 * Game Juice（演出効果）関連の定数
 */

// ===== 念レベル定義 =====
export interface NenLevel {
  threshold: number;
  name: string;
  color: string;
  glow: string;
}

/**
 * 念レベル一覧（閾値の降順）
 * コンボ数に応じて念のレベルが上がる
 */
export const NEN_LEVELS: readonly NenLevel[] = [
  { threshold: 50, name: '発', color: 'text-red-500', glow: 'shadow-red-500/50' },
  { threshold: 20, name: '練', color: 'text-orange-400', glow: 'shadow-orange-400/50' },
  { threshold: 10, name: '絶', color: 'text-purple-400', glow: 'shadow-purple-400/50' },
  { threshold: 5, name: '纏', color: 'text-blue-400', glow: 'shadow-blue-400/50' },
  { threshold: 0, name: '念', color: 'text-hunter-gold', glow: 'shadow-hunter-gold/50' },
] as const;

/**
 * コンボ数から念レベルを取得
 */
export const getNenLevel = (combo: number): NenLevel => {
  return NEN_LEVELS.find(level => combo >= level.threshold) || NEN_LEVELS[NEN_LEVELS.length - 1];
};

// ===== コンボマイルストーン =====
export const COMBO_MILESTONES = [5, 10, 20, 50, 100] as const;

// ===== エフェクト時間設定（ms） =====
export const EFFECT_DURATIONS = {
  EXPLOSION: 800,
  SHAKE_LIGHT: 200,
  SHAKE_MEDIUM: 300,
  SHAKE_HEAVY: 400,
} as const;

// ===== 正解時シェイク設定 =====
export type SuccessShakeIntensity = 'base' | 'combo5' | 'combo10' | 'combo20';

export const SUCCESS_SHAKE_CONFIGS = {
  base: { x: [-1, 1, 0], duration: 0.1 },
  combo5: { x: [-2, 2, -1, 1, 0], duration: 0.15 },
  combo10: { x: [-3, 3, -2, 2, 0], duration: 0.2 },
  combo20: { x: [-4, 4, -3, 3, -1, 1, 0], duration: 0.25 },
} as const;

export const getSuccessShakeIntensity = (combo: number): SuccessShakeIntensity => {
  if (combo >= 20) return 'combo20';
  if (combo >= 10) return 'combo10';
  if (combo >= 5) return 'combo5';
  return 'base';
};

// ===== フラッシュ演出設定 =====
export type FlashType = 'success' | 'successCombo' | 'miss';

export const FLASH_CONFIGS = {
  success: { color: 'rgba(255, 255, 255, 0.25)', duration: 0.15 },
  successCombo: { color: 'rgba(212, 175, 55, 0.35)', duration: 0.2 },
  miss: { color: 'rgba(239, 68, 68, 0.4)', duration: 0.25 },
} as const;

export const getSuccessFlashType = (combo: number): 'success' | 'successCombo' => {
  return combo >= 10 ? 'successCombo' : 'success';
};

// ===== カード破壊演出設定 =====
export type DestructionType = 'shatter' | 'slice' | 'explode';

export const DESTRUCTION_CONFIGS = {
  shatter: { fragments: 6, spread: 120, rotation: 180, duration: 0.5 },
  slice: { angle: 30, gap: 25, duration: 0.4 },
  explode: { particles: 10, spread: 180, duration: 0.6 },
} as const;

export const getDestructionType = (combo: number): DestructionType => {
  if (combo >= 20) return 'explode';
  if (combo >= 10) return 'slice';
  return 'shatter';
};

// ===== コンボエスカレーション設定 =====
export interface ComboMilestoneConfig {
  threshold: number;
  name: string;
  announcement: string;
  color: string;
  glowColor: string;
  scale: number;
  duration: number;
}

export const COMBO_ESCALATION: ComboMilestoneConfig[] = [
  { threshold: 5, name: '纏', announcement: '纏！', color: 'text-blue-400', glowColor: 'rgba(96, 165, 250, 0.8)', scale: 1.2, duration: 0.8 },
  { threshold: 10, name: '絶', announcement: '絶！', color: 'text-purple-400', glowColor: 'rgba(192, 132, 252, 0.8)', scale: 1.4, duration: 1.0 },
  { threshold: 20, name: '練', announcement: '練！', color: 'text-orange-400', glowColor: 'rgba(251, 146, 60, 0.8)', scale: 1.6, duration: 1.2 },
  { threshold: 50, name: '発', announcement: '発動！', color: 'text-red-500', glowColor: 'rgba(239, 68, 68, 0.8)', scale: 2.0, duration: 1.5 },
];

export const getComboMilestone = (currentCombo: number, prevCombo: number): ComboMilestoneConfig | null => {
  for (let i = COMBO_ESCALATION.length - 1; i >= 0; i--) {
    const config = COMBO_ESCALATION[i];
    if (currentCombo >= config.threshold && prevCombo < config.threshold) {
      return config;
    }
  }
  return null;
};

// ===== HPシステム設定 =====
export const HP_CONFIG = {
  maxHP: 100,
  criticalThreshold: 20,
  gameOverEnabled: true,
} as const;

// ===== 難易度別HP設定 =====
export interface ChapterHPConfig {
  missDamage: number;
  correctRecovery: number;
  comboRecoveryBonus: number;
}

export const CHAPTER_HP_CONFIGS: Record<number, ChapterHPConfig> = {
  1: { missDamage: 5, correctRecovery: 5, comboRecoveryBonus: 5 },
  2: { missDamage: 5, correctRecovery: 5, comboRecoveryBonus: 5 },
  3: { missDamage: 10, correctRecovery: 3, comboRecoveryBonus: 5 },
  4: { missDamage: 10, correctRecovery: 3, comboRecoveryBonus: 5 },
  5: { missDamage: 15, correctRecovery: 2, comboRecoveryBonus: 5 },
  6: { missDamage: 15, correctRecovery: 2, comboRecoveryBonus: 5 },
  7: { missDamage: 20, correctRecovery: 2, comboRecoveryBonus: 5 },
};

export const getChapterHPConfig = (chapter: number): ChapterHPConfig => {
  return CHAPTER_HP_CONFIGS[chapter] || CHAPTER_HP_CONFIGS[3];
};

// ===== 特殊HP効果設定 =====
export const HP_SPECIAL_EFFECTS = {
  consecutiveMissPenalty: { twoMiss: 1.5, threePlusMiss: 2.0 },
  perfectWordBonus: 10,
  comboBonus: { combo10: 15, combo20: 25 },
  criticalRecoveryMultiplier: 2,
} as const;

// ===== 念オーラ設定 =====
export const NEN_AURA_CONFIG = {
  HEIGHT_MULTIPLIER: 2,
  HEIGHT_MAX: 100,
  PARTICLE_THRESHOLD: 10,
  PARTICLE_MAX_COUNT: 10,
  PARTICLE_DIVISOR: 5,
} as const;

// ===== 爆発エフェクト設定 =====
export const EXPLOSION_CONFIG = {
  RAY_COUNT: 8,
  PARTICLE_COUNT: 12,
  PARTICLE_DISTANCE_MIN: 80,
  PARTICLE_DISTANCE_RANGE: 60,
} as const;

// ===== 念レベル色定義（NenAura用） =====
export const NEN_AURA_COLORS = {
  HATSU: 'from-red-500/40 to-orange-500/20',
  REN: 'from-orange-400/40 to-yellow-400/20',
  ZETSU: 'from-purple-400/40 to-blue-400/20',
  TEN: 'from-blue-400/40 to-cyan-400/20',
  DEFAULT: 'from-hunter-gold/30 to-hunter-gold/10',
} as const;

// ===== 念レベル閾値（NenAura用） =====
export const NEN_THRESHOLDS = {
  HATSU: 50,
  REN: 20,
  ZETSU: 10,
  TEN: 5,
} as const;

// ===== アニメーションタイミング統合定数 =====
/**
 * 全アニメーションのタイミングを一元管理
 * 各イベントのシーケンシング用タイムスタンプ（ms）
 */
export const ANIMATION_TIMINGS = {
  // ===== 入力フィードバック =====
  /** 文字入力の反応時間 */
  CHAR_INPUT_FEEDBACK: 150,

  // ===== 単語完了フロー =====
  /** 単語完了時の音声再生 */
  WORD_COMPLETE_SOUND: 0,
  /** 成功シェイク開始 */
  WORD_COMPLETE_SHAKE: 0,
  /** 爆発エフェクト開始 */
  WORD_COMPLETE_EXPLOSION: 0,
  /** 新しい単語の表示遅延 */
  WORD_COMPLETE_NEXT_WORD: 300,

  // ===== 画面エフェクト =====
  /** 画面フラッシュ開始 */
  SCREEN_FLASH_START: 0,

  // ===== コンボエフェクト =====
  /** コンボマイルストーン開始（5, 10, 20, 50） */
  COMBO_MILESTONE_START: 0,
  /** コンボエフェクト背景グロー */
  COMBO_GLOW_START: 0,
  /** コンボリップルエフェクト開始 */
  COMBO_RIPPLE_START: 150,
  /** コンボテキスト表示遅延 */
  COMBO_TEXT_SHOW: 300,

  // ===== 結果画面 =====
  /** ランクカード表示開始 */
  RESULT_RANK_CARD: 0,
  /** 詳細パネルスライイン開始 */
  RESULT_DETAILS_PANEL: 300,
  /** ランクメッセージ表示 */
  RESULT_RANK_MESSAGE: 500,
  /** スコア表示開始 */
  RESULT_SCORE_SHOW: 700,
  /** 新記録バナー表示 */
  RESULT_NEW_RECORD: 800,
  /** スコア差分アニメーション開始 */
  RESULT_SCORE_DIFF: 1000,

  // ===== 音声タイミング =====
  /** 成功時の音声（コンボ依存） */
  SOUND_SUCCESS: 0,
  /** コンボマイルストーン音声 */
  SOUND_COMBO_MILESTONE: 300,
  /** 結果画面の音声 */
  RESULT_SOUND_MAIN: 300,
  /** 結果画面のサブ音声 */
  RESULT_SOUND_ACHIEVEMENT: 400,

  // ===== ハプティック =====
  /** 入力時の振動 */
  HAPTIC_INPUT: 0,
  /** 成功時の振動 */
  HAPTIC_SUCCESS: 0,
  /** コンボマイルストーン振動 */
  HAPTIC_MILESTONE: 0,
  /** ダメージ時の振動 */
  HAPTIC_DAMAGE: 0,
} as const;

// ===== ハプティックフィードバック設定 =====
/**
 * 各種イベントに対応したハプティック振動パターン
 * Navigator.vibrate() API 互換
 */
export interface HapticPattern {
  /** 振動パターン（ms単位で [ON, OFF, ON, OFF, ...] ） */
  pattern: number[];
  /** ハプティック強度（0-1） */
  intensity: number;
}

export const HAPTIC_PATTERNS = {
  /** タップ時の軽い振動 */
  tap: {
    pattern: [30],
    intensity: 0.3,
  } as HapticPattern,

  /** 入力成功時の振動 */
  success: {
    pattern: [50, 50, 50],
    intensity: 0.6,
  } as HapticPattern,

  /** コンボマイルストーン振動（5コンボ） */
  milestone5: {
    pattern: [100, 100, 100],
    intensity: 0.7,
  } as HapticPattern,

  /** コンボマイルストーン振動（10コンボ） */
  milestone10: {
    pattern: [100, 100, 100, 100, 100],
    intensity: 0.8,
  } as HapticPattern,

  /** コンボマイルストーン振動（20コンボ） */
  milestone20: {
    pattern: [150, 100, 150, 100, 150],
    intensity: 0.9,
  } as HapticPattern,

  /** コンボマイルストーン振動（50コンボ） */
  milestone50: {
    pattern: [200, 50, 100, 50, 200, 50, 100],
    intensity: 1.0,
  } as HapticPattern,

  /** ミス時のダメージ振動 */
  damage: {
    pattern: [50, 100, 50, 100, 50],
    intensity: 0.8,
  } as HapticPattern,

  /** クリティカル状態の警告振動 */
  critical: {
    pattern: [100, 50, 100, 50, 100, 50, 100],
    intensity: 0.9,
  } as HapticPattern,

  /** UI選択時の振動 */
  uiSelect: {
    pattern: [25, 50, 25],
    intensity: 0.4,
  } as HapticPattern,

  /** メニュー進行時の振動 */
  menuMove: {
    pattern: [15],
    intensity: 0.2,
  } as HapticPattern,
} as const;

/**
 * コンボ数に応じたハプティックパターンを取得
 */
export const getComboHapticPattern = (combo: number): HapticPattern | null => {
  if (combo === 50) return HAPTIC_PATTERNS.milestone50;
  if (combo === 20) return HAPTIC_PATTERNS.milestone20;
  if (combo === 10) return HAPTIC_PATTERNS.milestone10;
  if (combo === 5) return HAPTIC_PATTERNS.milestone5;
  return null;
};
