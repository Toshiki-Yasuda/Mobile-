/**
 * gameStore 用セレクター
 * 個別プロパティのセレクターで不要な再レンダリングを防止
 */
import type { useGameStore } from '@/stores/gameStore';

type GameState = ReturnType<typeof useGameStore.getState>;

// 画面状態
export const selectCurrentScreen = (s: GameState) => s.currentScreen;
export const selectLoading = (s: GameState) => s.loading;
export const selectError = (s: GameState) => s.error;

// セッション
export const selectSession = (s: GameState) => s.session;
export const selectSelectedChapter = (s: GameState) => s.selectedChapter;
export const selectSelectedStage = (s: GameState) => s.selectedStage;
export const selectIsBossBattle = (s: GameState) => s.isBossBattle;

// アクション
export const selectNavigateTo = (s: GameState) => s.navigateTo;
export const selectClearError = (s: GameState) => s.clearError;
export const selectSelectChapter = (s: GameState) => s.selectChapter;
