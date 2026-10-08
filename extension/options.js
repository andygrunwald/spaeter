import { isValidTemplate } from './lib/classify.js';
import { localize, t } from './lib/i18n.js';
import { authUrl, checkToken, getFrob, getLists, getToken } from './lib/rtm.js';
import { PRESETS, TYPES } from './lib/rules.js';
import { credentials, isConnected, loadSettings, saveSettings } from './lib/settings.js';

const $ = (id) => document.getElementById(id);
let settings;
let frob;

function showStatus(element, message, isError = false) {
  element.textContent = message;
  element.classList.toggle('error', isError);
}

function renderConnection() {
  const connected = isConnected(settings);
  showStatus($('status'), connected ? t('statusConnected', settings.username) : t('statusNotConnected'));
  $('connect').hidden = connected;
  $('disconnect').hidden = !connected;
  $('apiKey').disabled = connected;
  $('secret').disabled = connected;
}

async function renderLists() {
  const select = $('list');
  select.replaceChildren(new Option(t('listPlaceholder'), ''));
  select.disabled = true;
  $('listHint').hidden = isConnected(settings);
  if (!isConnected(settings)) return;
  try {
    for (const list of await getLists(credentials(settings))) {
      select.add(new Option(list.name, list.id));
    }
    select.value = settings.listId;
    select.disabled = false;
  } catch (error) {
    showStatus($('status'), error.message, true);
  }
}

function renderTemplates(templates) {
  for (const type of TYPES) {
    $('templates').elements[`${type}.template`].value = templates[type].template;
    $('templates').elements[`${type}.tag`].value = templates[type].tag;
  }
}

async function update(patch) {
  await saveSettings(patch);
  Object.assign(settings, patch);
}

$('connect').addEventListener('click', async () => {
  const apiKey = $('apiKey').value.trim();
  const secret = $('secret').value.trim();
  if (!apiKey || !secret) return showStatus($('status'), t('errorCredentialsMissing'), true);
  try {
    await update({ apiKey, secret });
    frob = await getFrob(credentials(settings));
    chrome.tabs.create({ url: authUrl(frob, settings) });
    $('authStep').hidden = false;
  } catch (error) {
    showStatus($('status'), error.message, true);
  }
});

$('authorized').addEventListener('click', async () => {
  try {
    const auth = await getToken(frob, credentials(settings));
    await update({ token: auth.token, username: auth.user.username });
    $('authStep').hidden = true;
    renderConnection();
    await renderLists();
  } catch (error) {
    showStatus($('status'), error.message, true);
  }
});

$('disconnect').addEventListener('click', async () => {
  await update({ token: '', username: '' });
  renderConnection();
  await renderLists();
});

$('list').addEventListener('change', (event) => update({ listId: event.target.value }));

$('confirm').addEventListener('change', (event) => update({ confirm: event.target.checked }));

$('preset').addEventListener('change', (event) => {
  if (event.target.value) renderTemplates(PRESETS[event.target.value]);
  event.target.value = '';
});

$('templates').addEventListener('submit', async (event) => {
  event.preventDefault();
  const fields = event.target.elements;
  const templates = Object.fromEntries(
    TYPES.map((type) => [
      type,
      { template: fields[`${type}.template`].value.trim(), tag: fields[`${type}.tag`].value.trim() },
    ]),
  );
  if (!TYPES.every((type) => isValidTemplate(templates[type].template))) {
    return showStatus($('templatesStatus'), t('templateInvalid'), true);
  }
  await update({ templates });
  showStatus($('templatesStatus'), t('saved'));
});

localize();
settings = await loadSettings();
$('apiKey').value = settings.apiKey;
$('secret').value = settings.secret;
$('confirm').checked = settings.confirm;
renderTemplates(settings.templates);
renderConnection();
await renderLists();

// Surface revoked or expired tokens right away.
if (isConnected(settings)) {
  checkToken(credentials(settings)).catch((error) => showStatus($('status'), error.message, true));
}
