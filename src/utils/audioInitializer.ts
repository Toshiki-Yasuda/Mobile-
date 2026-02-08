/**
 * AudioContext初期化ユーティリティ
 * ブラウザのオーディオ再生を有効化するための共通関数
 */

/**
 * AudioContextを初期化してオーディオ再生を有効化
 * ユーザーインタラクション時に一度だけ呼び出す
 */
export async function initializeAudioContext(): Promise<void> {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    const ctx = new AudioContext();

    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    // 無音の短い音を再生してAudioContextを有効化
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.frequency.setValueAtTime(440, ctx.currentTime);
    gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.01);

    ctx.close();
  } catch (error) {
    console.warn('AudioContext initialization failed:', error);
  }
}
