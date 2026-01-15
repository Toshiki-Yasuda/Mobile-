/**
 * 結果画面定数
 * ランク設定とチャプター構成
 */

import type { Rank } from '@/types/game';
import { chapter1Stages, chapter2Stages } from '@/data/words';

// ===== 型定義 =====
export interface RankConfig {
  borderColor: string;
  bgColor: string;
  textColor: string;
  glowColor: string;
  message: string;
  subMessage: string;
}

export interface ScoreDiff {
  score: number;
  wpm: number;
  accuracy: number;
}

export interface StatCardProps {
  label: string;
  value: string;
  highlight?: boolean;
  diff?: number | null;
  diffSuffix?: string;
}

export interface ResultData {
  score: number;
  accuracy: number;
  wpm: number;
  totalTime: number;
  maxCombo: number;
  correctCount: number;
  missCount: number;
  rank: Rank;
}

// ===== 定数 =====
export const CHAPTER_STAGE_COUNTS: Record<number, number> = {
  1: Object.keys(chapter1Stages).length,
  2: Object.keys(chapter2Stages).length,
  3: 6,
  4: 6,
  5: 6,
  6: 6,
};

export const RANK_CONFIGS: Record<Rank, RankConfig> = {
  S: {
    borderColor: 'border-hunter-gold',
    bgColor: 'bg-hunter-gold/10',
    textColor: 'text-hunter-gold',
    glowColor: 'rgba(212,175,55,0.5)',
    message: 'PERFECT',
    subMessage: 'You are a true Hunter',
  },
  A: {
    borderColor: 'border-hunter-green',
    bgColor: 'bg-hunter-green/10',
    textColor: 'text-hunter-green',
    glowColor: 'rgba(45,90,39,0.5)',
    message: 'EXCELLENT',
    subMessage: 'Almost master level',
  },
  B: {
    borderColor: 'border-nen-transmutation',
    bgColor: 'bg-nen-transmutation/10',
    textColor: 'text-nen-transmutation',
    glowColor: 'rgba(78,205,196,0.5)',
    message: 'GOOD',
    subMessage: 'Keep training',
  },
  C: {
    borderColor: 'border-white/30',
    bgColor: 'bg-white/5',
    textColor: 'text-white',
    glowColor: 'rgba(255,255,255,0.2)',
    message: 'CLEAR',
    subMessage: 'Practice makes perfect',
  },
};
