/**
 * 設定画面コンポーネント
 * 音声、表示設定を管理
 */

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useButtonClick } from '@/utils/soundUtils';
import { BackgroundEffect } from '@/components/common/BackgroundEffect';

type RomajiGuideLevel = 'full' | 'partial' | 'none';
type ParticleQuality = 'auto' | 'high' | 'medium' | 'low';

const ROMAJI_GUIDE_OPTIONS: { value: RomajiGuideLevel; label: string; description: string }[] = [
  { value: 'full', label: '全表示', description: '全てのローマ字を表示' },
  { value: 'partial', label: '一部表示', description: '最初の数文字のみ表示' },
  { value: 'none', label: '非表示', description: 'ローマ字ガイドなし' },
];

const PARTICLE_QUALITY_OPTIONS: { value: ParticleQuality; label: string; description: string }[] = [
  { value: 'auto', label: '自動', description: '端末に応じて最適化' },
  { value: 'high', label: '高', description: 'パーティクル最大表示' },
  { value: 'medium', label: '中', description: 'バランス型' },
  { value: 'low', label: '低', description: 'パーティクル最小' },
];

export const SettingsScreen: React.FC = () => {
  const { navigateTo } = useGameStore();
  const {
    soundEnabled,
    bgmEnabled,
    soundVolume,
    bgmVolume,
    keyboardVisible,
    romajiGuideLevel,
    darkMode,
    particleQuality,
    reduceAnimations,
    setSoundEnabled,
    setBgmEnabled,
    setSoundVolume,
    setBgmVolume,
    setKeyboardVisible,
    setRomajiGuideLevel,
    setDarkMode,
    setParticleQuality,
    setReduceAnimations,
    resetSettings,
  } = useSettingsStore();
  const { handleClick } = useButtonClick();

  const handleReset = () => {
    if (window.confirm('設定を初期状態に戻しますか？')) {
      resetSettings();
    }
  };

  // キーボード操作
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        navigateTo('title');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigateTo]);

  return (
    <div className="min-h-screen bg-hunter-dark relative overflow-hidden">
      <BackgroundEffect variant="default" />

      {/* ヘッダー */}
      <header className="relative z-10 p-4 lg:p-6 border-b border-hunter-gold/10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button
            onClick={handleClick(() => navigateTo('title'))}
            className="font-title text-hunter-gold/60 hover:text-hunter-gold transition tracking-wider text-sm uppercase"
          >
            ← BACK
          </button>
          <h1 className="font-title text-xl lg:text-2xl font-bold text-white tracking-wider">
            SETTINGS
          </h1>
          <div className="w-16" />
        </div>
      </header>

      {/* 設定コンテンツ */}
      <main className="relative z-10 p-4 lg:p-8">
        <div className="max-w-2xl mx-auto space-y-6">

          {/* 音声設定セクション */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-hunter-dark-light/40 border border-hunter-gold/20 rounded-lg p-5"
          >
            <h2 className="font-title text-hunter-gold text-sm tracking-[0.2em] mb-4 uppercase">
              Sound Settings
            </h2>

            {/* 効果音 */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-white text-sm">効果音</span>
                  <p className="text-white/40 text-xs mt-0.5">タイピング音やボタン音</p>
                </div>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`w-14 h-7 rounded-full relative transition-colors ${
                    soundEnabled ? 'bg-hunter-gold' : 'bg-hunter-dark-light'
                  }`}
                >
                  <motion.div
                    className="w-5 h-5 bg-white rounded-full absolute top-1"
                    animate={{ left: soundEnabled ? '1.75rem' : '0.25rem' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>

              {/* 効果音音量 */}
              {soundEnabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="flex items-center gap-4 pl-4 border-l-2 border-hunter-gold/20"
                >
                  <span className="text-white/60 text-xs w-12">音量</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={soundVolume}
                    onChange={(e) => setSoundVolume(Number(e.target.value))}
                    className="flex-1 h-1.5 bg-hunter-dark rounded-full appearance-none cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none
                      [&::-webkit-slider-thumb]:w-4
                      [&::-webkit-slider-thumb]:h-4
                      [&::-webkit-slider-thumb]:rounded-full
                      [&::-webkit-slider-thumb]:bg-hunter-gold
                      [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                  <span className="font-title text-hunter-gold text-sm w-12 text-right">
                    {soundVolume}%
                  </span>
                </motion.div>
              )}

              <div className="h-px bg-hunter-gold/10" />

              {/* BGM */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-white text-sm">BGM</span>
                  <p className="text-white/40 text-xs mt-0.5">バックグラウンドミュージック</p>
                </div>
                <button
                  onClick={() => setBgmEnabled(!bgmEnabled)}
                  className={`w-14 h-7 rounded-full relative transition-colors ${
                    bgmEnabled ? 'bg-hunter-gold' : 'bg-hunter-dark-light'
                  }`}
                >
                  <motion.div
                    className="w-5 h-5 bg-white rounded-full absolute top-1"
                    animate={{ left: bgmEnabled ? '1.75rem' : '0.25rem' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>

              {/* BGM音量 */}
              {bgmEnabled && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="flex items-center gap-4 pl-4 border-l-2 border-hunter-gold/20"
                >
                  <span className="text-white/60 text-xs w-12">音量</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={bgmVolume}
                    onChange={(e) => setBgmVolume(Number(e.target.value))}
                    className="flex-1 h-1.5 bg-hunter-dark rounded-full appearance-none cursor-pointer
                      [&::-webkit-slider-thumb]:appearance-none
                      [&::-webkit-slider-thumb]:w-4
                      [&::-webkit-slider-thumb]:h-4
                      [&::-webkit-slider-thumb]:rounded-full
                      [&::-webkit-slider-thumb]:bg-hunter-gold
                      [&::-webkit-slider-thumb]:cursor-pointer"
                  />
                  <span className="font-title text-hunter-gold text-sm w-12 text-right">
                    {bgmVolume}%
                  </span>
                </motion.div>
              )}
            </div>
          </motion.section>

          {/* 表示設定セクション */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-hunter-dark-light/40 border border-hunter-gold/20 rounded-lg p-5"
          >
            <h2 className="font-title text-hunter-gold text-sm tracking-[0.2em] mb-4 uppercase">
              Display Settings
            </h2>

            <div className="space-y-4">
              {/* キーボード表示 */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-white text-sm">キーボード表示</span>
                  <p className="text-white/40 text-xs mt-0.5">仮想キーボードを表示</p>
                </div>
                <button
                  onClick={() => setKeyboardVisible(!keyboardVisible)}
                  className={`w-14 h-7 rounded-full relative transition-colors ${
                    keyboardVisible ? 'bg-hunter-gold' : 'bg-hunter-dark-light'
                  }`}
                >
                  <motion.div
                    className="w-5 h-5 bg-white rounded-full absolute top-1"
                    animate={{ left: keyboardVisible ? '1.75rem' : '0.25rem' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>

              <div className="h-px bg-hunter-gold/10" />

              {/* ダークモード */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-white text-sm">ダークモード</span>
                  <p className="text-white/40 text-xs mt-0.5">ダークモード/ライトモード</p>
                </div>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`w-14 h-7 rounded-full relative transition-colors ${
                    darkMode ? 'bg-hunter-gold' : 'bg-hunter-dark-light'
                  }`}
                >
                  <motion.div
                    className="w-5 h-5 bg-white rounded-full absolute top-1"
                    animate={{ left: darkMode ? '1.75rem' : '0.25rem' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>

              <div className="h-px bg-hunter-gold/10" />

              {/* ローマ字ガイド */}
              <div>
                <div className="mb-3">
                  <span className="text-white text-sm">ローマ字ガイド</span>
                  <p className="text-white/40 text-xs mt-0.5">入力ガイドの表示レベル</p>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {ROMAJI_GUIDE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setRomajiGuideLevel(option.value)}
                      className={`p-3 rounded-lg border transition-all text-center ${
                        romajiGuideLevel === option.value
                          ? 'bg-hunter-gold/20 border-hunter-gold text-hunter-gold'
                          : 'bg-hunter-dark-light/30 border-hunter-gold/10 text-white/60 hover:border-hunter-gold/30'
                      }`}
                    >
                      <div className="font-title text-sm tracking-wider">{option.label}</div>
                      <div className="text-[10px] mt-1 opacity-60">{option.description}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.section>

          {/* パフォーマンス設定セクション */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-hunter-dark-light/40 border border-hunter-gold/20 rounded-lg p-5"
          >
            <h2 className="font-title text-hunter-gold text-sm tracking-[0.2em] mb-4 uppercase">
              Performance Settings
            </h2>

            <div className="space-y-4">
              {/* パーティクル品質 */}
              <div>
                <div className="mb-3">
                  <span className="text-white text-sm">パーティクル品質</span>
                  <p className="text-white/40 text-xs mt-0.5">爆発エフェクトなどの表示品質</p>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {PARTICLE_QUALITY_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setParticleQuality(option.value)}
                      className={`p-2 rounded-lg border transition-all text-center text-xs ${
                        particleQuality === option.value
                          ? 'bg-hunter-gold/20 border-hunter-gold text-hunter-gold'
                          : 'bg-hunter-dark-light/30 border-hunter-gold/10 text-white/60 hover:border-hunter-gold/30'
                      }`}
                    >
                      <div className="font-title tracking-wider">{option.label}</div>
                      <div className="text-[9px] mt-0.5 opacity-60">{option.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-px bg-hunter-gold/10" />

              {/* アニメーション削減 */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-white text-sm">アニメーション削減</span>
                  <p className="text-white/40 text-xs mt-0.5">すべてのアニメーションを最小化</p>
                </div>
                <button
                  onClick={() => setReduceAnimations(!reduceAnimations)}
                  className={`w-14 h-7 rounded-full relative transition-colors ${
                    reduceAnimations ? 'bg-hunter-gold' : 'bg-hunter-dark-light'
                  }`}
                >
                  <motion.div
                    className="w-5 h-5 bg-white rounded-full absolute top-1"
                    animate={{ left: reduceAnimations ? '1.75rem' : '0.25rem' }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>
            </div>
          </motion.section>

          {/* リセットボタン */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center pt-4"
          >
            <button
              onClick={handleClick(handleReset)}
              className="bg-transparent border border-red-500/30 hover:border-red-500/60 text-red-400/60 hover:text-red-400 px-6 py-2 rounded-lg font-title text-sm tracking-wider transition-all"
            >
              RESET TO DEFAULT
            </button>
          </motion.div>

          {/* 情報 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center pt-6"
          >
            <p className="font-title text-hunter-gold/30 text-xs tracking-wider">
              設定は自動的に保存されます
            </p>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default SettingsScreen;
