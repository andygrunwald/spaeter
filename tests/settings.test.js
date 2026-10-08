import { test } from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULTS, isConfigured, isConnected, loadSettings } from '../extension/lib/settings.js';
import { PRESETS } from '../extension/lib/rules.js';

test('defaults: confirmation popup on, German templates, no list preselected', () => {
  assert.equal(DEFAULTS.confirm, true);
  assert.deepEqual(DEFAULTS.templates, PRESETS.de);
  assert.equal(DEFAULTS.listId, '');
});

test('loadSettings merges stored values over defaults', async () => {
  globalThis.chrome = { storage: { local: { get: async () => ({ confirm: false, listId: '42' }) } } };
  const settings = await loadSettings();
  assert.equal(settings.confirm, false);
  assert.equal(settings.listId, '42');
  assert.deepEqual(settings.templates, PRESETS.de);
  delete globalThis.chrome;
});

test('a list is required before adding', () => {
  const connected = { apiKey: 'k', secret: 's', token: 't', listId: '' };
  assert.equal(isConnected(connected), true);
  assert.equal(isConfigured(connected), false);
  assert.equal(isConfigured({ ...connected, listId: '42' }), true);
});
