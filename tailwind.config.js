/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          primary: 'var(--color-primary, #379A8D)',
          primaryHover: 'var(--color-primary-hover, #2E8377)',
          primaryText: 'var(--color-primary-text, #18181B)',
          dark: 'var(--color-dark, #1E293B)',
          darkMuted: 'var(--color-dark-muted, #64748B)',
          cream: 'var(--color-cream, #F8FBFB)',
          card: 'var(--color-card, #FFFFFF)',
          border: 'var(--color-border, #E2E8F0)',
          borderDark: 'var(--color-border-dark, #1E293B)',
        },
        finance: {
          incomeBg: 'var(--color-income-bg, #EBF6F4)',
          incomeText: 'var(--color-income-text, #047857)',
          expenseBg: 'var(--color-expense-bg, #FDF2F2)',
          expenseText: 'var(--color-expense-text, #B91C1C)',
          budgetBg: 'var(--color-budget-bg, #FEF9E7)',
          budgetText: 'var(--color-budget-text, #B45309)',
        },
        pocket: {
          food: '#FF7A59',
          bills: '#713B3B',
          savings: '#10B981',
          leisure: '#8B5CF6',
          invest: '#0EA5E9',
          star: '#FAAE2B',
        },
      },
      boxShadow: {
        'saweria-xs': '1px 1px 0px var(--color-border-dark, #1E293B)',
        'saweria-sm': '1.5px 1.5px 0px var(--color-border-dark, #1E293B)',
        'saweria': '2.5px 2.5px 0px var(--color-border-dark, #1E293B)',
        'saweria-lg': '4px 4px 0px var(--color-border-dark, #1E293B)',
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'sans-serif'],
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
      },
    },
  },
  plugins: [],
};
