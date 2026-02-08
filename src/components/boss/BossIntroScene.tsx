/**
 * ボス戦開始前のドラマチックな登場演出コンポーネント
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { BossCharacter } from '@/types/boss';

interface BossIntroSceneProps {
  boss: BossCharacter;
  onComplete: () => void;
}

type Phase =
  | 'blackout'
  | 'spotlight'
  | 'bossAppear'
  | 'nameReveal'
  | 'dialogue'
  | 'fight'
  | 'fadeOut';

export const BossIntroScene: React.FC<BossIntroSceneProps> = ({
  boss,
  onComplete,
}) => {
  const [phase, setPhase] = useState<Phase>('blackout');

  useEffect(() => {
    const timings: Record<Phase, number> = {
      blackout: 500,
      spotlight: 700,
      bossAppear: 600,
      nameReveal: 400,
      dialogue: 600,
      fight: 400,
      fadeOut: 300,
    };

    const phaseSequence: Phase[] = [
      'blackout',
      'spotlight',
      'bossAppear',
      'nameReveal',
      'dialogue',
      'fight',
      'fadeOut',
    ];

    const currentIndex = phaseSequence.indexOf(phase);
    const nextPhase = phaseSequence[currentIndex + 1];

    if (phase === 'fadeOut') {
      const timer = setTimeout(() => {
        onComplete();
      }, timings[phase]);
      return () => clearTimeout(timer);
    }

    if (nextPhase) {
      const timer = setTimeout(() => {
        setPhase(nextPhase);
      }, timings[phase]);
      return () => clearTimeout(timer);
    }
  }, [phase, onComplete]);

  return (
    <div className="fixed inset-0 z-50 bg-black overflow-hidden">
      {/* 黒背景フェードイン */}
      <motion.div
        className="absolute inset-0 bg-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: phase === 'fadeOut' ? 0 : 1 }}
        transition={{ duration: 0.5 }}
      />

      {/* スポットライト */}
      <AnimatePresence>
        {(phase === 'spotlight' || phase === 'bossAppear' || phase === 'nameReveal' || phase === 'dialogue' || phase === 'fight') && (
          <motion.div
            className="absolute inset-0"
            style={{
              background: 'radial-gradient(circle at 50% 50%, transparent 0%, rgba(0,0,0,0.95) 40%)',
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          />
        )}
      </AnimatePresence>

      {/* ボス画像ズームイン */}
      <AnimatePresence>
        {(phase === 'bossAppear' || phase === 'nameReveal' || phase === 'dialogue' || phase === 'fight') && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: [0.5, 1.05, 1], opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          >
            <img
              src={boss.imageUrl}
              alt={boss.name}
              className="w-[500px] h-auto rounded-lg shadow-2xl"
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="256" height="320"%3E%3Crect fill="%23333" width="256" height="320"/%3E%3Ctext x="50%25" y="50%25" dominant-baseline="middle" text-anchor="middle" fill="white" font-size="16"%3E{boss.name}%3C/text%3E%3C/svg%3E';
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ボス名と肩書きスライドイン */}
      <AnimatePresence>
        {(phase === 'nameReveal' || phase === 'dialogue' || phase === 'fight') && (
          <motion.div
            className="absolute top-1/4 left-1/2 transform -translate-x-1/2 text-center"
            initial={{ y: 30, opacity: 0, filter: 'blur(10px)' }}
            animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <h1 className="text-6xl font-title font-bold text-white mb-2">
              {boss.name}
            </h1>
            <p className="text-3xl font-title text-hunter-gold">
              {boss.japaneseTitle}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ボスの登場セリフ */}
      <AnimatePresence>
        {(phase === 'dialogue' || phase === 'fight') && (
          <motion.div
            className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2 w-4/5 max-w-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="bg-black/80 border-2 border-hunter-gold rounded-lg p-6 text-center">
              <p className="text-2xl font-title text-white">
                {boss.introLine}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FIGHT! テキスト */}
      <AnimatePresence>
        {phase === 'fight' && (
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: [0, 2, 1.5], opacity: [1, 1, 0] }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <h1
              className="text-8xl font-title font-bold"
              style={{
                color: '#FFD700',
                textShadow: '0 0 20px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 215, 0, 0.6), 0 0 60px rgba(255, 215, 0, 0.4)',
              }}
            >
              FIGHT!
            </h1>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BossIntroScene;
