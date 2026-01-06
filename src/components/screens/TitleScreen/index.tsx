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
    <div className="screen-container bg-background">
      {/* コンテンツ */}
      <div className="relative z-10 text-center max-w-2xl">
        {/* タイトル */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-3 text-primary">
            HUNTER×HUNTER
          </h1>
          <h2 className="text-xl md:text-2xl font-medium mb-12 text-secondary">
            タイピングマスター
          </h2>
        </motion.div>

        {/* メニュー */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="space-y-3"
        >
          {/* メインボタン */}
          <button
            onClick={handleClick(() => navigateTo('levelSelect'))}
            className="btn-primary w-64 text-base"
          >
            修行を始める
          </button>

          {/* サブメニュー */}
          <div className="flex flex-col items-center space-y-2">
            <button
              onClick={handleClick(() => navigateTo('timeAttack'))}
              className="btn-ghost w-48 text-sm"
            >
              タイムアタック
            </button>
            <button
              onClick={handleClick(() => navigateTo('freePlay'))}
              className="btn-ghost w-48 text-sm"
            >
              フリー練習
            </button>
            <button
              onClick={handleClick(() => navigateTo('statistics'))}
              className="btn-ghost w-48 text-sm"
            >
              成績を見る
            </button>
            <button
              onClick={handleClick(() => navigateTo('settings'))}
              className="btn-ghost w-48 text-sm"
            >
              設定
            </button>
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
