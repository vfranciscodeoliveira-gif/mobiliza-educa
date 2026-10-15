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
test('Cartaz gera link local e não usa serviço de QR externo',async()=>{const r=await fetch(ROOT+'/placa?acao=blitz-capacete-demo');assert.equal(r.status,200);const html=await r.text();assert.match(html,/127\.0\.0\.1:18091\/a\/blitz-capacete-demo/);assert.match(html,/from '\/qr\.js'/);const qr=await fetch(ROOT+'/qr.js');assert.equal(qr.status,200);assert.match(await qr.text(),/qrSvg/)});
test('Eventos validam ação, deduplicam ID e estatísticas exigem segredo',async()=>{const event={eventId:randomUUID(),sessionId:randomUUID(),actionId:'blitz-capacete-demo',revision:1,type:'page_view',createdAt:new Date().toISOString()};const opts={method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(event)};let r=await fetch(ROOT+'/api/events',opts);assert.equal(r.status,202);assert.equal((await r.json()).recorded,true);r=await fetch(ROOT+'/api/events',opts);assert.equal((await r.json()).recorded,false);r=await fetch(ROOT+'/admin/stats');assert.equal(r.status,403);r=await fetch(ROOT+'/admin/stats',{headers:{'x-admin-token':'test-admin-secret'}});assert.equal(r.status,200);assert.ok((await r.json()).acessos>=1)});
