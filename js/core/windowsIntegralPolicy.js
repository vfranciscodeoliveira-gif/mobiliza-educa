const id=v=>String(v??'');
const numeric=v=>Number.isSafeInteger(Number(v))&&Number(v)>0;
export function normalizeIntegral(p){
 if(!p||p.formato!=='mobiliza-windows-integral'||![2,3].includes(Number(p.versao))||!p.tabelas||typeof p.tabelas!=='object')throw new Error('Arquivo integral inválido.');
 if(!/^[a-zA-Z0-9_-]{1,80}$/.test(p.banco||''))throw new Error('Banco de origem inválido.');
 const keys={tblAgendaEvento:'idAgenda',tblEvento:'idEvento',tblEscola:'idEscola',tblTurma:'idTurma',tblEventoTurma:'idEventoTurma',tblAgendaChecklist:'idChecklist',tblAgendaAlarme:'idAlarme'};
 for(const [table,key] of Object.entries(keys)){const rows=p.tabelas[table];if(!Array.isArray(rows))throw new Error('Tabela ausente: '+table);const seen=new Set();for(const row of rows){if(!numeric(row[key])||seen.has(id(row[key])))throw new Error('ID inválido ou duplicado: '+table);seen.add(id(row[key]));}}
 const allowed=['tblAgendaEvento','tblEvento','tblEscola','tblTurma','tblEventoTurma','tblEventoTurmaOperacao','tblAgendaChecklist','tblAgendaAlarme','tabAgendaEscalaFuncionario','tblAgendaCoberturaItemMobiliza','tblAgendaCoberturaMobiliza','tblAgendaEventoAuditoriaMobiliza','tblMobilizaDossieAcao360','tblFilaEvento','tblEventoEncerramentoMobiliza','resumoParticipantesTurma'];
 for(const [table,rows] of Object.entries(p.tabelas))if(!allowed.includes(table)||!Array.isArray(rows)||rows.some(r=>!r||Array.isArray(r)||typeof r!=='object'))throw new Error('Tabela inválida: '+table);
 const schoolIds=new Set(p.tabelas.tblEscola.map(r=>id(r.idEscola))),classIds=new Set(p.tabelas.tblTurma.map(r=>id(r.idTurma))),eventIds=new Set(p.tabelas.tblEvento.map(r=>id(r.idEvento))),agendaIds=new Set(p.tabelas.tblAgendaEvento.map(r=>id(r.idAgenda)));
 for(const r of p.tabelas.tblTurma)if(!schoolIds.has(id(r.idEscola)))throw new Error('Escola ausente para turma '+r.idTurma);
 for(const r of p.tabelas.tblEventoTurma)if(!classIds.has(id(r.idTurma))||!eventIds.has(id(r.idEvento)))throw new Error('Vínculo de evento/turma sem origem.');
 for(const table of ['tblAgendaChecklist','tblAgendaAlarme'])for(const r of p.tabelas[table])if(!agendaIds.has(id(r.idAgenda)))throw new Error('Agendamento ausente em '+table);
 const agendamentos=p.tabelas.tblAgendaEvento.map(r=>({...r,idsTurmas:[]}));
 if(!agendamentos.length||agendamentos.length>2000)throw new Error('Importe de 1 a 2000 agendamentos.');
 // Program links are distinct from an appointment's individual class links.
 return {versao:1,banco:p.banco,escolas:p.tabelas.tblEscola,turmas:p.tabelas.tblTurma.map(r=>({...r,nome:r.descricao})),agendamentos,integral:p};
}
export function originalAgenda(p,agendaId){return p.tabelas.tblAgendaEvento.find(r=>id(r.idAgenda)===id(agendaId));}
export function agendaHistory(p,agendaId){return {agenda:originalAgenda(p,agendaId),checklist:p.tabelas.tblAgendaChecklist.filter(r=>id(r.idAgenda)===id(agendaId)),alarmes:p.tabelas.tblAgendaAlarme.filter(r=>id(r.idAgenda)===id(agendaId))};}
export function programClasses(p,eventId,schoolId=''){
 return p.tabelas.tblEventoTurma.filter(r=>id(r.idEvento)===id(eventId)).map(link=>{
  const turma=p.tabelas.tblTurma.find(t=>id(t.idTurma)===id(link.idTurma));
  const escola=p.tabelas.tblEscola.find(s=>id(s.idEscola)===id(turma.idEscola));
  const operacao=(p.tabelas.tblEventoTurmaOperacao||[]).find(r=>id(r.idEvento)===id(eventId)&&id(r.idTurma)===id(link.idTurma))||{};
  const fila=(p.tabelas.tblFilaEvento||[]).filter(r=>id(r.idEvento)===id(eventId)&&id(r.idTurma)===id(link.idTurma));
  const counts={total:fila.length,finalizados:0,ausentes:0,aguardando:0,chamados:0,jogando:0};
  for(const r of fila){const k={FINALIZADO:'finalizados',AUSENTE:'ausentes',AGUARDANDO:'aguardando',CHAMADO:'chamados',JOGANDO:'jogando'}[r.statusFila];if(k)counts[k]++;}
  if(!counts.total&&Array.isArray(p.tabelas.resumoParticipantesTurma))counts.total=Number(p.tabelas.resumoParticipantesTurma.find(r=>id(r.idTurma)===id(link.idTurma))?.total||0);
  const first=fila.map(r=>r.dataChamada||r.dataInicioJogo).filter(Boolean).sort()[0]||null;
  const last=fila.map(r=>r.dataFinalizacao).filter(Boolean).sort().at(-1)||null;
  const inicio=operacao.dataInicioReal||first;
  const complete=counts.total>0&&counts.aguardando===0&&counts.chamados===0&&counts.jogando===0&&counts.finalizados+counts.ausentes>=counts.total;
  const canCompute=Array.isArray(p.tabelas.tblFilaEvento)&&Array.isArray(p.tabelas.resumoParticipantesTurma);
  const situacao=canCompute?(complete?'CONCLUÍDA':inicio||counts.finalizados+counts.ausentes+counts.chamados+counts.jogando>0?'EM ANDAMENTO':'NÃO INICIADA'):(operacao.status||'Não informado');
  return {link,turma,escola,operacao,counts,situacao,inicio,fim:operacao.dataFimReal||(complete?last:null),calculado:canCompute};
 }).filter(r=>!schoolId||id(r.turma.idEscola)===id(schoolId));
}
function sorted(v){if(Array.isArray(v))return v.map(sorted);if(v&&typeof v==='object')return Object.fromEntries(Object.keys(v).sort().map(k=>[k,sorted(v[k])]));return v;}
export async function archivePayload(pack,mappings){
 const data=JSON.stringify(sorted({pack,mappings}));if(new TextEncoder().encode(data).length>10*1024*1024)throw new Error('Histórico excede 10 MB.');
 const hash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(data)))].map(b=>b.toString(16).padStart(2,'0')).join('');
 const chars=Array.from(data),chunks=[];for(let i=0;i<chars.length;i+=100000)chunks.push(chars.slice(i,i+100000).join(''));
 return {hash,chunks};
}
