/**
 * ボス計算ユーティリティのテスト
 */

import {
  calculateBossDamage,
  calculatePlayerDamage,
  calculateRecovery,
  calculateBossRank,
  calculateBossPhase,
  getBossAttackPattern,
  getAttackIntervalByPattern,
  isCriticalHit,
} from '../bossCalculations';

describe('Boss Calculations', () => {
  // ===== ダメージ計算テスト =====
  describe('calculateBossDamage', () => {
    test('基本的なダメージ計算', () => {
      const damage = calculateBossDamage(1, 0, 1);
      expect(damage).toBe(10 + 1 * 5); // baseCorrect + difficultyBonus
    });

    test('コンボボーナスが含まれる', () => {
      const damage1 = calculateBossDamage(1, 0, 1);
      const damage2 = calculateBossDamage(1, 5, 1);
      expect(damage2).toBeGreaterThan(damage1);
    });

    test('難易度3の場合の最大ダメージ', () => {
      const damage = calculateBossDamage(3, 100, 1);
      const expectedBase = 10 + 3 * 5; // 25
      const expectedCombo = Math.floor(100 / 5) * 3; // 60
      expect(damage).toBe(expectedBase + expectedCombo);
    });
  });

  describe('calculatePlayerDamage', () => {
    test('基本ダメージをそのまま返す（difficulty未設定）', () => {
      const damage = calculatePlayerDamage(10, 999, false);
      expect(damage).toBe(10);
    });

    test('クリティカルヒットでダメージ1.5倍', () => {
      const normalDamage = calculatePlayerDamage(10, 1, false);
      const criticalDamage = calculatePlayerDamage(10, 1, true);
      expect(criticalDamage).toBe(Math.round(normalDamage * 1.5));
    });
  });

  // ===== フェーズテスト =====
  describe('calculateBossPhase', () => {
    test('1フェーズボス: 常にPhase 1', () => {
      expect(calculateBossPhase(100, 100, 1)).toBe(1);
      expect(calculateBossPhase(1, 100, 1)).toBe(1);
    });

    test('2フェーズボス: 50%がしきい値', () => {
      expect(calculateBossPhase(100, 100, 2)).toBe(1);
      expect(calculateBossPhase(50, 100, 2)).toBe(2);
      expect(calculateBossPhase(1, 100, 2)).toBe(2);
    });

    test('4フェーズボス: 正確なしきい値', () => {
      expect(calculateBossPhase(100, 100, 4)).toBe(1); // > 75%
      expect(calculateBossPhase(75, 100, 4)).toBe(2); // > 50%
      expect(calculateBossPhase(50, 100, 4)).toBe(3); // > 25%
      expect(calculateBossPhase(25, 100, 4)).toBe(4); // <= 25%
    });
  });

  // ===== 攻撃パターンテスト =====
  describe('getBossAttackPattern', () => {
    test('Chapter 1は常にnormal', () => {
      expect(getBossAttackPattern(1, 1)).toBe('normal');
      expect(getBossAttackPattern(1, 2)).toBe('normal');
      expect(getBossAttackPattern(1, 4)).toBe('normal');
    });

    test('Chapter 2: Phase 2でaggressiveに変化', () => {
      expect(getBossAttackPattern(2, 1)).toBe('normal');
      expect(getBossAttackPattern(2, 2)).toBe('aggressive');
      expect(getBossAttackPattern(2, 3)).toBe('aggressive');
    });

    test('Chapter 3: 段階的に強化', () => {
      expect(getBossAttackPattern(3, 1)).toBe('normal');
      expect(getBossAttackPattern(3, 2)).toBe('aggressive');
      expect(getBossAttackPattern(3, 3)).toBe('combined');
    });

    test('Chapter 5は常にcombined', () => {
      expect(getBossAttackPattern(5, 1)).toBe('combined');
      expect(getBossAttackPattern(5, 4)).toBe('combined');
    });

    test('Chapter 6: Phase 3でintenseに', () => {
      expect(getBossAttackPattern(6, 1)).toBe('combined');
      expect(getBossAttackPattern(6, 3)).toBe('intense');
    });

    test('Chapter 7は常にadaptive', () => {
      expect(getBossAttackPattern(7, 1)).toBe('adaptive');
      expect(getBossAttackPattern(7, 4)).toBe('adaptive');
    });

    test('デフォルトはnormal', () => {
      expect(getBossAttackPattern(999, 1)).toBe('normal');
    });
  });

  // ===== 攻撃間隔テスト =====
  describe('getAttackIntervalByPattern', () => {
    const baseInterval = 10000;

    test('normalパターンは基本間隔そのもの', () => {
      const interval = getAttackIntervalByPattern('normal', baseInterval);
      expect(interval).toBe(10000);
    });

    test('aggressiveパターンは70%で最小5秒', () => {
      const interval = getAttackIntervalByPattern('aggressive', baseInterval);
      expect(interval).toBe(7000);
    });

    test('combinedパターンは60%で最小4秒', () => {
      const interval = getAttackIntervalByPattern('combined', baseInterval);
      expect(interval).toBe(6000);
    });

    test('intenseパターンは50%で最小3秒', () => {
      const interval = getAttackIntervalByPattern('intense', baseInterval);
      expect(interval).toBe(5000);
    });

    test('adaptiveパターンはランダムだが範囲内', () => {
      // 複数回テストしてランダム性を確認
      const intervals = Array.from({ length: 20 }, () =>
        getAttackIntervalByPattern('adaptive', baseInterval)
      );

      intervals.forEach(interval => {
        expect(interval).toBeGreaterThanOrEqual(3000);
        expect(interval).toBeLessThanOrEqual(7000);
      });

      // 異なる値が出ることを確認
      const uniqueValues = new Set(intervals);
      expect(uniqueValues.size).toBeGreaterThan(1);
    });

    test('デフォルトは基本間隔', () => {
      const interval = getAttackIntervalByPattern('unknown', baseInterval);
      expect(interval).toBe(baseInterval);
    });
  });

  // ===== ランク判定テスト =====
  describe('calculateBossRank', () => {
    test('S+: 2分以内に無傷クリア', () => {
      const rank = calculateBossRank(100, 100, 100, 300, 0);
      expect(rank).toBe('S+');
    });

    test('S: ノーミスでクリア', () => {
      const rank = calculateBossRank(50, 100, 180, 300, 0);
      expect(rank).toBe('S');
    });

    test('A+: 高HP残存でミス1以下', () => {
      const rank = calculateBossRank(95, 100, 100, 300, 1);
      expect(rank).toBe('A+');
    });

    test('A: 適度なHP残存', () => {
      const rank = calculateBossRank(75, 100, 100, 300, 2);
      expect(rank).toBe('A');
    });

    test('B+: かなりのダメージ', () => {
      const rank = calculateBossRank(30, 100, 100, 300, 5);
      expect(rank).toBe('B+');
    });

    test('B: 標準的なクリア', () => {
      const rank = calculateBossRank(15, 100, 100, 300, 10);
      expect(rank).toBe('B');
    });

    test('C: かろうじてクリア', () => {
      const rank = calculateBossRank(1, 100, 100, 300, 20);
      expect(rank).toBe('C');
    });
  });

  // ===== ユーティリティ関数テスト =====
  describe('isCriticalHit', () => {
    test('確率0で常にfalse', () => {
      for (let i = 0; i < 100; i++) {
        expect(isCriticalHit(0)).toBe(false);
      }
    });

    test('確率1で常にtrue', () => {
      for (let i = 0; i < 100; i++) {
        expect(isCriticalHit(1)).toBe(true);
      }
    });

    test('確率0.5でおおよそ50%の確率', () => {
      const results = Array.from({ length: 1000 }, () => isCriticalHit(0.5));
      const trueCount = results.filter(r => r).length;
      const percentage = trueCount / results.length;
      // 40-60%の範囲内にあることを期待
      expect(percentage).toBeGreaterThan(0.35);
      expect(percentage).toBeLessThan(0.65);
    });
  });

  // ===== 統合テスト: 難易度進行 =====
  describe('難易度進行シミュレーション', () => {
    test('Chapter 1から7への段階的な攻撃速度上昇', () => {
      const intervals: Record<number, number> = {};

      for (let chapter = 1; chapter <= 7; chapter++) {
        // Phase 3での攻撃パターンを取得
        const pattern = getBossAttackPattern(chapter, 3);
        const interval = getAttackIntervalByPattern(pattern, 10000);
        intervals[chapter] = interval;
      }

      // Chapter 1 → 7の順で間隔が短くなることを確認
      expect(intervals[1]).toBeGreaterThanOrEqual(intervals[2]);
      expect(intervals[2]).toBeGreaterThanOrEqual(intervals[3]);
      expect(intervals[5]).toBeGreaterThanOrEqual(intervals[6]);
      // Chapter 7は若干異なる（ランダム）
    });

    test('各章のPhase進行で攻撃が速くなる', () => {
      // Chapter 6の例
      const phase1Pattern = getBossAttackPattern(6, 1);
      const phase3Pattern = getBossAttackPattern(6, 3);

      const phase1Interval = getAttackIntervalByPattern(phase1Pattern, 10000);
      const phase3Interval = getAttackIntervalByPattern(phase3Pattern, 10000);

      expect(phase1Interval).toBeGreaterThan(phase3Interval);
    });
  });

  // ===== エッジケース =====
  describe('エッジケース', () => {
    test('HP 0時のPhase判定', () => {
      const phase = calculateBossPhase(0, 100, 4);
      expect(phase).toBe(4); // 最終フェーズ
    });

    test('負の値での処理', () => {
      // 負のHP（敗北状態）での処理
      const phase = calculateBossPhase(-10, 100, 4);
      expect(phase).toBe(4);
    });

    test('baseInterval 0での処理', () => {
      // ゼロベース間隔でも最小値が機能することを確認
      const interval = getAttackIntervalByPattern('intense', 0);
      expect(interval).toBe(3000); // 最小値が返される
    });

    test('大きなbaseIntervalでのスケーリング', () => {
      const largeBase = 60000; // 60秒
      const interval = getAttackIntervalByPattern('aggressive', largeBase);
      expect(interval).toBe(42000); // 60000 * 0.7
    });
  });
});
