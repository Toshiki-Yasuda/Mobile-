/**
 * 単語データのエクスポート
 */

import { chapter1Stages } from './chapter1';
import { chapter2Stages } from './chapter2';
import { chapter3Stages } from './chapter3';
import { chapter4Stages } from './chapter4';
import { chapter5Stages } from './chapter5';
import { chapter6Stages } from './chapter6';
import type { Word } from '@/types/game';

// 全チャプターのステージデータ
export const allStages: Record<string, Word[]> = {
  ...chapter1Stages,
  ...chapter2Stages,
  ...chapter3Stages,
  ...chapter4Stages,
  ...chapter5Stages,
  ...chapter6Stages,
};

// ステージIDから単語を取得
export function getWordsForStage(stageId: string): Word[] {
  return allStages[stageId] || [];
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
  const shuffled = [...eligibleWords].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export { chapter1Stages, chapter2Stages, chapter3Stages, chapter4Stages, chapter5Stages, chapter6Stages };
