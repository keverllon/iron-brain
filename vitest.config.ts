import { defineConfig } from "vitest/config";
import path from "path";
import dotenv from "dotenv";

// Carregar .env explicitamente
dotenv.config({ path: path.resolve(__dirname, ".env") });

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["src/**/*.test.ts", "src/**/*.spec.ts"],
    env: {
      DATABASE_URL:
        process.env.DATABASE_URL ||
        "postgresql://postgres:postgres@localhost:5432/ironbrain",
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
