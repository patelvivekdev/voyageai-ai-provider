import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['esm'],
    dts: {
      // tsup injects baseUrl internally; its TS 6 declaration compiler warns
      // about that option even though the project config no longer uses it.
      compilerOptions: { ignoreDeprecations: '6.0' },
    },
    sourcemap: true,
    clean: true,
  },
]);
