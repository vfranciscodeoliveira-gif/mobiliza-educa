import {MAPFRE_DAYS,MAPFRE_SLOTS} from './mapfreSchedule.js?v=3';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function renderMapfreWeekGrid(rows,legacy=[],canManage=false){
 const find=(day,start)=>rows.find(x=>x.date===day&&x.start===start);
 const days=MAPFRE_DAYS;
 const headers=days.map((d,i)=>'<th colspan="2">'+['Segunda','Terça','Quarta','Quinta','Sexta'][i]+' '+d.slice(8)+'/'+d.slice(5,7)+'</th>').join('');
 const grouped=(slots)=>slots.map(([start,end])=>'<tr><th style="white-space:nowrap">'+esc(start)+'</th><th style="white-space:nowrap">'+esc(end)+'</th>'+days.map(day=>{
 const x=find(day,start),conflict=legacy.some(r=>r.dataInicio===day&&r.horaInicio===start);
 const occupied=!!x?.occupied,school=x?.confirmedSchool||x?.rows.map(r=>r.nome||r.solicitante||r.id).join(' • ')||'';
 const action=canManage&&!occupied&&!conflict?'<button type="button" class="btn ghost small" data-mapfre-book="'+rows.indexOf(x)+'">Agendar</button>':'';
 const name=school||'Livre';
 const state=occupied?'Reservado':conflict?'Conferir reserva':'Livre';
 return '<td style="min-width:145px;vertical-align:top;background:'+(occupied?'#fff4cf':'transparent')+'"><strong>'+esc(name)+'</strong><div style="font-size:11px">'+state+' • Capacidade 40</div>'+action+'</td><td style="width:48px;text-align:center">'+(occupied?'—':conflict?'?':'40')+'</td>';
 }).join('')+'</tr>').join('');
 return '<div style="max-height:58vh;overflow:auto;overscroll-behavior:contain"><table style="min-width:1120px;border-collapse:collapse"><thead><tr><th rowspan="2">Chegada</th><th rowspan="2">Saída</th>'+headers+'</tr><tr>'+days.map(()=>'<th>Escola / Série</th><th>Vagas</th>').join('')+'</tr></thead><tbody>'+grouped(MAPFRE_SLOTS.slice(0,5))+'<tr><th colspan="12" style="text-align:center;background:#f0f2f6">ALMOÇO</th></tr>'+grouped(MAPFRE_SLOTS.slice(5))+'</tbody></table></div>';
}
