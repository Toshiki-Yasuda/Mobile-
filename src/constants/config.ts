/**
 * アプリケーション設定定数
 */

export const APP_CONFIG = {
  // ===== ゲーム設定 =====
  /** 1ステージあたりの単語数 */
  WORDS_PER_STAGE: 10,
  /** タイムアタックの制限時間(秒) */
  TIME_ATTACK_DURATION: 60,
  /** フリープレイのデフォルト単語数 */
  FREE_PLAY_WORD_COUNT: 20,

  // ===== スコア設定 =====
  /** 基本スコア（1単語あたり） */
  BASE_SCORE: 100,
  /** コンボ倍率（1コンボあたりの加算） */
  COMBO_MULTIPLIER: 0.1,
  /** スピードボーナス最大値 */
  SPEED_BONUS_MAX: 50,
  /** スピードボーナス閾値(ms)：この時間以内なら満点 */
  SPEED_BONUS_THRESHOLD: 1000,
  /** 正確率ボーナス倍率 */
  ACCURACY_BONUS_MULTIPLIER: 1.5,

  // ===== ランク設定 =====
  RANK_THRESHOLDS: {
    S: { accuracy: 98, timeRatio: 0.5 },
    A: { accuracy: 95, timeRatio: 0.7 },
    B: { accuracy: 90, timeRatio: 1.0 },
    C: { accuracy: 0, timeRatio: Infinity },
  },

  // ===== パフォーマンス設定 =====
  /** 目標入力遅延(ms) */
  TARGET_INPUT_LATENCY: 16,
  /** 状態更新のバッチ間隔(ms) */
  STATE_UPDATE_BATCH_INTERVAL: 16,

  // ===== PWA設定 =====
  /** Service Worker更新チェック間隔(ms) */
  SW_UPDATE_INTERVAL: 60 * 60 * 1000, // 1時間

  // ===== UI設定 =====
  /** コンボ表示の閾値 */
  COMBO_DISPLAY_THRESHOLD: 3,
  /** ミス時の画面シェイク時間(ms) */
  MISS_SHAKE_DURATION: 300,
  /** 単語完了演出時間(ms) */
  WORD_COMPLETE_ANIMATION_DURATION: 500,

  // ===== 念レベル閾値 =====
  NEN_LEVEL_THRESHOLDS: {
    TEN: 5,      // 纏（テン）
    ZETSU: 10,   // 絶（ゼツ）
    REN: 20,     // 練（レン）
    HATSU: 30,   // 発（ハツ）
  },
} as const;

// ===== 初期設定 =====
export const DEFAULT_SETTINGS = {
  soundEnabled: true,
  bgmEnabled: true,
  soundVolume: 100,  // デフォルト音量を最大に
  bgmVolume: 70,
  keyboardVisible: true,
  romajiGuideLevel: 'full' as const,
} as const;

// ===== 初期統計 =====
export const DEFAULT_STATISTICS = {
  totalPlayTime: 0,
  totalTypedChars: 0,
  totalCorrect: 0,
  totalMiss: 0,
  bestWPM: 0,
  streakDays: 0,
  lastPlayedDate: '',
  totalPlays: 0,
} as const;
