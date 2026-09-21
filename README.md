# Selkirk Trail

An Oregon Trail homage set on the Trans-Canada expansion east of Golden, BC.
Twelve kilometres of highway, one bridge, one multiplate wildlife crossing, and Andy Smith.

## Play

Open `index.html` in any browser (double-click it). No install, no build, no assets.
Internet is only needed for the pixel font; without it the game falls back to Courier New.

Keys: ENTER to continue, number keys or arrow keys to choose, LEFT/RIGHT to buy or return in the yard.

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

To host on GitHub Pages (free, public URL, no login for players), from this folder:

    git init -b main
    git add -A
    git commit -m "Selkirk Trail"
    git remote add origin https://github.com/lupulbraydon-ops/selkirk-trail.git
    git push -u origin main

after creating an empty public repo named selkirk-trail at https://github.com/new, then on that repo:
Settings > Pages > Source: Deploy from a branch, Branch: main, folder: / (root). The game will be at
https://lupulbraydon-ops.github.io/selkirk-trail/ within a minute or two.
