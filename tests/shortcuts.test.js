// The iPhone Shortcut can't run in CI, so these tests keep its Cherri sources (ios/*.cherri)
// in sync with the code the Chrome extension runs, and check that the committed signed
// Shortcut was rebuilt after the last change.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { addTask, authUrl, getFrob, getLists, getToken } from '../extension/lib/rtm.js';
import { DOMAINS, PRESETS, TYPES } from '../extension/lib/rules.js';
import { hostRegex, renderClassify, renderPresets } from '../scripts/build-shortcut-rules.mjs';
import { inputsHash, LOCK_FILE, shortcutInputs } from '../scripts/shortcut-lock.mjs';

const sources = await Promise.all(
  (await shortcutInputs()).filter((file) => file.endsWith('.cherri')).map((file) => readFile(file, 'utf8')),
);
// Cherri writes mutable variables as {@name} and constants as {name}; compare both as {name}.
const shortcutCode = sources.join('\n').replaceAll('{@', '{');

const signatureString = (params) => `{secret}${Object.keys(params).sort().map((key) => key + params[key]).join('')}`;
const creds = { apiKey: '{apiKey}', secret: '{secret}', token: '{token}' };

test('signature strings match what rtm.js signs', async () => {
  // Run the setup calls and addTask with placeholder values; the signature string of
  // each request built from those placeholders is exactly what the Shortcut must hash.
  const requests = [];
  const responses = [
    { stat: 'ok', frob: '{frob}' },
    { stat: 'ok', auth: { token: '{token}' } },
    { stat: 'ok', lists: { list: [] } },
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
    await getFrob(creds);
    await getToken('{frob}', creds);
    await getLists(creds);
    await addTask({ listId: '{listId}', name: '{name}', url: '{url}', tag: '{tag}' }, creds);
  } finally {
    globalThis.fetch = realFetch;
  }

  assert.equal(requests.length, 7);
  for (const { api_sig: _sig, ...params } of requests) {
    const expected = `text("${signatureString(params)}")`;
    assert.ok(shortcutCode.includes(expected), `signature string for ${params.method}: ${expected}`);
  }
});

test('auth URL signature string matches authUrl()', () => {
  const url = new URL(authUrl('{frob}', creds));
  url.searchParams.delete('api_sig');
  const expected = `text("${signatureString(Object.fromEntries(url.searchParams))}")`;
  assert.ok(shortcutCode.includes(expected), expected);
});

test('generated classification uses the domains from rules.js', () => {
  const classify = renderClassify();
  for (const [type, domains] of Object.entries(DOMAINS)) {
    assert.ok(classify.includes(`matchText('${hostRegex(domains)}', host)`), `regex for ${type}`);
    assert.ok(classify.includes(`@type = "${type}"`), `type ${type}`);
  }
});

test('generated presets match rules.js', () => {
  const presets = renderPresets();
  for (const values of Object.values(PRESETS)) {
    for (const type of TYPES) {
      assert.ok(presets.includes(`@${type}Template = '${values[type].template}'`), values[type].template);
      assert.ok(presets.includes(`@${type}Tag = '${values[type].tag}'`), values[type].tag);
    }
  }
});

test('the signed Shortcut was rebuilt after the last change (run `make shortcuts` on a Mac)', async () => {
  assert.equal((await readFile(LOCK_FILE, 'utf8')).trim(), await inputsHash());
});
