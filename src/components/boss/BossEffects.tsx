/**
 * ボスエフェクト管理コンポーネント
 * ダメージ表示、クリティカル、攻撃エフェクト
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BossEffectsProps {
  damageAmount?: number;
  showDamage: boolean;
  effectType: 'damage' | 'heal' | 'critical' | 'attack' | 'combo' | 'none';
  onEffectComplete?: () => void;
}

export const BossEffects: React.FC<BossEffectsProps> = ({
  damageAmount,
  showDamage,
  effectType,
  onEffectComplete,
}) => {
  const shouldRender = showDamage && effectType !== 'none';

  return (
    <AnimatePresence>
      {shouldRender && (
        <>
          {/* ダメージ表示 */}
          {effectType === 'damage' && damageAmount && (
            <motion.div
              key="damage"
              className="fixed top-1/3 left-1/2 -translate-x-1/2 text-5xl font-bold text-red-500 pointer-events-none drop-shadow-lg"
              initial={{ opacity: 1, y: 0, scale: 1 }}
              animate={{ opacity: 0, y: -100, scale: 0.8 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              onAnimationComplete={onEffectComplete}
            >
              -{damageAmount}
            </motion.div>
          )}

          {/* 回復表示 */}
          {effectType === 'heal' && damageAmount && (
            <motion.div
              key="heal"
              className="fixed top-1/3 left-1/2 -translate-x-1/2 text-5xl font-bold text-green-400 pointer-events-none drop-shadow-lg"
              initial={{ opacity: 1, y: 0, scale: 1 }}
              animate={{ opacity: 0, y: -100, scale: 0.8 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
              onAnimationComplete={onEffectComplete}
            >
              +{damageAmount}
            </motion.div>
          )}

          {/* クリティカルエフェクト */}
          {effectType === 'critical' && (
            <motion.div
              key="critical"
              className="fixed inset-0 pointer-events-none overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onAnimationComplete={onEffectComplete}
            >
              {/* フラッシュ */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-b from-yellow-400 via-orange-400 to-red-400"
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.6, 0] }}
                transition={{ duration: 0.6, ease: 'easeInOut', times: [0, 0.5, 1] }}
              />

              {/* クリティカルテキスト */}
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: [1, 1.2, 1], opacity: [0, 1, 0] }}
                transition={{ duration: 0.8, ease: 'easeInOut', times: [0, 0.3, 1] }}
              >
                <p className="text-6xl font-title font-bold text-white drop-shadow-2xl text-center">
                  CRITICAL
                </p>
              </motion.div>
            </motion.div>
          )}

          {/* 敵攻撃エフェクト */}
          {effectType === 'attack' && (
            <motion.div
              key="attack"
              className="fixed inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.8, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.2, ease: 'easeInOut', times: [0, 0.4, 1] }}
              onAnimationComplete={onEffectComplete}
            >
              <div className="absolute inset-0 bg-gradient-to-b from-red-600 via-red-500 to-transparent" />
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: [0.5, 1.5, 0.5], opacity: [0, 1, 0] }}
                transition={{ duration: 1.2, ease: 'easeInOut', times: [0, 0.4, 1] }}
              >
                <p className="text-5xl font-title font-bold text-white drop-shadow-2xl">
                  攻撃！
                </p>
              </motion.div>
            </motion.div>
          )}

          {/* コンボエフェクト */}
          {effectType === 'combo' && (
            <motion.div
              key="combo"
              className="fixed bottom-1/4 left-1/2 -translate-x-1/2 pointer-events-none"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: [0, 1, 0], scale: [0, 1.2, 0.8] }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ duration: 1.5, ease: 'easeOut', times: [0, 0.3, 1] }}
              onAnimationComplete={onEffectComplete}
            >
              <p className="text-4xl font-title font-bold text-yellow-400 drop-shadow-2xl">
                COMBO！
              </p>
            </motion.div>
          )}

          {/* 画面全体シェイク用 */}
          {(effectType === 'attack' || effectType === 'critical') && (
            <motion.div
              key="shake"
              className="fixed inset-0 pointer-events-none"
              initial={{ x: 0, y: 0 }}
              animate={{ x: [0, -10, 10, -10, 0], y: [0, -5, 5, -5, 0] }}
              transition={{
                duration: 0.4,
                ease: 'easeInOut',
                times: [0, 0.25, 0.5, 0.75, 1]
              }}
            />
          )}
        </>
      )}
    </AnimatePresence>
  );
};

export default BossEffects;
