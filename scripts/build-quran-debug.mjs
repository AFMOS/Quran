import * as esbuild from 'esbuild';
import { fileURLToPath } from 'url';
import path from 'path';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

await esbuild.build({
  entryPoints: [path.join(root, 'src/quran-debug-public-entry.js')],
  bundle: true,
  format: 'iife',
  platform: 'browser',
  outfile: path.join(root, 'public/quran_chapters/quran-debug.js'),
});
