/**
 * ボスHP表示コンポーネント
 * ボスのHP、特殊状態、警告表示
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface BossHPBarProps {
  currentHP: number;
  maxHP: number;
  bossName: string;
  isAttacking?: boolean;
  specialStates?: string[];
}

export const BossHPBar: React.FC<BossHPBarProps> = ({
  currentHP,
  maxHP,
  bossName,
  isAttacking = false,
  specialStates = [],
}) => {
  const hpPercentage = useMemo(() => (currentHP / maxHP) * 100, [currentHP, maxHP]);
  const isLowHP = hpPercentage < 20;
  const isVeryLowHP = hpPercentage < 10;

  const getHPColor = () => {
    if (hpPercentage > 50) return 'from-green-600 to-green-500';
    if (hpPercentage > 25) return 'from-yellow-600 to-yellow-500';
    if (hpPercentage > 10) return 'from-orange-600 to-orange-500';
    return 'from-red-700 to-red-600';
  };

  const getHPTextColor = () => {
    if (hpPercentage > 50) return 'text-green-400';
    if (hpPercentage > 25) return 'text-yellow-400';
    if (hpPercentage > 10) return 'text-orange-400';
    return 'text-red-400';
  };

  // HPステータステキスト（色覚異常対応）
  const getHPStatusText = () => {
    if (hpPercentage > 50) return 'HEALTHY';
    if (hpPercentage > 25) return 'CAUTION';
    if (hpPercentage > 10) return 'DANGER';
    return 'CRITICAL';
  };

  // HPステータスアイコン
  const getHPStatusIcon = () => {
    if (hpPercentage > 50) return '🟢';
    if (hpPercentage > 25) return '🟡';
    if (hpPercentage > 10) return '🟠';
    return '🔴';
  };

  return (
    <div className="space-y-3 w-full">
      {/* ボス名と数値 */}
      <div className="flex items-center justify-between">
        <h2 className="font-title text-2xl font-bold text-white drop-shadow-lg">
          {bossName}
        </h2>
        <motion.div
          className={`text-sm font-bold drop-shadow-lg ${getHPTextColor()}`}
          animate={{ scale: isLowHP ? [1, 1.1, 1] : 1 }}
          transition={{
            duration: 0.8,
            ease: 'easeInOut',
            repeat: isLowHP ? Infinity : 0,
          }}
        >
          {Math.ceil(currentHP)} / {Math.ceil(maxHP)}
        </motion.div>
      </div>

      {/* HPステータス表示（アクセシビリティ） */}
      <div className="text-xs text-gray-300 flex items-center gap-1">
        <span>{getHPStatusIcon()}</span>
        <span>{getHPStatusText()} ({hpPercentage.toFixed(1)}%)</span>
      </div>

      {/* HPバー背景 */}
      <div
        className="w-full bg-gray-900 rounded-full h-10 overflow-hidden border-3 border-gray-700 shadow-inner"
        role="progressbar"
        aria-label={`${bossName} Health Points`}
        aria-valuenow={Math.ceil(currentHP)}
        aria-valuemin={0}
        aria-valuemax={Math.ceil(maxHP)}
        aria-valuetext={`${Math.ceil(currentHP)} out of ${Math.ceil(maxHP)} HP, ${getHPStatusText()}`}
      >
        {/* HPバー */}
        <motion.div
          className={`bg-gradient-to-r ${getHPColor()} h-full flex items-center justify-center shadow-lg`}
          animate={{ width: `${hpPercentage}%` }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          {hpPercentage > 10 && (
            <motion.span className="text-white text-sm font-bold drop-shadow-lg">
              {hpPercentage.toFixed(0)}%
            </motion.span>
          )}
        </motion.div>
      </div>

      {/* 特殊状態表示 */}
      {specialStates.length > 0 && (
        <motion.div className="flex gap-2 flex-wrap justify-center">
          {specialStates.map((state, idx) => (
            <motion.span
              key={`${state}-${idx}`}
              className="text-xs px-3 py-1 bg-gradient-to-r from-yellow-600 to-yellow-500 text-white rounded-full font-bold shadow-lg"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
            >
              {state}
            </motion.span>
          ))}
        </motion.div>
      )}

      {/* 低HP警告 */}
      {isLowHP && (
        <motion.div
          className="text-center"
          animate={{ opacity: isVeryLowHP ? [0.5, 1, 0.5] : 1, scale: isVeryLowHP ? [1, 1.05, 1] : 1 }}
          transition={{
            duration: isVeryLowHP ? 0.8 : 0,
            repeat: isVeryLowHP ? Infinity : 0,
          }}
        >
          <p className={`font-bold text-sm drop-shadow-lg ${isVeryLowHP ? 'text-red-500' : 'text-orange-500'}`}>
            {isVeryLowHP ? '⚠️ 危険！ボスが瀕死状態！' : '⚠️ ボスが弱った！'}
          </p>
        </motion.div>
      )}

      {/* 攻撃予告表示 */}
      {isAttacking && (
        <motion.div
          className="text-center bg-red-900/50 rounded px-3 py-2 border-2 border-red-500"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          <p className="text-red-300 text-sm font-bold">⚡ ボスが攻撃を準備している！</p>
        </motion.div>
      )}
    </div>
  );
};

export default BossHPBar;
