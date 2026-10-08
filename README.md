# Später

Save articles, videos and podcasts you want to get to later as tasks in
[Remember The Milk](https://www.rememberthemilk.com/), with one click in Google Chrome
or from the Share Sheet on your iPhone.

![Später icon](extension/icons/icon-128.png)

## What it does

You find an interesting link while browsing, or a friend sends one via WhatsApp, Signal
or Discord, but you don't have time for it right now. Später turns the link into a task
in the Remember The Milk list of your choice:

| Link                                               | Task name                                                       | Tag       |
|----------------------------------------------------|-----------------------------------------------------------------|-----------|
| `https://dnsmichi.com/all-remote-workspace/`       | `"All-remote workspace" lesen`                                  | `lesen`   |
| `https://www.youtube.com/watch?v=u3GjIXP9N0s`      | `"AWS Distinguished Eng: Learning From 3000 Incidents …" ansehen` | `ansehen` |
| `https://open.spotify.com/episode/0krvjS7wn6JsqNgYhFaSyc` | `"18 Stunden Arbeit am Tag: Wie ich fast alles verlor …" anhören` | `anhören` |

The link is stored as the task's URL, and the task has no due date.

- **Google Chrome**: a button next to the address bar. By default it opens a small
  popup where you can correct the type and title before adding; it can also add the task
  with a single click.
- **iPhone**: a Shortcut in the Share Sheet of Safari, YouTube, Spotify, messengers and
  any other app that shares links. It adds the task and shows a notification.

## How links are classified

| Type   | Links from                                                                         |
|--------|------------------------------------------------------------------------------------|
| Watch  | YouTube, Vimeo, Twitch, ARD Mediathek                                              |
| Listen | Spotify (always, including video podcasts), Apple Podcasts, Overcast, Pocket Casts |
| Read   | everything else                                                                    |

Titles come from the platforms' oEmbed endpoints (YouTube, Vimeo, Spotify) or from the
page itself (`og:title`, then `<title>`).

Task names and tags are configurable per type. `%s` stands for the title:

| Type   | Deutsch (default) | English          |
|--------|-------------------|------------------|
| Read   | `"%s" lesen`      | `Read "%s"`      |
| Watch  | `"%s" ansehen`    | `Watch "%s"`     |
| Listen | `"%s" anhören`    | `Listen to "%s"` |

The tags are `lesen`/`ansehen`/`anhören` and `read`/`watch`/`listen`. You can also write
your own templates and tags.

## Getting an RTM API key

Später talks to the Remember The Milk API with **your own API key**. Nothing runs on a
server in between, and no key is shipped with this project. You need the key once, for
both Chrome and iPhone.

1. Log in to Remember The Milk and open
   [rememberthemilk.com/services/api/keys.rtm](https://www.rememberthemilk.com/services/api/keys.rtm).
2. Apply for a key. Use "Später" (or any name you like) as the application name and
   describe it as a personal, non-commercial tool that adds links as tasks. Später uses
   RTM's desktop authentication flow, so **no callback URL is needed**.
3. Wait for the approval. RTM reviews applications manually, so this can take a while.
4. Once approved, you get an **API key** and a **shared secret**. RTM delivers them by
   email and shows them on the API keys page.
5. Enter them **only** in the Chrome extension's settings (and later in the iPhone
   Shortcut). The shared secret signs every request: treat it like a password. Never
   paste it into an issue, a screenshot, a commit or a shared Shortcut.

Good to know:

- The API is free for **non-commercial use** only; see the
  [API terms](https://www.rememberthemilk.com/services/api/terms.rtm).
- Connecting creates an **auth token** with write access. It doesn't expire by itself.
  You can revoke it anytime in Remember The Milk under **Settings → Apps**; after that,
  reconnect in the extension and update the token in the Shortcut.
- If the API key or secret leaks, revoke the token and request a new key.

## Setup: Google Chrome

1. Download this repository (or `git clone` it).
2. Open `chrome://extensions`, turn on **Developer mode** (top right) and click **Load
   unpacked**. Select the `extension` folder.
3. Click the puzzle icon next to the address bar and **pin** Später, so its button
   always shows next to the address bar.
4. The settings open automatically on first install. You can also right-click the button
   and choose **Options**. In the settings:
   1. Enter your **API key** and **shared secret** and click **Connect to Remember The
      Milk**.
   2. A Remember The Milk tab opens. Allow access there, then come back and click **I
      have allowed access**. The settings now show "Connected as …".
   3. Choose the **list** the tasks should go to.
   4. Optional: turn off the **confirmation popup** to add tasks with a single click.
      A ✓ or ✗ on the button and a notification show the result.
   5. Optional: choose a **preset** (Deutsch or English) or edit the task names and tags,
      then click **Save**.

The section **Values for the iPhone Shortcut** in the settings shows your API key, auth
token and list ID with copy buttons. You need them for the iPhone setup.

The extension's interface follows Chrome's language (English or German).

## Setup: iPhone / iOS

On the iPhone, Später is an Apple Shortcut. It uses the same API key, shared secret,
auth token and list ID as the Chrome extension, so set up Chrome first.

1. Get the Shortcut: either import a signed `.shortcut` file someone shared with you, or
   build it yourself in the Shortcuts app on your Mac (it syncs to your iPhone via
   iCloud).
2. When importing, answer the **import questions** with your API key, shared secret, auth
   token and list ID.
3. Make sure **Show in Share Sheet** is on in the Shortcut's details.
4. Share any link and pick **Später**. In apps like YouTube or Spotify, it's under
   **Share → More**.

The full step-by-step guide, including how to export and sign a `.shortcut` file, is in
[`ios/SHORTCUT.md`](ios/SHORTCUT.md).

## Why "Später" and not "Remember The Milk Later"?

We wanted to call this project "Remember The Milk Later". Remember The Milk's
[branding guidelines](https://www.rememberthemilk.com/services/api/branding.rtm) don't
allow "Remember The Milk" or "RTM" in the name of a product built on their API, and they
don't allow their cow logo as an icon. We respect that, so the project is called
**Später** (German for "later"), and its icon is the cow emoji from Google's Noto Emoji.

## Attribution

This product uses the Remember The Milk API but is not endorsed or certified by
Remember The Milk.

## License

[MIT](LICENSE). The icons are rendered from [Noto Emoji](https://github.com/googlefonts/noto-emoji)
(Apache-2.0, see [`extension/icons/LICENSE`](extension/icons/LICENSE)). The MD5
implementation is [blueimp-md5](https://github.com/blueimp/JavaScript-MD5) (MIT).

Developers: see [DEVELOPMENT.md](DEVELOPMENT.md).
