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
          /* DEFAULT registers bare `bg-accent` / `text-accent` / `border-accent`.
             Header.jsx now uses the explicit `-blue` variants so it does not
             depend on the DEFAULT key resolving in a given build cache. */
          DEFAULT: 'var(--accent)',
          blue: 'var(--accent)',
          teal: 'var(--accent)',
          hover: 'var(--accent-hover)',
          green: 'var(--status-safe)',
          red: 'var(--status-danger)',
          yellow: 'var(--status-caution)',
          purple: 'var(--text-secondary)',
          pink: 'var(--text-secondary)',
        },
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        hover: 'var(--shadow-hover)',
      },
      fontFamily: {
        sans: ['Inter', 'Inter Fallback', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'JetBrains Mono Fallback', 'monospace'],
      },
    },
  },
  plugins: [
    typography,
  ],
}