# Selkirk Trail

An Oregon Trail homage set on the Trans-Canada expansion east of Golden, BC.
Twelve kilometres of highway, one bridge, one multiplate wildlife crossing, and Andy Smith.

## Play

Open `index.html` in any browser (double-click it). No install, no build. The 16-bit art lives in `gfx/` (sprites as ASCII grids, procedural terrain and structures, one renderer per mini-game scene); index.html loads them with plain script tags.
Internet is only needed for the pixel font; without it the game falls back to Courier New.

Keys: ENTER to continue, number keys or arrow keys to choose, LEFT/RIGHT to buy or return in the yard. Pick a role on the second screen: EASY (Senior PM, $8M), NORMAL (PM, $5M) or HARD (Co-op, $3M, triple points).

## Mini-games

- **Load the Rock Trucks**: excavator timing game. Tap or SPACE when the bucket is over the box (bar turns green). Six buckets per truck, 60 seconds, five spills and Tanya shuts it down. The arm speeds up with every truck; a clean run is four trucks, two is adequate. Each truck loaded adds a little progress.
- **Cut the Grade**: the grader drives itself; you set the blade with UP/DOWN or by dragging. Shave to the yellow string line. 80%+ on grade earns progress and Mel's silence; under 55% is a re-grade week.
- **Blast the Rock Cut**: eight drill holes; the powder charge rises and falls, tap to lock it in the green band. Light = toe for the hoe ram, heavy = flyrock onto the pickup. Then Tanya's horn and the shot.
- **Set the Girders**: crane pick with Joe on the abutment. The girder swings on the hook and keeps swinging while it lowers; tap to lower, land both ends on the green seats. Two in the creek and Tanya shuts down the lift.
- **Harsh's ATP Package**: papers land on the desk; real cut sheets go right (submit to Mel), Harsh's nonsense goes left (shredder). Three pieces of nonsense reach Mel and the ATP is denied.
- **Scott's Phone**: 100 calls waiting. Each call shows a question from Mel, Andy, the crew, the plant or a trucker; pick the answer a site super would give (tap or 1/2/3) before the bar runs out. Wrong ones get back to Andy. Sixty seconds.
- **Adam's Dewatering**: tap to work the pump and keep the culvert trench below the yellow bed line while the labour crew places six sections. Rain bursts, and the pump loses prime if you stop for two seconds.
- **Roll the Mat**: the paver lays asphalt and drives itself; you drive the roller with LEFT/RIGHT or by dragging sideways. Compact the mat while it is inside the green window behind the paver (too close is too hot and shoves, too far back has gone cold). The paver stops when a truck backs into the hopper; stop with it, and do not hit it. 85% density is a clean job, 60% is adequate, under that is mill and re-pave.

Every game starts with a five-second PRACTICE beat with the goal on screen, then resets and counts for real. Each repeat play of a game is one level higher: faster (bucket arm, charge, calls, paper), narrower bands, more rain, and from level 3 the ATP package includes decoy cut sheets from the wrong job.

All eight are scheduled once per job, in order, spread over the six kilometres (phone 0.35, excavator 0.8, ATP package 1.2, blasting 1.6, culvert 2.1, crane pick 2.6, grader 4.4, paving 5.4). Playing one from the site menu counts as its scheduled play. A random "mini-game" event can add extra plays (at the next level), but it only repeats a game once all eight have been played. Games whose crew member is gone are skipped: no Adam, no dewatering; no Harsh, no ATP package; no Joe, no crane pick. The title screen also has "Just play the mini-games" for an arcade mode with no job state; levels carry across arcade plays.

## Milestones, Andy, and the crew

Each milestone (except paving) opens with a decision, river-crossing style: three options, and the odds the crew quotes are the real odds (Lenny's "seventy percent clean" shot on Gerald is 70%). The sure thing always costs a week or two.

Miss a deadline and Andy is on site asking for a name. You pick who goes, with the consequence spelled out, or take the blame yourself: the crew gets a coffee and Andy's tolerance for lateness drops by a week (he kills you at 8 weeks late by default, `CFG.lateKill`). Losing people matters now:
- Scott: site slows 5%, Andy's calls hit the crew twice as hard.
- Lenny: earthworks slow 10%.
- Louie: no more pry-bar fixes (and the pry-bar roll is 70% while he is around).
- Adam: no labour crew, so no dewatering game, no toad holds, no wrong ditches.
- Joe: bridge at 60% speed, nobody to set the girders.
- Harsh: no paperwork at all, which removes both the NCRs and the surprise change orders.
- Tanya: no shutdowns or four-hour meetings, but every injury costs 50% more health.

Whoever goes gets a cross with an epitaph you write (32 characters). Epitaphs persist in the browser and show up as roadside graves in later runs once you pass the km where it happened; "Look around" at a milestone reads the nearest one. "Call Andy" has a 35% chance of winning $500,000 of allowance (once every eight weeks); otherwise it costs the crew health. Events you have seen are weighted down (x0.25 per sighting) and the recurring ones (the CN train, the toad, the Denny's breakfast, the coffee) change text each time.

The HUD shows weeks left to the deadline, turns orange when you are late with how many weeks Andy tolerates, and shows every money and progress line item top-right as it happens (the weekly burn is not a line item).

## The yard

Week 1 is the Golden yard: list prices, the allowance is the limit. At every milestone the menu has "Visit the yard (Finning's truck is here)": same catalogue at 20% over list, returns credit 60%, and anything past the remaining allowance goes on EllisDon's account (the loss). Buy the crane at the Rock Cut and you skip the four-week, $2.5M Sterling rental at the bridge. Diesel burns 200 L a week plus 350 per truck, 500 per dozer, 250 per grader and 150 for the crane (times 1.3 or 1.6 at the faster paces); coffee is 14, 7 or 3 cups per person per week. Running out of diesel drops progress to 30% until the fuel truck arrives a week later ($45,000).

## Dev

`node dev-server.js` serves the game at http://localhost:8765/ and accepts screenshot uploads
(`POST /shot?name=x`) into `screenshots/`. In the browser console, `ST` exposes the game state,
`ST.CFG` the tuning knobs (speed, event rate, burn rate, how late Andy tolerates), and
`MILESTONES[i].deadline` the deadlines.

## Tuning (v3)

Simulated 300 runs per strategy with a dumb auto-player (always picks option 1, which at every milestone is the "sure thing" and at Andy's firing is the first name on the list; mini-games score the middle tier), driving `tick()` directly in the browser console:
- NORMAL ($5.0M), dozer + 4 trucks + grader, never revisits the yard: 32% survive, 3% also under $45M.
- NORMAL, same fleet, tops up diesel/coffee at each milestone and buys the crane at the Rock Cut: 78% survive, 66% under $45M, average loss $41.7M.
- NORMAL, same, Strenuous pace and a rest week whenever someone drops under 35 health: 100% survive, 83% under $45M, finishes around week 55.
- EASY ($8.0M), full fleet, visits the yard: 95% survive, 90% under $45M.
- HARD ($3.0M), dozer + 2 trucks, never buys more: 0% survive. Buy two more trucks and a grader at the first milestone on EllisDon's account, Strenuous, rest when tired: 100% survive, 67% under $45M. That is the HARD game: the money target, not survival.
Change `CFG` at the top of the script section (speed, event rate, burn, how late Andy tolerates), `SITE_MARKUP`, or the odds and week costs inside `CROSSINGS` to adjust.

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

Since 2026-09-23 the game renders in a "16-bit" style (v17 polish on 2026-10-23: hue-shifted shadows, snow caps and smoke haze, taller trees, strata and boulders in the cross-section, light pools at night, crew idle bob, screen shake and hit flash in the mini-games): the site scene is a 640x372 grid at PX=2 and the mini-games 320x186 at PX=4.
- `gfx/blit16.js`: sprite blitter (pre-renders each sprite once to an offscreen canvas).
- `gfx/sprites/*.js`: 60 sprites as ASCII row grids with per-sprite palettes (format and style guide in `gfx/BRIEF.md`). Validate with `node gfx/validate.js` (PREVIEW=1 prints them).
- `gfx/terrain16.js`, `gfx/structures16.js`: procedural sky/mountains/ground/creek/road and abutments/girders/multiplate/crane boom, baked once per state.
- `gfx/scenes/*16.js`: one pure renderer per mini-game (renderMGLoad16 etc.); game logic stays in index.html.
- `build-artifact.js` inlines all of these into one file for the claude.ai Artifact.
The 10-bit look is kept locally in `v8/` (gitignored); the 8-bit original is the previous commit of index.html.
