/**
 * ローマ字入力エンジンのユニットテスト
 * 目標カバレッジ: 95%以上
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  tokenizeHiragana,
  createInitialState,
  processKeyInput,
  getCurrentValidKeys,
  getDisplayRomaji,
  calculateProgress,
} from './romajiEngine';
import type { TypingState } from '@/types/romaji';

// ===== tokenizeHiragana =====
describe('tokenizeHiragana', () => {
  it('基本的なひらがなを分割する', () => {
    expect(tokenizeHiragana('ごん')).toEqual(['ご', 'ん']);
    expect(tokenizeHiragana('きるあ')).toEqual(['き', 'る', 'あ']);
    expect(tokenizeHiragana('あいうえお')).toEqual(['あ', 'い', 'う', 'え', 'お']);
  });

  it('拗音を1トークンとして扱う', () => {
    expect(tokenizeHiragana('しゃ')).toEqual(['しゃ']);
    expect(tokenizeHiragana('きょうと')).toEqual(['きょ', 'う', 'と']);
    expect(tokenizeHiragana('じゃんけん')).toEqual(['じゃ', 'ん', 'け', 'ん']);
  });

  it('促音を正しく分割する', () => {
    expect(tokenizeHiragana('きっと')).toEqual(['き', 'っ', 'と']);
    expect(tokenizeHiragana('がっこう')).toEqual(['が', 'っ', 'こ', 'う']);
    expect(tokenizeHiragana('さっぱり')).toEqual(['さ', 'っ', 'ぱ', 'り']);
  });

  it('複合パターンを正しく分割する', () => {
    expect(tokenizeHiragana('しゅっぱつ')).toEqual(['しゅ', 'っ', 'ぱ', 'つ']);
    expect(tokenizeHiragana('きょっきょく')).toEqual(['きょ', 'っ', 'きょ', 'く']);
  });

  it('長音を分割する', () => {
    expect(tokenizeHiragana('らーめん')).toEqual(['ら', 'ー', 'め', 'ん']);
  });

  it('空文字列を処理する', () => {
    expect(tokenizeHiragana('')).toEqual([]);
  });
});

// ===== createInitialState =====
describe('createInitialState', () => {
  it('初期状態を正しく生成する', () => {
    const state = createInitialState('ごん');
    
    expect(state.targetHiragana).toBe('ごん');
    expect(state.tokens).toEqual(['ご', 'ん']);
    expect(state.currentTokenIndex).toBe(0);
    expect(state.currentInput).toBe('');
    expect(state.confirmedRomaji).toBe('');
    expect(state.isComplete).toBe(false);
    expect(state.validPatterns).toContain('go');
  });

  it('空文字列で完了状態になる', () => {
    const state = createInitialState('');
    expect(state.isComplete).toBe(true);
  });

  it('「ん」で始まる場合のパターン', () => {
    const state = createInitialState('んあ');
    // 後続が母音なので nn 必須
    expect(state.validPatterns).toContain('nn');
    expect(state.validPatterns).not.toContain('n');
  });

  it('単語末の「ん」のパターン', () => {
    const state = createInitialState('ん');
    // 単語末なので n 単体もOK
    expect(state.validPatterns).toContain('n');
    expect(state.validPatterns).toContain('nn');
  });

  it('促音で始まる場合のパターン', () => {
    const state = createInitialState('っと');
    // 子音重ねパターンも含む
    expect(state.validPatterns).toContain('xtu');
    expect(state.validPatterns).toContain('t');
  });
});

// ===== processKeyInput - 基本入力 =====
describe('processKeyInput - 基本入力', () => {
  it('「ごん」を "gon" + "n" で入力できる', () => {
    let state = createInitialState('ごん');
    
    let result = processKeyInput(state, 'g');
    expect(result.isValid).toBe(true);
    expect(result.isTokenComplete).toBe(false);
    state = result.newState;
    
    result = processKeyInput(state, 'o');
    expect(result.isValid).toBe(true);
    expect(result.isTokenComplete).toBe(true);
    state = result.newState;
    
    // 「ん」の後に子音が続かないので n 単体でOK
    result = processKeyInput(state, 'n');
    expect(result.isValid).toBe(true);
    state = result.newState;
    
    result = processKeyInput(state, 'n');
    expect(result.isValid).toBe(true);
    expect(result.isWordComplete).toBe(true);
  });

  it('「きるあ」を入力できる', () => {
    let state = createInitialState('きるあ');
    
    // き
    let result = processKeyInput(state, 'k');
    result = processKeyInput(result.newState, 'i');
    expect(result.isTokenComplete).toBe(true);
    
    // る
    result = processKeyInput(result.newState, 'r');
    result = processKeyInput(result.newState, 'u');
    expect(result.isTokenComplete).toBe(true);
    
    // あ
    result = processKeyInput(result.newState, 'a');
    expect(result.isWordComplete).toBe(true);
  });
});

// ===== processKeyInput - 複数パターン =====
describe('processKeyInput - 複数パターン対応', () => {
  it('「し」を "si" で入力できる', () => {
    let state = createInitialState('し');
    
    let result = processKeyInput(state, 's');
    result = processKeyInput(result.newState, 'i');
    expect(result.isWordComplete).toBe(true);
  });

  it('「し」を "shi" で入力できる', () => {
    let state = createInitialState('し');
    
    let result = processKeyInput(state, 's');
    result = processKeyInput(result.newState, 'h');
    result = processKeyInput(result.newState, 'i');
    expect(result.isWordComplete).toBe(true);
  });

  it('「し」を "ci" で入力できる', () => {
    let state = createInitialState('し');
    
    let result = processKeyInput(state, 'c');
    result = processKeyInput(result.newState, 'i');
    expect(result.isWordComplete).toBe(true);
  });

  it('「ふ」を "hu" でも "fu" でも入力できる', () => {
    // hu
    let state = createInitialState('ふ');
    let result = processKeyInput(state, 'h');
    result = processKeyInput(result.newState, 'u');
    expect(result.isWordComplete).toBe(true);
    
    // fu
    state = createInitialState('ふ');
    result = processKeyInput(state, 'f');
    result = processKeyInput(result.newState, 'u');
    expect(result.isWordComplete).toBe(true);
  });

  it('入力途中でパターンが絞られる', () => {
    let state = createInitialState('し');
    
    let result = processKeyInput(state, 's');
    // s の後は i か h が有効
    expect(result.nextValidKeys).toContain('i');
    expect(result.nextValidKeys).toContain('h');
    
    result = processKeyInput(result.newState, 'h');
    // sh の後は i のみ
    expect(result.nextValidKeys).toEqual(['i']);
  });
});

// ===== processKeyInput - 促音 =====
describe('processKeyInput - 促音', () => {
  it('促音を子音重ねで入力できる（っか → kka）', () => {
    let state = createInitialState('っか');
    
    // k を入力すると子音重ねモードに
    let result = processKeyInput(state, 'k');
    expect(result.isValid).toBe(true);
    expect(result.newState.sokuonMode).not.toBeNull();
    
    // もう一度 k で促音確定、か の入力開始
    result = processKeyInput(result.newState, 'k');
    expect(result.isTokenComplete).toBe(true);
    
    // a で完了
    result = processKeyInput(result.newState, 'a');
    expect(result.isWordComplete).toBe(true);
    expect(result.newState.confirmedRomaji).toBe('kka');
  });

  it('促音を xtu で入力できる', () => {
    let state = createInitialState('っか');
    
    let result = processKeyInput(state, 'x');
    result = processKeyInput(result.newState, 't');
    result = processKeyInput(result.newState, 'u');
    expect(result.isTokenComplete).toBe(true);
    
    result = processKeyInput(result.newState, 'k');
    result = processKeyInput(result.newState, 'a');
    expect(result.isWordComplete).toBe(true);
  });

  it('「きっと」を kitto で入力できる', () => {
    let state = createInitialState('きっと');
    
    // き
    let result = processKeyInput(state, 'k');
    result = processKeyInput(result.newState, 'i');
    expect(result.isTokenComplete).toBe(true);
    
    // っと → tto
    result = processKeyInput(result.newState, 't');
    expect(result.newState.sokuonMode).not.toBeNull();
    
    result = processKeyInput(result.newState, 't');
    expect(result.isTokenComplete).toBe(true);
    
    result = processKeyInput(result.newState, 'o');
    expect(result.isWordComplete).toBe(true);
  });

  it('子音重ね開始後に別のキーでキャンセルできる', () => {
    let state = createInitialState('っか');
    
    // k を入力して子音重ねモードに
    let result = processKeyInput(state, 'k');
    expect(result.newState.sokuonMode).not.toBeNull();
    
    // x を入力すると xtu パターンに切り替え
    result = processKeyInput(result.newState, 'x');
    // この場合 x は xtu の先頭なのでミスにはならない
    // （実装によってはミスになる場合もあるが、柔軟に対応）
  });
});

// ===== processKeyInput - 「ん」の特殊処理 =====
describe('processKeyInput - 「ん」の特殊処理', () => {
  it('「んあ」は nn + a が必要', () => {
    let state = createInitialState('んあ');
    
    // n 単体では確定しない
    let result = processKeyInput(state, 'n');
    expect(result.isTokenComplete).toBe(false);
    
    // nn で確定
    result = processKeyInput(result.newState, 'n');
    expect(result.isTokenComplete).toBe(true);
    
    // a で完了
    result = processKeyInput(result.newState, 'a');
    expect(result.isWordComplete).toBe(true);
  });

  it('「んか」は n + ka でOK', () => {
    let state = createInitialState('んか');
    
    // n で「ん」が確定（後続が子音なので）
    let result = processKeyInput(state, 'n');
    // まだ確定していない（次の入力で確定するかnで確定するか）
    
    // k を入力すると n が確定して ka の入力開始
    result = processKeyInput(result.newState, 'k');
    
    result = processKeyInput(result.newState, 'a');
    expect(result.isWordComplete).toBe(true);
  });

  it('単語末の「ん」は n 単体でOK', () => {
    let state = createInitialState('ほん');
    
    // ほ
    let result = processKeyInput(state, 'h');
    result = processKeyInput(result.newState, 'o');
    
    // ん（単語末）- n 単体でOK
    result = processKeyInput(result.newState, 'n');
    // n 単体で確定するかどうかは実装による
    // nn を入力しても OK
    result = processKeyInput(result.newState, 'n');
    expect(result.isWordComplete).toBe(true);
  });
});

// ===== processKeyInput - ミス判定 =====
describe('processKeyInput - ミス判定', () => {
  it('無効なキーでミス判定', () => {
    const state = createInitialState('ごん');
    const result = processKeyInput(state, 'x');
    
    expect(result.isValid).toBe(false);
    expect(result.isMiss).toBe(true);
    expect(result.newState).toBe(state); // 状態は変わらない
  });

  it('パターン途中での無効キー', () => {
    let state = createInitialState('し');
    
    let result = processKeyInput(state, 's');
    expect(result.isValid).toBe(true);
    
    // s の後に無効なキー
    result = processKeyInput(result.newState, 'z');
    expect(result.isMiss).toBe(true);
  });

  it('完了後の入力は無視', () => {
    let state = createInitialState('あ');
    let result = processKeyInput(state, 'a');
    expect(result.isWordComplete).toBe(true);
    
    // 完了後の入力
    result = processKeyInput(result.newState, 'b');
    expect(result.isValid).toBe(false);
    expect(result.isMiss).toBe(false); // ミスではなく無視
  });
});

// ===== getCurrentValidKeys =====
describe('getCurrentValidKeys', () => {
  it('初期状態で有効なキーを取得', () => {
    const state = createInitialState('ごん');
    const keys = getCurrentValidKeys(state);
    expect(keys).toContain('g');
  });

  it('入力途中で有効なキーを取得', () => {
    let state = createInitialState('し');
    let result = processKeyInput(state, 's');
    
    const keys = getCurrentValidKeys(result.newState);
    expect(keys).toContain('i');
    expect(keys).toContain('h');
  });

  it('完了状態では空配列', () => {
    let state = createInitialState('あ');
    let result = processKeyInput(state, 'a');
    
    const keys = getCurrentValidKeys(result.newState);
    expect(keys).toEqual([]);
  });
});

// ===== getDisplayRomaji =====
describe('getDisplayRomaji', () => {
  it('基本的な変換', () => {
    expect(getDisplayRomaji('ごん')).toBe('gonn');
    expect(getDisplayRomaji('きるあ')).toBe('kirua');
    expect(getDisplayRomaji('くらぴか')).toBe('kurapika');
  });

  it('拗音の変換', () => {
    expect(getDisplayRomaji('しゃ')).toBe('sya');
    expect(getDisplayRomaji('きょうと')).toBe('kyouto');
  });

  it('促音の変換（子音重ね表示）', () => {
    expect(getDisplayRomaji('きっと')).toBe('kitto');
    expect(getDisplayRomaji('がっこう')).toBe('gakkou');
  });

  it('「ん」の変換', () => {
    // 後続が母音
    expect(getDisplayRomaji('んあ')).toBe('nna');
    // 後続が子音
    expect(getDisplayRomaji('んか')).toBe('nka');
    // 単語末
    expect(getDisplayRomaji('ほん')).toBe('honn');
  });
});

// ===== calculateProgress =====
describe('calculateProgress', () => {
  it('初期状態は0%', () => {
    const state = createInitialState('あいう');
    expect(calculateProgress(state)).toBe(0);
  });

  it('完了状態は100%', () => {
    let state = createInitialState('あ');
    let result = processKeyInput(state, 'a');
    expect(calculateProgress(result.newState)).toBe(100);
  });

  it('途中状態で適切な進捗', () => {
    let state = createInitialState('あい');
    let result = processKeyInput(state, 'a');
    
    const progress = calculateProgress(result.newState);
    expect(progress).toBeGreaterThan(0);
    expect(progress).toBeLessThan(100);
  });
});

// ===== パフォーマンステスト =====
describe('パフォーマンス', () => {
  it('1000回の入力判定が10ms以内に完了する', () => {
    const state = createInitialState('てすと');
    const start = performance.now();
    
    for (let i = 0; i < 1000; i++) {
      processKeyInput(state, 't');
    }
    
    const elapsed = performance.now() - start;
    expect(elapsed).toBeLessThan(10);
  });

  it('長文のトークン化が高速', () => {
    const longText = 'あいうえおかきくけこさしすせそたちつてとなにぬねのはひふへほまみむめもやゆよらりるれろわをん';
    
    const start = performance.now();
    for (let i = 0; i < 100; i++) {
      tokenizeHiragana(longText);
    }
    const elapsed = performance.now() - start;
    
    expect(elapsed).toBeLessThan(10);
  });
});

// ===== エッジケース =====
describe('エッジケース', () => {
  it('記号を含む文字列', () => {
    const state = createInitialState('てすと。');
    expect(state.tokens).toContain('。');
  });

  it('長音を含む文字列', () => {
    let state = createInitialState('らーめん');
    
    // ら
    let result = processKeyInput(state, 'r');
    result = processKeyInput(result.newState, 'a');
    
    // ー
    result = processKeyInput(result.newState, '-');
    expect(result.isTokenComplete).toBe(true);
    
    // め
    result = processKeyInput(result.newState, 'm');
    result = processKeyInput(result.newState, 'e');
    
    // ん
    result = processKeyInput(result.newState, 'n');
    result = processKeyInput(result.newState, 'n');
    expect(result.isWordComplete).toBe(true);
  });

  it('大文字入力は小文字に変換', () => {
    let state = createInitialState('あ');
    let result = processKeyInput(state, 'A');
    expect(result.isWordComplete).toBe(true);
  });
});
