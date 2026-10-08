# 🐮 *Später*

Save articles, videos and podcasts you want to consume later as tasks in
[Remember The Milk](https://www.rememberthemilk.com/). With one click in Google Chrome
or from the Share functionality on your iPhone.

## What it does

You find an interesting link while browsing, or a friend sends one via WhatsApp, Signal
or Discord, but you don't have time or motivation to consume it right now. *Später* sorts the
link into one of three consumption categories, **Read** (articles), **Watch** (videos)
or **Listen** (podcasts), and turns it into a task in the Remember The Milk list of your
choice:

| Type   | Link                                                                    | Task name                                                         | Tag      |
|--------|-------------------------------------------------------------------------|-------------------------------------------------------------------|----------|
| Listen | `https://open.spotify.com/episode/6fNv8trMNhqtbhbOBWkLNS`               | `Listen to "How Linux is built with Greg Kroah-Hartman"`          | `listen` |
| Read   | `https://jeremymorrell.dev/blog/a-practitioners-guide-to-wide-events/`  | `Read "A Practitioner's Guide to Wide Events"`                    | `read`   |
| Watch  | `https://www.youtube.com/watch?v=u3GjIXP9N0s`                           | `Watch "AWS Distinguished Eng: Learning From 3000 Incidents …"`   | `watch`  |

The link is stored as the task's URL, and the task has no due date.

*Später* comes in two flavours:

- **Google Chrome extension**: a button next to the address bar. Click it and the task
  will be created.

  <!-- Screenshot: docs/screenshots/chrome.png -->
  *Screenshot coming soon.*

- **iPhone Share functionality**: share a link from Safari, YouTube, Spotify or any other
  app and pick *Später*.

  <!-- Screenshot: docs/screenshots/iphone.png -->
  *Screenshot coming soon.*

## How links are classified

| Type   | Links from                                                                         |
|--------|------------------------------------------------------------------------------------|
| Watch  | YouTube, Vimeo, Twitch, ARD Mediathek                                              |
| Listen | Spotify (always, including video podcasts), Apple Podcasts, Overcast, Pocket Casts |
| Read   | everything else                                                                    |

Task names and tags are configurable per type.

## Setup Prerequisite: Getting an RTM API key

*Später* talks to the Remember The Milk API with **your own API key**. Nothing runs on a
server in between, and no key is shipped with this project. You need the key once and
can use it for each device you set up.

1. Log in to Remember The Milk and open
   [rememberthemilk.com/services/api/keys.rtm](https://www.rememberthemilk.com/services/api/keys.rtm).
2. Apply for a key. Use "*Später*" (or any name you like) as the application name and
   describe it as a personal, non-commercial tool that adds links as tasks. *Später* uses
   RTM's desktop authentication flow, so **no callback URL is needed**.
3. Wait for the approval (by the RTM team).
4. Once approved, you get an **API key** and a **shared secret**. RTM delivers them by
   email and shows them on the API keys page.
5. Enter them **only** in the Chrome extension's settings or in the *Später Setup*
   Shortcut on your iPhone. The shared secret signs every request: treat it like a
   password. Never paste it into an issue, a screenshot or a commit.

Good to know:

- The Remember The Milk API is free for **non-commercial use** only; see the
  [API terms](https://www.rememberthemilk.com/services/api/terms.rtm).
- Connecting creates an **auth token** with write access. It doesn't expire by itself.
  You can revoke it anytime in Remember The Milk under **Settings → Apps**; after that,
  reconnect in the Chrome extension or run *Später Setup* again on your iPhone.
- If the API key or secret leaks, revoke the token and request a new key.

## Setup: Google Chrome Extension

The extension is not available in the Chrome Web Store (yet), so it needs a manual
setup:

1. [Get an RTM API key](#setup-prerequisite-getting-an-rtm-api-key).
2. Download this repository (or `git clone` it).
3. Open `chrome://extensions`, turn on **Developer mode** (top right) and click **Load
   unpacked**. Select the `extension` folder.
4. Click the puzzle icon next to the address bar and **pin** *Später*, so its button
   always shows next to the address bar.
5. The settings open automatically on first install. You can also right-click the button
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

## Setup: iPhone / iOS

On the iPhone, *Später* consists of two Apple Shortcuts: ***Später Setup*** connects to
Remember The Milk once, and ***Später*** adds links from the Share Sheet.

1. [Get an RTM API key](#setup-prerequisite-getting-an-rtm-api-key).
2. Get both Shortcuts: import the signed `.shortcut` files, or build them yourself in the
   Shortcuts app on your Mac (they sync to your iPhone via iCloud).
3. Run ***Später Setup*** once from the Shortcuts app: enter your API key and shared
   secret, allow access in Safari, then choose the list and the language of the task
   names. The settings are saved to `iCloud Drive/Shortcuts/spaeter.json`.
4. Make sure **Show in Share Sheet** is on in the details of ***Später***.
5. Share any link and pick ***Später***. In apps like YouTube or Spotify, it's under
   **Share → More**.

The full step-by-step guide, including how to export and sign `.shortcut` files, is in
[`ios/SHORTCUT.md`](ios/SHORTCUT.md).

## Why *Später* and not "Remember The Milk Later"?

We wanted to call this project "Remember The Milk Later". Remember The Milk's
[branding guidelines](https://www.rememberthemilk.com/services/api/branding.rtm) don't
allow "Remember The Milk" or "RTM" in the name of a product built on their API, and they
don't allow their cow logo as an icon. We respect that, so the project is called
*Später* (German for "later"), and its icon is the cow emoji from Google's Noto Emoji.

## Attribution

This product uses the Remember The Milk API but is not endorsed or certified by
Remember The Milk.

## License

[MIT](LICENSE). The icons are rendered from [Noto Emoji](https://github.com/googlefonts/noto-emoji)
(Apache-2.0, see [`extension/icons/LICENSE`](extension/icons/LICENSE)). The MD5
implementation is [blueimp-md5](https://github.com/blueimp/JavaScript-MD5) (MIT).

Developers: see [DEVELOPMENT.md](DEVELOPMENT.md).
