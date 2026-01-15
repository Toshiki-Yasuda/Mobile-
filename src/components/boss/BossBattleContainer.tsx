/**
 * ボス戦闘コンテナ
 * タイピング画面とボス画面の統合管理
 */

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBossStore } from '@/stores/bossStore';
import { useBossBattle } from '@/hooks/useBossBattle';
import { BossScreen } from '@/components/screens/BossScreen';
import { generateBossRewards } from '@/constants/bossConfigs';
import type { BossReward } from '@/types/boss';

interface BossBattleContainerProps {
  chapterId: number;
  words: Array<{
    id: string;
    word: string;
    ruby: string;
    difficulty: number;
  }>;
  onBattleComplete: (result: {
    isVictory: boolean;
    rank: 'S+' | 'S' | 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D';
    correctCount: number;
    missCount: number;
    maxCombo: number;
    elapsedTime: number;
    rewards: BossReward[];
  }) => void;
  onExit: () => void;
}

export const BossBattleContainer: React.FC<BossBattleContainerProps> = ({
  chapterId,
  words,
  onBattleComplete,
  onExit,
}) => {
  const store = useBossStore();
  const battle = useBossBattle(chapterId);
  const currentBattle = battle.getBattleState();

  const [showBossScreen, setShowBossScreen] = useState(true);
  const [wordIndex, setWordIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'wrong' | 'none'; message: string }>({
    type: 'none',
    message: '',
  });

  // 初期化
  useEffect(() => {
    if (!currentBattle) {
      store.initiateBossBattle(chapterId);
    }
  }, [chapterId, store, currentBattle]);

  // 現在の単語を取得
  const currentWord = words[wordIndex % words.length];

  /**
   * 入力を処理
   */
  const handleInput = useCallback(
    (value: string) => {
      setUserInput(value);

      // 自動判定：入力テキストが単語と一致したら
      if (value.toLowerCase() === currentWord.word.toLowerCase()) {
        handleCorrectAnswer();
      }
    },
    [currentWord]
  );

  /**
   * 正解処理
   */
  const handleCorrectAnswer = useCallback(() => {
    if (!battle.isBattleActive()) return;

    // ボスダメージ計算
    battle.handleCorrectAnswer(currentWord.difficulty);

    // フィードバック表示
    setFeedback({ type: 'correct', message: '正解！' });

    // 次の単語へ
    setUserInput('');
    setWordIndex((prev) => prev + 1);

    // フィードバッククリア
    setTimeout(() => setFeedback({ type: 'none', message: '' }), 500);
  }, [battle, currentWord.difficulty]);

  /**
   * 不正解処理
   */
  const handleWrongAnswer = useCallback(() => {
    if (!battle.isBattleActive()) return;

    // カウンターダメージ
    battle.handleWrongAnswer();

    // フィードバック表示
    setFeedback({ type: 'wrong', message: '不正解...' });

    // 入力リセット
    setUserInput('');

    // フィードバッククリア
    setTimeout(() => setFeedback({ type: 'none', message: '' }), 500);
  }, [battle]);

  /**
   * バトル完了処理
   */
  const handleBattleComplete = useCallback(
    (result: {
      isVictory: boolean;
      rank: 'S+' | 'S' | 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D';
      correctCount: number;
      missCount: number;
      maxCombo: number;
      elapsedTime: number;
      rewards: BossReward[];
    }) => {
      // 報酬生成
      const rewards = generateBossRewards(chapterId, result.rank);

      // ストアに結果を保存
      const bossId = `boss_chapter${chapterId}`;
      useBossStore().endBossBattle({
        bossId,
        chapterId,
        rank: result.rank,
        isVictory: result.isVictory,
        playerFinalHP: currentBattle?.playerHP || 0,
        correctCount: result.correctCount,
        missCount: result.missCount,
        maxCombo: result.maxCombo,
        elapsedTime: result.elapsedTime,
        rewardsEarned: rewards,
        timestamp: Date.now(),
      });

      // コールバック実行
      onBattleComplete({
        isVictory: result.isVictory,
        rank: result.rank,
        correctCount: result.correctCount,
        missCount: result.missCount,
        maxCombo: result.maxCombo,
        elapsedTime: result.elapsedTime,
        rewards,
      });
    },
    [chapterId, currentBattle?.playerHP, onBattleComplete]
  );

  /**
   * バトル終了時の処理
   */
  const handleBattleExit = useCallback(() => {
    useBossStore().clearBattle();
    onExit();
  }, [onExit]);

  if (!currentBattle) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-center">
          <p className="text-white text-xl mb-4">ボス戦を準備中...</p>
          <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden">
      {/* ボス画面 */}
      <div className="absolute inset-0">
        <BossScreen
          chapterId={chapterId}
          onBattleComplete={handleBattleComplete}
          onExit={handleBattleExit}
        />
      </div>

      {/* タイピング入力エリア（オーバーレイ） */}
      <AnimatePresence>
        {battle.isBattleActive() && (
          <motion.div
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent p-6 z-40"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
          >
            <div className="max-w-2xl mx-auto">
              {/* 出題単語 */}
              <motion.div
                key={currentWord.id}
                className="text-center mb-4"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring' }}
              >
                <p className="text-gray-400 text-sm mb-2">難易度: {'★'.repeat(currentWord.difficulty)}</p>
                <p className="text-white text-3xl font-bold font-title">{currentWord.word}</p>
                <p className="text-gray-400 text-lg mt-2">{currentWord.ruby}</p>
              </motion.div>

              {/* 入力フィールド */}
              <div className="mb-4">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => handleInput(e.target.value)}
                  placeholder="ここに入力..."
                  className="w-full bg-gray-800 border-2 border-purple-500 text-white px-4 py-3 rounded-lg focus:outline-none focus:border-purple-400 text-center text-xl"
                  autoFocus
                />
              </div>

              {/* フィードバック */}
              <AnimatePresence>
                {feedback.type !== 'none' && (
                  <motion.div
                    className={`text-center text-lg font-bold p-2 rounded ${
                      feedback.type === 'correct'
                        ? 'text-green-400 bg-green-500/20'
                        : 'text-red-400 bg-red-500/20'
                    }`}
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.5, opacity: 0 }}
                  >
                    {feedback.message}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ボタン */}
              <div className="flex gap-3 mt-4">
                <motion.button
                  onClick={handleCorrectAnswer}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg transition"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  正解
                </motion.button>
                <motion.button
                  onClick={handleWrongAnswer}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  不正解
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BossBattleContainer;
