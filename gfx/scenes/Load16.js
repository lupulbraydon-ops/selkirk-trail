// scenes/Load16.js — "Load the rock trucks" mini-game scene for the Selkirk Trail v16 ("16-bit") prototype.
// Plain script, no modules, no fetch. Defines window.renderMGLoad16(m, t): draws the whole 320x186 scene at PX=4
// (the caller sets PX=4 and restores it; it calls this after the update logic ran and before the HUD txt() calls).
// Reads m = S.mg (never mutates it): m.s, m.full, m.truckX, m.loads, m.rocks[{x,y,c,floor}], m.flash, m.flashTxt,
// m.phase, m.leaving, m.arriving. Every old 160x93 coordinate is doubled: LD.pile [9,45] -> [18,90],
// LD.truckBox [80,60] -> [160,120]; bucketPos(s) is re-derived from those (same curve, doubled).
// Layout (new grid): sky/ridge 0..92 (terrain16 'pick' grid), grass lip 92..100, far pit wall 100..152, talus 152..170,
// haul road 170..186. Bench x 0..124, top y 104, presplit face 108..170. Muckpile x 0..53 on the bench top. Excavator
// sprite at x=41 base 104 so its boom-foot pin (sprite 29,10) lands at (70,74); the arm is drawn from that pin
// (LD.pivot doubled would be (70,82); the pin is 8px higher because the sprite fixes it). Truck at m.truckX*2, base 170.
// Static layers are baked once per PX into offscreen canvases (backdrop: grass/wall/talus/road; bench: face + muckpile);
// per frame: sky/mountain drawImage, 6 sprite blits, the arm, bucket, truck heap, rocks, target bar, dust, beacon, exhaust.
// Custom colours (3): far-wall haze greys #b4bcc4 #98a0a8 #7c848c. Everything else is the master palette.
// Self-check: `node --check scenes/Load16.js` and `node scenes/Load16.js` (runs every phase against stub globals).
(function () {
  'use strict';
  const Wn = typeof window !== 'undefined' ? window : globalThis;
  const SC = Wn.LOAD16 = Wn.LOAD16 || {};
  const cache = new Map();
  SC.clearCache = function () { cache.clear(); };

  const W = 320, H = 186;
  // ---------------- palette ----------------
  const K = {
    ink: '#141018',
    rock: ['#dcdcdc', '#c4c4c4', '#9a9a9a', '#6f6f6f', '#4a4a4a'],
    far: ['#b4bcc4', '#98a0a8', '#7c848c'],                         // * custom haze greys for the far pit wall
    grass: { hi: '#3a9a2a', base: '#1d7a1d', sh: '#166316', shoulder: '#0f4a12' },
    dirt: { hi: '#a06a30', light: '#8f5a26', base: '#7a4a1c', sh: '#5e3812', dark: '#3f2408' },
    gravel: ['#d2c7ac', '#b9ab8d', '#8f836a'],
    yel: { hi: '#ffe466', base: '#f2c400', sh: '#c99d00', deep: '#8a6a00' },
    steel: ['#dcdcdc', '#c8ccd2', '#7c8289', '#4a4f56'],
    amber: '#ffb000', orange: '#ff7a00',
    dust: ['#d2c7ac', '#b9ab8d', '#a06a30'], dustGrey: ['#dcdcdc', '#c4c4c4', '#9a9a9a'],
    barOn: '#00ff66', barOnSh: '#00a040', barOff: '#ffd400', barOffSh: '#b89400',
  };

  // ---------------- geometry (old 160x93 coords doubled) ----------------
  const PILE = [18, 90], BOX = [160, 120], PIVOT = [70, 74];
  const EXC_X = 41, EXC_BASE = 104;                                  // excavator sprite placement (boom-foot pin -> PIVOT)
  const BENCH_R = 124, BENCH_TOP = 104, FACE_TOP = 108, GROUND = 170;
  function bucketPos2(s) { return [PILE[0] + (BOX[0] - PILE[0]) * s, PILE[1] + (BOX[1] - PILE[1]) * s - 40 * Math.sin(Math.PI * s)]; }

  // ---------------- helpers ----------------
  function hash(x, y, s) { let n = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul((s | 0) + 1, 1274126177); n = Math.imul(n ^ (n >>> 13), 1103515245); n ^= n >>> 16; return (n >>> 0) / 4294967296; }
  const BAYER = [0, 2, 3, 1];
  function dith(x, y, level) { return BAYER[((x >> 1) & 1) + 2 * ((y >> 1) & 1)] < level; }
  function makeCanvas(w, h) {
    try { if (typeof document === 'undefined' || !document.createElement) return null; const c = document.createElement('canvas'); if (!c || !c.getContext) return null; c.width = w; c.height = h; return c.getContext('2d') ? c : null; }
    catch (e) { return null; }
  }
  function brush(g, y0) {
    const s = PX;
    return {
      r(x, y, w, h, c) { g.fillStyle = c; g.fillRect(Math.round(x) * s, (Math.round(y) - y0) * s, Math.round(w) * s, Math.round(h) * s); },
      px(x, y, c) { g.fillStyle = c; g.fillRect(Math.round(x) * s, (Math.round(y) - y0) * s, s, s); },
    };
  }
  function baked(key, y0, y1, draw) {
    const k = key + '|' + PX;
    let c = cache.get(k);
    if (c === undefined) {
      c = makeCanvas(W * PX, (y1 - y0) * PX);
      if (!c) { draw(brush(ctx, 0)); return; }
      draw(brush(c.getContext('2d'), y0));
      cache.set(k, c);
    }
    ctx.drawImage(c, 0, y0 * PX);
  }
  function speckle(b, x0, x1, y0, rows, col, density, seed) { for (let y = y0; y < y0 + rows; y++) for (let x = x0; x < x1; x++) if (hash(x, y, seed) < density) b.px(x, y, col); }
  function ditherBand(b, x0, x1, y0, rows, col, level) { for (let y = y0; y < y0 + rows; y++) for (let x = x0; x < x1; x++) if (dith(x, y, level)) b.px(x, y, col); }
  function spr(name) { return !!(Wn.SPR16 && Wn.SPR16[name]); }
  function blit(name, x, base, opts) { if (typeof blit16 === 'function') blit16(name, x, base, opts); }

  // ---------------- backdrop bake: grass lip, far pit wall, talus, haul road (y 92..186) ----------------
  function backdrop(b) {
    const R = K.rock, F = K.far, D = K.dirt, G = K.grass, Gv = K.gravel;
    // grass lip on the horizon, 92..100
    b.r(0, 92, W, 8, G.base); b.r(0, 92, W, 1, G.hi); b.r(0, 98, W, 2, G.sh);
    for (let x = 0; x < W; x++) { const h = hash(x, 1, 11); if (h < 0.18) { b.px(x, 93 + Math.floor(h * 20), G.hi); } if (hash(x, 2, 11) < 0.12) b.px(x, 96 + Math.floor(hash(x, 3, 11) * 3), G.sh); }
    b.r(0, 100, W, 1, G.shoulder);
    // far pit wall 101..152: hazy greys, bedding joints, shade band under the lip, dither into the talus
    b.r(0, 101, W, 51, F[1]); b.r(0, 101, W, 2, F[2]);
    for (const jy of [112, 124, 137, 148]) for (let x = 0; x < W; x++) { const y = jy + (hash(x >> 4, jy, 12) < 0.35 ? 1 : 0); b.px(x, y, F[2]); if (dith(x, y + 1, 2)) b.px(x, y + 1, F[0]); }
    speckle(b, 0, W, 103, 48, F[0], 0.05, 13); speckle(b, 0, W, 103, 48, F[2], 0.06, 14);
    for (let x = 0; x < W; x += 23) { const x0 = x + Math.floor(hash(x, 0, 15) * 9), y0 = 104 + Math.floor(hash(x, 1, 15) * 40); b.r(x0, y0, 1, 4 + Math.floor(hash(x, 2, 15) * 6), F[2]); b.px(x0 + 1, y0, F[0]); } // vertical fracture traces
    ditherBand(b, 0, W, 144, 4, D.light, 1); ditherBand(b, 0, W, 148, 4, D.light, 2);
    // talus 152..170: dirt slope with pebbles and rock bits
    b.r(0, 152, W, 18, D.light); ditherBand(b, 0, W, 158, 6, D.base, 2); b.r(0, 164, W, 6, D.base); ditherBand(b, 0, W, 166, 4, D.sh, 1);
    speckle(b, 0, W, 153, 16, Gv[1], 0.05, 16); speckle(b, 0, W, 153, 16, D.sh, 0.05, 17);
    for (let x = 4; x < W; x += 19) if (hash(x, 4, 18) < 0.7) { const y = 154 + Math.floor(hash(x, 5, 18) * 13); b.r(x, y, 3, 2, R[2]); b.r(x, y, 2, 1, R[1]); b.px(x + 2, y + 1, R[3]); }
    // haul road 170..186: dirt with two ruts, hi row on top, dark shoulder rows at the bottom
    b.r(0, 170, W, 16, D.light); b.r(0, 170, W, 1, D.hi); b.r(0, 184, W, 1, D.sh); b.r(0, 185, W, 1, D.dark);
    for (const ry of [174, 179]) for (let x = 0; x < W; x++) { const h = hash(x, ry, 71); if (h < 0.14) continue; const yy = ry + (hash(x >> 3, ry, 70) < 0.3 ? 1 : 0); b.px(x, yy, D.sh); b.px(x, yy + 1, h > 0.35 ? D.dark : D.sh); if (h > 0.25) b.px(x, yy + 2, D.hi); }
    speckle(b, 0, W, 171, 2, D.base, 0.12, 72); speckle(b, 0, W, 182, 2, D.base, 0.12, 73); speckle(b, 0, W, 171, 13, Gv[1], 0.04, 74);
    for (let x = 3; x < W; x += 17) if (hash(x, 0, 75) < 0.6) { const y = 171 + Math.floor(hash(x, 1, 75) * 12); b.r(x, y, 2, 1, R[1]); b.px(x + 1, y, R[3]); }
  }

  // ---------------- bench bake: presplit rock face + muckpile (y 58..170, x 0..124) ----------------
  const PROFILE = [[0, 86], [4, 78], [9, 71], [14, 67], [19, 64], [25, 65], [31, 69], [37, 75], [42, 82], [47, 90], [51, 99], [54, 104]];
  function pileTop(x) {
    for (let i = 1; i < PROFILE.length; i++) { const a = PROFILE[i - 1], c = PROFILE[i]; if (x <= c[0]) { const f = (x - a[0]) / (c[0] - a[0]); return a[1] + (c[1] - a[1]) * f + (hash(x >> 1, 0, 21) < 0.4 ? 1 : 0) - (hash(x >> 1, 1, 21) < 0.3 ? 2 : 0) + (hash(x >> 2, 2, 21) < 0.2 ? 1 : 0); } }
    return BENCH_TOP;
  }
  function bench(b) {
    const R = K.rock, D = K.dirt, Gv = K.gravel;
    // bench top surface (edge-on), 104..108: lit crest, gravel fines
    b.r(0, BENCH_TOP, BENCH_R, 1, R[0]); b.r(0, BENCH_TOP + 1, BENCH_R, 2, R[1]); b.r(0, BENCH_TOP + 3, BENCH_R, 1, R[2]);
    speckle(b, 0, BENCH_R, BENCH_TOP + 1, 2, Gv[1], 0.14, 22); speckle(b, 0, BENCH_R, BENCH_TOP + 1, 3, Gv[2], 0.08, 23);
    // presplit face 108..170
    b.r(0, FACE_TOP, BENCH_R, GROUND - FACE_TOP, R[2]);
    ditherBand(b, 0, BENCH_R, 138, 14, R[3], 1); ditherBand(b, 0, BENCH_R, 152, 18, R[3], 2);
    for (let x = 4, i = 0; x < BENCH_R - 4; x += 11 + Math.floor(hash(i, 0, 30) * 7), i++) for (let y = FACE_TOP; y < GROUND; y++) { const h = hash(x, y, 30); if (h < 0.7) b.px(x, y, R[1]); if (h > 0.55) b.px(x + 1, y, R[3]); if (h > 0.9) b.px(x + 2, y, R[4]); } // half-cast presplit holes, broken
    for (const jy of [118, 131, 145, 158]) for (let x = 0; x < BENCH_R; x++) {                                                             // bedding joints
      const w1 = hash(x >> 3, jy, 24), y = jy + (w1 < 0.3 ? -1 : w1 < 0.6 ? 0 : w1 < 0.85 ? 1 : 2); if (hash(x >> 2, jy, 36) < 0.12) continue; if (dith(x, y - 1, 2)) b.px(x, y - 1, R[3]); b.px(x, y, R[4]); if (dith(x, y + 1, 2)) b.px(x, y + 1, R[1]);
    }
    speckle(b, 0, BENCH_R, FACE_TOP, GROUND - FACE_TOP, R[0], 0.025, 25); speckle(b, 0, BENCH_R, FACE_TOP, GROUND - FACE_TOP, R[3], 0.06, 26); speckle(b, 0, BENCH_R, FACE_TOP, GROUND - FACE_TOP, R[4], 0.02, 27);
    // right corner of the bench: shade side, partial dark outline
    b.r(BENCH_R - 3, FACE_TOP, 2, GROUND - FACE_TOP, R[3]); b.r(BENCH_R - 1, FACE_TOP, 1, GROUND - FACE_TOP, R[4]);
    b.r(BENCH_R - 2, BENCH_TOP, 2, 1, R[2]); b.px(BENCH_R - 1, BENCH_TOP + 1, R[3]); b.px(BENCH_R - 1, BENCH_TOP + 2, R[3]); b.px(BENCH_R - 1, BENCH_TOP + 3, R[4]);
    for (let x = 0; x < BENCH_R; x++) if (dith(x, GROUND - 1, 2)) b.px(x, GROUND - 1, R[4]);                                                // toe shadow
    // muckpile: shot rock chunks in a brick pattern clipped to the profile, dark gaps, dirt fines, outline on the shade side
    for (let x = 0; x <= 53; x++) {
      const top = Math.round(pileTop(x));
      for (let y = top; y < BENCH_TOP; y++) {
        const cy = Math.floor((y - 58) / 3), cell = 4 + (hash(cy, 1, 33) < 0.5 ? 1 : 0), shift = Math.floor(hash(cy, 0, 33) * 5), cx = Math.floor((x + shift) / cell), u = (x + shift) % cell, v = (y - 58) % 3;
        const tone = hash(cx, cy, 28), mergeR = hash(cx, cy, 34) < 0.3, mergeB = hash(cx, cy, 35) < 0.3;
        const set = tone < 0.3 ? [R[0], R[1], R[2]] : tone < 0.85 ? [R[1], R[2], R[3]] : [R[2], R[3], R[4]];
        let c = ((u === cell - 1 && !mergeR) || (v === 2 && !mergeB)) ? set[2] : v === 0 && u < cell - 1 ? set[0] : set[1];
        const g = hash(x, y, 29); if (g < 0.06) c = R[4]; else if (g < 0.1) c = D.base;
        if (y === top) c = x > 18 ? R[4] : R[0];
        b.px(x, y, c);
      }
    }
  }

  // ---------------- arm: 4-tone beams rasterised as pixel spans (light side first) ----------------
  const BOOM_T = [K.ink, K.yel.hi, K.yel.base, K.yel.base, K.yel.sh, K.yel.deep, K.ink];
  const STICK_T = [K.ink, K.yel.hi, K.yel.base, K.yel.sh, K.ink];
  const BARREL_T = [K.yel.hi, K.yel.base, K.yel.deep];
  const ROD_T = [K.steel[0], K.steel[2]];
  function beam(x1, y1, x2, y2, w, tones) {
    const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy); if (len < 0.5) return;
    const n = tones.length;
    const runs = (fixed, c0, h, vert) => {                          // draw the tone runs of one span
      let prev = -1, start = 0;
      for (let j = 0; j < h; j++) { const ti = Math.min(n - 1, Math.floor((j + 0.5) * n / h)); if (ti !== prev) { if (prev >= 0) { if (vert) P(fixed, c0 + start, 1, j - start, tones[prev]); else P(c0 + start, fixed, j - start, 1, tones[prev]); } prev = ti; start = j; } }
      if (vert) P(fixed, c0 + start, 1, h - start, tones[prev]); else P(c0 + start, fixed, h - start, 1, tones[prev]);
    };
    if (Math.abs(dx) >= Math.abs(dy)) {
      const T = w * len / Math.abs(dx), h = Math.max(1, Math.round(T)), step = dx > 0 ? 1 : -1, cnt = Math.round(Math.abs(dx)), xs = Math.round(x1);
      for (let i = 0; i <= cnt; i++) { const x = xs + i * step; const yc = y1 + (x - x1) * dy / dx; runs(x, Math.round(yc - T / 2), h, true); }
    } else {
      const T = w * len / Math.abs(dy), h = Math.max(1, Math.round(T)), step = dy > 0 ? 1 : -1, cnt = Math.round(Math.abs(dy)), ys = Math.round(y1);
      for (let i = 0; i <= cnt; i++) { const y = ys + i * step; const xc = x1 + (y - y1) * dx / dy; runs(y, Math.round(xc - T / 2), h, false); }
    }
  }
  function pin(x, y) { P(x - 1, y - 1, 3, 3, K.steel[3]); P(x - 1, y - 1, 2, 2, K.steel[1]); P(x, y, 1, 1, K.steel[2]); P(x - 1, y - 1, 1, 1, K.steel[0]); }
  function cyl(x1, y1, x2, y2) {                                     // hydraulic cylinder: steel rod full length, yellow barrel over the first 58 %
    beam(x1, y1, x2, y2, 2, ROD_T);
    const bx = x1 + (x2 - x1) * 0.58, by = y1 + (y2 - y1) * 0.58;
    beam(x1, y1, bx, by, 3, BARREL_T);
    P(Math.round(bx) - 1, Math.round(by) - 1, 2, 2, K.yel.deep);   // gland end cap
  }
  function upNormal(ax, ay, bx, by) { const dx = bx - ax, dy = by - ay, l = Math.hypot(dx, dy) || 1; let nx = -dy / l, ny = dx / l; if (ny > 0) { nx = -nx; ny = -ny; } return [nx, ny]; }
  function drawArm(m) {
    const s = +m.s || 0, [bx, by] = bucketPos2(s), [px, py] = PIVOT;
    const ex = px + (bx - px) * 0.5, ey = py + (by - py) * 0.5 - 32;
    const [ux, uy] = upNormal(px, py, ex, ey), [vx, vy] = upNormal(ex, ey, bx, by);
    const lerp = (ax, ay, cx, cy, f) => [ax + (cx - ax) * f, ay + (cy - ay) * f];
    // boom cylinder: frame bracket ahead of the boom foot up to the boom underside
    const F = [px - 9, py + 9], A = lerp(px, py, ex, ey, 0.45); cyl(F[0], F[1], A[0] - ux * 2, A[1] - uy * 2);
    beam(px, py, ex, ey, 6, BOOM_T);
    // stick cylinder: rides on the boom back, reaches over the elbow to the stick
    const B = lerp(px, py, ex, ey, 0.55), Cc = lerp(ex, ey, bx, by, 0.2); cyl(B[0] + ux * 3, B[1] + uy * 3, Cc[0] + vx * 3, Cc[1] + vy * 3);
    beam(ex, ey, bx, by, 5, STICK_T);
    // bucket cylinder along the stick back, then the bucket link
    const Dd = lerp(ex, ey, bx, by, 0.28), E = lerp(ex, ey, bx, by, 0.8); cyl(Dd[0] + vx * 2.5, Dd[1] + vy * 2.5, E[0] + vx * 2.5, E[1] + vy * 2.5);
    beam(E[0] + vx * 2.5, E[1] + vy * 2.5, bx, by, 2, ROD_T);
    pin(Math.round(px), Math.round(py)); pin(Math.round(ex), Math.round(ey)); pin(Math.round(F[0]), Math.round(F[1]));
    blit(m.full ? 'bucket_full' : 'bucket', bx, by);
    pin(Math.round(bx), Math.round(by));
  }

  // ---------------- truck with a partial heap ----------------
  function drawTruck(m) {
    const tx = Math.round((+m.truckX || 0) * 2); if (tx >= W) return;
    const loads = m.loads | 0, D = K.dirt, R = K.rock;
    if (loads >= 6) { blit('rock_truck_loaded', tx, GROUND); return; }
    blit('rock_truck_empty', tx, GROUND);
    const Hh = Math.round(loads / 6 * 7); if (Hh <= 0) return;
    const x0 = tx + 22, x1 = tx + 56, mid = (x0 + x1) / 2, half = (x1 - x0) / 2, rim = GROUND - 30;   // rim top = sprite row 6
    for (let d = Hh; d >= 1; d--) {
      const y = rim - d, u = half * Math.sqrt(Math.max(0, 1 - (d - 0.5) / Hh)), xa = Math.round(mid - u), xb = Math.round(mid + u), w = xb - xa; if (w <= 0) continue;
      P(xa, y, w, 1, D.base); P(xa, y, Math.max(1, Math.round(w * 0.35)), 1, D.light); P(xb - Math.max(1, Math.round(w * 0.22)), y, Math.max(1, Math.round(w * 0.22)), 1, D.sh);
      if (d === Hh) P(xa + 1, y, Math.max(1, w - 2), 1, D.hi);
    }
    for (let i = 0; i < 3 + loads; i++) { const h1 = hash(i, loads, 31), h2 = hash(i, loads, 32); const y = rim - 1 - Math.floor(h2 * (Hh - 1)); const u = half * Math.sqrt(Math.max(0, 1 - (rim - y) / Hh)) - 2; if (u < 1) continue; const x = Math.round(mid + (h1 * 2 - 1) * u); P(x, y, 2, 1, R[1]); P(x + 1, y, 1, 1, R[3]); }
  }

  // ---------------- rocks, dust, target bar ----------------
  function rock(r) { const c = r.c || K.rock[2], sh = c === '#8f5a26' ? K.dirt.sh : K.rock[4]; const x = Math.round(r.x * 2), y = Math.round(r.y * 2); P(x, y, 2, 2, c); P(x + 1, y + 1, 1, 1, sh); }
  const PUFF = [[-1.0, 0.2, 4], [-0.4, -0.6, 5], [0.3, -0.9, 4], [0.9, -0.3, 5], [0.1, 0.5, 3], [-0.6, -1.2, 3], [0.7, 0.8, 3]];
  function drawDust(m) {
    const rocks = m.rocks; if (!(m.flash > 0) || !rocks || !rocks.length) return;
    const spill = m.flashTxt === 'SPILL!', f0 = spill ? 0.8 : 0.6, age = Math.min(1, Math.max(0, 1 - m.flash / f0));
    const n = Math.min(10, rocks.length); let sx = 0, sy = 0;
    for (let i = rocks.length - n; i < rocks.length; i++) { sx += rocks[i].x; sy += rocks[i].y; }
    const cx = sx / n * 2, cy = sy / n * 2, spread = 5 + age * 16, cols = spill ? K.dustGrey : K.dust;
    ctx.save(); ctx.globalAlpha = (1 - age) * 0.75;
    for (let i = 0; i < PUFF.length; i++) { const [ox, oy, sz] = PUFF[i]; const x = Math.round(cx + ox * spread), y = Math.round(cy - 3 - age * 12 + oy * spread * 0.5); P(x, y, sz, sz - 1, cols[i % 3]); P(x, y, sz - 1, 1, cols[0]); }
    ctx.restore();
  }
  function drawBar(m) {
    if (m.phase !== 'play' || m.leaving > 0 || m.arriving > 0) return;
    const tx = Math.round((+m.truckX || 0) * 2), on = (+m.s || 0) >= 0.84;
    P(tx + 16, 132, 44, 1, on ? K.barOn : K.barOff); P(tx + 16, 133, 44, 1, on ? K.barOnSh : K.barOffSh);
  }

  // ---------------- excavator overlays: beacon blink, exhaust puffs ----------------
  function drawExcavator(t) {
    blit('excavator', EXC_X, EXC_BASE);
    const bx = EXC_X + 13, by = EXC_BASE - 40 + 1;
    if (Math.sin(t * 8) > 0) { P(bx, by, 2, 2, K.amber); P(bx, by, 1, 1, K.yel.hi); } else { P(bx, by, 2, 2, K.orange); P(bx + 1, by + 1, 1, 1, '#b85400'); }
    const sx = EXC_X + 41, sy = EXC_BASE - 40 + 4;
    ctx.save();
    for (let i = 0; i < 3; i++) { const ph = (t * 9 + i * 5) % 15, x = sx + Math.round(Math.sin(t * 3 + i) * 1.5) - i, y = sy - 2 - Math.round(ph); ctx.globalAlpha = 0.55 * (1 - ph / 15); P(x, y, 2 + (i & 1), 2, i === 1 ? K.steel[2] : '#9aa0ac'); }
    ctx.restore();
  }

  // ---------------- fallback sky if terrain16 is missing ----------------
  function fallbackSky() { const b = ['#2f6fc8', '#4f95e0', '#7fb8ec', '#b9dcf5']; for (let i = 0; i < 4; i++) P(0, i * 23, W, 23, b[i]); P(0, 60, W, 32, '#5372c9'); }

  // ---------------- main entry ----------------
  Wn.renderMGLoad16 = function (m, t) {
    m = m || {}; t = +t || 0;
    // 1. sky + ridge (terrain16 'pick' grid, baked inside terrain16)
    if (typeof drawSky16 === 'function' && typeof drawMountains16 === 'function') { drawSky16(false, t, 'pick'); drawMountains16(false, 'pick'); } else fallbackSky();
    // 2. a bird crossing the sky
    blit('bird_' + (Math.floor(t * 4) & 1), 200 + ((t * 14) % 160), 30 + Math.round(3 * Math.sin(t * 2)));
    // 3. grass lip, far wall, talus, haul road
    baked('load16.backdrop', 92, H, backdrop);
    // 4. trees on the horizon lip
    blit('tree_b', 130, 100); blit('tree_c', 232, 100); blit('tree_a', 256, 100); blit('bush', 280, 100); blit('tree_b', 298, 100, { flip: true });
    // 5. bench + muckpile, fallen chunk at the toe
    baked('load16.bench', 58, GROUND, bench);
    blit('rock_b', 118, GROUND);
    // 6. excavator
    drawExcavator(t);
    // 7. rocks going into the box fall behind the truck side; spilled rocks (floor 85) stay in front of everything
    const rocks = m.rocks || [];
    if (!(m.leaving > 0)) for (const r of rocks) if (r.floor !== 85) rock(r);
    // 8. truck + heap
    drawTruck(m);
    // 9. boom, cylinders, stick, bucket
    drawArm(m);
    // 10. spilled rocks, target bar, dust
    for (const r of rocks) if (r.floor === 85) rock(r);
    drawBar(m);
    drawDust(m);
  };

  // ---------------- node self-check: `node scenes/Load16.js` ----------------
  if (typeof require === 'function' && typeof module !== 'undefined' && require.main === module) {
    const g = globalThis; const counts = { fill: 0, img: 0, blit: 0 };
    const noop = () => {};
    g.ctx = new Proxy({}, { get: (o, k) => (k === 'fillRect' ? () => { counts.fill++; } : k === 'drawImage' ? () => { counts.img++; } : typeof k === 'string' ? noop : undefined), set: () => true });
    g.PX = 4;
    g.P = (x, y, w, h, c) => { if (typeof c !== 'string') throw new Error('bad colour ' + c); if (![x, y, w, h].every(Number.isFinite)) throw new Error('non-finite rect ' + [x, y, w, h]); ctx.fillStyle = c; ctx.fillRect(Math.round(x) * PX, Math.round(y) * PX, Math.round(w) * PX, Math.round(h) * PX); };
    g.L = noop; g.txt = noop; g.SPR16 = {};
    g.blit16 = (n, x, b) => { if (![x, b].every(Number.isFinite)) throw new Error('non-finite blit ' + n); counts.blit++; };
    g.drawSky16 = noop; g.drawMountains16 = noop; g.drawGround16 = noop; g.drawCreek16 = noop; g.drawRoad16 = noop;
    g.document = { createElement: () => ({ width: 0, height: 0, getContext: () => g.ctx }) };   // offscreen bakes available, like the browser
    g.abutment16 = noop; g.girderSpan16 = noop; g.multiplate16 = noop; g.craneBoom16 = noop; g.cable16 = noop; g.stakes16 = noop; g.formworkPile16 = noop;
    const rocksOf = (n, floor) => { const a = []; for (let i = 0; i < n; i++) a.push({ x: 60 + i * 2, y: 50 + i, vy: 10, floor, c: i % 3 ? '#8f5a26' : '#9a9a9a' }); return a; };
    const base = { type: 'load', phase: 'intro', s: 0, dir: 1, omega: 0.55, full: true, loads: 0, trucks: 0, spills: 0, timeLeft: 30, rocks: [], truckX: 72, leaving: 0, arriving: 0, flash: 0, flashTxt: '' };
    const cases = [
      ['intro', {}],
      ['play start', { phase: 'play' }],
      ['play mid swing', { phase: 'play', s: 0.5, full: true }],
      ['play over box', { phase: 'play', s: 0.9, full: false, loads: 3, rocks: rocksOf(30, 72.4), flash: 0.5, flashTxt: 'LOADED' }],
      ['play spill', { phase: 'play', s: 0.3, full: false, loads: 2, rocks: rocksOf(10, 85).concat(rocksOf(20, 73.6)), flash: 0.7, flashTxt: 'SPILL!' }],
      ['play dust fading', { phase: 'play', s: 1, loads: 5, rocks: rocksOf(60, 70), flash: 0.05, flashTxt: 'LOADED' }],
      ['leaving', { phase: 'play', s: 0.2, loads: 6, leaving: 0.9, truckX: 110, rocks: rocksOf(60, 68.8) }],
      ['truck off-screen', { phase: 'play', s: 0.6, loads: 6, leaving: 0.1, truckX: 175 }],
      ['arriving', { phase: 'play', s: 0.4, loads: 0, arriving: 0.8, truckX: 150, rocks: rocksOf(7, 85) }],
      ['over', { phase: 'over', s: 0.7, loads: 4, spills: 4, flash: 0.8, flashTxt: 'SPILL!', rocks: rocksOf(40, 85) }],
      ['missing fields', { rocks: undefined, truckX: undefined, s: undefined }],
    ];
    for (const [name, patch] of cases) {
      const m = Object.assign({}, base, patch); const snap = JSON.stringify(m);
      for (const t of [0, 0.37, 7.9]) { const f0 = counts.fill; renderMGLoad16(m, t); if (JSON.stringify(m) !== snap) throw new Error('state mutated in ' + name); if (name === 'play mid swing' && t === 0.37) console.log('per-frame fillRects (warm): ' + (counts.fill - f0)); }
      console.log('ok: ' + name);
    }
    for (let s = 0; s <= 1.0001; s += 0.05) renderMGLoad16(Object.assign({}, base, { phase: 'play', s }), s);
    g.drawSky16 = undefined; renderMGLoad16(Object.assign({}, base, { phase: 'play', s: 0.5 }), 1);           // fallback sky path
    delete g.document; cache.clear(); renderMGLoad16(Object.assign({}, base), 0);                                             // no-offscreen fallback path
    console.log('Load16 self-check OK; blits ' + counts.blit + ', drawImage ' + counts.img + ', bakes cached ' + cache.size);
  }
})();
