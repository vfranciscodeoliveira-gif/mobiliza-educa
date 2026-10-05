import {renderCustomCertificates} from './customCertificates.js?v=3';
import {qrSvg} from '../core/qr.js?v=1';
import {cloudConfigured,hasCloudSession,publishCertificate,revokeCertificateCloud} from '../cloudGateway.js?v=5';

const read=k=>JSON.parse(localStorage.getItem('mobiliza.admin.'+k)||'[]');
const write=(k,v)=>{localStorage.setItem('mobiliza.admin.'+k,JSON.stringify(v));window.dispatchEvent(new CustomEvent('mobiliza-data-change',{detail:{entity:k}}));};
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const fmtDate=v=>v?new Date(v+'T12:00:00').toLocaleDateString('pt-BR'):'—';
const byId=(entity,id)=>read(entity).find(x=>x.id===id);
const certs=()=>read('certificados');
const prefs=()=>JSON.parse(localStorage.getItem('mobiliza.cert.prefs')||'{"signatory":"","role":"","city":"Presidente Prudente - SP"}');
const savePrefs=p=>localStorage.setItem('mobiliza.cert.prefs',JSON.stringify(p));

function ensureCss(){
 if(document.getElementById('cert-pass-v1'))return;
 const s=document.createElement('style');s.id='cert-pass-v1';
 s.textContent='.cert-tabs{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0 16px}.cert-tab{border:1px solid #cbdde7;background:#fff;color:#214e69;padding:10px 13px;border-radius:11px;font-weight:900;cursor:pointer}.cert-tab.active{background:#0b709f;color:#fff;border-color:#0b709f}.cert-kpis{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:12px 0 16px}.cert-kpi{background:#fff;border:1px solid #d9e7ee;border-radius:14px;padding:14px}.cert-kpi strong{display:block;font-size:1.45rem;color:#0a668f}.cert-kpi span{font-size:.8rem;color:#6e8491}.cert-panel{background:#fff;border:1px solid #d8e6ee;border-radius:16px;padding:16px}.cert-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.cert-panel label{display:grid;gap:5px;font-size:.84rem;font-weight:800;color:#214e69}.cert-panel input,.cert-panel select{padding:10px 11px;border:1px solid #cadde7;border-radius:10px;font:inherit}.cert-actions{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end;margin-top:14px}.eligible-list,.passport-list,.cert-history{display:grid;gap:8px;margin-top:12px}.eligible-item,.passport-card,.cert-row{border:1px solid #dbe7ed;border-radius:12px;padding:11px;background:#fff;display:grid;grid-template-columns:auto 1fr auto;gap:10px;align-items:center}.passport-card,.cert-row{grid-template-columns:1fr auto}.eligible-item small,.passport-card small,.cert-row small{display:block;color:#738793;margin-top:3px}.badge-pill{display:inline-flex;border-radius:999px;padding:4px 8px;font-size:.72rem;font-weight:900;background:#e9f4fa;color:#0b628e;margin:2px}.badge-pill.gold{background:#fff2bf;color:#7c5b00}.badge-pill.green{background:#e2f6e8;color:#1d6b37}.cert-status{display:inline-flex;border-radius:999px;padding:4px 8px;font-size:.72rem;font-weight:900;background:#e5f7ea;color:#17653a}.cert-status.revogado{background:#ffe5e5;color:#8a2929}.passport-progress{height:8px;background:#e9eff2;border-radius:99px;overflow:hidden;margin-top:8px}.passport-progress span{display:block;height:100%;background:linear-gradient(90deg,#0b76a8,#1ca56d)}.cert-help{padding:11px 13px;border-left:4px solid #0b78a8;background:#eef8fc;border-radius:10px;margin:10px 0}@media(max-width:800px){.cert-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}.cert-grid{grid-template-columns:1fr}.eligible-item,.passport-card,.cert-row{grid-template-columns:1fr}}';
 document.head.appendChild(s);
}

function eventMinutes(e){
 const a=e.dataInicio||e.data,b=e.dataFim||a,hs=e.horaInicio||'00:00',he=e.horaFim||'00:00';
 if(!a)return 0;
 return Math.max(0,Math.round((new Date(b+'T'+he+':00')-new Date(a+'T'+hs+':00'))/60000));
}
function workloadLabel(min){if(!min)return '—';const h=Math.floor(min/60),m=min%60;return h+(m?'h '+m+'min':'h');}
function institutionForStudent(a){const t=byId('turmas',a.idTurma),e=t?byId('escolas',t.idEscola):null;return e?.nome||'';}
function eligibleForEvent(e){
 const out=[],alunos=read('alunos'),presence=e.presenca||{};
 Object.keys(presence).forEach(id=>{if(!presence[id])return;const a=alunos.find(x=>x.id===id);if(a)out.push({key:'aluno:'+a.id,type:'aluno',id:a.id,name:a.nome||'Aluno',institution:institutionForStudent(a),quantity:1});});
 read('inscricoes').filter(x=>x.idEvento===e.id&&x.status==='Presente').forEach(r=>out.push({key:'inscricao:'+r.id,type:'inscricao',id:r.id,name:r.nome||r.responsavel||'Participante',institution:'',quantity:Number(r.quantidade)||1}));
 return out.sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'));
}
function certFor(eventId,p){return certs().find(c=>c.eventId===eventId&&c.participantKey===p.key&&c.status!=='Revogado');}
function code(){return 'MEC-'+new Date().getFullYear()+'-'+Math.random().toString(36).slice(2,8).toUpperCase();}
function certUrl(c){const u=new URL(location.href);u.search='';u.hash='';u.searchParams.set('cert',c.code);return u.toString();}
function qrPayload(c){const u=certUrl(c);return new TextEncoder().encode(u).length<=106?u:'MZC|'+c.code;}

function issue(e,p,mins){
 const old=certFor(e.id,p);if(old)return old;
 const pr=prefs(),m=Number(mins)||eventMinutes(e),c={id:(crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2,8)),code:code(),eventId:e.id,participantKey:p.key,participantType:p.type,participantId:p.id,participantName:p.name,institution:p.institution||'',activityName:e.nome||e.tipo||'Atividade educativa',eventDate:e.dataInicio||e.data||'',eventDateLabel:fmtDate(e.dataInicio||e.data),workloadMinutes:m,workloadLabel:workloadLabel(m),quantity:p.quantity||1,status:'Emitido',issuedAt:new Date().toISOString(),signatory:pr.signatory||'',signatoryRole:pr.role||'',city:pr.city||'',cloudPublished:false};
 const all=certs();all.unshift(c);write('certificados',all);return c;
}
async function maybePublish(c){
 if(!cloudConfigured()||!hasCloudSession())return false;
 try{await publishCertificate(c);const all=certs(),x=all.find(z=>z.id===c.id);if(x){x.cloudPublished=true;x.cloudPublishedAt=new Date().toISOString();write('certificados',all);}return true;}catch{return false;}
}
function printCertificate(c){
 const w=window.open('','_blank');if(!w)return;
 const qr=qrSvg(qrPayload(c),{scale:6,ariaLabel:'QR de validação do certificado'});
 const html='<!doctype html><html><head><meta charset="utf-8"><title>Certificado</title><style>@page{size:A4 landscape;margin:0}*{box-sizing:border-box}body{margin:0;font-family:Georgia,serif;color:#173f60}.page{width:297mm;height:210mm;padding:14mm}.frame{height:100%;border:2px solid #0b709f;border-radius:8mm;padding:12mm;display:grid;grid-template-columns:1fr 45mm;gap:10mm;align-items:center}.brand{font-family:Arial;font-weight:900;letter-spacing:2px;color:#0b709f}.title{font-size:34px;margin:8mm 0 5mm;text-transform:uppercase}.lead{font-size:18px;line-height:1.6}.name{font-size:28px;font-weight:700;border-bottom:1px solid #a9c5d4;padding-bottom:3mm;margin:4mm 0}.sign{margin-top:12mm;display:flex;gap:25mm}.sign>div{min-width:58mm;text-align:center;border-top:1px solid #698393;padding-top:3mm;font-family:Arial;font-size:12px}.qr{text-align:center;font-family:Arial}.qr svg{width:40mm;height:40mm}.small{font-size:10px;color:#6d8290}</style></head><body><section class="page"><div class="frame"><div><div class="brand">MOBILIZA EDUCA • EDUCAÇÃO PARA O TRÂNSITO</div><div class="title">Certificado</div><div class="lead">Certificamos que</div><div class="name">'+esc(c.participantName)+'</div><div class="lead">participou de <strong>'+esc(c.activityName)+'</strong>, realizada em '+esc(c.eventDateLabel)+', com carga horária de <strong>'+esc(c.workloadLabel)+'</strong>.</div><p>'+ (c.institution?'Instituição: '+esc(c.institution)+'<br>':'') +'Código de validação: <strong>'+esc(c.code)+'</strong></p><div class="sign"><div>'+esc(c.signatory||'Responsável institucional')+'<br><span class="small">'+esc(c.signatoryRole||'')+'</span></div><div>MOBILIZA EDUCA<br><span class="small">'+esc(c.city||'')+'</span></div></div></div><aside class="qr">'+qr+'<strong>'+esc(c.code)+'</strong><p class="small">Escaneie para validar.</p></aside></div></section><script>window.onload=function(){setTimeout(function(){window.print()},250)}<\/script></body></html>';
 w.document.write(html);w.document.close();
}

function passports(){
 const map=new Map();
 read('eventos').forEach(e=>eligibleForEvent(e).forEach(p=>{
  let key=p.key,name=p.name,institution=p.institution;
  if(p.type==='inscricao'){const r=byId('inscricoes',p.id);key='contato:'+String(r?.email||r?.telefone||r?.nome||p.id).toLowerCase();name=r?.nome||p.name;}
  if(!map.has(key))map.set(key,{key,name,institution,actions:[],minutes:0});
  const x=map.get(key);if(!x.actions.some(a=>a.eventId===e.id)){const m=eventMinutes(e);x.actions.push({eventId:e.id,name:e.nome,date:e.dataInicio||e.data,minutes:m});x.minutes+=m;}
 }));
 return [...map.values()].sort((a,b)=>a.name.localeCompare(b.name,'pt-BR'));
}
function badges(p){const n=p.actions.length,b=[];if(n>=1)b.push('🚦 Primeiro passo');if(n>=3)b.push('🛣️ Cidadão em movimento');if(n>=5)b.push('🏅 Guardião do Trânsito');if(n>=10)b.push('⭐ Embaixador da Mobilidade');return b;}
function printPassport(p){
 const w=window.open('','_blank');if(!w)return;
 const hist=p.actions.sort((a,b)=>String(b.date).localeCompare(String(a.date))).map(a=>'<div style="padding:9px 0;border-bottom:1px solid #edf2f5"><strong>'+esc(a.name)+'</strong><small style="display:block;color:#718491">'+fmtDate(a.date)+' • '+esc(workloadLabel(a.minutes))+'</small></div>').join('');
 const html='<!doctype html><html><head><meta charset="utf-8"><title>Passaporte</title><style>body{font-family:Arial;color:#173f60;padding:28px}.book{max-width:760px;margin:auto;border:1px solid #cddde6;border-radius:20px;padding:24px}.head{background:#0b709f;color:white;border-radius:14px;padding:18px}.badge{display:inline-block;border-radius:999px;padding:6px 10px;margin:3px;background:#e9f4fa}</style></head><body><div class="book"><div class="head"><h1>Passaporte Digital</h1><h2>'+esc(p.name)+'</h2><div>'+esc(p.institution||'')+'</div></div><h3>'+p.actions.length+' participação(ões) • '+esc(workloadLabel(p.minutes))+'</h3><div>'+badges(p).map(x=>'<span class="badge">'+esc(x)+'</span>').join('')+'</div><h3>Histórico</h3>'+hist+'</div><script>window.onload=function(){setTimeout(function(){window.print()},250)}<\/script></body></html>';
 w.document.write(html);w.document.close();
}

function renderLegacyPassaporteCertificados(host){
 ensureCss();let tab='emitir',selectedEvent='';
 function shell(){
  const all=certs(),valid=all.filter(x=>x.status!=='Revogado'),rev=all.filter(x=>x.status==='Revogado'),pass=passports();
  host.innerHTML='<section class="admin-module"><p class="eyebrow">PASSAPORTE & CERTIFICADOS • v1.0</p><h2>Passaporte Digital e Certificados</h2><p class="admin-intro">Emissão com QR de validação e histórico educativo.</p><div class="cert-kpis"><div class="cert-kpi"><strong>'+valid.length+'</strong><span>certificados ativos</span></div><div class="cert-kpi"><strong>'+rev.length+'</strong><span>revogados</span></div><div class="cert-kpi"><strong>'+pass.length+'</strong><span>passaportes</span></div><div class="cert-kpi"><strong>'+valid.filter(x=>x.cloudPublished).length+'</strong><span>publicados online</span></div></div><div class="cert-tabs"><button class="cert-tab '+(tab==='emitir'?'active':'')+'" data-tab="emitir">🎓 Emitir</button><button class="cert-tab '+(tab==='passaportes'?'active':'')+'" data-tab="passaportes">🛂 Passaportes</button><button class="cert-tab '+(tab==='historico'?'active':'')+'" data-tab="historico">🧾 Histórico</button><button class="cert-tab '+(tab==='config'?'active':'')+'" data-tab="config">⚙️ Configuração</button></div><div id="certBody"></div></section>';
  host.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{tab=b.dataset.tab;shell();renderBody();});renderBody();
 }
 function renderBody(){const body=host.querySelector('#certBody');if(tab==='emitir')renderIssue(body);else if(tab==='passaportes')renderPassports(body);else if(tab==='historico')renderHistory(body);else renderConfig(body);}
 function renderIssue(body){
  const events=read('eventos').filter(e=>eligibleForEvent(e).length).sort((a,b)=>String(b.dataInicio||b.data||'').localeCompare(String(a.dataInicio||a.data||'')));if(!selectedEvent)selectedEvent=events[0]?.id||'';
  body.innerHTML='<div class="cert-panel"><div class="cert-help"><strong>Regra:</strong> somente participantes com presença registrada podem receber certificado.</div><div class="cert-grid"><label>Evento<select id="certEvent">'+(events.length?events.map(e=>'<option value="'+e.id+'" '+(e.id===selectedEvent?'selected':'')+'>'+fmtDate(e.dataInicio||e.data)+' • '+esc(e.nome)+'</option>').join(''):'<option value="">Nenhum evento com presença</option>')+'</select></label><label>Carga horária personalizada (minutos)<input id="certMinutes" type="number" min="1" placeholder="Vazio = calcular pelo evento"></label></div><div id="eligibleHost"></div></div>';
  const select=body.querySelector('#certEvent');select.onchange=()=>{selectedEvent=select.value;renderEligible();};renderEligible();
  function renderEligible(){
   const box=body.querySelector('#eligibleHost'),event=byId('eventos',selectedEvent);if(!event){box.innerHTML='<p>Nenhuma presença registrada.</p>';return;}const list=eligibleForEvent(event);
   box.innerHTML='<div class="cert-actions" style="justify-content:flex-start"><button class="btn ghost" id="selectAll">Selecionar todos</button><button class="btn primary" id="issueSelected">Emitir selecionados</button></div><div class="eligible-list">'+list.map(p=>{const c=certFor(event.id,p);return '<label class="eligible-item"><input type="checkbox" data-person="'+esc(p.key)+'" '+(c?'disabled':'')+'><div><strong>'+esc(p.name)+'</strong><small>'+esc(p.institution||p.type)+'</small></div><div>'+(c?'<span class="cert-status">Já emitido</span>':'Elegível')+'</div></label>';}).join('')+'</div>';
   box.querySelector('#selectAll').onclick=()=>box.querySelectorAll('[data-person]:not(:disabled)').forEach(x=>x.checked=true);
   box.querySelector('#issueSelected').onclick=()=>{const keys=[...box.querySelectorAll('[data-person]:checked')].map(x=>x.dataset.person);if(!keys.length){alert('Selecione ao menos um participante.');return;}const mins=Number(body.querySelector('#certMinutes').value)||0,issued=[];keys.forEach(k=>{const p=list.find(x=>x.key===k);if(p){const c=issue(event,p,mins);issued.push(c);maybePublish(c);}});renderEligible();if(issued.length&&confirm(issued.length+' certificado(s) emitido(s). Abrir o primeiro para impressão?'))printCertificate(issued[0]);};
  }
 }
 function renderPassports(body){
  const list=passports();body.innerHTML='<div class="cert-panel"><div class="cert-help">O passaporte é montado automaticamente pelas presenças registradas.</div><input id="passportSearch" type="search" placeholder="Pesquisar participante..." style="width:100%;padding:10px"><div id="passportList" class="passport-list"></div></div>';
  const draw=()=>{const q=body.querySelector('#passportSearch').value.toLowerCase(),rows=list.filter(x=>!q||x.name.toLowerCase().includes(q));body.querySelector('#passportList').innerHTML=rows.map(p=>'<article class="passport-card"><div><strong>'+esc(p.name)+'</strong><small>'+esc(p.institution||'')+' • '+p.actions.length+' participação(ões) • '+esc(workloadLabel(p.minutes))+'</small><div class="passport-progress"><span style="width:'+Math.min(100,p.actions.length*10)+'%"></span></div><div>'+badges(p).map(x=>'<span class="badge-pill">'+esc(x)+'</span>').join('')+'</div></div><div><button class="btn ghost small" data-pass="'+esc(p.key)+'">Imprimir passaporte</button></div></article>').join('')||'<p>Nenhum passaporte.</p>';body.querySelectorAll('[data-pass]').forEach(b=>b.onclick=()=>printPassport(list.find(x=>x.key===b.dataset.pass)));};body.querySelector('#passportSearch').oninput=draw;draw();
 }
 function renderHistory(body){
  const all=certs();body.innerHTML='<div class="cert-panel"><div class="cert-actions" style="justify-content:flex-start"><input id="certSearch" type="search" placeholder="Código ou participante..." style="flex:1;min-width:220px"><button class="btn ghost" id="publishPending" '+(cloudConfigured()&&hasCloudSession()?'':'disabled')+'>Publicar validações pendentes</button></div><div id="certHistory" class="cert-history"></div></div>';
  const draw=()=>{const q=body.querySelector('#certSearch').value.toLowerCase(),rows=all.filter(c=>!q||c.code.toLowerCase().includes(q)||c.participantName.toLowerCase().includes(q));body.querySelector('#certHistory').innerHTML=rows.map(c=>'<article class="cert-row"><div><strong>'+esc(c.participantName)+'</strong><small>'+esc(c.activityName)+' • '+esc(c.eventDateLabel)+' • '+esc(c.code)+'</small><span class="cert-status '+(c.status==='Revogado'?'revogado':'')+'">'+esc(c.status)+'</span> '+(c.cloudPublished?'<span class="badge-pill green">online</span>':'<span class="badge-pill">local</span>')+'</div><div class="cert-actions"><button class="btn ghost small" data-print="'+c.id+'">Imprimir</button>'+(c.status!=='Revogado'?'<button class="btn danger small" data-revoke="'+c.id+'">Revogar</button>':'')+'</div></article>').join('')||'<p>Nenhum certificado emitido.</p>';body.querySelectorAll('[data-print]').forEach(b=>b.onclick=()=>printCertificate(all.find(c=>c.id===b.dataset.print)));body.querySelectorAll('[data-revoke]').forEach(b=>b.onclick=async()=>{if(!confirm('Revogar este certificado?'))return;const c=all.find(x=>x.id===b.dataset.revoke);c.status='Revogado';c.revokedAt=new Date().toISOString();write('certificados',all);if(c.cloudPublished)try{await revokeCertificateCloud(c.code);}catch{}shell();});};
  body.querySelector('#certSearch').oninput=draw;body.querySelector('#publishPending').onclick=async()=>{const pending=certs().filter(x=>x.status!=='Revogado'&&!x.cloudPublished);let n=0;for(const c of pending)if(await maybePublish(c))n++;alert(n+' certificado(s) publicado(s).');shell();};draw();
 }
 function renderConfig(body){
  const p=prefs();body.innerHTML='<div class="cert-panel"><div class="cert-help"><strong>Assinatura institucional configurável.</strong></div><div class="cert-grid"><label>Responsável / autoridade<input id="cfgSign" value="'+esc(p.signatory||'')+'"></label><label>Cargo / função<input id="cfgRole" value="'+esc(p.role||'')+'"></label><label>Cidade / UF<input id="cfgCity" value="'+esc(p.city||'')+'"></label></div><div class="cert-actions"><button class="btn primary" id="saveCfg">Salvar configuração</button></div></div>';body.querySelector('#saveCfg').onclick=()=>{savePrefs({signatory:body.querySelector('#cfgSign').value.trim(),role:body.querySelector('#cfgRole').value.trim(),city:body.querySelector('#cfgCity').value.trim()});alert('Configuração salva.');};
 }
 shell();
}

export function renderPassaporteCertificados(host){
 host.innerHTML='<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px"><button type="button" class="btn" data-mode="school">Por escola e turma</button><button type="button" class="btn" data-mode="event">Por evento / passaporte</button></div><div data-certificate-content></div>';
 const content=host.querySelector('[data-certificate-content]');
 function show(mode){
  const frame=document.createElement('div');content.replaceChildren(frame);
  host.querySelectorAll('[data-mode]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.mode===mode)));
  if(mode==='event')renderLegacyPassaporteCertificados(frame);
  else renderCustomCertificates(frame).catch(error=>{frame.textContent='Não foi possível abrir os certificados: '+error.message;});
 }
 host.querySelectorAll('[data-mode]').forEach(button=>button.addEventListener('click',()=>show(button.dataset.mode)));
 show('school');
}
