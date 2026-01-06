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
    <div className="screen-container">
      <div className="text-center">
        {/* ローディングアニメーション */}
        <div className="relative w-20 h-20 mx-auto mb-6">
          <div className="absolute inset-0 border-4 border-pop-purple/20 rounded-full" />
          <div className="absolute inset-0 border-4 border-transparent border-t-pop-pink border-r-pop-purple rounded-full animate-spin" />
        </div>

        {/* メッセージ */}
        <p className="text-pop-purple font-bold text-lg mb-4">{message} ✨</p>

        {/* プログレスバー（任意） */}
        {progress !== undefined && (
          <div className="w-64 mx-auto">
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-pop-pink to-pop-purple transition-all duration-300 ease-out rounded-full"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-pop-purple font-bold text-sm mt-2">{progress}%</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Loading;
