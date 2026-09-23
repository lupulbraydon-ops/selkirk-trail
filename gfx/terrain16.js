// terrain16.js — procedural terrain for the Selkirk Trail v16 ("16-bit") review prototype.
// Plain script, no modules, no fetch. Defines these globals:
//   drawSky16(night, t, grid)          5-band dithered sky (+ clouds by day; stars, moon and per-frame twinkle by night)
//   drawMountains16(night, grid)       three parallax layers per column, lit/shade faces, snow caps, haze on the far layer
//   drawGround16(night, stage, grid)   grass strip with tuft rows + shoulder, dirt cross-section, strata, pebbles, bedrock
//   drawCreek16(night, t, stage, grid) dug bowl, wet bank row, water hi/base/deep, per-frame ripples + foam
//   drawRoad16(stage, grid)            road surface per stage (main grid only): dirt haul road / gravel base / asphalt
// grid: 'main' = 640x372 at PX=2, 'pick' = 320x186 at PX=4. Uses the game's globals ctx, PX (and P for per-frame bits).
// Every static layer is baked once per (layer, night, stage, grid, PX) into an offscreen canvas at PX scale and
// drawImage'd on later calls; only the water ripples/foam and the night-sky twinkle are drawn per frame.
// Draw order expected by the renderer: sky, mountains, ground, creek, road, then sprites.
// Extras: TERRAIN16.opts = { moon:true, clouds:true }, TERRAIN16.clearCache().
// Self-check: `node --check terrain16.js` and `node terrain16.js` (runs every function against stub globals).
(function () {
  'use strict';
  const W = typeof window !== 'undefined' ? window : globalThis;
  const T = W.TERRAIN16 = W.TERRAIN16 || {};
  T.opts = Object.assign({ moon: true, clouds: true }, T.opts || {});
  const cache = new Map();
  T.clearCache = function () { cache.clear(); };

  // ---------------- palette (master palette from BRIEF.md; own colours marked *) ----------------
  const C = {
    skyDay: ['#1f5fbf', '#2f6fc8', '#4f95e0', '#7fb8ec', '#b9dcf5'],
    skyNight: ['#05071a', '#0b1030', '#161c4c', '#1e2460', '#262e72'],   // * last one = night horizon glow
    cloud: '#f7fbff', cloudSh: '#d6e6f5',
    moon: '#f3f0d8', moonSh: '#c9c6a8', star: ['#8a8fb8', '#cfd4ff', '#ffffff'],
    mtDay: { far: ['#93aae6', '#7b93d9', '#6a80c8'], mid: ['#5f7fd4', '#5372c9', '#4661b3'], near: ['#3d5aa8', '#3552a0', '#2f478c'], snow: ['#f2f5ff', '#dfe6fa', '#c9d4f0'] },
    mtNight: { far: ['#4550c0', '#4550c0', '#3a44a6'], mid: ['#2c39a8', '#2c39a8', '#232e8a'], near: ['#1e2470', '#1e2470', '#171b58'], snow: ['#d9dfff', '#d9dfff', '#a9b3e0'] },
    grass: { hi: '#3a9a2a', base: '#1d7a1d', sh: '#166316', shoulder: '#0f4a12' },
    dirt: { hi: '#a06a30', light: '#8f5a26', base: '#7a4a1c', sh: '#5e3812', dark: '#3f2408', bed: '#5b4a3c', bedHi: '#6e5c4c', bedSh: '#4a3c30' /* * */ },
    rock: ['#dcdcdc', '#c4c4c4', '#9a9a9a', '#6f6f6f', '#4a4a4a'],
    water: { hi: '#5aa0ff', base: '#1f6fe0', deep: '#1550b0', foam: '#e8f4ff', ripple: '#8fc4ff' },
    road: { hi: '#a0a0a0', base: '#8d8d8d', sh: '#6f6f6f', edge: '#505050', dash: '#f2c400' },
    gravel: ['#d2c7ac', '#b9ab8d', '#8f836a'],
  };
  // (The far mountain layer is also mixed 30 % toward the day horizon colour for haze: 3 more computed colours.)

  // ---------------- grids ----------------
  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  const GRIDS = {
    main: { name: 'main', w: 640, h: 372, skyH: 176, mtBase: 176, grassTop: 172, roadTop: 200, roadBot: 212, dirtTop: 212, bedrock: 324,
      creek: { cx: 320, top: 212, bot: 254, water: 242 }, hw: y => 88 - Math.pow(clamp((y - 212) / 42), 1.3) * 44,
      roadSpans: [[0, 220], [420, 640]], gap: [220, 420], rockCut: [0, 56, 128], moon: [584, 38, 14], strata: 18, k: 1 },
    pick: { name: 'pick', w: 320, h: 186, skyH: 92, mtBase: 92, grassTop: 92, roadTop: 104, roadBot: 116, dirtTop: 116, bedrock: 168,
      creek: { cx: 160, top: 116, bot: 156, water: 146 }, hw: y => 44 + (y - 116) * 0.9,
      roadSpans: null, gap: null, rockCut: null, moon: [290, 20, 8], strata: 14, k: 0.5 },
  };
  function gridOf(g) { return g === 'pick' ? GRIDS.pick : GRIDS.main; }
  // peaks: [x, height, halfWidth]; main = the current game's list doubled (base y 176); pick = half x, 0.4 height (base y 92)
  const PEAKS = {
    main: { far: [[120, 100, 100], [280, 90, 110], [430, 110, 100], [570, 90, 90]], mid: [[200, 170, 140], [480, 190, 160]], near: [[60, 140, 120], [350, 120, 120], [600, 140, 120]] },
    pick: { far: [[60, 40, 50], [140, 36, 55], [215, 44, 50], [285, 36, 45]], mid: [[100, 68, 70], [240, 76, 80]], near: [[30, 56, 60], [175, 48, 60], [300, 56, 60]] },
  };

  // ---------------- small helpers ----------------
  function hash(x, y, s) { // deterministic 0..1 per (x, y, seed) so every bake looks the same
    let n = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul((s | 0) + 1, 1274126177);
    n = Math.imul(n ^ (n >>> 13), 1103515245); n ^= n >>> 16; return (n >>> 0) / 4294967296;
  }
  const BAYER = [0, 2, 3, 1];
  function dith(x, y, level) { return BAYER[((x >> 1) & 1) + 2 * ((y >> 1) & 1)] < level; } // 2x2 cells; level 1/2/3 = 25/50/75 %
  function even(y) { return Math.floor(y / 2) * 2; }
  function mix(a, b, f) {
    const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16); let out = '#';
    for (let i = 16; i >= 0; i -= 8) { const va = (pa >> i) & 255, vb = (pb >> i) & 255; out += Math.round(va + (vb - va) * f).toString(16).padStart(2, '0'); }
    return out;
  }
  function makeCanvas(w, h) {
    try { if (typeof document === 'undefined' || !document.createElement) return null; const c = document.createElement('canvas'); if (!c || !c.getContext) return null; c.width = w; c.height = h; return c.getContext('2d') ? c : null; }
    catch (e) { return null; }
  }
  // brush: rect/pixel helpers bound to a context, with a vertical offset so a bake only holds the rows it needs
  function brush(g, y0) {
    const s = PX;
    return {
      r(x, y, w, h, c) { g.fillStyle = c; g.fillRect(Math.round(x) * s, (Math.round(y) - y0) * s, Math.round(w) * s, Math.round(h) * s); },
      px(x, y, c) { g.fillStyle = c; g.fillRect(Math.round(x) * s, (Math.round(y) - y0) * s, s, s); },
    };
  }
  // bake rows y0..y1 of a layer once per key (+PX) and blit it; falls back to drawing straight through if no offscreen canvas
  function baked(key, G, y0, y1, draw) {
    const k = key + '|' + PX;
    let c = cache.get(k);
    if (c === undefined) {
      c = makeCanvas(G.w * PX, (y1 - y0) * PX);
      if (!c) { draw(brush(ctx, 0), G); return; }
      draw(brush(c.getContext('2d'), y0), G);
      cache.set(k, c);
    }
    ctx.drawImage(c, 0, y0 * PX);
  }
  function speckle(b, x0, x1, y0, rows, col, density, seed) {
    for (let y = y0; y < y0 + rows; y++) for (let x = x0; x < x1; x++) if (hash(x, y, seed) < density) b.px(x, y, col);
  }
  // 3-step ordered dither from colA (above) into colB (below) over `rows` rows starting at y0 (y0 should be even)
  function ditherRows(b, x0, x1, y0, rows, colA, colB) {
    b.r(x0, y0, x1 - x0, rows, colA);
    const grp = rows / 3;
    for (let y = y0; y < y0 + rows; y++) { const level = Math.min(3, Math.floor((y - y0) / grp) + 1); for (let x = x0; x < x1; x++) if (dith(x, y, level)) b.px(x, y, colB); }
  }

  // ---------------- sky ----------------
  function skyBands(b, G, cols, fracs, zones) {
    const H = G.skyH, w = G.w;
    b.r(0, 0, w, G.h, cols[4]);                                  // safety fill: nothing below is ever left uncovered
    const bounds = fracs.map(f => Math.round(H * f)); const edges = [0].concat(bounds, [H]);
    for (let i = 0; i < 5; i++) b.r(0, edges[i], w, edges[i + 1] - edges[i], cols[i]);
    for (let i = 0; i < 4; i++) { const z = zones[i]; ditherRows(b, 0, w, even(bounds[i] - z / 2), z, cols[i], cols[i + 1]); }
  }
  function cloud(b, x, y, w) { // lumpy, flat-bottomed cloud; (x, y) = bottom-left, w = width; shade on the underside and right edge
    const n = Math.max(2, Math.round(w / 12)); const puffs = [];
    for (let i = 0; i < n; i++) { const r = Math.round(w * (0.13 + 0.1 * hash(i, x, 3))); const cx = Math.round(x + r + (w - 2 * r) * (i / (n - 1))); puffs.push([cx, y - Math.round(r * 0.55), r]); }
    let top = y; for (const p of puffs) top = Math.min(top, p[1] - p[2]);
    for (let yy = top; yy <= y; yy++) {
      let l = 1e9, rt = -1e9;
      for (const [cx, cy, r] of puffs) { const dy = yy - cy; if (Math.abs(dy) > r) continue; const hw = Math.floor(Math.sqrt(r * r - dy * dy)); l = Math.min(l, cx - hw); rt = Math.max(rt, cx + hw); b.r(cx - hw, yy, 2 * hw + 1, 1, C.cloud); }
      if (rt < l) continue;
      if (yy >= y - 1) b.r(l, yy, rt - l + 1, 1, C.cloudSh);
      else if (yy === y - 2) { for (let x = l; x <= rt; x++) if (dith(x, yy, 2)) b.px(x, yy, C.cloudSh); }
      else if (yy > top + 1) b.px(rt, yy, C.cloudSh);
    }
  }
  function clouds(b, G) {
    const list = G.name === 'main' ? [[40, 46, 60], [380, 30, 84], [530, 72, 44], [196, 66, 36]] : [[24, 24, 40], [226, 34, 44]];
    for (const [x, y, w] of list) cloud(b, x, y, w);
  }
  function nearMoon(G, x, y) { const m = G.moon; return (x - m[0]) * (x - m[0]) + (y - m[1]) * (y - m[1]) < (m[2] + 6) * (m[2] + 6); }
  function moon(b, G) {
    const [mx, my, r] = G.moon; const o = Math.max(2, Math.round(r * 0.3));
    for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
      if (dx * dx + dy * dy > r * r) continue; const ex = dx + o, ey = dy + o;
      b.px(mx + dx, my + dy, ex * ex + ey * ey <= (r - 2) * (r - 2) ? C.moon : C.moonSh);
    }
    for (const [ox, oy] of [[-4, -2], [2, 3], [-1, 5]]) b.r(mx + Math.round(ox * r / 14), my + Math.round(oy * r / 14), r > 10 ? 2 : 1, r > 10 ? 2 : 1, C.moonSh);
  }
  function twinkleStar(G, i) { return [Math.floor(hash(i, 11, 9) * G.w), Math.floor(hash(i, 12, 9) * G.skyH * 0.7)]; }
  function stars(b, G) {
    const n = G.name === 'main' ? 90 : 40, nt = G.name === 'main' ? 16 : 8;
    for (let i = 0; i < n; i++) { const x = Math.floor(hash(i, 1, 7) * G.w), y = Math.floor(hash(i, 2, 7) * G.skyH * 0.8); if (nearMoon(G, x, y)) continue; b.px(x, y, hash(i, 3, 7) < 0.6 ? C.star[0] : C.star[1]); }
    for (let i = 0; i < nt; i++) { const [x, y] = twinkleStar(G, i); if (!nearMoon(G, x, y)) b.px(x, y, C.star[0]); } // dim base pixel under each twinkler
  }
  function twinkle(G, t) { // per frame: a handful of stars brighten and flare
    const nt = G.name === 'main' ? 16 : 8;
    for (let i = 0; i < nt; i++) {
      const [x, y] = twinkleStar(G, i); if (nearMoon(G, x, y)) continue;
      const v = Math.sin(t * (1.6 + (i % 4) * 0.35) + i * 1.9);
      if (v > 0.2) P(x, y, 1, 1, v > 0.75 ? C.star[2] : C.star[1]);
      if (v > 0.85 && i % 3 === 0) { P(x - 1, y, 1, 1, C.star[1]); P(x + 1, y, 1, 1, C.star[1]); P(x, y - 1, 1, 1, C.star[1]); P(x, y + 1, 1, 1, C.star[1]); }
    }
  }
  W.drawSky16 = function (night, t, grid) {
    const G = gridOf(grid);
    baked('sky|' + (night ? 1 : 0) + '|' + G.name, G, 0, G.h, (b) => {
      if (night) { skyBands(b, G, C.skyNight, [0.22, 0.44, 0.66, 0.86], [6, 6, 9, 15]); stars(b, G); if (T.opts.moon) moon(b, G); }
      else { skyBands(b, G, C.skyDay, [0.18, 0.38, 0.6, 0.82], [6, 6, 6, 6]); if (T.opts.clouds) clouds(b, G); }
    });
    if (night) twinkle(G, +t || 0);
  };

  // ---------------- mountains ----------------
  // col = [lit, base, shade]; snow = [lit, base, shade]; haze = {col, rows} dithers the lower rows toward the horizon colour
  function mtLayer(b, G, peaks, col, snow, haze, seed) {
    const base = G.mtBase, w = G.w, k = G.k;
    for (let x = 0; x < w; x++) {
      let hm = 0, pk = null;
      for (const p of peaks) { const h = p[1] * (1 - Math.abs(x - p[0]) / p[2]); if (h > hm) { hm = h; pk = p; } }
      if (!pk) continue;
      const jag = (1.4 * Math.sin(x * 0.61 / k + seed) + 1.0 * Math.sin(x * 1.93 / k + seed * 2.1) + (hash(x, seed, 5) - 0.5) * 1.2) * k;
      const h = Math.round(hm + jag); if (h < 1) continue;
      const top = base - h;
      const side = x < pk[0] ? 0 : x === pk[0] ? 1 : 2;                 // lit face / crest column / shade face
      b.r(x, top, 1, h, col[side]);
      const g = hash(x, seed, 6);                                         // gullies: thin streaks in the base tone
      if (g > 0.93 && h > 12 * k) { const g0 = top + Math.round(h * (0.28 + 0.2 * hash(x, seed, 4))), g1 = g0 + Math.round(h * (0.12 + 0.2 * hash(x, seed, 8))); b.r(x, g0, 1, g1 - g0, col[1]); }
      if (side === 2 && h > 20 * k) { const fh = Math.min(26 * k, Math.round(h * (0.14 + 0.06 * hash(x, seed, 7)))); b.r(x, base - fh, 1, fh, col[1]); } // lighter scree foot on the shade side
      if (h >= 6 * k) {                                                   // snow cap with a shade side and a 1px ridge
        let cap = Math.round(h * 0.2 + (2.5 * Math.sin(x * 0.23 / k + seed) + 1.5 * Math.sin(x * 0.71 / k + seed * 3) + (hash(x, seed, 9) - 0.5) * 1.6) * k);
        cap = Math.max(1, Math.min(h, cap));
        if (side === 1) b.r(x, top, 1, cap, snow[1]);
        else if (side === 0) { b.r(x, top, 1, cap, snow[0]); if (cap > 1) b.px(x, top + cap - 1, snow[1]); }
        else { b.r(x, top, 1, cap, snow[2]); b.px(x, top, snow[0]); }
      }
      if (haze) { const y0 = Math.max(top, base - haze.rows); for (let y = y0; y < base; y++) if (dith(x, y, y >= base - haze.rows / 2 ? 2 : 1)) b.px(x, y, haze.col); }
    }
  }
  W.drawMountains16 = function (night, grid) {
    const G = gridOf(grid);
    baked('mt|' + (night ? 1 : 0) + '|' + G.name, G, 0, G.mtBase, (b) => {
      const M = night ? C.mtNight : C.mtDay, pk = PEAKS[G.name];
      const hazeCol = night ? C.skyNight[4] : C.skyDay[4];
      const far = night ? M.far : M.far.map(c => mix(c, hazeCol, 0.3));
      mtLayer(b, G, pk.far, far, M.snow, { col: hazeCol, rows: Math.round(G.mtBase * 0.25) }, 1);
      mtLayer(b, G, pk.mid, M.mid, M.snow, null, 2);
      mtLayer(b, G, pk.near, M.near, M.snow, null, 3);
    });
  };

  // ---------------- ground ----------------
  function tuft(b, x, y, big, hi, sh) {
    b.px(x, y, hi); b.px(x + 2, y, hi); b.px(x + 1, y - 1, hi);
    if (big) { b.px(x - 1, y + 1, hi); b.px(x + 3, y + 1, hi); }
    b.px(x + 1, y + 1, sh); b.px(x + 2, y + 1, sh);
  }
  function tuftRow(b, w, y, hi, sh, seed) {
    for (let x = 0; x < w; x += 7) { const xx = x + Math.floor(hash(x, y, seed) * 5); if (hash(xx, y, seed + 1) < 0.72) tuft(b, xx, y + Math.floor(hash(x, y, seed + 2) * 2), hash(xx, y, seed + 3) < 0.4, hi, sh); }
  }
  function grassStrip(b, G) {
    const y0 = G.grassTop, y1 = G.roadTop, w = G.w, gr = C.grass, main = G.name === 'main';
    b.r(0, y0, w, y1 - y0, gr.base);
    b.r(0, y0, w, main ? 2 : 1, gr.hi);                                   // sunlit crest where the bank meets the mountains
    for (let x = 0; x < w; x++) if (dith(x, y0 + 2, 2)) b.px(x, y0 + (main ? 2 : 1), gr.hi);
    for (let y = y0 + (main ? 5 : 3); y < y1 - 3; y += main ? 6 : 4) tuftRow(b, w, y, gr.hi, gr.sh, 21);
    speckle(b, 0, w, y0 + 3, y1 - y0 - 6, gr.sh, 0.05, 25);
    b.r(0, y1 - 3, w, 3, gr.sh); for (let x = 0; x < w; x++) if (dith(x, y1 - 4, 2)) b.px(x, y1 - 4, gr.sh);   // foot of the bank in shade
    b.r(0, y1 - 1, w, 1, gr.shoulder);
    // verge behind the road / bridge level (the road and abutments draw over it; in the pick grid it is the far bank)
    b.r(0, y1, w, G.roadBot - y1, gr.sh);
    for (let y = y1 + 3; y < G.roadBot - 4; y += main ? 6 : 4) tuftRow(b, w, y, gr.base, gr.shoulder, 27);
    b.r(0, G.roadBot - 2, w, 2, gr.shoulder);
  }
  function pebble(b, x, y, r) {
    const R = C.rock;
    if (r < 0.5) { b.r(x, y, 2, 2, R[2]); b.px(x, y, R[1]); b.px(x + 1, y + 1, R[3]); }
    else if (r < 0.85) { b.r(x, y, 3, 2, R[2]); b.r(x, y, 2, 1, R[1]); b.px(x + 2, y + 1, R[3]); b.px(x + 1, y + 1, R[3]); }
    else { b.r(x, y, 4, 3, R[2]); b.r(x, y, 3, 1, R[1]); b.px(x, y, R[0]); b.r(x + 1, y + 2, 3, 1, R[3]); b.px(x + 3, y + 1, R[3]); }
  }
  function dirtSection(b, G) {
    const D = C.dirt, w = G.w, top = G.dirtTop, bed = G.bedrock, bot = G.h, k = G.k;
    b.r(0, top, w, 2, C.grass.shoulder);                                  // darker shoulder line under the road
    let y = top + 2; const topsoil = Math.max(2, Math.round(4 * k));
    b.r(0, y, w, topsoil, D.dark); speckle(b, 0, w, y, topsoil, D.sh, 0.18, 31); y += topsoil;
    const span = bed - y, yL = y + Math.round(span * 0.16), yB = y + Math.round(span * 0.62);
    b.r(0, y, w, yL - y, D.light); b.r(0, yL, w, yB - yL, D.base); b.r(0, yB, w, bed - yB, D.sh);
    ditherRows(b, 0, w, even(yL - 3), 6, D.light, D.base); ditherRows(b, 0, w, even(yB - 3), 6, D.base, D.sh);
    speckle(b, 0, w, y, yL - y, D.hi, 0.06, 32); speckle(b, 0, w, yL, yB - yL, D.light, 0.05, 33); speckle(b, 0, w, yL, yB - yL, D.sh, 0.04, 34); speckle(b, 0, w, yB, bed - yB, D.dark, 0.06, 35);
    for (let i = 0; i < w * 0.04; i++) { const cx = Math.floor(hash(i, 4, 38) * (w - 2)), cy = yL + Math.floor(hash(i, 5, 38) * (bed - yL - 2)); b.r(cx, cy, 2, 1, D.light); b.r(cx, cy + 1, 2, 1, D.dark); } // clods
    let c = 0;                                                            // strata lines: dashed, alternating offsets
    for (let sy = y + G.strata; sy < bed - 4; sy += G.strata, c++) {
      const col = sy < yB ? D.sh : D.dark, off = (c % 2) * 11;
      for (let x = -off; x < w; x += 24) { const len = 12 + Math.floor(hash(x, sy, 36) * 6); const xs = Math.max(0, x); b.r(xs, sy + Math.floor(hash(x, sy, 37) * 2), Math.min(len, w - xs), 1, col); }
    }
    const n = Math.round(w * (bed - y) / 900);                            // pebbles with hi/shade
    for (let i = 0; i < n; i++) { const px = Math.floor(hash(i, 1, 41) * (w - 4)), py = y + 2 + Math.floor(hash(i, 2, 41) * (bed - y - 6)); pebble(b, px, py, hash(i, 3, 41)); }
    b.r(0, bed - 1, w, 1, D.dark);                                        // bedrock band, coursed blocks
    b.r(0, bed, w, bot - bed, D.bed);
    const bh = Math.max(6, Math.round(12 * k)), bw = Math.round(32 * k);
    for (let by = bed, course = 0; by < bot; by += bh, course++) {
      b.r(0, by, w, 1, D.bedHi); b.r(0, by + bh - 1, w, 1, D.bedSh);
      for (let bx = -(course % 2) * (bw >> 1), j = 0; bx < w; j++) { const bwj = bw + Math.round((hash(j, course, 43) - 0.5) * bw * 0.8); b.r(bx, by, 1, bh, D.bedSh); if (hash(j, course, 44) < 0.5) b.r(bx + 1, by + 1, 1, bh - 2, D.bedHi); if (hash(j, course, 45) < 0.3) b.r(bx + 2 + Math.floor(hash(j, course, 46) * (bwj - 4)), by + 2 + Math.floor(hash(j, course, 47) * (bh - 4)), 2, 1, D.bedSh); bx += Math.max(6, bwj); }
    }
    speckle(b, 0, w, bed, bot - bed, D.bedHi, 0.03, 42);
  }
  function rockCutFace(b, G) { // presplit rock cut on the far left once clearing is done (stage >= 1)
    const R = C.rock, [x0, x1, y0] = G.rockCut, y1 = G.grassTop;
    for (let x = x0; x < x1; x++) {
      const slope = Math.pow((x - x0) / (x1 - x0), 1.7) * (y1 - y0 - 8);           // cut slope: full height at the screen edge, down to the grass on the right
      const top = y0 + Math.round(slope + 3 * Math.sin(x * 0.5) + hash(x, 0, 51) * 3);
      if (top >= y1) continue;
      b.r(x, top, 1, y1 - top, x > x1 - 14 ? R[2] : R[1]); b.px(x, top, R[0]); if (x > x0 + 2 && hash(x, 1, 55) < 0.5) b.px(x, top + 1, R[0]);
    }
    for (let y = y0 + 11; y < y1; y += 13) {                              // bedding joints, broken, wavy, with a lit lip in places
      for (let x = x0; x < x1 - 1; x++) { const yy = y + Math.round(Math.sin(x * 0.3 + y) * 1.5); if (yy <= y0 + Math.pow((x - x0) / (x1 - x0), 1.7) * (y1 - y0 - 8) + 3) continue; if (hash(x >> 2, y, 52) > 0.3) { b.px(x, yy, R[3]); if (hash(x >> 3, y, 54) > 0.5) b.px(x, yy + 1, R[0]); } }
    }
    for (let x = x0 + 6; x < x1 - 10; x += 8) { const st = y0 + 8 + Math.round(Math.pow((x - x0) / (x1 - x0), 1.7) * (y1 - y0 - 8)); const h = Math.min(y1 - st - 2, 10 + Math.floor(hash(x, 9, 53) * 14)); if (h > 4) { b.r(x, st, 1, h, R[3]); b.r(x + 1, st, 1, h, R[0]); } } // half-cast drill holes
    for (let y = y0 + 4; y < y1; y += 5) b.r(x0 + 2 + (y % 3), y, 2 + (y % 2), 1, R[3]);
    for (let x = x1 - 14; x < x1; x++) { const top = y0 + Math.round(Math.pow((x - x0) / (x1 - x0), 1.7) * (y1 - y0 - 8)); if (top < y1 - 1) b.px(x, top + 1, R[4]); }   // partial outline on the shade side
  }
  W.drawGround16 = function (night, stage, grid) {
    const G = gridOf(grid), cut = !!(G.rockCut && (stage | 0) >= 1);
    const y0 = cut ? G.rockCut[2] : G.grassTop;
    baked('gnd|' + (night ? 1 : 0) + '|' + (cut ? 1 : 0) + '|' + G.name, G, y0, G.h, (b) => { grassStrip(b, G); dirtSection(b, G); if (cut) rockCutFace(b, G); });
  };

  // ---------------- creek ----------------
  function creekBowl(b, G) {
    const K = G.creek, D = C.dirt, Wt = C.water, cx = K.cx, deepFrom = K.bot - Math.round((K.bot - K.water) * 0.35);
    for (let y = K.top; y < K.bot; y++) {
      const hw = Math.round(G.hw(y)), l = cx - hw, r = cx + hw, wd = r - l;
      if (y < K.water - 2) {                                              // dug bowl: lit left bank, shade right bank, damp near the water
        b.r(l, y, wd, 1, y >= K.water - 7 ? D.sh : D.base);
        b.r(l, y, 3, 1, D.light); b.px(l, y, D.hi);
        b.r(r - 3, y, 3, 1, D.sh); b.px(r - 1, y, D.dark);
        if (dith(y, 0, 2)) { b.px(l + 3, y, D.light); b.px(r - 4, y, D.dark); }
        speckle(b, l + 4, r - 4, y, 1, D.light, 0.05, 63); speckle(b, l + 4, r - 4, y, 1, D.dark, 0.05, 64);
      } else if (y < K.water) { b.r(l, y, wd, 1, D.dark); speckle(b, l, r, y, 1, D.sh, 0.2, 61); } // wet bank rows
      else {
        const d = y - K.water; const col = d < 2 ? Wt.hi : y >= deepFrom ? Wt.deep : Wt.base;
        b.r(l, y, wd, 1, col);
        if (d === 0) { b.r(l, y, 3, 1, Wt.foam); b.r(r - 3, y, 3, 1, Wt.foam); for (let x = l + 6; x < r - 6; x += 9) if (hash(x, y, 62) < 0.35) b.r(x, y, 2, 1, Wt.foam); }
        if (d === 1) { b.px(l, y, Wt.foam); b.px(r - 1, y, Wt.foam); }
        if (d === 2) for (let x = l; x < r; x++) if (dith(x, y, 2)) b.px(x, y, Wt.hi);
        if (y === deepFrom - 1) for (let x = l; x < r; x++) if (dith(x, y, 2)) b.px(x, y, Wt.deep);
      }
    }
    for (let i = 0; i < 6; i++) { const y = K.water - 6 + Math.floor(hash(i, 1, 65) * 3); const hw = Math.round(G.hw(y)) - 8; pebble(b, cx - hw + Math.floor(hash(i, 2, 65) * 2 * hw), y, hash(i, 3, 65) * 0.85); } // stones on the bank
  }
  function ripples(G, t) { // per frame: ripple highlights drift downstream, foam flecks blink on the surface row
    const K = G.creek, Wt = C.water, n = G.name === 'main' ? 24 : 12, rows = K.bot - K.water;
    for (let i = 0; i < n; i++) {
      const y = K.water + 1 + (i % (rows - 2)); const hw = Math.round(G.hw(y)) - 3, span = 2 * hw; if (span <= 4) continue;
      const sp = 10 + (i % 3) * 5; const x = K.cx - hw + (((i * 37 + Math.floor(t * sp)) % span) + span) % span;
      const len = i % 4 === 0 ? 2 : 3;
      P(x, y, Math.min(len, K.cx + hw - x), 1, y < K.water + 4 ? Wt.ripple : Wt.hi);
    }
    const nf = G.name === 'main' ? 5 : 3, hw = Math.round(G.hw(K.water)) - 5;
    for (let i = 0; i < nf; i++) { if (Math.sin(t * 2.5 + i * 2.1) < 0.1) continue; const x = K.cx - hw + (((i * 53 + Math.floor(t * 7)) % (2 * hw)) + 2 * hw) % (2 * hw); P(x, K.water, 2, 1, Wt.foam); }
  }
  W.drawCreek16 = function (night, t, stage, grid) {
    const G = gridOf(grid);
    baked('creek|' + (night ? 1 : 0) + '|' + G.name, G, G.creek.top, G.creek.bot, (b) => creekBowl(b, G));
    ripples(G, +t || 0);
  };

  // ---------------- road ----------------
  function roadStrip(b, G, x0, x1, kind) {
    const y0 = G.roadTop, y1 = G.roadBot, w = x1 - x0, D = C.dirt, R = C.road, Gv = C.gravel, K = C.rock;
    if (kind === 0) {                                                     // dirt haul road with two ruts
      b.r(x0, y0, w, y1 - y0, D.light); b.r(x0, y0, w, 1, D.hi); b.r(x0, y1 - 2, w, 1, D.sh); b.r(x0, y1 - 1, w, 1, D.dark);
      for (const ry of [y0 + 3, y0 + 7]) for (let x = x0; x < x1; x++) { const h = hash(x, ry, 71); if (h < 0.14) continue; const yy = ry + (hash(x >> 3, ry, 70) < 0.3 ? 1 : 0); b.px(x, yy, D.sh); b.px(x, yy + 1, h > 0.35 ? D.dark : D.sh); if (h > 0.25) b.px(x, yy + 2, D.hi); }
      speckle(b, x0, x1, y0 + 1, 2, D.base, 0.12, 72); speckle(b, x0, x1, y0 + 6, 1, D.base, 0.12, 73);
      for (let x = x0 + 3; x < x1 - 3; x += 17) if (hash(x, 0, 74) < 0.6) { const y = y0 + 1 + Math.floor(hash(x, 1, 74) * 9); b.r(x, y, 2, 1, K[1]); b.px(x + 1, y, K[3]); }
    } else if (kind === 1) {                                              // gravel base
      b.r(x0, y0, w, y1 - y0, Gv[1]); b.r(x0, y0, w, 1, Gv[0]); b.r(x0, y1 - 1, w, 1, Gv[2]);
      speckle(b, x0, x1, y0 + 1, y1 - y0 - 2, Gv[0], 0.28, 75); speckle(b, x0, x1, y0 + 1, y1 - y0 - 2, Gv[2], 0.14, 76);
      for (let x = x0 + 2; x < x1 - 3; x += 9) if (hash(x, 2, 77) < 0.5) { const y = y0 + 2 + Math.floor(hash(x, 3, 77) * 8); b.r(x, y, 2, 1, Gv[0]); b.px(x + 2, y, Gv[2]); }
    } else {                                                              // asphalt with a curb and centre dashes
      b.r(x0, y0, w, 1, K[0]); b.r(x0, y0 + 1, w, 1, K[1]);
      b.r(x0, y0 + 2, w, y1 - y0 - 2, R.base); b.r(x0, y0 + 2, w, 1, R.hi); b.r(x0, y1 - 3, w, 2, R.sh); b.r(x0, y1 - 1, w, 1, R.edge);
      speckle(b, x0, x1, y0 + 3, y1 - y0 - 6, R.hi, 0.05, 78); speckle(b, x0, x1, y0 + 3, y1 - y0 - 6, R.sh, 0.05, 79);
      for (let x = x0 + 4; x < x1 - 4; x += 20) b.r(x, y0 + 5, Math.min(8, x1 - x), 2, R.dash);
    }
  }
  function crossing(b, G) { // rough temporary crossing over the creek before the abutments exist (stage < 2)
    const [x0, x1] = G.gap, y0 = G.roadTop, y1 = G.roadBot, D = C.dirt, K = C.rock, w = x1 - x0;
    b.r(x0, y0, w, y1 - y0, D.sh); b.r(x0, y0, w, 1, D.base); b.r(x0, y1 - 1, w, 1, D.dark);
    speckle(b, x0, x1, y0 + 1, y1 - y0 - 2, D.dark, 0.15, 81); speckle(b, x0, x1, y0 + 1, y1 - y0 - 2, D.light, 0.08, 82);
    for (let x = x0 + 4; x < x1 - 4; x += 11) { const y = y0 + 2 + Math.floor(hash(x, 5, 83) * 7); b.r(x, y, 2, 1, K[2]); b.px(x, y, K[1]); }
  }
  W.drawRoad16 = function (stage, grid) {
    const G = gridOf(grid); if (!G.roadSpans) return;                     // pick grid: road/bridge are drawn by the renderer
    const st = stage | 0, kind = st >= 5 ? 2 : st >= 4 ? 1 : 0, cross = st < 2;
    baked('road|' + kind + '|' + (cross ? 1 : 0) + '|' + G.name, G, G.roadTop, G.roadBot, (b) => { for (const [x0, x1] of G.roadSpans) roadStrip(b, G, x0, x1, kind); if (cross) crossing(b, G); });
  };

  // ---------------- node self-check: `node terrain16.js` ----------------
  if (typeof require === 'function' && typeof module !== 'undefined' && require.main === module) {
    const counts = { fill: 0, img: 0 };
    const stubCtx = () => ({ fillStyle: '', strokeStyle: '', lineWidth: 1, fillRect() { counts.fill++; }, drawImage() { counts.img++; }, beginPath() {}, moveTo() {}, lineTo() {}, stroke() {}, save() {}, restore() {} });
    const g = globalThis;
    g.ctx = stubCtx(); g.PX = 2;
    g.P = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(Math.round(x) * PX, Math.round(y) * PX, Math.round(w) * PX, Math.round(h) * PX); };
    g.L = () => { ctx.beginPath(); ctx.stroke(); };
    g.document = { createElement: () => ({ width: 0, height: 0, getContext: () => stubCtx() }) };
    const run = (grid, px) => {
      g.PX = px; const before = counts.fill;
      for (const night of [false, true]) for (const stage of [0, 1, 2, 3, 4, 5]) for (const t of [0, 0.37, 12.5]) {
        drawSky16(night, t, grid); drawMountains16(night, grid); drawGround16(night, stage, grid); drawCreek16(night, t, stage, grid); drawRoad16(stage, grid);
      }
      const bakeFills = counts.fill - before;
      const f0 = counts.fill, i0 = counts.img;
      drawSky16(true, 3, grid); drawMountains16(true, grid); drawGround16(true, 5, grid); drawCreek16(true, 3, 5, grid); drawRoad16(5, grid);
      console.log(grid + ' grid @PX=' + px + ': ' + bakeFills + ' rects while baking, per-frame cost after warm-up: ' + (counts.img - i0) + ' drawImage + ' + (counts.fill - f0) + ' fillRect');
    };
    run('main', 2); run('pick', 4);
    delete g.document; cache.clear(); run('main', 2);                    // fallback path: no offscreen canvas available
    console.log('terrain16 self-check OK; bakes cached: ' + cache.size);
  }
})();
