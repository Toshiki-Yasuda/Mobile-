/**
 * コンボマイルストーン演出コンポーネント
 * 5, 10, 20, 50コンボで派手な演出を表示
 */

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getComboMilestone, type ComboMilestoneConfig } from '@/constants/gameJuice';
import { useHaptics } from '@/hooks/useHaptics';

interface ComboEffectProps {
  combo: number;
}

export const ComboEffect: React.FC<ComboEffectProps> = ({ combo }) => {
  const [activeMilestone, setActiveMilestone] = useState<ComboMilestoneConfig | null>(null);
  const prevComboRef = useRef(combo);
  const { comboMilestone } = useHaptics();

  useEffect(() => {
    const milestone = getComboMilestone(combo, prevComboRef.current);

    if (milestone) {
      setActiveMilestone(milestone);

      // ハプティック: コンボマイルストーン達成時の振動
      comboMilestone(combo);

      // 演出終了後にクリア
      const timer = setTimeout(() => {
        setActiveMilestone(null);
      }, milestone.duration * 1000);

      return () => clearTimeout(timer);
    }

    prevComboRef.current = combo;
  }, [combo, comboMilestone]);

  return (
    <AnimatePresence>
      {activeMilestone && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          {/* 背景のオーラバースト */}
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.3, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: activeMilestone.duration }}
            style={{
              background: `radial-gradient(circle at center, ${activeMilestone.glowColor} 0%, transparent 70%)`,
            }}
          />

          {/* 波紋エフェクト */}
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full border-2"
              style={{ borderColor: activeMilestone.glowColor }}
              initial={{ width: 0, height: 0, opacity: 1 }}
              animate={{
                width: [0, 400 + i * 100, 600 + i * 150],
                height: [0, 400 + i * 100, 600 + i * 150],
                opacity: [1, 0.6, 0],
              }}
              transition={{
                duration: activeMilestone.duration * 0.8,
                delay: i * 0.15,
                ease: 'easeOut',
              }}
            />
          ))}

          {/* メインテキスト */}
          <motion.div
            className="relative z-10"
            initial={{ scale: 0, opacity: 0, rotate: -10 }}
            animate={{
              scale: [0, activeMilestone.scale, activeMilestone.scale * 0.9],
              opacity: [0, 1, 0],
              rotate: [-10, 0, 0],
            }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{
              duration: activeMilestone.duration,
              times: [0, 0.3, 1],
              ease: 'easeOut',
            }}
          >
            <span
              className={`font-title text-7xl lg:text-8xl font-bold ${activeMilestone.color}`}
              style={{
                textShadow: `0 0 30px ${activeMilestone.glowColor}, 0 0 60px ${activeMilestone.glowColor}`,
              }}
            >
              {activeMilestone.announcement}
            </span>
          </motion.div>

          {/* パーティクル */}
          {[...Array(12)].map((_, i) => {
            const angle = (i / 12) * Math.PI * 2;
            const distance = 150 + Math.random() * 100;
            return (
              <motion.div
                key={`particle-${i}`}
                className="absolute w-3 h-3 rounded-full"
                style={{ backgroundColor: activeMilestone.glowColor }}
                initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                animate={{
                  x: Math.cos(angle) * distance,
                  y: Math.sin(angle) * distance,
                  scale: 0,
                  opacity: 0,
                }}
                transition={{
                  duration: activeMilestone.duration * 0.7,
                  delay: 0.1 + Math.random() * 0.2,
                  ease: 'easeOut',
                }}
              />
            );
          })}

          {/* コンボ数表示 */}
          <motion.div
            className="absolute bottom-1/3"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: [0, 1, 0] }}
            transition={{
              duration: activeMilestone.duration,
              times: [0, 0.3, 1],
            }}
          >
            <span
              className={`font-title text-3xl font-bold ${activeMilestone.color}`}
              style={{
                textShadow: `0 0 15px ${activeMilestone.glowColor}`,
              }}
            >
              {combo} COMBO
            </span>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ComboEffect;
