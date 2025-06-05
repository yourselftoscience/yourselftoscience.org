import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Add Google-like colors (optional, adjust as needed)
        'google-blue': '#1156B0',
        'google-red': '#DB4437',
        'google-yellow': '#F4B400',
        'google-green': '#0F9D58',
        'google-grey': '#f8f9fa', // Light grey background
        'google-text': '#202124', // Primary text
        'google-text-secondary': '#5f6368', // Secondary text
        'footer-link-blue': '#8AB8F4', // New color for footer links
        'title-yellow': '#FFE98A', // Updated yellow for the title text (solid fill)
        'custom-yellow-link': '#F6BE13', // New custom yellow for specific links
      },
      gridTemplateColumns: {
        // Adjust layout: single column by default, two columns on large screens
        'layout': '1fr', // Single column by default
        'lg-layout': '250px 1fr', // Sidebar + main content on large screens and up
      },
    },
  },
  // Add future compatibility flags for Tailwind v3 -> v4 transition
  future: {
    hoverOnlyWhenSupported: true,
  },
  plugins: [
    plugin(function ({ addUtilities }) {
      addUtilities({
        ".text-stroke-yellow-dark": {
          "-webkit-text-stroke-width": "0.4px",
          "-webkit-text-stroke-color": "#ffd92d",
          "text-stroke-width": "0.4px",
          "text-stroke-color": "#ffd92d",
          "background-image": "linear-gradient(to bottom, #ffd92d, #B35F00)",
          "-webkit-background-clip": "text",
          "background-clip": "text",
          color: "transparent",
          "-webkit-text-fill-color": "transparent",
        },
      });
    }),
  ],
};
export default config;
