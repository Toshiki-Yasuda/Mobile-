/**
 * HPバーコンポーネント
 * ダメージ/回復のアニメーション付き + ハプティックフィードバック
 */

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HP_CONFIG } from '@/constants/gameJuice';
import { useHaptics } from '@/hooks/useHaptics';
import { isLowPowerDevice, prefersReducedMotion } from '@/utils/deviceUtils';

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
  const { damage, critical } = useHaptics();
  const lowPowerDevice = useMemo(() => isLowPowerDevice(), []);
  const shouldReduceMotion = useMemo(() => prefersReducedMotion(), []);

  // パフォーマンス最適化：低性能デバイスまたはmotion-reduceでパルスアニメーションを無効化
  const pulseAnimation = useMemo(() => ({
    duration: lowPowerDevice || shouldReduceMotion ? 0 : 1.2,
    repeat: lowPowerDevice || shouldReduceMotion ? 0 : Infinity,
  }), [lowPowerDevice, shouldReduceMotion]);

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
      damage(); // ハプティック: ダメージ振動

      // クリティカル状態への移行時の警告
      const newHP = currentHP;
      if (newHP <= HP_CONFIG.criticalThreshold && prevHPRef.current > HP_CONFIG.criticalThreshold) {
        critical(); // ハプティック: クリティカル警告
      }

      setTimeout(() => setShowDamage(false), 500);
    } else if (diff > 0) {
      // 回復
      setHealAmount(diff);
      setShowHeal(true);
      setTimeout(() => setShowHeal(false), 500);
    }

    prevHPRef.current = currentHP;
  }, [currentHP, damage, critical]);

  // HPバーの色
  const getBarColor = () => {
    if (isCritical) return 'from-red-500 to-red-600';
    if (percentage <= 50) return 'from-yellow-500 to-orange-500';
    return 'from-green-500 to-emerald-500';
  };

  // HPステータステキスト（色覚異常対応）
  const getHPStatusText = () => {
    if (isCritical) return '危険 (CRITICAL)';
    if (percentage <= 50) return '注意 (CAUTION)';
    return '安全 (SAFE)';
  };

  // HPステータスアイコン
  const getHPStatusIcon = () => {
    if (isCritical) return '🔴';
    if (percentage <= 50) return '🟡';
    return '🟢';
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

      {/* HPステータス表示（アクセシビリティ） */}
      <div className="text-xs text-gray-400 mb-1 flex items-center gap-1">
        <span>{getHPStatusIcon()}</span>
        <span>{getHPStatusText()}</span>
      </div>

      {/* HPバー本体 */}
      <div
        className="relative h-3 bg-hunter-dark-light rounded-full overflow-hidden border border-hunter-gold/20"
        role="progressbar"
        aria-label="Health Points"
        aria-valuenow={currentHP}
        aria-valuemin={0}
        aria-valuemax={maxHP}
        aria-valuetext={`${currentHP} out of ${maxHP} HP, ${getHPStatusText()}`}
      >
        {/* 背景グロー（危険時、低性能デバイスでは無効） */}
        {isCritical && !lowPowerDevice && (
          <motion.div
            className="absolute inset-0 bg-red-500/20"
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: pulseAnimation.duration, repeat: pulseAnimation.repeat }}
            style={{
              willChange: 'opacity',
              backfaceVisibility: 'hidden',
            }}
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
          style={{
            willChange: 'width',
            backfaceVisibility: 'hidden',
          }}
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
              style={{
                willChange: 'opacity',
                backfaceVisibility: 'hidden',
              }}
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
              style={{
                willChange: 'opacity',
                backfaceVisibility: 'hidden',
              }}
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
            style={{
              willChange: 'transform, opacity',
              backfaceVisibility: 'hidden',
            }}
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
            style={{
              willChange: 'transform, opacity',
              backfaceVisibility: 'hidden',
            }}
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
          style={{
            willChange: 'opacity',
            backfaceVisibility: 'hidden',
          }}
          role="alert"
          aria-live="assertive"
        >
          <span className="font-title text-xs text-red-500 tracking-wider">DANGER!</span>
        </motion.div>
      )}
    </div>
  );
};

export default HPBar;
