# AGENTS.md

## Secrets (MUST)

- **Never commit Remember The Milk API keys, shared secrets, auth tokens or frobs.** This
  covers code, tests, fixtures, docs, screenshots, `.shortcut` files, commit messages and
  PR descriptions.
- These values live only in `chrome.storage.local` (entered by the user on the
  extension's settings page) and in the iPhone Shortcut's import questions.
- Tests and docs use only RTM's documented example secret `BANANAS`, values such as
  `abc123`, or obvious placeholders such as `YOUR_API_KEY`, `YOUR_SHARED_SECRET`,
  `YOUR_AUTH_TOKEN` and `YOUR_LIST_ID`. Never hardcode a real key "just for testing".
- Never export or commit a `.shortcut` file whose Text actions contain real values.
  `.shortcut` files are ignored by git on purpose.
- If a secret gets committed anyway: stop, tell the user, and tell them to revoke the
  token in Remember The Milk (Settings → Apps) and request a new API key. Do not rewrite
  git history on your own.

## Before you finish

Run `make check`. See [DEVELOPMENT.md](DEVELOPMENT.md) for all targets.

## Conventions

- Plain ES modules, no bundler: the `extension` folder is loaded as is.
- Every UI string goes into both `extension/_locales/en` and `extension/_locales/de`.
- Domain or preset changes go into `extension/lib/rules.js` **and** `ios/SHORTCUT.md`
  together; `tests/ios-guide.test.js` enforces this.
- Do not use RTM Smart Add (`parse=1`); titles must stay literal.
- Follow RTM's [branding guidelines](https://www.rememberthemilk.com/services/api/branding.rtm):
  no "Remember The Milk" or "RTM" in the product name, no RTM cow logo, keep the
  attribution notice.
- Documentation is English only.
