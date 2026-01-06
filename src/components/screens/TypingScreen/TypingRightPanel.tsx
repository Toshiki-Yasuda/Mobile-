/**
 * タイピング画面 - 右サイドパネル（スコア情報）
 * クールデザイン
 */

import React from 'react';
import { motion } from 'framer-motion';
import { SidePanel, SidePanelSection } from '@/components/common/SidePanel';
import { APP_CONFIG } from '@/constants/config';

interface TypingRightPanelProps {
  score: number;
  combo: number;
  maxCombo: number;
  missCount: number;
  correctCount: number;
}

export const TypingRightPanel: React.FC<TypingRightPanelProps> = ({
  score,
  combo,
  maxCombo,
  missCount,
  correctCount,
}) => {
  const totalTyped = correctCount + missCount;
  const accuracy = totalTyped > 0 ? Math.round((correctCount / totalTyped) * 100) : 100;

  const getNenLevel = (comboCount: number): string => {
    const { NEN_LEVEL_THRESHOLDS } = APP_CONFIG;
    if (comboCount >= NEN_LEVEL_THRESHOLDS.HATSU) return 'HATSU';
    if (comboCount >= NEN_LEVEL_THRESHOLDS.REN) return 'REN';
    if (comboCount >= NEN_LEVEL_THRESHOLDS.ZETSU) return 'ZETSU';
    if (comboCount >= NEN_LEVEL_THRESHOLDS.TEN) return 'TEN';
    return 'TRAINING';
  };

  return (
    <SidePanel position="right">
      {/* スコア */}
      <SidePanelSection borderBottom>
        <div className="font-title text-hunter-gold/50 text-xs tracking-[0.3em] mb-2">SCORE</div>
        <div className="font-title text-white text-4xl xl:text-5xl font-bold tracking-tight">
          {score.toLocaleString()}
        </div>
      </SidePanelSection>

      {/* コンボ */}
      <SidePanelSection borderBottom>
        <div className="font-title text-hunter-gold/50 text-xs tracking-[0.3em] mb-2">COMBO</div>
        <div className="flex items-end gap-2">
          <span
            className={`font-title text-4xl xl:text-5xl font-bold ${
              combo >= 20 ? 'text-hunter-gold nen-glow' : combo >= 10 ? 'text-hunter-gold' : 'text-white'
            }`}
          >
            {combo}
          </span>
        </div>
        {maxCombo > 0 && (
          <div className="text-white/30 text-sm mt-2 font-title tracking-wider">MAX: {maxCombo}</div>
        )}
      </SidePanelSection>

      {/* ミス */}
      <SidePanelSection borderBottom>
        <div className="font-title text-hunter-gold/50 text-xs tracking-[0.3em] mb-2">MISS</div>
        <div
          className={`font-title text-4xl xl:text-5xl font-bold ${
            missCount > 5 ? 'text-error' : missCount > 0 ? 'text-error/60' : 'text-white/30'
          }`}
        >
          {missCount}
        </div>
      </SidePanelSection>

      {/* 統計 */}
      <SidePanelSection title="STATS" className="flex-1">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-white/40 font-title tracking-wider">ACCURACY</span>
              <span className="text-white font-bold font-title">{accuracy}%</span>
            </div>
            <div className="h-1 bg-hunter-dark rounded-full overflow-hidden">
              <div className="h-full bg-success transition-all" style={{ width: `${accuracy}%` }} />
            </div>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-white/40 font-title tracking-wider">CORRECT</span>
            <span className="text-success font-bold font-title">{correctCount}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-white/40 font-title tracking-wider">TYPED</span>
            <span className="text-white font-bold font-title">{totalTyped}</span>
          </div>
        </div>
      </SidePanelSection>

      {/* 念オーラ */}
      <SidePanelSection borderTop>
        <div className="font-title text-hunter-gold/50 text-xs tracking-[0.3em] mb-3">NEN AURA</div>
        <div className="relative h-20 rounded overflow-hidden bg-hunter-dark border border-hunter-gold/10">
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-hunter-gold/20 to-transparent"
            animate={{ opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <motion.div
            className="absolute bottom-0 left-0 right-0 bg-hunter-gold/40"
            animate={{ height: `${Math.min(combo * 5, 100)}%` }}
            transition={{ duration: 0.3 }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-title text-white/70 text-xs font-bold tracking-wider">
              {getNenLevel(combo)}
            </span>
          </div>
        </div>
      </SidePanelSection>
    </SidePanel>
  );
};

export default TypingRightPanel;
