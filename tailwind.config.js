module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './util/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'base-dropdown': '#767676',
      }
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: ['light', 'dark'],
  },
}
