/**
 * BGM管理ユーティリティ
 * グローバルにBGMの再生・停止・音量調整を行う
 */

let bgmAudio: HTMLAudioElement | null = null;
let originalVolume = 0.7;

export const bgmManager = {
  /**
   * BGMオーディオを取得または作成
   */
  getAudio: (src?: string): HTMLAudioElement => {
    if (!bgmAudio) {
      bgmAudio = new Audio(src || '/Mobile-/bgm-title.mp3');
      bgmAudio.loop = true;
    }
    return bgmAudio;
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


