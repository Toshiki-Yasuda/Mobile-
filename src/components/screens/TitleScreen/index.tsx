/**
 * タイトル画面コンポーネント
 * クール＆スタイリッシュデザイン
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useButtonClick } from '@/utils/soundUtils';
import { bgmManager } from '@/utils/bgmManager';

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
  const [showStartOverlay, setShowStartOverlay] = React.useState(true);
  const hasInteractedRef = useRef(false);

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

  const handleStart = useCallback(() => {
    hasInteractedRef.current = true;
    setShowStartOverlay(false);
    if (bgmEnabled) {
      playBgm();
    }
  }, [bgmEnabled, playBgm]);

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

            {/* 光線エフェクト */}
            <div className="absolute inset-0">
              {[...Array(6)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute top-1/2 left-1/2 w-[200%] h-0.5 bg-gradient-to-r from-transparent via-hunter-gold/30 to-transparent"
                  style={{ transformOrigin: 'center center' }}
                  initial={{ rotate: i * 30, opacity: 0 }}
                  animate={{ 
                    rotate: i * 30 + 360,
                    opacity: [0, 0.5, 0],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    delay: i * 0.5,
                    ease: 'linear',
                  }}
                />
              ))}
            </div>

            {/* メイン画像 */}
            <motion.div
              className="relative z-10"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ type: 'spring', stiffness: 100, damping: 15, delay: 0.2 }}
            >
              <motion.div
                className="absolute -inset-2 rounded-lg bg-hunter-gold/20"
                animate={{
                  opacity: [0.2, 0.4, 0.2],
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <img 
                src="/Mobile-/title-image_V2.jpg" 
                alt="HUNTER×HUNTER TYPING MASTER"
                className="w-full max-w-lg lg:max-w-2xl xl:max-w-3xl mx-auto rounded-lg shadow-2xl relative z-10 border border-hunter-gold/30"
              />
            </motion.div>

            {/* タイトル */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="relative z-10 mt-8 text-center"
            >
              <h1 className="font-title text-3xl md:text-4xl lg:text-5xl font-bold tracking-wider text-hunter-gold mb-2">
                HUNTER×HUNTER
              </h1>
              <h2 className="font-title text-xl md:text-2xl tracking-[0.3em] text-white/80">
                TYPING MASTER
              </h2>
            </motion.div>

            {/* スタート指示 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
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
              className="w-full relative group overflow-hidden"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="absolute inset-0 bg-hunter-green/80 rounded-lg" />
              <div className="absolute inset-0 bg-gradient-to-r from-hunter-green to-hunter-green-light opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
              <div className="relative font-title text-white font-bold py-4 px-8 rounded-lg text-lg tracking-wider uppercase flex items-center justify-center gap-3 border border-hunter-green-light/30">
                <span className="text-xl">▶</span>
                <span>START TRAINING</span>
              </div>
            </motion.button>

            {/* サブメニュー */}
            <div className="space-y-2">
              {[
                { label: 'TIME ATTACK', action: () => navigateTo('timeAttack') },
                { label: 'FREE PRACTICE', action: () => navigateTo('freePlay') },
                { label: 'STATISTICS', action: () => navigateTo('statistics') },
                { label: 'ADMIN', action: () => navigateTo('admin') },
              ].map((item, index) => (
                <motion.button
                  key={item.label}
                  onClick={handleClick(item.action)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.08 }}
                  whileHover={{ scale: 1.02, x: 4 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-hunter-dark-light/30 hover:bg-hunter-dark-light/60 border border-hunter-gold/20 hover:border-hunter-gold/40 rounded-lg py-3 px-4 transition-all text-white/70 hover:text-white font-title tracking-wider uppercase text-sm"
                >
                  {item.label}
                </motion.button>
              ))}
            </div>
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
