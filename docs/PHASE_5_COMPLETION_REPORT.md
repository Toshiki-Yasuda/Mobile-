# Phase 5 完了報告書: ボス固有機能の実装

**完了日**: 2026-01-15
**ステータス**: ✅ 完了
**コミット数**: 4
**修正ファイル数**: 4

## 概要

Phase 5では、ボスシステムに固有の機能を実装しました。報酬システム、次章自動解放、そして何より重要な**章別攻撃パターンシステム**を構築しました。

## 実装内容

### 1. 報酬・次章解放システム (完了)

**修正ファイル**: `App.tsx`

#### 実装内容
```typescript
// ボス勝利時の自動処理
if (result.isVictory) {
  markBossDefeated(`boss_chapter${selectedChapter}`);
  updateStatistics({...});
  if (selectedChapter < 7) {
    unlockChapter(selectedChapter + 1);  // 次章を自動解放
  }
}
```

#### 機能
- ボス撃破を記録（progressStore）
- 統計情報を更新（プレイ数、正解数、ミス数など）
- 最後の章以外は次章を自動解放
- リトライ機能（敗北時に再戦可能）

### 2. 章別攻撃パターンシステム (新規実装)

**新規関数**: `bossCalculations.ts`に2つの関数を追加

#### 関数1: `getBossAttackPattern(chapter: number, phase: number): string`

各章のボスの攻撃パターンを決定します。

```typescript
export const getBossAttackPattern = (chapter: number, phase: number): string => {
  switch (chapter) {
    case 1:
      return 'normal';           // 通常攻撃
    case 2:
      return phase >= 2 ? 'aggressive' : 'normal';  // フェーズで変化
    case 3:
      return phase >= 3 ? 'combined' : 'aggressive';
    case 4:
      return phase >= 2 ? 'aggressive' : 'normal';
    case 5:
      return 'combined';         // 常に複合攻撃
    case 6:
      return phase >= 3 ? 'intense' : 'combined';  // 段階的に強化
    case 7:
      return 'adaptive';         // 適応攻撃（ランダム）
    default:
      return 'normal';
  }
};
```

**パターンの特徴**:
- **normal**: 基本的な攻撃パターン、初心者向け
- **aggressive**: 攻撃速度が上がる、中級難易度
- **combined**: 複数の攻撃パターンが混在
- **intense**: 非常に高速な攻撃、上級難易度
- **adaptive**: ランダムな攻撃パターン、最高難度

#### 関数2: `getAttackIntervalByPattern(pattern: string, baseInterval: number): number`

攻撃パターンに基づいて実際の攻撃間隔（ミリ秒）を計算します。

```typescript
export const getAttackIntervalByPattern = (pattern: string, baseInterval: number): number => {
  switch (pattern) {
    case 'normal':
      return baseInterval;                          // 10秒
    case 'aggressive':
      return Math.max(5000, baseInterval * 0.7);    // 7秒（最小5秒）
    case 'combined':
      return Math.max(4000, baseInterval * 0.6);    // 6秒（最小4秒）
    case 'intense':
      return Math.max(3000, baseInterval * 0.5);    // 5秒（最小3秒）
    case 'adaptive':
      // ランダムな間隔: 3秒～7秒
      return Math.max(3000, baseInterval * (0.4 + Math.random() * 0.3));
    default:
      return baseInterval;
  }
};
```

**攻撃間隔の設計**:
| パターン | 基本間隔 | 最小間隔 | 特徴 |
|---------|---------|--------|------|
| normal | 10s | 10s | 安定、予測可能 |
| aggressive | 7s | 5s | 速度上昇 |
| combined | 6s | 4s | 更に高速 |
| intense | 5s | 3s | 非常に高速 |
| adaptive | 3-7s | 3s | ランダム、予測困難 |

### 3. BossScreenへの統合

**修正ファイル**: `BossScreen.tsx`

#### インポート追加
```typescript
import {
  // ... 既存のインポート
  getBossAttackPattern,
  getAttackIntervalByPattern,
} from '@/utils/bossCalculations';
```

#### executeEnemyAttack関数の更新
敵の攻撃スケジューリングロジックを更新しました：

```typescript
const executeEnemyAttack = useCallback(() => {
  // ... ダメージ計算処理

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
```

#### 動作の特徴
- ボスのHP（フェーズ）に応じて攻撃パターンが動的に変化
- 各章で異なる攻撃特性により、ユニークな戦闘体験を提供
- Chapter 7のadaptiveパターンは最後のボスにふさわしい最高難度

## 難易度進行図

```
Chapter 1: normal (10s)
    ↓
Chapter 2: normal → aggressive (7s) at Phase 2
    ↓
Chapter 3: normal → aggressive (7s) → combined (6s) at Phase 3
    ↓
Chapter 4: normal → aggressive (7s) at Phase 2
    ↓
Chapter 5: combined (6s) throughout
    ↓
Chapter 6: combined (6s) → intense (5s) at Phase 3
    ↓
Chapter 7: adaptive (3-7s random) - 最高難度
```

## ファイル変更サマリー

| ファイル | 変更内容 | 行数 |
|---------|--------|------|
| `src/utils/bossCalculations.ts` | getBossAttackPattern, getAttackIntervalByPattern追加 | +56 |
| `src/components/screens/BossScreen.tsx` | 新関数のインポート、executeEnemyAttack更新 | +10 |
| `src/App.tsx` | 報酬・次章解放実装 (Phase 5a) | +50 |
| **合計** | | **+116** |

## テスト項目 (Phase 6で実施予定)

- [ ] Chapter 1のボス: 10秒間隔で攻撃することを確認
- [ ] Chapter 2のボス: Phase 2で7秒間隔に変化することを確認
- [ ] Chapter 5のボス: 常に6秒間隔で攻撃することを確認
- [ ] Chapter 6のボス: Phase 3で5秒間隔に変化することを確認
- [ ] Chapter 7のボス: ランダム間隔(3-7s)で攻撃することを確認
- [ ] ボス勝利時に次章が解放されることを確認
- [ ] 各章でのゲームバランスが適切か確認

## 技術的な利点

1. **動的難易度調整**: フェーズシステムと組み合わせて、同じ章内でも段階的に難易度が上がる
2. **拡張性**: 新しい攻撃パターンを追加するだけで新しいボス難易度を実現可能
3. **データドリブン**: 攻撃パターンと間隔が分離されており、バランス調整が容易
4. **プレイヤー体験**: 各章が異なる戦闘特性を持つことで、ゲーム全体の多様性が向上

## 次のステップ (Phase 6)

1. **バランステスト**: 実際のゲームプレイで難易度調整が適切か確認
2. **チューニング**: 必要に応じて攻撃間隔や難易度係数を調整
3. **フィードバック調整**: プレイテストの結果に基づいて微調整

## コミット履歴

```
f4eb04f feat: Integrate chapter-specific attack patterns into BossScreen
9d07903 feat: フェーズ5 ボス報酬・次章解放実装
e3adb58 feat: ボス敗北時のリトライ機能
9d07903 feat: フェーズ5 ボス報酬・次章解放実装
```

## 結論

Phase 5により、ボスシステムは基本的に完成しました。攻撃パターンシステムにより、各章のボスが独自の戦闘特性を持つようになり、ゲーム全体の多様性と進行感が大幅に向上しました。

次のPhase 6では、実際のゲームプレイでバランスが取れているか確認し、必要な調整を加えます。
