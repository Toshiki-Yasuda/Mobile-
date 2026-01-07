/**
 * タイピングカードコンポーネント
 * インスタントモード＆タイプライターモード対応
 * Enter正解時の爆発演出付き
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { APP_CONFIG } from '@/constants/config';
import type { Word } from '@/types/game';
import type { TypingState } from '@/types/romaji';

interface InputChar {
  char: string;
  isCorrect: boolean;
}

interface TypingCardProps {
  currentWord: Word;
  typingState: TypingState | null;
  displayRomaji: string;
  romajiGuideLevel: 'full' | 'partial' | 'none';
  combo: number;
  // タイプライターモード用
  isTypewriterMode?: boolean;
  userInput?: string;
  inputStatus?: {
    chars: InputChar[];
    isPartiallyCorrect: boolean;
  };
  explosionTrigger?: number;
  isPerfect?: boolean;
}

export const TypingCard: React.FC<TypingCardProps> = ({
  currentWord,
  typingState,
  displayRomaji,
  romajiGuideLevel,
  combo,
  isTypewriterMode = false,
  userInput = '',
  inputStatus,
  explosionTrigger = 0,
  isPerfect = false,
}) => {
  // 爆発エフェクト表示状態
  const [showExplosion, setShowExplosion] = useState(false);

  // explosionTriggerが変わったら爆発エフェクトを表示
  useEffect(() => {
    if (explosionTrigger > 0 && isTypewriterMode) {
      setShowExplosion(true);
      const timer = setTimeout(() => setShowExplosion(false), 800);
      return () => clearTimeout(timer);
    }
  }, [explosionTrigger, isTypewriterMode]);

  // インスタントモード: ローマ字表示
  const renderInstantRomaji = () => {
    if (!typingState || romajiGuideLevel === 'none') return null;

    const confirmed = typingState.confirmedRomaji;
    const current = typingState.currentInput;
    const remaining = displayRomaji.slice(confirmed.length + current.length);

    return (
      <div className="font-mono text-2xl lg:text-3xl tracking-wider">
        <span className="text-success">{confirmed}</span>
        <span className="text-hunter-gold font-bold">{current}</span>
        <span className="text-white/30">{remaining}</span>
      </div>
    );
  };

  // タイプライターモード: 入力フィールド表示
  const renderTypewriterInput = () => {
    return (
      <div className="space-y-4">
        {/* 目標ローマ字（ガイド） */}
        <div className="font-mono text-lg text-white/40 tracking-wider">
          {displayRomaji}
        </div>

        {/* 入力フィールド */}
        <div className="relative bg-hunter-dark-light/50 border-2 border-hunter-gold/30 rounded-lg px-6 py-4 min-h-[60px] flex items-center">
          <div className="font-mono text-2xl lg:text-3xl tracking-wider flex items-center">
            {/* 入力済み文字 */}
            {inputStatus?.chars.map((c, i) => (
              <span
                key={i}
                className={c.isCorrect ? 'text-success' : 'text-error'}
              >
                {c.char}
              </span>
            ))}
            {/* カーソル */}
            <motion.span
              className="inline-block w-0.5 h-8 bg-hunter-gold ml-0.5"
              animate={{ opacity: [1, 0, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
          </div>

          {/* プレースホルダー */}
          {userInput.length === 0 && (
            <span className="absolute left-6 text-white/20 font-mono text-2xl">
              Type here...
            </span>
          )}
        </div>

        {/* 操作ガイド */}
        <div className="flex justify-center gap-6 text-xs text-white/30 font-title tracking-wider">
          <span>
            <kbd className="px-2 py-1 bg-hunter-dark-light/50 rounded text-hunter-gold/60">ENTER</kbd>
            {' '}確定
          </span>
          <span>
            <kbd className="px-2 py-1 bg-hunter-dark-light/50 rounded text-hunter-gold/60">BS</kbd>
            {' '}削除
          </span>
        </div>
      </div>
    );
  };

  return (
    <motion.div
      className="w-full max-w-2xl lg:max-w-3xl relative"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* 爆発エフェクト */}
      <AnimatePresence>
        {showExplosion && (
          <>
            {/* 中央からの光の爆発 */}
            <motion.div
              className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, times: [0, 0.1, 1] }}
            >
              <motion.div
                className="w-4 h-4 bg-hunter-gold rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: [0, 30, 40] }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                style={{ filter: 'blur(40px)' }}
              />
            </motion.div>

            {/* 放射状の光線 */}
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={`ray-${i}`}
                className="absolute top-1/2 left-1/2 w-full h-0.5 bg-gradient-to-r from-transparent via-hunter-gold to-transparent pointer-events-none z-20"
                style={{ 
                  transformOrigin: 'center center',
                }}
                initial={{ rotate: i * 45, opacity: 0, scaleX: 0 }}
                animate={{ 
                  rotate: i * 45,
                  opacity: [0, 0.8, 0],
                  scaleX: [0, 1.5, 2],
                }}
                exit={{ opacity: 0 }}
                transition={{ 
                  duration: 0.5, 
                  ease: 'easeOut',
                }}
              />
            ))}

            {/* 爆発パーティクル */}
            {[...Array(12)].map((_, i) => {
              const angle = (i / 12) * Math.PI * 2;
              const distance = 80 + Math.random() * 60;
              return (
                <motion.div
                  key={`particle-${i}`}
                  className="absolute top-1/2 left-1/2 w-2 h-2 bg-hunter-gold rounded-full pointer-events-none z-20"
                  initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                  animate={{ 
                    x: Math.cos(angle) * distance,
                    y: Math.sin(angle) * distance,
                    opacity: 0,
                    scale: 0,
                  }}
                  exit={{ opacity: 0 }}
                  transition={{ 
                    duration: 0.5 + Math.random() * 0.3,
                    ease: 'easeOut',
                  }}
                />
              );
            })}

            {/* 衝撃波リング */}
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-hunter-gold rounded-full pointer-events-none z-20"
              initial={{ width: 0, height: 0, opacity: 1 }}
              animate={{ 
                width: [0, 300, 400],
                height: [0, 300, 400],
                opacity: [1, 0.5, 0],
              }}
              exit={{ opacity: 0 }}
              transition={{ 
                duration: 0.5,
                ease: 'easeOut',
              }}
            />

            {/* PERFECT テキスト（ミスなしの場合のみ） */}
            {isPerfect && (
              <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: [0, 1.2, 1],
                  opacity: [0, 1, 0],
                }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
              >
                <span className="font-title text-4xl font-bold text-hunter-gold drop-shadow-lg">
                  PERFECT!
                </span>
              </motion.div>
            )}
          </>
        )}
      </AnimatePresence>

      <div className="relative">
        {/* カード背景 */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-hunter-gold/5 to-transparent rounded-lg"
          animate={showExplosion ? {
            backgroundColor: ['rgba(212,175,55,0.05)', 'rgba(212,175,55,0.2)', 'rgba(212,175,55,0.05)'],
          } : {}}
          transition={{ duration: 0.3 }}
        />
        <motion.div 
          className="absolute inset-0 border border-hunter-gold/20 rounded-lg"
          animate={showExplosion ? {
            borderColor: ['rgba(212,175,55,0.2)', 'rgba(212,175,55,0.8)', 'rgba(212,175,55,0.2)'],
            boxShadow: ['0 0 0 rgba(212,175,55,0)', '0 0 30px rgba(212,175,55,0.5)', '0 0 0 rgba(212,175,55,0)'],
          } : {}}
          transition={{ duration: 0.3 }}
        />

        {/* コンテンツ */}
        <div className="relative p-8 lg:p-12 xl:p-16 text-center">
          {/* コンボ表示 */}
          <AnimatePresence>
            {combo >= APP_CONFIG.COMBO_DISPLAY_THRESHOLD && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="absolute top-4 left-1/2 -translate-x-1/2 font-title text-hunter-gold text-lg font-bold tracking-wider"
              >
                {combo} COMBO
              </motion.div>
            )}
          </AnimatePresence>

          {/* モード表示 */}
          {isTypewriterMode && (
            <div className="absolute top-4 right-4 font-title text-xs text-hunter-gold/50 tracking-wider uppercase">
              Typewriter Mode
            </div>
          )}

          {/* 表示テキスト */}
          <motion.div
            key={currentWord.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <motion.div 
              className="text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 lg:mb-6"
              animate={showExplosion ? {
                scale: [1, 1.1, 1],
                textShadow: ['0 0 0 rgba(212,175,55,0)', '0 0 20px rgba(212,175,55,0.8)', '0 0 0 rgba(212,175,55,0)'],
              } : {}}
              transition={{ duration: 0.3 }}
            >
              {currentWord.display}
            </motion.div>
            <div className="text-2xl lg:text-3xl text-hunter-gold/70 mb-6 lg:mb-8">
              {currentWord.hiragana}
            </div>
          </motion.div>

          {/* ローマ字ガイド / 入力フィールド */}
          <div className="min-h-[100px]">
            {isTypewriterMode ? renderTypewriterInput() : renderInstantRomaji()}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default TypingCard;
