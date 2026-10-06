export const APPOINTMENT_STATUSES=['Solicitado','Planejado','Confirmado','Em preparação','Em andamento','Concluído','Cancelado','Reagendado'];
export const APPOINTMENT_KINDS=['Escola','Demanda espontânea'];
export const localDay=(date=new Date())=>`${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
export function validDate(value){const d=new Date(value+'T12:00:00');return /^\d{4}-\d{2}-\d{2}$/.test(value)&&Number.isFinite(+d)&&localDay(d)===value;}
export function validateAppointment(d,schools=[],classes=[]){
 if(!String(d.nome||'').trim())throw new Error('Informe a atividade ou o título do atendimento.');
 if(!APPOINTMENT_KINDS.includes(d.origem))throw new Error('Escolha escola ou demanda espontânea.');
 if(!validDate(d.dataInicio)||!validDate(d.dataFim)||d.dataFim<d.dataInicio)throw new Error('Confira as datas inicial e final.');
 if(!/^([01]\d|2[0-3]):[0-5]\d$/.test(d.horaInicio)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(d.horaFim)||d.dataInicio===d.dataFim&&d.horaFim<=d.horaInicio)throw new Error('Informe horários válidos, com término depois do início.');
 if(!APPOINTMENT_STATUSES.includes(d.status))throw new Error('Escolha um status válido.');
 if(d.origem==='Escola'&&!schools.some(s=>s.id===d.idEscola))throw new Error('Selecione uma escola cadastrada neste cliente.');
 if(d.origem==='Demanda espontânea'&&(!d.solicitante||d.idEscola||d.idsTurmas.length))throw new Error('Informe o solicitante da demanda espontânea e retire os vínculos escolares.');
 if(d.idsTurmas.length>5||new Set(d.idsTurmas).size!==d.idsTurmas.length||d.idsTurmas.some(id=>!classes.some(c=>c.id===id&&c.idEscola===d.idEscola)))throw new Error('Selecione até 5 turmas da escola escolhida.');
 for(const k of ['previsto','realizado','vagas'])if(!Number.isInteger(d[k])||d[k]<0||d[k]>100000)throw new Error('Quantidades devem ser números inteiros entre 0 e 100000.');
 if(d.vagas>0&&d.previsto>d.vagas)throw new Error('Participantes previstos excedem a capacidade informada.');
 for(const k of ['nome','local','responsavel','solicitante','contato','telefone','email','publico'])if(String(d[k]||'').length>250)throw new Error('Texto muito longo no campo '+k+'.');
 for(const k of ['materiais','equipe','observacao'])if(String(d[k]||'').length>4000)throw new Error('Use até 4000 caracteres em '+k+'.');
 return d;
}
export function occurrenceDates(start,frequency='Nenhuma',until=start){
 if(!validDate(start))throw new Error('Data inválida.');
 if(frequency==='Nenhuma')return[start];
 if(!['Semanal','Mensal','Anual'].includes(frequency)||!validDate(until)||until<start)throw new Error('Confira o fim da recorrência.');
 const origin=new Date(start+'T12:00:00'),out=[];
 for(let i=0;i<=60;i++){
  let d;if(frequency==='Semanal'){d=new Date(+origin);d.setDate(d.getDate()+i*7);}else{const m=origin.getMonth()+(frequency==='Mensal'?i:i*12);d=new Date(origin.getFullYear(),m,1,12);const last=new Date(d.getFullYear(),d.getMonth()+1,0).getDate();d.setDate(Math.min(origin.getDate(),last));}
  const value=localDay(d);if(value>until)return out;if(out.length===60)throw new Error('A recorrência excede 60 atendimentos. Reduza o período.');out.push(value);
 }return out;
}
const normalize=v=>String(v||'').trim().normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export function appointmentConflicts(candidate,rows,excluded=''){
 if(candidate.status==='Cancelado')return[];
 const start=candidate.dataInicio+'T'+candidate.horaInicio,end=candidate.dataFim+'T'+candidate.horaFim;
 return rows.filter(r=>r.id!==excluded&&r.status!=='Cancelado'&&start<r.dataFim+'T'+r.horaFim&&end>r.dataInicio+'T'+r.horaInicio).map(r=>({row:r,reasons:[candidate.idEscola&&candidate.idEscola===r.idEscola?'mesma escola':'',normalize(candidate.local)&&normalize(candidate.local)===normalize(r.local)?'mesmo local':'',normalize(candidate.responsavel)&&normalize(candidate.responsavel)===normalize(r.responsavel)?'mesmo responsável':''].filter(Boolean)})).filter(c=>c.reasons.length);
}
export function buildOccurrences(data,frequency,until){const start=new Date(data.dataInicio+'T12:00:00'),end=new Date(data.dataFim+'T12:00:00'),duration=Math.round((end-start)/86400000);return occurrenceDates(data.dataInicio,frequency,until).map(date=>{const d=new Date(date+'T12:00:00');d.setDate(d.getDate()+duration);return {...data,dataInicio:date,dataFim:localDay(d)};});}

