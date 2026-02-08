import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useBossStore } from '@/stores/bossStore';
import type { BossBattleResult } from '@/types/boss';

describe('bossStore', () => {
  beforeEach(() => {
    useBossStore.setState({
      currentBattle: null,
      battleHistory: [],
      bossStatistics: {},
    });
  });

  describe('初期状態', () => {
    it('currentBattleはnull', () => {
      const state = useBossStore.getState();
      expect(state.currentBattle).toBeNull();
    });

    it('battleHistoryは空配列', () => {
      const state = useBossStore.getState();
      expect(state.battleHistory).toEqual([]);
    });

    it('bossStatisticsは空オブジェクト', () => {
      const state = useBossStore.getState();
      expect(state.bossStatistics).toEqual({});
    });
  });

  describe('initiateBossBattle', () => {
    it('チャプター1のボス戦が初期化される', () => {
      const store = useBossStore.getState();
      store.initiateBossBattle(1);

      const state = useBossStore.getState();
      expect(state.currentBattle).not.toBeNull();
      expect(state.currentBattle?.currentBoss).toBeDefined();
      expect(state.currentBattle?.currentPhase).toBe(1);
      expect(state.currentBattle?.bossHP).toBeGreaterThan(0);
      expect(state.currentBattle?.bossMaxHP).toBeGreaterThan(0);
      expect(state.currentBattle?.playerHP).toBe(100);
      expect(state.currentBattle?.playerMaxHP).toBe(100);
      expect(state.currentBattle?.isDefeated).toBe(false);
      expect(state.currentBattle?.comboCount).toBe(0);
      expect(state.currentBattle?.correctCount).toBe(0);
      expect(state.currentBattle?.missCount).toBe(0);
      expect(state.currentBattle?.specialStates).toEqual([]);
    });

    it('存在しないチャプターではconsole.errorが呼ばれる', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const store = useBossStore.getState();
      store.initiateBossBattle(999);

      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Boss not found'));
      expect(useBossStore.getState().currentBattle).toBeNull();

      consoleErrorSpy.mockRestore();
    });
  });

  describe('dealDamageToBoss', () => {
    beforeEach(() => {
      const store = useBossStore.getState();
      store.initiateBossBattle(1);
    });

    it('ボスのHPが減少する', () => {
      const initialHP = useBossStore.getState().currentBattle!.bossHP;
      const store = useBossStore.getState();
      store.dealDamageToBoss(50);

      const state = useBossStore.getState();
      expect(state.currentBattle?.bossHP).toBe(initialHP - 50);
    });

    it('HPが0以下にならない', () => {
      const store = useBossStore.getState();
      store.dealDamageToBoss(999999);

      const state = useBossStore.getState();
      expect(state.currentBattle?.bossHP).toBe(0);
    });

    it('HP0でisDefeatedがtrueになる', () => {
      const store = useBossStore.getState();
      store.dealDamageToBoss(999999);

      const state = useBossStore.getState();
      expect(state.currentBattle?.isDefeated).toBe(true);
    });

    it('currentBattleがnullの場合は何も変更しない', () => {
      useBossStore.setState({ currentBattle: null });
      const store = useBossStore.getState();
      store.dealDamageToBoss(50);

      const state = useBossStore.getState();
      expect(state.currentBattle).toBeNull();
    });
  });

  describe('dealDamageToPlayer', () => {
    beforeEach(() => {
      const store = useBossStore.getState();
      store.initiateBossBattle(1);
    });

    it('プレイヤーのHPが減少する', () => {
      const store = useBossStore.getState();
      store.dealDamageToPlayer(30);

      const state = useBossStore.getState();
      expect(state.currentBattle?.playerHP).toBe(70);
    });

    it('HPが0以下にならない', () => {
      const store = useBossStore.getState();
      store.dealDamageToPlayer(150);

      const state = useBossStore.getState();
      expect(state.currentBattle?.playerHP).toBe(0);
    });

    it('currentBattleがnullの場合は何も変更しない', () => {
      useBossStore.setState({ currentBattle: null });
      const store = useBossStore.getState();
      store.dealDamageToPlayer(30);

      const state = useBossStore.getState();
      expect(state.currentBattle).toBeNull();
    });
  });

  describe('incrementCombo', () => {
    beforeEach(() => {
      const store = useBossStore.getState();
      store.initiateBossBattle(1);
    });

    it('コンボとcorrectCountが増加する', () => {
      const store = useBossStore.getState();
      store.incrementCombo();

      const state = useBossStore.getState();
      expect(state.currentBattle?.comboCount).toBe(1);
      expect(state.currentBattle?.correctCount).toBe(1);
    });

    it('複数回増加できる', () => {
      const store = useBossStore.getState();
      store.incrementCombo();
      store.incrementCombo();
      store.incrementCombo();

      const state = useBossStore.getState();
      expect(state.currentBattle?.comboCount).toBe(3);
      expect(state.currentBattle?.correctCount).toBe(3);
    });

    it('currentBattleがnullの場合は何も変更しない', () => {
      useBossStore.setState({ currentBattle: null });
      const store = useBossStore.getState();
      store.incrementCombo();

      const state = useBossStore.getState();
      expect(state.currentBattle).toBeNull();
    });
  });

  describe('resetCombo', () => {
    beforeEach(() => {
      const store = useBossStore.getState();
      store.initiateBossBattle(1);
    });

    it('コンボが0になり、missCountが増加する', () => {
      const store = useBossStore.getState();
      store.incrementCombo();
      store.incrementCombo();
      store.resetCombo();

      const state = useBossStore.getState();
      expect(state.currentBattle?.comboCount).toBe(0);
      expect(state.currentBattle?.missCount).toBe(1);
      expect(state.currentBattle?.correctCount).toBe(2);
    });

    it('currentBattleがnullの場合は何も変更しない', () => {
      useBossStore.setState({ currentBattle: null });
      const store = useBossStore.getState();
      store.resetCombo();

      const state = useBossStore.getState();
      expect(state.currentBattle).toBeNull();
    });
  });

  describe('endBossBattle', () => {
    const mockResult: BossBattleResult = {
      bossId: 'boss_chapter1',
      chapterId: 1,
      isVictory: true,
      elapsedTime: 120000,
      finalBossHP: 0,
      finalPlayerHP: 80,
      maxCombo: 15,
      correctCount: 50,
      missCount: 3,
      rank: 'A',
      timestamp: new Date().toISOString(),
    };

    it('戦闘結果がbattleHistoryに追加される', () => {
      const store = useBossStore.getState();
      store.initiateBossBattle(1);
      store.endBossBattle(mockResult);

      const state = useBossStore.getState();
      expect(state.battleHistory).toHaveLength(1);
      expect(state.battleHistory[0]).toEqual(mockResult);
    });

    it('currentBattleがnullになる', () => {
      const store = useBossStore.getState();
      store.initiateBossBattle(1);
      store.endBossBattle(mockResult);

      const state = useBossStore.getState();
      expect(state.currentBattle).toBeNull();
    });

    it('bossStatisticsが更新される', () => {
      const store = useBossStore.getState();
      store.initiateBossBattle(1);
      store.endBossBattle(mockResult);

      const state = useBossStore.getState();
      const stats = state.bossStatistics[mockResult.bossId];
      expect(stats).toBeDefined();
      expect(stats.totalAttempts).toBe(1);
      expect(stats.totalVictories).toBe(1);
      expect(stats.bestRank).toBe('A');
      expect(stats.maxCombo).toBe(15);
    });

    it('複数回の戦闘結果が累積される', () => {
      const store = useBossStore.getState();
      store.initiateBossBattle(1);
      store.endBossBattle(mockResult);

      store.initiateBossBattle(1);
      const secondResult: BossBattleResult = {
        ...mockResult,
        isVictory: false,
        rank: 'D',
      };
      store.endBossBattle(secondResult);

      const state = useBossStore.getState();
      expect(state.battleHistory).toHaveLength(2);
      const stats = state.bossStatistics[mockResult.bossId];
      expect(stats.totalAttempts).toBe(2);
      expect(stats.totalVictories).toBe(1);
      expect(stats.bestRank).toBe('A');
    });
  });

  describe('getBattleHistory', () => {
    it('指定チャプターの戦闘履歴を取得できる', () => {
      const store = useBossStore.getState();
      const result1: BossBattleResult = {
        bossId: 'boss_chapter1',
        chapterId: 1,
        isVictory: true,
        elapsedTime: 120000,
        finalBossHP: 0,
        finalPlayerHP: 80,
        maxCombo: 15,
        correctCount: 50,
        missCount: 3,
        rank: 'A',
        timestamp: new Date().toISOString(),
      };
      const result2: BossBattleResult = {
        ...result1,
        bossId: 'boss_chapter2',
        chapterId: 2,
      };

      useBossStore.setState({
        battleHistory: [result1, result2],
      });

      const history = store.getBattleHistory(1);
      expect(history).toHaveLength(1);
      expect(history[0].chapterId).toBe(1);
    });
  });

  describe('getBossStatistics', () => {
    it('指定チャプターのボス統計を取得できる', () => {
      useBossStore.setState({
        bossStatistics: {
          boss_chapter1: {
            bossId: 'boss_chapter1',
            chapterId: 1,
            totalAttempts: 5,
            totalVictories: 3,
            bestRank: 'S',
            bestTime: 100000,
            maxCombo: 20,
            lastAttemptTime: new Date().toISOString(),
          },
        },
      });

      const store = useBossStore.getState();
      const stats = store.getBossStatistics(1);
      expect(stats).toBeDefined();
      expect(stats?.totalAttempts).toBe(5);
      expect(stats?.totalVictories).toBe(3);
    });

    it('統計がない場合はundefinedを返す', () => {
      const store = useBossStore.getState();
      const stats = store.getBossStatistics(1);
      expect(stats).toBeUndefined();
    });
  });

  describe('clearBattle', () => {
    it('currentBattleがnullになる', () => {
      const store = useBossStore.getState();
      store.initiateBossBattle(1);
      store.clearBattle();

      const state = useBossStore.getState();
      expect(state.currentBattle).toBeNull();
    });
  });

  describe('addSpecialState', () => {
    beforeEach(() => {
      const store = useBossStore.getState();
      store.initiateBossBattle(1);
    });

    it('特殊状態が追加される', () => {
      const store = useBossStore.getState();
      store.addSpecialState('enraged');

      const state = useBossStore.getState();
      expect(state.currentBattle?.specialStates).toContain('enraged');
    });

    it('currentBattleがnullの場合は何も変更しない', () => {
      useBossStore.setState({ currentBattle: null });
      const store = useBossStore.getState();
      store.addSpecialState('enraged');

      const state = useBossStore.getState();
      expect(state.currentBattle).toBeNull();
    });
  });

  describe('removeSpecialState', () => {
    beforeEach(() => {
      const store = useBossStore.getState();
      store.initiateBossBattle(1);
    });

    it('特殊状態が削除される', () => {
      const store = useBossStore.getState();
      store.addSpecialState('enraged');
      store.removeSpecialState('enraged');

      const state = useBossStore.getState();
      expect(state.currentBattle?.specialStates).not.toContain('enraged');
    });

    it('currentBattleがnullの場合は何も変更しない', () => {
      useBossStore.setState({ currentBattle: null });
      const store = useBossStore.getState();
      store.removeSpecialState('enraged');

      const state = useBossStore.getState();
      expect(state.currentBattle).toBeNull();
    });
  });
});
