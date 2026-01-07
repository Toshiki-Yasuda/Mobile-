/**
 * バーチャルキーボードコンポーネント
 * ホームポジションガイド付き（チャプターに応じて段階的にフェードアウト）
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface VirtualKeyboardProps {
  activeKeys: string[];
  showHomePosition?: boolean;
  chapter?: number; // チャプター番号（1-6）
  pressedKey?: string | null; // 押されたキー（光る演出用）
}

// ホームポジションのキー
const HOME_POSITION_KEYS = ['a', 's', 'd', 'f', 'j', 'k', 'l'];

// F, J には突起マークがある
const BUMP_KEYS = ['f', 'j'];

// 指の担当キー（色分け用）
const FINGER_COLORS: Record<string, string> = {
  // 左手小指（ピンク系）
  'q': 'finger-pinky-left', 'a': 'finger-pinky-left', 'z': 'finger-pinky-left',
  // 左手薬指（オレンジ系）
  'w': 'finger-ring-left', 's': 'finger-ring-left', 'x': 'finger-ring-left',
  // 左手中指（緑系）
  'e': 'finger-middle-left', 'd': 'finger-middle-left', 'c': 'finger-middle-left',
  // 左手人差し指（青系）
  'r': 'finger-index-left', 'f': 'finger-index-left', 'v': 'finger-index-left',
  't': 'finger-index-left', 'g': 'finger-index-left', 'b': 'finger-index-left',
  // 右手人差し指（青系）
  'y': 'finger-index-right', 'h': 'finger-index-right', 'n': 'finger-index-right',
  'u': 'finger-index-right', 'j': 'finger-index-right', 'm': 'finger-index-right',
  // 右手中指（緑系）
  'i': 'finger-middle-right', 'k': 'finger-middle-right',
  // 右手薬指（オレンジ系）
  'o': 'finger-ring-right', 'l': 'finger-ring-right',
  // 右手小指（ピンク系）
  'p': 'finger-pinky-right',
};

// チャプターごとの手の影の透明度
const HAND_OPACITY_BY_CHAPTER: Record<number, number> = {
  1: 0.15,  // しっかり見える
  2: 0.10,  // やや薄い
  3: 0.06,  // かなり薄い
  4: 0.03,  // ほぼ見えない
  // 5以降は表示しない
};

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({ 
  activeKeys,
  showHomePosition = true,
  chapter = 1,
  pressedKey = null,
}) => {
  const rows = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
  ];

  // チャプターに応じた手の影の透明度を計算
  const handOpacity = useMemo(() => {
    if (chapter >= 5) return 0; // 5章以降は手の影を非表示
    return HAND_OPACITY_BY_CHAPTER[chapter] || 0.15;
  }, [chapter]);

  // 手の影を表示するかどうか
  const showHandShadow = showHomePosition && handOpacity > 0;

  // 指の色分けは4章まで表示
  const showFingerColors = showHomePosition && chapter <= 4;

  // 凡例は3章まで表示
  const showLegend = showHomePosition && chapter <= 3;

  // ホームポジションテキストは4章まで表示
  const showHomePositionText = showHomePosition && chapter <= 4;

  const getKeyClass = (key: string, isActive: boolean) => {
    const baseClass = isActive ? 'keyboard-key-highlight' : 'keyboard-key';
    const isHomePosition = HOME_POSITION_KEYS.includes(key);
    const fingerClass = showFingerColors ? FINGER_COLORS[key] || '' : '';
    
    return `${baseClass} ${fingerClass} ${isHomePosition && showHomePosition ? 'home-position' : ''}`;
  };

  return (
    <div className="flex flex-col items-center gap-2 p-4 bg-hunter-dark-light/50 backdrop-blur-sm border border-hunter-gold/20 rounded-xl relative">
      {/* 凡例（1-3章のみ） */}
      {showLegend && (
        <div className="absolute -top-10 left-0 right-0 flex justify-center gap-4 text-[10px] font-title tracking-wider">
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-finger-pinky opacity-60" />
            <span className="text-white/40">小指</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-finger-ring opacity-60" />
            <span className="text-white/40">薬指</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-finger-middle opacity-60" />
            <span className="text-white/40">中指</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-3 h-3 rounded bg-finger-index opacity-60" />
            <span className="text-white/40">人差し指</span>
          </span>
        </div>
      )}

      {/* 手のシルエット（1-4章、段階的にフェードアウト） */}
      {showHandShadow && (
        <motion.div 
          className="absolute inset-0 pointer-events-none flex justify-center items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: handOpacity }}
          transition={{ duration: 0.5 }}
        >
          {/* 左手 */}
          <svg viewBox="0 0 100 80" className="w-32 h-24 -mr-4" style={{ transform: 'scaleX(-1)' }}>
            <path
              d="M50 70 L45 45 L40 20 L42 15 L48 40 L50 40 L52 10 L56 10 L54 40 L58 40 L62 5 L66 5 L60 40 L64 40 L68 15 L72 15 L66 45 L75 35 L78 38 L65 55 L60 70 Z"
              fill="currentColor"
              className="text-hunter-gold"
            />
          </svg>
          {/* 右手 */}
          <svg viewBox="0 0 100 80" className="w-32 h-24 -ml-4">
            <path
              d="M50 70 L45 45 L40 20 L42 15 L48 40 L50 40 L52 10 L56 10 L54 40 L58 40 L62 5 L66 5 L60 40 L64 40 L68 15 L72 15 L66 45 L75 35 L78 38 L65 55 L60 70 Z"
              fill="currentColor"
              className="text-hunter-gold"
            />
          </svg>
        </motion.div>
      )}

      {rows.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className="flex gap-1.5 relative z-10"
          style={{ marginLeft: rowIndex * 20 }}
        >
          {row.map((key) => {
            const isActive = activeKeys.includes(key);
            const isPressed = pressedKey === key;
            const hasBump = BUMP_KEYS.includes(key);
            
            return (
              <motion.div
                key={key}
                className={`${getKeyClass(key, isActive)} ${isPressed ? 'key-pressed' : ''} relative overflow-hidden`}
                animate={
                  isPressed 
                    ? { scale: 0.95 } 
                    : isActive 
                      ? { scale: 1.1 } 
                      : { scale: 1 }
                }
                transition={{ duration: 0.1 }}
              >
                {/* 押したときの光るエフェクト */}
                {isPressed && (
                  <motion.div
                    className="absolute inset-0 bg-hunter-gold/60 rounded"
                    initial={{ opacity: 1 }}
                    animate={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  />
                )}
                {/* 押したときのリングエフェクト */}
                {isPressed && (
                  <motion.div
                    className="absolute inset-0 border-2 border-hunter-gold rounded"
                    initial={{ scale: 1, opacity: 1 }}
                    animate={{ scale: 1.5, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  />
                )}
                <span className="relative z-10">
                  {key.toUpperCase()}
                  {/* F, J の突起マーク（常に表示） */}
                  {hasBump && showHomePosition && (
                    <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-2 h-0.5 bg-hunter-gold/60 rounded-full" />
                  )}
                </span>
              </motion.div>
            );
          })}
        </div>
      ))}

      {/* ホームポジションガイドテキスト（1-4章のみ） */}
      {showHomePositionText && (
        <motion.div 
          className="text-[10px] text-white/30 font-title tracking-wider mt-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: chapter <= 2 ? 1 : 0.5 }}
        >
          HOME POSITION: <span className="text-hunter-gold/50">A S D F</span> ← → <span className="text-hunter-gold/50">J K L</span>
        </motion.div>
      )}
    </div>
  );
};

export default VirtualKeyboard;
