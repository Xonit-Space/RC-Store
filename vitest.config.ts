import { defineConfig } from "vitest/config"
import path from "path"

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    fileParallelism: false,
    include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
