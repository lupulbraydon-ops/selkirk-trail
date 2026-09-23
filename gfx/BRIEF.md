# Selkirk Trail v16 — "16-bit" review prototype

Goal: three review screens that look like a SNES-era version of the same game: the day site scene, the night game-over scene, and the crane-pick mini-game. Same composition, same UI, same text box, same HUD; twice the pixel density and real sprite art.

## Grid and scale
- Canvas stays 1280x960. Scene area is the top 744px. Text box below is untouched.
- MAIN SCENE grid: **640 x 372 logical pixels at PX=2** (the current game is 320x186 at PX=4). Every old coordinate doubles.
- PICK MINI-GAME grid: **320 x 186 at PX=4** (current mini-games are 160x93 at PX=8). Every old mini-game coordinate doubles.
- Helpers available: `P(x,y,w,h,color)` fills a logical rect at the current PX; `L(x1,y1,x2,y2,color,widthLogical)` strokes a line; `blit16(spr, x, base, opts)` draws a sprite (see format). `PX` is a `let`; the renderer sets it and restores it in try/finally.

## Sprite file format (every artist writes files like this)
```js
// v16/sprites/<group>.js  — plain script, no modules
window.SPR16 = window.SPR16 || {};
SPR16.pickup_white = {
  w: 64, h: 30,            // rows.length === h, every row.length === w
  anchor: [0, 30],         // pixel placed at (x, base): [0,h] = bottom-left sits on the ground line
  pal: { W:'#ffffff', w:'#d0d4dc', d:'#9aa0ac', k:'#141018', g:'#9fd8ff', G:'#5a9ad0', t:'#1a1c1e', h:'#555555', o:'#ff7a00', r:'#e0334a' },
  rows: [
    "................................................................",
    // ... h rows of exactly w characters. '.' is transparent. Any other char must be in pal.
  ],
};
```
- Keep rows as string literals; no template tricks. Validate with `node v16/validate.js` (checks dimensions and palette keys, prints a crude ASCII preview).
- Facing: vehicles on the RIGHT side of the site travel LEFT (cab on the left); the dozer faces RIGHT (blade on the right); the crane faces RIGHT (boom to the right). The blitter supports `opts.flip` (mirror horizontally) so draw one facing and note it in a comment.
- Variants: give alternative frames/variants their own keys (`rock_truck_empty`, `rock_truck_loaded`, `tree_a`, `tree_b`, `tree_c`, `bird_0`, `bird_1`).
- Crew sprites use PALETTE ROLE KEYS that the renderer overrides per person: `H` hat, `S` shirt, `P` pants, `V` vest stripe (drawn only when the person has a vest; otherwise it takes the shirt colour), `F` skin, `f` skin shade, `k` ink. The renderer passes `opts.pal` overrides for H/S/P/V.

## Style guide (16-bit, SNES-ish)
- Light from top-left. Every surface has 3 tones minimum: highlight, base, shade; big surfaces get a 4th (deep shade) and a 1px specular on glass/chrome.
- Dark outlines: use `k` (#141018) on the OUTSIDE silhouette of vehicles and characters, not on every internal edge. Trees and rocks get a partial outline on the shade side only.
- No pure black except ink; no pure white except specular pixels and the white pickup's highlight.
- Sub-pixel feel: use 1-2px rounded corners on cabs and hoods, hub caps, mirrors, grille slats, fuel cans, warning beacons, mud on the lower third of every machine (dirt2/dirt4 spatter), bolt heads on structural steel.
- Anti-aliasing by hand: one intermediate tone between two large areas of different value, never a smear.
- Ground shadow: each vehicle/character sprite includes a 1px ink shadow row under the wheels/feet (row h-1), ~70% of the sprite width.

## Master palette (use these hex values; you may add up to 6 of your own per file)
sky: zenith #1f5fbf, upper #2f6fc8, mid #4f95e0, lower #7fb8ec, horizon #b9dcf5, cloud #f7fbff, cloudSh #d6e6f5
night sky: #05071a, #0b1030, #161c4c, #1e2460; moon #f3f0d8, moonSh #c9c6a8; stars #8a8fb8 #cfd4ff #ffffff
mountains far: lit #93aae6 base #7b93d9 shade #6a80c8 ; mid: lit #5f7fd4 base #5372c9 shade #4661b3 ; near: lit #3d5aa8 base #3552a0 shade #2f478c ; snow lit #f2f5ff base #dfe6fa shade #c9d4f0
night mountains: near #1e2470/#171b58, mid #2c39a8/#232e8a, far #4550c0/#3a44a6, snow #d9dfff/#a9b3e0
trees: hi #3f9a3a, base #2a7a2a, mid #1f5f22, shade #0f4d14, deep #083a0e, trunk #3a2a10, trunkHi #5a4020
grass: hi #3a9a2a, base #1d7a1d, shade #166316, shoulder #0f4a12
dirt: hi #a06a30, light #8f5a26, base #7a4a1c, shade #5e3812, dark #3f2408, bedrock #5b4a3c, bedrockHi #6e5c4c
rock/concrete: #dcdcdc #c4c4c4 #9a9a9a #6f6f6f #4a4a4a ; formwork ply #c69a5c seams #8a6537 ; steel #c8ccd2 #7c8289 #4a4f56
water: hi #5aa0ff, base #1f6fe0, deep #1550b0, foam #e8f4ff, ripple #8fc4ff
road: hi #a0a0a0 base #8d8d8d shade #6f6f6f edge #505050 ; gravel #d2c7ac #b9ab8d #8f836a ; dash #f2c400
CAT yellow: hi #ffe466, base #f2c400, shade #c99d00, deep #8a6a00 ; girder: top #c85a2c web #8b3a1c bottom #4d1e0c
orange: hi #ffa040 base #ff7a00 shade #b85400 ; red: hi #e0334a base #b3001b shade #6e0010
white: #ffffff #d0d4dc #9aa0ac ; skin: #f5cfa8 #e8b48a #c08a60 ; glass: #d8f0ff #9fd8ff #5a9ad0 ; tire #1a1c1e ; hub #555555 ; ink #141018
porta blue: hi #7aa0ff base #2255ff shade #1233b0 ; lamp #fff2a8 ; beam #ffe9a0 ; amber beacon #ffb000

## Main scene layout at 640x372 (old coordinate x 2)
- Sky rows 0..175. Mountain bases at y=176. Three layers, drawn per column like the current game (peaks list doubled).
- Grass strip y 172..200 (trees stand on it, y 160..200). Road surface y 200..212 (left 0..220, right 420..640). Dirt cross-section y 212..372 with strata; bedrock band from y 324.
- Creek: bowl centred x=320 from y 212 to 254, water from y 242. Abutments: left x 216..236, right x 404..424, tops y 208 (concrete) at stage>=2; formwork at stage 1. Girders/deck x 232..408, y 200..212. Railing y 196..200.
- Multiplate arch under the right road: centre (524,256), radius 24, bear inside at stage>=3.
- Left ground (x 0..220): white pickup at x=0 base 200 (64 wide); crane at x=68 base 200 (tracks 60 wide), boom tip around (224,28) with the girder hanging over the creek; crew standing at x = 132 + i*13, base 200 (7 people, 12 wide each); barricade at x=220; cone at 140.
- Right ground (x 420..640): rock trucks hauling on the road (60 wide, cab left), clipped to x>=420; dozer on the grass row at x=428 base 188 pushing a pile; Joe's red pickup on the grass at x=500 base 188; porta-potty at x=612 base 200; tombstones at x=568+ y 144; cone at 432.
- Night: same scene with night palettes for sky/mountains, a dark blue multiply wash over everything below the sky (about 0.35), work light from the crane tip, pickup headlights, lit cab windows, moon top-right, twinkling stars.

## Pick mini-game layout at 320x186
- Sky/ridge top; grass y 92..104 with trees; dirt from y 116. Creek bowl centred x=160, y 116..156, water from y 146.
- Abutments x 72..112 and 208..248, top y 116, bearing seats (green) at y 114, x 92..108 and 212..228. Set girders sit at y 106..116, x 96..224.
- Crane boom enters from off-screen left: from (-24,140) to (156,-8), lattice with pendants. Cable from (156,-4) to the hook block; slings to the girder ends; girder 128 wide, 10 tall.
- Joe stands on the right abutment at x=252 base 116 (crew sprite, white hat, red shirt).
- HUD text and the text box are unchanged (canvas coordinates).

## Hard rules
- Do not change game logic, text, hit zones, HUD positions, or the text box. The renderer only replaces drawing functions.
- Per-frame cost: sprites are pre-rendered to offscreen canvases by the blitter (cached); static terrain layers are baked once per palette; per-column loops at 640 columns are OK once per bake, not per frame.
- Everything must run from file:// and from a static host: plain <script src> tags, no modules, no fetch.
