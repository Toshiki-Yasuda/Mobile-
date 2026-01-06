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
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

      // 音量の設定 (0-100 を 0-1 に変換)
      const volume = soundVolume / 100;
      gainNode.gain.setValueAtTime(volume * 0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

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
   * タイピング音 (通常)
   */
  const playTypeSound = useCallback(() => {
    playOscillator(440, 'sine', 0.05);
  }, [playOscillator]);

  /**
   * タイピング音 (決定/Enter)
   */
  const playConfirmSound = useCallback(() => {
    // 爽快な決定音: 2つの音を重ねて鳴らす
    playOscillator(880, 'sine', 0.15);
    setTimeout(() => {
      playOscillator(1320, 'sine', 0.1);
    }, 50);
  }, [playOscillator]);

  /**
   * ミス音
   */
  const playMissSound = useCallback(() => {
    playOscillator(150, 'sawtooth', 0.1);
  }, [playOscillator]);

  return {
    playTypeSound,
    playConfirmSound,
    playMissSound,
  };
}

