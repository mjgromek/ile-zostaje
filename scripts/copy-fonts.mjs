// Self-host the three faces from npm into public/f/.
//
// A Google Fonts CDN is an outbound request and fails acceptance criterion 7,
// so the files are copied into the bundle instead. Both the `latin` and the
// `latin-ext` file of every family is copied: `latin-ext` carries ONLY the
// extended range, so shipping one alone renders `Ile zostaje` with a fallback
// face for the ASCII and the real face for the `ł` inside the same word.
import { mkdir, copyFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const out = resolve(root, 'public/f');

const files = [
  [
    '@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-wght-normal.woff2',
    'bricolage-latin.woff2',
  ],
  [
    '@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-ext-wght-normal.woff2',
    'bricolage-latin-ext.woff2',
  ],
  [
    '@fontsource-variable/familjen-grotesk/files/familjen-grotesk-latin-wght-normal.woff2',
    'familjen-latin.woff2',
  ],
  [
    '@fontsource-variable/familjen-grotesk/files/familjen-grotesk-latin-ext-wght-normal.woff2',
    'familjen-latin-ext.woff2',
  ],
  [
    '@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-500-normal.woff2',
    'plex-mono-latin.woff2',
  ],
  [
    '@fontsource/ibm-plex-mono/files/ibm-plex-mono-latin-ext-500-normal.woff2',
    'plex-mono-latin-ext.woff2',
  ],
];

await mkdir(out, { recursive: true });
for (const [from, to] of files) {
  await copyFile(resolve(root, 'node_modules', from), resolve(out, to));
}
console.log(`fonts: copied ${files.length} files into public/f`);
