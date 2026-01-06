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
  }, [result, updateStreak, updateStatistics, saveStageResult, selectedChapter, selectedStage, playSuccessSound, playResultSound, playAchievementSound]);

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
    <div className="screen-container relative overflow-hidden">
      {/* 背景デコレーション */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-40 h-40 bg-pop-pink/15 rounded-full blur-2xl animate-float" />
        <div className="absolute bottom-20 right-10 w-36 h-36 bg-pop-purple/15 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/3 right-1/4 text-4xl animate-sparkle">🎉</div>
        <div className="absolute bottom-1/3 left-1/4 text-3xl animate-sparkle" style={{ animationDelay: '0.5s' }}>✨</div>
      </div>

      {/* ランク表示 */}
      <motion.div
        initial={{ scale: 0, opacity: 0, rotate: -180 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, duration: 0.8 }}
        className="relative z-10 mb-8"
      >
        <motion.div
          className={`w-32 h-32 rounded-full flex items-center justify-center text-6xl font-extrabold border-4 ${getRankStyle(
            result.rank
          )}`}
          animate={{ 
            boxShadow: result.rank === 'S' 
              ? '0 0 30px rgba(236, 72, 153, 0.6), 0 0 60px rgba(168, 85, 247, 0.3)'
              : '0 0 20px rgba(168, 85, 247, 0.4), 0 0 40px rgba(236, 72, 153, 0.2)'
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
        onAnimationComplete={() => {
          // ランクメッセージ表示時に達成感のある音を再生
          setTimeout(() => {
            playAchievementSound(result.rank);
          }, 100);
        }}
        className="relative z-10 text-2xl md:text-3xl font-extrabold text-gradient mb-8"
      >
        {getRankMessage(result.rank)}
      </motion.h1>

      {/* 結果詳細 */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ delay: 0.4, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative z-10 card w-full max-w-md mb-8"
      >
        <div className="grid grid-cols-2 gap-6">
          <ResultItem label="⭐ スコア" value={result.score.toLocaleString()} />
          <ResultItem label="🎯 正確率" value={`${result.accuracy}%`} />
          <ResultItem label="⚡ WPM" value={result.wpm.toString()} />
          <ResultItem label="⏱️ タイム" value={`${result.totalTime}秒`} />
          <ResultItem label="🔥 最大コンボ" value={result.maxCombo.toString()} />
          <ResultItem
            label="✅ 正解/ミス"
            value={`${result.correctCount}/${result.missCount}`}
          />
        </div>
      </motion.div>

      {/* ボタン */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.4 }}
        className="relative z-10 flex gap-4"
      >
        <motion.button 
          onClick={handleRetry} 
          className="btn-primary"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          🔄 もう一度！
        </motion.button>
        <motion.button 
          onClick={handleBackToSelect} 
          className="btn-ghost"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          📚 ステージ選択へ
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
    <div className="text-pop-purple text-xs font-bold mb-2">{label}</div>
    <div className="text-primary text-xl font-extrabold">{value}</div>
  </div>
);

// ランクスタイル
const getRankStyle = (rank: Rank): string => {
  switch (rank) {
    case 'S':
      return 'border-pop-yellow bg-gradient-to-br from-pop-yellow/20 to-pop-pink/20 text-pop-yellow';
    case 'A':
      return 'border-pop-pink bg-gradient-to-br from-pop-pink/20 to-pop-purple/20 text-pop-pink';
    case 'B':
      return 'border-pop-purple bg-gradient-to-br from-pop-purple/20 to-pop-sky/20 text-pop-purple';
    case 'C':
      return 'border-pop-sky bg-gradient-to-br from-pop-sky/20 to-pop-mint/20 text-pop-sky';
    default:
      return 'border-pop-purple/50 text-pop-purple/50';
  }
};

// ランクメッセージ
const getRankMessage = (rank: Rank): string => {
  switch (rank) {
    case 'S':
      return '🌟 すっごーい！天才だね！🌟';
    case 'A':
      return '✨ とってもよくできました！✨';
    case 'B':
      return '👍 なかなかの腕前だね！';
    case 'C':
      return '💪 もっと練習しよう！';
    default:
      return 'お疲れ様でした！';
  }
};

export default ResultScreen;
