import { addLink, prepareLink } from './lib/addLink.js';
import { formatTitle, isWebUrl } from './lib/classify.js';
import { localize, t } from './lib/i18n.js';
import { isConfigured, loadSettings } from './lib/settings.js';

const $ = (id) => document.getElementById(id);
const form = $('form');

function showMessage(text, withSettingsLink = false) {
  $('messageText').textContent = text;
  $('openSettings').hidden = !withSettingsLink;
  $('message').hidden = false;
}

function showStatus(text, isError = false) {
  $('status').textContent = text;
  $('status').classList.toggle('error', isError);
}

function updatePreview(settings) {
  const { template } = settings.templates[form.elements.type.value];
  $('preview').textContent = formatTitle(template, $('title').value.trim());
}

$('openSettings').addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
  window.close();
});

localize();
const settings = await loadSettings();
const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

if (!isConfigured(settings)) {
  showMessage(t('notConfigured'), true);
} else if (!isWebUrl(tab?.url)) {
  showMessage(t('unsupportedPage'));
} else {
  form.hidden = false;
  $('url').textContent = tab.url;
  $('title').value = t('loading');

  const link = await prepareLink(tab);
  form.elements.type.value = link.type;
  $('title').value = link.title;
  $('title').disabled = false;
  $('add').disabled = false;
  $('title').focus();
  updatePreview(settings);
  form.addEventListener('input', () => updatePreview(settings));

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    $('add').disabled = true;
    showStatus('');
    try {
      await addLink({ url: link.url, type: form.elements.type.value, title: $('title').value.trim() }, settings);
      showStatus(t('added'));
      setTimeout(() => window.close(), 1000);
    } catch (error) {
      showStatus(error.message, true);
      $('add').disabled = false;
    }
  });
}
