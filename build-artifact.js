// Builds the claude.ai Artifact version of the game (no html/head/body wrapper, hot-reload snapshot hook).
// Usage: node build-artifact.js <output.html>
const fs=require('fs');
let s=fs.readFileSync(__dirname+'/index.html','utf8');
const head=s.slice(s.indexOf('<title>'),s.indexOf('</head>'));   // <title> + <style>
let body=s.slice(s.indexOf('<body>')+6,s.indexOf('</body>'));
body=body.replace('requestAnimationFrame(frame);\n</script>',
`function start(data){try{if(data&&data.S&&data.S.screen){S=data.S;S.queue=S.queue||[];S.extras=S.extras||[];}}catch(_){}requestAnimationFrame(frame);}
try{window.claude&&window.claude.hot&&window.claude.hot.snapshot&&window.claude.hot.snapshot(()=>({S}));}catch(_){}
(window.claude&&window.claude.hot&&window.claude.hot.ready)?window.claude.hot.ready(start):start((window.claude&&window.claude.hot&&window.claude.hot.data)||{});
</script>`);
const out=head+'\n'+body;
fs.writeFileSync(process.argv[2],out);
console.log('wrote',process.argv[2],out.length,'bytes');
