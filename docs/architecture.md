# Architecture and data flow

How the Chrome extension, the iPhone Shortcut and Remember The Milk work together. For
the code layout and development workflow, see [DEVELOPMENT.md](../DEVELOPMENT.md).

## System overview

Both clients talk to the Remember The Milk API directly; there is no server in between.
Each client stores its own credentials.

```mermaid
flowchart LR
    subgraph chrome["Google Chrome extension"]
        popup["Popup / one-click button"]
        lib["lib/: rules, classify, metadata, rtm"]
        storage[("chrome.storage.local")]
        popup --> lib
        lib --- storage
    end

    subgraph iphone["iPhone Shortcut Später"]
        shortcut["Share Sheet / Shortcuts app"]
        config[("iCloud Drive/Shortcuts/spaeter.json")]
        shortcut --- config
    end

    titles["Title sources: oEmbed (YouTube, Vimeo, Spotify), web pages"]
    rtm["Remember The Milk REST API"]

    lib -- "signed requests" --> rtm
    shortcut -- "signed requests" --> rtm
    lib --> titles
    shortcut --> titles
```

## Chrome: adding a link

With the confirmation popup turned on (default), the popup shows the detected type and
title for editing. With it turned off, the background worker adds the task right away.

```mermaid
sequenceDiagram
    actor User
    participant Button as Toolbar button
    participant UI as popup.js / background.js
    participant Lib as lib/addLink.js
    participant Sources as oEmbed / web page
    participant RTM as Remember The Milk API

    User->>Button: click
    Button->>UI: open popup, or action.onClicked in one-click mode
    UI->>Lib: prepareLink(tab)
    Lib->>Lib: classify(url) with rules.js
    Lib->>Sources: fetchTitle(tab)
    Sources-->>Lib: title
    Lib-->>UI: type, title
    opt Confirmation popup
        User->>UI: correct type or title, click Add
    end
    UI->>Lib: addLink(link, settings)
    Lib->>RTM: addTask(): four signed calls
    RTM-->>Lib: ok or error
    Lib-->>UI: task name
    UI-->>User: ✓ in the popup, or badge and notification
```

## Chrome: connecting to Remember The Milk

The settings page uses RTM's desktop authentication flow, which needs no callback URL.

```mermaid
sequenceDiagram
    actor User
    participant Options as options.js
    participant RTM as Remember The Milk API
    participant Web as rememberthemilk.com

    User->>Options: enter API key and shared secret, click Connect
    Options->>RTM: rtm.auth.getFrob
    RTM-->>Options: frob
    Options->>Web: open approval page in a new tab (signed URL)
    User->>Web: log in and allow access
    User->>Options: click "I have allowed access"
    Options->>RTM: rtm.auth.getToken(frob)
    RTM-->>Options: auth token and username
    Options->>Options: store key, secret and token in chrome.storage.local
    Options->>RTM: rtm.lists.getList
    RTM-->>Options: lists for the list picker
```

## iPhone: start modes

The same Shortcut behaves differently depending on how it is started. The setup never
runs from the Share Sheet: the login switches to Safari, which ends a Shortcut that runs
inside another app.

```mermaid
flowchart TD
    start(["Später starts"]) --> load["Read spaeter.json"]
    load --> input{"Shortcut Input?"}
    input -- "yes: Share Sheet" --> configured{"Set up?"}
    configured -- no --> alert["Alert: run Später once to set it up"]
    configured -- yes --> share["Share: classify, look up title, add task"]
    input -- "no: started directly" --> firstrun{"Set up?"}
    firstrun -- no --> setup["Setup"]
    firstrun -- yes --> menu{"Menu"}
    menu -- "Add link from clipboard" --> share
    menu -- "Change list and language" --> change["Choose list and language"]
    menu -- "Set up" --> setup
    setup --> change
    change --> save[("Save spaeter.json")]
```

## iPhone: setup

```mermaid
sequenceDiagram
    actor User
    participant Shortcut as Später
    participant RTM as Remember The Milk API
    participant Safari
    participant Files as iCloud Drive

    Shortcut->>User: Ask for Input: RTM API key, RTM shared secret
    User-->>Shortcut: key and secret
    Shortcut->>RTM: rtm.auth.getFrob
    RTM-->>Shortcut: frob
    Shortcut->>Safari: open approval page (signed URL)
    User->>Safari: log in and allow access
    User->>Shortcut: return to Shortcuts, confirm
    Shortcut->>RTM: rtm.auth.getToken(frob)
    RTM-->>Shortcut: auth token
    Shortcut->>RTM: rtm.lists.getList
    RTM-->>Shortcut: lists
    Shortcut->>User: Which list? Which language?
    User-->>Shortcut: list and language
    Shortcut->>Files: save spaeter.json
```

## Title lookup

Each client tries its sources in order and stops at the first title it finds. Both fall
back to the URL, so a task never gets an empty name.

```mermaid
flowchart TD
    subgraph chrome["Chrome extension (lib/metadata.js)"]
        c1["oEmbed: YouTube, Vimeo, Spotify"] -- no title --> c2["og:title or document.title of the tab"]
        c2 -- no title --> c3["tab.title"]
        c3 -- no title --> c4["URL"]
    end

    subgraph iphone["iPhone Shortcut (ios/title.cherri)"]
        i1["oEmbed: YouTube, Vimeo, Spotify"] -- no title --> i2["Safari Reader title"]
        i2 -- no title --> i3["&lt;title&gt; from the page source"]
        i3 -- no title --> i4["URL"]
    end
```

## Creating a task

Both clients create a task with the same four calls. Every request is signed with
`md5(shared secret + all parameters sorted by key)`. Smart Add is not used, so titles
are never turned into lists, tags or due dates.

```mermaid
sequenceDiagram
    participant Client as Chrome extension or iPhone Shortcut
    participant RTM as Remember The Milk API

    Client->>RTM: rtm.timelines.create
    RTM-->>Client: timeline
    Client->>RTM: rtm.tasks.add(list_id, name)
    RTM-->>Client: list, task series and task IDs
    Client->>RTM: rtm.tasks.setURL(url)
    RTM-->>Client: ok
    Client->>RTM: rtm.tasks.addTags(tag)
    RTM-->>Client: ok
```

## Building the iPhone Shortcut

The domains and task name presets come from the same file as in the Chrome extension.
Signing only works on a Mac, so CI compiles the Shortcut unsigned and the tests check
that the committed signed file was rebuilt.

```mermaid
flowchart TD
    rules["extension/lib/rules.js"] --> generator["scripts/build-shortcut-rules.mjs"]
    generator --> generated["ios/generated/*.cherri"]
    sources["ios/*.cherri"] --> cherri["Cherri compiler, unsigned"]
    generated --> cherri
    cherri --> sign["shortcuts sign, macOS only"]
    sign --> signed["ios/Später.shortcut"]
    rules --> hash["scripts/shortcut-lock.mjs: hash of all inputs"]
    sources --> hash
    hash --> lock["ios/shortcuts.lock"]
    cherri -. "make shortcuts-compile" .-> ci["CI"]
    lock -. "tests/shortcuts.test.js" .-> ci
```

Back to the [documentation overview](README.md).
