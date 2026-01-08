/**
 * カード破壊演出コンポーネント
 * コンボ数に応じて破壊演出が変化
 * - shatter: ガラス割れ（コンボ1-9）
 * - slice: 斬撃（コンボ10-19）
 * - explode: 吹き飛び（コンボ20+）
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { DESTRUCTION_CONFIGS, DestructionType } from '@/constants/gameJuice';

interface CardDestructionProps {
  type: DestructionType;
  isActive: boolean;
}

// ガラス割れ演出
const ShatterEffect: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const config = DESTRUCTION_CONFIGS.shatter;

  const fragments = useMemo(() => {
    return Array.from({ length: config.fragments }, (_, i) => {
      const angle = (i / config.fragments) * Math.PI * 2;
      const distance = config.spread * (0.5 + Math.random() * 0.5);
      return {
        id: i,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        rotation: (Math.random() - 0.5) * config.rotation,
        scale: 0.3 + Math.random() * 0.4,
        delay: Math.random() * 0.1,
      };
    });
  }, []);

  if (!isActive) return null;

  return (
    <>
      {fragments.map((frag) => (
        <motion.div
          key={frag.id}
          className="absolute top-1/2 left-1/2 w-8 h-8 bg-gradient-to-br from-hunter-gold/60 to-hunter-gold/20 rounded"
          style={{
            clipPath: 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)',
          }}
          initial={{
            x: '-50%',
            y: '-50%',
            scale: frag.scale,
            rotate: 0,
            opacity: 1,
          }}
          animate={{
            x: frag.x,
            y: frag.y,
            scale: 0,
            rotate: frag.rotation,
            opacity: 0,
          }}
          transition={{
            duration: config.duration,
            delay: frag.delay,
            ease: 'easeOut',
          }}
        />
      ))}
      {/* 中央の光 */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full"
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: 20, opacity: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{ filter: 'blur(10px)' }}
      />
    </>
  );
};

// 斬撃演出
const SliceEffect: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const config = DESTRUCTION_CONFIGS.slice;

  if (!isActive) return null;

  return (
    <>
      {/* 斬撃ライン */}
      <motion.div
        className="absolute top-1/2 left-1/2 w-[200%] h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
        style={{
          transformOrigin: 'center center',
        }}
        initial={{
          x: '-50%',
          y: '-50%',
          rotate: -config.angle,
          scaleX: 0,
          opacity: 0,
        }}
        animate={{
          scaleX: [0, 1.5, 1.5],
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: config.duration,
          ease: 'easeOut',
        }}
      />
      {/* 上半分 */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-1/2 overflow-hidden"
        initial={{ y: 0, opacity: 1 }}
        animate={{ y: -config.gap, opacity: 0 }}
        transition={{ duration: config.duration, delay: 0.1, ease: 'easeOut' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-hunter-gold/30 to-transparent" />
      </motion.div>
      {/* 下半分 */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-1/2 overflow-hidden"
        initial={{ y: 0, opacity: 1 }}
        animate={{ y: config.gap, opacity: 0 }}
        transition={{ duration: config.duration, delay: 0.1, ease: 'easeOut' }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-hunter-gold/30 to-transparent" />
      </motion.div>
      {/* 電撃スパーク */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute top-1/2 left-1/2 w-1 h-1 bg-cyan-300 rounded-full"
          initial={{
            x: '-50%',
            y: '-50%',
            scale: 1,
            opacity: 1,
          }}
          animate={{
            x: (Math.random() - 0.5) * 100,
            y: (Math.random() - 0.5) * 60,
            scale: 0,
            opacity: 0,
          }}
          transition={{
            duration: 0.3,
            delay: i * 0.02,
            ease: 'easeOut',
          }}
          style={{ boxShadow: '0 0 8px 2px rgba(34, 211, 238, 0.8)' }}
        />
      ))}
    </>
  );
};

// 吹き飛び演出
const ExplodeEffect: React.FC<{ isActive: boolean }> = ({ isActive }) => {
  const config = DESTRUCTION_CONFIGS.explode;

  const particles = useMemo(() => {
    return Array.from({ length: config.particles }, (_, i) => {
      const angle = (i / config.particles) * Math.PI * 2;
      const distance = config.spread * (0.6 + Math.random() * 0.4);
      return {
        id: i,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        size: 4 + Math.random() * 8,
        delay: Math.random() * 0.1,
      };
    });
  }, []);

  if (!isActive) return null;

  return (
    <>
      {/* 中央の爆発光 */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-orange-500 rounded-full"
        initial={{ scale: 0, opacity: 1 }}
        animate={{ scale: [0, 15, 20], opacity: [1, 0.8, 0] }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        style={{ filter: 'blur(20px)' }}
      />
      {/* パーティクル */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute top-1/2 left-1/2 bg-gradient-to-br from-orange-400 to-red-500 rounded-full"
          style={{
            width: p.size,
            height: p.size,
          }}
          initial={{
            x: '-50%',
            y: '-50%',
            scale: 1,
            opacity: 1,
          }}
          animate={{
            x: p.x,
            y: p.y,
            scale: 0,
            opacity: 0,
          }}
          transition={{
            duration: config.duration,
            delay: p.delay,
            ease: 'easeOut',
          }}
        />
      ))}
      {/* 衝撃波 */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-orange-400 rounded-full"
        initial={{ width: 0, height: 0, opacity: 1 }}
        animate={{
          width: [0, 250, 350],
          height: [0, 250, 350],
          opacity: [1, 0.6, 0],
        }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      />
      {/* 二重衝撃波 */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border border-red-400/50 rounded-full"
        initial={{ width: 0, height: 0, opacity: 1 }}
        animate={{
          width: [0, 200, 280],
          height: [0, 200, 280],
          opacity: [1, 0.4, 0],
        }}
        transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
      />
    </>
  );
};

export const CardDestruction: React.FC<CardDestructionProps> = ({
  type,
  isActive,
}) => {
  return (
    <div className="absolute inset-0 pointer-events-none z-20 overflow-visible">
      {type === 'shatter' && <ShatterEffect isActive={isActive} />}
      {type === 'slice' && <SliceEffect isActive={isActive} />}
      {type === 'explode' && <ExplodeEffect isActive={isActive} />}
    </div>
  );
};

export default CardDestruction;
