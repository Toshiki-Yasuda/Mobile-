/**
 * 結果画面コンポーネント
 * クールデザイン + ハイスコア演出
 */

import React, { useMemo, useEffect, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { useProgressStore } from '@/stores/progressStore';
import { useSound } from '@/hooks/useSound';
import { BackgroundEffect } from '@/components/common/BackgroundEffect';
import { chapter1Stages, chapter2Stages } from '@/data/words';
import type { Rank } from '@/types/game';
import type { StageResult } from '@/types/progress';

// ===== 型定義 =====
interface RankConfig {
  borderColor: string;
  bgColor: string;
  textColor: string;
  glowColor: string;
  message: string;
  subMessage: string;
}

interface ScoreDiff {
  score: number;
  wpm: number;
  accuracy: number;
}

interface StatCardProps {
  label: string;
  value: string;
  highlight?: boolean;
  diff?: number | null;
  diffSuffix?: string;
}

// ===== 定数 =====
const CHAPTER_STAGE_COUNTS: Record<number, number> = {
  1: Object.keys(chapter1Stages).length,
  2: Object.keys(chapter2Stages).length,
  3: 6, 4: 6, 5: 6, 6: 6,
};

const RANK_CONFIGS: Record<Rank, RankConfig> = {
  S: {
    borderColor: 'border-hunter-gold',
    bgColor: 'bg-hunter-gold/10',
    textColor: 'text-hunter-gold',
    glowColor: 'rgba(212,175,55,0.5)',
    message: 'PERFECT',
    subMessage: 'You are a true Hunter',
  },
  A: {
    borderColor: 'border-hunter-green',
    bgColor: 'bg-hunter-green/10',
    textColor: 'text-hunter-green',
    glowColor: 'rgba(45,90,39,0.5)',
    message: 'EXCELLENT',
    subMessage: 'Almost master level',
  },
  B: {
    borderColor: 'border-nen-transmutation',
    bgColor: 'bg-nen-transmutation/10',
    textColor: 'text-nen-transmutation',
    glowColor: 'rgba(78,205,196,0.5)',
    message: 'GOOD',
    subMessage: 'Keep training',
  },
  C: {
    borderColor: 'border-white/30',
    bgColor: 'bg-white/5',
    textColor: 'text-white',
    glowColor: 'rgba(255,255,255,0.2)',
    message: 'CLEAR',
    subMessage: 'Practice makes perfect',
  },
};

// ===== ユーティリティ =====
const calculateRank = (accuracy: number, wpm: number): Rank => {
  if (accuracy >= 98 && wpm >= 100) return 'S';
  if (accuracy >= 95 && wpm >= 80) return 'A';
  if (accuracy >= 90 && wpm >= 60) return 'B';
  return 'C';
};

const formatDiff = (value: number, suffix = ''): string => {
  const prefix = value > 0 ? '+' : '';
  return `${prefix}${value}${suffix}`;
};

// ===== サブコンポーネント =====
const StatCard: React.FC<StatCardProps> = ({ label, value, highlight, diff, diffSuffix = '' }) => (
  <div className={`text-center p-3 rounded-lg ${highlight ? 'bg-hunter-gold/10 border border-hunter-gold/30' : 'bg-hunter-dark/30'}`}>
    <div className="font-title text-white/40 text-[10px] tracking-[0.2em] mb-1">{label}</div>
    <div className={`font-title text-xl font-bold ${highlight ? 'text-hunter-gold' : 'text-white'}`}>{value}</div>
    {diff != null && diff !== 0 && (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.2 }}
        className={`font-title text-xs mt-1 ${diff > 0 ? 'text-success' : 'text-error'}`}
      >
        {formatDiff(diff, diffSuffix)}
      </motion.div>
    )}
  </div>
);

const GoldParticles: React.FC = () => {
  const particles = useMemo(() =>
    Array.from({ length: 15 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      top: Math.random() * 100,
      duration: 2 + Math.random() * 2,
      delay: Math.random() * 2,
    })), []
  );

  return (
    <div className="absolute inset-0 pointer-events-none">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute w-1 h-1 bg-hunter-gold"
          style={{ left: `${p.left}%`, top: `${p.top}%` }}
          animate={{ y: [0, -80], opacity: [0, 1, 0], scale: [0, 1, 0] }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay }}
        />
      ))}
    </div>
  );
};

const NewRecordParticles: React.FC = () => {
  const particles = useMemo(() =>
    Array.from({ length: 30 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      yOffset: -200 - Math.random() * 300,
      xOffset: (Math.random() - 0.5) * 200,
      duration: 2 + Math.random(),
      delay: Math.random() * 0.5,
      rotation: 360 * (Math.random() > 0.5 ? 1 : -1),
      color: ['#D4AF37', '#FFD700', '#FFA500', '#FF6B6B', '#4ECDC4'][Math.floor(Math.random() * 5)],
      shape: i % 3,
    })), []
  );

  const getClipPath = (shape: number) => {
    if (shape === 0) return 'polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)';
    if (shape === 1) return 'polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%)';
    return 'circle(50%)';
  };

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map(p => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{ left: `${p.left}%`, top: '50%' }}
          initial={{ y: 0, opacity: 1, scale: 1 }}
          animate={{
            y: [0, p.yOffset],
            x: [p.xOffset],
            opacity: [1, 1, 0],
            scale: [1, 0.5],
            rotate: [0, p.rotation],
          }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay }}
        >
          <div className="w-3 h-3" style={{ background: p.color, clipPath: getClipPath(p.shape) }} />
        </motion.div>
      ))}
    </div>
  );
};

const NewRecordBanner: React.FC = () => (
  <motion.div
    initial={{ y: -100, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    exit={{ y: -100, opacity: 0 }}
    transition={{ type: 'spring', bounce: 0.5 }}
    className="absolute top-4 left-0 right-0 z-50 flex justify-center"
  >
    <motion.div
      animate={{
        scale: [1, 1.05, 1],
        boxShadow: [
          '0 0 20px rgba(212, 175, 55, 0.5)',
          '0 0 40px rgba(212, 175, 55, 0.8)',
          '0 0 20px rgba(212, 175, 55, 0.5)',
        ],
      }}
      transition={{ duration: 1.5, repeat: Infinity }}
      className="bg-gradient-to-r from-hunter-gold via-yellow-400 to-hunter-gold px-8 py-3 rounded-lg"
    >
      <span className="font-title text-2xl md:text-3xl font-bold text-hunter-dark tracking-wider">
        NEW RECORD!
      </span>
    </motion.div>
  </motion.div>
);

// ===== メインコンポーネント =====
export const ResultScreen: React.FC = () => {
  const { session, navigateTo, resetSession, selectedChapter, selectedStage } = useGameStore();
  const { saveStageResult, updateStatistics, updateStreak, clearedStages, unlockChapter } = useProgressStore();
  const { playSuccessSound, playResultSound, playAchievementSound } = useSound();

  const [previousResult, setPreviousResult] = useState<StageResult | null>(null);
  const [showNewRecord, setShowNewRecord] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  const stageId = selectedChapter && selectedStage ? `${selectedChapter}-${selectedStage}` : null;

  // 結果計算
  const result = useMemo(() => {
    if (!session) return null;
    const totalTime = session.endTime ? session.endTime - (session.startTime || 0) : 0;
    const totalChars = session.correctCount + session.missCount;
    const accuracy = totalChars > 0 ? (session.correctCount / totalChars) * 100 : 0;
    const wpm = totalTime > 0 ? (session.correctCount / (totalTime / 60000)) : 0;

    return {
      score: session.score,
      accuracy: Math.round(accuracy * 10) / 10,
      wpm: Math.round(wpm),
      totalTime: Math.round(totalTime / 1000),
      maxCombo: session.maxCombo,
      correctCount: session.correctCount,
      missCount: session.missCount,
      rank: calculateRank(accuracy, wpm),
    };
  }, [session]);

  const isNewRecord = useMemo(() => {
    if (!result) return false;
    return !previousResult || result.score > previousResult.score;
  }, [result, previousResult]);

  const scoreDiff = useMemo((): ScoreDiff | null => {
    if (!result || !previousResult) return null;
    return {
      score: result.score - previousResult.score,
      wpm: result.wpm - previousResult.wpm,
      accuracy: Math.round((result.accuracy - previousResult.accuracy) * 10) / 10,
    };
  }, [result, previousResult]);

  const hasNextStage = useMemo(() => {
    return selectedStage < (CHAPTER_STAGE_COUNTS[selectedChapter] || 0);
  }, [selectedChapter, selectedStage]);

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
    const clearedCount = Object.keys(clearedStages).filter(id => id.startsWith(`${selectedChapter}-`)).length;
    const willBeCleared = clearedCount + (clearedStages[stageId] ? 0 : 1);

    if (willBeCleared >= totalStagesInChapter) {
      const nextChapter = selectedChapter + 1;
      if (CHAPTER_STAGE_COUNTS[nextChapter]) unlockChapter(nextChapter);
    }
  }, [result, stageId, hasInitialized, isNewRecord, updateStreak, updateStatistics, saveStageResult, selectedChapter, clearedStages, unlockChapter, playSuccessSound, playResultSound, playAchievementSound]);

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
      if (e.key === 'Enter') {
        e.preventDefault();
        handleNextStage();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleNextStage]);

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

export default ResultScreen;
