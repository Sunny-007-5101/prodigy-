/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        line: 'var(--line)',
        'line-strong': 'var(--line-strong)',
        accent: 'var(--accent)',
        'accent-deep': 'var(--accent-deep)',
        ink: 'var(--text)',
        muted: 'var(--muted)',
      },
      fontFamily: {
        sans: ['"Inter Tight Variable"', 'system-ui', 'sans-serif'],
        display: ['Michroma', 'system-ui', 'sans-serif'],
        mono: ['"Geist Mono Variable"', 'ui-monospace', 'monospace'],
      },
      maxWidth: { site: '1280px' },
    },
  },
  plugins: [],
};
