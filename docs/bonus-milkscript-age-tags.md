# Bonus: Age tags for your Read/Watch/Listen list with MilkScript

The internet has far more content than anyone can consume. Many great people make great
articles, videos and podcasts, and *Später* makes saving them a one-click job. But we
can't consume everything. Some things don't age well, or age too fast. And sometimes we
save something because it looks interesting, and later we notice that our interest
isn't that high after all.

Age tags show how long a task has been waiting in your list. They help you keep the list
clean and keep at least some focus when you clean it up in the
[GTD Weekly Review](https://gettingthingsdone.com/2018/08/episode-43-the-power-of-the-gtd-weekly-review/):
a link that has been waiting for three months is a good candidate to delete.

## What it does

A [MilkScript](https://www.rememberthemilk.com/services/milkscript/) checks every
incomplete task in the list `Read/Watch/Listen` and compares the date the task was added
with today:

| Task added             | Tag            |
|------------------------|----------------|
| less than 1 month ago  | none           |
| 1 to 2 months ago      | `1+month-old`  |
| 2 to 3 months ago      | `2+months-old` |
| more than 3 months ago | `3+months-old` |

A task has at most one of these tags. When a task moves up an age class, the script
removes the old tag and adds the new one. Other tags such as `read` stay untouched.

Why `1+month-old` and not `>1 month old`? Remember The Milk tags can't contain spaces and
only allow letters, numbers and `+ - . @ _`, so `+` stands in for "more than".

## Requirements

- A Remember The Milk **Pro** account: MilkScript is
  [available exclusively for Pro users](https://blog.rememberthemilk.com/introducing-milkscript/),
  and so are tag colors.
- The list name in the script matches the list *Später* adds tasks to. Change
  `LIST_NAME` if yours is called differently.

## The script

```js
// Später: age tags for the Read/Watch/Listen list.
// Adjust LIST_NAME if your Später tasks go to a different list.
const LIST_NAME = 'Read/Watch/Listen';
const ONE_MONTH = '1+month-old';
const TWO_MONTHS = '2+months-old';
const THREE_MONTHS = '3+months-old';
const AGE_TAGS = [ONE_MONTH, TWO_MONTHS, THREE_MONTHS];

function monthsAgo(months) {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  return date;
}

const oneMonthAgo = monthsAgo(1);
const twoMonthsAgo = monthsAgo(2);
const threeMonthsAgo = monthsAgo(3);

function ageTag(created) {
  if (created < threeMonthsAgo) return THREE_MONTHS;
  if (created <= twoMonthsAgo) return TWO_MONTHS;
  if (created <= oneMonthAgo) return ONE_MONTH;
  return null;
}

// Make sure all age tags exist, so you can give them colors right after the first run.
AGE_TAGS.forEach(name => rtm.addTag(name));

const tasks = rtm.getTasks(`list:"${LIST_NAME}" AND status:incomplete`);
let updated = 0;
tasks.forEach(task => {
  const wanted = ageTag(task.getCreatedDate());
  const current = task.getTags()
    .map(tag => tag.getName())
    .filter(name => AGE_TAGS.includes(name));
  const stale = current.filter(name => name !== wanted);
  const missing = wanted !== null && !current.includes(wanted);
  if (stale.length > 0) task.removeTags(...stale);
  if (missing) task.addTags(wanted);
  if (stale.length > 0 || missing) updated++;
});
console.log('Checked %d task(s) in "%s", updated %d.', tasks.length, LIST_NAME, updated);
```

## Set it up

1. Open [MilkScript](https://www.rememberthemilk.com/services/milkscript/) in Remember
   The Milk and create a new script, for example named `Age tags`.
2. Paste the script and save it.
3. Run it once: in the web or desktop app, click the **MilkScript** button at the top
   right, then **Age tags**. The console shows how many tasks it checked and updated.

You don't need to create the tags yourself: the script creates all three on every run if
they don't exist yet.

## Give the tags colors

MilkScript can't set tag colors, so set them by hand, once. The colors get stronger as
the tasks get older:

| Tag            | Color                       |
|----------------|-----------------------------|
| `1+month-old`  | very light orange / peach   |
| `2+months-old` | orange                      |
| `3+months-old` | strong red                  |

Open the tag under **Tags** in the left menu, edit the tag and pick the closest color
from Remember The Milk's palette.

## Caveat: you have to run it yourself

MilkScript has no built-in schedule or trigger yet. Without a third-party service like
IFTTT or Zapier, the only way to run the script is the **MilkScript** button. The tags
are only as current as your last run. The
[MilkScript FAQ](https://www.rememberthemilk.com/services/milkscript/faq/) announces
date-based triggers. Until they exist, make the script the first step of your Weekly
Review.

Tip: a Smart List with `list:"Read/Watch/Listen" AND tag:3+months-old` shows the
candidates for deletion at a glance.

Back to the [documentation overview](README.md).
