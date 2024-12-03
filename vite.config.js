import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
    build: {
        lib: {
            entry: resolve(import.meta.dirname, "src/index.ts"),
            formats: ["es"],
        },
        rollupOptions: {
            external: ["hexcod"],
        },
        outDir: "./lib",
        sourcemap: true,
    },
    resolve: {
        alias: [{ find: "@", replacement: "/src" }],
    },
});
