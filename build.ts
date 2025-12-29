await Bun.build({
  entrypoints: ['./src/main.ts', './src/js/interval.ts'],
  outdir: './public/dist',
  minify: true,
  sourcemap: 'linked',
});
