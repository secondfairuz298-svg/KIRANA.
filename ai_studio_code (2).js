/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        kirana: {
          cream: {
            50: '#FDFBF7',  // Background utama yang hangat
            100: '#FAF5ED',
            200: '#F4EBE1', // Card container latar lembut
            300: '#E8D7C4'
          },
          brown: {
            300: '#A97C65',
            500: '#8D5B4C', // Aksen primer & Red Card rate
            700: '#5C382C', // Elemen interaktif
            800: '#4A2E24', // Headings teks dengan kontras tinggi
            900: '#2D1E18'  // Teks paragraf utama (Accessible & Clear Readability)
          }
        }
      }
    },
  },
  plugins: [],
}