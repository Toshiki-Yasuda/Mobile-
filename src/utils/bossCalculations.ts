/**
 * ボスシステム計算ユーティリティ
 * ダメージ計算、ランク判定、攻撃パターン判定など
 */

import { ALL_BOSS_DIFFICULTIES } from '@/constants/bossConfigs';
import type { BossRank } from '@/types/boss';

/**
 * ボスへのダメージを計算
 * @param wordDifficulty 単語の難易度（1-3）
 * @param comboCount 現在のコンボ数
 * @param chapterId チャプター番号
 * @returns ボスへのダメージ量
 */
export const calculateBossDamage = (
  wordDifficulty: number,
  comboCount: number,
  chapterId: number
): number => {
  const baseCorrect = 10;
  const difficultyBonus = wordDifficulty * 5;
  const comboBonus = Math.floor(comboCount / 5) * 3;
  return baseCorrect + difficultyBonus + comboBonus;
};

/**
 * プレイヤーへのダメージを計算
 * @param baseDamage 基本ダメージ（通常10）
 * @param chapterId チャプター番号
 * @param isCritical クリティカルヒットか
 * @returns プレイヤーへのダメージ量
 */
export const calculatePlayerDamage = (
  baseDamage: number,
  chapterId: number,
  isCritical: boolean = false
): number => {
  const difficulty = ALL_BOSS_DIFFICULTIES[chapterId];
  if (!difficulty) return baseDamage;

  let damage = Math.round(baseDamage * difficulty.damageScaling);
  if (isCritical) {
    damage = Math.round(damage * 1.5);
  }
  return damage;
};

/**
 * 回復量を計算
 * @param baseRecovery 基本回復量
 * @param chapterId チャプター番号
 * @returns 実際の回復量
 */
export const calculateRecovery = (baseRecovery: number, chapterId: number): number => {
  const difficulty = ALL_BOSS_DIFFICULTIES[chapterId];
  if (!difficulty) return baseRecovery;

  const reductionFactor = 1 - difficulty.recoveryReduction / 100;
  return Math.round(baseRecovery * reductionFactor);
};

/**
 * ボスランクを判定
 * @param playerHP プレイヤー最終HP
 * @param maxHP プレイヤー最大HP
 * @param elapsedSeconds 経過秒数
 * @param timeLimit 時間制限（秒、nullで無制限）
 * @param missCount ミス数
 * @returns ボスランク
 */
export const calculateBossRank = (
  playerHP: number,
  maxHP: number,
  elapsedSeconds: number,
  timeLimit: number | null,
  missCount: number
): BossRank => {
  const hpRatio = playerHP / maxHP;

  // S+: 2分以内に無傷クリア（時間制限がある場合）
  if (timeLimit && elapsedSeconds <= 120 && missCount === 0) {
    return 'S+';
  }

  // S: ノーミス + 時間内クリア
  if (missCount === 0 && (timeLimit ? elapsedSeconds <= timeLimit : true)) {
    return 'S';
  }

  // A+: 1度のダメージ + 条件クリア
  if (hpRatio >= 0.9 && missCount <= 1) {
    return 'A+';
  }

  // A: 2-3回ダメージ + クリア
  if (hpRatio >= 0.7 && missCount <= 3) {
    return 'A';
  }

  // B+: 健闘したが敗北に近かった
  if (hpRatio >= 0.2) {
    return 'B+';
  }

  // B: 標準的なクリア
  if (hpRatio > 0) {
    return 'B';
  }

  // C: かろうじてクリア
  return 'C';
};

/**
 * ボスが攻撃するべきかを判定
 * @param turnCount ターン数
 * @param pattern 攻撃パターン
 * @returns 攻撃すべきか
 */
export const shouldBossAttack = (
  turnCount: number,
  pattern: 'normal' | 'timed' | 'random' = 'normal'
): boolean => {
  switch (pattern) {
    case 'normal':
      // 10ターンごとに攻撃
      return turnCount % 10 === 0 && turnCount > 0;
    case 'timed':
      // 30ターンごとに攻撃（時間経過パターン用）
      return turnCount % 30 === 0 && turnCount > 0;
    case 'random':
      // 5%の確率で攻撃
      return Math.random() < 0.05;
    default:
      return false;
  }
};

/**
 * ボスの次の攻撃時刻を計算
 * @param currentTime 現在時刻（ms）
 * @param timingPattern 時間間隔（ms）
 * @param variance ばらつき（ms）
 * @returns 次の攻撃時刻
 */
export const calculateNextAttackTime = (
  currentTime: number,
  timingPattern: number,
  variance: number = 0
): number => {
  const randomVariance = (Math.random() - 0.5) * 2 * variance;
  return currentTime + timingPattern + randomVariance;
};

/**
 * コンボボーナスを計算
 * @param comboCount コンボ数
 * @param chapterId チャプター番号
 * @returns ボーナスダメージ
 */
export const calculateComboBonus = (comboCount: number, chapterId: number): number => {
  const difficulty = ALL_BOSS_DIFFICULTIES[chapterId];
  if (!difficulty) return 0;

  const thresholds = difficulty.comboThreshold;
  let bonus = 0;

  for (let i = 0; i < thresholds.length; i++) {
    if (comboCount >= thresholds[i]) {
      bonus = (i + 1) * 5;
    }
  }

  return bonus;
};

/**
 * クリティカルヒット判定
 * @param baseChance 基本確率（0-1）
 * @returns クリティカルかどうか
 */
export const isCriticalHit = (baseChance: number = 0.1): boolean => {
  return Math.random() < baseChance;
};

/**
 * ボスのフェーズ判定
 * @param currentHP 現在HP
 * @param maxHP 最大HP
 * @param totalPhases 総フェーズ数
 * @returns 現在のフェーズ（1-4）
 */
export const calculateBossPhase = (
  currentHP: number,
  maxHP: number,
  totalPhases: number
): number => {
  const hpRatio = currentHP / maxHP;

  if (totalPhases === 1) {
    return 1;
  } else if (totalPhases === 2) {
    return hpRatio > 0.5 ? 1 : 2;
  } else if (totalPhases === 3) {
    if (hpRatio > 2 / 3) return 1;
    if (hpRatio > 1 / 3) return 2;
    return 3;
  } else {
    // 4フェーズ以上
    if (hpRatio > 0.75) return 1;
    if (hpRatio > 0.5) return 2;
    if (hpRatio > 0.25) return 3;
    return 4;
  }
};

/**
 * ボスの攻撃パターンを取得
 * @param phase フェーズ
 * @param pattern パターン名
 * @returns 攻撃間隔（ms）
 */
export const getBossAttackInterval = (
  phase: number,
  pattern: 'normal' | 'aggressive' | 'defensive'
): number => {
  const baseInterval = 10000; // 10秒

  switch (pattern) {
    case 'normal':
      return baseInterval;
    case 'aggressive':
      // フェーズが進むほど攻撃が速くなる
      return Math.max(5000, baseInterval - phase * 1000);
    case 'defensive':
      // フェーズが進むほど攻撃が遅くなる
      return baseInterval + phase * 1000;
    default:
      return baseInterval;
  }
};

/**
 * ランクのテキスト説明を取得
 */
export const getBossRankDescription = (rank: BossRank): string => {
  const descriptions: Record<BossRank, string> = {
    'S+': '完全勝利 - 最高の実力を発揮',
    'S': 'ノーミス - 完璧なプレイ',
    'A+': '優秀 - ほぼ無傷でのクリア',
    'A': '良好 - 良いプレイ',
    'B+': '健闘 - 敗北寸前だったが勝利',
    'B': '標準 - 標準的なクリア',
    'C': 'ぎりぎり - かろうじてクリア',
    'D': '敗北 - ボスには勝てなかった',
  };
  return descriptions[rank];
};

/**
 * 章別の攻撃パターンを取得
 * @param chapter チャプター番号
 * @param phase ボスのフェーズ
 * @returns 攻撃パターン（'normal' | 'aggressive' | 'combined'）
 */
export const getBossAttackPattern = (chapter: number, phase: number): string => {
  switch (chapter) {
    case 1:
      // Chapter 1: 通常攻撃のみ
      return 'normal';
    case 2:
      // Chapter 2: フェーズが進むと攻撃速度UP
      return phase >= 2 ? 'aggressive' : 'normal';
    case 3:
      // Chapter 3: 複合パターン（速度 + 多段攻撃）
      return phase >= 3 ? 'combined' : 'aggressive';
    case 4:
      // Chapter 4: フェーズ3で複合攻撃に強化
      return phase >= 3 ? 'combined' : phase >= 2 ? 'aggressive' : 'normal';
    case 5:
      // Chapter 5: 常に複合攻撃
      return 'combined';
    case 6:
      // Chapter 6: 最初から複合、最後は最強
      return phase >= 3 ? 'intense' : 'combined';
    case 7:
      // Chapter 7: 適応攻撃（全パターン混在）
      return 'adaptive';
    default:
      return 'normal';
  }
};

/**
 * 攻撃パターンに基づいた攻撃間隔を計算
 * @param pattern 攻撃パターン
 * @param baseInterval 基本間隔（ms）
 * @returns 実際の攻撃間隔（ms）
 */
export const getAttackIntervalByPattern = (pattern: string, baseInterval: number): number => {
  switch (pattern) {
    case 'normal':
      return baseInterval;
    case 'aggressive':
      return Math.max(5000, baseInterval * 0.7);
    case 'combined':
      return Math.max(4000, baseInterval * 0.6);
    case 'intense':
      return Math.max(3000, baseInterval * 0.5);
    case 'adaptive':
      // ランダムな間隔
      return Math.max(3000, baseInterval * (0.4 + Math.random() * 0.3));
    default:
      return baseInterval;
  }
};

/**
 * ボスの攻撃予告メッセージを生成
 */
export const generateBossWarningMessage = (bossName: string, attackType: string): string => {
  const messages = [
    `${bossName}が${attackType}を狙っている！`,
    `${bossName}が次の一手を準備している！`,
    `危ない！${bossName}の攻撃が来る！`,
    `${bossName}の攻撃パターンが変わった！`,
  ];
  return messages[Math.floor(Math.random() * messages.length)];
};

/**
 * ボスの勝利メッセージを生成
 */
export const generateBossVictoryMessage = (
  bossName: string,
  rank: BossRank
): string => {
  const messages: Record<BossRank, string> = {
    'S+': `${bossName}を完全に倒した！完璧だ！`,
    'S': `${bossName}を見事に倒した！`,
    'A+': `${bossName}に勝った！素晴らしい戦い！`,
    'A': `${bossName}を倒した！`,
    'B+': `${bossName}との激戦に勝った！`,
    'B': `${bossName}を倒した`,
    'C': `${bossName}をなんとか倒した`,
    'D': `${bossName}に敗北した`,
  };
  return messages[rank];
};
