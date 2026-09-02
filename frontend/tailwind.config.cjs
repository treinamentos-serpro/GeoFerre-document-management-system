/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#142b32',
        canvas: '#edf2ef',
        pine: '#0d665d',
        clay: '#b9502d',
      },
    },
  },
  plugins: [],
};