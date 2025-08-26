// tailwind.config.js
const {heroui} = require("@heroui/theme");
const colors = require("./src/styles/colors.ts").colors;

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/components/(alert|button|ripple|spinner|card|divider|link).js",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#e7e9f8',
          100: '#c4c9ed',
          200: '#9da7e1',
          300: '#7685d5',
          400: '#596bcb',
          500: '#334293', // Main brand color
          600: '#2d3a83',
          700: '#252f70',
          800: '#1e255d',
          900: '#13183e',
        },
        accent: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#EFE957', // Secondary brand color
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
        },
        blueLogo: colors.blueLogo,
        yellowLogo: colors.yellowLogo,
      },
    },
  },
  darkMode: "class",
  plugins: [heroui(), require('@tailwindcss/line-clamp')],
};