/**
 * 画面シェイクエフェクト
 * ミス入力時・正解時に画面を揺らす
 */

import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { SHAKE_CONFIGS } from '@/utils/animations';
import { SUCCESS_SHAKE_CONFIGS, getSuccessShakeIntensity } from '@/constants/gameJuice';

type ShakeIntensity = 'light' | 'medium' | 'heavy';

interface ScreenShakeProps {
  /** ミス時シェイク発動トリガー（値が変わるとシェイク） */
  trigger: number;
  /** ミス時の揺れの強さ */
  intensity?: ShakeIntensity;
  /** 正解時シェイク発動トリガー（値が変わるとシェイク） */
  successTrigger?: number;
  /** 現在のコンボ数（正解シェイク強度に使用） */
  combo?: number;
  /** 子要素 */
  children: React.ReactNode;
}

export const ScreenShake: React.FC<ScreenShakeProps> = ({
  trigger,
  intensity = 'light',
  successTrigger = 0,
  combo = 0,
  children,
}) => {
  const controls = useAnimation();
  const [lastTrigger, setLastTrigger] = useState(trigger);
  const [lastSuccessTrigger, setLastSuccessTrigger] = useState(successTrigger);

  // ミス時シェイク
  useEffect(() => {
    if (trigger !== lastTrigger && trigger > 0) {
      const config = SHAKE_CONFIGS[intensity];

      controls.stop();
      controls.start({
        x: config.x,
        transition: {
          duration: config.duration,
          ease: 'easeInOut'
        },
      });

      setLastTrigger(trigger);
    }
  }, [trigger, lastTrigger, intensity, controls]);

  // 正解時シェイク
  useEffect(() => {
    if (successTrigger !== lastSuccessTrigger && successTrigger > 0) {
      const shakeIntensity = getSuccessShakeIntensity(combo);
      const config = SUCCESS_SHAKE_CONFIGS[shakeIntensity];

      controls.stop();
      controls.start({
        x: [...config.x],
        transition: {
          duration: config.duration,
          ease: 'easeOut'
        },
      });

      setLastSuccessTrigger(successTrigger);
    }
  }, [successTrigger, lastSuccessTrigger, combo, controls]);

  return (
    <motion.div animate={controls}>
      {children}
    </motion.div>
  );
};

export default ScreenShake;
