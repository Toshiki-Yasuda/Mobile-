import { useEffect, useRef, useState } from 'react';
import { useGameStore } from './stores/gameStore';
import { useProgressStore } from './stores/progressStore';
import { PasswordScreen } from './components/screens/PasswordScreen';
import { TitleScreen } from './components/screens/TitleScreen';
import { LevelSelectScreen } from './components/screens/LevelSelectScreen';
import { StageSelectScreen } from './components/screens/StageSelectScreen';
import { TypingScreen } from './components/screens/TypingScreen';
import { ResultScreen } from './components/screens/ResultScreen';
import { BossBattleContainer } from './components/boss/BossBattleContainer';
import { BossResultScreen } from './components/screens/BossResultScreen';
import { AdminScreen } from './components/screens/AdminScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { StatisticsScreen } from './components/screens/StatisticsScreen';
import { Loading } from './components/common/Loading';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { getWordsForStage } from './data/words';
import { ALL_BOSS_CHARACTERS } from './constants/bossConfigs';

/**
 * メインアプリケーションコンポーネント
 * 画面遷移の管理とグローバル状態の初期化を行う
 */
function App() {
  const { currentScreen, loading, error, clearError, selectedChapter, navigateTo } = useGameStore();
  const { markBossDefeated, updateStatistics, unlockChapter } = useProgressStore();
  const audioInitializedRef = useRef(false);

  // ボス結果を一時保存
  const [bossResult, setBossResult] = useState<{
    isVictory: boolean;
    rank: 'S+' | 'S' | 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D';
    correctCount: number;
    missCount: number;
    maxCombo: number;
    elapsedTime: number;
    rewards: any[];
  } | null>(null);

  // AudioContextを初期化するためのクリックハンドラー（一度だけ）
  useEffect(() => {
    const initializeAudio = async () => {
      if (audioInitializedRef.current) return;
      
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContext();
        if (ctx.state === 'suspended') {
          await ctx.resume();
        }
        // 無音の短い音を再生してAudioContextを有効化
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        oscillator.frequency.setValueAtTime(440, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.01);
        ctx.close();
        audioInitializedRef.current = true;
      } catch (error) {
        console.warn('AudioContext initialization failed:', error);
      }
    };

    const handleUserInteraction = () => {
      initializeAudio();
      // 一度初期化したらリスナーを削除
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };

    // ユーザーインタラクションを待つ
    document.addEventListener('click', handleUserInteraction, { once: true });
    document.addEventListener('keydown', handleUserInteraction, { once: true });
    document.addEventListener('touchstart', handleUserInteraction, { once: true });

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
  }, []);

  // エラー発生時の自動クリア（5秒後）
  useEffect(() => {
    if (error.hasError) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error.hasError, clearError]);

  // ローディング中の表示
  if (loading.isLoading) {
    return (
      <Loading 
        message={loading.loadingMessage} 
        progress={loading.progress} 
      />
    );
  }

  // ボス戦完了ハンドラー
  const handleBossBattleComplete = (result: {
    isVictory: boolean;
    rank: 'S+' | 'S' | 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D';
    correctCount: number;
    missCount: number;
    maxCombo: number;
    elapsedTime: number;
    rewards: any[];
  }) => {
    // ボス結果を保存
    setBossResult(result);

    if (result.isVictory) {
      // ボス撃破を記録
      const bossId = `boss_chapter${selectedChapter}`;
      markBossDefeated(bossId);

      // 統計情報を更新
      updateStatistics({
        totalPlays: 1,
        totalTypedChars: result.correctCount + result.missCount,
        totalCorrect: result.correctCount,
        totalMiss: result.missCount,
        totalPlayTime: result.elapsedTime * 1000,
      });

      // 次章をアンロック（最後の章以外）
      if (selectedChapter < 7) {
        unlockChapter(selectedChapter + 1);
      }
    }

    // 結果画面に遷移
    navigateTo('bossResult');
  };

  // 画面遷移
  const renderScreen = () => {
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
            onBattleComplete={handleBossBattleComplete}
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
        const boss = bossResult;
        const bossCharacter = ALL_BOSS_CHARACTERS[selectedChapter];
        const bossName = bossCharacter ? bossCharacter.name : `Chapter ${selectedChapter} Boss`;
        return (
          <BossResultScreen
            isVictory={boss.isVictory}
            rank={boss.rank}
            bossName={bossName}
            correctCount={boss.correctCount}
            missCount={boss.missCount}
            maxCombo={boss.maxCombo}
            elapsedTime={boss.elapsedTime}
            rewards={boss.rewards}
            onRetry={() => {
              setBossResult(null);
              useGameStore.getState().startBossBattle(selectedChapter);
            }}
            onContinue={() => {
              setBossResult(null);
              navigateTo('stageSelect');
            }}
          />
        );
      }
      case 'settings':
        return <SettingsScreen />;
      case 'statistics':
        return <StatisticsScreen />;
      case 'timeAttack':
        // TODO: TimeAttackScreen
        return <TypingScreen />;
      case 'freePlay':
        // TODO: FreePlayScreen
        return <TypingScreen />;
      case 'admin':
        return <AdminScreen />;
      default:
        return <TitleScreen />;
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        {/* エラー通知 */}
        {error.hasError && (
          <div className="fixed top-4 right-4 z-50 animate-slide-down">
            <div className="bg-error text-primary px-4 py-2 rounded-md border border-error/50">
              {error.errorMessage || 'エラーが発生しました'}
            </div>
          </div>
        )}
        
        {/* メイン画面 */}
        {renderScreen()}
      </div>
    </ErrorBoundary>
  );
}

export default App;
