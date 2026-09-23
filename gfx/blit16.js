// blit16: sprite blitter for the v16 prototype. Sprites are {w,h,anchor,pal,rows}; rows are strings, '.' = transparent.
// Pre-renders each (sprite, palette override, flip) combination once to an offscreen canvas and drawImages it at PX scale.
window.SPR16 = window.SPR16 || {};
(function(){
  const cache = new Map();
  function key(name, spr, pal, flip){ return name + '|' + (pal ? JSON.stringify(pal) : '') + '|' + (flip ? 'f' : ''); }
  function render(spr, pal, flip){
    const c = document.createElement('canvas'); c.width = spr.w; c.height = spr.h;
    const g = c.getContext('2d'); const P = Object.assign({}, spr.pal, pal || {});
    for (let y = 0; y < spr.h; y++) { const row = spr.rows[y] || ''; let x = 0;
      while (x < spr.w) { const ch = row[x]; if (!ch || ch === '.') { x++; continue; }
        let x2 = x + 1; while (x2 < spr.w && row[x2] === ch) x2++;
        g.fillStyle = P[ch] || '#ff00ff'; g.fillRect(flip ? spr.w - x2 : x, y, x2 - x, 1); x = x2; } }
    return c;
  }
  // blit16(spr | name, x, base, {pal, flip, alpha}) — (x, base) is where the anchor pixel lands, in logical units at the current PX.
  window.blit16 = function(spr, x, base, opts){
    opts = opts || {};
    const name = typeof spr === 'string' ? spr : (spr.__name || (spr.__name = 'anon' + cache.size));
    if (typeof spr === 'string') spr = SPR16[spr];
    if (!spr) return;
    const k = key(name, spr, opts.pal, opts.flip);
    let c = cache.get(k); if (!c) { c = render(spr, opts.pal, opts.flip); cache.set(k, c); }
    const ax = spr.anchor ? spr.anchor[0] : 0, ay = spr.anchor ? spr.anchor[1] : spr.h;
    const lx = Math.round(x - (opts.flip ? (spr.w - ax) : ax)), ly = Math.round(base - ay);
    if (opts.alpha !== undefined) { ctx.save(); ctx.globalAlpha = opts.alpha; }
    ctx.drawImage(c, lx * PX, ly * PX, spr.w * PX, spr.h * PX);
    if (opts.alpha !== undefined) ctx.restore();
  };
  window.blit16.clearCache = () => cache.clear();
})();
