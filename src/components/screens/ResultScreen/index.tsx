/**
 * 結果画面コンポーネント
 */

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { useProgressStore } from '@/stores/progressStore';
import { useButtonClick } from '@/utils/soundUtils';
import { useSound } from '@/hooks/useSound';
import type { Rank } from '@/types/game';

export const ResultScreen: React.FC = () => {
  const { session, navigateTo, resetSession, selectedChapter, selectedStage } = useGameStore();
  const { saveStageResult, updateStatistics, updateStreak } = useProgressStore();
  const { handleClick } = useButtonClick();
  const { playSuccessSound, playResultSound } = useSound();
  const { playSuccessSound, playResultSound } = useSound();

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

  // 結果を保存と達成音の再生
  React.useEffect(() => {
    if (result && selectedChapter && selectedStage) {
      const stageId = `${selectedChapter}-${selectedStage}`;
      
      // 達成音を再生（少し遅延させて確実に鳴るように）
      setTimeout(() => {
        playSuccessSound();
        // ランクに応じた音も再生
        setTimeout(() => {
          playResultSound(result.rank);
        }, 400);
      }, 300);
      
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
  }, [result, updateStreak, updateStatistics, saveStageResult, selectedChapter, selectedStage, playSuccessSound, playResultSound]);

  const handleRetry = handleClick(() => {
    resetSession();
    navigateTo('typing');
  });

  const handleBackToSelect = handleClick(() => {
    resetSession();
    navigateTo('stageSelect');
  });

  if (!result) {
    return (
      <div className="screen-container">
        <div className="text-secondary">結果を計算中...</div>
      </div>
    );
  }

  return (
    <div className="screen-container bg-background">
      {/* ランク表示 */}
      <motion.div
        initial={{ scale: 0, opacity: 0, rotate: -180 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, duration: 0.8 }}
        className="mb-12"
      >
        <motion.div
          className={`w-28 h-28 rounded-full flex items-center justify-center text-6xl font-bold border-2 ${getRankStyle(
            result.rank
          )} glow-accent`}
          animate={{ 
            boxShadow: result.rank === 'S' 
              ? '0 0 30px rgba(59, 130, 246, 0.6), 0 0 60px rgba(59, 130, 246, 0.3), inset 0 0 20px rgba(59, 130, 246, 0.2)'
              : '0 0 20px rgba(59, 130, 246, 0.4), 0 0 40px rgba(59, 130, 246, 0.2)'
          }}
          transition={{ duration: 2, repeat: Infinity, repeatType: 'reverse' }}
        >
          {result.rank}
        </motion.div>
      </motion.div>

      {/* タイトル */}
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-2xl md:text-3xl font-semibold text-primary mb-12 glow-text"
      >
        {getRankMessage(result.rank)}
      </motion.h1>

      {/* 結果詳細 */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="card w-full max-w-md mb-12 glow-accent"
      >
        <div className="grid grid-cols-2 gap-8">
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        className="flex gap-4"
      >
        <motion.button 
          onClick={handleRetry} 
          className="btn-primary"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
        >
          もう一度
        </motion.button>
        <motion.button 
          onClick={handleBackToSelect} 
          className="btn-ghost"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
        >
          ステージ選択へ
        </motion.button>
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
    <div className="text-muted text-xs uppercase tracking-wider mb-2">{label}</div>
    <div className="text-primary text-xl font-medium">{value}</div>
  </div>
);

// ランクスタイル
const getRankStyle = (rank: Rank): string => {
  switch (rank) {
    case 'S':
      return 'border-accent text-accent';
    case 'A':
      return 'border-accent/70 text-accent/70';
    case 'B':
      return 'border-secondary text-secondary';
    case 'C':
      return 'border-muted text-muted';
    default:
      return 'border-muted text-muted';
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
