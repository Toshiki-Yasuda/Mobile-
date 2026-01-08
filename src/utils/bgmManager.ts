/**
 * BGM管理ユーティリティ
 * グローバルにBGMの再生・停止・音量調整を行う
 */

// BGMトラック定義
export const BGM_TRACKS = {
  opening: '/Mobile-/opening-bgm.mp3',
  game: '/Mobile-/game-bgm.mp3',
} as const;

export type BGMTrack = keyof typeof BGM_TRACKS;

let bgmAudio: HTMLAudioElement | null = null;
let originalVolume = 0.7;
let currentTrack: BGMTrack | null = null;

export const bgmManager = {
  /**
   * BGMオーディオを取得または作成
   */
  getAudio: (src?: string): HTMLAudioElement => {
    if (!bgmAudio) {
      bgmAudio = new Audio(src || BGM_TRACKS.opening);
      bgmAudio.loop = true;
    }
    return bgmAudio;
  },

  /**
   * BGMトラックを切り替え
   */
  switchTrack: (track: BGMTrack): void => {
    if (currentTrack === track && bgmAudio) return;

    const wasPlaying = bgmManager.isPlaying();
    const prevVolume = bgmAudio?.volume || originalVolume;

    if (bgmAudio) {
      bgmAudio.pause();
      bgmAudio.src = '';
    }

    bgmAudio = new Audio(BGM_TRACKS[track]);
    bgmAudio.loop = true;
    bgmAudio.volume = prevVolume;
    currentTrack = track;

    if (wasPlaying) {
      bgmAudio.play().catch(() => {});
    }
  },

  /**
   * BGMを再生
   */
  play: (volume?: number): Promise<void> => {
    const audio = bgmManager.getAudio();
    if (volume !== undefined) {
      originalVolume = volume;
      audio.volume = volume;
    }
    return audio.play().catch(err => {
      console.warn('BGM再生に失敗:', err);
    });
  },

  /**
   * BGMを一時停止
   */
  pause: (): void => {
    if (bgmAudio) {
      bgmAudio.pause();
    }
  },

  /**
   * 音量を設定
   */
  setVolume: (volume: number): void => {
    if (bgmAudio) {
      bgmAudio.volume = Math.max(0, Math.min(1, volume));
    }
  },

  /**
   * 元の音量に戻す
   */
  restoreVolume: (): void => {
    if (bgmAudio) {
      bgmAudio.volume = originalVolume;
    }
  },

  /**
   * 元の音量を設定（フルボリュームの基準）
   */
  setOriginalVolume: (volume: number): void => {
    originalVolume = volume;
  },

  /**
   * 音量を下げる（ゲームプレイ中用）
   */
  lowerVolume: (ratio: number = 0.2): void => {
    if (bgmAudio) {
      bgmAudio.volume = originalVolume * ratio;
    }
  },

  /**
   * 再生中かどうか
   */
  isPlaying: (): boolean => {
    return bgmAudio ? !bgmAudio.paused : false;
  },
};




