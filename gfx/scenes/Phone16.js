// scenes/Phone16.js — 16-bit smartphone frame for Scott's phone mini-game (Selkirk Trail v16).
// Plain script, no modules, no fetch. Defines window.renderMGPhone16(m, t).
//
// The caller (drawMGPhone) has already drawn the 16-bit site scene and runs this INSTEAD of the old
// `fillRect(120,80,1040,640)` + white strokeRect panel background. Everything here is drawn with ctx
// directly in CANVAS coordinates (PX is irrelevant); every "pixel" is snapped to a 4px grid (U = 4) so it
// reads at the same density as the PX=4 mini-game grid.
//
// Drawn: a landscape phone body (ink outline, top-left highlight, base, bottom-right shade) with side
// buttons on the top edge, a dithered screen-light glow spilling onto the site, a bezel, a notch with
// camera + earpiece slot, a status bar (clock, signal bars, battery), an incoming-call header strip
// (canvas y 100..144, where the caller writes "INCOMING: ..."), a dark translucent screen below it
// (the caller draws the question, answers, ringing text, timer bar and flash text on top), and a home
// indicator. The static frame is baked once into an offscreen canvas; per frame only the status-bar
// items and the header strip are drawn.
//
// State read (never written): m.phase ('intro'|'play'|'over'), m.timeLeft (0..60), m.call (null or
// {c,q,a,correct,life,max}), m.flash, m.flashTxt. Nothing else is required; all reads are guarded.
// Sprites: none (no blit16 keys used).
(function () {
  'use strict';
  const W = typeof window !== 'undefined' ? window : globalThis;
  // index.html declares ctx with a top-level let, so it is a script-scope binding, not a window property: read it by name.
  const curCtx = () => (typeof ctx !== 'undefined' ? ctx : null);
  const curTxt = () => (typeof txt === 'function' ? txt : W.txt);
  const U = 4;                       // one "pixel"
  // screen rect the caller expects (canvas coords)
  const SX = 120, SY = 80, SW = 1040, SH = 640;
  const HDR_Y = 100, HDR_H = 44;     // incoming-call header strip (caller writes INCOMING at y=100, 40px)
  // palette (master steel/ink/glass tones; own colours marked *)
  const C = {
    ink: '#141018',
    bodyHi: '#5c626a', bodyBase: '#3a3e45', bodySh: '#23262c', bodyDeep: '#1a1c1e',   // * bodyHi/bodyBase/bodySh
    steelHi: '#c8ccd2', steelBase: '#7c8289', steelSh: '#4a4f56',
    screen: 'rgba(4,6,14,0.86)',                                                     // * (old panel was rgba(0,0,0,0.86))
    screenEdge: 'rgba(90,154,208,0.10)',
    glow: ['rgba(90,160,255,0.16)', 'rgba(90,160,255,0.09)', 'rgba(90,160,255,0.04)'],
    glassHi: '#d8f0ff', glassBase: '#9fd8ff', glassSh: '#5a9ad0',
    lens: '#1e2460',
    txt: '#d0d4dc', txtDim: '#9aa0ac',
    green: ['#3a9a2a', '#1d7a1d', '#166316'], amber: ['#ffe466', '#f2c400', '#c99d00'],
    red: ['#e0334a', '#b3001b', '#6e0010'],
    hdrCall: 'rgba(29,122,29,0.55)', hdrIdle: 'rgba(74,79,86,0.45)', hdrOver: 'rgba(110,0,16,0.55)',
  };

  // ---------- pixel helpers (canvas coords, snapped to U) ----------
  function R(g, x, y, w, h, c) { g.fillStyle = c; g.fillRect(x, y, w, h); }
  // stepped rounded rect: r in canvas px (multiple of U); corners are hand-stepped, no anti-aliasing
  function rr(g, x, y, w, h, r, c) {
    g.fillStyle = c;
    const ru = Math.max(0, Math.round(r / U));
    for (let i = 0; i < ru; i++) {
      const yc = ru - i - 0.5;
      const dx = (ru - Math.round(Math.sqrt(Math.max(0, ru * ru - yc * yc)))) * U;
      g.fillRect(x + dx, y + i * U, w - 2 * dx, U);
      g.fillRect(x + dx, y + h - (i + 1) * U, w - 2 * dx, U);
    }
    g.fillRect(x, y + ru * U, w, h - 2 * ru * U);
  }
  // checkerboard dither fill (50%)
  function dither(g, x, y, w, h, c, phase) {
    g.fillStyle = c;
    const x0 = Math.floor(x / U), y0 = Math.floor(y / U);
    for (let j = 0; j < h / U; j++) for (let i = 0; i < w / U; i++)
      if (((x0 + i + y0 + j + (phase || 0)) & 1) === 0) g.fillRect(x + i * U, y + j * U, U, U);
  }
  // dithered ring around a rounded rect (glow band): draws rr(c) then knocks the inside back out with clearRect-free trick:
  // we draw outer band as dither only in the band area by drawing rows/cols; cheap since it's baked once.
  function glowBand(g, x, y, w, h, r, thick, c, phase) {
    // top / bottom strips
    dither(g, x, y, w, thick, c, phase); dither(g, x, y + h - thick, w, thick, c, phase);
    // left / right strips (between)
    dither(g, x, y + thick, thick, h - 2 * thick, c, phase); dither(g, x + w - thick, y + thick, thick, h - 2 * thick, c, phase);
    void r;
  }

  // ---------- static frame, baked once ----------
  let baked = null;
  function bake() {
    if (baked) return baked;
    const doc = W.document;
    let cnv = null, g;
    if (doc && doc.createElement) {
      cnv = doc.createElement('canvas'); cnv.width = 1280; cnv.height = 744;
      g = cnv.getContext('2d');
    } else {
      g = curCtx(); // no DOM (self-check): draw straight to ctx, no cache
    }
    drawFrame(g);
    if (cnv) baked = cnv;
    return cnv;
  }
  function drawFrame(g) {
    const BX = 92, BY = 54, BW = 1096, BH = 690, BR = 40;       // body outline rect (fits scene area 0..744)
    // screen-light glow spilling onto the site: three dithered bands outside the body
    glowBand(g, BX - 24, BY - 24, BW + 48, BH + 24, BR, 8, C.glow[2], 1);
    glowBand(g, BX - 16, BY - 16, BW + 32, BH + 16, BR, 8, C.glow[1], 0);
    glowBand(g, BX - 8, BY - 8, BW + 16, BH + 8, BR, 8, C.glow[0], 1);
    // side buttons on the top edge (volume x2, power), lit top row
    for (const [bx, bw] of [[212, 56], [292, 56], [1032, 88]]) {
      R(g, bx, BY - 8, bw, 8, C.ink); R(g, bx + U, BY - 8, bw - 2 * U, U, C.bodyHi); R(g, bx + U, BY - 4, bw - 2 * U, U, C.bodyBase);
    }
    // body: ink outline, highlight (top-left), shade (bottom-right), base
    rr(g, BX, BY, BW, BH, BR, C.ink);
    rr(g, BX + U, BY + U, BW - 2 * U, BH - 2 * U, BR - U, C.bodyHi);
    rr(g, BX + 2 * U, BY + 2 * U, BW - 3 * U, BH - 3 * U, BR - 2 * U, C.bodySh);
    rr(g, BX + 2 * U, BY + 2 * U, BW - 4 * U, BH - 4 * U, BR - 2 * U, C.bodyBase);
    // dithered wear on the shade side of the body (lower-right rim)
    dither(g, BX + BW - 6 * U, BY + BR, 2 * U, BH - 2 * BR, C.bodySh, 0);
    dither(g, BX + BR, BY + BH - 6 * U, BW - 2 * BR, 2 * U, C.bodySh, 0);
    // bezel (ink) and the screen glass
    rr(g, SX - 8, SY - 8, SW + 16, SH + 16, 16, C.ink);
    R(g, SX, SY, SW, SH, C.screen);
    // glass edge light: 1px lighter rim along top and left of the screen, dithered second row
    R(g, SX, SY, SW, U, C.screenEdge); R(g, SX, SY, U, SH, C.screenEdge);
    dither(g, SX + U, SY + U, SW - 2 * U, U, C.screenEdge, 0); dither(g, SX + U, SY + U, U, SH - 2 * U, C.screenEdge, 0);
    // notch: dips from the bezel into the status bar (y 66..100), rounded bottom corners
    rr(g, 576, SY - 14, 128, 34, 8, C.ink);
    // camera lens (glass tones, specular top-left) and earpiece slot
    R(g, 600, 84, 12, 12, C.lens); R(g, 604, 88, 4, 4, C.glassSh); R(g, 600, 84, 4, 4, C.glassBase); R(g, 600, 84, 2, 2, C.glassHi);
    R(g, 624, 88, 48, 4, C.bodySh); R(g, 624, 88, 48, 2, C.bodyBase);
    // home indicator
    R(g, 580, 708, 120, U, C.steelSh); R(g, 580, 708, 120, 2, C.steelBase);
  }

  // ---------- per-frame bits ----------
  function drawStatusBar(g, m, t) {
    const T = curTxt();
    // clock: the sixty seconds run a minute a second, starting at 6:00 ("hundred calls since six")
    const left = Math.max(0, Math.min(60, +m.timeLeft || 0));
    const mm = Math.min(59, Math.floor(60 - left));
    if (typeof T === 'function') T('6:' + (mm < 10 ? '0' : '') + mm, SX + 20, SY - 2, 26, C.txt, 'left');
    // signal bars (mountain reception: flickers between 2 and 4 bars)
    const s = Math.sin(t * 0.7) * 0.5 + Math.sin(t * 1.9) * 0.5;
    const bars = s > 0.6 ? 4 : s > -0.3 ? 3 : 2;
    for (let i = 0; i < 4; i++) {
      const h = 4 + i * 4, x = SX + SW - 100 + i * 8, y = SY + 18 - h;
      R(g, x, y, U, h, i < bars ? C.steelHi : C.steelSh);
      if (i < bars) R(g, x, y, 2, h, '#ffffff'); // 1px specular left edge
    }
    // battery: drains with timeLeft/60; green > amber > red, blinks under 20%
    const frac = left / 60;
    const bx = SX + SW - 60, by = SY + 6, bw = 36, bh = 14;
    R(g, bx, by, bw, bh, C.steelBase); R(g, bx + 2, by + 2, bw - 4, bh - 4, C.bodyDeep); R(g, bx + bw, by + 4, U, bh - 8, C.steelBase);
    const tone = frac > 0.5 ? C.green : frac > 0.25 ? C.amber : C.red;
    const blink = frac < 0.2 && (Math.floor(t * 3) & 1);
    const fw = Math.max(0, Math.round((bw - 8) * frac / 2) * 2);
    if (fw > 0 && !blink) { R(g, bx + 4, by + 4, fw, bh - 8, tone[1]); R(g, bx + 4, by + 4, fw, 2, tone[0]); R(g, bx + 4, by + bh - 6, fw, 2, tone[2]); }
  }
  function drawHeader(g, m, t) {
    const call = !!m.call, over = m.phase === 'over';
    let bg = over ? C.hdrOver : call ? C.hdrCall : C.hdrIdle;
    R(g, SX, HDR_Y, SW, HDR_H, bg);
    // flash tint: red for a wrong/missed call, green for HANDLED, fading with m.flash
    const fl = +m.flash || 0;
    if (fl > 0) {
      const good = m.flashTxt === 'HANDLED';
      g.fillStyle = good ? 'rgba(58,154,42,' + (0.5 * Math.min(1, fl / 0.4)).toFixed(3) + ')' : 'rgba(224,51,74,' + (0.5 * Math.min(1, fl / 0.5)).toFixed(3) + ')';
      g.fillRect(SX, HDR_Y, SW, HDR_H);
    }
    // strip edges: light top row, dark bottom row
    R(g, SX, HDR_Y, SW, 2, 'rgba(200,204,210,0.25)'); R(g, SX, HDR_Y + HDR_H - U, SW, U, 'rgba(20,16,24,0.6)');
    // handset icon (left), shaking while ringing / no call; grey when the phone is done
    const shake = (!call && !over) ? Math.round(Math.sin(t * 40)) * 2 : 0;
    const hx = SX + 24 + shake, hy = HDR_Y + 10;
    const tone = over ? [C.steelHi, C.steelBase, C.steelSh] : C.green;
    // earpiece, handle, mouthpiece (3 tones, top-left light)
    R(g, hx, hy, 12, 8, tone[1]); R(g, hx, hy, 12, 2, tone[0]); R(g, hx, hy + 6, 12, 2, tone[2]);
    R(g, hx + 8, hy + 6, 4, 12, tone[1]); R(g, hx + 8, hy + 6, 2, 12, tone[0]);
    R(g, hx + 8, hy + 16, 16, 8, tone[1]); R(g, hx + 8, hy + 16, 16, 2, tone[0]); R(g, hx + 8, hy + 22, 16, 2, tone[2]);
    // ring waves while ringing; a steady "live" dot during a call
    if (!call && !over) {
      const f = Math.floor(t * 6) % 3;
      for (let i = 0; i <= f; i++) { const wx = hx + 30 + i * 8; R(g, wx, hy + 8 - i * 2, 2, 8 + i * 4, i === f ? C.txt : C.txtDim); }
    } else if (call) {
      const on = (Math.floor(t * 2) & 1) === 0;
      R(g, hx + 32, hy + 8, 8, 8, on ? C.green[0] : C.green[2]); R(g, hx + 32, hy + 8, 2, 2, on ? '#ffffff' : C.green[1]);
    }
  }

  W.renderMGPhone16 = function (m, t) {
    const g = curCtx(); if (!g) return;
    m = m || {}; t = +t || 0;
    g.save();
    try {
      g.globalAlpha = 1; g.imageSmoothingEnabled = false;
      const c = bake();
      if (c) g.drawImage(c, 0, 0);
      drawStatusBar(g, m, t);
      drawHeader(g, m, t);
    } finally { g.restore(); }
  };
  W.renderMGPhone16.clearCache = function () { baked = null; };
})();
