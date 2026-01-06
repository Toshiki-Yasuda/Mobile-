/**
 * タイピング画面 - 右サイドパネル（スコア情報）
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
    if (comboCount >= NEN_LEVEL_THRESHOLDS.HATSU) return '発（ハツ）';
    if (comboCount >= NEN_LEVEL_THRESHOLDS.REN) return '練（レン）';
    if (comboCount >= NEN_LEVEL_THRESHOLDS.ZETSU) return '絶（ゼツ）';
    if (comboCount >= NEN_LEVEL_THRESHOLDS.TEN) return '纏（テン）';
    return '修行中...';
  };

  return (
    <SidePanel position="right">
      {/* スコア */}
      <SidePanelSection borderBottom>
        <div className="text-hunter-gold/50 text-xs uppercase tracking-widest mb-2">
          Score
        </div>
        <div className="text-white text-4xl xl:text-5xl font-bold tracking-tight">
          {score.toLocaleString()}
        </div>
      </SidePanelSection>

      {/* コンボ */}
      <SidePanelSection borderBottom>
        <div className="text-hunter-gold/50 text-xs uppercase tracking-widest mb-2">
          Combo
        </div>
        <div className="flex items-end gap-2">
          <span
            className={`text-4xl xl:text-5xl font-bold ${
              combo >= 20
                ? 'text-hunter-gold nen-glow'
                : combo >= 10
                  ? 'text-hunter-gold'
                  : 'text-white'
            }`}
          >
            {combo}
          </span>
          {combo >= 10 && <span className="text-hunter-gold/60 text-sm mb-2">🔥</span>}
        </div>
        {maxCombo > 0 && (
          <div className="text-white/40 text-sm mt-2">最高: {maxCombo}</div>
        )}
      </SidePanelSection>

      {/* ミス */}
      <SidePanelSection borderBottom>
        <div className="text-hunter-gold/50 text-xs uppercase tracking-widest mb-2">
          Miss
        </div>
        <div
          className={`text-4xl xl:text-5xl font-bold ${
            missCount > 5
              ? 'text-error'
              : missCount > 0
                ? 'text-error/70'
                : 'text-white/40'
          }`}
        >
          {missCount}
        </div>
      </SidePanelSection>

      {/* 統計 */}
      <SidePanelSection title="Stats" className="flex-1">
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-white/50">正確率</span>
              <span className="text-white font-bold">{accuracy}%</span>
            </div>
            <div className="h-1.5 bg-hunter-dark rounded-full overflow-hidden">
              <div
                className="h-full bg-success transition-all"
                style={{ width: `${accuracy}%` }}
              />
            </div>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-white/50">正解数</span>
            <span className="text-success font-bold">{correctCount}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-white/50">タイプ数</span>
            <span className="text-white font-bold">{totalTyped}</span>
          </div>
        </div>
      </SidePanelSection>

      {/* 念オーラエフェクト */}
      <SidePanelSection borderTop>
        <div className="text-hunter-gold/50 text-xs uppercase tracking-widest mb-3">
          Nen Aura
        </div>
        <div className="relative h-24 rounded-lg overflow-hidden bg-hunter-dark">
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-hunter-gold/30 to-transparent"
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute bottom-0 left-0 right-0 bg-hunter-gold/50"
            animate={{ height: `${Math.min(combo * 5, 100)}%` }}
            transition={{ duration: 0.3 }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white/80 text-xs font-bold">
              {getNenLevel(combo)}
            </span>
          </div>
        </div>
      </SidePanelSection>
    </SidePanel>
  );
};

export default TypingRightPanel;

