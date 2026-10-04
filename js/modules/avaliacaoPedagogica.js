import {assessmentQuestionIds,resolveAssessmentQuestions,scoreAssessment,makeShortCode,buildInviteToken,parseResultToken} from '../core/assessmentEngine.js?v=2';
import {qrSvg} from '../core/qr.js?v=1';

const read=k=>JSON.parse(localStorage.getItem('mobiliza.admin.'+k)||'[]');
const write=(k,v)=>{localStorage.setItem('mobiliza.admin.'+k,JSON.stringify(v));window.dispatchEvent(new CustomEvent('mobiliza-data-change',{detail:{entity:k}}));};
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const fmtDate=v=>v?new Date(v+'T12:00:00').toLocaleDateString('pt-BR'):'—';
const byId=(k,id)=>read(k).find(x=>x.id===id);
const plans=()=>read('avaliacaoPlanos'),results=()=>read('avaliacoes');

function css(){
 if(document.getElementById('avaliacao-v1'))return;
 const s=document.createElement('style');s.id='avaliacao-v1';
 s.textContent='.av-tabs{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0 16px}.av-tab{border:1px solid #cbdde7;background:#fff;color:#214e69;padding:10px 13px;border-radius:11px;font-weight:900;cursor:pointer}.av-tab.active{background:#0b709f;color:#fff;border-color:#0b709f}.av-kpis{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px;margin:12px 0 16px}.av-kpi{background:#fff;border:1px solid #d9e7ee;border-radius:14px;padding:14px}.av-kpi strong{display:block;font-size:1.4rem;color:#0a668f}.av-kpi span{font-size:.78rem;color:#6e8491}.av-panel{background:#fff;border:1px solid #d8e6ee;border-radius:16px;padding:16px}.av-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.av-panel label{display:grid;gap:5px;font-size:.84rem;font-weight:800;color:#214e69}.av-panel input,.av-panel select{padding:10px;border:1px solid #cadde7;border-radius:10px;font:inherit}.av-help{padding:11px 13px;border-left:4px solid #0b78a8;background:#eef8fc;border-radius:10px;margin:10px 0}.av-warn{border-left-color:#e3a500;background:#fff7dc}.av-table{width:100%;border-collapse:collapse;margin-top:12px}.av-table th,.av-table td{border-bottom:1px solid #e4edf2;padding:9px;text-align:left;vertical-align:top}.av-table th{font-size:.75rem;color:#6f8390}.av-score{font-size:1.05rem;font-weight:900}.av-pos{color:#137346}.av-neg{color:#a23434}.av-neutral{color:#607480}.av-actions{display:flex;gap:6px;flex-wrap:wrap}.av-bar{height:8px;background:#e6edf1;border-radius:99px;overflow:hidden;min-width:90px}.av-bar span{display:block;height:100%;background:#0b78a8}.av-compare{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:12px}.av-card{border:1px solid #dbe7ed;border-radius:13px;padding:12px}.av-card h4{margin:0 0 8px}.av-cat{display:grid;grid-template-columns:1fr auto auto auto;gap:8px;padding:7px 0;border-bottom:1px solid #edf2f5}.av-modal{position:fixed;inset:0;z-index:100000;background:rgba(7,28,42,.78);display:grid;place-items:center;padding:14px}.av-modal-card{width:min(720px,100%);max-height:92vh;overflow:auto;background:#fff;border-radius:18px;padding:18px}.av-camera{background:#07151d;border-radius:12px;overflow:hidden;margin-top:10px}.av-camera video{width:100%;max-height:350px;object-fit:cover}.av-qr{text-align:center}.av-qr svg{width:min(310px,85vw);height:auto}.av-code{font-family:monospace;font-weight:900;word-break:break-all}.av-chip{display:inline-block;border-radius:999px;padding:4px 8px;font-size:.72rem;font-weight:900;background:#e8f4fa;color:#0b668e}.av-chip.done{background:#e3f6e9;color:#17663a}@media(max-width:900px){.av-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}.av-grid,.av-compare{grid-template-columns:1fr}.av-table{font-size:.82rem}.av-table th:nth-child(3),.av-table td:nth-child(3){display:none}}';
 document.head.appendChild(s);
}
function eventParticipants(e){
 const out=[],alunos=read('alunos'),turmas=new Set(e.idsTurmas||[]);
 alunos.filter(a=>turmas.has(a.idTurma)).forEach(a=>{const t=byId('turmas',a.idTurma),es=t?byId('escolas',t.idEscola):null;out.push({key:'A:'+a.id,type:'aluno',id:a.id,name:a.nome||'Aluno',turmaId:a.idTurma,group:t?.nome||'',institution:es?.nome||'',present:!!(e.presenca||{})[a.id]});});
 read('inscricoes').filter(r=>r.idEvento===e.id&&['Confirmada','Presente'].includes(r.status)).forEach(r=>out.push({key:'I:'+r.id,type:'inscricao',id:r.id,name:r.nome||r.responsavel||'Participante',turmaId:'',group:'Inscrição externa',institution:'',present:r.status==='Presente'}));
 return out.sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'));
}
function activePlan(eventId){return plans().find(p=>p.eventId===eventId&&p.active!==false);}
function ensurePlanParticipants(plan,e){
 const current=eventParticipants(e),map=new Map((plan.participants||[]).map(p=>[p.key,p]));
 let changed=false;
 for(const p of current)if(!map.has(p.key)){map.set(p.key,{...p,code:makeShortCode(5)});changed=true;}else Object.assign(map.get(p.key),p);
 plan.participants=[...map.values()];if(changed){plan.updatedAt=new Date().toISOString();const all=plans(),x=all.findIndex(z=>z.id===plan.id);if(x>=0){all[x]=plan;write('avaliacaoPlanos',all);}}
 return plan.participants;
}
function createPlan(e,audience,count){
 const all=plans();all.forEach(p=>{if(p.eventId===e.id)p.active=false;});
 const plan={id:'AVP-'+Date.now().toString(36),code:makeShortCode(5),eventId:e.id,audience,count:Number(count)||8,seed:makeShortCode(5),active:true,createdAt:new Date().toISOString(),participants:eventParticipants(e).map(p=>({...p,code:makeShortCode(5)}))};
 all.unshift(plan);write('avaliacaoPlanos',all);return plan;
}
function phaseResult(plan,p,phase){return results().find(r=>r.planId===plan.id&&r.participantKey===p.key&&r.phase===phase);}
function saveResult(plan,p,phase,answers,mode='digital'){
 const ids=assessmentQuestionIds({audience:plan.audience,count:plan.count,seed:plan.seed,phase}),score=scoreAssessment(ids,answers),all=results(),old=all.find(r=>r.planId===plan.id&&r.participantKey===p.key&&r.phase===phase);
 const row={id:old?.id||('AVR-'+Date.now().toString(36)+Math.random().toString(36).slice(2,5)),planId:plan.id,planCode:plan.code,eventId:plan.eventId,participantKey:p.key,participantCode:p.code,participantName:p.name,participantType:p.type,turmaId:p.turmaId||'',group:p.group||'',phase,questionIds:ids,answers:[...answers],correct:score.correct,total:score.total,pct:score.pct,details:score.details,mode,createdAt:old?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()};
 if(old)Object.assign(old,row);else all.unshift(row);write('avaliacoes',all);return row;
}
function saveManual(plan,p,phase,correct,total){
 const all=results(),old=all.find(r=>r.planId===plan.id&&r.participantKey===p.key&&r.phase===phase),row={id:old?.id||('AVR-'+Date.now().toString(36)+Math.random().toString(36).slice(2,5)),planId:plan.id,planCode:plan.code,eventId:plan.eventId,participantKey:p.key,participantCode:p.code,participantName:p.name,participantType:p.type,turmaId:p.turmaId||'',group:p.group||'',phase,questionIds:[],answers:[],correct,total,pct:total?Math.round(correct*100/total):0,details:[],mode:'manual',createdAt:old?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()};if(old)Object.assign(old,row);else all.unshift(row);write('avaliacoes',all);return row;
}
function inviteUrl(plan,p,phase){
 const token=buildInviteToken({planCode:plan.code,participantCode:p.code,phase,audience:plan.audience,count:plan.count,seed:plan.seed}),u=new URL(location.href);u.search='';u.hash='';u.searchParams.set('a',token);return u.toString();
}
function showInvite(plan,p,phase){
 const url=inviteUrl(plan,p,phase),overlay=document.createElement('div');overlay.className='av-modal';
 let qr='';try{qr=qrSvg(url,{scale:6,ariaLabel:'QR da avaliação'});}catch{qr='<p>Link muito longo para o QR interno. Use o botão Abrir.</p>';}
 overlay.innerHTML='<div class="av-modal-card av-qr"><p class="eyebrow">AVALIAÇÃO '+(phase==='PRE'?'PRÉ-TESTE':'PÓS-TESTE')+'</p><h3>'+esc(p.name)+'</h3><p>'+esc(plan.code)+' • '+plan.count+' questões</p>'+qr+'<p class="av-code">'+esc(url)+'</p><div class="av-actions" style="justify-content:center"><button class="btn primary" id="avOpen">Abrir neste aparelho</button><button class="btn ghost" id="avPrint">Imprimir QR</button><button class="btn ghost" id="avClose">Fechar</button></div></div>';
 document.body.appendChild(overlay);overlay.querySelector('#avClose').onclick=()=>overlay.remove();overlay.onclick=e=>{if(e.target===overlay)overlay.remove();};overlay.querySelector('#avOpen').onclick=()=>window.open(url,'_blank');overlay.querySelector('#avPrint').onclick=()=>{const w=window.open('','_blank');w.document.write('<!doctype html><html><head><meta charset="utf-8"><title>QR Avaliação</title><style>body{font-family:Arial;text-align:center;padding:30px;color:#173f60}svg{width:320px;height:320px}.box{max-width:560px;margin:auto;border:1px solid #ccdce5;border-radius:18px;padding:24px}</style></head><body><div class="box"><h1>MOBILIZA EDUCA</h1><h2>'+(phase==='PRE'?'Pré-teste':'Pós-teste')+'</h2><p><strong>'+esc(p.name)+'</strong></p>'+qr+'<p>'+esc(plan.code)+'</p></div><script>window.onload=function(){setTimeout(function(){window.print()},250)}<\/script></body></html>');w.document.close();};
}
function importToken(raw){
 const parsed=parseResultToken(raw);if(!parsed)throw new Error('QR/resultado inválido.');
 const plan=plans().find(p=>p.code===parsed.planCode);if(!plan)throw new Error('Plano de avaliação não encontrado neste dispositivo.');
 const p=(plan.participants||[]).find(x=>x.code===parsed.participantCode);if(!p)throw new Error('Participante não pertence a este plano.');
 if(parsed.answers.length!==Number(plan.count))throw new Error('Quantidade de respostas incompatível com o plano.');
 return saveResult(plan,p,parsed.phase,parsed.answers,'qr-offline');
}
function importPending(){
 let pending=[];try{pending=JSON.parse(localStorage.getItem('mobiliza.assessment.pendingResults')||'[]');}catch{}
 let ok=0,fail=0;for(const x of pending){try{importToken(x.token);ok++;}catch{fail++;}}if(ok)localStorage.removeItem('mobiliza.assessment.pendingResults');return{ok,fail};
}
function showImporter(onImported){
 const overlay=document.createElement('div');overlay.className='av-modal';
 overlay.innerHTML='<div class="av-modal-card"><p class="eyebrow">IMPORTAR RESULTADO</p><h3>QR do pré/pós-teste</h3><div class="av-help">Aponte a câmera para o QR exibido no celular do participante ou cole o código MZAR.</div><div class="av-grid"><label>Código do resultado<input id="avImportInput" placeholder="MZAR|..."></label><div class="av-actions" style="align-items:end"><button class="btn primary" id="avImportBtn">Importar</button><button class="btn ghost" id="avCameraBtn">📷 Câmera</button></div></div><div id="avCameraBox" class="av-camera" hidden><video id="avVideo" playsinline muted></video></div><p id="avImportMsg"></p><div class="av-actions"><button class="btn ghost" id="avImportClose">Fechar</button></div></div>';
 document.body.appendChild(overlay);let stream=null,timer=null,busy=false;
 const stop=()=>{if(timer)clearInterval(timer);timer=null;if(stream){stream.getTracks().forEach(t=>t.stop());stream=null;}};
 const close=()=>{stop();overlay.remove();};overlay.querySelector('#avImportClose').onclick=close;overlay.onclick=e=>{if(e.target===overlay)close();};
 const process=raw=>{if(busy)return;busy=true;const msg=overlay.querySelector('#avImportMsg');try{const r=importToken(raw);msg.textContent='✓ Resultado importado: '+r.participantName+' • '+(r.phase==='PRE'?'Pré':'Pós')+' • '+r.pct+'%';msg.style.color='#17663a';overlay.querySelector('#avImportInput').value='';onImported?.();}catch(e){msg.textContent=e.message;msg.style.color='#a23434';}setTimeout(()=>busy=false,800);};
 overlay.querySelector('#avImportBtn').onclick=()=>process(overlay.querySelector('#avImportInput').value);
 overlay.querySelector('#avCameraBtn').onclick=async()=>{if(stream){stop();overlay.querySelector('#avCameraBox').hidden=true;return;}if(!('BarcodeDetector'in window)){overlay.querySelector('#avImportMsg').textContent='Leitura por câmera não disponível neste navegador. Use o código manual.';return;}try{const detector=new BarcodeDetector({formats:['qr_code']});stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}},audio:false});const v=overlay.querySelector('#avVideo');v.srcObject=stream;await v.play();overlay.querySelector('#avCameraBox').hidden=false;timer=setInterval(async()=>{if(busy||v.readyState<2)return;try{const codes=await detector.detect(v);if(codes[0]?.rawValue)process(codes[0].rawValue);}catch{}},450);}catch(e){overlay.querySelector('#avImportMsg').textContent='Não foi possível abrir a câmera: '+e.message;}};
}
function avg(rows){return rows.length?Math.round(rows.reduce((s,x)=>s+x.pct,0)/rows.length):0;}
function summaryForPlan(plan){
 const r=results().filter(x=>x.planId===plan.id),pre=r.filter(x=>x.phase==='PRE'),pos=r.filter(x=>x.phase==='POS'),pairs=[];
 for(const p of plan.participants||[]){const a=pre.find(x=>x.participantKey===p.key),b=pos.find(x=>x.participantKey===p.key);if(a&&b)pairs.push({p,pre:a,pos:b,delta:b.pct-a.pct});}
 return{pre,pos,pairs,avgPre:avg(pre),avgPos:avg(pos),delta:avg(pos)-avg(pre),improved:pairs.filter(x=>x.delta>0).length};
}
function categorySummary(plan,phase){
 const rows=results().filter(r=>r.planId===plan.id&&r.phase===phase&&r.details?.length),map=new Map();
 for(const r of rows)for(const d of r.details){if(!map.has(d.category))map.set(d.category,{category:d.category,total:0,correct:0});const x=map.get(d.category);x.total++;if(d.correct)x.correct++;}
 return [...map.values()].map(x=>({...x,pct:x.total?Math.round(x.correct*100/x.total):0}));
}
function exportCsv(plan){
 const rows=results().filter(x=>x.planId===plan.id),head='Participante;Grupo;Fase;Acertos;Total;Percentual;Modo\n',body=rows.map(r=>[r.participantName,r.group||'',r.phase,r.correct,r.total,r.pct,r.mode].map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(';')).join('\n');
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\ufeff'+head+body],{type:'text/csv;charset=utf-8'}));a.download='avaliacao-'+plan.code+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}

export function renderAvaliacaoPedagogica(host){
 css();let tab='aplicar',eventId=read('eventos')[0]?.id||'';
 function shell(){
  const event=byId('eventos',eventId),plan=event?activePlan(event.id):null,sum=plan?summaryForPlan(plan):{pre:[],pos:[],pairs:[],avgPre:0,avgPos:0,delta:0,improved:0};
  const present=event?eventParticipants(event).filter(x=>x.present).length:0,total=event?eventParticipants(event).length:0;
  host.innerHTML='<section class="admin-module"><p class="eyebrow">AVALIAÇÃO PEDAGÓGICA • v1.0</p><h2>Presença, pré-teste e pós-teste</h2><p class="admin-intro">Meça aprendizagem antes e depois da ação sem confundir participação com desempenho.</p><div class="av-kpis"><div class="av-kpi"><strong>'+total+'</strong><span>participantes vinculados</span></div><div class="av-kpi"><strong>'+present+'</strong><span>presenças registradas</span></div><div class="av-kpi"><strong>'+sum.avgPre+'%</strong><span>média pré-teste</span></div><div class="av-kpi"><strong>'+sum.avgPos+'%</strong><span>média pós-teste</span></div><div class="av-kpi"><strong class="'+(sum.delta>0?'av-pos':sum.delta<0?'av-neg':'')+'">'+(sum.delta>0?'+':'')+sum.delta+' p.p.</strong><span>variação média</span></div></div><div class="av-tabs"><button class="av-tab '+(tab==='aplicar'?'active':'')+'" data-avtab="aplicar">📝 Aplicar</button><button class="av-tab '+(tab==='resultados'?'active':'')+'" data-avtab="resultados">📊 Resultados</button><button class="av-tab '+(tab==='comparativos'?'active':'')+'" data-avtab="comparativos">📈 Comparativos</button><button class="av-tab '+(tab==='manual'?'active':'')+'" data-avtab="manual">⌨️ Lançamento manual</button></div><div id="avBody"></div></section>';
  host.querySelectorAll('[data-avtab]').forEach(b=>b.onclick=()=>{tab=b.dataset.avtab;shell();});renderBody();
 }
 function eventSelector(body){
  const events=read('eventos').filter(e=>e.status!=='Cancelado').sort((a,b)=>String(b.dataInicio||b.data||'').localeCompare(String(a.dataInicio||a.data||'')));
  return '<label>Evento / atividade<select id="avEvent">'+events.map(e=>'<option value="'+e.id+'" '+(e.id===eventId?'selected':'')+'>'+fmtDate(e.dataInicio||e.data)+' • '+esc(e.nome)+'</option>').join('')+'</select></label>';
 }
 function bindEvent(body){const el=body.querySelector('#avEvent');if(el)el.onchange=()=>{eventId=el.value;shell();};}
 function renderBody(){const body=host.querySelector('#avBody');if(tab==='aplicar')renderApply(body);else if(tab==='resultados')renderResults(body);else if(tab==='comparativos')renderCompare(body);else renderManual(body);}
 function renderApply(body){
  const e=byId('eventos',eventId);if(!e){body.innerHTML='<div class="av-panel">Cadastre um evento antes de criar avaliações.</div>';return;}let plan=activePlan(e.id);
  body.innerHTML='<div class="av-panel"><div class="av-grid">'+eventSelector(body)+'<label>Público da avaliação<select id="avAudience"><option value="criancas">Crianças</option><option value="adolescentes">Adolescentes</option><option value="adultos">Adultos</option></select></label><label>Questões por fase<select id="avCount"><option>6</option><option selected>8</option><option>10</option><option>12</option></select></label><div class="av-actions" style="align-items:end"><button class="btn primary" id="avCreatePlan">'+(plan?'Regerar plano':'Criar plano pré/pós')+'</button><button class="btn ghost" id="avImportPending">Importar deste aparelho</button><button class="btn ghost" id="avImportQR">Importar QR resultado</button></div></div><div id="avPlanHost"></div></div>';
  bindEvent(body);if(plan){body.querySelector('#avAudience').value=plan.audience;body.querySelector('#avCount').value=String(plan.count);}
  body.querySelector('#avCreatePlan').onclick=()=>{if(plan&&results().some(x=>x.planId===plan.id)&&!confirm('Este plano já possui resultados. Regerar criará um novo plano e manterá o histórico anterior. Continuar?'))return;plan=createPlan(e,body.querySelector('#avAudience').value,Number(body.querySelector('#avCount').value));renderApply(body);};
  body.querySelector('#avImportPending').onclick=()=>{const r=importPending();alert(r.ok+' resultado(s) importado(s) deste aparelho'+(r.fail?' • '+r.fail+' ignorado(s)':'')+'.');shell();};
  body.querySelector('#avImportQR').onclick=()=>showImporter(()=>{});
  if(plan)renderPlan(plan,body.querySelector('#avPlanHost'));else body.querySelector('#avPlanHost').innerHTML='<div class="av-help av-warn"><strong>Crie um plano.</strong> O sistema gera dois conjuntos equivalentes e diferentes de questões para pré e pós-teste.</div>';
 }
 function renderPlan(plan,box){
  const e=byId('eventos',plan.eventId),people=ensurePlanParticipants(plan,e);
  box.innerHTML='<div class="av-help"><strong>Plano '+esc(plan.code)+'</strong> • '+esc(plan.audience)+' • '+plan.count+' questões por fase. O QR individual abre a avaliação no celular do participante. Ao concluir, o aparelho gera outro QR para importação offline.</div><div style="overflow:auto"><table class="av-table"><thead><tr><th>Participante</th><th>Grupo</th><th>Presença</th><th>Pré</th><th>Pós</th><th>Evolução</th><th>Ações</th></tr></thead><tbody>'+people.map(p=>{const pre=phaseResult(plan,p,'PRE'),pos=phaseResult(plan,p,'POS'),delta=pre&&pos?pos.pct-pre.pct:null;return '<tr><td><strong>'+esc(p.name)+'</strong><small style="display:block">'+esc(p.code)+'</small></td><td>'+esc(p.group||'—')+'</td><td><span class="av-chip '+(p.present?'done':'')+'">'+(p.present?'Presente':'Sem presença')+'</span></td><td><span class="av-score">'+(pre?pre.pct+'%':'—')+'</span></td><td><span class="av-score">'+(pos?pos.pct+'%':'—')+'</span></td><td><span class="'+(delta>0?'av-pos':delta<0?'av-neg':'av-neutral')+'">'+(delta===null?'—':(delta>0?'+':'')+delta+' p.p.')+'</span></td><td><div class="av-actions"><button class="btn ghost small" data-invite-pre="'+esc(p.key)+'">QR Pré</button><button class="btn ghost small" data-invite-pos="'+esc(p.key)+'">QR Pós</button></div></td></tr>';}).join('')+'</tbody></table></div>';
  box.querySelectorAll('[data-invite-pre]').forEach(b=>b.onclick=()=>showInvite(plan,people.find(p=>p.key===b.dataset.invitePre),'PRE'));
  box.querySelectorAll('[data-invite-pos]').forEach(b=>b.onclick=()=>showInvite(plan,people.find(p=>p.key===b.dataset.invitePos),'POS'));
 }
 function renderResults(body){
  const e=byId('eventos',eventId),plan=e?activePlan(e.id):null;body.innerHTML='<div class="av-panel">'+eventSelector(body)+(plan?'<div class="av-actions"><button class="btn ghost" id="avExport">Exportar CSV</button></div><div id="avResultsHost"></div>':'<div class="av-help av-warn">Este evento ainda não possui plano de avaliação.</div>')+'</div>';bindEvent(body);if(!plan)return;
  const sum=summaryForPlan(plan),people=ensurePlanParticipants(plan,e);
  body.querySelector('#avResultsHost').innerHTML='<div class="av-help"><strong>'+sum.pairs.length+' participante(s)</strong> possuem pré e pós-teste pareados. Variação média: <strong>'+(sum.delta>0?'+':'')+sum.delta+' p.p.</strong></div><div style="overflow:auto"><table class="av-table"><thead><tr><th>Participante</th><th>Grupo</th><th>Pré</th><th>Pós</th><th>Variação</th><th>Modo</th></tr></thead><tbody>'+people.map(p=>{const a=phaseResult(plan,p,'PRE'),b=phaseResult(plan,p,'POS'),d=a&&b?b.pct-a.pct:null;return '<tr><td>'+esc(p.name)+'</td><td>'+esc(p.group||'—')+'</td><td>'+(a?a.pct+'%':'—')+'</td><td>'+(b?b.pct+'%':'—')+'</td><td class="'+(d>0?'av-pos':d<0?'av-neg':'')+'">'+(d===null?'—':(d>0?'+':'')+d+' p.p.')+'</td><td>'+esc(b?.mode||a?.mode||'—')+'</td></tr>';}).join('')+'</tbody></table></div>';
  body.querySelector('#avExport').onclick=()=>exportCsv(plan);
 }
 function renderCompare(body){
  const e=byId('eventos',eventId),plan=e?activePlan(e.id):null;body.innerHTML='<div class="av-panel">'+eventSelector(body)+(plan?'<div id="avCompareHost"></div>':'<div class="av-help av-warn">Crie um plano para visualizar comparativos.</div>')+'</div>';bindEvent(body);if(!plan)return;
  const sum=summaryForPlan(plan),preCats=categorySummary(plan,'PRE'),posCats=categorySummary(plan,'POS'),cats=[...new Set([...preCats.map(x=>x.category),...posCats.map(x=>x.category)])].sort();
  const turmaMap=new Map();for(const pair of sum.pairs){const key=pair.p.turmaId||pair.p.group||'externos';if(!turmaMap.has(key))turmaMap.set(key,{name:pair.p.group||'Externos',pre:[],pos:[]});turmaMap.get(key).pre.push(pair.pre);turmaMap.get(key).pos.push(pair.pos);}
  body.querySelector('#avCompareHost').innerHTML='<div class="av-help"><strong>Leitura pedagógica:</strong> a variação mostra diferença entre pré e pós no mesmo plano; não deve ser interpretada isoladamente como prova de causalidade.</div><div class="av-compare"><div class="av-card"><h4>Por categoria</h4>'+cats.map(c=>{const a=preCats.find(x=>x.category===c)?.pct||0,b=posCats.find(x=>x.category===c)?.pct||0,d=b-a;return '<div class="av-cat"><span>'+esc(c)+'</span><span>'+a+'%</span><span>'+b+'%</span><strong class="'+(d>0?'av-pos':d<0?'av-neg':'')+'">'+(d>0?'+':'')+d+' p.p.</strong></div>';}).join('')+'</div><div class="av-card"><h4>Por turma / grupo</h4>'+[...turmaMap.values()].map(g=>{const a=avg(g.pre),b=avg(g.pos),d=b-a;return '<div class="av-cat"><span>'+esc(g.name)+'</span><span>'+a+'%</span><span>'+b+'%</span><strong class="'+(d>0?'av-pos':d<0?'av-neg':'')+'">'+(d>0?'+':'')+d+' p.p.</strong></div>';}).join('')+'</div></div>';
 }
 function renderManual(body){
  const e=byId('eventos',eventId),plan=e?activePlan(e.id):null;body.innerHTML='<div class="av-panel">'+eventSelector(body)+(plan?'<div class="av-help">Use este lançamento para provas em papel ou situações em que o participante não respondeu pelo celular.</div><div class="av-grid"><label>Participante<select id="avManualPerson"></select></label><label>Fase<select id="avManualPhase"><option value="PRE">Pré-teste</option><option value="POS">Pós-teste</option></select></label><label>Acertos<input id="avManualCorrect" type="number" min="0" value="0"></label><label>Total de questões<input id="avManualTotal" type="number" min="1" value="'+plan.count+'"></label></div><div class="av-actions"><button class="btn primary" id="avManualSave">Salvar resultado manual</button></div>':'<div class="av-help av-warn">Crie um plano de avaliação para usar lançamento manual.</div>')+'</div>';bindEvent(body);if(!plan)return;
  const people=ensurePlanParticipants(plan,e),sel=body.querySelector('#avManualPerson');sel.innerHTML=people.map(p=>'<option value="'+esc(p.key)+'">'+esc(p.name)+' • '+esc(p.group||'')+'</option>').join('');
  body.querySelector('#avManualSave').onclick=()=>{const p=people.find(x=>x.key===sel.value),phase=body.querySelector('#avManualPhase').value,total=Math.max(1,Number(body.querySelector('#avManualTotal').value)||plan.count),correct=Math.max(0,Math.min(total,Number(body.querySelector('#avManualCorrect').value)||0));saveManual(plan,p,phase,correct,total);alert('Resultado salvo: '+Math.round(correct*100/total)+'%.');shell();};
 }
 shell();
}
