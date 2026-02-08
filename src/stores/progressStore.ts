/**
 * 進捗管理ストア
 * 
 * プレイ記録、統計、実績を管理し、localStorageに永続化
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { STORAGE_KEYS, STORAGE_VERSION } from '@/constants/storageKeys';
import { DEFAULT_STATISTICS } from '@/constants/config';
import type { StageResult, Statistics, KeyStatistics, DailyLog } from '@/types/progress';
import type { Rank } from '@/types/game';

// ===== ストア型定義 =====
interface ProgressStore {
  // === 進捗データ ===
  unlockedChapters: number[];
  clearedStages: Record<string, StageResult>;
  totalScore: number;
  achievements: string[];
  statistics: Statistics;
  keyStatistics: KeyStatistics;
  dailyLogs: DailyLog[];
  defeatedBosses: Set<string>;

  // === アクション ===
  unlockChapter: (chapter: number) => void;
  lockChapter: (chapter: number) => void;
  saveStageResult: (stageId: string, result: StageResult) => void;
  clearStage: (stageId: string) => void;  // ステージをクリア済みにする（デバッグ用）
  unclearStage: (stageId: string) => void;  // ステージのクリアを取り消す
  markBossDefeated: (bossId: string) => void;
  unmarkBossDefeated: (bossId: string) => void;  // ボス撃破を取り消す
  addAchievement: (achievementId: string) => void;
  updateStatistics: (updates: Partial<Statistics>) => void;
  updateKeyStats: (key: string, isCorrect: boolean, latency: number) => void;
  updateStreak: () => void;
  addDailyLog: (log: Omit<DailyLog, 'date'>) => void;
  resetProgress: () => void;
  resetAllProgress: () => void;

  // === ゲッター ===
  isStageCleared: (stageId: string) => boolean;
  getStageResult: (stageId: string) => StageResult | undefined;
  isChapterUnlocked: (chapter: number) => boolean;
  isBossDefeated: (bossId: string) => boolean;
  cleanupOldData: () => void;
  getAccuracyForKey: (key: string) => number;
}

// ===== 今日の日付を取得 =====
const getTodayString = () => new Date().toISOString().split('T')[0];

// ===== ストア実装 =====
export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      // === 初期状態 ===
      unlockedChapters: [1], // 第1章は最初から解放
      clearedStages: {},
      totalScore: 0,
      achievements: [],
      statistics: DEFAULT_STATISTICS,
      keyStatistics: {},
      dailyLogs: [],
      defeatedBosses: new Set(),

      // === アクション ===
      unlockChapter: (chapter) =>
        set((state) => ({
          unlockedChapters: state.unlockedChapters.includes(chapter)
            ? state.unlockedChapters
            : [...state.unlockedChapters, chapter].sort((a, b) => a - b),
        })),

      lockChapter: (chapter) =>
        set((state) => ({
          unlockedChapters: chapter === 1
            ? state.unlockedChapters  // チャプター1はロックできない
            : state.unlockedChapters.filter((c) => c !== chapter),
        })),

      saveStageResult: (stageId, result) =>
        set((state) => {
          const existing = state.clearedStages[stageId];
          // ハイスコア更新時のみ保存
          if (!existing || result.score > existing.score) {
            return {
              clearedStages: {
                ...state.clearedStages,
                [stageId]: result,
              },
              totalScore:
                state.totalScore + result.score - (existing?.score || 0),
            };
          }
          return state;
        }),

      // ステージをクリア済みにする（デバッグ用ダミー結果）
      clearStage: (stageId) =>
        set((state) => ({
          clearedStages: {
            ...state.clearedStages,
            [stageId]: {
              score: 1000,
              accuracy: 100,
              maxCombo: 10,
              clearTime: 60000,
              rank: 'S' as Rank,
              clearedAt: new Date().toISOString(),
            },
          },
        })),

      // ステージのクリアを取り消す
      unclearStage: (stageId) =>
        set((state) => {
          const { [stageId]: _, ...rest } = state.clearedStages;
          return { clearedStages: rest };
        }),

      markBossDefeated: (bossId) =>
        set((state) => ({
          defeatedBosses: new Set([...state.defeatedBosses, bossId]),
        })),

      unmarkBossDefeated: (bossId) =>
        set((state) => {
          const newSet = new Set(state.defeatedBosses);
          newSet.delete(bossId);
          return { defeatedBosses: newSet };
        }),

      addAchievement: (achievementId) =>
        set((state) => ({
          achievements: state.achievements.includes(achievementId)
            ? state.achievements
            : [...state.achievements, achievementId],
        })),

      updateStatistics: (updates) =>
        set((state) => ({
          statistics: { ...state.statistics, ...updates },
        })),

      updateKeyStats: (key, isCorrect, latency) =>
        set((state) => {
          const existing = state.keyStatistics[key] || {
            totalAttempts: 0,
            correctCount: 0,
            averageLatency: 0,
          };

          const newAttempts = existing.totalAttempts + 1;
          const newCorrect = existing.correctCount + (isCorrect ? 1 : 0);
          const newAvgLatency =
            (existing.averageLatency * existing.totalAttempts + latency) /
            newAttempts;

          return {
            keyStatistics: {
              ...state.keyStatistics,
              [key]: {
                totalAttempts: newAttempts,
                correctCount: newCorrect,
                averageLatency: newAvgLatency,
              },
            },
          };
        }),

      updateStreak: () =>
        set((state) => {
          const today = getTodayString();
          const lastPlayed = state.statistics.lastPlayedDate;

          if (lastPlayed === today) {
            // 今日すでにプレイ済み
            return state;
          }

          const yesterday = new Date(Date.now() - 86400000)
            .toISOString()
            .split('T')[0];
          const newStreak =
            lastPlayed === yesterday ? state.statistics.streakDays + 1 : 1;

          return {
            statistics: {
              ...state.statistics,
              streakDays: newStreak,
              lastPlayedDate: today,
            },
          };
        }),

      addDailyLog: (log) =>
        set((state) => {
          const today = getTodayString();
          const existingIndex = state.dailyLogs.findIndex(
            (l) => l.date === today
          );

          let newLogs: DailyLog[];

          if (existingIndex >= 0) {
            // 今日のログを更新
            const existing = state.dailyLogs[existingIndex];
            newLogs = [...state.dailyLogs];
            newLogs[existingIndex] = {
              date: today,
              playCount: existing.playCount + log.playCount,
              totalTime: existing.totalTime + log.totalTime,
              bestScore: Math.max(existing.bestScore, log.bestScore),
              averageAccuracy:
                (existing.averageAccuracy * existing.playCount +
                  log.averageAccuracy * log.playCount) /
                (existing.playCount + log.playCount),
            };
          } else {
            // 新しいログを追加
            newLogs = [
              ...state.dailyLogs,
              { date: today, ...log },
            ];
          }

          // 直近30日分のみ保持
          if (newLogs.length > 30) {
            newLogs = newLogs.slice(-30);
          }

          return { dailyLogs: newLogs };
        }),

      resetProgress: () =>
        set({
          unlockedChapters: [1],
          clearedStages: {},
          totalScore: 0,
          achievements: [],
          statistics: DEFAULT_STATISTICS,
          keyStatistics: {},
          dailyLogs: [],
          defeatedBosses: new Set(),
        }),

      // resetAllProgressはresetProgressのエイリアス
      resetAllProgress: () =>
        set({
          unlockedChapters: [1],
          clearedStages: {},
          totalScore: 0,
          achievements: [],
          statistics: DEFAULT_STATISTICS,
          keyStatistics: {},
          dailyLogs: [],
          defeatedBosses: new Set(),
        }),

      // === ゲッター ===
      isStageCleared: (stageId) => !!get().clearedStages[stageId],

      getStageResult: (stageId) => get().clearedStages[stageId],

      isChapterUnlocked: (chapter) => get().unlockedChapters.includes(chapter),

      isBossDefeated: (bossId) => get().defeatedBosses.has(bossId),

      // 古いデータのクリーンアップ
      cleanupOldData: () => {
        const state = get();
        // dailyLogs: 30日超のエントリを削除
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const cutoff = thirtyDaysAgo.toISOString().split('T')[0];
        const filteredLogs = state.dailyLogs.filter(log => log.date >= cutoff);
        if (filteredLogs.length !== state.dailyLogs.length) {
          set({ dailyLogs: filteredLogs });
        }
      },

      getAccuracyForKey: (key) => {
        const stats = get().keyStatistics[key];
        if (!stats || stats.totalAttempts === 0) return 100;
        return (stats.correctCount / stats.totalAttempts) * 100;
      },
    }),
    {
      name: STORAGE_KEYS.PROGRESS,
      version: STORAGE_VERSION.PROGRESS,
      storage: createJSONStorage(() => localStorage),
      // Setをシリアライズ可能な形式に変換
      partialize: (state) => ({
        ...state,
        defeatedBosses: Array.from(state.defeatedBosses),
      }),
      // 復元時にSetを再構築
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<ProgressStore> & { defeatedBosses?: string[] };
        return {
          ...currentState,
          ...persisted,
          // 配列からSetに復元
          defeatedBosses: new Set(persisted.defeatedBosses || []),
        };
      },
      // マイグレーション
      migrate: (persistedState: unknown, version: number) => {
        if (version === 0) {
          // v0 → v1 のマイグレーション
          const state = persistedState as Partial<ProgressStore>;
          return {
            unlockedChapters: state.unlockedChapters || [1],
            clearedStages: state.clearedStages || {},
            totalScore: state.totalScore || 0,
            achievements: state.achievements || [],
            statistics: { ...DEFAULT_STATISTICS, ...state.statistics },
            keyStatistics: state.keyStatistics || {},
            dailyLogs: state.dailyLogs || [],
            defeatedBosses: [],
          };
        }
        return persistedState as ProgressStore;
      },
    }
  )
);
