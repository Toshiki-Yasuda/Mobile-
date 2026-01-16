/**
 * 管理者画面コンポーネント
 * クールデザイン
 */

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { useProgressStore } from '@/stores/progressStore';
import { useButtonClick } from '@/utils/soundUtils';
import { bgmManager } from '@/utils/bgmManager';

const CHAPTERS = [
  { id: 1, name: 'BASICS', subtitle: '念の基礎' },
  { id: 2, name: 'TEN', subtitle: '纏' },
  { id: 3, name: 'ZETSU', subtitle: '絶' },
  { id: 4, name: 'REN', subtitle: '練' },
  { id: 5, name: 'HATSU', subtitle: '発' },
  { id: 6, name: 'MASTER', subtitle: '極意' },
  { id: 7, name: 'NEW ERA', subtitle: '新章' },
];

// 各チャプターのステージ数
const STAGES_PER_CHAPTER = 6;

export const AdminScreen: React.FC = () => {
  const { navigateTo } = useGameStore();
  const {
    isChapterUnlocked,
    unlockChapter,
    lockChapter,
    resetAllProgress,
    isStageCleared,
    clearStage,
    unclearStage,
    isBossDefeated,
    markBossDefeated,
    unmarkBossDefeated,
  } = useProgressStore();
  const { handleClick } = useButtonClick();
  const adminAudioRef = useRef<HTMLAudioElement | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);

  useEffect(() => {
    bgmManager.pause();

    adminAudioRef.current = new Audio('/Mobile-/march.mp3');
    adminAudioRef.current.loop = true;
    adminAudioRef.current.volume = 0.3;
    adminAudioRef.current.play().catch(() => {});

    return () => {
      if (adminAudioRef.current) {
        adminAudioRef.current.pause();
        adminAudioRef.current = null;
      }
      bgmManager.play();
    };
  }, []);

  // キーボード操作
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        navigateTo('title');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigateTo]);

  const handleUnlockAll = () => CHAPTERS.forEach((c) => unlockChapter(c.id));
  const handleReset = () => { if (confirm('Reset all progress?')) resetAllProgress(); };

  // 選択したチャプターの全ステージをクリア
  const handleClearAllStages = (chapterId: number) => {
    for (let i = 1; i <= STAGES_PER_CHAPTER; i++) {
      clearStage(`${chapterId}-${i}`);
    }
    // ボスも撃破扱いに
    markBossDefeated(`boss_chapter${chapterId}`);
  };

  // 選択したチャプターの全ステージをリセット
  const handleResetAllStages = (chapterId: number) => {
    for (let i = 1; i <= STAGES_PER_CHAPTER; i++) {
      unclearStage(`${chapterId}-${i}`);
    }
    // ボス撃破も取り消し
    unmarkBossDefeated(`boss_chapter${chapterId}`);
  };

  return (
    <div className="min-h-screen bg-hunter-dark relative overflow-hidden">
      {/* 背景グリッド */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `linear-gradient(rgba(212,175,55,0.5) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(212,175,55,0.5) 1px, transparent 1px)`,
          backgroundSize: '30px 30px',
        }}
      />

      {/* コンテンツ */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* ヘッダー */}
        <header className="p-4 lg:p-6 border-b border-hunter-gold/10">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <button
              onClick={handleClick(() => navigateTo('title'))}
              className="font-title text-hunter-gold/60 hover:text-hunter-gold transition tracking-wider text-sm uppercase"
            >
              ← EXIT
            </button>
            <h1 className="font-title text-xl lg:text-2xl font-bold text-white tracking-wider">
              ADMIN MODE
            </h1>
            <div className="w-16" />
          </div>
        </header>

        {/* メインコンテンツ */}
        <main className="flex-1 p-4 lg:p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* チャプター管理 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-hunter-dark-light/30 rounded-lg border border-hunter-gold/20 p-6"
            >
              <h2 className="font-title text-lg font-bold text-white tracking-wider mb-4">
                CHAPTER UNLOCK STATUS
              </h2>
              <div className="space-y-3">
                {CHAPTERS.map((chapter, index) => {
                  const unlocked = isChapterUnlocked(chapter.id);
                  return (
                    <motion.div
                      key={chapter.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-3 bg-hunter-dark/50 rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={`w-3 h-3 rounded-full ${unlocked ? 'bg-success' : 'bg-error'}`}
                        />
                        <div>
                          <span className="font-title text-white font-bold tracking-wider">
                            {chapter.name}
                          </span>
                          <span className="text-hunter-gold/60 ml-2 text-sm">{chapter.subtitle}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => unlocked ? lockChapter(chapter.id) : unlockChapter(chapter.id)}
                        className={`font-title text-sm tracking-wider px-4 py-2 rounded transition-all ${
                          unlocked
                            ? 'bg-error/10 text-error hover:bg-error/20 border border-error/30'
                            : 'bg-success/10 text-success hover:bg-success/20 border border-success/30'
                        }`}
                      >
                        {unlocked ? 'LOCK' : 'UNLOCK'}
                      </button>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            {/* ステージ管理 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-hunter-dark-light/30 rounded-lg border border-purple-500/20 p-6"
            >
              <h2 className="font-title text-lg font-bold text-white tracking-wider mb-4">
                STAGE UNLOCK STATUS
              </h2>

              {/* チャプター選択 */}
              <div className="flex flex-wrap gap-2 mb-4">
                {CHAPTERS.map((chapter) => (
                  <button
                    key={chapter.id}
                    onClick={() => setSelectedChapter(selectedChapter === chapter.id ? null : chapter.id)}
                    className={`px-3 py-1 rounded text-sm font-title tracking-wider transition-all ${
                      selectedChapter === chapter.id
                        ? 'bg-purple-500 text-white'
                        : 'bg-hunter-dark/50 text-white/60 hover:text-white hover:bg-hunter-dark-light'
                    }`}
                  >
                    CH{chapter.id}
                  </button>
                ))}
              </div>

              {/* 選択したチャプターのステージ */}
              {selectedChapter && (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {Array.from({ length: STAGES_PER_CHAPTER }, (_, i) => i + 1).map((stageNum) => {
                      const stageId = `${selectedChapter}-${stageNum}`;
                      const cleared = isStageCleared(stageId);
                      const isBoss = stageNum === 6;
                      const bossDefeated = isBoss && isBossDefeated(`boss_chapter${selectedChapter}`);

                      return (
                        <button
                          key={stageNum}
                          onClick={() => {
                            if (isBoss) {
                              if (bossDefeated) {
                                unmarkBossDefeated(`boss_chapter${selectedChapter}`);
                                unclearStage(stageId);
                              } else {
                                markBossDefeated(`boss_chapter${selectedChapter}`);
                                clearStage(stageId);
                              }
                            } else {
                              cleared ? unclearStage(stageId) : clearStage(stageId);
                            }
                          }}
                          className={`p-2 rounded text-center transition-all ${
                            isBoss
                              ? bossDefeated
                                ? 'bg-purple-500/30 border border-purple-400 text-purple-300'
                                : 'bg-hunter-dark/50 border border-purple-500/30 text-purple-400/60'
                              : cleared
                              ? 'bg-success/20 border border-success/50 text-success'
                              : 'bg-hunter-dark/50 border border-white/10 text-white/40'
                          }`}
                        >
                          <div className="text-xs font-title">
                            {isBoss ? '👹' : `S${stageNum}`}
                          </div>
                          <div className="text-[10px]">
                            {isBoss ? (bossDefeated ? '✓' : '—') : (cleared ? '✓' : '—')}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* チャプター一括操作 */}
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleClearAllStages(selectedChapter)}
                      className="flex-1 py-2 px-3 bg-success/10 hover:bg-success/20 text-success text-xs font-title tracking-wider rounded border border-success/30"
                    >
                      CLEAR ALL
                    </button>
                    <button
                      onClick={() => handleResetAllStages(selectedChapter)}
                      className="flex-1 py-2 px-3 bg-error/10 hover:bg-error/20 text-error text-xs font-title tracking-wider rounded border border-error/30"
                    >
                      RESET ALL
                    </button>
                  </div>
                </div>
              )}

              {!selectedChapter && (
                <p className="text-white/30 text-sm text-center py-4">
                  チャプターを選択してステージを管理
                </p>
              )}
            </motion.div>

            {/* アクションボタン */}
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                onClick={handleUnlockAll}
                className="flex-1 bg-hunter-green hover:bg-hunter-green-light text-white font-title font-bold py-3 px-6 rounded-lg transition-all tracking-wider uppercase text-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                UNLOCK ALL CHAPTERS
              </motion.button>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                onClick={handleReset}
                className="flex-1 bg-error/10 hover:bg-error/20 text-error font-title font-bold py-3 px-6 rounded-lg transition-all tracking-wider uppercase text-sm border border-error/30"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                RESET ALL PROGRESS
              </motion.button>
            </div>

            {/* 情報 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center text-white/20 text-sm font-title tracking-wider"
            >
              ADMIN MODE // DEBUG & TESTING
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminScreen;
