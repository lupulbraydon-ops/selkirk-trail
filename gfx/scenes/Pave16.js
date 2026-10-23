// scenes/Pave16.js — "Roll the mat" paving mini-game, 16-bit version (320x186 logical at PX=4).
// Plain script, no modules. Defines window.renderMGPave16(m, t): draws the WHOLE scene area 0..320 x 0..186.
// The caller (drawMGPave in index.html) sets PX=4, runs the update logic, calls this, restores PX, then draws the HUD.
// m = S.mg is read only (160x93 game grid, every coordinate doubled here): px (paver left edge), rx (roller left
// edge, 14 wide), temp[c] (mat temperature per column, undefined = not laid), dens[c] 0..1, shoved[c], stop (>0 while a
// truck is in the hopper), flash/flashTxt, phase.
// Layers: sky + mountains (terrain16 'pick' bakes), grass bench + dirt cross-section (terrain16), baked gravel base
// course across the road band y 104..116, the mat (per column: colour by temperature, density ticks, shove marks),
// the GREEN rolling window (columns whose temperature is inside PAVE.w0..w1 and not yet compacted), roller, paver
// with screed and hopper, the asphalt truck backing in while m.stop > 0, steam off the fresh mat, Lenny on the bench.
// Globals used: ctx, PX, P, blit16, drawSky16, drawMountains16, drawGround16, PAVE (window constants from index.html).
(function () {
  const W = typeof window !== 'undefined' ? window : globalThis;
  const cache = new Map();
  const K = {
    gravHi: '#d2c7ac', grav: '#b9ab8d', gravSh: '#8f836a',
    matHot: '#2a1a14', matHotHi: '#6a3a22', matWarm: '#1e1e22', matWarmHi: '#3a3a40', matCold: '#3a3a3c', matColdHi: '#5a5a5e', matDone: '#2c2c30', matDoneHi: '#4a4a50',
    shove: '#c85a2c', shoveHi: '#e07a48', win: '#00ff66', winSh: '#00a040', edge: '#505050', dash: '#f2c400',
    catHi: '#ffe466', cat: '#f2c400', catSh: '#c99d00', catDk: '#8a6a00',
    steelHi: '#c8ccd2', steel: '#7c8289', steelSh: '#4a4f56', tire: '#1a1c1e', hub: '#555555',
    glassHi: '#d8f0ff', glass: '#9fd8ff', glassSh: '#5a9ad0', ink: '#141018', amber: '#ffb000', steam: '#e8e8ea',
  };
  const ROAD_TOP = 104, ROAD_BOT = 116, MAT_TOP = 106, MAT_H = 6, BASE_Y = 112;   // mat sits on the base course; wheels on y 116
  function hash(x, y, s) { let n = Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul((s | 0) + 1, 1274126177); n = Math.imul(n ^ (n >>> 13), 1103515245); n ^= n >>> 16; return (n >>> 0) / 4294967296; }
  function makeCanvas(w, h) { try { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; } catch (e) { return null; } }
  function baked(key, y0, y1, draw) {
    const k = key + '|' + PX; let c = cache.get(k);
    if (c === undefined) {
      c = makeCanvas(320 * PX, (y1 - y0) * PX);
      if (c) { const g = c.getContext('2d'); const r = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(Math.round(x) * PX, (Math.round(y) - y0) * PX, Math.round(w) * PX, Math.round(h) * PX); }; draw(r); }
      cache.set(k, c || null);
    }
    if (c) ctx.drawImage(c, 0, y0 * PX);
  }
  function baseCourse(r) {   // crushed gravel base: three tones, pebbles, a dark edge row, string-line stakes
    r(0, ROAD_TOP, 320, ROAD_BOT - ROAD_TOP, K.grav);
    r(0, ROAD_TOP, 320, 1, K.gravHi);
    for (let x = 0; x < 320; x++) for (let y = ROAD_TOP + 1; y < ROAD_BOT; y++) { const h = hash(x, y, 7); if (h < 0.08) r(x, y, 1, 1, K.gravHi); else if (h > 0.93) r(x, y, 1, 1, K.gravSh); }
    r(0, ROAD_BOT - 1, 320, 1, K.gravSh);
    for (let x = 12; x < 320; x += 40) { r(x, ROAD_TOP - 6, 1, 6, '#c69a5c'); r(x - 1, ROAD_TOP - 6, 3, 1, '#ff00aa'); }
  }
  function matColumn(x, T, d, sh) {   // one 2px-wide column of mat (game column c -> x = c*2)
    let base, hi;
    if (sh) { base = K.shove; hi = K.shoveHi; }
    else if (d >= 0.9) { base = K.matDone; hi = K.matDoneHi; }
    else if (T > 135) { base = K.matHot; hi = K.matHotHi; }
    else if (T >= 85) { base = K.matWarm; hi = K.matWarmHi; }
    else { base = K.matCold; hi = K.matColdHi; }
    P(x, MAT_TOP, 2, MAT_H, base);
    P(x, MAT_TOP, 2, 1, hi);
    if (sh) { P(x, MAT_TOP + 2 + (x >> 1) % 3, 2, 1, K.ink); }           // rut marks
    else if (d > 0 && d < 0.9) { const n = Math.round(d * 4); for (let i = 0; i < n; i++) P(x, MAT_TOP + MAT_H - 1 - i, 2, 1, K.matDoneHi); } // density ticks filling from the bottom
    if (T > 135 && !sh) { if (hash(x, 1, 9) < 0.4) P(x, MAT_TOP + 1, 1, 1, '#ff7a00'); }   // orange sheen on hot mat
  }
  function roller(x, base, t) {   // tandem drum roller facing right: drum, frame, cab with ROPS, beacon, water spray bar
    const d = x;
    P(d + 1, base, 24, 1, K.ink);                                   // ground shadow
    P(d, base - 8, 9, 8, K.steel); P(d, base - 8, 9, 1, K.steelHi); P(d, base - 1, 9, 1, K.steelSh); P(d + 2, base - 6, 2, 3, K.steelHi);   // front drum
    P(d + 19, base - 8, 9, 8, K.steel); P(d + 19, base - 8, 9, 1, K.steelHi); P(d + 19, base - 1, 9, 1, K.steelSh); P(d + 21, base - 6, 2, 3, K.steelHi); // rear drum
    const spin = Math.floor(t * 8) % 4; P(d + 1 + spin, base - 4, 1, 1, K.ink); P(d + 20 + spin, base - 4, 1, 1, K.ink);
    P(d + 7, base - 14, 15, 7, K.cat); P(d + 7, base - 14, 15, 1, K.catHi); P(d + 7, base - 8, 15, 1, K.catSh); P(d + 6, base - 12, 1, 4, K.catSh);   // frame / hood
    P(d + 10, base - 24, 10, 10, K.catSh); P(d + 10, base - 24, 10, 1, K.steelSh); P(d + 11, base - 23, 8, 6, K.glass); P(d + 11, base - 23, 8, 1, K.glassHi); P(d + 17, base - 23, 2, 6, K.glassSh);   // cab
    P(d + 10, base - 24, 1, 10, K.ink); P(d + 19, base - 24, 1, 10, K.ink);
    P(d + 14, base - 26, 2, 2, Math.floor(t * 3) % 2 ? K.amber : K.catDk);                                             // beacon
    P(d + 13, base - 20, 3, 3, '#f5cfa8'); P(d + 12, base - 21, 5, 1, '#ffffff');                                     // operator (you)
    P(d + 7, base - 15, 15, 1, K.ink); P(d + 7, base - 7, 1, 1, K.ink);
  }
  function paver(x, base, t, stopped) {   // tracked paver facing right: hopper up front (right), screed trailing (left), operator stand
    const d = x;
    P(d + 2, base, 40, 1, K.ink);
    P(d + 8, base - 6, 26, 6, K.steelSh); P(d + 8, base - 6, 26, 1, K.steel); for (let i = 0; i < 6; i++) P(d + 10 + i * 4, base - 4, 2, 2, K.hub); P(d + 8, base - 1, 26, 1, K.tire);   // tracks
    P(d + 6, base - 16, 32, 10, K.cat); P(d + 6, base - 16, 32, 1, K.catHi); P(d + 6, base - 7, 32, 1, K.catSh); P(d + 6, base - 16, 1, 10, K.catHi); P(d + 37, base - 16, 1, 10, K.catSh);   // body
    P(d + 34, base - 22, 10, 12, K.catSh); P(d + 34, base - 22, 10, 1, K.steelSh); P(d + 36, base - 21, 6, 3, K.ink); P(d + 36, base - 21, 6, 1, K.catDk);   // hopper
    if (stopped) { P(d + 36, base - 21, 6, 2, '#2a1a14'); }                                                              // asphalt in the hopper
    P(d + 0, base - 4, 10, 4, K.steel); P(d + 0, base - 4, 10, 1, K.steelHi); P(d + 0, base - 1, 10, 1, K.steelSh); P(d + 2, base - 9, 1, 5, K.steelSh); P(d + 7, base - 9, 1, 5, K.steelSh);   // screed + tow arms
    P(d + 18, base - 24, 8, 8, K.steelSh); P(d + 19, base - 23, 6, 2, K.steel);                                           // operator stand + umbrella post
    P(d + 20, base - 21, 3, 3, '#f5cfa8'); P(d + 19, base - 22, 5, 1, K.cat);                                             // paver operator
    P(d + 14, base - 28, 16, 2, K.amber); P(d + 21, base - 26, 1, 4, K.steelSh);                                          // umbrella
    P(d + 28, base - 19, 2, 2, Math.floor(t * 3 + 1) % 2 ? K.amber : K.catDk);
    P(d + 6, base - 17, 32, 1, K.ink);
  }
  function steam(x, y, t, seed) { for (let k = 0; k < 3; k++) { const ph = ((t * 0.7) + k / 3 + seed * 0.41) % 1; ctx.globalAlpha = 0.5 * (1 - ph); const s = 1 + Math.floor(ph * 3); P(x + Math.sin(ph * 6 + seed) * 3, y - ph * 14, s, s, K.steam); } ctx.globalAlpha = 1; }

  W.renderMGPave16 = function (m, t) {
    NITE = false;
    drawSky16(false, t, 'pick');
    blit16('cloud_b', ((60 + t * 3) % 400) - 80, 14); blit16('cloud_a', ((250 + t * 2) % 420) - 100, 30);
    drawMountains16(false, 'pick');
    drawGround16(false, 0, 'pick');
    for (let x = 4; x < 320; x += 26) blit16(['tree_b', 'tree_a', 'tree_c'][(x / 26 | 0) % 3], x, 100 + (x % 3));
    baked('pave_base', ROAD_TOP - 6, ROAD_BOT, baseCourse);
    // the mat, column by column (game columns 0..159 -> x 0..318)
    const win0 = PAVE ? PAVE.w0 : 85, win1 = PAVE ? PAVE.w1 : 135;
    let wl = -1, wr = -1;
    for (let c = 0; c < 160; c++) {
      const T = m.temp[c]; if (T === undefined) continue;
      matColumn(c * 2, T, m.dens[c] || 0, !!m.shoved[c]);
      if (T >= win0 && T <= win1 && !m.shoved[c] && (m.dens[c] || 0) < 1) { if (wl < 0) wl = c * 2; wr = c * 2 + 2; }
    }
    // the rolling window: green bracket above and below the mat columns that are ready to roll
    if (wl >= 0) {
      P(wl, MAT_TOP - 3, wr - wl, 1, K.win); P(wl, MAT_TOP + MAT_H + 1, wr - wl, 1, K.win);
      P(wl, MAT_TOP - 3, 1, 3, K.win); P(wr - 1, MAT_TOP - 3, 1, 3, K.win); P(wl, MAT_TOP + MAT_H - 1, 1, 3, K.win); P(wr - 1, MAT_TOP + MAT_H - 1, 1, 3, K.win);
    }
    // steam off the hot part of the mat
    for (let c = 0; c < 160; c += 9) { const T = m.temp[c]; if (T !== undefined && T > 110) steam(c * 2 + 2, MAT_TOP, t, c); }
    // asphalt truck backing into the hopper while the paver is stopped
    const px = m.px * 2;
    if (m.stop > 0) { const tx = px + 44 + Math.max(0, m.stop - 1.6) * 60; blit16('rock_truck_loaded', tx, ROAD_BOT, { flip: true }); }
    paver(px, ROAD_BOT, t, m.stop > 0);
    roller(m.rx * 2, ROAD_BOT, t);
    // Lenny on the bench, watching. Arms crossed is implied.
    blit16('person', 300, ROAD_TOP - 6, { pal: { H: '#f2c400', h: '#c99d00', S: '#8a2a2a', s: '#5e1a1a', V: '#8a2a2a' }, flip: true });
    for (let i = 0; i < 2; i++) { const x = ((i * 150 + t * 10) % 360) - 20, y = 20 + i * 10 + Math.sin(t * 1.5 + i) * 3; blit16(Math.floor(t * 4 + i) % 2 ? 'bird_1' : 'bird_0', x, y); }
  };
})();
