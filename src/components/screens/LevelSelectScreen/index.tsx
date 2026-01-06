/**
 * レベル選択画面コンポーネント
 * クールデザイン
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { useProgressStore } from '@/stores/progressStore';
import { useButtonClick, useMenuSelect } from '@/utils/soundUtils';
import { BackgroundEffect } from '@/components/common/BackgroundEffect';

const CHAPTERS = [
  { id: 1, name: 'BASICS', subtitle: 'Home Position', description: 'Hunter Exam - Phase 1', stages: 6 },
  { id: 2, name: 'TEN', subtitle: '纏', description: 'Hunter Exam - Final', stages: 6 },
  { id: 3, name: 'ZETSU', subtitle: '絶', description: 'Heavens Arena', stages: 6 },
  { id: 4, name: 'REN', subtitle: '練', description: 'Yorknew City', stages: 6 },
  { id: 5, name: 'HATSU', subtitle: '発', description: 'Greed Island', stages: 6 },
  { id: 6, name: 'MASTER', subtitle: '極意', description: 'Chimera Ant', stages: 6 },
];

export const LevelSelectScreen: React.FC = () => {
  const { navigateTo, selectChapter } = useGameStore();
  const { isChapterUnlocked, clearedStages } = useProgressStore();
  const { handleClick } = useButtonClick();
  const { handleSelect } = useMenuSelect();

  const getChapterProgress = (chapterId: number) => {
    const cleared = Object.keys(clearedStages).filter((id) =>
      id.startsWith(`${chapterId}-`)
    ).length;
    const total = CHAPTERS.find((c) => c.id === chapterId)?.stages || 6;
    return { cleared, total };
  };

  const handleChapterSelect = (chapterId: number) => {
    selectChapter(chapterId);
    navigateTo('stageSelect');
  };

  return (
    <div className="min-h-screen bg-hunter-dark relative overflow-hidden">
      <BackgroundEffect variant="default" />

      {/* ヘッダー */}
      <header className="relative z-10 p-4 lg:p-6 border-b border-hunter-gold/10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={handleClick(() => navigateTo('title'))}
            className="font-title text-hunter-gold/60 hover:text-hunter-gold transition tracking-wider text-sm uppercase"
          >
            ← BACK
          </button>
          <h1 className="font-title text-xl lg:text-2xl font-bold text-white tracking-wider">
            SELECT CHAPTER
          </h1>
          <div className="w-16" />
        </div>
      </header>

      {/* チャプターグリッド */}
      <main className="relative z-10 p-4 lg:p-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
          {CHAPTERS.map((chapter, index) => {
            const unlocked = isChapterUnlocked(chapter.id);
            const progress = getChapterProgress(chapter.id);
            const isCompleted = progress.cleared === progress.total;

            return (
              <motion.button
                key={chapter.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                onClick={unlocked ? handleSelect(() => handleChapterSelect(chapter.id)) : undefined}
                disabled={!unlocked}
                whileHover={unlocked ? { scale: 1.02, y: -2 } : {}}
                whileTap={unlocked ? { scale: 0.98 } : {}}
                className={`relative text-left p-5 rounded-lg transition-all ${
                  unlocked
                    ? 'bg-hunter-dark-light/40 border border-hunter-gold/20 hover:border-hunter-gold/50 cursor-pointer'
                    : 'bg-hunter-dark-light/10 border border-white/5 opacity-40 cursor-not-allowed'
                }`}
              >
                {/* 完了マーク */}
                {isCompleted && (
                  <div className="absolute top-3 right-3 w-6 h-6 bg-hunter-gold/20 rounded flex items-center justify-center">
                    <span className="text-hunter-gold text-xs">✓</span>
                  </div>
                )}

                {/* ロック */}
                {!unlocked && (
                  <div className="absolute top-3 right-3 text-white/30 text-lg">
                    ⬡
                  </div>
                )}

                {/* チャプター番号 */}
                <div className="font-title text-hunter-gold/50 text-xs tracking-[0.3em] mb-2">
                  CHAPTER {String(chapter.id).padStart(2, '0')}
                </div>

                {/* タイトル */}
                <h3 className="font-title text-2xl font-bold text-white mb-1 tracking-wider">
                  {chapter.name}
                </h3>
                <p className="text-hunter-gold/60 text-sm mb-2 font-title">
                  {chapter.subtitle}
                </p>

                {/* 説明 */}
                <p className="text-white/40 text-sm mb-4">{chapter.description}</p>

                {/* 進捗バー */}
                {unlocked && (
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-white/40 font-title tracking-wider">PROGRESS</span>
                      <span className="text-hunter-gold font-title">
                        {progress.cleared}/{progress.total}
                      </span>
                    </div>
                    <div className="h-1 bg-hunter-dark rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-hunter-green to-hunter-gold"
                        initial={{ width: 0 }}
                        animate={{ width: `${(progress.cleared / progress.total) * 100}%` }}
                        transition={{ duration: 0.5, delay: index * 0.08 + 0.2 }}
                      />
                    </div>
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </main>
    </div>
  );
};

export default LevelSelectScreen;
