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
import { bgmManager } from '@/utils/bgmManager';
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

  // タイピング画面ではBGM音量を下げる
  useEffect(() => {
    // BGM音量を30%に下げる
    bgmManager.lowerVolume(0.30);
    
    // 画面を離れるときに音量を元に戻す
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
        className="text-2xl tracking-wider bg-white/80 backdrop-blur-sm border-2 border-pop-purple/20 rounded-xl px-6 py-4 inline-block shadow-card"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <span className="text-pop-mint font-bold">{confirmed}</span>
        <motion.span 
          className="text-pop-pink font-extrabold"
        >
          {current}
        </motion.span>
        <span className="text-pop-purple/40 font-medium">{remaining}</span>
      </motion.div>
    );
  };

  if (!session || !currentWord) {
    return (
      <div className="screen-container">
        <div className="text-pop-purple font-bold">読み込み中... ✨</div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="screen-container relative overflow-hidden">
      {/* 背景デコレーション */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 right-10 w-24 h-24 bg-pop-pink/10 rounded-full blur-2xl" />
        <div className="absolute bottom-20 left-10 w-32 h-32 bg-pop-purple/10 rounded-full blur-2xl" />
      </div>

      {/* ヘッダー */}
      <div className="relative z-10 w-full max-w-4xl flex justify-between items-center mb-8">
        <button
          onClick={handleClick(() => navigateTo('stageSelect'))}
          className="text-pop-purple hover:text-accent transition-colors text-base font-bold"
        >
          ✕ やめる
        </button>

        <div className="flex gap-4 text-center">
          <motion.div 
            className="bg-white border-2 border-pop-purple/30 rounded-xl px-5 py-3 min-w-[110px] shadow-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-pop-purple text-sm font-bold mb-1">⭐ スコア</div>
            <div className="text-primary text-2xl font-extrabold">{score.toLocaleString()}</div>
          </motion.div>
          <motion.div 
            className={`bg-white border-2 rounded-xl px-5 py-3 min-w-[100px] shadow-card ${
              combo >= 10 ? 'border-pop-pink' : 'border-pop-purple/30'
            }`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ 
              opacity: 1, 
              scale: combo >= 10 ? [1, 1.05, 1] : 1,
            }}
            transition={{ delay: 0.2, repeat: combo >= 10 ? Infinity : 0, repeatDelay: 1 }}
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-pop-purple text-sm font-bold mb-1">🔥 コンボ</div>
            <div className={`text-2xl font-extrabold ${combo >= 10 ? 'text-pop-pink' : 'text-primary'}`}>
              {combo}
            </div>
          </motion.div>
          <motion.div 
            className="bg-white border-2 border-pop-coral/30 rounded-xl px-5 py-3 min-w-[110px] shadow-card"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.05 }}
          >
            <div className="text-pop-coral text-sm font-bold mb-1">💔 ミス</div>
            <div className="text-error text-2xl font-extrabold">{missCount}</div>
          </motion.div>
        </div>
      </div>

      {/* プログレスバー */}
      <div className="relative z-10 w-full max-w-4xl mb-8">
        <div className="h-3 bg-muted rounded-full overflow-hidden relative">
          <motion.div
            className="h-full bg-gradient-to-r from-pop-pink via-pop-purple to-pop-sky rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={{
              boxShadow: '0 0 10px rgba(236, 72, 153, 0.5)',
            }}
          />
        </div>
        <div className="text-right text-pop-purple text-sm mt-2 font-bold">
          {session.currentWordIndex + 1} / {session.words.length} 📝
        </div>
      </div>

      {/* タイピングエリア */}
      <div className="relative z-10 typing-area w-full max-w-4xl text-center py-10">
        {/* コンボ表示 */}
        <AnimatePresence>
          {combo >= APP_CONFIG.COMBO_DISPLAY_THRESHOLD && (
            <motion.div
              initial={{ opacity: 0, scale: 0.5, y: -20 }}
              animate={{ 
                opacity: 1, 
                scale: 1, 
                y: 0,
              }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="text-pop-pink text-xl md:text-2xl font-extrabold mb-6"
            >
              🔥 {combo} COMBO! 🔥
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
            className="text-5xl md:text-6xl font-extrabold text-primary mb-4"
          >
            {currentWord.display}
          </motion.div>
          <div className="text-2xl text-pop-purple mb-6 font-bold tracking-wider">
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
      <div className="relative z-10 text-pop-purple/60 text-sm mt-8 font-bold">
        ESCキーで中断 🔙
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
    <div className="flex flex-col items-center gap-2 p-4 bg-white/80 backdrop-blur-sm border-2 border-pop-purple/20 rounded-xl shadow-card">
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
                  boxShadow: '0 0 10px rgba(236, 72, 153, 0.5)'
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
