# iPhone Shortcuts

*Später* on the iPhone consists of two Apple Shortcuts:

- **Später Setup** runs once from the Shortcuts app. It connects to Remember The Milk,
  lets you choose the list and the language of the task names, and saves everything to
  `iCloud Drive/Shortcuts/spaeter.json`.
- **Später** appears in the Share Sheet of Safari, YouTube, Spotify, WhatsApp, Signal,
  Discord and every other app that shares links. It classifies the link, looks up its
  title, adds the task to Remember The Milk without asking, and shows a short
  notification.

Both talk to the RTM API directly; there is no server in between. The iPhone setup is
independent of the Chrome extension.

> [!IMPORTANT]
> Your API key, shared secret and auth token are only typed in at run time and stored in
> `spaeter.json` in your iCloud Drive, never inside the Shortcuts. Never share or commit
> `spaeter.json`. The values in this guide (`BANANAS`, `abc123`, `{apiKey}`, …) are
> placeholders.

## Before you start

- You have your own RTM API key and shared secret (see
  [Setup Prerequisite: Getting an RTM API key](../README.md#setup-prerequisite-getting-an-rtm-api-key)).
- Build the Shortcuts in the **Shortcuts app on your Mac**. Typing regular expressions and
  signature strings is much easier there, and iCloud syncs the Shortcuts to your iPhone.

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

Calls of **Später Setup**:

| Call | Signature string |
|------|------------------|
| `rtm.auth.getFrob` | `{secret}api_key{apiKey}formatjsonmethodrtm.auth.getFrob` |
| auth URL | `{secret}api_key{apiKey}frob{frob}permswrite` |
| `rtm.auth.getToken` | `{secret}api_key{apiKey}formatjsonfrob{frob}methodrtm.auth.getToken` |
| `rtm.lists.getList` | `{secret}api_key{apiKey}auth_token{token}formatjsonmethodrtm.lists.getList` |

The auth URL is not an API call: it is the page where you allow access, and its signature
covers only `api_key`, `frob` and `perms`.

Calls of **Später**:

| Call | Signature string |
|------|------------------|
| `rtm.timelines.create` | `{secret}api_key{apiKey}auth_token{token}formatjsonmethodrtm.timelines.create` |
| `rtm.tasks.add` | `{secret}api_key{apiKey}auth_token{token}formatjsonlist_id{listId}methodrtm.tasks.addname{name}timeline{timeline}` |
| `rtm.tasks.setURL` | `{secret}api_key{apiKey}auth_token{token}formatjsonlist_id{listId}methodrtm.tasks.setURLtask_id{taskId}taskseries_id{seriesId}timeline{timeline}url{url}` |
| `rtm.tasks.addTags` | `{secret}api_key{apiKey}auth_token{token}formatjsonlist_id{listId}methodrtm.tasks.addTagstags{tag}task_id{taskId}taskseries_id{seriesId}timeline{timeline}` |

Each API request sends the same parameters (without the secret) plus `api_sig` as a
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

## How to read the build steps

Action names are from the English Shortcuts app. "→ variable `x`" means a **Set
Variable** action named `x` right after it.

Every RTM API call in both Shortcuts uses the same block:

1. **Text** with the signature string for the call from the tables above (insert
   variables where the table shows `{…}`; no spaces, no line breaks)
2. **Generate Hash**: `MD5` → variable `sig`
3. **Get Contents of URL** `https://api.rememberthemilk.com/services/rest/`
   - Method: `POST`
   - Request Body: `Form`, with one text field per parameter of the signature string
     (`api_key`, `format` = `json`, `method`, …) plus `api_sig` = `sig`
4. → variable `response`
5. **Get Dictionary Value** `rsp.stat` from `response`. **If** it is not `ok`:
   **Show Alert** with **Get Dictionary Value** `rsp.err.msg` from `response`, then
   **Stop This Shortcut**. **End If**

Below, "**RTM call** `method`" stands for this block.

## Build "Später Setup"

Create a new Shortcut named **Später Setup**.

1. **Ask for Input** (Text) "RTM API key" → variable `apiKey`
2. **Ask for Input** (Text) "RTM shared secret" → variable `secret`
3. **RTM call** `rtm.auth.getFrob`, then **Get Dictionary Value** `rsp.frob` → variable
   `frob`
4. **Text** with the auth URL signature string, **Generate Hash** `MD5` → variable `sig`
5. **Text**
   `https://www.rememberthemilk.com/services/auth/?api_key={apiKey}&perms=write&frob={frob}&api_sig={sig}`,
   then **Open URLs**
6. **Wait to Return**, then **Show Alert** "Did you allow access in Safari?" (with Cancel)
7. **RTM call** `rtm.auth.getToken`, then **Get Dictionary Value** `rsp.auth.token` →
   variable `token`
8. **Dictionary** (empty) → variable `lists`
9. **RTM call** `rtm.lists.getList`, then **Get Dictionary Value** `rsp.lists.list`, and
   **Repeat with Each** item:
   - **If** the item's `smart` is `0`: **If** its `archived` is `0`: **Set Dictionary
     Value** key = item's `name`, value = item's `id`, in `lists` → variable `lists`.
     **End If**, **End If**

   **End Repeat**
10. **Get Dictionary Value**: `All Keys` of `lists`, **Choose from List** "Which list?",
    then **Get Dictionary Value** (chosen name) from `lists` → variable `listId`
11. **Choose from Menu** "Language of task names" with the options `Deutsch` and
    `English`. In each option, add a **Dictionary** with these items (templates and tags
    from the table above for that language), then → variable `config`:

    | Key               | Value                      |
    |-------------------|----------------------------|
    | `api_key`         | variable `apiKey`          |
    | `secret`          | variable `secret`          |
    | `auth_token`      | variable `token`           |
    | `list_id`         | variable `listId`          |
    | `read_template`   | e.g. `"%s" lesen`          |
    | `read_tag`        | e.g. `lesen`               |
    | `watch_template`  | e.g. `"%s" ansehen`        |
    | `watch_tag`       | e.g. `ansehen`             |
    | `listen_template` | e.g. `"%s" anhören`        |
    | `listen_tag`      | e.g. `anhören`             |

    **End Menu**
12. **Save File** `config` to the `Shortcuts` folder in iCloud Drive with the subpath
    `spaeter.json`. Turn **Ask Where to Save** off and **Overwrite If File Exists** on.
13. **Show Notification** "Setup complete. Share a link and pick Später."

Run it once from the Shortcuts app. Run it again whenever you want to change the list or
the language, or after you revoked access in Remember The Milk.

## Build "Später"

Create a new Shortcut named **Später**.

### 1. Input and configuration

1. **Receive** `URLs`, `Safari web pages` and `Text` input from **Share Sheet**.
   If there's no input: **Get Clipboard**.
2. **Get File** from the `Shortcuts` folder with the path `spaeter.json`, with **Error If
   Not Found** off. **If** the file does not have any value: **Show Alert** "Run Später
   Setup first." and **Stop This Shortcut**. **End If**
3. **Get Dictionary from Input** → variable `config`
4. **Get Dictionary Value** from `config`: `api_key` → variable `apiKey`, `secret` →
   variable `secret`, `auth_token` → variable `token`, `list_id` → variable `listId`

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

**RTM call** for each of the four calls of **Später**, in the order of the table above.

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

In the details of **Später** (ⓘ), turn on **Show in Share Sheet**. On the iPhone, the
Shortcut is listed at the bottom of every Share Sheet. In apps such as YouTube or
Spotify, tap **Share** → **More** (`…`) to reach it, and add it to your favourites.

## Export and sign `.shortcut` files

Use this to back up the Shortcuts or to share them, for example as
`ios/Spaeter.shortcut` and `ios/Spaeter-Setup.shortcut` in this repository. Neither
Shortcut contains secrets, so they are safe to share. **Never share `spaeter.json`.**

1. **Export** on the Mac: in the Shortcuts app, right-click the Shortcut →
   **Share** → **Export File**, and save it as `Später.shortcut` (and
   `Später Setup.shortcut`). Depending on the macOS version, the export dialog already
   asks who may import it and signs the file.
2. **Sign** the files explicitly (or re-sign them) with the `shortcuts` command line
   tool. It needs a Mac that is signed in to iCloud:

   ```sh
   shortcuts sign --mode anyone --input Später.shortcut --output Spaeter.shortcut
   shortcuts sign --mode anyone --input "Später Setup.shortcut" --output Spaeter-Setup.shortcut
   ```

   `--mode anyone` lets everyone import the files. `--mode people-who-know-me` limits it
   to people in your contacts.
3. **Test the import**: AirDrop the files to your iPhone or open them there, then run
   **Später Setup**.
4. **Commit** (optional): `.shortcut` files are in `.gitignore`, so signed files have to
   be added on purpose, e.g. `git add -f ios/Spaeter.shortcut ios/Spaeter-Setup.shortcut`.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `Invalid signature (RTM error 96)` | The signature string is wrong: check the key order, typos and stray spaces, and compare with the worked example. |
| `Login failed / Invalid auth token (RTM error 98)` | The token was revoked. Run **Später Setup** again. |
| `Invalid frob - did you authenticate? (RTM error 101)` | Access wasn't allowed in Safari before returning. Run **Später Setup** again. |
| "Run Später Setup first." | `spaeter.json` is missing from `iCloud Drive/Shortcuts`. Run **Später Setup**. |
| `Invalid API Key (RTM error 100)` | The API key is wrong or not yet approved by RTM. |
| The title is empty or `"" lesen` | The page blocks requests without a browser. Edit the task in RTM, or add an oEmbed rule if the site offers oEmbed. |
| The Shortcut is missing in an app's Share Sheet | Check that **Show in Share Sheet** is on and that `URLs` is selected as input type. |
