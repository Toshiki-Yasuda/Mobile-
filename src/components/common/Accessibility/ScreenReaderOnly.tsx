import type { ReactNode } from 'react';

interface ScreenReaderOnlyProps {
  children: ReactNode;
  /** 追加のクラス名 */
  className?: string;
  /** HTML要素タイプ（デフォルト: span） */
  as?: 'span' | 'div' | 'p' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

/**
 * スクリーンリーダー専用コンポーネント
 * 視覚的には非表示だが、スクリーンリーダーには読み上げられる
 *
 * @example
 * <ScreenReaderOnly>現在のスコア: 100点</ScreenReaderOnly>
 */
export const ScreenReaderOnly = ({
  children,
  className = '',
  as: Component = 'span'
}: ScreenReaderOnlyProps) => {
  return (
    <Component className={`sr-only ${className}`}>
      {children}
    </Component>
  );
};

export default ScreenReaderOnly;
