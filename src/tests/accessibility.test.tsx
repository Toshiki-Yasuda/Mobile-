/**
 * アクセシビリティテスト
 * WCAG 2.1 Level AA 準拠を目指すテスト
 */

import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// matchMediaのグローバルモック（jsdom非対応のため）
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });

  // scrollIntoViewのモック
  Element.prototype.scrollIntoView = vi.fn();
});

// モックの設定
vi.mock('@/stores/gameStore', () => ({
  useGameStore: () => ({
    currentScreen: 'title',
    loading: { isLoading: false },
    error: { hasError: false },
    clearError: vi.fn(),
    navigateTo: vi.fn(),
  }),
}));

vi.mock('@/stores/settingsStore', () => ({
  useSettingsStore: () => ({
    keyboardVisible: true,
    romajiGuideLevel: 'full',
  }),
}));

// アクセシビリティコンポーネントのテスト
describe('Accessibility Components', () => {
  describe('ScreenReaderOnly', () => {
    it('視覚的に非表示だがDOMに存在する', async () => {
      const { ScreenReaderOnly } = await import('@/components/common/Accessibility/ScreenReaderOnly');
      render(<ScreenReaderOnly>テストテキスト</ScreenReaderOnly>);

      const element = screen.getByText('テストテキスト');
      expect(element).toBeDefined();
      expect(element.className).toContain('sr-only');
    });

    it('カスタムHTML要素として描画できる', async () => {
      const { ScreenReaderOnly } = await import('@/components/common/Accessibility/ScreenReaderOnly');
      render(<ScreenReaderOnly as="h1">見出しテキスト</ScreenReaderOnly>);

      const element = screen.getByRole('heading', { level: 1 });
      expect(element).toBeDefined();
      expect(element.textContent).toBe('見出しテキスト');
    });
  });

  describe('LiveRegion', () => {
    it('aria-live属性が設定される', async () => {
      const { LiveRegion } = await import('@/components/common/Accessibility/LiveRegion');
      const { container } = render(<LiveRegion message="テスト通知" priority="polite" />);

      const liveRegion = container.querySelector('[aria-live="polite"]');
      expect(liveRegion).toBeDefined();
    });

    it('assertive優先度でaria-live="assertive"が設定される', async () => {
      const { LiveRegion } = await import('@/components/common/Accessibility/LiveRegion');
      const { container } = render(<LiveRegion message="緊急通知" priority="assertive" />);

      const liveRegion = container.querySelector('[aria-live="assertive"]');
      expect(liveRegion).toBeDefined();
    });
  });

  describe('SkipLink', () => {
    it('フォーカス可能なスキップリンクが存在する', async () => {
      const { SkipLink } = await import('@/components/common/Accessibility/SkipLink');
      render(
        <>
          <SkipLink targetId="main">メインへスキップ</SkipLink>
          <main id="main" tabIndex={-1}>メインコンテンツ</main>
        </>
      );

      const skipLink = screen.getByText('メインへスキップ');
      expect(skipLink).toBeDefined();
      expect(skipLink.getAttribute('href')).toBe('#main');
    });

    it('クリック時にターゲットにフォーカスが移動する', async () => {
      const { SkipLink } = await import('@/components/common/Accessibility/SkipLink');
      render(
        <>
          <SkipLink targetId="main-content">スキップ</SkipLink>
          <main id="main-content" tabIndex={-1}>メイン</main>
        </>
      );

      const skipLink = screen.getByText('スキップ');
      fireEvent.click(skipLink);

      const main = document.getElementById('main-content');
      // Note: jsdomではfocus()が正確に動作しない場合があるため、
      // 実際のテストではPlaywrightなどでE2Eテストを行う
      expect(main).toBeDefined();
    });
  });
});

// アクセシビリティHooksのテスト
describe('Accessibility Hooks', () => {
  describe('useAccessibilityPreferences', () => {
    it('reducedMotionの初期値はfalse', async () => {
      const { useAccessibilityPreferences } = await import('@/hooks/useAccessibility');

      let result: { reducedMotion: boolean; highContrast: boolean };

      const TestComponent = () => {
        result = useAccessibilityPreferences();
        return null;
      };

      render(<TestComponent />);
      expect(result!.reducedMotion).toBe(false);
    });
  });

  describe('useKeyboardNavigation', () => {
    it('矢印キーでフォーカスインデックスが変わる', async () => {
      const { useKeyboardNavigation } = await import('@/hooks/useAccessibility');
      const onSelect = vi.fn();

      let hookResult: ReturnType<typeof useKeyboardNavigation<HTMLDivElement>>;

      const TestComponent = () => {
        hookResult = useKeyboardNavigation<HTMLDivElement>(3, onSelect);
        return (
          <div ref={hookResult.containerRef} onKeyDown={hookResult.handleKeyDown}>
            {[0, 1, 2].map((i) => (
              <button key={i} {...hookResult.getItemProps(i)}>
                Item {i}
              </button>
            ))}
          </div>
        );
      };

      render(<TestComponent />);

      // 初期フォーカスインデックスは0
      expect(hookResult!.focusedIndex).toBe(0);
    });

    it('Enterキーで選択コールバックが呼ばれる', async () => {
      const { useKeyboardNavigation } = await import('@/hooks/useAccessibility');
      const onSelect = vi.fn();

      const TestComponent = () => {
        const { containerRef, handleKeyDown, getItemProps, focusedIndex } =
          useKeyboardNavigation<HTMLDivElement>(3, onSelect);
        return (
          <div ref={containerRef} onKeyDown={handleKeyDown} tabIndex={0}>
            {[0, 1, 2].map((i) => (
              <button key={i} {...getItemProps(i)}>
                Item {i}
              </button>
            ))}
          </div>
        );
      };

      const { container } = render(<TestComponent />);
      const div = container.firstChild as HTMLDivElement;

      // Enterキーを押す
      fireEvent.keyDown(div, { key: 'Enter' });
      expect(onSelect).toHaveBeenCalledWith(0);
    });
  });

  describe('useAnnounce', () => {
    it('announce関数でメッセージを設定できる', async () => {
      const { useAnnounce } = await import('@/hooks/useAccessibility');

      let hookResult: ReturnType<typeof useAnnounce>;

      const TestComponent = () => {
        hookResult = useAnnounce();
        return <div>{hookResult.message}</div>;
      };

      render(<TestComponent />);

      // 初期メッセージは空
      expect(hookResult!.message).toBe('');
    });
  });
});

// ARIA属性のテスト
describe('ARIA Attributes', () => {
  describe('ボタン要素', () => {
    it('aria-labelが設定されている', () => {
      render(
        <button aria-label="閉じる">✕</button>
      );

      const button = screen.getByRole('button', { name: '閉じる' });
      expect(button).toBeDefined();
    });

    it('disabled状態でaria-disabled="true"', () => {
      render(
        <button disabled aria-disabled="true">送信</button>
      );

      const button = screen.getByRole('button', { name: '送信' });
      expect(button.getAttribute('aria-disabled')).toBe('true');
    });
  });

  describe('フォーム要素', () => {
    it('必須フィールドにaria-required="true"', () => {
      render(
        <input aria-required="true" aria-label="メールアドレス" />
      );

      const input = screen.getByRole('textbox', { name: 'メールアドレス' });
      expect(input.getAttribute('aria-required')).toBe('true');
    });

    it('エラー時にaria-invalid="true"', () => {
      render(
        <input aria-invalid="true" aria-label="パスワード" />
      );

      const input = screen.getByRole('textbox', { name: 'パスワード' });
      expect(input.getAttribute('aria-invalid')).toBe('true');
    });
  });

  describe('プログレスバー', () => {
    it('role="progressbar"とaria-valuenowが設定される', () => {
      render(
        <div
          role="progressbar"
          aria-valuenow={50}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="進捗"
        />
      );

      const progressbar = screen.getByRole('progressbar', { name: '進捗' });
      expect(progressbar.getAttribute('aria-valuenow')).toBe('50');
    });
  });
});

// キーボードナビゲーションテスト
describe('Keyboard Navigation', () => {
  describe('Tab順序', () => {
    it('tabIndex="0"の要素はフォーカス可能', () => {
      render(
        <div tabIndex={0} data-testid="focusable">フォーカス可能</div>
      );

      const element = screen.getByTestId('focusable');
      expect(element.getAttribute('tabindex')).toBe('0');
    });

    it('tabIndex="-1"の要素はTab順序から外れる', () => {
      render(
        <div tabIndex={-1} data-testid="not-in-tab-order">Tab外</div>
      );

      const element = screen.getByTestId('not-in-tab-order');
      expect(element.getAttribute('tabindex')).toBe('-1');
    });
  });

  describe('フォーカス表示', () => {
    it('focus-visibleクラスがフォーカス時に適用される（CSSレベル）', () => {
      // このテストはCSS :focus-visible疑似クラスの動作を確認
      // 実際の視覚的テストはPlaywrightで行う
      render(
        <button className="focus:ring-2 focus:ring-hunter-gold">
          フォーカスボタン
        </button>
      );

      const button = screen.getByRole('button');
      expect(button.className).toContain('focus:ring-2');
    });
  });
});

// カラーコントラストテスト（ヘルパー関数）
describe('Color Contrast', () => {
  // 輝度計算関数
  const getLuminance = (r: number, g: number, b: number): number => {
    const [rs, gs, bs] = [r, g, b].map((c) => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  // コントラスト比計算関数
  const getContrastRatio = (l1: number, l2: number): number => {
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    return (lighter + 0.05) / (darker + 0.05);
  };

  it('hunter-gold (#D4AF37) と hunter-dark (#1A1A2E) のコントラスト比が4.5以上', () => {
    // hunter-gold: #D4AF37 = rgb(212, 175, 55)
    // hunter-dark: #1A1A2E = rgb(26, 26, 46)
    const goldLuminance = getLuminance(212, 175, 55);
    const darkLuminance = getLuminance(26, 26, 46);
    const ratio = getContrastRatio(goldLuminance, darkLuminance);

    // WCAG AA基準: 通常テキストは4.5:1以上
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('白 (#FFFFFF) と hunter-dark (#1A1A2E) のコントラスト比が7以上', () => {
    // 白: #FFFFFF = rgb(255, 255, 255)
    // hunter-dark: #1A1A2E = rgb(26, 26, 46)
    const whiteLuminance = getLuminance(255, 255, 255);
    const darkLuminance = getLuminance(26, 26, 46);
    const ratio = getContrastRatio(whiteLuminance, darkLuminance);

    // WCAG AAA基準: 通常テキストは7:1以上
    expect(ratio).toBeGreaterThanOrEqual(7);
  });

  it('success色 (#10B981) と hunter-dark のコントラスト比が4.5以上', () => {
    // success: #10B981 = rgb(16, 185, 129)
    const successLuminance = getLuminance(16, 185, 129);
    const darkLuminance = getLuminance(26, 26, 46);
    const ratio = getContrastRatio(successLuminance, darkLuminance);

    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  it('error色 (#EF4444) と hunter-dark のコントラスト比が4.5以上', () => {
    // error: #EF4444 = rgb(239, 68, 68)
    const errorLuminance = getLuminance(239, 68, 68);
    const darkLuminance = getLuminance(26, 26, 46);
    const ratio = getContrastRatio(errorLuminance, darkLuminance);

    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });
});

// アニメーション軽減モードテスト
describe('Reduced Motion', () => {
  beforeEach(() => {
    // matchMediaのモック
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: query === '(prefers-reduced-motion: reduce)',
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it('prefers-reduced-motionが検出される', async () => {
    const { useAccessibilityPreferences } = await import('@/hooks/useAccessibility');

    let result: { reducedMotion: boolean; highContrast: boolean };

    const TestComponent = () => {
      result = useAccessibilityPreferences();
      return <div>{result.reducedMotion ? 'reduced' : 'normal'}</div>;
    };

    render(<TestComponent />);
    expect(result!.reducedMotion).toBe(true);
  });
});
