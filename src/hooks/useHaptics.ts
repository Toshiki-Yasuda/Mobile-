/**
 * ハプティックフィードバック管理ホック
 * Navigator.vibrate() API を使用してモバイルデバイスの振動を制御
 * SettingsStore の設定値を反映
 */

import { useCallback } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import {
  HAPTIC_PATTERNS,
  getComboHapticPattern,
  type HapticPattern,
} from '@/constants/gameJuice';

/**
 * ハプティック機能サポート判定
 */
const isHapticSupported = (): boolean => {
  return typeof navigator !== 'undefined' && 'vibrate' in navigator;
};

/**
 * ハプティック振動パターンを実行
 * @param pattern - 振動パターン ([ON, OFF, ON, OFF, ...])
 * @param intensityMultiplier - 強度乗数（0-1）
 */
const triggerHapticPattern = (pattern: number[], intensityMultiplier: number = 1): boolean => {
  if (!isHapticSupported()) return false;

  try {
    // 強度乗数を反映したパターンを生成（偶数インデックス = ON 時間）
    const adjustedPattern = pattern.map((duration, index) => {
      if (index % 2 === 0) {
        // ON 時間を強度乗数で調整
        return Math.round(duration * intensityMultiplier);
      }
      // OFF 時間はそのまま
      return duration;
    });

    navigator.vibrate?.(adjustedPattern);
    return true;
  } catch (e) {
    console.warn('Haptic feedback failed:', e);
    return false;
  }
};

/**
 * ハプティックフィードバックホック
 */
export const useHaptics = () => {
  const { hapticEnabled, hapticIntensity } = useSettingsStore();
  const intensityMultiplier = hapticIntensity / 100;

  /**
   * カスタムハプティック振動を実行
   */
  const trigger = useCallback((pattern: HapticPattern) => {
    if (!hapticEnabled) return;
    triggerHapticPattern(pattern.pattern, intensityMultiplier);
  }, [hapticEnabled, intensityMultiplier]);

  /**
   * 入力タップ時の振動
   */
  const tap = useCallback(() => {
    trigger(HAPTIC_PATTERNS.tap);
  }, [trigger]);

  /**
   * 入力成功時の振動
   */
  const success = useCallback(() => {
    trigger(HAPTIC_PATTERNS.success);
  }, [trigger]);

  /**
   * コンボマイルストーン達成時の振動
   */
  const comboMilestone = useCallback((combo: number) => {
    const pattern = getComboHapticPattern(combo);
    if (pattern) {
      trigger(pattern);
    }
  }, [trigger]);

  /**
   * ミス時のダメージ振動
   */
  const damage = useCallback(() => {
    trigger(HAPTIC_PATTERNS.damage);
  }, [trigger]);

  /**
   * クリティカル状態（低HP）の警告振動
   */
  const critical = useCallback(() => {
    trigger(HAPTIC_PATTERNS.critical);
  }, [trigger]);

  /**
   * UI選択時の振動
   */
  const uiSelect = useCallback(() => {
    trigger(HAPTIC_PATTERNS.uiSelect);
  }, [trigger]);

  /**
   * メニュー移動時の振動
   */
  const menuMove = useCallback(() => {
    trigger(HAPTIC_PATTERNS.menuMove);
  }, [trigger]);

  /**
   * 振動を停止
   */
  const stop = useCallback(() => {
    if (isHapticSupported()) {
      navigator.vibrate?.(0);
    }
  }, []);

  return {
    trigger,
    tap,
    success,
    comboMilestone,
    damage,
    critical,
    uiSelect,
    menuMove,
    stop,
    isSupported: isHapticSupported(),
  };
};
