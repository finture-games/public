/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: '#5B3FFF', dark: '#4A33D9' },
        secondary: '#FFB020',
        success: '#22C55E',
        danger: '#F43F5E',
        fomo: '#A855F7',
        save: '#3B82F6',
        ink: '#1E1B3A',
        card: '#FFFFFF',
        sky: '#EAF2FF',
      },
      fontFamily: {
        display: ['Fredoka', 'system-ui', 'sans-serif'],
        body: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        chunky: '16px',
        card: '24px',
      },
      boxShadow: {
        chunky: '0 4px 0 0 rgba(30,27,58,0.9)',
        'chunky-primary': '0 4px 0 0 #4A33D9',
        'chunky-danger': '0 4px 0 0 #BE123C',
      },
      keyframes: {
        'pop-in': {
          '0%': { transform: 'scale(0.6)', opacity: '0' },
          '60%': { transform: 'scale(1.06)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(40px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        bob: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
      },
      animation: {
        'pop-in': 'pop-in 0.35s cubic-bezier(0.34,1.56,0.64,1) both',
        'slide-up': 'slide-up 0.4s cubic-bezier(0.22,1,0.36,1) both',
        'fade-in': 'fade-in 0.3s ease both',
        bob: 'bob 2.4s ease-in-out infinite',
        wiggle: 'wiggle 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
