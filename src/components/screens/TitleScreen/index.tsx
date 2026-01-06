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
    <div className="screen-container bg-background relative overflow-hidden">
      {/* 背景グラデーションエフェクト */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
      </div>

      {/* コンテンツ */}
      <div className="relative z-10 text-center max-w-2xl">
        {/* タイトル */}
        <motion.div
          initial={{ opacity: 0, y: -30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-4 text-gradient glow-text">
            HUNTER×HUNTER
          </h1>
          <motion.h2 
            className="text-xl md:text-2xl font-medium mb-16 text-secondary"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            タイピングマスター
          </motion.h2>
        </motion.div>

        {/* メニュー */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="space-y-4"
        >
          {/* メインボタン */}
          <motion.button
            onClick={handleClick(() => navigateTo('levelSelect'))}
            className="btn-primary w-72 text-base font-semibold glow-accent"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.98 }}
          >
            修行を始める
          </motion.button>

          {/* サブメニュー */}
          <div className="flex flex-col items-center space-y-3">
            {[
              { label: 'タイムアタック', action: () => navigateTo('timeAttack') },
              { label: 'フリー練習', action: () => navigateTo('freePlay') },
              { label: '成績を見る', action: () => navigateTo('statistics') },
              { label: '設定', action: () => navigateTo('settings') },
            ].map((item, index) => (
              <motion.button
                key={item.label}
                onClick={handleClick(item.action)}
                className="btn-ghost w-56 text-sm"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1, duration: 0.4 }}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
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
          className="flex justify-center gap-6 mt-16"
        >
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`text-xl ${soundEnabled ? 'text-primary' : 'text-muted'}`}
            aria-label={soundEnabled ? '効果音オン' : '効果音オフ'}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
          <button
            onClick={() => setBgmEnabled(!bgmEnabled)}
            className={`text-xl ${bgmEnabled ? 'text-primary' : 'text-muted'}`}
            aria-label={bgmEnabled ? 'BGMオン' : 'BGMオフ'}
          >
            {bgmEnabled ? '🎵' : '🔕'}
          </button>
        </motion.div>
      </div>

      {/* フッター */}
      <div className="absolute bottom-6 left-0 right-0 text-center text-muted text-xs">
        © HUNTER×HUNTER Typing Master
      </div>
    </div>
  );
};

export default TitleScreen;
