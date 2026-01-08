/**
 * HPバーコンポーネント
 * ダメージ/回復のアニメーション付き
 */

import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HP_CONFIG } from '@/constants/gameJuice';

interface HPBarProps {
  currentHP: number;
  maxHP: number;
  className?: string;
}

export const HPBar: React.FC<HPBarProps> = ({
  currentHP,
  maxHP,
  className = '',
}) => {
  const percentage = Math.max(0, (currentHP / maxHP) * 100);
  const isCritical = currentHP <= HP_CONFIG.criticalThreshold;
  const prevHPRef = useRef(currentHP);

  // ダメージ/回復エフェクト
  const [showDamage, setShowDamage] = useState(false);
  const [showHeal, setShowHeal] = useState(false);
  const [damageAmount, setDamageAmount] = useState(0);
  const [healAmount, setHealAmount] = useState(0);

  useEffect(() => {
    const diff = currentHP - prevHPRef.current;

    if (diff < 0) {
      // ダメージ
      setDamageAmount(Math.abs(diff));
      setShowDamage(true);
      setTimeout(() => setShowDamage(false), 500);
    } else if (diff > 0) {
      // 回復
      setHealAmount(diff);
      setShowHeal(true);
      setTimeout(() => setShowHeal(false), 500);
    }

    prevHPRef.current = currentHP;
  }, [currentHP]);

  // HPバーの色
  const getBarColor = () => {
    if (isCritical) return 'from-red-500 to-red-600';
    if (percentage <= 50) return 'from-yellow-500 to-orange-500';
    return 'from-green-500 to-emerald-500';
  };

  return (
    <div className={`relative ${className}`}>
      {/* ラベル */}
      <div className="flex items-center justify-between mb-1">
        <span className="font-title text-xs text-hunter-gold/60 tracking-wider">HP</span>
        <span className={`font-title text-sm font-bold ${isCritical ? 'text-red-500' : 'text-white'}`}>
          {currentHP} / {maxHP}
        </span>
      </div>

      {/* HPバー本体 */}
      <div className="relative h-3 bg-hunter-dark-light rounded-full overflow-hidden border border-hunter-gold/20">
        {/* 背景グロー（危険時） */}
        {isCritical && (
          <motion.div
            className="absolute inset-0 bg-red-500/20"
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 0.5, repeat: Infinity }}
          />
        )}

        {/* HPゲージ */}
        <motion.div
          className={`h-full bg-gradient-to-r ${getBarColor()} relative`}
          initial={{ width: '100%' }}
          animate={{
            width: `${percentage}%`,
          }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          {/* 光沢エフェクト */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/30 to-transparent h-1/2" />
        </motion.div>

        {/* ダメージ時のシェイク */}
        <AnimatePresence>
          {showDamage && (
            <motion.div
              className="absolute inset-0 bg-red-500/50"
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </AnimatePresence>

        {/* 回復時のグロー */}
        <AnimatePresence>
          {showHeal && (
            <motion.div
              className="absolute inset-0 bg-green-400/50"
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </AnimatePresence>
      </div>

      {/* ダメージ数値ポップアップ */}
      <AnimatePresence>
        {showDamage && (
          <motion.div
            className="absolute -top-6 right-0 font-title text-lg font-bold text-red-500"
            initial={{ y: 0, opacity: 1 }}
            animate={{ y: -20, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            -{damageAmount}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 回復数値ポップアップ */}
      <AnimatePresence>
        {showHeal && (
          <motion.div
            className="absolute -top-6 right-0 font-title text-lg font-bold text-green-400"
            initial={{ y: 0, opacity: 1 }}
            animate={{ y: -20, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            +{healAmount}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 危険警告 */}
      {isCritical && (
        <motion.div
          className="mt-1 text-center"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 0.5, repeat: Infinity }}
        >
          <span className="font-title text-xs text-red-500 tracking-wider">DANGER!</span>
        </motion.div>
      )}
    </div>
  );
};

export default HPBar;
