import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: ["**/__tests__/**/*.test.{ts,tsx}"],
    exclude: ["**/__tests__/**/*.integration.test.{ts,tsx}", "node_modules/**"],
  },
  resolve: {
    alias: {
      "~": resolve(__dirname, "."),
      "@keystone": resolve(__dirname, ".keystone"),
    },
  },
});
