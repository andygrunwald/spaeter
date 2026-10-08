// Renders the extension icons from the Noto Emoji cow face (U+1F42E, Apache-2.0).
// Run via `make icons`; the generated PNGs are committed.
import sharp from 'sharp';

const SOURCE = 'assets/emoji_u1f42e.svg';
const SIZES = [16, 32, 48, 128];

for (const size of SIZES) {
  await sharp(SOURCE, { density: 384 }).resize(size, size).png().toFile(`extension/icons/icon-${size}.png`);
}
console.log(`Rendered ${SIZES.join(', ')} px icons from ${SOURCE}`);
