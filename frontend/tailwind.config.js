/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // OLCA Brand Palette
        brand: {
          50:  '#fdf8ec',
          100: '#faefd0',
          200: '#f5d78e',
          300: '#f0bf5a',
          400: '#e8b84b',
          500: '#d9a030',
          600: '#b8821d',
          700: '#8f6015',
          800: '#6b460f',
          900: '#4a2e08',
        },
        dark: {
          50:  '#f0f0f8',
          100: '#d0d0e0',
          200: '#a0a0b8',
          300: '#707090',
          400: '#505070',
          500: '#303050',
          600: '#1e1e38',
          700: '#141428',
          800: '#0e0e1e',
          900: '#0a0a0f',
          950: '#060608',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #e8b84b 0%, #f5d78e 100%)',
        'gradient-dark': 'linear-gradient(135deg, #141428 0%, #0a0a0f 100%)',
        'gradient-card': 'linear-gradient(135deg, #1e1e38 0%, #141428 100%)',
        'gradient-glow': 'radial-gradient(ellipse at center, rgba(232,184,75,0.15) 0%, transparent 70%)',
      },
      boxShadow: {
        'brand': '0 0 20px rgba(232,184,75,0.25)',
        'brand-lg': '0 0 40px rgba(232,184,75,0.3)',
        'card': '0 4px 24px rgba(0,0,0,0.4)',
        'card-hover': '0 8px 40px rgba(0,0,0,0.6)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(16px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
        glow: {
          '0%': { boxShadow: '0 0 10px rgba(232,184,75,0.2)' },
          '100%': { boxShadow: '0 0 30px rgba(232,184,75,0.5)' },
        },
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
};
