/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      animation: {
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
      },
      keyframes: {
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 5px #6366f1' },
          '50%': { boxShadow: '0 0 20px #6366f1, 0 0 40px #6366f1' },
        },
      },
    },
  },
  plugins: [],
};
