/**
 * メニュー項目描画コンポーネント
 * メインメニュー、サブメニュー、バックボタンを管理
 */

import React from 'react';
import { motion } from 'framer-motion';

const MENU_ITEMS = [
  { label: 'START TRAINING', screen: 'levelSelect' as const, isMain: true },
  { label: 'TIME ATTACK', screen: 'timeAttack' as const, comingSoon: true },
  { label: 'FREE PRACTICE', screen: 'freePlay' as const, comingSoon: true },
  { label: 'STATISTICS', screen: 'statistics' as const },
  { label: 'SETTINGS', screen: 'settings' as const },
  { label: 'ADMIN', screen: 'admin' as const },
];

interface MenuListProps {
  selectedIndex: number;
  onSelect: (screen: string) => void;
  onMouseEnter: (index: number) => void;
  onBackToOpening: () => void;
}

export const MenuList: React.FC<MenuListProps> = ({
  selectedIndex,
  onSelect,
  onMouseEnter,
  onBackToOpening,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="w-full max-w-sm space-y-4"
    >
      {/* メインボタン */}
      <motion.button
        onClick={() => onSelect(MENU_ITEMS[0].screen)}
        onMouseEnter={() => onMouseEnter(0)}
        className={`w-full relative group overflow-hidden ${selectedIndex === 0 ? 'ring-2 ring-hunter-gold' : ''}`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        animate={selectedIndex === 0 ? { scale: 1.02 } : { scale: 1 }}
      >
        <div className="absolute inset-0 bg-hunter-green/80 rounded-lg" />
        <div className={`absolute inset-0 bg-gradient-to-r from-hunter-green to-hunter-green-light transition-opacity rounded-lg ${selectedIndex === 0 ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
        <div className="relative font-title text-white font-bold py-4 px-8 rounded-lg text-lg tracking-wider uppercase flex items-center justify-center gap-3 border border-hunter-green-light/30">
          <span className="text-xl">▶</span>
          <span>{MENU_ITEMS[0].label}</span>
          <span className="ml-auto text-xs opacity-50">1</span>
        </div>
      </motion.button>

      {/* サブメニュー */}
      <div className="space-y-2">
        {MENU_ITEMS.slice(1).map((item, index) => {
          const menuIndex = index + 1;
          const isSelected = selectedIndex === menuIndex;
          return (
            <motion.button
              key={item.label}
              onClick={() => onSelect(item.screen)}
              onMouseEnter={() => onMouseEnter(menuIndex)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: isSelected ? 4 : 0 }}
              transition={{ delay: 0.3 + index * 0.08 }}
              whileHover={{ scale: 1.02, x: 4 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full rounded-lg py-3 px-4 transition-all font-title tracking-wider uppercase text-sm flex items-center justify-between ${
                isSelected
                  ? 'bg-hunter-dark-light/60 border-hunter-gold/60 text-white border-2'
                  : 'bg-hunter-dark-light/30 hover:bg-hunter-dark-light/60 border border-hunter-gold/20 hover:border-hunter-gold/40 text-white/70 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2">
                {item.label}
                {item.comingSoon && (
                  <span className="text-[10px] bg-hunter-gold/20 text-hunter-gold px-2 py-0.5 rounded-full border border-hunter-gold/40">
                    準備中
                  </span>
                )}
              </span>
              <span className="text-xs opacity-50">{menuIndex + 1}</span>
            </motion.button>
          );
        })}
      </div>

      {/* オープニングに戻るボタン */}
      <motion.button
        onClick={onBackToOpening}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full mt-4 bg-transparent border border-hunter-gold/10 hover:border-hunter-gold/30 rounded-lg py-2 px-4 transition-all text-white/40 hover:text-white/60 font-title tracking-wider uppercase text-xs"
      >
        ← BACK TO OPENING
      </motion.button>
    </motion.div>
  );
};

export default MenuList;
