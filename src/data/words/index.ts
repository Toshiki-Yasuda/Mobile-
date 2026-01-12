/**
 * 単語データのエクスポート
 */

import { chapter1Stages } from './chapter1';
import { chapter2Stages } from './chapter2';
import { chapter3Stages } from './chapter3';
import { chapter4Stages } from './chapter4';
import { chapter5Stages } from './chapter5';
import { chapter6Stages } from './chapter6';
import { chapter7Stages } from './chapter7';
import type { Word } from '@/types/game';
import { APP_CONFIG } from '@/constants/config';

// 全チャプターのステージデータ
export const allStages: Record<string, Word[]> = {
  ...chapter1Stages,
  ...chapter2Stages,
  ...chapter3Stages,
  ...chapter4Stages,
  ...chapter5Stages,
  ...chapter6Stages,
  ...chapter7Stages,
};

// 配列をシャッフル（Fisher-Yates）
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ステージIDから単語を取得（ランダムに選択）
export function getWordsForStage(stageId: string): Word[] {
  const wordPool = allStages[stageId] || [];
  if (wordPool.length === 0) return [];

  // 単語プールをシャッフルして、指定数を返す
  const shuffled = shuffleArray(wordPool);
  const count = Math.min(APP_CONFIG.WORDS_PER_STAGE, shuffled.length);
  return shuffled.slice(0, count);
}

// 全単語を取得（フリープレイ用）
export function getAllWords(): Word[] {
  return Object.values(allStages).flat();
}

// カテゴリ別に単語を取得
export function getWordsByCategory(category: string): Word[] {
  return getAllWords().filter(word => word.category === category);
}

// 難易度別に単語を取得
export function getWordsByDifficulty(difficulty: number): Word[] {
  return getAllWords().filter(word => word.difficulty <= difficulty);
}

// ランダムに単語を選択
export function getRandomWords(count: number, maxDifficulty: number = 5): Word[] {
  const eligibleWords = getWordsByDifficulty(maxDifficulty);
  const shuffled = shuffleArray(eligibleWords);
  return shuffled.slice(0, count);
}

export { chapter1Stages, chapter2Stages, chapter3Stages, chapter4Stages, chapter5Stages, chapter6Stages, chapter7Stages };
