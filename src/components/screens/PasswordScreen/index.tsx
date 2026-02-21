/**
 * パスワード入力画面
 * ゲーム開始前にパスワードを入力する画面
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useGameStore } from '@/stores/gameStore';
import { selectNavigateTo } from '@/stores/selectors/gameSelectors';

const CORRECT_PASSWORD = 'SAKI';

export const PasswordScreen: React.FC = () => {
  const navigateTo = useGameStore(selectNavigateTo);
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key.length === 1 && /^[a-zA-Z]$/.test(e.key)) {
      if (input.length < CORRECT_PASSWORD.length) {
        setInput(prev => prev + e.key.toUpperCase());
        setError(false);
      }
    } else if (e.key === 'Backspace') {
      setInput(prev => prev.slice(0, -1));
      setError(false);
    } else if (e.key === 'Enter') {
      if (input === CORRECT_PASSWORD) {
        navigateTo('title');
      } else {
        setError(true);
        setInput('');
      }
    }
  }, [input, navigateTo]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="min-h-screen bg-hunter-dark flex flex-col items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_left,rgba(45,90,39,0.15),transparent_50%)]" />
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,rgba(212,175,55,0.08),transparent_50%)]" />
        <div 
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(212,175,55,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(212,175,55,0.5) 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 text-center"
      >
        <h1 className="font-title text-2xl md:text-3xl text-hunter-gold mb-8 tracking-wider">
          PASSWORD
        </h1>

        <div className="flex justify-center gap-3 mb-8">
          {Array.from({ length: CORRECT_PASSWORD.length }).map((_, i) => (
            <motion.div
              key={i}
              className={`w-12 h-12 md:w-16 md:h-16 rounded-lg border-2 flex items-center justify-center text-2xl md:text-3xl font-bold ${error ? "border-red-500 bg-red-500/10" : input[i] ? "border-hunter-gold bg-hunter-gold/10 text-hunter-gold" : "border-hunter-gold/30 bg-hunter-dark-light/30"}`}
              animate={error ? { x: [-5, 5, -5, 5, 0] } : {}}
              transition={{ duration: 0.3 }}
            >
              {input[i] ? '●' : ''}
            </motion.div>
          ))}
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-red-500 font-title text-sm mb-4"
          >
            INCORRECT PASSWORD
          </motion.p>
        )}

        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-white/50 font-title text-sm tracking-wider"
        >
          Enter password and press ENTER
        </motion.p>
      </motion.div>
    </div>
  );
};

export default PasswordScreen;
