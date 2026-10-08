// chrome.i18n only localizes the manifest and CSS, so HTML pages mark
// translatable elements with data-i18n="messageKey".
export const t = (key, substitutions) => chrome.i18n.getMessage(key, substitutions);

export function localize(root = document) {
  document.documentElement.lang = chrome.i18n.getUILanguage();
  for (const element of root.querySelectorAll('[data-i18n]')) {
    element.textContent = t(element.dataset.i18n);
  }
}
