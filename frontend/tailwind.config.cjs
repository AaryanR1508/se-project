// frontend/tailwind.config.js
export default {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#5b4ff6',
          600: '#4f46e5',
        },
      },
      boxShadow: {
        card: '0 12px 30px rgba(2,6,23,0.06)',
        soft: '0 8px 20px rgba(2,6,23,0.04)',
      },
      borderRadius: {
        card: '1rem',
      },
    },
  },
};
