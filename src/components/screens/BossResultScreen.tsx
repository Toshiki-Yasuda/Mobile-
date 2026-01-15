/**
 * ボス戦闘結果画面
 * 戦闘結果、ランク、報酬を表示
 */

import React from 'react';
import { motion } from 'framer-motion';
import type { BossReward } from '@/types/boss';

interface BossResultScreenProps {
  isVictory: boolean;
  rank: 'S+' | 'S' | 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D';
  bossName: string;
  correctCount: number;
  missCount: number;
  maxCombo: number;
  elapsedTime: number;
  rewards: BossReward[];
  onRetry: () => void;
  onContinue: () => void;
}

const getRankColor = (rank: string): string => {
  switch (rank) {
    case 'S+':
    case 'S':
      return 'from-yellow-400 to-yellow-600';
    case 'A+':
    case 'A':
      return 'from-green-400 to-green-600';
    case 'B+':
    case 'B':
      return 'from-blue-400 to-blue-600';
    case 'C':
      return 'from-purple-400 to-purple-600';
    default:
      return 'from-red-400 to-red-600';
  }
};

const getRankDescription = (rank: string): string => {
  const descriptions: Record<string, string> = {
    'S+': '完全勝利 - 最高の実力を発揮',
    'S': 'ノーミス - 完璧なプレイ',
    'A+': '優秀 - ほぼ無傷でのクリア',
    'A': '良好 - 良いプレイ',
    'B+': '健闘 - 敗北寸前だったが勝利',
    'B': '標準 - 標準的なクリア',
    'C': 'ぎりぎり - かろうじてクリア',
    'D': '敗北 - ボスには勝てなかった',
  };
  return descriptions[rank] || '結果不明';
};

export const BossResultScreen: React.FC<BossResultScreenProps> = ({
  isVictory,
  rank,
  bossName,
  correctCount,
  missCount,
  maxCombo,
  elapsedTime,
  rewards,
  onRetry,
  onContinue,
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <div className="relative w-full min-h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 flex items-center justify-center p-4">
      {/* 背景グラデーション */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className={`absolute top-0 left-1/4 w-1/2 h-1/2 bg-gradient-to-br ${getRankColor(rank)} rounded-full filter blur-3xl`}></div>
        <div className="absolute bottom-0 right-1/4 w-1/2 h-1/2 bg-purple-500 rounded-full filter blur-3xl"></div>
      </div>

      {/* コンテンツ */}
      <motion.div
        className="relative z-10 max-w-2xl w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* 結果テキスト */}
        <motion.div
          className="text-center mb-8"
          variants={itemVariants}
        >
          <h1 className="text-5xl font-bold mb-4">
            {isVictory ? '🎉 勝利！' : '💔 敗北'}
          </h1>
          <p className="text-2xl text-gray-300">
            {bossName}との戦闘が終了しました
          </p>
        </motion.div>

        {/* ランク表示 */}
        <motion.div
          className={`bg-gradient-to-r ${getRankColor(rank)} p-8 rounded-lg mb-8 text-center shadow-2xl`}
          variants={itemVariants}
          whileHover={{ scale: 1.05 }}
        >
          <p className="text-gray-300 text-sm mb-2">評価ランク</p>
          <p className="text-7xl font-bold text-white mb-4">{rank}</p>
          <p className="text-lg font-semibold text-gray-100">{getRankDescription(rank)}</p>
        </motion.div>

        {/* 統計情報 */}
        <motion.div
          className="grid grid-cols-2 gap-4 mb-8"
          variants={itemVariants}
        >
          <div className="bg-black/50 border-l-4 border-blue-500 p-4 rounded">
            <p className="text-gray-400 text-sm">正解数</p>
            <p className="text-3xl font-bold text-blue-400">{correctCount}</p>
          </div>
          <div className="bg-black/50 border-l-4 border-red-500 p-4 rounded">
            <p className="text-gray-400 text-sm">ミス数</p>
            <p className="text-3xl font-bold text-red-400">{missCount}</p>
          </div>
          <div className="bg-black/50 border-l-4 border-yellow-500 p-4 rounded">
            <p className="text-gray-400 text-sm">最大コンボ</p>
            <p className="text-3xl font-bold text-yellow-400">{maxCombo}</p>
          </div>
          <div className="bg-black/50 border-l-4 border-green-500 p-4 rounded">
            <p className="text-gray-400 text-sm">経過時間</p>
            <p className="text-3xl font-bold text-green-400">{elapsedTime}秒</p>
          </div>
        </motion.div>

        {/* 報酬 */}
        {rewards.length > 0 && (
          <motion.div
            className="mb-8"
            variants={itemVariants}
          >
            <h3 className="text-xl font-bold text-white mb-4 text-center">🎁 獲得した報酬</h3>
            <div className="space-y-3">
              {rewards.map((reward, index) => (
                <motion.div
                  key={reward.id}
                  className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500 p-4 rounded-lg"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-white">{reward.name}</p>
                      <p className="text-sm text-gray-400">{reward.description}</p>
                      <p className="text-xs text-gray-500 mt-1">{reward.condition}</p>
                    </div>
                    <span className="text-3xl">{getRarityEmoji(reward.rarity)}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ボタン */}
        <motion.div
          className="flex gap-4 justify-center"
          variants={itemVariants}
        >
          {!isVictory && (
            <motion.button
              onClick={onRetry}
              className="px-8 py-3 bg-yellow-600 hover:bg-yellow-700 text-white font-bold rounded-lg transition"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              リトライ
            </motion.button>
          )}
          <motion.button
            onClick={onContinue}
            className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg transition"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isVictory ? '次へ進む' : '戻る'}
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
};

/**
 * レアリティに応じた絵文字を返す
 */
function getRarityEmoji(rarity: string): string {
  switch (rarity) {
    case 'legendary':
      return '⭐⭐⭐';
    case 'epic':
      return '⭐⭐';
    case 'rare':
      return '⭐';
    case 'uncommon':
      return '✨';
    case 'common':
      return '💫';
    default:
      return '❓';
  }
}

export default BossResultScreen;
