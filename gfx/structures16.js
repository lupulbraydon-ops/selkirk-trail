// structures16.js — procedural structure drawing for the Selkirk Trail v16 ("16-bit") prototype.
// Plain script, no modules. Relies on the renderer's globals: P(x,y,w,h,c), L(x1,y1,x2,y2,c,w), ctx, PX.
// Everything is parametric in logical pixels, so the same code serves the 640x372 main scene (PX=2)
// and the 320x186 pick mini-game (PX=4). Light comes from the top-left: left/top faces are hi,
// right faces are shade. night=true dims every tone ~35% toward the night-sky blue #0b1030,
// except the crane tip light.
//
//   abutment16(x, top, w, h, stage, night)  stage 1 = plywood formwork; stage>=2 = finished concrete
//   girderSpan16(x1, x2, y, paved, night, h) girders from x1 to x2 with top edge y (h optional, default 12)
//   multiplate16(cx, cy, r, withBear, night) corrugated arch; returns the floor y for the bear sprite's base
//   craneBoom16(x1, y1, x2, y2, night)      lattice boom from foot (x1,y1) to tip (x2,y2), pendants back to the cab
//   cable16(x1, y1, x2, y2)                 thin steel cable with a lighter core
//   stakes16(x, y)                          survey stakes with pink flagging, feet on ground line y
//   formworkPile16(x, base)                 stacked plywood and walers, bottom-left at (x, base)

(function () {
  // ---- palette (master palette from BRIEF.md plus a handful of extras) ----
  const S16 = {
    conHi: '#dcdcdc', conBase: '#c4c4c4', conSh: '#9a9a9a', conDeep: '#6f6f6f', conInk: '#4a4a4a',
    ply: '#c69a5c', plyHi: '#dbb478', seam: '#8a6537',            // extra: plyHi
    lumHi: '#b08a55', lumBase: '#8a6537', lumSh: '#5a4020',       // extra: lumHi (lumber walers/braces)
    steelHi: '#c8ccd2', steel: '#7c8289', steelSh: '#4a4f56',
    rust: '#9c4f2a', rustHi: '#c2733f',                           // extra: rust, rustHi (rebar)
    gTop: '#c85a2c', gTopHi: '#e07a40', gWeb: '#8b3a1c', gBot: '#4d1e0c', // extra: gTopHi
    catHi: '#ffe466', cat: '#f2c400', catSh: '#c99d00', catDeep: '#8a6a00',
    roadHi: '#a0a0a0', road: '#8d8d8d', roadSh: '#6f6f6f', roadEdge: '#505050', dash: '#f2c400',
    gravHi: '#d2c7ac', grav: '#b9ab8d', gravSh: '#8f836a',
    dirtDark: '#3f2408', dirtSh: '#5e3812',
    cave1: '#2f1c0a', cave2: '#1e1206', cave3: '#120a04',         // extra: cave interior gradient
    pink: '#ff5fb0', pinkSh: '#d0308a',                            // extra: flagging
    white: '#d0d4dc', whiteSh: '#9aa0ac', ink: '#141018',
    beacon: '#ffb000', lamp: '#ffe9a0',
  };

  // ---- night dimming: mix 35% toward #0b1030, cached per hex ----
  const NIGHT = [0x0b, 0x10, 0x30], DIM = 0.35, dimCache = new Map();
  function tone(hex, night) {
    if (!night) return hex;
    let c = dimCache.get(hex);
    if (c) return c;
    const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
    const m = (v, n) => Math.round(v + (n - v) * DIM);
    c = '#' + [m(r, NIGHT[0]), m(g, NIGHT[1]), m(b, NIGHT[2])].map(v => v.toString(16).padStart(2, '0')).join('');
    dimCache.set(hex, c);
    return c;
  }
  // per-call palette view: T.conHi etc. resolved for day/night
  function pal(night) {
    if (!night) return S16;
    if (!pal.night) { pal.night = {}; for (const k in S16) pal.night[k] = tone(S16[k], true); }
    return pal.night;
  }
  const R = Math.round;

  // =====================================================================================
  // abutment16(x, top, w, h, stage, night)
  //   x, top  : top-left of the abutment body (logical px). w, h: body size.
  //   stage   : 1 = plywood formwork (walers, form ties, kicker braces, rebar sticking up)
  //             >=2 = finished concrete (chamfered top, lift joints, bearing seat, weep hole, tie holes)
  //   The bearing seat sits ABOVE the body at rows top-2..top-1 (the mini-game overlays its green seat there).
  // =====================================================================================
  window.abutment16 = function (x, top, w, h, stage, night) {
    const T = pal(night);
    x = R(x); top = R(top); w = R(w); h = R(h);
    const big = w >= 32;
    if (stage <= 1) {
      // --- plywood formwork ---
      P(x, top, w, h, T.ply);
      P(x, top, 1, h, T.plyHi);                 // lit left edge
      P(x, top, w, 1, T.plyHi);                 // lit top edge
      P(x + w - 1, top, 1, h, T.seam);          // shade right edge
      // sheet seams: vertical every step, one horizontal at mid height
      const step = big ? 16 : Math.max(6, Math.floor(w / 2));
      for (let sx = x + step; sx < x + w - 1; sx += step) P(sx, top + 1, 1, h - 1, T.seam);
      P(x + 1, top + Math.floor(h / 2), w - 2, 1, T.seam);
      // walers: horizontal double 2x4s every 10px, sticking 1px past each side
      const wal = big ? 12 : 10;
      for (let wy = top + 4; wy < top + h - 2; wy += wal) {
        P(x - 1, wy, w + 2, 3, T.lumBase);
        P(x - 1, wy, w + 2, 1, T.lumHi);
        P(x - 1, wy + 2, w + 2, 1, T.lumSh);
        P(x + w, wy, 1, 3, T.lumSh);            // end grain on the shade side
        // form ties through the walers: nut plate + tie end
        for (let tx = x + 4; tx < x + w - 2; tx += 8) {
          P(tx, wy + 1, 1, 1, T.steelHi);
          P(tx + 1, wy + 1, 1, 1, T.steelSh);
        }
      }
      // kicker braces: lumber from the lower third of the form out to a stake on the ground
      const kick = Math.max(6, R(h * 0.28)), ky = top + R(h * 0.45), foot = top + h;
      L(x - 1, ky, x - kick, foot, T.lumBase, 1);
      L(x - 1, ky + 1, x - kick, foot + 1, T.lumSh, 0.5);
      L(x + w + 1, ky, x + w + kick, foot, T.lumBase, 1);
      L(x + w + 1, ky + 1, x + w + kick, foot + 1, T.lumSh, 0.5);
      P(x - kick - 1, foot - 3, 1, 3, T.lumSh);   // stakes at the brace feet
      P(x + w + kick, foot - 3, 1, 3, T.lumSh);
      // rebar sticking up out of the form (dowels for the seat), with one horizontal bar tying them
      const rh = Math.max(6, R(w * 0.4));
      for (let bx = x + 3, i = 0; bx < x + w - 2; bx += 3, i++) {
        const bh = rh - (i % 2);
        P(bx, top - bh, 1, bh, T.rust);
        P(bx, top - bh, 1, 1, T.rustHi);
      }
      P(x + 2, top - rh + 2, w - 4, 1, T.rust);
      return;
    }
    // --- finished concrete ---
    const c = big ? 2 : 1;                      // chamfer size
    for (let i = 0; i < c; i++) P(x + (c - i), top + i, w - 2 * (c - i), 1, T.conHi);
    P(x, top + c, w, h - c, T.conBase);
    P(x, top + c, big ? 2 : 1, h - c, T.conHi);          // lit face
    P(x + w - (big ? 2 : 1), top + c, big ? 2 : 1, h - c, T.conSh); // shade face
    if (big) P(x + w - 1, top + c, 1, h - c, T.conDeep);  // deep shade on the far right
    P(x + w - 1 - (big ? 1 : 0), top + c - 1, 1, 1, T.conSh); // chamfer corner catches shade
    // lift joint lines every ~h/3 with a lit edge under each
    const lift = Math.max(8, R(h / 3));
    for (let ly = top + lift; ly < top + h - 3; ly += lift) {
      P(x + 1, ly, w - 2, 1, T.conSh);
      P(x + 1, ly + 1, w - 2, 1, T.conHi);
    }
    // tie holes: grid of recessed dots between the lift joints
    for (let ty = top + Math.floor(lift / 2); ty < top + h - 2; ty += lift)
      for (let tx = x + 4; tx < x + w - 2; tx += 8) P(tx, ty, 1, 1, T.conDeep);
    // weep hole low on the face with a drip stain
    const wx = x + R(w * 0.35), wy = top + h - Math.max(6, R(h * 0.3));
    P(wx, wy, 2, 2, T.conInk);
    P(wx, wy + 2, 1, Math.min(4, top + h - wy - 2), T.conSh);
    // bearing seat: raised pad centred on top
    const sw = Math.max(4, R(w * 0.5)), sx = x + Math.floor((w - sw) / 2);
    P(sx, top - 2, sw, 2, T.conHi);
    P(sx + sw - 1, top - 2, 1, 2, T.conSh);
    P(sx, top - 1, sw - 1, 1, T.conBase);
  };

  // =====================================================================================
  // girderSpan16(x1, x2, y, paved, night, h)
  //   x1, x2 : left and right ends of the span. y: top edge of the girder/deck zone.
  //   paved  : false = bare girders (top flange hi, web, bottom flange shade, diaphragms every 40px)
  //            true  = asphalt deck with dashes on top, concrete curb, guardrail posts and rail above y
  //   h      : optional total height (default 12; the mini-game's set girders use 10)
  // =====================================================================================
  function girderBody(T, x1, x2, y, h) {
    const w = x2 - x1;
    const th = Math.max(2, R(h / 5)), bf = Math.max(1, R(h / 6));
    P(x1, y, w, th, T.gTop);
    P(x1, y, w, 1, T.gTopHi);                 // top flange highlight
    P(x1, y + th, w, h - th - bf, T.gWeb);
    P(x1, y + th, w, 1, T.gBot);              // flange underside shadow on the web
    P(x1, y + h - bf, w, bf, T.gBot);
    // diaphragms / stiffeners every 40px plus one at each end, with bolt heads
    const webTop = y + th + 1, webH = h - th - bf - 1;
    const stiff = (sx) => {
      P(sx, webTop, 2, webH, T.gBot);
      P(sx, webTop, 1, webH, T.gTop);
      if (webH >= 4) { P(sx + 1, webTop + 1, 1, 1, T.steelHi); P(sx + 1, webTop + webH - 2, 1, 1, T.steelHi); }
    };
    stiff(x1); stiff(x2 - 2);
    for (let sx = x1 + 20; sx < x2 - 4; sx += 40) stiff(sx);
  }
  window.girderSpan16 = function (x1, x2, y, paved, night, h) {
    const T = pal(night);
    x1 = R(x1); x2 = R(x2); y = R(y); h = R(h || 12);
    if (x2 <= x1) return;
    const w = x2 - x1;
    if (!paved) { girderBody(T, x1, x2, y, h); return; }
    // deck: curb row, asphalt with dashes, deck-edge shade row; girders compressed beneath
    const dh = Math.max(4, R(h * 0.4));
    P(x1, y, w, 1, T.conHi);                                   // curb
    P(x1, y + 1, w, dh - 2, T.road);
    P(x1, y + 1, w, 1, T.roadHi);
    P(x1, y + dh - 1, w, 1, T.roadSh);                          // deck edge underside
    const dy = y + 1 + Math.floor((dh - 2) / 2);
    for (let dx = x1 + 2; dx < x2 - 4; dx += 10) P(dx, dy, 4, 1, T.dash);
    girderBody(T, x1, x2, y + dh, h - dh);
    // guardrail: W-beam rail (2 rows) on posts every 16px, above the curb
    for (let px = x1 + 4; px < x2 - 1; px += 16) P(px, y - 2, 1, 2, T.steel);
    P(x1 + 1, y - 4, w - 2, 1, T.steelHi);
    P(x1 + 1, y - 3, w - 2, 1, T.steel);
    P(x2 - 2, y - 4, 1, 2, T.steelSh);                          // rail end in shade
  };

  // =====================================================================================
  // multiplate16(cx, cy, r, withBear, night)
  //   cx, cy : centre of the arch at ground level (the flat floor). r: outside radius.
  //   withBear: true when the bear stage is on; the bear itself is a sprite the renderer draws,
  //            so this only widens the gravel floor slightly. Returns floorY: the top row of the
  //            gravel floor, i.e. the `base` to pass to blit16 for the bear.
  //   Rings alternate light/dark along the arc (corrugation), with bolted seams every 8px of arc.
  // =====================================================================================
  window.multiplate16 = function (cx, cy, r, withBear, night) {
    const T = pal(night);
    cx = R(cx); cy = R(cy); r = R(r);
    const ring = Math.max(2, R(r / 8)), ri = r - ring;
    const half = (rad, dy) => rad > dy ? Math.sqrt(rad * rad - dy * dy) : 0;
    for (let dy = 0; dy <= r; dy++) {
      const yy = cy - dy;
      // dark interior with a gradient, as three concentric run-fills per row (brown near the plates,
      // near-black in the middle)
      const w1 = half(ri, dy), w2 = half(ri * 0.72, dy), w3 = half(ri * 0.42, dy);
      if (w1 > 0) P(cx - w1, yy, 2 * w1, 1, T.cave1);
      if (w2 > 0) P(cx - w2, yy, 2 * w2, 1, T.cave2);
      if (w3 > 0) P(cx - w3, yy, 2 * w3, 1, T.cave3);
      // corrugated ring, pixel by pixel but only across the band: light/dark bands along the arc,
      // seams with bolt heads every 8px of arc, highlight on the top-left, outline on the shade side
      const wo = half(r + 0.5, dy);
      for (let side = -1; side <= 1; side += 2) {
        const from = Math.floor(w1), to = Math.ceil(wo);
        for (let ax = from; ax <= to; ax++) {
          const dx = side * ax;
          if (side > 0 && ax === 0) continue;                 // don't double-draw the centre column
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < ri || d > r + 0.5) continue;
          const theta = Math.atan2(dy, dx);                  // 0 at right, PI at left
          const s = theta * r;
          const seam = (s % 8) < 1.1;
          const band = Math.floor(s / 2) % 2 === 0;
          const litSide = dx < -r * 0.15 || dy > r * 0.6;    // top-left gets the highlight
          let col;
          if (seam) col = (d >= ri + ring * 0.35 && d < ri + ring * 0.7) ? T.steelHi : T.steelSh;
          else if (band) col = litSide ? T.conHi : T.conBase;
          else col = litSide ? T.conSh : T.conDeep;
          if (d > r - 0.6 && dx > r * 0.2) col = T.steelSh;   // partial outline on the shade side
          P(cx + dx, yy, 1, 1, col);
        }
      }
    }
    // gravel floor inside the arch (3 rows), lit top row, and a spill apron 1px past each side
    const fw = ri + (withBear ? 1 : 0), floorY = cy - 2;
    P(cx - fw, floorY, 2 * fw, 3, T.grav);
    P(cx - fw, floorY, 2 * fw, 1, T.gravHi);
    for (let gx = cx - fw + 1; gx < cx + fw - 1; gx += 3) P(gx, floorY + 1 + ((gx * 5) % 2), 1, 1, T.gravSh);
    P(cx - r - 1, cy, 2 * r + 2, 1, T.gravSh);              // bedding line under the plates
    return floorY;
  };

  // =====================================================================================
  // craneBoom16(x1, y1, x2, y2, night)
  //   (x1,y1) boom foot at the crane's pivot, (x2,y2) boom tip. Lattice boom: two CAT-yellow chords 3px
  //   apart (lit chord toward the top-left, shade chord toward the bottom-right), diagonal lacing every
  //   6px, a tip sheave, an amber tip light (never dimmed), and two grey pendant lines back to the cab.
  // =====================================================================================
  window.craneBoom16 = function (x1, y1, x2, y2, night) {
    const T = pal(night);
    const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy);
    if (len < 1) return;
    const ux = dx / len, uy = dy / len;         // along the boom
    const nx = -uy, ny = ux;                    // perpendicular (points down-right for an up-right boom)
    const A = (s) => [x1 + ux * s - nx * 1.5, y1 + uy * s - ny * 1.5];   // lit chord
    const B = (s) => [x1 + ux * s + nx * 1.5, y1 + uy * s + ny * 1.5];   // shade chord
    // pendants first so the chords draw over them at the tip
    L(x2 - ux * 2 - nx * 3, y2 - uy * 2 - ny * 3, x1 + 6, y1 - 12, T.steel, 0.5);
    L(x2 - ux * 3 - nx * 3, y2 - uy * 3 - ny * 3, x1 + 9, y1 - 12, T.steelHi, 0.4);
    // lacing: zig-zag between the chords every 6px
    let prev = A(0);
    for (let s = 6, i = 1; s <= len; s += 6, i++) {
      const p = (i % 2) ? B(s) : A(s);
      L(prev[0], prev[1], p[0], p[1], T.catSh, 0.5);
      prev = p;
    }
    // chords: base line with a hi (or shade) line on the outside edge
    const a0 = A(0), a1 = A(len), b0 = B(0), b1 = B(len);
    L(a0[0], a0[1], a1[0], a1[1], T.cat, 1.2);
    L(a0[0] - nx * 0.5, a0[1] - ny * 0.5, a1[0] - nx * 0.5, a1[1] - ny * 0.5, T.catHi, 0.5);
    L(b0[0], b0[1], b1[0], b1[1], T.cat, 1.2);
    L(b0[0] + nx * 0.5, b0[1] + ny * 0.5, b1[0] + nx * 0.5, b1[1] + ny * 0.5, T.catSh, 0.5);
    // boom foot pin
    P(R(x1) - 1, R(y1) - 1, 3, 3, T.catSh);
    P(R(x1), R(y1), 1, 1, T.steelHi);
    // tip sheave: 4x4 yellow block, corners knocked off, steel axle, hi top-left
    const tx = R(x2), ty = R(y2);
    P(tx - 1, ty - 2, 4, 4, T.cat);
    P(tx - 1, ty - 2, 3, 1, T.catHi);
    P(tx - 1, ty - 2, 1, 3, T.catHi);
    P(tx + 2, ty - 1, 1, 3, T.catSh);
    P(tx, ty + 1, 3, 1, T.catSh);
    P(tx - 1, ty - 2, 1, 1, T.catDeep); P(tx + 2, ty - 2, 1, 1, T.catDeep);
    P(tx - 1, ty + 1, 1, 1, T.catDeep); P(tx + 2, ty + 1, 1, 1, T.catDeep);
    P(tx, ty - 1, 2, 2, T.steel);
    P(tx, ty - 1, 1, 1, T.steelHi);
    // tip light: amber, never dimmed; glows at night
    if (night) {
      ctx.save(); ctx.globalAlpha = 0.35; P(tx, ty - 5, 3, 3, S16.lamp); ctx.restore();
      P(tx + 1, ty - 4, 1, 1, S16.beacon);
    } else P(tx + 1, ty - 4, 1, 1, S16.beacon);
    P(tx + 1, ty - 3, 1, 1, T.steelSh);          // light bracket
  };

  // =====================================================================================
  // cable16(x1, y1, x2, y2) — thin steel cable, 1px with a lighter core.
  // =====================================================================================
  window.cable16 = function (x1, y1, x2, y2) {
    L(x1, y1, x2, y2, S16.steel, 1);
    L(x1, y1, x2, y2, S16.steelHi, 0.4);
  };

  // =====================================================================================
  // stakes16(x, y) — survey layout: two laths with pink flagging and a wooden hub with a nail
  //   between them. x = left edge, y = ground line (feet of the stakes).
  // =====================================================================================
  window.stakes16 = function (x, y) {
    x = R(x); y = R(y);
    const lath = (lx, hgt, flip) => {
      P(lx, y - hgt, 1, hgt, S16.white);
      P(lx, y - hgt, 1, 2, S16.whiteSh);          // dirty top edge
      P(lx, y - 1, 1, 1, S16.whiteSh);            // mud at the foot
      // flagging: a 3px ribbon off the top, blowing to the right (or left)
      if (flip) { P(lx - 3, y - hgt + 1, 3, 1, S16.pink); P(lx - 2, y - hgt + 2, 2, 1, S16.pinkSh); }
      else { P(lx + 1, y - hgt + 1, 3, 1, S16.pink); P(lx + 1, y - hgt + 2, 2, 1, S16.pinkSh); }
    };
    lath(x, 11, false);
    lath(x + 22, 9, true);
    // hub: short wooden stake with a nail head, and a lath-with-flagging leaning beside it
    P(x + 10, y - 3, 2, 3, S16.lumBase);
    P(x + 10, y - 3, 1, 3, S16.lumHi);
    P(x + 11, y - 4, 1, 1, S16.steelHi);
    L(x + 13, y, x + 15, y - 7, S16.white, 0.6);
    P(x + 15, y - 8, 2, 1, S16.pink);
    // ground shadow row
    P(x, y, 18, 1, S16.ink);
  };

  // =====================================================================================
  // formworkPile16(x, base) — a stack of plywood sheets lying flat with walers (2x4s) piled on top
  //   and a bundle of tie rods leaning against the side. x = left edge, base = ground line.
  // =====================================================================================
  window.formworkPile16 = function (x, base) {
    x = R(x); base = R(base);
    // three plywood sheets, 24 wide, 2 tall, each offset a pixel so the stack reads as sheets
    for (let i = 0; i < 3; i++) {
      const sy = base - 2 - i * 2, sx = x + (i % 2);
      P(sx, sy, 24, 2, S16.ply);
      P(sx, sy, 24, 1, S16.plyHi);
      P(sx + 23, sy, 1, 2, S16.seam);            // end grain (shade side)
      P(sx, sy + 1, 24, 1, S16.seam);            // sheet edge line
    }
    // walers: two rows of 2x4s on top, 18 wide, 3 tall, lit top, shade bottom
    for (let i = 0; i < 2; i++) {
      const wy = base - 8 - i * 3, wx = x + 3 + i;
      P(wx, wy, 18, 3, S16.lumBase);
      P(wx, wy, 18, 1, S16.lumHi);
      P(wx, wy + 2, 18, 1, S16.lumSh);
      P(wx + 17, wy, 1, 3, S16.lumSh);
    }
    // banding strap over the stack
    P(x + 12, base - 14, 1, 12, S16.steelSh);
    P(x + 12, base - 14, 1, 1, S16.steelHi);
    // tie rods leaning on the shade side
    L(x + 26, base, x + 30, base - 12, S16.steel, 0.6);
    L(x + 27, base, x + 31, base - 11, S16.steelHi, 0.4);
    // ground shadow row
    P(x + 2, base, 26, 1, S16.ink);
  };

  window.STRUCT16_PAL = S16;   // exposed for the renderer (e.g. green seat overlays, matching tones)
})();
