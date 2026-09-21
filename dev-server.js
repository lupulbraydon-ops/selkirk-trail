// Tiny dev server: serves the game and accepts screenshot uploads at POST /shot?name=...
// Usage: node dev-server.js   (then open http://localhost:8765/)
const http=require('http'),fs=require('fs'),path=require('path');
const root=__dirname,shots=path.join(root,'screenshots');
fs.mkdirSync(shots,{recursive:true});
http.createServer((req,res)=>{
  const u=new URL(req.url,'http://x');
  if(req.method==='POST'&&u.pathname==='/shot'){
    const name=(u.searchParams.get('name')||'shot').replace(/[^a-z0-9_-]/gi,'_');
    const bufs=[];req.on('data',d=>bufs.push(d));req.on('end',()=>{fs.writeFileSync(path.join(shots,name+'.png'),Buffer.concat(bufs));res.end('ok '+name);});
    return;
  }
  let p=u.pathname==='/'?'/index.html':u.pathname;
  const f=path.join(root,p);
  if(!f.startsWith(root)||!fs.existsSync(f)){res.statusCode=404;res.end('nope');return;}
  const ext=path.extname(f);
  res.setHeader('Content-Type',{'.html':'text/html','.js':'text/javascript','.png':'image/png','.css':'text/css'}[ext]||'application/octet-stream');
  res.setHeader('Cache-Control','no-store');
  fs.createReadStream(f).pipe(res);
}).listen(8765,()=>console.log('Selkirk Trail dev server on http://localhost:8765/'));
