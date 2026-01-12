/**
 * レベル選択画面コンポーネント
 * クールデザイン
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { useProgressStore } from '@/stores/progressStore';
import { useButtonClick, useMenuSelect } from '@/utils/soundUtils';
import { BackgroundEffect } from '@/components/common/BackgroundEffect';

const CHAPTERS = [
  { id: 1, kanji: 'ハンター試験編', romaji: 'HUNTER EXAM', description: '念の基礎・ホームポジション', stages: 6 },
  { id: 2, kanji: '天空闘技場編', romaji: 'HEAVENS ARENA', description: '念の基礎用語を習得', stages: 6 },
  { id: 3, kanji: '幻影旅団編', romaji: 'PHANTOM TROUPE', description: '旅団メンバーと能力', stages: 6 },
  { id: 4, kanji: 'ヨークシン編', romaji: 'YORKNEW CITY', description: 'オークションと対決', stages: 6 },
  { id: 5, kanji: 'G・I編', romaji: 'GREED ISLAND', description: 'ゲームの冒険', stages: 6 },
  { id: 6, kanji: 'キメラアント編', romaji: 'CHIMERA ANT', description: '最終決戦', stages: 6 },
  { id: 7, kanji: '選挙編・暗黒大陸編', romaji: 'ELECTION ARC & DARK CONTINENT', description: '王位継承戦と未知の大陸', stages: 6 },
];

export const LevelSelectScreen: React.FC = () => {
  const { navigateTo, selectChapter } = useGameStore();
  const { isChapterUnlocked, clearedStages } = useProgressStore();
  const { handleClick } = useButtonClick();
  const { handleSelect } = useMenuSelect();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const getChapterProgress = (chapterId: number) => {
    const cleared = Object.keys(clearedStages).filter((id) =>
      id.startsWith(`${chapterId}-`)
    ).length;
    const total = CHAPTERS.find((c) => c.id === chapterId)?.stages || 6;
    return { cleared, total };
  };

  const handleChapterSelect = useCallback((chapterId: number) => {
    if (isChapterUnlocked(chapterId)) {
      selectChapter(chapterId);
      navigateTo('stageSelect');
    }
  }, [isChapterUnlocked, selectChapter, navigateTo]);

  // キーボード操作
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev - 3 + CHAPTERS.length) % CHAPTERS.length);
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev + 3) % CHAPTERS.length);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + CHAPTERS.length) % CHAPTERS.length);
          break;
        case 'ArrowRight':
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % CHAPTERS.length);
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          handleSelect(() => handleChapterSelect(CHAPTERS[selectedIndex].id))();
          break;
        case 'Escape':
          e.preventDefault();
          handleClick(() => navigateTo('title'))();
          break;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
          const num = parseInt(e.key);
          setSelectedIndex(num - 1);
          handleSelect(() => handleChapterSelect(num))();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, handleChapterSelect, handleSelect, handleClick, navigateTo]);

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
                animate={{ opacity: 1, y: selectedIndex === index ? -2 : 0 }}
                transition={{ delay: index * 0.08 }}
                onClick={unlocked ? handleSelect(() => handleChapterSelect(chapter.id)) : undefined}
                onMouseEnter={() => setSelectedIndex(index)}
                disabled={!unlocked}
                whileHover={unlocked ? { scale: 1.02, y: -2 } : {}}
                whileTap={unlocked ? { scale: 0.98 } : {}}
                className={`relative text-left p-5 rounded-lg transition-all ${
                  unlocked
                    ? selectedIndex === index
                      ? 'bg-hunter-dark-light/60 border-2 border-hunter-gold/70 cursor-pointer ring-2 ring-hunter-gold/30'
                      : 'bg-hunter-dark-light/40 border border-hunter-gold/20 hover:border-hunter-gold/50 cursor-pointer'
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

                {/* タイトル - 漢字を大きく */}
                <h3 className="text-4xl font-bold text-white mb-1">
                  {chapter.kanji}
                </h3>
                <p className="text-hunter-gold/60 text-xs mb-2 font-title tracking-[0.2em]">
                  {chapter.romaji}
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
