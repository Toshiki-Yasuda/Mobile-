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
      <motion.div 
        className="text-xl font-mono tracking-wider bg-surface/50 backdrop-blur-sm border border-muted rounded-lg px-6 py-3 inline-block"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <span className="text-primary">{confirmed}</span>
        <motion.span 
          className="text-accent font-semibold"
          animate={{ 
            textShadow: '0 0 10px rgba(59, 130, 246, 0.6)'
          }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
        >
          {current}
        </motion.span>
        <span className="text-muted">{remaining}</span>
      </motion.div>
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

        <div className="flex gap-6 text-center">
          <motion.div 
            className="bg-surface/80 backdrop-blur-sm border border-muted rounded-lg px-6 py-3 min-w-[100px]"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-muted text-xs uppercase tracking-wider mb-1">スコア</div>
            <div className="text-primary text-2xl font-bold font-mono">{score.toLocaleString()}</div>
          </motion.div>
          <motion.div 
            className={`bg-surface/80 backdrop-blur-sm border rounded-lg px-6 py-3 min-w-[100px] ${
              combo >= 10 ? 'border-accent/50 glow-accent' : 'border-muted'
            }`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              scale: combo >= 10 ? [1, 1.05, 1] : 1,
            }}
            transition={{ delay: 0.2, repeat: combo >= 10 ? Infinity : 0, repeatDelay: 1 }}
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-muted text-xs uppercase tracking-wider mb-1">コンボ</div>
            <div className={`text-2xl font-bold font-mono ${combo >= 10 ? 'text-accent glow-text' : 'text-primary'}`}>
              {combo}
            </div>
          </motion.div>
          <motion.div 
            className="bg-surface/80 backdrop-blur-sm border border-muted rounded-lg px-6 py-3 min-w-[100px]"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-muted text-xs uppercase tracking-wider mb-1">ミス</div>
            <div className="text-error text-2xl font-bold font-mono">{missCount}</div>
          </motion.div>
        </div>
      </div>

      {/* プログレスバー */}
      <div className="w-full max-w-4xl mb-12">
        <div className="h-1.5 bg-surface rounded-full overflow-hidden relative">
          <motion.div
            className="h-full bg-gradient-to-r from-accent via-blue-400 to-accent rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)',
            }}
          />
          <motion.div
            className="absolute top-0 right-0 h-full w-1 bg-accent"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1, repeat: Infinity }}
            style={{ 
              boxShadow: '0 0 10px rgba(59, 130, 246, 0.8)',
              transform: `translateX(${progress}%)`
            }}
          />
        </div>
        <div className="text-right text-muted text-xs mt-2 font-mono">
          {session.currentWordIndex + 1} / {session.words.length}
        </div>
      </div>

      {/* タイピングエリア */}
      <div className="typing-area w-full max-w-4xl text-center py-12">
        {/* コンボ表示 */}
        <AnimatePresence>
          {combo >= APP_CONFIG.COMBO_DISPLAY_THRESHOLD && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: -20 }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                y: 0,
                textShadow: combo >= 20 
                  ? '0 0 20px rgba(59, 130, 246, 0.8), 0 0 40px rgba(59, 130, 246, 0.4)'
                  : '0 0 10px rgba(59, 130, 246, 0.5)'
              }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="text-accent text-lg md:text-xl font-bold mb-6 font-mono glow-text"
            >
              {combo} COMBO
            </motion.div>
          )}
        </AnimatePresence>

        {/* 表示テキスト */}
        <motion.div
          key={currentWord.id}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mb-8"
        >
          <motion.div 
            className="text-5xl md:text-6xl font-semibold text-primary mb-6 font-mono"
            initial={{ textShadow: 'none' }}
            animate={{ 
              textShadow: '0 0 20px rgba(250, 250, 250, 0.3)'
            }}
            transition={{ duration: 0.3 }}
          >
            {currentWord.display}
          </motion.div>
          <div className="text-xl text-secondary mb-6 font-mono tracking-wider">
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
    <div className="flex flex-col items-center gap-2 p-4 bg-surface/50 backdrop-blur-sm border border-muted rounded-lg">
      {rows.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className="flex gap-1.5"
          style={{ marginLeft: rowIndex * 20 }}
        >
          {row.map((key) => {
            const isActive = activeKeys.includes(key);
            return (
              <motion.div
                key={key}
                className={isActive ? 'keyboard-key-highlight' : 'keyboard-key'}
                animate={isActive ? { 
                  scale: 1.1,
                  boxShadow: '0 0 10px rgba(59, 130, 246, 0.5)'
                } : { scale: 1 }}
                transition={{ duration: 0.1 }}
              >
                {key.toUpperCase()}
              </motion.div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default TypingScreen;
