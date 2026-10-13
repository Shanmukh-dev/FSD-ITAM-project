/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        obsidian: '#09090B',
        canvas: 'var(--bg-canvas)',
        surface: 'var(--bg-surface)',
        chalk: '#FAFAFA',

        'surface-elevated': 'var(--bg-surface-elevated)',
        'surface-sunken': 'var(--bg-surface-sunken)',
        'surface-hover': 'var(--bg-surface-hover)',

        'on-surface': 'var(--text-primary)',
        'on-surface-variant': 'var(--text-secondary)',
        outline: 'var(--border-strong)',
        'outline-variant': 'var(--border-subtle)',

        gold: {
          DEFAULT: '#F1CB8D',
          hover: '#F5D6A3',
          faint: 'rgba(241, 203, 141, 0.12)',
          border: 'rgba(241, 203, 141, 0.35)',
          glow: 'rgba(241, 203, 141, 0.18)',
        },

        primary: {
          DEFAULT: 'var(--primary)',
          hover: 'var(--primary-hover)',
          container: '#382F1D',
          foreground: '#09090B',
        },
        secondary: {
          DEFAULT: 'var(--text-primary)',
          hover: 'var(--text-secondary)',
          foreground: 'var(--bg-canvas)',
        },
        muted: {
          DEFAULT: '#71717A',
          foreground: 'var(--text-muted)',
        },
        destructive: {
          DEFAULT: '#71717A',
          foreground: '#F8FAFC',
        },
        border: 'var(--border-subtle)',
        ring: 'var(--primary)',

        status: {
          available: '#F1CB8D',
          assigned: '#F8FAFC',
          maintenance: '#A1A1AA',
          retired: '#71717A',
          disposed: '#52525B',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      borderRadius: {
        sm: '0.375rem',
        DEFAULT: '0.5rem',
        md: '0.75rem',
        lg: '1rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.75rem',
        '4xl': '2rem',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        elevated: 'var(--shadow-elevated)',
        popover: 'var(--shadow-popover)',
        bento: 'var(--shadow-bento)',
        glow: '0 0 25px -4px rgba(241, 203, 141, 0.22)',
        'glow-sm': '0 0 15px -2px rgba(241, 203, 141, 0.15)',
        'glow-lg': '0 0 40px -6px rgba(241, 203, 141, 0.30)',
      },
    },
  },
  plugins: [],
};
