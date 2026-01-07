/**
 * サイドパネルコンポーネント
 * PC表示時の左右サイドバー
 */

import React, { ReactNode } from 'react';

interface SidePanelProps {
  children: ReactNode;
  position?: 'left' | 'right';
  className?: string;
}

export const SidePanel: React.FC<SidePanelProps> = ({
  children,
  position = 'left',
  className = '',
}) => {
  const borderClass = position === 'left' 
    ? 'border-r border-hunter-gold/20' 
    : 'border-l border-hunter-gold/20';

  return (
    <aside
      className={`hidden lg:flex lg:w-56 xl:w-64 flex-col ${borderClass} bg-hunter-dark/50 backdrop-blur-sm ${className}`}
    >
      {children}
    </aside>
  );
};

interface SidePanelSectionProps {
  children: ReactNode;
  title?: string;
  borderBottom?: boolean;
  borderTop?: boolean;
  className?: string;
}

export const SidePanelSection: React.FC<SidePanelSectionProps> = ({
  children,
  title,
  borderBottom = false,
  borderTop = false,
  className = '',
}) => (
  <div
    className={`p-6 ${borderBottom ? 'border-b border-hunter-gold/10' : ''} ${
      borderTop ? 'border-t border-hunter-gold/10' : ''
    } ${className}`}
  >
    {title && (
      <div className="text-hunter-gold/50 text-xs uppercase tracking-widest mb-4">
        {title}
      </div>
    )}
    {children}
  </div>
);

interface SidePanelHeaderProps {
  onBack: () => void;
  backLabel?: string;
}

export const SidePanelHeader: React.FC<SidePanelHeaderProps> = ({
  onBack,
  backLabel = '戻る',
}) => (
  <div className="p-6 border-b border-hunter-gold/20">
    <button
      onClick={onBack}
      className="flex items-center gap-2 text-hunter-gold/60 hover:text-hunter-gold transition group"
    >
      <span className="text-xl group-hover:-translate-x-1 transition-transform">
        ←
      </span>
      <span>{backLabel}</span>
    </button>
  </div>
);

export default SidePanel;

