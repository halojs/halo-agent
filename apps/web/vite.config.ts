/// <reference types="vitest/config" />

import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import pkg from "./package.json" with { type: "json" };

export default defineConfig({
  plugins: [
    tanstackRouter(),
    react(),
    babel({
      parserOpts: { plugins: ["typescript", "jsx"] },
      presets: [reactCompilerPreset()],
    }),
    tailwindcss(),
  ],

  define: {
    "import.meta.env.APP_VERSION": JSON.stringify(pkg.version),
    "import.meta.env.APP_BUILT_TIME": JSON.stringify(new Date()),
  },

  resolve: {
    tsconfigPaths: true,
  },
});
