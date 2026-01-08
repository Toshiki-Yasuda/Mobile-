/**
 * コンボ表示＆エフェクト
 * - 数字のパルスアニメーション
 * - マイルストーン達成時のバースト
 * - 念レベル表示
 */

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  comboCounterVariants,
  comboMilestoneVariants
} from '@/utils/animations';

// 念レベル定義
const NEN_LEVELS = [
  { threshold: 50, name: '発', color: 'text-red-500', glow: 'shadow-red-500/50' },
  { threshold: 20, name: '練', color: 'text-orange-400', glow: 'shadow-orange-400/50' },
  { threshold: 10, name: '絶', color: 'text-purple-400', glow: 'shadow-purple-400/50' },
  { threshold: 5, name: '纏', color: 'text-blue-400', glow: 'shadow-blue-400/50' },
  { threshold: 0, name: '念', color: 'text-hunter-gold', glow: 'shadow-hunter-gold/50' },
];

// マイルストーン
const MILESTONES = [5, 10, 20, 50, 100];

interface ComboEffectProps {
  combo: number;
  showThreshold?: number; // この数以上で表示
}

export const ComboEffect: React.FC<ComboEffectProps> = ({
  combo,
  showThreshold = 3
}) => {
  const prevComboRef = useRef(combo);

  // 念レベルを取得
  const nenLevel = NEN_LEVELS.find(level => combo >= level.threshold) || NEN_LEVELS[NEN_LEVELS.length - 1];

  // マイルストーン判定
  const hitMilestone = MILESTONES.find(
    m => combo >= m && prevComboRef.current < m
  );

  useEffect(() => {
    prevComboRef.current = combo;
  }, [combo]);

  if (combo < showThreshold) return null;

  return (
    <div className="relative flex flex-col items-center">
      {/* コンボ数 */}
      <motion.div
        key={combo}
        variants={comboCounterVariants}
        initial="initial"
        animate="increment"
        className={`text-6xl font-black ${nenLevel.color} drop-shadow-lg`}
        style={{
          textShadow: `0 0 20px currentColor`,
        }}
      >
        {combo}
      </motion.div>

      {/* COMBO ラベル */}
      <div className="text-sm uppercase tracking-[0.3em] text-white/60 mt-1">
        combo
      </div>

      {/* 念レベル表示 */}
      <motion.div
        key={nenLevel.name}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className={`text-sm mt-2 ${nenLevel.color}`}
      >
        {nenLevel.name}
      </motion.div>

      {/* マイルストーン達成エフェクト */}
      <AnimatePresence>
        {hitMilestone && (
          <motion.div
            variants={comboMilestoneVariants}
            initial="initial"
            animate="milestone"
            exit="exit"
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div
              className={`w-40 h-40 rounded-full ${nenLevel.glow}`}
              style={{
                background: `radial-gradient(circle, currentColor 0%, transparent 70%)`,
                opacity: 0.5,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ComboEffect;
