/**
 * 音声を管理するカスタムフック
 * AudioContextを使用して、ファイルを必要とせずに基本的な音を生成したり、
 * 将来的に音声ファイルを再生するための基盤を提供します。
 */

import { useCallback, useRef, useEffect } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';

export function useSound() {
  const { soundEnabled, soundVolume } = useSettingsStore();
  const audioContextRef = useRef<AudioContext | null>(null);

  // AudioContextの初期化とクリーンアップ
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close().catch(() => {
          // エラーは無視（既に閉じられている場合など）
        });
      }
    };
  }, []);

  const getAudioContext = useCallback(async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    // AudioContextがsuspended状態の場合はresume
    if (audioContextRef.current.state === 'suspended') {
      try {
        await audioContextRef.current.resume();
      } catch (error) {
        console.warn('AudioContext resume failed:', error);
      }
    }
    
    return audioContextRef.current;
  }, []);

  /**
   * 単純な電子音を生成して再生
   */
  const playOscillator = useCallback(async (frequency: number, type: OscillatorType = 'sine', duration: number = 0.1) => {
    if (!soundEnabled) return;

    try {
      const ctx = await getAudioContext();
      
      // AudioContextの状態を確認してresume
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

      // 音量の設定 (0-100 を 0-1 に変換、より聞こえやすい音量に)
      const volume = soundVolume / 100;
      const baseVolume = volume * 0.5; // 0.5に設定して音量を上げる
      gainNode.gain.setValueAtTime(baseVolume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start();
      oscillator.stop(ctx.currentTime + duration);
    } catch (error) {
      // 音声再生エラーは無視（ユーザーインタラクション前など）
      console.warn('Sound playback failed:', error);
    }
  }, [getAudioContext, soundEnabled, soundVolume]);

  /**
   * 重厚な音を生成（複数のオシレーターを重ねる）
   */
  const playRichSound = useCallback(async (
    frequencies: number[],
    type: OscillatorType = 'square',
    duration: number = 0.1
  ) => {
    if (!soundEnabled) return;

    try {
      const ctx = await getAudioContext();
      
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const gainNode = ctx.createGain();
      const volume = soundVolume / 100;
      const baseVolume = volume * 0.3;

      // 各周波数でオシレーターを作成
      frequencies.forEach((freq, index) => {
        const oscillator = ctx.createOscillator();
        oscillator.type = type;
        oscillator.frequency.setValueAtTime(freq, ctx.currentTime);
        
        // 各音の音量を少しずつ変えて深みを出す
        const individualGain = ctx.createGain();
        const individualVolume = baseVolume * (1 - index * 0.2);
        individualGain.gain.setValueAtTime(individualVolume, ctx.currentTime);
        individualGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        
        oscillator.connect(individualGain);
        individualGain.connect(gainNode);
        
        oscillator.start();
        oscillator.stop(ctx.currentTime + duration);
      });

      // マスターゲイン
      gainNode.gain.setValueAtTime(baseVolume, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      gainNode.connect(ctx.destination);
    } catch (error) {
      console.warn('Rich sound playback failed:', error);
    }
  }, [getAudioContext, soundEnabled, soundVolume]);

  /**
   * タイピング音 (通常) - より重厚に
   */
  const playTypeSound = useCallback(() => {
    // 低めの周波数でsquare波を使用して重厚感を出す
    playRichSound([200, 300], 'square', 0.08);
  }, [playRichSound]);

  /**
   * タイピング音 (決定/Enter) - 重厚な和音
   */
  const playConfirmSound = useCallback(() => {
    // 重厚な和音: 3つの音を重ねる
    playRichSound([400, 600, 800], 'square', 0.2);
  }, [playRichSound]);

  /**
   * ミス音 - より重厚に
   */
  const playMissSound = useCallback(() => {
    playRichSound([100, 150], 'sawtooth', 0.15);
  }, [playRichSound]);

  /**
   * ゲーム開始音
   */
  const playStartSound = useCallback(() => {
    // 上昇する音で開始感を出す
    playRichSound([300, 450, 600], 'square', 0.3);
  }, [playRichSound]);

  /**
   * ボタンクリック音
   */
  const playClickSound = useCallback(() => {
    // 軽快なクリック音
    playOscillator(800, 'square', 0.05);
  }, [playOscillator]);

  return {
    playTypeSound,
    playConfirmSound,
    playMissSound,
    playStartSound,
    playClickSound,
  };
}

