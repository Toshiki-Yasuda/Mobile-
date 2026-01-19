/**
 * ボス戦闘コンテナ
 * タイピング画面とボス画面の統合管理
 * romajiEngineを使用してローマ字入力を正しく処理
 */

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBossStore } from '@/stores/bossStore';
import { useBossBattle } from '@/hooks/useBossBattle';
import { BossScreen } from '@/components/screens/BossScreen';
import { generateBossRewards } from '@/constants/bossConfigs';
import { useSound } from '@/hooks/useSound';
import { bgmManager } from '@/utils/bgmManager';
import { ScreenFlash, ComboEffect, ScreenShake } from '@/components/effects';
import {
  createInitialState,
  processKeyInput,
  getCurrentValidKeys,
  getDisplayRomaji,
} from '@/engine/romajiEngine';
import type { TypingState } from '@/types/romaji';
import type { BossReward } from '@/types/boss';
import type { Word } from '@/types/game';

interface BossBattleContainerProps {
  chapterId: number;
  words: Word[];
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
  const { playTypeSound, playConfirmSound, playMissSound } = useSound();

  const [wordIndex, setWordIndex] = useState(0);
  const [typingState, setTypingState] = useState<TypingState | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'correct' | 'wrong' | 'none'; message: string }>({
    type: 'none',
    message: '',
  });
  // エフェクト用トリガー
  const [successTrigger, setSuccessTrigger] = useState(0);
  const [missTrigger, setMissTrigger] = useState(0);

  // 初期化
  useEffect(() => {
    if (!currentBattle) {
      store.initiateBossBattle(chapterId);
    }
  }, [chapterId, store, currentBattle]);

  // ボス戦開始時にBGMを小さくする
  useEffect(() => {
    bgmManager.lowerVolume(0.40);
    return () => {
      bgmManager.restoreVolume();
    };
  }, []);

  // 現在の単語を取得（wordsが空の場合はnull）
  const currentWord = words && words.length > 0 ? words[wordIndex % words.length] : null;

  // 単語が変わったらタイピング状態を初期化
  useEffect(() => {
    if (currentWord && currentWord.hiragana) {
      // hiraganaはひらがな（判定用）、displayは表示用
      const state = createInitialState(currentWord.hiragana);
      setTypingState(state);
    }
  }, [currentWord, wordIndex]);


  /**
   * 正解処理（単語完了時）
   */
  const handleWordComplete = useCallback(() => {
    if (!battle.isBattleActive() || !currentWord) return;

    // ボスダメージ計算
    battle.handleCorrectAnswer(currentWord.difficulty);
    playConfirmSound(currentBattle?.comboCount || 0);

    // エフェクトトリガー更新（爽快感演出）
    setSuccessTrigger(prev => prev + 1);

    // フィードバック表示
    setFeedback({ type: 'correct', message: '正解！' });

    // 次の単語へ
    setWordIndex((prev) => prev + 1);

    // フィードバッククリア
    setTimeout(() => setFeedback({ type: 'none', message: '' }), 500);
  }, [battle, currentWord, currentBattle?.comboCount, playConfirmSound]);

  /**
   * ミス処理
   */
  const handleMiss = useCallback(() => {
    if (!battle.isBattleActive()) return;

    // カウンターダメージ
    battle.handleWrongAnswer();
    playMissSound();

    // エフェクトトリガー更新（ミス演出）
    setMissTrigger(prev => prev + 1);

    // フィードバック表示
    setFeedback({ type: 'wrong', message: 'ミス！' });

    // フィードバッククリア
    setTimeout(() => setFeedback({ type: 'none', message: '' }), 500);
  }, [battle, playMissSound]);

  /**
   * キーボード入力処理（romajiEngineを使用）
   * windowレベルでイベントをキャッチ
   */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!typingState || typingState.isComplete || !battle.isBattleActive() || !currentWord) {
        return;
      }

      // 制御キーは無視
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      // 1文字のキーのみ処理
      if (e.key.length !== 1) return;

      e.preventDefault();
      const key = e.key.toLowerCase();

      // romajiEngineで入力を処理
      const result = processKeyInput(typingState, key);

      if (result.isMiss) {
        // ミス
        handleMiss();
        return;
      }

      if (result.isValid) {
        // 正しい入力
        setTypingState(result.newState);
        playTypeSound(currentBattle?.comboCount || 0);

        if (result.isWordComplete) {
          // 単語完了
          handleWordComplete();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [typingState, battle, handleMiss, handleWordComplete, playTypeSound, currentBattle?.comboCount, currentWord]);

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
      store.endBossBattle({
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
    [chapterId, currentBattle?.playerHP, onBattleComplete, store]
  );

  /**
   * バトル終了時の処理
   */
  const handleBattleExit = useCallback(() => {
    store.clearBattle();
    onExit();
  }, [store, onExit]);

  // 単語データがない場合
  if (!words || words.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="text-center">
          <p className="text-red-400 text-xl mb-4">単語データが見つかりません</p>
          <p className="text-gray-400 mb-4">チャプター {chapterId} のステージ6のデータがありません</p>
          <button
            onClick={onExit}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg"
          >
            戻る
          </button>
        </div>
      </div>
    );
  }

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
      {/* 画面フラッシュエフェクト（最上位レイヤー） */}
      <ScreenFlash
        successTrigger={successTrigger}
        missTrigger={missTrigger}
        combo={currentBattle?.comboCount || 0}
      />

      {/* コンボマイルストーン演出 */}
      <ComboEffect combo={currentBattle?.comboCount || 0} />

      {/* メインコンテンツ（シェイクエフェクトでラップ） */}
      <ScreenShake
        trigger={missTrigger}
        intensity="light"
        successTrigger={successTrigger}
        combo={currentBattle?.comboCount || 0}
      >
        {/* ボス画面 */}
        <div className="absolute inset-0">
          <BossScreen
            chapterId={chapterId}
            onBattleComplete={handleBattleComplete}
            onExit={handleBattleExit}
            hidePlayerHP={battle.isBattleActive() && typingState !== null && currentWord !== null}
          />
        </div>

      {/* タイピング入力エリア（オーバーレイ） */}
      <AnimatePresence>
        {battle.isBattleActive() && typingState && currentWord && (
          <motion.div
            className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent p-6 z-40"
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 100 }}
          >
            <div className="max-w-2xl mx-auto">
              {/* プレイヤーHP表示（ボスHPバーと統一デザイン） */}
              <div className="mb-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-title text-lg font-bold text-white drop-shadow-lg">あなた</span>
                  <span className={`text-sm font-bold drop-shadow-lg ${
                    ((currentBattle?.playerHP || 0) / (currentBattle?.playerMaxHP || 100)) * 100 > 50 ? 'text-blue-400' :
                    ((currentBattle?.playerHP || 0) / (currentBattle?.playerMaxHP || 100)) * 100 > 25 ? 'text-yellow-400' :
                    ((currentBattle?.playerHP || 0) / (currentBattle?.playerMaxHP || 100)) * 100 > 10 ? 'text-orange-400' : 'text-red-400'
                  }`}>
                    {Math.max(0, currentBattle?.playerHP || 0)} / {currentBattle?.playerMaxHP || 100}
                  </span>
                </div>
                <div className="w-full bg-gray-900 rounded-full h-8 overflow-hidden border-2 border-gray-700 shadow-inner">
                  <motion.div
                    className={`h-full flex items-center justify-center shadow-lg bg-gradient-to-r ${
                      ((currentBattle?.playerHP || 0) / (currentBattle?.playerMaxHP || 100)) * 100 > 50 ? 'from-blue-600 to-cyan-500' :
                      ((currentBattle?.playerHP || 0) / (currentBattle?.playerMaxHP || 100)) * 100 > 25 ? 'from-yellow-600 to-yellow-500' :
                      ((currentBattle?.playerHP || 0) / (currentBattle?.playerMaxHP || 100)) * 100 > 10 ? 'from-orange-600 to-orange-500' : 'from-red-700 to-red-600'
                    }`}
                    initial={{ width: '100%' }}
                    animate={{ width: `${((currentBattle?.playerHP || 0) / (currentBattle?.playerMaxHP || 100)) * 100}%` }}
                    transition={{ duration: 0.3 }}
                  >
                    {((currentBattle?.playerHP || 0) / (currentBattle?.playerMaxHP || 100)) * 100 > 10 && (
                      <span className="text-white text-sm font-bold drop-shadow-lg">
                        {(((currentBattle?.playerHP || 0) / (currentBattle?.playerMaxHP || 100)) * 100).toFixed(0)}%
                      </span>
                    )}
                  </motion.div>
                </div>
              </div>

              {/* 出題単語 */}
              <motion.div
                key={currentWord.id}
                className="text-center mb-6"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring' }}
              >
                <p className="text-gray-400 text-base mb-2">難易度: {'★'.repeat(currentWord.difficulty)}</p>
                <p className="text-white text-5xl lg:text-6xl font-bold font-title">{currentWord.display}</p>
                <p className="text-purple-300 text-xl lg:text-2xl mt-3">{currentWord.hiragana}</p>
              </motion.div>

              {/* ローマ字表示（入力済み + 残り） */}
              <div className="text-center mb-6">
                <div className="text-3xl lg:text-4xl font-mono tracking-wider">
                  {/* 入力済みのローマ字 */}
                  <span className="text-green-400">{typingState.confirmedRomaji}</span>
                  {/* 残りのローマ字（現在のトークン以降） */}
                  <span className="text-gray-400">
                    {typingState.tokens.length > 0
                      ? getDisplayRomaji(typingState.tokens.slice(typingState.currentTokenIndex).join(''))
                      : ''}
                  </span>
                </div>
              </div>

              {/* 次のキーヒント */}
              <div className="text-center mb-4">
                <span className="text-gray-500 text-base">次のキー: </span>
                <span className="text-yellow-400 font-bold text-xl lg:text-2xl">
                  {getCurrentValidKeys(typingState).join(' / ')}
                </span>
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

              {/* 操作ガイド */}
              <div className="text-center text-gray-500 text-xs mt-4">
                キーボードで入力してください
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </ScreenShake>
    </div>
  );
};

export default BossBattleContainer;
