import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTypingScore } from '../useTypingScore';
import { APP_CONFIG } from '@/constants/config';

describe('useTypingScore', () => {
  it('コンボ0、時間1000ms → BASE_SCORE(100)', () => {
    const { result } = renderHook(() => useTypingScore());
    const score = result.current.calculateScore(1000, 0);
    expect(score).toBe(100);
  });

  it('コンボ0、時間0ms → BASE_SCORE(100) + SPEED_BONUS_MAX(50) = 150', () => {
    const { result } = renderHook(() => useTypingScore());
    const score = result.current.calculateScore(0, 0);
    expect(score).toBe(150);
  });

  it('コンボ10、時間1000ms → 100 * (1 + 10*0.1) = 200', () => {
    const { result } = renderHook(() => useTypingScore());
    const score = result.current.calculateScore(1000, 10);
    expect(score).toBe(200);
  });

  it('コンボ10、時間500ms → 100 * 2 + 50 * 0.5 = 225', () => {
    const { result } = renderHook(() => useTypingScore());
    const score = result.current.calculateScore(500, 10);
    expect(score).toBe(225);
  });

  it('コンボ0、時間2000ms（閾値超え）→ 100', () => {
    const { result } = renderHook(() => useTypingScore());
    const score = result.current.calculateScore(2000, 0);
    expect(score).toBe(100);
  });

  it('コンボ100、時間100ms → 大きなスコア', () => {
    const { result } = renderHook(() => useTypingScore());
    const score = result.current.calculateScore(100, 100);
    const expectedBaseWithCombo = APP_CONFIG.BASE_SCORE * (1 + 100 * APP_CONFIG.COMBO_MULTIPLIER);
    const speedBonusRatio = 1 - 100 / APP_CONFIG.SPEED_BONUS_THRESHOLD;
    const expectedSpeedBonus = APP_CONFIG.SPEED_BONUS_MAX * speedBonusRatio;
    const expected = Math.round(expectedBaseWithCombo + expectedSpeedBonus);
    expect(score).toBe(expected);
    expect(score).toBeGreaterThan(1000);
  });

  it('返り値が常にMath.roundされた整数であること', () => {
    const { result } = renderHook(() => useTypingScore());
    const score1 = result.current.calculateScore(333, 3);
    const score2 = result.current.calculateScore(777, 7);
    const score3 = result.current.calculateScore(555, 5);

    expect(Number.isInteger(score1)).toBe(true);
    expect(Number.isInteger(score2)).toBe(true);
    expect(Number.isInteger(score3)).toBe(true);
  });

  it('スピードボーナスが閾値ギリギリで正しく計算される', () => {
    const { result } = renderHook(() => useTypingScore());
    const score = result.current.calculateScore(999, 0);
    const speedBonusRatio = 1 - 999 / APP_CONFIG.SPEED_BONUS_THRESHOLD;
    const expectedSpeedBonus = APP_CONFIG.SPEED_BONUS_MAX * speedBonusRatio;
    const expected = Math.round(APP_CONFIG.BASE_SCORE + expectedSpeedBonus);
    expect(score).toBe(expected);
  });
});
