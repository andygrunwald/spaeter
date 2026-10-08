# Setup: Google Chrome Extension

The extension is not available in the Chrome Web Store (yet), so it needs a manual
setup:

1. [Get an RTM API key](setup-rtm-api-key.md).
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

Also on iPhone? See [Setup: iPhone / iOS](setup-iphone.md).

Back to the [documentation overview](README.md).
