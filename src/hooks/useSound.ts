/**
 * 音声を管理するカスタムフック
 * MP3ファイルを使用してリッチな効果音を再生
 */

import { useCallback, useEffect, useRef } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';

// 効果音のプリロード用キャッシュ
const audioCache: Record<string, HTMLAudioElement[]> = {};

// ベースパスを取得
const getBasePath = () => import.meta.env.BASE_URL;

// 効果音のパス（複数用意してランダム再生）
const getSoundPaths = () => {
  const basePath = getBasePath();
  return {
    type: [`${basePath}se-type1.mp3`, `${basePath}se-type2.mp3`],
    heavy: [`${basePath}se-heavy1.mp3`, `${basePath}se-heavy2.mp3`, `${basePath}se-heavy3.mp3`],
    complete: [`${basePath}se-complete.mp3`],
    select: [`${basePath}cut.mp3`],
  };
};

// 効果音をプリロード
function preloadSound(key: string, paths: string[], poolSize: number = 3): void {
  if (audioCache[key]) return;
  
  audioCache[key] = [];
  paths.forEach(path => {
    for (let i = 0; i < poolSize; i++) {
      const audio = new Audio(path);
      audio.preload = 'auto';
      audioCache[key].push(audio);
    }
  });
}

// 初期化時にすべての効果音をプリロード
function initializeSounds(): void {
  const SOUND_PATHS = getSoundPaths();
  preloadSound('type', SOUND_PATHS.type, 5);
  preloadSound('heavy', SOUND_PATHS.heavy, 3);
  preloadSound('complete', SOUND_PATHS.complete, 2);
  preloadSound('select', SOUND_PATHS.select, 3);
}

// 使用可能なオーディオを取得（再生中でないもの）
function getAvailableAudio(key: string): HTMLAudioElement | null {
  const pool = audioCache[key];
  if (!pool || pool.length === 0) return null;
  
  // 再生中でないオーディオを探す
  for (const audio of pool) {
    if (audio.paused || audio.ended) {
      return audio;
    }
  }
  
  // すべて再生中の場合は最初のものを返す（停止して再利用）
  const audio = pool[Math.floor(Math.random() * pool.length)];
  audio.currentTime = 0;
  return audio;
}

export function useSound() {
  const { soundEnabled, soundVolume } = useSettingsStore();
  const initializedRef = useRef(false);

  // 初期化
  useEffect(() => {
    if (!initializedRef.current) {
      initializeSounds();
      initializedRef.current = true;
    }
  }, []);

  // 効果音を再生
  const playSound = useCallback((key: string, volumeMultiplier: number = 1) => {
    if (!soundEnabled) return;
    
    const audio = getAvailableAudio(key);
    if (!audio) return;
    
    audio.volume = (soundVolume / 100) * volumeMultiplier;
    audio.currentTime = 0;
    audio.play().catch(err => {
      console.warn('効果音再生に失敗:', err);
    });
  }, [soundEnabled, soundVolume]);

  /**
   * タイピング音（軽いパンチ）
   * コンボが高いほど少し力強い音に
   */
  const playTypeSound = useCallback((combo: number = 0) => {
    // コンボに応じて音量を上げる（0.5 → 0.7）
    const baseVolume = 0.5;
    const comboBonus = Math.min(combo * 0.01, 0.2);
    playSound('type', baseVolume + comboBonus);
  }, [playSound]);

  /**
   * 確定音（スローモーション突入）- 単語完了時の決め音
   * コンボが高いほど派手な音に
   */
  const playConfirmSound = useCallback((combo: number = 0) => {
    // コンボに応じて音量を上げる（0.6 → 0.95）
    const baseVolume = 0.6;
    const comboBonus = Math.min(combo * 0.015, 0.35);
    playSound('complete', baseVolume + comboBonus);
  }, [playSound]);

  /**
   * ミス音（ダメージ感のある音）
   */
  const playMissSound = useCallback(() => {
    // heavy音でダメージ感を演出
    playSound('heavy', 0.5);
  }, [playSound]);

  /**
   * ゲーム開始音
   */
  const playStartSound = useCallback(() => {
    playSound('heavy', 0.8);
  }, [playSound]);

  /**
   * ボタンクリック音（cut.mp3）
   */
  const playClickSound = useCallback(() => {
    playSound('select', 0.7);
  }, [playSound]);

  /**
   * メニュー選択音（cut.mp3）
   */
  const playMenuSelectSound = useCallback(() => {
    playSound('select', 0.7);
  }, [playSound]);

  /**
   * ステージ選択音（cut.mp3）
   */
  const playStageSelectSound = useCallback(() => {
    playSound('select', 0.7);
  }, [playSound]);

  /**
   * 成功音（ステージクリア）- スローモーション突入
   */
  const playSuccessSound = useCallback(() => {
    playSound('complete', 0.9);
  }, [playSound]);

  /**
   * 結果画面表示音
   */
  const playResultSound = useCallback((_rank: 'S' | 'A' | 'B' | 'C') => {
    // ランクに関係なくスローモーション音
    playSound('complete', 0.8);
  }, [playSound]);

  /**
   * ランクメッセージ表示音
   */
  const playAchievementSound = useCallback((rank: 'S' | 'A' | 'B' | 'C') => {
    // ランクに応じて音量を変える
    const volumeByRank = { 'S': 1.0, 'A': 0.9, 'B': 0.8, 'C': 0.7 };
    playSound('heavy', volumeByRank[rank]);
  }, [playSound]);

  /**
   * コンボ音
   */
  const playComboSound = useCallback((combo: number) => {
    // コンボ数に応じて音量を上げる
    const volumeMultiplier = Math.min(0.5 + (combo / 50), 0.9);
    playSound('complete', volumeMultiplier);
  }, [playSound]);

  return {
    playTypeSound,
    playConfirmSound,
    playMissSound,
    playStartSound,
    playClickSound,
    playMenuSelectSound,
    playStageSelectSound,
    playSuccessSound,
    playResultSound,
    playAchievementSound,
    playComboSound,
  };
}
