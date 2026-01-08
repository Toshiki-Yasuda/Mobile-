/**
 * 画面フラッシュエフェクト
 * 正解時に白/金、ミス時に赤くフラッシュ
 */

import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { FLASH_CONFIGS, getSuccessFlashType, type FlashType } from '@/constants/gameJuice';

interface ScreenFlashProps {
  /** 正解時フラッシュ発動トリガー */
  successTrigger: number;
  /** ミス時フラッシュ発動トリガー */
  missTrigger: number;
  /** 現在のコンボ数 */
  combo: number;
}

interface FlashInstance {
  id: number;
  type: FlashType;
}

export const ScreenFlash: React.FC<ScreenFlashProps> = ({
  successTrigger,
  missTrigger,
  combo,
}) => {
  const [flashes, setFlashes] = useState<FlashInstance[]>([]);
  const lastSuccessTrigger = useRef(successTrigger);
  const lastMissTrigger = useRef(missTrigger);
  const flashIdCounter = useRef(0);

  // 正解時フラッシュ
  useEffect(() => {
    if (successTrigger !== lastSuccessTrigger.current && successTrigger > 0) {
      const flashType = getSuccessFlashType(combo);
      const id = ++flashIdCounter.current;

      setFlashes(prev => [...prev, { id, type: flashType }]);

      // アニメーション完了後に削除
      const duration = FLASH_CONFIGS[flashType].duration * 1000;
      setTimeout(() => {
        setFlashes(prev => prev.filter(f => f.id !== id));
      }, duration);

      lastSuccessTrigger.current = successTrigger;
    }
  }, [successTrigger, combo]);

  // ミス時フラッシュ
  useEffect(() => {
    if (missTrigger !== lastMissTrigger.current && missTrigger > 0) {
      const id = ++flashIdCounter.current;

      setFlashes(prev => [...prev, { id, type: 'miss' }]);

      // アニメーション完了後に削除
      const duration = FLASH_CONFIGS.miss.duration * 1000;
      setTimeout(() => {
        setFlashes(prev => prev.filter(f => f.id !== id));
      }, duration);

      lastMissTrigger.current = missTrigger;
    }
  }, [missTrigger]);

  return (
    <>
      {flashes.map(flash => {
        const config = FLASH_CONFIGS[flash.type];
        return (
          <motion.div
            key={flash.id}
            className="fixed inset-0 pointer-events-none z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 0] }}
            transition={{
              duration: config.duration,
              ease: 'easeOut',
              times: [0, 0.3, 1],
            }}
            style={{ backgroundColor: config.color }}
          />
        );
      })}
    </>
  );
};

export default ScreenFlash;
