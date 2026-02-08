# Phase 7 計画: ポーランス・最適化

**計画日**: 2026-01-15
**ステータス**: 📋 計画中
**目的**: ボスシステムの最終ポーランスと最適化
**予定工数**: 40-60時間

---

## 概要

Phase 7では、基本機能が完成したボスシステムの以下を実施します：

1. **サウンド統合**: BGM・効果音の実装
2. **アニメーション調整**: より滑らかで心地よい動き
3. **パフォーマンス最適化**: メモリ使用量削減、フレームレート安定化
4. **UI/UXポーランス**: ビジュアル改善、操作性向上
5. **アクセシビリティ**: 色覚異常対応、字幕表示
6. **ドキュメント最終化**: 完全なガイド作成

---

## タスク1: サウンド・ミュージック統合

### 1.1 必要なオーディオアセット

#### ボス戦BGM（7種類）
| Chapter | ボス名 | BGM概要 | 推奨長さ |
|---------|------|--------|--------|
| 1 | ハンター試験官 | 緊張感のある始まり | 2:30 |
| 2 | 天空闘技場主 | パワフルで疾走感あり | 3:00 |
| 3 | 幻影旅団長 | 不気味で危険 | 3:30 |
| 4 | ヨークシン秘密結社 | 陰謀的で神秘的 | 3:00 |
| 5 | グリードアイランド守護者 | ファンタジー感 | 3:00 |
| 6 | キメラアント王 | 圧倒的で怖い | 4:00 |
| 7 | 暗黒大陸からの使者 | 絶望的かつ壮大 | 4:30 |

#### 効果音（SE）
| SE | 用途 | 長さ |
|----|------|------|
| ボス攻撃 | 敵攻撃時 | 0.3-0.5秒 |
| プレイヤーダメージ | ダメージ表示 | 0.2-0.3秒 |
| クリティカル | クリティカルヒット | 0.3-0.4秒 |
| コンボ達成 | コンボマイルストーン | 0.4-0.5秒 |
| ボス撃破 | ボス倒す瞬間 | 0.8-1.0秒 |
| ゲームオーバー | プレイヤー敗北 | 1.0-1.2秒 |
| 結果ランク表示 | 結果表示 | 0.5-0.8秒 |

### 1.2 オーディオ実装計画

#### 実装ステップ

**Step 1: BossBattle用オーディオマネージャーの作成**
```typescript
// src/utils/audioManager.ts
export class BossBattleAudioManager {
  // BGM管理
  playBossBGM(chapterId: number): void
  stopBossBGM(): void
  fadeBossBGM(duration: number): void

  // SE管理
  playAttackSE(): void
  playDamageSE(): void
  playCriticalSE(): void
  playComboSE(): void
  playVictorySE(): void
  playDefeatSE(): void

  // ボリューム管理
  setBGMVolume(volume: number): void
  setSEVolume(volume: number): void
  getMute(): boolean
  setMute(mute: boolean): void
}
```

**Step 2: BossScreenへの統合**
```typescript
export const BossScreen: React.FC<BossScreenProps> = ({ chapterId, ... }) => {
  const audioManager = useRef<BossBattleAudioManager | null>(null);

  useEffect(() => {
    audioManager.current = new BossBattleAudioManager();
    audioManager.current.playBossBGM(chapterId);

    return () => {
      audioManager.current?.stopBossBGM();
    };
  }, [chapterId]);

  // 攻撃時にSE再生
  const executeEnemyAttack = useCallback(() => {
    audioManager.current?.playAttackSE();
    // ...
  }, []);

  // ...
};
```

**Step 3: 設定メニューでの音量調整**
```typescript
// SettingsScreenに以下を追加
<div className="audio-settings">
  <label>BGM音量</label>
  <input
    type="range"
    min={0}
    max={100}
    onChange={(e) => audioManager.setBGMVolume(Number(e.target.value))}
  />
  <label>SE音量</label>
  <input
    type="range"
    min={0}
    max={100}
    onChange={(e) => audioManager.setSEVolume(Number(e.target.value))}
  />
  <label>
    <input
      type="checkbox"
      onChange={(e) => audioManager.setMute(e.target.checked)}
    />
    ミュート
  </label>
</div>
```

### 1.3 オーディオファイル配置

```
public/audio/
├── boss/
│   ├── bgm/
│   │   ├── chapter1-boss.mp3
│   │   ├── chapter2-boss.mp3
│   │   ├── ...
│   │   └── chapter7-boss.mp3
│   └── se/
│       ├── attack.mp3
│       ├── damage.mp3
│       ├── critical.mp3
│       ├── combo.mp3
│       ├── victory.mp3
│       ├── defeat.mp3
│       └── result-rank.mp3
```

---

## タスク2: アニメーション調整

### 2.1 BossCharacterアニメーション

**現在**: 基本的なスケール・不透明度アニメーション

**改善案**:
```typescript
// src/components/boss/BossCharacter.tsx
<motion.div
  // 通常時
  initial={{ scale: 1, filter: 'brightness(1)', y: 0 }}
  // 攻撃時
  animate={isAttacking ? {
    scale: 1.1,           // 1.1倍に拡大
    filter: 'brightness(1.3)', // 光る
    y: [-5, 5, -5],       // 上下動き（スプリング感）
  } : {
    scale: 1,
    filter: 'brightness(1)',
    y: 0,
  }}
  // ダメージ時
  whileTap={isDamaged ? {
    scale: 0.95,          // 縮小
    x: [0, -10, 10, -10, 0], // 左右に揺らぐ
  } : {}}
  transition={{
    type: 'spring',
    stiffness: 100,
    damping: 15,
  }}
/>
```

### 2.2 HPバーアニメーション

**改善項目**:
- HP変化時の滑らかなトランジション（0.5秒）
- Phase変化時のパルス効果
- 危機的状況での点滅

```typescript
// HPが低い場合のパルスアニメーション
<motion.div
  animate={hpPercentage < 20 ? {
    backgroundColor: ['rgba(255,0,0,0.3)', 'rgba(255,0,0,0.6)', 'rgba(255,0,0,0.3)'],
  } : {}}
  transition={{ duration: 0.5, repeat: Infinity }}
/>
```

### 2.3 エフェクトアニメーション

**ダメージ表示**:
```typescript
// 数字が浮き上がって消える
<motion.div
  initial={{ opacity: 1, y: 0, scale: 1 }}
  animate={{ opacity: 0, y: -50, scale: 0.8 }}
  transition={{ duration: 1, ease: 'easeOut' }}
/>
```

**クリティカルエフェクト**:
```typescript
// スパークのような効果
<motion.div
  className="critical-burst"
  initial={{ opacity: 1, scale: 0.5 }}
  animate={{ opacity: 0, scale: 2 }}
  transition={{ duration: 0.6 }}
/>
```

### 2.4 画面遷移アニメーション

**ボス戦開始時**:
```typescript
// 画面スライドイン
initial={{ opacity: 0, x: 100 }}
animate={{ opacity: 1, x: 0 }}
transition={{ duration: 0.5 }}
```

**ボス戦終了時**:
```typescript
// フェードアウト
initial={{ opacity: 1 }}
animate={{ opacity: 0 }}
transition={{ duration: 0.3, delay: 1 }}
```

---

## タスク3: パフォーマンス最適化

### 3.1 メモリ最適化

#### 問題: 長時間プレイでのメモリリーク

**解決方法**:

**1) setTimeoutのリーク防止**
```typescript
// BossScreen.tsx
useEffect(() => {
  // ...
  return () => {
    if (attackTimerRef.current) {
      clearTimeout(attackTimerRef.current);
    }
    if (gameLoopRef.current) {
      clearTimeout(gameLoopRef.current);
    }
  };
}, []);
```

**2) イベントリスナーの適切な削除**
```typescript
useEffect(() => {
  const handleKeyDown = (e: KeyboardEvent) => {
    // ...
  };

  window.addEventListener('keydown', handleKeyDown);
  return () => window.removeEventListener('keydown', handleKeyDown);
}, []);
```

**3) Zustandストアのクリーンアップ**
```typescript
// BossScreen アンマウント時
useEffect(() => {
  return () => {
    useBossStore.getState().resetBattle();
  };
}, []);
```

### 3.2 レンダリング最適化

#### 問題: 不要な再レンダリング

**解決方法**:

**1) useMemoの活用**
```typescript
const bossCharacterMemo = useMemo(() => (
  <BossCharacter boss={battle.currentBoss} {...props} />
), [battle.currentBoss]);
```

**2) useCallbackの活用**
```typescript
const handlePlayerTakeDamage = useCallback((damage: number) => {
  setShowingEffect({ type: 'damage', amount: damage });
}, []);
```

**3) Zustandのセレクターで細粒度な購読**
```typescript
// 全体のbattleではなく、必要なプロパティのみ購読
const bossHP = useBossStore(state => state.currentBattle?.bossHP);
const playerHP = useBossStore(state => state.currentBattle?.playerHP);
```

### 3.3 バンドルサイズ最適化

#### 問題: チャンクサイズが500KB超過

**解決方法**:

**1) Code Splittingの実装**
```typescript
// components/screens/BossScreen.tsx をdynamic importに
const BossScreen = lazy(() => import('@/components/screens/BossScreen'));

<Suspense fallback={<Loading />}>
  <BossScreen {...props} />
</Suspense>
```

**2) 不要なライブラリの削除**
- Framer Motionの最小化（必要な機能のみ import）
- 未使用の依存関係を削除

**3) Tree Shakingの確保**
```typescript
// 名前付きエクスポートを使用
export const getBossAttackPattern = (...) // ✓ Tree shakeable
const getAllFunctions = (...) => ({ getBossAttackPattern, ... }) // ✗ Tree shakeable
```

### 3.4 フレームレート安定化

#### 問題: エフェクト表示時のFPS低下

**監視項目**:
```typescript
// React DevTools Profilerで測定
- BossScreen レンダリング時間: < 16ms
- BossCharacter アニメーション FPS: 60fps
- エフェクト表示時 FPS: > 55fps
```

**対応**:
```typescript
// レンダリング負荷を減らす
// 複数エフェクトを同時表示しない
if (effectQueue.length > 3) {
  effectQueue.shift(); // 古いエフェクトを削除
}
```

---

## タスク4: UI/UXポーランス

### 4.1 ビジュアル改善

#### ダークモード完全対応
```typescript
// Tailwindのダークモードクラス確認
<div className="bg-white dark:bg-gray-900 text-black dark:text-white">
```

#### アイコン・ボタンの改善
- アイコンの統一化（Heroicons使用）
- ボタンのホバー・アクティブ状態の明確化
- タッチターゲットサイズ: 最小44x44px

#### カラースキーム
```css
/* Hunter × Hunter テーマ */
--primary: #FFD700;    /* ゴールド */
--primary-dark: #F39C12; /* 濃いゴールド */
--accent: #8B0000;     /* ダークレッド */
--danger: #FF0000;     /* 赤 */
--success: #00AA00;    /* 緑 */
--background: #1a1a1a; /* 背景 */
```

### 4.2 ユーザビリティ改善

#### ローディング状態の明確化
```typescript
// 各画面遷移時にローディング表示
<LoadingBar
  message="ボス戦を準備中..."
  progress={75}
/>
```

#### エラーハンドリング
```typescript
// エラーが発生した場合の表示
<ErrorNotification
  message="ボス戦の読み込みに失敗しました"
  onRetry={() => startBossBattle(chapterId)}
/>
```

#### ツールチップ・ヘルプ
```typescript
// ボスの特性をツールチップで表示
<InfoIcon title="このボスはPhase 2で攻撃速度が上がります" />
```

### 4.3 モバイル最適化

#### レスポンシブ調整
```typescript
// 画面サイズに応じたレイアウト調整
<motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

#### タッチ操作対応
```typescript
// モバイルでのタッチフィードバック
<motion.button
  whileTap={{ scale: 0.95 }}
  onTouchStart={() => navigator.vibrate(10)}
/>
```

---

## タスク5: アクセシビリティ対応

### 5.1 色覚異常対応

#### 色に頼らない表示
```typescript
// 現在: 色だけでHP状態を判別
// 改善: 色 + テキスト + パターン
<div className={`
  ${hpPercentage > 50 ? 'bg-green-500' : 'bg-red-500'}
  ${hpPercentage > 50 ? 'diagonal-stripes' : 'solid'}
`}>
  {hpPercentage > 50 ? '良好' : '危機'}
</div>
```

#### コントラスト比の確認
- WCAG AA標準: 最小4.5:1
- ボスHPバー: 確認必要
- テキスト: 確認必要

### 5.2 スクリーンリーダー対応

```typescript
// ALT テキストの追加
<img alt="ボスキャラクター: ハンター試験官" src={...} />

// ARIA ラベルの追加
<div
  role="status"
  aria-live="polite"
  aria-label={`ボスHP: ${bossHP}/${bossMaxHP}`}
>
  {bossHP} / {bossMaxHP}
</div>

// キーボード操作の確保
<button onKeyDown={(e) => {
  if (e.key === 'Enter' || e.key === ' ') {
    handleClick();
  }
}} />
```

### 5.3 字幕表示機能

```typescript
// ボスセリフに字幕を表示
<motion.div className="subtitle-container">
  <p className="text-center text-white text-sm">
    {bossDialogue}
  </p>
</motion.div>
```

---

## タスク6: ドキュメント最終化

### 6.1 ユーザーガイド

**ファイル**: `BOSS_SYSTEM_USER_GUIDE.md`

内容:
- ボスシステムの説明
- 各章のボスの特徴
- 攻略のコツ
- ランク制度の説明
- 設定方法

### 6.2 開発者ガイド

**ファイル**: `BOSS_SYSTEM_DEVELOPER_GUIDE.md`

内容:
- コード構造の説明
- 新しいボスの追加方法
- カスタマイズ例
- API リファレンス
- トラブルシューティング

### 6.3 チェンジログ

**ファイル**: `BOSS_SYSTEM_CHANGELOG.md`

形式:
```markdown
## [1.0.0] - 2026-01-20

### Added
- ボスシステム完全実装
- 7つの章別ボス
- 攻撃パターンシステム
- ランク判定システム

### Changed
- StageSelectScreen UI更新
- ゲームフロー統合

### Fixed
- ボス敗北時のリトライ機能

### Performance
- メモリ使用量最適化
- フレームレート安定化
```

---

## 実装優先度

### 高優先度 (必須)
- [ ] BossBattleAudioManager実装
- [ ] オーディオファイル配置
- [ ] BossScreenへのオーディオ統合
- [ ] メモリリーク対策
- [ ] Code Splitting実装

### 中優先度 (推奨)
- [ ] アニメーション調整
- [ ] UI改善
- [ ] モバイル最適化
- [ ] ユーザーガイド作成

### 低優先度 (オプション)
- [ ] 色覚異常完全対応
- [ ] スクリーンリーダー完全対応
- [ ] 字幕機能
- [ ] 開発者ガイド詳細化

---

## 完了条件

Phase 7が完了するには、以下を満たす必要があります：

- [ ] ボス戦BGMが7曲実装済み
- [ ] 主要SE（攻撃、ダメージ等）実装済み
- [ ] アニメーション調整完了
- [ ] パフォーマンス測定完了（60fps以上）
- [ ] メモリリーク対策実施
- [ ] Code Splitting実装完了
- [ ] UI/UXポーランス完了
- [ ] モバイル対応確認
- [ ] ユーザーガイド作成完了
- [ ] 最終ビルド確認（エラーなし）

---

## 依存関係

### 外部ライブラリ
- **Web Audio API**: ネイティブ、追加不要
- **Framer Motion**: 既に統合済み
- **Tailwind CSS**: 既に統合済み

### 前提条件
- Phase 1-6の完全実装
- すべてのテストの成功
- バランス調整の完了

---

## 次のステップ（Phase 7以降）

### Phase 7.5: 最終テスト・デバッグ
- 実機テスト
- ユーザーテスト
- バグ修正

### Phase 8: リリース準備
- AppStore・PlayStore対応
- プライバシーポリシー策定
- 利用規約策定

### Phase 9: 運用・保守
- ユーザーフィードバック対応
- バランス調整（継続）
- 新機能検討

---

## 見積もり

### 工数
| タスク | 工数 | 備考 |
|------|------|------|
| サウンド統合 | 20時間 | オーディオ素材含む |
| アニメーション調整 | 10時間 | Framer Motion活用 |
| パフォーマンス最適化 | 12時間 | メモリ・バンドル |
| UI/UX改善 | 8時間 | ビジュアル調整 |
| アクセシビリティ | 6時間 | WCAG対応 |
| ドキュメント | 8時間 | ガイド・changelog |
| テスト・デバッグ | 10時間 | 最終確認 |
| **合計** | **74時間** | 約2週間 |

---

## リスク管理

### 潜在的リスク

| リスク | 対策 |
|------|------|
| オーディオファイルの品質 | 素材を事前テスト |
| ブラウザ互換性 | 多ブラウザでテスト |
| メモリリーク検出困難 | Chrome DevToolsで監視 |
| パフォーマンス急低下 | 段階的な最適化 |

---

## 結論

Phase 7では、ボスシステムの完成度を大幅に向上させます。
サウンド、アニメーション、パフォーマンスの最適化により、
ユーザーエクスペリエンスを最大化します。

**目標完成日**: 2026-01-25～2026-02-05
