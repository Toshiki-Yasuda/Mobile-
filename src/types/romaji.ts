/**
 * ローマ字入力エンジン関連の型定義
 */

// ===== 入力状態 =====
export interface TypingState {
  /** 目標のひらがな文字列 */
  targetHiragana: string;
  /** ひらがなをトークン化したもの */
  tokens: string[];
  /** 現在処理中のトークンインデックス */
  currentTokenIndex: number;
  /** 現在のトークンに対する入力済みローマ字 */
  currentInput: string;
  /** 確定済みのローマ字（表示用） */
  confirmedRomaji: string;
  /** 現在有効なパターン候補 */
  validPatterns: string[];
  /** 完了フラグ */
  isComplete: boolean;
  /** 促音の子音重ねモード */
  sokuonMode: SokuonMode | null;
  /** 保留中の完全一致（より長いパターンがある場合）*/
  pendingExactMatch: string | null;
}

// ===== 促音モード =====
export interface SokuonMode {
  /** 重ねる子音 */
  consonant: string;
  /** 次のトークンのパターン */
  nextPatterns: string[];
}

// ===== キー入力結果 =====
export interface InputResult {
  /** 入力が有効だったか */
  isValid: boolean;
  /** トークンが確定したか */
  isTokenComplete: boolean;
  /** 単語全体が完了したか */
  isWordComplete: boolean;
  /** ミスしたか */
  isMiss: boolean;
  /** 次に入力可能なキー一覧 */
  nextValidKeys: string[];
  /** 更新後の状態 */
  newState: TypingState;
  /** 確定したローマ字（表示用） */
  acceptedRomaji: string;
}

// ===== パフォーマンス計測 =====
export interface TypingMetrics {
  /** キー入力から判定までの時間(ms) */
  inputLatency: number;
  /** 判定処理時間(ms) */
  processingTime: number;
  /** 状態更新時間(ms) */
  stateUpdateTime: number;
}

// ===== キーボードレイアウト =====
export interface KeyboardLayout {
  rows: KeyboardRow[];
}

export interface KeyboardRow {
  keys: KeyInfo[];
  offset?: number; // 行のオフセット（px）
}

export interface KeyInfo {
  key: string;
  code: string;
  width?: number; // デフォルトは1
  label?: string; // 表示ラベル（異なる場合）
}

// ===== 入力履歴（分析用） =====
export interface InputHistory {
  key: string;
  timestamp: number;
  isCorrect: boolean;
  expectedKeys: string[];
  latency: number; // 前のキーからの時間(ms)
}

// ===== キー統計（苦手キー分析用） =====
export interface KeyStats {
  key: string;
  totalAttempts: number;
  correctCount: number;
  missCount: number;
  averageLatency: number;
  accuracy: number; // 0-100
}
