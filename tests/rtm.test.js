import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { addTask, authUrl, call, getLists, sign } from '../extension/lib/rtm.js';

const creds = { apiKey: 'YOUR_API_KEY', secret: 'YOUR_SECRET', token: 'YOUR_TOKEN' };
let requests;
let responses;
const realFetch = globalThis.fetch;

beforeEach(() => {
  requests = [];
  responses = [];
  globalThis.fetch = async (url, { body }) => {
    requests.push(Object.fromEntries(body));
    return { ok: true, json: async () => ({ rsp: responses.shift() }) };
  };
});
afterEach(() => {
  globalThis.fetch = realFetch;
});

test('sign matches the example from the RTM authentication docs', () => {
  assert.equal(sign({ yxz: 'foo', feg: 'bar', abc: 'baz' }, 'BANANAS'), '82044aae4dd676094f23f1ec152159ba');
});

test('sign hashes UTF-8', () => {
  // printf %s 'BANANASnameanhören' | md5
  assert.equal(sign({ name: 'anhören' }, 'BANANAS'), '46239438314a7debe12b3aaac1508379');
});

test('call signs requests and throws RTM errors', async () => {
  responses.push({ stat: 'fail', err: { code: '98', msg: 'Login failed / Invalid auth token' } });
  await assert.rejects(call('rtm.auth.checkToken', {}, creds), /Invalid auth token \(RTM error 98\)/);
  const { api_sig: apiSig, ...params } = requests[0];
  assert.deepEqual(params, { method: 'rtm.auth.checkToken', api_key: 'YOUR_API_KEY', format: 'json', auth_token: 'YOUR_TOKEN' });
  assert.equal(apiSig, sign(params, 'YOUR_SECRET'));
});

test('authUrl requests write permission and is signed', () => {
  const url = new URL(authUrl('FROB', creds));
  assert.equal(url.origin + url.pathname, 'https://www.rememberthemilk.com/services/auth/');
  assert.equal(url.searchParams.get('perms'), 'write');
  assert.equal(url.searchParams.get('frob'), 'FROB');
  assert.equal(url.searchParams.get('api_sig'), sign({ api_key: 'YOUR_API_KEY', perms: 'write', frob: 'FROB' }, 'YOUR_SECRET'));
});

test('getLists skips smart, archived and deleted lists', async () => {
  responses.push({
    stat: 'ok',
    lists: {
      list: [
        { id: '1', name: 'Inbox', smart: '0', archived: '0', deleted: '0' },
        { id: '2', name: 'Smart', smart: '1', archived: '0', deleted: '0' },
        { id: '3', name: 'Old', smart: '0', archived: '1', deleted: '0' },
        { id: '4', name: 'Read/Watch/Listen', smart: '0', archived: '0', deleted: '0' },
      ],
    },
  });
  assert.deepEqual((await getLists(creds)).map((l) => l.id), ['1', '4']);
});

test('addTask runs timeline → add → setURL → addTags without Smart Add', async () => {
  responses.push(
    { stat: 'ok', timeline: 'T1' },
    { stat: 'ok', list: { id: 'L1', taskseries: { id: 'S1', task: { id: 'K1' } } } },
    { stat: 'ok' },
    { stat: 'ok' },
  );
  await addTask({ listId: 'L1', name: '"Title" lesen', url: 'https://example.com', tag: 'lesen' }, creds);

  const strip = ({ api_key, auth_token, format, api_sig, ...rest }) => rest;
  assert.deepEqual(requests.map(strip), [
    { method: 'rtm.timelines.create' },
    { method: 'rtm.tasks.add', timeline: 'T1', list_id: 'L1', name: '"Title" lesen' },
    { method: 'rtm.tasks.setURL', timeline: 'T1', list_id: 'L1', taskseries_id: 'S1', task_id: 'K1', url: 'https://example.com' },
    { method: 'rtm.tasks.addTags', timeline: 'T1', list_id: 'L1', taskseries_id: 'S1', task_id: 'K1', tags: 'lesen' },
  ]);
  assert.ok(requests.every((r) => !('parse' in r)));
});

test('addTask accepts array-shaped task series', async () => {
  responses.push(
    { stat: 'ok', timeline: 'T1' },
    { stat: 'ok', list: { id: 'L1', taskseries: [{ id: 'S1', task: [{ id: 'K1' }] }] } },
    { stat: 'ok' },
    { stat: 'ok' },
  );
  await addTask({ listId: 'L1', name: 'n', url: 'https://example.com', tag: 't' }, creds);
  assert.equal(requests[3].task_id, 'K1');
});
