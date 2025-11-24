/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        safe: '#10b981',
        suspicious: '#f59e0b',
        phishing: '#ef4444',
        malware: '#dc2626',
        unknown: '#6b7280',
      },
    },
  },
  plugins: [],
}

