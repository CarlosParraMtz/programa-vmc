/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "program-treasures": "#3c7f8b",
        "program-teachers": "#d68f00",
        "program-life": "#bf2f13"
      }
    },
  },
  plugins: [],
}

