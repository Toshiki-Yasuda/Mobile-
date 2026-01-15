/**
 * ゲーム関連の型定義
 */

// ===== 画面状態 =====
export type Screen =
  | 'password'
  | 'title'
  | 'levelSelect'
  | 'stageSelect'
  | 'typing'
  | 'result'
  | 'bossStage'
  | 'bossResult'
  | 'settings'
  | 'statistics'
  | 'timeAttack'
  | 'freePlay'
  | 'admin';

// ===== ローディング状態 =====
export interface LoadingState {
  isLoading: boolean;
  loadingMessage: string;
  progress: number; // 0-100
}

// ===== エラー状態 =====
export type ErrorType = 'audio' | 'image' | 'storage' | 'unknown';

export interface ErrorState {
  hasError: boolean;
  errorType: ErrorType | null;
  errorMessage: string;
}

// ===== ステージ・チャプター =====
export interface Chapter {
  id: number;
  name: string;
  japaneseName: string;
  description: string;
  stages: Stage[];
  unlockCondition: {
    type: 'chapter' | 'stage';
    id: number;
  } | null;
}

export interface Stage {
  id: string; // "1-1", "2-3" など
  chapterId: number;
  stageNumber: number;
  name: string;
  description: string;
  words: Word[];
  config: StageConfig;
  unlocked: boolean;
}

export interface StageConfig {
  timeLimit: number | null; // null = 無制限
  targetScore: number;
  maxMisses: number | null; // null = 無制限
  keyboardVisible: boolean;
  romajiGuideLevel: 'full' | 'partial' | 'none';
  isBoss: boolean;
}

// ===== 単語 =====
export interface Word {
  id: string;
  display: string; // 表示テキスト（漢字・カタカナ含む）
  hiragana: string; // ひらがな（判定用）
  category: WordCategory;
  difficulty: number; // 1-5
}

export type WordCategory =
  | 'character' // キャラクター名
  | 'ability' // 念能力
  | 'location' // 場所
  | 'item' // アイテム
  | 'term' // 用語
  | 'phrase'; // 短文

// ===== ゲーム結果 =====
export interface GameResult {
  stageId: string;
  score: number;
  correctCount: number;
  missCount: number;
  accuracy: number; // 0-100
  totalTime: number; // ms
  wpm: number; // Words Per Minute
  maxCombo: number;
  rank: Rank;
  clearedAt: string; // ISO 8601
}

export type Rank = 'S' | 'A' | 'B' | 'C';

// ===== コンボ =====
export interface ComboState {
  current: number;
  max: number;
  multiplier: number;
}

// ===== スコア計算 =====
export interface ScoreConfig {
  baseScore: number;
  comboMultiplier: number;
  speedBonusMax: number;
  speedBonusThreshold: number; // ms
  accuracyBonus: number;
}

// ===== ゲームモード =====
export type GameMode = 'training' | 'timeAttack' | 'freePlay';

export interface GameModeConfig {
  mode: GameMode;
  timeLimit?: number;
  wordCount?: number;
  category?: WordCategory;
}
