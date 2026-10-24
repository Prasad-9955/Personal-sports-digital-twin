/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        surfaceDark: "#0A0E17",
        surfaceElevated: "#0E1524",
        cardDark: "#131B2E",
        cardGlass: "#1A2642",
        borderSubtle: "#1E293B",
        borderGlow: "#334155",
        accentCyan: "#00F2FE",
        electricTeal: "#4FACFE",
        emeraldGreen: "#10B981",
        warningAmber: "#F59E0B",
        dangerCoral: "#EF4444",
        textLight: "#F8FAFC",
        textMuted: "#94A3B8",
        textDim: "#64748B",
      },
      backgroundImage: {
        'accent-gradient': 'linear-gradient(135deg, #00F2FE 0%, #4FACFE 100%)',
        'hero-gradient': 'linear-gradient(135deg, #0E1A33 0%, #14244B 50%, #1A3366 100%)',
        'glass-gradient': 'linear-gradient(135deg, #131B2E 0%, #1A2642 100%)',
        'gemini-gradient': 'linear-gradient(135deg, #2E1065 0%, #1E1B4B 100%)',
      },
      boxShadow: {
        'neon-cyan': '0 0 20px -3px rgba(0, 242, 254, 0.25)',
        'neon-coral': '0 0 20px -3px rgba(239, 68, 68, 0.25)',
        'neon-amber': '0 0 20px -3px rgba(245, 158, 11, 0.25)',
      }
    },
  },
  plugins: [],
}
