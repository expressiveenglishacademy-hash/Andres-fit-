/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#f4f7f3',
        mist: '#eaf2ec',
        brand: '#245d44',
        ink: '#13271d',
        sand: '#fffaf1',
        amberSoft: '#f4b450',
        coral: '#ef7c57',
      },
      fontFamily: {
        sans: ['Manrope', 'sans-serif'],
        display: ['Fraunces', 'serif'],
      },
      boxShadow: {
        soft: '0 18px 50px rgba(17, 24, 39, 0.08)',
        float: '0 26px 70px rgba(36, 93, 68, 0.14)',
      },
      backgroundImage: {
        glow:
          'radial-gradient(circle at top left, rgba(244, 180, 80, 0.18), transparent 34%), radial-gradient(circle at bottom right, rgba(36, 93, 68, 0.12), transparent 30%)',
      },
    },
  },
  plugins: [],
};
