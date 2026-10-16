import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:net';
import {spawn} from 'node:child_process';
import {setTimeout as delay} from 'node:timers/promises';
import {randomUUID} from 'node:crypto';
import {fileURLToPath} from 'node:url';
const cwd=fileURLToPath(new URL('../qr-educacao/offline/',import.meta.url));
async function freePort(){
 const s=createServer();await new Promise(resolve=>s.listen(0,'127.0.0.1',resolve));
 const p=s.address().port;await new Promise(resolve=>s.close(resolve));return p;
}
test('Fluxo integrado portal QR -> quiz -> pontuação -> relatório do gestor',async()=>{
 const port=await freePort(),root='http://127.0.0.1:'+port;
 const child=spawn(process.execPath,['server.mjs'],{cwd,env:{...process.env,NODE_ENV:'production',HOST:'127.0.0.1',PORT:String(port),ADMIN_TOKEN:'integration-qr-secret'},stdio:['ignore','pipe','pipe']});
 let error='';child.stderr.on('data',x=>error+=x.toString());
 const auth={'X-Admin-Token':'integration-qr-secret','Content-Type':'application/json'};
 try{
  let ready=false;
  for(let i=0;i<80;i++){if(child.exitCode!==null)break;try{const r=await fetch(root+'/health');if(r.ok){ready=true;break}}catch{}await delay(100)}
  assert.ok(ready,'Servidor não iniciou: '+error);
  const created=await fetch(root+'/admin/actions',{method:'POST',headers:auth,body:JSON.stringify({title:'Blitz teste ponta a ponta',date:'2026-10-16',description:'Teste de integração',materials:['orientacoes','quiz-motociclista']})});
  assert.equal(created.status,201);const {actionId}=await created.json();
  const portal=await fetch(root+'/a/'+actionId);assert.equal(portal.status,200);
  const page=await portal.text();assert.match(page,/quiz-motociclista.html/);
  const quiz=await fetch(root+'/actions/'+actionId+'/assets/quiz-motociclista.html');
  assert.equal(quiz.status,200);assert.match(await quiz.text(),/Resultado registrado com sucesso/);
  const sessionId=randomUUID(),sent=new Date().toISOString();
  const types=[['page_view',undefined],['material_open',undefined],['quiz_start',undefined],['quiz_finish',7]];
  for(const [type,score] of types){
   const payload={eventId:randomUUID(),sessionId,actionId,revision:1,type,createdAt:sent};
   if(type==='material_open')payload.materialId='orientacoes';
   if(score!==undefined)payload.score=score;
   const r=await fetch(root+'/api/events',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
   assert.equal(r.status,202);assert.equal((await r.json()).recorded,true);
  }
  const report=await fetch(root+'/admin/field-report?acao='+actionId,{headers:auth});
  assert.equal(report.status,200);const {totals,actions}=await report.json();
  assert.equal(actions.length,1);assert.equal(totals.pageViews,1);
  assert.equal(totals.uniqueSessions,1);assert.equal(totals.materialOpens,1);
  assert.equal(totals.quizStarts,1);assert.equal(totals.quizFinishes,1);
  assert.equal(totals.averageScore,7);
  const stats=await fetch(root+'/admin/stats',{headers:auth});assert.equal(stats.status,200);
  assert.equal((await stats.json()).porAcao[actionId].somaAcertos,7);
 }finally{child.kill()}
});
