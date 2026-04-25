/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      "colors": {
          "primary": "#006c50",
          "on-primary": "#ffffff",
          "primary-container": "#00ffc2",
          "on-primary-container": "#007255",
          "inverse-primary": "#00e1ab",
          "secondary": "#5e5e5e",
          "on-secondary": "#ffffff",
          "secondary-container": "#e2e2e2",
          "on-secondary-container": "#646464",
          "tertiary": "#5d5e60",
          "on-tertiary": "#ffffff",
          "tertiary-container": "#e1e1e2",
          "on-tertiary-container": "#626465",
          "background": "#fbf8ff",
          "on-background": "#1a1b22",
          "surface": "#fbf8ff",
          "on-surface": "#1a1b22",
          "surface-variant": "#e3e1ec",
          "on-surface-variant": "#3a4a43",
          "outline": "#6a7b72",
          "outline-variant": "#b9cbc1",
          "inverse-surface": "#2f3038",
          "inverse-on-surface": "#f1effa",
          "error": "#ba1a1a",
          "on-error": "#ffffff",
          "error-container": "#ffdad6",
          "on-error-container": "#93000a",
          "surface-container-lowest": "#ffffff",
          "surface-container-low": "#f4f2fd",
          "surface-container": "#eeedf7",
          "surface-container-high": "#e8e7f1",
          "surface-container-highest": "#e3e1ec",
          "surface-dim": "#dad9e3",
          "surface-bright": "#fbf8ff"
      },
      "borderRadius": {
          "sm": "0.25rem",
          "DEFAULT": "0.5rem",
          "md": "0.75rem",
          "lg": "1rem",
          "xl": "1.5rem",
          "full": "9999px"
      },
      "spacing": {
          "base": "4px",
          "xs": "8px",
          "sm": "16px",
          "md": "24px",
          "lg": "48px",
          "xl": "80px",
          "gutter": "24px",
          "margin": "32px"
      },
      "fontFamily": {
          "display-xl": ["Public Sans", "sans-serif"],
          "headline-lg": ["Public Sans", "sans-serif"],
          "headline-md": ["Public Sans", "sans-serif"],
          "body-lg": ["Inter", "sans-serif"],
          "body-md": ["Inter", "sans-serif"],
          "label-bold": ["Inter", "sans-serif"]
      },
      "fontSize": {
          "display-xl": ["80px", { "lineHeight": "100%", "letterSpacing": "-0.04em", "fontWeight": "900" }],
          "headline-lg": ["48px", { "lineHeight": "110%", "letterSpacing": "-0.03em", "fontWeight": "800" }],
          "headline-md": ["32px", { "lineHeight": "120%", "letterSpacing": "-0.02em", "fontWeight": "800" }],
          "body-lg": ["18px", { "lineHeight": "160%", "letterSpacing": "-0.01em", "fontWeight": "400" }],
          "body-md": ["16px", { "lineHeight": "150%", "letterSpacing": "0", "fontWeight": "400" }],
          "label-bold": ["14px", { "lineHeight": "100%", "letterSpacing": "0.05em", "fontWeight": "700" }]
      }
    }
  },
  plugins: [],
}
