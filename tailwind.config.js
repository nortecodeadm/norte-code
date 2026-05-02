/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./lib/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Norte Code brand palette
        "garden-green": {
          DEFAULT: "#1F5F3F",
          50: "#E8F5EE",
          100: "#C6E8D5",
          200: "#8FD1AB",
          300: "#58BA81",
          400: "#2E8F5A",
          500: "#1F5F3F",
          600: "#1A5035",
          700: "#15402B",
          800: "#103021",
          900: "#0B2017",
        },
        gold: {
          DEFAULT: "#D4A744",
          50: "#FDF8ED",
          100: "#FAEDCC",
          200: "#F5DB99",
          300: "#F0C966",
          400: "#D4A744",
          500: "#B8892E",
          600: "#9C6B18",
          700: "#7F4E02",
          800: "#5F3B01",
          900: "#3F2801",
        },
        "warm-white": "#FDFBF7",
        earth: {
          DEFAULT: "#8B6F47",
          light: "#C4A882",
          dark: "#5C4A30",
        },
        sky: {
          DEFAULT: "#87CEEB",
          light: "#B8E4F5",
          dark: "#5BAED4",
        },
      },
      fontFamily: {
        nunito: ["Nunito"],
        fraunces: ["Fraunces"],
        lora: ["Lora"],
      },
    },
  },
  plugins: [],
};

