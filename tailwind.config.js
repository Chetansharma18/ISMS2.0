/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts,scss}",
    "./src/**/*.component.html",
    "./src/**/*.component.ts"
  ],
  theme: {
    extend: {
      colors: {
        rsldc: {
          navy: '#0B1B3D',
          navyDark: '#07122A',
          navyLight: '#162E5B',
          blueAccent: '#1E40AF',
          gold: '#E87A24',
          goldHover: '#D46815',
          goldLight: '#FFF4EB',
          amber: '#F39237',
          surface: '#FFFFFF',
          bg: '#F8FAFC',
          cardBg: '#FFFFFF',
          border: '#E2E8F0',
          borderLight: '#EDF2F7',
          textDark: '#0F172A',
          textMuted: '#64748B',
          textLight: '#94A3B8'
        },
        ink: {
          900: '#0B1B3D',
          700: '#1E293B'
        },
        paper: {
          50: '#F8FAFC'
        },
        surface: {
          0: '#FFFFFF'
        },
        seal: {
          600: '#E87A24',
          100: '#FFF4EB'
        },
        approve: {
          700: '#15803D',
          100: '#DCFCE7'
        },
        reject: {
          700: '#B91C1C',
          100: '#FEE2E2'
        },
        pending: {
          700: '#B45309',
          100: '#FEF3C7'
        },
        line: {
          200: '#E2E8F0'
        },
        muted: {
          500: '#64748B'
        },
        isms: {
          navy: '#0B3558',
          navyHover: '#082A46',
          navySecondary: '#164B73',
          saffron: '#F4A300',
          green: '#16834B',
          red: '#C62828',
          amber: '#B7791F',
          bg: '#F6F8FA',
          surface: '#FFFFFF',
          text: '#172B3A',
          textSecondary: '#5F6F7E',
          textMuted: '#7A8793',
          border: '#D9E1E8',
          divider: '#E8EDF2',
          tableHead: '#EEF3F7',
          tableHeadText: '#173B59',
          rowHover: '#F7FAFC'
        },
        primary: '#0B3558',
        primaryLight: '#164B73',
        primaryDark: '#082A46'
      },
      spacing: {
        'token-xs.5': '0.375rem',
        'token-xs': '0.5rem',
        'token-sm.5': '0.625rem',
        'token-sm': '0.75rem',
        'token-md': '1rem',
        'token-lg': '1.5rem',
        'token-xl': '2rem',
      },
      fontSize: {
        'page-title': ['1.75rem', { lineHeight: '2.25rem', fontWeight: '700' }], // 28px
        'section-heading': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '600' }], // 20px
        'subsection-heading': ['1rem', { lineHeight: '1.5rem', fontWeight: '600' }], // 16px
        'body-base': ['0.875rem', { lineHeight: '1.3125rem', fontWeight: '400' }], // 14px
        'form-label': ['0.8125rem', { lineHeight: '1.125rem', fontWeight: '500' }], // 13px
        'helper': ['0.75rem', { lineHeight: '1rem', fontWeight: '400' }], // 12px
        'table-font': ['0.8125rem', { lineHeight: '1.125rem' }], // 13px
        'token-xs': ['0.75rem', { lineHeight: '1rem' }],
        'token-sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'token-base': ['1rem', { lineHeight: '1.5rem' }],
        'token-md': ['1.125rem', { lineHeight: '1.75rem' }],
        'token-lg': ['1.25rem', { lineHeight: '1.75rem' }],
        'token-xl': ['1.5rem', { lineHeight: '2rem' }],
        'token-2xl': ['1.875rem', { lineHeight: '2.25rem' }],
        'token-3xl': ['2.25rem', { lineHeight: '2.5rem' }],
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['"Inter"', 'sans-serif'],
        heading: ['"Inter"', 'system-ui', 'sans-serif'],
        mono: ['"SF Mono"', 'Menlo', 'Monaco', 'Consolas', '"Liberation Mono"', '"Courier New"', 'monospace']
      }
    }
  },
  plugins: []
};
