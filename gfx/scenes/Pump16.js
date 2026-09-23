// scenes/Pump16.js — Adam's dewatering mini-game, 16-bit version (320x186 logical at PX=4).
// Plain script, no modules. Defines window.renderMGPump16(m, t): draws the WHOLE scene area 0..320 x 0..186.
// The caller sets PX=4, runs the update logic, calls this, restores PX and then draws the HUD text itself.
// m = S.mg is read only: wl (water level, 50..85, drawn at wl*2), placed (0..6), dry, raining, handle, spray.
// Layers per frame: sky + mountains (terrain16 bakes), rain overlay (baked once), site cross-section (baked once:
// grass, dirt with strata, creek bowl at the far left, trench 60..260 x 100..170 with dark walls, gravel bedding,
// yellow bed line at 152, lay-flat discharge hose along the surface to the creek), then only the moving things:
// placed culvert_side sections, water with a surface row + ripples, suction hose to the water, trash_pump + lever,
// Adam (person, shirt #2a6fdb), two labourers (in the trench when dry, on the bank otherwise), section stockpile,
// birds by day, spray at the outlet, rain streaks from FLAKES.
// Globals used: ctx, PX, P, L, blit16, drawSky16, drawMountains16, FLAKES (optional).
(function () {
  const W = typeof window !== 'undefined' ? window : globalThis;
  const cache = new Map();

  // ---------------- palette (master palette from BRIEF.md; own colours marked *) ----------------
  const K = {
    grassHi: '#3a9a2a', grass: '#1d7a1d', grassSh: '#166316', shoulder: '#0f4a12',
    dirtHi: '#a06a30', dirtLt: '#8f5a26', dirt: '#7a4a1c', dirtSh: '#5e3812', dirtDk: '#3f2408',
    bed: '#5b4a3c', bedHi: '#6e5c4c', bedSh: '#4a3c30',                       // * bedSh (same as terrain16)
    rock: ['#dcdcdc', '#c4c4c4', '#9a9a9a', '#6f6f6f', '#4a4a4a'],
    gravHi: '#d2c7ac', grav: '#b9ab8d', gravSh: '#8f836a',
    waterHi: '#5aa0ff', water: '#1f6fe0', waterDeep: '#1550b0', foam: '#e8f4ff', ripple: '#8fc4ff',
    catHi: '#ffe466', cat: '#f2c400', catSh: '#c99d00',
    steelHi: '#c8ccd2', steel: '#7c8289', steelSh: '#4a4f56', hoseDk: '#2e3238',  // * hoseDk (machines.js deep steel)
    red: '#b3001b', redHi: '#e0334a', ink: '#141018',
    rainA: '#5a6a82', rainB: '#6f7f95', rainC: '#8797ab',                       // * overcast greys (old mgSky rain bands)
    rainStreak: '#9fc7ff',
  };

  // ---------------- layout (old 160x93 coordinates doubled) ----------------
  const GRASS_T = 88, DIRT_T = 97, BEDROCK = 174;
  const TR_L = 60, TR_R = 260, TR_T = 100, TR_B = 170, BED = 152;       // trench and the yellow bed line
  const CK_R = 46, CK_TOP = 128, CK_WATER = 148, CK_BOT = 170;          // creek bowl at the far left
  const PUMP_X = 268, PUMP_BASE = 96;                                    // trash_pump 32x24, bottom-left anchor
  const OUTLET = [30, 148];                                              // discharge hose end in the creek

  // ---------------- helpers ----------------
  function hash(x, y, s) {
    let n = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul((s | 0) + 1, 1274126177);
    n = Math.imul(n ^ (n >>> 13), 1103515245); n ^= n >>> 16; return (n >>> 0) / 4294967296;
  }
  const BAYER = [0, 2, 3, 1];
  function dith(x, y, level) { return BAYER[((x >> 1) & 1) + 2 * ((y >> 1) & 1)] < level; }
  function makeCanvas(w, h) {
    try { if (typeof document === 'undefined' || !document.createElement) return null; const c = document.createElement('canvas'); if (!c || !c.getContext) return null; c.width = w; c.height = h; return c.getContext('2d') ? c : null; }
    catch (e) { return null; }
  }
  function brush(g) {
    const s = PX;
    return {
      g: g,
      r(x, y, w, h, c) { g.fillStyle = c; g.fillRect(Math.round(x) * s, Math.round(y) * s, Math.round(w) * s, Math.round(h) * s); },
      px(x, y, c) { g.fillStyle = c; g.fillRect(Math.round(x) * s, Math.round(y) * s, s, s); },
    };
  }
  // bake a full-scene transparent layer once per (key, PX) and blit it; draws straight through when no offscreen canvas
  function baked(key, draw) {
    const k = key + '|' + PX;
    let c = cache.get(k);
    if (c === undefined) {
      c = makeCanvas(320 * PX, 186 * PX);
      if (!c) { draw(brush(ctx)); return; }
      draw(brush(c.getContext('2d')));
      cache.set(k, c);
    }
    ctx.drawImage(c, 0, 0);
  }
  function speckle(b, x0, x1, y0, rows, col, density, seed) {
    for (let y = y0; y < y0 + rows; y++) for (let x = x0; x < x1; x++) if (hash(x, y, seed) < density) b.px(x, y, col);
  }
  function ditherRows(b, x0, x1, y0, rows, colA, colB) {
    b.r(x0, y0, x1 - x0, rows, colA);
    const grp = rows / 3;
    for (let y = y0; y < y0 + rows; y++) { const level = Math.min(3, Math.floor((y - y0) / grp) + 1); for (let x = x0; x < x1; x++) if (dith(x, y, level)) b.px(x, y, colB); }
  }
  function pebble(b, x, y, r) {
    const R = K.rock;
    if (r < 0.5) { b.r(x, y, 2, 2, R[2]); b.px(x, y, R[1]); b.px(x + 1, y + 1, R[3]); }
    else if (r < 0.85) { b.r(x, y, 3, 2, R[2]); b.r(x, y, 2, 1, R[1]); b.px(x + 2, y + 1, R[3]); b.px(x + 1, y + 1, R[3]); }
    else { b.r(x, y, 4, 3, R[2]); b.r(x, y, 3, 1, R[1]); b.px(x, y, R[0]); b.r(x + 1, y + 2, 3, 1, R[3]); b.px(x + 3, y + 1, R[3]); }
  }
  function tuft(b, x, y, big, hi, sh) {
    b.px(x, y, hi); b.px(x + 2, y, hi); b.px(x + 1, y - 1, hi);
    if (big) { b.px(x - 1, y + 1, hi); b.px(x + 3, y + 1, hi); }
    b.px(x + 1, y + 1, sh); b.px(x + 2, y + 1, sh);
  }
  // rasterised line of w x w blocks for the brush (the bake has no L())
  function bline(b, x1, y1, x2, y2, w, c) {
    const dx = x2 - x1, dy = y2 - y1, n = Math.max(1, Math.max(Math.abs(dx), Math.abs(dy)) | 0);
    for (let i = 0; i <= n; i++) b.r(x1 + dx * i / n, y1 + dy * i / n, w, w, c);
  }
  // hose: dark body 2px with a lit top edge (lay-flat discharge / rigid suction, same look)
  function hoseSeg(b, x1, y1, x2, y2) { bline(b, x1, y1, x2, y2, 2, K.hoseDk); bline(b, x1, y1 - 1, x2, y2 - 1, 1, K.steelSh); }

  // ---------------- static site cross-section (baked once per PX) ----------------
  function bakeSite(b) {
    // grass strip 88..96: sunlit crest, tufts, shade foot, shoulder
    b.r(0, GRASS_T, 320, DIRT_T - GRASS_T, K.grass);
    b.r(0, GRASS_T, 320, 1, K.grassHi);
    for (let x = 0; x < 320; x++) if (dith(x, GRASS_T + 1, 2)) b.px(x, GRASS_T + 1, K.grassHi);
    for (let x = 0; x < 320; x += 7) { const xx = x + Math.floor(hash(x, 91, 21) * 5); if (hash(xx, 91, 22) < 0.7) tuft(b, xx, 91 + Math.floor(hash(x, 91, 23) * 2), hash(xx, 91, 24) < 0.4, K.grassHi, K.grassSh); }
    b.r(0, DIRT_T - 3, 320, 2, K.grassSh); for (let x = 0; x < 320; x++) if (dith(x, DIRT_T - 4, 2)) b.px(x, DIRT_T - 4, K.grassSh);
    b.r(0, DIRT_T - 1, 320, 1, K.shoulder);
    // dirt cross-section 97..186: dark topsoil, light / base / shade bands, dithered transitions, clods, strata, pebbles, bedrock
    b.r(0, DIRT_T, 320, 2, K.dirtDk); speckle(b, 0, 320, DIRT_T, 2, K.dirtSh, 0.18, 31);
    const yL = 112, yB = 146;
    b.r(0, DIRT_T + 2, 320, yL - DIRT_T - 2, K.dirtLt); b.r(0, yL, 320, yB - yL, K.dirt); b.r(0, yB, 320, BEDROCK - yB, K.dirtSh);
    ditherRows(b, 0, 320, yL - 4, 6, K.dirtLt, K.dirt); ditherRows(b, 0, 320, yB - 4, 6, K.dirt, K.dirtSh);
    speckle(b, 0, 320, DIRT_T + 2, yL - DIRT_T - 2, K.dirtHi, 0.06, 32); speckle(b, 0, 320, yL, yB - yL, K.dirtLt, 0.05, 33);
    speckle(b, 0, 320, yL, yB - yL, K.dirtSh, 0.04, 34); speckle(b, 0, 320, yB, BEDROCK - yB, K.dirtDk, 0.06, 35);
    for (let i = 0; i < 14; i++) { const cx = Math.floor(hash(i, 4, 38) * 318), cy = yL + Math.floor(hash(i, 5, 38) * (BEDROCK - yL - 2)); b.r(cx, cy, 2, 1, K.dirtLt); b.r(cx, cy + 1, 2, 1, K.dirtDk); }
    for (let sy = DIRT_T + 14, c = 0; sy < BEDROCK - 4; sy += 14, c++) {
      const col = sy < yB ? K.dirtSh : K.dirtDk, off = (c % 2) * 11;
      for (let x = -off; x < 320; x += 24) { const len = 12 + Math.floor(hash(x, sy, 36) * 6); const xs = Math.max(0, x); b.r(xs, sy + Math.floor(hash(x, sy, 37) * 2), Math.min(len, 320 - xs), 1, col); }
    }
    for (let i = 0; i < 26; i++) { const px = Math.floor(hash(i, 1, 41) * 316), py = DIRT_T + 3 + Math.floor(hash(i, 2, 41) * (BEDROCK - DIRT_T - 8)); pebble(b, px, py, hash(i, 3, 41)); }
    b.r(0, BEDROCK - 1, 320, 1, K.dirtDk); b.r(0, BEDROCK, 320, 186 - BEDROCK, K.bed);
    for (let by = BEDROCK, course = 0; by < 186; by += 6, course++) {
      b.r(0, by, 320, 1, K.bedHi); b.r(0, by + 5, 320, 1, K.bedSh);
      for (let bx = -(course % 2) * 8, j = 0; bx < 320; j++) { const bw = 16 + Math.round((hash(j, course, 43) - 0.5) * 12); b.r(bx, by, 1, 6, K.bedSh); if (hash(j, course, 44) < 0.5) b.r(bx + 1, by + 1, 1, 4, K.bedHi); bx += Math.max(6, bw); }
    }
    // creek bowl at the far left: dug bank (lit face, it faces the light), wet rows, water hi / base / deep, foam at the bank
    for (let y = CK_TOP; y < CK_BOT; y++) {
      const r = CK_R - Math.round((y - CK_TOP) * 0.18);
      if (y < CK_WATER - 2) { b.r(0, y, r, 1, y >= CK_WATER - 7 ? K.dirtSh : K.dirt); b.r(r - 3, y, 3, 1, K.dirtLt); b.px(r - 1, y, K.dirtHi); if (dith(y, 0, 2)) b.px(r - 4, y, K.dirtLt); }
      else if (y < CK_WATER) { b.r(0, y, r, 1, K.dirtDk); speckle(b, 0, r, y, 1, K.dirtSh, 0.2, 61); }
      else {
        const d = y - CK_WATER; b.r(0, y, r, 1, d < 2 ? K.waterHi : y >= 164 ? K.waterDeep : K.water);
        if (d === 0) { b.r(r - 4, y, 4, 1, K.foam); b.r(6, y, 3, 1, K.foam); b.r(20, y, 2, 1, K.foam); }
        if (d === 1) b.px(r - 1, y, K.foam);
        if (d === 2) for (let x = 0; x < r; x++) if (dith(x, y, 2)) b.px(x, y, K.waterHi);
        if (y === 163) for (let x = 0; x < r; x++) if (dith(x, y, 2)) b.px(x, y, K.waterDeep);
      }
    }
    b.r(0, CK_TOP - 1, CK_R + 1, 1, K.dirtDk); b.px(CK_R, CK_TOP - 1, K.dirtHi);   // lip of the creek bank
    pebble(b, 36, 140, 0.6); pebble(b, 40, 134, 0.3);
    // trench 60..260 x 100..170: dark walls with a lit lip, shade back face with strata, gravel bedding, mud in the bottom
    b.r(TR_L, TR_T, TR_R - TR_L, TR_B - TR_T, K.dirtSh);
    b.r(TR_L, TR_T, TR_R - TR_L, 1, K.dirtDk); b.r(TR_L - 1, TR_T - 1, TR_R - TR_L + 2, 1, K.dirtHi);   // lip: dark edge under a sunlit rim
    b.r(TR_L, TR_T, 2, TR_B - TR_T, K.dirtDk); b.r(TR_L + 2, TR_T, 2, TR_B - TR_T, K.dirtSh); for (let y = TR_T; y < TR_B; y++) if (dith(TR_L + 2, y, 2)) b.px(TR_L + 2, y, K.dirtDk);
    b.r(TR_R - 2, TR_T, 2, TR_B - TR_T, K.dirtDk); for (let y = TR_T; y < TR_B; y++) if (dith(TR_R - 3, y, 2)) b.px(TR_R - 3, y, K.dirtDk);
    for (let sy = 119; sy < BED - 2; sy += 14) for (let x = TR_L + 6; x < TR_R - 6; x += 22) { const len = 10 + Math.floor(hash(x, sy, 46) * 6); b.r(x, sy + Math.floor(hash(x, sy, 47) * 2), Math.min(len, TR_R - 6 - x), 1, K.dirtDk); }
    speckle(b, TR_L + 4, TR_R - 3, TR_T + 1, BED - TR_T - 3, K.dirtDk, 0.035, 48); speckle(b, TR_L + 4, TR_R - 3, TR_T + 1, BED - TR_T - 3, K.dirt, 0.03, 49);
    for (let i = 0; i < 5; i++) pebble(b, TR_L + 8 + Math.floor(hash(i, 6, 50) * (TR_R - TR_L - 20)), TR_T + 6 + Math.floor(hash(i, 7, 50) * (BED - TR_T - 14)), hash(i, 8, 50) * 0.8);
    b.r(TR_L + 2, BED + 1, TR_R - TR_L - 4, TR_B - BED - 1, K.dirtDk);                                    // bedding gravel below the bed line
    b.r(TR_L + 2, BED + 1, TR_R - TR_L - 4, 1, K.gravSh);
    speckle(b, TR_L + 2, TR_R - 2, BED + 2, 8, K.grav, 0.16, 51); speckle(b, TR_L + 2, TR_R - 2, BED + 2, 8, K.gravHi, 0.06, 52); speckle(b, TR_L + 2, TR_R - 2, BED + 2, 8, K.gravSh, 0.14, 53);
    speckle(b, TR_L + 2, TR_R - 2, BED + 10, TR_B - BED - 10, K.dirtSh, 0.15, 54);                          // mud at the bottom
    for (let x = TR_L + 2; x < TR_R - 2; x += 8) { b.r(x, BED - 1, 4, 1, K.cat); b.r(x, BED, 4, 1, K.catSh); b.px(x, BED - 1, K.catHi); }  // yellow bed line (dashed)
    // discharge hose (static): up from the flange, elbow left, down the bank, lay-flat along the shoulder, down into the creek
    hoseSeg(b, 280, 68, 280, 72); b.r(279, 72, 4, 1, K.steel);          // riser + flange
    hoseSeg(b, 264, 68, 280, 68);
    hoseSeg(b, 264, 68, 252, 97);
    b.r(46, 97, 208, 2, K.hoseDk); b.r(46, 96, 208, 1, K.steelSh); for (let x = 50; x < 254; x += 16) b.px(x + 1, 97, K.steelSh);   // lay-flat hose, seam ticks
    hoseSeg(b, 46, 98, OUTLET[0], OUTLET[1] - 4);
    b.r(OUTLET[0] - 2, OUTLET[1] - 5, 4, 3, K.steel); b.r(OUTLET[0] - 2, OUTLET[1] - 5, 4, 1, K.steelHi); b.px(OUTLET[0] + 1, OUTLET[1] - 3, K.steelSh);   // outlet coupling
  }

  // ---------------- rain overlay (baked once per PX): wash over the sky and ridge, low overcast, dim the site a little ----------------
  function bakeRain(b) {
    const g = b.g;
    g.fillStyle = 'rgba(74,86,110,0.55)'; g.fillRect(0, 0, 320 * PX, 92 * PX);
    g.fillStyle = 'rgba(30,40,70,0.16)'; g.fillRect(0, 92 * PX, 320 * PX, 94 * PX);
    for (let x = 0; x < 320; x++) {
      const h1 = 12 + Math.round(3 * Math.sin(x / 13) + 2 * Math.sin(x / 5 + 1) + hash(x, 0, 71));
      const h2 = h1 + 7 + Math.round(2 * Math.sin(x / 9 + 2) + 1.5 * Math.sin(x / 3.7));
      b.r(x, 0, 1, h1, K.rainA); b.r(x, h1, 1, h2 - h1, K.rainB);
      if (dith(x, h1, 2)) b.px(x, h1, K.rainA); if (dith(x, h2, 2)) b.px(x, h2, K.rainB); if (dith(x, h2 + 1, 1)) b.px(x, h2 + 1, K.rainC);
      if (x % 3 === 0 && hash(x, 2, 72) < 0.45) b.px(x, h2 + 2 + Math.floor(hash(x, 3, 72) * 3), K.rainC);   // ragged scud under the cloud base
    }
  }

  // ---------------- per-frame pieces ----------------
  function culverts(placed) {
    if (placed <= 0) return;
    ctx.save(); ctx.beginPath(); ctx.rect((TR_L + 2) * PX, TR_T * PX, (TR_R - TR_L - 4) * PX, (TR_B - TR_T) * PX); ctx.clip();
    for (let i = 0; i < placed; i++) blit16('culvert_side', (33 + i * 16) * 2, BED);   // 66 + i*32, sitting on the bed line
    ctx.restore();
  }
  function stockpile(remaining) {
    const n = Math.max(0, Math.min(6, remaining)), bottom = Math.min(n, 3), top = Math.min(Math.max(n - 3, 0), 2), peak = n >= 6 ? 1 : 0;
    for (let i = 0; i < bottom; i++) blit16('culvert_section', 162 + i * 30, PUMP_BASE);
    for (let i = 0; i < top; i++) blit16('culvert_section', 177 + i * 30, PUMP_BASE - 19);
    if (peak) blit16('culvert_section', 192, PUMP_BASE - 38);
  }
  function water(wl2, t) {
    if (wl2 >= TR_B) return;
    const x0 = TR_L + 1, w = TR_R - TR_L - 2;
    ctx.globalAlpha = 0.8; P(x0, wl2, w, TR_B - wl2, K.waterDeep); ctx.globalAlpha = 1;
    P(x0, wl2, w, 1, K.waterHi);
    if (wl2 < TR_B - 1) {
      for (let i = 0; i < 12; i++) { const x = x0 + 4 + ((i * 34 + Math.floor(t * 4) * 2) % (w - 8)); P(x, wl2 + 1, 3, 1, i % 3 ? K.ripple : K.foam); }
      for (let i = 0; i < 5; i++) { const x = x0 + 10 + ((i * 41 + Math.floor(t * 3) * 3) % (w - 20)); P(x, wl2 + 2 + (i % 2), 2, 1, K.water); }
    }
    P(x0, wl2 - 1, w, 1, K.dirtDk);                                                       // wet tide mark above the surface
  }
  function suction(wl2) {
    const iy = Math.min(TR_B - 4, wl2 + 6);
    L(PUMP_X, 84, 258, 90, K.hoseDk, 2); L(258, 90, 250, iy, K.hoseDk, 2);
    L(PUMP_X, 83, 258, 89, K.steelSh, 0.75); L(257.5, 89, 249.5, iy - 1, K.steelSh, 0.75);
    P(245, iy - 1, 9, 4, K.steel); P(245, iy - 1, 9, 1, K.steelHi); P(245, iy + 2, 9, 1, K.steelSh);   // strainer basket
    for (let x = 246; x < 253; x += 2) P(x, iy, 1, 2, K.steelSh);
  }
  function pump(handle) {
    blit16('trash_pump', PUMP_X, PUMP_BASE);
    const h = Math.max(0, Math.min(1, +handle || 0)), ex = 297, ey = 62 - 10 * h;              // primer lever off the bail, up-right
    L(285, 72, ex, ey, K.ink, 1.5); L(285, 72, ex, ey, K.steel, 0.75);
    P(ex - 1, ey - 2, 3, 3, K.red); P(ex - 1, ey - 2, 2, 1, K.redHi); P(ex + 1, ey, 1, 1, K.ink);   // grip
  }
  function crew(m) {
    blit16('person', 304, PUMP_BASE, { pal: { S: '#2a6fdb', s: '#1e4fa0' } });                     // Adam at the pump
    const a = { pal: { S: '#3b3b3b', s: '#262626' } }, c = { pal: { S: '#8a2a2a', s: '#5e1a1a' } };
    if (m.dry) { blit16('person', 192, BED, a); blit16('person', 232, BED, { pal: c.pal, flip: true }); }
    else { blit16('person', 120, PUMP_BASE, a); blit16('person', 140, PUMP_BASE, c); }
  }
  function spray() {
    const ox = OUTLET[0], oy = OUTLET[1];
    for (let i = 0; i < 10; i++) { const x = ox - 2 - i * 2 - Math.random() * 3, y = oy - 7 + i * 0.9 + Math.random() * 2; P(x, y, i < 4 ? 2 : 1, 1, i % 3 ? K.ripple : K.foam); }
    P(ox - 14, oy, 8, 1, K.foam); P(ox - 18 + Math.random() * 3, oy - 1, 2, 1, K.foam);
  }
  function birds(t) {
    for (let i = 0; i < 2; i++) {
      const x = ((t * 14 + i * 150 + 60) % 380) - 30, y = 28 + i * 9 + 3 * Math.sin(t * 1.7 + i);
      blit16(Math.floor(t * 4 + i) % 2 ? 'bird_1' : 'bird_0', x, y, { flip: true });
    }
  }
  function rain(t) {
    const F = typeof FLAKES !== 'undefined' && FLAKES ? FLAKES : [];
    for (const f of F) { const x = (f.x + t * 40 * f.v) % 320, y = (f.y + t * 180 * f.v) % 186; L(x, y, x + 1, y + 5, K.rainStreak, 0.5); }
  }

  // ---------------- entry point ----------------
  W.renderMGPump16 = function (m, t) {
    m = m || {}; t = +t || 0;
    const wl = typeof m.wl === 'number' ? m.wl : 85, wl2 = Math.max(TR_T, Math.min(TR_B, wl * 2));
    const placed = Math.max(0, Math.min(6, m.placed | 0)), raining = !!m.raining;
    drawSky16(false, t, 'pick');
    drawMountains16(false, 'pick');
    if (raining) baked('pump_rain', bakeRain);
    else birds(t);
    baked('pump_site', bakeSite);
    // creek flecks drift downstream (off the left edge)
    for (let i = 0; i < 8; i++) { const sp = ((i * 0.37 + t * 0.7) % 1) < 0.12; P(4 + ((i * 10 + Math.floor(t * 5) * 2) % 36), CK_WATER + 4 + (i % 3) * 5, 3, 1, sp ? K.foam : K.ripple); }
    // trench contents, back to front: culverts, suction hose, water over both, then the surface things
    culverts(placed);
    suction(wl2);
    water(wl2, t);
    blit16('tree_c', 2, 96); blit16('tree_a', 16, 95); blit16('bush', 30, 96);
    blit16('cone', 50, 99);
    stockpile(6 - placed);
    pump(m.handle);
    crew(m);
    if (m.spray > 0) spray();
    if (raining) rain(t);
  };
  W.renderMGPump16.clearCache = function () { cache.clear(); };
})();
