/**
 * タイピング状態管理フック
 * HP、ユーザー入力、キー演出状態を管理
 */

import { useState, useCallback } from 'react';
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

  // HPを回復
  const recoverHP = useCallback((amount: number) => {
    setCurrentHP(prev => Math.min(HP_CONFIG.maxHP, prev + amount));
  }, []);

  // HPを減らし、新しいHP値を返す
  const damageHP = useCallback((amount: number): number => {
    let newHP = 0;
    setCurrentHP(prev => {
      newHP = Math.max(0, prev - amount);
      return newHP;
    });
    return newHP;
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

    setRecentPressedKeys(prev => {
      const filtered = prev.filter(k => k.key !== keyLower);
      return [...filtered, { key: keyLower, timestamp: now }];
    });

    setTimeout(() => {
      setRecentPressedKeys(prev =>
        prev.filter(k => k.timestamp !== now || k.key !== keyLower)
      );
    }, 2000);
  }, []);

  return {
    userInput,
    setUserInput,
    currentHP,
    maxHP: HP_CONFIG.maxHP,
    recoverHP,
    damageHP,
    hadMissThisWord,
    setHadMissThisWord,
    resetWordState,
    recentPressedKeys,
    flashKey,
  };
}
