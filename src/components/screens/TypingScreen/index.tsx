/**
 * タイピング画面コンポーネント
 */

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTyping } from '@/hooks/useTyping';
import { APP_CONFIG } from '@/constants/config';
import { getWordsForStage } from '@/data/words';

export const TypingScreen: React.FC = () => {
  const { session, startSession, navigateTo, selectedChapter, selectedStage } = useGameStore();
  const { keyboardVisible, romajiGuideLevel } = useSettingsStore();
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
  } = useTyping();

  // AudioContextを初期化するためのクリックハンドラー
  useEffect(() => {
    const handleClick = async () => {
      // AudioContextを初期化するために、一度だけ音を鳴らす
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContext();
        if (ctx.state === 'suspended') {
          await ctx.resume();
        }
        // テスト音を鳴らしてAudioContextを有効化
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        oscillator.frequency.setValueAtTime(440, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.01, ctx.currentTime);
        oscillator.start();
        oscillator.stop(ctx.currentTime + 0.01);
        ctx.close();
      } catch (error) {
        console.warn('AudioContext initialization failed:', error);
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('click', handleClick, { once: true });
      return () => container.removeEventListener('click', handleClick);
    }
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
    }
  }, [session, startSession, selectedChapter, selectedStage, navigateTo]);

  // ローマ字の表示を生成
  const renderRomaji = () => {
    if (!typingState || romajiGuideLevel === 'none') return null;

    const confirmed = typingState.confirmedRomaji;
    const current = typingState.currentInput;
    const remaining = displayRomaji.slice(confirmed.length + current.length);

    return (
      <div className="text-2xl font-mono tracking-wider">
        <span className="text-success">{confirmed}</span>
        <span className="text-hunter-gold font-bold">{current}</span>
        <span className="text-white/40">{remaining}</span>
      </div>
    );
  };

  if (!session || !currentWord) {
    return (
      <div className="screen-container">
        <div className="text-hunter-gold">読み込み中...</div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="screen-container bg-hunter-dark">
      {/* ヘッダー */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-8">
        <button
          onClick={() => navigateTo('stageSelect')}
          className="text-hunter-gold/60 hover:text-hunter-gold transition"
        >
          ✕ やめる
        </button>

        <div className="flex gap-8 text-center">
          <div>
            <div className="text-hunter-gold/60 text-xs">スコア</div>
            <div className="text-white text-xl font-bold">{score}</div>
          </div>
          <div>
            <div className="text-hunter-gold/60 text-xs">コンボ</div>
            <div className={`text-xl font-bold ${combo >= 10 ? 'text-hunter-gold' : 'text-white'}`}>
              {combo}
            </div>
          </div>
          <div>
            <div className="text-hunter-gold/60 text-xs">ミス</div>
            <div className="text-error text-xl font-bold">{missCount}</div>
          </div>
        </div>
      </div>

      {/* プログレスバー */}
      <div className="w-full max-w-4xl mb-8">
        <div className="h-2 bg-hunter-dark-light rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-hunter-gold"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
        <div className="text-right text-hunter-gold/40 text-sm mt-1">
          {session.currentWordIndex + 1} / {session.words.length}
        </div>
      </div>

      {/* タイピングエリア */}
      <div className="typing-area w-full max-w-4xl text-center py-12">
        {/* コンボ表示 */}
        <AnimatePresence>
          {combo >= APP_CONFIG.COMBO_DISPLAY_THRESHOLD && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.5 }}
              className="text-hunter-gold text-lg mb-4"
            >
              🔥 {combo} COMBO!
            </motion.div>
          )}
        </AnimatePresence>

        {/* 表示テキスト */}
        <motion.div
          key={currentWord.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="text-5xl font-bold text-white mb-4">
            {currentWord.display}
          </div>
          <div className="text-2xl text-hunter-gold/80 mb-4">
            {currentWord.hiragana}
          </div>
        </motion.div>

        {/* ローマ字ガイド */}
        {renderRomaji()}
      </div>

      {/* キーボードガイド */}
      {keyboardVisible && (
        <div className="w-full max-w-4xl mt-8">
          <VirtualKeyboard activeKeys={validKeys} />
        </div>
      )}

      {/* 操作説明 */}
      <div className="text-hunter-gold/40 text-sm mt-8">
        ESCキーで中断
      </div>
    </div>
  );
};

// 仮想キーボードコンポーネント
const VirtualKeyboard: React.FC<{ activeKeys: string[] }> = ({ activeKeys }) => {
  const rows = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
  ];

  return (
    <div className="flex flex-col items-center gap-2">
      {rows.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className="flex gap-1"
          style={{ marginLeft: rowIndex * 20 }}
        >
          {row.map((key) => {
            const isActive = activeKeys.includes(key);
            return (
              <div
                key={key}
                className={isActive ? 'keyboard-key-highlight' : 'keyboard-key'}
              >
                {key.toUpperCase()}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default TypingScreen;
