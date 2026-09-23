// node v16/validate.js [file.js ...]  — loads sprite files, checks dimensions/palette, prints an ASCII preview.
const fs = require('fs'), path = require('path'), vm = require('vm');
const dir = path.join(__dirname, 'sprites');
const files = process.argv.length > 2 ? process.argv.slice(2) : (fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => f.endsWith('.js')).map(f => path.join(dir, f)) : []);
const sandbox = { window: {}, console };
sandbox.window.SPR16 = {};
let bad = 0;
for (const f of files) {
  try { vm.runInNewContext(fs.readFileSync(f, 'utf8'), sandbox, { filename: f }); }
  catch (e) { console.log('LOAD ERROR', f, e.message); bad++; }
}
const S = sandbox.window.SPR16;
for (const [name, s] of Object.entries(S)) {
  const errs = [];
  if (!Array.isArray(s.rows)) errs.push('rows missing');
  else {
    if (s.rows.length !== s.h) errs.push(`h=${s.h} but ${s.rows.length} rows`);
    s.rows.forEach((r, i) => { if (r.length !== s.w) errs.push(`row ${i} length ${r.length} != w ${s.w}`); for (const ch of r) if (ch !== '.' && !(ch in (s.pal || {}))) { errs.push(`row ${i}: char '${ch}' not in pal`); break; } });
  }
  if (!s.anchor) errs.push('anchor missing');
  if (errs.length) { bad++; console.log(`FAIL ${name}: ` + errs.slice(0, 5).join('; ')); }
  else console.log(`ok   ${name} ${s.w}x${s.h} anchor ${JSON.stringify(s.anchor)} colours ${Object.keys(s.pal).length}`);
  if (process.env.PREVIEW && !errs.length) console.log(s.rows.map(r => r.replace(/\./g, ' ')).join('\n') + '\n');
}
console.log(bad ? `${bad} problem(s)` : `all ${Object.keys(S).length} sprites valid`);
process.exit(bad ? 1 : 0);
