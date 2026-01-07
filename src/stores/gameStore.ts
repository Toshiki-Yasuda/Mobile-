/**
 * ゲーム状態管理ストア
 * 
 * 画面遷移、タイピングセッション、ローディング、エラー状態を管理
 */

import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import type { Screen, LoadingState, ErrorState, Word, ErrorType } from '@/types/game';
import type { TypingState } from '@/types/romaji';

// ===== タイピングセッション =====
interface TypingSession {
  words: Word[];
  currentWordIndex: number;
  typingState: TypingState | null;
  score: number;
  correctCount: number;
  missCount: number;
  combo: number;
  maxCombo: number;
  startTime: number | null;
  endTime: number | null;
}

// ===== ストア型定義 =====
interface GameStore {
  // === 画面状態 ===
  currentScreen: Screen;
  previousScreen: Screen | null;

  // === 選択中のステージ ===
  selectedChapter: number;
  selectedStage: number;

  // === タイピングセッション ===
  session: TypingSession | null;

  // === ローディング ===
  loading: LoadingState;

  // === エラー ===
  error: ErrorState;

  // === アクション: 画面遷移 ===
  navigateTo: (screen: Screen) => void;
  goBack: () => void;

  // === アクション: ステージ選択 ===
  selectChapter: (chapter: number) => void;
  selectStage: (chapter: number, stage: number) => void;

  // === アクション: タイピングセッション ===
  startSession: (words: Word[]) => void;
  setTypingState: (state: TypingState) => void;
  nextWord: () => void;
  endSession: () => void;
  resetSession: () => void;

  // === アクション: スコア ===
  addScore: (points: number) => void;
  incrementCombo: () => void;
  resetCombo: () => void;
  recordMiss: () => void;

  // === アクション: ローディング ===
  setLoading: (loading: Partial<LoadingState>) => void;
  clearLoading: () => void;

  // === アクション: エラー ===
  setError: (errorType: ErrorType, message: string) => void;
  clearError: () => void;
}

// ===== ストア実装 =====
export const useGameStore = create<GameStore>()(
  devtools(
    subscribeWithSelector((set, get) => ({
      // === 初期状態 ===
      currentScreen: 'password',
      previousScreen: null,
      selectedChapter: 1,
      selectedStage: 1,
      session: null,
      loading: {
        isLoading: false,
        loadingMessage: '',
        progress: 0,
      },
      error: {
        hasError: false,
        errorType: null,
        errorMessage: '',
      },

      // === 画面遷移 ===
      navigateTo: (screen) =>
        set((state) => ({
          previousScreen: state.currentScreen,
          currentScreen: screen,
        })),

      goBack: () =>
        set((state) => ({
          currentScreen: state.previousScreen || 'title',
          previousScreen: null,
        })),

      // === ステージ選択 ===
      selectChapter: (chapter) => set({ selectedChapter: chapter }),

      selectStage: (chapter, stage) =>
        set({
          selectedChapter: chapter,
          selectedStage: stage,
        }),

      // === タイピングセッション ===
      startSession: (words) =>
        set({
          session: {
            words,
            currentWordIndex: 0,
            typingState: null,
            score: 0,
            correctCount: 0,
            missCount: 0,
            combo: 0,
            maxCombo: 0,
            startTime: Date.now(),
            endTime: null,
          },
        }),

      setTypingState: (typingState) =>
        set((state) => {
          if (!state.session) return state;
          return {
            session: {
              ...state.session,
              typingState,
            },
          };
        }),

      nextWord: () =>
        set((state) => {
          if (!state.session) return state;
          return {
            session: {
              ...state.session,
              currentWordIndex: state.session.currentWordIndex + 1,
              typingState: null,
            },
          };
        }),

      endSession: () =>
        set((state) => {
          if (!state.session) return state;
          return {
            session: {
              ...state.session,
              endTime: Date.now(),
            },
          };
        }),

      resetSession: () => set({ session: null }),

      // === スコア ===
      addScore: (points) =>
        set((state) => {
          if (!state.session) return state;
          return {
            session: {
              ...state.session,
              score: state.session.score + points,
            },
          };
        }),

      incrementCombo: () =>
        set((state) => {
          if (!state.session) return state;
          const newCombo = state.session.combo + 1;
          return {
            session: {
              ...state.session,
              combo: newCombo,
              maxCombo: Math.max(state.session.maxCombo, newCombo),
              correctCount: state.session.correctCount + 1,
            },
          };
        }),

      resetCombo: () =>
        set((state) => {
          if (!state.session) return state;
          return {
            session: {
              ...state.session,
              combo: 0,
            },
          };
        }),

      recordMiss: () =>
        set((state) => {
          if (!state.session) return state;
          return {
            session: {
              ...state.session,
              missCount: state.session.missCount + 1,
              combo: 0,
            },
          };
        }),

      // === ローディング ===
      setLoading: (loading) =>
        set((state) => ({
          loading: { ...state.loading, ...loading, isLoading: true },
        })),

      clearLoading: () =>
        set({
          loading: { isLoading: false, loadingMessage: '', progress: 0 },
        }),

      // === エラー ===
      setError: (errorType, message) =>
        set({
          error: {
            hasError: true,
            errorType,
            errorMessage: message,
          },
        }),

      clearError: () =>
        set({
          error: { hasError: false, errorType: null, errorMessage: '' },
        }),
    })),
    { name: 'game-store' }
  )
);
