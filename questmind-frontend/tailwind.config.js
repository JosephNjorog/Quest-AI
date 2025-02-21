module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
      extend: {
        colors: {
          primary: {
            50: '#eef2ff',
            100: '#e0e7ff',
            200: '#c7d2fe',
            300: '#a5b4fc',
            400: '#818cf8',
            500: '#6366f1',
            600: '#4f46e5',
            700: '#4338ca',
            800: '#3730a3',
            900: '#312e81',
            950: '#1e1b4b',
          },
          secondary: {
            50: '#f5f3ff',
            100: '#ede9fe',
            200: '#ddd6fe',
            300: '#c4b5fd',
            400: '#a78bfa',
            500: '#8b5cf6',
            600: '#7c3aed',
            700: '#6d28d9',
            800: '#5b21b6',
            900: '#4c1d95',
            950: '#2e1065',
          },
          game: {
            dfk: '#3b82f6',
            heroes: '#ef4444',
          },
          dark: {
            100: '#d1d5db',
            200: '#9ca3af',
            300: '#6b7280',
            400: '#4b5563',
            500: '#374151',
            600: '#1f2937',
            700: '#111827',
            800: '#0f172a',
            900: '#030712',
          },
        },
        fontFamily: {
          sans: ['Inter', 'sans-serif'],
          display: ['Poppins', 'sans-serif'],
          mono: ['JetBrains Mono', 'monospace'],
        },
        boxShadow: {
          'glow': '0 0 15px rgba(99, 102, 241, 0.5)',
          'card': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
          'button': '0 4px 6px -1px rgba(99, 102, 241, 0.2), 0 2px 4px -1px rgba(99, 102, 241, 0.1)',
        },
        animation: {
          'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        },
        backgroundImage: {
          'hero-pattern': "url('/assets/hero-bg.jpg')",
          'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        },
      },
    },
    plugins: [
      require('@tailwindcss/forms'),
    ],
  };