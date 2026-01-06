/**
 * レベル選択画面コンポーネント
 * ダークテーマ
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { useProgressStore } from '@/stores/progressStore';
import { useButtonClick, useMenuSelect } from '@/utils/soundUtils';
import { BackgroundEffect } from '@/components/common/BackgroundEffect';

// チャプターデータ
const CHAPTERS = [
  {
    id: 1,
    name: '念の基礎',
    japaneseName: 'ホームポジション編',
    description: 'ハンター試験・一次試験',
    stages: 6,
  },
  {
    id: 2,
    name: '纏（テン）',
    japaneseName: '基本入力編',
    description: 'ハンター試験・最終試験',
    stages: 6,
  },
  {
    id: 3,
    name: '絶（ゼツ）',
    japaneseName: '天空闘技場編',
    description: 'キーボードを見ない練習',
    stages: 6,
  },
  {
    id: 4,
    name: '練（レン）',
    japaneseName: 'ヨークシン編',
    description: 'スピードと正確性の向上',
    stages: 6,
  },
  {
    id: 5,
    name: '発（ハツ）',
    japaneseName: 'グリードアイランド編',
    description: '自分のスタイル確立',
    stages: 6,
  },
  {
    id: 6,
    name: '極意',
    japaneseName: 'キメラアント編',
    description: 'マスターレベル',
    stages: 6,
  },
];

export const LevelSelectScreen: React.FC = () => {
  const { navigateTo, selectChapter } = useGameStore();
  const { isChapterUnlocked, clearedStages } = useProgressStore();
  const { handleClick } = useButtonClick();
  const { handleSelect } = useMenuSelect();

  // チャプターの進捗を計算
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
            className="text-hunter-gold/60 hover:text-hunter-gold transition"
          >
            ← 戻る
          </button>
          <h1 className="text-xl lg:text-2xl font-bold text-white">
            修行の章を選択
          </h1>
          <div className="w-16" /> {/* spacer */}
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
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                onClick={unlocked ? handleSelect(() => handleChapterSelect(chapter.id)) : undefined}
                disabled={!unlocked}
                whileHover={unlocked ? { scale: 1.02, y: -2 } : {}}
                whileTap={unlocked ? { scale: 0.98 } : {}}
                className={`relative text-left p-6 rounded-xl transition-all ${
                  unlocked
                    ? 'bg-hunter-dark-light/50 border border-hunter-gold/20 hover:border-hunter-gold/40 cursor-pointer'
                    : 'bg-hunter-dark-light/20 border border-white/5 opacity-50 cursor-not-allowed'
                }`}
              >
                {/* 完了バッジ */}
                {isCompleted && (
                  <div className="absolute top-4 right-4">
                    <span className="text-2xl">⭐</span>
                  </div>
                )}

                {/* ロックアイコン */}
                {!unlocked && (
                  <div className="absolute top-4 right-4">
                    <span className="text-2xl">🔒</span>
                  </div>
                )}

                {/* チャプター番号 */}
                <div className="text-hunter-gold/60 text-xs uppercase tracking-widest mb-2">
                  第{chapter.id}章
                </div>

                {/* タイトル */}
                <h3 className="text-xl font-bold text-white mb-1">
                  {chapter.name}
                </h3>
                <p className="text-hunter-gold/60 text-sm mb-3">
                  {chapter.japaneseName}
                </p>

                {/* 説明 */}
                <p className="text-white/50 text-sm mb-4">{chapter.description}</p>

                {/* 進捗バー */}
                {unlocked && (
                  <div>
                    <div className="flex justify-between text-xs text-hunter-gold/60 mb-2">
                      <span>進捗</span>
                      <span>
                        {progress.cleared}/{progress.total}
                      </span>
                    </div>
                    <div className="h-2 bg-hunter-dark rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-hunter-green to-hunter-gold"
                        initial={{ width: 0 }}
                        animate={{ width: `${(progress.cleared / progress.total) * 100}%` }}
                        transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
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
