import http from 'node:http';
import { readFile, mkdir, appendFile } from 'node:fs/promises';
import { resolve, join, extname, sep } from 'node:path';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('./public/', import.meta.url)));
const DATA = resolve(fileURLToPath(new URL('./data/', import.meta.url)));
const PORT = Number(process.env.PORT || 8080);
const HOST = process.env.HOST || '0.0.0.0';
const TYPES = {'.html':'text/html; charset=utf-8','.json':'application/json; charset=utf-8','.pdf':'application/pdf','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.mp4':'video/mp4','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.txt':'text/plain; charset=utf-8'};
const actionPattern = /^[a-zA-Z0-9_-]{1,80}$/;
const eventTypes = new Set(['page_view','material_open','quiz_start','quiz_finish']);

function json(res, status, body) {
  res.writeHead(status, {'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});
  res.end(JSON.stringify(body));
}
function routePath(url) {
  const decoded = decodeURIComponent(new URL(url,'http://local').pathname);
  if (decoded.includes('\\') || decoded.includes('\0')) throw new Error('Caminho invalido');
  return decoded;
}
function safeFile(relative) {
  const full = resolve(ROOT, '.' + relative);
  if (!full.startsWith(ROOT + sep) && full !== ROOT) throw new Error('Caminho proibido');
  return full;
}
async function getManifest(id) {
  if (!actionPattern.test(id)) throw new Error('ID invalido');
  const raw = await readFile(safeFile('/actions/' + id + '/manifest.json'),'utf8');
  const manifest = JSON.parse(raw);
  if (manifest.actionId !== id || !Array.isArray(manifest.materials)) throw new Error('Manifesto invalido');
  return manifest;
}
function render(manifest) {
  const payload = JSON.stringify(manifest).replace(/</g,'\\u003c');
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>QR Educação 360</title><style>body{font:16px system-ui,sans-serif;margin:0;background:#f1f5f9;color:#172b4d}header{background:#123b6b;color:white;padding:24px;text-align:center}main{max-width:700px;margin:20px auto;padding:16px}.item{display:block;background:white;padding:18px;border-radius:12px;margin:12px 0;color:#123b6b;text-decoration:none;box-shadow:0 1px 4px #d2d8e3}small{color:#50647d}</style></head><body><header><h1>Mobiliza Educa</h1><p>SEMOB • QR Educação 360</p></header><main><h2 id="title"></h2><p id="description"></p><section id="materials"></section><small>Conteúdo educativo disponível nesta rede local. Não é necessário cadastro.</small></main><script>const m=${payload};const a=encodeURIComponent(m.actionId);document.getElementById('title').textContent=m.title;document.getElementById('description').textContent=m.description||'';const box=document.getElementById('materials');async function track(type,materialId){try{await fetch('/api/events',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({eventId:crypto.randomUUID(),actionId:m.actionId,revision:m.revision,type,materialId,sessionId:sessionStorage.sid||(sessionStorage.sid=crypto.randomUUID()),createdAt:new Date().toISOString(),source:'offline'})})}catch{}}for(const material of m.materials){const el=document.createElement('a');el.className='item';el.textContent=material.title;el.href='/actions/'+a+'/'+material.path.split('/').map(encodeURIComponent).join('/');el.addEventListener('click',()=>track('material_open',material.id));box.appendChild(el)}track('page_view');</script></body></html>`;
}
async function handler(req,res) {
  try {
    const path=routePath(req.url||'/');
    if(req.method==='GET' && path==='/health') return json(res,200,{ok:true,service:'qr-educacao-offline',mode:'offline'});
    if(req.method==='GET' && path==='/') {res.writeHead(302,{Location:'/a/blitz-capacete-demo'});return res.end();}
    if(req.method==='GET' && path.startsWith('/a/')) {
      const id=path.slice(3);const m=await getManifest(id);
      res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});return res.end(render(m));
    }
    if(req.method==='POST' && path==='/api/events') {
      let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>8192)return json(res,413,{error:'Corpo muito grande'});}
      const event=JSON.parse(raw);
      if(typeof event.eventId!=='string'|| !/^[0-9a-f-]{36}$/i.test(event.eventId)||!actionPattern.test(event.actionId||'')||!eventTypes.has(event.type)||event.source!=='offline'||typeof event.sessionId!=='string'||event.sessionId.length>80) return json(res,400,{error:'Evento invalido'});
      const m=await getManifest(event.actionId);
      if(event.revision!==m.revision)return json(res,409,{error:'Revisao divergente'});
      const allowed=['eventId','actionId','revision','type','materialId','quizId','score','sessionId','createdAt','source'];
      const clean=Object.fromEntries(allowed.filter(k=>event[k]!==undefined).map(k=>[k,event[k]]));
      await mkdir(DATA,{recursive:true});
      await appendFile(join(DATA,'events.ndjson'),JSON.stringify(clean)+'\n',{encoding:'utf8',mode:0o600});
      return json(res,202,{ok:true,eventId:event.eventId});
    }
    if(req.method==='GET' && path.startsWith('/actions/')) {
      const parts=path.split('/');const id=parts[2];
      if(!actionPattern.test(id)||parts.length<5)return json(res,404,{error:'Nao encontrado'});
      const m=await getManifest(id);
      const rel=parts.slice(3).join('/');
      if(!m.materials.some(x=>x.path===rel))return json(res,403,{error:'Arquivo nao publicado'});
      const buffer=await readFile(safeFile('/actions/'+id+'/'+rel));
      res.writeHead(200,{'Content-Type':TYPES[extname(rel).toLowerCase()]||'application/octet-stream','Content-Length':buffer.length,'X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; sandbox"});
      return res.end(buffer);
    }
    return json(res,404,{error:'Nao encontrado'});
  }catch(e) {
    if(e.code==='ENOENT')return json(res,404,{error:'Nao encontrado'});
    if(e instanceof SyntaxError)return json(res,400,{error:'JSON invalido'});
    if(/invalido|proibido/.test(e.message))return json(res,400,{error:e.message});
    console.error(e);return json(res,500,{error:'Erro interno'});
  }
}
http.createServer(handler).listen(PORT,HOST,()=>console.log('QR Educação 360 local em http://'+HOST+':'+PORT));
