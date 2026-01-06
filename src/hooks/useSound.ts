/**
 * 音声を管理するカスタムフック
 * Tone.jsを使用してリッチな効果音を生成
 */

import { useCallback, useRef, useEffect } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';
import * as Tone from 'tone';

// シンセサイザーインスタンスをモジュールレベルで保持（再利用）
let synth: Tone.PolySynth | null = null;
let metalSynth: Tone.MetalSynth | null = null;
let membraneSynth: Tone.MembraneSynth | null = null;
let reverb: Tone.Reverb | null = null;
let isInitialized = false;

// Tone.jsの初期化
async function initializeTone() {
  if (isInitialized) return;
  
  try {
    await Tone.start();
    
    // リバーブエフェクト（軽め）
    reverb = new Tone.Reverb({
      decay: 1.2,
      wet: 0.15,
    }).toDestination();
    await reverb.ready;
    
    // メインシンセサイザー（PolySynth for 和音対応）
    synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: {
        type: 'sine',
      },
      envelope: {
        attack: 0.01,
        decay: 0.1,
        sustain: 0.3,
        release: 0.3,
      },
    }).connect(reverb);
    
    // メタリックな音用（クリック音など）
    metalSynth = new Tone.MetalSynth({
      frequency: 200,
      envelope: {
        attack: 0.001,
        decay: 0.1,
        release: 0.1,
      },
      harmonicity: 5.1,
      modulationIndex: 32,
      resonance: 4000,
      octaves: 1.5,
    }).toDestination();
    
    // 低音用（ミス音など）
    membraneSynth = new Tone.MembraneSynth({
      pitchDecay: 0.05,
      octaves: 4,
      oscillator: {
        type: 'sine',
      },
      envelope: {
        attack: 0.001,
        decay: 0.2,
        sustain: 0,
        release: 0.2,
      },
    }).toDestination();
    
    isInitialized = true;
  } catch (error) {
    console.warn('Tone.js initialization failed:', error);
  }
}

export function useSound() {
  const { soundEnabled, soundVolume } = useSettingsStore();
  const isReadyRef = useRef(false);

  // 初期化とクリーンアップ
  useEffect(() => {
    // ユーザーインタラクションで初期化
    const handleInteraction = async () => {
      if (!isReadyRef.current) {
        await initializeTone();
        isReadyRef.current = true;
      }
    };

    // 既に初期化済みかチェック
    if (isInitialized) {
      isReadyRef.current = true;
    }

    // ユーザーインタラクションで初期化をトリガー
    window.addEventListener('click', handleInteraction, { once: true });
    window.addEventListener('keydown', handleInteraction, { once: true });
    window.addEventListener('touchstart', handleInteraction, { once: true });

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, []);

  // 音量を設定（-60dB〜0dB）
  const getVolume = useCallback(() => {
    const normalized = soundVolume / 100;
    // 0-100 を -40dB〜0dB に変換（対数スケール）
    return normalized > 0 ? -40 + (normalized * 40) : -Infinity;
  }, [soundVolume]);

  // Tone.jsの準備確認
  const ensureReady = useCallback(async () => {
    if (!soundEnabled) return false;
    
    if (!isInitialized) {
      await initializeTone();
    }
    
    if (Tone.context.state !== 'running') {
      await Tone.start();
    }
    
    return true;
  }, [soundEnabled]);

  /**
   * タイピング音 - 心地よいクリック感
   */
  const playTypeSound = useCallback(async () => {
    if (!await ensureReady()) return;
    
    try {
      const vol = getVolume();
      
      // カスタムシンセで軽快なタイプ音
      const typeSynth = new Tone.Synth({
        oscillator: { type: 'triangle' },
        envelope: {
          attack: 0.001,
          decay: 0.05,
          sustain: 0,
          release: 0.05,
        },
      }).toDestination();
      
      typeSynth.volume.value = vol - 5;
      typeSynth.triggerAttackRelease('C5', '32n');
      
      // クリーンアップ
      setTimeout(() => typeSynth.dispose(), 200);
    } catch (error) {
      console.warn('Type sound failed:', error);
    }
  }, [ensureReady, getVolume]);

  /**
   * タイピング確定音（Enter）- 満足感のある音
   */
  const playConfirmSound = useCallback(async () => {
    if (!await ensureReady()) return;
    
    try {
      const vol = getVolume();
      
      // 和音で確定感を出す
      const confirmSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: {
          attack: 0.01,
          decay: 0.15,
          sustain: 0.2,
          release: 0.3,
        },
      }).toDestination();
      
      confirmSynth.volume.value = vol - 3;
      
      // Cメジャー和音（明るく確定的）
      confirmSynth.triggerAttackRelease(['C4', 'E4', 'G4'], '8n');
      
      setTimeout(() => confirmSynth.dispose(), 500);
    } catch (error) {
      console.warn('Confirm sound failed:', error);
    }
  }, [ensureReady, getVolume]);

  /**
   * ミス音 - 柔らかく控えめ
   */
  const playMissSound = useCallback(async () => {
    if (!await ensureReady()) return;
    
    try {
      const vol = getVolume();
      
      // 柔らかい低音
      const missSynth = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: {
          attack: 0.01,
          decay: 0.1,
          sustain: 0,
          release: 0.1,
        },
      }).toDestination();
      
      missSynth.volume.value = vol - 10;
      missSynth.triggerAttackRelease('E3', '16n');
      
      setTimeout(() => missSynth.dispose(), 200);
    } catch (error) {
      console.warn('Miss sound failed:', error);
    }
  }, [ensureReady, getVolume]);

  /**
   * ゲーム開始音 - ワクワク感
   */
  const playStartSound = useCallback(async () => {
    if (!await ensureReady()) return;
    
    try {
      const vol = getVolume();
      
      const startSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: {
          attack: 0.02,
          decay: 0.2,
          sustain: 0.3,
          release: 0.5,
        },
      });
      
      // リバーブ付き
      const startReverb = new Tone.Reverb({ decay: 1.5, wet: 0.3 }).toDestination();
      await startReverb.ready;
      startSynth.connect(startReverb);
      
      startSynth.volume.value = vol;
      
      // 上昇するアルペジオ
      const now = Tone.now();
      startSynth.triggerAttackRelease('C4', '8n', now);
      startSynth.triggerAttackRelease('E4', '8n', now + 0.08);
      startSynth.triggerAttackRelease('G4', '8n', now + 0.16);
      startSynth.triggerAttackRelease('C5', '4n', now + 0.24);
      
      setTimeout(() => {
        startSynth.dispose();
        startReverb.dispose();
      }, 1500);
    } catch (error) {
      console.warn('Start sound failed:', error);
    }
  }, [ensureReady, getVolume]);

  /**
   * ボタンクリック音 - 軽快
   */
  const playClickSound = useCallback(async () => {
    if (!await ensureReady()) return;
    
    try {
      const vol = getVolume();
      
      const clickSynth = new Tone.Synth({
        oscillator: { type: 'triangle' },
        envelope: {
          attack: 0.001,
          decay: 0.03,
          sustain: 0,
          release: 0.03,
        },
      }).toDestination();
      
      clickSynth.volume.value = vol - 8;
      clickSynth.triggerAttackRelease('G5', '64n');
      
      setTimeout(() => clickSynth.dispose(), 100);
    } catch (error) {
      console.warn('Click sound failed:', error);
    }
  }, [ensureReady, getVolume]);

  /**
   * メニュー選択音（チャプター選択） - 優しい上昇音
   */
  const playMenuSelectSound = useCallback(async () => {
    if (!await ensureReady()) return;
    
    try {
      const vol = getVolume();
      
      const menuSynth = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: {
          attack: 0.01,
          decay: 0.1,
          sustain: 0.1,
          release: 0.2,
        },
      }).toDestination();
      
      menuSynth.volume.value = vol - 5;
      
      const now = Tone.now();
      menuSynth.triggerAttackRelease('E5', '16n', now);
      menuSynth.triggerAttackRelease('A5', '8n', now + 0.05);
      
      setTimeout(() => menuSynth.dispose(), 400);
    } catch (error) {
      console.warn('Menu select sound failed:', error);
    }
  }, [ensureReady, getVolume]);

  /**
   * ステージ選択音 - 決意感のある音
   */
  const playStageSelectSound = useCallback(async () => {
    if (!await ensureReady()) return;
    
    try {
      const vol = getVolume();
      
      const stageSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: {
          attack: 0.01,
          decay: 0.15,
          sustain: 0.2,
          release: 0.3,
        },
      }).toDestination();
      
      stageSynth.volume.value = vol - 3;
      
      const now = Tone.now();
      stageSynth.triggerAttackRelease('G4', '16n', now);
      stageSynth.triggerAttackRelease('C5', '16n', now + 0.05);
      stageSynth.triggerAttackRelease(['E5', 'G5'], '8n', now + 0.1);
      
      setTimeout(() => stageSynth.dispose(), 600);
    } catch (error) {
      console.warn('Stage select sound failed:', error);
    }
  }, [ensureReady, getVolume]);

  /**
   * 成功音（ステージクリア） - 達成感
   */
  const playSuccessSound = useCallback(async () => {
    if (!await ensureReady()) return;
    
    try {
      const vol = getVolume();
      
      const successSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: {
          attack: 0.02,
          decay: 0.2,
          sustain: 0.3,
          release: 0.5,
        },
      });
      
      const successReverb = new Tone.Reverb({ decay: 2, wet: 0.25 }).toDestination();
      await successReverb.ready;
      successSynth.connect(successReverb);
      
      successSynth.volume.value = vol;
      
      // 華やかな上昇アルペジオ
      const now = Tone.now();
      successSynth.triggerAttackRelease('C5', '8n', now);
      successSynth.triggerAttackRelease('E5', '8n', now + 0.1);
      successSynth.triggerAttackRelease('G5', '8n', now + 0.2);
      successSynth.triggerAttackRelease(['C6', 'E6'], '4n', now + 0.3);
      
      setTimeout(() => {
        successSynth.dispose();
        successReverb.dispose();
      }, 2000);
    } catch (error) {
      console.warn('Success sound failed:', error);
    }
  }, [ensureReady, getVolume]);

  /**
   * ランクメッセージ表示音 - ランクに応じた達成感
   */
  const playAchievementSound = useCallback(async (rank: 'S' | 'A' | 'B' | 'C') => {
    if (!await ensureReady()) return;
    
    try {
      const vol = getVolume();
      
      const achieveSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: {
          attack: 0.02,
          decay: 0.25,
          sustain: 0.4,
          release: 0.6,
        },
      });
      
      const achieveReverb = new Tone.Reverb({ 
        decay: rank === 'S' ? 3 : 2, 
        wet: rank === 'S' ? 0.35 : 0.25 
      }).toDestination();
      await achieveReverb.ready;
      achieveSynth.connect(achieveReverb);
      
      achieveSynth.volume.value = vol + (rank === 'S' ? 3 : 0);
      
      const now = Tone.now();
      
      switch (rank) {
        case 'S':
          // 壮大なファンファーレ
          achieveSynth.triggerAttackRelease('C5', '8n', now);
          achieveSynth.triggerAttackRelease('E5', '8n', now + 0.12);
          achieveSynth.triggerAttackRelease('G5', '8n', now + 0.24);
          achieveSynth.triggerAttackRelease('C6', '8n', now + 0.36);
          achieveSynth.triggerAttackRelease(['E6', 'G6', 'C7'], '2n', now + 0.48);
          break;
        case 'A':
          // 明るい達成音
          achieveSynth.triggerAttackRelease('A4', '8n', now);
          achieveSynth.triggerAttackRelease('C5', '8n', now + 0.1);
          achieveSynth.triggerAttackRelease('E5', '8n', now + 0.2);
          achieveSynth.triggerAttackRelease(['A5', 'C6'], '4n', now + 0.3);
          break;
        case 'B':
          // 穏やかな成功音
          achieveSynth.triggerAttackRelease('G4', '8n', now);
          achieveSynth.triggerAttackRelease('B4', '8n', now + 0.1);
          achieveSynth.triggerAttackRelease('D5', '8n', now + 0.2);
          achieveSynth.triggerAttackRelease('G5', '4n', now + 0.3);
          break;
        case 'C':
          // 控えめな完了音
          achieveSynth.triggerAttackRelease('F4', '8n', now);
          achieveSynth.triggerAttackRelease('A4', '8n', now + 0.1);
          achieveSynth.triggerAttackRelease('C5', '4n', now + 0.2);
          break;
      }
      
      setTimeout(() => {
        achieveSynth.dispose();
        achieveReverb.dispose();
      }, 3000);
    } catch (error) {
      console.warn('Achievement sound failed:', error);
    }
  }, [ensureReady, getVolume]);

  /**
   * 結果画面表示音
   */
  const playResultSound = useCallback(async (rank: 'S' | 'A' | 'B' | 'C') => {
    if (!await ensureReady()) return;
    
    try {
      const vol = getVolume();
      
      const resultSynth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: {
          attack: 0.01,
          decay: 0.15,
          sustain: 0.2,
          release: 0.3,
        },
      }).toDestination();
      
      resultSynth.volume.value = vol - 2;
      
      const notes = {
        'S': ['E5', 'G5', 'B5', 'D6'],
        'A': ['C5', 'E5', 'G5'],
        'B': ['A4', 'C5', 'E5'],
        'C': ['G4', 'B4'],
      };
      
      const now = Tone.now();
      notes[rank].forEach((note, i) => {
        resultSynth.triggerAttackRelease(note, '8n', now + i * 0.08);
      });
      
      setTimeout(() => resultSynth.dispose(), 800);
    } catch (error) {
      console.warn('Result sound failed:', error);
    }
  }, [ensureReady, getVolume]);

  /**
   * コンボ達成音
   */
  const playComboSound = useCallback(async (combo: number) => {
    if (!await ensureReady()) return;
    
    try {
      const vol = getVolume();
      
      // コンボ数に応じて音程を上げる
      const baseNote = Math.min(60 + Math.floor(combo / 5) * 2, 84); // C4からC6まで
      
      const comboSynth = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: {
          attack: 0.005,
          decay: 0.08,
          sustain: 0,
          release: 0.1,
        },
      }).toDestination();
      
      comboSynth.volume.value = vol - 8;
      comboSynth.triggerAttackRelease(Tone.Frequency(baseNote, 'midi').toNote(), '32n');
      
      setTimeout(() => comboSynth.dispose(), 200);
    } catch (error) {
      console.warn('Combo sound failed:', error);
    }
  }, [ensureReady, getVolume]);

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
