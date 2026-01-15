/**
 * ボスシステムストア
 * Zustandによるボス戦闘状態の管理
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BossBattleState, BossBattleResult, BossCharacter, BossStatistics } from '@/types/boss';
import { ALL_BOSS_CHARACTERS, ALL_BOSS_DIFFICULTIES, calculateBossHP } from '@/constants/bossConfigs';

interface BossStoreState {
  // 現在のボス戦闘状態
  currentBattle: BossBattleState | null;

  // 戦闘記録
  battleHistory: BossBattleResult[];
  defeatedBosses: Set<string>;
  bossStatistics: Record<string, BossStatistics>;

  // メソッド
  initiateBossBattle: (chapterId: number) => void;
  updateBattleState: (updates: Partial<BossBattleState>) => void;
  dealDamageToBoss: (damage: number) => void;
  dealDamageToPlayer: (damage: number) => void;
  incrementCombo: () => void;
  resetCombo: () => void;
  addSpecialState: (state: string) => void;
  removeSpecialState: (state: string) => void;
  endBossBattle: (result: BossBattleResult) => void;
  getBattleHistory: (chapterId: number) => BossBattleResult[];
  isBossDefeated: (chapterId: number) => boolean;
  getBossStatistics: (chapterId: number) => BossStatistics | undefined;
  clearBattle: () => void;
}

export const useBossStore = create<BossStoreState>()(
  persist(
    (set, get) => ({
      currentBattle: null,
      battleHistory: [],
      defeatedBosses: new Set(),
      bossStatistics: {},

      initiateBossBattle: (chapterId: number) => {
        const boss = ALL_BOSS_CHARACTERS[chapterId];
        const difficulty = ALL_BOSS_DIFFICULTIES[chapterId];

        if (!boss || !difficulty) {
          console.error(`Boss not found for chapter ${chapterId}`);
          return;
        }

        const maxHP = calculateBossHP(chapterId);

        set((state) => ({
          currentBattle: {
            currentBoss: boss,
            currentPhase: 1,
            bossHP: maxHP,
            bossMaxHP: maxHP,
            isDefeated: false,
            playerHP: 100,
            playerMaxHP: 100,
            elapsed: 0,
            comboCount: 0,
            correctCount: 0,
            missCount: 0,
            specialStates: [],
            lastAttackTime: 0,
            nextAttackTime: 10000, // 10秒後に最初の攻撃
          },
        }));
      },

      updateBattleState: (updates: Partial<BossBattleState>) => {
        set((state) => ({
          currentBattle: state.currentBattle
            ? { ...state.currentBattle, ...updates }
            : null,
        }));
      },

      dealDamageToBoss: (damage: number) => {
        set((state) => {
          if (!state.currentBattle) return {};

          const newHP = Math.max(0, state.currentBattle.bossHP - damage);
          const isDefeated = newHP === 0;

          return {
            currentBattle: {
              ...state.currentBattle,
              bossHP: newHP,
              isDefeated,
            },
          };
        });
      },

      dealDamageToPlayer: (damage: number) => {
        set((state) => {
          if (!state.currentBattle) return {};

          const newHP = Math.max(0, state.currentBattle.playerHP - damage);

          return {
            currentBattle: {
              ...state.currentBattle,
              playerHP: newHP,
            },
          };
        });
      },

      incrementCombo: () => {
        set((state) => {
          if (!state.currentBattle) return {};

          return {
            currentBattle: {
              ...state.currentBattle,
              comboCount: state.currentBattle.comboCount + 1,
              correctCount: state.currentBattle.correctCount + 1,
            },
          };
        });
      },

      resetCombo: () => {
        set((state) => {
          if (!state.currentBattle) return {};

          return {
            currentBattle: {
              ...state.currentBattle,
              comboCount: 0,
              missCount: state.currentBattle.missCount + 1,
            },
          };
        });
      },

      addSpecialState: (stateString: string) => {
        set((state) => {
          if (!state.currentBattle) return {};

          return {
            currentBattle: {
              ...state.currentBattle,
              specialStates: [...state.currentBattle.specialStates, stateString],
            },
          };
        });
      },

      removeSpecialState: (stateString: string) => {
        set((state) => {
          if (!state.currentBattle) return {};

          return {
            currentBattle: {
              ...state.currentBattle,
              specialStates: state.currentBattle.specialStates.filter(
                (s) => s !== stateString
              ),
            },
          };
        });
      },

      endBossBattle: (result: BossBattleResult) => {
        set((state) => ({
          battleHistory: [...state.battleHistory, result],
          defeatedBosses: result.isVictory
            ? new Set([...state.defeatedBosses, result.bossId])
            : state.defeatedBosses,
          currentBattle: null,
          bossStatistics: {
            ...state.bossStatistics,
            [result.bossId]: updateBossStatistics(
              state.bossStatistics[result.bossId],
              result
            ),
          },
        }));
      },

      getBattleHistory: (chapterId: number) => {
        const state = get();
        return state.battleHistory.filter((b) => b.chapterId === chapterId);
      },

      isBossDefeated: (chapterId: number) => {
        const state = get();
        const bossId = `boss_chapter${chapterId}`;
        return state.defeatedBosses.has(bossId);
      },

      getBossStatistics: (chapterId: number) => {
        const state = get();
        const bossId = `boss_chapter${chapterId}`;
        return state.bossStatistics[bossId];
      },

      clearBattle: () => {
        set({ currentBattle: null });
      },
    }),
    {
      name: 'boss-store',
      partialize: (state) => ({
        battleHistory: state.battleHistory,
        defeatedBosses: Array.from(state.defeatedBosses),
        bossStatistics: state.bossStatistics,
      }),
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...(persistedState as any),
        defeatedBosses: new Set((persistedState as any).defeatedBosses || []),
      }),
    }
  )
);

/**
 * ボス統計情報の更新
 */
function updateBossStatistics(
  current: BossStatistics | undefined,
  result: BossBattleResult
): BossStatistics {
  if (!current) {
    return {
      bossId: result.bossId,
      chapterId: result.chapterId,
      totalAttempts: 1,
      totalVictories: result.isVictory ? 1 : 0,
      bestRank: result.isVictory ? result.rank : 'D',
      bestTime: result.isVictory ? result.elapsedTime : Number.MAX_VALUE,
      maxCombo: result.maxCombo,
      lastAttemptTime: result.timestamp,
    };
  }

  const totalVictories = current.totalVictories + (result.isVictory ? 1 : 0);
  const bestRank = result.isVictory
    ? compareBossRanks(current.bestRank, result.rank)
    : current.bestRank;
  const bestTime = result.isVictory
    ? Math.min(current.bestTime, result.elapsedTime)
    : current.bestTime;
  const maxCombo = Math.max(current.maxCombo, result.maxCombo);

  return {
    bossId: result.bossId,
    chapterId: result.chapterId,
    totalAttempts: current.totalAttempts + 1,
    totalVictories,
    bestRank,
    bestTime,
    maxCombo,
    lastAttemptTime: result.timestamp,
  };
}

/**
 * ボスランクを比較して、より良い方を返す
 */
function compareBossRanks(
  rank1: string,
  rank2: string
): 'S+' | 'S' | 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' {
  const rankOrder = ['S+', 'S', 'A+', 'A', 'B+', 'B', 'C', 'D'];
  const index1 = rankOrder.indexOf(rank1);
  const index2 = rankOrder.indexOf(rank2);

  return (index1 <= index2 ? rank1 : rank2) as
    | 'S+'
    | 'S'
    | 'A+'
    | 'A'
    | 'B+'
    | 'B'
    | 'C'
    | 'D';
}
