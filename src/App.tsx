import { useEffect } from 'react';
import { useGameStore } from './stores/gameStore';
import { TitleScreen } from './components/screens/TitleScreen';
import { LevelSelectScreen } from './components/screens/LevelSelectScreen';
import { StageSelectScreen } from './components/screens/StageSelectScreen';
import { TypingScreen } from './components/screens/TypingScreen';
import { ResultScreen } from './components/screens/ResultScreen';
import { Loading } from './components/common/Loading';
import { ErrorBoundary } from './components/common/ErrorBoundary';

/**
 * メインアプリケーションコンポーネント
 * 画面遷移の管理とグローバル状態の初期化を行う
 */
function App() {
  const { currentScreen, loading, error, clearError } = useGameStore();

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
      default:
        return <TitleScreen />;
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-hunter-dark">
        {/* エラー通知 */}
        {error.hasError && (
          <div className="fixed top-4 right-4 z-50 animate-slide-down">
            <div className="bg-error text-white px-4 py-2 rounded-lg shadow-lg">
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
