/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Space Grotesk"', 'ui-sans-serif', 'system-ui'],
        body: ['Inter', 'ui-sans-serif', 'system-ui']
      },
      colors: {
        midnight: '#08101c',
        ink: '#141b24',
        coral: '#ff6b6b',
        yarn: '#ff9f1c',
        mauve: '#c084fc',
        ether: '#7dd3fc'
      }
    }
  },
  plugins: []
}
