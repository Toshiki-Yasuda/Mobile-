# 開発ガイド - Phase 7 で追加された機能

このドキュメントは、Phase 7 で実装された機能を開発者向けに解説します。

---

## 目次

1. [デバイス検出システム](#デバイス検出システム)
2. [パフォーマンス設定](#パフォーマンス設定)
3. [音響システム統合](#音響システム統合)
4. [アクセシビリティ機能](#アクセシビリティ機能)
5. [高コントラストモード](#高コントラストモード)
6. [ベストプラクティス](#ベストプラクティス)

---

## デバイス検出システム

### ファイル位置

`src/utils/deviceUtils.ts`

### 提供される関数

#### `isLowPowerDevice(): boolean`

**目的**: 低性能デバイスを自動判定

**判定基準**:
```typescript
- iPad 5 以前
- iPhone 6s 以前
- Android 4.x / 5.x
- メモリ ≤ 2GB
```

**使用例**:
```typescript
import { isLowPowerDevice } from '@/utils/deviceUtils';

const LowPowerComponent = () => {
  const lowPower = useMemo(() => isLowPowerDevice(), []);

  if (lowPower) {
    // 低性能デバイス向けの軽量レンダリング
    return <SimplifiedComponent />;
  }
  return <FullComponent />;
};
```

#### `getParticleLimit(): number`

**目的**: デバイスのパーティクル表示上限を取得

**戻り値**:
```
低性能: 3
中性能: 6
高性能: 12
```

**使用例**:
```typescript
import { getParticleLimit } from '@/utils/deviceUtils';

const particles = useMemo(() => {
  const limit = getParticleLimit();
  return Array.from({ length: limit }, (_, i) => ({
    id: i,
    // ...パーティクル定義
  }));
}, []);
```

#### `prefersReducedMotion(): boolean`

**目的**: OS レベルの動作削減設定を検出

**対応 OS**:
- macOS: System Preferences > Accessibility > Display > Reduce motion
- iOS: Settings > Accessibility > Motion > Reduce Motion
- Android: Settings > Accessibility > Remove animations
- Windows: Settings > Ease of Access > Display > Show animations

**使用例**:
```typescript
import { prefersReducedMotion } from '@/utils/deviceUtils';

export const Card = () => {
  const reduceMotion = useMemo(() => prefersReducedMotion(), []);

  return (
    <motion.div
      animate={{ y: 10 }}
      transition={{
        duration: reduceMotion ? 0 : 0.3  // モーション削減時は無効化
      }}
    />
  );
};
```

---

## パフォーマンス設定

### ストア拡張

**ファイル**: `src/stores/settingsStore.ts`

```typescript
interface SettingsStore {
  particleQuality: 'auto' | 'high' | 'medium' | 'low';
  reduceAnimations: boolean;
}
```

### 使用方法

#### 設定の読み込み

```typescript
import { useSettingsStore } from '@/stores/settingsStore';

export const MyComponent = () => {
  const { particleQuality, reduceAnimations } = useSettingsStore();

  // particleQuality に基づいてパーティクル数を決定
  const particleCount = {
    'auto': isLowPowerDevice() ? 3 : 12,
    'high': 12,
    'medium': 6,
    'low': 3,
  }[particleQuality];

  // reduceAnimations が true ならアニメーション無効化
  return (
    <motion.div
      animate={reduceAnimations ? { opacity: 1 } : { opacity: [0, 1] }}
    />
  );
};
```

#### 設定の変更

```typescript
const { setParticleQuality, setReduceAnimations } = useSettingsStore();

// パーティクル品質を変更
setParticleQuality('low');

// アニメーション削減を有効化
setReduceAnimations(true);
```

### デフォルト値

**`src/constants/config.ts`** で定義:

```typescript
export const DEFAULT_SETTINGS = {
  particleQuality: 'auto',      // 端末に応じて自動判定
  reduceAnimations: false,       // デフォルトは無効
};
```

---

## 音響システム統合

### ファイル位置

- **フック**: `src/hooks/useSound.ts`
- **ユーティリティ**: `src/utils/soundUtils.ts`
- **BGM マネージャー**: `src/utils/bgmManager.ts`

### BossScreen での音響統合例

#### インポート

```typescript
import { useSound } from '@/hooks/useSound';
```

#### 関数の使用

```typescript
const BossScreen = () => {
  const {
    playStartSound,
    playMissSound,
    playConfirmSound,
    playComboSound,
    playSuccessSound
  } = useSound();

  // ゲーム開始時
  useEffect(() => {
    if (!gameStarted) {
      playStartSound();
      setGameStarted(true);
    }
  }, []);

  // ダメージ受時
  const handleDamage = () => {
    playMissSound();  // ダメージ音
  };

  // ボス被ダメージ時
  const handleBossHit = () => {
    playConfirmSound(0);  // ヒット音
  };

  // コンボ達成時
  useEffect(() => {
    if (combo > 0 && combo % 5 === 0) {
      playComboSound(combo);
    }
  }, [combo]);

  // ボス撃破時
  const handleVictory = () => {
    playSuccessSound();  // 勝利音
  };
};
```

### 音響設定との連携

```typescript
import { useSettingsStore } from '@/stores/settingsStore';

const { soundEnabled, soundVolume } = useSettingsStore();

// useSound() は自動的に以下を確認
// - soundEnabled が false の場合は無音
// - soundVolume に基づいて音量調整
```

---

## アクセシビリティ機能

### ARIA 属性の追加方法

#### HPBar の例

```typescript
export const HPBar = ({ currentHP, maxHP }) => {
  return (
    <div
      role="progressbar"
      aria-label="Health Points"
      aria-valuenow={currentHP}
      aria-valuemin={0}
      aria-valuemax={maxHP}
      aria-valuetext={`${currentHP} out of ${maxHP} HP`}
    >
      {/* バー実装 */}
    </div>
  );
};
```

#### Alert（警告）の例

```typescript
{isCritical && (
  <div
    role="alert"
    aria-live="assertive"  // 重要な更新は即座にアナウンス
    aria-atomic="true"     // 全コンテンツをアナウンス
  >
    DANGER!
  </div>
)}
```

#### Dialog の例

```typescript
<motion.div
  role="dialog"
  aria-modal="true"
  aria-label="Boss message"
  aria-live="polite"       // ポライトにアナウンス（次の空きで）
  aria-atomic="true"
>
  {bossMessage}
</motion.div>
```

### テキスト代替表示の実装

```typescript
const getStatusIcon = (hp) => {
  if (hp > 50) return '🟢';
  if (hp > 25) return '🟡';
  return '🔴';
};

const getStatusText = (hp) => {
  if (hp > 50) return 'SAFE';
  if (hp > 25) return 'CAUTION';
  return 'CRITICAL';
};

export const HPBar = ({ currentHP, maxHP }) => {
  return (
    <>
      {/* 色のみに依存しない表示 */}
      <div className="flex items-center gap-2 mb-2">
        <span>{getStatusIcon(currentHP)}</span>
        <span>{getStatusText(currentHP)}</span>
      </div>

      {/* 従来のカラーバー */}
      <div className={`bg-gradient-to-r ${getBarColor(currentHP)}`}>
        {/* */}
      </div>
    </>
  );
};
```

### キャプション表示の実装

```typescript
import { useSettingsStore } from '@/stores/settingsStore';

export const GameScreen = () => {
  const { enableCaptions } = useSettingsStore();

  return (
    <>
      {/* キャプション表示 */}
      {enableCaptions && eventType && (
        <motion.div className="caption-box">
          <p>{getCaptionText(eventType)}</p>
          {eventAmount && <p>{eventAmount}ダメージ</p>}
        </motion.div>
      )}
    </>
  );
};

const getCaptionText = (type) => {
  const captions = {
    'damage': '[ダメージ音]',
    'critical': '[クリティカルヒット]',
    'attack': '[敵の攻撃]',
    'heal': '[回復]',
    'combo': '[コンボ達成]',
  };
  return captions[type] || '';
};
```

---

## 高コントラストモード

### 実装方法

**App.tsx**:
```typescript
import { useSettingsStore } from '@/stores/settingsStore';

function App() {
  const { enableHighContrast } = useSettingsStore();

  return (
    <div className={enableHighContrast ? 'high-contrast-mode' : ''}>
      {/* アプリ本体 */}
    </div>
  );
}
```

### CSS 定義

**globals.css**:
```css
.high-contrast-mode {
  --color-text: #ffffff;
  --color-bg: #000000;
  --color-accent: #ffff00;
}

.high-contrast-mode body {
  background-color: #000000;
  color: #ffffff;
}

.high-contrast-mode .text-hunter-gold {
  @apply text-yellow-300;
}

.high-contrast-mode .bg-hunter-gold {
  @apply bg-yellow-300;
}
```

### カスタム色の定義（新規コンポーネント）

```typescript
export const MyComponent = () => {
  return (
    <div className={`
      bg-white text-black
      dark:bg-gray-900 dark:text-white
      high-contrast-mode:bg-black
      high-contrast-mode:text-yellow-300
    `}>
      Content
    </div>
  );
};
```

---

## ベストプラクティス

### 1. デバイス検出の活用

```typescript
// ❌ 悪い例：毎回判定
const Component = () => {
  if (isLowPowerDevice()) {
    // ← レンダー毎に呼ばれる
  }
};

// ✅ 良い例：useMemo でメモ化
const Component = () => {
  const lowPower = useMemo(() => isLowPowerDevice(), []);

  if (lowPower) {
    // ← 初回のみ計算
  }
};
```

### 2. パーティクルの条件分岐

```typescript
// ✅ 複数の条件を組み合わせる
const particles = useMemo(() => {
  const lowPower = isLowPowerDevice();
  const reduceMotion = prefersReducedMotion();
  const userSetting = useSettingsStore().particleQuality;

  let limit = 12;
  if (lowPower || reduceMotion) limit = 0;
  else if (userSetting === 'low') limit = 3;
  else if (userSetting === 'medium') limit = 6;

  return createParticles(limit);
}, []);
```

### 3. ARIA 属性の一貫性

```typescript
// ✅ 同じ type の要素は同じ ARIA 属性
const ProgressBars = () => {
  return (
    <>
      <div role="progressbar" aria-label="HP">
        {/* */}
      </div>
      <div role="progressbar" aria-label="Mana">
        {/* */}
      </div>
    </>
  );
};
```

### 4. アクセシビリティ設定の尊重

```typescript
// ❌ 設定を無視
const Tooltip = ({ text }) => <div>{text}</div>;

// ✅ キャプション設定を確認
const Tooltip = ({ text }) => {
  const { enableCaptions } = useSettingsStore();

  return enableCaptions ? <div>{text}</div> : null;
};
```

### 5. テストの実施

```typescript
// ARIA 属性のテスト
describe('HPBar ARIA', () => {
  it('should have progressbar role', () => {
    const { container } = render(<HPBar currentHP={50} maxHP={100} />);
    const bar = container.querySelector('[role="progressbar"]');
    expect(bar).toHaveAttribute('aria-valuenow', '50');
  });
});
```

---

## コンポーネント別実装チェックリスト

### 新規アニメーションコンポーネント

```
□ isLowPowerDevice() で条件分岐
□ prefersReducedMotion() を確認
□ willChange と backfaceVisibility を追加
□ useSettingsStore から設定を読み込む
□ ARIA 属性があるか確認
□ テキスト代替表示があるか確認
```

### 新規インタラクティブ要素

```
□ role 属性を付与
□ aria-label または aria-labelledby
□ aria-live あるか (動的更新時)
□ キーボード対応あるか
□ フォーカス表示あるか
```

### 新規ゲーム画面

```
□ useSettingsStore で全設定を読み込み
□ enableCaptions 対応
□ enableHighContrast 対応
□ 音響効果統合
□ ARIA 属性実装
□ テキスト代替表示実装
```

---

## デバッグのコツ

### パフォーマンス測定

```typescript
// FPS 計測
const measureFPS = () => {
  let frames = 0;
  const startTime = performance.now();

  const measure = () => {
    frames++;
    const now = performance.now();
    if (now - startTime >= 1000) {
      console.log(`FPS: ${frames}`);
    } else {
      requestAnimationFrame(measure);
    }
  };

  requestAnimationFrame(measure);
};
```

### ARIA 検証

```typescript
// ブラウザ DevTools で確認
// 1. Elements タブで要素を選択
// 2. Accessibility タブを確認
// 3. Role, Name, State を確認
```

### デバイス検出テスト

```typescript
// ChromeDevTools で低性能デバイスをシミュレート
// Device Emulation → iPhone 6s 選択
// Throttling → CPU Throttling 4x 選択
// Network → Slow 3G 選択
```

---

## トラブルシューティング

### ARIA 属性が反映されない

**原因**: role が競合している

**解決**:
```typescript
// ❌ 悪い例
<div role="button" role="progressbar">

// ✅ 良い例
<div role="progressbar">
```

### パーティクルが多すぎる

**原因**: デバイス検出が機能していない

**確認**:
```typescript
console.log('Low Power:', isLowPowerDevice());
console.log('Particle Limit:', getParticleLimit());
console.log('Reduce Motion:', prefersReducedMotion());
```

### 高コントラスト色が反映されない

**原因**: CSS セレクタが一致していない

**確認**:
```typescript
// DevTools > Computed で確認
// .high-contrast-mode がクラスに含まれているか
// CSS ルールが上書きされていないか
```

---

## 参考資料

### ARIA
- https://www.w3.org/WAI/ARIA/apg/

### WCAG 2.1
- https://www.w3.org/WAI/WCAG21/quickref/

### Framer Motion パフォーマンス
- https://www.framer.com/motion/performance/

---

**最終更新**: 2026-01-15
**バージョン**: Phase 7
**言語**: 日本語

このガイドで質問やバグがあれば、GitHub Issues で報告してください。
