/**
 * タイピングカードコンポーネント
 * メインのタイピング表示エリア
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { APP_CONFIG } from '@/constants/config';
import type { Word } from '@/types/game';
import type { TypingState } from '@/types/romaji';

interface TypingCardProps {
  currentWord: Word;
  typingState: TypingState | null;
  displayRomaji: string;
  romajiGuideLevel: 'full' | 'partial' | 'none';
  combo: number;
}

export const TypingCard: React.FC<TypingCardProps> = ({
  currentWord,
  typingState,
  displayRomaji,
  romajiGuideLevel,
  combo,
}) => {
  const renderRomaji = () => {
    if (!typingState || romajiGuideLevel === 'none') return null;

    const confirmed = typingState.confirmedRomaji;
    const current = typingState.currentInput;
    const remaining = displayRomaji.slice(confirmed.length + current.length);

    return (
      <div className="text-2xl lg:text-3xl font-mono tracking-wider">
        <span className="text-success">{confirmed}</span>
        <span className="text-hunter-gold font-bold">{current}</span>
        <span className="text-white/40">{remaining}</span>
      </div>
    );
  };

  return (
    <motion.div
      className="w-full max-w-2xl lg:max-w-3xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="relative">
        {/* カード背景 */}
        <div className="absolute inset-0 bg-gradient-to-br from-hunter-gold/5 to-transparent rounded-2xl lg:rounded-3xl" />
        <div className="absolute inset-0 border-2 border-hunter-gold/20 rounded-2xl lg:rounded-3xl" />

        {/* コンテンツ */}
        <div className="relative p-8 lg:p-12 xl:p-16 text-center">
          {/* コンボ表示 */}
          <AnimatePresence>
            {combo >= APP_CONFIG.COMBO_DISPLAY_THRESHOLD && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5 }}
                className="absolute top-4 left-1/2 -translate-x-1/2 text-hunter-gold text-lg font-bold"
              >
                🔥 {combo} COMBO!
              </motion.div>
            )}
          </AnimatePresence>

          {/* 表示テキスト */}
          <motion.div
            key={currentWord.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8"
          >
            <div className="text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-4 lg:mb-6">
              {currentWord.display}
            </div>
            <div className="text-2xl lg:text-3xl text-hunter-gold/80 mb-6 lg:mb-8">
              {currentWord.hiragana}
            </div>
          </motion.div>

          {/* ローマ字ガイド */}
          <div className="min-h-[40px]">{renderRomaji()}</div>
        </div>
      </div>
    </motion.div>
  );
};

export default TypingCard;

