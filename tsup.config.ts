import { defineConfig } from 'tsup';

export default defineConfig({
    entry: ['src/test.ts'],
    format: ['iife'],
    outDir: 'dist',
    clean: false,
    minify: false,
    sourcemap: false,
    globalName: 'PrismaRestClientTest',
    outExtension() {
        return {
            js: '.min.js'
        }
    }
}); 