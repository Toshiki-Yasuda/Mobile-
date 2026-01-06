/**
 * レベル選択画面コンポーネント
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { useProgressStore } from '@/stores/progressStore';

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
    <div className="screen-container bg-hunter-dark">
      {/* ヘッダー */}
      <div className="w-full max-w-4xl mb-8">
        <button
          onClick={() => navigateTo('title')}
          className="text-hunter-gold hover:text-hunter-gold-light transition"
        >
          ← タイトルに戻る
        </button>
        <h1 className="text-3xl font-bold text-white mt-4">修行の章を選択</h1>
      </div>

      {/* チャプターリスト */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4">
        {CHAPTERS.map((chapter, index) => {
          const unlocked = isChapterUnlocked(chapter.id);
          const progress = getChapterProgress(chapter.id);

          return (
            <motion.button
              key={chapter.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              onClick={() => unlocked && handleChapterSelect(chapter.id)}
              disabled={!unlocked}
              className={`card text-left transition-all ${
                unlocked
                  ? 'hover:border-hunter-gold/50 cursor-pointer hover:shadow-nen'
                  : 'opacity-50 cursor-not-allowed grayscale'
              }`}
            >
              {/* チャプター番号 */}
              <div className="flex items-start justify-between mb-2">
                <span className="text-hunter-gold text-sm font-bold">
                  第{chapter.id}章
                </span>
                {!unlocked && (
                  <span className="text-white/40 text-xl">🔒</span>
                )}
                {unlocked && progress.cleared === progress.total && (
                  <span className="text-hunter-gold text-xl">⭐</span>
                )}
              </div>

              {/* タイトル */}
              <h3 className="text-xl font-bold text-white mb-1">
                {chapter.name}
              </h3>
              <p className="text-hunter-gold/60 text-sm mb-2">
                {chapter.japaneseName}
              </p>

              {/* 説明 */}
              <p className="text-white/60 text-sm mb-4">{chapter.description}</p>

              {/* 進捗バー */}
              {unlocked && (
                <div>
                  <div className="flex justify-between text-xs text-white/40 mb-1">
                    <span>進捗</span>
                    <span>
                      {progress.cleared}/{progress.total}
                    </span>
                  </div>
                  <div className="h-2 bg-hunter-dark rounded-full overflow-hidden">
                    <div
                      className="h-full bg-hunter-gold transition-all"
                      style={{
                        width: `${(progress.cleared / progress.total) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default LevelSelectScreen;
