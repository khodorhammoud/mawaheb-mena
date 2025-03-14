import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    setupFiles: ["./tests/setup.integration.ts"],
    include: ["**/__tests__/**/*.integration.test.{ts,tsx}"],
    exclude: ["node_modules/**"],
  },
  resolve: {
    alias: {
      "~": resolve(__dirname, "."),
      "@keystone": resolve(__dirname, ".keystone"),
    },
  },
});
