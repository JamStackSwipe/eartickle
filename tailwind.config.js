/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", 
    "./pages/**/*.{js,jsx,ts,tsx}"
  ],
  safelist: [
    'bg-amber-600',
    'bg-blue-600',
    'bg-pink-600',
    'bg-purple-600',
    'bg-cyan-600',
    'bg-red-600',
    'ring-amber-500',
    'ring-blue-500',
    'ring-pink-500',
    'ring-purple-500',
    'ring-cyan-500',
    'ring-red-500',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
