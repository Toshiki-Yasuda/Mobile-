/**
 * 統計情報カード
 * スコア、精度、WPM 等の表示
 */

import React from 'react';
import { motion } from 'framer-motion';
import { formatDiff } from './useResultCalculation';
import type { StatCardProps } from './resultConstants';

export const StatCard: React.FC<StatCardProps> = ({ label, value, highlight, diff, diffSuffix = '' }) => (
  <div
    className={`text-center p-3 rounded-lg ${
      highlight ? 'bg-hunter-gold/10 border border-hunter-gold/30' : 'bg-hunter-dark/30'
    }`}
  >
    <div className="font-title text-white/40 text-[10px] tracking-[0.2em] mb-1">{label}</div>
    <div className={`font-title text-xl font-bold ${highlight ? 'text-hunter-gold' : 'text-white'}`}>
      {value}
    </div>
    {diff != null && diff !== 0 && (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.2 }}
        className={`font-title text-xs mt-1 ${diff > 0 ? 'text-success' : 'text-error'}`}
      >
        {formatDiff(diff, diffSuffix)}
      </motion.div>
    )}
  </div>
);

export default StatCard;
