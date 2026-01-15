/**
 * 設定管理ストア
 * 
 * 音声、表示設定を管理し、localStorageに永続化
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { STORAGE_KEYS, STORAGE_VERSION } from '@/constants/storageKeys';
import { DEFAULT_SETTINGS } from '@/constants/config';

// ===== ローマ字ガイドレベル =====
type RomajiGuideLevel = 'full' | 'partial' | 'none';

// ===== ストア型定義 =====
interface SettingsStore {
  // === 音声設定 ===
  soundEnabled: boolean;
  bgmEnabled: boolean;
  soundVolume: number; // 0-100
  bgmVolume: number; // 0-100

  // === 表示設定 ===
  keyboardVisible: boolean;
  romajiGuideLevel: RomajiGuideLevel;
  darkMode: boolean;

  // === ハプティック設定 ===
  hapticEnabled: boolean;
  hapticIntensity: number; // 0-100

  // === アクション ===
  setSoundEnabled: (enabled: boolean) => void;
  setBgmEnabled: (enabled: boolean) => void;
  setSoundVolume: (volume: number) => void;
  setBgmVolume: (volume: number) => void;
  setKeyboardVisible: (visible: boolean) => void;
  setRomajiGuideLevel: (level: RomajiGuideLevel) => void;
  setDarkMode: (darkMode: boolean) => void;
  setHapticEnabled: (enabled: boolean) => void;
  setHapticIntensity: (intensity: number) => void;
  resetSettings: () => void;
}

// ===== ストア実装 =====
export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      // === 初期状態 ===
      ...DEFAULT_SETTINGS,

      // === アクション ===
      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),

      setBgmEnabled: (enabled) => set({ bgmEnabled: enabled }),

      setSoundVolume: (volume) =>
        set({ soundVolume: Math.max(0, Math.min(100, volume)) }),

      setBgmVolume: (volume) =>
        set({ bgmVolume: Math.max(0, Math.min(100, volume)) }),

      setKeyboardVisible: (visible) => set({ keyboardVisible: visible }),

      setRomajiGuideLevel: (level) => set({ romajiGuideLevel: level }),

      setDarkMode: (darkMode) => set({ darkMode }),

      setHapticEnabled: (enabled) => set({ hapticEnabled: enabled }),

      setHapticIntensity: (intensity) =>
        set({ hapticIntensity: Math.max(0, Math.min(100, intensity)) }),

      resetSettings: () => set(DEFAULT_SETTINGS),
    }),
    {
      name: STORAGE_KEYS.SETTINGS,
      version: STORAGE_VERSION.SETTINGS,
      storage: createJSONStorage(() => localStorage),
      // マイグレーション
      migrate: (persistedState: unknown, version: number) => {
        if (version === 0) {
          // v0 → v1 のマイグレーション
          return {
            ...DEFAULT_SETTINGS,
            ...(persistedState as Partial<SettingsStore>),
          };
        }
        return persistedState as SettingsStore;
      },
    }
  )
);
