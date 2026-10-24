import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gray: {
          50: 'color-mix(in srgb, var(--color-gray-50) calc(<alpha-value> * 100%), transparent)',
          100: 'color-mix(in srgb, var(--color-gray-100) calc(<alpha-value> * 100%), transparent)',
          200: 'color-mix(in srgb, var(--color-gray-200) calc(<alpha-value> * 100%), transparent)',
          300: 'color-mix(in srgb, var(--color-gray-300) calc(<alpha-value> * 100%), transparent)',
          400: 'color-mix(in srgb, var(--color-gray-400) calc(<alpha-value> * 100%), transparent)',
          500: 'color-mix(in srgb, var(--color-gray-500) calc(<alpha-value> * 100%), transparent)',
          600: 'color-mix(in srgb, var(--color-gray-600) calc(<alpha-value> * 100%), transparent)',
          700: 'color-mix(in srgb, var(--color-gray-700) calc(<alpha-value> * 100%), transparent)',
          800: 'color-mix(in srgb, var(--color-gray-800) calc(<alpha-value> * 100%), transparent)',
          900: 'color-mix(in srgb, var(--color-gray-900) calc(<alpha-value> * 100%), transparent)',
          950: 'color-mix(in srgb, var(--color-gray-950) calc(<alpha-value> * 100%), transparent)',
        },
        slate: {
          50: 'color-mix(in srgb, var(--color-gray-50) calc(<alpha-value> * 100%), transparent)',
          100: 'color-mix(in srgb, var(--color-gray-100) calc(<alpha-value> * 100%), transparent)',
          200: 'color-mix(in srgb, var(--color-gray-200) calc(<alpha-value> * 100%), transparent)',
          300: 'color-mix(in srgb, var(--color-gray-300) calc(<alpha-value> * 100%), transparent)',
          400: 'color-mix(in srgb, var(--color-gray-400) calc(<alpha-value> * 100%), transparent)',
          500: 'color-mix(in srgb, var(--color-gray-500) calc(<alpha-value> * 100%), transparent)',
          600: 'color-mix(in srgb, var(--color-gray-600) calc(<alpha-value> * 100%), transparent)',
          700: 'color-mix(in srgb, var(--color-gray-700) calc(<alpha-value> * 100%), transparent)',
          800: 'color-mix(in srgb, var(--color-gray-800) calc(<alpha-value> * 100%), transparent)',
          900: 'color-mix(in srgb, var(--color-gray-900) calc(<alpha-value> * 100%), transparent)',
          950: 'color-mix(in srgb, var(--color-gray-950) calc(<alpha-value> * 100%), transparent)',
        },
        blue: {
          50: 'color-mix(in srgb, var(--color-blue-50) calc(<alpha-value> * 100%), transparent)',
          100: 'color-mix(in srgb, var(--color-blue-100) calc(<alpha-value> * 100%), transparent)',
          200: 'color-mix(in srgb, var(--color-blue-200) calc(<alpha-value> * 100%), transparent)',
          300: 'color-mix(in srgb, var(--color-blue-300) calc(<alpha-value> * 100%), transparent)',
          400: 'color-mix(in srgb, var(--color-blue-400) calc(<alpha-value> * 100%), transparent)',
          500: 'color-mix(in srgb, var(--color-blue-500) calc(<alpha-value> * 100%), transparent)',
          600: 'color-mix(in srgb, var(--color-blue-600) calc(<alpha-value> * 100%), transparent)',
          700: 'color-mix(in srgb, var(--color-blue-700) calc(<alpha-value> * 100%), transparent)',
          800: 'color-mix(in srgb, var(--color-blue-800) calc(<alpha-value> * 100%), transparent)',
          900: 'color-mix(in srgb, var(--color-blue-900) calc(<alpha-value> * 100%), transparent)',
          950: 'color-mix(in srgb, var(--color-blue-950) calc(<alpha-value> * 100%), transparent)',
        },
        indigo: {
          50: 'color-mix(in srgb, var(--color-blue-50) calc(<alpha-value> * 100%), transparent)',
          100: 'color-mix(in srgb, var(--color-blue-100) calc(<alpha-value> * 100%), transparent)',
          200: 'color-mix(in srgb, var(--color-blue-200) calc(<alpha-value> * 100%), transparent)',
          300: 'color-mix(in srgb, var(--color-blue-300) calc(<alpha-value> * 100%), transparent)',
          400: 'color-mix(in srgb, var(--color-blue-400) calc(<alpha-value> * 100%), transparent)',
          500: 'color-mix(in srgb, var(--color-blue-500) calc(<alpha-value> * 100%), transparent)',
          600: 'color-mix(in srgb, var(--color-blue-600) calc(<alpha-value> * 100%), transparent)',
          700: 'color-mix(in srgb, var(--color-blue-700) calc(<alpha-value> * 100%), transparent)',
          800: 'color-mix(in srgb, var(--color-blue-800) calc(<alpha-value> * 100%), transparent)',
          900: 'color-mix(in srgb, var(--color-blue-900) calc(<alpha-value> * 100%), transparent)',
          950: 'color-mix(in srgb, var(--color-blue-950) calc(<alpha-value> * 100%), transparent)',
        },
      }
    },
  },
  plugins: [],
};
export default config;
