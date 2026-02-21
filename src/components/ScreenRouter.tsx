/**
 * 画面ルーティングコンポーネント
 * currentScreen に応じて表示する画面を切り替える
 */

import React from 'react';
import { useGameStore } from '@/stores/gameStore';
import { useShallow } from 'zustand/react/shallow';
import { PasswordScreen } from '@/components/screens/PasswordScreen';
import { TitleScreen } from '@/components/screens/TitleScreen';
import { LevelSelectScreen } from '@/components/screens/LevelSelectScreen';
import { StageSelectScreen } from '@/components/screens/StageSelectScreen';
import { TypingScreen } from '@/components/screens/TypingScreen';
import { ResultScreen } from '@/components/screens/ResultScreen';
import { AdminScreen } from '@/components/screens/AdminScreen';
import { SettingsScreen } from '@/components/screens/SettingsScreen';
import { StatisticsScreen } from '@/components/screens/StatisticsScreen';
import { BossBattleContainer } from '@/components/boss/BossBattleContainer';
import { BossResultScreen } from '@/components/screens/BossResultScreen';
import { getWordsForStage } from '@/data/words';
import { ALL_BOSS_CHARACTERS } from '@/constants/bossConfigs';
import type { BossReward } from '@/types/boss';

interface ScreenRouterProps {
  bossResult: {
    isVictory: boolean;
    rank: 'S+' | 'S' | 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D';
    correctCount: number;
    missCount: number;
    maxCombo: number;
    elapsedTime: number;
    rewards: BossReward[];
  } | null;
  onBossBattleComplete: (result: {
    isVictory: boolean;
    rank: 'S+' | 'S' | 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D';
    correctCount: number;
    missCount: number;
    maxCombo: number;
    elapsedTime: number;
    rewards: BossReward[];
  }) => void;
  onBossResultContinue: () => void;
  onBossResultRetry: () => void;
}

export const ScreenRouter: React.FC<ScreenRouterProps> = ({
  bossResult,
  onBossBattleComplete,
  onBossResultContinue,
  onBossResultRetry,
}) => {
  const { currentScreen, selectedChapter } = useGameStore(
    useShallow((s) => ({
      currentScreen: s.currentScreen,
      selectedChapter: s.selectedChapter,
    }))
  );

  switch (currentScreen) {
    case 'password':
      return <PasswordScreen />;
    case 'title':
      return <TitleScreen />;
    case 'levelSelect':
      return <LevelSelectScreen />;
    case 'stageSelect':
      return <StageSelectScreen />;
    case 'typing':
      return <TypingScreen />;
    case 'result':
      return <ResultScreen />;
    case 'bossStage': {
      const stageId = `${selectedChapter}-6`;
      const words = getWordsForStage(stageId);
      return (
        <BossBattleContainer
          chapterId={selectedChapter}
          words={words}
          onBattleComplete={onBossBattleComplete}
          onExit={() => {
            useGameStore.getState().navigateTo('stageSelect');
          }}
        />
      );
    }
    case 'bossResult': {
      if (!bossResult) {
        return <div className="flex items-center justify-center h-screen">結果を読み込み中...</div>;
      }
      const bossCharacter = ALL_BOSS_CHARACTERS[selectedChapter];
      const bossName = bossCharacter ? bossCharacter.name : `Chapter ${selectedChapter} Boss`;
      return (
        <BossResultScreen
          isVictory={bossResult.isVictory}
          rank={bossResult.rank}
          bossName={bossName}
          correctCount={bossResult.correctCount}
          missCount={bossResult.missCount}
          maxCombo={bossResult.maxCombo}
          elapsedTime={bossResult.elapsedTime}
          rewards={bossResult.rewards}
          onRetry={bossResult.isVictory ? undefined : onBossResultRetry}
          onContinue={onBossResultContinue}
        />
      );
    }
    case 'settings':
      return <SettingsScreen />;
    case 'statistics':
      return <StatisticsScreen />;
    case 'timeAttack':
      return <TypingScreen />;
    case 'freePlay':
      return <TypingScreen />;
    case 'admin':
      return <AdminScreen />;
    default:
      return <TitleScreen />;
  }
};
