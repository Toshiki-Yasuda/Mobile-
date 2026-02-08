import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGameStore } from '@/stores/gameStore';
import type { Word } from '@/types/game';

describe('gameStore', () => {
  beforeEach(() => {
    useGameStore.setState({
      currentScreen: 'password',
      previousScreen: null,
      selectedChapter: 1,
      selectedStage: 1,
      session: null,
      isBossBattle: false,
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
    });
  });

  describe('初期状態', () => {
    it('currentScreenは"password"', () => {
      const state = useGameStore.getState();
      expect(state.currentScreen).toBe('password');
    });

    it('previousScreenはnull', () => {
      const state = useGameStore.getState();
      expect(state.previousScreen).toBeNull();
    });

    it('sessionはnull', () => {
      const state = useGameStore.getState();
      expect(state.session).toBeNull();
    });

    it('isBossBattleはfalse', () => {
      const state = useGameStore.getState();
      expect(state.isBossBattle).toBe(false);
    });

    it('loadingは初期値', () => {
      const state = useGameStore.getState();
      expect(state.loading).toEqual({
        isLoading: false,
        loadingMessage: '',
        progress: 0,
      });
    });

    it('errorは初期値', () => {
      const state = useGameStore.getState();
      expect(state.error).toEqual({
        hasError: false,
        errorType: null,
        errorMessage: '',
      });
    });
  });

  describe('navigateTo', () => {
    it('画面遷移が正しく動作する', () => {
      const store = useGameStore.getState();
      store.navigateTo('title');

      const state = useGameStore.getState();
      expect(state.currentScreen).toBe('title');
      expect(state.previousScreen).toBe('password');
    });

    it('複数回の遷移でpreviousScreenが更新される', () => {
      const store = useGameStore.getState();
      store.navigateTo('title');
      store.navigateTo('chapterSelect');

      const state = useGameStore.getState();
      expect(state.currentScreen).toBe('chapterSelect');
      expect(state.previousScreen).toBe('title');
    });

    it('history.pushStateが呼ばれる', () => {
      const pushStateSpy = vi.spyOn(history, 'pushState');
      const store = useGameStore.getState();
      store.navigateTo('title');

      expect(pushStateSpy).toHaveBeenCalledWith({ screen: 'title' }, '');
      pushStateSpy.mockRestore();
    });
  });

  describe('goBack', () => {
    it('previousScreenに戻る', () => {
      const store = useGameStore.getState();
      store.navigateTo('title');
      store.navigateTo('chapterSelect');
      store.goBack();

      const state = useGameStore.getState();
      expect(state.currentScreen).toBe('title');
      expect(state.previousScreen).toBeNull();
    });

    it('previousScreenがnullの場合はtitleに戻る', () => {
      const store = useGameStore.getState();
      store.goBack();

      const state = useGameStore.getState();
      expect(state.currentScreen).toBe('title');
      expect(state.previousScreen).toBeNull();
    });
  });

  describe('selectChapter', () => {
    it('チャプターが選択される', () => {
      const store = useGameStore.getState();
      store.selectChapter(3);

      const state = useGameStore.getState();
      expect(state.selectedChapter).toBe(3);
    });
  });

  describe('selectStage', () => {
    it('チャプターとステージが選択される', () => {
      const store = useGameStore.getState();
      store.selectStage(2, 4);

      const state = useGameStore.getState();
      expect(state.selectedChapter).toBe(2);
      expect(state.selectedStage).toBe(4);
    });
  });

  describe('startBossBattle', () => {
    it('ボス戦が開始される', () => {
      const store = useGameStore.getState();
      store.startBossBattle(2);

      const state = useGameStore.getState();
      expect(state.currentScreen).toBe('bossStage');
      expect(state.previousScreen).toBe('password');
      expect(state.selectedChapter).toBe(2);
      expect(state.selectedStage).toBe(6);
      expect(state.isBossBattle).toBe(true);
      expect(state.session).toBeNull();
    });

    it('画面遷移後にstartBossBattleを呼ぶとpreviousScreenが保存される', () => {
      const store = useGameStore.getState();
      store.navigateTo('title');
      store.startBossBattle(1);

      const state = useGameStore.getState();
      expect(state.previousScreen).toBe('title');
      expect(state.currentScreen).toBe('bossStage');
    });
  });

  describe('endBossBattle', () => {
    it('ボス戦が終了する', () => {
      const store = useGameStore.getState();
      store.startBossBattle(1);
      store.endBossBattle();

      const state = useGameStore.getState();
      expect(state.isBossBattle).toBe(false);
      expect(state.session).toBeNull();
    });
  });

  describe('startSession', () => {
    const mockWords: Word[] = [
      { id: '1', text: 'ハンター', reading: 'はんたー', displayText: 'ハンター' },
      { id: '2', text: '試験', reading: 'しけん', displayText: '試験' },
    ];

    it('セッションが開始される', () => {
      const store = useGameStore.getState();
      store.startSession(mockWords);

      const state = useGameStore.getState();
      expect(state.session).not.toBeNull();
      expect(state.session?.words).toEqual(mockWords);
      expect(state.session?.currentWordIndex).toBe(0);
      expect(state.session?.score).toBe(0);
      expect(state.session?.correctCount).toBe(0);
      expect(state.session?.missCount).toBe(0);
      expect(state.session?.combo).toBe(0);
      expect(state.session?.maxCombo).toBe(0);
      expect(state.session?.startTime).toBeTypeOf('number');
      expect(state.session?.endTime).toBeNull();
    });
  });

  describe('incrementCombo', () => {
    const mockWords: Word[] = [
      { id: '1', text: 'ハンター', reading: 'はんたー', displayText: 'ハンター' },
    ];

    it('コンボとcorrectCountが増加する', () => {
      const store = useGameStore.getState();
      store.startSession(mockWords);
      store.incrementCombo();

      const state = useGameStore.getState();
      expect(state.session?.combo).toBe(1);
      expect(state.session?.correctCount).toBe(1);
      expect(state.session?.maxCombo).toBe(1);
    });

    it('maxComboが更新される', () => {
      const store = useGameStore.getState();
      store.startSession(mockWords);
      store.incrementCombo();
      store.incrementCombo();
      store.incrementCombo();

      const state = useGameStore.getState();
      expect(state.session?.combo).toBe(3);
      expect(state.session?.maxCombo).toBe(3);
    });

    it('sessionがnullの場合は何も変更しない', () => {
      const store = useGameStore.getState();
      store.incrementCombo();

      const state = useGameStore.getState();
      expect(state.session).toBeNull();
    });
  });

  describe('recordMiss', () => {
    const mockWords: Word[] = [
      { id: '1', text: 'ハンター', reading: 'はんたー', displayText: 'ハンター' },
    ];

    it('missCountが増加し、comboがリセットされる', () => {
      const store = useGameStore.getState();
      store.startSession(mockWords);
      store.incrementCombo();
      store.incrementCombo();
      store.recordMiss();

      const state = useGameStore.getState();
      expect(state.session?.missCount).toBe(1);
      expect(state.session?.combo).toBe(0);
      expect(state.session?.maxCombo).toBe(2);
    });

    it('sessionがnullの場合は何も変更しない', () => {
      const store = useGameStore.getState();
      store.recordMiss();

      const state = useGameStore.getState();
      expect(state.session).toBeNull();
    });
  });

  describe('addScore', () => {
    const mockWords: Word[] = [
      { id: '1', text: 'ハンター', reading: 'はんたー', displayText: 'ハンター' },
    ];

    it('スコアが加算される', () => {
      const store = useGameStore.getState();
      store.startSession(mockWords);
      store.addScore(100);

      const state = useGameStore.getState();
      expect(state.session?.score).toBe(100);
    });

    it('複数回加算できる', () => {
      const store = useGameStore.getState();
      store.startSession(mockWords);
      store.addScore(100);
      store.addScore(50);
      store.addScore(25);

      const state = useGameStore.getState();
      expect(state.session?.score).toBe(175);
    });

    it('sessionがnullの場合は何も変更しない', () => {
      const store = useGameStore.getState();
      store.addScore(100);

      const state = useGameStore.getState();
      expect(state.session).toBeNull();
    });
  });

  describe('endSession', () => {
    const mockWords: Word[] = [
      { id: '1', text: 'ハンター', reading: 'はんたー', displayText: 'ハンター' },
    ];

    it('endTimeが設定される', () => {
      const store = useGameStore.getState();
      store.startSession(mockWords);
      store.endSession();

      const state = useGameStore.getState();
      expect(state.session?.endTime).toBeTypeOf('number');
    });

    it('sessionがnullの場合は何も変更しない', () => {
      const store = useGameStore.getState();
      store.endSession();

      const state = useGameStore.getState();
      expect(state.session).toBeNull();
    });
  });

  describe('resetSession', () => {
    const mockWords: Word[] = [
      { id: '1', text: 'ハンター', reading: 'はんたー', displayText: 'ハンター' },
    ];

    it('sessionがnullになる', () => {
      const store = useGameStore.getState();
      store.startSession(mockWords);
      store.resetSession();

      const state = useGameStore.getState();
      expect(state.session).toBeNull();
    });
  });

  describe('setError', () => {
    it('エラー状態が設定される', () => {
      const store = useGameStore.getState();
      store.setError('network', 'ネットワークエラー');

      const state = useGameStore.getState();
      expect(state.error.hasError).toBe(true);
      expect(state.error.errorType).toBe('network');
      expect(state.error.errorMessage).toBe('ネットワークエラー');
    });
  });

  describe('clearError', () => {
    it('エラー状態がクリアされる', () => {
      const store = useGameStore.getState();
      store.setError('network', 'ネットワークエラー');
      store.clearError();

      const state = useGameStore.getState();
      expect(state.error.hasError).toBe(false);
      expect(state.error.errorType).toBeNull();
      expect(state.error.errorMessage).toBe('');
    });
  });

  describe('setLoading', () => {
    it('ローディング状態が設定される', () => {
      const store = useGameStore.getState();
      store.setLoading({ loadingMessage: 'ロード中', progress: 50 });

      const state = useGameStore.getState();
      expect(state.loading.isLoading).toBe(true);
      expect(state.loading.loadingMessage).toBe('ロード中');
      expect(state.loading.progress).toBe(50);
    });

    it('部分更新が可能', () => {
      const store = useGameStore.getState();
      store.setLoading({ loadingMessage: 'ロード中' });

      const state = useGameStore.getState();
      expect(state.loading.isLoading).toBe(true);
      expect(state.loading.loadingMessage).toBe('ロード中');
      expect(state.loading.progress).toBe(0);
    });
  });

  describe('clearLoading', () => {
    it('ローディング状態がクリアされる', () => {
      const store = useGameStore.getState();
      store.setLoading({ loadingMessage: 'ロード中', progress: 50 });
      store.clearLoading();

      const state = useGameStore.getState();
      expect(state.loading.isLoading).toBe(false);
      expect(state.loading.loadingMessage).toBe('');
      expect(state.loading.progress).toBe(0);
    });
  });
});
