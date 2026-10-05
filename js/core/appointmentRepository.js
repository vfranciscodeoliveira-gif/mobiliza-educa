import {accessDb,requirePermission} from './cloudAccess.js?v=1';
import {getCloudTenantId} from '../cloudGateway.js?v=6';
import {validateAppointment,buildOccurrences,appointmentConflicts} from './appointmentPolicy.js?v=1';
export async function loadAppointments(){
 const access=await requirePermission('events.read');if(!access.allSchools)throw new Error('Agenda exige acesso a todas as escolas do cliente.');
 const tenantId=getCloudTenantId(),{db,fs}=await accessDb();
 const [appointments,schools,classes]=await Promise.all(['appointments','schools','classes'].map(c=>fs.getDocsFromServer(fs.collection(db,'tenants',tenantId,c))));
 if(getCloudTenantId()!==tenantId)throw new Error('Cliente alterado. Reabra a agenda.');
 const rows=s=>s.docs.map(d=>({...d.data(),id:d.id}));
 return {tenantId,access,rows:rows(appointments),schools:rows(schools).filter(r=>!r.deletedAt),classes:rows(classes).filter(r=>!r.deletedAt)};
}
export async function saveAppointment(data,context,{id='',version=null,frequency='Nenhuma',until='',acceptConflicts=false}={}){
 const access=await requirePermission('events.manage');if(!access.allSchools||getCloudTenantId()!==context.tenantId)throw new Error('Cliente alterado ou sem permissão. Reabra a agenda.');
 const {db,fs}=await accessDb(),tenantId=context.tenantId;
 validateAppointment(data,context.schools,context.classes);
 const occurrences=id?[data]:buildOccurrences(data,frequency,frequency==='Nenhuma'?data.dataInicio:until);
 const current=await fs.getDocsFromServer(fs.collection(db,'tenants',tenantId,'appointments'));
 const rows=current.docs.map(d=>({...d.data(),id:d.id}));
 const conflicts=occurrences.flatMap((d,i)=>appointmentConflicts(d,[...rows,...occurrences.slice(0,i)],id));
 if(conflicts.length&&!acceptConflicts){const error=new Error('Há atendimentos com sobreposição de escola, local ou responsável.');error.conflicts=conflicts;throw error;}
 if(getCloudTenantId()!==tenantId)throw new Error('Cliente alterado. Reabra a agenda.');
 const metadata={tenantId,updatedBy:access.uid,updatedAt:fs.serverTimestamp()};
 if(id){const ref=fs.doc(db,'tenants',tenantId,'appointments',id);await fs.runTransaction(db,async tx=>{const old=await tx.get(ref);if(!old.exists())throw new Error('Agendamento não encontrado. Atualize a lista.');const oldTime=old.data().updatedAt;if(!oldTime||!version||oldTime.seconds!==version.seconds||oldTime.nanoseconds!==version.nanoseconds)throw new Error('Outro usuário alterou este atendimento. Atualize a lista antes de editar.');tx.update(ref,{...data,...metadata});});return 1;}
 const group=occurrences.length>1?crypto.randomUUID():'',batch=fs.writeBatch(db);
 for(const d of occurrences){const ref=fs.doc(fs.collection(db,'tenants',tenantId,'appointments'));batch.set(ref,{...d,...metadata,createdBy:access.uid,createdAt:fs.serverTimestamp(),serieId:group});}
 await batch.commit();return occurrences.length;
}
