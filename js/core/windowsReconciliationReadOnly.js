// Auditoria somente leitura: nunca calcula atendidos a partir de estimativas ou fila de jogos.
const num=value=>value===null||value===undefined||value===''?null:(Number.isFinite(Number(value))?Number(value):null);
const key=value=>String(value??'');
export function reconcileWindowsReadOnly(pack,appointments=[],archiveId=''){
 if(pack?.formato!=='mobiliza-windows-integral'||!pack.tabelas||!Array.isArray(pack.tabelas.tblAgendaEvento))throw new Error('Arquivo integral inválido');
 const tables=pack.tabelas;
 const agendas=tables.tblAgendaEvento;
 const events=tables.tblEvento||[];
 const classLinks=tables.tblEventoTurma||[];
 const queued=tables.tblFilaEvento||[];
 const byArchive=new Map();
 for(const row of appointments){
  const origin=row?.windowsSource;
  if(!origin||archiveId&&origin.archiveId!==archiveId)continue;
  const id=key(origin.agendaId);
  if(!byArchive.has(id))byArchive.set(id,[]);
  byArchive.get(id).push(row);
 }
 const rows=agendas.map(original=>{
  const matches=byArchive.get(key(original.idAgenda))||[];
  const predicted=num(original.publicoEstimado);
  const explicitEvent=original.idEvento===null||original.idEvento===undefined||original.idEvento===''?null:events.find(e=>key(e.idEvento)===key(original.idEvento));
  const linkedClasses=explicitEvent?classLinks.filter(r=>key(r.idEvento)===key(explicitEvent.idEvento)).length:0;
  const gameEntries=explicitEvent?queued.filter(r=>key(r.idEvento)===key(explicitEvent.idEvento)).length:null;
  const issues=[];
  if(matches.length===0)issues.push('sem_correspondencia_online');
  if(matches.length>1)issues.push('correspondencia_duplicada');
  if(predicted===null)issues.push('estimativa_ausente');
  if(!original.idEvento)issues.push('evento_sem_vinculo_explicito');
  else if(!explicitEvent)issues.push('evento_referenciado_inexistente');
  if(!matches.some(m=>Array.isArray(m.idsTurmas)&&m.idsTurmas.length))issues.push('turmas_sem_vinculo_online');
  return {agendaId:original.idAgenda,escola:original.unidadeEscolar||'',inicio:original.dataInicio||'',statusOriginal:original.status||'',turmasInformadas:num(original.quantidadeTurmas),publicoPrevistoOriginal:predicted,onlineIds:matches.map(m=>m.id),vinculoEventoConfirmado:explicitEvent?.idEvento??null,turmasDoEvento:linkedClasses,registrosJogoVinculados:gameEntries,publicoRealizado:null,issues};
 });
 const covered=new Set(rows.flatMap(x=>x.onlineIds.map(key)));
 const onlineWithoutMatch=appointments.filter(a=>!covered.has(key(a.id))).map(a=>({id:a.id,source:a.windowsSource||null}));
 return {source:'Windows/Firestore',mode:'read_only',agendaOriginalCount:agendas.length,onlineCount:appointments.length,matched:rows.filter(r=>r.onlineIds.length===1).length,notMatched:rows.filter(r=>!r.onlineIds.length).length,ambiguous:rows.filter(r=>r.onlineIds.length>1).length,onlineWithoutMatch,rows};
}
