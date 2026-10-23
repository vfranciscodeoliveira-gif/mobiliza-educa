export const MAPFRE_PROJECT='na-pista-certa-mapfre';
export const MAPFRE_DAYS=['2026-10-19','2026-10-20','2026-10-21','2026-10-22','2026-10-23'];
export const MAPFRE_STARTS=['08:30','09:00','09:30','10:00','10:30','13:30','14:00','14:30','15:00','15:30'];
export const MAPFRE_SLOTS=MAPFRE_STARTS.map(t=>{const [h,m]=t.split(':').map(Number);const end=h*60+m+60;return [t,String(Math.floor(end/60)).padStart(2,'0')+':'+String(end%60).padStart(2,'0')];});
const CONFIRMED={
 '2026-10-19':{'09:30':'EM João Franco de Godoy','14:00':'EM João Franco de Godoy'},
 '2026-10-20':{'09:30':'EM José Carlos João','14:00':'EM José Carlos João'},
 '2026-10-21':{'09:30':'EM José Carlos João','14:00':'EM Alayde Tortorella de Faria Motta'},
 '2026-10-22':{'09:30':'EM José Soares Marcondes','14:00':'EM José Soares Marcondes'},
 '2026-10-23':{'09:30':'EM José Soares Marcondes','14:00':'EM José Soares Marcondes'}
};
export const officialMapfreSchool=(date,start)=>CONFIRMED[date]?.[start]||'';
export const mapfreRows=appointments=>MAPFRE_DAYS.flatMap(date=>MAPFRE_SLOTS.map(([start,end])=>{
 const confirmedSchool=officialMapfreSchool(date,start);
 const rows=appointments.filter(r=>r.projetoId===MAPFRE_PROJECT&&r.status!=='Cancelado'&&r.dataInicio===date&&r.horaInicio===start);
 const reserved=rows.reduce((n,r)=>n+(Number(r.previsto)||0),0);
 return {date,start,end,rows,reserved,capacity:40,available:confirmedSchool||rows.length?0:40,overbooked:reserved>40,confirmedSchool,occupied:!!(confirmedSchool||rows.length)};
}));
export const mapfreSummary=rows=>({sessions:rows.length,booked:rows.filter(x=>x.rows.length).length,conflicts:rows.filter(x=>x.overbooked).length});

export function validateMapfreBooking(data,appointments=[],excludeId=''){
 if(data.projetoId!==MAPFRE_PROJECT)return {ok:true};
 if(!MAPFRE_DAYS.includes(data.dataInicio)||data.dataFim!==data.dataInicio)throw new Error('Selecione um dos dias autorizados da programação MAPFRE.');
 if(!MAPFRE_STARTS.includes(data.horaInicio))throw new Error('Escolha um horário da grade MAPFRE.');
 const school=officialMapfreSchool(data.dataInicio,data.horaInicio);
 const editingSameSlot=!!excludeId&&appointments.some(r=>r.id===excludeId&&r.dataInicio===data.dataInicio&&r.horaInicio===data.horaInicio&&r.status!=='Cancelado');
 if(school&&!editingSameSlot)throw new Error('Horário confirmado para '+school+'. Confira a reserva existente antes de cadastrar outra.');
 const current=appointments.filter(r=>r.id!==excludeId&&r.projetoId===MAPFRE_PROJECT&&r.status!=='Cancelado'&&r.dataInicio===data.dataInicio&&r.horaInicio===data.horaInicio);
 const total=current.reduce((sum,r)=>sum+(Number(r.previsto)||0),0)+(Number(data.previsto)||0);
 if(total>40)throw new Error('Capacidade da sessão excedida: '+total+' participantes previstos (máximo 40).');
 return {ok:true,reserved:total,remaining:40-total};
}

const normalize=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
export function mapfreAssociation(row){
 if(row.projetoId===MAPFRE_PROJECT)return 'confirmed';
 if(row.projetoId)return 'other';
 const text=normalize([row.nome,row.tipo,row.local,row.observacao].join(' '));
 return /na pista certa|pista certa|mapfre/.test(text)?'review':'unknown';
}
export function mapfreExistingReview(appointments=[]){
 return appointments.filter(row=>!row.deletedAt&&row.status!=='Cancelado'&&MAPFRE_DAYS.includes(row.dataInicio)&&mapfreAssociation(row)==='review');
}
