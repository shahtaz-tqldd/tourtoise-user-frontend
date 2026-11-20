import { FlatCompat } from "@eslint/eslintrc";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "public/sw.js*",
      "public/workbox-*.js",
      "public/swe-worker-*.js",
    ],
  },
  ...compat.extends("next/core-web-vitals"),
];

export default eslintConfig;
