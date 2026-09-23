// v16/sprites/machines.js — excavator + buckets, motor grader + moldboard, trash pump, culvert (end/side), powder box, drill head.
// Plain script, no modules. Light from top-left; ink outline on the outer silhouette only; 1px ink ground-shadow row (h-1)
// under every machine. Mud spatter (dirt base/shade m/M) on the lower third of each machine.
// Facing: excavator faces LEFT (cab left, counterweight right); grader faces RIGHT (front wheels right). Use opts.flip to mirror.
// Boom/stick/bucket (excavator) and the moldboard (grader) are drawn by the renderer — the pivot/mount pixels are noted per sprite.
// Custom colours in this file (max 6): u #3a3e45 lit rubber, x #2e3238 deep steel. Everything else is the master palette.
var SPR16 = window.SPR16 = window.SPR16 || {};

// Keys: Y/y/s/d CAT yellow hi/base/shade/deep; k ink; T tire, u lit rubber, h/H hub + hub hi; L/c/C/D/x steel light/hi/base/shade/deep;
// g/G/b glass hi/base/shade, W specular; A amber beacon; o/O orange base/hi; r red; p/l/m/M/n dirt hi/light/base/shade/dark
// (mud spatter, rock load, cardboard); R/e/E/q rock greys. Shared by every sprite in this file.
var MACH_PAL = {Y:"#ffe466", y:"#f2c400", s:"#c99d00", d:"#8a6a00", k:"#141018", T:"#1a1c1e", u:"#3a3e45", h:"#555555", H:"#9a9a9a", L:"#dcdcdc", c:"#c8ccd2", C:"#7c8289", D:"#4a4f56", x:"#2e3238", g:"#d8f0ff", G:"#9fd8ff", b:"#5a9ad0", W:"#ffffff", A:"#ffb000", o:"#ff7a00", O:"#ffa040", r:"#b3001b", p:"#a06a30", l:"#8f5a26", m:"#7a4a1c", M:"#5e3812", n:"#3f2408", R:"#c4c4c4", e:"#9a9a9a", E:"#6f6f6f", q:"#4a4a4a"};

// ---- excavator ----
// CAT 336-class excavator facing LEFT (cab on the left, counterweight on the right). Boom, stick and bucket are
// drawn by the renderer from the boom-foot pin: sprite pixel (29,10) (the Hh/hD hub on the bracket beside the cab).
// Rows 25..38 track frame (idler left, sprocket right, four bottom rollers); slew ring rows 23..24; house rows 10..22
// with engine grille slats; counterweight x50..60 rows 13..23; cab x8..25 rows 3..22 with beacon; exhaust stack x40..44;
// handrail row 7. Row 39 is the 1px ink ground shadow. Mud spatter on rows 30..37. Use opts.flip to face RIGHT.
SPR16.excavator = {
  w: 64, h: 40,
  anchor: [0, 40],
  pal: MACH_PAL,
  rows: [
    "............kkkk................................................",
    "............kYAk................................................",
    "............kAok................................................",
    "..........kkkkkkkkkkkkkk........................................",
    ".........kYYYYYYYYYYYYYYk...............kkkkk...................",
    "........kYyyyyyyyyyyyyyyyk..............kcCDk...................",
    "........ksgggggggsgggggGsk.kkkkkk.......kcCDk...................",
    "........ksgWGGGGGsgGGGGGsdkYYYYYYk..kccckcCDkcccccccck..........",
    "........ksgGGGGGGsgGGGGGsdyYyyyysk...D..kcCDk..D....D...........",
    "........ksgGGGGGGsGGGGGbsdyYHhyysk...D..kcCDk..D....D...........",
    "........ksgGGGGGbsGGGGGbsdyYhDyysykkkkkkkkkkkkkkkkkkkk..........",
    "........ksgGGGGGbsGGGGGbsdyYyyyysdYYYYYYYYYYYYYYYYYYYYk.........",
    "........ksGGGGGGbsGGGbbbsdyYydyysdYYYYYYYYYYYYYYYYYYYYYk........",
    "........ksGGGGGGbssssssssdyYyydysdyyyyyysyyyyyyyyyyyyyyykkk.....",
    "........ksGGGGbbbsyyysyysdyYyyyysdyyyyyysyyydddddykyyyyyYYYk....",
    "........ksGGGGbbbsyyysyysdyYsssssdyyyyyysyyyyyyyyydyyyyyyyysk...",
    "........ksGGGGbbbsyyysyysdyyyyyyydyyyyyysyyydddddydyyyyyyyssk...",
    "........ksGGbbbbbsyyysyysdyyyyyyyyyyyyyysyyyyyyyyydyyyyyyyssk...",
    "........kssssssssyyyysyysdyyyyyyyyyyyyyysyyydddddydyyyyyyyssk...",
    "........ksyyyyyyyyyyysyysdyyyyyyyyyyyyyysyyyyyyyyydyyyyyyyssk...",
    "........kssssssssssssssssdssssssssssssssssssssssssdyyyyyyyssk...",
    "........kdddddddddddddddddsssssssssssssssssssssssskssssssssdk...",
    "........kkkkkkkkkkkddddddddddddddddddddddddddkkkkkkddddddddk....",
    "...................kccCCCCCCCCCCCCCCCCCCCCCCk.....kkkkkkkkk.....",
    "...................kDDDDDDDDDDDDDDDDDDDDDDDDk...................",
    ".......kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk.........",
    "......kuTuuTuuTuuTuuTuuTuuTuuTuuTuuTuuTuuTuuTuuTuuTuuTuk........",
    ".....kTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTTDTTTTk.......",
    ".....kTTThhhTTYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYYTTDDDTTTk.......",
    ".....kTThHhhhTyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyyysTDCDDDTTk.......",
    ".....kThHHhhhhyyyyyyymyyyMmyyyyMyyymymyyyyyMyyysDCCDDDDTk.......",
    ".....kThhhDhhhyyyyyyyyyyyyyyyMyyyymyyyyyyyyyyyyDDDDxDDDDk.......",
    ".....kThhhhhhDymyyyyyyyyyymyyyyyyyyyMyyyyyyyyyysDDDDxDDTk.......",
    ".....kuThhhhDTssssHssssssHssssmsHssssssHssssssssTDDDDxTuk.......",
    ".....kTTMhhDTTsssHhDsMssHhDsssmHhDssssHhDsssmmssMTDDDMTMk.......",
    ".....kTTTTTTTTTTTmhTTmmTmhmTTTmThTTTmTmhTTmTmTTTTmmmTTTTk.......",
    ".....kTTmuTTMTTuTTuTTmMmmTMuTMuTTuTTuTTuTTmmTumTuTTuTTumk.......",
    "......kTMTmTTTMTmTTTTTTmTMTTTTTTTTTTTTTTTTmTTTTTTmTTTTTk........",
    ".......kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk.........",
    ".........kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk..........",
  ],
};

// ---- bucket ----
// Excavator bucket, side view, tooth on the LEFT, empty. Anchor [8,2] = the stick pin (Hh/hD hub in the hinge ears).
// Mouth opens up-left over the dark cavity (d, inner edge s); back wall lit Y/y on the right; steel tooth c/C at the
// bottom-left corner; floor shade band rows 11..12.
SPR16.bucket = {
  w: 16, h: 14,
  anchor: [8, 2],
  pal: MACH_PAL,
  rows: [
    "......kkkk......",
    ".....kYHhyk.....",
    ".....kyhDyyk....",
    "....kyyyyyyyk...",
    "...kdsyyyyyyyk..",
    "...kddsyyyyYyyk.",
    "..kdddsyyyyyyysk",
    "..kddddsyyyyyysk",
    ".kdddddssyyyyysk",
    ".kddddddssyyyysk",
    ".kkdddddddsyyysk",
    "kCckssssssssssdk",
    "kcCkddddddddddsk",
    "kkkkkkkkkkkkkkk.",
  ],
};

// ---- bucket_full ----
// Same bucket with a heaped rock/dirt load (dirt p/l/m/M/n + grey rocks R/e/E/q) filling the cavity and spilling
// out of the mouth to the upper-left. Anchor [8,2] = the stick pin.
SPR16.bucket_full = {
  w: 16, h: 14,
  anchor: [8, 2],
  pal: MACH_PAL,
  rows: [
    "......kkkk......",
    "...kkkkYHhyk....",
    "..kplpkyhDyyk...",
    ".kplRrlpkyyyyk..",
    "kplmmmmlpsyyyyk.",
    "kmmEqmmmmsyyYyyk",
    "kmmqmmMmmnmyyysk",
    ".kmmmMmmMmsyyysk",
    ".kMmMmmmmmssyysk",
    ".kkMMmmmmmmssysk",
    ".kkMMMMmmmmsyysk",
    "kCckssssssssssdk",
    "kcCkddddddddddsk",
    "kkkkkkkkkkkkkkk.",
  ],
};

// ---- grader ----
// CAT 14M motor grader facing RIGHT: engine hood + exhaust/precleaner at the rear (left), tandem drive wheels under it,
// ROPS cab with glass, beacon and mirror, long arched frame to the front steer wheel, drawbar and circle (flat ring
// x38..55 rows 25..27) under the frame. The MOLDBOARD is NOT drawn: hang SPR16.moldboard under the circle (blade top
// ~ row 27, x ~34). Row 35 is the 1px ink ground shadow. Mud spatter on rows 23..34. Use opts.flip to face LEFT.
SPR16.grader = {
  w: 72, h: 36,
  anchor: [0, 36],
  pal: MACH_PAL,
  rows: [
    ".......................................kkkk.............................",
    ".......................................kYAk.............................",
    "..............................kkkkkkkkkkkkkkk...........................",
    ".....kkkk....................kYYYYYYYYYYYYYYYk..........................",
    ".....kCDk...................kYyyyyyyyyyyyyyyyyk.........................",
    ".....kcDk....kk.............ksgggggggsgggggggsk.........................",
    ".....kcDk...kcxk............ksgWGGGGGsgWGGGGGsykkk......................",
    ".....kcDk...kCxk............ksgGGGGGGsgGGGGGGsyCck......................",
    ".....kcDk...kCxk............ksgGGGGGGsgGGGGGGsyCgk......................",
    ".....kcDk...kCxk............ksgGGGGGGsgGGGGGGsyCbk......................",
    "....kkkkkkkkkkkkkkkkkkkkkkkkysgGGGGGbsGGGGGGbsykkk......................",
    "...kYYYYYYYYYYYYYYYYYYYYYYYYYsGGGGGGbsGGGGGGbsk.........................",
    "..kYYYYsYYYYYYYYYYYYYYYYYYYYYsGGGGGGbsGGGGGGbsk.........................",
    "..kddddsyyyyyyyyyyyyyyyyyyyyysGGGGbbbsGGGGbbbsk.........................",
    "..kyyyysyyyysdyysdyysdyysdyyysGGGGbbbsGGGGbbbsk.........................",
    "..kddddsyyyysdyysdyysdyysdyyysGGGGbbbsGGGGbbbsk.........................",
    "..kyyyysyyyysdyysdyysdyysdyyysGGbbbbbsGGbbbbbsykkkkkkkkkkkkkkkkkkkk.....",
    "..kddddsyyyysdyysdyysdyysdyyysssssssssssssssssyYYYYYYYYYYYYYYYYYYYk.....",
    "..kyyyysyyyysdyysdyysdyysdyyysyyyyyyysyyyyyyysyyyyyyyyyyyyyyyyyyyyk.....",
    "..kddddsssssssssssssssssssssssyyyyyyysyyyyyyysysssssssssssssssssssk.....",
    ".kDDddddddddddddddddddddddddyssssssssssssCssssdkdCdkkkkkkkkkddddddk.....",
    ".kCDyyyyyyyyyyyyyyyyyyyyyyyyyddddddddddddcddddk.kck.........kYyyysk.....",
    ".kDDyyyykkkyyyyddyyyykkkyyyyykkkkkkkkkkkCcCkkkk.kck......YYYkYkkksk.....",
    ".kDDsskkuuTkksssssskkuuTkkssk...........kck.....kmk...YYmkkkkkuuTkk.....",
    ".kkDmkuuTTTTTksssskuuTTTTTksk...........kmk.....kckYYYkkk..kuuTTTTTk....",
    "...kkuTTmTTTTTkddkuTTTTTTTTkk.........kkCCmkkkkkCCCkkkkk..kuTTTTTTTTk...",
    "...kkTTmhhhTTTkyykTTThhhmTTkk.........kcDccDCCDCmDCCDCDk..kTTThhhTTTk...",
    "...kuTmhHHhhTTTkkuTmhHHhhTTTk.........kkkkkkkkkkkkkkkkkk.kumMhHHhhTTTk..",
    "...kTTThHDhhTTTkkTmThHDhhTTTk............................kTTThHDhhTTTk..",
    "...kTTThhhDhTTMkkTTThhhDhmmuk............................kTTThhhDhTTuk..",
    "....kTTThhxTTTk..kTMmhhxTTmk..............................kTTThhxTTTk...",
    "....kTTmTTTMmMk..kTTTTTTTTuk..............................kTTTTTTTTuk...",
    ".....kuTTmTumk....kuTTmTuTk................................kuTTTTuTk....",
    "......kkMTTkk......kkTTTkk..................................kkmTmkk.....",
    "........kkk..........kkk......................................kkk.......",
    ".........kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk........",
  ],
};

// ---- moldboard ----
// Grader moldboard side-on: yellow blade face (Y/y/s), steel cutting edge with bolt heads on row 6, end bit, two lift
// links on top (rows 0..1 at x3..6 and x16..19). Anchor bottom-left. Row 7 is the blade bottom outline / ground contact.
SPR16.moldboard = {
  w: 24, h: 8,
  anchor: [0, 8],
  pal: MACH_PAL,
  rows: [
    "....kk...........kk.....",
    "...kCck.........kCck....",
    ".kkkkkkkkkkkkkkkkkkkkkk.",
    "kcYYYYYYYYYYYYYYYYYYYYsk",
    "kCyyyyyyyyyyyyyyyyyyyysk",
    "kCsssssssssssssssssssssk",
    "kCcDcccDcccDcccDcccDccCk",
    "kkkkkkkkkkkkkkkkkkkkkkkk",
  ],
};

// ---- trash_pump ----
// Yellow 4-inch trash pump on a steel skid, suction on the LEFT: round volute with a bolted cover plate, priming
// chamber with a cap on top of it, discharge pipe with a flange (x11..15 rows 1..2), cam-lock suction fitting
// (x0..2 rows 10..14), engine with cylinder fins, muffler, recoil starter, black air cleaner, yellow fuel tank with
// filler cap, 1px lifting bail over the engine (rows 0..3). Row 23 is the 1px ink ground shadow. Mud on rows 15..22.
SPR16.trash_pump = {
  w: 32, h: 24,
  anchor: [0, 24],
  pal: MACH_PAL,
  rows: [
    "..................kkkkkkkkkkk...",
    "......kkk..kkkkk.k......kkk..k..",
    "......kCk..kccCk.k......kCk..k..",
    ".....kkkkkk.kCk..k....kkkkkkk...",
    ".....kYYYYk.kCk.kkkkkkYYYYYYYk..",
    ".....kyyysk.kck.kuTTTkyyyyyysk..",
    ".....kssssk.kck.kuuTTksssssssk..",
    ".....kdddddkCck.kkkkkkkkkkkkkk..",
    "....kyYYYyyyCck.kYssssccccccck..",
    "...kyYyyyyyyyCk.kYyyyyCCCCCCCk..",
    "kkkyYyysssyyyk..kYssssDDDDDDDk..",
    "kLCyYyDYssDyyyk.kYyyyyYYYYYYYk..",
    "kcCyyyssdssysyk.kYssssyyTTTysk..",
    "kCCyyysssssysyk.kyyYyyyTuuTTsk..",
    "kkkyyyDsssDysk..kyssyyyuThTTsk..",
    "...kyyyyyyysdk..kyddyyyTTTTTsk..",
    "....kyyysssdk...kyyyMyMyTTTysk..",
    ".....kkdddkk....kssMsssssssssk..",
    ".......kdk......kddddddddddddk..",
    ".kkkkkkkkkkkkkkkkkkkkkkkkkkkkkk.",
    ".kccMMccmCCCCMCMCCmCCCCCCCCCCCk.",
    ".kDDDCkkkkkkkkkkkkkkkkkkkkCDmmk.",
    ".kkkkk....................kkkkk.",
    "....kkkkkkkkkkkkkkkkkkkkkkkk....",
  ],
};

// ---- culvert_section ----
// Corrugated steel pipe (CSP) seen end-on: ink rim, two corrugation crests (L/c/C, lit top-left) with dark valleys
// (D/x), dark interior with a top-to-bottom gradient (k -> x -> q -> E). Row 23 is the 1px ink ground shadow.
SPR16.culvert_section = {
  w: 28, h: 24,
  anchor: [0, 24],
  pal: MACH_PAL,
  rows: [
    "............kkkk............",
    ".........kkkLLLLkkk.........",
    ".......kkLLLDDDDLLLkk.......",
    "......kkLDDDccccDDDLkk......",
    ".....kLLDDccDDDDccDDcck.....",
    "....kkLDccDDkkkkDDcCxckk....",
    "....kLDccDkkkkkkkkxCCxCk....",
    "...kLDDcDkkkkkkkkkkxDxxCk...",
    "...kLDcDkkkkkkkkkkkkxDxCk...",
    "...kLDcDxxxxxxxxxxxxxDxCk...",
    "..kLDcDxxxxxxxxxxxxxxxDxCk..",
    "..kLDcDxxxxxxxxxxxxxxxDxCk..",
    "..kLDcDqqqqqqqqqqqqqqxDxCk..",
    "..kLDcDqqqqqqqqqqqqqqxDxCk..",
    "...kLDcDqqqqqqqqqqqqxDxCk...",
    "...kLDcDEEEEEEEEEEEExDxCk...",
    "...kLDDcxEEEEEEEEEExDxxCk...",
    "....kLDCCxEEEEEEEExDDxCk....",
    "....kkcxCDxxEEEExxDDxCkk....",
    ".....kccxxDDxxxxDDxxCCk.....",
    "......kkCxxxDDDDxxxCkk......",
    ".......kkCCCxxxxCCCkk.......",
    ".........kkkCCCCkkk.........",
    ".....kkkkkkkkkkkkkkkkkk.....",
  ],
};

// ---- culvert_side ----
// Same CSP lying on its side in a trench: vertical corrugation bands (period 4: crest c, C, valley D, C), lighter
// near the top, darker on the underside, darker end rings, dirt spatter on the lower third. Row 23 is the ink ground shadow.
SPR16.culvert_side = {
  w: 36, h: 24,
  anchor: [0, 24],
  pal: MACH_PAL,
  rows: [
    "....................................",
    "....................................",
    ".kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk.",
    "kCcLcCcLcCcLcCcLcCcLcCcLcCcLcCcLcCCk",
    "kDcLcCcLcCcLcCcLcCcLcCcLcCcLcCcLcCDk",
    "kDCcCDCcCDCcCDCcCDCcCDCcCDCcCDCcCDDk",
    "kDCcCDCcCDCcCDCcCDCcCDCcCDCcCDCcCDDk",
    "kDCcCDCcCDCcCDCcCDCcCDCcCDCcCDCcCDDk",
    "kDCcCDCcCDCcCDCcCDCcCDCcCDCcCDCcCDDk",
    "kDCcCDCcCDCcCDCcCDCcCDCcCDCcCDCcCDDk",
    "kDCcCDCcCDCcCDCcCDCcCDCcCDCcCDCcCDDk",
    "kDCcCDCcCDCcCDCcCDCcCDCcCDCcCDCcCDDk",
    "kDCcCDCcCDCcCDCcCDCcCDCcCDCcCDCcCDDk",
    "kDCcCDCcCDCcCDCcCDCcCDCcCDCcCDCcCDDk",
    "kDDCDxDCDxDCDxDCDxDCDxDCDxDCDxDCDxDk",
    "kDDCDxDCDxDCDxDCDxDCDxDCDxDCDxDCDxDk",
    "kDDCDxDMDxDCDxDCDxDCDxDCDxDCDxMCDxDk",
    "kDDCDxDCDxDCDxDCDxDCDxDCDMDCDxDCDxDk",
    "kMmCDxMmDxDCDxDCDxDCMxDCDxDCDxDCDxDk",
    "kDxDxxxDxxMmxxxDxxxDxxxDxxMDxxxDxxmk",
    "kDxmxxxMxxxDxxMDxxxDmxxDxxxDxxmmxxmk",
    "kDMMMMMDxxxDxxxDxmxmxxMDxxmDMMMMMMDk",
    ".kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk.",
    ".....kkkkkkkkkkkkkkkkkkkkkkkkkk.....",
  ],
};

// ---- powder_box ----
// Blasting explosives case: cardboard box (p/l/m/M) with a lid, a strap, and an orange 1.1D warning diamond
// (O/o hi/base, red r shade edge, ink centre). Row 9 is the 1px ink ground shadow.
SPR16.powder_box = {
  w: 12, h: 10,
  anchor: [0, 10],
  pal: MACH_PAL,
  rows: [
    "kkkkkkkkkkkk",
    "kpppppppplpk",
    "kllllllllMlk",
    "klmmmOmmmMMk",
    "klmmOoommMMk",
    "klmOokormMMk",
    "klmmoormmMMk",
    "kMmmmrmmmMMk",
    "kkkkkkkkkkkk",
    "..kkkkkkkk..",
  ],
};

// ---- drill_rig_head ----
// Rock drill head on a mast: steel box mast at the right (x12..16) with a feed chain, yellow drifter (x1..12 rows 5..11)
// riding on its front, drill steel and bit below (x4..9), black hydraulic hose looping off the top-left. Row 19 is the
// 1px ink ground shadow under the bit. Anchor bottom-left; the bit tip is at the anchor line.
SPR16.drill_rig_head = {
  w: 20, h: 20,
  anchor: [0, 20],
  pal: MACH_PAL,
  rows: [
    "...kkkk....kkkkkkk..",
    "..kTTTTk...kccccck..",
    "..kTkkTk....kDCDk...",
    "..kTk.Tk....kcCDk...",
    "..kTk.Tk....kDCDk...",
    "..kkkkkkkkkkkcCDk...",
    ".kYYYYYYYYYYdDCDk...",
    ".kYyyyyyysyydcCDk...",
    ".kYyDyyyysyDdDCDk...",
    ".kYssssssdssdcCDk...",
    ".kdddddddddddDCDk...",
    "..kkkkkkkkkkkcCDk...",
    "......kCk...kDCDk...",
    "......kck...kcCDk...",
    "......kck...kDCDk...",
    "......kck...kcCDk...",
    "....kkDDDk..kDCDk...",
    "....kcCCCk..kkkkk...",
    ".....kkkk...........",
    "...kkkkkkkk.........",
  ],
};

