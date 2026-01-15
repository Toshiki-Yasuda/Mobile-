/**
 * タイピングスコア計算フック
 * スコア計算と単語完了処理
 */

import { useCallback, useRef } from 'react';
import { useGameStore } from '@/stores/gameStore';
import { useSound } from '@/hooks/useSound';
import { APP_CONFIG } from '@/constants/config';
import { HP_CONFIG } from '@/constants/gameJuice';

export function useTypingScore() {
  const {
    session,
    addScore,
    incrementCombo,
    recordMiss,
    resetCombo,
  } = useGameStore();

  const { playConfirmSound, playComboSound, playMissSound } = useSound();

  const wordStartTimeRef = useRef<number>(0);

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

  // 単語完了処理
  const handleWordComplete = useCallback(
    (
      onSuccessAnimation: () => void,
      onHPChange: (newHP: number) => void
    ) => {
      const now = performance.now();
      const currentCombo = session?.combo || 0;
      playConfirmSound(currentCombo);

      onSuccessAnimation();

      const wordTime = now - wordStartTimeRef.current;
      const score = calculateScore(wordTime, currentCombo);
      addScore(score);
      incrementCombo();

      // コンボ音（5コンボ以上で鳴らす）
      const newCombo = (session?.combo || 0) + 1;
      if (newCombo >= 5 && newCombo % 5 === 0) {
        playComboSound(newCombo);
      }

      // HP回復
      let healAmount = HP_CONFIG.correctRecovery;
      if (newCombo >= 5 && newCombo % 5 === 0) {
        healAmount += HP_CONFIG.comboBonus;
      }
      onHPChange(Math.min(HP_CONFIG.maxHP, (session?.currentHP || 0) + healAmount));
    },
    [session, calculateScore, addScore, incrementCombo, playConfirmSound, playComboSound]
  );

  // ミス処理
  const handleMiss = useCallback(
    (onHPChange: (newHP: number) => void) => {
      playMissSound();
      recordMiss();
      resetCombo();

      // HPダメージ
      const newHP = Math.max(0, (session?.currentHP || 0) - HP_CONFIG.missDamage);
      onHPChange(newHP);
    },
    [session, recordMiss, resetCombo, playMissSound]
  );

  return {
    calculateScore,
    handleWordComplete,
    handleMiss,
    wordStartTimeRef,
  };
}
