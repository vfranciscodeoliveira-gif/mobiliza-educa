import {accessDb,requirePermission} from './cloudAccess.js?v=1';
import {getCloudTenantId} from '../cloudGateway.js?v=6';
import {windowsClassData,matchingWindowsClasses} from './windowsClassPolicy.js?v=1';
function current(ctx){if(getCloudTenantId()!==ctx.tenantId)throw new Error('Cliente alterado. Reabra a importação.');}
const rows=s=>s.docs.map(d=>({...d.data(),id:d.id})).filter(r=>!r.deletedAt);
export async function loadWindowsClassCatalog(){
 const access=await requirePermission('education.create');if(!access.allSchools)throw new Error('Importação exige acesso a todas as escolas do cliente.');
 const tenantId=getCloudTenantId(),{db,fs}=await accessDb();const [schools,classes]=await Promise.all(['schools','classes'].map(c=>fs.getDocsFromServer(fs.collection(db,'tenants',tenantId,c))));current({tenantId});return {tenantId,access,schools:rows(schools),classes:rows(classes)};
}
export async function importWindowsClass(source,pack,schoolId,ctx){
 const access=await requirePermission('education.create');if(!access.allSchools)throw new Error('Sem permissão para importar turmas.');current(ctx);
 const row=windowsClassData(source,pack.banco,schoolId,pack),{db,fs}=await accessDb();
 const snap=await fs.getDocsFromServer(fs.collection(db,'tenants',ctx.tenantId,'classes'));current(ctx);
 const matches=matchingWindowsClasses(row,rows(snap));if(matches.length>1)throw new Error('Há mais de uma turma correspondente: '+row.nome);if(matches.length===1)return {id:matches[0].id,created:false};
 const ref=fs.doc(db,'tenants',ctx.tenantId,'classes',row.id),schoolRef=fs.doc(db,'tenants',ctx.tenantId,'schools',schoolId);
 return fs.runTransaction(db,async tx=>{const [old,school]=await Promise.all([tx.get(ref),tx.get(schoolRef)]);current(ctx);if(!school.exists()||school.data().deletedAt)throw new Error('Escola não encontrada. Atualize a importação.');
 if(old.exists()){const d=old.data();if(d.deletedAt||d.idEscola!==schoolId||d.windowsOrigin?.banco!==pack.banco||Number(d.windowsOrigin?.idTurma)!==Number(source.idTurma))throw new Error('Turma já importada em outra escola ou excluída. Confira o cadastro.');return {id:row.id,created:false};}
 tx.set(ref,{...row,tenantId:ctx.tenantId,createdBy:access.uid,updatedBy:access.uid,createdAt:fs.serverTimestamp(),updatedAt:fs.serverTimestamp()});return {id:row.id,created:true};});
}
