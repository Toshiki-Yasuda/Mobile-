/**
 * タイピング画面 - 左サイドパネル（進捗情報）
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
      <SidePanelHeader onBack={onBack} backLabel="やめる" />

      {/* 章情報 */}
      <SidePanelSection borderBottom>
        <div className="text-hunter-gold/50 text-xs uppercase tracking-widest mb-2">
          Chapter
        </div>
        <h2 className="text-white text-xl font-bold mb-1">{chapterName}</h2>
        <p className="text-hunter-gold/60 text-sm">{stageName}</p>
      </SidePanelSection>

      {/* 進捗 */}
      <SidePanelSection title="Progress" className="flex-1">
        {/* 問題数 */}
        <div className="mb-6">
          <div className="flex justify-between items-end mb-2">
            <span className="text-white/60 text-sm">問題</span>
            <span className="text-white text-2xl font-bold">
              {currentIndex + 1}
              <span className="text-white/40 text-lg">/{totalWords}</span>
            </span>
          </div>
          <div className="h-2 bg-hunter-dark rounded-full overflow-hidden">
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
                className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                  isCurrent
                    ? 'bg-hunter-gold/20 border border-hunter-gold/40'
                    : isCompleted
                      ? 'opacity-50'
                      : 'opacity-30'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                    isCompleted
                      ? 'bg-success text-white'
                      : isCurrent
                        ? 'bg-hunter-gold text-hunter-dark'
                        : 'bg-white/10 text-white/40'
                  }`}
                >
                  {isCompleted ? '✓' : index + 1}
                </div>
                <span
                  className={`text-sm ${isCurrent ? 'text-white font-bold' : 'text-white/60'}`}
                >
                  {word.display}
                </span>
              </div>
            );
          })}
          {words.length > 8 && (
            <div className="text-center text-white/30 text-sm py-2">
              ...他 {words.length - 8} 問
            </div>
          )}
        </div>
      </SidePanelSection>

      {/* 操作説明 */}
      <SidePanelSection borderTop>
        <div className="text-white/30 text-xs space-y-1">
          <p>
            <kbd className="px-1.5 py-0.5 bg-white/10 rounded text-[10px]">
              ESC
            </kbd>{' '}
            中断
          </p>
        </div>
      </SidePanelSection>
    </SidePanel>
  );
};

export default TypingLeftPanel;

