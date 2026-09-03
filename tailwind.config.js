export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
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
          blue: '#3b82f6',
          teal: '#06b6d4',
          green: '#34d399',
          red: '#f87171',
          yellow: '#fbbf24',
          purple: '#8b5cf6',
          pink: '#f472b6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      borderRadius: {
        xl: '1rem',
        full: '9999px',
      },
      boxShadow: {
        card: '0 8px 32px rgba(0,0,0,0.3)',
        'card-hover': '0 12px 48px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
};