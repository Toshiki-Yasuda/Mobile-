/**
 * 念オーラ可視化コンポーネント
 * コンボに応じてオーラが強くなる
 */

import React from 'react';
import { motion } from 'framer-motion';
import { createNenAuraPulse } from '@/utils/animations';

// 念レベル閾値
const NEN_THRESHOLDS = {
  HATSU: 50,   // 発（ハツ）- 必殺技レベル
  REN: 20,     // 練（レン）- オーラ増幅
  ZETSU: 10,   // 絶（ゼツ）- オーラ遮断
  TEN: 5,      // 纏（テン）- オーラ保持
};

interface NenAuraProps {
  combo: number;
  className?: string;
}

export const NenAura: React.FC<NenAuraProps> = ({ combo, className = '' }) => {
  const pulseConfig = createNenAuraPulse(combo);

  // 念レベルに応じた色
  const getAuraColor = () => {
    if (combo >= NEN_THRESHOLDS.HATSU) return 'from-red-500/40 to-orange-500/20';
    if (combo >= NEN_THRESHOLDS.REN) return 'from-orange-400/40 to-yellow-400/20';
    if (combo >= NEN_THRESHOLDS.ZETSU) return 'from-purple-400/40 to-blue-400/20';
    if (combo >= NEN_THRESHOLDS.TEN) return 'from-blue-400/40 to-cyan-400/20';
    return 'from-hunter-gold/30 to-hunter-gold/10';
  };

  // オーラの高さ（コンボでゲージのように上昇）
  const auraHeight = Math.min(combo * 2, 100);

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

      {/* パーティクル効果（コンボ10以上） */}
      {combo >= 10 && (
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(Math.min(Math.floor(combo / 5), 10))].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white/60 rounded-full"
              initial={{
                bottom: '0%',
                left: `${10 + i * 8}%`,
                opacity: 0,
              }}
              animate={{
                bottom: ['0%', '100%'],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2 + Math.random(),
                repeat: Infinity,
                delay: Math.random() * 2,
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
