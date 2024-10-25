import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
    build: {
        lib: {
            entry: {
                rez: resolve(import.meta.dirname, "src/formats/rez/index.ts"),
            },
            formats: ["es"],
        },
        rollupOptions: {
            external: ["hexcod"],
        },
        outDir: "./lib",
    },
    resolve: {
        alias: [{ find: "@", replacement: "/src" }],
    },
});
