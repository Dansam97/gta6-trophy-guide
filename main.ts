// Entry program for the gta6-trophy-guide-01 competition (Node 22, standard library only).
//
// What lives in this repository:
//   app/          the guide itself — plain static files, no build step, no network use.
//                 Open app/index.html through any static server and the tracker works
//                 fully offline; all 55 trophy guides live in app/data/trophies.json.
//   screenshots/  three or four real browser renders of the guide; the first file
//                 alphabetically is the cover image the judge sees large.
//   vendor/       the kit's dossier library, kept byte for byte as handed out.
//
// What this program does when the grader runs it: it copies app/ and screenshots/
// into the output directory (MAKEFUN_OUTPUT_DIR locally, /output in the grader)
// and writes dossier.json there with buildDossier, using exactly the caps the
// sealed scorer enforces, so the dossier on disk is the dossier the gate rebuilds.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const repoDir = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoDir, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
if (existsSync(join(repoDir, 'screenshots'))) {
  cpSync(join(repoDir, 'screenshots'), join(outputDir, 'screenshots'), { recursive: true });
}

const dossierText = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
});
writeFileSync(join(outputDir, 'dossier.json'), dossierText);
console.log(`dossier written to ${join(outputDir, 'dossier.json')} (${dossierText.length} bytes)`);
