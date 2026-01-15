/**
 * ボス戦闘ロジックカスタムフック
 * 単語の正解/誤答処理とダメージ計算を管理
 */

import { useCallback, useEffect, useRef } from 'react';
import { useBossStore } from '@/stores/bossStore';
import {
  calculateBossDamage,
  calculateRecovery,
  calculateComboBonus,
  calculateBossPhase,
} from '@/utils/bossCalculations';
import { ALL_BOSS_DIFFICULTIES } from '@/constants/bossConfigs';
import type { BossBattleState } from '@/types/boss';

interface UseBossBattleReturn {
  handleCorrectAnswer: (wordDifficulty: number) => void;
  handleWrongAnswer: () => void;
  handleRecovery: (amount: number) => void;
  getCurrentPhase: () => number;
  getBattleState: () => BossBattleState | null;
  isBattleActive: () => boolean;
  getElapsedTime: () => number;
}

/**
 * ボス戦闘ロジックを管理するカスタムフック
 */
export const useBossBattle = (chapterId: number): UseBossBattleReturn => {
  const store = useBossStore();
  const battle = store.currentBattle;
  const startTimeRef = useRef<number>(Date.now());
  const lastComboRef = useRef<number>(0);

  // リセット処理
  useEffect(() => {
    startTimeRef.current = Date.now();
    lastComboRef.current = 0;
  }, [battle?.currentBoss.id]);

  /**
   * 正解時の処理
   */
  const handleCorrectAnswer = useCallback(
    (wordDifficulty: number) => {
      if (!battle) return;

      // ダメージ計算
      const damage = calculateBossDamage(wordDifficulty, battle.comboCount, chapterId);

      // コンボボーナス
      const comboBonus = calculateComboBonus(battle.comboCount + 1, chapterId);

      const totalDamage = damage + comboBonus;

      // ボスにダメージ
      store.dealDamageToBoss(totalDamage);

      // コンボ増加
      store.incrementCombo();

      // フェーズチェック
      const newHP = Math.max(0, battle.bossHP - totalDamage);
      const newPhase = calculateBossPhase(newHP, battle.bossMaxHP, 4);
      const oldPhase = calculateBossPhase(battle.bossHP, battle.bossMaxHP, 4);

      if (newPhase !== oldPhase) {
        // フェーズ遷移時の特殊状態
        store.addSpecialState('phase_change');
        setTimeout(() => store.removeSpecialState('phase_change'), 1000);
      }
    },
    [battle, chapterId, store]
  );

  /**
   * 誤答時の処理
   */
  const handleWrongAnswer = useCallback(() => {
    if (!battle) return;

    // コンボリセット
    store.resetCombo();

    // 敵がダメージを返す（小ダメージ）
    const counterDamage = calculateRecovery(5, chapterId);
    store.dealDamageToPlayer(counterDamage);
  }, [battle, chapterId, store]);

  /**
   * プレイヤーの回復処理
   */
  const handleRecovery = useCallback(
    (baseAmount: number) => {
      if (!battle) return;

      const actualRecovery = calculateRecovery(baseAmount, chapterId);
      const newHP = Math.min(battle.playerMaxHP, battle.playerHP + actualRecovery);
      const actualHealed = newHP - battle.playerHP;

      store.updateBattleState({ playerHP: newHP });
    },
    [battle, chapterId, store]
  );

  /**
   * 現在のフェーズを取得
   */
  const getCurrentPhase = useCallback((): number => {
    if (!battle) return 1;
    return calculateBossPhase(battle.bossHP, battle.bossMaxHP, 4);
  }, [battle]);

  /**
   * 戦闘状態を取得
   */
  const getBattleState = useCallback((): BossBattleState | null => {
    return store.currentBattle;
  }, [store.currentBattle]);

  /**
   * 戦闘がアクティブか確認
   */
  const isBattleActive = useCallback((): boolean => {
    if (!battle) return false;
    return battle.playerHP > 0 && !battle.isDefeated;
  }, [battle]);

  /**
   * 経過時間を取得（秒）
   */
  const getElapsedTime = useCallback((): number => {
    return Math.round((Date.now() - startTimeRef.current) / 1000);
  }, []);

  return {
    handleCorrectAnswer,
    handleWrongAnswer,
    handleRecovery,
    getCurrentPhase,
    getBattleState,
    isBattleActive,
    getElapsedTime,
  };
};
