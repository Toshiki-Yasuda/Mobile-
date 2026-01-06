/**
 * タイトル画面コンポーネント
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
  const [showVolumeSlider, setShowVolumeSlider] = React.useState(false);
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

  // BGM音量の更新（普段は80%の音量）
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
    <div className="screen-container relative overflow-hidden">
      {/* スタートオーバーレイ */}
      {showStartOverlay && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-br from-purple-900/95 via-pink-900/95 to-indigo-900/95 cursor-pointer"
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
              className="text-white text-2xl font-bold mb-2"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              🎮 タップしてスタート！
            </motion.p>
            <p className="text-white/60 text-sm">Click to Start</p>
          </motion.div>
        </motion.div>
      )}

      {/* 背景デコレーション */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-pop-pink/20 rounded-full blur-2xl animate-float" />
        <div className="absolute top-1/4 right-20 w-40 h-40 bg-pop-purple/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-20 left-1/4 w-36 h-36 bg-pop-sky/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-28 h-28 bg-pop-mint/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '1.5s' }} />
      </div>

      {/* コンテンツ */}
      <div className="relative z-10 text-center max-w-2xl">
        {/* タイトル画像 */}
        <motion.div
          initial={{ opacity: 0, y: -30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mb-8"
        >
          <img 
            src="/Mobile-/title-image.png" 
            alt="HUNTER×HUNTER タイピングマスター"
            className="w-full max-w-lg mx-auto rounded-2xl shadow-2xl"
          />
        </motion.div>

        {/* メニュー */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="space-y-5"
        >
          {/* メインボタン */}
          <motion.button
            onClick={handleClick(() => navigateTo('levelSelect'))}
            className="btn-primary w-80 text-xl font-bold py-4"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            🚀 修行を始める！
          </motion.button>

          {/* サブメニュー */}
          <div className="flex flex-col items-center space-y-3">
            {[
              { label: '⏱️ タイムアタック', action: () => navigateTo('timeAttack') },
              { label: '📝 フリー練習', action: () => navigateTo('freePlay') },
              { label: '📊 成績を見る', action: () => navigateTo('statistics') },
              { label: '⚙️ 設定', action: () => navigateTo('settings') },
              { label: '🔧 管理者モード', action: () => navigateTo('admin') },
            ].map((item, index) => (
              <motion.button
                key={item.label}
                onClick={handleClick(item.action)}
                className="btn-ghost w-72 text-base font-bold py-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
                whileHover={{ scale: 1.03, x: 4 }}
                whileTap={{ scale: 0.97 }}
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
          transition={{ delay: 0.4, duration: 0.4 }}
          className="flex flex-col items-center gap-4 mt-12"
        >
          <div className="flex justify-center gap-6">
            <button
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                setShowVolumeSlider(soundEnabled ? false : true);
              }}
              className={`text-2xl p-2 rounded-full transition-all ${soundEnabled ? 'bg-pop-pink/20' : 'bg-gray-200'}`}
              aria-label={soundEnabled ? '効果音オン' : '効果音オフ'}
            >
              {soundEnabled ? '🔊' : '🔇'}
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
              className={`text-2xl p-2 rounded-full transition-all ${bgmEnabled ? 'bg-pop-purple/20' : 'bg-gray-200'}`}
              aria-label={bgmEnabled ? 'BGMオン' : 'BGMオフ'}
            >
              {bgmEnabled ? '🎵' : '🔕'}
            </button>
          </div>

          {/* 音量スライダー */}
          {soundEnabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-xl px-4 py-3 border-2 border-pop-purple/20"
            >
              <span className="text-sm">🔈</span>
              <input
                type="range"
                min="0"
                max="100"
                value={soundVolume}
                onChange={(e) => setSoundVolume(Number(e.target.value))}
                className="w-32 h-2 bg-muted rounded-full appearance-none cursor-pointer
                  [&::-webkit-slider-thumb]:appearance-none
                  [&::-webkit-slider-thumb]:w-5
                  [&::-webkit-slider-thumb]:h-5
                  [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-gradient-to-r
                  [&::-webkit-slider-thumb]:from-pop-pink
                  [&::-webkit-slider-thumb]:to-pop-purple
                  [&::-webkit-slider-thumb]:shadow-md
                  [&::-webkit-slider-thumb]:cursor-pointer"
              />
              <span className="text-sm">🔊</span>
              <span className="text-sm font-bold text-pop-purple w-10">{soundVolume}%</span>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* フッター */}
      <div className="absolute bottom-6 left-0 right-0 text-center text-pop-purple/60 text-sm font-medium">
        © HUNTER×HUNTER Typing Master
      </div>
    </div>
  );
};

export default TitleScreen;
