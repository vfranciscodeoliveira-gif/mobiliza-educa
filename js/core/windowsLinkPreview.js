// Fase 3: propostas individuais, deliberadamente sem escrita no Firebase.
const s=v=>String(v??'').trim();
export function previewWindowsLink(report,appointments,agendaId,onlineId){
 const historic=report.rows.filter(r=>s(r.agendaId)===s(agendaId));
 if(historic.length!==1)throw new Error('Agendamento Windows ausente ou ambíguo.');
 const source=historic[0];
 if(source.onlineIds.length)throw new Error('O agendamento já possui correspondência online.');
 const candidates=appointments.filter(a=>s(a.id)===s(onlineId));
 if(candidates.length!==1||candidates[0].deletedAt)throw new Error('Agendamento online indisponível.');
 const target=candidates[0];
 if(report.rows.some(r=>r.onlineIds.some(id=>s(id)===s(onlineId))))throw new Error('Agendamento online já vinculado a outra origem.');
 if(target.windowsSource?.agendaId!=null)throw new Error('Registro já tem origem Windows: não sobrescrever.');
 return Object.freeze({mode:'preview_only',requiresExplicitConfirmation:true,archiveId:null,agendaId:source.agendaId,onlineId:s(target.id),sourceSchool:source.escola,sourceDate:source.inicio,sourceStatus:source.statusOriginal,targetTitle:target.nome||'',targetDate:target.dataInicio||'',targetStatus:target.status||'',warnings:['Compare escola, data, hora, programa e turno manualmente.','Não alterar registros antes de confirmação administrativa e revalidação no servidor.']});
}
