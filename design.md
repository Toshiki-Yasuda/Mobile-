# Design Concept & Guidelines

## 1. Core Concept
**"Focus & Flow"**
* **Minimalist:** ユーザーの視界からノイズ（不要な線、過剰な色）を排除し、テキストのみに集中させる。
* **Feedback:** 入力に対する反応（打鍵感、カーソル移動、ミス表示）は即座かつ滑らかに。
* **Modern Professional:** 開発者が使いたくなる、エディタライクで洗練された佇まい。

---

## 2. Color Palette (Dark Mode Base)
基本はダークモード推奨。目に優しく、コードエディタのような没入感を作る。

| Role | Color (Hex/Hsl) | Usage |
| :--- | :--- | :--- |
| **Background** | `#09090b` (Zinc 950) | アプリ全体の背景。漆黒ではなく極めて深いグレー。 |
| **Surface** | `#18181b` (Zinc 900) | カード、モーダル、サイドバーの背景。 |
| **Primary** | `#fafafa` (Zinc 50) | メインの文字色、アクセントとなるボタン。 |
| **Secondary** | `#a1a1aa` (Zinc 400) | 次点情報の文字色（WPMの単位など）。 |
| **Accent** | `#3b82f6` (Blue 500) | リンク、フォーカス、プログレスバー。 |
| **Error** | `#ef4444` (Red 500) | タイプミス時のハイライト。彩度を少し落とし目に優しく。 |
| **Muted** | `#27272a` (Zinc 800) | 未入力の文字、境界線。 |

---

## 3. Typography
タイピングアプリの命。可読性が高く、美しい等幅フォントを採用する。

* **Font Family (Monospace):** `JetBrains Mono`, `Fira Code`, `Roboto Mono`, またはシステム標準の等幅フォント。
* **Font Family (UI):** `Inter`, `San Francisco`, `Helvetica Neue`.

### Hierarchy
* **Heading 1:** 24px / Bold / Primary Color (タイトル)
* **Typing Area:** 32px / Medium / Primary Color (入力中の文字)
    * *未入力文字:* Muted Color
    * *入力済み文字:* Primary Color
    * *ミス:* Error Color
* **Body:** 16px / Regular / Secondary Color (説明文)
* **Label:** 12px / Medium / Uppercase / Muted Color (設定ラベル)

---

## 4. UI Components Rules

### A. Buttons & Inputs
* **Border Radius:** `6px` または `8px` (少しだけ丸める。完全な丸は避ける)。
* **Shadow:** 基本はなし。Hover時に `0 4px 6px -1px rgba(0, 0, 0, 0.1)` 程度のごく薄い影。
* **Border:** `1px solid #27272a` (薄いグレーの境界線で区切る)。

### B. Layout (Bento Grid)
* スコアや設定項目は「カード」として配置する。
* カード間のGap（隙間）は `16px` または `24px` で統一する。
* カード背景は `Surface` 色を使用し、境界線は目立たせない。

### C. Motion / Animation
* **Cursor:** スムーズに移動する（`transition: all 0.1s ease`）。カクカクさせない。
* **Type Feedback:** 正解時に文字がわずかに跳ねる、または光るなどの極小のエフェクトを入れる（Optional）。

---

## 5. "脱・野暮ったい" チェックリスト
- [ ] **純粋な黒(#000000)を使っていないか？** → `#111` などのダークグレーを使うと高級感が出る。
- [ ] **線が太すぎないか？** → 境界線は1px、色は薄く。
- [ ] **余白は十分か？** → 要素が詰まりすぎていると古臭く見える。思い切って広げる。
- [ ] **フォントサイズは適切か？** → メインのタイピング文字は大きく、それ以外は小さく。メリハリをつける。