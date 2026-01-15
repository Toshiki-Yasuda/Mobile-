/**
 * 音声設定コンポーネント
 * BGM/SFX トグルと音量スライダーを管理
 */

import React from 'react';
import { motion } from 'framer-motion';

interface AudioControlsProps {
  soundEnabled: boolean;
  bgmEnabled: boolean;
  soundVolume: number;
  bgmVolume: number;
  onSoundEnabledChange: (enabled: boolean) => void;
  onBgmEnabledChange: (enabled: boolean) => void;
  onSoundVolumeChange: (volume: number) => void;
  onBgmVolumeChange: (volume: number) => void;
  onPlayBgm: () => void;
  onPauseBgm: () => void;
}

export const AudioControls: React.FC<AudioControlsProps> = ({
  soundEnabled,
  bgmEnabled,
  soundVolume,
  bgmVolume,
  onSoundEnabledChange,
  onBgmEnabledChange,
  onSoundVolumeChange,
  onBgmVolumeChange,
  onPlayBgm,
  onPauseBgm,
}) => {
  const handleBgmToggle = () => {
    const newState = !bgmEnabled;
    onBgmEnabledChange(newState);
    if (newState) {
      onPlayBgm();
    } else {
      onPauseBgm();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="flex flex-col items-center gap-4 mt-8"
    >
      {/* トグルボタン */}
      <div className="flex items-center gap-6">
        {/* SFX トグル */}
        <button
          onClick={() => onSoundEnabledChange(!soundEnabled)}
          className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-all ${
            soundEnabled
              ? 'bg-hunter-gold/10 text-hunter-gold border border-hunter-gold/30'
              : 'text-white/30 hover:text-white/50 border border-transparent'
          }`}
        >
          <span className="text-xl">{soundEnabled ? '🔊' : '🔇'}</span>
          <span className="font-title text-[10px] tracking-wider">SFX</span>
        </button>

        {/* BGM トグル */}
        <button
          onClick={handleBgmToggle}
          className={`flex flex-col items-center gap-1 p-3 rounded-lg transition-all ${
            bgmEnabled
              ? 'bg-hunter-gold/10 text-hunter-gold border border-hunter-gold/30'
              : 'text-white/30 hover:text-white/50 border border-transparent'
          }`}
        >
          <span className="text-xl">{bgmEnabled ? '🎵' : '🔕'}</span>
          <span className="font-title text-[10px] tracking-wider">BGM</span>
        </button>
      </div>

      {/* 音量スライダー */}
      <div className="flex flex-col gap-2">
        {/* SFX音量 */}
        {soundEnabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex items-center gap-3 bg-hunter-dark-light/30 rounded-lg px-4 py-2 border border-hunter-gold/20"
          >
            <span className="text-xs text-white/50 w-8">SFX</span>
            <input
              type="range"
              min="0"
              max="100"
              value={soundVolume}
              onChange={(e) => onSoundVolumeChange(Number(e.target.value))}
              className="w-24 h-1.5 bg-hunter-dark rounded-full appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-4
                [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-hunter-gold
                [&::-webkit-slider-thumb]:cursor-pointer"
            />
            <span className="font-title text-xs text-hunter-gold w-8">{soundVolume}%</span>
          </motion.div>
        )}

        {/* BGM音量 */}
        {bgmEnabled && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex items-center gap-3 bg-hunter-dark-light/30 rounded-lg px-4 py-2 border border-hunter-gold/20"
          >
            <span className="text-xs text-white/50 w-8">BGM</span>
            <input
              type="range"
              min="0"
              max="100"
              value={bgmVolume}
              onChange={(e) => onBgmVolumeChange(Number(e.target.value))}
              className="w-24 h-1.5 bg-hunter-dark rounded-full appearance-none cursor-pointer
                [&::-webkit-slider-thumb]:appearance-none
                [&::-webkit-slider-thumb]:w-4
                [&::-webkit-slider-thumb]:h-4
                [&::-webkit-slider-thumb]:rounded-full
                [&::-webkit-slider-thumb]:bg-hunter-gold
                [&::-webkit-slider-thumb]:cursor-pointer"
            />
            <span className="font-title text-xs text-hunter-gold w-8">{bgmVolume}%</span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default AudioControls;
