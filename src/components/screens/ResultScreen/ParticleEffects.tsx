/**
 * パーティクルエフェクトコンポーネント
 * S ランク演出、新記録演出、バナー
 */

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * S ランク用ゴールドパーティクル
 */
export const GoldParticles: React.FC = () => {
  const particles = useMemo(
    () =>
      Array.from({ length: 15 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        top: Math.random() * 100,
        duration: 2 + Math.random() * 2,
        delay: Math.random() * 2,
      })),
    []
  );

  return (
    <div className="absolute inset-0 pointer-events-none">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute w-1 h-1 bg-hunter-gold"
          style={{ left: `${p.left}%`, top: `${p.top}%` }}
          animate={{ y: [0, -80], opacity: [0, 1, 0], scale: [0, 1, 0] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay }}
        />
      ))}
    </div>
  );
};

/**
 * 新記録時の豪華パーティクル
 */
export const NewRecordParticles: React.FC = () => {
  const particles = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        yOffset: -200 - Math.random() * 300,
        xOffset: (Math.random() - 0.5) * 200,
        duration: 2 + Math.random(),
        delay: Math.random() * 0.5,
        rotation: 360 * (Math.random() > 0.5 ? 1 : -1),
        color: ['#D4AF37', '#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4'][Math.floor(Math.random() * 5)],
        shape: i % 3,
      })),
    []
  );

  const getClipPath = (shape: number) => {
    if (shape === 0) return 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)';
    if (shape === 1)
      return 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)';
    return 'circle(50%)';
  };

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{ left: `${p.left}%`, top: '50%' }}
          initial={{ y: 0, opacity: 1, scale: 1 }}
          animate={{
            y: [0, p.yOffset],
            x: [p.xOffset],
            opacity: [1, 1, 0],
            scale: [1, 0.5],
            rotate: [0, p.rotation],
          }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay }}
        >
          <div className="w-3 h-3" style={{ background: p.color, clipPath: getClipPath(p.shape) }} />
        </motion.div>
      ))}
    </div>
  );
};

/**
 * 新記録バナー
 */
export const NewRecordBanner: React.FC = () => (
  <motion.div
    initial={{ y: -100, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    exit={{ y: -100, opacity: 0 }}
    transition={{ type: 'spring', bounce: 0.5 }}
    className="absolute top-4 left-0 right-0 z-50 flex justify-center"
  >
    <motion.div
      animate={{
        scale: [1, 1.05, 1],
        boxShadow: [
          '0 0 20px rgba(212, 175, 55, 0.5)',
          '0 0 40px rgba(212, 175, 55, 0.8)',
          '0 0 20px rgba(212, 175, 55, 0.5)',
        ],
      }}
      transition={{ duration: 1.5, repeat: Infinity }}
      className="bg-gradient-to-r from-hunter-gold via-yellow-400 to-hunter-gold px-8 py-3 rounded-lg"
    >
      <span className="font-title text-2xl md:text-3xl font-bold text-hunter-dark tracking-wider">
        NEW RECORD!
      </span>
    </motion.div>
  </motion.div>
);

export { AnimatePresence };
