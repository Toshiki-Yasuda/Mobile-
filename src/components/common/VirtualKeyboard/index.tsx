/**
 * バーチャルキーボードコンポーネント
 * タイピング画面で次に打つべきキーをハイライト表示
 */

import React from 'react';
import { motion } from 'framer-motion';

interface VirtualKeyboardProps {
  activeKeys: string[];
}

export const VirtualKeyboard: React.FC<VirtualKeyboardProps> = ({ activeKeys }) => {
  const rows = [
    ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
    ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
    ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
  ];

  return (
    <div className="flex flex-col items-center gap-2 p-4 bg-hunter-dark-light/50 backdrop-blur-sm border border-hunter-gold/20 rounded-xl">
      {rows.map((row, rowIndex) => (
        <div
          key={rowIndex}
          className="flex gap-1.5"
          style={{ marginLeft: rowIndex * 20 }}
        >
          {row.map((key) => {
            const isActive = activeKeys.includes(key);
            return (
              <motion.div
                key={key}
                className={isActive ? 'keyboard-key-highlight' : 'keyboard-key'}
                animate={isActive ? { scale: 1.1 } : { scale: 1 }}
                transition={{ duration: 0.1 }}
              >
                {key.toUpperCase()}
              </motion.div>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default VirtualKeyboard;

