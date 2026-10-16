export const MAPFRE_PROJECT='na-pista-certa-mapfre';
export const MAPFRE_DAYS=['2026-10-19','2026-10-20','2026-10-21','2026-10-22','2026-10-23'];
export const MAPFRE_SLOTS=[['08:30','09:30'],['09:30','10:30'],['10:00','11:00'],['10:30','11:30'],['13:30','14:30'],['14:00','15:00'],['14:30','15:30'],['15:00','16:00'],['15:30','16:30']];
// Modelo recebido possui intervalos sobrepostos; são opções de agendamento, não capacidade independente acumulável.
export const mapfreRows=appointments=>MAPFRE_DAYS.flatMap(date=>MAPFRE_SLOTS.map(([start,end])=>{
 const rows=appointments.filter(r=>r.projetoId===MAPFRE_PROJECT&&r.status!=='Cancelado'&&r.dataInicio===date&&r.horaInicio<end&&r.horaFim>start);
 const reserved=rows.reduce((n,r)=>n+(Number(r.previsto)||0),0);
 return {date,start,end,rows,reserved,capacity:40,available:Math.max(0,40-reserved),overbooked:reserved>40};
}));
export const mapfreSummary=rows=>({sessions:rows.length,booked:rows.filter(x=>x.rows.length).length,conflicts:rows.filter(x=>x.overbooked).length});
