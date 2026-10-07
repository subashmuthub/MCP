/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
        },
        navy: {
          950: '#060B18',
          900: '#0A1120',
          850: '#0D1628',
          800: '#111E32',
          750: '#162440',
          700: '#1A2A4A',
          600: '#1E3254',
          500: '#243B63',
        },
        surface: {
          DEFAULT: '#0F172A',
          raised: '#141F35',
          overlay: '#192640',
          border: '#1E3050',
          hover: '#1E2D4A',
        },
        accent: {
          purple: '#8B5CF6',
          cyan:   '#06B6D4',
          pink:   '#EC4899',
          orange: '#F97316',
        },
        status: {
          healthy:  '#10B981',
          warning:  '#F59E0B',
          critical: '#EF4444',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      backgroundImage: {
        'gradient-brand':   'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
        'gradient-surface': 'linear-gradient(135deg, #0F172A 0%, #141F35 100%)',
        'gradient-hero':    'linear-gradient(135deg, #060B18 0%, #0A1120 50%, #0D1628 100%)',
        'gradient-card':    'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.04) 100%)',
      },
      boxShadow: {
        'brand-sm': '0 2px 8px rgba(99,102,241,0.25)',
        'brand':    '0 4px 20px rgba(99,102,241,0.35)',
        'brand-lg': '0 8px 40px rgba(99,102,241,0.45)',
        'glass':    '0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        'card':     '0 4px 24px rgba(0,0,0,0.3)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.4)',
        'critical': '0 4px 20px rgba(239,68,68,0.25)',
        'warning':  '0 4px 20px rgba(245,158,11,0.25)',
        'healthy':  '0 4px 20px rgba(16,185,129,0.25)',
      },
      borderRadius: {
        'xl':  '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
      animation: {
        'fade-in':    'fadeIn 0.3s ease-out',
        'slide-up':   'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'glow':       'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn:  { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideUp: { '0%': { opacity: 0, transform: 'translateY(16px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        glow:    { '0%': { boxShadow: '0 0 8px rgba(99,102,241,0.3)' }, '100%': { boxShadow: '0 0 24px rgba(99,102,241,0.7)' } },
      },
      backdropBlur: {
        xs: '4px',
      },
    },
  },
  plugins: [],
};
