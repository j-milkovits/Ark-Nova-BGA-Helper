import * as esbuild from 'esbuild';

async function buildOnce(entry, output) {
  try {
    await esbuild.build({
      entryPoints: [entry],
      bundle: true,
      outfile: output,
      platform: 'browser',
      format: 'iife',
      target: ['es2020'],
      minify: true,
      sourcemap: true,
    });
    console.log(`Built → ${output}`);
  } catch (err) {
    console.error(`Build failed for ${entry}:`, err);
    process.exit(1);
  }
}

await buildOnce('./scripts/content.js', './dist/bundledContent.js');
