/**
 * バーチャルキーボード定数
 */

// ホームポジションのキー（仕様書準拠）
// 左手: A S D F / 右手: J K L ;
export const HOME_POSITION_KEYS = ['a', 's', 'd', 'f', 'j', 'k', 'l', ';'];

// F, J には突起マークがある（Tactile bump）
export const BUMP_KEYS = ['f', 'j'];

// 指の担当キー（仕様書準拠の色分け）
export const FINGER_ASSIGNMENT: Record<string, { hand: 'left' | 'right'; finger: string }> = {
  // === 左手 ===
  // 左手小指: 1 Q A Z
  '1': { hand: 'left', finger: 'pinky' },
  'q': { hand: 'left', finger: 'pinky' },
  'a': { hand: 'left', finger: 'pinky' },
  'z': { hand: 'left', finger: 'pinky' },

  // 左手薬指: 2 W S X
  '2': { hand: 'left', finger: 'ring' },
  'w': { hand: 'left', finger: 'ring' },
  's': { hand: 'left', finger: 'ring' },
  'x': { hand: 'left', finger: 'ring' },

  // 左手中指: 3 E D C
  '3': { hand: 'left', finger: 'middle' },
  'e': { hand: 'left', finger: 'middle' },
  'd': { hand: 'left', finger: 'middle' },
  'c': { hand: 'left', finger: 'middle' },

  // 左手人差し指: 4 R F V (内側), 5 T G B (中央)
  '4': { hand: 'left', finger: 'index' },
  'r': { hand: 'left', finger: 'index' },
  'f': { hand: 'left', finger: 'index' },
  'v': { hand: 'left', finger: 'index' },
  '5': { hand: 'left', finger: 'index' },
  't': { hand: 'left', finger: 'index' },
  'g': { hand: 'left', finger: 'index' },
  'b': { hand: 'left', finger: 'index' },

  // === 右手 ===
  // 右手人差し指: 6 Y H N (中央), 7 U J M (内側)
  '6': { hand: 'right', finger: 'index' },
  'y': { hand: 'right', finger: 'index' },
  'h': { hand: 'right', finger: 'index' },
  'n': { hand: 'right', finger: 'index' },
  '7': { hand: 'right', finger: 'index' },
  'u': { hand: 'right', finger: 'index' },
  'j': { hand: 'right', finger: 'index' },
  'm': { hand: 'right', finger: 'index' },

  // 右手中指: 8 I K ,
  '8': { hand: 'right', finger: 'middle' },
  'i': { hand: 'right', finger: 'middle' },
  'k': { hand: 'right', finger: 'middle' },
  ',': { hand: 'right', finger: 'middle' },

  // 右手薬指: 9 O L .
  '9': { hand: 'right', finger: 'ring' },
  'o': { hand: 'right', finger: 'ring' },
  'l': { hand: 'right', finger: 'ring' },
  '.': { hand: 'right', finger: 'ring' },

  // 右手小指: 0 P ; / - [ ] @ : Enter ー など
  '0': { hand: 'right', finger: 'pinky' },
  '-': { hand: 'right', finger: 'pinky' },
  'ー': { hand: 'right', finger: 'pinky' },
  'p': { hand: 'right', finger: 'pinky' },
  '@': { hand: 'right', finger: 'pinky' },
  '[': { hand: 'right', finger: 'pinky' },
  ';': { hand: 'right', finger: 'pinky' },
  ':': { hand: 'right', finger: 'pinky' },
  ']': { hand: 'right', finger: 'pinky' },
  'Enter': { hand: 'right', finger: 'pinky' },
  '/': { hand: 'right', finger: 'pinky' },
  '_': { hand: 'right', finger: 'pinky' },
};

// チャプターごとの手の影の透明度
export const HAND_OPACITY_BY_CHAPTER: Record<number, number> = {
  1: 0.15,  // しっかり見える
  2: 0.10,  // やや薄い
  3: 0.06,  // かなり薄い
  4: 0.03,  // ほぼ見えない
  // 5以降は表示しない
};

// キー押下エフェクトの継続時間（ms）
export const KEY_PRESS_DURATION = 700;

// キーボードレイアウト（日本語入力対応）
export const KEYBOARD_LAYOUT = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', 'ー'],
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '@', '['],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', ':', 'Enter'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', '_'],
];

// 各行のインデント（実際のキーボード配置に近づける）
export const ROW_INDENTS = [0, 6, 12, 20];

// 特殊キーの幅（通常の1.5倍）
export const WIDE_KEYS = ['Enter'];
