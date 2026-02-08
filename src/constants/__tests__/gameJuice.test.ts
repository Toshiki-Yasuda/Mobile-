import { describe, it, expect } from 'vitest';
import {
  getNenLevel,
  getChapterHPConfig,
  getSuccessShakeIntensity,
  getComboMilestone,
  NEN_LEVELS,
  CHAPTER_HP_CONFIGS,
  COMBO_ESCALATION,
} from '../gameJuice';

describe('gameJuice ユーティリティ関数', () => {
  describe('getNenLevel', () => {
    it('コンボ0 → 念', () => {
      const level = getNenLevel(0);
      expect(level.name).toBe('念');
      expect(level.threshold).toBe(0);
    });

    it('コンボ5 → 纏', () => {
      const level = getNenLevel(5);
      expect(level.name).toBe('纏');
      expect(level.threshold).toBe(5);
    });

    it('コンボ10 → 絶', () => {
      const level = getNenLevel(10);
      expect(level.name).toBe('絶');
      expect(level.threshold).toBe(10);
    });

    it('コンボ20 → 練', () => {
      const level = getNenLevel(20);
      expect(level.name).toBe('練');
      expect(level.threshold).toBe(20);
    });

    it('コンボ50 → 発', () => {
      const level = getNenLevel(50);
      expect(level.name).toBe('発');
      expect(level.threshold).toBe(50);
    });

    it('コンボ100 → 発', () => {
      const level = getNenLevel(100);
      expect(level.name).toBe('発');
      expect(level.threshold).toBe(50);
    });

    it('境界値: コンボ4 → 念', () => {
      const level = getNenLevel(4);
      expect(level.name).toBe('念');
    });

    it('境界値: コンボ49 → 練', () => {
      const level = getNenLevel(49);
      expect(level.name).toBe('練');
    });
  });

  describe('getChapterHPConfig', () => {
    it('チャプター1の設定を取得', () => {
      const config = getChapterHPConfig(1);
      expect(config).toEqual({
        missDamage: 5,
        correctRecovery: 5,
        comboRecoveryBonus: 5,
      });
    });

    it('チャプター3の設定を取得', () => {
      const config = getChapterHPConfig(3);
      expect(config).toEqual({
        missDamage: 10,
        correctRecovery: 3,
        comboRecoveryBonus: 5,
      });
    });

    it('チャプター5の設定を取得', () => {
      const config = getChapterHPConfig(5);
      expect(config).toEqual({
        missDamage: 15,
        correctRecovery: 2,
        comboRecoveryBonus: 5,
      });
    });

    it('チャプター7の設定を取得', () => {
      const config = getChapterHPConfig(7);
      expect(config).toEqual({
        missDamage: 20,
        correctRecovery: 2,
        comboRecoveryBonus: 5,
      });
    });

    it('未定義チャプター（0）→ デフォルト（チャプター3）', () => {
      const config = getChapterHPConfig(0);
      expect(config).toEqual(CHAPTER_HP_CONFIGS[3]);
    });

    it('未定義チャプター（99）→ デフォルト（チャプター3）', () => {
      const config = getChapterHPConfig(99);
      expect(config).toEqual(CHAPTER_HP_CONFIGS[3]);
    });

    it('未定義チャプター（-1）→ デフォルト（チャプター3）', () => {
      const config = getChapterHPConfig(-1);
      expect(config).toEqual(CHAPTER_HP_CONFIGS[3]);
    });
  });

  describe('getSuccessShakeIntensity', () => {
    it('コンボ0 → base', () => {
      const intensity = getSuccessShakeIntensity(0);
      expect(intensity).toBe('base');
    });

    it('コンボ4 → base', () => {
      const intensity = getSuccessShakeIntensity(4);
      expect(intensity).toBe('base');
    });

    it('コンボ5 → combo5', () => {
      const intensity = getSuccessShakeIntensity(5);
      expect(intensity).toBe('combo5');
    });

    it('コンボ9 → combo5', () => {
      const intensity = getSuccessShakeIntensity(9);
      expect(intensity).toBe('combo5');
    });

    it('コンボ10 → combo10', () => {
      const intensity = getSuccessShakeIntensity(10);
      expect(intensity).toBe('combo10');
    });

    it('コンボ19 → combo10', () => {
      const intensity = getSuccessShakeIntensity(19);
      expect(intensity).toBe('combo10');
    });

    it('コンボ20 → combo20', () => {
      const intensity = getSuccessShakeIntensity(20);
      expect(intensity).toBe('combo20');
    });

    it('コンボ100 → combo20', () => {
      const intensity = getSuccessShakeIntensity(100);
      expect(intensity).toBe('combo20');
    });
  });

  describe('getComboMilestone', () => {
    it('コンボ4 → 5に越えた時、纏マイルストーンを返す', () => {
      const milestone = getComboMilestone(5, 4);
      expect(milestone).not.toBeNull();
      expect(milestone?.threshold).toBe(5);
      expect(milestone?.name).toBe('纏');
      expect(milestone?.announcement).toBe('纏！');
    });

    it('コンボ9 → 10に越えた時、絶マイルストーンを返す', () => {
      const milestone = getComboMilestone(10, 9);
      expect(milestone).not.toBeNull();
      expect(milestone?.threshold).toBe(10);
      expect(milestone?.name).toBe('絶');
      expect(milestone?.announcement).toBe('絶！');
    });

    it('コンボ19 → 20に越えた時、練マイルストーンを返す', () => {
      const milestone = getComboMilestone(20, 19);
      expect(milestone).not.toBeNull();
      expect(milestone?.threshold).toBe(20);
      expect(milestone?.name).toBe('練');
      expect(milestone?.announcement).toBe('練！');
    });

    it('コンボ49 → 50に越えた時、発マイルストーンを返す', () => {
      const milestone = getComboMilestone(50, 49);
      expect(milestone).not.toBeNull();
      expect(milestone?.threshold).toBe(50);
      expect(milestone?.name).toBe('発');
      expect(milestone?.announcement).toBe('発動！');
    });

    it('コンボ5 → 6（越えていない）→ null', () => {
      const milestone = getComboMilestone(6, 5);
      expect(milestone).toBeNull();
    });

    it('コンボ5 → 5（同じ）→ null', () => {
      const milestone = getComboMilestone(5, 5);
      expect(milestone).toBeNull();
    });

    it('コンボ10 → 15（既に越えている）→ null', () => {
      const milestone = getComboMilestone(15, 10);
      expect(milestone).toBeNull();
    });

    it('コンボ0 → 3（マイルストーン前）→ null', () => {
      const milestone = getComboMilestone(3, 0);
      expect(milestone).toBeNull();
    });

    it('コンボ4 → 10に一気に越えた時、最も近い10のマイルストーンを返す', () => {
      const milestone = getComboMilestone(10, 4);
      expect(milestone).not.toBeNull();
      expect(milestone?.threshold).toBe(10);
      expect(milestone?.name).toBe('絶');
    });

    it('コンボ0 → 50に一気に越えた時、最も近い50のマイルストーンを返す', () => {
      const milestone = getComboMilestone(50, 0);
      expect(milestone).not.toBeNull();
      expect(milestone?.threshold).toBe(50);
      expect(milestone?.name).toBe('発');
    });
  });
});
