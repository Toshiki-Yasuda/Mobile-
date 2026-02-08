/**
 * タイピングスコア計算フック
 * スコア計算ロジック
 */

import { useCallback } from 'react';
import { APP_CONFIG } from '@/constants/config';

export function useTypingScore() {
  // スコア計算
  const calculateScore = useCallback(
    (wordTime: number, combo: number): number => {
      const {
        BASE_SCORE,
        COMBO_MULTIPLIER,
        SPEED_BONUS_MAX,
        SPEED_BONUS_THRESHOLD,
      } = APP_CONFIG;

      let score = BASE_SCORE;
      score *= 1 + combo * COMBO_MULTIPLIER;

      if (wordTime < SPEED_BONUS_THRESHOLD) {
        const speedBonus =
          SPEED_BONUS_MAX * (1 - wordTime / SPEED_BONUS_THRESHOLD);
        score += speedBonus;
      }

      return Math.round(score);
    },
    []
  );

  return {
    calculateScore,
  };
}
