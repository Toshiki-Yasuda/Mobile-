import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // ポップで明るいカラーパレット（小学生向け）
        background: '#fef7ff',      // ライトピンクホワイト
        surface: '#ffffff',          // 純白
        primary: '#4a1d6a',         // ディープパープル（テキスト）
        secondary: '#7c3aed',       // バイオレット
        accent: '#ec4899',          // ビビッドピンク
        error: '#f43f5e',           // ローズレッド
        muted: '#e9d5ff',           // ライトパープル
        // ポップカラー
        'pop-pink': '#f472b6',
        'pop-purple': '#a855f7',
        'pop-mint': '#34d399',
        'pop-sky': '#38bdf8',
        'pop-yellow': '#fbbf24',
        'pop-coral': '#fb7185',
        // 後方互換性のためのエイリアス
        'hunter-dark': '#fef7ff',
        'hunter-dark-light': '#ffffff',
        'hunter-gold': '#ec4899',
        'hunter-gold-light': '#f9a8d4',
        'hunter-gold-dark': '#db2777',
        'hunter-green': '#34d399',
        'hunter-green-light': '#6ee7b7',
        'hunter-green-dark': '#10b981',
        // UI用
        success: '#34d399',
        warning: '#fbbf24',
      },
      fontFamily: {
        sans: ['M PLUS Rounded 1c', 'Nunito', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['M PLUS Rounded 1c', 'JetBrains Mono', 'Consolas', 'monospace'],
        game: ['M PLUS Rounded 1c', 'Nunito', 'Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-light': 'bounce 1s ease-in-out infinite',
        'fade-in': 'fadeIn 0.3s ease-out',
        'fade-out': 'fadeOut 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'shake': 'shake 0.5s ease-in-out',
        'glow': 'glow 2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(212, 175, 55, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(212, 175, 55, 0.8)' },
        },
      },
      boxShadow: {
        'sm': '0 2px 4px 0 rgba(236, 72, 153, 0.15)',
        'md': '0 4px 12px -1px rgba(236, 72, 153, 0.2)',
        'lg': '0 10px 25px -3px rgba(168, 85, 247, 0.25)',
        'hover': '0 8px 20px -4px rgba(236, 72, 153, 0.3)',
        'glow': '0 0 20px rgba(236, 72, 153, 0.4), 0 0 40px rgba(168, 85, 247, 0.2)',
        'glow-strong': '0 0 30px rgba(236, 72, 153, 0.6), 0 0 60px rgba(168, 85, 247, 0.3)',
        'card': '0 4px 20px rgba(168, 85, 247, 0.15)',
        'button': '0 4px 14px rgba(236, 72, 153, 0.4)',
      },
      borderRadius: {
        'sm': '6px',
        'md': '8px',
        'lg': '12px',
      },
    },
  },
  plugins: [],
} satisfies Config;
