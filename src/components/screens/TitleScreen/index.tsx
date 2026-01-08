/**
 * タイトル画面コンポーネント
 * クール＆スタイリッシュデザイン + 爆発演出
 */

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useButtonClick } from '@/utils/soundUtils';
import { bgmManager } from '@/utils/bgmManager';

// メニュー項目定義
const MENU_ITEMS = [
  { label: 'START TRAINING', screen: 'levelSelect' as const, isMain: true },
  { label: 'TIME ATTACK', screen: 'timeAttack' as const },
  { label: 'FREE PRACTICE', screen: 'freePlay' as const },
  { label: 'STATISTICS', screen: 'statistics' as const },
  { label: 'SETTINGS', screen: 'settings' as const },
  { label: 'ADMIN', screen: 'admin' as const },
];

export const TitleScreen: React.FC = () => {
  const { navigateTo } = useGameStore();
  const {
    soundEnabled,
    bgmEnabled,
    soundVolume,
    bgmVolume,
    setSoundEnabled,
    setBgmEnabled,
    setSoundVolume,
    setBgmVolume
  } = useSettingsStore();
  const { handleClick } = useButtonClick();
  const [showStartOverlay, setShowStartOverlay] = useState(true);
  const [explosionTriggered, setExplosionTriggered] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const hasInteractedRef = useRef(false);
  const openingAudioRef = useRef<HTMLAudioElement | null>(null);
  const explosionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const playBgm = useCallback(() => {
    const volume = (bgmVolume / 100) * 0.8;
    bgmManager.setOriginalVolume(volume);
    bgmManager.play(volume);
  }, [bgmVolume]);

  const pauseBgm = useCallback(() => {
    bgmManager.pause();
  }, []);

  useEffect(() => {
    const volume = (bgmVolume / 100) * 0.8;
    bgmManager.setOriginalVolume(volume);
    bgmManager.setVolume(volume);
  }, [bgmVolume]);

  useEffect(() => {
    if (bgmEnabled && hasInteractedRef.current) {
      playBgm();
    } else {
      pauseBgm();
    }
  }, [bgmEnabled, playBgm, pauseBgm]);

  useEffect(() => {
    bgmManager.restoreVolume();
  }, []);

  // オープニング画面でOPENING BGMを再生 & 爆発音を1秒後に1回再生
  useEffect(() => {
    if (showStartOverlay) {
      // OPENING BGMに切り替えて再生（音量60%）
      bgmManager.switchTrack('opening');
      if (bgmEnabled) {
        const volume = (bgmVolume / 100) * 0.8 * 0.6; // 60%の音量
        bgmManager.setOriginalVolume(volume);
        bgmManager.play(volume);
        hasInteractedRef.current = true;
      }
      setExplosionTriggered(false);

      // 1秒後に爆発音を再生＆アニメーション開始
      explosionTimerRef.current = setTimeout(() => {
        if (!openingAudioRef.current) {
          openingAudioRef.current = new Audio('/Mobile-/opening.mp3');
          openingAudioRef.current.loop = false; // 1回だけ再生
        }
        const volume = 1.0; // 最大音量
        openingAudioRef.current.volume = volume;
        openingAudioRef.current.currentTime = 0;
        openingAudioRef.current.play().catch(() => {});

        // 爆発アニメーション開始
        setExplosionTriggered(true);
      }, 1000);
    } else {
      if (openingAudioRef.current) {
        openingAudioRef.current.pause();
        openingAudioRef.current.currentTime = 0;
      }
      if (explosionTimerRef.current) {
        clearTimeout(explosionTimerRef.current);
      }
    }

    return () => {
      if (openingAudioRef.current) {
        openingAudioRef.current.pause();
      }
      if (explosionTimerRef.current) {
        clearTimeout(explosionTimerRef.current);
      }
    };
  }, [showStartOverlay, bgmVolume, bgmEnabled]);

  const handleStart = useCallback(() => {
    hasInteractedRef.current = true;
    setShowStartOverlay(false);
    // メニュー画面ではGAME BGMに切り替え
    bgmManager.switchTrack('game');
    if (bgmEnabled) {
      playBgm();
    }
  }, [bgmEnabled, playBgm]);

  const handleBackToOpening = useCallback(() => {
    // オープニングに戻るときはOPENING BGMに切り替え
    bgmManager.switchTrack('opening');
    bgmManager.pause();
    setShowStartOverlay(true);
  }, []);

  // キーボード操作
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // オーバーレイ表示中
      if (showStartOverlay) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleStart();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          bgmManager.pause();
          navigateTo('opening');
        }
        return;
      }

      // メニュー画面
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => (prev - 1 + MENU_ITEMS.length) % MENU_ITEMS.length);
          break;
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => (prev + 1) % MENU_ITEMS.length);
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          handleClick(() => navigateTo(MENU_ITEMS[selectedIndex].screen))();
          break;
        case 'Escape':
          e.preventDefault();
          handleBackToOpening();
          break;
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
          const num = parseInt(e.key) - 1;
          if (num < MENU_ITEMS.length) {
            setSelectedIndex(num);
            handleClick(() => navigateTo(MENU_ITEMS[num].screen))();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showStartOverlay, selectedIndex, handleStart, handleBackToOpening, handleClick, navigateTo]);

  return (
    <div className="min-h-screen bg-hunter-dark relative overflow-hidden">
      {/* スタートオーバーレイ */}
      <AnimatePresence>
        {showStartOverlay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center cursor-pointer overflow-hidden"
            onClick={handleStart}
          >
            {/* 背景 */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a12] via-hunter-dark to-[#0a0a12]" />
            
            {/* グリッド背景 */}
            <div 
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `linear-gradient(rgba(212,175,55,0.3) 1px, transparent 1px),
                                  linear-gradient(90deg, rgba(212,175,55,0.3) 1px, transparent 1px)`,
                backgroundSize: '40px 40px'
              }}
            />

            {/* 爆発エフェクト - 光の放射 */}
            <AnimatePresence>
              {explosionTriggered && (
                <>
                  {/* 中央からの光の爆発 */}
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: [0, 1, 0] }}
                    transition={{ duration: 0.8, times: [0, 0.1, 1] }}
                  >
                    <motion.div
                      className="w-4 h-4 bg-hunter-gold rounded-full"
                      initial={{ scale: 0 }}
                      animate={{ scale: [0, 80, 100] }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      style={{ filter: 'blur(100px)' }}
                    />
                  </motion.div>

                  {/* 放射状の光線 */}
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute top-1/2 left-1/2 w-[200%] h-1 bg-gradient-to-r from-transparent via-hunter-gold to-transparent"
                      style={{ 
                        transformOrigin: 'center center',
                        rotate: `${i * 30}deg`,
                      }}
                      initial={{ opacity: 0, scaleX: 0 }}
                      animate={{ 
                        opacity: [0, 1, 0],
                        scaleX: [0, 1, 1.5],
                      }}
                      transition={{ 
                        duration: 0.6, 
                        delay: 0.05,
                        ease: 'easeOut',
                      }}
                    />
                  ))}

                  {/* 爆発パーティクル */}
                  {[...Array(20)].map((_, i) => {
                    const angle = (i / 20) * Math.PI * 2;
                    const distance = 150 + Math.random() * 200;
                    return (
                      <motion.div
                        key={`particle-${i}`}
                        className="absolute top-1/2 left-1/2 w-2 h-2 bg-hunter-gold rounded-full"
                        initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
                        animate={{ 
                          x: Math.cos(angle) * distance,
                          y: Math.sin(angle) * distance,
                          opacity: 0,
                          scale: 0,
                        }}
                        transition={{ 
                          duration: 0.8 + Math.random() * 0.4,
                          delay: 0.05,
                          ease: 'easeOut',
                        }}
                      />
                    );
                  })}

                  {/* 衝撃波リング */}
                  {[0, 0.1, 0.2].map((delay, i) => (
                    <motion.div
                      key={`ring-${i}`}
                      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 border-2 border-hunter-gold rounded-full"
                      initial={{ width: 0, height: 0, opacity: 1 }}
                      animate={{ 
                        width: [0, 600, 800],
                        height: [0, 600, 800],
                        opacity: [1, 0.5, 0],
                      }}
                      transition={{ 
                        duration: 0.8,
                        delay: delay,
                        ease: 'easeOut',
                      }}
                    />
                  ))}
                </>
              )}
            </AnimatePresence>

            {/* メイン画像 - 爆発後に登場 */}
            <motion.div
              className="relative z-10"
              initial={{ scale: 0, opacity: 0, rotate: -10 }}
              animate={explosionTriggered ? {
                scale: [0, 1.1, 1],
                opacity: [0, 1, 1],
                rotate: [10, -2, 0],
              } : { scale: 0, opacity: 0 }}
              transition={{ 
                duration: 0.6, 
                delay: explosionTriggered ? 0.1 : 0,
                ease: [0.34, 1.56, 0.64, 1], // spring-like
              }}
            >
              <motion.div
                className="absolute -inset-4 rounded-lg bg-hunter-gold/30"
                animate={explosionTriggered ? {
                  opacity: [0.8, 0.2, 0.4, 0.2],
                  scale: [1, 1.1, 1, 1.05],
                } : {}}
                transition={{ duration: 2, repeat: Infinity, delay: 0.7 }}
              />
              <img 
                src="/Mobile-/title-image_V2.jpg" 
                alt="HUNTER×HUNTER TYPING MASTER"
                className="w-full max-w-lg lg:max-w-2xl xl:max-w-3xl mx-auto rounded-lg shadow-2xl relative z-10 border-2 border-hunter-gold/50"
              />
            </motion.div>

            {/* タイトル - 爆発後に登場 */}
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              animate={explosionTriggered ? {
                opacity: 1,
                y: 0,
                scale: 1,
              } : { opacity: 0, y: 50, scale: 0.8 }}
              transition={{ 
                duration: 0.5, 
                delay: explosionTriggered ? 0.3 : 0,
                ease: 'easeOut',
              }}
              className="relative z-10 mt-8 text-center"
            >
              <motion.h1 
                className="font-title text-3xl md:text-4xl lg:text-5xl font-bold tracking-wider text-hunter-gold mb-2"
                animate={explosionTriggered ? {
                  textShadow: [
                    '0 0 20px rgba(212,175,55,0.8)',
                    '0 0 40px rgba(212,175,55,0.4)',
                    '0 0 20px rgba(212,175,55,0.6)',
                  ],
                } : {}}
                transition={{ duration: 2, repeat: Infinity, delay: 0.8 }}
              >
                HUNTER×HUNTER
              </motion.h1>
              <motion.h2 
                className="font-title text-xl md:text-2xl tracking-[0.3em] text-white/80"
                initial={{ opacity: 0 }}
                animate={explosionTriggered ? { opacity: 1 } : { opacity: 0 }}
                transition={{ delay: explosionTriggered ? 0.5 : 0, duration: 0.3 }}
              >
                TYPING MASTER
              </motion.h2>
            </motion.div>

            {/* スタート指示 - 爆発後に登場 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={explosionTriggered ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: explosionTriggered ? 0.8 : 0, duration: 0.5 }}
              className="relative z-10 mt-10"
            >
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="font-title text-lg tracking-[0.2em] text-hunter-gold/80 uppercase"
              >
                Press to Start
              </motion.div>
            </motion.div>

            {/* ローディング表示（爆発前） */}
            {!explosionTriggered && (
              <motion.div
                className="relative z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <motion.div
                  className="w-16 h-16 border-2 border-hunter-gold/30 border-t-hunter-gold rounded-full"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 背景エフェクト */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,rgba(45,90,39,0.15),transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,rgba(212,175,55,0.08),transparent_50%)]" />
        
        {/* グリッドパターン */}
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(212,175,55,0.5) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(212,175,55,0.5) 1px, transparent 1px)`,
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      {/* メインコンテンツ */}
      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row">
        
        {/* 左側 - ビジュアルエリア（PC のみ） */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 items-center justify-center p-8 relative">
          {/* 装飾的なフレーム */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="w-[500px] h-[500px] xl:w-[600px] xl:h-[600px] border border-hunter-gold/10"
              style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
              animate={{ rotate: 360 }}
              transition={{ duration: 120, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="absolute w-[400px] h-[400px] xl:w-[480px] xl:h-[480px] border border-hunter-gold/20"
              style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}
              animate={{ rotate: -360 }}
              transition={{ duration: 90, repeat: Infinity, ease: 'linear' }}
            />
          </div>

          {/* 中央の画像 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative z-10"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-hunter-gold/20 via-transparent to-hunter-gold/20 rounded-lg" />
            <img 
              src="/Mobile-/title-image_V2.jpg" 
              alt="HUNTER×HUNTER TYPING MASTER"
              className="w-[26rem] xl:w-[32rem] rounded-lg shadow-2xl border border-hunter-gold/20"
            />
          </motion.div>
        </div>

        {/* 右側 - メニューエリア */}
        <div className="flex-1 lg:w-1/2 xl:w-2/5 flex flex-col items-center justify-center p-6 lg:p-12 lg:border-l lg:border-hunter-gold/10">
          {/* モバイル用タイトル画像 */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="lg:hidden mb-6"
          >
            <img 
              src="/Mobile-/title-image_V2.jpg" 
              alt="HUNTER×HUNTER TYPING MASTER"
              className="w-full max-w-md mx-auto rounded-lg shadow-xl border border-hunter-gold/20"
            />
          </motion.div>

          {/* PC用タイトル */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="hidden lg:block text-center mb-10"
          >
            <h1 className="font-title text-4xl xl:text-5xl font-bold tracking-wider text-hunter-gold mb-2">
              HUNTER×HUNTER
            </h1>
            <h2 className="font-title text-2xl tracking-[0.3em] text-white/70">
              TYPING MASTER
            </h2>
            <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-hunter-gold to-transparent mx-auto mt-4" />
          </motion.div>

          {/* メインメニュー */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full max-w-sm space-y-4"
          >
            {/* メインボタン */}
            <motion.button
              onClick={handleClick(() => navigateTo('levelSelect'))}
              onMouseEnter={() => setSelectedIndex(0)}
              className={`w-full relative group overflow-hidden ${selectedIndex === 0 ? 'ring-2 ring-hunter-gold' : ''}`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              animate={selectedIndex === 0 ? { scale: 1.02 } : { scale: 1 }}
            >
              <div className="absolute inset-0 bg-hunter-green/80 rounded-lg" />
              <div className={`absolute inset-0 bg-gradient-to-r from-hunter-green to-hunter-green-light transition-opacity rounded-lg ${selectedIndex === 0 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
              <div className="relative font-title text-white font-bold py-4 px-8 rounded-lg text-lg tracking-wider uppercase flex items-center justify-center gap-3 border border-hunter-green-light/30">
                <span className="text-xl">▶</span>
                <span>START TRAINING</span>
                <span className="ml-auto text-xs opacity-50">1</span>
              </div>
            </motion.button>

            {/* サブメニュー */}
            <div className="space-y-2">
              {MENU_ITEMS.slice(1).map((item, index) => {
                const menuIndex = index + 1;
                const isSelected = selectedIndex === menuIndex;
                return (
                  <motion.button
                    key={item.label}
                    onClick={handleClick(() => navigateTo(item.screen))}
                    onMouseEnter={() => setSelectedIndex(menuIndex)}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: isSelected ? 4 : 0 }}
                    transition={{ delay: 0.3 + index * 0.08 }}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full rounded-lg py-3 px-4 transition-all font-title tracking-wider uppercase text-sm flex items-center justify-between ${
                      isSelected
                        ? 'bg-hunter-dark-light/60 border-hunter-gold/60 text-white border-2'
                        : 'bg-hunter-dark-light/30 hover:bg-hunter-dark-light/60 border border-hunter-gold/20 hover:border-hunter-gold/40 text-white/70 hover:text-white'
                    }`}
                  >
                    <span>{item.label}</span>
                    <span className="text-xs opacity-50">{menuIndex + 1}</span>
                  </motion.button>
                );
              })}
            </div>

            {/* オープニングに戻るボタン */}
            <motion.button
              onClick={handleBackToOpening}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full mt-4 bg-transparent border border-hunter-gold/10 hover:border-hunter-gold/30 rounded-lg py-2 px-4 transition-all text-white/40 hover:text-white/60 font-title tracking-wider uppercase text-xs"
            >
              ← BACK TO OPENING
            </motion.button>
          </motion.div>

          {/* 設定トグル */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col items-center gap-4 mt-8"
          >
            <div className="flex items-center gap-6">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-all ${
                  soundEnabled 
                    ? 'bg-hunter-gold/10 text-hunter-gold border border-hunter-gold/30' 
                    : 'text-white/30 hover:text-white/50 border border-transparent'
                }`}
              >
                <span className="text-xl">{soundEnabled ? '🔊' : '🔇'}</span>
                <span className="font-title text-[10px] tracking-wider">SFX</span>
              </button>
              <button
                onClick={() => {
                  hasInteractedRef.current = true;
                  const newState = !bgmEnabled;
                  setBgmEnabled(newState);
                  if (newState) playBgm();
                  else pauseBgm();
                }}
                className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-all ${
                  bgmEnabled 
                    ? 'bg-hunter-gold/10 text-hunter-gold border border-hunter-gold/30' 
                    : 'text-white/30 hover:text-white/50 border border-transparent'
                }`}
              >
                <span className="text-xl">{bgmEnabled ? '🎵' : '🔕'}</span>
                <span className="font-title text-[10px] tracking-wider">BGM</span>
              </button>
            </div>

            {/* 音量スライダー */}
            <div className="flex flex-col gap-2">
              {/* SFX音量 */}
              {soundEnabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="flex items-center gap-3 bg-hunter-dark-light/30 rounded-lg px-4 py-2 border border-hunter-gold/20"
                >
                  <span className="text-xs text-white/50 w-8">SFX</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={soundVolume}
                    onChange={(e) => setSoundVolume(Number(e.target.value))}
                    className="w-24 h-1.5 bg-hunter-dark rounded-full appearance-none cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none
                      [&::-webkit-slider-thumb]:w-4
                      [&::-webkit-slider-thumb]:h-4
                      [&::-webkit-slider-thumb]:rounded-full
                      [&::-webkit-slider-thumb]:bg-hunter-gold
                      [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                  <span className="font-title text-xs text-hunter-gold w-8">{soundVolume}%</span>
                </motion.div>
              )}

              {/* BGM音量 */}
              {bgmEnabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="flex items-center gap-3 bg-hunter-dark-light/30 rounded-lg px-4 py-2 border border-hunter-gold/20"
                >
                  <span className="text-xs text-white/50 w-8">BGM</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={bgmVolume}
                    onChange={(e) => setBgmVolume(Number(e.target.value))}
                    className="w-24 h-1.5 bg-hunter-dark rounded-full appearance-none cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none
                      [&::-webkit-slider-thumb]:w-4
                      [&::-webkit-slider-thumb]:h-4
                      [&::-webkit-slider-thumb]:rounded-full
                      [&::-webkit-slider-thumb]:bg-hunter-gold
                      [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                  <span className="font-title text-xs text-hunter-gold w-8">{bgmVolume}%</span>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* バージョン */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="mt-auto pt-6 text-center"
          >
            <p className="font-title text-hunter-gold/30 text-xs tracking-wider">
              VER 1.0 // HUNTER×HUNTER TYPING MASTER
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TitleScreen;
