# Setup: iPhone / iOS

On the iPhone, *Später* is a single Apple Shortcut. Started from the Share Sheet of any
app, it adds the shared link to Remember The Milk. Started directly in the Shortcuts app,
it lets you set it up and change its settings.

## Install and set up

1. [Get an RTM API key](setup-rtm-api-key.md).
2. Get the Shortcut: open [`ios/Später.shortcut`](../ios/Später.shortcut) on GitHub in
   Safari on your iPhone and download it (**Download raw file**), or AirDrop the file from
   a Mac. Open the file and tap **Add Shortcut**.
3. Open the Shortcuts app and tap ***Später***. On the first run, the setup starts right
   away:
   1. **RTM API key**: paste your API key.
   2. **RTM shared secret**: paste your shared secret.
   3. Safari opens Remember The Milk's approval page. Log in if needed and allow access.
   4. Go back to Shortcuts and confirm **Did you allow access in Safari?**.
   5. **Which list should the tasks go to?**: pick a list.
   6. **Language of task names**: pick Deutsch or English.

   A "Setup complete" notification confirms it.
4. Share any link and pick ***Später***. In apps like YouTube or Spotify, it's under
   **Share → More**. If it's missing, turn on **Show in Share Sheet** in the details of
   ***Später***.

The first time *Später* connects to a website, Shortcuts asks for permission, for example
for `api.rememberthemilk.com` or the site of an article whose title it looks up. Choose
**Always Allow**.

## Change settings

Start ***Später*** in the Shortcuts app and pick:

- **Add link from clipboard**: adds a link you copied.
- **Change list and language**: picks another list or language and keeps your login.
- **Set up (log in to Remember The Milk)**: runs the full setup again, for example with a
  new API key or after you revoked access.

## Where your credentials are stored

The setup saves your API key, shared secret, auth token, list and task names to
`iCloud Drive/Shortcuts/spaeter.json`. The Shortcut itself contains no credentials.
Never share or commit `spaeter.json`. To remove *Später*, delete the Shortcut and this
file, and revoke its access in Remember The Milk under **Settings → Apps**.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| "Später is not set up yet" | Start ***Später*** in the Shortcuts app to run the setup. |
| `Invalid signature (RTM error 96)` | The shared secret is wrong. Run **Set up** again. |
| `Login failed / Invalid auth token (RTM error 98)` | Access was revoked. Run **Set up** again. |
| `Invalid API Key (RTM error 100)` | The API key is wrong or not yet approved by RTM. |
| `Invalid frob - did you authenticate? (RTM error 101)` | Access wasn't allowed in Safari before going back. Run **Set up** again. |
| The task title is empty or wrong | The website blocks requests from Shortcuts. Edit the task in Remember The Milk. |
| *Später* is missing in an app's Share Sheet | Turn on **Show in Share Sheet** in the details of ***Später***. |

Also using Chrome? See [Setup: Google Chrome Extension](setup-google-chrome-extension.md).

Back to the [documentation overview](README.md).
