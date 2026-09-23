// scenes/Paper16.js — 16-bit site-office trailer interior for Harsh's ATP-package mini-game (Selkirk Trail v16).
// Plain script, no modules, no fetch. Defines window.renderMGPaper16(m, t).
//
// The caller (drawMGPaper) sets PX = 4 (320 x 186 logical), runs the update logic, calls this function where the
// old 160 x 93 (PX = 8) drawing code was, restores PX and then draws the HUD line, the document text (canvas y 296,
// i.e. logical y 74 on the sheet) and the flash text itself. Every old coordinate is doubled here.
//
// Composition (logical units, 320 x 186):
//   0..116   wall: vinyl panelling (grooves every 32), chair rail y 54..58, window sprite (10,12), hardhat_rack,
//            plywood shelf y 34..38 x 110..294 with binder_stack / binder_a / binder_b / radio on it, wall calendar,
//            whiteboard (220..304, 46..84) with an 'ATP NOON' note (per-frame txt), SHRED / OUT (TO MEL) signs.
//   116..128 desk front edge (old y 58..64 doubled): top edge y 116 so the caller's text lines up.
//   128..186 floor: planks, under-desk shadow, filing_cabinet on the right, dropped paper_sheets on the left.
//   Desk items (base 116): shredder x 6, in_tray x 30 stacked twice, Harsh (person_clip, white hat, purple shirt)
//   standing behind the desk at x 76..88, desk_lamp x 222, monitor x 238, coffee_mug x 264, out_tray x 276.
//   Document: 112 x 58 sheet at (104 + 2*m.doc.x, 56) with a right/bottom offset shadow and a 96 x 4 life bar
//   (green > 40 %, red below). The flying document (m.fly, m.flyDir) is the same sheet fading out toward the
//   shredder (dir -1) or the out tray (dir +1), 140 logical px of travel, lifting 20 px.
//   (SPR16.paper_sheet is 28 x 16; at 1:1 it would be a quarter of the old document, so the desk document is drawn
//   procedurally in the sprite's palette/design at the old footprint. The 28 x 16 sprite is used for the loose
//   sheets on the floor.)
//
// State read (never written): m.phase ('intro'|'play'|'over'), m.doc (null or {x, life, real, text}), m.docLife,
// m.fly, m.flyDir, m.flash (only to blink the shredder LED). Every read is guarded.
// Static layers are baked once per PX into offscreen canvases (background, desk layer, sheet); per frame:
// 2 drawImages, 1 crew blit, the document, the flying sheet, 3 txt labels.
(function () {
  'use strict';
  const W = typeof window !== 'undefined' ? window : globalThis;
  const cache = new Map();

  // ---------- palette (master palette; own colours marked *) ----------
  const K = {
    ink: '#141018',
    wall: '#3b3f47', wallHi: '#464a53', wallGroove: '#2e3238', wallDeep: '#2b2e34',        // * old trailer greys
    rail: '#5e3812', railHi: '#8f5a26', railSh: '#3f2408',                                  // dirt tones as stained wood
    floor: '#5a4632', floorHi: '#6a5240', floorSeam: '#4a3826', floorDark: '#3a2a18',      // * old floor browns
    deskHi: '#9a7448', desk: '#7a5a3a', deskSh: '#3a2a18',                                  // * old desk browns
    ply: '#c69a5c', plyBase: '#a8804a', plySeam: '#8a6537',                                 // formwork ply (+ * base)
    steelHi: '#c8ccd2', steel: '#7c8289', steelSh: '#4a4f56',
    grey: ['#dcdcdc', '#c4c4c4', '#9a9a9a', '#6f6f6f', '#4a4a4a'],
    paper: '#eef2f8', paperB: '#d0d4dc', paperS: '#9aa0ac', paperD: '#6f6f6f', paperE: '#4a4a4a',
    yelHi: '#ffe466', yel: '#f2c400', yelSh: '#c99d00',
    red: '#b3001b', redHi: '#e0334a', redSh: '#6e0010',
    green: '#1d7a1d', greenHi: '#3a9a2a', greenSh: '#166316',
    blue: '#2255ff', blueSh: '#1233b0',
    shadow: '#2a2a30',                                                                       // * old sheet shadow
  };
  const DESK_Y = 116;                 // desk top edge (old 58 doubled)
  const DESK_LAYER_Y = 88;            // top of the baked desk layer (tallest desk prop, the shredder, reaches y 92)
  const DOC_X0 = 104, DOC_Y = 56;     // document rest position (old 52, 28 doubled)
  const DOC_W = 112, DOC_H = 58;      // sheet body; shadow adds 2 right / 2 down (old 56 x 30 doubled)
  const HARSH_PAL = { H: '#ffffff', h: '#d0d4dc', S: '#6a3fbf', s: '#4a2a8a', V: '#6a3fbf', P: '#3552a0', p: '#2f478c' };

  // ---------- helpers ----------
  function makeCanvas(w, h) {
    try {
      if (typeof document === 'undefined' || !document.createElement) return null;
      const c = document.createElement('canvas'); if (!c || !c.getContext) return null;
      c.width = w; c.height = h; return c.getContext('2d') ? c : null;
    } catch (e) { return null; }
  }
  // bake a w x h logical layer once per (key, PX). draw(ox, oy) must draw everything offset by (ox, oy) so the same
  // function can draw straight to the screen when no offscreen canvas exists. Returns the canvas or null.
  function baked(key, w, h, draw) {
    const k = key + '@' + PX;
    let c = cache.get(k);
    if (c === undefined) {
      c = makeCanvas(w * PX, h * PX);
      if (!c) { cache.set(k, null); return null; }
      const o = ctx; ctx = c.getContext('2d');
      try { draw(0, 0); } finally { ctx = o; }
      cache.set(k, c);
    }
    return c;
  }
  function layer(key, x, y, w, h, draw) {
    const c = baked(key, w, h, draw);
    if (c) ctx.drawImage(c, x * PX, y * PX); else draw(x, y);
  }
  function dither(x, y, w, h, c, phase) { // 50 % checkerboard
    for (let yy = 0; yy < h; yy++) for (let xx = ((yy + (phase || 0)) & 1); xx < w; xx += 2) P(x + xx, y + yy, 1, 1, c);
  }
  function box3(x, y, w, h, hi, base, sh) { // lit top-left, shaded bottom-right
    P(x, y, w, h, base); P(x, y, w, 1, hi); P(x, y, 1, h, hi); P(x, y + h - 1, w, 1, sh); P(x + w - 1, y, 1, h, sh);
  }

  // ---------- background: wall + floor + wall props (baked once) ----------
  function drawBackground(ox, oy) {
    // wall panelling
    P(ox, oy, 320, DESK_Y, K.wall);
    for (let x = 0; x < 320; x += 32) { P(ox + x, oy, 2, DESK_Y, K.wallGroove); P(ox + x + 2, oy, 1, DESK_Y, K.wallHi); }
    P(ox, oy, 320, 2, K.wallDeep);                                        // ceiling shadow line
    // chair rail
    P(ox, oy + 54, 320, 4, K.rail); P(ox, oy + 54, 320, 1, K.railHi); P(ox, oy + 57, 320, 1, K.railSh); P(ox, oy + 58, 320, 1, K.wallDeep);
    // window (sprite anchor is top-left) with a sill under it
    blit16('window', ox + 10, oy + 12);
    P(ox + 8, oy + 48, 60, 3, K.grey[1]); P(ox + 8, oy + 48, 60, 1, K.grey[0]); P(ox + 8, oy + 50, 60, 1, K.grey[3]); P(ox + 8, oy + 51, 60, 1, K.wallDeep);
    // hard hats on the wall
    blit16('hardhat_rack', ox + 74, oy + 34);
    // shelf: plywood board with steel brackets and a shadow line on the wall under it
    P(ox + 110, oy + 38, 184, 2, K.wallDeep);
    P(ox + 110, oy + 34, 184, 4, K.plyBase); P(ox + 110, oy + 34, 184, 1, K.ply); P(ox + 110, oy + 37, 184, 1, K.plySeam);
    for (const bx of [116, 200, 284]) { P(ox + bx, oy + 38, 2, 8, K.steel); P(ox + bx, oy + 38, 1, 8, K.steelHi); P(ox + bx, oy + 45, 2, 1, K.steelSh); P(ox + bx + 2, oy + 38, 6, 2, K.steel); P(ox + bx + 2, oy + 39, 6, 1, K.steelSh); }
    // shelf contents (base = shelf top, y 34)
    blit16('binder_stack', ox + 112, oy + 34);
    blit16('binder_a', ox + 140, oy + 34); blit16('binder_b', ox + 142, oy + 29);
    blit16('radio', ox + 166, oy + 34);
    blit16('binder_stack', ox + 184, oy + 34);
    blit16('binder_b', ox + 212, oy + 34); blit16('binder_a', ox + 214, oy + 29);
    blit16('binder_stack', ox + 238, oy + 34);
    blit16('binder_a', ox + 266, oy + 34);
    // wall calendar (above the document's rest position)
    box3(ox + 150, oy + 40, 26, 14, K.paper, K.paper, K.paperS);
    P(ox + 150, oy + 40, 26, 3, K.red); P(ox + 150, oy + 40, 26, 1, K.redHi);
    for (let r = 0; r < 3; r++) for (let c = 0; c < 6; c++) P(ox + 153 + c * 4, oy + 45 + r * 3, 2, 1, K.paperS);
    P(ox + 165, oy + 48, 2, 1, K.red); P(ox + 166, oy + 49, 2, 1, K.red); P(ox + 165, oy + 50, 2, 1, K.red); P(ox + 167, oy + 48, 1, 1, K.red); P(ox + 165, oy + 51, 1, 1, K.red); // the X
    P(ox + 149, oy + 39, 28, 1, K.grey[3]); P(ox + 162, oy + 38, 2, 2, K.steel);   // hanger
    // whiteboard with grid and marker scribbles, marker tray below
    P(ox + 220, oy + 46, 84, 38, K.grey[2]); P(ox + 220, oy + 46, 84, 1, K.grey[0]); P(ox + 220, oy + 46, 1, 38, K.grey[0]);
    P(ox + 220, oy + 83, 84, 1, K.grey[3]); P(ox + 303, oy + 46, 1, 38, K.grey[3]);
    P(ox + 222, oy + 48, 80, 34, K.paper);
    for (let x = 238; x < 302; x += 16) P(ox + x, oy + 48, 1, 34, K.paperB);
    for (let y = 58; y < 82; y += 10) P(ox + 222, oy + y, 80, 1, K.paperB);
    P(ox + 224, oy + 50, 12, 2, K.blue); P(ox + 240, oy + 50, 8, 2, K.blue); P(ox + 224, oy + 60, 26, 2, K.green); P(ox + 256, oy + 60, 12, 2, K.blue);
    P(ox + 224, oy + 70, 18, 2, K.blue); P(ox + 256, oy + 70, 30, 2, K.paperS); P(ox + 240, oy + 76, 40, 2, K.paperS);
    P(ox + 266, oy + 50, 34, 1, K.red); P(ox + 266, oy + 57, 34, 1, K.red); P(ox + 266, oy + 50, 1, 8, K.red); P(ox + 299, oy + 50, 1, 8, K.red); // red box (ATP NOON txt goes inside per frame)
    P(ox + 222, oy + 84, 80, 3, K.steel); P(ox + 222, oy + 84, 80, 1, K.steelHi); P(ox + 222, oy + 86, 80, 1, K.steelSh);
    P(ox + 226, oy + 83, 6, 2, K.red); P(ox + 234, oy + 83, 6, 2, K.blue); P(ox + 242, oy + 83, 6, 2, K.green);      // markers
    // floor
    P(ox, oy + 128, 320, 58, K.floor);
    for (let x = 0; x < 320; x += 16) { P(ox + x, oy + 128, 1, 58, K.floorSeam); P(ox + x + 1, oy + 128, 1, 58, K.floorHi); }
    for (let y = 148; y < 186; y += 20) for (let x = ((y / 20) | 0) % 2 ? 0 : 16; x < 320; x += 32) { P(ox + x, oy + y, 16, 1, K.floorSeam); }
    dither(ox, oy + 128, 320, 6, K.floorDark, 0);                        // shadow under the desk
    P(ox, oy + 128, 320, 1, K.floorDark);
    // floor props
    blit16('filing_cabinet', ox + 290, oy + 176);
    blit16('paper_sheet', ox + 18, oy + 166); blit16('paper_sheet', ox + 34, oy + 176);
    blit16('binder_b', ox + 60, oy + 182);
  }

  // ---------- desk layer: front edge + everything standing on it (baked once, rows 88..186, transparent above the desk) ----------
  function drawDeskLayer(ox, oy) {
    const y = oy - DESK_LAYER_Y;                                          // layer starts at DESK_LAYER_Y
    P(ox, y + DESK_Y, 320, 8, K.desk); P(ox, y + DESK_Y, 320, 2, K.deskHi); P(ox, y + DESK_Y + 7, 320, 1, K.deskSh); P(ox, y + DESK_Y + 8, 320, 4, K.deskSh);
    for (let x = 0; x < 320; x += 80) P(ox + x, y + DESK_Y + 2, 1, 6, K.deskSh);   // desk sections
    blit16('shredder', ox + 6, y + DESK_Y);
    blit16('in_tray', ox + 30, y + DESK_Y); blit16('in_tray', ox + 30, y + DESK_Y - 8);
    blit16('desk_lamp', ox + 222, y + DESK_Y);
    blit16('monitor', ox + 238, y + DESK_Y);
    blit16('coffee_mug', ox + 264, y + DESK_Y);
    blit16('out_tray', ox + 276, y + DESK_Y);
  }

  // ---------- the document: 112 x 58 sheet in paper_sheet's palette, offset shadow, header, ruled lines ----------
  function drawSheet(ox, oy) {
    P(ox + 2, oy + 2, DOC_W, DOC_H, K.shadow);
    P(ox + 1, oy, DOC_W - 2, 1, K.ink); P(ox + 1, oy + DOC_H - 1, DOC_W - 2, 1, K.ink); P(ox, oy + 1, 1, DOC_H - 2, K.ink); P(ox + DOC_W - 1, oy + 1, 1, DOC_H - 2, K.ink);
    P(ox + 1, oy + 1, DOC_W - 2, DOC_H - 2, K.paper);
    for (let r = 28; r < DOC_H - 1; r++) { const bs = Math.max(14, 108 - Math.floor((r - 28) * 2.6)); P(ox + bs, oy + r, DOC_W - 1 - bs, 1, K.paperB); }
    P(ox + 4, oy + DOC_H - 2, DOC_W - 5, 1, K.paperS); P(ox + DOC_W - 2, oy + 42, 1, DOC_H - 43, K.paperS);
    // header: yellow logo block + dark title bar + sub line
    P(ox + 6, oy + 4, 6, 6, K.yel); P(ox + 6, oy + 4, 6, 1, K.yelHi); P(ox + 6, oy + 4, 1, 6, K.yelHi); P(ox + 6, oy + 9, 6, 1, K.yelSh); P(ox + 11, oy + 4, 1, 6, K.yelSh);
    P(ox + 15, oy + 5, 48, 3, K.paperE); P(ox + 15, oy + 9, 26, 1, K.paperD);
    // life-bar track (fill drawn per frame at oy + 11 .. 15, x 8 .. 104)
    P(ox + 8, oy + 11, 96, 4, K.paperB); P(ox + 8, oy + 14, 96, 1, K.paperS);
    // ruled lines (old 5 lines at 36 + 4i, widths 48 - (7i % 20), doubled)
    for (let i = 0; i < 5; i++) P(ox + 8, oy + 16 + i * 8, 96 - 2 * ((i * 7) % 20), 1, K.paperS);
  }
  function sheetAt(x, y) { layer('sheet', x, y, DOC_W + 2, DOC_H + 2, drawSheet); }

  // ---------- main ----------
  W.renderMGPaper16 = function (m, t) {
    m = m || {}; t = t || 0;
    // 1. wall + floor + wall props
    layer('paper_bg', 0, 0, 320, 186, drawBackground);
    // 2. Harsh behind the desk (flipped to face the document); boots hidden by the desk edge
    blit16('person_clip', 88, DESK_Y + 6, { pal: HARSH_PAL, flip: true });
    // 3. desk edge + desk props
    layer('paper_desk', 0, DESK_LAYER_Y, 320, 186 - DESK_LAYER_Y, drawDeskLayer);
    // shredder LED blinks while a shred/submit result flashes; monitor cursor blinks slowly
    if (m.flash > 0 && (Math.floor(t * 8) & 1)) P(19, DESK_Y - 18, 1, 1, K.yelHi);
    if (Math.floor(t * 2) & 1) P(246, DESK_Y - 14, 2, 1, K.greenSh);
    // 4. the current document (the caller writes its text at canvas y 296 = logical 74)
    const d = m.doc;
    if (d) {
      const dx = DOC_X0 + 2 * (d.x || 0);
      sheetAt(dx, DOC_Y);
      const dl = m.docLife > 0 ? m.docLife : 1;
      const frac = Math.max(0, Math.min(1, (d.life || 0) / dl));
      const w = Math.round(96 * frac);
      if (w > 0) {
        const ok = frac > 0.4;
        P(dx + 8, DOC_Y + 11, w, 4, ok ? K.green : K.red);
        P(dx + 8, DOC_Y + 11, w, 1, ok ? K.greenHi : K.redHi);
        P(dx + 8, DOC_Y + 14, w, 1, ok ? K.greenSh : K.redSh);
      }
    }
    // 5. flying document: fades toward the shredder (-1) or the out tray (+1)
    if (m.fly > 0) {
      const f = Math.max(0, Math.min(1, 1 - m.fly / 0.35));
      const dir = m.flyDir < 0 ? -1 : 1;
      const fx = DOC_X0 + dir * f * 140, fy = DOC_Y - f * 20;
      ctx.save(); ctx.globalAlpha = Math.max(0, 1 - f);
      sheetAt(Math.round(fx), Math.round(fy));
      ctx.restore();
    }
    // 6. in-scene labels (canvas coordinates)
    txt('SHRED', 15 * PX, 84 * PX, 20, K.redHi, 'center');
    txt('OUT (TO MEL)', 292 * PX, 99 * PX, 18, '#ffffff', 'center');
    txt('ATP NOON', 283 * PX, 51 * PX, 16, K.red, 'center');
  };
  W.renderMGPaper16.clearCache = function () { cache.clear(); };
})();
