# Setup Prerequisite: Getting an RTM API key

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
5. Enter them **only** in the Chrome extension's settings or in the setup of the
   *Später* Shortcut on your iPhone. The shared secret signs every request: treat it like a
   password. Never paste it into an issue, a screenshot or a commit.

Good to know:

- The Remember The Milk API is free for **non-commercial use** only; see the
  [API terms](https://www.rememberthemilk.com/services/api/terms.rtm).
- Connecting creates an **auth token** with write access. It doesn't expire by itself.
  You can revoke it anytime in Remember The Milk under **Settings → Apps**; after that,
  reconnect in the Chrome extension or run the setup of the *Später* Shortcut again.
- If the API key or secret leaks, revoke the token and request a new key.

Next: set up the [Google Chrome extension](setup-google-chrome-extension.md) or the
[iPhone](setup-iphone.md).

Back to the [documentation overview](README.md).
