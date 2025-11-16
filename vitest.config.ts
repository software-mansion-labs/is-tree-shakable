import { defineConfig } from "vitest/config";

const config = defineConfig({ test: { environment: "node", include: ["test/**/*.test.ts"] } });

export default config;
