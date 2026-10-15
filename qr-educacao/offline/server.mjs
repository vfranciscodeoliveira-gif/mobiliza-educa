import http from 'node:http';
import {readFile, readdir, appendFile, mkdir, writeFile} from 'node:fs/promises';
import {resolve, join, extname, sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';

const BASE=resolve(fileURLToPath(new URL('.',import.meta.url)));
const ACTIONS=resolve(BASE,'actions'),DATA=resolve(BASE,'data');
const HOST=process.env.HOST||'0.0.0.0',PORT=Number(process.env.PORT||8080);
const ACCESS_TOKEN=process.env.ADMIN_TOKEN||'';
const TYPE={'.pdf':'application/pdf','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.txt':'text/plain; charset=utf-8','.html':'text/html; charset=utf-8','.mp4':'video/mp4'};
const ID=/^[a-zA-Z0-9_-]{1,80}$/;
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const send=(res,n,obj)=>{res.writeHead(n,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(obj))};
function safe(p){const f=resolve(ACTIONS,p);if(f!==ACTIONS&&!f.startsWith(ACTIONS+sep))throw Error('Caminho proibido');return f}
async function manifest(id){
 if(!ID.test(id))throw Error('Código inválido');
 const raw=JSON.parse(await readFile(safe(join(id,'manifest.json')),'utf8'));
 if(raw.actionId!==id||raw.schemaVersion!==1||!Array.isArray(raw.materials)||raw.materials.length>30)throw Error('Manifesto inválido');
 for(const x of raw.materials){if(typeof x.title!=='string'||typeof x.path!=='string'||!/^assets\/[a-zA-Z0-9._-]+$/.test(x.path))throw Error('Material inválido')}
 return raw;
}
function view(m){
 const id=encodeURIComponent(m.actionId);
 const items=m.materials.map(x=>'<a class="item" data-material="'+esc(x.id)+'" href="/actions/'+id+'/'+x.path.split('/').map(encodeURIComponent).join('/')+'">📖 '+esc(x.title)+'</a>').join('');
 const payload=JSON.stringify({actionId:m.actionId,revision:m.revision}).replace(/</g,'\\u003c');
 return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(m.title)} • QR Educação 360</title><style>body{margin:0;font:16px system-ui;background:#eff5fa;color:#143452}header{background:#134b79;color:white;text-align:center;padding:25px 12px}main{max-width:700px;margin:auto;padding:20px}.item{display:block;background:#fff;padding:20px;margin:12px 0;border-radius:14px;text-decoration:none;color:#103d66;box-shadow:0 2px 12px #184a731a}footer{text-align:center;padding:22px;color:#546779}.note{font-size:13px}</style></head><body><header><h1>Mobiliza Educa</h1><p>📱 Educação para o Trânsito • Wi-Fi Educativo</p></header><main><h2>${esc(m.title)}</h2><p>${esc(m.description||'')}</p><div>${items}</div><p class="note">Materiais gratuitos neste Wi-Fi local. Não é necessário fornecer CPF, placa, telefone ou dados pessoais.</p></main><footer>SEMOB • Educação para o Trânsito</footer><script>const cfg=${payload};function track(type,materialId){try{const key='me-qr-session',sid=sessionStorage.getItem(key)||crypto.randomUUID();sessionStorage.setItem(key,sid);const b={eventId:crypto.randomUUID(),sessionId:sid,actionId:cfg.actionId,revision:cfg.revision,type,materialId:materialId||null,createdAt:new Date().toISOString()};fetch('/api/events',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(b),keepalive:true}).catch(()=>{})}catch{}}document.querySelectorAll('[data-material]').forEach(a=>a.addEventListener('click',()=>track('material_open',a.dataset.material)));track('page_view');</script></body></html>`;
}
async function allEvents(){try{return(await readFile(join(DATA,'events.ndjson'),'utf8')).trim().split('\n').filter(Boolean).map(x=>JSON.parse(x))}catch(e){if(e.code==='ENOENT')return[];throw e}}
const seen=new Set();let lock=Promise.resolve();
async function accept(e){if(!e||typeof e!=='object'||!(/^[0-9a-f-]{36}$/i.test(e.eventId||''))||!ID.test(e.actionId||'')||!['page_view','material_open','quiz_start','quiz_finish'].includes(e.type)||typeof e.sessionId!=='string'||e.sessionId.length>80)throw Error('Evento inválido');const m=await manifest(e.actionId);if(e.revision!==m.revision)throw Error('Revisão divergente');if(e.type==='material_open'&&!m.materials.some(x=>x.id===e.materialId))throw Error('Material inválido');if(['quiz_start','quiz_finish'].includes(e.type)&&!m.materials.some(x=>x.id==='quiz-motociclista'))throw Error('Quiz indisponível');if(e.type==='quiz_finish'&&(!Number.isInteger(e.score)||e.score<0||e.score>8))throw Error('Pontuação inválida');const result={eventId:e.eventId,sessionId:e.sessionId,actionId:e.actionId,revision:e.revision,type:e.type,materialId:e.type==='material_open'?e.materialId:null,score:e.type==='quiz_finish'?e.score:null,createdAt:new Date().toISOString(),source:'offline'};let created=false;
lock=lock.then(async()=>{if(seen.has(e.eventId))return;await mkdir(DATA,{recursive:true});await appendFile(join(DATA,'events.ndjson'),JSON.stringify(result)+'\n',{mode:0o600});seen.add(e.eventId);created=true});await lock;return created}
async function handler(req,res){try{
 const u=new URL(req.url||'/', 'http://localhost'),p=decodeURIComponent(u.pathname);
 if(p.includes('\\')||p.includes('\0'))return send(res,400,{error:'Caminho inválido'});
 if(req.method==='GET'&&p==='/health')return send(res,200,{ok:true,mode:'offline',version:1});
 if(req.method==='GET'&&p==='/qr.js'){const content=await readFile(resolve(BASE,'qr.js'));res.writeHead(200,{'Content-Type':'text/javascript; charset=utf-8','X-Content-Type-Options':'nosniff'});return res.end(content)}
 if(req.method==='GET'&&p==='/placa'){const id=u.searchParams.get('acao')||'blitz-capacete-demo';const m=await manifest(id);const host=(req.headers.host||'').replace(/[^a-zA-Z0-9.:-]/g,'');const target='http://'+host+'/a/'+encodeURIComponent(id);if(target.length>106)return send(res,400,{error:'Endereço muito longo para QR local'});const page=await readFile(resolve(BASE,'placa.html'),'utf8');res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});return res.end(page.replaceAll('__ACTION_TITLE__',esc(m.title)).replaceAll('__LOCAL_URL__',esc(target)))}

 if(req.method==='GET'&&p==='/'){const entries=(await readdir(ACTIONS,{withFileTypes:true})).filter(x=>x.isDirectory());res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});return res.end('<h1>Mobiliza Educa • QR Educação</h1><ul>'+entries.map(x=>'<li><a href="/a/'+encodeURIComponent(x.name)+'">'+esc(x.name)+'</a></li>').join('')+'</ul>')}
 if(req.method==='GET'&&p.startsWith('/a/')){const m=await manifest(p.slice(3));res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});return res.end(view(m))}
 if(req.method==='GET'&&p.startsWith('/actions/')){const bits=p.split('/').slice(2),id=bits[0],relative=bits.slice(1).join('/');const m=await manifest(id);if(!m.materials.some(x=>x.path===relative))return send(res,403,{error:'Material não publicado'});const file=safe(join(id,relative));const bytes=await readFile(file);res.writeHead(200,{'Content-Type':TYPE[extname(file).toLowerCase()]||'application/octet-stream','Content-Length':bytes.length,'X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; sandbox",'Cache-Control':'private, max-age=60'});return res.end(bytes)}
 if(req.method==='POST'&&p==='/api/events'){let buf='';for await(const chunk of req){buf+=chunk;if(buf.length>4096)return send(res,413,{error:'Evento muito grande'})}const accepted=await accept(JSON.parse(buf));return send(res,202,{ok:true,recorded:accepted})}
 if(req.method==='GET'&&p==='/admin/stats'){if(!ACCESS_TOKEN||req.headers['x-admin-token']!==ACCESS_TOKEN)return send(res,403,{error:'Acesso restrito'});const ev=await allEvents();const stats={totalInteracoes:ev.length,acessos:ev.filter(x=>x.type==='page_view').length,aberturas:ev.filter(x=>x.type==='material_open').length,quizzesIniciados:ev.filter(x=>x.type==='quiz_start').length,quizzesConcluidos:ev.filter(x=>x.type==='quiz_finish').length,porAcao:{}};for(const x of ev){const g=stats.porAcao[x.actionId]??={acessos:0,materiaisAbertos:0,quizzesIniciados:0,quizzesConcluidos:0,somaAcertos:0};if(x.type==='page_view')g.acessos++;else if(x.type==='material_open')g.materiaisAbertos++;else if(x.type==='quiz_start')g.quizzesIniciados++;else if(x.type==='quiz_finish'){g.quizzesConcluidos++;g.somaAcertos+=x.score||0}}return send(res,200,stats)}
 if(req.method==='GET'&&p==='/admin/events'){if(!ACCESS_TOKEN||req.headers['x-admin-token']!==ACCESS_TOKEN)return send(res,403,{error:'Acesso restrito'});return send(res,200,{events:await allEvents()})}
 return send(res,404,{error:'Página não encontrada'});
}catch(e){if(e.code==='ENOENT')return send(res,404,{error:'Arquivo não encontrado'});if(e instanceof SyntaxError||/inválid[oa]|proibido|divergente/.test(e.message))return send(res,400,{error:'Solicitação inválida'});console.error(e);return send(res,500,{error:'Erro interno'})}}
if(process.env.NODE_ENV!=='test'){try{for(const e of await allEvents())seen.add(e.eventId)}catch(e){console.error('Falha ao ler histórico:',e);process.exitCode=1}if(!process.exitCode)http.createServer(handler).listen(PORT,HOST,()=>console.log('QR Educação offline em http://'+HOST+':'+PORT))}
export{handler,manifest,accept,view};
