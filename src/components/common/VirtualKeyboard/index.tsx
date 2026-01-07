/**
 * バーチャルキーボードコンポーネント
 * ホームポジションガイド付き（チャプターに応じて段階的にフェードアウト）
 * 
 * 指担当割り当て基準:
 * - 左手小指: 1 Q A Z
 * - 左手薬指: 2 W S X
 * - 左手中指: 3 E D C
 * - 左手人差し指: 4 R F V (内側), 5 T G B (中央)
 * - 右手人差し指: 6 Y H N (中央), 7 U J M (内側)
 * - 右手中指: 8 I K ,
 * - 右手薬指: 9 O L .
 * - 右手小指: 0 P ; / - など
 */

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface PressedKeyInfo {
  key: string;
  timestamp: number;
}

interface VirtualKeyboardProps {
  activeKeys: string[];
  showHomePosition?: boolean;
  chapter?: number; // チャプター番号（1-6）
  recentPressedKeys?: PressedKeyInfo[]; // 最近押されたキーのリスト
}

// ホームポジションのキー（仕様書準拠）
// 左手: A S D F / 右手: J K L ;
const HOME_POSITION_KEYS = ['a', 's', 'd', 'f', 'j', 'k', 'l', ';'];

// F, J には突起マークがある（Tactile bump）
const BUMP_KEYS = ['f', 'j'];

// 指の担当キー（仕様書準拠の色分け）
const FINGER_ASSIGNMENT: Record<string, { hand: 'left' | 'right'; finger: string }> = {
  // === 左手 ===
  // 左手小指: 1 Q A Z
  '1': { hand: 'left', finger: 'pinky' },
  'q': { hand: 'left', finger: 'pinky' },
  'a': { hand: 'left', finger: 'pinky' },
  'z': { hand: 'left', finger: 'pinky' },
  
  // 左手薬指: 2 W S X
  '2': { hand: 'left', finger: 'ring' },
  'w': { hand: 'left', finger: 'ring' },
  's': { hand: 'left', finger: 'ring' },
  'x': { hand: 'left', finger: 'ring' },
  
  // 左手中指: 3 E D C
  '3': { hand: 'left', finger: 'middle' },
  'e': { hand: 'left', finger: 'middle' },
  'd': { hand: 'left', finger: 'middle' },
  'c': { hand: 'left', finger: 'middle' },
  
  // 左手人差し指: 4 R F V (内側), 5 T G B (中央)
  '4': { hand: 'left', finger: 'index' },
  'r': { hand: 'left', finger: 'index' },
  'f': { hand: 'left', finger: 'index' },
  'v': { hand: 'left', finger: 'index' },
  '5': { hand: 'left', finger: 'index' },
  't': { hand: 'left', finger: 'index' },
  'g': { hand: 'left', finger: 'index' },
  'b': { hand: 'left', finger: 'index' }, // Bは左手（重要: Nとの区別）
  
  // === 右手 ===
  // 右手人差し指: 6 Y H N (中央), 7 U J M (内側)
  '6': { hand: 'right', finger: 'index' },
  'y': { hand: 'right', finger: 'index' },
  'h': { hand: 'right', finger: 'index' },
  'n': { hand: 'right', finger: 'index' }, // Nは右手（重要: Bとの区別）
  '7': { hand: 'right', finger: 'index' },
  'u': { hand: 'right', finger: 'index' },
  'j': { hand: 'right', finger: 'index' },
  'm': { hand: 'right', finger: 'index' },
  
  // 右手中指: 8 I K ,
  '8': { hand: 'right', finger: 'middle' },
  'i': { hand: 'right', finger: 'middle' },
  'k': { hand: 'right', finger: 'middle' },
  ',': { hand: 'right', finger: 'middle' },
  
  // 右手薬指: 9 O L .
  '9': { hand: 'right', finger: 'ring' },
  'o': { hand: 'right', finger: 'ring' },
  'l': { hand: 'right', finger: 'ring' },
  '.': { hand: 'right', finger: 'ring' },
  
  // 右手小指: 0 P ; / - [ ] @ : Enter ー など
  '0': { hand: 'right', finger: 'pinky' },
  '-': { hand: 'right', finger: 'pinky' },
  'ー': { hand: 'right', finger: 'pinky' }, // 伸ばし棒
  'p': { hand: 'right', finger: 'pinky' },
  '@': { hand: 'right', finger: 'pinky' },
  '[': { hand: 'right', finger: 'pinky' },
  ';': { hand: 'right', finger: 'pinky' },
  ':': { hand: 'right', finger: 'pinky' },
  ']': { hand: 'right', finger: 'pinky' },
  'Enter': { hand: 'right', finger: 'pinky' },
  '/': { hand: 'right', finger: 'pinky' },
  '_': { hand: 'right', finger: 'pinky' },
};

// 指ごとのCSSクラス
const getFingerClass = (key: string): string => {
  const assignment = FINGER_ASSIGNMENT[key.toLowerCase()];
  if (!assignment) return '';
  
  const { hand, finger } = assignment;
  return `finger-${finger}-${hand}`;
};

// チャプターごとの手の影の透明度
const HAND_OPACITY_BY_CHAPTER: Record<number, number> = {
  1: 0.15,  // しっかり見える
  2: 0.10,  // やや薄い
  3: 0.06,  // かなり薄い
  4: 0.03,  // ほぼ見えない
  // 5以降は表示しない
};

// キー押下エフェクトの継続時間（ms）
const KEY_PRESS_DURATION = 700;

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({ 
  activeKeys,
  showHomePosition = true,
  chapter = 1,
  recentPressedKeys = [],
}) => {
  // キーボードレイアウト（日本語入力対応）
  // 伸ばし棒（ー）とEnterキーを追加
  const rows = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', 'ー'],
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '@', '['],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', ':', 'Enter'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', '_'],
  ];

  // 各行のインデント（実際のキーボード配置に近づける）
  const rowIndents = [0, 6, 12, 20];
  
  // 特殊キーの幅（通常の1.5倍）
  const wideKeys = ['Enter'];

  // チャプターに応じた手の影の透明度を計算
  const handOpacity = useMemo(() => {
    if (chapter >= 5) return 0; // 5章以降は手の影を非表示
    return HAND_OPACITY_BY_CHAPTER[chapter] || 0.15;
  }, [chapter]);

  // 手の影を表示するかどうか
  const showHandShadow = false; // 一時的に無効化

  // 指の色分けは4章まで表示
  const showFingerColors = showHomePosition && chapter <= 4;

  // 凡例は3章まで表示
  const showLegend = showHomePosition && chapter <= 3;

  // ホームポジションテキストは4章まで表示
  const showHomePositionText = showHomePosition && chapter <= 4;

  // キーが最近押されたかチェック
  const getPressedKeyInfo = (key: string): PressedKeyInfo | undefined => {
    return recentPressedKeys.find(k => k.key === key.toLowerCase());
  };

  const getKeyClass = (key: string, isActive: boolean) => {
    const baseClass = isActive ? 'keyboard-key-highlight' : 'keyboard-key';
    const isHomePosition = HOME_POSITION_KEYS.includes(key.toLowerCase());
    const fingerClass = showFingerColors ? getFingerClass(key) : '';
    
    return `${baseClass} ${fingerClass} ${isHomePosition && showHomePosition ? 'home-position' : ''}`;
  };

  return (
    <div className="flex flex-col items-center gap-1 lg:gap-1.5 xl:gap-2 p-3 lg:p-4 xl:p-6 bg-hunter-dark-light/50 backdrop-blur-sm border border-hunter-gold/20 rounded-xl relative">
      {/* 凡例（1-3章のみ） */}
      {showLegend && (
        <div className="absolute -top-10 left-0 right-0 flex justify-center gap-3 text-[10px] font-title tracking-wider">
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
          style={{ top: '20%' }} // 数字行の下に配置
        >
          {/* 左手 */}
          <svg viewBox="0 0 100 80" className="w-28 h-20 -mr-2" style={{ transform: 'scaleX(-1)' }}>
            <path
              d="M50 70 L45 45 L40 20 L42 15 L48 40 L50 40 L52 10 L56 10 L54 40 L58 40 L62 5 L66 5 L60 40 L64 40 L68 15 L72 15 L66 45 L75 35 L78 38 L65 55 L60 70 Z"
              fill="currentColor"
              className="text-hunter-gold"
            />
          </svg>
          {/* 右手 */}
          <svg viewBox="0 0 100 80" className="w-28 h-20 -ml-2">
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
          className="flex gap-0.5 lg:gap-1 xl:gap-1.5 relative z-10"
          style={{ marginLeft: `${rowIndents[rowIndex] * 1.5}px` }}
        >
          {row.map((key) => {
            const keyLower = key.toLowerCase();
            const isActive = activeKeys.includes(keyLower) || activeKeys.includes(key);
            const pressedInfo = getPressedKeyInfo(key);
            const hasBump = BUMP_KEYS.includes(keyLower);
            const isHomeKey = HOME_POSITION_KEYS.includes(keyLower);
            const isWideKey = wideKeys.includes(key);
            const isEnter = key === 'Enter';
            
            // キーの表示テキスト
            const getDisplayKey = () => {
              if (key === 'Enter') return '↵';
              if (key === 'ー') return 'ー';
              if (key === ';') return ';';
              if (key === ':') return ':';
              if (key === '@') return '@';
              if (key === '[') return '[';
              if (key === '_') return '_';
              return key.toUpperCase();
            };
            const displayKey = getDisplayKey();
            
            // キーのサイズはCSSで制御（レスポンシブ対応）
            const getKeySizeClass = () => {
              if (isWideKey) return 'key-wide'; // Enterは幅広
              if (rowIndex === 0) return 'key-number'; // 数字行
              return 'key-normal'; // 通常キー
            };
            const keySizeClass = getKeySizeClass();
            
            return (
              <motion.div
                key={key}
                className={`${getKeyClass(key, isActive)} ${keySizeClass} relative overflow-hidden`}
                animate={isActive ? { scale: 1.05 } : { scale: 1 }}
                transition={{ duration: 0.1 }}
              >
                {/* 押したときの光るエフェクト（2秒かけてフェードアウト） */}
                <AnimatePresence>
                  {pressedInfo && (
                    <motion.div
                      key={pressedInfo.timestamp}
                      className="absolute inset-0 bg-hunter-gold rounded pointer-events-none"
                      initial={{ opacity: 0.7 }}
                      animate={{ opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: KEY_PRESS_DURATION / 1000, ease: 'easeOut' }}
                      style={{
                        boxShadow: '0 0 20px rgba(212, 175, 55, 0.8)',
                      }}
                    />
                  )}
                </AnimatePresence>
                
                {/* 押したときのリングエフェクト */}
                <AnimatePresence>
                  {pressedInfo && (
                    <motion.div
                      key={`ring-${pressedInfo.timestamp}`}
                      className="absolute inset-0 border-2 border-hunter-gold rounded pointer-events-none"
                      initial={{ scale: 1, opacity: 1 }}
                      animate={{ scale: 2, opacity: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  )}
                </AnimatePresence>
                
                <span className="relative z-10 flex flex-col items-center justify-center">
                  <span className={`
                    ${rowIndex === 0 ? 'text-[10px] lg:text-xs xl:text-sm' : 'text-xs lg:text-sm xl:text-base 2xl:text-lg'}
                    ${isEnter ? 'text-base lg:text-lg xl:text-xl' : ''}
                    ${key === 'ー' ? 'text-sm lg:text-base xl:text-lg' : ''}
                  `}>
                    {displayKey}
                  </span>
                  {/* F, J の突起マーク（Tactile bump） */}
                  {hasBump && showHomePosition && (
                    <span className="absolute -bottom-0.5 lg:-bottom-1 left-1/2 -translate-x-1/2 w-3 lg:w-4 xl:w-5 h-1 lg:h-1.5 bg-hunter-gold/70 rounded-full" />
                  )}
                  {/* ホームポジションキーの下線（F, J以外） */}
                  {isHomeKey && !hasBump && showHomePosition && (
                    <span className="absolute -bottom-0.5 lg:-bottom-1 left-1/2 -translate-x-1/2 w-2 lg:w-3 xl:w-4 h-0.5 lg:h-1 bg-hunter-gold/40 rounded-full" />
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
          className="text-[10px] text-white/30 font-title tracking-wider mt-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: chapter <= 2 ? 1 : 0.5 }}
        >
          HOME: <span className="text-hunter-gold/50">A S D F</span> 
          <span className="mx-2">|</span>
          <span className="text-hunter-gold/50">J K L ;</span>
        </motion.div>
      )}
    </div>
  );
};

export default VirtualKeyboard;
