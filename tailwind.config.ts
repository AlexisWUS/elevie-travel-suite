import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        elevie: {
          ink: "#1B3A4B",
          sand: "#F5F0E8",
          gold: "#B8905A",
          sage: "#C9D2C2",
          mist: "#EDE7D8"
        }
      }
    },
  },
  plugins: [],
} satisfies Config;
