import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classify, formatTitle, isValidTemplate, isWebUrl } from '../extension/lib/classify.js';
import { PRESETS } from '../extension/lib/rules.js';

test('classify', async (t) => {
  const cases = {
    'https://www.youtube.com/watch?v=u3GjIXP9N0s': 'watch',
    'https://m.youtube.com/watch?v=u3GjIXP9N0s': 'watch',
    'https://youtu.be/u3GjIXP9N0s?si=abc': 'watch',
    'https://vimeo.com/76979871': 'watch',
    'https://player.vimeo.com/video/76979871': 'watch',
    'https://www.twitch.tv/videos/123': 'watch',
    'https://www.ardmediathek.de/video/abc': 'watch',
    'https://open.spotify.com/episode/0krvjS7wn6JsqNgYhFaSyc?si=6x265saHStiTGlEjGW0QGw&utm_source=copy-link': 'listen',
    'https://open.spotify.com/show/2MAi0BvDc6GTFvKFPXnkCL': 'listen',
    'https://spotify.link/AbCdEf': 'listen',
    'https://podcasts.apple.com/de/podcast/x/id123?i=456': 'listen',
    'https://overcast.fm/+abc': 'listen',
    'https://pocketcasts.com/podcast/x': 'listen',
    'https://pca.st/episode/abc': 'listen',
    'https://dnsmichi.com/all-remote-workspace/': 'read',
    'https://notyoutube.com/watch': 'read',
    'https://youtube.com.example.org/': 'read',
  };
  for (const [url, type] of Object.entries(cases)) {
    await t.test(url, () => assert.equal(classify(url), type));
  }
});

test('isWebUrl', () => {
  assert.equal(isWebUrl('https://example.com'), true);
  assert.equal(isWebUrl('http://example.com'), true);
  assert.equal(isWebUrl('chrome://extensions'), false);
  assert.equal(isWebUrl('not a url'), false);
});

test('formatTitle with both presets', () => {
  assert.equal(formatTitle(PRESETS.de.read.template, 'All-remote workspace'), '"All-remote workspace" lesen');
  assert.equal(formatTitle(PRESETS.de.listen.template, 'Folge 1'), '"Folge 1" anhören');
  assert.equal(formatTitle(PRESETS.en.read.template, 'All-remote workspace'), 'Read "All-remote workspace"');
  assert.equal(formatTitle(PRESETS.en.listen.template, 'Episode 1'), 'Listen to "Episode 1"');
});

test('formatTitle keeps special characters literal', () => {
  assert.equal(formatTitle('"%s" lesen', 'He said "hi" $& #tag !1'), '"He said "hi" $& #tag !1" lesen');
});

test('isValidTemplate requires exactly one %s', () => {
  assert.equal(isValidTemplate('"%s" lesen'), true);
  assert.equal(isValidTemplate('lesen'), false);
  assert.equal(isValidTemplate('%s %s'), false);
});
