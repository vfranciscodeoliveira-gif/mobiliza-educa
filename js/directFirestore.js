import {cloudConfig} from './cloudConfig.js?v=3';
import {getCloudUser,cloudStoragePrefix} from './core/cloudAuth.js?v=3';

let dbPromise=null;
const trim=(v,n=500)=>String(v??'').trim().slice(0,n);
const digits=v=>String(v||'').replace(/\D/g,'');
const tenantId=()=>String(cloudConfig.directFirestore?.tenantId||cloudConfig.publicTenantSlug||'mobiliza-educa').trim();

export const directFirestoreConfigured=()=>!!(
  cloudConfig.directFirestore?.enabled &&
  cloudConfig.firebaseWebConfig?.apiKey &&
  cloudConfig.firebaseWebConfig?.projectId &&
  tenantId()
);

async function db(){
  if(!directFirestoreConfigured())throw new Error('Firestore direto ainda não configurado.');
  if(!dbPromise){
    dbPromise=(async()=>{
      const [appSdk,fs]=await Promise.all([
        import('https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js'),
        import('https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js')
      ]);
      const app=appSdk.getApps().length?appSdk.getApp():appSdk.initializeApp(cloudConfig.firebaseWebConfig);
      return{db:fs.getFirestore(app),fs};
    })();
  }
  return dbPromise;
}

function friendly(err){
  if(err?.code==='permission-denied'||String(err?.message||'').includes('insufficient permissions'))
    return new Error('O Firestore está conectado, mas as regras de acesso direto ainda não foram publicadas ou este usuário não possui permissão.');
  if(err?.code==='unavailable')return new Error('O Firestore está temporariamente indisponível. Tente novamente.');
  return err instanceof Error?err:new Error(String(err||'Falha no Firestore.'));
}
async function run(fn){try{return await fn();}catch(e){throw friendly(e);}}

function protocol(prefix){
  const d=new Date(),ymd=d.getFullYear()+String(d.getMonth()+1).padStart(2,'0')+String(d.getDate()).padStart(2,'0');
  const u=new Uint8Array(12);crypto.getRandomValues(u);
  const code=[...u].map(x=>x.toString(16).padStart(2,'0')).join('').toUpperCase();
  return prefix+'-'+ymd+'-'+code;
}
function validateRequest(x){
  if(!trim(x.origemNome)||!trim(x.solicitanteNome)||!trim(x.email)||!trim(x.telefone)||!trim(x.atividade))
    throw new Error('Preencha os campos obrigatórios.');
}
function validateRegistration(x){
  if(!trim(x.idEvento)||!trim(x.nome)||!trim(x.email)||!trim(x.telefone))
    throw new Error('Preencha os campos obrigatórios.');
}
function requestDoc(x,p){
  return{tenantId:tenantId(),protocolo:p,status:'Recebida',origemTipo:trim(x.origemTipo,80),origemNome:trim(x.origemNome,180),solicitanteNome:trim(x.solicitanteNome,180),telefone:trim(x.telefone,40),email:trim(x.email,180).toLowerCase(),atividade:trim(x.atividade,100),dataPreferida:trim(x.dataPreferida,10),horaPreferida:trim(x.horaPreferida,5),flexibilidade:trim(x.flexibilidade,100),quantidade:Math.max(1,Math.min(9999,Number(x.quantidade)||1)),publico:trim(x.publico,180),local:trim(x.local,250),necessidades:trim(x.necessidades,1500)};
}
function registrationDoc(x,p){
  return{tenantId:tenantId(),protocolo:p,status:'Recebida',idEvento:trim(x.idEvento,120),tipoInscricao:trim(x.tipoInscricao,60),nome:trim(x.nome,180),responsavel:trim(x.responsavel,180),telefone:trim(x.telefone,40),email:trim(x.email,180).toLowerCase(),quantidade:Math.max(1,Math.min(500,Number(x.quantidade)||1)),observacao:trim(x.observacao,1000)};
}
function statusDoc(p,type){
  return{tenantId:tenantId(),protocolo:p,status:'Recebida',tipo:type};
}

export async function submitSolicitacaoDireta(data){
 return run(async()=>{
  validateRequest(data);const p=protocol('SOL'),ctx=await db(),{fs}=ctx,reqRef=fs.doc(fs.collection(ctx.db,'tenants',tenantId(),'requests')),stRef=fs.doc(ctx.db,'tenants',tenantId(),'publicStatuses',p),batch=fs.writeBatch(ctx.db);
  batch.set(reqRef,{...requestDoc(data,p),createdAt:fs.serverTimestamp(),updatedAt:fs.serverTimestamp()});
  batch.set(stRef,{...statusDoc(p,'Solicitação'),createdAt:fs.serverTimestamp(),updatedAt:fs.serverTimestamp()});
  await batch.commit();return{ok:true,id:reqRef.id,protocolo:p,status:'Recebida'};
 });
}
export async function listPublicEventsDireto(){
 return run(async()=>{
  const ctx=await db(),{fs}=ctx,today=new Date().toISOString().slice(0,10),q=fs.query(fs.collection(ctx.db,'tenants',tenantId(),'publicEvents'),fs.where('publicadoOnline','==',true),fs.limit(100)),snap=await fs.getDocs(q),eventos=[];
  snap.forEach(d=>{const e=d.data();if(e.status!=='Confirmado'||!e.inscricoesAbertas||String(e.dataInicio||'')<today)return;eventos.push({id:d.id,nome:e.nome||'Atividade',dataInicio:e.dataInicio||'',horaInicio:e.horaInicio||'',horaFim:e.horaFim||'',local:e.local||'',vagas:Number(e.vagas)||0,dataLabel:e.dataLabel||e.dataInicio||'',vagasInfo:e.vagas?'até '+e.vagas+' vagas':'vagas sob confirmação'});});
  eventos.sort((a,b)=>String(a.dataInicio).localeCompare(String(b.dataInicio)));return{ok:true,eventos};
 });
}
export async function submitInscricaoDireta(data){
 return run(async()=>{
  validateRegistration(data);const ctx=await db(),{fs}=ctx,evRef=fs.doc(ctx.db,'tenants',tenantId(),'publicEvents',trim(data.idEvento,120)),ev=await fs.getDoc(evRef);
  if(!ev.exists())throw new Error('Atividade não encontrada.');const e=ev.data();if(!e.publicadoOnline||e.status!=='Confirmado'||!e.inscricoesAbertas)throw new Error('As inscrições não estão abertas para esta atividade.');
  const p=protocol('INS'),regRef=fs.doc(fs.collection(ctx.db,'tenants',tenantId(),'registrations')),stRef=fs.doc(ctx.db,'tenants',tenantId(),'publicStatuses',p),batch=fs.writeBatch(ctx.db);
  batch.set(regRef,{...registrationDoc(data,p),createdAt:fs.serverTimestamp(),updatedAt:fs.serverTimestamp()});
  batch.set(stRef,{...statusDoc(p,'Inscrição'),createdAt:fs.serverTimestamp(),updatedAt:fs.serverTimestamp()});
  await batch.commit();return{ok:true,id:regRef.id,protocolo:p,status:'Recebida'};
 });
}
export async function consultarProtocoloDireto(protocolo){
 return run(async()=>{
  const p=trim(protocolo,96).toUpperCase();if(!p)throw new Error('Informe o protocolo.');
  const ctx=await db(),{fs}=ctx,snap=await fs.getDoc(fs.doc(ctx.db,'tenants',tenantId(),'publicStatuses',p));if(!snap.exists())throw new Error('Protocolo não encontrado.');
  const d=snap.data(),confirmed=['Agendada','Confirmada','Concluída','Presente'].includes(d.status);
  return{ok:true,protocolo:p,status:d.status||'Recebida',tipoLabel:d.tipo||'Protocolo',mensagem:confirmed?'Há confirmação registrada pelo gestor.':'O registro foi recebido, mas ainda não representa atendimento ou vaga garantida.'};
 });
}

const adminTenantId=()=>localStorage.getItem(cloudStoragePrefix()+'.tenantId')||tenantId();
async function requireUser(){
 const user=await getCloudUser();if(!user)throw new Error('Conecte sua conta Firebase na Gestão para sincronizar.');
 return user;
}
function jsDate(v){return v?.toDate?v.toDate().toISOString():v||'';}
function normalizeSnap(snap){
 return snap.docs.map(d=>{const x=d.data();return{id:d.id,...x,createdAt:jsDate(x.createdAt),updatedAt:jsDate(x.updatedAt),checkedInAt:jsDate(x.checkedInAt),_cloud:true};});
}
function mergeLocal(name,rows){
 const k='mobiliza.admin.'+name,local=JSON.parse(localStorage.getItem(k)||'[]'),map=new Map(local.map(x=>[x.id,x]));
 for(const r of rows){const old=map.get(r.id)||{};map.set(r.id,{...old,...r,_cloud:true});}
 localStorage.setItem(k,JSON.stringify([...map.values()]));window.dispatchEvent(new CustomEvent('mobiliza-data-change',{detail:{entity:name,source:'firestore-direct'}}));
}

export async function directCloudMe(){
 return run(async()=>{
  const user=await requireUser(),ctx=await db(),{fs}=ctx,memberships=[];
  const owner=await fs.getDoc(fs.doc(ctx.db,'platformOwners',user.uid));
  if(owner.exists()&&owner.data().active===true)memberships.push({tenantId:adminTenantId(),role:'GESTOR',tenant:{id:adminTenantId(),name:'Mobiliza Educa',slug:cloudConfig.publicTenantSlug||adminTenantId()},owner:true});
  if(!memberships.length){
   const q=fs.query(fs.collection(ctx.db,'memberships'),fs.where('uid','==',user.uid),fs.limit(25)),snap=await fs.getDocs(q);
   for(const d of snap.docs){const m=d.data();if(m.active===false)continue;let t={id:m.tenantId,name:m.tenantName||m.tenantId,slug:m.tenantSlug||''};try{const td=await fs.getDoc(fs.doc(ctx.db,'tenants',m.tenantId));if(td.exists())t={id:td.id,...td.data()};}catch{}memberships.push({tenantId:m.tenantId,role:m.role||'OPERADOR',tenant:t});}
  }
  return{ok:true,user:{uid:user.uid,email:user.email||''},memberships,direct:true};
 });
}
export async function syncDirectInbox(){
 return run(async()=>{
  await requireUser();const ctx=await db(),{fs}=ctx;
  const [rq,rg]=await Promise.all([fs.getDocs(fs.query(fs.collection(ctx.db,'tenants',adminTenantId(),'requests'),fs.limit(300))),fs.getDocs(fs.query(fs.collection(ctx.db,'tenants',adminTenantId(),'registrations'),fs.limit(300)))]);
  const solicitacoes=normalizeSnap(rq).sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt))),inscricoes=normalizeSnap(rg).sort((a,b)=>String(b.createdAt).localeCompare(String(a.createdAt)));
  mergeLocal('solicitacoes',solicitacoes);mergeLocal('inscricoes',inscricoes);
  return{synced:true,solicitacoes:solicitacoes.length,inscricoes:inscricoes.length};
 });
}
async function updateStatus(collection,id,status,extra={}){
 return run(async()=>{
  await requireUser();const ctx=await db(),{fs}=ctx,ref=fs.doc(ctx.db,'tenants',adminTenantId(),collection,id),snap=await fs.getDoc(ref);if(!snap.exists())throw new Error('Registro online não encontrado.');
  const row=snap.data(),batch=fs.writeBatch(ctx.db),patch={status:trim(status,80),updatedAt:fs.serverTimestamp(),...extra};batch.update(ref,patch);
  if(row.protocolo){const st=fs.doc(ctx.db,'tenants',adminTenantId(),'publicStatuses',row.protocolo);batch.set(st,{status:trim(status,80),updatedAt:fs.serverTimestamp()},{merge:true});}
  await batch.commit();return{ok:true};
 });
}
export const updateDirectRequestStatus=(id,status,extra={})=>updateStatus('requests',id,status,extra);
export const updateDirectRegistrationStatus=(id,status)=>updateStatus('registrations',id,status);

export async function publishEventDireto(evento){
 return run(async()=>{
  await requireUser();const ctx=await db(),{fs}=ctx,id=trim(evento.id,120)||fs.doc(fs.collection(ctx.db,'tenants',adminTenantId(),'publicEvents')).id;
  const doc={tenantId:adminTenantId(),nome:trim(evento.nome,180),tipo:trim(evento.tipo,80),status:trim(evento.status,50)||'Confirmado',dataInicio:trim(evento.dataInicio,10),dataFim:trim(evento.dataFim,10),horaInicio:trim(evento.horaInicio,5),horaFim:trim(evento.horaFim,5),local:trim(evento.local,250),vagas:Math.max(0,Number(evento.vagas)||0),checkinToken:trim(evento.checkinToken,30),inscricoesAbertas:evento.inscricoesAbertas!==false,publicadoOnline:true,dataLabel:trim(evento.dataLabel,40)||trim(evento.dataInicio,10),updatedAt:fs.serverTimestamp()};
  await fs.setDoc(fs.doc(ctx.db,'tenants',adminTenantId(),'publicEvents',id),doc,{merge:true});return{ok:true,id};
 });
}
