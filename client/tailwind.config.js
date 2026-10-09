/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        obsidian: '#090D16',
        canvas: 'var(--bg-canvas)',
        surface: 'var(--bg-surface)',
        chalk: '#F8FAFC',
        emerald: '#10B981',
        amber: '#F59E0B',

        'surface-elevated': 'var(--bg-surface-elevated)',
        'surface-sunken': 'var(--bg-surface-sunken)',
        'surface-hover': 'var(--bg-surface-hover)',

        'on-surface': 'var(--text-primary)',
        'on-surface-variant': 'var(--text-secondary)',
        outline: 'var(--border-strong)',
        'outline-variant': 'var(--border-subtle)',

        primary: {
          DEFAULT: 'var(--primary)',
          hover: 'var(--primary-hover)',
          container: '#4338CA',
          foreground: '#FFFFFF',
        },
        secondary: {
          DEFAULT: '#F59E0B',
          hover: '#D97706',
          foreground: '#0F172A',
        },
        muted: {
          DEFAULT: '#64748B',
          foreground: 'var(--text-muted)',
        },
        destructive: {
          DEFAULT: '#EF4444',
          foreground: '#FEE2E2',
        },
        border: 'var(--border-subtle)',
        ring: 'var(--primary)',

        status: {
          available: '#10B981',
          assigned: '#6366F1',
          maintenance: '#F59E0B',
          retired: '#64748B',
          disposed: '#EF4444',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      borderRadius: {
        sm: '0.25rem',
        DEFAULT: '0.375rem',
        md: '0.5rem',
        lg: '0.75rem',
        xl: '1rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        elevated: 'var(--shadow-elevated)',
        popover: 'var(--shadow-popover)',
        glow: '0 0 25px -5px rgba(99, 102, 241, 0.25)',
      },
    },
  },
  plugins: [],
};
