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
  /** 爆発エフェクト表示時間 */
  EXPLOSION: 800,
  /** 画面シェイク時間（軽） */
  SHAKE_LIGHT: 200,
  /** 画面シェイク時間（中） */
  SHAKE_MEDIUM: 300,
  /** 画面シェイク時間（重） */
  SHAKE_HEAVY: 400,
} as const;

// ===== 正解時シェイク設定 =====
export type SuccessShakeIntensity = 'base' | 'combo5' | 'combo10' | 'combo20';

export const SUCCESS_SHAKE_CONFIGS = {
  /** コンボ1-4: 軽い横シェイク */
  base: {
    x: [-1, 1, 0],
    duration: 0.1,
  },
  /** コンボ5-9: やや強め */
  combo5: {
    x: [-2, 2, -1, 1, 0],
    duration: 0.15,
  },
  /** コンボ10-19: 強め */
  combo10: {
    x: [-3, 3, -2, 2, 0],
    duration: 0.2,
  },
  /** コンボ20+: 最強 */
  combo20: {
    x: [-4, 4, -3, 3, -1, 1, 0],
    duration: 0.25,
  },
} as const;

/**
 * コンボ数から正解時シェイク強度を取得
 */
export const getSuccessShakeIntensity = (combo: number): SuccessShakeIntensity => {
  if (combo >= 20) return 'combo20';
  if (combo >= 10) return 'combo10';
  if (combo >= 5) return 'combo5';
  return 'base';
};

// ===== フラッシュ演出設定 =====
export type FlashType = 'success' | 'successCombo' | 'miss';

export const FLASH_CONFIGS = {
  /** 正解時: 白フラッシュ */
  success: {
    color: 'rgba(255, 255, 255, 0.25)',
    duration: 0.15,
  },
  /** 10コンボ以上の正解時: 金フラッシュ */
  successCombo: {
    color: 'rgba(212, 175, 55, 0.35)',
    duration: 0.2,
  },
  /** ミス時: 赤フラッシュ */
  miss: {
    color: 'rgba(239, 68, 68, 0.4)',
    duration: 0.25,
  },
} as const;

/** コンボ数に応じたフラッシュタイプを取得 */
export const getSuccessFlashType = (combo: number): 'success' | 'successCombo' => {
  return combo >= 10 ? 'successCombo' : 'success';
};

// ===== カード破壊演出設定 =====
export type DestructionType = 'shatter' | 'slice' | 'explode';

export const DESTRUCTION_CONFIGS = {
  /** ガラス割れ（コンボ1-9） */
  shatter: {
    fragments: 6,
    spread: 120,
    rotation: 180,
    duration: 0.5,
  },
  /** 斬撃（コンボ10-19） */
  slice: {
    angle: 30,
    gap: 25,
    duration: 0.4,
  },
  /** 吹き飛び（コンボ20+） */
  explode: {
    particles: 10,
    spread: 180,
    duration: 0.6,
  },
} as const;

/** コンボ数に応じた破壊演出タイプを取得 */
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
  {
    threshold: 5,
    name: '纏',
    announcement: '纏！',
    color: 'text-blue-400',
    glowColor: 'rgba(96, 165, 250, 0.8)',
    scale: 1.2,
    duration: 0.8,
  },
  {
    threshold: 10,
    name: '絶',
    announcement: '絶！',
    color: 'text-purple-400',
    glowColor: 'rgba(192, 132, 252, 0.8)',
    scale: 1.4,
    duration: 1.0,
  },
  {
    threshold: 20,
    name: '練',
    announcement: '練！',
    color: 'text-orange-400',
    glowColor: 'rgba(251, 146, 60, 0.8)',
    scale: 1.6,
    duration: 1.2,
  },
  {
    threshold: 50,
    name: '発',
    announcement: '発動！',
    color: 'text-red-500',
    glowColor: 'rgba(239, 68, 68, 0.8)',
    scale: 2.0,
    duration: 1.5,
  },
];

/** コンボ数がマイルストーンに達したかチェック */
export const getComboMilestone = (
  currentCombo: number,
  prevCombo: number
): ComboMilestoneConfig | null => {
  // 降順でチェック（大きいマイルストーンを優先）
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
  /** 最大HP */
  maxHP: 100,
  /** ミス1回のダメージ */
  missDamage: 10,
  /** 正解時の回復量 */
  correctRecovery: 3,
  /** 5コンボごとのボーナス回復 */
  comboRecoveryBonus: 5,
  /** 危険状態の閾値（この値以下で赤く点滅） */
  criticalThreshold: 20,
  /** ゲームオーバー有効化（教育目的なのでfalse） */
  gameOverEnabled: false,
} as const;

// ===== 念オーラ設定 =====
export const NEN_AURA_CONFIG = {
  /** オーラ高さの係数（combo * この値 = 高さ%） */
  HEIGHT_MULTIPLIER: 2,
  /** オーラ高さの最大値（%） */
  HEIGHT_MAX: 100,
  /** パーティクル表示開始コンボ数 */
  PARTICLE_THRESHOLD: 10,
  /** パーティクル最大数 */
  PARTICLE_MAX_COUNT: 10,
  /** パーティクル数の係数（combo / この値 = パーティクル数） */
  PARTICLE_DIVISOR: 5,
} as const;

// ===== 爆発エフェクト設定 =====
export const EXPLOSION_CONFIG = {
  /** 放射状光線の数 */
  RAY_COUNT: 8,
  /** パーティクルの数 */
  PARTICLE_COUNT: 12,
  /** パーティクルの最小距離 */
  PARTICLE_DISTANCE_MIN: 80,
  /** パーティクルの距離ランダム幅 */
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
