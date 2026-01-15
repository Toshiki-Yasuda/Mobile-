/**
 * ステージ選択画面コンポーネント
 * クールデザイン
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { useProgressStore } from '@/stores/progressStore';
import { useButtonClick, useStageSelect } from '@/utils/soundUtils';
import { BackgroundEffect } from '@/components/common/BackgroundEffect';
import { getWordsForStage } from '@/data/words';

const CHAPTERS = [
  {
    id: 1, kanji: 'ハンター試験編', romaji: 'HUNTER EXAM',
    stages: [
      { number: 1, name: '母音の基礎', description: 'あいうえお' },
      { number: 2, name: 'ホームポジション', description: '基本の指配置' },
      { number: 3, name: '短い名前', description: 'ゴン、ジン など' },
      { number: 4, name: '主要キャラ', description: 'キルア、クラピカ など' },
      { number: 5, name: '試験用語', description: 'ハンター試験の言葉' },
      { number: 6, name: 'ボスステージ', description: '総合チャレンジ' },
    ],
  },
  {
    id: 2, kanji: '天空闘技場編', romaji: 'HEAVENS ARENA',
    stages: [
      { number: 1, name: '念の基礎', description: '念能力の用語' },
      { number: 2, name: '四大行', description: '纏・絶・練・発' },
      { number: 3, name: '系統', description: '六つの系統' },
      { number: 4, name: '闘技場用語', description: 'フロアマスターなど' },
      { number: 5, name: '応用技', description: '堅・凝・周・流など' },
      { number: 6, name: 'ボスステージ', description: '総合チャレンジ' },
    ],
  },
  {
    id: 3, kanji: '幻影旅団編', romaji: 'PHANTOM TROUPE',
    stages: [
      { number: 1, name: '旅団メンバー', description: 'クロロ、ノブナガなど' },
      { number: 2, name: '旅団用語', description: '蜘蛛の言葉' },
      { number: 3, name: '念能力①', description: '旅団の能力' },
      { number: 4, name: '念能力②', description: '旅団の能力（続）' },
      { number: 5, name: '名セリフ', description: '印象的なセリフ' },
      { number: 6, name: 'ボスステージ', description: '総合チャレンジ' },
    ],
  },
  {
    id: 4, kanji: 'ヨークシン編', romaji: 'YORKNEW CITY',
    stages: [
      { number: 1, name: '登場人物', description: 'ヨークシンのキャラ' },
      { number: 2, name: 'オークション', description: '地下競売の用語' },
      { number: 3, name: 'マフィア', description: '十老頭など' },
      { number: 4, name: '念能力', description: 'クラピカの能力など' },
      { number: 5, name: '名場面', description: '印象的な場面' },
      { number: 6, name: 'ボスステージ', description: '総合チャレンジ' },
    ],
  },
  {
    id: 5, kanji: 'G・I編', romaji: 'GREED ISLAND',
    stages: [
      { number: 1, name: 'GIキャラ', description: 'ビスケ、レイザーなど' },
      { number: 2, name: 'カード', description: 'スペルカード' },
      { number: 3, name: 'ゲーム用語', description: 'GIの用語' },
      { number: 4, name: '念能力', description: 'GIの能力' },
      { number: 5, name: '修行', description: 'ゴンの成長' },
      { number: 6, name: 'ボスステージ', description: '総合チャレンジ' },
    ],
  },
  {
    id: 6, kanji: 'キメラアント編', romaji: 'CHIMERA ANT',
    stages: [
      { number: 1, name: 'キメラアント', description: 'メルエム、護衛軍など' },
      { number: 2, name: 'キメラアント用語', description: '女王、王など' },
      { number: 3, name: '討伐隊の能力', description: '百式観音など' },
      { number: 4, name: '宮殿攻略', description: '作戦の用語' },
      { number: 5, name: 'ゴンの成長', description: '約束と怒り' },
      { number: 6, name: '最終決戦', description: '総合チャレンジ' },
    ],
  },
  {
    id: 7, kanji: '選挙・暗黒大陸編', romaji: 'ELECTION & DARK CONTINENT',
    stages: [
      { number: 1, name: '選挙編キャラ', description: '十二支ん' },
      { number: 2, name: 'アルカ・ナニカ編', description: 'キルアの妹' },
      { number: 3, name: '暗黒大陸の脅威', description: '五大厄災' },
      { number: 4, name: '王位継承戦', description: 'カキン帝国' },
      { number: 5, name: '旅団追加メンバー', description: '新メンバー' },
      { number: 6, name: '高度な念能力', description: '総合チャレンジ' },
    ],
  },
];

export const StageSelectScreen: React.FC = () => {
  const { selectedChapter, selectStage, navigateTo, startSession, startBossBattle } = useGameStore();
  const { isStageCleared, getStageResult, isBossDefeated } = useProgressStore();
  const { handleClick } = useButtonClick();
  const { handleSelect: handleStageClick } = useStageSelect();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const chapter = CHAPTERS.find((c) => c.id === selectedChapter);

  const isStageUnlocked = useCallback((stageNumber: number) => {
    if (stageNumber === 1) return true;
    const previousStageId = `${selectedChapter}-${stageNumber - 1}`;
    return isStageCleared(previousStageId);
  }, [selectedChapter, isStageCleared]);

  const handleStageSelect = useCallback((stageNumber: number) => {
    if (!isStageUnlocked(stageNumber)) return;

    // ボスステージ（Stage 6）の場合
    if (stageNumber === 6) {
      startBossBattle(selectedChapter);
      return;
    }

    // 通常ステージの処理
    const stageId = `${selectedChapter}-${stageNumber}`;
    const words = getWordsForStage(stageId);

    if (words.length === 0) {
      console.warn(`Stage ${stageId} has no word data`);
      return;
    }

    selectStage(selectedChapter, stageNumber);
    startSession(words);
    navigateTo('typing');
  }, [selectedChapter, isStageUnlocked, selectStage, startSession, navigateTo, startBossBattle]);

  // キーボード操作
  useEffect(() => {
    if (!chapter) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const stageCount = chapter.stages.length;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev - 3 + stageCount) % stageCount);
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev + 3) % stageCount);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + stageCount) % stageCount);
          break;
        case 'ArrowRight':
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % stageCount);
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          handleStageClick(() => handleStageSelect(chapter.stages[selectedIndex].number))();
          break;
        case 'Escape':
          e.preventDefault();
          handleClick(() => navigateTo('levelSelect'))();
          break;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
          const num = parseInt(e.key);
          if (num <= stageCount) {
            setSelectedIndex(num - 1);
            handleStageClick(() => handleStageSelect(num))();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [chapter, selectedIndex, handleStageSelect, handleStageClick, handleClick, navigateTo]);

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

            const isBoss = stage.number === 6;
            const bossDefeated = isBoss && isBossDefeated(`boss_chapter${selectedChapter}`);

            return (
              <motion.button
                key={stage.number}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: selectedIndex === index ? -2 : 0 }}
                transition={{ delay: index * 0.08 }}
                onClick={unlocked ? handleStageClick(() => handleStageSelect(stage.number)) : undefined}
                onMouseEnter={() => setSelectedIndex(index)}
                disabled={!unlocked}
                whileHover={unlocked ? { scale: 1.02, y: -2 } : {}}
                whileTap={unlocked ? { scale: 0.98 } : {}}
                className={`relative text-left p-5 rounded-lg transition-all ${
                  unlocked
                    ? selectedIndex === index
                      ? isBoss && bossDefeated
                        ? 'bg-purple-900/30 border-2 border-purple-400/70 cursor-pointer ring-2 ring-purple-400/30'
                        : 'bg-hunter-dark-light/60 border-2 border-hunter-gold/70 cursor-pointer ring-2 ring-hunter-gold/30'
                      : isBoss && bossDefeated
                      ? 'bg-purple-900/20 border border-purple-400/20 hover:border-purple-400/50 cursor-pointer'
                      : 'bg-hunter-dark-light/40 border border-hunter-gold/20 hover:border-hunter-gold/50 cursor-pointer'
                    : 'bg-hunter-dark-light/10 border border-white/5 opacity-40 cursor-not-allowed'
                }`}
              >
                {/* ボス撃破マーク / クリアマーク */}
                {isBoss && bossDefeated ? (
                  <div className="absolute top-3 right-3 w-6 h-6 bg-purple-500/20 rounded flex items-center justify-center">
                    <span className="text-purple-300 text-xs">⭐</span>
                  </div>
                ) : cleared && !isBoss ? (
                  <div className="absolute top-3 right-3 w-6 h-6 bg-success/20 rounded flex items-center justify-center">
                    <span className="text-success text-xs">✓</span>
                  </div>
                ) : null}

                {/* ロック */}
                {!unlocked && (
                  <div className="absolute top-3 right-3 text-white/30 text-lg">
                    ⬡
                  </div>
                )}

                {/* ステージ番号 & ボスアイコン */}
                <div className="flex items-center justify-between font-title text-hunter-gold/50 text-xs tracking-[0.3em] mb-2">
                  <span>STAGE {String(stage.number).padStart(2, '0')}</span>
                  {stage.number === 6 && (
                    <span className="text-orange-500 text-sm">👹 BOSS</span>
                  )}
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
