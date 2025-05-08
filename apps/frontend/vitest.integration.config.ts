import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.integration.ts"],
    include: ["**/__tests__/**/*.integration.test.{ts,tsx}"],
    exclude: ["node_modules/**"],
  },
  resolve: {
    alias: {
      "~": resolve(__dirname, "app"),
      "@": resolve(__dirname, "."),
    },
  },
});
