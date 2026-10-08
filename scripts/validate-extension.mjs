// Static checks for the unpacked extension that Chrome would only report at load
// time (or not at all): manifest fields, referenced files, and locale messages.
// Run via `make validate`.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = 'extension';
const errors = [];
const read = (file) => readFileSync(path.join(ROOT, file), 'utf8');
const exists = (file) => existsSync(path.join(ROOT, file));

// Manifest
const manifest = JSON.parse(read('manifest.json'));
if (manifest.manifest_version !== 3) errors.push('manifest_version must be 3');
for (const field of ['name', 'version', 'description', 'default_locale', 'icons', 'action', 'background']) {
  if (!manifest[field]) errors.push(`manifest.json: "${field}" is missing`);
}

// Every file referenced by the manifest, the HTML pages and JS imports must exist.
const referenced = new Set([
  ...Object.values(manifest.icons ?? {}),
  ...Object.values(manifest.action?.default_icon ?? {}),
  manifest.action?.default_popup,
  manifest.options_page,
  manifest.background?.service_worker,
].filter(Boolean));

const pending = [...referenced];
while (pending.length) {
  const file = pending.pop();
  if (!exists(file)) {
    errors.push(`missing file: ${file}`);
    continue;
  }
  let refs = [];
  if (file.endsWith('.html')) {
    refs = [...read(file).matchAll(/(?:src|href)="([^"]+)"/g)].map((m) => m[1]);
  } else if (file.endsWith('.js')) {
    refs = [...read(file).matchAll(/(?:from|import)\s*\(?\s*'(\.[^']+)'/g)].map((m) => m[1]);
  }
  for (const ref of refs.filter((r) => !/^[a-z]+:/.test(r))) {
    const resolved = path.normalize(path.join(path.dirname(file), ref));
    if (!referenced.has(resolved)) {
      referenced.add(resolved);
      pending.push(resolved);
    }
  }
}

// Locales: identical keys and placeholders in every language.
const locales = readdirSync(path.join(ROOT, '_locales'));
const messages = Object.fromEntries(
  locales.map((locale) => [locale, JSON.parse(read(`_locales/${locale}/messages.json`))]),
);
const defaultMessages = messages[manifest.default_locale];
if (!defaultMessages) errors.push(`default_locale "${manifest.default_locale}" has no messages.json`);
const defaultKeys = Object.keys(defaultMessages ?? {}).sort();
for (const [locale, localeMessages] of Object.entries(messages)) {
  const keys = Object.keys(localeMessages).sort();
  for (const key of defaultKeys.filter((k) => !keys.includes(k))) errors.push(`_locales/${locale}: "${key}" is missing`);
  for (const key of keys.filter((k) => !defaultKeys.includes(k))) errors.push(`_locales/${locale}: "${key}" is unknown`);
  for (const key of keys.filter((k) => defaultKeys.includes(k))) {
    const expected = Object.keys(defaultMessages[key].placeholders ?? {}).sort().join();
    const actual = Object.keys(localeMessages[key].placeholders ?? {}).sort().join();
    if (expected !== actual) errors.push(`_locales/${locale}: placeholders of "${key}" differ`);
  }
}

// Message keys used in the manifest, HTML (data-i18n) and JS (t / getMessage).
const used = new Set();
const sources = [...referenced].filter((file) => /\.(html|js|css)$/.test(file) && exists(file));
for (const text of [read('manifest.json'), ...sources.map(read)]) {
  for (const match of text.matchAll(/__MSG_(\w+)__|data-i18n="(\w+)"|\b(?:t|getMessage)\('(\w+)'/g)) {
    used.add(match.slice(1).find(Boolean));
  }
}
for (const key of used) {
  if (!defaultKeys.includes(key)) errors.push(`message "${key}" is used but not defined`);
}
for (const key of defaultKeys.filter((k) => !used.has(k))) errors.push(`message "${key}" is defined but never used`);

if (errors.length) {
  console.error(errors.map((error) => `✘ ${error}`).join('\n'));
  process.exit(1);
}
console.log(`✔ extension valid: ${referenced.size} files, ${defaultKeys.length} messages in ${locales.length} locales`);
