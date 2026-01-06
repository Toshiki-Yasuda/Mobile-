/**
 * タイトル画面コンポーネント
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { useSettingsStore } from '@/stores/settingsStore';

export const TitleScreen: React.FC = () => {
  const { navigateTo } = useGameStore();
  const { soundEnabled, bgmEnabled, setSoundEnabled, setBgmEnabled } =
    useSettingsStore();

  return (
    <div className="screen-container bg-hunter-dark">
      {/* 背景エフェクト */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-hunter-gold/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-nen-enhancement/5 rounded-full blur-3xl" />
      </div>

      {/* コンテンツ */}
      <div className="relative z-10 text-center">
        {/* タイトル */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold font-game mb-2">
            <span className="text-gradient">✦ HUNTER×HUNTER ✦</span>
          </h1>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-8">
            タイピングマスター
          </h2>
        </motion.div>

        {/* サブタイトル */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-hunter-gold/80 text-lg mb-12"
        >
          念能力を習得するように、タイピングを習得しよう
        </motion.p>

        {/* メニュー */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="space-y-4"
        >
          {/* メインボタン */}
          <button
            onClick={() => navigateTo('levelSelect')}
            className="btn-primary w-64 text-lg nen-glow"
          >
            ▶ 修行を始める
          </button>

          {/* サブメニュー */}
          <div className="flex flex-col items-center space-y-2">
            <button
              onClick={() => navigateTo('timeAttack')}
              className="btn-ghost w-48"
            >
              タイムアタック
            </button>
            <button
              onClick={() => navigateTo('freePlay')}
              className="btn-ghost w-48"
            >
              フリー練習
            </button>
            <button
              onClick={() => navigateTo('statistics')}
              className="btn-ghost w-48"
            >
              成績を見る
            </button>
            <button
              onClick={() => navigateTo('settings')}
              className="btn-ghost w-48"
            >
              設定
            </button>
          </div>
        </motion.div>

        {/* 設定トグル */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.6 }}
          className="flex justify-center gap-6 mt-12"
        >
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`text-2xl ${soundEnabled ? '' : 'opacity-50'}`}
            aria-label={soundEnabled ? '効果音オン' : '効果音オフ'}
          >
            {soundEnabled ? '🔊' : '🔇'}
          </button>
          <button
            onClick={() => setBgmEnabled(!bgmEnabled)}
            className={`text-2xl ${bgmEnabled ? '' : 'opacity-50'}`}
            aria-label={bgmEnabled ? 'BGMオン' : 'BGMオフ'}
          >
            {bgmEnabled ? '🎵' : '🔕'}
          </button>
        </motion.div>
      </div>

      {/* フッター */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-hunter-gold/40 text-sm">
        © HUNTER×HUNTER Typing Master
      </div>
    </div>
  );
};

export default TitleScreen;
