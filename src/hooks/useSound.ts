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
    
    // AudioContextがsuspended状態の場合はresume（確実に有効化）
    if (audioContextRef.current.state === 'suspended') {
      try {
        await audioContextRef.current.resume();
        // resume後もsuspendedの場合は再試行
        if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
        }
      } catch (error) {
        console.warn('AudioContext resume failed:', error);
        // エラーが発生した場合は新しいコンテキストを作成
        try {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch (e) {
          console.error('Failed to create AudioContext:', e);
        }
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
      const baseVolume = volume * 0.6; // 0.6に設定して音量を上げる
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
      const baseVolume = volume * 0.4; // 0.3から0.4に上げる

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
   * ミス音 - 柔らかく控えめな音に変更
   */
  const playMissSound = useCallback(() => {
    // 柔らかいtriangle波で、短く控えめな音
    playOscillator(350, 'triangle', 0.08);
  }, [playOscillator]);

  /**
   * ゲーム開始音
   */
  const playStartSound = useCallback(() => {
    // 上昇する音で開始感を出す（確実に鳴るように音量を上げる）
    playRichSound([300, 450, 600], 'square', 0.25);
  }, [playRichSound]);

  /**
   * ボタンクリック音
   */
  const playClickSound = useCallback(() => {
    // 軽快なクリック音（確実に鳴るように音量を上げる）
    playOscillator(600, 'square', 0.06);
  }, [playOscillator]);

  /**
   * メニュー選択音（チャプター選択など）- 気持ちの良い上昇音
   */
  const playMenuSelectSound = useCallback(async () => {
    if (!soundEnabled) return;
    
    try {
      const ctx = await getAudioContext();
      if (ctx.state === 'suspended') await ctx.resume();
      
      const volume = soundVolume / 100;
      const baseVolume = volume * 0.5;
      
      // 気持ちの良い2音の上昇メロディー
      const notes = [
        { freq: 523.25, delay: 0, duration: 0.12 },    // C5
        { freq: 783.99, delay: 60, duration: 0.15 },   // G5
      ];
      
      notes.forEach((note) => {
        setTimeout(() => {
          const oscillator = ctx.createOscillator();
          const gainNode = ctx.createGain();
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(note.freq, ctx.currentTime);
          
          gainNode.gain.setValueAtTime(0, ctx.currentTime);
          gainNode.gain.linearRampToValueAtTime(baseVolume, ctx.currentTime + 0.02);
          gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + note.duration);
          
          oscillator.connect(gainNode);
          gainNode.connect(ctx.destination);
          oscillator.start();
          oscillator.stop(ctx.currentTime + note.duration);
        }, note.delay);
      });
    } catch (error) {
      console.warn('Menu select sound failed:', error);
    }
  }, [getAudioContext, soundEnabled, soundVolume]);

  /**
   * ステージ選択音 - より印象的で気持ちの良い音
   */
  const playStageSelectSound = useCallback(async () => {
    if (!soundEnabled) return;
    
    try {
      const ctx = await getAudioContext();
      if (ctx.state === 'suspended') await ctx.resume();
      
      const volume = soundVolume / 100;
      const baseVolume = volume * 0.6;
      
      // 気持ちの良い3音の上昇メロディー（決意感のある音）
      const notes = [
        { freq: 392, delay: 0, duration: 0.1 },       // G4
        { freq: 523.25, delay: 50, duration: 0.12 },   // C5
        { freq: 659.25, delay: 100, duration: 0.18 },  // E5
      ];
      
      notes.forEach((note) => {
        setTimeout(() => {
          const oscillator = ctx.createOscillator();
          const gainNode = ctx.createGain();
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(note.freq, ctx.currentTime);
          
          // エンベロープ
          gainNode.gain.setValueAtTime(0, ctx.currentTime);
          gainNode.gain.linearRampToValueAtTime(baseVolume, ctx.currentTime + 0.015);
          gainNode.gain.setValueAtTime(baseVolume * 0.9, ctx.currentTime + note.duration * 0.5);
          gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + note.duration);
          
          oscillator.connect(gainNode);
          gainNode.connect(ctx.destination);
          oscillator.start();
          oscillator.stop(ctx.currentTime + note.duration);
        }, note.delay);
      });
    } catch (error) {
      console.warn('Stage select sound failed:', error);
    }
  }, [getAudioContext, soundEnabled, soundVolume]);

  /**
   * 達成音（ステージクリア時）
   */
  const playSuccessSound = useCallback(() => {
    // 達成感のある上昇するメロディー
    const playSequence = async () => {
      if (!soundEnabled) return;
      try {
        const ctx = await getAudioContext();
        if (ctx.state === 'suspended') await ctx.resume();
        
        const volume = soundVolume / 100;
        const baseVolume = volume * 0.5;
        
        // メロディー的な音のシーケンス
        const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 (Cメジャー和音)
        notes.forEach((freq, index) => {
          setTimeout(() => {
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();
            oscillator.type = 'sine';
            oscillator.frequency.setValueAtTime(freq, ctx.currentTime);
            gainNode.gain.setValueAtTime(baseVolume, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);
            oscillator.start();
            oscillator.stop(ctx.currentTime + 0.2);
          }, index * 100);
        });
      } catch (error) {
        console.warn('Success sound failed:', error);
      }
    };
    playSequence();
  }, [getAudioContext, soundEnabled, soundVolume]);

  /**
   * 達成感のある音（ランクメッセージ表示時）
   */
  const playAchievementSound = useCallback((rank: 'S' | 'A' | 'B' | 'C') => {
    if (!soundEnabled) return;
    
    const playSequence = async () => {
      try {
        const ctx = await getAudioContext();
        if (ctx.state === 'suspended') await ctx.resume();
        
        const volume = soundVolume / 100;
        const baseVolume = volume * 0.7; // より大きく聞こえるように
        
        // ランクに応じた達成感のあるメロディー
        const rankMelodies = {
          'S': [
            { freq: 523.25, delay: 0, duration: 0.25 },    // C5
            { freq: 659.25, delay: 50, duration: 0.25 },    // E5
            { freq: 783.99, delay: 100, duration: 0.3 },    // G5
            { freq: 987.77, delay: 150, duration: 0.3 },    // B5
            { freq: 1174.66, delay: 200, duration: 0.4 },  // D6
          ],
          'A': [
            { freq: 440, delay: 0, duration: 0.2 },        // A4
            { freq: 523.25, delay: 50, duration: 0.25 },    // C5
            { freq: 659.25, delay: 100, duration: 0.3 },    // E5
            { freq: 783.99, delay: 150, duration: 0.35 },  // G5
          ],
          'B': [
            { freq: 392, delay: 0, duration: 0.2 },         // G4
            { freq: 493.88, delay: 60, duration: 0.25 },    // B4
            { freq: 587.33, delay: 120, duration: 0.3 },    // D5
            { freq: 659.25, delay: 180, duration: 0.35 },  // E5
            { freq: 783.99, delay: 240, duration: 0.4 },   // G5 (達成感のある上昇)
          ],
          'C': [
            { freq: 349.23, delay: 0, duration: 0.2 },      // F4
            { freq: 392, delay: 50, duration: 0.25 },      // G4
            { freq: 440, delay: 100, duration: 0.3 },      // A4
          ],
        };
        
        const melody = rankMelodies[rank];
        melody.forEach((note) => {
          setTimeout(() => {
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();
            oscillator.type = rank === 'S' || rank === 'B' ? 'sine' : 'square';
            oscillator.frequency.setValueAtTime(note.freq, ctx.currentTime);
            
            // エンベロープ: アタック → サステイン → リリース
            gainNode.gain.setValueAtTime(0, ctx.currentTime);
            gainNode.gain.linearRampToValueAtTime(baseVolume, ctx.currentTime + 0.05);
            gainNode.gain.setValueAtTime(baseVolume, ctx.currentTime + note.duration * 0.7);
            gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + note.duration);
            
            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);
            oscillator.start();
            oscillator.stop(ctx.currentTime + note.duration);
          }, note.delay);
        });
      } catch (error) {
        console.warn('Achievement sound failed:', error);
      }
    };
    playSequence();
  }, [getAudioContext, soundEnabled, soundVolume]);

  /**
   * 結果画面表示音（ランクに応じた音）
   */
  const playResultSound = useCallback((rank: 'S' | 'A' | 'B' | 'C') => {
    if (!soundEnabled) return;
    
    const playSequence = async () => {
      try {
        const ctx = await getAudioContext();
        if (ctx.state === 'suspended') await ctx.resume();
        
        const volume = soundVolume / 100;
        const baseVolume = volume * 0.6;
        
        // ランクに応じた音の高さと長さ
        const rankConfig = {
          'S': { frequencies: [659.25, 783.99, 987.77, 1174.66], duration: 0.3 }, // E5, G5, B5, D6
          'A': { frequencies: [523.25, 659.25, 783.99], duration: 0.25 }, // C5, E5, G5
          'B': { frequencies: [440, 523.25, 659.25], duration: 0.2 }, // A4, C5, E5
          'C': { frequencies: [392, 493.88], duration: 0.15 }, // G4, B4
        };
        
        const config = rankConfig[rank];
        config.frequencies.forEach((freq, index) => {
          setTimeout(() => {
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();
            oscillator.type = rank === 'S' ? 'sine' : 'square';
            oscillator.frequency.setValueAtTime(freq, ctx.currentTime);
            gainNode.gain.setValueAtTime(baseVolume, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + config.duration);
            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);
            oscillator.start();
            oscillator.stop(ctx.currentTime + config.duration);
          }, index * 80);
        });
      } catch (error) {
        console.warn('Result sound failed:', error);
      }
    };
    playSequence();
  }, [getAudioContext, soundEnabled, soundVolume]);

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
  };
}

