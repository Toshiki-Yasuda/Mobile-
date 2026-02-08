/**
 * バトル決着演出コンポーネント
 * ボス撃破/敗北時の全画面演出
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { BossCharacter } from '@/types/boss';

interface BattleFinishOverlayProps {
  isVictory: boolean;
  boss: BossCharacter;
  onComplete: () => void;
}

type VictoryPhase = 'slowdown' | 'explosion' | 'whiteout' | 'victory' | 'celebration';
type DefeatPhase = 'redPulse' | 'blackout' | 'gameOver' | 'fadeOut';

export const BattleFinishOverlay: React.FC<BattleFinishOverlayProps> = ({
  isVictory,
  boss,
  onComplete,
}) => {
  const [victoryPhase, setVictoryPhase] = useState<VictoryPhase>('slowdown');
  const [defeatPhase, setDefeatPhase] = useState<DefeatPhase>('redPulse');

  // 勝利パーティクルの生成（爆散パーティクル）
  const explosionParticles = useMemo(() => {
    return Array.from({ length: 30 }, (_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const distance = 200 + Math.random() * 300;
      const size = 4 + Math.random() * 12;
      const colors = ['#ffffff', '#fbbf24', '#facc15'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const rotation = Math.random() * 720 - 360;
      const delay = Math.random() * 0.2;

      return {
        id: i,
        angle,
        distance,
        size,
        color,
        rotation,
        delay,
      };
    });
  }, []);

  // 祝福の星パーティクル
  const starParticles = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => {
      const x = Math.random() * 100 - 50;
      const size = 8 + Math.random() * 8;
      const delay = Math.random() * 0.3;
      const rotation = Math.random() * 360;

      return { id: i, x, size, delay, rotation };
    });
  }, []);

  // 勝利演出シーケンス
  useEffect(() => {
    if (!isVictory) return;

    const timeline = [
      { phase: 'slowdown' as VictoryPhase, delay: 500 },
      { phase: 'explosion' as VictoryPhase, delay: 700 },
      { phase: 'whiteout' as VictoryPhase, delay: 600 },
      { phase: 'victory' as VictoryPhase, delay: 600 },
      { phase: 'celebration' as VictoryPhase, delay: 600 },
    ];

    let currentTimeout: NodeJS.Timeout;
    let totalDelay = 0;

    timeline.forEach(({ phase, delay }) => {
      totalDelay += delay;
      currentTimeout = setTimeout(() => {
        setVictoryPhase(phase);
        if (phase === 'celebration') {
          setTimeout(onComplete, 600);
        }
      }, totalDelay);
    });

    return () => clearTimeout(currentTimeout);
  }, [isVictory, onComplete]);

  // 敗北演出シーケンス
  useEffect(() => {
    if (isVictory) return;

    const timeline = [
      { phase: 'redPulse' as DefeatPhase, delay: 600 },
      { phase: 'blackout' as DefeatPhase, delay: 600 },
      { phase: 'gameOver' as DefeatPhase, delay: 800 },
      { phase: 'fadeOut' as DefeatPhase, delay: 500 },
    ];

    let currentTimeout: NodeJS.Timeout;
    let totalDelay = 0;

    timeline.forEach(({ phase, delay }) => {
      totalDelay += delay;
      currentTimeout = setTimeout(() => {
        setDefeatPhase(phase);
        if (phase === 'fadeOut') {
          setTimeout(onComplete, 500);
        }
      }, totalDelay);
    });

    return () => clearTimeout(currentTimeout);
  }, [isVictory, onComplete]);

  if (isVictory) {
    return (
      <div className="fixed inset-0 z-50 pointer-events-none">
        {/* Slowdown: 白みがかる */}
        {victoryPhase === 'slowdown' && (
          <motion.div
            className="absolute inset-0 bg-white/10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
        )}

        {/* Explosion: 爆散パーティクル */}
        {victoryPhase === 'explosion' && (
          <div className="absolute inset-0">
            {explosionParticles.map((particle) => (
              <motion.div
                key={particle.id}
                className="absolute top-1/2 left-1/2"
                style={{
                  width: particle.size,
                  height: particle.size,
                  backgroundColor: particle.color,
                  borderRadius: '50%',
                }}
                initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
                animate={{
                  x: Math.cos(particle.angle) * particle.distance,
                  y: Math.sin(particle.angle) * particle.distance,
                  opacity: 0,
                  rotate: particle.rotation,
                }}
                transition={{
                  duration: 0.7,
                  ease: 'easeOut',
                  delay: particle.delay,
                }}
              />
            ))}
          </div>
        )}

        {/* Whiteout: ホワイトアウト */}
        {victoryPhase === 'whiteout' && (
          <motion.div
            className="absolute inset-0 bg-white"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.8, 0] }}
            transition={{
              duration: 0.6,
              ease: 'easeInOut',
              times: [0, 0.5, 1],
            }}
          />
        )}

        {/* Victory: 勝利テキスト */}
        {victoryPhase === 'victory' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-6">
            <motion.div
              className="text-7xl font-title font-bold"
              style={{
                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 40px rgba(234,179,8,0.8)',
              }}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.8, 1.5], opacity: 1 }}
              transition={{
                duration: 0.6,
                ease: 'easeOut',
                times: [0, 0.6, 1],
              }}
            >
              VICTORY!
            </motion.div>
            <motion.p
              className="text-xl text-white/80 text-center px-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              {boss.defeatLine}
            </motion.p>
          </div>
        )}

        {/* Celebration: 星パーティクル */}
        {victoryPhase === 'celebration' && (
          <div className="absolute inset-0">
            {starParticles.map((star) => (
              <motion.div
                key={star.id}
                className="absolute bottom-0 left-1/2"
                style={{
                  width: star.size,
                  height: star.size,
                }}
                initial={{
                  x: star.x,
                  y: 0,
                  opacity: 0,
                  rotate: 0,
                }}
                animate={{
                  x: star.x,
                  y: -600,
                  opacity: [0, 1, 0],
                  rotate: star.rotation,
                }}
                transition={{
                  duration: 1.5,
                  ease: 'easeOut',
                  delay: star.delay,
                }}
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="text-yellow-400">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // 敗北演出
  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      {/* Red Pulse: 赤く脈動 */}
      {defeatPhase === 'redPulse' && (
        <motion.div
          className="absolute inset-0 bg-red-900"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0.3, 0.6, 0.2] }}
          transition={{
            duration: 0.6,
            ease: 'easeInOut',
            times: [0, 0.25, 0.5, 0.75, 1],
          }}
        />
      )}

      {/* Blackout: 暗転 */}
      {(defeatPhase === 'blackout' || defeatPhase === 'gameOver' || defeatPhase === 'fadeOut') && (
        <motion.div
          className="absolute inset-0 bg-black"
          initial={{ opacity: 0 }}
          animate={{
            opacity: defeatPhase === 'fadeOut' ? 0 : 1,
          }}
          transition={{
            duration: defeatPhase === 'blackout' ? 0.6 : 0.5,
            ease: 'easeInOut',
          }}
        />
      )}

      {/* Game Over: テキスト */}
      {defeatPhase === 'gameOver' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="flex gap-4"
            initial="hidden"
            animate="visible"
            variants={{
              visible: {
                transition: {
                  staggerChildren: 0.08,
                },
              },
            }}
          >
            {['G', 'A', 'M', 'E', ' ', 'O', 'V', 'E', 'R'].map((char, i) => (
              <motion.span
                key={i}
                className="text-7xl font-title font-bold text-red-600"
                style={{
                  textShadow: '0 0 30px rgba(220,38,38,0.6)',
                }}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: { opacity: 1, y: 0 },
                }}
                transition={{
                  duration: 0.4,
                  ease: 'easeOut',
                }}
              >
                {char === ' ' ? '\u00A0' : char}
              </motion.span>
            ))}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default BattleFinishOverlay;
