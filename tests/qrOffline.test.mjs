import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {setTimeout as delay} from 'node:timers/promises';
import {randomUUID} from 'node:crypto';
import {fileURLToPath} from 'node:url';

const folder=fileURLToPath(new URL('../qr-educacao/offline/',import.meta.url));
const PORT=18091,ROOT='http://127.0.0.1:'+PORT;
let child;
test.before(async()=>{child=spawn(process.execPath,['server.mjs'],{cwd:folder,env:{...process.env,PORT:String(PORT),HOST:'127.0.0.1',ADMIN_TOKEN:'test-admin-secret'},stdio:'pipe'});for(let i=0;i<60;i++){if(child.exitCode!==null)throw Error('Servidor terminou antes de iniciar');try{const res=await fetch(ROOT+'/health');if(res.ok)return}catch{}await delay(100)}throw Error('Servidor offline indisponível')});
test.after(()=>{if(child)child.kill()});
test('Página de blitz e materiais do manifesto disponíveis',async()=>{
 const response=await fetch(ROOT+'/a/blitz-capacete-demo');assert.equal(response.status,200);const html=await response.text();assert.match(html,/Motociclista Seguro/);assert.match(html,/orientacoes\.html/);
 const file=await fetch(ROOT+'/actions/blitz-capacete-demo/assets/orientacoes.html');assert.equal(file.status,200);assert.match(await file.text(),/demonstração/);
});
test('Arquivos fora do manifesto não são distribuídos',async()=>{let r=await fetch(ROOT+'/actions/blitz-capacete-demo/manifest.json');assert.equal(r.status,403);r=await fetch(ROOT+'/actions/blitz-capacete-demo/assets/segredo.txt');assert.equal(r.status,403)});
test('Cartaz gera link local e não usa serviço de QR externo',async()=>{const r=await fetch(ROOT+'/placa?acao=blitz-capacete-demo');assert.equal(r.status,200);const html=await r.text();assert.match(html,/http:\/\/(?:10\.|192\.168\.|172\.)[0-9.]+:18091\/a\/blitz-capacete-demo/);assert.match(html,/from '\/qr\.js'/);const qr=await fetch(ROOT+'/qr.js');assert.equal(qr.status,200);assert.match(await qr.text(),/qrSvg/)});
test('Eventos validam ação, deduplicam ID e estatísticas exigem segredo',async()=>{const event={eventId:randomUUID(),sessionId:randomUUID(),actionId:'blitz-capacete-demo',revision:2,type:'page_view',createdAt:new Date().toISOString()};const opts={method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(event)};let r=await fetch(ROOT+'/api/events',opts);assert.equal(r.status,202);assert.equal((await r.json()).recorded,true);r=await fetch(ROOT+'/api/events',opts);assert.equal((await r.json()).recorded,false);r=await fetch(ROOT+'/admin/stats');assert.equal(r.status,403);r=await fetch(ROOT+'/admin/stats',{headers:{'x-admin-token':'test-admin-secret'}});assert.equal(r.status,200);assert.ok((await r.json()).acessos>=1)});

test('Quiz pode ser aberto sem internet e registra início/conclusão anonimamente',async()=>{
 const file=await fetch(ROOT+'/actions/blitz-capacete-demo/assets/quiz-motociclista.html');
 assert.equal(file.status,200);
 const html=await file.text();
 assert.match(html,/Desafio Motociclista Seguro/);
 assert.match(html,/quiz_finish/);
 assert.match(html,/8 perguntas|PERGUNTA/);
 const sessionId=randomUUID();
 for(const [type,score] of [['quiz_start',undefined],['quiz_finish',6]]){
  const event={eventId:randomUUID(),sessionId,actionId:'blitz-capacete-demo',revision:2,type,createdAt:new Date().toISOString()};
  if(score!==undefined)event.score=score;
  const result=await fetch(ROOT+'/api/events',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(event)});
  assert.equal(result.status,202);
 }
 const stats=await fetch(ROOT+'/admin/stats',{headers:{'x-admin-token':'test-admin-secret'}});
 const obj=await stats.json();
 assert.ok(obj.quizzesIniciados>=1);
 assert.ok(obj.quizzesConcluidos>=1);
 assert.ok(obj.porAcao['blitz-capacete-demo'].somaAcertos>=6);
});
test('Pontuações fora do intervalo são rejeitadas',async()=>{
 const event={eventId:randomUUID(),sessionId:randomUUID(),actionId:'blitz-capacete-demo',revision:2,type:'quiz_finish',score:100,createdAt:new Date().toISOString()};
 const res=await fetch(ROOT+'/api/events',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(event)});
 assert.equal(res.status,400);
});

test('Painel do gestor exige token e permite criar blitz isolada',async()=>{
 let r=await fetch(ROOT+'/admin');assert.equal(r.status,200);assert.match(await r.text(),/Gestor Offline 360/);
 r=await fetch(ROOT+'/admin/actions');assert.equal(r.status,403);
 const auth={'X-Admin-Token':'test-admin-secret'};
 r=await fetch(ROOT+'/admin/actions',{headers:auth});assert.equal(r.status,200);const before=await r.json();assert.ok(before.actions.length>=1);
 r=await fetch(ROOT+'/admin/actions',{method:'POST',headers:{...auth,'Content-Type':'application/json'},body:JSON.stringify({title:'Blitz Educativa - Teste',date:'2026-10-15',description:'Ação de teste',materials:['orientacoes','quiz-motociclista']})});assert.equal(r.status,201);const created=await r.json();assert.match(created.actionId,/^blitz-[a-f0-9]{12}$/);
 r=await fetch(ROOT+'/a/'+created.actionId);assert.equal(r.status,200);
 r=await fetch(ROOT+'/actions/'+created.actionId+'/assets/quiz-motociclista.html');assert.equal(r.status,200);assert.match(r.headers.get('content-security-policy'),/script-src/);const body=await r.text();assert.ok(body.includes('actionId:"'+created.actionId+'",revision:1'));
 r=await fetch(ROOT+'/placa?acao='+created.actionId);assert.equal(r.status,200);
 const event={eventId:randomUUID(),sessionId:randomUUID(),actionId:created.actionId,revision:1,type:'quiz_finish',score:7};
 r=await fetch(ROOT+'/api/events',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(event)});assert.equal(r.status,202);
 r=await fetch(ROOT+'/admin/stats',{headers:auth});const stats=await r.json();assert.equal(stats.porAcao[created.actionId].somaAcertos,7);
});

test('Gestor v2: cadastro completo, edição, duplicação, biblioteca PDF e CSV',async()=>{
 const auth={'X-Admin-Token':'test-admin-secret','Content-Type':'application/json'};
 const send=async(path,method,data)=>fetch(ROOT+path,{method,headers:auth,body:JSON.stringify(data)});
 const payload={title:'Blitz v2 - Terminal',date:'2026-10-16',time:'09:30',location:'Terminal Central',responsible:'Equipe Educativa',audience:'Motociclistas',status:'planejada',description:'Teste de integracao',materials:['orientacoes','quiz-motociclista']};
 let r=await send('/admin/actions','POST',payload);assert.equal(r.status,201);const id=(await r.json()).actionId;
 r=await send('/admin/actions/'+id+'/edit','PUT',{...payload,title:'Blitz v2 - Atualizada',status:'em_andamento'});assert.equal(r.status,200);
 r=await fetch(ROOT+'/admin/actions',{headers:auth});const list=(await r.json()).actions;assert.equal(list.find(x=>x.actionId===id).status,'em_andamento');
 const pdf=Buffer.from('%PDF-1.4\n1 0 obj\n<<>>\nendobj\n%%EOF').toString('base64');
 r=await send('/admin/actions/'+id+'/materials','POST',{filename:'seguranca.pdf',title:'Cartilha ilustrativa',data:pdf});assert.equal(r.status,200);const added=(await r.json()).result;
 r=await fetch(ROOT+'/actions/'+id+'/'+added.path);assert.equal(r.status,200);assert.match(r.headers.get('content-type'),/pdf/);
 r=await send('/admin/actions/'+id+'/materials','POST',{filename:'falso.pdf',title:'Arquivo invalido',data:Buffer.from('not a pdf').toString('base64')});assert.equal(r.status,400);
 r=await send('/admin/actions/'+id+'/duplicate','POST',{});assert.equal(r.status,200);const copy=(await r.json()).result;assert.notEqual(copy.actionId,id);
 r=await fetch(ROOT+'/admin/report.csv',{headers:auth});assert.equal(r.status,200);assert.match(r.headers.get('content-type'),/text\/csv/);
 r=await fetch(ROOT+'/admin/report.csv');assert.equal(r.status,403);
});

test('QR da blitz usa IPv4 LAN mesmo quando cartaz foi aberto em localhost',async()=>{
 const net=await fetch(ROOT+'/network');assert.equal(net.status,200);
 const info=await net.json();assert.ok(Array.isArray(info.ips));
 const res=await fetch(ROOT+'/placa?acao=blitz-capacete-demo',{headers:{Host:'localhost:'+PORT}});
 assert.equal(res.status,info.ips.length?200:400);
 if(info.ips.length){const html=await res.text();assert.ok(html.includes('http://'+info.ips[0].address+':'+PORT+'/a/blitz-capacete-demo'));assert.ok(!html.includes('http://localhost:'+PORT+'/a/'))}
});
test('Após upload o manifesto mantém material e conteúdo após consulta posterior',async()=>{
 const auth={'X-Admin-Token':'test-admin-secret','Content-Type':'application/json'};
 let res=await fetch(ROOT+'/admin/actions',{method:'POST',headers:auth,body:JSON.stringify({title:'Teste arquivo persistente',date:'',description:'',materials:['orientacoes']})});
 assert.equal(res.status,201);const id=(await res.json()).actionId;
 const pdf=Buffer.from('%PDF-1.4\nPersistencia do material QR\n%%EOF');
 res=await fetch(ROOT+'/admin/actions/'+id+'/materials',{method:'POST',headers:auth,body:JSON.stringify({filename:'cartilha.pdf',title:'Cartilha de campo',data:pdf.toString('base64')})});
 assert.equal(res.status,200);const added=(await res.json()).result;
 res=await fetch(ROOT+'/admin/actions',{headers:auth});const actions=(await res.json()).actions;assert.ok(actions.find(a=>a.actionId===id).materials.some(m=>m.path===added.path));
 res=await fetch(ROOT+'/a/'+id);assert.match(await res.text(),/Cartilha de campo/);
 res=await fetch(ROOT+'/actions/'+id+'/'+added.path);assert.equal(res.status,200);assert.deepEqual(Buffer.from(await res.arrayBuffer()),pdf);
});

test('Painel trata API de rede ausente sem acesso direto a length',async()=>{const r=await fetch(ROOT+'/admin');assert.equal(r.status,200);const html=await r.text();assert.match(html,/Array\.isArray\(net\.data\?\.ips\)/);assert.match(html,/servidor Node\.js está desatualizado/);});
