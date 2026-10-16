// Somente leitura. Não sugere equivalência por nome/data; um operador precisa confirmar vínculos.
export function buildWindowsReviewQueue(report, online=[]){
 const onlineById=new Map(online.map(row=>[String(row.id),row]));
 const sourceOnly=report.rows.filter(row=>row.issues.includes('sem_correspondencia_online')).map(row=>({
  kind:'windows_sem_online',id:String(row.agendaId),name:row.escola||'Não informada',date:row.inicio||'',status:row.statusOriginal||'',issue:'Agendamento histórico sem correspondência explícita',onlineId:null
 }));
 const onlineOnly=report.onlineWithoutMatch.map(item=>{
  const row=onlineById.get(String(item.id));
  return {kind:'online_sem_windows',id:String(item.id),name:row?.solicitante||row?.nome||'Não informado',date:row?.dataInicio||'',status:row?.status||'',issue:'Registro online sem vínculo com este histórico',onlineId:String(item.id)};
 });
 return {items:[...sourceOnly,...onlineOnly],sourceOnly:sourceOnly.length,onlineOnly:onlineOnly.length};
}
