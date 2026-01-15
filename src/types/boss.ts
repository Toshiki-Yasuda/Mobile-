/**
 * ボスシステム型定義
 * ボス敵、戦闘状態、報酬などの型を定義
 */

/**
 * ボスキャラクター定義
 */
export interface BossCharacter {
  id: string;                        // "boss_chapter1"
  chapterId: number;                 // 1-7
  name: string;                      // "ハンゼ"
  japaneseTitle: string;             // "修行者"
  description: string;               // ボスの説明
  imageUrl: string;                  // "/images/bosses/hanze.png"
  weakPoints: string[];              // 弱点パターン
  dialogueLines: string[];           // 戦闘中のセリフ
}

/**
 * ボス敵の攻撃パターン
 */
export interface AttackPattern {
  name: string;                      // "通常攻撃", "クリティカル"
  timing: number;                    // ms後に発動
  damage: number;                    // ダメージ量
  effect: 'normal' | 'critical' | 'multi';  // エフェクトタイプ
  warning: boolean;                  // 予告表示するか
  warningDuration: number;           // 予告表示時間（ms）
}

/**
 * ボスの難易度設定
 */
export interface BossDifficulty {
  wordDifficultyMultiplier: number;  // 単語難易度の倍率（1.0-2.0）
  timeLimit: number | null;          // 時間制限（秒）、nullで無制限
  maxMisses: number | null;          // 最大ミス数、nullで無制限
  hpMultiplier: number;              // HP倍率
  damageScaling: number;             // プレイヤーが受けるダメージの倍率
  recoveryReduction: number;         // 回復量削減率（0-100%）
  comboThreshold: number[];          // コンボマイルストーン
}

/**
 * ボス戦闘中の状態
 */
export interface BossBattleState {
  currentBoss: BossCharacter;        // 現在のボス敵
  currentPhase: number;              // 現在のフェーズ（1-4）
  bossHP: number;                    // ボスの現在HP
  bossMaxHP: number;                 // ボスの最大HP
  isDefeated: boolean;               // ボスが倒されたか
  playerHP: number;                  // プレイヤーの現在HP
  playerMaxHP: number;               // プレイヤーの最大HP
  elapsed: number;                   // 戦闘経過時間（ms）
  comboCount: number;                // 現在のコンボ数
  correctCount: number;              // 正解数
  missCount: number;                 // ミス数
  specialStates: string[];           // 特殊状態（"stunned", "powered_up"等）
  lastAttackTime: number;            // 最後に敵が攻撃した時刻（ms）
  nextAttackTime: number;            // 次の敵攻撃予定時刻（ms）
}

/**
 * ボス報酬
 */
export interface BossReward {
  type: 'medal' | 'badge' | 'achievement' | 'unlock';  // 報酬タイプ
  id: string;                        // 報酬ID
  name: string;                      // 報酬名
  description: string;               // 報酬説明
  imageUrl?: string;                 // 報酬画像URL
  condition: string;                 // 獲得条件
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';  // レアリティ
}

/**
 * ボスバトルのランク
 */
export type BossRank = 'S+' | 'S' | 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D';

/**
 * ボスバトルの結果
 */
export interface BossBattleResult {
  bossId: string;                    // ボスID
  chapterId: number;                 // チャプター番号
  rank: BossRank;                    // 評価ランク
  isVictory: boolean;                // 勝利したか
  playerFinalHP: number;             // プレイヤー最終HP
  correctCount: number;              // 正解数
  missCount: number;                 // ミス数
  maxCombo: number;                  // 最大コンボ数
  elapsedTime: number;               // 経過時間（秒）
  rewardsEarned: BossReward[];        // 獲得した報酬
  timestamp: number;                 // 戦闘完了時刻（ms）
}

/**
 * ボスの統計情報
 */
export interface BossStatistics {
  bossId: string;                    // ボスID
  chapterId: number;                 // チャプター番号
  totalAttempts: number;             // 挑戦回数
  totalVictories: number;            // 勝利数
  bestRank: BossRank;                // 最高ランク
  bestTime: number;                  // 最速クリア時間（秒）
  maxCombo: number;                  // 最大コンボ
  lastAttemptTime: number;           // 最後の挑戦時刻（ms）
}

/**
 * ボス戦用の特別な設定
 */
export interface BossGameConfig {
  enableBossBattles: boolean;        // ボスバトル機能を有効にするか
  enableMultiPhase: boolean;         // マルチフェーズボスを有効にするか
  enableSpecialEffects: boolean;     // 特殊エフェクトを有効にするか
  difficulty: 'easy' | 'normal' | 'hard';  // ボスバトルの全体難易度
}
