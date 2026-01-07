import { useEffect, useRef } from 'react';
import { useGameStore } from './stores/gameStore';
import { PasswordScreen } from './components/screens/PasswordScreen';
import { TitleScreen } from './components/screens/TitleScreen';
import { LevelSelectScreen } from './components/screens/LevelSelectScreen';
import { StageSelectScreen } from './components/screens/StageSelectScreen';
import { TypingScreen } from './components/screens/TypingScreen';
import { ResultScreen } from './components/screens/ResultScreen';
import { AdminScreen } from './components/screens/AdminScreen';
import { Loading } from './components/common/Loading';
import { ErrorBoundary } from './components/common/ErrorBoundary';

/**
 * メインアプリケーションコンポーネント
 * 画面遷移の管理とグローバル状態の初期化を行う
 */
function App() {
  const { currentScreen, loading, error, clearError } = useGameStore();
  const audioInitializedRef = useRef(false);

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
      case 'settings':
        // TODO: SettingsScreen
        return <TitleScreen />;
      case 'statistics':
        // TODO: StatisticsScreen
        return <TitleScreen />;
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
