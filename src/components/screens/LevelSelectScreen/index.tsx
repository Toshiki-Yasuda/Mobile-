/**
 * レベル選択画面コンポーネント
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { useProgressStore } from '@/stores/progressStore';
import { useButtonClick, useMenuSelect } from '@/utils/soundUtils';

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

  const handleChapterClick = handleSelect(() => {
    // この関数は実際には使わない（個別のボタンで使用）
  });

  return (
    <div className="screen-container bg-background">
      {/* ヘッダー */}
      <div className="w-full max-w-4xl mb-12">
        <button
          onClick={handleClick(() => navigateTo('title'))}
          className="text-secondary hover:text-primary transition-colors text-sm mb-6"
        >
          ← タイトルに戻る
        </button>
        <h1 className="text-2xl font-bold text-primary">修行の章を選択</h1>
      </div>

      {/* チャプターリスト */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {CHAPTERS.map((chapter, index) => {
          const unlocked = isChapterUnlocked(chapter.id);
          const progress = getChapterProgress(chapter.id);

          return (
            <motion.button
              key={chapter.id}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              onClick={unlocked ? handleSelect(() => handleChapterSelect(chapter.id)) : undefined}
              disabled={!unlocked}
              whileHover={unlocked ? { scale: 1.02, y: -2 } : {}}
              whileTap={unlocked ? { scale: 0.98 } : {}}
              className={`card text-left transition-all ${
                unlocked
                  ? 'hover:border-accent/50 cursor-pointer hover:shadow-glow'
                  : 'opacity-40 cursor-not-allowed'
              }`}
            >
              {/* チャプター番号 */}
              <div className="flex items-start justify-between mb-3">
                <span className="text-muted text-xs uppercase tracking-wider font-medium">
                  第{chapter.id}章
                </span>
                {!unlocked && (
                  <span className="text-muted text-lg">🔒</span>
                )}
                {unlocked && progress.cleared === progress.total && (
                  <span className="text-accent text-lg">✓</span>
                )}
              </div>

              {/* タイトル */}
              <h3 className="text-lg font-medium text-primary mb-1">
                {chapter.name}
              </h3>
              <p className="text-secondary text-sm mb-3">
                {chapter.japaneseName}
              </p>

              {/* 説明 */}
              <p className="text-muted text-sm mb-4">{chapter.description}</p>

              {/* 進捗バー */}
              {unlocked && (
                <div>
                  <div className="flex justify-between text-xs text-muted mb-2">
                    <span className="uppercase tracking-wider">進捗</span>
                    <span>
                      {progress.cleared}/{progress.total}
                    </span>
                  </div>
                  <div className="h-1 bg-background rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent transition-all"
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
