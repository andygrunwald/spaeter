import { DEFAULT_PRESET, PRESETS } from './rules.js';

export const DEFAULTS = {
  apiKey: '',
  secret: '',
  token: '',
  username: '',
  listId: '',
  confirm: true,
  templates: PRESETS[DEFAULT_PRESET],
};

export async function loadSettings() {
  return { ...DEFAULTS, ...(await chrome.storage.local.get(null)) };
}

export function saveSettings(patch) {
  return chrome.storage.local.set(patch);
}

export function isConnected(settings) {
  return Boolean(settings.apiKey && settings.secret && settings.token);
}

export function isConfigured(settings) {
  return isConnected(settings) && Boolean(settings.listId);
}

export function credentials({ apiKey, secret, token }) {
  return { apiKey, secret, token };
}
