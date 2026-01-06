/**
 * タイピング画面コンポーネント
 */

import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useTyping } from '@/hooks/useTyping';
import { useSound } from '@/hooks/useSound';
import { useButtonClick } from '@/utils/soundUtils';
import { APP_CONFIG } from '@/constants/config';
import { getWordsForStage } from '@/data/words';

export const TypingScreen: React.FC = () => {
  const { session, startSession, navigateTo, selectedChapter, selectedStage } = useGameStore();
  const { keyboardVisible, romajiGuideLevel } = useSettingsStore();
  const { playStartSound } = useSound();
  const { handleClick } = useButtonClick();
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
      // ゲーム開始音を再生（AudioContextが確実に初期化されるように少し遅延）
      setTimeout(() => {
        playStartSound();
      }, 200);
    }
  }, [session, startSession, selectedChapter, selectedStage, navigateTo, playStartSound]);

  // ローマ字の表示を生成
  const renderRomaji = () => {
    if (!typingState || romajiGuideLevel === 'none') return null;

    const confirmed = typingState.confirmedRomaji;
    const current = typingState.currentInput;
    const remaining = displayRomaji.slice(confirmed.length + current.length);

    return (
      <div className="text-xl font-mono tracking-wider">
        <span className="text-primary">{confirmed}</span>
        <span className="text-accent font-medium">{current}</span>
        <span className="text-muted">{remaining}</span>
      </div>
    );
  };

  if (!session || !currentWord) {
    return (
      <div className="screen-container">
        <div className="text-secondary">読み込み中...</div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="screen-container bg-background">
      {/* ヘッダー */}
      <div className="w-full max-w-4xl flex justify-between items-center mb-12">
        <button
          onClick={handleClick(() => navigateTo('stageSelect'))}
          className="text-secondary hover:text-primary transition-colors text-sm"
        >
          ✕ やめる
        </button>

        <div className="flex gap-12 text-center">
          <div>
            <div className="text-muted text-xs uppercase tracking-wider mb-1">スコア</div>
            <div className="text-primary text-2xl font-medium">{score.toLocaleString()}</div>
          </div>
          <div>
            <div className="text-muted text-xs uppercase tracking-wider mb-1">コンボ</div>
            <div className={`text-2xl font-medium ${combo >= 10 ? 'text-accent' : 'text-primary'}`}>
              {combo}
            </div>
          </div>
          <div>
            <div className="text-muted text-xs uppercase tracking-wider mb-1">ミス</div>
            <div className="text-error text-2xl font-medium">{missCount}</div>
          </div>
        </div>
      </div>

      {/* プログレスバー */}
      <div className="w-full max-w-4xl mb-12">
        <div className="h-1 bg-surface rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-accent"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          />
        </div>
        <div className="text-right text-muted text-xs mt-2">
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
              className="text-accent text-sm mb-6 font-mono"
            >
              {combo} COMBO
            </motion.div>
          )}
        </AnimatePresence>

        {/* 表示テキスト */}
        <motion.div
          key={currentWord.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mb-8"
        >
          <div className="text-5xl md:text-6xl font-medium text-primary mb-6 font-mono">
            {currentWord.display}
          </div>
          <div className="text-xl text-secondary mb-6 font-mono">
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
      <div className="text-muted text-xs mt-12 uppercase tracking-wider">
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
