/**
 * ダーク/ライトモード管理フック
 * settings store のdarkMode設定に基づいてテーマを適用
 */

import { useEffect } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';

export const useTheme = () => {
  const darkMode = useSettingsStore((state) => state.darkMode);
  const setDarkMode = useSettingsStore((state) => state.setDarkMode);

  useEffect(() => {
    const root = document.documentElement;

    if (darkMode) {
      // ダークモード: Hunter×Hunterダークテーマ
      root.classList.remove('light-mode');
      root.classList.add('dark-mode');
      root.style.colorScheme = 'dark';
    } else {
      // ライトモード
      root.classList.remove('dark-mode');
      root.classList.add('light-mode');
      root.style.colorScheme = 'light';
    }
  }, [darkMode]);

  return {
    darkMode,
    setDarkMode,
    toggleDarkMode: () => setDarkMode(!darkMode),
  };
};

export default useTheme;
