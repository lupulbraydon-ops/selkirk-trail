// scenes/Blast16.js — Tanya's "blast the rock cut" mini-game, 16-bit version (320x186 logical at PX=4).
// Plain script, no modules. Defines window.renderMGBlast16(m, t): draws the WHOLE scene area 0..320 x 0..186.
// The caller sets PX=4, runs the update logic, calls this, restores PX and then draws the HUD text itself.
// m = S.mg is read only: phase ('play' | 'count' | 'blast' | 'over'), i (current hole 0..8), ch (charge 0..40 of the
// current hole), charges[i], kind[i] ('good' | 'under' | 'over' | undefined), band[i] = [lo, hi], parts (flyrock
// particles {x, y, s, c} in OLD 160x93 units, drawn doubled), t (phase timer), flash / flashTxt (HUD only).
// Composition (old 160x93 coordinates doubled): sky + mountains from terrain16 ('pick' grid), a forested far slope
// baked once (rows 92..170) with tree sprites, the bench floor (rows 170..186), the rock face x 128..320 y 56..170
// baked once as an intact texture and once as a fresh-cut texture, then per frame only: the 8 holes at
// hx = (70 + i*11)*2 with collar, target band, charge column (orange / red when over) and the current-hole arrow;
// blasted segments (good/over) show the backdrop above y 116 and the cut texture below with a muckpile at the toe;
// light holes (under) stay as pillars with cracks; the drill_rig_head parked at the top of the face, powder_box
// crates (one on the bench beside the hole being loaded, a stack by the pickup), a stack of blasting mats, the
// shot wire down the face to a blasting machine, the barricade with Tanya behind it (person / person_wave for the
// horn), the pickup + porta (tipped on its side after flyrock, rocks on the pickup), flyrock particles, dust, flash.
// Globals used: ctx, PX, P, L, blit16, drawSky16, drawMountains16 (the last three are guarded).
(function () {
  'use strict';
  const W = typeof window !== 'undefined' ? window : globalThis;
  const R = Math.round;
  const cache = new Map();

  // ---------------- palette (master palette from BRIEF.md; own colours marked *) ----------------
  const RK = ['#dcdcdc', '#c4c4c4', '#9a9a9a', '#6f6f6f', '#4a4a4a'];   // rock: hi, light, base, shade, deep
  const K = {
    ink: '#141018', deepSteel: '#2e3238',                                // deepSteel = machines.js custom
    grassHi: '#3a9a2a', grass: '#1d7a1d', grassSh: '#166316', shoulder: '#0f4a12',
    treeHi: '#3f9a3a', tree: '#2a7a2a', treeMid: '#1f5f22', treeSh: '#0f4d14', treeDeep: '#083a0e',
    dirtHi: '#a06a30', dirtLt: '#8f5a26', dirt: '#7a4a1c', dirtSh: '#5e3812', dirtDk: '#3f2408',
    gravHi: '#d2c7ac', grav: '#b9ab8d', gravSh: '#8f836a',
    orHi: '#ffa040', or: '#ff7a00', orSh: '#b85400',
    redHi: '#ff6060', red: '#e0334a', redSh: '#b3001b',                   // * redHi (charge column when over)
    band: '#00ff66', bandSh: '#00b048',                                   // * bandSh (target band edge)
    catHi: '#ffe466', cat: '#f2c400', catSh: '#c99d00',
    steelHi: '#c8ccd2', steel: '#7c8289', steelSh: '#4a4f56',
    tire: '#1a1c1e', rubber: '#3a3e45', hub: '#555555',                   // rubber = machines.js custom
    lamp: '#fff2a8', amber: '#ffb000', white: '#ffffff', whiteSh: '#d0d4dc',
    dust: '#d6d6d6',                                                      // * dust puffs
  };

  // ---------------- layout (old coordinates doubled) ----------------
  const FX0 = 128, FX1 = 320, FTOP = 56, FBOT = 170, CUT_TOP = 116;      // rock face box, cut line for blasted segments
  const HOLE_TOP = 60, HOLE_BOT = 164, GROUND = 170, FRONT = 184;       // hole bore rows; bench floor line; foreground line
  const SEG_W = 22;                                                     // one hole segment: hx-10 .. hx+12
  const HX = (i) => (70 + i * 11) * 2;
  const PICKUP_X = 48, PORTA_X = 16, TANYA_X = 4, BARR_X = 18;
  const TREES = [                                                       // far slope (behind the face too: seen through blasted gaps)
    ['tree_b', 12, 118], ['tree_a', 40, 122], ['tree_c', 78, 126], ['tree_b', 108, 120], ['tree_a', 140, 118],
    ['tree_c', 170, 124], ['tree_b', 206, 118], ['tree_a', 236, 122], ['tree_c', 270, 126], ['tree_b', 300, 120],
    ['tree_c', 2, 160], ['tree_a', 36, 154], ['tree_b', 114, 150],
  ];

  // ---------------- helpers ----------------
  function hash(x, y, s) {
    let n = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul((s | 0) + 1, 1274126177);
    n = Math.imul(n ^ (n >>> 13), 1103515245); n ^= n >>> 16; return (n >>> 0) / 4294967296;
  }
  const BAYER = [0, 2, 3, 1];
  function dith(x, y, level) { return BAYER[((x >> 1) & 1) + 2 * ((y >> 1) & 1)] < level; }
  function makeCanvas(w, h) {
    try {
      if (typeof document === 'undefined' || !document.createElement) return null;
      const c = document.createElement('canvas'); if (!c || !c.getContext) return null;
      c.width = w; c.height = h; return c.getContext('2d') ? c : null;
    } catch (e) { return null; }
  }
  // brush bound to a context with a logical origin (x0, y0): a bake only holds the rows/columns it needs
  function brush(g, x0, y0) {
    const s = PX;
    return {
      r(x, y, w, h, c) { g.fillStyle = c; g.fillRect((R(x) - x0) * s, (R(y) - y0) * s, R(w) * s, R(h) * s); },
      px(x, y, c) { g.fillStyle = c; g.fillRect((R(x) - x0) * s, (R(y) - y0) * s, s, s); },
    };
  }
  function ditherRows(b, x0, x1, y0, rows, colB) {                       // ordered dither from the colour above into colB
    const grp = rows / 3;
    for (let y = y0; y < y0 + rows; y++) { const lv = Math.min(3, Math.floor((y - y0) / grp) + 1); for (let x = x0; x < x1; x++) if (dith(x, y, lv)) b.px(x, y, colB); }
  }
  // bake a region once per key (+PX) into an offscreen canvas; returns null when no canvas is available (node)
  function baked(key, x0, y0, w, h, paint) {
    const k = key + '|' + PX;
    let c = cache.get(k);
    if (c === undefined) {
      c = makeCanvas(w * PX, h * PX);
      if (c) paint(brush(c.getContext('2d'), x0, y0));
      cache.set(k, c || null);
    }
    return c;
  }
  const blit = (name, x, base, opts) => { if (typeof blit16 === 'function') blit16(name, x, base, opts); };

  // =====================================================================================
  // backdrop: far grass bank, forested slope with a dithered canopy gradient, bench floor. Rows 92..186.
  // =====================================================================================
  function paintBackdrop(b) {
    b.r(0, 92, 320, 8, K.grass); b.r(0, 92, 320, 1, K.grassHi);
    for (let x = 0; x < 320; x++) if (dith(x, 93, 2)) b.px(x, 93, K.grassHi);
    for (let x = 0; x < 320; x++) {                                     // canopy top per column, then mid -> shade -> deep
      const top = 99 + R(3 * Math.sin(x * 0.21) + 2 * Math.sin(x * 0.53 + 1) + hash(x, 0, 11) * 2);
      b.r(x, top, 1, GROUND - top, K.treeMid);
      if (hash(x, 1, 11) < 0.55) b.px(x, top, K.tree);
      if (hash(x, 2, 11) < 0.2) b.px(x, top - 1, K.treeHi);
    }
    ditherRows(b, 0, 320, 118, 6, K.treeSh); b.r(0, 124, 320, 20, K.treeSh);
    ditherRows(b, 0, 320, 144, 6, K.treeDeep); b.r(0, 150, 320, GROUND - 150, K.treeDeep);
    for (let i = 0; i < 70; i++) {                                      // crown highlights scattered through the canopy
      const cx = Math.floor(hash(i, 3, 12) * 318), cy = 104 + Math.floor(hash(i, 4, 12) * 44);
      const col = cy < 120 ? K.tree : cy < 146 ? K.treeMid : K.treeSh;
      b.r(cx, cy, 2 + (i % 2), 1, col); b.px(cx + 1, cy - 1, col);
    }
    // bench floor: lit lip, dirt with gravel, shade toward the front, two broken ruts where the pickup drove in
    b.r(0, GROUND, 320, 186 - GROUND, K.dirt); b.r(0, GROUND, 320, 1, K.dirtHi);
    ditherRows(b, 0, 320, 179, 6, K.dirtSh); b.r(0, 185, 320, 1, K.dirtSh);
    for (let y = GROUND + 1; y < 186; y++) for (let x = 0; x < 320; x++) {
      const h = hash(x, y, 13);
      if (h < 0.04) { b.px(x, y, K.grav); b.px(x + 1, y, K.gravSh); }
      else if (h < 0.06) b.px(x, y, K.gravHi); else if (h < 0.1) b.px(x, y, K.dirtLt); else if (h < 0.13) b.px(x, y, K.dirtDk);
    }
    for (const ry of [175, 179]) for (let x = 20; x < 126; x++) { if (hash(x, ry, 14) < 0.18) continue; const yy = ry + (hash(x >> 3, ry, 15) < 0.4 ? 1 : 0); b.px(x, yy, K.dirtSh); if (hash(x, ry, 16) > 0.4) b.px(x, yy + 1, K.dirtDk); }
    b.r(FX0, GROUND, FX1 - FX0, 2, K.dirtSh);                            // shadow of the face on the bench floor
    for (let x = FX0; x < FX1; x++) if (dith(x, GROUND + 2, 2)) b.px(x, GROUND + 2, K.dirtSh);
  }

  // =====================================================================================
  // rock face texture (intact), x 128..320, y 56..170: hi/base/shade ramp down the face, a lit lip and lit left
  // edge, darker toward the right end, bedding joints (wavy, broken, lit lip under), vertical fractures, chips,
  // and a dark toe. paintFace paints only columns xa..xb so the no-canvas fallback can paint per segment.
  // =====================================================================================
  function toneIdx(y) { return y < 96 ? 1 : y < 140 ? 2 : y < 164 ? 3 : 4; }
  function paintFace(b, xa, xb) {
    b.r(xa, FTOP, xb - xa, 96 - FTOP, RK[1]);
    b.r(xa, 96, xb - xa, 44, RK[2]);
    b.r(xa, 140, xb - xa, 24, RK[3]);
    b.r(xa, 164, xb - xa, 6, RK[4]);
    ditherRows(b, xa, xb, 90, 6, RK[2]); ditherRows(b, xa, xb, 134, 6, RK[3]); ditherRows(b, xa, xb, 161, 3, RK[4]);
    b.r(xa, FTOP, xb - xa, 2, RK[0]);                                    // lit lip at the bench top
    for (let x = xa; x < xb; x++) if (dith(x, FTOP + 2, 2)) b.px(x, FTOP + 2, RK[0]);
    for (let y = FTOP; y < 164; y++) for (let x = Math.max(xa, 248); x < xb; x++) if (dith(x, y, x < 284 ? 1 : 2)) b.px(x, y, RK[Math.min(4, toneIdx(y) + 1)]); // right end away from the light
    for (let y0 = 72; y0 < 164; y0 += 16) {                              // bedding joints
      for (let x = xa; x < xb; x++) {
        const yy = y0 + R(1.5 * Math.sin(x * 0.3 + y0));
        if (hash(x >> 2, y0, 52) > 0.3) { b.px(x, yy, RK[Math.min(4, toneIdx(yy) + 1)]); if (hash(x >> 3, y0, 54) > 0.5) b.px(x, yy + 1, RK[Math.max(0, toneIdx(yy) - 1)]); }
      }
    }
    for (let x = xa; x < xb; x++) if (hash(x, 0, 57) < 0.07) {           // vertical fractures
      const st = 60 + Math.floor(hash(x, 1, 57) * 92), len = 4 + Math.floor(hash(x, 2, 57) * 8);
      b.r(x, st, 1, len, RK[Math.min(4, toneIdx(st) + 1)]); b.px(x + 1, st, RK[Math.max(0, toneIdx(st) - 1)]);
    }
    for (let y = FTOP + 3; y < 162; y++) for (let x = xa; x < xb; x++) if (hash(x, y, 58) < 0.022) { // chips: lit top, shade under
      b.r(x, y, 2, 1, RK[Math.max(0, toneIdx(y) - 1)]); b.r(x, y + 1, 2, 1, RK[Math.min(4, toneIdx(y) + 1)]);
    }
    if (xa <= FX0) { b.r(FX0, FTOP, 2, 108, RK[0]); b.r(FX0, 164, 2, 6, RK[3]); }   // lit left edge
    if (xb >= FX1) b.r(FX1 - 2, FTOP + 2, 2, 168 - FTOP, RK[Math.min(4, 3)]);       // shade right edge
    b.r(xa, 168, xb - xa, 2, RK[4]);                                     // dark toe
  }
  // fresh-cut texture, rows 116..170 (what is left of a segment once it has been shot)
  function paintCut(b, xa, xb) {
    b.r(xa, CUT_TOP, xb - xa, FBOT - CUT_TOP, RK[3]);
    b.r(xa, CUT_TOP, xb - xa, 1, RK[1]); b.r(xa, CUT_TOP + 1, xb - xa, 1, RK[2]);
    for (let y = CUT_TOP + 2; y < 164; y++) for (let x = xa; x < xb; x++) {
      const h = hash(x, y, 59);
      if (h < 0.05) b.px(x, y, RK[2]); else if (h < 0.075) b.px(x, y, RK[1]); else if (h < 0.11) b.px(x, y, RK[4]);
    }
    for (const y0 of [136, 152]) for (let x = xa; x < xb; x++) if (hash(x >> 2, y0, 52) > 0.45) b.px(x, y0 + R(Math.sin(x * 0.3 + y0)), RK[4]);
    ditherRows(b, xa, xb, 161, 3, RK[4]); b.r(xa, 164, xb - xa, 6, RK[4]);
  }
  // draw columns xa..xb of a bake (or paint straight through when no canvas exists)
  function slice(c, x0, y0, xa, xb, ya, yb, paint) {
    if (xb <= xa) return;
    if (c) ctx.drawImage(c, (xa - x0) * PX, (ya - y0) * PX, (xb - xa) * PX, (yb - ya) * PX, xa * PX, ya * PX, (xb - xa) * PX, (yb - ya) * PX);
    else paint(brush(ctx, 0, 0), xa, xb);
  }

  // =====================================================================================
  // small procedural things
  // =====================================================================================
  function muckpile(cx, base, ph, w, seed) {                            // heaped broken rock: parabolic mound, lit crest, shade right, fines
    const hw = w / 2, x0 = R(cx - hw);
    for (let x = x0; x < x0 + w; x += 2) {
      const u = (x + 1 - cx) / hw, h = R(ph * Math.max(0, 1 - u * u) + (hash(x, seed | 0, 66) - 0.5) * 2);
      if (h < 1) continue;
      P(x, base - h, 2, h, RK[2]);
      P(x, base - h, 2, 1, u < 0.35 ? RK[1] : RK[2]);                    // crest catches the light on the left/top
      if (u > 0.3) P(x + 1, base - h + 1, 1, h - 1, RK[3]);                // right flank in shade
      if (h > 3 && hash(x, seed | 0, 67) < 0.35) { const cy = base - 1 - Math.floor(hash(x, seed | 0, 68) * (h - 2)); P(x, cy, 2, 1, hash(x, seed | 0, 69) < 0.3 ? K.dirtSh : RK[1]); P(x, cy + 1, 2, 1, RK[3]); }
    }
    ctx.save(); ctx.globalAlpha = 0.3; P(x0 + 1, base, w - 2, 1, '#000'); ctx.restore();
  }
  function crack(x, y, len) {                                           // jagged vertical crack: ink with a lit lip on the right
    const seg = R(len / 3);
    for (let s = 0; s < 3; s++) { const sx = x + (s % 2), sy = y + s * seg; P(sx, sy, 1, seg, K.ink); P(sx + 1, sy, 1, seg, RK[4]); }
  }
  function rockChunk(x, y, s) { P(x, y, s, s, RK[2]); P(x, y, 1, 1, RK[1]); P(x + s - 1, y + s - 1, 1, 1, RK[3]); }
  function matStack(x, base) {                                          // three blasting mats (tyre mats) lying flat
    for (let i = 0; i < 3; i++) {
      const y = base - 2 - i * 2, mx = x + (i % 2);
      P(mx, y, 40, 2, K.tire); P(mx, y, 40, 1, K.rubber); P(mx + 39, y, 1, 2, K.ink);
      for (let tx = mx + 2; tx < mx + 38; tx += 5) P(tx, y, 1, 1, K.hub);
    }
    P(x + 1, base - 7, 2, 1, K.steelHi); P(x + 3, base - 7, 1, 1, K.steel);   // lifting ring
    P(x, base - 1, 40, 1, K.ink);
  }
  function blastingMachine(x, base) {
    P(x, base - 6, 7, 5, K.or); P(x, base - 6, 7, 1, K.orHi); P(x, base - 6, 1, 5, K.orHi); P(x + 6, base - 6, 1, 5, K.orSh);
    P(x + 3, base - 10, 1, 4, K.steel); P(x + 2, base - 10, 3, 1, K.steelHi); P(x + 4, base - 4, 1, 1, K.ink);
    P(x, base - 1, 7, 1, K.ink);
  }
  function shotWire(shot) {                                             // lead line: along the lip, down the face edge, across the floor
    if (!shot) { L(HX(0) - 1, FTOP + 1.5, FX0 + 2.5, FTOP + 1.5, K.catSh, 0.5); L(FX0 + 2.5, FTOP + 1.5, FX0 + 2.5, GROUND - 0.5, K.catSh, 0.5); }
    L(FX0 + 2.5, GROUND - 0.5, 47.5, FRONT - 6, K.catSh, 0.5);
  }

  // =====================================================================================
  // renderMGBlast16(m, t)
  // =====================================================================================
  W.renderMGBlast16 = function (m, t) {
    m = m || {}; t = +t || 0;
    const phase = m.phase || 'play', kind = m.kind || [], band = m.band || [], charges = m.charges || [], parts = m.parts || [];
    const cur = m.i | 0, mt = +m.t || 0;
    const blasted = phase === 'blast' || phase === 'over';
    const gone = (i) => blasted && (kind[i] === 'good' || kind[i] === 'over');   // segment shot away above the cut line
    let over = 0; for (let i = 0; i < 8; i++) if (kind[i] === 'over') over++;
    const wrecked = blasted && over > 0 && mt > 1.2;
    const blink = Math.floor(t * 4) % 2 === 0;

    // ---- backdrop: sky, mountains, far slope + bench floor (baked), trees ----
    if (typeof drawSky16 === 'function') drawSky16(false, t, 'pick');
    if (typeof drawMountains16 === 'function') drawMountains16(false, 'pick');
    const bg = baked('blast16|bg', 0, 92, 320, 94, paintBackdrop);
    if (bg) ctx.drawImage(bg, 0, 92 * PX); else paintBackdrop(brush(ctx, 0, 0));
    for (const [key, x, base] of TREES) blit(key, x, base);

    // ---- rock face: intact runs from the face bake, shot segments from the cut bake ----
    const faceC = baked('blast16|face', FX0, FTOP, FX1 - FX0, FBOT - FTOP, (b) => paintFace(b, FX0, FX1));
    const cutC = baked('blast16|cut', FX0, CUT_TOP, FX1 - FX0, FBOT - CUT_TOP, (b) => paintCut(b, FX0, FX1));
    let runStart = FX0;
    for (let i = 0; i < 8; i++) {
      if (!gone(i)) continue;
      const xa = HX(i) - 10, xb = xa + SEG_W;
      if (i === 0) slice(cutC, FX0, CUT_TOP, FX0, xa, CUT_TOP, FBOT, paintCut);   // the 2px left margin goes with the first segment
      else slice(faceC, FX0, FTOP, runStart, xa, FTOP, FBOT, paintFace);          // intact run up to this segment
      slice(cutC, FX0, CUT_TOP, xa, xb, CUT_TOP, FBOT, paintCut);
      if (i === 0 || !gone(i - 1)) P(xa, CUT_TOP, 2, FBOT - CUT_TOP, RK[2]);            // lit return face on the left
      if (i === 7 || !gone(i + 1)) P(xb - 2, CUT_TOP + 1, 2, FBOT - CUT_TOP - 1, RK[4]);  // shade return face on the right
      runStart = xb;
    }
    slice(faceC, FX0, FTOP, runStart, FX1, FTOP, FBOT, paintFace);

    // ---- holes ----
    for (let i = 0; i < 8; i++) {
      if (gone(i)) continue;
      const hx = HX(i), k = kind[i];
      if (blasted && k === 'under') {                                   // pillar left standing between shot segments
        if (i > 0 && gone(i - 1)) P(hx - 10, FTOP, 2, FBOT - FTOP - 2, RK[0]);
        if (i < 7 && gone(i + 1)) P(hx + 10, FTOP + 2, 2, FBOT - FTOP - 4, RK[4]);
      }
      P(hx, HOLE_TOP, 1, HOLE_BOT - HOLE_TOP, K.ink); P(hx + 1, HOLE_TOP, 1, HOLE_BOT - HOLE_TOP, K.deepSteel);   // bore
      P(hx - 2, HOLE_TOP - 2, 6, 2, RK[4]); P(hx - 2, HOLE_TOP - 2, 6, 1, RK[3]);                              // collar
      const bd = band[i] || [18, 26], lo = bd[0], hi = bd[1];
      P(hx + 4, HOLE_BOT - 2 * hi, 1, 2 * (hi - lo), K.band); P(hx + 5, HOLE_BOT - 2 * hi, 1, 2 * (hi - lo), K.bandSh);   // target band
      const ch = i < cur ? (+charges[i] || 0) : (i === cur && phase === 'play' ? (+m.ch || 0) : 0);
      if (ch > 0) {                                                     // powder column: orange, red when over
        const h = 2 * ch, y = HOLE_BOT - h, red = k === 'over';
        P(hx - 2, y, 6, h, red ? K.red : K.or); P(hx - 2, y, 1, h, red ? K.redHi : K.orHi);
        P(hx - 2, y, 6, 1, red ? K.redHi : K.orHi); P(hx + 3, y, 1, h, red ? K.redSh : K.orSh);
      }
      if (blasted && k === 'under') { crack(hx - 6, 120, 44); crack(hx + 4, 100, 64); }
      if (i === cur && phase === 'play') {                              // current-hole arrow, bobbing
        const bob = Math.sin(t * 6) > 0 ? 1 : 0, ay = 44 + bob;
        P(hx - 4, ay, 10, 4, K.cat); P(hx - 2, ay + 4, 6, 4, K.cat); P(hx, ay + 8, 2, 2, K.cat);
        P(hx - 4, ay, 10, 1, K.catHi); P(hx - 4, ay + 1, 1, 3, K.catHi); P(hx + 5, ay + 1, 1, 3, K.catSh); P(hx + 3, ay + 5, 1, 3, K.catSh);
      }
    }
    shotWire(blasted);
    if (phase === 'play' && cur < 8) {                                  // the case being loaded, beside the current hole
      const hx = HX(cur); blit('powder_box', cur === 0 ? hx + 7 : hx - 19, FTOP);
    }
    blit('drill_rig_head', FX1, FTOP, { flip: true });                  // parked at the end of the bench (flip: x is the right edge)

    // ---- muckpiles at the toe (after the holes so they overlap pillars and neighbours) ----
    for (let i = 0; i < 8; i++) {
      if (!blasted || !kind[i]) continue;
      const hx = HX(i);
      if (gone(i)) muckpile(hx + 1, FBOT, kind[i] === 'over' ? 18 : 28, 28, i);
      else if (kind[i] === 'under') muckpile(hx + 1, FBOT, 10, 20, i);
    }

    // ---- the road side: porta, pickup, powder stock, mats, blasting machine, barricade, Tanya ----
    if (wrecked) {                                                      // porta blown onto its side, roof toward the barricade
      ctx.save(); ctx.translate(2 * PX, GROUND * PX); ctx.rotate(-Math.PI / 2); blit('porta', 0, 40); ctx.restore();
      ctx.save(); ctx.globalAlpha = 0.3; P(3, GROUND, 38, 1, '#000'); ctx.restore();
    } else blit('porta', PORTA_X, GROUND);
    blit('pickup', PICKUP_X, GROUND, (phase === 'count' || phase === 'blast') && blink ? { pal: { A: K.lamp } } : undefined);
    if (wrecked) {
      for (let j = 0; j < over * 3; j++) {                              // rocks on the box, the roof and the hood
        const rx = 50 + ((j * 7) % 56), s = 3 + (j % 2);
        const ry = rx < 76 ? 150 - s : rx < 100 ? 143 - s : 151 - s;
        rockChunk(rx, ry, s);
      }
      for (let j = 0; j < 14; j++) P(50 + ((j * 11) % 60), 152 + ((j * 5) % 14), 1, 1, RK[2]);   // dust on the panels
      if (over >= 3) { L(84, 146, 92, 150, K.whiteSh, 0.5); L(88, 145, 90, 150, K.whiteSh, 0.5); }   // cracked windshield
    }
    blit('powder_box', 114, GROUND); blit('powder_box', 116, GROUND - 9);
    matStack(60, FRONT);
    blastingMachine(44, FRONT);
    blit('barricade', BARR_X, FRONT);
    blit(phase === 'count' ? 'person_wave' : 'person', TANYA_X + 12, FRONT, { flip: true, pal: { H: K.white, h: K.whiteSh, S: K.or, s: K.orSh, V: K.white } });
    if (phase === 'count') {                                            // the horn
      for (let r = 0; r < 3; r++) if ((Math.floor(t * 6) + r) % 3 !== 0) P(TANYA_X + 13 + r * 3, FRONT - 30 - r * 2, 1, 4 + r * 4, K.catHi);
    }
    blit('rock_a', 150, 180); blit('rock_b', 238, 182);

    // ---- flyrock, dust, fireballs, flash ----
    for (const p of parts) {
      const s = (p.s | 0) * 2 || 2;
      P(p.x * 2, p.y * 2, s, s, p.c || RK[2]);
      if (s > 2) P(p.x * 2 + s - 1, p.y * 2 + s - 1, 1, 1, RK[3]);
    }
    if (phase === 'blast' && mt < 0.9) {
      ctx.save(); ctx.globalAlpha = 0.55 * (1 - mt / 0.9);
      for (let i = 0; i < 8; i++) {
        if (!gone(i)) continue;
        const hx = HX(i), big = kind[i] === 'over' ? 1.5 : 1, rise = mt * 50;
        for (let k = 0; k < 3; k++) {
          const w = R((10 + k * 4) * big), h = R(8 * big), px = hx + 1 - w / 2 + R(4 * Math.sin(t * 3 + i + k)), py = CUT_TOP - rise - k * 7 - h, col = k === 1 ? RK[1] : K.dust;
          P(px + R(w / 4), py, R(w / 2), h, col); P(px, py + R(h / 4), w, R(h / 2), col);
        }
      }
      ctx.restore();
      if (mt < 0.25) for (let i = 0; i < 8; i++) if (kind[i] === 'over') {
        const hx = HX(i), s = R(12 * (1 - mt / 0.25));
        if (s > 1) { P(hx + 1 - s / 2, FTOP - s, s, s, K.orHi); P(hx + 1 - s / 4, FTOP - s + R(s / 4), R(s / 2), R(s / 2), K.catHi); }
      }
      if (mt < 0.12) { ctx.save(); ctx.globalAlpha = 0.7 * (0.12 - mt) / 0.12; P(0, 0, 320, 186, K.lamp); ctx.restore(); }
    }
  };
  W.renderMGBlast16.clearCache = () => cache.clear();

  // ---------------- node self-check: `node scenes/Blast16.js` ----------------
  if (typeof require === 'function' && typeof module !== 'undefined' && require.main === module) {
    const g = globalThis; let fills = 0, imgs = 0, blits = 0;
    g.ctx = new Proxy({}, { get: (o, k) => k === 'fillRect' ? () => { fills++; } : k === 'drawImage' ? () => { imgs++; } : () => {}, set: () => true });
    g.PX = 4;
    g.P = (x, y, w, h, c) => { if (typeof c !== 'string') throw new Error('bad colour ' + c); ctx.fillRect(); };
    g.L = () => { ctx.stroke(); };
    g.blit16 = () => { blits++; }; g.txt = () => {}; g.SPR16 = {};
    g.drawSky16 = () => {}; g.drawMountains16 = () => {};
    const mk = (phase, i, kinds, t) => ({ phase, i, ch: 17.3, dir: 1, speed: 26, charges: [20, 30, 12, 24, 26, 15, 33, 22].slice(0, i), kind: kinds.slice(0, i),
      band: Array.from({ length: 8 }, (_, j) => [16 + j, 24 + j]), parts: phase === 'blast' || phase === 'over' ? Array.from({ length: 60 }, (_, j) => ({ x: 70 + j, y: 40 + (j % 40), vx: -20, vy: -10, c: j % 2 ? '#9a9a9a' : '#c4c4c4', s: j % 3 ? 1 : 2 })) : [], flash: 0.3, flashTxt: 'GOOD', t });
    const kinds = ['good', 'over', 'under', 'good', 'over', 'good', 'under', 'over'];
    const cases = [mk('play', 0, kinds, 0), mk('play', 3, kinds, 1.2), mk('play', 7, kinds, 2), mk('count', 8, kinds, 0.5), mk('count', 8, kinds, 1.5),
      mk('blast', 8, kinds, 0.05), mk('blast', 8, kinds, 0.5), mk('blast', 8, kinds, 2), mk('over', 8, kinds, 3), mk('over', 8, ['good', 'good', 'good', 'good', 'good', 'good', 'good', 'good'], 3),
      mk('over', 8, ['under', 'under', 'under', 'under', 'under', 'under', 'under', 'under'], 3), { phase: 'play' }, {}];
    for (const m of cases) for (const t of [0, 0.37, 12.5]) renderMGBlast16(m, t);
    const f0 = fills, i0 = imgs, b0 = blits; renderMGBlast16(cases[8], 5);
    console.log('no-canvas path: ' + cases.length * 3 + ' frames OK; one settled frame = ' + (fills - f0) + ' fillRect, ' + (imgs - i0) + ' drawImage, ' + (blits - b0) + ' blits');
    g.document = { createElement: () => ({ width: 0, height: 0, getContext: () => g.ctx }) }; cache.clear();
    for (const m of cases) for (const t of [0, 0.37]) renderMGBlast16(m, t);
    const f1 = fills, i1 = imgs, b1 = blits; renderMGBlast16(cases[0], 5);
    console.log('canvas path: bakes cached ' + cache.size + '; one play frame = ' + (fills - f1) + ' fillRect, ' + (imgs - i1) + ' drawImage, ' + (blits - b1) + ' blits');
    console.log('Blast16 self-check OK');
  }
})();
