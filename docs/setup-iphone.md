# Setup: iPhone / iOS

On the iPhone, *Später* consists of two Apple Shortcuts: ***Später Setup*** connects to
Remember The Milk once, and ***Später*** adds links from the Share Sheet.

1. [Get an RTM API key](setup-rtm-api-key.md).
2. Get both Shortcuts: import the signed `.shortcut` files, or build them yourself in the
   Shortcuts app on your Mac (they sync to your iPhone via iCloud).
3. Run ***Später Setup*** once from the Shortcuts app: enter your API key and shared
   secret, allow access in Safari, then choose the list and the language of the task
   names. The settings are saved to `iCloud Drive/Shortcuts/spaeter.json`.
4. Make sure **Show in Share Sheet** is on in the details of ***Später***.
5. Share any link and pick ***Später***. In apps like YouTube or Spotify, it's under
   **Share → More**.

The full step-by-step guide, including how to export and sign `.shortcut` files, is in
[`ios/SHORTCUT.md`](../ios/SHORTCUT.md).

Also using Chrome? See [Setup: Google Chrome Extension](setup-google-chrome-extension.md).

Back to the [documentation overview](README.md).
