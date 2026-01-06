/**
 * 結果画面コンポーネント
 * クールデザイン
 */

import React, { useMemo, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { useProgressStore } from '@/stores/progressStore';
import { useButtonClick } from '@/utils/soundUtils';
import { useSound } from '@/hooks/useSound';
import { BackgroundEffect } from '@/components/common/BackgroundEffect';
import { chapter1Stages, chapter2Stages } from '@/data/words';
import type { Rank } from '@/types/game';

const CHAPTER_STAGE_COUNTS: Record<number, number> = {
  1: Object.keys(chapter1Stages).length,
  2: Object.keys(chapter2Stages).length,
  3: 6, 4: 6, 5: 6, 6: 6,
};

export const ResultScreen: React.FC = () => {
  const { session, navigateTo, resetSession, selectedChapter, selectedStage } = useGameStore();
  const { saveStageResult, updateStatistics, updateStreak, clearedStages, unlockChapter } = useProgressStore();
  const { handleClick } = useButtonClick();
  const { playSuccessSound, playResultSound, playAchievementSound } = useSound();

  const result = useMemo(() => {
    if (!session) return null;
    const totalTime = session.endTime ? session.endTime - (session.startTime || 0) : 0;
    const totalChars = session.correctCount + session.missCount;
    const accuracy = totalChars > 0 ? (session.correctCount / totalChars) * 100 : 0;
    const wpm = totalTime > 0 ? (session.correctCount / (totalTime / 60000)) : 0;

    let rank: Rank = 'C';
    if (accuracy >= 98 && wpm >= 100) rank = 'S';
    else if (accuracy >= 95 && wpm >= 80) rank = 'A';
    else if (accuracy >= 90 && wpm >= 60) rank = 'B';

    return {
      score: session.score,
      accuracy: Math.round(accuracy * 10) / 10,
      wpm: Math.round(wpm),
      totalTime: Math.round(totalTime / 1000),
      maxCombo: session.maxCombo,
      correctCount: session.correctCount,
      missCount: session.missCount,
      rank,
    };
  }, [session]);

  useEffect(() => {
    if (result && selectedChapter && selectedStage) {
      const stageId = `${selectedChapter}-${selectedStage}`;
      
      setTimeout(() => {
        playSuccessSound();
        setTimeout(() => playResultSound(result.rank), 400);
      }, 300);
      
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
        stageId, score: result.score, accuracy: result.accuracy,
        wpm: result.wpm, totalTime: result.totalTime * 1000,
        maxCombo: result.maxCombo, rank: result.rank,
        clearedAt: new Date().toISOString(),
      });

      const totalStagesInChapter = CHAPTER_STAGE_COUNTS[selectedChapter] || 0;
      const clearedStagesInChapter = Object.keys(clearedStages).filter(
        id => id.startsWith(`${selectedChapter}-`)
      ).length;
      const willBeCleared = clearedStagesInChapter + (clearedStages[stageId] ? 0 : 1);
      
      if (willBeCleared >= totalStagesInChapter) {
        const nextChapter = selectedChapter + 1;
        if (CHAPTER_STAGE_COUNTS[nextChapter]) unlockChapter(nextChapter);
      }
    }
  }, [result, updateStreak, updateStatistics, saveStageResult, selectedChapter, selectedStage, playSuccessSound, playResultSound, playAchievementSound, clearedStages, unlockChapter]);

  const getStageCount = useCallback((chapter: number): number => CHAPTER_STAGE_COUNTS[chapter] || 0, []);

  const hasNextStage = useMemo(() => {
    return selectedStage < getStageCount(selectedChapter);
  }, [selectedChapter, selectedStage, getStageCount]);

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

  const handleRetry = handleClick(() => { resetSession(); navigateTo('typing'); });
  const handleBackToSelect = handleClick(() => { resetSession(); navigateTo('stageSelect'); });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') { e.preventDefault(); handleNextStage(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNextStage]);

  if (!result) {
    return (
      <div className="min-h-screen bg-hunter-dark flex items-center justify-center">
        <div className="font-title text-hunter-gold tracking-wider">CALCULATING...</div>
      </div>
    );
  }

  const rankConfig = getRankConfig(result.rank);

  return (
    <div className="min-h-screen bg-hunter-dark relative overflow-hidden">
      <BackgroundEffect variant="result" />

      {result.rank === 'S' && <GoldParticles />}

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
            <p className="text-white/50 text-sm font-title tracking-wider">
              {rankConfig.subMessage}
            </p>
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
            </div>

            {/* 統計グリッド */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <StatCard label="ACCURACY" value={`${result.accuracy}%`} highlight={result.accuracy >= 95} />
              <StatCard label="WPM" value={result.wpm.toString()} highlight={result.wpm >= 80} />
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
                className="flex-1 bg-hunter-green hover:bg-hunter-green-light text-white font-title font-bold py-3 px-6 rounded-lg transition-all tracking-wider uppercase text-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {hasNextStage ? 'NEXT →' : 'SELECT STAGE'}
                <span className="text-xs opacity-60 ml-2">[ENTER]</span>
              </motion.button>

              <motion.button
                onClick={handleRetry}
                className="flex-1 bg-transparent border border-hunter-gold/30 hover:border-hunter-gold/60 text-white font-title font-bold py-3 px-6 rounded-lg transition-all tracking-wider uppercase text-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                RETRY
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string; highlight?: boolean }> = ({ label, value, highlight }) => (
  <div className={`text-center p-3 rounded-lg ${highlight ? 'bg-hunter-gold/10 border border-hunter-gold/30' : 'bg-hunter-dark/30'}`}>
    <div className="font-title text-white/40 text-[10px] tracking-[0.2em] mb-1">{label}</div>
    <div className={`font-title text-xl font-bold ${highlight ? 'text-hunter-gold' : 'text-white'}`}>{value}</div>
  </div>
);

const GoldParticles: React.FC = () => (
  <div className="absolute inset-0 pointer-events-none">
    {[...Array(15)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 bg-hunter-gold"
        style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%` }}
        animate={{ y: [0, -80], opacity: [0, 1, 0], scale: [0, 1, 0] }}
        transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
      />
    ))}
  </div>
);

const getRankConfig = (rank: Rank) => {
  switch (rank) {
    case 'S': return {
      borderColor: 'border-hunter-gold',
      bgColor: 'bg-hunter-gold/10',
      textColor: 'text-hunter-gold',
      glowColor: 'rgba(212,175,55,0.5)',
      message: 'PERFECT',
      subMessage: 'You are a true Hunter',
    };
    case 'A': return {
      borderColor: 'border-hunter-green',
      bgColor: 'bg-hunter-green/10',
      textColor: 'text-hunter-green',
      glowColor: 'rgba(45,90,39,0.5)',
      message: 'EXCELLENT',
      subMessage: 'Almost master level',
    };
    case 'B': return {
      borderColor: 'border-nen-transmutation',
      bgColor: 'bg-nen-transmutation/10',
      textColor: 'text-nen-transmutation',
      glowColor: 'rgba(78,205,196,0.5)',
      message: 'GOOD',
      subMessage: 'Keep training',
    };
    default: return {
      borderColor: 'border-white/30',
      bgColor: 'bg-white/5',
      textColor: 'text-white',
      glowColor: 'rgba(255,255,255,0.2)',
      message: 'CLEAR',
      subMessage: 'Practice makes perfect',
    };
  }
};

export default ResultScreen;
