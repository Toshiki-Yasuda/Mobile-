/**
 * タイトル画面コンポーネント
 * PC ワイド画面対応 - ダークテーマ
 */

import React, { useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
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
    setSoundVolume 
  } = useSettingsStore();
  const { handleClick } = useButtonClick();
  const [showStartOverlay, setShowStartOverlay] = React.useState(true);
  const hasInteractedRef = useRef(false);

  // BGMを再生（普段は80%の音量）
  const playBgm = useCallback(() => {
    const volume = (bgmVolume / 100) * 0.8;
    bgmManager.setOriginalVolume(volume);
    bgmManager.play(volume);
  }, [bgmVolume]);

  // BGMを停止
  const pauseBgm = useCallback(() => {
    bgmManager.pause();
  }, []);

  // BGM音量の更新
  useEffect(() => {
    const volume = (bgmVolume / 100) * 0.8;
    bgmManager.setOriginalVolume(volume);
    bgmManager.setVolume(volume);
  }, [bgmVolume]);

  // BGMの有効/無効に応じて再生/停止
  useEffect(() => {
    if (bgmEnabled && hasInteractedRef.current) {
      playBgm();
    } else {
      pauseBgm();
    }
  }, [bgmEnabled, playBgm, pauseBgm]);

  // タイトル画面に戻ってきたときにBGM音量を元に戻す
  useEffect(() => {
    bgmManager.restoreVolume();
  }, []);

  // スタートオーバーレイをクリックしたときの処理
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
      {showStartOverlay && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-hunter-dark cursor-pointer"
          onClick={handleStart}
        >
          <motion.img 
            src="/Mobile-/title-image.png" 
            alt="HUNTER×HUNTER タイピングマスター"
            className="w-full max-w-md mx-auto rounded-2xl shadow-2xl mb-8"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-center"
          >
            <motion.p 
              className="text-hunter-gold text-2xl font-bold mb-2"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              🎮 タップしてスタート！
            </motion.p>
            <p className="text-white/60 text-sm">Click to Start</p>
          </motion.div>
        </motion.div>
      )}

      {/* 背景エフェクト */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,rgba(45,90,39,0.2),transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,rgba(212,175,55,0.1),transparent_50%)]" />
        
        {/* 浮遊する六角形パーティクル */}
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-4 h-4 border border-hunter-gold/20"
              style={{
                left: `${15 + i * 15}%`,
                top: `${20 + (i % 3) * 25}%`,
                clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.2, 0.5, 0.2],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 4 + i,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: i * 0.5,
              }}
            />
          ))}
        </div>

        {/* グリッドパターン */}
        <div 
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(rgba(212,175,55,0.5) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(212,175,55,0.5) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        />
      </div>

      {/* メインコンテンツ */}
      <div className="relative z-10 min-h-screen flex flex-col lg:flex-row">
        
        {/* 左側 - ビジュアルエリア（PC のみ） */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 items-center justify-center p-12 relative">
          {/* 装飾的な円 */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="w-[500px] h-[500px] xl:w-[600px] xl:h-[600px] rounded-full border border-hunter-gold/10"
              animate={{ rotate: 360 }}
              transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="absolute w-[400px] h-[400px] xl:w-[480px] xl:h-[480px] rounded-full border border-hunter-gold/20"
              animate={{ rotate: -360 }}
              transition={{ duration: 45, repeat: Infinity, ease: 'linear' }}
            />
            <motion.div
              className="absolute w-[300px] h-[300px] xl:w-[360px] xl:h-[360px] rounded-full border-2 border-hunter-gold/30"
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
            />
          </div>

          {/* 中央の画像 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="relative z-10"
          >
            <img 
              src="/Mobile-/title-image.png" 
              alt="HUNTER×HUNTER タイピングマスター"
              className="w-80 xl:w-96 rounded-2xl shadow-2xl"
            />
            <motion.div
              className="absolute inset-0 rounded-2xl"
              animate={{
                boxShadow: [
                  '0 0 20px rgba(212,175,55,0.1)',
                  '0 0 40px rgba(212,175,55,0.3)',
                  '0 0 20px rgba(212,175,55,0.1)',
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
          </motion.div>
        </div>

        {/* 右側（モバイルは全画面） - メニューエリア */}
        <div className="flex-1 lg:w-1/2 xl:w-2/5 flex flex-col items-center justify-center p-6 lg:p-12 lg:border-l lg:border-hunter-gold/10 lg:bg-hunter-dark/30">
          {/* モバイル用タイトル画像 */}
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="lg:hidden mb-8"
          >
            <img 
              src="/Mobile-/title-image.png" 
              alt="HUNTER×HUNTER タイピングマスター"
              className="w-full max-w-sm mx-auto rounded-2xl shadow-2xl"
            />
          </motion.div>

          {/* PC用タイトル */}
          <motion.div
            initial={{ opacity: 0, y: -30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="hidden lg:block text-center mb-8 lg:mb-12"
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-3">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-hunter-gold via-hunter-gold-light to-hunter-gold">
                ✦ HUNTER×HUNTER ✦
              </span>
            </h1>
            <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-4">
              タイピングマスター
            </h2>
            <p className="text-hunter-gold/60 text-sm lg:text-base max-w-md mx-auto">
              念能力を習得するように、タイピングを習得しよう
            </p>
          </motion.div>

          {/* メインメニュー */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="w-full max-w-sm space-y-4"
          >
            {/* メインボタン */}
            <button
              onClick={handleClick(() => navigateTo('levelSelect'))}
              className="w-full relative group"
            >
              <div className="absolute inset-0 bg-hunter-green rounded-xl blur-md opacity-50 group-hover:opacity-80 transition-opacity" />
              <div className="relative bg-hunter-green hover:bg-hunter-green-light text-white font-bold py-4 px-8 rounded-xl transition-all text-lg flex items-center justify-center gap-3 border border-hunter-green-light/30">
                <span className="text-xl">▶</span>
                <span>修行を始める</span>
              </div>
            </button>

            {/* サブメニュー */}
            <div className="space-y-2">
              {[
                { label: '⏱ タイムアタック', action: () => navigateTo('timeAttack') },
                { label: '🎯 フリー練習', action: () => navigateTo('freePlay') },
                { label: '📊 成績を見る', action: () => navigateTo('statistics') },
                { label: '⚙️ 設定', action: () => navigateTo('settings') },
                { label: '🔧 管理者モード', action: () => navigateTo('admin') },
              ].map((item, index) => (
                <motion.button
                  key={item.label}
                  onClick={handleClick(item.action)}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + index * 0.1, duration: 0.4 }}
                  className="w-full bg-hunter-dark-light/50 hover:bg-hunter-dark-light border border-hunter-gold/20 hover:border-hunter-gold/40 rounded-xl py-3 px-4 transition-all text-white/80 hover:text-white"
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
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex flex-col items-center gap-4 mt-10"
          >
            <div className="flex items-center gap-6">
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-all ${
                  soundEnabled 
                    ? 'bg-hunter-gold/10 text-hunter-gold' 
                    : 'text-white/40 hover:text-white/60'
                }`}
                aria-label={soundEnabled ? '効果音オン' : '効果音オフ'}
              >
                <span className="text-2xl">{soundEnabled ? '🔊' : '🔇'}</span>
                <span className="text-[10px] uppercase tracking-wider">効果音</span>
              </button>
              <button
                onClick={() => {
                  hasInteractedRef.current = true;
                  const newState = !bgmEnabled;
                  setBgmEnabled(newState);
                  if (newState) {
                    playBgm();
                  } else {
                    pauseBgm();
                  }
                }}
                className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-all ${
                  bgmEnabled 
                    ? 'bg-hunter-gold/10 text-hunter-gold' 
                    : 'text-white/40 hover:text-white/60'
                }`}
                aria-label={bgmEnabled ? 'BGMオン' : 'BGMオフ'}
              >
                <span className="text-2xl">{bgmEnabled ? '🎵' : '🔕'}</span>
                <span className="text-[10px] uppercase tracking-wider">BGM</span>
              </button>
            </div>

            {/* 音量スライダー */}
            {soundEnabled && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-3 bg-hunter-dark-light/50 backdrop-blur-sm rounded-xl px-4 py-3 border border-hunter-gold/20"
              >
                <span className="text-sm">🔈</span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={soundVolume}
                  onChange={(e) => setSoundVolume(Number(e.target.value))}
                  className="w-32 h-2 bg-hunter-dark rounded-full appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none
                    [&::-webkit-slider-thumb]:w-5
                    [&::-webkit-slider-thumb]:h-5
                    [&::-webkit-slider-thumb]:rounded-full
                    [&::-webkit-slider-thumb]:bg-hunter-gold
                    [&::-webkit-slider-thumb]:shadow-md
                    [&::-webkit-slider-thumb]:cursor-pointer"
                />
                <span className="text-sm">🔊</span>
                <span className="text-sm font-bold text-hunter-gold w-10">{soundVolume}%</span>
              </motion.div>
            )}
          </motion.div>

          {/* バージョン情報 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="mt-auto pt-8 lg:pt-12 text-center"
          >
            <p className="text-hunter-gold/30 text-xs">
              © HUNTER×HUNTER Typing Master v1.0
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TitleScreen;
