import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from './stores/gameStore';
import { useProgressStore } from './stores/progressStore';
import { useSettingsStore } from './stores/settingsStore';
import { useTheme } from './hooks/useTheme';
import { PasswordScreen } from './components/screens/PasswordScreen';
import { TitleScreen } from './components/screens/TitleScreen';
import { LevelSelectScreen } from './components/screens/LevelSelectScreen';
import { StageSelectScreen } from './components/screens/StageSelectScreen';
import { TypingScreen } from './components/screens/TypingScreen';
import { ResultScreen } from './components/screens/ResultScreen';
import { BossBattleContainer } from './components/boss/BossBattleContainer';
import { BossResultScreen } from './components/screens/BossResultScreen';
import { Loading } from './components/common/Loading';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { getWordsForStage } from './data/words';
import { ALL_BOSS_CHARACTERS } from './constants/bossConfigs';
import { initializeAudioContext } from './utils/audioInitializer';
import type { BossReward } from './types/boss';

// 遅延読み込み（低頻度画面）
const AdminScreen = lazy(() => import('./components/screens/AdminScreen').then(m => ({ default: m.AdminScreen })));
const SettingsScreen = lazy(() => import('./components/screens/SettingsScreen').then(m => ({ default: m.SettingsScreen })));
const StatisticsScreen = lazy(() => import('./components/screens/StatisticsScreen').then(m => ({ default: m.StatisticsScreen })));

/**
 * メインアプリケーションコンポーネント
 * 画面遷移の管理とグローバル状態の初期化を行う
 */
function App() {
  // Theme initialization
  useTheme();

  const { currentScreen, loading, error, clearError, selectedChapter, navigateTo } = useGameStore();
  const { markBossDefeated, updateStatistics, unlockChapter, cleanupOldData } = useProgressStore();
  const { enableHighContrast } = useSettingsStore();
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
    const handleUserInteraction = async () => {
      if (audioInitializedRef.current) return;

      await initializeAudioContext();
      audioInitializedRef.current = true;
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
    rewards: BossReward[];
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
            onRetry={boss.isVictory ? undefined : () => {
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
        return <Suspense fallback={<Loading message="設定を読み込み中..." />}><SettingsScreen /></Suspense>;
      case 'statistics':
        return <Suspense fallback={<Loading message="統計を読み込み中..." />}><StatisticsScreen /></Suspense>;
      case 'timeAttack':
      case 'freePlay':
        return (
          <div className="min-h-screen bg-gradient-to-br from-hunter-dark via-[#0a0a12] to-hunter-dark flex items-center justify-center p-6">
            <div className="text-center max-w-md">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="bg-hunter-dark-light/50 border-2 border-hunter-gold/30 rounded-lg p-8 backdrop-blur-sm"
              >
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="text-6xl mb-6"
                >
                  🚧
                </motion.div>
                <h2 className="font-title text-3xl text-hunter-gold mb-4 tracking-wider">
                  COMING SOON
                </h2>
                <p className="text-white/70 mb-8 leading-relaxed">
                  {currentScreen === 'timeAttack' ? 'タイムアタックモード' : 'フリープレイモード'}は準備中です
                </p>
                <motion.button
                  onClick={() => navigateTo('title')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-hunter-green hover:bg-hunter-green-light text-white font-title py-3 px-8 rounded-lg transition-colors border border-hunter-green-light/30 uppercase tracking-wider"
                >
                  ← タイトルに戻る
                </motion.button>
              </motion.div>
            </div>
          </div>
        );
      case 'admin':
        return <Suspense fallback={<Loading message="管理画面を読み込み中..." />}><AdminScreen /></Suspense>;
      default:
        return <TitleScreen />;
    }
  };

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
        {renderScreen()}
      </div>
    </ErrorBoundary>
  );
}

export default App;
