import { useCallback, useEffect, useRef, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { useGameStore } from './stores/gameStore';
import { useProgressStore } from './stores/progressStore';
import { useSettingsStore } from './stores/settingsStore';
import { useTheme } from './hooks/useTheme';
import { ScreenRouter } from './components/ScreenRouter';
import { Loading } from './components/common/Loading';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import type { BossReward } from './types/boss';

/**
 * メインアプリケーションコンポーネント
 * 画面遷移の管理とグローバル状態の初期化を行う
 */
function App() {
  // Theme initialization
  useTheme();

  const { loading, error, clearError, selectedChapter, navigateTo } = useGameStore(
    useShallow((s) => ({
      loading: s.loading,
      error: s.error,
      clearError: s.clearError,
      selectedChapter: s.selectedChapter,
      navigateTo: s.navigateTo,
    }))
  );
  const { markBossDefeated, updateStatistics, unlockChapter, cleanupOldData } = useProgressStore(
    useShallow((s) => ({
      markBossDefeated: s.markBossDefeated,
      updateStatistics: s.updateStatistics,
      unlockChapter: s.unlockChapter,
      cleanupOldData: s.cleanupOldData,
    }))
  );
  const enableHighContrast = useSettingsStore((s) => s.enableHighContrast);
  const audioInitializedRef = useRef(false);

  // ボス結果を一時保存
  const [bossResult, setBossResult] = useState<{
    isVictory: boolean;
    rank: 'S+' | 'S' | 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D';
    correctCount: number;
    missCount: number;
    maxCombo: number;
    elapsedTime: number;
    rewards: BossReward[];
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
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };

    document.addEventListener('click', handleUserInteraction, { once: true });
    document.addEventListener('keydown', handleUserInteraction, { once: true });
    document.addEventListener('touchstart', handleUserInteraction, { once: true });

    return () => {
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);
      document.removeEventListener('touchstart', handleUserInteraction);
    };
  }, []);

  // 起動時にlocalStorageの古いデータをクリーンアップ
  useEffect(() => {
    cleanupOldData();
  }, [cleanupOldData]);

  // ブラウザの戻るボタン対応
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      const screen = e.state?.screen;
      // タイピング中やボス戦中は戻れないようにガード
      const currentScreen = useGameStore.getState().currentScreen;
      if (currentScreen === 'typing' || currentScreen === 'bossStage') {
        // 戻るボタンを無効化（履歴を元に戻す）
        history.pushState({ screen: currentScreen }, '');
        return;
      }
      if (screen) {
        useGameStore.setState({ currentScreen: screen, previousScreen: currentScreen });
      } else {
        useGameStore.setState({ currentScreen: 'title', previousScreen: currentScreen });
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
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

  // ボス戦完了ハンドラー
  const handleBossBattleComplete = useCallback((result: {
    isVictory: boolean;
    rank: 'S+' | 'S' | 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D';
    correctCount: number;
    missCount: number;
    maxCombo: number;
    elapsedTime: number;
    rewards: BossReward[];
  }) => {
    setBossResult(result);

    if (result.isVictory) {
      const bossId = `boss_chapter${selectedChapter}`;
      markBossDefeated(bossId);

      updateStatistics({
        totalPlays: 1,
        totalTypedChars: result.correctCount + result.missCount,
        totalCorrect: result.correctCount,
        totalMiss: result.missCount,
        totalPlayTime: result.elapsedTime * 1000,
      });

      if (selectedChapter < 7) {
        unlockChapter(selectedChapter + 1);
      }
    }

    navigateTo('bossResult');
  }, [selectedChapter, markBossDefeated, updateStatistics, unlockChapter, navigateTo]);

  const handleBossResultContinue = useCallback(() => {
    setBossResult(null);
    navigateTo('stageSelect');
  }, [navigateTo]);

  const handleBossResultRetry = useCallback(() => {
    setBossResult(null);
    useGameStore.getState().startBossBattle(selectedChapter);
  }, [selectedChapter]);

  // ローディング中の表示
  if (loading.isLoading) {
    return (
      <Loading
        message={loading.loadingMessage}
        progress={loading.progress}
      />
    );
  }

  return (
    <ErrorBoundary>
      <div className={`min-h-screen bg-background ${enableHighContrast ? 'high-contrast-mode' : ''}`}>
        {/* エラー通知 */}
        {error.hasError && (
          <div className="fixed top-4 right-4 z-50 animate-slide-down">
            <div className="bg-error text-primary px-4 py-2 rounded-md border border-error/50">
              {error.errorMessage || 'エラーが発生しました'}
            </div>
          </div>
        )}

        {/* メイン画面 */}
        <ScreenRouter
          bossResult={bossResult}
          onBossBattleComplete={handleBossBattleComplete}
          onBossResultContinue={handleBossResultContinue}
          onBossResultRetry={handleBossResultRetry}
        />
      </div>
    </ErrorBoundary>
  );
}

export default App;
