/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        transparent: 'transparent',
        current: 'currentColor',
        dark: {
          primary: '#0B0C0D',
          secondary: '#2A2B2C',
          tertiary: '#191B1C',
        },
        light: {
          primary: '#FFFFFF',
          secondary: '#F5F6F6',
        },
        'primary-opacity': 'rgba(8, 66, 69, 0.7)',
        secondary: { DEFAULT: '#d9dd28' },
        warning: { DEFAULT: '#fb8903', light: '#fff0ca' },
        danger: { DEFAULT: '#ff0000', light: ' #ffebeb' },
        success: { DEFAULT: '#5cb85c', light: '#ecffef' },
        gray: {
          dark: '#2D4A58',
          DEFAULT: '#3c4858',
          medium: '#818181',
          light: '#b7b7b7',
          lightest: '#f2f2f3',
        },
        filled: {},
      },
    },
  },
  plugins: [],
}