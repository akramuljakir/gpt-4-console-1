module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}', // Includes all components and pages from src folder
    './app/**/*.{js,ts,jsx,tsx}', // Ensure it includes components from the app directory
    './lib/**/*.{js,ts,jsx,tsx}', // Include utility libraries like HighlightSearch
  ],
  safelist: [
    'bg-yellow-300',
    'bg-green-300',
    'bg-blue-300',
    'bg-pink-300',
    'bg-red-300',
    'bg-purple-300',
    'bg-teal-300',
    'bg-orange-300',
    'bg-gray-300',
    'bg-indigo-300',
    'bg-lime-300',
    'bg-rose-300',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
