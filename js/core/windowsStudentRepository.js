import {accessDb,requirePermission} from './cloudAccess.js?v=1';
import {getCloudTenantId} from '../cloudGateway.js?v=6';
import {windowsStudentData} from './windowsStudentPolicy.js?v=1';
function current(ctx){if(getCloudTenantId()!==ctx.tenantId)throw new Error('Cliente alterado. Reabra a importação.');}
const rows=s=>s.docs.map(d=>({...d.data(),id:d.id})).filter(r=>!r.deletedAt);
export async function loadWindowsStudentCatalog(){
 const access=await requirePermission('education.create');if(!access.allSchools)throw new Error('Importação exige acesso a todas as escolas do cliente.');
 const tenantId=getCloudTenantId(),{db,fs}=await accessDb();const [schools,classes,students]=await Promise.all(['schools','classes','students'].map(c=>fs.getDocsFromServer(fs.collection(db,'tenants',tenantId,c))));current({tenantId});return {tenantId,access,schools:rows(schools),classes:rows(classes),students:rows(students)};
}
export async function importWindowsStudent(a,banco,classId,ctx,existingId=''){
 const access=await requirePermission('education.create');if(!access.allSchools)throw new Error('Sem permissão para importar alunos.');current(ctx);
 const row=windowsStudentData(a,banco,classId),{db,fs}=await accessDb(),ref=fs.doc(db,'tenants',ctx.tenantId,'students',row.id),classRef=fs.doc(db,'tenants',ctx.tenantId,'classes',classId);
 if(existingId&&existingId.includes('/'))throw new Error('ID existente inválido.');const target=existingId?fs.doc(db,'tenants',ctx.tenantId,'students',existingId):null;
 return fs.runTransaction(db,async tx=>{const refs=[ref,classRef,...(target?[target]:[])],docs=await Promise.all(refs.map(r=>tx.get(r)));current(ctx);const [old,cl,existing]=docs;
 if(!cl.exists()||cl.data().deletedAt)throw new Error('Turma não encontrada. Atualize os cadastros.');const school=await tx.get(fs.doc(db,'tenants',ctx.tenantId,'schools',cl.data().idEscola));current(ctx);if(!school.exists()||school.data().deletedAt)throw new Error('Escola não encontrada.');
 if(old.exists()){const d=old.data();if(d.deletedAt||d.idTurma!==classId||d.windowsOrigin?.banco!==banco||Number(d.windowsOrigin?.idParticipante)!==Number(a.idParticipante))throw new Error('Aluno já importado em outra turma ou excluído. Confira o cadastro.');return {id:row.id,created:false};}
 if(target){if(!existing.exists()||existing.data().deletedAt||existing.data().idTurma!==classId)throw new Error('Aluno existente mudou de turma ou foi excluído.');return {id:existingId,created:false};}
 tx.set(ref,{...row,tenantId:ctx.tenantId,createdBy:access.uid,updatedBy:access.uid,createdAt:fs.serverTimestamp(),updatedAt:fs.serverTimestamp()});return {id:row.id,created:true};});
}
