/**
 * ボスシステム設定・定数
 * 全7章のボス敵設定、難易度、計算関数
 */

import type { BossCharacter, BossDifficulty, AttackPattern, BossReward } from '@/types/boss';

/**
 * ============================================
 * Chapter 1: ハンゼ - 修行者
 * ============================================
 */
export const CHAPTER_1_BOSS: BossCharacter = {
  id: 'boss_chapter1',
  chapterId: 1,
  name: 'ハンゼ',
  japaneseTitle: '修行者',
  description: 'ハンター試験の試験官。試験者の精神力を試す者。',
  imageUrl: '/Mobile-/images/bosses/hanze.png',
  weakPoints: ['集中力', 'リズム感'],
  dialogueLines: [
    'ハンター試験の真の試練はここからだ',
    '集中できていないようだな',
    '見事な集中力だ',
    '諦めてはいけない',
  ],
};

export const CHAPTER_1_DIFFICULTY: BossDifficulty = {
  wordDifficultyMultiplier: 1.0,
  timeLimit: null,
  maxMisses: 5,
  hpMultiplier: 1.0,
  damageScaling: 1.0,
  recoveryReduction: 0,
  comboThreshold: [5, 10, 20, 50],
};

/**
 * ============================================
 * Chapter 2: ヒソカ - トランプマジシャン
 * ============================================
 */
export const CHAPTER_2_BOSS: BossCharacter = {
  id: 'boss_chapter2',
  chapterId: 2,
  name: 'ヒソカ',
  japaneseTitle: 'トランプマジシャン',
  description: 'エキセントリックな念能力者。遊び相手を探している。',
  imageUrl: '/Mobile-/images/bosses/hisoka.png',
  weakPoints: ['予測', 'リズム感'],
  dialogueLines: [
    'いい緊張感だ',
    'もっと遊びたいんだが',
    '退屈させるな',
    'なかなかやるじゃないか',
  ],
};

export const CHAPTER_2_DIFFICULTY: BossDifficulty = {
  wordDifficultyMultiplier: 1.2,
  timeLimit: 120,
  maxMisses: 3,
  hpMultiplier: 1.2,
  damageScaling: 1.1,
  recoveryReduction: 20,
  comboThreshold: [5, 15, 30, 75],
};

/**
 * ============================================
 * Chapter 3: クロロ - 幻影旅団団長
 * ============================================
 */
export const CHAPTER_3_BOSS: BossCharacter = {
  id: 'boss_chapter3',
  chapterId: 3,
  name: 'クロロ',
  japaneseTitle: '幻影旅団団長',
  description: '幻影旅団の指導者。冷徹で戦略的。',
  imageUrl: '/Mobile-/images/bosses/kuroro.png',
  weakPoints: ['速度', '予測不可'],
  dialogueLines: [
    '盗賊団の本領を見せよう',
    'つまらん',
    '速度が落ちているようだ',
    'まだやるのか',
  ],
};

export const CHAPTER_3_DIFFICULTY: BossDifficulty = {
  wordDifficultyMultiplier: 1.5,
  timeLimit: 90,
  maxMisses: 2,
  hpMultiplier: 1.5,
  damageScaling: 1.3,
  recoveryReduction: 40,
  comboThreshold: [5, 15, 40, 100],
};

/**
 * ============================================
 * Chapter 4: ビスケ - 格闘技の達人
 * ============================================
 */
export const CHAPTER_4_BOSS: BossCharacter = {
  id: 'boss_chapter4',
  chapterId: 4,
  name: 'ビスケ',
  japaneseTitle: '格闘技の達人',
  description: 'G・I島での修行者。強力な念能力者。',
  imageUrl: '/Mobile-/images/bosses/bisuke.png',
  weakPoints: ['体力', '継続力'],
  dialogueLines: [
    'いい修行になるな',
    'もっと本気を出せ',
    '体力が続くか',
    '認めてやろう',
  ],
};

export const CHAPTER_4_DIFFICULTY: BossDifficulty = {
  wordDifficultyMultiplier: 1.3,
  timeLimit: 60,
  maxMisses: 5,
  hpMultiplier: 1.3,
  damageScaling: 1.2,
  recoveryReduction: 30,
  comboThreshold: [5, 10, 30, 80],
};

/**
 * ============================================
 * Chapter 5: 老ビスケ - 究極の修行
 * ============================================
 */
export const CHAPTER_5_BOSS: BossCharacter = {
  id: 'boss_chapter5',
  chapterId: 5,
  name: '老ビスケ',
  japaneseTitle: '究極の修行者',
  description: '若き日のビスケの姿。最強の念能力者。',
  imageUrl: '/Mobile-/images/bosses/bisuke_old.png',
  weakPoints: ['複数フェーズ対応', '速度変化'],
  dialogueLines: [
    '本当の修行が始まる',
    '甘い',
    '形態を変える',
    '究極の力を見せる',
  ],
};

export const CHAPTER_5_DIFFICULTY: BossDifficulty = {
  wordDifficultyMultiplier: 1.8,
  timeLimit: 120,
  maxMisses: 3,
  hpMultiplier: 2.0,
  damageScaling: 1.4,
  recoveryReduction: 50,
  comboThreshold: [5, 20, 50, 150],
};

/**
 * ============================================
 * Chapter 6: メルエム - キメラアント王
 * ============================================
 */
export const CHAPTER_6_BOSS: BossCharacter = {
  id: 'boss_chapter6',
  chapterId: 6,
  name: 'メルエム',
  japaneseTitle: 'キメラアント王',
  description: 'キメラアントの完全な王。最強の存在。',
  imageUrl: '/Mobile-/images/bosses/meruem.png',
  weakPoints: ['複雑な思考', 'マルチフェーズ'],
  dialogueLines: [
    '王の力を感じよ',
    '人間ごときが',
    '興味深い',
    '究極を超える力',
  ],
};

export const CHAPTER_6_DIFFICULTY: BossDifficulty = {
  wordDifficultyMultiplier: 2.0,
  timeLimit: null,
  maxMisses: 1,
  hpMultiplier: 2.5,
  damageScaling: 1.5,
  recoveryReduction: 60,
  comboThreshold: [5, 25, 60, 200],
};

/**
 * ============================================
 * Chapter 7: ネテロ会長 - 究極の試練
 * ============================================
 */
export const CHAPTER_7_BOSS: BossCharacter = {
  id: 'boss_chapter7',
  chapterId: 7,
  name: 'ネテロ会長',
  japaneseTitle: '究極の試練',
  description: 'ハンター協会会長。全ての修行の集大成。',
  imageUrl: '/Mobile-/images/bosses/netero.png',
  weakPoints: ['複数の制限', '相互作用'],
  dialogueLines: [
    'ハンターの道の果てを見せよう',
    'その程度か',
    '制約と誓いの究極',
    'よくやったな',
  ],
};

export const CHAPTER_7_DIFFICULTY: BossDifficulty = {
  wordDifficultyMultiplier: 1.6,
  timeLimit: null,
  maxMisses: 2,
  hpMultiplier: 1.8,
  damageScaling: 1.3,
  recoveryReduction: 45,
  comboThreshold: [5, 20, 50, 120],
};

/**
 * 全ボスの難易度設定マップ
 */
export const ALL_BOSS_DIFFICULTIES: Record<number, BossDifficulty> = {
  1: CHAPTER_1_DIFFICULTY,
  2: CHAPTER_2_DIFFICULTY,
  3: CHAPTER_3_DIFFICULTY,
  4: CHAPTER_4_DIFFICULTY,
  5: CHAPTER_5_DIFFICULTY,
  6: CHAPTER_6_DIFFICULTY,
  7: CHAPTER_7_DIFFICULTY,
};

/**
 * 全ボスの敵キャラクターマップ
 */
export const ALL_BOSS_CHARACTERS: Record<number, BossCharacter> = {
  1: CHAPTER_1_BOSS,
  2: CHAPTER_2_BOSS,
  3: CHAPTER_3_BOSS,
  4: CHAPTER_4_BOSS,
  5: CHAPTER_5_BOSS,
  6: CHAPTER_6_BOSS,
  7: CHAPTER_7_BOSS,
};

/**
 * ボスHP計算
 * @param chapterId チャプター番号
 * @returns ボスの最大HP
 */
export const calculateBossHP = (chapterId: number): number => {
  const baseHP = 150;
  const difficulty = ALL_BOSS_DIFFICULTIES[chapterId];
  if (!difficulty) return baseHP;
  return Math.round(baseHP * chapterId * difficulty.hpMultiplier);
};

/**
 * プレイヤーへのダメージを計算
 * @param baseDamage 基本ダメージ（通常10）
 * @param chapterId チャプター番号
 * @param isCritical クリティカルヒットか
 * @returns プレイヤーへのダメージ量
 */
export const calculateDamageToPlayer = (
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
 * ボスへのダメージを計算
 * @param wordDifficulty 単語の難易度（1-3）
 * @param comboCount 現在のコンボ数
 * @param chapterId チャプター番号
 * @returns ボスへのダメージ量
 */
export const calculateDamageToBoss = (
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
 * ボスランクを計算
 * @param playerFinalHP プレイヤー最終HP
 * @param maxHP プレイヤー最大HP
 * @param elapsedSeconds 経過秒数
 * @param timeLimit 時間制限（秒、nullで無制限）
 * @param missCount ミス数
 * @returns ボスランク
 */
export const calculateBossRank = (
  playerFinalHP: number,
  maxHP: number,
  elapsedSeconds: number,
  timeLimit: number | null,
  missCount: number
): 'S+' | 'S' | 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' => {
  const hpRatio = playerFinalHP / maxHP;

  // S+: 2分以内に無傷クリア
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
 * ボス報酬を生成
 * @param chapterId チャプター番号
 * @param rank ボスランク
 * @returns 獲得した報酬の配列
 */
export const generateBossRewards = (
  chapterId: number,
  rank: 'S+' | 'S' | 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D'
): BossReward[] => {
  const rewards: BossReward[] = [];

  // 基本報酬：ボスメダル
  rewards.push({
    type: 'medal',
    id: `boss_medal_chapter${chapterId}`,
    name: `ボスメダル - Chapter ${chapterId}`,
    description: `Chapter ${chapterId} のボスを倒した証`,
    rarity: 'rare',
    condition: 'ボスクリア',
  });

  // ランク別報酬
  if (rank === 'S+' || rank === 'S') {
    rewards.push({
      type: 'badge',
      id: `boss_master_chapter${chapterId}`,
      name: `マスターバッジ - Chapter ${chapterId}`,
      description: `Chapter ${chapterId} をマスター級でクリア`,
      rarity: 'epic',
      condition: 'S または S+ ランク達成',
    });
  }

  if (rank === 'S+') {
    rewards.push({
      type: 'achievement',
      id: `perfect_boss_chapter${chapterId}`,
      name: `完全勝利 - Chapter ${chapterId}`,
      description: `Chapter ${chapterId} を完全な状態でクリア`,
      rarity: 'legendary',
      condition: 'S+ ランク達成',
    });
  }

  // 全ボス倒した時のボーナス（これはここでは判定しない）

  return rewards;
};
