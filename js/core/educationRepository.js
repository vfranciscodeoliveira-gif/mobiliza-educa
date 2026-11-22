import {getCloudUser} from './cloudAuth.js?v=3';
import {getCloudTenantId} from '../cloudGateway.js?v=6';
import {accessDb,loadAccess,permissionAllowed,schoolAllowed} from './cloudAccess.js?v=1';
const collections={escolas:'schools',turmas:'classes',alunos:'students',instituicoes:'institutions',pessoas:'contacts',professores:'teachers'};
const caches=new Map();let currentUid='';
for(const event of ['mobiliza-cloud-me','mobiliza-cloud-tenant','mobiliza-cloud-auth'])window.addEventListener(event,()=>{caches.clear();currentUid='';});
export const supportsEducationEntity=entity=>Object.hasOwn(collections,entity);
function tenant(){const id=getCloudTenantId();if(!id||id.includes('/'))throw new Error('Conecte o Firestore e selecione uma organização antes de abrir os cadastros.');return id;}
export function educationRows(entity){const id=getCloudTenantId();return id?caches.get(currentUid+':'+id+':'+entity)||[]:[];}
async function context(){const user=await getCloudUser();if(!user)throw new Error('Conecte sua conta Firebase para acessar os cadastros online.');const tenantId=tenant(),access=await loadAccess(tenantId);if(!access.active)throw new Error('Usuário sem vínculo ativo com este cliente.');if(currentUid!==user.uid)caches.clear();currentUid=user.uid;return {...await accessDb(),user,tenantId,access};}
function collection(ctx,entity){if(!supportsEducationEntity(entity))throw new Error('Cadastro inválido.');return ctx.fs.collection(ctx.db,'tenants',ctx.tenantId,collections[entity]);}
function ensureCurrent(ctx){if(tenant()!==ctx.tenantId||currentUid!==ctx.user.uid)throw new Error('A conta ou organização mudou durante a operação. Abra o cadastro novamente.');}
export async function loadEducation(){
 const ctx=await context(),out={};
 for(const entity of Object.keys(collections)){
  const canRead=permissionAllowed(ctx.access,'education.read')||permissionAllowed(ctx.access,'reports.read')||['escolas','turmas','alunos'].includes(entity)&&permissionAllowed(ctx.access,'certificates.emit');let rows=[];
  if(canRead){const ref=collection(ctx,entity),snapRows=snap=>snap.docs.map(d=>({...d.data(),id:d.id}));if(ctx.access.allSchools||ctx.access.owner)rows=snapRows(await ctx.fs.getDocsFromServer(ref));
   else if(entity==='escolas'){for(const id of ctx.access.schoolIds||[]){const d=await ctx.fs.getDocFromServer(ctx.fs.doc(ref,id));if(d.exists())rows.push({...d.data(),id:d.id});}}
   else if(['turmas','professores'].includes(entity)){for(const id of ctx.access.schoolIds||[])rows.push(...snapRows(await ctx.fs.getDocsFromServer(ctx.fs.query(ref,ctx.fs.where('idEscola','==',id)))));}
   else if(entity==='alunos'){for(const c of out.turmas||[])rows.push(...snapRows(await ctx.fs.getDocsFromServer(ctx.fs.query(ref,ctx.fs.where('idTurma','==',c.id)))));}
  }out[entity]=rows.filter(r=>!r.deletedAt);
 }
 ensureCurrent(ctx);for(const [entity,rows] of Object.entries(out))caches.set(ctx.user.uid+':'+ctx.tenantId+':'+entity,rows);
}
function rowSchool(entity,row){return entity==='escolas'?row.id:entity==='alunos'?educationRows('turmas').find(c=>c.id===row.idTurma)?.idEscola:row.idEscola;}
export async function saveEducation(entity,row){
 const ctx=await context();ensureCurrent(ctx);if(!row.id||String(row.id).includes('/'))throw new Error('ID inválido.');if(!String(row.nome||'').trim())throw new Error('Informe o nome.');
 const existing=educationRows(entity).find(r=>r.id===row.id),action=existing?'education.update':'education.create';if(!permissionAllowed(ctx.access,action)||!ctx.access.allSchools&&!schoolAllowed(ctx.access,rowSchool(entity,row)))throw new Error('Sem permissão para cadastrar/editar nesta escola.');
 const ref=ctx.fs.doc(collection(ctx,entity),String(row.id)),data={...row,tenantId:ctx.tenantId,updatedBy:ctx.user.uid,updatedAt:ctx.fs.serverTimestamp()};delete data._cloud;
 if(existing)await ctx.fs.runTransaction(ctx.db,async tx=>{const old=await tx.get(ref);if(!old.exists())throw new Error('Registro não encontrado. Atualize o cadastro.');tx.set(ref,{...data,createdAt:old.data().createdAt,createdBy:old.data().createdBy});});
 else await ctx.fs.setDoc(ref,{...data,createdAt:ctx.fs.serverTimestamp(),createdBy:ctx.user.uid});
 ensureCurrent(ctx);const rows=educationRows(entity).filter(x=>x.id!==row.id);rows.unshift({...row,tenantId:ctx.tenantId});caches.set(ctx.user.uid+':'+ctx.tenantId+':'+entity,rows);return row;
}
export async function deleteEducation(entity,id){const ctx=await context();ensureCurrent(ctx);const row=educationRows(entity).find(r=>r.id===id);if(!permissionAllowed(ctx.access,'education.delete')||!row||!ctx.access.allSchools&&!schoolAllowed(ctx.access,rowSchool(entity,row)))throw new Error('Sem permissão para excluir nesta escola.');await ctx.fs.updateDoc(ctx.fs.doc(collection(ctx,entity),id),{deletedAt:ctx.fs.serverTimestamp(),updatedAt:ctx.fs.serverTimestamp(),updatedBy:ctx.user.uid});ensureCurrent(ctx);caches.set(ctx.user.uid+':'+ctx.tenantId+':'+entity,educationRows(entity).filter(x=>x.id!==id));}
