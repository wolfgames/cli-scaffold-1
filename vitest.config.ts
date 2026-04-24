import { defineConfig } from "vitest/config";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    // scripts/ and lint/ tests use bun:test and must be run with `bun test` directly
    exclude: [
      "tests/unit/scripts/**",
      "tests/unit/lint/**",
    ],
    globals: false,
    setupFiles: ["./tests/setup/adobe-data-shim.ts"],
  },
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "src"),
    },
  },
});
