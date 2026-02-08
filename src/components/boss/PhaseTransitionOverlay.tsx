/**
 * HP25%境界通過時の全画面フェーズ遷移演出
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { BossCharacter } from '@/types/boss';

interface PhaseTransitionOverlayProps {
  phase: number;
  boss: BossCharacter;
  onComplete: () => void;
}

type TransitionPhase =
  | 'darken'
  | 'bossZoom'
  | 'phaseText'
  | 'message'
  | 'shockwave'
  | 'fadeOut';

export const PhaseTransitionOverlay: React.FC<PhaseTransitionOverlayProps> = ({
  phase,
  boss,
  onComplete,
}) => {
  const [transitionPhase, setTransitionPhase] = useState<TransitionPhase>('darken');

  // フェーズに応じた色テーマ
  const getColorTheme = () => {
    switch (phase) {
      case 2:
        return {
          gradient: 'from-purple-600 to-purple-800',
          border: 'border-purple-500',
          glow: 'rgba(147, 51, 234, 0.8)',
        };
      case 3:
        return {
          gradient: 'from-red-600 to-red-800',
          border: 'border-red-500',
          glow: 'rgba(220, 38, 38, 0.8)',
        };
      case 4:
        return {
          gradient: 'from-yellow-500 to-amber-600',
          border: 'border-yellow-400',
          glow: 'rgba(251, 191, 36, 0.8)',
        };
      default:
        return {
          gradient: 'from-purple-600 to-purple-800',
          border: 'border-purple-500',
          glow: 'rgba(147, 51, 234, 0.8)',
        };
    }
  };

  const colorTheme = getColorTheme();

  useEffect(() => {
    const timings: Record<TransitionPhase, number> = {
      darken: 300,
      bossZoom: 500,
      phaseText: 400,
      message: 600,
      shockwave: 400,
      fadeOut: 300,
    };

    const phaseSequence: TransitionPhase[] = [
      'darken',
      'bossZoom',
      'phaseText',
      'message',
      'shockwave',
      'fadeOut',
    ];

    const currentIndex = phaseSequence.indexOf(transitionPhase);
    const nextPhase = phaseSequence[currentIndex + 1];

    if (transitionPhase === 'fadeOut') {
      const timer = setTimeout(() => {
        onComplete();
      }, timings[transitionPhase]);
      return () => clearTimeout(timer);
    }

    if (nextPhase) {
      const timer = setTimeout(() => {
        setTransitionPhase(nextPhase);
      }, timings[transitionPhase]);
      return () => clearTimeout(timer);
    }
  }, [transitionPhase, onComplete]);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden pointer-events-none">
      {/* 画面暗転 */}
      <motion.div
        className="absolute inset-0 bg-black"
        initial={{ opacity: 0 }}
        animate={{
          opacity: transitionPhase === 'fadeOut' ? 0 : 0.8,
        }}
        transition={{ duration: 0.3 }}
      />

      {/* ボス画像ズーム */}
      <AnimatePresence>
        {(transitionPhase === 'bossZoom' || transitionPhase === 'phaseText' || transitionPhase === 'message' || transitionPhase === 'shockwave') && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ scale: 0.8, opacity: 0, filter: 'brightness(1)' }}
            animate={{
              scale: 1,
              opacity: 1,
              filter: 'brightness(1.3)',
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
          >
            <img
              src={boss.imageUrl}
              alt={boss.name}
              className="w-64 h-auto rounded-lg shadow-2xl"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="256" height="320"%3E%3Crect fill="%23333" width="256" height="320"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="16"%3E{boss.name}%3C/text%3E%3C/svg%3E';
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* PHASE テキスト */}
      <AnimatePresence>
        {(transitionPhase === 'phaseText' || transitionPhase === 'message' || transitionPhase === 'shockwave') && (
          <motion.div
            className="absolute top-1/4 left-1/2 transform -translate-x-1/2"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: [0, 1.5, 1.2], opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <div
              className={`bg-gradient-to-r ${colorTheme.gradient} border-4 ${colorTheme.border} rounded-lg px-12 py-6`}
              style={{
                boxShadow: `0 0 30px ${colorTheme.glow}`,
              }}
            >
              <h1 className="text-6xl font-title font-bold text-white">
                PHASE {phase}
              </h1>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* フェーズメッセージ */}
      <AnimatePresence>
        {(transitionPhase === 'message' || transitionPhase === 'shockwave') && (
          <motion.div
            className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2 w-4/5 max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className={`bg-black/90 border-2 ${colorTheme.border} rounded-lg p-6 text-center`}>
              <p className="text-2xl font-title text-white">
                {boss.phaseMessages[phase - 2]}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 衝撃波リップル */}
      <AnimatePresence>
        {transitionPhase === 'shockwave' && (
          <div className="absolute inset-0 flex items-center justify-center">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className={`absolute border-2 ${colorTheme.border} rounded-full`}
                initial={{ width: 0, height: 0, opacity: 1 }}
                animate={{
                  width: 800,
                  height: 800,
                  opacity: 0,
                }}
                transition={{
                  duration: 0.4,
                  delay: i * 0.15,
                  ease: 'easeOut',
                }}
              />
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PhaseTransitionOverlay;
