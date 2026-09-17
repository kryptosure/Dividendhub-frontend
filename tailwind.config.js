import typography from '@tailwindcss/typography';

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,md}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: {
          primary: 'var(--bg-primary)',
          secondary: 'var(--bg-secondary)',
          surface: 'var(--bg-surface)',
          'surface-hover': 'var(--bg-surface-hover)',
        },
        border: {
          DEFAULT: 'var(--border-color)',
          hover: 'var(--border-hover)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted: 'var(--text-muted)',
        },
        accent: {
          /* Single accent color for the whole app, per the new minimal
             direction — blue/teal/green/purple/pink all resolve to the
             same var(--accent) (or a functional status color), so any
             existing "from-accent-blue to-accent-teal" gradient utility
             in the JSX now renders as a flat accent color automatically. */
          blue: 'var(--accent)',
          teal: 'var(--accent)',
          green: 'var(--status-safe)',
          red: 'var(--status-danger)',
          yellow: 'var(--status-caution)',
          purple: 'var(--text-secondary)', /* decorative-only tags go neutral gray in a minimal palette */
          pink: 'var(--text-secondary)',
        },
      },
      // ✅ FIX: register shadow tokens so `shadow-card` / `hover:shadow-hover`
      // actually generate CSS. Previously `.card-hover` silently did nothing
      // because `shadow-shadow-hover` was not a real utility.
      boxShadow: {
        card: 'var(--shadow-card)',
        hover: 'var(--shadow-hover)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [
    typography, // ✅ This is the secret sauce for beautiful articles
  ],
}