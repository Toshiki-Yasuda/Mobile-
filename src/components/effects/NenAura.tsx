/**
 * 念オーラ可視化コンポーネント
 * コンボに応じてオーラが強くなる
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { createNenAuraPulse } from '@/utils/animations';
import {
  NEN_THRESHOLDS,
  NEN_AURA_COLORS,
  NEN_AURA_CONFIG,
} from '@/constants/gameJuice';

interface NenAuraProps {
  combo: number;
  className?: string;
}

export const NenAura: React.FC<NenAuraProps> = ({ combo, className = '' }) => {
  const pulseConfig = createNenAuraPulse(combo);

  // パーティクルのランダム値をキャッシュ（マウント時に固定）
  const particleConfigs = useMemo(() => {
    return Array.from({ length: NEN_AURA_CONFIG.PARTICLE_MAX_COUNT }, (_, i) => ({
      left: `${10 + i * 8}%`,
      durationOffset: Math.random(),
      delay: Math.random() * 2,
    }));
  }, []);

  // 念レベルに応じた色
  const getAuraColor = () => {
    if (combo >= NEN_THRESHOLDS.HATSU) return NEN_AURA_COLORS.HATSU;
    if (combo >= NEN_THRESHOLDS.REN) return NEN_AURA_COLORS.REN;
    if (combo >= NEN_THRESHOLDS.ZETSU) return NEN_AURA_COLORS.ZETSU;
    if (combo >= NEN_THRESHOLDS.TEN) return NEN_AURA_COLORS.TEN;
    return NEN_AURA_COLORS.DEFAULT;
  };

  // オーラの高さ（コンボでゲージのように上昇）
  const auraHeight = Math.min(
    combo * NEN_AURA_CONFIG.HEIGHT_MULTIPLIER,
    NEN_AURA_CONFIG.HEIGHT_MAX
  );

  return (
    <div className={`relative w-full rounded-lg overflow-hidden bg-hunter-dark border border-hunter-gold/10 ${className}`}>
      {/* ベースオーラ */}
      <motion.div
        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${getAuraColor()}`}
        animate={{ height: `${auraHeight}%` }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      />

      {/* 脈動するオーバーレイ */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent"
        {...pulseConfig}
      />

      {/* パーティクル効果（コンボ閾値以上） */}
      {combo >= NEN_AURA_CONFIG.PARTICLE_THRESHOLD && (
        <div className="absolute inset-0 overflow-hidden">
          {particleConfigs
            .slice(0, Math.min(
              Math.floor(combo / NEN_AURA_CONFIG.PARTICLE_DIVISOR),
              NEN_AURA_CONFIG.PARTICLE_MAX_COUNT
            ))
            .map((config, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white/60 rounded-full"
                initial={{
                  bottom: '0%',
                  left: config.left,
                  opacity: 0,
                }}
                animate={{
                  bottom: ['0%', '100%'],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2 + config.durationOffset,
                  repeat: Infinity,
                  delay: config.delay,
                  ease: 'easeOut',
                }}
              />
            ))}
        </div>
      )}
    </div>
  );
};

export default NenAura;
