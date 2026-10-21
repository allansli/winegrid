import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        burgundy: {
          50: "#fdf3f4",
          100: "#fbe6e9",
          200: "#f6d0d6",
          300: "#eeaab5",
          400: "#e3798c",
          500: "#d34c66",
          600: "#bc2d4d",
          700: "#9e203e",
          800: "#841e37",
          900: "#711d33",
          950: "#3f0b19",
        },
        champagne: {
          50: "#fbf9f1",
          100: "#f5f0dc",
          200: "#eae0b8",
          300: "#dec98c",
          400: "#d1af61",
          500: "#c69943",
          600: "#b47f37",
          700: "#95632f",
          800: "#7a502c",
          900: "#654227",
          950: "#392213",
        },
        cellar: {
          800: "#1c1618",
          900: "#130f11",
          950: "#0b0809",
        },
      },
      fontFamily: {
        serif: ["Georgia", "Cambria", "Times New Roman", "Times", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
