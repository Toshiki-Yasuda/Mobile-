/**
 * タイピング画面 - 左サイドパネル（進捗情報）
 * クールデザイン
 */

import React from 'react';
import { motion } from 'framer-motion';
import { SidePanel, SidePanelHeader, SidePanelSection } from '@/components/common/SidePanel';
import type { Word } from '@/types/game';

interface TypingLeftPanelProps {
  onBack: () => void;
  chapterName: string;
  stageName: string;
  currentIndex: number;
  totalWords: number;
  progress: number;
  words: Word[];
}

export const TypingLeftPanel: React.FC<TypingLeftPanelProps> = ({
  onBack,
  chapterName,
  stageName,
  currentIndex,
  totalWords,
  progress,
  words,
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

      {/* 進捗 */}
      <SidePanelSection title="PROGRESS" className="flex-1">
        <div className="mb-6">
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

        {/* 単語リスト */}
        <div className="space-y-2">
          {words.slice(0, 8).map((word, index) => {
            const isCurrent = index === currentIndex;
            const isCompleted = index < currentIndex;

            return (
              <div
                key={word.id}
                className={`flex items-center gap-3 p-2 rounded transition-all ${
                  isCurrent
                    ? 'bg-hunter-gold/10 border border-hunter-gold/30'
                    : isCompleted ? 'opacity-40' : 'opacity-20'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded flex items-center justify-center text-xs font-title ${
                    isCompleted
                      ? 'bg-success/20 text-success'
                      : isCurrent
                        ? 'bg-hunter-gold/20 text-hunter-gold'
                        : 'bg-white/5 text-white/30'
                  }`}
                >
                  {isCompleted ? '✓' : String(index + 1).padStart(2, '0')}
                </div>
                <span className={`text-sm ${isCurrent ? 'text-white font-bold' : 'text-white/50'}`}>
                  {word.display}
                </span>
              </div>
            );
          })}
          {words.length > 8 && (
            <div className="text-center text-white/20 text-sm py-2 font-title">
              +{words.length - 8} MORE
            </div>
          )}
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
