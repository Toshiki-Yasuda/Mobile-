/**
 * タイピング画面 - 右サイドパネル（スコア情報）
 * クールデザイン
 */

import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SidePanel, SidePanelSection } from '@/components/common/SidePanel';
import { NenAura } from '@/components/effects';
import { APP_CONFIG } from '@/constants/config';
import { getNenLevel } from '@/constants/gameJuice';
import { comboCounterVariants } from '@/utils/animations';

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
  const prevComboRef = useRef(combo);

  // 念レベルを取得
  const nenLevel = getNenLevel(combo);

  // コンボが増えたかどうか
  const comboIncreased = combo > prevComboRef.current;

  useEffect(() => {
    prevComboRef.current = combo;
  }, [combo]);

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
        <div className="flex items-end gap-3">
          <motion.span
            key={combo}
            variants={comboCounterVariants}
            initial="initial"
            animate={comboIncreased ? "increment" : "initial"}
            className={`font-title text-4xl xl:text-5xl font-bold ${nenLevel.color}`}
            style={combo >= 10 ? { textShadow: '0 0 15px currentColor' } : {}}
          >
            {combo}
          </motion.span>
          {combo >= 5 && (
            <motion.span
              key={nenLevel.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`font-title text-sm ${nenLevel.color} opacity-80`}
            >
              {nenLevel.name}
            </motion.span>
          )}
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
        <NenAura combo={combo} className="h-20" />
      </SidePanelSection>
    </SidePanel>
  );
};

export default TypingRightPanel;
