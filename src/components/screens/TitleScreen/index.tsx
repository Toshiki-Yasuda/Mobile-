/**
 * タイトル画面コンポーネント
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useButtonClick } from '@/utils/soundUtils';

export const TitleScreen: React.FC = () => {
  const { navigateTo } = useGameStore();
  const { soundEnabled, bgmEnabled, setSoundEnabled, setBgmEnabled } =
    useSettingsStore();
  const { handleClick } = useButtonClick();

  return (
    <div className="screen-container relative overflow-hidden">
      {/* 背景デコレーション */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-32 h-32 bg-pop-pink/20 rounded-full blur-2xl animate-float" />
        <div className="absolute top-1/4 right-20 w-40 h-40 bg-pop-purple/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-20 left-1/4 w-36 h-36 bg-pop-sky/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-28 h-28 bg-pop-mint/20 rounded-full blur-2xl animate-float" style={{ animationDelay: '1.5s' }} />
        {/* キラキラ */}
        <div className="absolute top-20 right-1/3 text-3xl animate-sparkle">✨</div>
        <div className="absolute bottom-32 left-1/3 text-2xl animate-sparkle" style={{ animationDelay: '0.7s' }}>⭐</div>
        <div className="absolute top-1/2 right-20 text-2xl animate-sparkle" style={{ animationDelay: '1.2s' }}>💫</div>
      </div>

      {/* コンテンツ */}
      <div className="relative z-10 text-center max-w-2xl">
        {/* タイトル */}
        <motion.div
          initial={{ opacity: 0, y: -30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-gradient">
            ✨ HUNTER×HUNTER ✨
          </h1>
          <motion.h2 
            className="text-xl md:text-2xl font-bold mb-16 text-pop-purple"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            タイピングマスター 🎮
          </motion.h2>
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
            className="btn-primary w-72 text-lg font-bold"
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
            ].map((item, index) => (
              <motion.button
                key={item.label}
                onClick={handleClick(item.action)}
                className="btn-ghost w-60 text-sm font-bold"
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
          className="flex justify-center gap-6 mt-12"
        >
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`text-2xl p-2 rounded-full transition-all ${soundEnabled ? 'bg-pop-pink/20' : 'bg-gray-200'}`}
            aria-label={soundEnabled ? '効果音オン' : '効果音オフ'}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
          <button
            onClick={() => setBgmEnabled(!bgmEnabled)}
            className={`text-2xl p-2 rounded-full transition-all ${bgmEnabled ? 'bg-pop-purple/20' : 'bg-gray-200'}`}
            aria-label={bgmEnabled ? 'BGMオン' : 'BGMオフ'}
          >
            {bgmEnabled ? '🎵' : '🔕'}
          </button>
        </motion.div>
      </div>

      {/* フッター */}
      <div className="absolute bottom-6 left-0 right-0 text-center text-pop-purple/60 text-sm font-medium">
        💖 HUNTER×HUNTER Typing Master 💖
      </div>
    </div>
  );
};

export default TitleScreen;
