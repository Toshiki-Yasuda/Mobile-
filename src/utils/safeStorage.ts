/**
 * Safari Private Mode や容量満杯時にlocalStorageがエラーを投げる問題を防ぐ
 * 安全なストレージラッパー
 */
import { createJSONStorage } from 'zustand/middleware';

const safeLocalStorage: Storage = {
  get length() {
    try {
      return localStorage.length;
    } catch {
      return 0;
    }
  },
  key(index: number) {
    try {
      return localStorage.key(index);
    } catch {
      return null;
    }
  },
  getItem(key: string) {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem(key: string, value: string) {
    try {
      localStorage.setItem(key, value);
    } catch {
      // QuotaExceededError or SecurityError in private mode
    }
  },
  removeItem(key: string) {
    try {
      localStorage.removeItem(key);
    } catch {
      // SecurityError in private mode
    }
  },
  clear() {
    try {
      localStorage.clear();
    } catch {
      // SecurityError in private mode
    }
  },
};

export const createSafeStorage = () => createJSONStorage(() => safeLocalStorage);
