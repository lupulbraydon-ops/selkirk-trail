# Selkirk Trail

An Oregon Trail homage set on the Trans-Canada expansion east of Golden, BC.
Twelve kilometres of highway, one bridge, one multiplate wildlife crossing, and Andy Smith.

## Play

Open `index.html` in any browser (double-click it). No install, no build, no assets.
Internet is only needed for the pixel font; without it the game falls back to Courier New.

Keys: ENTER to continue, number keys or arrow keys to choose, LEFT/RIGHT to buy or return in the yard.

## Mini-games

- **Load the Rock Trucks**: excavator timing game. Tap or SPACE when the bucket is over the box (bar turns green). Six buckets per truck, 30 seconds, four spills and Tanya shuts it down. Each truck loaded adds a little progress.
- **Cut the Grade**: the grader drives itself; you set the blade with UP/DOWN or by dragging. Shave to the yellow string line. 80%+ on grade earns progress and Mel's silence; under 55% is a re-grade week.
- **Blast the Rock Cut**: eight drill holes; the powder charge rises and falls, tap to lock it in the green band. Light = toe for the hoe ram, heavy = flyrock onto the pickup. Then Tanya's horn and the shot.
- **Set the Girders**: crane pick with Fredis on the abutment. The girder swings on the hook and keeps swinging while it lowers; tap to lower, land both ends on the green seats. Two in the creek and Fredis leaves for the airport.
- **Harsh's ATP Package**: papers land on the desk; real cut sheets go right (submit to Mel), Harsh's nonsense goes left (shredder). Three pieces of nonsense reach Mel and the ATP is denied.

All five trigger at set points on the job (after Clearing, mid rock cut, mid bridge, before the multiplate ATP, after the Multiplate), as random events, and from the site menu under Mini-games (each costs a week).

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

Andy Smith (CM), Mel (MOTI), Scott (Site Super), Lenny (GF earthworks), Louie (foreman), Adam (labour foreman), Fredis (bridge super, angry, Calgary), Harsh (project engineer, paperwork), Tanya (Safety). Killed means fired. Mostly.

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
