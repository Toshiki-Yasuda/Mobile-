/**
 * タイピングアニメーション効果フック
 * エフェクトトリガーと演出管理
 */

import { useState, useCallback } from 'react';

export function useTypingAnimation() {
  // 爆発エフェクト用のトリガー（タイムスタンプ）
  const [explosionTrigger, setExplosionTrigger] = useState(0);

  // 正解時シェイク用のトリガー（タイムスタンプ）
  const [successShakeTrigger, setSuccessShakeTrigger] = useState(0);

  // 直前の爆発がパーフェクトだったか
  const [lastExplosionWasPerfect, setLastExplosionWasPerfect] = useState(false);

  // 爆発エフェクトをトリガー
  const triggerExplosion = useCallback((isPerfect: boolean = false) => {
    setExplosionTrigger(Date.now());
    setLastExplosionWasPerfect(isPerfect);
  }, []);

  // シェイクエフェクトをトリガー
  const triggerSuccessShake = useCallback(() => {
    setSuccessShakeTrigger(Date.now());
  }, []);

  return {
    explosionTrigger,
    successShakeTrigger,
    lastExplosionWasPerfect,
    triggerExplosion,
    triggerSuccessShake,
  };
}
