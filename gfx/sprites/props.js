// v16/sprites/props.js — site-office trailer props: monitor, binders, shredder, trays, filing cabinet,
// coffee mug, window, desk lamp, paper sheet, radio, hard-hat rack, survey lath, toad.
// Plain script, no modules. Light from top-left. '.' = transparent. Ink k = #141018 on outer silhouettes only.
// Anchors are bottom-left ([0,h]) except window, which is top-left ([0,0]).
// Standing props and flat sheets/trays carry a 1px ink ground-shadow row (row h-1, ~70% width);
// the wall-mounted hardhat_rack does not.
// Custom colours in this file (6): #efe8d2 / #d8cfb0 / #a89e80 CRT beige hi/base/shade, #eef2f8 paper white,
// #ff5fa8 flagging pink, #a02818 mug red-brown.
var SPR16 = window.SPR16 = window.SPR16 || {};

// CRT-style beige monitor on a stand; screen shows a spreadsheet grid (header row/column h, cells W, gridlines g) with a yellow highlighted row; green power LED; specular X top-left of the sheet.
SPR16.monitor = {
  w: 24, h: 20,
  anchor: [0, 20],
  pal: { k:'#141018', A:'#efe8d2', B:'#d8cfb0', C:'#a89e80', W:'#eef2f8', g:'#9aa0ac', h:'#c4c4c4', Y:'#f2c400', z:'#c99d00', L:'#3f9a3a', X:'#ffffff' },
  rows: [
    ".kkkkkkkkkkkkkkkkkkkkkk.",
    "kAAAAAAAAAAAAAAAAAAAAACk",
    "kAhhhghhhghhhghhhghhhgCk",
    "kAggggggggggggggggggggCk",
    "kAhgXWWgWWWgWWWgWWWgWWCk",
    "kAggggggggggggggggggggCk",
    "kAhgWWWgWWWgWWWgWWWgWWCk",
    "kAggggggggggggggggggggCk",
    "kAhgYYYzYYYzYYYzYYYzYYCk",
    "kAggggggggggggggggggggCk",
    "kAhgWWWgWWWgWWWgWWWgWWCk",
    "kAggggggggggggggggggggCk",
    "kAhgWWWgWWWgWWWgWWWgWWCk",
    "kABBBBBBBBBBBBBBBBBBBCCk",
    ".kCCCCCCCCCCCCCCCLCCCCk.",
    "........kABBCCk.........",
    "........kABBCCk.........",
    "....kAAAABBBBBBBBCCCk...",
    "....kCCCCCCCCCCCCCCCk...",
    "...kkkkkkkkkkkkkkkkkk...",
  ],
};

// White binder lying flat, spine on the left (with a small spine label), title label on the cover, page edges along the front.
SPR16.binder_a = {
  w: 20, h: 14,
  anchor: [0, 14],
  pal: { k:'#141018', W:'#eef2f8', B:'#d0d4dc', S:'#9aa0ac', D:'#6f6f6f' },
  rows: [
    ".kkkkkkkkkkkkkkkkkk.",
    "kSBDWWWWWWWWWWWWWWBk",
    "kSBDWSSSSSSSWWWWWBBk",
    "kSBDWSWDDDWSWWWWBBBk",
    "kSBDWSWWWWWSWWWBBBBk",
    "kSWDWSWDDWWSWWBBBBBk",
    "kSWDWSSSSSSSWBBBBBBk",
    "kSWDWWWWWWBBBBBBBBSk",
    "kSWDWWWWBBBBBBBBBSSk",
    "kSBDWWBBBBBBBBBSSSSk",
    "kDDDSSSSSSSSSSSSSSSk",
    "kDDDBSBSBSBSBSBSBSDk",
    ".kDDDDDDDDDDDDDDDDk.",
    ".kkkkkkkkkkkkkk.....",
  ],
};

// Blue binder lying flat, same construction as binder_a.
SPR16.binder_b = {
  w: 20, h: 14,
  anchor: [0, 14],
  pal: { k:'#141018', H:'#7aa0ff', M:'#2255ff', N:'#1233b0', E:'#1e2460', W:'#eef2f8', B:'#d0d4dc', S:'#9aa0ac', D:'#6f6f6f' },
  rows: [
    ".kkkkkkkkkkkkkkkkkk.",
    "kNMEHHHHHHHHHHHHHHMk",
    "kNMEHWWWWWWWHHHHHMMk",
    "kNMEHWBDDDBWHHHHMMMk",
    "kNMEHWBBBBBWHHHMMMMk",
    "kNWEHWBDDBBWHHMMMMMk",
    "kNWEHWWWWWWWHMMMMMMk",
    "kNWEHHHHHHMMMMMMMMNk",
    "kNWEHHHHMMMMMMMMMNNk",
    "kNMEHHMMMMMMMMMNNNNk",
    "kEEENNNNNNNNNNNNNNNk",
    "kEEEBSBSBSBSBSBSBSEk",
    ".kEEEEEEEEEEEEEEEEk.",
    ".kkkkkkkkkkkkkk.....",
  ],
};

// Four upright binders (red, blue, yellow, green) on a plywood shelf, spines facing out with white labels and a finger hole.
SPR16.binder_stack = {
  w: 24, h: 28,
  anchor: [0, 28],
  pal: { k:'#141018', R:'#e0334a', r:'#b3001b', x:'#6e0010', H:'#7aa0ff', M:'#2255ff', N:'#1233b0', Y:'#ffe466', y:'#f2c400', z:'#c99d00', G:'#3f9a3a', g:'#2a7a2a', v:'#0f4d14', W:'#eef2f8', D:'#6f6f6f', p:'#c69a5c', q:'#8a6537', n:'#3f2408' },
  rows: [
    "......kkkkk.............",
    ".....kHMMMNk............",
    ".kkkkkHMMMNk...kkkkkkk..",
    "kRrrrxHMMMNk...kGgggvk..",
    "kRrrrxHMMMNkkkkkGgggvk..",
    "kRrrrxHMMMNYyyyzGgggvk..",
    "kRrrrxHMMMNYyyyzGgggvk..",
    "kRWWWxHWWWNYWWWzGWWWvk..",
    "kRWDWxHWDWNYWDWzGWDWvk..",
    "kRWWWxHWWWNYWWWzGWWWvk..",
    "kRWDWxHWDWNYWDWzGWDWvk..",
    "kRrrrxHMMMNYyyyzGgggvk..",
    "kRrrrxHMMMNYyyyzGgggvk..",
    "kRrrrxHMMMNYyyyzGgggvk..",
    "kRrrrxHMMMNYyyyzGgggvk..",
    "kRrrrxHMMMNYyyyzGgggvk..",
    "kRrrrxHMMMNYyyyzGgggvk..",
    "kRrrrxHMMMNYyyyzGgggvk..",
    "kRrrrxHMMMNYyyyzGgggvk..",
    "kRrxrxHMNMNYyzyzGgvgvk..",
    "kRrrrxHMMMNYyyyzGgggvk..",
    "kRrrrxHMMMNYyyyzGgggvk..",
    "kRrrrxHMMMNYyyyzGgggvk..",
    "kxxxxxNNNNNzzzzzvvvvvk..",
    "kppppppppppppppppppppppk",
    "kqqqqqqqqqqqqqqqqqqqqqqk",
    "knnnnnnnnnnnnnnnnnnnnnnk",
    "..kkkkkkkkkkkkkkkkk.....",
  ],
};

// Grey paper shredder: head with a slot (a sheet half-fed), red light, translucent bin window with shreds.
SPR16.shredder = {
  w: 18, h: 24,
  anchor: [0, 24],
  pal: { k:'#141018', A:'#dcdcdc', B:'#c4c4c4', C:'#9a9a9a', D:'#6f6f6f', E:'#4a4a4a', T:'#1a1c1e', W:'#eef2f8', R:'#e0334a' },
  rows: [
    ".....kWWBWk.......",
    ".....kWWBWk.......",
    ".kkkkkWWBWkkkkkkk.",
    "kAAAATWWBWTTTAABCk",
    "kABBBTTTTTTTTBBCCk",
    "kABBBBBBBBBBBBBCCk",
    "kABBBBBBBBBBBRBCCk",
    "kCCCCCCCCCCCCCCCEk",
    ".kEEEEEEEEEEEEEEk.",
    ".kAAAAABBBBBBBCDk.",
    ".kABBBBBBBBBBBCDk.",
    ".kABBBBBBBBBBBCDk.",
    ".kABAAAAAAAAAACDk.",
    ".kABACAAACAAAACDk.",
    ".kABAAACAAAACACDk.",
    ".kABACAAAACAAACDk.",
    ".kABCBCBCBCBCBCDk.",
    ".kABBCBCBCBCBCCDk.",
    ".kABCBCBCBCBCBCDk.",
    ".kABBCBCBCBCBCCDk.",
    ".kABBBBBBBBBBBCDk.",
    ".kACCCCCCCCCCCCDk.",
    "..kEEEEEEEEEEEEk..",
    "...kkkkkkkkkkkk...",
  ],
};

// Wire-mesh out tray with a neat low paper stack.
SPR16.out_tray = {
  w: 32, h: 10,
  anchor: [0, 10],
  pal: { k:'#141018', A:'#c8ccd2', C:'#7c8289', E:'#4a4f56', W:'#eef2f8', B:'#d0d4dc', S:'#9aa0ac' },
  rows: [
    "...kWWWWWWWWWWWWWWWWWWWWWWWBk...",
    "...kBBBBBBBBBBBBBBBBBBBBBBBBk...",
    "...kSSSSSSSSSSSSSSSSSSSSSSSSk...",
    "kAAAAAAAAAAAAAAAAAAAAAAAAAAAAACk",
    "kECCECCECCECCECCECCECCECCECCECCk",
    "kECCECCECCECCECCECCECCECCECCECCk",
    "kCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCk",
    "kECCECCECCECCECCECCECCECCECCECCk",
    "kEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEk",
    "....kkkkkkkkkkkkkkkkkkkkkk......",
  ],
};

// Same wire tray with a taller, messier stack of sheets.
SPR16.in_tray = {
  w: 32, h: 10,
  anchor: [0, 10],
  pal: { k:'#141018', A:'#c8ccd2', C:'#7c8289', E:'#4a4f56', W:'#eef2f8', B:'#d0d4dc', S:'#9aa0ac' },
  rows: [
    "......kWWWWWWWWWWWWWWWWWWWWBk...",
    "....kBBBBBBBBBBBBBBBBBBBBBBBk...",
    "..kWWWWWWWWWWWWWWWWWWWWWWWWWBk..",
    "..kSSSSSSSSSSSSSSSSSSSSSSSSSSk..",
    ".kBBBBBBBBBBBBBBBBBBBBBBBBBBBBk.",
    "kAAAAAAAAAAAAAAAAAAAAAAAAAAAAACk",
    "kECCECCECCECCECCECCECCECCECCECCk",
    "kECCECCECCECCECCECCECCECCECCECCk",
    "kEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEk",
    "....kkkkkkkkkkkkkkkkkkkkkk......",
  ],
};

// Grey two-drawer filing cabinet: recessed drawer fronts, white label holders, dark bar handles with a highlight, plinth.
SPR16.filing_cabinet = {
  w: 20, h: 36,
  anchor: [0, 36],
  pal: { k:'#141018', A:'#dcdcdc', B:'#c4c4c4', C:'#9a9a9a', D:'#6f6f6f', E:'#4a4a4a', W:'#eef2f8' },
  rows: [
    ".kkkkkkkkkkkkkkkkkk.",
    "kAAAAAAAAAAAAAAAAABk",
    "kABBBBBBBBBBBBBBBBCk",
    "kABDDDDDDDDDDDDDDDCk",
    "kABAAAAAAAAAAAAAAACk",
    "kABABBBBBBBBBBBBBCCk",
    "kABABBWWWWWWBBBBBCCk",
    "kABABBWDDDWWBBBBBCCk",
    "kABABBWWWWWWBBBBBCCk",
    "kABABBBBBBBBBBBBBCCk",
    "kABABBBBBBBBBBBBBCCk",
    "kABABBEEEEEEEEBBBCCk",
    "kABABBEAAAAAAEBBBCCk",
    "kABABBEEEEEEEEBBBCCk",
    "kABABBBBBBBBBBBBBCCk",
    "kABABBBBBBBBBBBBBCCk",
    "kABACCCCCCCCCCCCCCCk",
    "kABDDDDDDDDDDDDDDDCk",
    "kABAAAAAAAAAAAAAAACk",
    "kABABBBBBBBBBBBBBCCk",
    "kABABBWWWWWWBBBBBCCk",
    "kABABBWDDDWWBBBBBCCk",
    "kABABBWWWWWWBBBBBCCk",
    "kABABBBBBBBBBBBBBCCk",
    "kABABBBBBBBBBBBBBCCk",
    "kABABBEEEEEEEEBBBCCk",
    "kABABBEAAAAAAEBBBCCk",
    "kABABBEEEEEEEEBBBCCk",
    "kABABBBBBBBBBBBBBCCk",
    "kABABBBBBBBBBBBBBCCk",
    "kABACCCCCCCCCCCCCCCk",
    "kABDDDDDDDDDDDDDDDCk",
    "kACCCCCCCCCCCCCCCCCk",
    "kDDDDDDDDDDDDDDDDDDk",
    ".kEEEEEEEEEEEEEEEEk.",
    "..kkkkkkkkkkkkkk....",
  ],
};

// Red-brown coffee-shop mug with a handle on the right, a cream logo pixel and two steam wisps.
SPR16.coffee_mug = {
  w: 8, h: 8,
  anchor: [0, 8],
  pal: { k:'#141018', R:'#e0334a', M:'#a02818', x:'#6e0010', W:'#eef2f8', S:'#d0d4dc' },
  rows: [
    "..S..S..",
    ".S..S...",
    "kkkkkk..",
    "kRMMxkk.",
    "kRWMxkMk",
    "kRMMxkk.",
    "kxxxxk..",
    ".kkkk...",
  ],
};

// Trailer window, anchor TOP-LEFT: grey frame with a shaded reveal, venetian blind raised halfway (six slats + rails, pull cord on the right), and three ranges of mountains with snow caps and a tree line seen through the lower half of the glass.
SPR16.window = {
  w: 56, h: 36,
  anchor: [0, 0],
  pal: { k:'#141018', A:'#dcdcdc', B:'#c4c4c4', C:'#9a9a9a', D:'#6f6f6f', X:'#ffffff', m:'#4f95e0', l:'#7fb8ec', h:'#b9dcf5', F:'#93aae6', f:'#7b93d9', M:'#5f7fd4', n:'#5372c9', N:'#3d5aa8', o:'#3552a0', s:'#f2f5ff', S:'#dfe6fa', t:'#1f5f22', g:'#2a7a2a' },
  rows: [
    "kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk",
    "kAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABk",
    "kABBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBCCk",
    "kABDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDCCk",
    "kABDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDACCk",
    "kABDAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAACCk",
    "kABDCCCCCCCCCCDCCCCCCCCCCCCCCCCCCCCCCCCCCDCCCCCCCCCCACCk",
    "kABDAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAACCk",
    "kABDCCCCCCCCCCDCCCCCCCCCCCCCCCCCCCCCCCCCCDCCCCCCCCCCACCk",
    "kABDAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAACCk",
    "kABDCCCCCCCCCCDCCCCCCCCCCCCCCCCCCCCCCCCCCDCCCCCCCCCCACCk",
    "kABDAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAACCk",
    "kABDCCCCCCCCCCDCCCCCCCCCCCCCCCCCCCCCCCCCCDCCCCCCCCCCACCk",
    "kABDAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAACCk",
    "kABDCCCCCCCCCCDCCCCCCCCCCCCCCCCCCCCCCCCCCDCCCCCCCCCCACCk",
    "kABDAAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAABAAAAAAAAAAACCk",
    "kABDCCCCCCCCCCDCCCCCCCCCCCCCCCCCCCCCCCCCCDCCCCCCCCCCACCk",
    "kABDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDACCk",
    "kABDXmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmBmmACCk",
    "kABDmmmmmmmmmmmmmmsmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmBmmACCk",
    "kABDmmmmmmmmmmmmmsSfmmmmmmmmmmmmmmmmmmmmmmmmmmmmmBmmACCk",
    "kABDllllllllllllFsSfflllllllllllllllllsllllllllllBllACCk",
    "kABDhhhhhhhhhhhFFFffffhhhhhhhhhhhhhhhsSfhhhhhhhhsBhhACCk",
    "kABDhhhhhhMhhhFFFFfffffhhhhhhhhhhhhhFsSffhhhhhhsSBhhACCk",
    "kABDhhhhhMMnhFFFFFffffffhhhhhhMhhhhFFFffffhhhhFsSBfhACCk",
    "kABDhhhhMMMnnFFFFffffffffhhhhMMnhhFFFFfffffhMFFffBffACCk",
    "kABDFFFMMMMnnnFFFFFFffffffffMMMnnFFFfffffffMMnfNfDffACCk",
    "kABDFFMMMMMnnnnFFFFffffffffMMMMnnnFFffffffMMMnNNofffACCk",
    "kABDMMMMMMnnnnnnnFffffffffMMMMMnnnnffffffMMMnNNNooffACCk",
    "kABDMMMMNMMMMMMMMMMMMMnnnnnnnnnnnnnnnnnnnnnnnNNNNoooACCk",
    "kABDMMNNNooMMMMMMMMMMnnnnnnnnnnnnnnnnnnnnnNNNNNoooooACCk",
    "kABDttgttgtttgttgttgtttgttgttgtttgttgttgtttgttgttgttACCk",
    "kABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACCk",
    "kBCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCk",
    "kCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCk",
    "kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk",
  ],
};

// Dark-grey desk lamp: cone head angled down-left with a lit bulb and a soft beam, straight post with a knob, flat base.
SPR16.desk_lamp = {
  w: 12, h: 14,
  anchor: [0, 14],
  pal: { k:'#141018', C:'#9a9a9a', D:'#6f6f6f', E:'#4a4a4a', L:'#fff2a8', b:'#ffe9a0' },
  rows: [
    "......kkkkk.",
    ".....kCDDDEk",
    "....kCDDDDEk",
    "...kCDDDDEEk",
    "...kkLLLLkkk",
    "...LLL..kEk.",
    "..bbb...kEk.",
    "........kEk.",
    "........kEk.",
    ".......kEEDk",
    "........kEk.",
    ".kCCCCDDDDDk",
    ".kDEEEEEEEEk",
    "..kkkkkkkk..",
  ],
};

// A sheet of paper: small yellow logo and dark title bar in the header, ruled text lines, hi/base/shade diagonal, shadow offset to the right.
SPR16.paper_sheet = {
  w: 28, h: 16,
  anchor: [0, 16],
  pal: { k:'#141018', W:'#eef2f8', B:'#d0d4dc', S:'#9aa0ac', D:'#6f6f6f', E:'#4a4a4a', Y:'#ffe466', y:'#f2c400', z:'#c99d00' },
  rows: [
    ".kkkkkkkkkkkkkkkkkkkkkkkkkk.",
    "kWWWWWWWWWWWWWWWWWWWWWWWWWBk",
    "kWWyYEEEEEEEEEWWWWWWWWWWWWBk",
    "kWWYzWWWWWWWWWWWWWWWWWWWWWBk",
    "kWWWWWWWWWWWWWWWWWWWWWWWWWBk",
    "kWWDDDDDDDDDDDDDDDDDDDDDWWBk",
    "kWWWWWWWWWWWWWWWWWWWWWWWWWBk",
    "kWWDDDDDDDDDDDDDDDDWWWWWWWBk",
    "kWWWWWWWWWWWWWWWWWWWWWWWBBBk",
    "kWWDDDDDDDDDDDDDDDDDDDDDBBBk",
    "kWWWWWWWWWWWWWWWWWWWWWBBBBBk",
    "kWWDDDDDDDDDDDDWWWWWWBBBBBBk",
    "kWWWWWWWWWWWWWWWWWWBBBBBBBBk",
    "kWWWWWWWWWWWWWBBBBBBBBBBBBSk",
    ".kSSSSSSSSSSSSSSSSSSSSSSSSk.",
    "......kkkkkkkkkkkkkkkkkkkk..",
  ],
};

// Site radio: dark grey body, speaker grille on the left, yellow tuning knob, red LED, angled antenna top-right.
SPR16.radio = {
  w: 14, h: 10,
  anchor: [0, 10],
  pal: { k:'#141018', C:'#9a9a9a', D:'#6f6f6f', E:'#4a4a4a', Y:'#ffe466', y:'#f2c400', z:'#c99d00', R:'#e0334a' },
  rows: [
    "............Ck",
    "...........Ck.",
    "..........Ck..",
    ".kkkkkkkkkkkk.",
    "kCCCCCCCDDDDEk",
    "kCEDEDEDDYyDEk",
    "kCDEDEDEDzzDEk",
    "kCEDEDEDDDRDEk",
    "kEEEEEEEEEEEEk",
    ".kkkkkkkkkk...",
  ],
};

// Plywood rail with three steel hooks and three hard hats hanging (white, yellow, orange). Wall-mounted so no ground shadow.
SPR16.hardhat_rack = {
  w: 24, h: 12,
  anchor: [0, 12],
  pal: { k:'#141018', p:'#c69a5c', q:'#8a6537', E:'#4a4f56', W:'#eef2f8', B:'#d0d4dc', S:'#9aa0ac', Y:'#ffe466', y:'#f2c400', z:'#c99d00', O:'#ffa040', o:'#ff7a00', x:'#b85400' },
  rows: [
    "kkkkkkkkkkkkkkkkkkkkkkkk",
    "kppppppppppppppppppppppk",
    "kppppppppppppppppppppppk",
    "kqqqqqqqqqqqqqqqqqqqqqqk",
    "...EE......EE......EE...",
    "...kk......kk......kk...",
    "..kWWBk...kYYyk...kOOok.",
    ".kWWWBSk.kYYYyzk.kOOOoxk",
    ".kWWBBSk.kYYyyzk.kOOooxk",
    ".kWBBBSk.kYyyyzk.kOoooxk",
    "kWBBBSSkkYyyyzzkkOoooxxk",
    ".kkkkkk..kkkkkk..kkkkkk.",
  ],
};

// Survey lath (plywood tones, pencil marks) with pink flagging tied near the top blowing to the right.
SPR16.string_line_stake = {
  w: 6, h: 14,
  anchor: [0, 14],
  pal: { k:'#141018', p:'#c69a5c', q:'#8a6537', n:'#3f2408', P:'#ff5fa8', R:'#e0334a' },
  rows: [
    ".kk...",
    "kpqk..",
    "kpqkP.",
    "kpqPPP",
    "kpqkPR",
    "kpqk.R",
    "kpqk..",
    "knqk..",
    "kpqk..",
    "knqk..",
    "kpqk..",
    "kpqk..",
    ".kk...",
    ".kkk..",
  ],
};

// Small brown toad (dirt tones), two eye highlights, a wart, legs out to the sides.
SPR16.toad = {
  w: 8, h: 6,
  anchor: [0, 6],
  pal: { k:'#141018', H:'#a06a30', L:'#8f5a26', B:'#7a4a1c', S:'#5e3812', e:'#ffffff' },
  rows: [
    "..kkkkk.",
    ".kHeHHek",
    "kHHSBBSk",
    "kHLLBBSk",
    "kSkBBkSk",
    ".kkkkkk.",
  ],
};
