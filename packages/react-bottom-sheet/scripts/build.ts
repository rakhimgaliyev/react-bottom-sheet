export {};

await Bun.build({
  entrypoints: ["./src/index.tsx"],
  outdir: "./dist",
  target: "browser",
  format: "esm",
  sourcemap: "external",
  minify: false,
  external: ["react", "react-dom"],
});

await Bun.build({
  entrypoints: ["./src/index.tsx"],
  outdir: "./dist",
  naming: "[name].cjs",
  target: "browser",
  format: "cjs",
  sourcemap: "external",
  minify: false,
  external: ["react", "react-dom"],
});
