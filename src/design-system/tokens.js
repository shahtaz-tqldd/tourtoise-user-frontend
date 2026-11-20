/**
 * JS mirror of the design tokens in `src/styles/tokens.css`.
 *
 * Use these only where a CSS class cannot reach — SVG `fill`/`stroke` props,
 * Leaflet map styles, canvas, meta theme colors. Everywhere else use the
 * Tailwind utilities (`text-heading`, `bg-brand-600`, …) so a token change
 * in CSS updates the whole app.
 */

export const palette = {
  brand: {
    50: "#ecfdf5",
    100: "#d0fae5",
    200: "#a4f4cf",
    300: "#5ee9b5",
    400: "#00d492",
    500: "#00bc7d",
    600: "#009966",
    700: "#007a55",
    800: "#006045",
    900: "#004f3b",
    950: "#002c22",
  },
  sand: {
    50: "#fffbeb",
    100: "#fef3c6",
    200: "#fee685",
    300: "#ffd230",
    400: "#ffb900",
    500: "#fe9a00",
    600: "#e17100",
    700: "#bb4d00",
  },
  ocean: {
    50: "#ecfeff",
    100: "#cefafe",
    200: "#a2f4fd",
    500: "#00b8db",
    600: "#0092b8",
    700: "#007595",
  },
  ink: {
    50: "#f8fafc",
    100: "#f1f5f9",
    200: "#e2e8f0",
    300: "#cad5e2",
    400: "#90a1b9",
    500: "#62748e",
    600: "#45556c",
    700: "#314158",
    800: "#1d293d",
    900: "#0f172b",
    950: "#020618",
  },
};

export const colors = {
  primary: palette.brand[600],
  heading: palette.ink[900],
  body: palette.ink[600],
  subtle: palette.ink[500],
  faint: palette.ink[400],
  canvas: "#eef7f3",
  surface: "#ffffff",
  line: palette.ink[200],
  icon: "#1C274C",
  success: "#00a63e",
  warning: palette.sand[600],
  danger: "#e7000b",
  info: palette.ocean[600],
};

export const fonts = {
  sans: '"Inter", ui-sans-serif, system-ui, sans-serif',
  display: '"Plus Jakarta Sans", "Inter", ui-sans-serif, system-ui, sans-serif',
};
