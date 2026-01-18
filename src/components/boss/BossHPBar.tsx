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
    <div className="space-y-2 w-full">
      {/* ボス名と数値 */}
      <div className="flex items-center justify-between">
        <h2 className="font-title text-lg font-bold text-white drop-shadow-lg">
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

      {/* HPバー（プレイヤーと統一デザイン） */}
      <div
        className="w-full bg-gray-900 rounded-full h-8 overflow-hidden border-2 border-gray-700 shadow-inner"
        role="progressbar"
        aria-label={`${bossName} Health Points`}
        aria-valuenow={Math.ceil(currentHP)}
        aria-valuemin={0}
        aria-valuemax={Math.ceil(maxHP)}
        aria-valuetext={`${Math.ceil(currentHP)} out of ${Math.ceil(maxHP)} HP, ${getHPStatusText()}`}
      >
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
    </div>
  );
};

export default BossHPBar;
