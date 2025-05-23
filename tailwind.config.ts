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
        background: "var(--background)",
        foreground: "var(--foreground)",
        // Add Google-like colors (optional, adjust as needed)
        'google-blue': '#4285F4',
        'google-red': '#DB4437',
        'google-yellow': '#F4B400',
        'google-green': '#0F9D58',
        'google-grey': '#f8f9fa', // Light grey background
        'google-text': '#202124', // Primary text
        'google-text-secondary': '#5f6368', // Secondary text
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
  plugins: [],
};
export default config;
