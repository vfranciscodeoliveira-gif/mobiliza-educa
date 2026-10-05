import {accessDb,requirePermission} from './cloudAccess.js?v=1';
import {getCloudTenantId} from '../cloudGateway.js?v=6';
import {validateAppointment,buildOccurrences,appointmentConflicts} from './appointmentPolicy.js?v=1';
async function calendarContext(expectedTenant=''){
 const access=await requirePermission('events.read');if(!access.allSchools)throw new Error('Agenda exige acesso a todas as escolas do cliente.');
 const tenantId=getCloudTenantId();if(expectedTenant&&expectedTenant!==tenantId)throw new Error('Cliente alterado. Reabra a agenda.');
 return {access,tenantId,...await accessDb()};
}
function currentCalendar(ctx){if(getCloudTenantId()!==ctx.tenantId)throw new Error('Cliente alterado. Reabra a agenda.');}
const calendarRows=snap=>snap.docs.map(d=>({...d.data(),id:d.id})).filter(r=>!r.deletedAt);
export async function loadAppointmentCatalog(){
 const ctx=await calendarContext();const [schools,classes]=await Promise.all(['schools','classes'].map(c=>ctx.fs.getDocsFromServer(ctx.fs.collection(ctx.db,'tenants',ctx.tenantId,c))));currentCalendar(ctx);
 return {tenantId:ctx.tenantId,access:ctx.access,schools:calendarRows(schools),classes:calendarRows(classes)};
}
export async function loadSchoolClasses(schoolId,expectedTenant){
 const ctx=await calendarContext(expectedTenant);if(!schoolId)return[];
 const ref=ctx.fs.collection(ctx.db,'tenants',ctx.tenantId,'classes'),snap=await ctx.fs.getDocsFromServer(ctx.fs.query(ref,ctx.fs.where('idEscola','==',schoolId)));currentCalendar(ctx);return calendarRows(snap);
}
export async function loadAppointments(){
 const ctx=await loadAppointmentCatalog(),{db,fs}=await accessDb();const snap=await fs.getDocsFromServer(fs.collection(db,'tenants',ctx.tenantId,'appointments'));currentCalendar(ctx);
 return {...ctx,rows:calendarRows(snap)};
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
