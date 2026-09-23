// v16/sprites/nature.js — trees, bush, rocks, stump, birds, clouds, moon, bear.
// Plain script, no modules. Light from top-left. '.' = transparent.
// Custom colours in this file (max 6): m #e9f2fb cloud mid-shade, d #a8a588 moon crater/rim deep, L #fffbe8 moon crater lit rim.
var SPR16 = window.SPR16 = window.SPR16 || {};

// ---- trees: spruce, tiered, hi on the top-left of each tier, deep + ink on the shade (right) side only ----
var TREE_PAL = { H:'#3f9a3a', B:'#2a7a2a', M:'#1f5f22', S:'#0f4d14', D:'#083a0e', t:'#5a4020', T:'#3a2a10', k:'#141018' };

SPR16.tree_a = {
  w: 14, h: 24,
  anchor: [0, 24],
  pal: TREE_PAL,
  rows: [
    "......H.......",
    ".....HBk......",
    ".....HBSk.....",
    "....HBMSk.....",
    "....HBMSDk....",
    "...HBBMSDk....",
    "..HHBBMSSDk...",
    ".HHBBMMSSDDk..",
    "....HBMSDk....",
    "...HBBMSSDk...",
    "...HBBMMSDk...",
    "..HHBBMMSSDk..",
    ".HHBBBMMSSDDk.",
    "...HBBMMSDk...",
    "..HHBBMMSSDk..",
    "..HBBBMMSSDDk.",
    ".HHBBBMMMSSDk.",
    "HHBBBMMMSSDDDk",
    ".....tTT......",
    ".....tTT......",
    ".....tTT......",
    ".....tTTk.....",
    ".....tTTk.....",
    "....DtTTkD....",
  ],
};

SPR16.tree_b = {
  w: 12, h: 20,
  anchor: [0, 20],
  pal: TREE_PAL,
  rows: [
    ".....H......",
    "....HBk.....",
    "....HBSk....",
    "...HBMSk....",
    "...HBMSDk...",
    "..HBBMSSDk..",
    ".HHBBMSSDDk.",
    "...HBMSDk...",
    "...HBBMSDk..",
    "..HHBBMSSDk.",
    ".HHBBMMSSDDk",
    "...HBBMSDk..",
    "..HHBBMSSDk.",
    ".HHBBMMSSDDk",
    "HHBBBMMSSDDk",
    "....tTT.....",
    "....tTT.....",
    "....tTTk....",
    "....tTTk....",
    "...DtTTkD...",
  ],
};

SPR16.tree_c = {
  w: 16, h: 28,
  anchor: [0, 28],
  pal: TREE_PAL,
  rows: [
    ".......H........",
    "......HBk.......",
    "......HBSk......",
    ".....HBMSk......",
    ".....HBMSDk.....",
    "....HBBMSDk.....",
    "....HBBMSSDk....",
    "...HHBBMSSDDk...",
    ".....HBMSDk.....",
    "....HBBMSSDk....",
    "....HBBMMSDk....",
    "...HHBBMMSSDk...",
    "..HHBBBMMSSDDk..",
    "....HBBMMSDk....",
    "...HHBBMMSSDk...",
    "...HBBBMMSSDDk..",
    "..HHBBBMMMSSDk..",
    ".HHBBBBMMSSDDDk.",
    "...HHBBMMSSDk...",
    "..HHBBBMMSSDDk..",
    "..HBBBBMMMSSDDk.",
    ".HHBBBBMMMSSDDk.",
    "HHBBBBMMMMSSDDDk",
    "......tTT.......",
    "......tTT.......",
    "......tTTk......",
    "......tTTk......",
    ".....DtTTkD.....",
  ],
};

// ---- bush: rounded mound, outline on the shade side ----
SPR16.bush = {
  w: 12, h: 8,
  anchor: [0, 8],
  pal: { H:'#3f9a3a', B:'#2a7a2a', M:'#1f5f22', S:'#0f4d14', D:'#083a0e', k:'#141018' },
  rows: [
    "....HHB.....",
    "..HHBBBMk...",
    ".HBBBMMSSk..",
    "HHBBBMMSSDk.",
    "HBBBMMMSSDDk",
    "HBBMMMSSSDDk",
    ".BMMMSSSDDk.",
    "..DDSSDDDk..",
  ],
};

// ---- boulders: grey concrete/rock ramp, ink underside + partial outline on the right ----
var ROCK_PAL = { H:'#dcdcdc', B:'#c4c4c4', S:'#9a9a9a', D:'#6f6f6f', E:'#4a4a4a', k:'#141018' };

SPR16.rock_a = {
  w: 14, h: 8,
  anchor: [0, 8],
  pal: ROCK_PAL,
  rows: [
    ".....HHHB.....",
    "...HHHBBBBS...",
    "..HHBBBBBSSk..",
    ".HHBBBBBSSDDk.",
    ".HBBBBSSSDDEk.",
    "HBBBBSSSDDDEEk",
    "HBBSSSSDDDEEEk",
    ".kkkkkkkkkkkk.",
  ],
};

SPR16.rock_b = {
  w: 20, h: 10,
  anchor: [0, 10],
  pal: ROCK_PAL,
  rows: [
    "........HHHBB.......",
    ".....HHHHBBBBBS.....",
    "...HHHBBBBBBBSSSk...",
    "..HHBBBBBBBBSSSDDk..",
    ".HHBBBBBBBSSSSDDDk..",
    ".HBBBBBBSSSSSDDDEEk.",
    "HBBBBBBSSSSSDDDDEEEk",
    "HBBBBSSSSSDDDDDEEEEk",
    "HBBSSSSSDDDDDDEEEEEk",
    ".kkkkkkkkkkkkkkkkkk.",
  ],
};

// ---- stump: cut face in gravel tones with a ring, bark below ----
SPR16.stump = {
  w: 8, h: 6,
  anchor: [0, 6],
  pal: { c:'#d2c7ac', g:'#b9ab8d', r:'#8f836a', t:'#5a4020', T:'#3a2a10', D:'#083a0e', k:'#141018' },
  rows: [
    "..cccc..",
    ".ccrrcgT",
    "tTTTTTTk",
    "tTTTTDTk",
    "tTTTTDTk",
    ".kkkkkk.",
  ],
};

// ---- birds: two wing frames, ink only ----
SPR16.bird_0 = {
  w: 6, h: 3,
  anchor: [0, 3],
  pal: { k:'#141018' },
  rows: [
    "k....k",
    ".k..k.",
    "..kk..",
  ],
};

SPR16.bird_1 = {
  w: 6, h: 3,
  anchor: [0, 3],
  pal: { k:'#141018' },
  rows: [
    "......",
    "kk..kk",
    "..kk..",
  ],
};

// ---- clouds: puffy tops, cloudSh bottom row with a mid tone above it, top-left anchored ----
var CLOUD_PAL = { C:'#f7fbff', m:'#e9f2fb', S:'#d6e6f5' };

SPR16.cloud_a = {
  w: 48, h: 14,
  anchor: [0, 0],
  pal: CLOUD_PAL,
  rows: [
    "................CCCCCC..........................",
    "..............CCCCCCCCCC........................",
    ".............CCCCCCCCCCCC.CCCCCCCC..............",
    "............CCCCCCCCCCCCCmCCCCCCCCC.............",
    "......CCCCCCCCCCCCCCCCCCCCCCCCCCCCCC............",
    "....CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC.....",
    "...CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC...",
    "..CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC..",
    "..CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC..",
    ".CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC.",
    "SCmmCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCmCS",
    ".SSSmmCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCmCCCCCCmmSS.",
    "....SSmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmSmmmmmmSS...",
    "......SSSSSSSSSSSSSSSSSSSSSSSSSSSSSS.SSSSSS.....",
  ],
};

SPR16.cloud_b = {
  w: 32, h: 10,
  anchor: [0, 0],
  pal: CLOUD_PAL,
  rows: [
    ".............CCCCCCC............",
    "...........CCCCCCCCCCC..........",
    "..........CCCCCCCCCCCCC.........",
    "....CCCCCCCCCCCCCCCCCCCCCCCCC...",
    "...CCCCCCCCCCCCCCCCCCCCCCCCCCCC.",
    "..CCCCCCCCCCCCCCCCCCCCCCCCCCCCC.",
    ".CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC",
    "SSmmCCCCCCCCCCCCCCCCCCCCCCCCCmmS",
    "..SSmmmmmmmmmmmmmmmmmmmmmmmmmSS.",
    "....SSSSSSSSSSSSSSSSSSSSSSSSS...",
  ],
};

SPR16.cloud_c = {
  w: 64, h: 18,
  anchor: [0, 0],
  pal: CLOUD_PAL,
  rows: [
    "..................CCCCCCCC.....CCCCCCCC.........................",
    "................CCCCCCCCCCCC.CCCCCCCCCCCC...CCCCCC..............",
    "..............CCCCCCCCCCCCCCmCCCCCCCCCCCCCCCCCCCCCCCC...........",
    ".............CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC..........",
    ".............CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC.........",
    "............CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC........",
    "......CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC........",
    "....CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC........",
    "...CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC...",
    "..CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC..",
    ".CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC.",
    ".CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCC.",
    ".CCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCS",
    ".mmCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCm.",
    ".SSmCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCmS.",
    "...SmmCCCCCCCCmmmCCCCCCCCCCCCCCCCCCCCCCCCCCCCCCmmmmmmmmmmmmmmS..",
    "....SSmmmmmmmmSSSmmmmmmmmmmmmmmmmmmmmmmmmmmmmmmSSSSSSSSSSSSSS...",
    "......SSSSSSSS...SSSSSSSSSSSSSSSSSSSSSSSSSSSSSS.................",
  ],
};

// ---- moon: lit from top-left, shaded right rim, four craters (dark top-left wall, lit bottom-right lip) ----
SPR16.moon = {
  w: 24, h: 24,
  anchor: [0, 0],
  pal: { M:'#f3f0d8', S:'#c9c6a8', d:'#a8a588', L:'#fffbe8' },
  rows: [
    "..........MMMM..........",
    ".......MMMMMMMMMM.......",
    ".....MMMMMMMMMMMMMS.....",
    "....MMMMMMMMMMMMMMMS....",
    "...MMMMMMMMMMMMddMMSS...",
    "..MMMMdddMMMMMdSSLMMSd..",
    "..MMMddSSLMMMMMLLMMMSd..",
    ".MMMMdSSSLMMMMMMMMMMMSd.",
    ".MMMMdSSLLMMMMMMMMMMMSd.",
    ".MMMMMLLLMMMMMMMMMMMMSd.",
    "MMMMMMMMMMMMMMMMMMMMMSSd",
    "MMMMMMMMMMMMMMMMMMMMMSSd",
    "MMMMMMMMMMMMMMMMMMMMMSSd",
    "MMMMMMMddddSMMMddSMMSSSd",
    ".MMMMMMdSSSLMMMdSLMMSSd.",
    ".MMMMMMdSSSLMMMSLLMMSSd.",
    ".MMMMMMdSSSLMMMMMMMSSSd.",
    "..MMMMMSLLLLMMMMMMSSSd..",
    "..MMMMMMMMMMMMMMMMSSSd..",
    "...MMMMMMMMMMMMMSSSSd...",
    "....MMMMMMMMMMMSSSSd....",
    ".....SMMMMMMSSSSSSd.....",
    ".......SSSSSSSSSd.......",
    "..........SSSS..........",
  ],
};

// ---- bear: grizzly on all fours, side-on, FACING LEFT (head at x=0; use opts.flip to face right).
// dirt browns from the master palette; ear, eye highlight, shoulder hump, claws, ink ground shadow.
SPR16.bear = {
  w: 28, h: 18,
  anchor: [0, 18],
  pal: { A:'#a06a30', B:'#8f5a26', C:'#7a4a1c', D:'#5e3812', E:'#3f2408', c:'#d0d4dc', W:'#ffffff', k:'#141018' },
  rows: [
    "..........kkkkk.............",
    "........kkAAAAAkk...........",
    ".......kAAABBBBBBkkkkkkk....",
    "..kkk.kABBBBBBBBBBCCCCCCk...",
    ".kAAAkkABBBBBBBBBCCCCCCCCk..",
    "kABBBBBBBBBBBBBCCCCCCCCCDk..",
    "kBWkBBBBBBBBBBBCCCCCCCCDDDk.",
    "kkBBBBBBBBBBCCCCCCCCCCDDDDk.",
    "kDBBBBBBBBBBCCCCCCCCCDDDDDk.",
    ".kBBBDBBBBBBCCCCCCCCDDDDDDk.",
    "..kBBBDCCCCCCCCCCCCDDDDEEDk.",
    "...kkCCCCCCCCCCCDDDDDDEEEk..",
    ".....kCCCCCDkDDDkDDDDDEEEk..",
    ".....kCCCCDk.kDkkDDDEEDEk...",
    "......kCCDk..kDk.kDEk.kEk...",
    "......kCCDk..kDk.kDEk.kEk...",
    ".....ccCDDk.ccDk.ccEEk.ccEk.",
    "....kkkkkkkkkkkkkkkkkkkk....",
  ],
};
