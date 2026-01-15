/**
 * 単語データのエクスポート
 * 初期ロード: chapter1-4
 * 遅延ロード: chapter5-7（バンドルサイズ最適化）
 */

import { chapter1Stages } from './chapter1';
import { chapter2Stages } from './chapter2';
import { chapter3Stages } from './chapter3';
import { chapter4Stages } from './chapter4';
import type { Word } from '@/types/game';
import { APP_CONFIG } from '@/constants/config';

// キャッシュ: 遅延ロードされたチャプターデータ
const chapterCache = new Map<number, Record<string, Word[]>>();

// 初期段階のステージデータ（chapter1-4）
const initialStages: Record<string, Word[]> = {
  ...chapter1Stages,
  ...chapter2Stages,
  ...chapter3Stages,
  ...chapter4Stages,
};

// すべてのステージデータを取得（遅延ロード対応）
async function loadAllStages(): Promise<Record<string, Word[]>> {
  const result = { ...initialStages };

  // 既にキャッシュされていれば使用
  if (chapterCache.has(5)) {
    Object.assign(result, chapterCache.get(5)!);
  } else {
    const ch5 = (await import('./chapter5')).chapter5Stages;
    chapterCache.set(5, ch5);
    Object.assign(result, ch5);
  }

  if (chapterCache.has(6)) {
    Object.assign(result, chapterCache.get(6)!);
  } else {
    const ch6 = (await import('./chapter6')).chapter6Stages;
    chapterCache.set(6, ch6);
    Object.assign(result, ch6);
  }

  if (chapterCache.has(7)) {
    Object.assign(result, chapterCache.get(7)!);
  } else {
    const ch7 = (await import('./chapter7')).chapter7Stages;
    chapterCache.set(7, ch7);
    Object.assign(result, ch7);
  }

  return result;
}

// 配列をシャッフル（Fisher-Yates）
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// ステージIDから単語を取得（同期版）
// 注: chapter1-4は即座に取得可能、chapter5-7は事前ロード必須
export function getWordsForStage(stageId: string): Word[] {
  const chapterNum = parseInt(stageId.split('-')[0]);

  // chapter5-7がキャッシュされているかチェック
  if (chapterNum >= 5) {
    const cachedData = chapterCache.get(chapterNum);
    if (!cachedData) {
      console.warn(`Chapter ${chapterNum} not preloaded. Call preloadLateChapters() first.`);
      return [];
    }
    const wordPool = cachedData[stageId] || [];
    if (wordPool.length === 0) return [];

    const shuffled = shuffleArray(wordPool);
    const count = Math.min(APP_CONFIG.WORDS_PER_STAGE, shuffled.length);
    return shuffled.slice(0, count);
  }

  // chapter1-4は初期ロード済み
  const wordPool = initialStages[stageId] || [];
  if (wordPool.length === 0) return [];

  const shuffled = shuffleArray(wordPool);
  const count = Math.min(APP_CONFIG.WORDS_PER_STAGE, shuffled.length);
  return shuffled.slice(0, count);
}

// chapter5-7の事前ロード（設定画面やLevelSelectで呼び出す）
export async function preloadLateChapters(): Promise<void> {
  if (!chapterCache.has(5)) {
    const ch5 = (await import('./chapter5')).chapter5Stages;
    chapterCache.set(5, ch5);
  }
  if (!chapterCache.has(6)) {
    const ch6 = (await import('./chapter6')).chapter6Stages;
    chapterCache.set(6, ch6);
  }
  if (!chapterCache.has(7)) {
    const ch7 = (await import('./chapter7')).chapter7Stages;
    chapterCache.set(7, ch7);
  }
}

// 全単語を取得（フリープレイ用）
// 注: chapter5-7を含める場合は事前にpreloadLateChapters()を呼び出してください
export async function getAllWords(): Promise<Word[]> {
  const allStages = await loadAllStages();
  return Object.values(allStages).flat();
}

// カテゴリ別に単語を取得
export async function getWordsByCategory(category: string): Promise<Word[]> {
  const words = await getAllWords();
  return words.filter(word => word.category === category);
}

// 難易度別に単語を取得
export async function getWordsByDifficulty(difficulty: number): Promise<Word[]> {
  const words = await getAllWords();
  return words.filter(word => word.difficulty <= difficulty);
}

// ランダムに単語を選択
export async function getRandomWords(count: number, maxDifficulty: number = 5): Promise<Word[]> {
  const eligibleWords = await getWordsByDifficulty(maxDifficulty);
  const shuffled = shuffleArray(eligibleWords);
  return shuffled.slice(0, count);
}

// 初期段階用エクスポート（chapter1-4）
export { chapter1Stages, chapter2Stages, chapter3Stages, chapter4Stages };
