/**
 * 結果計算フック
 * スコア、精度、WPM、ランク計算ロジック
 */

import { useMemo } from 'react';
import type { Rank } from '@/types/game';
import type { StageResult } from '@/types/progress';
import { CHAPTER_STAGE_COUNTS, type ResultData, type ScoreDiff } from './resultConstants';

/**
 * 精度とWPMに基づいてランクを計算
 */
export const calculateRank = (accuracy: number, wpm: number): Rank => {
  if (accuracy >= 98 && wpm >= 100) return 'S';
  if (accuracy >= 95 && wpm >= 80) return 'A';
  if (accuracy >= 90 && wpm >= 60) return 'B';
  return 'C';
};

/**
 * 数値の差分をフォーマット（+記号付き）
 */
export const formatDiff = (value: number, suffix = ''): string => {
  const prefix = value > 0 ? '+' : '';
  return `${prefix}${value}${suffix}`;
};

export interface UseResultCalculationProps {
  session: any; // ゲームセッション
  selectedChapter: number;
  selectedStage: number;
  previousResult: StageResult | null;
}

/**
 * 結果計算フック
 * セッションデータから各種計算結果を導出
 */
export function useResultCalculation({
  session,
  selectedChapter,
  selectedStage,
  previousResult,
}: UseResultCalculationProps) {
  // メイン結果計算
  const result = useMemo((): ResultData | null => {
    if (!session) return null;

    const totalTime = session.endTime ? session.endTime - (session.startTime || 0) : 0;
    const totalChars = session.correctCount + session.missCount;
    const accuracy = totalChars > 0 ? (session.correctCount / totalChars) * 100 : 0;
    const wpm = totalTime > 0 ? (session.correctCount / (totalTime / 60000)) : 0;

    return {
      score: session.score,
      accuracy: Math.round(accuracy * 10) / 10,
      wpm: Math.round(wpm),
      totalTime: Math.round(totalTime / 1000),
      maxCombo: session.maxCombo,
      correctCount: session.correctCount,
      missCount: session.missCount,
      rank: calculateRank(accuracy, wpm),
    };
  }, [session]);

  // 新記録判定
  const isNewRecord = useMemo(() => {
    if (!result) return false;
    return !previousResult || result.score > previousResult.score;
  }, [result, previousResult]);

  // スコア差分計算
  const scoreDiff = useMemo((): ScoreDiff | null => {
    if (!result || !previousResult) return null;

    return {
      score: result.score - previousResult.score,
      wpm: result.wpm - previousResult.wpm,
      accuracy: Math.round((result.accuracy - previousResult.accuracy) * 10) / 10,
    };
  }, [result, previousResult]);

  // 次ステージの存在判定
  const hasNextStage = useMemo(() => {
    return selectedStage < (CHAPTER_STAGE_COUNTS[selectedChapter] || 0);
  }, [selectedChapter, selectedStage]);

  return {
    result,
    isNewRecord,
    scoreDiff,
    hasNextStage,
    calculateRank,
    formatDiff,
  };
}
