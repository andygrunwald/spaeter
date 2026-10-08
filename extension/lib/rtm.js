// Minimal Remember The Milk API client.
// Docs: https://www.rememberthemilk.com/services/api/
import md5 from '../vendor/md5.js';

const REST_URL = 'https://api.rememberthemilk.com/services/rest/';
const AUTH_URL = 'https://www.rememberthemilk.com/services/auth/';

// api_sig = md5(secret + key1 + value1 + key2 + value2 ...), keys sorted by name.
export function sign(params, secret) {
  const pairs = Object.keys(params).sort().map((key) => key + params[key]);
  return md5(secret + pairs.join(''));
}

export function signedParams(method, params, { apiKey, secret, token }) {
  const all = { ...params, method, api_key: apiKey, format: 'json' };
  if (token) all.auth_token = token;
  return { ...all, api_sig: sign(all, secret) };
}

export async function call(method, params, creds) {
  const response = await fetch(REST_URL, {
    method: 'POST',
    body: new URLSearchParams(signedParams(method, params, creds)),
  });
  if (!response.ok) throw new Error(`RTM HTTP ${response.status}`);
  const { rsp } = await response.json();
  if (rsp.stat !== 'ok') throw new Error(`${rsp.err.msg} (RTM error ${rsp.err.code})`);
  return rsp;
}

// Desktop authentication flow: getFrob → user approves authUrl → getToken.
export async function getFrob(creds) {
  return (await call('rtm.auth.getFrob', {}, { ...creds, token: '' })).frob;
}

export function authUrl(frob, { apiKey, secret }) {
  const params = { api_key: apiKey, perms: 'write', frob };
  return `${AUTH_URL}?${new URLSearchParams({ ...params, api_sig: sign(params, secret) })}`;
}

// Returns { token, perms, user: { id, username, fullname } }.
export async function getToken(frob, creds) {
  return (await call('rtm.auth.getToken', { frob }, { ...creds, token: '' })).auth;
}

export async function checkToken(creds) {
  return (await call('rtm.auth.checkToken', {}, creds)).auth;
}

// Lists that can hold new tasks (no smart, archived or deleted lists).
export async function getLists(creds) {
  const { lists } = await call('rtm.lists.getList', {}, creds);
  return [lists.list]
    .flat()
    .filter((list) => list.smart !== '1' && list.archived !== '1' && list.deleted !== '1');
}

// Smart Add (parse=1) is deliberately not used: it has no escaping, so titles
// containing "#", "!1", "^", "//", "*" or "@" would be turned into task properties.
export async function addTask({ listId, name, url, tag }, creds) {
  const { timeline } = await call('rtm.timelines.create', {}, creds);
  const { list } = await call('rtm.tasks.add', { timeline, list_id: listId, name }, creds);
  const series = [list.taskseries].flat()[0];
  const ids = {
    timeline,
    list_id: list.id,
    taskseries_id: series.id,
    task_id: [series.task].flat()[0].id,
  };
  await call('rtm.tasks.setURL', { ...ids, url }, creds);
  await call('rtm.tasks.addTags', { ...ids, tags: tag }, creds);
}
