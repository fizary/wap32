import { resolve } from "path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
    plugins: [dts({ rollupTypes: true })],
    build: {
        lib: {
            entry: {
                rez: resolve(import.meta.dirname, "src/formats/rez/index.ts"),
                pid: resolve(import.meta.dirname, "src/formats/pid/index.ts"),
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
