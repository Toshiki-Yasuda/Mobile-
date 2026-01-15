/**
 * 結果画面コンポーネント
 *
 * サブコンポーネント:
 * - ParticleEffects: ゴールド・新記録パーティクル
 * - StatCard: 統計情報カード
 * - useResultCalculation: 結果計算ロジック
 */

import React, { useEffect, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { useProgressStore } from '@/stores/progressStore';
import { useSound } from '@/hooks/useSound';
import { BackgroundEffect } from '@/components/common/BackgroundEffect';
import { GoldParticles, NewRecordParticles, NewRecordBanner } from './ParticleEffects';
import { StatCard } from './StatCard';
import { useResultCalculation } from './useResultCalculation';
import { RANK_CONFIGS, CHAPTER_STAGE_COUNTS } from './resultConstants';
import type { StageResult } from '@/types/progress';

export const ResultScreen: React.FC = () => {
  const { session, navigateTo, resetSession, selectedChapter, selectedStage } = useGameStore();
  const { saveStageResult, updateStatistics, updateStreak, clearedStages, unlockChapter } = useProgressStore();
  const { playSuccessSound, playResultSound, playAchievementSound } = useSound();

  const [previousResult, setPreviousResult] = useState<StageResult | null>(null);
  const [showNewRecord, setShowNewRecord] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [selectedButton, setSelectedButton] = useState(0);

  const stageId = selectedChapter && selectedStage ? `${selectedChapter}-${selectedStage}` : null;

  // 結果計算フックを使用
  const { result, isNewRecord, scoreDiff, hasNextStage, formatDiff } = useResultCalculation({
    session,
    selectedChapter,
    selectedStage,
    previousResult,
  });

  // 初期化
  useEffect(() => {
    if (!hasInitialized && stageId) {
      const existing = clearedStages[stageId];
      if (existing) setPreviousResult(existing);
      setHasInitialized(true);
    }
  }, [hasInitialized, stageId, clearedStages]);

  // 結果保存・サウンド
  useEffect(() => {
    if (!result || !stageId || !hasInitialized) return;

    setTimeout(() => {
      playSuccessSound();
      setTimeout(() => playResultSound(result.rank), 400);
    }, 300);

    if (isNewRecord) {
      setTimeout(() => {
        setShowNewRecord(true);
        playAchievementSound(result.rank);
      }, 800);
    }

    updateStreak();
    updateStatistics({
      totalPlays: 1,
      totalTypedChars: result.correctCount + result.missCount,
      totalCorrect: result.correctCount,
      totalMiss: result.missCount,
      totalPlayTime: result.totalTime * 1000,
      bestWPM: result.wpm,
    });

    saveStageResult(stageId, {
      score: result.score,
      accuracy: result.accuracy,
      wpm: result.wpm,
      time: result.totalTime * 1000,
      maxCombo: result.maxCombo,
      rank: result.rank,
      clearedAt: new Date().toISOString(),
    });

    const totalStagesInChapter = CHAPTER_STAGE_COUNTS[selectedChapter] || 0;
    const clearedCount = Object.keys(clearedStages)
      .filter(id => id.startsWith(`${selectedChapter}-`)).length;
    const willBeCleared = clearedCount + (clearedStages[stageId] ? 0 : 1);

    if (willBeCleared >= totalStagesInChapter) {
      const nextChapter = selectedChapter + 1;
      if (CHAPTER_STAGE_COUNTS[nextChapter]) unlockChapter(nextChapter);
    }
  }, [
    result,
    stageId,
    hasInitialized,
    isNewRecord,
    updateStreak,
    updateStatistics,
    saveStageResult,
    selectedChapter,
    clearedStages,
    unlockChapter,
    playSuccessSound,
    playResultSound,
    playAchievementSound,
  ]);

  const handleNextStage = useCallback(() => {
    resetSession();
    if (hasNextStage) {
      const { selectStage, navigateTo: nav } = useGameStore.getState();
      selectStage(selectedChapter, selectedStage + 1);
      nav('typing');
    } else {
      navigateTo('stageSelect');
    }
  }, [resetSession, hasNextStage, selectedChapter, selectedStage, navigateTo]);

  const handleRetry = useCallback(() => {
    resetSession();
    navigateTo('typing');
  }, [resetSession, navigateTo]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowRight':
        case 'ArrowUp':
        case 'ArrowDown':
          e.preventDefault();
          setSelectedButton(prev => (prev + 1) % 2);
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          if (selectedButton === 0) {
            handleNextStage();
          } else {
            handleRetry();
          }
          break;
        case 'Escape':
          e.preventDefault();
          navigateTo('stageSelect');
          break;
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleNextStage, handleRetry, navigateTo, selectedButton]);

  if (!result) {
    return (
      <div className="min-h-screen bg-hunter-dark flex items-center justify-center">
        <div className="font-title text-hunter-gold tracking-wider">CALCULATING...</div>
      </div>
    );
  }

  const rankConfig = RANK_CONFIGS[result.rank];

  return (
    <div className="min-h-screen bg-hunter-dark relative overflow-hidden">
      <BackgroundEffect variant="result" />

      {result.rank === 'S' && <GoldParticles />}
      {showNewRecord && <NewRecordParticles />}

      <AnimatePresence>{showNewRecord && <NewRecordBanner />}</AnimatePresence>

      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row items-center justify-center p-4 lg:p-8">
        {/* 左側 - ランク表示 */}
        <div className="flex-1 flex flex-col items-center justify-center lg:pr-8 xl:pr-16 mb-8 lg:mb-0">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', duration: 1, bounce: 0.4 }}
            className="mb-6 lg:mb-8"
          >
            <div
              className={`w-32 h-32 lg:w-40 lg:h-40 flex items-center justify-center font-title text-6xl lg:text-7xl font-bold border-2 ${rankConfig.borderColor} ${rankConfig.bgColor}`}
              style={{
                clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                boxShadow: `0 0 30px ${rankConfig.glowColor}`,
              }}
            >
              <span className={rankConfig.textColor}>{result.rank}</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            onAnimationComplete={() => setTimeout(() => playAchievementSound(result.rank), 100)}
            className="text-center"
          >
            <h1 className={`font-title text-2xl lg:text-3xl font-bold mb-2 tracking-wider ${rankConfig.textColor}`}>
              {rankConfig.message}
            </h1>
            <p className="text-white/50 text-sm font-title tracking-wider">{rankConfig.subMessage}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="hidden lg:block mt-8 text-center"
          >
            <div className="font-title text-hunter-gold/50 text-xs tracking-[0.3em] mb-1">TOTAL SCORE</div>
            <div className="font-title text-5xl xl:text-6xl font-bold text-white tracking-tight">
              {result.score.toLocaleString()}
            </div>
            {scoreDiff && scoreDiff.score !== 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className={`font-title text-lg mt-2 ${scoreDiff.score > 0 ? 'text-success' : 'text-error'}`}
              >
                {formatDiff(scoreDiff.score)}
              </motion.div>
            )}
          </motion.div>
        </div>

        {/* 右側 - 詳細結果 */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-md lg:max-w-lg"
        >
          <div className="relative p-6 lg:p-8 bg-hunter-dark-light/30 rounded-lg border border-hunter-gold/20">
            {/* モバイル用スコア */}
            <div className="lg:hidden text-center mb-6 pb-6 border-b border-hunter-gold/10">
              <div className="font-title text-hunter-gold/50 text-xs tracking-[0.3em] mb-1">TOTAL SCORE</div>
              <div className="font-title text-4xl font-bold text-white">{result.score.toLocaleString()}</div>
              {scoreDiff && scoreDiff.score !== 0 && (
                <div className={`font-title text-sm mt-1 ${scoreDiff.score > 0 ? 'text-success' : 'text-error'}`}>
                  {formatDiff(scoreDiff.score)}
                </div>
              )}
            </div>

            {/* 統計グリッド */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <StatCard
                label="ACCURACY"
                value={`${result.accuracy}%`}
                highlight={result.accuracy >= 95}
                diff={scoreDiff?.accuracy}
                diffSuffix="%"
              />
              <StatCard
                label="WPM"
                value={result.wpm.toString()}
                highlight={result.wpm >= 80}
                diff={scoreDiff?.wpm}
              />
              <StatCard label="MAX COMBO" value={result.maxCombo.toString()} highlight={result.maxCombo >= 20} />
              <StatCard label="TIME" value={`${result.totalTime}s`} />
            </div>

            {/* 詳細統計 */}
            <div className="space-y-2 mb-6 p-4 bg-hunter-dark/50 rounded-lg">
              <div className="flex justify-between items-center">
                <span className="text-white/40 text-sm font-title tracking-wider">CORRECT</span>
                <span className="text-success font-bold font-title">{result.correctCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/40 text-sm font-title tracking-wider">MISS</span>
                <span className="text-error font-bold font-title">{result.missCount}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/40 text-sm font-title tracking-wider">TOTAL</span>
                <span className="text-white font-bold font-title">{result.correctCount + result.missCount}</span>
              </div>
            </div>

            {/* アクションボタン */}
            <div className="flex flex-col sm:flex-row gap-3">
              <motion.button
                onClick={handleNextStage}
                onMouseEnter={() => setSelectedButton(0)}
                className={`flex-1 text-white font-title font-bold py-3 px-6 rounded-lg transition-all tracking-wider uppercase text-sm ${
                  selectedButton === 0
                    ? 'bg-hunter-green-light ring-2 ring-hunter-gold'
                    : 'bg-hunter-green hover:bg-hunter-green-light'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                animate={selectedButton === 0 ? { scale: 1.02 } : { scale: 1 }}
              >
                {hasNextStage ? 'NEXT →' : 'SELECT STAGE'}
                <span className="text-xs opacity-60 ml-2">[ENTER]</span>
              </motion.button>

              <motion.button
                onClick={handleRetry}
                onMouseEnter={() => setSelectedButton(1)}
                className={`flex-1 bg-transparent text-white font-title font-bold py-3 px-6 rounded-lg transition-all tracking-wider uppercase text-sm ${
                  selectedButton === 1
                    ? 'border-2 border-hunter-gold ring-2 ring-hunter-gold/50'
                    : 'border border-hunter-gold/30 hover:border-hunter-gold/60'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                animate={selectedButton === 1 ? { scale: 1.02 } : { scale: 1 }}
              >
                RETRY
                <span className="text-xs opacity-60 ml-2">[←/→]</span>
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ResultScreen;
