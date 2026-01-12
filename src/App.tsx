import { useEffect, useRef, useState } from 'react';
import { useGameStore } from './stores/gameStore';
import { PasswordScreen } from './components/screens/PasswordScreen';
import { TitleScreen } from './components/screens/TitleScreen';
import { LevelSelectScreen } from './components/screens/LevelSelectScreen';
import { StageSelectScreen } from './components/screens/StageSelectScreen';
import { TypingScreen } from './components/screens/TypingScreen';
import { ResultScreen } from './components/screens/ResultScreen';
import { AdminScreen } from './components/screens/AdminScreen';
import { SettingsScreen } from './components/screens/SettingsScreen';
import { StatisticsScreen } from './components/screens/StatisticsScreen';
import { Loading } from './components/common/Loading';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { SkipLink, LiveRegion } from './components/common/Accessibility';

const SCREEN_LABELS: Record<string, string> = {
  password: 'パスワード入力',
  title: 'タイトル',
  levelSelect: 'レベル選択',
  stageSelect: 'ステージ選択',
  typing: 'タイピング',
  result: '結果',
  settings: '設定',
  statistics: '統計',
  timeAttack: 'タイムアタック',
  freePlay: 'フリープレイ',
  admin: '管理者',
};

function App() {
  const { currentScreen, loading, error, clearError } = useGameStore();
  const audioInitializedRef = useRef(false);
  const mainRef = useRef<HTMLDivElement>(null);
  const [announcement, setAnnouncement] = useState('');
  const previousScreenRef = useRef<string | null>(null);

  useEffect(() => {
    const initializeAudio = async () => {
      if (audioInitializedRef.current) return;
      try {
        const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
        const ctx = new AudioContext();
        if (ctx.state === 'suspended') {
          await ctx.resume();
        }
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

  useEffect(() => {
    if (previousScreenRef.current !== currentScreen) {
      previousScreenRef.current = currentScreen;
      const screenLabel = SCREEN_LABELS[currentScreen] || currentScreen;
      setAnnouncement(screenLabel + '画面に移動しました');
      setTimeout(() => {
        if (mainRef.current) {
          mainRef.current.focus();
        }
      }, 100);
    }
  }, [currentScreen]);

  useEffect(() => {
    if (error.hasError) {
      setAnnouncement('エラー: ' + (error.errorMessage || 'エラーが発生しました'));
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error.hasError, error.errorMessage, clearError]);

  if (loading.isLoading) {
    return (
      <Loading
        message={loading.loadingMessage}
        progress={loading.progress}
      />
    );
  }

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

  const screenLabel = SCREEN_LABELS[currentScreen] || currentScreen;

  return (
    <ErrorBoundary>
      <SkipLink targetId="main-content">メインコンテンツへスキップ</SkipLink>
      <LiveRegion message={announcement} priority="polite" />

      <div
        className="min-h-screen bg-background"
        role="application"
        aria-label="HUNTER×HUNTER タイピングマスター"
      >
        {error.hasError && (
          <div
            className="fixed top-4 right-4 z-50 animate-slide-down"
            role="alert"
            aria-live="assertive"
          >
            <div className="bg-error text-primary px-4 py-2 rounded-md border border-error/50">
              <span className="sr-only">エラー: </span>
              {error.errorMessage || 'エラーが発生しました'}
              <button
                onClick={clearError}
                className="ml-4 text-white/80 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="エラーを閉じる"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <main
          id="main-content"
          ref={mainRef}
          tabIndex={-1}
          aria-label={screenLabel + '画面'}
          className="outline-none"
        >
          {renderScreen()}
        </main>
      </div>
    </ErrorBoundary>
  );
}

export default App;
