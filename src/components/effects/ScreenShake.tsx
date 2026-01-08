/**
 * 画面シェイクエフェクト
 * ミス入力時などに画面を揺らす
 */

import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { SHAKE_CONFIGS } from '@/utils/animations';

type ShakeIntensity = 'light' | 'medium' | 'heavy';

interface ScreenShakeProps {
  /** シェイク発動トリガー（値が変わるとシェイク） */
  trigger: number;
  /** 揺れの強さ */
  intensity?: ShakeIntensity;
  /** 子要素 */
  children: React.ReactNode;
}

export const ScreenShake: React.FC<ScreenShakeProps> = ({
  trigger,
  intensity = 'light',
  children,
}) => {
  const controls = useAnimation();
  const [lastTrigger, setLastTrigger] = useState(trigger);

  useEffect(() => {
    // trigger が変化し、0より大きい場合にシェイク
    if (trigger !== lastTrigger && trigger > 0) {
      const config = SHAKE_CONFIGS[intensity];

      // 連続ミス時に前のアニメーションを停止してから新しいアニメーションを開始
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

  return (
    <motion.div animate={controls}>
      {children}
    </motion.div>
  );
};

export default ScreenShake;
