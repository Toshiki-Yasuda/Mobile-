/**
 * タイピング状態管理フック
 * ユーザー入力、HP、キー演出状態を管理
 */

import { useState, useCallback } from 'react';
import {
  createInitialState,
  processKeyInput,
} from '@/engine/romajiEngine';
import type { TypingState } from '@/types/romaji';
import type { Word } from '@/types/game';
import { HP_CONFIG } from '@/constants/gameJuice';

export function useTypingState() {
  // タイプライターモード用の入力テキスト
  const [userInput, setUserInput] = useState('');

  // HPシステム
  const [currentHP, setCurrentHP] = useState(HP_CONFIG.maxHP);

  // この単語でミスがあったかどうか
  const [hadMissThisWord, setHadMissThisWord] = useState(false);

  // 最近押されたキーのリスト（光る演出用）
  const [recentPressedKeys, setRecentPressedKeys] = useState<
    { key: string; timestamp: number }[]
  >([]);

  // HPを増やす
  const recoverHP = useCallback((amount: number) => {
    setCurrentHP(prev => Math.min(HP_CONFIG.maxHP, prev + amount));
  }, []);

  // HPを減らす
  const damageHP = useCallback((amount: number) => {
    setCurrentHP(prev => Math.max(0, prev - amount));
  }, []);

  // HPを直接設定
  const setHP = useCallback((amount: number) => {
    setCurrentHP(Math.max(0, Math.min(HP_CONFIG.maxHP, amount)));
  }, []);

  // 単語状態をリセット
  const resetWordState = useCallback(() => {
    setUserInput('');
    setHadMissThisWord(false);
  }, []);

  // 押されたキーを光らせる（2秒かけてフェードアウト）
  const flashKey = useCallback((key: string) => {
    const now = Date.now();
    const keyLower = key.toLowerCase();

    // 同じキーが既にあれば削除してから追加（タイムスタンプを更新）
    setRecentPressedKeys(prev => {
      const filtered = prev.filter(k => k.key !== keyLower);
      return [...filtered, { key: keyLower, timestamp: now }];
    });

    // 2秒後にこのキーを削除
    setTimeout(() => {
      setRecentPressedKeys(prev =>
        prev.filter(k => k.timestamp !== now || k.key !== keyLower)
      );
    }, 2000);
  }, []);

  // 入力の正誤状態を計算（タイプライターモード用）
  const getInputStatus = useCallback((userInput: string, currentWord: Word | undefined) => {
    if (!currentWord) {
      return { chars: [], isPartiallyCorrect: true };
    }

    const chars: { char: string; isCorrect: boolean }[] = [];
    let state: TypingState = createInitialState(currentWord.hiragana);
    let isPartiallyCorrect = true;

    for (const char of userInput) {
      const result = processKeyInput(state, char.toLowerCase());

      if (result.isMiss || !result.isValid) {
        chars.push({ char, isCorrect: false });
        isPartiallyCorrect = false;
      } else {
        chars.push({ char, isCorrect: true });
        state = result.newState;
      }
    }

    return { chars, isPartiallyCorrect };
  }, []);

  return {
    userInput,
    setUserInput,
    currentHP,
    recoverHP,
    damageHP,
    setHP,
    hadMissThisWord,
    setHadMissThisWord,
    resetWordState,
    recentPressedKeys,
    flashKey,
    getInputStatus,
  };
}
