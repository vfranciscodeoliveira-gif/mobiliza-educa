import {createHostSession,renderQr,makeSessionCode} from '../core/sharedSession.js?v=1';
import {SoundManager} from '../core/soundManager.js?v=1';

const CHALLENGES=[
 {title:'Travessia segura em frente à escola',text:'Crie uma cena mostrando uma travessia segura em frente à escola.'},
 {title:'Uma rua segura para todos',text:'Mostre pedestres, ciclistas e veículos convivendo com segurança.'},
 {title:'Área escolar segura',text:'Monte ou desenhe uma área escolar com comportamentos e sinalização segura.'},
 {title:'O trânsito que eu gostaria de ver',text:'Mostre como seria um trânsito mais humano, organizado e seguro.'}
];
const esc=s=>String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
function nextChallenge(){
 try{
  const key='mobiliza.atelier.challengeIndex',last=Number(localStorage.getItem(key));
  const next=Number.isFinite(last)?(last+1)%CHALLENGES.length:Math.floor(Math.random()*CHALLENGES.length);
  localStorage.setItem(key,String(next));return CHALLENGES[next];
 }catch{return CHALLENGES[Math.floor(Math.random()*CHALLENGES.length)];}
}

function css(){
 if(document.getElementById('atelier-host-css'))return;
 const s=document.createElement('style');s.id='atelier-host-css';
 s.textContent=[
 '#gameDialog.atelier-open{width:min(1250px,97vw)!important;max-width:97vw!important;max-height:95vh!important}',
 '#gameDialog.atelier-open>.dialog-shell{max-height:95vh!important;overflow:auto!important;background:#eef5f9!important}',
 '.ath{padding:22px;color:#173f60}.ath *{box-sizing:border-box}.ath h2,.ath h3{color:#0f3c66}',
 '.ath-head{padding:20px;border-radius:18px;background:linear-gradient(135deg,#0f3c66,#168bb7);color:#fff;margin-bottom:14px}.ath-head h2{color:#fff;margin:4px 0 7px;font-size:2rem}.ath-head p{color:#e0f4fb;margin:0;line-height:1.5}',
 '.ath-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.ath-card{padding:16px;border:1px solid #d9e7ef;border-radius:16px;background:#fff}',
 '.ath-card label{display:grid;gap:5px;margin:10px 0;font-size:.8rem;font-weight:900}.ath-card select,.ath-card textarea{width:100%;padding:11px;border:1px solid #ccdde7;border-radius:11px;font:inherit}',
 '.ath-criteria{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:14px 0}.ath-criteria div{padding:10px;border-radius:12px;background:#f7fbfd;border:1px solid #dce8ef}.ath-criteria strong,.ath-criteria small{display:block}.ath-criteria small{color:#738895;margin-top:3px}',
 '.ath-session{display:grid;grid-template-columns:260px 1fr;gap:14px}.ath-qr{text-align:center}.ath-code{font-size:1.6rem;font-weight:1000;letter-spacing:.16em;color:#0f3c66;margin-top:8px}',
 '.ath-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.ath-stat{padding:12px;border:1px solid #dce8ef;border-radius:13px;background:#fff}.ath-stat span,.ath-stat strong{display:block}.ath-stat span{font-size:.68rem;color:#7b8d99;text-transform:uppercase;font-weight:900}.ath-stat strong{font-size:1.5rem;color:#0b5f8a}',
 '.ath-challenge{margin-top:10px;padding:13px;border-radius:13px;background:#eef8fc;border:1px solid #d4e6ef}.ath-challenge h3{margin:0 0 5px}.ath-challenge p{margin:0;color:#607788}',
 '.ath-actions{display:flex;gap:7px;flex-wrap:wrap;margin:12px 0}.ath-gallery{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}',
 '.ath-work{overflow:hidden;border:1px solid #d7e5ed;border-radius:15px;background:#fff}.ath-work img{width:100%;aspect-ratio:4/3;object-fit:contain;background:#f6f9fb}.ath-work-body{padding:11px}.ath-work-body h4{margin:0 0 4px}.ath-meta{font-size:.75rem;color:#738895}.ath-score{display:inline-block;padding:5px 8px;border-radius:999px;background:#eef6fa;color:#0f648d;font-weight:1000}.ath-pending{background:#fff2d6;color:#7a4d00}',
 '.ath-work-actions{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:8px}.ath-work-actions .btn{width:100%}',
 '.ath-eval{max-width:820px;margin:auto}.ath-eval-layout{display:grid;grid-template-columns:320px 1fr;gap:14px}.ath-eval img{width:100%;border-radius:14px;border:1px solid #d8e6ee}.ath-range{margin:10px 0}.ath-range label{display:flex;justify-content:space-between}.ath-range input{width:100%}.ath-total{padding:11px;border-radius:12px;background:#eaf6fb;text-align:center}.ath-total strong{font-size:1.8rem;color:#0f648d}',
 '.ath-stage{text-align:center}.ath-stage img{width:min(100%,900px);max-height:62vh;object-fit:contain;border-radius:16px;background:#fff;border:1px solid #d8e6ee}.ath-stage h2{font-size:2rem;margin:10px 0 4px}',
 '.ath-empty{grid-column:1/-1;padding:30px;text-align:center;border:2px dashed #cddde6;border-radius:15px;color:#6e8290}',
 '@media(max-width:900px){.ath-grid,.ath-session,.ath-eval-layout{grid-template-columns:1fr}.ath-gallery{grid-template-columns:repeat(2,1fr)}}',
 '@media(max-width:620px){#gameDialog.atelier-open{width:100vw!important;max-width:100vw!important;height:100dvh!important;max-height:100dvh!important;margin:0!important;border-radius:0!important}.ath{padding:13px}.ath-gallery,.ath-criteria,.ath-stats{grid-template-columns:1fr}.ath-work-actions{grid-template-columns:1fr}}'
 ].join('');
 document.head.appendChild(s);
}
function joinUrl(code){const u=new URL(location.href);u.search='';u.hash='';u.searchParams.set('atelier',code);return u.toString();}
function saveHighlight(w,challenge){
 try{const k='mobiliza.atelier.highlights',a=JSON.parse(localStorage.getItem(k)||'[]');a.unshift({id:w.id,name:w.name,team:w.team,score:w.score,image:w.image,challenge:challenge.title,at:new Date().toISOString()});localStorage.setItem(k,JSON.stringify(a.slice(0,6)));}catch{}
}
export function openAtelier(dialog,host,onFinish){
 css();dialog.classList.add('atelier-open');
 let session=null,participants=[],works=[],challenge=nextChallenge(),accepting=false,closed=false;
 const uploads=new Map();
 const cleanup=()=>{if(closed)return;closed=true;try{session&&session.close();}catch{}dialog.classList.remove('atelier-open');};
 dialog.addEventListener('close',cleanup,{once:true});

 function setup(){
  host.innerHTML='<section class="ath"><div class="ath-head"><p class="eyebrow">MOBILIZA EDUCA • EXPERIÊNCIA CRIATIVA</p><h2>🎨 Ateliê do Trânsito</h2><p>Desenho livre e colagem pelo celular, galeria moderada, avaliação pedagógica e destaque no telão.</p></div><div class="ath-grid"><div class="ath-card"><h3>Configurar desafio</h3><p style="margin:0 0 8px;color:#607788">🔄 O tema inicial muda automaticamente a cada nova sessão aberta.</p><label>Proposta<select id="athChallenge">'+CHALLENGES.map((x,i)=>'<option value="'+i+'" '+(x===challenge?'selected':'')+'>'+esc(x.title)+'</option>').join('')+'<option value="custom">Personalizado</option></select></label><label id="athCustomWrap" hidden>Texto do desafio<textarea id="athCustom" rows="4"></textarea></label><button class="btn primary" id="athCreate">Criar sessão e QR Code</button></div><div class="ath-card"><h3>Critérios de avaliação</h3><div class="ath-criteria"><div><strong>40%</strong><small>Fidelidade ao desafio</small></div><div><strong>30%</strong><small>Segurança no trânsito</small></div><div><strong>20%</strong><small>Criatividade</small></div><div><strong>10%</strong><small>Clareza da mensagem</small></div></div><p>O nome do participante fica oculto durante a avaliação. O sistema calcula uma nota ponderada de 0 a 100.</p></div></div></section>';
  const sel=host.querySelector('#athChallenge'),wrap=host.querySelector('#athCustomWrap');
  sel.onchange=()=>wrap.hidden=sel.value!=='custom';
  host.querySelector('#athCreate').onclick=async()=>{
   if(sel.value==='custom'){const t=host.querySelector('#athCustom').value.trim();if(t.length<8){alert('Descreva o desafio.');return;}challenge={title:'Desafio criativo',text:t};}else challenge=CHALLENGES[Number(sel.value)||0];
   await createSession();
  };
 }
 async function createSession(){
  host.innerHTML='<section class="ath"><div class="ath-card" style="text-align:center"><h2>Preparando sessão...</h2><p>Gerando o QR Code para os participantes.</p></div></section>';
  try{
   session=await createHostSession({code:makeSessionCode(),onParticipants:l=>{participants=l;render();},onMessage:msg=>handle(msg)});
   render();
  }catch(e){host.innerHTML='<section class="ath"><div class="ath-card"><h2>Não foi possível criar a sessão</h2><p>'+esc(e.message)+'</p><button class="btn primary" id="athRetry">Tentar novamente</button></div></section>';host.querySelector('#athRetry').onclick=setup;}
 }
 function receiveWork(clientId,w,participant){
  if(!accepting){session.sendTo(clientId,{type:'atelier-submit-ack',ok:false,message:'Os envios estão encerrados.'});return;}
  const img=String(w.image||'');
  if(!img.startsWith('data:image/')||img.length>900000){session.sendTo(clientId,{type:'atelier-submit-ack',ok:false,message:'Imagem inválida ou muito grande. Tente reenviar.'});return;}
  const old=works.find(x=>x.clientId===clientId),row={id:old?old.id:'W'+Date.now().toString(36),clientId,name:String(w.name||participant?.name||'Participante').slice(0,40),team:String(w.team||'').slice(0,40),mode:String(w.mode||'desenho').slice(0,20),image:img,status:old?old.status:'pending',score:old?old.score:0,scores:old?old.scores:null};
  if(old)Object.assign(old,row);else works.unshift(row);
  session.sendTo(clientId,{type:'atelier-submit-ack',ok:true,message:'✅ Trabalho recebido na galeria!'});
  SoundManager.play('correct');render();
 }
 function handle(msg){
  const data=msg.data||{},clientId=msg.clientId;
  if(data.type==='participant-ready'||data.type==='atelier-ready'){session.sendTo(clientId,{type:'atelier-state',challenge,accepting});return;}
  if(data.type==='atelier-submit'){receiveWork(clientId,data.work||{},msg.participant);return;}
  if(data.type==='atelier-submit-start'){
   if(!accepting){session.sendTo(clientId,{type:'atelier-submit-ack',ok:false,message:'Os envios estão encerrados.'});return;}
   const total=Math.max(1,Math.min(100,Number(data.total)||0)),uploadId=String(data.uploadId||'').slice(0,80);
   if(!uploadId||!total){session.sendTo(clientId,{type:'atelier-submit-ack',ok:false,message:'Falha ao iniciar o envio.'});return;}
   uploads.set(clientId,{uploadId,total,chunks:new Array(total),received:0,meta:{name:String(data.name||'').slice(0,40),team:String(data.team||'').slice(0,40),mode:String(data.mode||'desenho').slice(0,20)}});
   session.sendTo(clientId,{type:'atelier-upload-ready',uploadId,total});return;
  }
  if(data.type==='atelier-submit-chunk'){
   const up=uploads.get(clientId);if(!up||up.uploadId!==String(data.uploadId||''))return;
   const i=Number(data.index);if(!Number.isInteger(i)||i<0||i>=up.total)return;
   const chunk=String(data.chunk||'');if(chunk.length>20000)return;
   if(typeof up.chunks[i]!=='string'){up.chunks[i]=chunk;up.received++;}
   if(up.received%5===0||up.received===up.total)session.sendTo(clientId,{type:'atelier-upload-progress',uploadId:up.uploadId,received:up.received,total:up.total});
   return;
  }
  if(data.type==='atelier-submit-end'){
   const up=uploads.get(clientId);if(!up||up.uploadId!==String(data.uploadId||''))return;
   uploads.delete(clientId);
   if(up.received!==up.total||up.chunks.some(x=>typeof x!=='string')){session.sendTo(clientId,{type:'atelier-submit-ack',ok:false,message:'O envio ficou incompleto. Toque em enviar novamente.'});return;}
   receiveWork(clientId,{...up.meta,image:up.chunks.join('')},msg.participant);
  }
 }
 function render(){
  if(!session||closed)return;
  const approved=works.filter(x=>x.status==='approved'),best=approved.filter(x=>x.score>0).sort((a,b)=>b.score-a.score)[0];
  host.innerHTML='<section class="ath"><div class="ath-head"><p class="eyebrow">SESSÃO AO VIVO</p><h2>'+esc(challenge.title)+'</h2><p>'+esc(challenge.text)+'</p></div><div class="ath-session"><div class="ath-card ath-qr"><div id="athQr"></div><div class="ath-code">'+esc(session.code)+'</div><small>Escaneie o QR Code com o celular.</small></div><div><div class="ath-stats"><div class="ath-stat"><span>Participantes</span><strong>'+participants.length+'</strong></div><div class="ath-stat"><span>Trabalhos</span><strong>'+works.length+'</strong></div><div class="ath-stat"><span>Aprovados</span><strong>'+approved.length+'</strong></div></div><div class="ath-challenge"><h3>Proposta</h3><p>'+esc(challenge.text)+'</p></div><div class="ath-actions"><button class="btn '+(accepting?'danger':'primary')+'" id="athToggle">'+(accepting?'Encerrar envios':'Abrir envios')+'</button><button class="btn primary" id="athBest" '+(best?'':'disabled')+'>🏆 Exibir melhor avaliado</button><button class="btn ghost" id="athClose">Encerrar sessão</button></div></div></div><h3>Galeria da atividade</h3><div class="ath-gallery">'+(works.length?works.map(card).join(''):'<div class="ath-empty">🎨 Aguardando desenhos e colagens enviados pelos celulares.</div>')+'</div></section>';
  const q=host.querySelector('#athQr');if(q)renderQr(q,joinUrl(session.code),210).catch(()=>q.textContent='QR indisponível');
  host.querySelector('#athToggle').onclick=()=>{accepting=!accepting;session.broadcast({type:'atelier-state',challenge,accepting});render();};
  host.querySelector('#athBest').onclick=()=>best&&show(best,'Melhor trabalho segundo a avaliação pedagógica');
  host.querySelector('#athClose').onclick=()=>{if(confirm('Encerrar a sessão?')){session.broadcast({type:'session-finished'});cleanup();onFinish&&onFinish();dialog.close();}};
  host.querySelectorAll('[data-approve]').forEach(b=>b.onclick=()=>{const w=works.find(x=>x.id===b.dataset.approve);w.status=w.status==='approved'?'pending':'approved';session.sendTo(w.clientId,{type:'atelier-submission-status',status:w.status});render();});
  host.querySelectorAll('[data-eval]').forEach(b=>b.onclick=()=>evaluate(works.find(x=>x.id===b.dataset.eval)));
  host.querySelectorAll('[data-show]').forEach(b=>b.onclick=()=>show(works.find(x=>x.id===b.dataset.show),'Trabalho em destaque'));
 }
 function card(w){
  return '<article class="ath-work"><img src="'+w.image+'" alt="Trabalho enviado"><div class="ath-work-body"><h4>Trabalho '+esc(w.id.slice(-4).toUpperCase())+'</h4><div class="ath-meta">'+esc(w.mode==='colagem'?'Colagem':'Desenho livre')+'</div><div style="margin:7px 0"><span class="ath-score '+(w.status==='approved'?'':'ath-pending')+'">'+(w.status==='approved'?'Aprovado':'Moderação')+'</span> <span class="ath-score">'+(w.score?w.score+'/100':'sem nota')+'</span></div><div class="ath-work-actions"><button class="btn ghost small" data-approve="'+w.id+'">'+(w.status==='approved'?'Retirar':'Aprovar')+'</button><button class="btn primary small" data-eval="'+w.id+'">Avaliar</button><button class="btn ghost small" data-show="'+w.id+'">Exibir</button></div></div></article>';
 }
 function evaluate(w){
  const s=w.scores||{f:8,s:8,c:8,l:8};
  host.innerHTML='<section class="ath ath-eval"><div class="ath-card"><div class="ath-eval-layout"><img src="'+w.image+'" alt="Trabalho para avaliação"><div><p class="eyebrow">AVALIAÇÃO ÀS CEGAS</p><h2>Trabalho '+esc(w.id.slice(-4).toUpperCase())+'</h2>'+range('f','Fidelidade ao desafio',s.f,40)+range('s','Coerência e segurança',s.s,30)+range('c','Criatividade',s.c,20)+range('l','Clareza da mensagem',s.l,10)+'<div class="ath-total"><span>Nota ponderada</span><strong id="athTotal">0</strong></div><div class="ath-actions"><button class="btn ghost" id="athBack">Voltar</button><button class="btn primary" id="athSave">Salvar avaliação</button></div></div></div></div></section>';
  const calc=()=>{const f=+host.querySelector('#f').value,s=+host.querySelector('#s').value,c=+host.querySelector('#c').value,l=+host.querySelector('#l').value;host.querySelector('#athTotal').textContent=Math.round(f*4+s*3+c*2+l);};
  host.querySelectorAll('input[type=range]').forEach(i=>i.oninput=calc);calc();
  host.querySelector('#athBack').onclick=render;
  host.querySelector('#athSave').onclick=()=>{w.scores={f:+host.querySelector('#f').value,s:+host.querySelector('#s').value,c:+host.querySelector('#c').value,l:+host.querySelector('#l').value};w.score=Math.round(w.scores.f*4+w.scores.s*3+w.scores.c*2+w.scores.l);w.status='approved';session.sendTo(w.clientId,{type:'atelier-submission-status',status:'approved',score:w.score});render();};
 }
 function range(id,label,v,p){return '<div class="ath-range"><label for="'+id+'"><strong>'+esc(label)+' • '+p+'%</strong><span>'+v+'/10</span></label><input id="'+id+'" type="range" min="0" max="10" value="'+v+'"></div>';}
 function show(w,label){
  saveHighlight(w,challenge);session.broadcast({type:'atelier-winner',label,challenge:challenge.title,work:{image:w.image,name:w.name,team:w.team,score:w.score}});
  host.innerHTML='<section class="ath ath-stage"><p class="eyebrow">🏆 '+esc(label.toUpperCase())+'</p><h2>'+esc(challenge.title)+'</h2><img src="'+w.image+'" alt="Trabalho destaque"><h2>'+esc(w.name)+'</h2><p>'+esc(w.team||'Participante')+'</p>'+(w.score?'<span class="ath-score">'+w.score+'/100</span>':'')+'<div class="ath-actions" style="justify-content:center"><button class="btn primary" id="athReturn">Voltar à galeria</button></div></section>';
  host.querySelector('#athReturn').onclick=render;SoundManager.play('celebrate');
 }
 setup();
 if(!dialog.open)dialog.showModal();
 SoundManager.play('open');
}
