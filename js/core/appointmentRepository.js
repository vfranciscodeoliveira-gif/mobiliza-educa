import {accessDb,requirePermission} from './cloudAccess.js?v=1';
import {getCloudTenantId} from '../cloudGateway.js?v=6';
import {validateAppointment,buildOccurrences,appointmentConflicts} from './appointmentPolicy.js?v=2';
import {windowsSchoolData,normalizeWindows} from './windowsAgendaPolicy.js?v=4';
async function calendarContext(expectedTenant=''){
 const access=await requirePermission('events.read');if(!access.allSchools)throw new Error('Agenda exige acesso a todas as escolas do cliente.');
 const tenantId=getCloudTenantId();if(expectedTenant&&expectedTenant!==tenantId)throw new Error('Cliente alterado. Reabra a agenda.');
 return {access,tenantId,...await accessDb()};
}
function currentCalendar(ctx){if(getCloudTenantId()!==ctx.tenantId)throw new Error('Cliente alterado. Reabra a agenda.');}
const calendarRows=snap=>snap.docs.map(d=>({...d.data(),id:d.id})).filter(r=>!r.deletedAt);
export async function loadWindowsSchoolCatalog(){
 const access=await requirePermission('education.create');if(!access.allSchools)throw new Error('Importação de escolas exige acesso a todas as escolas do cliente.');
 const tenantId=getCloudTenantId(),{db,fs}=await accessDb(),snap=await fs.getDocsFromServer(fs.collection(db,'tenants',tenantId,'schools'));currentCalendar({tenantId});
 return {tenantId,access,schools:calendarRows(snap),classes:[],rows:[]};
}
export async function importWindowsSchool(source,banco,context){
 const access=await requirePermission('education.create');
 if(!access.allSchools||getCloudTenantId()!==context.tenantId)throw new Error('Cliente alterado ou sem permissão para cadastrar escolas. Reabra a importação.');
 const row=windowsSchoolData(source,banco),{db,fs}=await accessDb(),tenantId=context.tenantId;
 const snap=await fs.getDocsFromServer(fs.collection(db,'tenants',tenantId,'schools'));currentCalendar(context);
 const matches=calendarRows(snap).filter(s=>normalizeWindows(s.nome)===normalizeWindows(row.nome));
 if(matches.length>1)throw new Error('Existem escolas com o mesmo nome. Escolha a escola correspondente no dropdown: '+row.nome);
 if(matches.length===1)return {id:matches[0].id,created:false};
 const ref=fs.doc(db,'tenants',tenantId,'schools',row.id);
 return fs.runTransaction(db,async tx=>{
  const old=await tx.get(ref);currentCalendar(context);
  if(old.exists()){const d=old.data();if(d.deletedAt)throw new Error('Esta escola foi excluída no site. Confira o cadastro antes de importar novamente.');if(d.windowsOrigin?.banco!==banco||Number(d.windowsOrigin?.idEscola)!==Number(source.idEscola))throw new Error('Identificador de escola já utilizado. Escolha uma escola existente.');return {id:row.id,created:false};}
  tx.set(ref,{...row,tenantId,createdBy:access.uid,updatedBy:access.uid,createdAt:fs.serverTimestamp(),updatedAt:fs.serverTimestamp()});return {id:row.id,created:true};
 });
}
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

// Create-only import: deterministic IDs and transaction prevent repeat/concurrent imports.
export async function importWindowsAppointment(data,context,id,windowsSource=null){
 const access=await requirePermission('events.manage');
 if(!access.allSchools||getCloudTenantId()!==context.tenantId)throw new Error('Cliente alterado ou sem permissão. Reabra a importação.');
 if(!/^windows-agenda-[a-zA-Z0-9_-]+-[0-9]+$/.test(id))throw new Error('Identificador de importação inválido.');
 validateAppointment(data,context.schools,context.classes);
 if(windowsSource&&(!/^[a-f0-9]{64}$/.test(windowsSource.archiveId)||!Number.isSafeInteger(windowsSource.agendaId)||windowsSource.agendaId<1))throw new Error('Referência de histórico inválida.');
 const {db,fs}=await accessDb(),tenantId=context.tenantId,ref=fs.doc(db,'tenants',tenantId,'appointments',id);
 return fs.runTransaction(db,async tx=>{
  const old=await tx.get(ref);if(getCloudTenantId()!==tenantId)throw new Error('Cliente alterado. Reabra a importação.');if(old.exists()){if(windowsSource&&!old.data().windowsSource)tx.update(ref,{windowsSource,updatedBy:access.uid,updatedAt:fs.serverTimestamp()});return false;}
  if(getCloudTenantId()!==tenantId)throw new Error('Cliente alterado. Reabra a importação.');
  tx.set(ref,{...data,...(windowsSource?{windowsSource}:{}),tenantId,serieId:'',createdBy:access.uid,updatedBy:access.uid,createdAt:fs.serverTimestamp(),updatedAt:fs.serverTimestamp()});return true;
 });
}

// Complete empty class links without replacing appointment details.
export async function completeWindowsAppointmentClasses(id,idsTurmas,context,expected){
 const access=await requirePermission('events.manage');
 if(!access.allSchools||getCloudTenantId()!==context.tenantId)throw new Error('Cliente alterado ou sem permissão. Reabra a importação.');
 if(!/^windows-agenda-[a-zA-Z0-9_-]+-[0-9]+$/.test(id)||!expected||!idsTurmas.length)throw new Error('Confira o agendamento e as turmas.');
 const {db,fs}=await accessDb(),ref=fs.doc(db,'tenants',context.tenantId,'appointments',id);
 return fs.runTransaction(db,async tx=>{
  const snap=await tx.get(ref);currentCalendar(context);
  if(!snap.exists())throw new Error('Agendamento não encontrado. Reabra a importação.');
  const old=snap.data(),stamp=old.updatedAt,version=expected.updatedAt;
  if(old.deletedAt||old.idEscola!==expected.idEscola||!stamp||!version||stamp.seconds!==version.seconds||stamp.nanoseconds!==version.nanoseconds)throw new Error('Este atendimento foi alterado. Reabra o arquivo e confira novamente.');
  if(old.idsTurmas?.length)throw new Error('O atendimento já possui turmas. Os vínculos existentes foram preservados.');
  validateAppointment({...old,idsTurmas},context.schools,context.classes);
  for(const classId of idsTurmas){const c=await tx.get(fs.doc(db,'tenants',context.tenantId,'classes',classId));if(!c.exists()||c.data().deletedAt||c.data().idEscola!==old.idEscola)throw new Error('Turma alterada ou excluída. Confira novamente.');}
  currentCalendar(context);tx.update(ref,{idsTurmas,updatedBy:access.uid,updatedAt:fs.serverTimestamp()});return true;
 });
}
