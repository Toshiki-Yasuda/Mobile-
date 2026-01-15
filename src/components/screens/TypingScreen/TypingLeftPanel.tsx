/**
 * タイピング画面 - 左サイドパネル（進捗情報）
 * クールデザイン
 */

import React from 'react';
import { motion } from 'framer-motion';
import { SidePanel, SidePanelHeader, SidePanelSection } from '@/components/common/SidePanel';
import { HPBar } from '@/components/effects';
import type { Word } from '@/types/game';

interface TypingLeftPanelProps {
  onBack: () => void;
  chapterName: string;
  stageName: string;
  currentIndex: number;
  totalWords: number;
  progress: number;
  words: Word[];
  currentHP: number;
  maxHP: number;
}

export const TypingLeftPanel: React.FC<TypingLeftPanelProps> = ({
  onBack,
  chapterName,
  stageName,
  currentIndex,
  totalWords,
  progress,
  words,
  currentHP,
  maxHP,
}) => {
  return (
    <SidePanel position="left">
      <SidePanelHeader onBack={onBack} backLabel="EXIT" />

      {/* 章情報 */}
      <SidePanelSection borderBottom>
        <div className="font-title text-hunter-gold/50 text-xs tracking-[0.3em] mb-2">
          CHAPTER
        </div>
        <h2 className="font-title text-white text-xl font-bold tracking-wider mb-1">{chapterName}</h2>
        <p className="text-hunter-gold/60 text-sm font-title">{stageName}</p>
      </SidePanelSection>

      {/* HPバー */}
      <SidePanelSection borderBottom>
        <HPBar currentHP={currentHP} maxHP={maxHP} />
      </SidePanelSection>

      {/* 進捗 */}
      <SidePanelSection title="PROGRESS" className="flex-1 flex flex-col">
        <div className="mb-6 flex-shrink-0">
          <div className="flex justify-between items-end mb-2">
            <span className="text-white/50 text-sm font-title tracking-wider">WORD</span>
            <span className="font-title text-white text-2xl font-bold">
              {currentIndex + 1}
              <span className="text-white/40 text-lg">/{totalWords}</span>
            </span>
          </div>
          <div className="h-1.5 bg-hunter-dark rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-hunter-green to-hunter-gold"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        {/* スクロール可能な単語リスト */}
        <div className="flex-1 overflow-y-auto pr-2">
          <div className="space-y-2">
            {words.map((word, index) => {
              const isCurrent = index === currentIndex;
              const isNext = index === currentIndex + 1;
              const isCompleted = index < currentIndex;

              return (
                <motion.div
                  key={word.id}
                  initial={isCurrent ? { backgroundColor: 'rgba(212, 175, 55, 0.1)' } : {}}
                  animate={isCurrent ? { backgroundColor: 'rgba(212, 175, 55, 0.1)' } : {}}
                  transition={{ duration: 0.2 }}
                  className={`flex items-center gap-3 p-2 rounded transition-all ${
                    isCurrent
                      ? 'bg-hunter-gold/10 border border-hunter-gold/30'
                      : isNext ? 'bg-white/5 border border-white/10'
                      : isCompleted ? 'opacity-40' : 'opacity-20'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded flex-shrink-0 flex items-center justify-center text-xs font-title ${
                      isCompleted
                        ? 'bg-success/20 text-success'
                        : isCurrent
                          ? 'bg-hunter-gold/20 text-hunter-gold'
                          : 'bg-white/5 text-white/30'
                    }`}
                  >
                    {isCompleted ? '✓' : String(index + 1).padStart(2, '0')}
                  </div>
                  <span className={`text-sm truncate ${isCurrent ? 'text-white font-bold' : isNext ? 'text-white/70' : 'text-white/50'}`}>
                    {word.display}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>
      </SidePanelSection>

      {/* 操作説明 */}
      <SidePanelSection borderTop>
        <div className="text-white/20 text-xs font-title tracking-wider">
          <kbd className="px-1.5 py-0.5 bg-white/5 rounded text-[10px]">ESC</kbd> EXIT
        </div>
      </SidePanelSection>
    </SidePanel>
  );
};

export default TypingLeftPanel;
