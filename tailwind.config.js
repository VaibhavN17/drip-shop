/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/client/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["Outfit", "Inter", "sans-serif"],
        sans:    ["Inter", "system-ui", "sans-serif"],
      },
      colors: {
        border:      "hsl(var(--border))",
        background:  "hsl(var(--background))",
        foreground:  "hsl(var(--foreground))",
        primary:     { DEFAULT: "hsl(var(--primary))", foreground: "hsl(var(--primary-foreground))" },
        secondary:   { DEFAULT: "hsl(var(--secondary))", foreground: "hsl(var(--secondary-foreground))" },
        muted:       { DEFAULT: "hsl(var(--muted))", foreground: "hsl(var(--muted-foreground))" },
        accent:      { DEFAULT: "hsl(var(--accent))", foreground: "hsl(var(--accent-foreground))" },
        destructive: { DEFAULT: "hsl(var(--destructive))", foreground: "hsl(var(--destructive-foreground))" },
        card:        { DEFAULT: "hsl(var(--card))", foreground: "hsl(var(--card-foreground))" },
        // ── Agricultural brand palette ──────────────────────────
        forest: {
          900: "#0d2818", 800: "#1a4731", 700: "#1f5c3e",
          600: "#2d7a4f", 500: "#3a9e68", 400: "#52c27d",
          300: "#7dd99a", 200: "#b8edca", 100: "#e0f7ea", 50: "#f0fdf6",
        },
        earth: {
          900: "#451a03", 700: "#92400e", 500: "#b45309",
          300: "#d97706", 100: "#fef3c7",
        },
        sun: { 500: "#f59e0b", 400: "#fbbf24", 300: "#fcd34d" },
        warm: { white: "#fafaf7", off: "#f5f5f0" },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
      animation: {
        "fade-up":    "fadeUp 0.7s ease forwards",
        "fade-in":    "fadeIn 0.6s ease forwards",
        "float-up":   "floatUp 3.5s ease-in-out infinite",
        "float-down": "floatDown 4s ease-in-out infinite",
        marquee:      "marqueeLeft 28s linear infinite",
        drop:         "dropFall 2.5s ease-in infinite",
        shimmer:      "shimmer 3s linear infinite",
        "pulse-ring": "pulse-ring 2s ease infinite",
      },
      keyframes: {
        fadeUp:     { from: { opacity: "0", transform: "translateY(40px)" }, to: { opacity: "1", transform: "translateY(0)" } },
        fadeIn:     { from: { opacity: "0" }, to: { opacity: "1" } },
        floatUp:    { "0%, 100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-12px)" } },
        floatDown:  { "0%, 100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(10px)" } },
        marqueeLeft: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
        dropFall:   { "0%": { transform: "translateY(-8px) scale(1)", opacity: "0" }, "40%": { opacity: "0.7" }, "100%": { transform: "translateY(20px) scale(0.5)", opacity: "0" } },
        shimmer:    { from: { backgroundPosition: "-200% center" }, to: { backgroundPosition: "200% center" } },
        "pulse-ring": { "0%": { transform: "scale(0.95)", boxShadow: "0 0 0 0 rgba(45,122,79,0.4)" }, "70%": { transform: "scale(1)", boxShadow: "0 0 0 10px rgba(45,122,79,0)" }, "100%": { transform: "scale(0.95)", boxShadow: "0 0 0 0 rgba(45,122,79,0)" } },
      },
      backgroundImage: {
        "hero-gradient":    "linear-gradient(135deg, #0d2818 0%, #1a4731 50%, #2d7a4f 100%)",
        "section-gradient": "linear-gradient(180deg, #f0fdf6 0%, #ffffff 100%)",
        "cta-gradient":     "linear-gradient(135deg, #1a4731 0%, #2d7a4f 60%, #3a9e68 100%)",
        "warm-gradient":    "linear-gradient(180deg, #fafaf7 0%, #f0fdf6 100%)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
