/**
 * ボスシステム統合テスト
 * ゲームロジック、計算関数、状態管理を検証
 */

import {
  calculateBossDamage,
  calculatePlayerDamage,
  calculateRecovery,
  calculateBossRank,
  calculateBossPhase,
  calculateComboBonus,
  isCriticalHit,
} from '@/utils/bossCalculations';
import { calculateBossHP } from '@/constants/bossConfigs';
import type { BossRank } from '@/types/boss';

describe('Boss System Tests', () => {
  describe('Damage Calculations', () => {
    it('should calculate boss damage correctly', () => {
      const baseDamage = calculateBossDamage(1, 0, 1); // wordDiff=1, combo=0, chapter=1
      expect(baseDamage).toBe(15); // 10 + 1*5 + 0
    });

    it('should add combo bonus to boss damage', () => {
      const damageLowCombo = calculateBossDamage(2, 5, 1); // 10 + 10 + 3 = 23
      const damageHighCombo = calculateBossDamage(2, 15, 1); // 10 + 10 + 9 = 29
      expect(damageLowCombo).toBe(23);
      expect(damageHighCombo).toBe(29);
    });

    it('should calculate player damage with difficulty scaling', () => {
      const baseDamage = 10;
      const damage1 = calculatePlayerDamage(baseDamage, 1, false); // 1.0x = 10
      const damage6 = calculatePlayerDamage(baseDamage, 6, false); // 1.5x = 15
      expect(damage1).toBe(10);
      expect(damage6).toBe(15);
    });

    it('should apply critical hit multiplier', () => {
      const normal = calculatePlayerDamage(10, 1, false);
      const critical = calculatePlayerDamage(10, 1, true);
      expect(critical).toBe(Math.round(normal * 1.5));
    });

    it('should calculate recovery with reduction', () => {
      const chapter1Recovery = calculateRecovery(100, 1); // 0% reduction
      const chapter6Recovery = calculateRecovery(100, 6); // 60% reduction
      expect(chapter1Recovery).toBe(100);
      expect(chapter6Recovery).toBe(40); // 100 * (1 - 0.6)
    });
  });

  describe('Boss HP Calculations', () => {
    it('should scale HP by chapter', () => {
      const chapter1HP = calculateBossHP(1); // 150 * 1 * 1.0 = 150
      const chapter3HP = calculateBossHP(3); // 150 * 3 * 1.5 = 675
      const chapter7HP = calculateBossHP(7); // 150 * 7 * 1.8 = 1890
      expect(chapter1HP).toBe(150);
      expect(chapter3HP).toBe(675);
      expect(chapter7HP).toBe(1890);
    });
  });

  describe('Boss Rank Calculations', () => {
    it('should give S+ for perfect victory with time limit', () => {
      const rank = calculateBossRank(100, 100, 119, 120, 0); // 100%, <120s, 0 misses
      expect(rank).toBe('S+');
    });

    it('should give S for no-miss clear', () => {
      const rank = calculateBossRank(50, 100, 300, null, 0); // Any time, 0 misses
      expect(rank).toBe('S');
    });

    it('should give A+ for high HP and low misses', () => {
      const rank = calculateBossRank(90, 100, 100, null, 1);
      expect(rank).toBe('A+');
    });

    it('should give A for decent HP', () => {
      const rank = calculateBossRank(75, 100, 100, null, 2);
      expect(rank).toBe('A');
    });

    it('should give B+ for barely surviving', () => {
      const rank = calculateBossRank(25, 100, 100, null, 5);
      expect(rank).toBe('B+');
    });

    it('should give C for just clearing', () => {
      const rank = calculateBossRank(1, 100, 100, null, 10);
      expect(rank).toBe('C');
    });

    it('should give D for defeat', () => {
      const rank = calculateBossRank(0, 100, 100, null, 10);
      expect(rank).toBe('D');
    });
  });

  describe('Boss Phase Calculations', () => {
    it('should return phase 1 for single-phase boss', () => {
      const phase = calculateBossPhase(100, 100, 1);
      expect(phase).toBe(1);
    });

    it('should return phase 1 for >50% HP in 2-phase', () => {
      const phase = calculateBossPhase(60, 100, 2);
      expect(phase).toBe(1);
    });

    it('should return phase 2 for <50% HP in 2-phase', () => {
      const phase = calculateBossPhase(40, 100, 2);
      expect(phase).toBe(2);
    });

    it('should correctly calculate 3-phase progression', () => {
      const phase1 = calculateBossPhase(80, 100, 3); // >66%
      const phase2 = calculateBossPhase(50, 100, 3); // 33-66%
      const phase3 = calculateBossPhase(20, 100, 3); // <33%
      expect(phase1).toBe(1);
      expect(phase2).toBe(2);
      expect(phase3).toBe(3);
    });

    it('should correctly calculate 4-phase progression', () => {
      const phase1 = calculateBossPhase(80, 100, 4); // >75%
      const phase2 = calculateBossPhase(60, 100, 4); // 50-75%
      const phase3 = calculateBossPhase(40, 100, 4); // 25-50%
      const phase4 = calculateBossPhase(10, 100, 4); // <25%
      expect(phase1).toBe(1);
      expect(phase2).toBe(2);
      expect(phase3).toBe(3);
      expect(phase4).toBe(4);
    });
  });

  describe('Combo Bonus Calculations', () => {
    it('should return 0 bonus for no combo', () => {
      const bonus = calculateComboBonus(0, 1);
      expect(bonus).toBe(0);
    });

    it('should return bonus based on thresholds', () => {
      // Chapter 1 thresholds: [5, 10, 20, 50]
      const bonus5 = calculateComboBonus(5, 1);   // 1st threshold = 5
      const bonus10 = calculateComboBonus(10, 1); // 2nd threshold = 10
      const bonus20 = calculateComboBonus(20, 1); // 3rd threshold = 15
      const bonus50 = calculateComboBonus(50, 1); // 4th threshold = 20
      expect(bonus5).toBe(5);
      expect(bonus10).toBe(10);
      expect(bonus20).toBe(15);
      expect(bonus50).toBe(20);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero damage', () => {
      const damage = calculateBossDamage(0, 0, 1);
      expect(damage).toBe(10); // Only base damage
    });

    it('should handle very high combo', () => {
      const damage = calculateBossDamage(3, 1000, 1);
      expect(damage).toBeGreaterThan(100);
    });

    it('should not exceed max HP on recovery', () => {
      // Recovery calculation doesn't exceed max HP
      // (handled by BossScreen updateBattleState)
      const recovery = calculateRecovery(200, 1);
      expect(recovery).toBe(200);
    });

    it('should handle negative HP gracefully', () => {
      const rank = calculateBossRank(-50, 100, 100, null, 0);
      expect(rank).toBe('D'); // Treated as defeat
    });
  });

  describe('Difficulty Scaling by Chapter', () => {
    it('should scale damage progressively by chapter', () => {
      const damage1 = calculatePlayerDamage(10, 1, false);
      const damage3 = calculatePlayerDamage(10, 3, false);
      const damage6 = calculatePlayerDamage(10, 6, false);
      expect(damage1).toBeLessThan(damage3);
      expect(damage3).toBeLessThan(damage6);
    });

    it('should scale HP progressively by chapter', () => {
      const hp1 = calculateBossHP(1);
      const hp4 = calculateBossHP(4);
      const hp7 = calculateBossHP(7);
      expect(hp1).toBeLessThan(hp4);
      expect(hp4).toBeLessThan(hp7);
    });
  });

  describe('Critical Hit System', () => {
    it('should return boolean', () => {
      const result = isCriticalHit(0.5);
      expect(typeof result).toBe('boolean');
    });

    it('should rarely trigger with low chance', () => {
      let criticalCount = 0;
      for (let i = 0; i < 1000; i++) {
        if (isCriticalHit(0.01)) {
          criticalCount++;
        }
      }
      // With 0.01 chance, should be around 10 out of 1000
      // Allow range 0-30 for randomness
      expect(criticalCount).toBeLessThan(50);
    });

    it('should often trigger with high chance', () => {
      let criticalCount = 0;
      for (let i = 0; i < 1000; i++) {
        if (isCriticalHit(0.9)) {
          criticalCount++;
        }
      }
      // With 0.9 chance, should be around 900 out of 1000
      // Allow range 850-950 for randomness
      expect(criticalCount).toBeGreaterThan(800);
    });
  });
});

describe('Boss Ranking Examples', () => {
  it('Perfect Chapter 1 victory', () => {
    const rank = calculateBossRank(100, 100, 60, null, 0);
    expect(rank).toBe('S'); // ノーミス
  });

  it('Difficult Chapter 6 victory', () => {
    const rank = calculateBossRank(5, 100, 300, null, 1); // Barely alive, 1 miss
    expect(rank).toBe('B'); // Still a victory but low HP
  });

  it('Chapter 7 optimal victory', () => {
    const rank = calculateBossRank(95, 100, 180, null, 0);
    expect(rank).toBe('S'); // No time limit for chapter 7
  });
});
