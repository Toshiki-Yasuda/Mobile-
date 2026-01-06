/**
 * ステージ選択画面コンポーネント
 * ダークテーマ
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { useProgressStore } from '@/stores/progressStore';
import { useButtonClick, useStageSelect } from '@/utils/soundUtils';
import { BackgroundEffect } from '@/components/common/BackgroundEffect';
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
      <div className="min-h-screen bg-hunter-dark flex items-center justify-center">
        <div className="text-center">
          <div className="text-error mb-4">チャプターが見つかりません</div>
          <button
            onClick={handleClick(() => navigateTo('levelSelect'))}
            className="text-hunter-gold hover:text-hunter-gold-light transition"
          >
            ← チャプター選択に戻る
          </button>
        </div>
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

  // ステージの解放状態を判定
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
            className="text-hunter-gold/60 hover:text-hunter-gold transition mb-4"
          >
            ← チャプター選択に戻る
          </button>
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-2">
            第{chapter.id}章 {chapter.name}
          </h1>
          <p className="text-hunter-gold/60">{chapter.japaneseName}</p>
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
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                onClick={unlocked ? handleStageClick(() => handleStageSelect(stage.number)) : undefined}
                disabled={!unlocked}
                whileHover={unlocked ? { scale: 1.02, y: -2 } : {}}
                whileTap={unlocked ? { scale: 0.98 } : {}}
                className={`relative text-left p-6 rounded-xl transition-all ${
                  unlocked
                    ? 'bg-hunter-dark-light/50 border border-hunter-gold/20 hover:border-hunter-gold/40 cursor-pointer'
                    : 'bg-hunter-dark-light/20 border border-white/5 opacity-50 cursor-not-allowed'
                }`}
              >
                {/* クリアバッジ */}
                {cleared && (
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

                {/* ステージ番号 */}
                <div className="text-hunter-gold/60 text-xs uppercase tracking-widest mb-2">
                  ステージ {stage.number}
                </div>

                {/* タイトル */}
                <h3 className="text-xl font-bold text-white mb-1">
                  {stage.name}
                </h3>
                <p className="text-white/50 text-sm mb-4">{stage.description}</p>

                {/* クリア情報 */}
                {cleared && result && (
                  <div className="flex gap-4 text-sm">
                    <span className="text-hunter-gold">
                      🏆 {result.score.toLocaleString()}
                    </span>
                    <span className="text-success">
                      🎯 {result.accuracy.toFixed(1)}%
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
