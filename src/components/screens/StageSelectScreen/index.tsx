/**
 * ステージ選択画面コンポーネント
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { useProgressStore } from '@/stores/progressStore';
import { useButtonClick, useStageSelect } from '@/utils/soundUtils';
import { getWordsForStage } from '@/data/words';

// チャプター情報
const CHAPTERS = [
  {
    id: 1,
    name: '念の基礎',
    japaneseName: 'ホームポジション編',
    stages: [
      { number: 1, name: '基本の母音', description: 'あいうえおの基礎' },
      { number: 2, name: 'ホームポジション基礎', description: '基本の指使い' },
      { number: 3, name: 'キャラクター名（短め）', description: 'ゴン、ジンなど' },
      { number: 4, name: '主要キャラクター', description: 'キルア、クラピカなど' },
      { number: 5, name: 'ハンター試験用語', description: '試験関連の単語' },
      { number: 6, name: 'ボスステージ', description: '複合的な単語' },
    ],
  },
  {
    id: 2,
    name: '纏（テン）',
    japaneseName: '基本入力編',
    stages: [
      { number: 1, name: 'ステージ2-1', description: '基本入力編のステージ1' },
      { number: 2, name: 'ステージ2-2', description: '基本入力編のステージ2' },
      { number: 3, name: 'ステージ2-3', description: '基本入力編のステージ3' },
      { number: 4, name: 'ステージ2-4', description: '基本入力編のステージ4' },
      { number: 5, name: 'ステージ2-5', description: '基本入力編のステージ5' },
      { number: 6, name: 'ステージ2-6', description: '基本入力編のステージ6' },
    ],
  },
  {
    id: 3,
    name: '絶（ゼツ）',
    japaneseName: '天空闘技場編',
    stages: [
      { number: 1, name: 'ステージ3-1', description: '天空闘技場編のステージ1' },
      { number: 2, name: 'ステージ3-2', description: '天空闘技場編のステージ2' },
      { number: 3, name: 'ステージ3-3', description: '天空闘技場編のステージ3' },
      { number: 4, name: 'ステージ3-4', description: '天空闘技場編のステージ4' },
      { number: 5, name: 'ステージ3-5', description: '天空闘技場編のステージ5' },
      { number: 6, name: 'ステージ3-6', description: '天空闘技場編のステージ6' },
    ],
  },
  {
    id: 4,
    name: '練（レン）',
    japaneseName: 'ヨークシン編',
    stages: [
      { number: 1, name: 'ステージ4-1', description: 'ヨークシン編のステージ1' },
      { number: 2, name: 'ステージ4-2', description: 'ヨークシン編のステージ2' },
      { number: 3, name: 'ステージ4-3', description: 'ヨークシン編のステージ3' },
      { number: 4, name: 'ステージ4-4', description: 'ヨークシン編のステージ4' },
      { number: 5, name: 'ステージ4-5', description: 'ヨークシン編のステージ5' },
      { number: 6, name: 'ステージ4-6', description: 'ヨークシン編のステージ6' },
    ],
  },
  {
    id: 5,
    name: '発（ハツ）',
    japaneseName: 'グリードアイランド編',
    stages: [
      { number: 1, name: 'ステージ5-1', description: 'グリードアイランド編のステージ1' },
      { number: 2, name: 'ステージ5-2', description: 'グリードアイランド編のステージ2' },
      { number: 3, name: 'ステージ5-3', description: 'グリードアイランド編のステージ3' },
      { number: 4, name: 'ステージ5-4', description: 'グリードアイランド編のステージ4' },
      { number: 5, name: 'ステージ5-5', description: 'グリードアイランド編のステージ5' },
      { number: 6, name: 'ステージ5-6', description: 'グリードアイランド編のステージ6' },
    ],
  },
  {
    id: 6,
    name: '極意',
    japaneseName: 'キメラアント編',
    stages: [
      { number: 1, name: 'ステージ6-1', description: 'キメラアント編のステージ1' },
      { number: 2, name: 'ステージ6-2', description: 'キメラアント編のステージ2' },
      { number: 3, name: 'ステージ6-3', description: 'キメラアント編のステージ3' },
      { number: 4, name: 'ステージ6-4', description: 'キメラアント編のステージ4' },
      { number: 5, name: 'ステージ6-5', description: 'キメラアント編のステージ5' },
      { number: 6, name: 'ステージ6-6', description: 'キメラアント編のステージ6' },
    ],
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
      <div className="screen-container bg-background">
        <div className="text-error mb-4">チャプターが見つかりません</div>
        <button
          onClick={handleClick(() => navigateTo('levelSelect'))}
          className="text-secondary hover:text-primary transition-colors text-sm"
        >
          ← チャプター選択に戻る
        </button>
      </div>
    );
  }

  const handleStageSelect = (stageNumber: number) => {
    const stageId = `${selectedChapter}-${stageNumber}`;
    const words = getWordsForStage(stageId);
    
    if (words.length === 0) {
      console.warn(`ステージ ${stageId} の単語データが見つかりません`);
      return;
    }

    selectStage(selectedChapter, stageNumber);
    startSession(words);
    navigateTo('typing');
  };

  // ステージの解放状態を判定（最初のステージは常に解放、それ以降は前のステージをクリアしていれば解放）
  const isStageUnlocked = (stageNumber: number) => {
    if (stageNumber === 1) return true;
    const previousStageId = `${selectedChapter}-${stageNumber - 1}`;
    return isStageCleared(previousStageId);
  };

  return (
    <div className="screen-container bg-background">
      {/* ヘッダー */}
      <div className="w-full max-w-4xl mb-12">
        <button
          onClick={handleClick(() => navigateTo('levelSelect'))}
          className="text-secondary hover:text-primary transition-colors text-sm mb-6"
        >
          ← チャプター選択に戻る
        </button>
        <h1 className="text-2xl font-bold text-primary mb-1">
          第{chapter.id}章 {chapter.name}
        </h1>
        <p className="text-secondary text-sm">{chapter.japaneseName}</p>
      </div>

      {/* ステージリスト */}
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {chapter.stages.map((stage, index) => {
          const stageId = `${selectedChapter}-${stage.number}`;
          const unlocked = isStageUnlocked(stage.number);
          const cleared = isStageCleared(stageId);
          const result = getStageResult(stageId);

          return (
            <motion.button
              key={stage.number}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: index * 0.1, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
              onClick={unlocked ? handleStageClick(() => handleStageSelect(stage.number)) : undefined}
              disabled={!unlocked}
              whileHover={unlocked ? { scale: 1.02, y: -2 } : {}}
              whileTap={unlocked ? { scale: 0.98 } : {}}
              className={`card text-left transition-all ${
                unlocked
                  ? 'hover:border-accent/50 cursor-pointer hover:shadow-glow'
                  : 'opacity-40 cursor-not-allowed'
              }`}
            >
              {/* ステージ番号 */}
              <div className="flex items-start justify-between mb-3">
                <span className="text-muted text-xs uppercase tracking-wider font-medium">
                  ステージ {stage.number}
                </span>
                {!unlocked && (
                  <span className="text-muted text-lg">🔒</span>
                )}
                {cleared && (
                  <span className="text-accent text-lg">✓</span>
                )}
              </div>

              {/* タイトル */}
              <h3 className="text-lg font-medium text-primary mb-1">
                {stage.name}
              </h3>
              <p className="text-muted text-sm mb-4">{stage.description}</p>

              {/* クリア情報 */}
              {cleared && result && (
                <div className="text-xs text-secondary space-x-3">
                  <span>スコア: {result.score.toLocaleString()}</span>
                  <span>精度: {result.accuracy.toFixed(1)}%</span>
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};

export default StageSelectScreen;

