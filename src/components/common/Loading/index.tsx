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
    <div className="screen-container bg-background">
      <div className="text-center">
        {/* ローディングアニメーション */}
        <div className="relative w-16 h-16 mx-auto mb-6">
          <div className="absolute inset-0 border-2 border-muted rounded-full" />
          <div className="absolute inset-0 border-2 border-transparent border-t-accent rounded-full animate-spin" />
        </div>

        {/* メッセージ */}
        <p className="text-secondary text-sm mb-4">{message}</p>

        {/* プログレスバー（任意） */}
        {progress !== undefined && (
          <div className="w-64 mx-auto">
            <div className="h-1 bg-surface rounded-full overflow-hidden">
              <div
                className="h-full bg-accent transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-muted text-xs mt-2">{progress}%</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Loading;
