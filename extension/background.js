import { addLink, prepareLink } from './lib/addLink.js';
import { isWebUrl } from './lib/classify.js';
import { t } from './lib/i18n.js';
import { isConfigured, loadSettings } from './lib/settings.js';

// With the confirmation popup turned off, the action has no popup and
// action.onClicked fires instead, which adds the task right away.
async function syncPopup() {
  const { confirm } = await loadSettings();
  await chrome.action.setPopup({ popup: confirm ? 'popup.html' : '' });
}

function feedback(tabId, ok, title, message) {
  chrome.action.setBadgeBackgroundColor({ tabId, color: ok ? '#2e7d32' : '#c62828' });
  chrome.action.setBadgeText({ tabId, text: ok ? '✓' : '✗' });
  setTimeout(() => chrome.action.setBadgeText({ tabId, text: '' }), 3000);
  chrome.notifications.create({ type: 'basic', iconUrl: 'icons/icon-128.png', title, message });
}

chrome.runtime.onInstalled.addListener(({ reason }) => {
  syncPopup();
  if (reason === 'install') chrome.runtime.openOptionsPage();
});
chrome.runtime.onStartup.addListener(syncPopup);
chrome.storage.onChanged.addListener((changes) => {
  if ('confirm' in changes) syncPopup();
});

chrome.action.onClicked.addListener(async (tab) => {
  const settings = await loadSettings();
  if (!isConfigured(settings)) return chrome.runtime.openOptionsPage();
  if (!isWebUrl(tab.url)) return feedback(tab.id, false, t('notifyFailed'), t('unsupportedPage'));
  try {
    const name = await addLink(await prepareLink(tab), settings);
    feedback(tab.id, true, t('notifyAdded'), name);
  } catch (error) {
    feedback(tab.id, false, t('notifyFailed'), error.message);
  }
});
