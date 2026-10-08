// Hash over everything the iPhone Shortcut is built from. `make shortcuts` writes it to
// ios/shortcuts.lock. tests/shortcuts.test.js fails when it no longer matches, which means
// the signed ios/Später.shortcut was not rebuilt after a change.
import { createHash } from 'node:crypto';
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

export const LOCK_FILE = 'ios/shortcuts.lock';

export async function shortcutInputs() {
  const sources = (await readdir('ios')).filter((file) => file.endsWith('.cherri')).map((file) => `ios/${file}`);
  return [...sources, 'scripts/build-shortcut-rules.mjs', 'extension/lib/rules.js', 'Makefile'].sort();
}

export async function inputsHash() {
  const hash = createHash('sha256');
  for (const file of await shortcutInputs()) {
    let content = await readFile(file, 'utf8');
    // Of the Makefile, only the Cherri version affects the Shortcut.
    if (file === 'Makefile') content = content.match(/^CHERRI_VERSION := .+$/m)[0];
    hash.update(`${file}\n${content}\n`);
  }
  return hash.digest('hex');
}

if (process.argv[1] === fileURLToPath(import.meta.url) && process.argv.includes('--write')) {
  await writeFile(LOCK_FILE, `${await inputsHash()}\n`);
  console.log(`Wrote ${LOCK_FILE}`);
}
