// The iPhone Shortcut can't run in CI, so this test keeps ios/SHORTCUT.md in sync
// with the code the Chrome extension runs: type regexes, presets, signature strings
// and the worked example.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { addTask, sign } from '../extension/lib/rtm.js';
import { DOMAINS, PRESETS } from '../extension/lib/rules.js';

const guide = await readFile(new URL('../ios/SHORTCUT.md', import.meta.url), 'utf8');

// Cells of the Markdown table row that starts with `first` and has `count` cells.
// Escaped pipes ("\|") are unescaped and surrounding backticks removed.
function row(first, count) {
  const rows = guide
    .split('\n')
    .filter((line) => line.startsWith('|'))
    .map((line) =>
      line
        .split(/(?<!\\)\|/)
        .slice(1, -1)
        .map((cell) => cell.trim().replaceAll('\\|', '|').replace(/^`(.*)`$/, '$1')),
    );
  const match = rows.find((cells) => cells[0] === first && cells.length === count);
  assert.ok(match, `table row "${first}" with ${count} cells missing in ios/SHORTCUT.md`);
  return match;
}

const hostRegex = (domains) => `(?i)(^|\\.)(${domains.map((d) => d.replaceAll('.', '\\.')).join('|')})$`;

test('type regexes match rules.js', () => {
  for (const [type, domains] of Object.entries(DOMAINS)) {
    assert.equal(row(type, 2)[1], hostRegex(domains), `regex for ${type}`);
  }
});

test('templates and tags match the presets in rules.js', () => {
  for (const type of Object.keys(PRESETS.de)) {
    const [, deTemplate, deTag, enTemplate, enTag] = row(type, 5);
    assert.deepEqual({ template: deTemplate, tag: deTag }, PRESETS.de[type], `Deutsch preset for ${type}`);
    assert.deepEqual({ template: enTemplate, tag: enTag }, PRESETS.en[type], `English preset for ${type}`);
  }
});

test('signature strings match what rtm.js signs', async () => {
  // Run addTask with placeholder values; the signature string of each request
  // built from those placeholders is exactly the template the guide must show.
  const requests = [];
  const responses = [
    { stat: 'ok', timeline: '{timeline}' },
    { stat: 'ok', list: { id: '{listId}', taskseries: { id: '{seriesId}', task: { id: '{taskId}' } } } },
    { stat: 'ok' },
    { stat: 'ok' },
  ];
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (url, { body }) => {
    requests.push(Object.fromEntries(body));
    return { ok: true, json: async () => ({ rsp: responses.shift() }) };
  };
  try {
    await addTask(
      { listId: '{listId}', name: '{name}', url: '{url}', tag: '{tag}' },
      { apiKey: '{apiKey}', secret: '{secret}', token: '{token}' },
    );
  } finally {
    globalThis.fetch = realFetch;
  }

  for (const { api_sig: _sig, ...params } of requests) { // eslint-disable-line no-unused-vars
    const expected = `{secret}${Object.keys(params).sort().map((key) => key + params[key]).join('')}`;
    assert.equal(row(params.method, 2)[1], expected, `signature string for ${params.method}`);
  }
});

test('worked example matches sign()', () => {
  const secret = 'BANANAS';
  const params = Object.fromEntries(
    ['api_key', 'auth_token', 'format', 'method'].map((key) => [key, row(key, 2)[1]]),
  );
  const string = guide.match(/^Signature string: `([^`]+)`$/m)?.[1];
  const hash = guide.match(/^MD5 \(`api_sig`\): `([0-9a-f]{32})`$/m)?.[1];
  assert.equal(string, secret + Object.keys(params).sort().map((key) => key + params[key]).join(''));
  assert.equal(hash, sign(params, secret));
});
