/**
 * 画面フラッシュエフェクト
 * 正解時に白/金、ミス時に赤くフラッシュ
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FLASH_CONFIGS, getSuccessFlashType } from '@/constants/gameJuice';

interface ScreenFlashProps {
  /** 正解時フラッシュ発動トリガー */
  successTrigger: number;
  /** ミス時フラッシュ発動トリガー */
  missTrigger: number;
  /** 現在のコンボ数 */
  combo: number;
}

type FlashState = 'none' | 'success' | 'successCombo' | 'miss';

export const ScreenFlash: React.FC<ScreenFlashProps> = ({
  successTrigger,
  missTrigger,
  combo,
}) => {
  const [flashState, setFlashState] = useState<FlashState>('none');
  const [lastSuccessTrigger, setLastSuccessTrigger] = useState(successTrigger);
  const [lastMissTrigger, setLastMissTrigger] = useState(missTrigger);

  // 正解時フラッシュ
  useEffect(() => {
    if (successTrigger !== lastSuccessTrigger && successTrigger > 0) {
      const flashType = getSuccessFlashType(combo);
      setFlashState(flashType);

      const duration = FLASH_CONFIGS[flashType].duration * 1000;
      const timer = setTimeout(() => setFlashState('none'), duration);

      setLastSuccessTrigger(successTrigger);
      return () => clearTimeout(timer);
    }
  }, [successTrigger, lastSuccessTrigger, combo]);

  // ミス時フラッシュ
  useEffect(() => {
    if (missTrigger !== lastMissTrigger && missTrigger > 0) {
      setFlashState('miss');

      const duration = FLASH_CONFIGS.miss.duration * 1000;
      const timer = setTimeout(() => setFlashState('none'), duration);

      setLastMissTrigger(missTrigger);
      return () => clearTimeout(timer);
    }
  }, [missTrigger, lastMissTrigger]);

  const getFlashConfig = () => {
    if (flashState === 'none') return null;
    return FLASH_CONFIGS[flashState];
  };

  const config = getFlashConfig();

  return (
    <AnimatePresence>
      {flashState !== 'none' && config && (
        <motion.div
          key={flashState}
          className="fixed inset-0 pointer-events-none z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: config.duration / 2,
            ease: 'easeOut',
          }}
          style={{ backgroundColor: config.color }}
        />
      )}
    </AnimatePresence>
  );
};

export default ScreenFlash;
