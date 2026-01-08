/**
 * 統計・分析画面コンポーネント
 * プレイ統計、キー別分析、進捗状況を表示
 */

import React, { useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { useProgressStore } from '@/stores/progressStore';
import { useButtonClick } from '@/utils/soundUtils';
import { BackgroundEffect } from '@/components/common/BackgroundEffect';

// 時間をフォーマット
const formatTime = (ms: number): string => {
  const hours = Math.floor(ms / 3600000);
  const minutes = Math.floor((ms % 3600000) / 60000);
  if (hours > 0) {
    return `${hours}時間${minutes}分`;
  }
  return `${minutes}分`;
};

// 日付をフォーマット
const formatDate = (dateStr: string): string => {
  if (!dateStr) return '-';
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

export const StatisticsScreen: React.FC = () => {
  const { navigateTo } = useGameStore();
  const {
    statistics,
    keyStatistics,
    dailyLogs,
    clearedStages,
    totalScore,
    resetProgress,
  } = useProgressStore();
  const { handleClick } = useButtonClick();

  // 正確率を計算
  const overallAccuracy = useMemo(() => {
    const total = statistics.totalCorrect + statistics.totalMiss;
    if (total === 0) return 0;
    return Math.round((statistics.totalCorrect / total) * 100);
  }, [statistics.totalCorrect, statistics.totalMiss]);

  // 苦手なキーを抽出（正確率が低い順）
  const weakKeys = useMemo(() => {
    return Object.entries(keyStatistics)
      .filter(([_, stats]) => stats.totalAttempts >= 5)
      .map(([key, stats]) => ({
        key,
        accuracy: Math.round((stats.correctCount / stats.totalAttempts) * 100),
        attempts: stats.totalAttempts,
        avgLatency: Math.round(stats.averageLatency),
      }))
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 5);
  }, [keyStatistics]);

  // 得意なキーを抽出（正確率が高い順）
  const strongKeys = useMemo(() => {
    return Object.entries(keyStatistics)
      .filter(([_, stats]) => stats.totalAttempts >= 5)
      .map(([key, stats]) => ({
        key,
        accuracy: Math.round((stats.correctCount / stats.totalAttempts) * 100),
        attempts: stats.totalAttempts,
        avgLatency: Math.round(stats.averageLatency),
      }))
      .sort((a, b) => b.accuracy - a.accuracy)
      .slice(0, 5);
  }, [keyStatistics]);

  // 直近7日間のログ
  const recentLogs = useMemo(() => {
    const last7Days: { date: string; playCount: number; accuracy: number }[] = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      const log = dailyLogs.find(l => l.date === dateStr);
      last7Days.push({
        date: dateStr,
        playCount: log?.playCount || 0,
        accuracy: log?.averageAccuracy || 0,
      });
    }
    return last7Days;
  }, [dailyLogs]);

  // 最大プレイ回数（グラフのスケーリング用）
  const maxPlayCount = useMemo(() => {
    return Math.max(...recentLogs.map(l => l.playCount), 1);
  }, [recentLogs]);

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

  // クリアしたステージ数
  const clearedCount = Object.keys(clearedStages).length;

  // リセット確認
  const handleReset = () => {
    if (window.confirm('すべての進捗データをリセットしますか？\nこの操作は取り消せません。')) {
      resetProgress();
    }
  };

  return (
    <div className="min-h-screen bg-hunter-dark relative overflow-hidden">
      <BackgroundEffect variant="default" />

      {/* ヘッダー */}
      <header className="relative z-10 p-4 lg:p-6 border-b border-hunter-gold/10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button
            onClick={handleClick(() => navigateTo('title'))}
            className="font-title text-hunter-gold/60 hover:text-hunter-gold transition tracking-wider text-sm uppercase"
          >
            ← BACK
          </button>
          <h1 className="font-title text-xl lg:text-2xl font-bold text-white tracking-wider">
            STATISTICS
          </h1>
          <div className="w-16" />
        </div>
      </header>

      {/* 統計コンテンツ */}
      <main className="relative z-10 p-4 lg:p-8">
        <div className="max-w-6xl mx-auto space-y-6">

          {/* 総合統計 */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="font-title text-hunter-gold text-sm tracking-[0.2em] mb-4 uppercase">
              Overall Statistics
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {[
                { label: '総プレイ時間', value: formatTime(statistics.totalPlayTime), icon: '⏱️' },
                { label: '総タイプ数', value: statistics.totalTypedChars.toLocaleString(), icon: '⌨️' },
                { label: '正確率', value: `${overallAccuracy}%`, icon: '🎯' },
                { label: '最高WPM', value: statistics.bestWPM.toString(), icon: '🚀' },
                { label: '連続日数', value: `${statistics.streakDays}日`, icon: '🔥' },
                { label: 'プレイ回数', value: statistics.totalPlays.toString(), icon: '🎮' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  className="bg-hunter-dark-light/40 border border-hunter-gold/20 rounded-lg p-4 text-center"
                >
                  <div className="text-2xl mb-1">{stat.icon}</div>
                  <div className="font-title text-hunter-gold text-xl lg:text-2xl font-bold">
                    {stat.value}
                  </div>
                  <div className="text-white/50 text-xs mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* 直近7日間のプレイ状況 */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-hunter-dark-light/40 border border-hunter-gold/20 rounded-lg p-5"
          >
            <h2 className="font-title text-hunter-gold text-sm tracking-[0.2em] mb-4 uppercase">
              Last 7 Days
            </h2>
            <div className="flex items-end justify-between gap-2 h-32">
              {recentLogs.map((log, index) => (
                <div key={log.date} className="flex-1 flex flex-col items-center">
                  <motion.div
                    className="w-full bg-hunter-gold/20 rounded-t relative overflow-hidden"
                    initial={{ height: 0 }}
                    animate={{ height: log.playCount > 0 ? `${(log.playCount / maxPlayCount) * 80}px` : '4px' }}
                    transition={{ delay: 0.3 + index * 0.05, duration: 0.5 }}
                  >
                    {log.playCount > 0 && (
                      <motion.div
                        className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-hunter-gold to-hunter-gold/50"
                        initial={{ height: 0 }}
                        animate={{ height: '100%' }}
                        transition={{ delay: 0.5 + index * 0.05, duration: 0.3 }}
                      />
                    )}
                  </motion.div>
                  <div className="text-[10px] text-white/40 mt-2">{formatDate(log.date)}</div>
                  <div className="text-xs text-hunter-gold font-title">{log.playCount}</div>
                </div>
              ))}
            </div>
          </motion.section>

          {/* キー別統計 */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* 苦手なキー */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-hunter-dark-light/40 border border-hunter-gold/20 rounded-lg p-5"
            >
              <h2 className="font-title text-red-400 text-sm tracking-[0.2em] mb-4 uppercase">
                Weak Keys
              </h2>
              {weakKeys.length > 0 ? (
                <div className="space-y-2">
                  {weakKeys.map((item, index) => (
                    <motion.div
                      key={item.key}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.4 + index * 0.05 }}
                      className="flex items-center gap-3 bg-hunter-dark/50 rounded-lg p-3"
                    >
                      <div className="w-10 h-10 bg-red-500/20 border border-red-500/30 rounded flex items-center justify-center font-mono text-red-400 font-bold">
                        {item.key.toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">正確率</span>
                          <span className="text-red-400 font-title">{item.accuracy}%</span>
                        </div>
                        <div className="h-1.5 bg-hunter-dark rounded-full overflow-hidden mt-1">
                          <motion.div
                            className="h-full bg-red-500/60"
                            initial={{ width: 0 }}
                            animate={{ width: `${item.accuracy}%` }}
                            transition={{ delay: 0.5 + index * 0.05 }}
                          />
                        </div>
                      </div>
                      <div className="text-xs text-white/40">{item.attempts}回</div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-white/40 text-sm text-center py-4">データがありません</p>
              )}
            </motion.section>

            {/* 得意なキー */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="bg-hunter-dark-light/40 border border-hunter-gold/20 rounded-lg p-5"
            >
              <h2 className="font-title text-hunter-green-light text-sm tracking-[0.2em] mb-4 uppercase">
                Strong Keys
              </h2>
              {strongKeys.length > 0 ? (
                <div className="space-y-2">
                  {strongKeys.map((item, index) => (
                    <motion.div
                      key={item.key}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.45 + index * 0.05 }}
                      className="flex items-center gap-3 bg-hunter-dark/50 rounded-lg p-3"
                    >
                      <div className="w-10 h-10 bg-hunter-green/20 border border-hunter-green/30 rounded flex items-center justify-center font-mono text-hunter-green-light font-bold">
                        {item.key.toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-white/60">正確率</span>
                          <span className="text-hunter-green-light font-title">{item.accuracy}%</span>
                        </div>
                        <div className="h-1.5 bg-hunter-dark rounded-full overflow-hidden mt-1">
                          <motion.div
                            className="h-full bg-hunter-green/60"
                            initial={{ width: 0 }}
                            animate={{ width: `${item.accuracy}%` }}
                            transition={{ delay: 0.55 + index * 0.05 }}
                          />
                        </div>
                      </div>
                      <div className="text-xs text-white/40">{item.attempts}回</div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-white/40 text-sm text-center py-4">データがありません</p>
              )}
            </motion.section>
          </div>

          {/* 進捗サマリー */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-hunter-dark-light/40 border border-hunter-gold/20 rounded-lg p-5"
          >
            <h2 className="font-title text-hunter-gold text-sm tracking-[0.2em] mb-4 uppercase">
              Progress Summary
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="font-title text-hunter-gold text-3xl font-bold">{clearedCount}</div>
                <div className="text-white/50 text-xs mt-1">クリアステージ</div>
              </div>
              <div className="text-center">
                <div className="font-title text-hunter-gold text-3xl font-bold">{totalScore.toLocaleString()}</div>
                <div className="text-white/50 text-xs mt-1">総スコア</div>
              </div>
              <div className="text-center">
                <div className="font-title text-hunter-gold text-3xl font-bold">
                  {statistics.totalCorrect.toLocaleString()}
                </div>
                <div className="text-white/50 text-xs mt-1">正解数</div>
              </div>
              <div className="text-center">
                <div className="font-title text-red-400 text-3xl font-bold">
                  {statistics.totalMiss.toLocaleString()}
                </div>
                <div className="text-white/50 text-xs mt-1">ミス数</div>
              </div>
            </div>
          </motion.section>

          {/* リセットボタン */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center pt-4"
          >
            <button
              onClick={handleClick(handleReset)}
              className="bg-transparent border border-red-500/30 hover:border-red-500/60 text-red-400/60 hover:text-red-400 px-6 py-2 rounded-lg font-title text-sm tracking-wider transition-all"
            >
              RESET ALL DATA
            </button>
          </motion.div>

        </div>
      </main>
    </div>
  );
};

export default StatisticsScreen;
