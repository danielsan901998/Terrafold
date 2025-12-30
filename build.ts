await Bun.build({
  entrypoints: ['./src/main.ts', './src/workers/interval.ts'],
  outdir: './public/dist',
  minify: true,
  sourcemap: 'linked',
});
