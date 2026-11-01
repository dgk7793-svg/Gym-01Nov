/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: 'rgb(var(--bg) / <alpha-value>)',
        fg: 'rgb(var(--fg) / <alpha-value>)',
        muted: 'rgb(var(--muted) / <alpha-value>)',
        line: 'rgb(var(--line) / <alpha-value>)',
        accent: 'rgb(var(--accent) / <alpha-value>)',
        neon: '#C8FF2E',
        aqua: '#22E4F2',
        ember: '#FF7A2F',
        orchid: '#B48CFF',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        glow: '0 0 40px -8px rgba(200, 255, 46, 0.55)',
        'glow-aqua': '0 0 40px -8px rgba(34, 228, 242, 0.5)',
      },
      keyframes: {
        shimmer: { to: { transform: 'translateX(100%)' } },
        marquee: { from:{ transform: 'translateX(0)' }, to: { transform: 'translateX(-50%)' } },
        flicker: {
          '0%, 100%': { transform: 'scale(1) rotate(-2deg)' },
          '50%': { transform: 'scale(1.08) rotate(2deg)' },
        },
      },
      animation: {
        marquee: 'marquee 28s linear infinite',
        shimmer: 'shimmer 1.6s ease-in-out infinite',
        flicker: 'flicker 1.4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
