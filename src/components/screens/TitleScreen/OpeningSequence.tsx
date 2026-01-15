/**
 * オープニング画面とスタート演出
 * 爆発エフェクト、タイトル表示、スタート指示を管理
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface OpeningSequenceProps {
  isVisible: boolean;
  explosionTriggered: boolean;
  onStart: () => void;
}

export const OpeningSequence: React.FC<OpeningSequenceProps> = ({
  isVisible,
  explosionTriggered,
  onStart,
}) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.4 }}
          className="absolute inset-0 z-50 flex flex-col items-center justify-center cursor-pointer overflow-hidden"
          onClick={onStart}
        >
          {/* 背景 */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a12] via-hunter-dark to-[#0a0a12]" />

          {/* グリッド背景 */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: `linear-gradient(rgba(212,175,55,0.3) 1px, transparent 1px),
                                linear-gradient(90deg, rgba(212,175,55,0.3) 1px, transparent 1px)`,
              backgroundSize: '40px 40px'
            }}
          />

          {/* 爆発エフェクト - 光の放射 */}
          <AnimatePresence>
            {explosionTriggered && (
              <>
                {/* 中央からの光の爆発 */}
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 0.8, times: [0, 0.1, 1] }}
                >
                  <motion.div
                    className="w-4 h-4 bg-hunter-gold rounded-full"
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 80, 100] }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    style={{ filter: 'blur(100px)' }}
                  />
                </motion.div>

                {/* 放射状の光線 */}
                {[...Array(12)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute top-1/2 left-1/2 w-[200%] h-1 bg-gradient-to-r from-transparent via-hunter-gold to-transparent"
                    style={{
                      transformOrigin: 'center center',
                      rotate: `${i * 30}deg`,
                    }}
                    initial={{ opacity: 0, scaleX: 0 }}
                    animate={{
                      opacity: [0, 1, 0],
                      scaleX: [0, 1, 1.5],
                    }}
                    transition={{
                      duration: 0.6,
                      delay: 0.05,
                      ease: 'easeOut',
                    }}
                  />
                ))}

                {/* 爆発パーティクル */}
                {[...Array(20)].map((_, i) => {
                  const angle = (i / 20) * Math.PI * 2;
                  const distance = 150 + Math.random() * 200;
                  return (
                    <motion.div
                      key={`particle-${i}`}
                      className="absolute top-1/2 left-1/2 w-2 h-2 bg-hunter-gold rounded-full"
                      initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                      animate={{
                        x: Math.cos(angle) * distance,
                        y: Math.sin(angle) * distance,
                        opacity: 0,
                        scale: 0,
                      }}
                      transition={{
                        duration: 0.8 + Math.random() * 0.4,
                        delay: 0.05,
                        ease: 'easeOut',
                      }}
                    />
                  );
                })}

                {/* 衝撃波リング */}
                {[0, 0.1, 0.2].map((delay, i) => (
                  <motion.div
                    key={`ring-${i}`}
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-hunter-gold rounded-full"
                    initial={{ width: 0, height: 0, opacity: 1 }}
                    animate={{
                      width: [0, 600, 800],
                      height: [0, 600, 800],
                      opacity: [1, 0.5, 0],
                    }}
                    transition={{
                      duration: 0.8,
                      delay: delay,
                      ease: 'easeOut',
                    }}
                  />
                ))}
              </>
            )}
          </AnimatePresence>

          {/* メイン画像 - 爆発後に登場 */}
          <motion.div
            className="relative z-10"
            initial={{ scale: 0, opacity: 0, rotate: -10 }}
            animate={explosionTriggered ? {
              scale: [0, 1.1, 1],
              opacity: [0, 1, 1],
              rotate: [10, -2, 0],
            } : { scale: 0, opacity: 0 }}
            transition={{
              duration: 0.6,
              delay: explosionTriggered ? 0.1 : 0,
              ease: [0.34, 1.56, 0.64, 1],
            }}
          >
            <motion.div
              className="absolute -inset-4 rounded-lg bg-hunter-gold/30"
              animate={explosionTriggered ? {
                opacity: [0.8, 0.2, 0.4, 0.2],
                scale: [1, 1.1, 1, 1.05],
              } : {}}
              transition={{ duration: 2, repeat: Infinity, delay: 0.7 }}
            />
            <img
              src="/Mobile-/title-image_V2.jpg"
              alt="HUNTER×HUNTER TYPING MASTER"
              className="w-full max-w-lg lg:max-w-2xl xl:max-w-3xl mx-auto rounded-lg shadow-2xl relative z-10 border-2 border-hunter-gold/50"
            />
          </motion.div>

          {/* タイトル - 爆発後に登場 */}
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={explosionTriggered ? {
              opacity: 1,
              y: 0,
              scale: 1,
            } : { opacity: 0, y: 50, scale: 0.8 }}
            transition={{
              duration: 0.5,
              delay: explosionTriggered ? 0.3 : 0,
              ease: 'easeOut',
            }}
            className="relative z-10 mt-8 text-center"
          >
            <motion.h1
              className="font-title text-3xl md:text-4xl lg:text-5xl font-bold tracking-wider text-hunter-gold mb-2"
              animate={explosionTriggered ? {
                textShadow: [
                  '0 0 20px rgba(212,175,55,0.8)',
                  '0 0 40px rgba(212,175,55,0.4)',
                  '0 0 20px rgba(212,175,55,0.6)',
                ],
              } : {}}
              transition={{ duration: 2, repeat: Infinity, delay: 0.8 }}
            >
              HUNTER×HUNTER
            </motion.h1>
            <motion.h2
              className="font-title text-xl md:text-2xl tracking-[0.3em] text-white/80"
              initial={{ opacity: 0 }}
              animate={explosionTriggered ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: explosionTriggered ? 0.5 : 0, duration: 0.3 }}
            >
              TYPING MASTER
            </motion.h2>
          </motion.div>

          {/* スタート指示 - 爆発後に登場 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={explosionTriggered ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: explosionTriggered ? 0.8 : 0, duration: 0.5 }}
            className="relative z-10 mt-10"
          >
            <motion.div
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="font-title text-lg tracking-[0.2em] text-hunter-gold/80 uppercase"
            >
              Press to Start
            </motion.div>
          </motion.div>

          {/* ローディング表示（爆発前） */}
          {!explosionTriggered && (
            <motion.div
              className="relative z-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div
                className="w-16 h-16 border-2 border-hunter-gold/30 border-t-hunter-gold rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default OpeningSequence;
