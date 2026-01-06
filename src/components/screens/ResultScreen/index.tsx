/**
 * 結果画面コンポーネント
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { useProgressStore } from '@/stores/progressStore';
import type { Rank } from '@/types/game';

export const ResultScreen: React.FC = () => {
  const { session, navigateTo, resetSession, selectedChapter, selectedStage } = useGameStore();
  const { saveStageResult, updateStatistics, updateStreak } = useProgressStore();

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

    // ランク計算
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

  // 結果を保存
  React.useEffect(() => {
    if (result && selectedChapter && selectedStage) {
      const stageId = `${selectedChapter}-${selectedStage}`;
      
      updateStreak();
      updateStatistics({
        totalPlays: 1, // インクリメントは store 側で行う
        totalTypedChars: result.correctCount + result.missCount,
        totalCorrect: result.correctCount,
        totalMiss: result.missCount,
        totalPlayTime: result.totalTime * 1000,
        bestWPM: result.wpm,
      });

      // ステージ結果を保存
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
    }
  }, [result, updateStreak, updateStatistics, saveStageResult, selectedChapter, selectedStage]);

  const handleRetry = () => {
    resetSession();
    navigateTo('typing');
  };

  const handleBackToSelect = () => {
    resetSession();
    navigateTo('stageSelect');
  };

  if (!result) {
    return (
      <div className="screen-container">
        <div className="text-hunter-gold">結果を計算中...</div>
      </div>
    );
  }

  return (
    <div className="screen-container bg-hunter-dark">
      {/* ランク表示 */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', duration: 0.8 }}
        className="mb-8"
      >
        <div
          className={`w-32 h-32 rounded-full flex items-center justify-center text-6xl font-bold border-4 ${getRankStyle(
            result.rank
          )}`}
        >
          {result.rank}
        </div>
      </motion.div>

      {/* タイトル */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-3xl font-bold text-white mb-8"
      >
        {getRankMessage(result.rank)}
      </motion.h1>

      {/* 結果詳細 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card w-full max-w-md mb-8"
      >
        <div className="grid grid-cols-2 gap-4">
          <ResultItem label="スコア" value={result.score.toLocaleString()} />
          <ResultItem label="正確率" value={`${result.accuracy}%`} />
          <ResultItem label="WPM" value={result.wpm.toString()} />
          <ResultItem label="タイム" value={`${result.totalTime}秒`} />
          <ResultItem label="最大コンボ" value={result.maxCombo.toString()} />
          <ResultItem
            label="正解/ミス"
            value={`${result.correctCount}/${result.missCount}`}
          />
        </div>
      </motion.div>

      {/* ボタン */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="flex gap-4"
      >
        <button onClick={handleRetry} className="btn-primary">
          もう一度
        </button>
        <button onClick={handleBackToSelect} className="btn-ghost">
          ステージ選択へ
        </button>
      </motion.div>
    </div>
  );
};

// 結果項目コンポーネント
const ResultItem: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <div className="text-center">
    <div className="text-hunter-gold/60 text-sm">{label}</div>
    <div className="text-white text-xl font-bold">{value}</div>
  </div>
);

// ランクスタイル
const getRankStyle = (rank: Rank): string => {
  switch (rank) {
    case 'S':
      return 'border-hunter-gold text-hunter-gold shadow-nen-strong';
    case 'A':
      return 'border-nen-enhancement text-nen-enhancement';
    case 'B':
      return 'border-nen-transmutation text-nen-transmutation';
    case 'C':
      return 'border-white/40 text-white/60';
    default:
      return 'border-white/40 text-white/60';
  }
};

// ランクメッセージ
const getRankMessage = (rank: Rank): string => {
  switch (rank) {
    case 'S':
      return '🌟 素晴らしい！マスターレベルだ！';
    case 'A':
      return '✨ 優秀な成績だ！';
    case 'B':
      return '👍 なかなかの腕前だ！';
    case 'C':
      return '💪 修行を続けよう！';
    default:
      return 'お疲れ様でした！';
  }
};

export default ResultScreen;
