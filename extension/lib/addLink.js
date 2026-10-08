// The "classify → title → format → add" pipeline shared by popup and background.
import { classify, formatTitle } from './classify.js';
import { fetchTitle } from './metadata.js';
import { addTask } from './rtm.js';
import { credentials } from './settings.js';

export async function prepareLink(tab) {
  return { url: tab.url, type: classify(tab.url), title: await fetchTitle(tab) };
}

// Returns the task name that was added.
export async function addLink({ url, type, title }, settings) {
  const { template, tag } = settings.templates[type];
  const name = formatTitle(template, title);
  await addTask({ listId: settings.listId, name, url, tag }, credentials(settings));
  return name;
}
