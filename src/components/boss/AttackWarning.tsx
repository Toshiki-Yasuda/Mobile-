/**
 * 攻撃警告コンポーネント
 * 敵攻撃の3秒前に表示される警告演出
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AttackWarningProps {
  isWarning: boolean;
  countdown: number;
}

export const AttackWarning: React.FC<AttackWarningProps> = ({
  isWarning,
  countdown,
}) => {
  return (
    <AnimatePresence>
      {isWarning && (
        <div className="fixed inset-0 z-40 pointer-events-none">
          {/* 点滅する上部バー */}
          <motion.div
            className="absolute top-0 left-0 right-0 h-1 bg-red-500"
            initial={{ opacity: 0.3 }}
            animate={{ opacity: [0.3, 1, 0.3] }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />

          {/* カウントダウン表示 */}
          <div className="absolute top-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
            <motion.div
              key={countdown}
              className="text-7xl font-bold text-red-500 drop-shadow-2xl"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.5, 1.0], opacity: 1 }}
              transition={{
                duration: 0.5,
                ease: 'easeOut',
                times: [0, 0.6, 1],
              }}
            >
              {countdown}
            </motion.div>
            <motion.p
              className="text-sm text-red-300 font-semibold"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              敵の攻撃まで...
            </motion.p>
          </div>

          {/* 画面全体の赤いビネット */}
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(circle, transparent 40%, rgba(220,38,38,0.15) 100%)',
            }}
          />
        </div>
      )}
    </AnimatePresence>
  );
};

export default AttackWarning;
