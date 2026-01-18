/**
 * ボスキャラクター表示コンポーネント
 * ボスの立ち絵とアニメーション
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { BossCharacter } from '@/types/boss';

interface BossCharacterProps {
  boss: BossCharacter;
  isAttacking: boolean;
  isDamaged: boolean;
  isCritical?: boolean;
  phase?: number;
  scale?: number;
}

export const BossCharacter: React.FC<BossCharacterProps> = ({
  boss,
  isAttacking,
  isDamaged,
  isCritical = false,
  phase = 1,
  scale = 1,
}) => {
  const attackVariants = useMemo(
    () => ({
      idle: {
        x: 0,
        y: 0,
        filter: 'brightness(1)',
        transition: { duration: 0.3, ease: 'easeInOut' },
      },
      attacking: {
        x: [0, -20, 0],
        y: [0, -10, 0],
        transition: { duration: 0.5, ease: 'easeInOut' },
      },
      damaged: {
        x: [-15, 15, -15, 15, 0],
        transition: { duration: 0.4, ease: 'easeInOut' },
      },
      critical: {
        // クリティカル時: 明るくなって揺れる
        filter: ['brightness(1.2)', 'brightness(1.4)', 'brightness(1.2)', 'brightness(1)'],
        x: [-25, 25, -25, 0],
        y: [0, -15, 0],
        transition: { duration: 0.6, ease: 'easeInOut' },
      },
    }),
    []
  );

  const getAnimationState = () => {
    if (isCritical) return 'critical';
    if (isDamaged) return 'damaged';
    if (isAttacking) return 'attacking';
    return 'idle';
  };

  return (
    <motion.div
      className="relative w-64 h-[320px] lg:w-80 lg:h-[400px] flex items-center justify-center"
      variants={attackVariants}
      animate={getAnimationState()}
      style={{ scale }}
    >
      {/* ボスキャラクター画像 */}
      <motion.div
        className="relative w-full h-full"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <img
          src={boss.imageUrl}
          alt={boss.name}
          className="w-full h-full object-cover rounded-lg shadow-2xl border-4 border-hunter-gold"
          onError={(e) => {
            // フォールバック画像
            (e.target as HTMLImageElement).src =
              'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="256" height="320"%3E%3Crect fill="%23333" width="256" height="320"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="16"%3E{boss.name}%3C/text%3E%3C/svg%3E';
          }}
        />

        {/* フェーズ表示（マルチフェーズボス） */}
        {phase > 1 && (
          <motion.div
            className="absolute top-4 right-4 bg-gradient-to-r from-red-600 to-red-700 text-white px-4 py-2 rounded-full font-title font-bold shadow-lg"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            Phase {phase}
          </motion.div>
        )}

        {/* クリティカルエフェクト（最優先） */}
        {isCritical && (
          <>
            <motion.div
              className="absolute inset-0 bg-gradient-to-b from-yellow-300 via-red-500 to-transparent rounded-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.8, 0.6, 0] }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
            <motion.div
              className="absolute inset-0 border-4 border-yellow-300 rounded-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0.5, 0] }}
              transition={{ duration: 0.6, ease: 'easeOut' }}
            />
          </>
        )}

        {/* ダメージエフェクト */}
        {isDamaged && !isCritical && (
          <motion.div
            className="absolute inset-0 bg-red-600 rounded-lg"
            initial={{ opacity: 0.5 }}
            animate={{ opacity: [0.5, 0.2, 0] }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
          />
        )}

        {/* 攻撃エフェクト （ダメージやクリティカルが優先） */}
        {isAttacking && !isDamaged && !isCritical && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-yellow-400 to-transparent rounded-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0] }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          />
        )}
      </motion.div>

    </motion.div>
  );
};

export default BossCharacter;
