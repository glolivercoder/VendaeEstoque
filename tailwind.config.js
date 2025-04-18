/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--primary-color)',
          light: 'var(--primary-color-light)',
          dark: 'var(--primary-color-dark)',
        },
        secondary: {
          DEFAULT: 'var(--secondary-color)',
          light: 'var(--secondary-color-light)',
          dark: 'var(--secondary-color-dark)',
        },
        accent: 'var(--accent-color)',
        background: 'var(--background-color)',
        card: 'var(--card-background)',
        border: 'var(--border-color)',
        text: 'var(--text-color)',
        danger: 'var(--danger-color)',
        success: 'var(--success-color)',
        warning: 'var(--warning-color)',
      },
      fontFamily: {
        sans: ['Arial', 'sans-serif'],
      },
      fontSize: {
        'base': '18px',
        'lg': '1.1rem',
        'xl': '1.25rem',
        '2xl': '1.5rem',
        '3xl': '1.875rem',
        '4xl': '2.25rem',
      },
      fontWeight: {
        normal: 500,
        medium: 600,
        bold: 700,
      },
      borderRadius: {
        'sm': '4px',
        DEFAULT: '8px',
        'lg': '10px',
        'xl': '12px',
      },
      boxShadow: {
        DEFAULT: '0 4px 6px var(--shadow-color)',
        md: '0 6px 10px var(--shadow-color)',
        lg: '0 10px 15px var(--shadow-color)',
      },
    },
  },
  plugins: [],
}
