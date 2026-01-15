/**
 * ボスセリフ表示コンポーネント
 * ボスの感情や状況に応じたセリフ表示
 */

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface BossDialogProps {
  message: string | null;
  duration?: number;
  priority?: 'low' | 'normal' | 'high';
}

export const BossDialog: React.FC<BossDialogProps> = ({
  message,
  duration = 3000,
  priority = 'normal',
}) => {
  const [isVisible, setIsVisible] = useState(!!message);
  const [currentMessage, setCurrentMessage] = useState(message);

  useEffect(() => {
    if (message) {
      setCurrentMessage(message);
      setIsVisible(true);
      const timer = setTimeout(() => setIsVisible(false), duration);
      return () => clearTimeout(timer);
    }
  }, [message, duration]);

  const getBorderColor = () => {
    switch (priority) {
      case 'high':
        return 'border-red-500';
      case 'low':
        return 'border-gray-500';
      default:
        return 'border-hunter-gold';
    }
  };

  const getBackgroundColor = () => {
    switch (priority) {
      case 'high':
        return 'bg-red-900/90';
      case 'low':
        return 'bg-gray-800/80';
      default:
        return 'bg-black/80';
    }
  };

  const getTextColor = () => {
    switch (priority) {
      case 'high':
        return 'text-red-300';
      case 'low':
        return 'text-gray-300';
      default:
        return 'text-white';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && currentMessage && (
        <motion.div
          key={currentMessage}
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50"
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ duration: 0.3 }}
        >
          <div
            className={`${getBackgroundColor()} ${getTextColor()} px-8 py-4 rounded-lg border-3 ${getBorderColor()} max-w-2xl shadow-2xl`}
          >
            {/* セリフ */}
            <p className="text-center text-lg font-title drop-shadow-lg leading-relaxed">
              {currentMessage}
            </p>

            {/* 優先度インジケーター */}
            {priority === 'high' && (
              <motion.div
                className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 px-3 py-1 rounded-full text-xs font-bold text-white"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                ⚠️ 重要
              </motion.div>
            )}

            {/* アニメーション: パルス */}
            <motion.div
              className={`absolute -inset-1 rounded-lg border-2 ${getBorderColor()} pointer-events-none`}
              initial={{ opacity: 0 }}
              animate={{ opacity: [0, 0.5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>

          {/* スピーチバブルの三角 */}
          <div
            className={`absolute left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-t-8 ${
              priority === 'high' ? 'border-l-transparent border-r-transparent border-t-red-900' :
              priority === 'low' ? 'border-l-transparent border-r-transparent border-t-gray-800' :
              'border-l-transparent border-r-transparent border-t-black'
            }`}
            style={{
              top: '100%',
              marginTop: '-2px',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BossDialog;
