import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // HUNTER×HUNTER カラーパレット
        hunter: {
          green: '#2D5A27',
          'green-light': '#3D7A37',
          'green-dark': '#1D4A17',
          gold: '#D4AF37',
          'gold-light': '#E4CF67',
          'gold-dark': '#B49F27',
          dark: '#1A1A2E',
          'dark-light': '#2A2A3E',
          accent: '#E94560',
          'accent-light': '#F96580',
          'accent-dark': '#C93550',
        },
        // 念系統カラー
        nen: {
          enhancement: '#FF6B6B',    // 強化系（赤）
          transmutation: '#4ECDC4',  // 変化系（青緑）
          emission: '#FFE66D',       // 放出系（黄）
          conjuration: '#95E1D3',    // 具現化系（緑）
          manipulation: '#A66CFF',   // 操作系（紫）
          specialization: '#F38181', // 特質系（ピンク）
        },
        // UI用
        success: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',
      },
      fontFamily: {
        sans: ['Rajdhani', 'system-ui', 'sans-serif'],
        title: ['Orbitron', 'monospace'],
        mono: ['"Fira Code"', 'monospace'],
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
        'nen': '0 0 15px rgba(212, 175, 55, 0.5)',
        'nen-strong': '0 0 30px rgba(212, 175, 55, 0.8)',
      },
    },
  },
  plugins: [],
} satisfies Config;
