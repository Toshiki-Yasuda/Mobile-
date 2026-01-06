/**
 * 結果画面コンポーネント
 * ダークテーマ
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

// チャプターごとのステージ数
const CHAPTER_STAGE_COUNTS: Record<number, number> = {
  1: Object.keys(chapter1Stages).length,
  2: Object.keys(chapter2Stages).length,
  3: 6,
  4: 6,
  5: 6,
  6: 6,
};

export const ResultScreen: React.FC = () => {
  const { session, navigateTo, resetSession, selectedChapter, selectedStage } = useGameStore();
  const { saveStageResult, updateStatistics, updateStreak, clearedStages, unlockChapter } = useProgressStore();
  const { handleClick } = useButtonClick();
  const { playSuccessSound, playResultSound, playAchievementSound } = useSound();

  // 結果を計算
  const result = useMemo(() => {
    if (!session) return null;

    const totalTime = session.endTime
      ? session.endTime - (session.startTime || 0)
      : 0;
    const totalChars = session.correctCount + session.missCount;
    const accuracy =
      totalChars > 0 ? (session.correctCount / totalChars) * 100 : 0;
    const wpm =
      totalTime > 0 ? (session.correctCount / (totalTime / 60000)) : 0;

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

  // 結果を保存と達成音の再生
  useEffect(() => {
    if (result && selectedChapter && selectedStage) {
      const stageId = `${selectedChapter}-${selectedStage}`;
      
      setTimeout(() => {
        playSuccessSound();
        setTimeout(() => {
          playResultSound(result.rank);
        }, 400);
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
        stageId,
        score: result.score,
        accuracy: result.accuracy,
        wpm: result.wpm,
        totalTime: result.totalTime * 1000,
        maxCombo: result.maxCombo,
        rank: result.rank,
        clearedAt: new Date().toISOString(),
      });

      const totalStagesInChapter = CHAPTER_STAGE_COUNTS[selectedChapter] || 0;
      const clearedStagesInChapter = Object.keys(clearedStages).filter(
        id => id.startsWith(`${selectedChapter}-`)
      ).length;
      const willBeCleared = clearedStagesInChapter + (clearedStages[stageId] ? 0 : 1);
      
      if (willBeCleared >= totalStagesInChapter) {
        const nextChapter = selectedChapter + 1;
        if (CHAPTER_STAGE_COUNTS[nextChapter]) {
          unlockChapter(nextChapter);
        }
      }
    }
  }, [result, updateStreak, updateStatistics, saveStageResult, selectedChapter, selectedStage, playSuccessSound, playResultSound, playAchievementSound, clearedStages, unlockChapter]);

  const getStageCount = useCallback((chapter: number): number => {
    return CHAPTER_STAGE_COUNTS[chapter] || 0;
  }, []);

  const hasNextStage = useMemo(() => {
    const stageCount = getStageCount(selectedChapter);
    return selectedStage < stageCount;
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

  const handleRetry = handleClick(() => {
    resetSession();
    navigateTo('typing');
  });

  const handleBackToSelect = handleClick(() => {
    resetSession();
    navigateTo('stageSelect');
  });

  // Enterキーで次のステージへ
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleNextStage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNextStage]);

  if (!result) {
    return (
      <div className="min-h-screen bg-hunter-dark flex items-center justify-center">
        <div className="text-hunter-gold">結果を計算中...</div>
      </div>
    );
  }

  const rankConfig = getRankConfig(result.rank);

  return (
    <div className="min-h-screen bg-hunter-dark relative overflow-hidden">
      <BackgroundEffect variant="result" />

      {/* ランクSの特別パーティクル */}
      {result.rank === 'S' && <GoldParticles />}

      {/* メインコンテンツ */}
      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row items-center justify-center p-4 lg:p-8">
        {/* 左側 - ランク表示 */}
        <div className="flex-1 flex flex-col items-center justify-center lg:pr-8 xl:pr-16 mb-8 lg:mb-0">
          {/* ランクバッジ */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', duration: 1, bounce: 0.4 }}
            className="mb-6 lg:mb-8"
          >
            <div
              className={`w-32 h-32 lg:w-40 lg:h-40 rounded-full flex items-center justify-center text-6xl lg:text-7xl font-bold border-4 ${rankConfig.borderColor} ${rankConfig.bgColor}`}
              style={{
                boxShadow: `0 0 30px ${rankConfig.glowColor}`,
              }}
            >
              <span className={rankConfig.textColor}>{result.rank}</span>
            </div>
          </motion.div>

          {/* ランクメッセージ */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            onAnimationComplete={() => {
              setTimeout(() => {
                playAchievementSound(result.rank);
              }, 100);
            }}
            className="text-center"
          >
            <h1 className={`text-2xl lg:text-3xl xl:text-4xl font-bold mb-2 ${rankConfig.textColor}`}>
              {rankConfig.message}
            </h1>
            <p className="text-white/60 text-sm lg:text-base">
              {rankConfig.subMessage}
            </p>
          </motion.div>

          {/* スコア（PC用） */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="hidden lg:block mt-8"
          >
            <div className="text-center">
              <div className="text-hunter-gold/60 text-sm uppercase tracking-wider mb-1">
                Total Score
              </div>
              <div className="text-5xl xl:text-6xl font-bold text-white tracking-tight">
                {result.score.toLocaleString()}
              </div>
            </div>
          </motion.div>
        </div>

        {/* 右側 - 詳細結果 */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="w-full max-w-md lg:max-w-lg xl:max-w-xl"
        >
          {/* 結果カード */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-hunter-gold/10 to-transparent rounded-2xl lg:rounded-3xl" />
            <div className="absolute inset-0 border-2 border-hunter-gold/20 rounded-2xl lg:rounded-3xl" />

            <div className="relative p-6 lg:p-8">
              {/* モバイル用スコア */}
              <div className="lg:hidden text-center mb-6 pb-6 border-b border-hunter-gold/10">
                <div className="text-hunter-gold/60 text-xs uppercase tracking-wider mb-1">
                  Total Score
                </div>
                <div className="text-4xl font-bold text-white">
                  {result.score.toLocaleString()}
                </div>
              </div>

              {/* 統計グリッド */}
              <div className="grid grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8">
                <StatCard
                  label="正確率"
                  value={`${result.accuracy}%`}
                  icon="🎯"
                  highlight={result.accuracy >= 95}
                />
                <StatCard
                  label="WPM"
                  value={result.wpm.toString()}
                  icon="⚡"
                  highlight={result.wpm >= 80}
                />
                <StatCard
                  label="最大コンボ"
                  value={result.maxCombo.toString()}
                  icon="🔥"
                  highlight={result.maxCombo >= 20}
                />
                <StatCard label="タイム" value={`${result.totalTime}秒`} icon="⏱" />
              </div>

              {/* 詳細統計 */}
              <div className="space-y-3 mb-6 lg:mb-8 p-4 bg-hunter-dark/50 rounded-xl">
                <div className="flex justify-between items-center">
                  <span className="text-white/50 text-sm">正解タイプ数</span>
                  <span className="text-success font-bold">{result.correctCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/50 text-sm">ミスタイプ数</span>
                  <span className="text-error font-bold">{result.missCount}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/50 text-sm">総タイプ数</span>
                  <span className="text-white font-bold">
                    {result.correctCount + result.missCount}
                  </span>
                </div>
              </div>

              {/* アクションボタン */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={handleNextStage} className="flex-1 relative group">
                  <div className="absolute inset-0 bg-hunter-green rounded-xl blur-md opacity-50 group-hover:opacity-80 transition-opacity" />
                  <div className="relative bg-hunter-green hover:bg-hunter-green-light text-white font-bold py-3 lg:py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2">
                    <span>{hasNextStage ? '➡️ 次へ' : '📚 ステージ選択'}</span>
                    <span className="text-xs opacity-75">(Enter)</span>
                  </div>
                </button>

                <button
                  onClick={handleRetry}
                  className="flex-1 bg-transparent border-2 border-hunter-gold/30 hover:border-hunter-gold/60 hover:bg-hunter-gold/10 text-white font-bold py-3 lg:py-4 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <span>🔄</span>
                  <span>もう一度</span>
                </button>

                {hasNextStage && (
                  <button
                    onClick={handleBackToSelect}
                    className="sm:hidden bg-transparent border-2 border-hunter-gold/30 hover:border-hunter-gold/60 hover:bg-hunter-gold/10 text-white font-bold py-3 px-6 rounded-xl transition-all flex items-center justify-center gap-2"
                  >
                    <span>📚</span>
                    <span>ステージ選択</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// 統計カード
const StatCard: React.FC<{
  label: string;
  value: string;
  icon: string;
  highlight?: boolean;
}> = ({ label, value, icon, highlight }) => (
  <div className={`text-center p-4 rounded-xl ${highlight ? 'bg-hunter-gold/10' : 'bg-hunter-dark/30'}`}>
    <div className="text-2xl mb-1">{icon}</div>
    <div className="text-hunter-gold/60 text-xs mb-1">{label}</div>
    <div className={`text-xl font-bold ${highlight ? 'text-hunter-gold' : 'text-white'}`}>
      {value}
    </div>
  </div>
);

// ゴールドパーティクル
const GoldParticles: React.FC = () => (
  <div className="absolute inset-0 pointer-events-none">
    {[...Array(20)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 bg-hunter-gold rounded-full"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
        }}
        animate={{
          y: [0, -100],
          opacity: [0, 1, 0],
          scale: [0, 1.5, 0],
        }}
        transition={{
          duration: 2 + Math.random() * 2,
          repeat: Infinity,
          delay: Math.random() * 2,
        }}
      />
    ))}
  </div>
);

// ランク設定
const getRankConfig = (rank: Rank) => {
  switch (rank) {
    case 'S':
      return {
        borderColor: 'border-hunter-gold',
        bgColor: 'bg-gradient-to-br from-hunter-gold/30 to-hunter-gold/10',
        textColor: 'text-hunter-gold',
        glowColor: 'rgba(212,175,55,0.5)',
        message: '素晴らしい！完璧な念の修行です！',
        subMessage: 'あなたは真のハンターです',
      };
    case 'A':
      return {
        borderColor: 'border-hunter-green',
        bgColor: 'bg-gradient-to-br from-hunter-green/30 to-hunter-green/10',
        textColor: 'text-hunter-green',
        glowColor: 'rgba(45,90,39,0.5)',
        message: 'とても良い！あと少しでマスター！',
        subMessage: '念能力が安定してきました',
      };
    case 'B':
      return {
        borderColor: 'border-nen-transmutation',
        bgColor: 'bg-gradient-to-br from-nen-transmutation/30 to-nen-transmutation/10',
        textColor: 'text-nen-transmutation',
        glowColor: 'rgba(78,205,196,0.5)',
        message: 'なかなかの腕前だね！',
        subMessage: 'もっと練習すれば上達するよ',
      };
    case 'C':
    default:
      return {
        borderColor: 'border-white/30',
        bgColor: 'bg-gradient-to-br from-white/10 to-white/5',
        textColor: 'text-white',
        glowColor: 'rgba(255,255,255,0.2)',
        message: 'もっと練習しよう！',
        subMessage: '継続は力なり',
      };
  }
};

export default ResultScreen;
