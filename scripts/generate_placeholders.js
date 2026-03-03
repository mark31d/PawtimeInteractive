// scripts/generate_placeholders.js
// Creates 1x1 transparent PNG placeholders for all required assets
const fs = require('fs');
const path = require('path');

// Minimal 1x1 transparent PNG (binary safe base64)
const TRANSPARENT_PNG_B64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQI12NgAAIABQ' +
  'AABjkB6QAAAABJRU5ErkJggg==';

const ASSETS = [
  'logo.png',
  'tab_cats.png',
  'tab_care.png',
  'tab_notes.png',
  'tab_stats.png',
  'tab_map.png',
  'tab_settings.png',
  'marker.png',
  'card_glow.png',
  'breed_bengal.png',
  'breed_mainecoon.png',
  'breed_siamese.png',
  'breed_british.png',
  'breed_persian.png',
  'breed_sphynx.png',
  'breed_ragdoll.png',
  'breed_scottish.png',
  'breed_abyssinian.png',
  'breed_norwegian.png',
  'breed_russianblue.png',
  'breed_savannah.png',
];

const assetsDir = path.resolve(__dirname, '..', 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

let created = 0;
ASSETS.forEach(name => {
  const filePath = path.join(assetsDir, name);
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, Buffer.from(TRANSPARENT_PNG_B64, 'base64'));
    console.log('  Created:', name);
    created++;
  }
});

console.log(`\nDone. Created ${created} / ${ASSETS.length} placeholder assets.`);
console.log('Assets directory:', assetsDir);
