// Builds the claude.ai Artifact version of the game: strips the html/head/body wrapper, inlines every local
// <script src="..."> (sprite files, renderers) so the page is a single file, and adds the hot-reload snapshot hook.
// Usage: node build-artifact.js <output.html>
const fs=require('fs'),path=require('path');
let s=fs.readFileSync(path.join(__dirname,'index.html'),'utf8');
// inline local scripts (relative paths only; CDN/absolute URLs are left alone)
s=s.replace(/<script\s+src="([^"]+)"><\/script>/g,(m,src)=>{
  if(/^(https?:)?\/\//.test(src))return m;
  const f=path.join(__dirname,src);
  if(!fs.existsSync(f)){console.warn('missing local script, left as-is:',src);return m;}
  const body=fs.readFileSync(f,'utf8').replace(/<\/script>/gi,'<\\/script>');
  return '<script>\n// ---- inlined: '+src+' ----\n'+body+'\n</script>';
});
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
