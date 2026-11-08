// Unit tests for WedCore.slugify() and WedCore.makeSlug()
// Run with: node test-slug.js

const { slugify: slugify, makeSlug } = require('./lib/core.js');

let passed = 0;
let failed = 0;

function assert(condition, msg) {
  if (condition) {
    passed++;
    console.log('  PASS: ' + msg);
  } else {
    failed++;
    console.log('  FAIL: ' + msg);
  }
}

function assertEqual(actual, expected, msg) {
  if (actual === expected) {
    passed++;
    console.log('  PASS: ' + msg);
  } else {
    failed++;
    console.log('  FAIL: ' + msg + ' — expected "' + expected + '", got "' + actual + '"');
  }
}

console.log('=== slugify tests ===');

// Basic slugification
assertEqual(slugify('Amara Dewa'), 'amara-dewa', 'two names');
assertEqual(slugify('Amara  Dewa'), 'amara-dewa', 'multiple spaces collapsed');
assertEqual(slugify('Amara!'), 'amara', 'trailing punctuation stripped');
assertEqual(slugify('Amara&Dewa'), 'amara-dewa', 'ampersand to hyphen');

// Diacritics / accents
assertEqual(slugify('Renée'), 'renee', 'accent e stripped');
assertEqual(slugify('Zoë'), 'zoe', 'accent e stripped');
assertEqual(slugify('Müller'), 'muller', 'umlaut u stripped');
assertEqual(slugify('François'), 'francois', 'cedilla c stripped');

// Indonesian names
assertEqual(slugify('Amara Putri'), 'amara-putri', 'Indonesian name');
assertEqual(slugify('Dewa Pratama'), 'dewa-pratama', 'Indonesian name 2');
assertEqual(slugify('Keluarga Wijaya'), 'keluarga-wijaya', 'Indonesian name 3');

// Empty input
assertEqual(slugify(''), '', 'empty string');
assertEqual(slugify(null), '', 'null');
assertEqual(slugify(undefined), '', 'undefined');

// Very long names
const longName = 'A'.repeat(100);
const result = slugify(longName);
assert(result.length <= 24, 'long name trimmed to <= 24 chars (got ' + result.length + ')');
assert(result.match(/^[a-z0-9-]+$/), 'long name contains only valid chars');

// Special characters
assertEqual(slugify('A&B'), 'a-b', 'ampersand');
assertEqual(slugify('A@B'), 'a-b', 'at sign');
assertEqual(slugify('A#B'), 'a-b', 'hash');
assertEqual(slugify('A(B)'), 'a-b', 'parentheses');
assertEqual(slugify('A/B'), 'a-b', 'slash');

// Leading/trailing hyphens stripped
assertEqual(slugify('-Amara-'), 'amara', 'leading/trailing hyphens stripped');

// Case
assertEqual(slugify('AMARA DEWA'), 'amara-dewa', 'uppercase converted to lowercase');

console.log('');
console.log('=== makeSlug tests ===');

// Basic format: bride-groom-random with 6-char base32 suffix
const slug1 = makeSlug(['Amara', 'Dewa']);
assert(slug1.match(/^amara-dewa-[A-Z2-7]{6}$/), 'basic format: bride-groom-random6 (got ' + slug1 + ')');

// Different random suffixes each call
const slugs = new Set();
for (let i = 0; i < 20; i++) {
  slugs.add(makeSlug(['Amara', 'Dewa']));
}
assert(slugs.size === 20, '20 unique slugs from 20 calls (got ' + slugs.size + ')');

// Empty names fall back to wedding-{random}
const emptySlug = makeSlug([], new Set());
assert(emptySlug.match(/^wedding-[A-Z2-7]{6}$/), 'empty names fallback: wedding-random6 (got ' + emptySlug + ')');

// Single name: duplicates with partner
const singleSlug = makeSlug(['Amara'], new Set());
assert(singleSlug.match(/^amara-partner-[A-Z2-7]{6}$/), 'single name: amara-partner-random6 (got ' + singleSlug + ')');

// Reserved words fall back to wedding-random
const adminSlug = makeSlug(['Admin', 'Something'], new Set());
assert(adminSlug.match(/^wedding-[A-Z2-7]{6}$/), 'reserved "admin" -> wedding-random (got ' + adminSlug + ')');

const assetsSlug = makeSlug(['Assets', 'Foo'], new Set());
assert(assetsSlug.match(/^wedding-[A-Z2-7]{6}$/), 'reserved "assets" -> wedding-random (got ' + assetsSlug + ')');

const apiSlug = makeSlug(['Api', 'Bar'], new Set());
assert(apiSlug.match(/^wedding-[A-Z2-7]{6}$/), 'reserved "api" -> wedding-random (got ' + apiSlug + ')');

const sitesSlug = makeSlug(['Sites', 'Baz'], new Set());
assert(sitesSlug.match(/^wedding-[A-Z2-7]{6}$/), 'reserved "sites" -> wedding-random (got ' + sitesSlug + ')');

// Collision avoidance with usedSlugs
const used = new Set();
used.add(makeSlug(['Amara', 'Dewa'], used));
const slug2 = makeSlug(['Amara', 'Dewa'], used);
assert(slug2 !== [...used][0], 'collision avoided: different suffix (got ' + slug2 + ')');

// 10,000 generations with no collisions
const manySlugs = new Set();
let collision = false;
for (let i = 0; i < 10000; i++) {
  const s = makeSlug(['Amara', 'Dewa'], manySlugs);
  if (manySlugs.has(s)) { collision = true; break; }
  manySlugs.add(s);
}
assert(!collision, '10,000 generations with no collisions');
assert(manySlugs.size === 10000, '10,000 unique slugs generated');

// All slugs match expected format
let allValid = true;
manySlugs.forEach(s => {
  if (!s.match(/^amara-dewa-[A-Z2-7]{6}$/)) { allValid = false; }
});
assert(allValid, 'all 10,000 slugs match format amara-dewa-XXXXXX');

// Long names trimmed
const longNames = makeSlug(['A'.repeat(50), 'B'.repeat(50)], new Set());
assert(longNames.length <= 24 + 1 + 24 + 1 + 6, 'long names trimmed (got ' + longNames.length + ' chars)');

console.log('');
console.log('=== Results: ' + passed + ' passed, ' + failed + ' failed ===');
process.exit(failed > 0 ? 1 : 0);