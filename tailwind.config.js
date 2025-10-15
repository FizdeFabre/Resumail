/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: 'hsl(var(--color-background))',
        foreground: 'hsl(var(--color-foreground))',

        card: 'hsl(var(--color-card))',
        cardForeground: 'hsl(var(--color-card-foreground))',

        primary: 'hsl(var(--color-primary))',
        primaryForeground: 'hsl(var(--color-primary-foreground))',
        secondary: 'hsl(var(--color-secondary))',
        secondaryForeground: 'hsl(var(--color-secondary-foreground))',

        success: 'hsl(var(--color-success))',
        warning: 'hsl(var(--color-warning))',
        error: 'hsl(var(--color-error))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
};