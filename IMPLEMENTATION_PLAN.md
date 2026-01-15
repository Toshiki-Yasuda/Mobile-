# ボスシステム実装計画書

**作成日:** 2026-01-15
**バージョン:** 1.0
**ステータス:** 詳細実装計画

---

## 📋 概要

本ドキュメントは、BOSS_SYSTEM_PLANNING.md で策定されたボスシステムの具体的な実装計画を示す。
フェーズごとの詳細な実装手順、ファイル構成、コード例、テスト計画を含む。

---

## 🗂️ 実装ファイル構成

### 新規作成ファイル（15ファイル）

```
src/
├── types/
│   └── boss.ts                          # ボス関連型定義（150行）
│
├── constants/
│   └── bossConfigs.ts                   # ボス設定・定数（300行）
│
├── data/
│   ├── bosses/
│   │   ├── chapter1Boss.ts              # Chapter 1ボス（80行）
│   │   ├── chapter2Boss.ts              # Chapter 2ボス（80行）
│   │   ├── chapter3Boss.ts              # Chapter 3ボス（100行）
│   │   ├── chapter4Boss.ts              # Chapter 4ボス（80行）
│   │   ├── chapter5Boss.ts              # Chapter 5ボス（120行）
│   │   ├── chapter6Boss.ts              # Chapter 6ボス（150行）
│   │   ├── chapter7Boss.ts              # Chapter 7ボス（100行）
│   │   └── index.ts                     # ボスデータエクスポート（30行）
│   │
│   └── bossRewards.ts                   # 報酬定義（100行）
│
├── stores/
│   └── bossStore.ts                     # ボス状態管理（200行）
│
├── components/
│   ├── boss/
│   │   ├── BossCharacter.tsx            # ボスキャラ表示（120行）
│   │   ├── BossHPBar.tsx                # 敵HP表示（80行）
│   │   ├── BossEffects.tsx              # エフェクト管理（150行）
│   │   ├── BossDialog.tsx               # 敵セリフ表示（80行）
│   │   └── index.ts                     # ボスコンポーネントエクスポート
│   │
│   └── screens/
│       └── BossScreen.tsx               # ボス戦画面（300行）
│
└── utils/
    └── bossCalculations.ts              # ダメージ計算等（200行）
```

**新規作成合計:** 1,920行のコード

### 修正対象ファイル（7ファイル）

```
src/
├── types/
│   └── game.ts                          # StageConfig拡張（+30行）
│
├── stores/
│   ├── gameStore.ts                     # ボス状態追加（+50行）
│   └── progressStore.ts                 # ボス記録追加（+40行）
│
├── components/screens/
│   ├── TypingScreen/index.tsx           # ボス戦判定追加（+100行）
│   └── ResultScreen/index.tsx           # ボス結果表示（+80行）
│
├── constants/
│   └── gameJuice.ts                     # ボス効果配置（+50行）
│
└── data/words/
    └── resultConstants.ts               # ボスランク判定（+60行）
```

**既存ファイル修正合計:** 410行

---

## 🎯 フェーズ別実装計画

### フェーズ1: 基盤構築（3-4日）

#### 1-1: ボス型定義作成

**ファイル:** `src/types/boss.ts`

```typescript
// ボスキャラクター定義
export interface BossCharacter {
  id: string;                        // "boss_chapter1"
  chapterId: number;                 // 1-7
  name: string;                      // "ハンゼ"
  japaneseTitle: string;             // "修行者"
  description: string;
  imageUrl: string;                  // "/images/bosses/hanze.png"
  weakPoints: string[];              // 弱点パターン
  dialogueLines: string[];           // セリフ
}

// ボス機制設定
export interface BossDifficulty {
  wordDifficultyMultiplier: number;  // 1.0-2.0倍
  timeLimit: number | null;          // 秒（nullで無制限）
  maxMisses: number | null;          // nullで無制限
  hpMultiplier: number;              // HP倍率
  damageScaling: number;             // ダメージ倍率
  recoveryReduction: number;         // 回復削減率（0-100）
  comboThreshold: number[];          // コンボマイルストーン
}

// ボス攻撃パターン
export interface AttackPattern {
  name: string;
  timing: number;                    // ms後に発動
  damage: number;
  effect: 'normal' | 'critical' | 'multi';
  warning: boolean;
  warningDuration: number;           // 予告表示時間（ms）
}

// ボス戦闘状態
export interface BossBattleState {
  currentBoss: BossCharacter;
  currentPhase: number;              // 1-4（マルチフェーズボス対応）
  bossHP: number;
  bossMaxHP: number;
  isDefeated: boolean;
  playerHP: number;
  playerMaxHP: number;
  elapsed: number;                   // 戦闘経過時間（ms）
  comboCount: number;
  correctCount: number;
  missCount: number;
  specialStates: string[];           // "stunned", "powered_up"等
}

// ボス報酬
export interface BossReward {
  type: 'medal' | 'badge' | 'achievement' | 'unlock';
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  condition: string;                 // 獲得条件
}

// ボスバトルランク
export type BossRank = 'S+' | 'S' | 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D';

export interface BossBattleResult {
  bossId: string;
  chapterId: number;
  rank: BossRank;
  isVictory: boolean;
  playerFinalHP: number;
  correctCount: number;
  missCount: number;
  maxCombo: number;
  elapsedTime: number;               // 秒
  rewardsEarned: BossReward[];
  timestamp: number;
}
```

**推定行数:** 150行

#### 1-2: ボス設定定数化

**ファイル:** `src/constants/bossConfigs.ts`

```typescript
import type { BossCharacter, BossDifficulty, AttackPattern } from '@/types/boss';

// Chapter 1: ハンゼ設定
export const CHAPTER_1_BOSS: BossCharacter = {
  id: 'boss_chapter1',
  chapterId: 1,
  name: 'ハンゼ',
  japaneseTitle: '修行者',
  description: 'ハンター試験の試験官。試験者の精神を試す。',
  imageUrl: '/images/bosses/hanze.png',
  weakPoints: ['集中力', 'リズム'],
  dialogueLines: [
    'ハンター試験の真の試練はここからだ',
    '集中できていないようだな',
    '見事な集中力だ',
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

// Chapter 2: ヒソカ設定
export const CHAPTER_2_BOSS: BossCharacter = {
  id: 'boss_chapter2',
  chapterId: 2,
  name: 'ヒソカ',
  japaneseTitle: 'トランプマジシャン',
  description: 'エキセントリックな念能力者。遊び相手を探している。',
  imageUrl: '/images/bosses/hisoka.png',
  weakPoints: ['予測', 'リズム感'],
  dialogueLines: [
    'いい緊張感だ',
    'もっと遊びたいんだが',
    '退屈させるな',
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

// ... (他のボス5つも同様)

// 全ボスの難易度配列
export const ALL_BOSS_DIFFICULTIES: Record<number, BossDifficulty> = {
  1: CHAPTER_1_DIFFICULTY,
  2: CHAPTER_2_DIFFICULTY,
  3: CHAPTER_3_DIFFICULTY,
  4: CHAPTER_4_DIFFICULTY,
  5: CHAPTER_5_DIFFICULTY,
  6: CHAPTER_6_DIFFICULTY,
  7: CHAPTER_7_DIFFICULTY,
};

// ボスHP計算関数
export const calculateBossHP = (chapterId: number): number => {
  const baseHP = 150;
  const multiplier = ALL_BOSS_DIFFICULTIES[chapterId].hpMultiplier;
  return Math.round(baseHP * chapterId * multiplier);
};

// ダメージ計算関数
export const calculateDamageToPlayer = (
  baseDamage: number,
  chapterId: number,
  criticalHit: boolean = false
): number => {
  const scaling = ALL_BOSS_DIFFICULTIES[chapterId].damageScaling;
  let damage = Math.round(baseDamage * scaling);
  if (criticalHit) damage = Math.round(damage * 1.5);
  return damage;
};

// ダメージ計算関数（ボスへ）
export const calculateDamageToBoss = (
  baseCorrect: number,
  wordDifficulty: number,
  comboCount: number,
  chapterId: number
): number => {
  const difficultyBonus = wordDifficulty * 5;
  const comboBonus = Math.floor(comboCount / 5) * 3;
  return baseCorrect + difficultyBonus + comboBonus;
};
```

**推定行数:** 300行

**タスク:**
- [ ] 7つのボス設定をすべて作成
- [ ] ボスHP計算アルゴリズム確認
- [ ] ダメージ計算ロジック確認
- [ ] 定数値のバランステスト

---

#### 1-3: ボス状態管理（Zustand Store）

**ファイル:** `src/stores/bossStore.ts`

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { BossBattleState, BossBattleResult, BossReward } from '@/types/boss';

interface BossStoreState {
  // 現在のボス戦闘状態
  currentBattle: BossBattleState | null;

  // 戦闘記録
  battleHistory: BossBattleResult[];
  defeatedBosses: Set<string>;

  // メソッド
  initiateBossBattle: (chapterId: number) => void;
  updateBattleState: (updates: Partial<BossBattleState>) => void;
  dealDamageToBoss: (damage: number) => void;
  dealDamageToPlayer: (damage: number) => void;
  incrementCombo: () => void;
  resetCombo: () => void;
  endBossBattle: (result: BossBattleResult) => void;
  getBattleHistory: (chapterId: number) => BossBattleResult[];
  isBossDefeated: (chapterId: number) => boolean;
}

export const useBossStore = create<BossStoreState>()(
  persist(
    (set, get) => ({
      currentBattle: null,
      battleHistory: [],
      defeatedBosses: new Set(),

      initiateBossBattle: (chapterId: number) => {
        // ボス戦闘状態を初期化
        set((state) => ({
          currentBattle: {
            // ...初期化処理
          },
        }));
      },

      updateBattleState: (updates: Partial<BossBattleState>) => {
        set((state) => ({
          currentBattle: state.currentBattle
            ? { ...state.currentBattle, ...updates }
            : null,
        }));
      },

      dealDamageToBoss: (damage: number) => {
        set((state) => {
          if (!state.currentBattle) return {};
          const newHP = Math.max(0, state.currentBattle.bossHP - damage);
          return {
            currentBattle: {
              ...state.currentBattle,
              bossHP: newHP,
              isDefeated: newHP === 0,
            },
          };
        });
      },

      dealDamageToPlayer: (damage: number) => {
        set((state) => {
          if (!state.currentBattle) return {};
          return {
            currentBattle: {
              ...state.currentBattle,
              playerHP: Math.max(0, state.currentBattle.playerHP - damage),
            },
          };
        });
      },

      incrementCombo: () => {
        set((state) => {
          if (!state.currentBattle) return {};
          return {
            currentBattle: {
              ...state.currentBattle,
              comboCount: state.currentBattle.comboCount + 1,
              correctCount: state.currentBattle.correctCount + 1,
            },
          };
        });
      },

      resetCombo: () => {
        set((state) => {
          if (!state.currentBattle) return {};
          return {
            currentBattle: {
              ...state.currentBattle,
              comboCount: 0,
              missCount: state.currentBattle.missCount + 1,
            },
          };
        });
      },

      endBossBattle: (result: BossBattleResult) => {
        set((state) => ({
          battleHistory: [...state.battleHistory, result],
          defeatedBosses: result.isVictory
            ? new Set([...state.defeatedBosses, result.bossId])
            : state.defeatedBosses,
          currentBattle: null,
        }));
      },

      getBattleHistory: (chapterId: number) => {
        const state = get();
        return state.battleHistory.filter((b) => b.chapterId === chapterId);
      },

      isBossDefeated: (chapterId: number) => {
        const state = get();
        return state.defeatedBosses.has(`boss_chapter${chapterId}`);
      },
    }),
    {
      name: 'boss-store',
    }
  )
);
```

**推定行数:** 200行

**タスク:**
- [ ] Zustandストア実装
- [ ] localStorage永続化確認
- [ ] 状態更新ロジック検証
- [ ] ユニットテスト作成

---

#### 1-4: ダメージ計算ユーティリティ

**ファイル:** `src/utils/bossCalculations.ts`

```typescript
import type { BossCharacter, BossDifficulty } from '@/types/boss';
import { ALL_BOSS_DIFFICULTIES } from '@/constants/bossConfigs';

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
  let damage = Math.round(baseDamage * difficulty.damageScaling);
  if (isCritical) {
    damage = Math.round(damage * 1.5);
  }
  return damage;
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
): 'S+' | 'S' | 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D' => {
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
 * ボスが攻撃するタイミングを計算
 * @param turnCount ターン数
 * @param pattern 攻撃パターン（'normal' | 'timed' | 'random'）
 * @returns 攻撃すべきか
 */
export const shouldBossAttack = (
  turnCount: number,
  pattern: 'normal' | 'timed' | 'random'
): boolean => {
  switch (pattern) {
    case 'normal':
      return turnCount % 10 === 0 && turnCount > 0;
    case 'timed':
      return turnCount % 30 === 0 && turnCount > 0;
    case 'random':
      return Math.random() < 0.05;
    default:
      return false;
  }
};
```

**推定行数:** 200行

**タスク:**
- [ ] すべての計算関数実装
- [ ] 計算式のテスト
- [ ] エッジケース対応

---

**フェーズ1チェックリスト:**
- [ ] `src/types/boss.ts` 作成完了
- [ ] `src/constants/bossConfigs.ts` 作成完了
- [ ] `src/stores/bossStore.ts` 作成完了
- [ ] `src/utils/bossCalculations.ts` 作成完了
- [ ] ユニットテスト作成（各ファイル）
- [ ] 型定義検証
- [ ] ビルド成功確認

**見積時間:** 3-4日

---

### フェーズ2: UI実装（3-4日）

#### 2-1: ボスキャラクター表示

**ファイル:** `src/components/boss/BossCharacter.tsx`

```typescript
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import type { BossCharacter } from '@/types/boss';

interface BossCharacterProps {
  boss: BossCharacter;
  isAttacking: boolean;
  phase?: number;
  scale?: number;
}

export const BossCharacter: React.FC<BossCharacterProps> = ({
  boss,
  isAttacking,
  phase = 1,
  scale = 1,
}) => {
  const attackVariants = useMemo(
    () => ({
      idle: { x: 0, y: 0 },
      attacking: {
        x: [0, -20, 0],
        y: [0, -10, 0],
        transition: { duration: 0.5 },
      },
      damaged: {
        x: [-15, 15, -15, 15, 0],
        transition: { duration: 0.4 },
      },
    }),
    []
  );

  return (
    <motion.div
      className="relative w-64 h-80"
      variants={attackVariants}
      animate={isAttacking ? 'attacking' : 'idle'}
      style={{ scale }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        {/* ボスキャラクター画像 */}
        <motion.img
          src={boss.imageUrl}
          alt={boss.name}
          className="w-full h-full object-cover rounded-lg"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        />

        {/* フェーズ表示（マルチフェーズボス） */}
        {phase > 1 && (
          <div className="absolute top-4 right-4 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
            Phase {phase}
          </div>
        )}
      </div>
    </motion.div>
  );
};
```

**推定行数:** 120行

#### 2-2: 敵HP表示

**ファイル:** `src/components/boss/BossHPBar.tsx`

```typescript
import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

interface BossHPBarProps {
  currentHP: number;
  maxHP: number;
  bossName: string;
  isAttacking: boolean;
  specialStates?: string[];
}

export const BossHPBar: React.FC<BossHPBarProps> = ({
  currentHP,
  maxHP,
  bossName,
  isAttacking,
  specialStates = [],
}) => {
  const hpPercentage = useMemo(() => (currentHP / maxHP) * 100, [currentHP, maxHP]);
  const isLowHP = hpPercentage < 20;

  const getHPColor = () => {
    if (hpPercentage > 50) return 'from-red-600 to-red-500';
    if (hpPercentage > 25) return 'from-orange-600 to-orange-500';
    return 'from-red-700 to-red-600';
  };

  return (
    <div className="space-y-2">
      {/* ボス名 */}
      <div className="flex items-center justify-between">
        <h2 className="font-title text-2xl text-white">{bossName}</h2>
        <div className="text-sm text-red-400">{currentHP.toFixed(0)} / {maxHP.toFixed(0)}</div>
      </div>

      {/* HPバー */}
      <div className="w-full bg-gray-800 rounded-full h-8 overflow-hidden border-2 border-red-600">
        <motion.div
          className={`bg-gradient-to-r ${getHPColor()} h-full flex items-center justify-center`}
          animate={{ width: `${hpPercentage}%` }}
          transition={{ duration: 0.5 }}
        >
          {hpPercentage > 10 && (
            <span className="text-white text-xs font-bold">{hpPercentage.toFixed(0)}%</span>
          )}
        </motion.div>
      </div>

      {/* 特殊状態表示 */}
      {specialStates.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {specialStates.map((state) => (
            <motion.span
              key={state}
              className="text-xs px-2 py-1 bg-yellow-600 text-white rounded"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              {state}
            </motion.span>
          ))}
        </div>
      )}

      {/* 低HP警告 */}
      {isLowHP && (
        <motion.div
          className="text-center text-red-500 font-bold text-sm"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          ⚠️ ボスが危険な状態!
        </motion.div>
      )}
    </div>
  );
};
```

**推定行数:** 80行

#### 2-3: エフェクト管理

**ファイル:** `src/components/boss/BossEffects.tsx`

```typescript
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface BossEffectsProps {
  damageAmount?: number;
  showDamage: boolean;
  effectType: 'damage' | 'heal' | 'critical' | 'attack' | 'none';
  onEffectComplete?: () => void;
}

export const BossEffects: React.FC<BossEffectsProps> = ({
  damageAmount,
  showDamage,
  effectType,
  onEffectComplete,
}) => {
  const [shouldRender, setShouldRender] = useState(showDamage);

  useEffect(() => {
    if (showDamage) {
      setShouldRender(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        onEffectComplete?.();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [showDamage, onEffectComplete]);

  if (!shouldRender) return null;

  // ダメージ表示
  if (effectType === 'damage' && damageAmount) {
    return (
      <motion.div
        className="fixed top-1/2 left-1/2 text-3xl font-bold text-red-500 pointer-events-none"
        initial={{ opacity: 1, y: 0, x: '-50%' }}
        animate={{ opacity: 0, y: -100 }}
        transition={{ duration: 1.5 }}
      >
        -{damageAmount}
      </motion.div>
    );
  }

  // クリティカル表示
  if (effectType === 'critical') {
    return (
      <motion.div
        className="fixed inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 1 }}
      >
        <div className="w-full h-full bg-gradient-to-b from-yellow-400 via-orange-400 to-red-400 opacity-30" />
      </motion.div>
    );
  }

  // 敵攻撃エフェクト
  if (effectType === 'attack') {
    return (
      <motion.div
        className="fixed inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.8, 0] }}
        transition={{ duration: 0.6 }}
      >
        <div className="w-full h-full bg-red-500" />
      </motion.div>
    );
  }

  return null;
};
```

**推定行数:** 150行

#### 2-4: 敵セリフ表示

**ファイル:** `src/components/boss/BossDialog.tsx`

```typescript
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BossDialogProps {
  message: string | null;
  duration?: number;
}

export const BossDialog: React.FC<BossDialogProps> = ({ message, duration = 3000 }) => {
  const [isVisible, setIsVisible] = useState(!!message);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      const timer = setTimeout(() => setIsVisible(false), duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration]);

  return (
    <AnimatePresence>
      {isVisible && message && (
        <motion.div
          className="fixed bottom-20 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <div className="bg-black/80 text-white px-6 py-3 rounded-lg border-2 border-gold-500 max-w-md">
            <p className="text-center text-sm">{message}</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
```

**推定行数:** 80行

**フェーズ2チェックリスト:**
- [ ] BossCharacter.tsx 実装完了
- [ ] BossHPBar.tsx 実装完了
- [ ] BossEffects.tsx 実装完了
- [ ] BossDialog.tsx 実装完了
- [ ] ビジュアルテスト
- [ ] アニメーション調整
- [ ] ビルド成功確認

**見積時間:** 3-4日

---

### フェーズ3: ゲームロジック（4-5日）

#### 3-1: ボス戦画面

**ファイル:** `src/components/screens/BossScreen.tsx`

- ボス戦全体のレイアウト
- ゲームロジックの統合
- ユーザーインタラクション処理
- リザルト画面への遷移

**推定行数:** 300行

#### 3-2: 敵攻撃システム

**ファイル:** `src/utils/bossCalculations.ts` 拡張

- 敵の攻撃スケジュール管理
- 敵の特殊機制実装
- ダメージ計算の詳細化

**推定行数:** 150行追加

#### 3-3: 勝敗判定ロジック

**ファイル:** `src/stores/bossStore.ts` 拡張

- 勝利条件の判定
- 敗北条件の判定
- ボスとプレイヤーのHP管理

**推定行数:** 100行追加

**フェーズ3チェックリスト:**
- [ ] BossScreen.tsx 実装完了
- [ ] 敵攻撃システム実装完了
- [ ] 勝敗判定ロジック実装完了
- [ ] ゲームロジックテスト実施
- [ ] バランス調整
- [ ] ビルド成功確認

**見積時間:** 4-5日

---

### フェーズ4: テスト・ポーランド（3-4日）

#### 4-1: ユニットテスト

```typescript
// bossCalculations.test.ts
describe('Boss Calculations', () => {
  test('calculateBossDamage returns correct value', () => {
    const damage = calculateBossDamage(2, 10, 1);
    expect(damage).toBeGreaterThan(0);
  });

  test('calculateBossRank returns S+ for perfect clear', () => {
    const rank = calculateBossRank(100, 100, 60, 120, 0);
    expect(rank).toBe('S+');
  });
  // ... 20+ テストケース
});
```

**推定行数:** 200行（テストコード）

#### 4-2: 統合テスト

- 全ボスの動作確認
- 異なる難易度での検証
- プレイヤーの予期しないインタラクション
- エッジケースの確認

#### 4-3: パフォーマンステスト

- フレームレート安定性（60 FPS維持）
- メモリ使用量（+5-10 MB以内）
- ロード時間（< 500ms）

#### 4-4: ビジュアル・UXテスト

- UI/UXの確認
- アニメーションの滑らかさ
- ユーザビリティ検証

**フェーズ4チェックリスト:**
- [ ] ユニットテスト作成・実行
- [ ] 統合テスト実施
- [ ] パフォーマンステスト合格
- [ ] ビジュアルテスト完了
- [ ] バグ修正完了
- [ ] ドキュメント完成
- [ ] 本番準備完了

**見積時間:** 3-4日

---

## 📊 実装タイムライン

```
Week 1: フェーズ1 基盤構築
├─ Day 1-2: 型定義・定数化
├─ Day 2-3: ストア実装
└─ Day 3-4: ユーティリティ実装

Week 2: フェーズ2 UI実装
├─ Day 1-2: ボスキャラクター・HP表示
├─ Day 2-3: エフェクト・セリフシステム
└─ Day 3-4: Storybook確認・調整

Week 3: フェーズ3 ゲームロジック
├─ Day 1-2: ボス戦画面実装
├─ Day 2-3: 敵攻撃システム
├─ Day 3-4: 勝敗判定ロジック
└─ Day 4-5: バランス調整

Week 4: フェーズ4 テスト・ポーランド
├─ Day 1-2: ユニット・統合テスト
├─ Day 2-3: パフォーマンステスト
├─ Day 3-4: ビジュアルテスト
└─ Day 4: ドキュメント・本番準備
```

**総開発期間:** 4週間（16-18営業日）

---

## 🧪 テスト計画

### ユニットテスト（各モジュール）

```
boss.ts:
  - 型定義の正確性

bossConfigs.ts:
  - HP計算式の正確性 ✓
  - ダメージ計算式の正確性 ✓
  - 定数値の妥当性 ✓

bossStore.ts:
  - 状態更新の正確性 ✓
  - localStorage永続化 ✓
  - ゲットメソッド検証 ✓

bossCalculations.ts:
  - ダメージ計算 ✓
  - ランク判定 ✓
  - 攻撃タイミング判定 ✓
```

### 統合テスト（各ボス）

```
Chapter 1: ハンゼ
  - 基本的な戦闘フロー ✓
  - 5連続正解ボーナス ✓
  - クリア・敗北分岐 ✓

Chapter 2: ヒソカ
  - 時間制限の動作 ✓
  - 敵の段階的な強化 ✓
  - リザルト表示 ✓

... (他のボス5つ)
```

### パフォーマンステスト

```
- フレームレート: 60 FPS以上を90%の時間維持
- メモリ: 初期値から+8 MB以内
- CPU: 50%以下を目標
- ロード時間: < 500ms
```

---

## 🔍 品質チェックリスト

- [ ] すべてのタイプ定義が正確
- [ ] すべてのボスが実装済み
- [ ] すべてのエフェクトが実装済み
- [ ] ユニットテスト合格率 > 95%
- [ ] 統合テスト合格率 100%
- [ ] パフォーマンスメトリクス達成
- [ ] ビルドエラー 0件
- [ ] コンソール警告 0件
- [ ] アクセシビリティ準拠

---

## 📝 修正対象ファイルの詳細

### src/types/game.ts

```typescript
// StageConfigに追加
export interface StageConfig {
  // ... 既存フィールド
  isBoss: boolean;                      // ボスステージフラグ
  bossChapterId?: number;               // ボスのチャプターID
}
```

### src/stores/gameStore.ts

```typescript
// ボス戦闘状態の追加
interface GameStoreState {
  // ... 既存フィールド
  isBossBattle: boolean;
  currentBossChapter: number | null;
}
```

### src/components/screens/TypingScreen/index.tsx

```typescript
// ボス戦判定の追加
if (isBossStage) {
  return <BossScreen stageId={stageId} />;
}
```

### src/components/screens/ResultScreen/index.tsx

```typescript
// ボス結果表示の追加
if (wasBossBattle) {
  return <BossResultScreen result={bossResult} />;
}
```

---

## 🎯 マイルストーン

| マイルストーン | 日程 | 成果物 |
|---------------|------|--------|
| **フェーズ1完了** | Week 1終了 | 型定義・定数・ストア・ユーティリティ |
| **フェーズ2完了** | Week 2終了 | UI コンポーネント群 |
| **フェーズ3完了** | Week 3終了 | ゲームロジック・敵AI |
| **フェーズ4完了** | Week 4終了 | テスト・ドキュメント・本番準備 |
| **ベータテスト開始** | Week 4+1 | 内部テストプレイ |
| **本番リリース** | 調整後 | プロダクション環境 |

---

## 📚 参考資料

- `BOSS_SYSTEM_PLANNING.md` - ボスシステム全体設計
- `src/types/game.ts` - 既存型定義
- `src/constants/gameJuice.ts` - 既存ゲーム効果設定
- `src/stores/` - 既存Zustandストア実装パターン

---

## ✅ 実装開始チェックリスト

- [ ] このドキュメントをレビュー・承認
- [ ] リソース（開発者）の確保
- [ ] 環境セットアップ（Node.js、npm、TypeScript）
- [ ] ブランチ作成（`feature/boss-system`）
- [ ] フェーズ1の詳細設計確認
- [ ] チーム内でのキックオフミーティング

---

**本ドキュメントは詳細な実装計画です。**
**実装開始前に全項目の確認を推奨します。**

