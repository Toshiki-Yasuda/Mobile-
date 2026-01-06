/**
 * 進捗・統計関連の型定義
 */

import type { Rank } from './game';

// ===== ステージ結果 =====
export interface StageResult {
  score: number;
  accuracy: number; // 0-100
  time: number; // ms
  maxCombo: number;
  rank: Rank;
  clearedAt: string; // ISO 8601
}

// ===== 統計データ =====
export interface Statistics {
  /** 総プレイ時間(ms) */
  totalPlayTime: number;
  /** 総タイプ文字数 */
  totalTypedChars: number;
  /** 正解数 */
  totalCorrect: number;
  /** ミス数 */
  totalMiss: number;
  /** 最高WPM */
  bestWPM: number;
  /** 連続プレイ日数 */
  streakDays: number;
  /** 最終プレイ日 */
  lastPlayedDate: string;
  /** 総プレイ回数 */
  totalPlays: number;
}

// ===== 実績 =====
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
  condition: AchievementCondition;
}

export type AchievementCondition =
  | { type: 'stage_clear'; stageId: string }
  | { type: 'chapter_clear'; chapterId: number }
  | { type: 'all_clear' }
  | { type: 'combo'; value: number }
  | { type: 'accuracy'; value: number }
  | { type: 'wpm'; value: number }
  | { type: 'streak'; days: number }
  | { type: 'total_plays'; count: number }
  | { type: 'no_miss_clear'; stageId: string };

// ===== デイリーログ =====
export interface DailyLog {
  date: string; // YYYY-MM-DD
  playCount: number;
  totalTime: number; // ms
  bestScore: number;
  averageAccuracy: number;
}

// ===== キー別統計 =====
export interface KeyStatistics {
  [key: string]: {
    totalAttempts: number;
    correctCount: number;
    averageLatency: number;
  };
}

// ===== 進捗状態 =====
export interface ProgressState {
  /** 解放済みチャプター */
  unlockedChapters: number[];
  /** クリア済みステージと結果 */
  clearedStages: Record<string, StageResult>;
  /** 累計スコア */
  totalScore: number;
  /** 獲得済み実績 */
  achievements: string[];
  /** 統計データ */
  statistics: Statistics;
  /** キー別統計 */
  keyStatistics: KeyStatistics;
  /** デイリーログ（直近30日） */
  dailyLogs: DailyLog[];
}
