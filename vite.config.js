import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),

                genshin: resolve(__dirname, 'genshin/index.html'),
                gfl2: resolve(__dirname, 'GFL2/index.html'),
                hsr: resolve(__dirname, 'HSR/index.html'),
                r1999: resolve(__dirname, 'R1999/index.html'),
                wuwa: resolve(__dirname, 'wuwa/index.html'),
                zenless: resolve(__dirname, 'ZZZ/index.html')
            },
        },
    },
    worker: {
        format: 'es',
    },
    base: '/'
});