/**
 * ステージ選択画面コンポーネント
 * クールデザイン
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { useProgressStore } from '@/stores/progressStore';
import { useButtonClick, useStageSelect } from '@/utils/soundUtils';
import { BackgroundEffect } from '@/components/common/BackgroundEffect';
import { getWordsForStage } from '@/data/words';

const CHAPTERS = [
  {
    id: 1, kanji: '基礎', romaji: 'BASICS',
    stages: [
      { number: 1, name: 'VOWELS', description: 'Basic vowels - aiueo' },
      { number: 2, name: 'HOME POSITION', description: 'Finger placement basics' },
      { number: 3, name: 'SHORT NAMES', description: 'Gon, Jin, etc.' },
      { number: 4, name: 'MAIN CHARS', description: 'Killua, Kurapika, etc.' },
      { number: 5, name: 'EXAM TERMS', description: 'Hunter exam vocabulary' },
      { number: 6, name: 'BOSS STAGE', description: 'Combined challenge' },
    ],
  },
  {
    id: 2, kanji: '纏', romaji: 'TEN',
    stages: Array.from({ length: 6 }, (_, i) => ({
      number: i + 1, name: `STAGE ${i + 1}`, description: 'Basic input training'
    })),
  },
  {
    id: 3, kanji: '絶', romaji: 'ZETSU',
    stages: Array.from({ length: 6 }, (_, i) => ({
      number: i + 1, name: `STAGE ${i + 1}`, description: 'Heavens Arena training'
    })),
  },
  {
    id: 4, kanji: '練', romaji: 'REN',
    stages: Array.from({ length: 6 }, (_, i) => ({
      number: i + 1, name: `STAGE ${i + 1}`, description: 'Yorknew City training'
    })),
  },
  {
    id: 5, kanji: '発', romaji: 'HATSU',
    stages: Array.from({ length: 6 }, (_, i) => ({
      number: i + 1, name: `STAGE ${i + 1}`, description: 'Greed Island training'
    })),
  },
  {
    id: 6, kanji: '極意', romaji: 'MASTER',
    stages: Array.from({ length: 6 }, (_, i) => ({
      number: i + 1, name: `STAGE ${i + 1}`, description: 'Chimera Ant training'
    })),
  },
];

export const StageSelectScreen: React.FC = () => {
  const { selectedChapter, selectStage, navigateTo, startSession } = useGameStore();
  const { isStageCleared, getStageResult } = useProgressStore();
  const { handleClick } = useButtonClick();
  const { handleSelect: handleStageClick } = useStageSelect();

  const chapter = CHAPTERS.find((c) => c.id === selectedChapter);

  if (!chapter) {
    return (
      <div className="min-h-screen bg-hunter-dark flex items-center justify-center">
        <div className="text-center">
          <div className="text-error font-title mb-4">CHAPTER NOT FOUND</div>
          <button
            onClick={handleClick(() => navigateTo('levelSelect'))}
            className="font-title text-hunter-gold hover:text-hunter-gold-light transition tracking-wider"
          >
            ← BACK TO CHAPTERS
          </button>
        </div>
      </div>
    );
  }

  const handleStageSelect = (stageNumber: number) => {
    const stageId = `${selectedChapter}-${stageNumber}`;
    const words = getWordsForStage(stageId);
    
    if (words.length === 0) {
      console.warn(`Stage ${stageId} has no word data`);
      return;
    }

    selectStage(selectedChapter, stageNumber);
    startSession(words);
    navigateTo('typing');
  };

  const isStageUnlocked = (stageNumber: number) => {
    if (stageNumber === 1) return true;
    const previousStageId = `${selectedChapter}-${stageNumber - 1}`;
    return isStageCleared(previousStageId);
  };

  return (
    <div className="min-h-screen bg-hunter-dark relative overflow-hidden">
      <BackgroundEffect variant="default" />

      {/* ヘッダー */}
      <header className="relative z-10 p-4 lg:p-6 border-b border-hunter-gold/10">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={handleClick(() => navigateTo('levelSelect'))}
            className="font-title text-hunter-gold/60 hover:text-hunter-gold transition tracking-wider text-sm uppercase mb-4"
          >
            ← BACK TO CHAPTERS
          </button>
          <div className="flex items-baseline gap-4">
            <h1 className="text-3xl lg:text-4xl font-bold text-white">
              {chapter.kanji}
            </h1>
            <span className="font-title text-hunter-gold/60 text-sm tracking-[0.2em]">{chapter.romaji}</span>
          </div>
        </div>
      </header>

      {/* ステージグリッド */}
      <main className="relative z-10 p-4 lg:p-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6">
          {chapter.stages.map((stage, index) => {
            const stageId = `${selectedChapter}-${stage.number}`;
            const unlocked = isStageUnlocked(stage.number);
            const cleared = isStageCleared(stageId);
            const result = getStageResult(stageId);

            return (
              <motion.button
                key={stage.number}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                onClick={unlocked ? handleStageClick(() => handleStageSelect(stage.number)) : undefined}
                disabled={!unlocked}
                whileHover={unlocked ? { scale: 1.02, y: -2 } : {}}
                whileTap={unlocked ? { scale: 0.98 } : {}}
                className={`relative text-left p-5 rounded-lg transition-all ${
                  unlocked
                    ? 'bg-hunter-dark-light/40 border border-hunter-gold/20 hover:border-hunter-gold/50 cursor-pointer'
                    : 'bg-hunter-dark-light/10 border border-white/5 opacity-40 cursor-not-allowed'
                }`}
              >
                {/* クリアマーク */}
                {cleared && (
                  <div className="absolute top-3 right-3 w-6 h-6 bg-success/20 rounded flex items-center justify-center">
                    <span className="text-success text-xs">✓</span>
                  </div>
                )}

                {/* ロック */}
                {!unlocked && (
                  <div className="absolute top-3 right-3 text-white/30 text-lg">
                    ⬡
                  </div>
                )}

                {/* ステージ番号 */}
                <div className="font-title text-hunter-gold/50 text-xs tracking-[0.3em] mb-2">
                  STAGE {String(stage.number).padStart(2, '0')}
                </div>

                {/* タイトル */}
                <h3 className="font-title text-xl font-bold text-white mb-1 tracking-wider">
                  {stage.name}
                </h3>
                <p className="text-white/40 text-sm mb-3">{stage.description}</p>

                {/* クリア情報 */}
                {cleared && result && (
                  <div className="flex gap-4 text-xs font-title">
                    <span className="text-hunter-gold">
                      SCORE: {result.score.toLocaleString()}
                    </span>
                    <span className="text-success">
                      ACC: {result.accuracy.toFixed(1)}%
                    </span>
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

export default StageSelectScreen;
