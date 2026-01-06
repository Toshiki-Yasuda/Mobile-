/**
 * ローマ字入力エンジン
 * 
 * 状態機械ベースの入力判定システム
 * - 複数の入力パターンに対応
 * - 入力途中でのパターン変更対応
 * - 「ん」と促音の特殊処理
 * - 高速処理（16ms以内の応答を目標）
 */

import {
  ROMAJI_PATTERNS,
  SOKUON_CONSONANTS,
  N_REQUIRES_DOUBLE,
  N_SINGLE_OK_CONSONANTS,
} from './romajiPatterns';
import type { TypingState, InputResult, SokuonMode } from '@/types/romaji';

// ===== トークナイザー =====

/**
 * ひらがな文字列をトークン（文字または拗音単位）に分割
 * 
 * @example
 * tokenizeHiragana('きょうと') // ['きょ', 'う', 'と']
 * tokenizeHiragana('きっと') // ['き', 'っ', 'と']
 */
export function tokenizeHiragana(hiragana: string): string[] {
  const tokens: string[] = [];
  let i = 0;
  
  while (i < hiragana.length) {
    // 3文字のパターンをチェック（ゔぁ など）
    if (i + 2 < hiragana.length) {
      const threeChars = hiragana.slice(i, i + 3);
      if (ROMAJI_PATTERNS[threeChars]) {
        tokens.push(threeChars);
        i += 3;
        continue;
      }
    }
    
    // 2文字の拗音をチェック
    if (i + 1 < hiragana.length) {
      const twoChars = hiragana.slice(i, i + 2);
      if (ROMAJI_PATTERNS[twoChars]) {
        tokens.push(twoChars);
        i += 2;
        continue;
      }
    }
    
    // 1文字
    tokens.push(hiragana[i]);
    i++;
  }
  
  return tokens;
}

// ===== パターン取得 =====

/**
 * 「ん」のパターンを後続トークンに基づいて取得
 */
function getNPatterns(nextToken: string | undefined, isLastToken: boolean): string[] {
  const basePatterns = ['nn', "n'", 'xn'];
  
  // 単語末尾なら 'n' 単体もOK
  if (isLastToken || !nextToken) {
    return ['n', ...basePatterns];
  }
  
  // 次のトークンのパターンを取得
  const nextPatterns = ROMAJI_PATTERNS[nextToken] || [];
  if (nextPatterns.length === 0) {
    return ['n', ...basePatterns];
  }
  
  // 次のトークンの先頭文字をチェック
  const nextFirstChars = new Set(nextPatterns.map(p => p[0]));
  
  // 後続が母音/y/nで始まる場合は 'nn' 必須
  for (const char of nextFirstChars) {
    if (N_REQUIRES_DOUBLE.has(char)) {
      return basePatterns;
    }
  }
  
  // それ以外の子音なら 'n' 単体もOK
  return ['n', ...basePatterns];
}

/**
 * 促音（っ）のパターンを次のトークンに基づいて取得
 * 子音重ねパターンも含む
 */
function getSokuonPatterns(nextToken: string | undefined): string[] {
  const basePatterns = ROMAJI_PATTERNS['っ'] || [];
  
  if (!nextToken) {
    return basePatterns;
  }
  
  const nextPatterns = ROMAJI_PATTERNS[nextToken] || [];
  const doubleConsonants: string[] = [];
  
  // 次のトークンの先頭子音を取得
  for (const pattern of nextPatterns) {
    const firstChar = pattern[0];
    if (SOKUON_CONSONANTS.has(firstChar)) {
      doubleConsonants.push(firstChar);
    }
  }
  
  // 重複を除去して返す
  return [...new Set([...basePatterns, ...doubleConsonants])];
}

/**
 * トークンに対する有効なパターンを取得
 */
function getTokenPatterns(
  token: string,
  nextToken: string | undefined,
  isLastToken: boolean
): string[] {
  if (token === 'ん') {
    return getNPatterns(nextToken, isLastToken);
  }
  
  if (token === 'っ') {
    return getSokuonPatterns(nextToken);
  }
  
  return ROMAJI_PATTERNS[token] || [token];
}

// ===== 状態管理 =====

/**
 * 初期状態を生成
 */
export function createInitialState(targetHiragana: string): TypingState {
  const tokens = tokenizeHiragana(targetHiragana);
  
  if (tokens.length === 0) {
    return {
      targetHiragana,
      tokens,
      currentTokenIndex: 0,
      currentInput: '',
      confirmedRomaji: '',
      validPatterns: [],
      isComplete: true,
      sokuonMode: null,
    };
  }
  
  const firstToken = tokens[0];
  const nextToken = tokens[1];
  const isLastToken = tokens.length === 1;
  
  const validPatterns = getTokenPatterns(firstToken, nextToken, isLastToken);
  
  return {
    targetHiragana,
    tokens,
    currentTokenIndex: 0,
    currentInput: '',
    confirmedRomaji: '',
    validPatterns,
    isComplete: false,
    sokuonMode: null,
  };
}

// ===== 入力処理 =====

/**
 * キー入力を処理
 * 
 * @param state 現在の状態
 * @param key 入力されたキー（小文字）
 * @returns 入力結果
 */
export function processKeyInput(state: TypingState, key: string): InputResult {
  // 完了済みの場合
  if (state.isComplete) {
    return {
      isValid: false,
      isTokenComplete: false,
      isWordComplete: true,
      isMiss: false,
      nextValidKeys: [],
      newState: state,
      acceptedRomaji: '',
    };
  }
  
  const normalizedKey = key.toLowerCase();
  const newInput = state.currentInput + normalizedKey;
  
  // 促音の子音重ねモード処理
  if (state.sokuonMode) {
    return processSokuonMode(state, normalizedKey);
  }
  
  // 現在のパターンで部分一致するものをフィルタ
  const matchingPatterns = state.validPatterns.filter(p => p.startsWith(newInput));
  
  // 完全一致があるか
  const exactMatch = matchingPatterns.find(p => p === newInput);
  
  // 部分一致のみ（入力継続中）
  if (matchingPatterns.length > 0 && !exactMatch) {
    return {
      isValid: true,
      isTokenComplete: false,
      isWordComplete: false,
      isMiss: false,
      nextValidKeys: getNextValidKeys(matchingPatterns, newInput.length),
      newState: {
        ...state,
        currentInput: newInput,
        validPatterns: matchingPatterns,
      },
      acceptedRomaji: normalizedKey,
    };
  }
  
  // 完全一致（トークン確定）
  if (exactMatch) {
    return completeToken(state, exactMatch);
  }
  
  // 促音の子音重ね開始チェック
  const currentToken = state.tokens[state.currentTokenIndex];
  if (currentToken === 'っ' && state.currentInput === '') {
    const nextToken = state.tokens[state.currentTokenIndex + 1];
    if (nextToken) {
      const nextPatterns = ROMAJI_PATTERNS[nextToken] || [];
      // 入力されたキーが次のトークンの先頭子音と一致するか
      const matchingNextPatterns = nextPatterns.filter(p => p.startsWith(normalizedKey));
      if (matchingNextPatterns.length > 0 && SOKUON_CONSONANTS.has(normalizedKey)) {
        // 子音重ねモードに入る
        return {
          isValid: true,
          isTokenComplete: false,
          isWordComplete: false,
          isMiss: false,
          nextValidKeys: [normalizedKey],
          newState: {
            ...state,
            sokuonMode: {
              consonant: normalizedKey,
              nextPatterns: matchingNextPatterns,
            },
          },
          acceptedRomaji: normalizedKey,
        };
      }
    }
  }
  
  // ミス
  return {
    isValid: false,
    isTokenComplete: false,
    isWordComplete: false,
    isMiss: true,
    nextValidKeys: getNextValidKeys(state.validPatterns, state.currentInput.length),
    newState: state,
    acceptedRomaji: '',
  };
}

/**
 * 促音の子音重ねモード処理
 */
function processSokuonMode(state: TypingState, key: string): InputResult {
  const sokuonMode = state.sokuonMode!;
  
  // 同じ子音が入力されたか
  if (key === sokuonMode.consonant) {
    // 促音を確定し、次のトークンの処理を開始
    const newTokenIndex = state.currentTokenIndex + 1;
    const nextToken = state.tokens[newTokenIndex];
    const nextNextToken = state.tokens[newTokenIndex + 1];
    const isLastToken = newTokenIndex === state.tokens.length - 1;
    
    // 次のトークンのパターン（子音重ね後なので、consonantで始まるもの）
    const validPatterns = sokuonMode.nextPatterns;
    
    return {
      isValid: true,
      isTokenComplete: true, // 促音が確定
      isWordComplete: false,
      isMiss: false,
      nextValidKeys: getNextValidKeys(validPatterns, 1),
      newState: {
        ...state,
        currentTokenIndex: newTokenIndex,
        currentInput: key,
        confirmedRomaji: state.confirmedRomaji + sokuonMode.consonant,
        validPatterns,
        sokuonMode: null,
      },
      acceptedRomaji: key,
    };
  }
  
  // 子音重ねを中断し、通常の促音入力に戻る
  const basePatterns = ROMAJI_PATTERNS['っ'] || [];
  const matchingPatterns = basePatterns.filter(p => p.startsWith(key));
  
  if (matchingPatterns.length > 0) {
    return {
      isValid: true,
      isTokenComplete: false,
      isWordComplete: false,
      isMiss: false,
      nextValidKeys: getNextValidKeys(matchingPatterns, 1),
      newState: {
        ...state,
        currentInput: key,
        validPatterns: matchingPatterns,
        sokuonMode: null,
      },
      acceptedRomaji: key,
    };
  }
  
  // ミス
  return {
    isValid: false,
    isTokenComplete: false,
    isWordComplete: false,
    isMiss: true,
    nextValidKeys: [sokuonMode.consonant],
    newState: state,
    acceptedRomaji: '',
  };
}

/**
 * トークンを確定して次へ進む
 */
function completeToken(state: TypingState, acceptedPattern: string): InputResult {
  const newTokenIndex = state.currentTokenIndex + 1;
  const isWordComplete = newTokenIndex >= state.tokens.length;
  
  if (isWordComplete) {
    return {
      isValid: true,
      isTokenComplete: true,
      isWordComplete: true,
      isMiss: false,
      nextValidKeys: [],
      newState: {
        ...state,
        currentTokenIndex: newTokenIndex,
        currentInput: '',
        confirmedRomaji: state.confirmedRomaji + acceptedPattern,
        validPatterns: [],
        isComplete: true,
        sokuonMode: null,
      },
      acceptedRomaji: acceptedPattern.slice(state.currentInput.length),
    };
  }
  
  // 次のトークンへ
  const nextToken = state.tokens[newTokenIndex];
  const nextNextToken = state.tokens[newTokenIndex + 1];
  const isLastToken = newTokenIndex === state.tokens.length - 1;
  
  const nextValidPatterns = getTokenPatterns(nextToken, nextNextToken, isLastToken);
  
  return {
    isValid: true,
    isTokenComplete: true,
    isWordComplete: false,
    isMiss: false,
    nextValidKeys: getNextValidKeys(nextValidPatterns, 0),
    newState: {
      ...state,
      currentTokenIndex: newTokenIndex,
      currentInput: '',
      confirmedRomaji: state.confirmedRomaji + acceptedPattern,
      validPatterns: nextValidPatterns,
      sokuonMode: null,
    },
    acceptedRomaji: acceptedPattern.slice(state.currentInput.length),
  };
}

// ===== ユーティリティ =====

/**
 * 次に入力可能なキーの一覧を取得
 */
function getNextValidKeys(patterns: string[], inputLength: number): string[] {
  const keys = new Set<string>();
  for (const pattern of patterns) {
    if (pattern.length > inputLength) {
      keys.add(pattern[inputLength]);
    }
  }
  return Array.from(keys);
}

/**
 * 現在の状態から次に入力可能なキーを取得
 */
export function getCurrentValidKeys(state: TypingState): string[] {
  if (state.isComplete) {
    return [];
  }
  
  if (state.sokuonMode) {
    return [state.sokuonMode.consonant];
  }
  
  return getNextValidKeys(state.validPatterns, state.currentInput.length);
}

/**
 * 表示用のローマ字ガイドを生成
 * 最も一般的なパターン（配列の最初の要素）を使用
 */
export function getDisplayRomaji(hiragana: string): string {
  const tokens = tokenizeHiragana(hiragana);
  return tokens.map((token, index) => {
    const isLastToken = index === tokens.length - 1;
    const nextToken = tokens[index + 1];
    
    if (token === 'ん') {
      // 「ん」は後続によって n か nn か決まる
      if (isLastToken || !nextToken) {
        return 'nn';
      }
      const nextPatterns = ROMAJI_PATTERNS[nextToken] || [];
      const nextFirstChars = new Set(nextPatterns.map(p => p[0]));
      for (const char of nextFirstChars) {
        if (N_REQUIRES_DOUBLE.has(char)) {
          return 'nn';
        }
      }
      return 'n';
    }
    
    if (token === 'っ') {
      // 促音は次の子音を重ねる形で表示
      if (nextToken) {
        const nextPatterns = ROMAJI_PATTERNS[nextToken] || [];
        if (nextPatterns.length > 0) {
          const firstChar = nextPatterns[0][0];
          if (SOKUON_CONSONANTS.has(firstChar)) {
            return firstChar;
          }
        }
      }
      return 'xtu';
    }
    
    const patterns = ROMAJI_PATTERNS[token];
    return patterns ? patterns[0] : token;
  }).join('');
}

/**
 * 進捗率を計算（0-100）
 */
export function calculateProgress(state: TypingState): number {
  if (state.tokens.length === 0) {
    return 100;
  }
  
  const tokenProgress = state.currentTokenIndex / state.tokens.length;
  const currentTokenPatterns = state.validPatterns;
  
  if (currentTokenPatterns.length === 0) {
    return tokenProgress * 100;
  }
  
  // 現在のトークン内の進捗
  const maxPatternLength = Math.max(...currentTokenPatterns.map(p => p.length));
  const inputProgress = state.currentInput.length / maxPatternLength;
  const withinTokenProgress = inputProgress / state.tokens.length;
  
  return (tokenProgress + withinTokenProgress) * 100;
}
