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
