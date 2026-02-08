/**
 * タイピング画面コンポーネント
 * PC ワイド画面対応 - 3カラムレイアウト
 */

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTyping } from '@/hooks/useTyping';
import { useSound } from '@/hooks/useSound';
import { bgmManager } from '@/utils/bgmManager';
import { BackgroundEffect } from '@/components/common/BackgroundEffect';
import { VirtualKeyboard } from '@/components/common/VirtualKeyboard';
import { ScreenShake, ScreenFlash, ComboEffect } from '@/components/effects';
import { TypingLeftPanel } from './TypingLeftPanel';
import { TypingRightPanel } from './TypingRightPanel';
import { TypingCard } from './TypingCard';
import { getWordsForStage } from '@/data/words';

export const TypingScreen: React.FC = () => {
  const { session, startSession, navigateTo, selectedChapter, selectedStage } = useGameStore();
  const { keyboardVisible, romajiGuideLevel } = useSettingsStore();
  const { playStartSound } = useSound();
  const containerRef = useRef<HTMLDivElement>(null);
  const {
    currentWord,
    typingState,
    score,
    combo,
    missCount,
    progress,
    validKeys,
    displayRomaji,
    isTypewriterMode,
    userInput,
    inputStatus,
    explosionTrigger,
    isPerfect,
    recentPressedKeys,
    successShakeTrigger,
    currentHP,
    maxHP,
  } = useTyping();

  // タイピング画面ではBGM音量を下げる（GAME BGMのまま継続）
  useEffect(() => {
    bgmManager.lowerVolume(0.30);
    return () => {
      bgmManager.restoreVolume();
    };
  }, []);

  // セッション開始
  useEffect(() => {
    if (!session) {
      const stageId = `${selectedChapter}-${selectedStage}`;
      const words = getWordsForStage(stageId);
      
      if (words.length === 0) {
        console.error(`ステージ ${stageId} の単語データが見つかりません`);
        navigateTo('stageSelect');
        return;
      }

      startSession(words);
      setTimeout(() => {
        playStartSound();
      }, 200);
    }
  }, [session, startSession, selectedChapter, selectedStage, navigateTo, playStartSound]);

  // チャプター名を取得
  const getChapterName = (chapter: number): string => {
    const names: Record<number, string> = {
      1: '第1章 念の基礎',
      2: '第2章 纏',
      3: '第3章 絶',
      4: '第4章 練',
      5: '第5章 発',
      6: '第6章 応用',
    };
    return names[chapter] || `第${chapter}章`;
  };

  if (!session || !currentWord) {
    return (
      <div className="screen-container">
        <div className="text-hunter-gold">読み込み中...</div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="min-h-screen bg-hunter-dark relative overflow-hidden">
      <BackgroundEffect variant="typing" />

      {/* 画面フラッシュ（最上位レイヤー） */}
      <ScreenFlash
        successTrigger={successShakeTrigger}
        missTrigger={missCount}
        combo={combo}
      />

      {/* コンボマイルストーン演出 */}
      <ComboEffect combo={combo} />

      {/* メインコンテンツ - 3カラムレイアウト（ミス時・正解時にシェイク） */}
      <ScreenShake
        trigger={missCount}
        intensity="light"
        successTrigger={successShakeTrigger}
        combo={combo}
      >
        <div className="relative z-10 min-h-screen flex flex-col lg:flex-row">
          {/* 左サイドパネル */}
          <TypingLeftPanel
          onBack={() => navigateTo('stageSelect')}
          chapterName={getChapterName(selectedChapter)}
          stageName={`ステージ ${selectedStage}`}
          currentIndex={session.currentWordIndex}
          totalWords={session.words.length}
          progress={progress}
          words={session.words}
          currentHP={currentHP}
          maxHP={maxHP}
        />

        {/* 中央 - メインタイピングエリア */}
        <main className="flex-1 flex flex-col items-center justify-center p-4 lg:p-8">
          {/* モバイル用ヘッダー */}
          <MobileHeader
            score={score}
            combo={combo}
            onBack={() => navigateTo('stageSelect')}
          />

          {/* モバイル用プログレスバー */}
          <MobileProgressBar
            progress={progress}
            currentIndex={session.currentWordIndex}
            totalWords={session.words.length}
          />

          {/* タイピングカード */}
          <TypingCard
            currentWord={currentWord}
            typingState={typingState}
            displayRomaji={displayRomaji}
            romajiGuideLevel={romajiGuideLevel}
            combo={combo}
            isTypewriterMode={isTypewriterMode}
            userInput={userInput}
            inputStatus={inputStatus}
            explosionTrigger={explosionTrigger}
            isPerfect={isPerfect}
          />

          {/* キーボードガイド */}
          {keyboardVisible && (
            <div className="w-full max-w-2xl lg:max-w-4xl xl:max-w-5xl 2xl:max-w-6xl mt-8 lg:mt-10">
              <VirtualKeyboard 
                activeKeys={validKeys} 
                chapter={selectedChapter || 1}
                recentPressedKeys={recentPressedKeys}
              />
            </div>
          )}
        </main>

          {/* 右サイドパネル */}
          <TypingRightPanel
            score={score}
            combo={combo}
            maxCombo={session.maxCombo}
            missCount={missCount}
            correctCount={session.correctCount}
          />
        </div>
      </ScreenShake>
    </div>
  );
};

// モバイル用ヘッダー
const MobileHeader: React.FC<{
  score: number;
  combo: number;
  onBack: () => void;
}> = ({ score, combo, onBack }) => (
  <div className="w-full max-w-2xl flex justify-between items-center mb-6 lg:hidden">
    <button
      onClick={onBack}
      className="text-hunter-gold/60 hover:text-hunter-gold transition"
    >
      ✕ やめる
    </button>
    <div className="flex gap-6 text-center">
      <div>
        <div className="text-hunter-gold/60 text-xs">スコア</div>
        <div className="text-white font-bold">{score}</div>
      </div>
      <div>
        <div className="text-hunter-gold/60 text-xs">コンボ</div>
        <div className={`font-bold ${combo >= 10 ? 'text-hunter-gold' : 'text-white'}`}>
          {combo}
        </div>
      </div>
    </div>
  </div>
);

// モバイル用プログレスバー
const MobileProgressBar: React.FC<{
  progress: number;
  currentIndex: number;
  totalWords: number;
}> = ({ progress, currentIndex, totalWords }) => (
  <div className="w-full max-w-2xl mb-6 lg:hidden">
    <div className="h-1.5 bg-hunter-dark-light rounded-full overflow-hidden">
      <motion.div
        className="h-full bg-hunter-gold"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
      />
    </div>
    <div className="text-right text-hunter-gold/40 text-xs mt-1">
      {currentIndex + 1} / {totalWords}
    </div>
  </div>
);

export default TypingScreen;
