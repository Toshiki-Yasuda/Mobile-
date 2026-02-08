# Phase 6 テスト・バランス調整計画

**開始日**: 2026-01-15
**ステータス**: 🔄 進行中
**目的**: ボスシステムの全体的な動作確認とゲームバランスの検証

## テスト戦略

### レベル1: ユニットテスト (コード検証)

#### 1.1 攻撃パターン関数のテスト

**テスト対象**: `bossCalculations.ts`の新規関数

```typescript
// テストケース1: getBossAttackPattern の正確性
describe('getBossAttackPattern', () => {
  test('Chapter 1は常にnormalパターン', () => {
    expect(getBossAttackPattern(1, 1)).toBe('normal');
    expect(getBossAttackPattern(1, 4)).toBe('normal');
  });

  test('Chapter 2はPhase 2でaggressiveに変化', () => {
    expect(getBossAttackPattern(2, 1)).toBe('normal');
    expect(getBossAttackPattern(2, 2)).toBe('aggressive');
    expect(getBossAttackPattern(2, 3)).toBe('aggressive');
    expect(getBossAttackPattern(2, 4)).toBe('aggressive');
  });

  test('Chapter 7は常にadaptive', () => {
    expect(getBossAttackPattern(7, 1)).toBe('adaptive');
    expect(getBossAttackPattern(7, 2)).toBe('adaptive');
    expect(getBossAttackPattern(7, 3)).toBe('adaptive');
    expect(getBossAttackPattern(7, 4)).toBe('adaptive');
  });
});

// テストケース2: getAttackIntervalByPattern の正確性
describe('getAttackIntervalByPattern', () => {
  const baseInterval = 10000;

  test('normalパターンは基本間隔を返す', () => {
    const interval = getAttackIntervalByPattern('normal', baseInterval);
    expect(interval).toBe(10000);
  });

  test('aggressiveパターンは70%に制限', () => {
    const interval = getAttackIntervalByPattern('aggressive', baseInterval);
    expect(interval).toBeGreaterThanOrEqual(5000);
    expect(interval).toBeLessThanOrEqual(7000);
  });

  test('adaptiveパターンはランダムだが範囲内', () => {
    const intervals = Array.from({ length: 10 }, () =>
      getAttackIntervalByPattern('adaptive', baseInterval)
    );
    intervals.forEach(interval => {
      expect(interval).toBeGreaterThanOrEqual(3000);
      expect(interval).toBeLessThanOrEqual(7000);
    });
  });

  test('intenseパターンは最小3秒', () => {
    const interval = getAttackIntervalByPattern('intense', baseInterval);
    expect(interval).toBeGreaterThanOrEqual(3000);
    expect(interval).toBeLessThanOrEqual(5000);
  });
});
```

**実行方法**:
```bash
npm run test -- bossCalculations.test.ts
```

### レベル2: 統合テスト (ゲーム内動作確認)

#### 2.1 Chapter別攻撃パターンの確認

| Chapter | 想定パターン | 初期間隔 | 最高難易度 | テスト項目 |
|---------|-----------|--------|--------|---------|
| 1 | normal常時 | 10s | 10s | 終始10秒間隔で攻撃 |
| 2 | normal→aggressive | 10s→7s | 7s | Phase 2で速度UP |
| 3 | normal→aggressive→combined | 10s→7s→6s | 6s | Phase 3で最高速 |
| 4 | normal→aggressive | 10s→7s | 7s | Phase 2で速度UP |
| 5 | combined常時 | 6s | 6s | 終始6秒間隔で攻撃 |
| 6 | combined→intense | 6s→5s | 3s | Phase 3で最高速 |
| 7 | adaptive | 3-7s | 3-7s | ランダム間隔で攻撃 |

**テスト手順**:
1. 各章のボスステージに進入
2. デバッグコンソールで攻撃間隔をログ出力
3. 想定間隔と実際の間隔を比較
4. Phase変化時の動作を確認

**期待結果**:
- ✅ 各章で想定パターンの攻撃が行われる
- ✅ フェーズ移行時に攻撃間隔が変化
- ✅ Chapter 7は予測不可能なランダム間隔

#### 2.2 ゲーム進行フローの確認

**テスト対象**: ボス勝利時の章解放、ボス敗北時のリトライ

```typescript
describe('Boss Game Flow', () => {
  test('Chapter 1ボス勝利 → Chapter 2解放', () => {
    // 1. Chapter 1ボスを倒す
    // 2. 結果画面でisVictory=trueを確認
    // 3. progressStoreで'boss_chapter1'が記録されたか確認
    // 4. Chapter 2がアンロックされたか確認（LevelSelectで確認可能）
  });

  test('Chapter 6ボス敗北 → リトライ可能', () => {
    // 1. Chapter 6ボスに敗北する
    // 2. 結果画面でisVictory=falseを確認
    // 3. "リトライ"ボタンが表示されたか確認
    // 4. リトライボタンをクリック → 再戦開始
  });

  test('Chapter 7ボス勝利 → 新規コンテンツへ', () => {
    // 1. Chapter 7ボスを倒す
    // 2. 結果画面に特別なメッセージが表示されるか確認
    // 3. selectedChapter < 7条件により、次章解放がスキップされたか確認
  });
});
```

#### 2.3 バランス検証テスト

**難易度スケーリング確認**:

```
Player Stats:
- 初期HP: 100
- 各章での推定平均ダメージ/攻撃:
  * Chapter 1: 10 (easy, 10秒で1攻撃)
  * Chapter 2 Phase 1: 10 (easy, 10秒で1攻撃)
  * Chapter 2 Phase 2: ~14.3 (medium, 7秒で1攻撃 = 14.3/秒)
  * Chapter 6 Phase 3: ~33.3 (hard, 3秒で1攻撃 = 33.3/秒)
  * Chapter 7: ~26.7 avg (very hard, random 3-7秒)

推定クリア時間:
- Chapter 1ボスHP 50: ~50秒以上（easy）
- Chapter 6ボスHP 100: ~20秒以上（hard）
- Chapter 7ボスHP 150: ~30秒以上（very hard）
```

### レベル3: プレイテスト (実ユーザー体験確認)

#### 3.1 難易度進行の確認

**プレイテスト手順**:
1. Chapter 1から順番にクリア
2. 各章でのクリア難易度を記録
3. 段階的な難易度上昇を確認

**期待される進行感**:
```
Chapter 1-2: 「簡単、快適」
Chapter 3-4: 「ちょうど良い難易度」
Chapter 5-6: 「難しい、集中が必要」
Chapter 7: 「非常に難しい、ランダム性で緊張感MAX」
```

#### 3.2 ゲーム楽しさの確認

- [ ] 各章でユニークな戦闘体験を感じるか
- [ ] ボスの攻撃が予測可能だが挑戦的か（Chapter 1-6）
- [ ] Chapter 7のランダム性が面白いか（あるいは不快か）
- [ ] ボス勝利時の達成感があるか
- [ ] 章の進行に喜びを感じるか

### レベル4: パフォーマンステスト

#### 4.1 フレームレート確認

**テスト項目**:
- [ ] 攻撃エフェクト表示時のFPS（目標: 60fps）
- [ ] 複数エフェクト表示時のFPS
- [ ] 長時間プレイ時のメモリ使用量

#### 4.2 タイマー精度確認

**テスト項目**:
- [ ] 攻撃スケジュール精度（±100ms以内）
- [ ] setTimeout連鎖の精度
- [ ] 長時間プレイでのタイマードリフト検出

## バランス調整ガイドライン

### 攻撃間隔の調整

**現在の設定** (baseInterval = 10000ms):
- normal: 10000ms
- aggressive: 7000ms
- combined: 6000ms
- intense: 3000-5000ms (avg 4000ms)
- adaptive: 3000-7000ms (avg 5000ms)

**調整が必要な場合**:

1. **「簡単すぎる」場合**:
   ```typescript
   // 選択肢A: 間隔を短縮
   case 'normal': return Math.max(8000, baseInterval * 0.8);

   // 選択肢B: 基本ダメージを増加
   const baseDamage = 12; // 10から12へ
   ```

2. **「難しすぎる」場合**:
   ```typescript
   // 選択肢A: 間隔を延長
   case 'intense': return Math.max(4000, baseInterval * 0.4);

   // 選択肢B: プレイヤーHP回復量を増加
   const recoveryAmount = 20; // 15から20へ
   ```

3. **「ランダムすぎて不快」の場合（Chapter 7）**:
   ```typescript
   // adaptive パターンを調整
   case 'adaptive':
     // より予測可能に
     return Math.max(4000, baseInterval * (0.5 + Math.random() * 0.2));
     // または
     // より予測不可能に
     return Math.max(2000, baseInterval * (0.3 + Math.random() * 0.4));
   ```

### 難易度係数の調整

**ファイル**: `bossConfigs.ts`の`ALL_BOSS_DIFFICULTIES`

```typescript
// 例: Chapter 6の難易度を上げたい場合
[6]: {
  // ... 他の設定
  damageScaling: 1.5,  // 1.4から1.5へ（ダメージ15%UP）
  recoveryReduction: 40, // 30から40へ（回復15%DOWN）
}
```

## テスト結果報告フォーマット

### 各章のテスト結果テンプレート

```markdown
## Chapter [N] テスト結果

### 基本情報
- ボス名: [名前]
- 攻撃パターン: [pattern]
- 想定難易度: [easy/medium/hard/very hard]
- テスト日時: [日時]

### 攻撃パターンテスト
- [ ] 初期攻撃間隔が正確か
- [ ] フェーズ変化時に間隔が変わるか
- [ ] 最終フェーズでの難易度は適切か

### ゲームバランステスト
- クリア時間: [秒数]
- 最終スコア: [スコア]
- 難易度評価: [評価]
- 改善提案: [提案内容]

### プレイ感
- 🟢 楽しかった / 🟡 普通 / 🔴 つまらなかった
- 最も良かった点: [点]
- 改善が必要な点: [点]
```

## 予定スケジュール

1. **ユニットテスト**: 実施可能（コードのみ）
2. **統合テスト**: デバッグモードで実施
3. **プレイテスト**: 実際のゲームプレイで実施
4. **パフォーマンステスト**: プロファイラーで実施
5. **バランス調整**: テスト結果に基づいて実施

## 既知の問題・確認事項

### 確認項目1: adaptiveパターンのランダム性

**質問**: 攻撃間隔が完全にランダムだと、プレイヤーが過度にストレスを感じる可能性がある。セミランダム（準則化されたランダム）にするべきか？

**現在の実装**:
```typescript
case 'adaptive':
  return Math.max(3000, baseInterval * (0.4 + Math.random() * 0.3));
  // 4000-7000msの範囲でランダム
```

**検討事項**: Phase数に応じてランダム幅を調整することを検討

### 確認項目2: Chapter進行の体感難易度

**質問**: 現在の設定で、Chapter 1から7への段階的な難易度上昇が自然か、あるいは急すぎるか？

**想定進行**:
- Chapter 1-2: 初心者向け（簡単）
- Chapter 3-5: 中級者向け（適度な難易度）
- Chapter 6-7: 上級者向け（非常に難しい）

## 完了条件

Phase 6が完了するには、以下を満たす必要があります：

- [ ] すべてのユニットテストが緑（✅ passing）
- [ ] 各章でのゲームプレイが正常に動作
- [ ] ボス勝利/敗北フローが正しく機能
- [ ] 次章解放システムが正常に動作
- [ ] ゲームバランスが許容可能なレベル
- [ ] パフォーマンスが60fps以上を維持
- [ ] バランス調整結果がドキュメント化

## 次のPhase (Phase 7)

- サウンドエフェクトの統合
- アニメーション調整
- UIポーランド
- チュートリアル/ヘルプの作成
