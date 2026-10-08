# iPhone Shortcut

This guide builds the Apple Shortcut **"Später"**. It appears in the Share Sheet of
Safari, YouTube, Spotify, WhatsApp, Signal, Discord and every other app that shares
links. It classifies the link, looks up its title, and adds the task to Remember The
Milk without asking, then shows a short notification.

The Shortcut talks to the RTM API directly, exactly like the Chrome extension. It
reuses the API key, shared secret, auth token and list ID from the extension's
settings page (section "Values for the iPhone Shortcut"), so there is no separate
login on the iPhone.

> [!IMPORTANT]
> The values in this guide (`BANANAS`, `abc123`, `YOUR_API_KEY`, …) are placeholders.
> Never put your real key, secret or token into a file, a screenshot, an issue or a
> shared `.shortcut` file.

## Before you start

- The Chrome extension is connected and a list is chosen (see the [README](../README.md)).
- Build the Shortcut in the **Shortcuts app on your Mac**. Typing regular expressions and
  signature strings is much easier there, and iCloud syncs the Shortcut to your iPhone.

## Reference values

The Chrome extension uses the same values, defined in
[`extension/lib/rules.js`](../extension/lib/rules.js). CI checks that this guide matches
them, so copy them exactly.

### Type detection (host regular expressions)

Everything that matches neither regex is `read`.

| Type   | Regex for the host of the link |
|--------|--------------------------------|
| watch  | `(?i)(^\|\.)(youtube\.com\|youtu\.be\|vimeo\.com\|twitch\.tv\|ardmediathek\.de)$` |
| listen | `(?i)(^\|\.)(spotify\.com\|spotify\.link\|podcasts\.apple\.com\|overcast\.fm\|pocketcasts\.com\|pca\.st)$` |

Spotify is always `listen`, even for video podcasts.

### Task name templates and tags

`%s` is replaced by the title. Pick one preset or write your own.

| Type   | Deutsch template | Deutsch tag | English template | English tag |
|--------|------------------|-------------|------------------|-------------|
| read   | `"%s" lesen`     | `lesen`     | `Read "%s"`      | `read`      |
| watch  | `"%s" ansehen`   | `ansehen`   | `Watch "%s"`     | `watch`     |
| listen | `"%s" anhören`   | `anhören`   | `Listen to "%s"` | `listen`    |

### Title lookup (oEmbed)

| Host regex | oEmbed URL prefix (append the URL-encoded link) |
|------------|-------------------------------------------------|
| `(?i)(^\|\.)(youtube\.com\|youtu\.be)$` | `https://www.youtube.com/oembed?format=json&url=` |
| `(?i)(^\|\.)vimeo\.com$` | `https://vimeo.com/api/oembed.json?url=` |
| `(?i)(^\|\.)spotify\.com$` | `https://open.spotify.com/oembed?url=` |

All other links are fetched as HTML and the title is taken from `og:title`, then from
`<title>`.

### RTM calls and signature strings

Every RTM request is signed: `api_sig` is the MD5 hash of the shared secret followed by
all parameters as `keyvalue`, **sorted alphabetically by key**, with no separators. In the
table, `{name}` stands for a Shortcuts variable; everything else is literal text.

| Call | Signature string |
|------|------------------|
| `rtm.timelines.create` | `{secret}api_key{apiKey}auth_token{token}formatjsonmethodrtm.timelines.create` |
| `rtm.tasks.add` | `{secret}api_key{apiKey}auth_token{token}formatjsonlist_id{listId}methodrtm.tasks.addname{name}timeline{timeline}` |
| `rtm.tasks.setURL` | `{secret}api_key{apiKey}auth_token{token}formatjsonlist_id{listId}methodrtm.tasks.setURLtask_id{taskId}taskseries_id{seriesId}timeline{timeline}url{url}` |
| `rtm.tasks.addTags` | `{secret}api_key{apiKey}auth_token{token}formatjsonlist_id{listId}methodrtm.tasks.addTagstags{tag}task_id{taskId}taskseries_id{seriesId}timeline{timeline}` |

The request itself sends the same parameters (without the secret) plus `api_sig` as a
form body. Smart Add is deliberately not used: it would turn `#`, `!1`, `^` or `//` in
titles into lists, tags, priorities or notes.

### Worked example

Use this to test the signing step on its own. With the secret `BANANAS` and these
parameters:

| Parameter    | Value                  |
|--------------|------------------------|
| `api_key`    | `abc123`               |
| `auth_token` | `def456`               |
| `format`     | `json`                 |
| `method`     | `rtm.timelines.create` |

Signature string: `BANANASapi_keyabc123auth_tokendef456formatjsonmethodrtm.timelines.create`

MD5 (`api_sig`): `159cc875b849b791d38d51f4cee95218`

Put the signature string into a **Text** action, add **Generate Hash** (MD5) and **Quick
Look**. If the result differs, check for spaces or line breaks in the Text action.

## Build the Shortcut

Create a new Shortcut named **Später** and add these actions in order. Action names are
from the English Shortcuts app; "→ variable `x`" means a **Set Variable** action named `x`
right after it.

### 1. Input and configuration

1. **Receive** `URLs`, `Safari web pages` and `Text` input from **Share Sheet**.
   If there's no input: **Get Clipboard**.
2. **Text** `YOUR_API_KEY` → variable `apiKey`
3. **Text** `YOUR_SHARED_SECRET` → variable `secret`
4. **Text** `YOUR_AUTH_TOKEN` → variable `token`
5. **Text** `YOUR_LIST_ID` → variable `listId`
6. **Dictionary** with these text items (values from the template table above) →
   variable `config`:
   `read_template`, `read_tag`, `watch_template`, `watch_tag`, `listen_template`, `listen_tag`
7. Open **Shortcut Details** (ⓘ) → **Setup** → add an **Import Question** for each of the
   Text actions 2–5, for example "What is your RTM API key?". Anyone who imports the
   Shortcut then enters their own values.

### 2. Link, type and title

1. **Get URLs from** `Shortcut Input`, then **Get First Item from List** → variable `url`
2. **Get Component of URL**: `Host` of `url` → variable `host`
3. **Text** `read` → variable `type`
4. **Match Text** (watch regex from the table) in `host`.
   **If** `Matches` has any value: **Text** `watch` → variable `type`. **End If**
5. **Match Text** (listen regex) in `host`.
   **If** `Matches` has any value: **Text** `listen` → variable `type`. **End If**
6. For each row of the oEmbed table: **Match Text** (host regex) in `host`.
   **If** `Matches` has any value: **Text** (oEmbed prefix) followed by
   **URL Encode** of `url`, then **Get Contents of URL**, **Get Dictionary Value**
   `title` → variable `title`. **End If**
7. **If** `title` does not have any value:
   1. **Get Contents of URL** `url`, then **Get Text from Input** → variable `html`
   2. **Match Text** `(?is)<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']*)["']`
      in `html`, **Get Group at Index** `1` → variable `title`
   3. **If** `title` does not have any value: **Match Text**
      `(?is)<title[^>]*>([^<]*)</title>` in `html`, **Get Group at Index** `1` →
      variable `title`. **End If**
   4. **Make Rich Text from HTML** of `title`, **Get Text from Input** → variable `title`
      (this decodes entities such as `&amp;`).

   **End If**
8. **Get Dictionary Value** `[type]_template` from `config` (use a **Text** action
   `[type]_template` with the `type` variable as key), then **Replace Text** `%s` with
   `title` (regular expression off) → variable `name`
9. **Get Dictionary Value** `[type]_tag` from `config` → variable `tag`

### 3. RTM calls

Repeat this block for each of the four calls, in the order of the table above.

1. **Text** with the signature string for the call (insert variables where the table
   shows `{…}`; no spaces, no line breaks)
2. **Generate Hash**: `MD5` → variable `sig`
3. **Get Contents of URL** `https://api.rememberthemilk.com/services/rest/`
   - Method: `POST`
   - Request Body: `Form`, with one text field per parameter of the signature string
     (`api_key`, `auth_token`, `format` = `json`, `method`, …) plus `api_sig` = `sig`
4. → variable `response`
5. **Get Dictionary Value** `rsp.stat` from `response`. **If** it is not `ok`:
   **Show Alert** with **Get Dictionary Value** `rsp.err.msg` from `response`, then
   **Stop This Shortcut**. **End If**

After the individual calls, extract what the next calls need:

- After `rtm.timelines.create`: **Get Dictionary Value** `rsp.timeline` → variable `timeline`
- After `rtm.tasks.add`:
  1. **Get Dictionary Value** `rsp.list.taskseries`, **Get First Item from List**
     → variable `series`. RTM returns a single object or a list; "first item" handles both.
  2. **Get Dictionary Value** `id` from `series` → variable `seriesId`
  3. **Get Dictionary Value** `task` from `series`, **Get First Item from List**,
     **Get Dictionary Value** `id` → variable `taskId`

### 4. Feedback

**Show Notification** `name`, with the title `Später ✓`.

### 5. Enable it in the Share Sheet

In **Shortcut Details** (ⓘ), turn on **Show in Share Sheet**. On the iPhone, the
Shortcut is listed at the bottom of every Share Sheet. In apps such as YouTube or
Spotify, tap **Share** → **More** (`…`) to reach it, and add it to your favourites.

## Export and sign a `.shortcut` file

Use this to back up the Shortcut or to share it, for example as `ios/Spaeter.shortcut`
in this repository.

1. **Remove your values.** Set the Text actions 2–5 back to `YOUR_API_KEY`,
   `YOUR_SHARED_SECRET`, `YOUR_AUTH_TOKEN` and `YOUR_LIST_ID`. The Import Questions make
   everyone enter their own values on import.
2. **Export** on the Mac: in the Shortcuts app, right-click the Shortcut →
   **Share** → **Export File**, and save it as `Später.shortcut`. Depending on the macOS
   version, the export dialog already asks who may import it and signs the file.
3. **Sign** the file explicitly (or re-sign it) with the `shortcuts` command line tool. It
   needs a Mac that is signed in to iCloud:

   ```sh
   shortcuts sign --mode anyone --input Später.shortcut --output Spaeter.shortcut
   ```

   `--mode anyone` lets everyone import the file. `--mode people-who-know-me` limits it
   to people in your contacts.
4. **Test the import**: AirDrop `Spaeter.shortcut` to your iPhone or open it there. The
   Import Questions must show up with the placeholder values, not your real ones.
5. **Commit** (optional): `.shortcut` files are in `.gitignore`, so a signed,
   secret-free file has to be added on purpose with `git add -f ios/Spaeter.shortcut`.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `Invalid signature (RTM error 96)` | The signature string is wrong: check the key order, typos and stray spaces, and compare with the worked example. |
| `Login failed / Invalid auth token (RTM error 98)` | The token was revoked. Reconnect in the Chrome extension and update `YOUR_AUTH_TOKEN`. |
| `Invalid API Key (RTM error 100)` | The API key is wrong or not yet approved by RTM. |
| The title is empty or `"" lesen` | The page blocks requests without a browser. Edit the task in RTM, or add an oEmbed rule if the site offers oEmbed. |
| The Shortcut is missing in an app's Share Sheet | Check that **Show in Share Sheet** is on and that `URLs` is selected as input type. |
