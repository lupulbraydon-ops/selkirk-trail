# Selkirk Trail

An Oregon Trail homage set on the Trans-Canada expansion east of Golden, BC.
Twelve kilometres of highway, one bridge, one multiplate wildlife crossing, and Andy Smith.

## Play

Open `index.html` in any browser (double-click it). No install, no build. The 16-bit art lives in `gfx/` (sprites as ASCII grids, procedural terrain and structures, one renderer per mini-game scene); index.html loads them with plain script tags.
Internet is only needed for the pixel font; without it the game falls back to Courier New.

Keys: ENTER to continue, number keys or arrow keys to choose, LEFT/RIGHT to buy or return in the yard.

## Mini-games

- **Load the Rock Trucks**: excavator timing game. Tap or SPACE when the bucket is over the box (bar turns green). Six buckets per truck, 30 seconds, four spills and Tanya shuts it down. Each truck loaded adds a little progress.
- **Cut the Grade**: the grader drives itself; you set the blade with UP/DOWN or by dragging. Shave to the yellow string line. 80%+ on grade earns progress and Mel's silence; under 55% is a re-grade week.
- **Blast the Rock Cut**: eight drill holes; the powder charge rises and falls, tap to lock it in the green band. Light = toe for the hoe ram, heavy = flyrock onto the pickup. Then Tanya's horn and the shot.
- **Set the Girders**: crane pick with Joe on the abutment. The girder swings on the hook and keeps swinging while it lowers; tap to lower, land both ends on the green seats. Two in the creek and Tanya shuts down the lift.
- **Harsh's ATP Package**: papers land on the desk; real cut sheets go right (submit to Mel), Harsh's nonsense goes left (shredder). Three pieces of nonsense reach Mel and the ATP is denied.
- **Scott's Phone**: 100 calls waiting. Each call shows a question from Mel, Andy, the crew, the plant or a trucker; pick the answer a site super would give (tap or 1/2/3) before the bar runs out. Wrong ones get back to Andy. Sixty seconds.
- **Adam's Dewatering**: tap to work the pump and keep the culvert trench below the yellow bed line while the labour crew places six sections. Rain bursts, and the pump loses prime if you stop for two seconds.

All seven are scheduled once per job, in order, packed into the first 3.5 km (phone 0.35, excavator 0.8, ATP package 1.2, blasting 1.6, culvert 2.1, crane pick 2.5, grader 3.4). Playing one from the site menu counts as its scheduled play. A random "mini-game" event can add extra plays, but it only repeats a game once all seven have been played. The title screen also has "Just play the mini-games" for an arcade mode with no job state.

## Dev

`node dev-server.js` serves the game at http://localhost:8765/ and accepts screenshot uploads
(`POST /shot?name=x`) into `screenshots/`. In the browser console, `ST` exposes the game state,
`ST.CFG` the tuning knobs (speed, event rate, burn rate, how late Andy tolerates), and
`MILESTONES[i].deadline` the deadlines.

## Tuning (v1)

Simulated with a dumb auto-player (never rests, random choices): about 78% survive,
average two crew members fired by Andy, average loss about $44.5M, most deaths are
"you didn't finish the bridge". Change `CFG` at the top of the script section to adjust.

## Cast

Andy Smith (CM), Mel (MOTI), Scott (Site Super), Lenny (GF earthworks), Louie (foreman), Adam (labour foreman), Joe, Harsh (project engineer, paperwork), Tanya (Safety). Killed means fired. Mostly.

## Phone version

Published as a private claude.ai Artifact: https://claude.ai/artifact/DrhkVF5ox4kKB8YdvWFN7A
Share it from the page's Share menu (anyone with the link). Plays in the phone browser, no install.
Touch controls: tap a menu line to pick it, tap anywhere else to continue, +/- buttons in the yard.
On a portrait phone the game auto-rotates; hold the phone sideways.

Rebuild the artifact file after changes: `node build-artifact.js <out.html>`, then republish that file to the same URL.

## Public hosting with an access code

The game asks for an access code on any hosted copy (Artifact link or GitHub Pages). Locally there is no gate. Current code: ANDY45 (case-insensitive). To change it, replace the hash in
index.html (search for GATE=) with the output of:

    node -e "console.log(require('crypto').createHash('sha256').update('NEWCODE').digest('hex'))"

Live on GitHub Pages: https://lupulbraydon-ops.github.io/selkirk-trail/  (repo lupulbraydon-ops/selkirk-trail, branch main, root).
To update: edit index.html, then `git add -A && git commit -m "..." && git push`. Pages rebuilds in about a minute.

## Graphics (16-bit)

Since 2026-09-23 the game renders in a "16-bit" style: the site scene is a 640x372 grid at PX=2 and the mini-games 320x186 at PX=4.
- `gfx/blit16.js`: sprite blitter (pre-renders each sprite once to an offscreen canvas).
- `gfx/sprites/*.js`: 58 sprites as ASCII row grids with per-sprite palettes (format and style guide in `gfx/BRIEF.md`). Validate with `node gfx/validate.js` (PREVIEW=1 prints them).
- `gfx/terrain16.js`, `gfx/structures16.js`: procedural sky/mountains/ground/creek/road and abutments/girders/multiplate/crane boom, baked once per state.
- `gfx/scenes/*16.js`: one pure renderer per mini-game (renderMGLoad16 etc.); game logic stays in index.html.
- `build-artifact.js` inlines all of these into one file for the claude.ai Artifact.
The 10-bit look is kept locally in `v8/` (gitignored); the 8-bit original is the previous commit of index.html.
