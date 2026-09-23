// v16/sprites/crew.js — crew figures (12x26), plain script, no modules.
// Facing the viewer, turned slightly LEFT (boot toes and brim lean left). Use opts.flip to face right.
// ROLE KEYS the renderer overrides per person: H hat, h hat shade, S shirt, s shirt shade,
// P pants, p pants shade, V vest stripe (falls back to shirt colour when no vest),
// F skin, f skin shade, k ink. Fixed keys: e eye highlight, B boot, b boot highlight,
// G glove, g glove shade, C clipboard/shirt front, c clipboard line, T tie.
// Row 25 (h-1) is the 1px ink ground shadow, ~70% width. Anchor [0,26] = bottom-left on the ground line.
var SPR16 = window.SPR16 = window.SPR16 || {};

var CREW_PAL = {
  H:'#f2c400', h:'#c99d00',      // hard hat (CAT yellow base / shade)
  S:'#ff7a00', s:'#b85400',      // shirt (orange base / shade)
  P:'#3552a0', p:'#2f478c',      // pants (work-blue base / shade)
  V:'#d0d4dc',                   // reflective vest stripe
  F:'#f5cfa8', f:'#e8b48a',      // skin base / shade
  k:'#141018',                   // ink
  e:'#ffffff',                   // eye highlight
  B:'#2a2a2a', b:'#4a4a4a',      // boot / boot highlight
  G:'#d8a850', g:'#a67a30',      // leather work gloves base / shade
};
function crewPal(extra) { var o = {}; for (var k in CREW_PAL) o[k] = CREW_PAL[k]; for (var j in (extra || {})) o[j] = extra[j]; return o; }

// Standing worker: hard hat with brim, eyes, sleeves, two vest stripes, gloves, boots.
SPR16.person = {
  w: 12, h: 26,
  anchor: [0, 26],
  pal: crewPal(),
  rows: [
    "....kkkk....",
    "..kHHHHhhk..",
    ".kHHHHHhhhk.",
    "kHHhhhhhhhhk",
    "..kffffffk..",
    "..kFFFFFfk..",
    "..kekFekfk..",
    "..kFFFFFfk..",
    "..kFFffFfk..",
    "...kFFFfk...",
    "....kffk....",
    ".kSSSSSSssk.",
    "kSsVVVVVVssk",
    "kSsSSSSSsssk",
    "kSsVVVVVVssk",
    "kGsSSSSSssGk",
    "kgsSSSSSssgk",
    ".kkPPPPPpkk.",
    ".kPPPPpPppk.",
    ".kPPpkPppk..",
    ".kPPpkPppk..",
    ".kPppkpppk..",
    ".kbBBkbBBk..",
    "kbBBBkbBBBk.",
    "kBBBBkBBBBk.",
    ".kkkkkkkkk..",
  ],
};

// Same figure holding a white clipboard against the chest in the left hand.
SPR16.person_clip = {
  w: 12, h: 26,
  anchor: [0, 26],
  pal: crewPal({ C:'#f4f1ea', c:'#9aa0ac' }),
  rows: [
    "....kkkk....",
    "..kHHHHhhk..",
    ".kHHHHHhhhk.",
    "kHHhhhhhhhhk",
    "..kffffffk..",
    "..kFFFFFfk..",
    "..kekFekfk..",
    "..kFFFFFfk..",
    "..kFFffFfk..",
    "...kFFFfk...",
    "....kffk....",
    ".kSSSSSSssk.",
    "kSsVVVVVVssk",
    "kCCkCCkSsssk",
    "kCcccCkVsssk",
    "kCCCCCkSssGk",
    "kCcccCkSssgk",
    "kGgCCkPPpskk",
    ".kkkkkpPppk.",
    ".kPPpkPppk..",
    ".kPPpkPppk..",
    ".kPppkpppk..",
    ".kbBBkbBBk..",
    "kbBBBkbBBBk.",
    "kBBBBkBBBBk.",
    ".kkkkkkkkk..",
  ],
};

// Same figure in a suit jacket (S/s = jacket) over a white shirt front with a red tie (Andy).
SPR16.person_tie = {
  w: 12, h: 26,
  anchor: [0, 26],
  pal: crewPal({ C:'#f4f1ea', T:'#c00020' }),
  rows: [
    "....kkkk....",
    "..kHHHHhhk..",
    ".kHHHHHhhhk.",
    "kHHhhhhhhhhk",
    "..kffffffk..",
    "..kFFFFFfk..",
    "..kekFekfk..",
    "..kFFFFFfk..",
    "..kFFffFfk..",
    "...kFFFfk...",
    "....kffk....",
    ".kSSSCCSssk.",
    "kSsSCTCssssk",
    "kSsSCTCSsssk",
    "kSsSsTsSsssk",
    "kGsSSTSSssGk",
    "kgsSSsSSssgk",
    ".kkPPPPPpkk.",
    ".kPPPPpPppk.",
    ".kPPpkPppk..",
    ".kPPpkPppk..",
    ".kPppkpppk..",
    ".kbBBkbBBk..",
    "kbBBBkbBBBk.",
    "kBBBBkBBBBk.",
    ".kkkkkkkkk..",
  ],
};

// Same figure with the right arm (viewer's right) raised, gloved hand open.
SPR16.person_wave = {
  w: 12, h: 26,
  anchor: [0, 26],
  pal: crewPal(),
  rows: [
    "....kkkk....",
    "..kHHHHhhk..",
    ".kHHHHHhhhk.",
    "kHHhhhhhhhhk",
    "..kffffffkkk",
    "..kFFFFFfkGk",
    "..kekFekfkgk",
    "..kFFFFFfkSk",
    "..kFFffFfkSk",
    "...kFFFfkkSk",
    "....kffk.kSk",
    ".kSSSSSSssSk",
    "kSsVVVVVVsk.",
    "kSsSSSSSssk.",
    "kSsVVVVVVsk.",
    "kGsSSSSSssk.",
    "kgsSSSSSssk.",
    ".kkPPPPPpk..",
    ".kPPPPpPppk.",
    ".kPPpkPppk..",
    ".kPPpkPppk..",
    ".kPppkpppk..",
    ".kbBBkbBBk..",
    "kbBBBkbBBBk.",
    "kBBBBkBBBBk.",
    ".kkkkkkkkk..",
  ],
};
