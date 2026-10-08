# AGENTS.md

## Secrets (MUST)

- **Never commit Remember The Milk API keys, shared secrets, auth tokens or frobs.** This
  covers code, tests, fixtures, docs, screenshots, `.shortcut` files, commit messages and
  PR descriptions.
- These values live only in `chrome.storage.local` (entered by the user on the
  extension's settings page) and in `spaeter.json` in the user's iCloud Drive (written by
  the setup of the *Später* Shortcut). Never commit or attach a `spaeter.json`.
- Tests and docs use only RTM's documented example secret `BANANAS`, values such as
  `abc123`, or obvious placeholders such as `YOUR_API_KEY` or `{apiKey}`. Never hardcode a
  real key "just for testing".
- The Shortcut sources (`ios/*.cherri`) must never contain secrets: the setup asks for
  them at run time. `spaeter.json` is ignored by git on purpose.
- If a secret gets committed anyway: stop, tell the user, and tell them to revoke the
  token in Remember The Milk (Settings → Apps) and request a new API key. Do not rewrite
  git history on your own.

## Before you finish

Run `make check`. See [DEVELOPMENT.md](DEVELOPMENT.md) for all targets.

## Conventions

- Plain ES modules, no bundler: the `extension` folder is loaded as is.
- Every UI string goes into both `extension/_locales/en` and `extension/_locales/de`.
- `ios/Später.shortcut` is generated: never edit it by hand. After changing `ios/*.cherri`
  or `extension/lib/rules.js`, run `make shortcuts` (macOS only) and commit the result;
  `tests/shortcuts.test.js` fails otherwise. If you're not on a Mac, tell the user.
- Do not use RTM Smart Add (`parse=1`); titles must stay literal.
- Follow RTM's [branding guidelines](https://www.rememberthemilk.com/services/api/branding.rtm):
  no "Remember The Milk" or "RTM" in the product name, no RTM cow logo, keep the
  attribution notice.
- Documentation is English only.
- When you add or remove a file in `docs/`, update the table of contents in
  `docs/README.md` and the "Documentation" section in `README.md`.
