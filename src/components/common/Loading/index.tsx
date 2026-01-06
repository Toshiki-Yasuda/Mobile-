/**
 * ローディングコンポーネント
 */

import React from 'react';

interface LoadingProps {
  message?: string;
  progress?: number;
}

export const Loading: React.FC<LoadingProps> = ({
  message = '読み込み中...',
  progress,
}) => {
  return (
    <div className="screen-container bg-hunter-dark">
      <div className="text-center">
        {/* ローディングアニメーション */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <div className="absolute inset-0 border-4 border-hunter-gold/20 rounded-full" />
          <div className="absolute inset-0 border-4 border-transparent border-t-hunter-gold rounded-full animate-spin" />
        </div>

        {/* メッセージ */}
        <p className="text-hunter-gold text-lg font-game mb-4">{message}</p>

        {/* プログレスバー（任意） */}
        {progress !== undefined && (
          <div className="w-64 mx-auto">
            <div className="h-2 bg-hunter-dark-light rounded-full overflow-hidden">
              <div
                className="h-full bg-hunter-gold transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-hunter-gold/60 text-sm mt-2">{progress}%</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Loading;
