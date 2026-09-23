// v16/sprites/crane.js — crawler crane group (main scene crane + pick mini-game rigging). Plain script, no modules.
// crane_base faces RIGHT: counterweight on the LEFT, cab with glass on the RIGHT, boom foot pedestal at the top-right
// of the house (pin at sprite col 47, row 13). The lattice boom is NOT drawn here; the renderer draws it with
// craneBoom16() from the boom foot. The live mast / gantry apex sits at about (54,2) for the pendant lines.
// Row 51 (h-1) is the 1px ink ground shadow, ~70% of the width. Anchor [0,52] = bottom-left on the ground line.
// Tones: Y/y/s/d CAT yellow hi/base/shade/deep; S/t/T steel hi/base/shade; H/p/q track-shoe greys; h hub; r rubber;
// G/g/b glass hi/base/shade + W specular; m/M mud spatter (dirt light / dirt shade); A amber beacon, l lamp, o beacon shade;
// R/w red-white hazard patch on the counterweight; k ink.
var SPR16 = window.SPR16 = window.SPR16 || {};

SPR16.crane_base = {
  w: 64, h: 52,
  anchor: [0, 52],
  pal: {
    Y:'#ffe466', y:'#f2c400', s:'#c99d00', d:'#8a6a00',
    S:'#c8ccd2', t:'#7c8289', T:'#4a4f56',
    H:'#9a9a9a', p:'#6f6f6f', q:'#4a4a4a', h:'#555555', r:'#1a1c1e',
    G:'#d8f0ff', g:'#9fd8ff', b:'#5a9ad0', W:'#ffffff',
    m:'#8f5a26', M:'#5e3812',
    A:'#ffb000', l:'#fff2a8', o:'#b85400',
    R:'#b3001b', w:'#d0d4dc',
    k:'#141018',
  },
  rows: [
    "....................................................kkkk........",
    "...................................................kYyTsk.......",
    "...................................................kyySsk.......",
    "...................................................ykkkk........",
    ".....................kkk.........................yyyd...........",
    "....................kStSk.......................ydyd............",
    "....................ktTTk.....................yydyd.............",
    "....................ktTTk...................yyddyd..............",
    "....................ktTTk..................ydd.yd...............",
    "....................ktTTk................yydkkkkkk..............",
    "....................ktTTk..............yyddkYYYYYYsk............",
    "....................ktTTk..tttttttttttydd.kyyyyyyysk............",
    "....................ktTTk..t...t...t..dt..kyyytddysk............",
    ".............kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkyyydSdysk............",
    ".............kYYYYYYYYYYYYYYYYYYYYYYYYYYYYYyyydddysk....kk......",
    ".............kyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyysk...klAk.....",
    ".............kyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyysk...koAk.....",
    ".............kyyysssssssssssssyyyyyyyyyyyyysssssssskkkkkkkkkk...",
    ".............kyyysdddddddddddsyyyyyyyyyyyyyyyyyyyyyYYYYYYYYYYk..",
    ".............kyyysYYYYYYYYYYYsyyyyyyyyyyyyyyyyyyyyysGGGGGGGGsk..",
    "..kkkkkkkkkkkkyyysdddddddddddsyyyssssssyyyyyyyyyyyysGWGggggbskkk",
    ".kYYYYYYYYYYYYyyysYYYYYYYYYYYsyyysGgggsyyyyyyyyyyyysGggggggbskTS",
    ".kYyyyyyyyyyysyyysdddddddddddsyyysggggsyyddddddyyyysGggggggbskkk",
    ".kYyyyyyyyyyysyyysYYYYYYYYYYYsyyysgggbsyysYYYYsyyyyssssssssssk..",
    ".kYyyyyyyyyyysyyysdddddddddddsyyysyyyysyyssssssyyyysGggggggbsk..",
    ".kddddddddddddyyysYYYYYYYYYYYsyyysyyyysyyyyyyyyyyyysGggggggbsk..",
    ".kYYYYYYYYYYYYyyysdddddddddddsyyysyyyysyyyyyyyyyyyysbbbbbbbbsk..",
    ".kYyyyyyyyyyysyyysssssssssssssyyysyyySsyyyyyyyyyyyysbbbbbbbbsk..",
    ".kYyRRwwRRwwysyyyyyyyyyyyyyyyyyyysyyyysyyyyyyyyyyyyyyyyyyyyysk..",
    ".kYywwRRwwRRysyyyyyyyyyyyyyyyyyyysyyyysyyyyyyyyyyyyyyyyyyyyysk..",
    ".kddddddddddddyyyyyyyyyyyyyyyyyyysyyyysyyyyyyyyyyyyyyyyyyyyysk..",
    ".kYYYYYYYYYYYYyyyyyyyyyyyyyyyyyyysyyyysyyyyyyyyyyyyyyyyyyyyysk..",
    ".kYyyyyyyyyyysssssssssssssssssssssdsssssssssssssssyyyyyyyyyysk..",
    ".kYmyyyyyyyyysddmddddddddddddddddddMddddddddddddddsssssssmsssk..",
    ".kddMddddmddddttttttttttttttttttttttttttttttttttttkkkkkkkkkkk...",
    "..kkkkkkkkkkkkTSTTTSTTTSTTTSTTTSTTTSTTTSTTTSTTTSTTk.............",
    "...........ksssssssssssmsssssssssssssssssssssssssssk............",
    "...........kdddMddddddddddddddddddddddddMddddddddddk............",
    "....kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk....",
    "...kHHHpHHHpHHHpHHHpHHHpHHHpHHHpHHHpHHHpHHHpHHmpHHHpHHHpHHHpk...",
    "..kqpppqppMqpppqpppqpppqpppqpppqpppmpppqpppqpppqpppqpppqpppqqk..",
    "..kYYYTYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYk..",
    "..kyyhhhyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyhhhyyk..",
    "..kyhthhMyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyhShhqyk..",
    "..kThhShqmyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyhhShqyk..",
    "..kyhhhqqyyyyShhyyyyyyShhyyyyyyShhyyyyyyShhyyyyyyShhyyyhhhqqyk..",
    "..kssqqqssssmhShssssMshShssssMshShssssmshShsMsssshShsmssqqqssk..",
    "..kssssssssssMTTsssmssTTTsssmssTTTsssmssTTTssssmsTTTsssMsssssk..",
    "..kqppqqppqqppqqppqqppqqppqqppqqppqqppqqppqmppqqppqqppqqppqqqk..",
    "...kqqMrqqqrqqqrqqqrqqqrqmqrqqqrqqqrqqqrqqqrqqqrqqqrqqqrqqqrk...",
    "....kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk....",
    ".........kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk..........",
  ],
};

// Yellow hook block hanging from the cable: sheave housing (cheek plates with a steel sheave), swivel and a steel hook.
// Anchor [6,0] = top-centre; the cable ends at (x, base).
SPR16.hook_block = {
  w: 12, h: 12,
  anchor: [6, 0],
  pal: { Y:'#ffe466', y:'#f2c400', s:'#c99d00', d:'#8a6a00', S:'#c8ccd2', t:'#7c8289', T:'#4a4f56', h:'#555555', k:'#141018' },
  rows: [
    "....kkkk....",
    "...kYYyyk...",
    "..kYyhhyysk.",
    "..kYhStTysk.",
    "..kyhTTtssk.",
    "..kyshhsssk.",
    "...kksssdk..",
    ".....kSTk...",
    ".....kStk...",
    "..kk.kSTk...",
    ".kStkkSTk...",
    "..kSSSTk....",
  ],
};

// Steel plate girder segment, 72x12, drawn in the girder rust-primer tones (top flange hi, web, bottom flange shade),
// with two welded lifting lugs on the top flange (holes for the slings) and bolted web stiffeners. Anchor [0,0] = top-left.
SPR16.girder_seg = {
  w: 72, h: 12,
  anchor: [0, 0],
  pal: { E:'#e07a48', C:'#c85a2c', B:'#8b3a1c', D:'#4d1e0c', S:'#c8ccd2', t:'#7c8289', T:'#4a4f56', k:'#141018' },
  rows: [
    "..........kkk..............................................kkk..........",
    ".........kSTtk............................................kSTtk.........",
    ".........kSttk............................................kSttk.........",
    "kEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEk",
    "kCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCk",
    "kDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDk",
    "kBCDBBBBBBBBBBBBBBBBCDBBBBBBBBBBBBBBBBCDBBBBBBBBBBBBBBBBCDBBBBBBBBBBCDBk",
    "kBSDBBBBBBBBBBBBBBBBSDBBBBBBBBBBBBBBBBSDBBBBBBBBBBBBBBBBSDBBBBBBBBBBSDBk",
    "kBCDBBBBBBBBBBBBBBBBCDBBBBBBBBBBBBBBBBCDBBBBBBBBBBBBBBBBCDBBBBBBBBBBCDBk",
    "kBSDBBBBBBBBBBBBBBBBSDBBBBBBBBBBBBBBBBSDBBBBBBBBBBBBBBBBSDBBBBBBBBBBSDBk",
    "kDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDDk",
    "kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk",
  ],
};

// Steel spreader bar, 32x4: three lifting eyes on top (centre eye takes the hook, outer eyes take the pendants),
// hi / base / shade bands and two shackle lugs on the underside for the slings. Anchor [0,0] = top-left.
SPR16.spreader_bar = {
  w: 32, h: 4,
  anchor: [0, 0],
  pal: { S:'#c8ccd2', t:'#7c8289', T:'#4a4f56', k:'#141018' },
  rows: [
    "...kSk........kSSk........kSk...",
    "kSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSk",
    "kttttttttttttttttttttttttttttttk",
    "kTTkkTTTTTTTTTTTTTTTTTTTTTTkkTTk",
  ],
};
