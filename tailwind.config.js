/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: '#FAAE2B',
          primaryHover: '#E89E20',
          dark: '#18181B',
          darkMuted: '#52525B',
          cream: '#FFFDF8',
          card: '#FFFFFF',
          border: '#E4E0D7',
          borderDark: '#18181B',
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
        'saweria-sm': '1.5px 1.5px 0px #18181B',
        'saweria': '2.5px 2.5px 0px #18181B',
        'saweria-lg': '4px 4px 0px #18181B',
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
