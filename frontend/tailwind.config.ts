import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'Segoe UI', 'Helvetica Neue', 'sans-serif'],
      },
      colors: {
        /* Primary dark — Nankai navy */
        ink: '#0c1e3c',
        mist: '#eef3fb',
        /* Nankai gold */
        gold: {
          50:  '#fefbea',
          100: '#fdf4c4',
          200: '#fbe88a',
          300: '#f8d548',
          400: '#f4c118',
          500: '#c9a227',
          600: '#a87d1a',
          700: '#845d13',
          800: '#6d4a14',
          900: '#5d3d16',
        },
        /* Brand blue (kept for backward compat) */
        brand: {
          50:  '#eef6ff',
          100: '#d9ecff',
          200: '#bcdaff',
          300: '#8ac0ff',
          400: '#52a2ff',
          500: '#2485f5',
          600: '#1468d2',
          700: '#1455a9',
          800: '#17458a',
          900: '#183a73',
        },
        accent: '#c9a227',   /* gold as the primary accent now */
        'accent-warm': '#e8883a',
      },
      boxShadow: {
        panel:  '0 4px 24px -4px rgba(12, 30, 60, 0.10), 0 1px 4px rgba(12, 30, 60, 0.06)',
        card:   '0 2px 12px -2px rgba(12, 30, 60, 0.08), 0 1px 3px rgba(12, 30, 60, 0.05)',
        lifted: '0 12px 32px -6px rgba(12, 30, 60, 0.18), 0 2px 8px rgba(12, 30, 60, 0.08)',
        glow:   '0 0 0 3px rgba(201, 162, 39, 0.25)',
        'glow-blue': '0 0 0 3px rgba(36, 133, 245, 0.22)',
      },
      backgroundImage: {
        'hero-grid':
          'linear-gradient(rgba(12,30,60,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(12,30,60,0.05) 1px, transparent 1px)',
        'hero-mesh':
          'radial-gradient(ellipse 80% 70% at 20% 30%, rgba(201,162,39,0.12) 0%, transparent 60%), radial-gradient(ellipse 60% 50% at 80% 70%, rgba(36,133,245,0.10) 0%, transparent 60%)',
        'card-shimmer':
          'linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.05) 100%)',
        'gold-shine':
          'linear-gradient(135deg, #c9a227 0%, #f8d548 50%, #a87d1a 100%)',
        'navy-gradient':
          'linear-gradient(135deg, #0c1e3c 0%, #1a3a6b 60%, #0f2a52 100%)',
      },
      backgroundSize: {
        'hero-grid': '40px 40px',
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
        '5xl': '2.5rem',
      },
      animation: {
        'pulse-slow': 'pulse-slow 2s ease-in-out infinite',
        'fade-in': 'fade-in 0.35s ease-out both',
        'slide-up': 'slide-up 0.45s ease-out both',
      },
      keyframes: {
        'pulse-slow': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.55', transform: 'scale(0.88)' },
        },
        'fade-in': {
          from: { opacity: '0', transform: 'translateY(6px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
