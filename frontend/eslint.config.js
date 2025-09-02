// eslint.config.js
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import jsxA11y from "eslint-plugin-jsx-a11y";
import globals from "globals";

export default [
  // 1) Global ignore
  { ignores: ["dist/**", "node_modules/**"] },

  // 2) Base JS (untuk file konfigurasi .js)
  js.configs.recommended,

  // 3) App source TS/TSX: type-checked (tsconfig.app.json)
  ...[
    ...tseslint.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
  ].map(cfg => ({
    ...cfg,
    files: ["src/**/*.{ts,tsx}"],
    languageOptions: {
      ...cfg.languageOptions,
      parserOptions: {
        ...cfg.languageOptions?.parserOptions,
        project: "./tsconfig.app.json",
        tsconfigRootDir: import.meta.dirname,
      },
      globals: { ...globals.browser, ...globals.node },
    },
    plugins: {
      ...(cfg.plugins || {}),
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "jsx-a11y": jsxA11y,
    },
    settings: { react: { version: "detect" } },
    rules: {
      "react/react-in-jsx-scope": "off",
      "react/jsx-uses-react": "off",
      "react/jsx-uses-vars": "warn",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
      "jsx-a11y/alt-text": "warn",
      ...(cfg.rules || {}),
    },
  })),

  // 4) Vite config (TS) pakai tsconfig.node.json
  ...tseslint.configs.recommendedTypeChecked.map(cfg => ({
    ...cfg,
    files: ["vite.config.ts"],
    languageOptions: {
      ...cfg.languageOptions,
      parserOptions: {
        ...cfg.languageOptions?.parserOptions,
        project: "./tsconfig.node.json",
        tsconfigRootDir: import.meta.dirname,
      },
      globals: { ...globals.node }
    },
  })),
];