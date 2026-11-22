import {localDay,appointmentConflicts} from './appointmentPolicy.js?v=2';
const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
export function agendaSummary(ctx,events=[],now=new Date()){
 const today=localDay(now),monday=new Date(now.getFullYear(),now.getMonth(),now.getDate(),12);monday.setDate(monday.getDate()-((monday.getDay()+6)%7));
 const days=Array.from({length:7},(_,i)=>{const d=new Date(+monday);d.setDate(d.getDate()+i);return localDay(d);}),weekStart=days[0],weekEnd=days[6];
 const cancelled=r=>norm(r.status)==='cancelado',finished=r=>['concluido','encerrado','finalizado'].includes(norm(r.status));
 const appointments=ctx.rows.filter(r=>!r.deletedAt&&!cancelled(r)).map(r=>({...r,key:'appointment:'+r.id,kind:'Atendimento'}));
 const publicEvents=events.filter(r=>!r.deletedAt&&!cancelled(r)&&r.dataInicio).map(r=>({...r,dataFim:r.dataFim||r.dataInicio,key:'event:'+r.id,kind:'Evento'}));
 const all=[...appointments,...publicEvents].sort((a,b)=>(a.dataInicio+(a.horaInicio||'')).localeCompare(b.dataInicio+(b.horaInicio||''))),pending=all.filter(r=>!finished(r));
 const onDay=day=>all.filter(r=>r.dataInicio<=day&&r.dataFim>=day),week=all.filter(r=>r.dataInicio<=weekEnd&&r.dataFim>=weekStart);
 const overdue=pending.filter(r=>r.dataFim<today||(r.dataFim===today&&r.horaFim&&r.horaFim<now.toTimeString().slice(0,5)));
 const upcoming=pending.filter(r=>r.dataInicio>today||(r.dataFim>=today&&(!r.horaFim||r.dataFim>today||r.horaFim>=now.toTimeString().slice(0,5))));
 const alerts=[];
 for(const r of overdue)alerts.push({key:r.key,title:'Atendimento pendente de atualização',text:`${r.nome}: o período terminou e o status é ${r.status||'não informado'}.`,level:'warning'});
 const conflictRows=appointments.filter(r=>!finished(r)&&r.dataFim>=today&&r.dataInicio<=weekEnd);
 const pairs=new Set();for(const r of conflictRows)for(const conflict of appointmentConflicts(r,conflictRows,r.id)){const key=[r.id,conflict.row.id].sort().join('|');if(!pairs.has(key)){pairs.add(key);alerts.push({key:r.key,title:'Sobreposição de horários',text:`${r.nome} e ${conflict.row.nome}: ${conflict.reasons.join(', ')}.`,level:'danger'});}}
 for(const r of upcoming.filter(r=>r.dataInicio<=weekEnd)){
  if(r.kind==='Atendimento'&&r.origem==='Escola'&&!r.idsTurmas?.length)alerts.push({key:r.key,title:'Conferir turmas do atendimento',text:r.nome,level:'warning'});
  if(!r.local)alerts.push({key:r.key,title:'Local a definir',text:r.nome,level:'info'});
  if(r.dataInicio===today&&r.horaInicio){const begin=new Date(today+'T'+r.horaInicio),minutes=(begin-now)/60000;if(minutes>=0&&minutes<=120)alerts.unshift({key:r.key,title:'Compromisso nas próximas duas horas',text:`${r.nome} às ${r.horaInicio}.`,level:'info'});}
 }
 return {today,days,weekStart,weekEnd,all,todayRows:onDay(today),week,upcoming,overdue,alerts,conflicts:pairs.size,inProgress:pending.filter(r=>norm(r.status)==='em andamento'),toConfirm:pending.filter(r=>['solicitado','planejado','em preparacao'].includes(norm(r.status))),onDay};
}
