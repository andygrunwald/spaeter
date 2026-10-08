// Single source of truth for link classification and task naming.
// The iPhone Shortcut is generated from these values (scripts/build-shortcut-rules.mjs).

export const TYPES = ['read', 'watch', 'listen'];

// A domain also matches all of its subdomains (youtube.com matches m.youtube.com).
// Everything that matches no domain is "read".
export const DOMAINS = {
  watch: ['youtube.com', 'youtu.be', 'vimeo.com', 'twitch.tv', 'ardmediathek.de'],
  // Spotify is always "listen", even when oEmbed reports a video podcast as type "video".
  listen: ['spotify.com', 'spotify.link', 'podcasts.apple.com', 'overcast.fm', 'pocketcasts.com', 'pca.st'],
};

// Task name templates: %s is replaced by the title. The tag is added to the task.
export const PRESETS = {
  de: {
    read: { template: '"%s" lesen', tag: 'lesen' },
    watch: { template: '"%s" ansehen', tag: 'ansehen' },
    listen: { template: '"%s" anhören', tag: 'anhören' },
  },
  en: {
    read: { template: 'Read "%s"', tag: 'read' },
    watch: { template: 'Watch "%s"', tag: 'watch' },
    listen: { template: 'Listen to "%s"', tag: 'listen' },
  },
};

export const DEFAULT_PRESET = 'de';
