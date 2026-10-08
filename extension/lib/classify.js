import { DOMAINS } from './rules.js';

export function isWebUrl(url) {
  try {
    return ['http:', 'https:'].includes(new URL(url).protocol);
  } catch {
    return false;
  }
}

export function hostMatches(url, domains) {
  const host = new URL(url).hostname.toLowerCase();
  return domains.some((domain) => host === domain || host.endsWith(`.${domain}`));
}

export function classify(url) {
  for (const [type, domains] of Object.entries(DOMAINS)) {
    if (hostMatches(url, domains)) return type;
  }
  return 'read';
}

export function isValidTemplate(template) {
  return template.split('%s').length === 2;
}

// A replacer function keeps "$&" and friends in titles literal.
export function formatTitle(template, title) {
  return template.replace('%s', () => title);
}
