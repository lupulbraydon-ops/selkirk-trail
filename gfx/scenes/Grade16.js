// v16/scenes/Grade16.js — 16-bit renderer for the "grade the cut" mini-game (Selkirk Trail v16 review prototype).
// Plain script, no modules, no fetch. Defines window.renderMGGrade16(m, t).
//
// Called by drawMGGrade with PX=4 already set, AFTER the update logic and BEFORE the HUD txt() calls. Draws the whole
// 320x186 scene area (old 160x93 grid doubled). Never mutates m. Reads: m.phase ('intro'|'play'|'over'), m.design[160],
// m.ground[160] (per-column y in the 93-row grid), m.gx (grader x in the 160 grid), m.by (blade y in the 93 grid),
// m.dust[] ({x,y,l}). Uses globals ctx, PX, P, L, blit16, drawSky16, drawMountains16 (grid 'pick').
//
// Layers, back to front:  sky + clouds + birds (terrain16 bake)  ->  ridge (terrain16 'pick' mountains)  ->  baked
// backdrop (grass bench y 80..92 with tufts, shadowed back-slope of the cut y 92..186)  ->  tree line on the bench  ->
// grade stakes on the offset line  ->  the cut cross-section, one 2px strip per old column sliced out of a baked dirt
// texture (strata, pebbles, bedrock), surface hi/light rows, high spots red / overcuts orange behind the blade,
// windrow of loose material trailing the blade  ->  yellow dashed string line at design  ->  grader sprite riding the
// cut surface, lift links, moldboard sprite at the blade, spill heap rolling off the blade  ->  dust particles.
// Static bakes are keyed by PX and drawn with one drawImage per frame; only moving things are drawn per frame.
// Self-check: `node --check Grade16.js`; run against stub globals (see the task) — nothing here needs a DOM.
(function () {
  'use strict';
  const W = typeof window !== 'undefined' ? window : globalThis;
  const cache = new Map();

  // ---- palette (master palette from BRIEF.md) ----
  const C = {
    grassHi: '#3a9a2a', grass: '#1d7a1d', grassSh: '#166316', shoulder: '#0f4a12',
    dirtHi: '#a06a30', dirtLt: '#8f5a26', dirt: '#7a4a1c', dirtSh: '#5e3812', dirtDk: '#3f2408', bed: '#5b4a3c', bedHi: '#6e5c4c',
    rockLt: '#9a9a9a', rock: '#6f6f6f', rockDk: '#4a4a4a',
    steelHi: '#c8ccd2', steel: '#7c8289', steelSh: '#4a4f56',
    string: '#ffd400', stringSh: '#c99d00', high: '#ff5050', over: '#ff9a00', dust: '#d9c8a8',
  };
  const SCENE_W = 320, SCENE_H = 186, BENCH_TOP = 80, BANK_TOP = 92, TEX_TOP = 96, BEDROCK = 168;
  const BLADE_DX = 32;   // blade column = gx + 16 in the 160 grid (bxCol in the game logic), doubled

  // ---- helpers ----
  function hash(x, y, s) { // deterministic 0..1 per (x, y, seed) so bakes are stable frame to frame
    let n = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul((s | 0) + 1, 1274126177);
    n = Math.imul(n ^ (n >>> 13), 1103515245); n ^= n >>> 16; return (n >>> 0) / 4294967296;
  }
  const BAYER = [0, 2, 3, 1];
  function dith(x, y, level) { return BAYER[((x >> 1) & 1) + 2 * ((y >> 1) & 1)] < level; } // 2x2 cells, level 1..3 = 25/50/75 %
  function makeCanvas(w, h) {
    try { if (typeof document === 'undefined' || !document.createElement) return null; const c = document.createElement('canvas'); if (!c || !c.getContext) return null; c.width = w; c.height = h; return c.getContext('2d') ? c : null; }
    catch (e) { return null; }
  }
  // brush bound to a context; y0 = first logical row held by that canvas
  function brush(g, y0) {
    const s = PX;
    return {
      r(x, y, w, h, c) { g.fillStyle = c; g.fillRect(Math.round(x) * s, (Math.round(y) - y0) * s, Math.round(w) * s, Math.round(h) * s); },
      px(x, y, c) { g.fillStyle = c; g.fillRect(Math.round(x) * s, (Math.round(y) - y0) * s, s, s); },
    };
  }
  // bake rows y0..y1 once per (key, PX); returns the canvas or null (no DOM -> caller draws straight through)
  function bakeRows(key, y0, y1, draw) {
    const k = key + '|' + PX;
    if (cache.has(k)) return cache.get(k);
    const c = makeCanvas(SCENE_W * PX, (y1 - y0) * PX);
    if (c) draw(brush(c.getContext('2d'), y0));
    cache.set(k, c);   // null is cached too so we do not retry the DOM every frame
    return c;
  }
  function speckle(b, x0, x1, y0, y1, col, density, seed) {
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) if (hash(x, y, seed) < density) b.px(x, y, col);
  }
  function ditherBand(b, y0, rows, colA, colB) { // ordered dither from colA (above) into colB (below)
    b.r(0, y0, SCENE_W, rows, colA);
    const grp = rows / 3;
    for (let y = y0; y < y0 + rows; y++) { const lv = Math.min(3, Math.floor((y - y0) / grp) + 1); for (let x = 0; x < SCENE_W; x++) if (dith(x, y, lv)) b.px(x, y, colB); }
  }

  // ---- static layer 1: grass bench + shadowed back-slope of the cut (rows 80..186) ----
  function drawBackdrop(b) {
    // grass bench the tree line stands on
    b.r(0, BENCH_TOP, SCENE_W, 12, C.grass);
    b.r(0, BENCH_TOP, SCENE_W, 1, C.grassHi);
    for (let x = 0; x < SCENE_W; x++) { // tufts: hi blades on the top half, shade blades lower down
      if (hash(x, 1, 3) < 0.18) { b.px(x, BENCH_TOP + 1 + Math.floor(hash(x, 2, 3) * 4), C.grassHi); }
      if (hash(x, 3, 3) < 0.22) { const y = BENCH_TOP + 5 + Math.floor(hash(x, 4, 3) * 4); b.px(x, y, C.grassSh); b.px(x, y + 1, C.grassSh); }
    }
    b.r(0, BENCH_TOP + 9, SCENE_W, 2, C.grassSh);
    for (let x = 0; x < SCENE_W; x++) if (dith(x, BENCH_TOP + 9, 2)) b.px(x, BENCH_TOP + 9, C.grass);
    b.r(0, BENCH_TOP + 11, SCENE_W, 1, C.shoulder);
    // back-slope of the cut: shoulder grass at the crest, then dirt in shade with faint strata, darkening downwards
    b.r(0, BANK_TOP, SCENE_W, 4, C.shoulder);
    for (let x = 0; x < SCENE_W; x++) if (hash(x, 5, 4) < 0.3) b.px(x, BANK_TOP + 3 + (x & 1), C.dirtDk);
    ditherBand(b, BANK_TOP + 4, 24, C.dirtSh, C.dirtDk);
    b.r(0, BANK_TOP + 28, SCENE_W, SCENE_H - BANK_TOP - 28, C.dirtDk);
    for (let y = BANK_TOP + 6; y < SCENE_H; y += 14) { // shade strata lines wander a little
      for (let x = 0; x < SCENE_W; x++) { const yy = y + Math.floor(hash(x >> 3, y, 5) * 3); b.px(x, yy, y < BANK_TOP + 28 ? C.dirtDk : C.dirtSh); }
    }
    speckle(b, 0, SCENE_W, BANK_TOP + 4, SCENE_H, C.dirtSh, 0.035, 6);
    speckle(b, 0, SCENE_W, BANK_TOP + 4, SCENE_H, C.rockDk, 0.012, 7);
  }

  // ---- static layer 2: dirt texture for the cross-section (absolute rows 96..186, sliced per column each frame) ----
  function drawDirtTexture(b) {
    b.r(0, TEX_TOP, SCENE_W, BEDROCK - TEX_TOP, C.dirt);
    // strata: alternating light / shade bands with a gentle roll, dithered edges
    const bands = [[118, C.dirtLt, 2], [131, C.dirtSh, 2], [144, C.dirtLt, 3], [156, C.dirtSh, 2], [163, C.dirtDk, 1]];
    for (const [y0, col, h] of bands) {
      for (let x = 0; x < SCENE_W; x++) {
        const y = y0 + Math.round(1.5 * Math.sin(x / 31) + hash(x >> 2, y0, 8) * 1.2);
        for (let k = 0; k < h; k++) b.px(x, y + k, col);
        if (dith(x, y + h, 2)) b.px(x, y + h, col);
        if (dith(x, y - 1, 1)) b.px(x, y - 1, col);
      }
    }
    speckle(b, 0, SCENE_W, TEX_TOP, BEDROCK, C.dirtLt, 0.04, 9);
    speckle(b, 0, SCENE_W, TEX_TOP, BEDROCK, C.dirtSh, 0.04, 10);
    for (let i = 0; i < 70; i++) { // pebbles: lit top-left, dark bottom-right
      const x = Math.floor(hash(i, 1, 11) * (SCENE_W - 2)), y = TEX_TOP + 6 + Math.floor(hash(i, 2, 11) * (BEDROCK - TEX_TOP - 8));
      b.px(x, y, C.rockLt); b.px(x + 1, y, C.rock); b.px(x, y + 1, C.rock); b.px(x + 1, y + 1, C.rockDk);
    }
    // bedrock band
    b.r(0, BEDROCK, SCENE_W, SCENE_H - BEDROCK, C.bed);
    for (let x = 0; x < SCENE_W; x++) { if (dith(x, BEDROCK, 2)) b.px(x, BEDROCK, C.dirtSh); if (dith(x, BEDROCK + 1, 1)) b.px(x, BEDROCK + 1, C.bedHi); }
    for (let y = BEDROCK + 3; y < SCENE_H; y += 6) for (let x = ((y / 6) | 0) % 2 ? 4 : 0; x < SCENE_W; x += 12) { b.r(x, y, 7, 1, C.bedHi); b.px(x + 7, y + 1, C.dirtDk); b.r(x + 2, y + 3, 4, 1, C.dirtDk); }
  }

  function clampCol(c) { return c < 0 ? 0 : c > 159 ? 159 : c; }

  // ---- the renderer ----
  W.renderMGGrade16 = function (m, t) {
    t = t || 0;
    const design = m.design, ground = m.ground;
    const gx2 = m.gx * 2;                                  // grader x in the 320 grid
    const bxCol = Math.round(m.gx + 16);                   // first uncut column (160 grid), same rule as the logic
    const by2 = Math.round(m.by) * 2;                      // blade cutting edge row in the 186 grid
    const moving = m.phase === 'play';

    // sky, clouds, birds, ridge (terrain16 bakes for the 320x186 'pick' grid)
    drawSky16(false, t, 'pick');
    blit16('cloud_a', ((20 + t * 3) % 400) - 80, 10);
    blit16('cloud_b', ((210 + t * 4) % 400) - 80, 26);
    blit16('cloud_c', ((330 + t * 2) % 440) - 100, 4);
    const flap = ((t * 4) | 0) & 1 ? 'bird_1' : 'bird_0';
    blit16(flap, ((60 + t * 7) % 380) - 30, 34 + Math.round(2 * Math.sin(t * 1.3)));
    blit16(flap, ((90 + t * 7) % 380) - 30, 38 + Math.round(2 * Math.sin(t * 1.3 + 1)));
    drawMountains16(false, 'pick');

    // baked backdrop: grass bench + back-slope
    const back = bakeRows('grade16_back', BENCH_TOP, SCENE_H, drawBackdrop);
    if (back) ctx.drawImage(back, 0, BENCH_TOP * PX); else drawBackdrop(brush(ctx, 0));

    // tree line on the bench (sprites are cached by the blitter, so this row is cheap per frame)
    for (let x = -6; x < SCENE_W; x += 18) {
      const i = (x + 6) / 18, k = ['tree_a', 'tree_b', 'tree_c'][i % 3];
      blit16(k, x + (x % 8), BENCH_TOP + 4 + (i % 3) * 2);
      if (i % 4 === 1) blit16('bush', x + 12, BENCH_TOP + 10);
      if (i % 7 === 3) blit16('rock_a', x + 2, BENCH_TOP + 11);
      if (i % 9 === 5) blit16('stump', x + 14, BENCH_TOP + 10);
    }

    // grade stakes on the offset line (behind the section; the string runs 8px below the lath top)
    for (let c = 8; c < 160; c += 30) blit16('string_line_stake', c * 2, design[c] * 2 + 6);

    // the cut: one 2px strip per old column, sliced out of the dirt texture
    const tex = bakeRows('grade16_dirt', TEX_TOP, SCENE_H, drawDirtTexture);
    const sliceX = 2 * PX;
    for (let c = 0; c < 160; c++) {
      const g = ground[c], y = g * 2, x = c * 2;
      if (y < SCENE_H) {
        const top = Math.max(y, TEX_TOP);
        if (y < TEX_TOP) P(x, y, 2, TEX_TOP - y, C.dirt);
        if (tex) ctx.drawImage(tex, x * PX, (top - TEX_TOP) * PX, sliceX, (SCENE_H - top) * PX, x * PX, top * PX, sliceX, (SCENE_H - top) * PX);
        else P(x, top, 2, SCENE_H - top, C.dirt);
        P(x, y, 2, 1, C.dirtHi); P(x, y + 1, 2, 1, C.dirtLt);
      }
      if (c < bxCol) {
        const d = g - design[c];
        if (Math.abs(d) > 1) P(x, y, 2, 2, d < 0 ? C.high : C.over);        // high spot / overcut behind the blade
        else if (c < bxCol - 2) {                                             // windrow of loose material on graded surface
          const h = 1 + ((hash(c, 0, 12) * 3) | 0);
          P(x, y - h, 2, h, C.dirtLt); P(x, y - h, 1, 1, C.dirtHi); if (h > 1) P(x + 1, y - 1, 1, 1, C.dirtSh);
        }
      } else if (hash(c, 1, 13) < 0.3) {                                       // native surface ahead: grass tufts + dark topsoil
        P(x + (c & 1), y - 1, 1, 1, C.grassSh); P(x, y + 2, 2, 1, C.dirtSh);
      }
    }

    // string line at design: yellow dashed line, shadow row under it
    for (let c = 0; c < 160; c += 3) { const x = c * 2, y = design[c] * 2; P(x, y, 4, 1, C.string); P(x, y + 1, 4, 1, C.stringSh); }

    // grader riding on the cut surface: base = ground under the front wheel (old rule: column gx+30)
    const base = ground[clampCol(Math.round(m.gx + 30))] * 2 + 1;   // wheel bottoms (sprite row 34) sit on the surface row
    blit16('grader', gx2, base);
    // lift links: from the circle under the frame (sprite x41 / x49, row 27) down to the moldboard links (mx+4 / mx+17)
    const mx = gx2 + BLADE_DX - 12, circleY = base - 9;
    L(gx2 + 41, circleY, mx + 4.5, by2 - 7, C.steelSh, 1.2); L(gx2 + 49, circleY, mx + 17.5, by2 - 7, C.steelSh, 1.2);
    L(gx2 + 40.5, circleY, mx + 4, by2 - 7, C.steelHi, 0.5); L(gx2 + 48.5, circleY, mx + 17, by2 - 7, C.steelHi, 0.5);
    blit16('moldboard', mx, by2);
    // spill heap rolling off the trailing (left) end of the blade
    if (m.phase !== 'intro') {
      const hx = mx - 6, frame = (t * 12) | 0;
      P(hx, by2 - 3, 8, 3, C.dirtLt); P(hx + 1, by2 - 4, 5, 1, C.dirtLt); P(hx + 2, by2 - 5, 2, 1, C.dirtHi); P(hx + 1, by2 - 4, 2, 1, C.dirtHi);
      P(hx + 6, by2 - 2, 2, 2, C.dirtSh); P(hx, by2 - 1, 2, 1, C.dirtSh);
      for (let i = 0; i < 4; i++) { // tumbling clods
        const f = moving ? hash(i, frame, 14) : hash(i, 0, 14);
        P(hx + 1 + ((f * 7) | 0), by2 - 6 + ((hash(i, frame + 1, 15) * 4) | 0), 1, 1, i & 1 ? C.dirtHi : C.dirtDk);
      }
    }

    // dust: 1-2px particles fading with life
    const dust = m.dust || [];
    for (let i = 0; i < dust.length; i++) {
      const d = dust[i];
      ctx.globalAlpha = Math.min(1, d.l);
      P(d.x * 2, d.y * 2, d.l > 0.5 ? 2 : 1, d.l > 0.5 ? 2 : 1, C.dust);
    }
    ctx.globalAlpha = 1;
  };
  W.renderMGGrade16.clearCache = function () { cache.clear(); };
})();
