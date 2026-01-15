/**
 * タイトル画面コンポーネント
 * クール＆スタイリッシュデザイン + 爆発演出
 *
 * サブコンポーネント:
 * - OpeningSequence: オープニング演出
 * - MenuList: メニュー項目
 * - AudioControls: 音声設定
 */

import React, { useEffect, useRef, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useButtonClick } from '@/utils/soundUtils';
import { bgmManager } from '@/utils/bgmManager';
import { OpeningSequence } from './OpeningSequence';
import { MenuList } from './MenuList';
import { AudioControls } from './AudioControls';

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
      bgmManager.switchTrack('opening');
      if (bgmEnabled) {
        const volume = (bgmVolume / 100) * 0.8 * 0.6;
        bgmManager.setOriginalVolume(volume);
        bgmManager.play(volume);
        hasInteractedRef.current = true;
      }
      setExplosionTriggered(false);

      explosionTimerRef.current = setTimeout(() => {
        if (!openingAudioRef.current) {
          openingAudioRef.current = new Audio('/Mobile-/opening.mp3');
          openingAudioRef.current.loop = false;
        }
        const volume = 1.0;
        openingAudioRef.current.volume = volume;
        openingAudioRef.current.currentTime = 0;
        openingAudioRef.current.play().catch(() => {});
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
    bgmManager.switchTrack('game');
    if (bgmEnabled) {
      playBgm();
    }
  }, [bgmEnabled, playBgm]);

  const handleBackToOpening = useCallback(() => {
    bgmManager.switchTrack('opening');
    bgmManager.pause();
    setShowStartOverlay(true);
  }, []);

  const handleNavigate = useCallback((screen: string) => {
    handleClick(() => navigateTo(screen as any))();
  }, [handleClick, navigateTo]);

  // キーボード操作
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
          handleNavigate(MENU_ITEMS[selectedIndex].screen);
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
            handleNavigate(MENU_ITEMS[num].screen);
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showStartOverlay, selectedIndex, handleStart, handleBackToOpening, handleNavigate, navigateTo]);

  return (
    <div className="min-h-screen bg-hunter-dark relative overflow-hidden">
      {/* オープニング演出 */}
      <OpeningSequence
        isVisible={showStartOverlay}
        explosionTriggered={explosionTriggered}
        onStart={handleStart}
      />

      {/* 背景エフェクト */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,rgba(45,90,39,0.15),transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,rgba(212,175,55,0.08),transparent_50%)]" />
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

          {/* メニュー */}
          <MenuList
            selectedIndex={selectedIndex}
            onSelect={handleNavigate}
            onMouseEnter={setSelectedIndex}
            onBackToOpening={handleBackToOpening}
          />

          {/* 音声設定 */}
          <AudioControls
            soundEnabled={soundEnabled}
            bgmEnabled={bgmEnabled}
            soundVolume={soundVolume}
            bgmVolume={bgmVolume}
            onSoundEnabledChange={setSoundEnabled}
            onBgmEnabledChange={setBgmEnabled}
            onSoundVolumeChange={setSoundVolume}
            onBgmVolumeChange={setBgmVolume}
            onPlayBgm={playBgm}
            onPauseBgm={pauseBgm}
          />

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
