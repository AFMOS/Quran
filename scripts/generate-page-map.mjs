/**
 * One-time / CI: fetch Medina page→ayah layout from api.alquran.cloud (quran-uthmani)
 * and write compact public/quran_page_map.json (references only; text stays in reference_quran.json).
 */
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, '..', 'public', 'quran_page_map.json');
const BASE = 'https://api.alquran.cloud/v1/page';

async function fetchPage(n) {
  const r = await fetch(`${BASE}/${n}/quran-uthmani`);
  if (!r.ok) throw new Error(`HTTP ${r.status} page ${n}`);
  const j = await r.json();
  const ayahs = (j.data && j.data.ayahs) || [];
  return ayahs.map((a) => [a.surah.number, a.numberInSurah]);
}

async function main() {
  const pages = [];
  for (let p = 1; p <= 604; p++) {
    const row = await fetchPage(p);
    pages.push(row);
    if (p % 50 === 0) process.stderr.write(`  ${p}/604\n`);
  }
  const payload = { meta: 'Medina mushaf 604 pages; pairs [surah, verse]; matches reference_quran.json', pages };
  mkdirSync(dirname(OUT), { recursive: true });
  writeFileSync(OUT, JSON.stringify(payload));
  const kb = (JSON.stringify(payload).length / 1024).toFixed(1);
  process.stderr.write(`Wrote ${OUT} (${kb} KB)\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
