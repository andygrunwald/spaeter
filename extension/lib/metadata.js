import { hostMatches } from './classify.js';

// oEmbed returns clean titles (no " - YouTube" suffix, no notification counters).
const OEMBED = [
  { domains: ['youtube.com', 'youtu.be'], endpoint: 'https://www.youtube.com/oembed?format=json&url=' },
  { domains: ['vimeo.com'], endpoint: 'https://vimeo.com/api/oembed.json?url=' },
  { domains: ['spotify.com'], endpoint: 'https://open.spotify.com/oembed?url=' },
];

async function oembedTitle(url) {
  const provider = OEMBED.find(({ domains }) => hostMatches(url, domains));
  if (!provider) return '';
  try {
    const response = await fetch(provider.endpoint + encodeURIComponent(url));
    return response.ok ? (await response.json()).title || '' : '';
  } catch {
    return '';
  }
}

async function pageTitle(tabId) {
  try {
    const [{ result }] = await chrome.scripting.executeScript({
      target: { tabId },
      func: () => document.querySelector('meta[property="og:title"]')?.content || document.title,
    });
    return result || '';
  } catch {
    // Restricted pages (e.g. the Chrome Web Store) cannot be scripted.
    return '';
  }
}

export async function fetchTitle(tab) {
  const title = (await oembedTitle(tab.url)) || (await pageTitle(tab.id)) || tab.title || tab.url;
  return title.trim();
}
