import {cloudConfig} from '../cloudConfig.js?v=3';
import {getCloudUser} from './cloudAuth.js?v=3';
import {getCloudTenantId} from '../cloudGateway.js?v=6';

const collections={escolas:'schools',turmas:'classes',alunos:'students',instituicoes:'institutions',pessoas:'contacts',professores:'teachers'};
let contextPromise;
const caches=new Map();
window.addEventListener('mobiliza-cloud-me',()=>caches.clear());
window.addEventListener('mobiliza-cloud-tenant',()=>caches.clear());
export const supportsEducationEntity=entity=>Object.hasOwn(collections,entity);
function tenant(){const id=getCloudTenantId();if(!id||id.includes('/'))throw new Error('Conecte o Firestore e selecione uma organização antes de abrir os cadastros.');return id;}
export function educationRows(entity){const id=getCloudTenantId();return id?caches.get(id+':'+entity)||[]:[];}
async function context(){
 const user=await getCloudUser();if(!user)throw new Error('Conecte sua conta Firebase para acessar os cadastros online.');
 if(!contextPromise)contextPromise=Promise.all([
  import('https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js'),
  import('https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js')
 ]).then(([app,fs])=>({fs,db:fs.getFirestore(app.getApps().length?app.getApp():app.initializeApp(cloudConfig.firebaseWebConfig))}));
 return {...await contextPromise,user,tenantId:tenant()};
}
function collection(ctx,entity){if(!supportsEducationEntity(entity))throw new Error('Cadastro inválido.');return ctx.fs.collection(ctx.db,'tenants',ctx.tenantId,collections[entity]);}
function ensureCurrent(ctx){if(tenant()!==ctx.tenantId)throw new Error('A organização mudou durante a operação. Abra o cadastro novamente.');}
export async function loadEducation(){
 const ctx=await context();
 const results=await Promise.all(Object.keys(collections).map(async entity=>{
  const snap=await ctx.fs.getDocsFromServer(collection(ctx,entity));
  return [entity,snap.docs.map(d=>({...d.data(),id:d.id})).filter(r=>!r.deletedAt)];
 }));
 ensureCurrent(ctx);for(const [entity,rows] of results)caches.set(ctx.tenantId+':'+entity,rows);
}
export async function saveEducation(entity,row){
 const ctx=await context();ensureCurrent(ctx);
 if(!row.id||String(row.id).includes('/'))throw new Error('ID inválido.');
 if(!String(row.nome||'').trim())throw new Error('Informe o nome.');
 const ref=ctx.fs.doc(collection(ctx,entity),String(row.id));
 await ctx.fs.runTransaction(ctx.db,async tx=>{
  const old=await tx.get(ref),data={...row,tenantId:ctx.tenantId,updatedBy:ctx.user.uid,updatedAt:ctx.fs.serverTimestamp()};
  delete data._cloud;
  if(old.exists()){data.createdAt=old.data().createdAt;data.createdBy=old.data().createdBy;}
  else {data.createdAt=ctx.fs.serverTimestamp();data.createdBy=ctx.user.uid;}
  tx.set(ref,data);
 });
 ensureCurrent(ctx);
 const rows=educationRows(entity).filter(x=>x.id!==row.id);rows.unshift({...row,tenantId:ctx.tenantId});caches.set(ctx.tenantId+':'+entity,rows);
 return row;
}
export async function deleteEducation(entity,id){
 const ctx=await context();ensureCurrent(ctx);
 await ctx.fs.updateDoc(ctx.fs.doc(collection(ctx,entity),id),{deletedAt:ctx.fs.serverTimestamp(),updatedAt:ctx.fs.serverTimestamp(),updatedBy:ctx.user.uid});
 ensureCurrent(ctx);caches.set(ctx.tenantId+':'+entity,educationRows(entity).filter(x=>x.id!==id));
}
