/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: {
          light: '#ffffff',
          dark: '#000000',
        },
        surface: {
          soft: '#f4f4f4',
          card: '#ffffff',
          deep: '#0a0a0a',
          elevated: '#16181a',
        },
        hairline: {
          light: '#e2e2e7',
          dark: 'rgba(255,255,255,0.12)',
          strong: '#191c1f',
        },
        primary: {
          DEFAULT: '#494fdf',
          bright: '#4f55f1',
          deep: '#3a40c4',
        },
        on: {
          primary: '#ffffff',
          dark: '#ffffff',
          'dark-mute': 'rgba(255,255,255,0.72)',
        },
        ink: '#191c1f',
        body: '#1f2226',
        charcoal: '#3a3d40',
        mute: '#505a63',
        ash: '#5c5e60',
        stone: '#8d969e',
        faint: '#c9c9cd',
        accent: {
          teal: '#00a87e',
          'light-blue': '#007bc2',
          'blue-link': '#376cd5',
          'light-green': '#428619',
          'green-text': '#006400',
          yellow: '#b09000',
          warning: '#ec7e00',
          pink: '#e61e49',
          danger: '#e23b4a',
          'deep-red': '#8b0000',
          brown: '#936d62',
        }
      },
      fontFamily: {
        display: ['Geist', 'sans-serif'],
        sans: ['Geist', 'sans-serif'],
      },
      letterSpacing: {
        tighter: '-0.04em',
        tight: '-0.02em',
        normal: '0',
        wide: '0.015em',
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '20px',
        xl: '28px',
        full: '9999px',
      },
      spacing: {
        'xxs': '4px',
        'xs': '6px',
        'sm': '8px',
        'md': '14px',
        'lg': '16px',
        'xl': '24px',
        'xxl': '32px',
        'xxxl': '48px',
        'block': '80px',
        'section': '88px',
        'band': '120px',
      }
    },
  },
  plugins: [],
}
