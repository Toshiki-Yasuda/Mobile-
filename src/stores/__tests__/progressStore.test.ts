import { describe, it, expect, beforeEach } from 'vitest';
import { useProgressStore } from '@/stores/progressStore';
import { DEFAULT_STATISTICS } from '@/constants/config';
import type { StageResult } from '@/types/progress';

describe('progressStore', () => {
  beforeEach(() => {
    useProgressStore.setState({
      unlockedChapters: [1],
      clearedStages: {},
      totalScore: 0,
      achievements: [],
      statistics: DEFAULT_STATISTICS,
      keyStatistics: {},
      dailyLogs: [],
      defeatedBosses: new Set(),
    });
  });

  describe('初期状態', () => {
    it('unlockedChaptersは[1]', () => {
      const state = useProgressStore.getState();
      expect(state.unlockedChapters).toEqual([1]);
    });

    it('clearedStagesは空オブジェクト', () => {
      const state = useProgressStore.getState();
      expect(state.clearedStages).toEqual({});
    });

    it('totalScoreは0', () => {
      const state = useProgressStore.getState();
      expect(state.totalScore).toBe(0);
    });

    it('achievementsは空配列', () => {
      const state = useProgressStore.getState();
      expect(state.achievements).toEqual([]);
    });

    it('statisticsはDEFAULT_STATISTICS', () => {
      const state = useProgressStore.getState();
      expect(state.statistics).toEqual(DEFAULT_STATISTICS);
    });

    it('defeatedBossesは空のSet', () => {
      const state = useProgressStore.getState();
      expect(state.defeatedBosses).toEqual(new Set());
    });
  });

  describe('unlockChapter', () => {
    it('チャプターがアンロックされる', () => {
      const store = useProgressStore.getState();
      store.unlockChapter(2);

      const state = useProgressStore.getState();
      expect(state.unlockedChapters).toContain(2);
    });

    it('重複追加されない', () => {
      const store = useProgressStore.getState();
      store.unlockChapter(2);
      store.unlockChapter(2);

      const state = useProgressStore.getState();
      expect(state.unlockedChapters.filter(c => c === 2)).toHaveLength(1);
    });

    it('ソートされる', () => {
      const store = useProgressStore.getState();
      store.unlockChapter(4);
      store.unlockChapter(2);
      store.unlockChapter(3);

      const state = useProgressStore.getState();
      expect(state.unlockedChapters).toEqual([1, 2, 3, 4]);
    });
  });

  describe('lockChapter', () => {
    it('チャプターがロックされる', () => {
      const store = useProgressStore.getState();
      store.unlockChapter(2);
      store.unlockChapter(3);
      store.lockChapter(2);

      const state = useProgressStore.getState();
      expect(state.unlockedChapters).not.toContain(2);
      expect(state.unlockedChapters).toContain(3);
    });

    it('チャプター1はロックできない', () => {
      const store = useProgressStore.getState();
      store.lockChapter(1);

      const state = useProgressStore.getState();
      expect(state.unlockedChapters).toContain(1);
    });
  });

  describe('saveStageResult', () => {
    const mockResult: StageResult = {
      score: 1000,
      accuracy: 95,
      maxCombo: 15,
      clearTime: 60000,
      rank: 'A',
      clearedAt: new Date().toISOString(),
    };

    it('ステージ結果が保存される', () => {
      const store = useProgressStore.getState();
      store.saveStageResult('1-1', mockResult);

      const state = useProgressStore.getState();
      expect(state.clearedStages['1-1']).toEqual(mockResult);
      expect(state.totalScore).toBe(1000);
    });

    it('ハイスコア更新時のみ保存される', () => {
      const store = useProgressStore.getState();
      store.saveStageResult('1-1', mockResult);

      const lowerScoreResult: StageResult = {
        ...mockResult,
        score: 500,
      };
      store.saveStageResult('1-1', lowerScoreResult);

      const state = useProgressStore.getState();
      expect(state.clearedStages['1-1'].score).toBe(1000);
      expect(state.totalScore).toBe(1000);
    });

    it('ハイスコア更新時はtotalScoreが更新される', () => {
      const store = useProgressStore.getState();
      store.saveStageResult('1-1', mockResult);

      const higherScoreResult: StageResult = {
        ...mockResult,
        score: 1500,
      };
      store.saveStageResult('1-1', higherScoreResult);

      const state = useProgressStore.getState();
      expect(state.clearedStages['1-1'].score).toBe(1500);
      expect(state.totalScore).toBe(1500);
    });

    it('複数ステージのスコアが累積される', () => {
      const store = useProgressStore.getState();
      store.saveStageResult('1-1', mockResult);
      store.saveStageResult('1-2', { ...mockResult, score: 800 });

      const state = useProgressStore.getState();
      expect(state.totalScore).toBe(1800);
    });
  });

  describe('markBossDefeated / isBossDefeated', () => {
    it('ボス撃破が記録される', () => {
      const store = useProgressStore.getState();
      store.markBossDefeated('boss_chapter1');

      const state = useProgressStore.getState();
      expect(state.defeatedBosses.has('boss_chapter1')).toBe(true);
    });

    it('isBossDefeatedで撃破状態を確認できる', () => {
      const store = useProgressStore.getState();
      store.markBossDefeated('boss_chapter1');

      expect(store.isBossDefeated('boss_chapter1')).toBe(true);
      expect(store.isBossDefeated('boss_chapter2')).toBe(false);
    });

    it('複数のボスを記録できる', () => {
      const store = useProgressStore.getState();
      store.markBossDefeated('boss_chapter1');
      store.markBossDefeated('boss_chapter2');

      const state = useProgressStore.getState();
      expect(state.defeatedBosses.has('boss_chapter1')).toBe(true);
      expect(state.defeatedBosses.has('boss_chapter2')).toBe(true);
    });
  });

  describe('updateStatistics', () => {
    it('統計が部分更新される', () => {
      const store = useProgressStore.getState();
      store.updateStatistics({
        totalPlayTime: 1000,
        totalTypedChars: 500,
      });

      const state = useProgressStore.getState();
      expect(state.statistics.totalPlayTime).toBe(1000);
      expect(state.statistics.totalTypedChars).toBe(500);
      expect(state.statistics.totalCorrect).toBe(0);
    });

    it('複数回更新できる', () => {
      const store = useProgressStore.getState();
      store.updateStatistics({ totalPlayTime: 1000 });
      store.updateStatistics({ totalTypedChars: 500 });

      const state = useProgressStore.getState();
      expect(state.statistics.totalPlayTime).toBe(1000);
      expect(state.statistics.totalTypedChars).toBe(500);
    });
  });

  describe('addAchievement', () => {
    it('実績が追加される', () => {
      const store = useProgressStore.getState();
      store.addAchievement('first_clear');

      const state = useProgressStore.getState();
      expect(state.achievements).toContain('first_clear');
    });

    it('重複した実績は追加されない', () => {
      const store = useProgressStore.getState();
      store.addAchievement('first_clear');
      store.addAchievement('first_clear');

      const state = useProgressStore.getState();
      expect(state.achievements.filter(a => a === 'first_clear')).toHaveLength(1);
    });

    it('複数の実績を追加できる', () => {
      const store = useProgressStore.getState();
      store.addAchievement('first_clear');
      store.addAchievement('perfect_stage');
      store.addAchievement('speed_master');

      const state = useProgressStore.getState();
      expect(state.achievements).toHaveLength(3);
      expect(state.achievements).toContain('first_clear');
      expect(state.achievements).toContain('perfect_stage');
      expect(state.achievements).toContain('speed_master');
    });
  });

  describe('resetProgress', () => {
    it('全ての進捗がリセットされる', () => {
      const store = useProgressStore.getState();
      store.unlockChapter(2);
      store.unlockChapter(3);
      store.saveStageResult('1-1', {
        score: 1000,
        accuracy: 95,
        maxCombo: 15,
        clearTime: 60000,
        rank: 'A',
        clearedAt: new Date().toISOString(),
      });
      store.addAchievement('first_clear');
      store.markBossDefeated('boss_chapter1');
      store.updateStatistics({ totalPlayTime: 1000 });

      store.resetProgress();

      const state = useProgressStore.getState();
      expect(state.unlockedChapters).toEqual([1]);
      expect(state.clearedStages).toEqual({});
      expect(state.totalScore).toBe(0);
      expect(state.achievements).toEqual([]);
      expect(state.statistics).toEqual(DEFAULT_STATISTICS);
      expect(state.keyStatistics).toEqual({});
      expect(state.dailyLogs).toEqual([]);
      expect(state.defeatedBosses).toEqual(new Set());
    });
  });

  describe('cleanupOldData', () => {
    it('30日超のdailyLogsが削除される', () => {
      const store = useProgressStore.getState();
      const today = new Date();
      const oldDate = new Date(today);
      oldDate.setDate(oldDate.getDate() - 31);
      const recentDate = new Date(today);
      recentDate.setDate(recentDate.getDate() - 15);

      useProgressStore.setState({
        dailyLogs: [
          {
            date: oldDate.toISOString().split('T')[0],
            playCount: 1,
            totalTime: 100,
            bestScore: 500,
            averageAccuracy: 90,
          },
          {
            date: recentDate.toISOString().split('T')[0],
            playCount: 1,
            totalTime: 100,
            bestScore: 500,
            averageAccuracy: 90,
          },
        ],
      });

      store.cleanupOldData();

      const state = useProgressStore.getState();
      expect(state.dailyLogs).toHaveLength(1);
      expect(state.dailyLogs[0].date).toBe(recentDate.toISOString().split('T')[0]);
    });

    it('30日以内のデータは削除されない', () => {
      const store = useProgressStore.getState();
      const today = new Date();
      const date1 = new Date(today);
      date1.setDate(date1.getDate() - 10);
      const date2 = new Date(today);
      date2.setDate(date2.getDate() - 20);

      useProgressStore.setState({
        dailyLogs: [
          {
            date: date1.toISOString().split('T')[0],
            playCount: 1,
            totalTime: 100,
            bestScore: 500,
            averageAccuracy: 90,
          },
          {
            date: date2.toISOString().split('T')[0],
            playCount: 1,
            totalTime: 100,
            bestScore: 500,
            averageAccuracy: 90,
          },
        ],
      });

      store.cleanupOldData();

      const state = useProgressStore.getState();
      expect(state.dailyLogs).toHaveLength(2);
    });
  });

  describe('isStageCleared', () => {
    it('クリア済みステージはtrueを返す', () => {
      const store = useProgressStore.getState();
      store.saveStageResult('1-1', {
        score: 1000,
        accuracy: 95,
        maxCombo: 15,
        clearTime: 60000,
        rank: 'A',
        clearedAt: new Date().toISOString(),
      });

      expect(store.isStageCleared('1-1')).toBe(true);
    });

    it('未クリアステージはfalseを返す', () => {
      const store = useProgressStore.getState();
      expect(store.isStageCleared('1-1')).toBe(false);
    });
  });

  describe('isChapterUnlocked', () => {
    it('アンロック済みチャプターはtrueを返す', () => {
      const store = useProgressStore.getState();
      store.unlockChapter(2);

      expect(store.isChapterUnlocked(1)).toBe(true);
      expect(store.isChapterUnlocked(2)).toBe(true);
    });

    it('ロック中のチャプターはfalseを返す', () => {
      const store = useProgressStore.getState();
      expect(store.isChapterUnlocked(3)).toBe(false);
    });
  });
});
