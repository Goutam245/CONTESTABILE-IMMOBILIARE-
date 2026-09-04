import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Content globs are resolved against process.cwd(), so anchor them to this file
// instead — otherwise launching the dev server from a parent directory scans
// nothing and every class gets tree-shaken out.
const here = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('tailwindcss').Config} */
export default {
  content: [path.join(here, 'index.html'), path.join(here, 'src/**/*.{ts,tsx}')],
  theme: {
    extend: {
      /**
       * Tailwind's stock opacity scale only carries multiples of five, and an
       * opacity modifier outside the scale emits NO rule at all — silently.
       * `border-ink/8` and `bg-bone/92` were therefore invisible: hairlines
       * vanished, and the header and filter panel rendered fully transparent.
       * Defining every integer makes the whole 0–100 range valid; JIT still
       * only emits the handful actually used.
       */
      opacity: Object.fromEntries(
        Array.from({ length: 101 }, (_, i) => [i, String(i / 100)]),
      ),

      colors: {
        // Sampled directly from the client logo (WhatsApp Image 2026-09-02).
        // Modal non-white pixels: #00812F (green), #EE450E (orange-red).
        brand: {
          50:  '#EAF6EE',
          100: '#CDEAD8',
          200: '#98D3AE',
          300: '#5FB983',
          400: '#2A9C58',
          500: '#00812F', // logo green — primary
          600: '#00702A',
          700: '#005B23',
          800: '#00461B',
          900: '#003414',
        },
        terra: {
          50:  '#FEF1EC',
          100: '#FDDDD1',
          200: '#FAB79F',
          300: '#F68E6B',
          400: '#F26A3D',
          500: '#EE450E', // logo orange-red — accent / CTA
          600: '#D63A08',
          700: '#B02F06',
          800: '#8A2505',
          900: '#661B04',
        },
        /** WhatsApp's own brand green — used only for the WhatsApp control. */
        whatsapp: { DEFAULT: '#25D366', 600: '#1EBE5A' },
        ink: {
          DEFAULT: '#0A1410',
          soft:    '#16241D',
          muted:   '#4A5B52',
          /* #7C8A82 measured 3.40:1 on bone and is used for form labels,
             table headers and the specs panel — content, not decoration. */
          faint:   '#64726A',
        },
        bone: {
          DEFAULT: '#FAF8F3',
          100:     '#F5F2EA',
          200:     '#EBE6DA',
          300:     '#DCD5C4',
        },
      },
      fontFamily: {
        display: ['Fraunces', 'Georgia', 'Times New Roman', 'serif'],
        sans: ['"Inter Tight"', 'Inter', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
      },
      fontSize: {
        '7.5xl': ['5.25rem', { lineHeight: '0.95', letterSpacing: '-0.03em' }],
        '8.5xl': ['6.5rem',  { lineHeight: '0.92', letterSpacing: '-0.035em' }],
      },
      letterSpacing: { eyebrow: '0.22em' },
      /* 400 is absent from Tailwind's stock duration scale, so `duration-400`
         emitted no rule and four transitions silently ran at the 150ms
         default — the nav underline, both burger bars and the sticky bar. */
      transitionDuration: { 400: '400ms' },
      maxWidth: { shell: '90rem' },
      transitionTimingFunction: {
        cinematic: 'cubic-bezier(0.16, 1, 0.3, 1)',
        swift: 'cubic-bezier(0.4, 0, 0.2, 1)',
      },
      boxShadow: {
        lift: '0 1px 2px rgba(10,20,16,.04), 0 12px 32px -12px rgba(10,20,16,.16)',
        'lift-lg': '0 2px 4px rgba(10,20,16,.05), 0 32px 64px -24px rgba(10,20,16,.28)',
      },
      keyframes: {
        'scroll-cue': {
          '0%':        { transform: 'translateY(-40%)', opacity: '0' },
          '35%,65%':   { opacity: '1' },
          '100%':      { transform: 'translateY(140%)', opacity: '0' },
        },
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to:   { opacity: '1', transform: 'none' },
        },
        'sheen': {
          from: { transform: 'translateX(-120%)' },
          to:   { transform: 'translateX(220%)' },
        },
        // Slow golden-hour drift across a hero photograph. Long period and
        // small travel on purpose: it should read as light changing, not as
        // something moving.
        // Capped at .38: the layer sits under the scrim, so raising it lifts the
        // background luminance and measurably lowers headline contrast.
        'atmosphere': {
          '0%, 100%': { transform: 'translate3d(-3%, -2%, 0) scale(1.06)', opacity: '.20' },
          '50%':      { transform: 'translate3d(4%, 3%, 0) scale(1.14)',   opacity: '.38' },
        },
        // The continuous ambient element — one slow revolution, forever.
        'orbit': {
          from: { transform: 'rotate(0deg)' },
          to:   { transform: 'rotate(360deg)' },
        },
        'orbit-reverse': {
          from: { transform: 'rotate(360deg)' },
          to:   { transform: 'rotate(0deg)' },
        },
        'breathe': {
          '0%, 100%': { opacity: '.35', transform: 'scale(1)' },
          '50%':      { opacity: '.7',  transform: 'scale(1.06)' },
        },
      },
      animation: {
        'scroll-cue': 'scroll-cue 2.4s cubic-bezier(0.16,1,0.3,1) infinite',
        'fade-up': 'fade-up .6s cubic-bezier(0.16,1,0.3,1) both',
        'sheen': 'sheen 1.6s cubic-bezier(0.4,0,0.2,1) infinite',
        'atmosphere': 'atmosphere 26s ease-in-out infinite',
        'orbit': 'orbit 64s linear infinite',
        'orbit-reverse': 'orbit-reverse 96s linear infinite',
        'breathe': 'breathe 7s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
