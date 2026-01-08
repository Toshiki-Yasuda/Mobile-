/**
 * 背景エフェクトコンポーネント
 * 各画面で共通で使用するグラデーション・グリッド背景
 */

import React from 'react';
import { motion } from 'framer-motion';

interface BackgroundEffectProps {
  variant?: 'default' | 'title' | 'typing' | 'result';
  showGrid?: boolean;
  showParticles?: boolean;
  particleCount?: number;
}

export const BackgroundEffect: React.FC<BackgroundEffectProps> = ({
  variant = 'default',
  showGrid = true,
  showParticles = false,
  particleCount = 6,
}) => {
  const gradients = {
    default: (
      <>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,rgba(45,90,39,0.15),transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,rgba(212,175,55,0.08),transparent_50%)]" />
      </>
    ),
    title: (
      <>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,rgba(45,90,39,0.2),transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,rgba(212,175,55,0.1),transparent_50%)]" />
      </>
    ),
    typing: (
      <>
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,rgba(45,90,39,0.15),transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,rgba(212,175,55,0.08),transparent_50%)]" />
      </>
    ),
    result: (
      <>
        <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,rgba(45,90,39,0.15),transparent_50%)]" />
        <div className="absolute bottom-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_left,rgba(212,175,55,0.08),transparent_50%)]" />
      </>
    ),
  };

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* グラデーション */}
      {gradients[variant]}

      {/* グリッドパターン */}
      {showGrid && (
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(212,175,55,0.5) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(212,175,55,0.5) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
      )}

      {/* 浮遊パーティクル */}
      {showParticles && (
        <div className="absolute inset-0">
          {[...Array(particleCount)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-4 h-4 border border-hunter-gold/20"
              style={{
                left: `${15 + i * 15}%`,
                top: `${20 + (i % 3) * 25}%`,
                clipPath:
                  'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.2, 0.5, 0.2],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 4 + i,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.5,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BackgroundEffect;


