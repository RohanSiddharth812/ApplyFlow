/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        wisteria: {
          light: '#EBE2F1',
          DEFAULT: '#CCABD8',
          dark: '#B088BF',
        },
        kimberly: {
          light: '#9E90B6',
          DEFAULT: '#8474A1',
          dark: '#584B70',
          darker: '#433857',
        },
        downy: {
          light: '#E6F8F9',
          DEFAULT: '#6EC6CA',
          dark: '#4BAEAF',
        },
        niagara: {
          light: '#14B8BE',
          DEFAULT: '#08979D',
          dark: '#067B80',
        },
        deepsea: {
          light: '#0A7B7D',
          DEFAULT: '#055B5C',
          dark: '#033F40',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
