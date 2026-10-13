module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  mode: 'jit',
  darkMode: 'class',
  theme: {
    fontFamily: {
      display: ['Inter', 'sans-serif'],
      body: ['Inter', 'sans-serif'],
    },
    extend: {
      colors: {
        dao: {
          bg: '#050b14',
          surface: '#0a1526',
          card: '#0f1f38',
          border: '#142e4d',
          accent: '#06b6d4', // Neon Cyan
          'accent-glow': '#22d3ee',
          emerald: '#10b981', // Neon Emerald
          'emerald-glow': '#34d399',
          muted: '#64748b',
          gold: '#f59e0b',
        },
      },
      backgroundImage: {
        'dao-gradient': 'linear-gradient(135deg, #050b14 0%, #081628 50%, #050b14 100%)',
        'hero-gradient': 'linear-gradient(135deg, #06313f 0%, #050b14 60%)',
        'card-gradient': 'linear-gradient(145deg, rgba(15,31,56,0.85) 0%, rgba(5,11,20,0.95) 100%)',
        'accent-gradient': 'linear-gradient(135deg, #06b6d4 0%, #10b981 100%)',
        'emerald-gradient': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        'gold-gradient': 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
      },
      screens: { mf: '990px' },
      keyframes: {
        'slide-in': {
          '0%': { transform: 'translateX(120%)' },
          '100%': { transform: 'translateX(0%)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 10px rgba(6,182,212,0.3)' },
          '50%': { boxShadow: '0 0 25px rgba(6,182,212,0.8), 0 0 45px rgba(16,185,129,0.5)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
      },
      animation: {
        'slide-in': 'slide-in 0.5s ease-out',
        'fade-up': 'fade-up 0.6s ease-out',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        shimmer: 'shimmer 2s infinite linear',
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  variants: { extend: {} },
  plugins: [require('@tailwindcss/forms')],
}
