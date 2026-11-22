import http from 'node:http';
import {readFile, readdir, appendFile, mkdir, writeFile, copyFile, rename} from 'node:fs/promises';
import {resolve, join, extname, sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createHash, randomBytes} from 'node:crypto';
import {networkInterfaces} from 'node:os';

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
async function listActions(){const dirs=(await readdir(ACTIONS,{withFileTypes:true})).filter(x=>x.isDirectory());const result=[];for(const d of dirs){try{const m=await manifest(d.name);result.push({actionId:m.actionId,title:m.title,description:m.description,date:m.date||'',location:m.location||'',time:m.time||'',responsible:m.responsible||'',audience:m.audience||'',status:m.status||'planejada',materials:m.materials,revision:m.revision})}catch{}}return result}
async function newAction(payload){
 if(!payload||typeof payload!=='object'||typeof payload.title!=='string'||payload.title.trim().length<5||payload.title.length>110||typeof payload.description!=='string'||payload.description.length>300||typeof payload.date!=='string'||(payload.date&&!/^\d{4}-\d{2}-\d{2}$/.test(payload.date))||!Array.isArray(payload.materials))throw Error('Cadastro inválido');
 const allowed=['orientacoes','quiz-motociclista'];const ids=[...new Set(payload.materials)];if(!ids.length||ids.length>2||ids.some(x=>!allowed.includes(x)))throw Error('Materiais inválidos');
 const base=await manifest('blitz-capacete-demo');const materials=ids.map(id=>base.materials.find(x=>x.id===id));if(materials.some(x=>!x))throw Error('Material indisponível');
 const actionId='blitz-'+randomBytes(6).toString('hex'),folder=safe(actionId);
 await mkdir(folder);await mkdir(join(folder,'assets'));for(const item of materials)await copyFile(safe(join('blitz-capacete-demo',item.path)),safe(join(actionId,item.path)));
 const m={schemaVersion:1,actionId,revision:1,...fields(payload),materials};await writeFile(join(folder,'manifest.json'),JSON.stringify(m,null,2)+'\n',{flag:'wx'});return m;
}
const statuses=['planejada','em_andamento','concluida'];
function fields(p){const strings={title:110,description:300,date:10,time:5,location:120,responsible:100,audience:100,status:20};const obj={};for(const [k,max] of Object.entries(strings)){const value=p[k]??(k==='status'?'planejada':'');if(typeof value!=='string'||value.length>max)throw Error('Cadastro inválido');obj[k]=value.trim()}if(obj.title.length<5||obj.date&&!/^\d{4}-\d{2}-\d{2}$/.test(obj.date)||obj.time&&!/^([01]\d|2[0-3]):[0-5]\d$/.test(obj.time)||!statuses.includes(obj.status))throw Error('Cadastro inválido');return obj}
async function saveManifest(m){const file=safe(join(m.actionId,'manifest.json'));const tmp=safe(join(m.actionId,'manifest-'+randomBytes(5).toString('hex')+'.tmp'));await writeFile(tmp,JSON.stringify(m,null,2)+'\n',{flag:'wx'});await rename(tmp,file)}
async function editAction(id,p){if(id==='blitz-capacete-demo')throw Error('Ação de demonstração não editável');const m=await manifest(id),next=fields({...m,...p});Object.assign(m,next);await saveManifest(m);return m}
async function duplicateAction(id){const m=await manifest(id);const allowed=m.materials.map(x=>x.id).filter(x=>['orientacoes','quiz-motociclista'].includes(x));if(!allowed.length)throw Error('Materiais incompatíveis');const result=await newAction({...m,title:(m.title.slice(0,95)+' (cópia)').slice(0,110),materials:allowed});return result}
async function addMaterial(id,p){if(id==='blitz-capacete-demo')throw Error('Modelo de demonstração não editável');const m=await manifest(id);if(m.materials.length>=30)throw Error('Limite de materiais');if(!p||typeof p.title!=='string'||p.title.trim().length<4||p.title.length>110||typeof p.filename!=='string'||typeof p.data!=='string')throw Error('Material inválido');const extension=extname(p.filename).toLowerCase();if(!['.pdf','.png','.jpg','.jpeg','.webp'].includes(extension)||p.data.length>7_200_000||!/^[A-Za-z0-9+/]+={0,2}$/.test(p.data))throw Error('Arquivo inválido');const bytes=Buffer.from(p.data,'base64');if(bytes.length<10||bytes.length>5_000_000)throw Error('Tamanho inválido');const sig=bytes.subarray(0,12);if(extension==='.pdf'&&sig.subarray(0,5).toString()!=='%PDF-'||extension==='.png'&&sig.subarray(0,8).toString('hex')!=='89504e470d0a1a0a'||['.jpg','.jpeg'].includes(extension)&&sig.subarray(0,3).toString('hex')!=='ffd8ff'||extension==='.webp'&&(sig.subarray(0,4).toString()!=='RIFF'||sig.subarray(8,12).toString()!=='WEBP'))throw Error('Formato inválido');
 const materialId='material-'+randomBytes(5).toString('hex'),filename=materialId+extension,file=safe(join(id,'assets',filename));await writeFile(file,bytes,{flag:'wx'});m.materials.push({id:materialId,title:p.title.trim(),path:'assets/'+filename,type:extension.slice(1)});await saveManifest(m);return m.materials.at(-1)}
function localIPv4(){
 const ips=[];
 for(const [name,entries] of Object.entries(networkInterfaces()))for(const item of entries||[]){
  if(item.family!=='IPv4'||item.internal)continue;
  const ip=item.address;
  if(!/^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[01])\.)/.test(ip))continue;
  const penalty=/vEthernet|Virtual|VMware|Docker|Loopback|Tailscale|Hyper-V|WSL/i.test(name)?10:0;
  ips.push({ip,interface:name,penalty});
 }
 ips.sort((a,b)=>a.penalty-b.penalty||a.interface.localeCompare(b.interface));
 return ips;
}
function qrTarget(req,id){
 const host=(req.headers.host||'').split(':')[0].toLowerCase();
 const ips=localIPv4();
 const selected=ips.find(x=>x.ip===host)?.ip||ips[0]?.ip;
 if(!selected)throw Error('Rede local indisponível');
 return 'http://'+selected+':'+PORT+'/a/'+encodeURIComponent(id);
}
async function allEvents(){try{return(await readFile(join(DATA,'events.ndjson'),'utf8')).trim().split('\n').filter(Boolean).map(x=>JSON.parse(x))}catch(e){if(e.code==='ENOENT')return[];throw e}}
const seen=new Set();let lock=Promise.resolve();
async function accept(e){if(!e||typeof e!=='object'||!(/^[0-9a-f-]{36}$/i.test(e.eventId||''))||!ID.test(e.actionId||'')||!['page_view','material_open','quiz_start','quiz_finish'].includes(e.type)||typeof e.sessionId!=='string'||e.sessionId.length>80)throw Error('Evento inválido');const m=await manifest(e.actionId);if(e.revision!==m.revision)throw Error('Revisão divergente');if(e.type==='material_open'&&!m.materials.some(x=>x.id===e.materialId))throw Error('Material inválido');if(['quiz_start','quiz_finish'].includes(e.type)&&!m.materials.some(x=>x.id==='quiz-motociclista'))throw Error('Quiz indisponível');if(e.type==='quiz_finish'&&(!Number.isInteger(e.score)||e.score<0||e.score>8))throw Error('Pontuação inválida');const result={eventId:e.eventId,sessionId:e.sessionId,actionId:e.actionId,revision:e.revision,type:e.type,materialId:e.type==='material_open'?e.materialId:null,score:e.type==='quiz_finish'?e.score:null,createdAt:new Date().toISOString(),source:'offline'};let created=false;
lock=lock.then(async()=>{if(seen.has(e.eventId))return;await mkdir(DATA,{recursive:true});await appendFile(join(DATA,'events.ndjson'),JSON.stringify(result)+'\n',{mode:0o600});seen.add(e.eventId);created=true});await lock;return created}
async function handler(req,res){try{
 const u=new URL(req.url||'/', 'http://localhost'),p=decodeURIComponent(u.pathname);
 if(p.includes('\\')||p.includes('\0'))return send(res,400,{error:'Caminho inválido'});
 if(req.method==='GET'&&p==='/admin'){const page=await readFile(resolve(BASE,'admin.html'));res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});return res.end(page)}
 if(p==='/admin/actions'&&(req.method==='GET'||req.method==='POST')){if(!ACCESS_TOKEN||req.headers['x-admin-token']!==ACCESS_TOKEN)return send(res,403,{error:'Acesso restrito'});if(req.method==='GET')return send(res,200,{actions:await listActions()});let buf='';for await(const chunk of req){buf+=chunk;if(buf.length>4096)return send(res,413,{error:'Cadastro muito grande'})}const m=await newAction(JSON.parse(buf));return send(res,201,{ok:true,actionId:m.actionId})}
 if(p.startsWith('/admin/actions/')&&['PUT','POST'].includes(req.method)){if(!ACCESS_TOKEN||req.headers['x-admin-token']!==ACCESS_TOKEN)return send(res,403,{error:'Acesso restrito'});const bits=p.split('/').slice(3);if(bits.length!==2||!ID.test(bits[0])||!['edit','duplicate','materials'].includes(bits[1]))return send(res,404,{error:'Rota inválida'});if(bits[1]==='edit'&&req.method!=='PUT'||bits[1]!=='edit'&&req.method!=='POST')return send(res,405,{error:'Método inválido'});let buf='';const limit=bits[1]==='materials'?7_200_000:4096;for await(const chunk of req){buf+=chunk;if(buf.length>limit)return send(res,413,{error:'Solicitação muito grande'})}const data=buf?JSON.parse(buf):{};const result=bits[1]==='edit'?await editAction(bits[0],data):bits[1]==='duplicate'?await duplicateAction(bits[0]):await addMaterial(bits[0],data);return send(res,200,{ok:true,result})}
 if(req.method==='GET'&&p==='/admin/report.csv'){if(!ACCESS_TOKEN||req.headers['x-admin-token']!==ACCESS_TOKEN)return send(res,403,{error:'Acesso restrito'});const id=u.searchParams.get('acao')||'';if(id&&!ID.test(id))return send(res,400,{error:'Ação inválida'});const events=(await allEvents()).filter(x=>!id||x.actionId===id);const quote=v=>'"'+String(v??'').replace(/"/g,'""')+'"';const csv=['acao;data;tipo;material;pontuacao',...events.map(x=>[x.actionId,x.createdAt,x.type,x.materialId||'',x.score??''].map(quote).join(';'))].join('\r\n');res.writeHead(200,{'Content-Type':'text/csv; charset=utf-8','Content-Disposition':'attachment; filename="qr-educacao-relatorio.csv"','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});return res.end('\uFEFF'+csv)}
 if(req.method==='GET'&&p==='/network')return send(res,200,{ips:localIPv4().map(x=>({address:x.ip,interface:x.interface})),port:PORT});
 if(req.method==='GET'&&p==='/health')return send(res,200,{ok:true,mode:'offline',version:1});
 if(req.method==='GET'&&p==='/qr.js'){const content=await readFile(resolve(BASE,'qr.js'));res.writeHead(200,{'Content-Type':'text/javascript; charset=utf-8','X-Content-Type-Options':'nosniff'});return res.end(content)}
 if(req.method==='GET'&&p==='/placa'){const id=u.searchParams.get('acao')||'blitz-capacete-demo';const m=await manifest(id);const target=qrTarget(req,id);if(target.length>106)return send(res,400,{error:'Endereço muito longo para QR local'});const page=await readFile(resolve(BASE,'placa.html'),'utf8');res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});return res.end(page.replaceAll('__ACTION_TITLE__',esc(m.title)).replaceAll('__LOCAL_URL__',esc(target)))}

 if(req.method==='GET'&&p==='/'){const entries=(await readdir(ACTIONS,{withFileTypes:true})).filter(x=>x.isDirectory());res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});return res.end('<h1>Mobiliza Educa • QR Educação</h1><ul>'+entries.map(x=>'<li><a href="/a/'+encodeURIComponent(x.name)+'">'+esc(x.name)+'</a></li>').join('')+'</ul>')}
 if(req.method==='GET'&&p.startsWith('/a/')){const m=await manifest(p.slice(3));res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});return res.end(view(m))}
 if(req.method==='GET'&&p.startsWith('/actions/')){const bits=p.split('/').slice(2),id=bits[0],relative=bits.slice(1).join('/');const m=await manifest(id);if(!m.materials.some(x=>x.path===relative))return send(res,403,{error:'Material não publicado'});const file=safe(join(id,relative));let bytes=await readFile(file);const quiz=relative==='assets/quiz-motociclista.html';if(quiz&&id!=='blitz-capacete-demo')bytes=Buffer.from(bytes.toString('utf8').replaceAll("actionId:'blitz-capacete-demo',revision:2","actionId:"+JSON.stringify(id)+",revision:"+m.revision));const policy=quiz?"default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self'; base-uri 'none'; form-action 'none'":"default-src 'none'; sandbox";res.writeHead(200,{'Content-Type':TYPE[extname(file).toLowerCase()]||'application/octet-stream','Content-Length':bytes.length,'X-Content-Type-Options':'nosniff','Content-Security-Policy':policy,'Cache-Control':'private, max-age=60'});return res.end(bytes)}
 if(req.method==='POST'&&p==='/api/events'){let buf='';for await(const chunk of req){buf+=chunk;if(buf.length>4096)return send(res,413,{error:'Evento muito grande'})}const accepted=await accept(JSON.parse(buf));return send(res,202,{ok:true,recorded:accepted})}
 if(req.method==='GET'&&p==='/admin/stats'){if(!ACCESS_TOKEN||req.headers['x-admin-token']!==ACCESS_TOKEN)return send(res,403,{error:'Acesso restrito'});const ev=await allEvents();const stats={totalInteracoes:ev.length,acessos:ev.filter(x=>x.type==='page_view').length,aberturas:ev.filter(x=>x.type==='material_open').length,quizzesIniciados:ev.filter(x=>x.type==='quiz_start').length,quizzesConcluidos:ev.filter(x=>x.type==='quiz_finish').length,porAcao:{}};for(const x of ev){const g=stats.porAcao[x.actionId]??={acessos:0,materiaisAbertos:0,quizzesIniciados:0,quizzesConcluidos:0,somaAcertos:0};if(x.type==='page_view')g.acessos++;else if(x.type==='material_open')g.materiaisAbertos++;else if(x.type==='quiz_start')g.quizzesIniciados++;else if(x.type==='quiz_finish'){g.quizzesConcluidos++;g.somaAcertos+=x.score||0}}return send(res,200,stats)}
 if(req.method==='GET'&&p==='/admin/events'){if(!ACCESS_TOKEN||req.headers['x-admin-token']!==ACCESS_TOKEN)return send(res,403,{error:'Acesso restrito'});return send(res,200,{events:await allEvents()})}
 return send(res,404,{error:'Página não encontrada'});
}catch(e){if(e.code==='ENOENT')return send(res,404,{error:'Arquivo não encontrado'});if(e instanceof SyntaxError||/inválid[oa]|proibido|divergente|incompatíveis|não editável|Limite de materiais|Tamanho inválido|Rede local indisponível/.test(e.message))return send(res,400,{error:'Solicitação inválida'});console.error(e);return send(res,500,{error:'Erro interno'})}}
if(process.env.NODE_ENV!=='test'){try{for(const e of await allEvents())seen.add(e.eventId)}catch(e){console.error('Falha ao ler histórico:',e);process.exitCode=1}if(!process.exitCode)http.createServer(handler).listen(PORT,HOST,()=>console.log('QR Educação offline em http://'+HOST+':'+PORT))}
export{handler,manifest,accept,view};
