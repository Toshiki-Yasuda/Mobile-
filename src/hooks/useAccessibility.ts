import { useEffect, useState, useCallback, useRef } from 'react';

/**
 * アクセシビリティ設定を検出・管理するHook
 */
export const useAccessibilityPreferences = () => {
  const [reducedMotion, setReducedMotion] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  useEffect(() => {
    // アニメーション軽減設定を検出
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(motionQuery.matches);

    const handleMotionChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    motionQuery.addEventListener('change', handleMotionChange);

    // 高コントラスト設定を検出
    const contrastQuery = window.matchMedia('(prefers-contrast: more)');
    setHighContrast(contrastQuery.matches);

    const handleContrastChange = (e: MediaQueryListEvent) => {
      setHighContrast(e.matches);
    };

    contrastQuery.addEventListener('change', handleContrastChange);

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange);
      contrastQuery.removeEventListener('change', handleContrastChange);
    };
  }, []);

  return { reducedMotion, highContrast };
};

/**
 * 画面遷移時のフォーカス管理Hook
 */
export const useFocusManagement = (screenName: string) => {
  const mainRef = useRef<HTMLElement>(null);
  const previousScreenRef = useRef<string | null>(null);

  useEffect(() => {
    // 画面が変わった時のみフォーカスを移動
    if (previousScreenRef.current !== screenName) {
      previousScreenRef.current = screenName;

      // 少し遅延させてDOMが更新されてからフォーカス
      const timer = setTimeout(() => {
        if (mainRef.current) {
          mainRef.current.focus();
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [screenName]);

  return { mainRef };
};

/**
 * キーボードナビゲーション用Hook
 */
export const useKeyboardNavigation = <T extends HTMLElement>(
  itemCount: number,
  onSelect: (index: number) => void,
  options: {
    orientation?: 'horizontal' | 'vertical' | 'both';
    loop?: boolean;
  } = {}
) => {
  const { orientation = 'vertical', loop = true } = options;
  const [focusedIndex, setFocusedIndex] = useState(0);
  const containerRef = useRef<T>(null);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      let newIndex = focusedIndex;

      switch (e.key) {
        case 'ArrowUp':
          if (orientation === 'vertical' || orientation === 'both') {
            e.preventDefault();
            if (focusedIndex > 0) {
              newIndex = focusedIndex - 1;
            } else if (loop) {
              newIndex = itemCount - 1;
            }
          }
          break;

        case 'ArrowDown':
          if (orientation === 'vertical' || orientation === 'both') {
            e.preventDefault();
            if (focusedIndex < itemCount - 1) {
              newIndex = focusedIndex + 1;
            } else if (loop) {
              newIndex = 0;
            }
          }
          break;

        case 'ArrowLeft':
          if (orientation === 'horizontal' || orientation === 'both') {
            e.preventDefault();
            if (focusedIndex > 0) {
              newIndex = focusedIndex - 1;
            } else if (loop) {
              newIndex = itemCount - 1;
            }
          }
          break;

        case 'ArrowRight':
          if (orientation === 'horizontal' || orientation === 'both') {
            e.preventDefault();
            if (focusedIndex < itemCount - 1) {
              newIndex = focusedIndex + 1;
            } else if (loop) {
              newIndex = 0;
            }
          }
          break;

        case 'Home':
          e.preventDefault();
          newIndex = 0;
          break;

        case 'End':
          e.preventDefault();
          newIndex = itemCount - 1;
          break;

        case 'Enter':
        case ' ':
          e.preventDefault();
          onSelect(focusedIndex);
          return;

        default:
          return;
      }

      setFocusedIndex(newIndex);
    },
    [focusedIndex, itemCount, onSelect, orientation, loop]
  );

  // フォーカスインデックスが変わったら対応する要素にフォーカス
  useEffect(() => {
    if (containerRef.current) {
      const items = containerRef.current.querySelectorAll('[role="menuitem"], [role="option"], [data-focusable]');
      const targetItem = items[focusedIndex] as HTMLElement;
      if (targetItem) {
        targetItem.focus();
      }
    }
  }, [focusedIndex]);

  return {
    containerRef,
    focusedIndex,
    setFocusedIndex,
    handleKeyDown,
    getItemProps: (index: number) => ({
      tabIndex: index === focusedIndex ? 0 : -1,
      'aria-selected': index === focusedIndex,
      'data-focusable': true,
      onFocus: () => setFocusedIndex(index),
    }),
  };
};

/**
 * スクリーンリーダーへのアナウンス用Hook
 */
export const useAnnounce = () => {
  const [message, setMessage] = useState('');
  const [priority, setPriority] = useState<'polite' | 'assertive'>('polite');

  const announce = useCallback((text: string, level: 'polite' | 'assertive' = 'polite') => {
    // 一度クリアしてから設定することで、同じメッセージでも再アナウンス
    setMessage('');
    setPriority(level);

    // 少し遅延させて設定
    setTimeout(() => {
      setMessage(text);
    }, 50);
  }, []);

  const clearAnnouncement = useCallback(() => {
    setMessage('');
  }, []);

  return {
    message,
    priority,
    announce,
    clearAnnouncement,
  };
};

/**
 * フォーカストラップ用Hook（モーダル等で使用）
 */
export const useFocusTrap = <T extends HTMLElement>(isActive: boolean) => {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // 最初の要素にフォーカス
    firstElement?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift+Tab: 最初の要素から最後へ
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab: 最後の要素から最初へ
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive]);

  return { containerRef };
};

export default {
  useAccessibilityPreferences,
  useFocusManagement,
  useKeyboardNavigation,
  useAnnounce,
  useFocusTrap,
};
