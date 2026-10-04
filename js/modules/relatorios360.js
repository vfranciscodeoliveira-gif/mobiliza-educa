const K='mobiliza.admin.';
const read=k=>{try{return JSON.parse(localStorage.getItem(K+k)||'[]')}catch{return[]}};
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const fmtDate=v=>v?new Date(v+'T12:00:00').toLocaleDateString('pt-BR'):'—';
const fmt=n=>Number(n||0).toLocaleString('pt-BR');
const csv=v=>'"'+String(v??'').replace(/"/g,'""')+'"';
const byId=(k,id)=>read(k).find(x=>x.id===id);
const pct=(n,d)=>d?Math.round(n/d*100):0;
const avg=arr=>arr.length?arr.reduce((s,x)=>s+Number(x||0),0)/arr.length:0;
const today=()=>new Date().toISOString().slice(0,10);
const currentYear=()=>new Date().getFullYear();

function css(){
 if(document.getElementById('rel360-css'))return;
 const s=document.createElement('style');s.id='rel360-css';s.textContent=`
 .r360{display:grid;gap:14px}.r360-filters{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:10px;padding:14px;border:1px solid #d8e6ee;border-radius:16px;background:#fff}.r360-filters label{display:grid;gap:5px;font-size:.76rem;font-weight:900;color:#365b72}.r360-filters input,.r360-filters select{min-height:40px;border:1px solid #c9dce7;border-radius:10px;padding:8px;background:#fff;color:#173f60}.r360-filter-actions{grid-column:1/-1;display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}
 .r360-kpis{display:grid;grid-template-columns:repeat(8,minmax(0,1fr));gap:9px}.r360-kpi{padding:13px;border:1px solid #d9e7ee;border-radius:14px;background:#fff}.r360-kpi span{display:block;font-size:.67rem;color:#748895}.r360-kpi strong{display:block;font-size:1.25rem;color:#0a6c98;margin-top:3px}.r360-kpi small{display:block;font-size:.62rem;color:#8796a0;margin-top:2px}
 .r360-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.r360-card{padding:16px;border:1px solid #d8e6ed;border-radius:16px;background:#fff}.r360-card h3{margin:0;color:#173f60}.r360-card>p{margin:4px 0 12px;color:#708593;font-size:.82rem}.r360-card-head{display:flex;justify-content:space-between;gap:10px;align-items:start}
 .r360-bars{display:grid;gap:8px}.r360-bar{display:grid;grid-template-columns:150px 1fr 60px;gap:8px;align-items:center}.r360-bar label{font-size:.76rem;font-weight:800;color:#365b72;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}.r360-track{height:14px;border-radius:999px;background:#e6eef2;overflow:hidden}.r360-track i{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#0b7aaa,#23ac73)}.r360-bar strong{text-align:right;font-size:.75rem;color:#0c678f}
 .r360-table-wrap{overflow:auto}.r360-table{width:100%;border-collapse:collapse;font-size:.76rem}.r360-table th,.r360-table td{padding:8px;border-bottom:1px solid #e5edf2;text-align:left;vertical-align:top}.r360-table th{font-size:.65rem;text-transform:uppercase;color:#6b8290;letter-spacing:.04em}.r360-table td small{display:block;color:#7c8e99;margin-top:2px}.r360-status{display:inline-flex;border-radius:999px;padding:4px 7px;background:#edf4f7;color:#4c6c7d;font-weight:900;font-size:.66rem}.r360-status.ok{background:#e4f6ea;color:#17673a}.r360-status.warn{background:#fff3d9;color:#805b0c}.r360-status.bad{background:#ffe8e8;color:#8e3030}
 .r360-quality{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}.r360-quality div{padding:12px;border-radius:12px;border:1px solid #dce8ee;background:#f9fcfd}.r360-quality strong{display:block;font-size:1.15rem;color:#0b6b96}.r360-quality span{font-size:.7rem;color:#6f8390}.r360-quality .warn strong{color:#a05d00}
 .r360-summary{padding:15px;border-left:4px solid #0b79aa;background:#eef8fc;border-radius:10px;line-height:1.5;color:#365d73}.r360-empty{padding:22px;text-align:center;border:1px dashed #cbdce5;border-radius:13px;color:#728692}
 .r360-actions{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}.r360-chip{display:inline-flex;padding:4px 8px;border-radius:999px;background:#e9f4fa;color:#0b668e;font-size:.68rem;font-weight:900}
 @media(max-width:1100px){.r360-filters{grid-template-columns:repeat(3,1fr)}.r360-kpis{grid-template-columns:repeat(4,1fr)}}
 @media(max-width:760px){.r360-filters{grid-template-columns:1fr 1fr}.r360-grid{grid-template-columns:1fr}.r360-kpis{grid-template-columns:1fr 1fr}.r360-quality{grid-template-columns:1fr 1fr}.r360-bar{grid-template-columns:110px 1fr 50px}.r360-filter-actions,.r360-actions{justify-content:stretch}.r360-filter-actions .btn,.r360-actions .btn{flex:1}}
 `;document.head.appendChild(s);
}
function eventDate(e){return e.dataInicio||e.data||'';}
function attendance(e){
 const students=Object.values(e.presenca||{}).filter(Boolean).length;
 const ext=read('inscricoes').filter(r=>r.idEvento===e.id&&r.status==='Presente').reduce((s,r)=>s+(Number(r.quantidade)||1),0);
 return students+ext;
}
function source(e){
 if(e.idEscola){const x=byId('escolas',e.idEscola);return{key:'E:'+e.idEscola,label:x?.nome||'Escola não encontrada',kind:'Escola'};}
 if(e.idInstituicao){const x=byId('instituicoes',e.idInstituicao);return{key:'I:'+e.idInstituicao,label:x?.nome||'Instituição não encontrada',kind:'Instituição'};}
 return{key:'',label:'Sem vínculo institucional',kind:'—'};
}
function impactFor(id){return read('impactos').find(x=>x.eventId===id);}
function eventPeople(e){
 const i=impactFor(e.id);return i?Number(i.publicoTotal)||0:attendance(e);
}
function eventMaterials(e){
 const i=impactFor(e.id);return i?(i.materiaisDistribuidos||[]).reduce((s,m)=>s+(Number(m.quantidade)||0),0):0;
}
function eventPartners(e){
 const i=impactFor(e.id),a=(e.parceiros||[]).map(x=>typeof x==='string'?x:x.nome).filter(Boolean),b=String(i?.parceirosTexto||'').split(',').map(x=>x.trim()).filter(Boolean);
 return [...new Set([...a,...b])];
}
function eventEvaluation(e){
 const plans=read('avaliacaoPlanos'),plan=plans.find(p=>p.eventId===e.id&&p.active!==false)||plans.find(p=>p.eventId===e.id);
 if(!plan)return null;
 const rows=read('avaliacoes').filter(r=>r.planId===plan.id),pre=rows.filter(r=>r.phase==='PRE'),post=rows.filter(r=>r.phase==='POS');
 if(!pre.length&&!post.length)return null;
 return{pre:Math.round(avg(pre.map(x=>x.pct))),post:Math.round(avg(post.map(x=>x.pct))),delta:Math.round(avg(post.map(x=>x.pct))-avg(pre.map(x=>x.pct))),preCount:pre.length,postCount:post.length};
}
function eventCertificateCount(e){return read('certificados').filter(c=>c.eventId===e.id&&c.status!=='Revogado').length;}
function eventEvidenceCount(e){return read('evidencias').filter(x=>x.eventId===e.id).length;}
function uniqueOptions(rows,fn){return [...new Set(rows.map(fn).filter(Boolean))].sort((a,b)=>String(a).localeCompare(String(b),'pt-BR'));}
function bars(rows,maxValue,labelFn,valueFn,suffix=''){
 if(!rows.length)return'<div class="r360-empty">Sem dados para este recorte.</div>';
 const max=Math.max(1,maxValue||Math.max(...rows.map(valueFn)));
 return'<div class="r360-bars">'+rows.map(x=>{const v=valueFn(x);return'<div class="r360-bar"><label title="'+esc(labelFn(x))+'">'+esc(labelFn(x))+'</label><div class="r360-track"><i style="width:'+Math.max(2,Math.round(v/max*100))+'%"></i></div><strong>'+fmt(v)+suffix+'</strong></div>';}).join('')+'</div>';
}
function download(name,text,type='text/csv;charset=utf-8'){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\ufeff'+text],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);}
function monthKey(d){return String(d||'').slice(0,7);}
function monthLabel(k){if(!k)return'';const [y,m]=k.split('-');return new Date(Number(y),Number(m)-1,1).toLocaleDateString('pt-BR',{month:'short',year:'numeric'}).replace('.','');}

function build(rows){
 const ids=new Set(rows.map(e=>e.id)),impacts=read('impactos').filter(i=>ids.has(i.eventId)),certs=read('certificados').filter(c=>ids.has(c.eventId)&&c.status!=='Revogado'),evid=read('evidencias').filter(x=>ids.has(x.eventId));
 const people=rows.reduce((s,e)=>s+eventPeople(e),0),presences=rows.reduce((s,e)=>s+attendance(e),0),materials=rows.reduce((s,e)=>s+eventMaterials(e),0),partners=[...new Set(rows.flatMap(eventPartners))];
 const evals=rows.map(e=>({event:e,val:eventEvaluation(e)})).filter(x=>x.val),pre=Math.round(avg(evals.map(x=>x.val.pre))),post=Math.round(avg(evals.map(x=>x.val.post))),delta=post-pre;
 const closed=rows.filter(e=>impactFor(e.id)?.status==='Finalizado').length,completed=rows.filter(e=>e.status==='Concluído').length;
 const monthMap=new Map(),typeMap=new Map(),sourceMap=new Map(),partnerMap=new Map(),materialMap=new Map(),audMap=new Map();
 for(const e of rows){
  const p=eventPeople(e),mk=monthKey(eventDate(e));if(mk)monthMap.set(mk,(monthMap.get(mk)||0)+p);
  const t=e.tipo||'Não informado';typeMap.set(t,(typeMap.get(t)||0)+1);
  const s=source(e);sourceMap.set(s.label,(sourceMap.get(s.label)||0)+p);
  const aud=e.publico||'Não informado';audMap.set(aud,(audMap.get(aud)||0)+p);
  for(const x of eventPartners(e))partnerMap.set(x,(partnerMap.get(x)||0)+1);
  const imp=impactFor(e.id);for(const m of imp?.materiaisDistribuidos||[])materialMap.set(m.nome,(materialMap.get(m.nome)||0)+(Number(m.quantidade)||0));
 }
 const mapRows=m=>[...m.entries()].map(([label,value])=>({label,value})).sort((a,b)=>b.value-a.value);
 const quality={
   noClose:rows.filter(e=>e.status==='Concluído'&&impactFor(e.id)?.status!=='Finalizado').length,
   noSource:rows.filter(e=>!e.idEscola&&!e.idInstituicao).length,
   noPresence:rows.filter(e=>attendance(e)===0).length,
   noEval:rows.filter(e=>!eventEvaluation(e)).length
 };
 return{rows,people,presences,materials,partners,certs:certs.length,evid:evid.length,pre,post,delta,evalCount:evals.length,closed,completed,quality,
  months:mapRows(monthMap).sort((a,b)=>a.label.localeCompare(b.label)),types:mapRows(typeMap),sources:mapRows(sourceMap),partnersRank:mapRows(partnerMap),materialsRank:mapRows(materialMap),audiences:mapRows(audMap)};
}
function executiveText(d,filters){
 const period=(filters.from?fmtDate(filters.from):'início')+' a '+(filters.to?fmtDate(filters.to):'hoje');
 return 'No período de '+period+', o Mobiliza Educa registrou '+d.rows.length+' ação(ões) no recorte selecionado, alcançando '+fmt(d.people)+' pessoa(s). Foram registrados '+fmt(d.presences)+' check-ins/presenças nominais, '+fmt(d.materials)+' material(is) distribuído(s), '+d.evid+' evidência(s) e '+d.certs+' certificado(s) ativo(s). '+(d.evalCount?'Nas avaliações pedagógicas, a média passou de '+d.pre+'% no pré-teste para '+d.post+'% no pós-teste, variação de '+(d.delta>=0?'+':'')+d.delta+' ponto(s) percentual(is). ':'')+(d.quality.noClose?'Há '+d.quality.noClose+' ação(ões) concluída(s) ainda sem fechamento final de impacto.':'Todos os eventos concluídos deste recorte possuem fechamento de impacto finalizado.');
}
function filteredRows(filters){
 return read('eventos').filter(e=>{
  const d=eventDate(e),s=source(e);
  return(!filters.from||d>=filters.from)&&(!filters.to||d<=filters.to)&&(!filters.status||e.status===filters.status)&&(!filters.source||s.key===filters.source)&&(!filters.type||e.tipo===filters.type)&&(!filters.audience||e.publico===filters.audience);
 }).sort((a,b)=>eventDate(a).localeCompare(eventDate(b)));
}
function detailCsv(rows){
 const header='Data;Evento;Tipo;Instituicao;Publico-alvo;Status;Presencas;Publico-alcancado;Materiais;Certificados;Evidencias;Media-pre;Media-pos;Variacao-pp;Parceiros\n';
 return header+rows.map(e=>{const ev=eventEvaluation(e),s=source(e);return[fmtDate(eventDate(e)),e.nome,e.tipo||'',s.label,e.publico||'',e.status||'',attendance(e),eventPeople(e),eventMaterials(e),eventCertificateCount(e),eventEvidenceCount(e),ev?.pre??'',ev?.post??'',ev?.delta??'',eventPartners(e).join(', ')].map(csv).join(';');}).join('\n');
}
function printableHtml(d,filters){
 const rows=d.rows;
 return `<!doctype html><html><head><meta charset="utf-8"><title>Relatório 360 • Mobiliza Educa</title><style>body{font-family:Arial;color:#173f60;padding:28px}h1{margin:0}.head{border-bottom:4px solid #0b709f;padding-bottom:12px}.kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:16px 0}.kpis div{border:1px solid #dce7ed;border-radius:10px;padding:10px}.kpis strong,.kpis span{display:block}.kpis strong{font-size:20px;color:#0b6a96}.summary{padding:12px;background:#eef8fc;border-left:4px solid #0b79aa;border-radius:8px;line-height:1.5}table{border-collapse:collapse;width:100%;font-size:11px;margin-top:16px}th,td{border:1px solid #dbe4e9;padding:7px;text-align:left}th{background:#f3f7f9}.foot{margin-top:16px;color:#718491;font-size:10px}</style></head><body><div class="head"><p>MOBILIZA EDUCA • RELATÓRIOS E INDICADORES 360</p><h1>Relatório consolidado</h1><p>${filters.from?fmtDate(filters.from):'Início'} a ${filters.to?fmtDate(filters.to):'Hoje'}</p></div><div class="kpis"><div><strong>${rows.length}</strong><span>Ações</span></div><div><strong>${fmt(d.people)}</strong><span>Público alcançado</span></div><div><strong>${fmt(d.materials)}</strong><span>Materiais</span></div><div><strong>${d.delta>=0?'+':''}${d.delta} p.p.</strong><span>Evolução pré/pós</span></div></div><div class="summary">${esc(executiveText(d,filters))}</div><table><thead><tr><th>Data</th><th>Ação</th><th>Instituição</th><th>Status</th><th>Público</th><th>Materiais</th><th>Pré/Pós</th></tr></thead><tbody>${rows.map(e=>{const v=eventEvaluation(e);return`<tr><td>${fmtDate(eventDate(e))}</td><td>${esc(e.nome)}</td><td>${esc(source(e).label)}</td><td>${esc(e.status||'')}</td><td>${eventPeople(e)}</td><td>${eventMaterials(e)}</td><td>${v?v.pre+'% → '+v.post+'%':'—'}</td></tr>`;}).join('')}</tbody></table><div class="foot">Gerado em ${new Date().toLocaleString('pt-BR')}. Dados do armazenamento deste dispositivo/navegador.</div><script>window.onload=function(){setTimeout(function(){window.print()},300)}<\/script></body></html>`;
}

export function renderRelatorios360(host){
 css();
 const events=read('eventos'),sources=[...new Map(events.map(e=>{const s=source(e);return[s.key,s]}).filter(x=>x[0])).values()],types=uniqueOptions(events,e=>e.tipo),audiences=uniqueOptions(events,e=>e.publico);
 const filters={from:currentYear()+'-01-01',to:today(),source:'',type:'',audience:'',status:''};
 host.innerHTML=`<section class="admin-module r360"><p class="eyebrow">RELATÓRIOS E INDICADORES 360 • v1.0</p><h2>Visão gerencial consolidada</h2><p class="admin-intro">Cruze agenda, instituições, presença, impacto, avaliações, certificados, parceiros, materiais e evidências em um único recorte.</p>
 <div class="r360-filters"><label>Data inicial<input id="r360From" type="date" value="${filters.from}"></label><label>Data final<input id="r360To" type="date" value="${filters.to}"></label><label>Escola / instituição<select id="r360Source"><option value="">Todas</option>${sources.map(x=>`<option value="${esc(x.key)}">${esc(x.label)}</option>`).join('')}</select></label><label>Tipo de ação<select id="r360Type"><option value="">Todos</option>${types.map(x=>`<option>${esc(x)}</option>`).join('')}</select></label><label>Público<select id="r360Audience"><option value="">Todos</option>${audiences.map(x=>`<option>${esc(x)}</option>`).join('')}</select></label><label>Status<select id="r360Status"><option value="">Todos</option>${['Planejado','Confirmado','Em andamento','Concluído','Cancelado'].map(x=>`<option>${x}</option>`).join('')}</select></label><div class="r360-filter-actions"><button class="btn ghost" id="r360Month">Este mês</button><button class="btn ghost" id="r360Year">Este ano</button><button class="btn primary" id="r360Apply">Aplicar filtros</button></div></div><div id="r360Body"></div></section>`;
 const grab=()=>{filters.from=host.querySelector('#r360From').value;filters.to=host.querySelector('#r360To').value;filters.source=host.querySelector('#r360Source').value;filters.type=host.querySelector('#r360Type').value;filters.audience=host.querySelector('#r360Audience').value;filters.status=host.querySelector('#r360Status').value;};
 const paint=()=>{grab();const d=build(filteredRows(filters)),body=host.querySelector('#r360Body'),maxMonth=Math.max(1,...d.months.map(x=>x.value));
  body.innerHTML=`<div class="r360-kpis"><div class="r360-kpi"><span>Ações</span><strong>${d.rows.length}</strong><small>no recorte</small></div><div class="r360-kpi"><span>Público alcançado</span><strong>${fmt(d.people)}</strong><small>fechamento/presença</small></div><div class="r360-kpi"><span>Presenças nominais</span><strong>${fmt(d.presences)}</strong><small>check-ins</small></div><div class="r360-kpi"><span>Materiais</span><strong>${fmt(d.materials)}</strong><small>distribuídos</small></div><div class="r360-kpi"><span>Certificados</span><strong>${fmt(d.certs)}</strong><small>ativos</small></div><div class="r360-kpi"><span>Evidências</span><strong>${fmt(d.evid)}</strong><small>arquivos/registro</small></div><div class="r360-kpi"><span>Parceiros</span><strong>${d.partners.length}</strong><small>únicos</small></div><div class="r360-kpi"><span>Evolução</span><strong class="${d.delta>0?'av-pos':d.delta<0?'av-neg':''}">${d.evalCount?(d.delta>=0?'+':'')+d.delta+' p.p.':'—'}</strong><small>${d.evalCount} ação(ões) avaliadas</small></div></div>
  <div class="r360-summary"><strong>Resumo executivo.</strong> ${esc(executiveText(d,filters))}</div>
  <div class="r360-actions"><button class="btn ghost" id="r360Csv">⬇ CSV detalhado</button><button class="btn ghost" id="r360Print">🖨 Imprimir / PDF</button></div>
  <div class="r360-grid"><article class="r360-card"><div class="r360-card-head"><div><h3>📅 Alcance por mês</h3><p>Público alcançado no período.</p></div></div>${bars(d.months,maxMonth,x=>monthLabel(x.label),x=>x.value)}</article><article class="r360-card"><h3>🏫 Instituições com maior alcance</h3><p>Pessoas alcançadas por escola/instituição.</p>${bars(d.sources.slice(0,10),null,x=>x.label,x=>x.value)}</article><article class="r360-card"><h3>🧭 Tipos de ação</h3><p>Quantidade de ações por categoria.</p>${bars(d.types.slice(0,10),null,x=>x.label,x=>x.value)}</article><article class="r360-card"><h3>👥 Público por segmento</h3><p>Alcance informado no cadastro do evento.</p>${bars(d.audiences.slice(0,10),null,x=>x.label,x=>x.value)}</article><article class="r360-card"><h3>🤝 Parceiros mais presentes</h3><p>Número de ações em que aparecem.</p>${bars(d.partnersRank.slice(0,10),null,x=>x.label,x=>x.value)}</article><article class="r360-card"><h3>📦 Materiais mais distribuídos</h3><p>Quantidades registradas nos fechamentos.</p>${bars(d.materialsRank.slice(0,10),null,x=>x.label,x=>x.value)}</article></div>
  <article class="r360-card"><h3>🧪 Qualidade e completude dos dados</h3><p>Lacunas que podem reduzir a confiabilidade dos indicadores.</p><div class="r360-quality"><div class="${d.quality.noClose?'warn':''}"><strong>${d.quality.noClose}</strong><span>concluídas sem fechamento final</span></div><div class="${d.quality.noSource?'warn':''}"><strong>${d.quality.noSource}</strong><span>sem escola/instituição vinculada</span></div><div class="${d.quality.noPresence?'warn':''}"><strong>${d.quality.noPresence}</strong><span>sem presença nominal</span></div><div class="${d.quality.noEval?'warn':''}"><strong>${d.quality.noEval}</strong><span>sem avaliação pedagógica</span></div></div></article>
  <article class="r360-card"><div class="r360-card-head"><div><h3>📋 Detalhamento das ações</h3><p>Base usada para os indicadores acima.</p></div><span class="r360-chip">${d.rows.length} registro(s)</span></div><div class="r360-table-wrap"><table class="r360-table"><thead><tr><th>Data</th><th>Ação</th><th>Instituição</th><th>Status</th><th>Público</th><th>Materiais</th><th>Pré/Pós</th><th>Cert.</th><th>Evid.</th></tr></thead><tbody>${d.rows.map(e=>{const v=eventEvaluation(e),imp=impactFor(e.id),st=imp?.status==='Finalizado'?'ok':e.status==='Concluído'?'warn':'';return`<tr><td>${fmtDate(eventDate(e))}</td><td><strong>${esc(e.nome)}</strong><small>${esc(e.tipo||'')}</small></td><td>${esc(source(e).label)}</td><td><span class="r360-status ${st}">${esc(e.status||'—')}</span></td><td>${eventPeople(e)}<small>${attendance(e)} nominal</small></td><td>${eventMaterials(e)}</td><td>${v?v.pre+'% → '+v.post+'%':'—'}${v?'<small>'+(v.delta>=0?'+':'')+v.delta+' p.p.</small>':''}</td><td>${eventCertificateCount(e)}</td><td>${eventEvidenceCount(e)}</td></tr>`;}).join('')||'<tr><td colspan="9"><div class="r360-empty">Nenhuma ação encontrada para os filtros selecionados.</div></td></tr>'}</tbody></table></div></article>`;
  body.querySelector('#r360Csv').onclick=()=>download('mobiliza-relatorio-360.csv',detailCsv(d.rows));
  body.querySelector('#r360Print').onclick=()=>{const w=window.open('','_blank');if(!w)return;w.document.write(printableHtml(d,filters));w.document.close();};
 };
 host.querySelector('#r360Apply').onclick=paint;
 host.querySelector('#r360Year').onclick=()=>{host.querySelector('#r360From').value=currentYear()+'-01-01';host.querySelector('#r360To').value=today();paint();};
 host.querySelector('#r360Month').onclick=()=>{const d=new Date(),m=String(d.getMonth()+1).padStart(2,'0');host.querySelector('#r360From').value=d.getFullYear()+'-'+m+'-01';host.querySelector('#r360To').value=today();paint();};
 paint();
}
