/**
 * ボスバトルメインスクリーン
 * 敵との単語タイピングバトルの画面
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useBossStore } from '@/stores/bossStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useSound } from '@/hooks/useSound';
import { BossCharacter, BossHPBar, BossEffects, BossDialog } from '@/components/boss';
import {
  calculateBossDamage,
  calculatePlayerDamage,
  calculateBossPhase,
  calculateBossRank,
  generateBossVictoryMessage,
  generateBossWarningMessage,
  isCriticalHit,
  getBossAttackInterval,
  getBossAttackPattern,
  getAttackIntervalByPattern,
} from '@/utils/bossCalculations';
import { ALL_BOSS_DIFFICULTIES } from '@/constants/bossConfigs';
import type { BossBattleState, BossReward } from '@/types/boss';

interface BossScreenProps {
  chapterId: number;
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

export const BossScreen: React.FC<BossScreenProps> = ({ chapterId, onBattleComplete, onExit }) => {
  const store = useBossStore();
  const battle = store.currentBattle;
  const { enableCaptions } = useSettingsStore();
  const { playStartSound, playMissSound, playConfirmSound, playComboSound, playSuccessSound } = useSound();

  // ローカル状態
  const [showingEffect, setShowingEffect] = useState<{
    type: 'damage' | 'heal' | 'critical' | 'attack' | 'combo' | 'none';
    amount?: number;
  }>({ type: 'none' });
  const [bossMessage, setBossMessage] = useState<string | null>(null);
  const [maxCombo, setMaxCombo] = useState(0);
  const [startTime] = useState(Date.now());
  const [gameActive, setGameActive] = useState(true);
  const prevComboRef = useRef(0);
  const gameStartedRef = useRef(false);

  // 敵攻撃タイマー用
  const attackTimerRef = useRef<NodeJS.Timeout | null>(null);
  const gameLoopRef = useRef<NodeJS.Timeout | null>(null);

  // 敵HP更新時のエフェクト表示
  useEffect(() => {
    if (!battle) return;

    // コンボ更新
    if (battle.comboCount > maxCombo) {
      setMaxCombo(battle.comboCount);
      // コンボ5の倍数でサウンド
      if (battle.comboCount > 0 && battle.comboCount % 5 === 0) {
        playComboSound(battle.comboCount);
      }
    }

    // フェーズ変化の検出
    const newPhase = calculateBossPhase(battle.bossHP, battle.bossMaxHP, 4);
    if (newPhase !== battle.currentPhase) {
      setBossMessage(`フェーズ ${newPhase} へ進行！`);
    }
  }, [battle?.bossHP, battle?.comboCount, maxCombo, battle?.currentPhase, playComboSound]);

  // プレイヤーへのダメージ表示
  const handlePlayerTakeDamage = useCallback((damage: number) => {
    setShowingEffect({ type: 'damage', amount: damage });
    // ダメージ音を再生
    playMissSound();
    // ハプティックフィードバック（実装済みの場合）
    if (navigator.vibrate) {
      navigator.vibrate(100);
    }
  }, [playMissSound]);

  // 敵への攻撃ダメージ表示
  const handleBossTakeDamage = useCallback((damage: number) => {
    const isCritical = isCriticalHit(0.1);
    if (isCritical) {
      setShowingEffect({ type: 'critical', amount: damage });
    } else {
      setShowingEffect({ type: 'damage', amount: damage });
    }
    // ヒット音を再生（クリティカルでもそうでなくても）
    playConfirmSound(0);
  }, [playConfirmSound]);

  // コンボ達成時の表示
  const handleComboMilestone = useCallback(() => {
    setShowingEffect({ type: 'combo' });
  }, []);

  // 敵攻撃処理
  const executeEnemyAttack = useCallback(() => {
    if (!battle || !gameActive) return;

    const baseDamage = 10;
    const isCritical = isCriticalHit(0.15);
    const damage = calculatePlayerDamage(baseDamage, chapterId, isCritical);

    // ダメージを与える
    store.dealDamageToPlayer(damage);
    handlePlayerTakeDamage(damage);

    // ボスメッセージ
    const attackMessages = [
      `${battle.currentBoss.name}が攻撃を仕掛けてきた！`,
      `${battle.currentBoss.name}：${battle.currentBoss.dialogueLines[Math.floor(Math.random() * battle.currentBoss.dialogueLines.length)]}`,
      `危ない！${battle.currentBoss.name}の攻撃が来た！`,
    ];
    setBossMessage(attackMessages[Math.floor(Math.random() * attackMessages.length)]);

    // 次の敵攻撃をスケジュール
    const difficulty = ALL_BOSS_DIFFICULTIES[chapterId];
    if (difficulty) {
      const currentPhase = calculateBossPhase(battle.bossHP, battle.bossMaxHP, 4);
      // 章別の攻撃パターンを取得
      const attackPattern = getBossAttackPattern(chapterId, currentPhase);
      // パターンに基づいた攻撃間隔を計算
      const interval = getAttackIntervalByPattern(attackPattern, 10000);

      if (attackTimerRef.current) {
        clearTimeout(attackTimerRef.current);
      }

      attackTimerRef.current = setTimeout(() => {
        executeEnemyAttack();
      }, interval);
    }
  }, [battle, chapterId, gameActive, store, handlePlayerTakeDamage]);

  // ゲーム終了チェック
  useEffect(() => {
    if (!battle || !gameActive) return;

    // プレイヤーHP確認（敗北条件）
    if (battle.playerHP <= 0) {
      setGameActive(false);

      if (attackTimerRef.current) clearTimeout(attackTimerRef.current);
      if (gameLoopRef.current) clearTimeout(gameLoopRef.current);

      const elapsedSeconds = Math.round((Date.now() - startTime) / 1000);
      const finalDifficulty = ALL_BOSS_DIFFICULTIES[chapterId];
      const rank = calculateBossRank(
        battle.playerHP,
        battle.playerMaxHP,
        elapsedSeconds,
        finalDifficulty?.timeLimit || null,
        battle.missCount
      );

      onBattleComplete({
        isVictory: false,
        rank,
        correctCount: battle.correctCount,
        missCount: battle.missCount,
        maxCombo: maxCombo,
        elapsedTime: elapsedSeconds,
        rewards: [],
      });
      return;
    }

    // ボス撃破確認（勝利条件）
    if (battle.isDefeated) {
      setGameActive(false);

      if (attackTimerRef.current) clearTimeout(attackTimerRef.current);
      if (gameLoopRef.current) clearTimeout(gameLoopRef.current);

      const elapsedSeconds = Math.round((Date.now() - startTime) / 1000);
      const finalDifficulty = ALL_BOSS_DIFFICULTIES[chapterId];
      const rank = calculateBossRank(
        battle.playerHP,
        battle.playerMaxHP,
        elapsedSeconds,
        finalDifficulty?.timeLimit || null,
        battle.missCount
      );

      // 勝利音を再生
      playSuccessSound();

      setBossMessage(generateBossVictoryMessage(battle.currentBoss.name, rank));

      // 報酬生成（ここではプレースホルダー）
      const rewards: BossReward[] = [];

      onBattleComplete({
        isVictory: true,
        rank,
        correctCount: battle.correctCount,
        missCount: battle.missCount,
        maxCombo: maxCombo,
        elapsedTime: elapsedSeconds,
        rewards,
      });
    }
  }, [battle?.playerHP, battle?.isDefeated, gameActive, startTime, chapterId, maxCombo, onBattleComplete, playSuccessSound]);

  // 初回敵攻撃スケジュール＆ゲーム開始音
  useEffect(() => {
    if (!battle || !gameActive) return;

    const difficulty = ALL_BOSS_DIFFICULTIES[chapterId];
    if (!difficulty) return;

    // ゲーム開始時のサウンド（最初の1回だけ）
    if (!gameStartedRef.current) {
      playStartSound();
      gameStartedRef.current = true;
    }

    // 最初の攻撃まで10秒待機
    if (attackTimerRef.current) clearTimeout(attackTimerRef.current);

    attackTimerRef.current = setTimeout(() => {
      executeEnemyAttack();
    }, 10000);

    return () => {
      if (attackTimerRef.current) clearTimeout(attackTimerRef.current);
    };
  }, [battle, gameActive, chapterId, executeEnemyAttack, playStartSound]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (attackTimerRef.current) clearTimeout(attackTimerRef.current);
      if (gameLoopRef.current) clearTimeout(gameLoopRef.current);
    };
  }, []);

  if (!battle) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-white text-xl">ボス戦闘を初期化中...</p>
      </div>
    );
  }

  const elapsedSeconds = Math.round((Date.now() - startTime) / 1000);
  const hpPercentage = (battle.bossHP / battle.bossMaxHP) * 100;
  const playerHpPercentage = (battle.playerHP / battle.playerMaxHP) * 100;

  return (
    <div className="relative w-full h-screen bg-gradient-to-b from-gray-900 via-black to-gray-900 overflow-hidden">
      {/* 背景グラデーション */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-red-500 rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-1/3 h-1/3 bg-purple-500 rounded-full filter blur-3xl"></div>
      </div>

      {/* 敵エフェクト */}
      <BossEffects
        damageAmount={showingEffect.amount}
        showDamage={showingEffect.type !== 'none'}
        effectType={showingEffect.type}
        onEffectComplete={() => setShowingEffect({ type: 'none' })}
      />

      {/* 敵キャラクター */}
      <motion.div
        className="absolute top-16 left-1/2 -translate-x-1/2 z-20"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <BossCharacter
          boss={battle.currentBoss}
          isAttacking={showingEffect.type === 'attack'}
          isDamaged={showingEffect.type === 'damage'}
          phase={calculateBossPhase(battle.bossHP, battle.bossMaxHP, 4)}
        />
      </motion.div>

      {/* 敵HP表示 */}
      <motion.div
        className="absolute top-32 left-1/2 -translate-x-1/2 w-3/4 max-w-lg z-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <BossHPBar
          currentHP={battle.bossHP}
          maxHP={battle.bossMaxHP}
          bossName={battle.currentBoss.name}
          isAttacking={showingEffect.type === 'attack'}
          specialStates={battle.specialStates}
        />
      </motion.div>

      {/* 敵セリフ */}
      <motion.div className="absolute top-1/3 left-1/2 -translate-x-1/2 z-30">
        <BossDialog
          message={bossMessage}
          duration={3000}
          priority={bossMessage?.includes('攻撃') ? 'high' : 'normal'}
        />
      </motion.div>

      {/* プレイヤーHP表示 */}
      <motion.div
        className="absolute bottom-32 left-1/2 -translate-x-1/2 w-3/4 max-w-lg z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="bg-black/70 border-2 border-blue-500 rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <span className="text-blue-400 font-bold">あなたのHP</span>
            <span className="text-white">{Math.max(0, battle.playerHP)} / {battle.playerMaxHP}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-6 overflow-hidden border border-blue-400">
            <motion.div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400"
              initial={{ width: '100%' }}
              animate={{ width: `${playerHpPercentage}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </motion.div>

      {/* 戦闘統計 */}
      <motion.div
        className="absolute top-1/2 right-4 text-white text-sm font-mono bg-black/70 border border-gray-500 rounded p-3 space-y-1 z-10"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div>⏱️ {elapsedSeconds}秒</div>
        <div>✅ 正解: {battle.correctCount}</div>
        <div>❌ ミス: {battle.missCount}</div>
        <div>🔥 コンボ: {battle.comboCount}</div>
        <div>🎯 MAX: {maxCombo}</div>
      </motion.div>

      {/* フェーズインジケーター */}
      {calculateBossPhase(battle.bossHP, battle.bossMaxHP, 4) > 1 && (
        <motion.div
          className="absolute top-1/4 left-4 text-yellow-400 text-lg font-bold z-10"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          Phase {calculateBossPhase(battle.bossHP, battle.bossMaxHP, 4)}
        </motion.div>
      )}

      {/* キャプション表示（アクセシビリティ） */}
      {enableCaptions && showingEffect.type !== 'none' && (
        <motion.div
          className="absolute bottom-40 left-1/2 -translate-x-1/2 bg-black/80 border border-white/20 rounded px-4 py-2 z-30 max-w-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          <p className="text-white text-xs text-center font-mono">
            {showingEffect.type === 'damage' && '[ダメージ音]'}
            {showingEffect.type === 'critical' && '[クリティカルヒット]'}
            {showingEffect.type === 'attack' && '[敵の攻撃]'}
            {showingEffect.type === 'heal' && '[回復]'}
            {showingEffect.type === 'combo' && '[コンボ達成]'}
          </p>
          {showingEffect.amount && (
            <p className="text-yellow-400 text-xs text-center mt-1 font-bold">
              {showingEffect.type === 'damage' && `${showingEffect.amount} ダメージ`}
              {showingEffect.type === 'heal' && `${showingEffect.amount} 回復`}
            </p>
          )}
        </motion.div>
      )}

      {/* ゲーム終了オーバーレイ */}
      <AnimatePresence>
        {!gameActive && (
          <motion.div
            className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="text-center"
              initial={{ scale: 0.5, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-4xl font-bold text-white mb-4">{bossMessage || 'バトル終了'}</p>
              <motion.button
                onClick={onExit}
                className="mt-6 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                続行
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BossScreen;
