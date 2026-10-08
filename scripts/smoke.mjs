// Loads the unpacked extension in Chrome for Testing and checks that the
// options page and the popup render localized without errors, per UI language.
// Run via `make smoke`. Set SCREENSHOTS=dir to save screenshots.
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import puppeteer from 'puppeteer';

const EXTENSION = path.resolve('extension');
const LANGUAGES = ['en', 'de'];
const screenshots = process.env.SCREENSHOTS;
let failures = 0;

function check(condition, message) {
  console.log(`${condition ? '✔' : '✘'} ${message}`);
  if (!condition) failures++;
}

async function openPage(browser, url, errors) {
  const page = await browser.newPage();
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => message.type() === 'error' && errors.push(message.text()));
  await page.goto(url, { waitUntil: 'networkidle0' });
  return page;
}

for (const lang of LANGUAGES) {
  const messages = JSON.parse(await readFile(`extension/_locales/${lang}/messages.json`, 'utf8'));
  // --lang sets the UI language on Linux/Windows; macOS reads AppleLanguages instead.
  const browser = await puppeteer.launch({
    pipe: true,
    enableExtensions: [EXTENSION],
    args: [`--lang=${lang}`, '-AppleLanguages', `(${lang})`],
    env: { ...process.env, LANGUAGE: lang },
  });
  try {
    const worker = await browser.waitForTarget((target) => target.type() === 'service_worker' && target.url().endsWith('/background.js'));
    const base = `chrome-extension://${new URL(worker.url()).host}`;
    check(true, `[${lang}] service worker started`);

    const errors = [];
    const options = await openPage(browser, `${base}/options.html`, errors);
    const heading = await options.$eval('h1', (element) => element.textContent.trim());
    check(heading === messages.optionsTitle.message, `[${lang}] options page heading is "${heading}"`);
    const footer = await options.$eval('footer', (element) => element.textContent);
    check(footer === messages.attribution.message, `[${lang}] options page shows the RTM attribution`);
    const template = await options.$eval('input[name="read.template"]', (element) => element.value);
    check(template === '"%s" lesen', `[${lang}] default read template is "${template}"`);
    const preset = await options.$eval('#preset', (element) => element.value);
    check(preset === 'de', `[${lang}] preset dropdown shows the saved preset "de"`);
    await options.select('#preset', 'en');
    const selected = await options.$eval('#preset', (element) => element.value);
    const filled = await options.$eval('input[name="read.template"]', (element) => element.value);
    check(selected === 'en' && filled === 'Read "%s"', `[${lang}] choosing a preset fills the fields and stays selected`);
    await options.type('input[name="read.tag"]', 'x');
    const afterEdit = await options.$eval('#preset', (element) => element.value);
    check(afterEdit === '', `[${lang}] editing a field resets the preset dropdown`);
    if (screenshots) await options.screenshot({ path: `${screenshots}/options-${lang}.png`, fullPage: true });

    // Not connected yet, so the popup has to point to the settings.
    const popup = await openPage(browser, `${base}/popup.html`, errors);
    const message = await popup.$eval('#messageText', (element) => element.textContent);
    check(message === messages.notConfigured.message, `[${lang}] popup asks to configure first`);
    if (screenshots) await popup.screenshot({ path: `${screenshots}/popup-${lang}.png` });

    check(errors.length === 0, `[${lang}] no console errors${errors.length ? `: ${errors.join(' | ')}` : ''}`);
  } finally {
    await browser.close();
  }
}

if (failures) {
  console.error(`${failures} smoke check(s) failed`);
  process.exit(1);
}
