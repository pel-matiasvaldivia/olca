/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // OLCA Brand Palette (Forest Green)
        brand: {
          50:  '#f3f6f3',
          100: '#e7ede7',
          200: '#cfdbcf',
          300: '#a7bba7',
          400: '#7f9b7f',
          500: '#234E26', // Primary
          600: '#1e4321',
          700: '#19381b',
          800: '#142d16',
          900: '#0f2210',
          accent: '#25D366',
        },
        // Neutral palette for Light Mode
        dark: {
          50:  '#ffffff',
          100: '#f8fafc',
          200: '#f1f5f9',
          300: '#e2e8f0',
          400: '#94a3b8',
          500: '#64748b',
          600: '#475569',
          700: '#334155',
          800: '#1e293b',
          900: '#0f172a',
          950: '#020617',
        },
      },
      fontFamily: {
        sans: ['Montserrat', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Montserrat', 'Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-brand': 'linear-gradient(135deg, #234E26 0%, #25D366 100%)',
        'gradient-light': 'linear-gradient(135deg, #f8fafc 0%, #ffffff 100%)',
        'gradient-card': 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
      },
      boxShadow: {
        'brand': '0 4px 14px 0 rgba(35, 78, 38, 0.39)',
        'card': '0 2px 15px -3px rgba(0,0,0,0.07), 0 4px 6px -2px rgba(0,0,0,0.05)',
        'card-hover': '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
        slideUp: { '0%': { opacity: '0', transform: 'translateY(16px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
      },
      borderRadius: {
        'xl': '2px', // Sharp corners as per analysis
        '2xl': '4px',
        '3xl': '8px',
      },
    },
  },
  plugins: [],
};
