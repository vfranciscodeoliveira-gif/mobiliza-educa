import {connectParticipant,normalizeCode} from '../core/sharedSession.js?v=1';
import {SoundManager} from '../core/soundManager.js?v=1';

const STICKERS=['🚶','🚸','🚦','🛑','🚗','🚌','🚲','🏍️','🏫','🌳','👮','⚠️','❤️','⭐'];
const esc=s=>String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));

function css(){
 if(document.getElementById('atelier-participant-css'))return;
 const s=document.createElement('style');s.id='atelier-participant-css';
 s.textContent=[
 'body.atelier-participant-open{overflow:hidden;background:#eef5f8}',
 '.atp{position:fixed;inset:0;z-index:100000;background:#eef5f8;overflow:auto;color:#173f60;padding:10px}.atp *{box-sizing:border-box}',
 '.atp-shell{width:min(980px,100%);margin:auto;display:grid;gap:10px}.atp-brand{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:15px;background:#0b3c64;color:#fff}.atp-brand img{width:42px;height:42px;border-radius:10px}.atp-brand h1{margin:0;font-size:1rem}.atp-brand p{margin:2px 0 0;color:#bfe7fa;font-size:.72rem}.atp-code{margin-left:auto;background:#fff;color:#0f3c66;padding:7px 9px;border-radius:10px;font-weight:1000;letter-spacing:.12em}',
 '.atp-card{background:#fff;border:1px solid #d8e6ee;border-radius:17px;padding:15px;box-shadow:0 8px 24px rgba(15,60,102,.07)}.atp-card h2{margin:0 0 6px;color:#0f3c66}.atp-card p{color:#607788;line-height:1.45}',
 '.atp-form{display:grid;gap:11px;max-width:520px;margin:auto}.atp-form label{display:grid;gap:5px;font-size:.8rem;font-weight:900}.atp-form input{padding:13px;border:1px solid #cbdce6;border-radius:11px;font-size:1rem}',
 '.atp-btn{min-height:46px;border:0;border-radius:12px;background:#1688b7;color:#fff;font-weight:1000;cursor:pointer;padding:10px 14px}.atp-btn.secondary{background:#edf5f9;color:#0f3c66;border:1px solid #d3e2ea}.atp-btn.danger{background:#b64040}.atp-btn:disabled{opacity:.5}',
 '.atp-status{text-align:center;padding:34px 14px}.atp-status .big{font-size:3rem}.atp-status h2{margin:8px 0}.atp-challenge{padding:13px;border-radius:14px;background:#eef8fc;border:1px solid #d4e5ed}.atp-challenge h2{font-size:1.1rem;margin:0 0 4px}.atp-challenge p{margin:0}.atp-chip{display:inline-flex;margin-top:7px;padding:5px 8px;border-radius:999px;background:#eaf5fa;color:#0f668f;font-size:.72rem;font-weight:900}',
 '.atp-workspace{display:grid;grid-template-columns:220px minmax(0,1fr);gap:10px}.atp-tools{display:grid;gap:8px;align-content:start}.atp-mode{display:grid;grid-template-columns:1fr 1fr;gap:6px}.atp-mode button.active{background:#0f3c66;color:#fff}.atp-tools label{display:grid;gap:4px;font-size:.74rem;font-weight:900}.atp-color{display:grid;grid-template-columns:repeat(5,1fr);gap:6px}.atp-color button{height:38px;border:2px solid #fff;outline:1px solid #cbdbe5;border-radius:9px}.atp-color button.active{outline:3px solid #1688b7}',
 '.atp-stickers{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}.atp-stickers button{height:44px;border:1px solid #d7e5ed;border-radius:10px;background:#fff;font-size:1.4rem}.atp-stickers button.active{border:2px solid #1688b7;background:#eef9fd}',
 '.atp-canvas-box{border:1px solid #cfdde6;border-radius:14px;background:#fff;overflow:hidden;touch-action:none}.atp-canvas-box canvas{display:block;width:100%;height:auto;aspect-ratio:3/2;background:#fff;touch-action:none}.atp-hint{text-align:center;font-size:.72rem;color:#6f8290;margin-top:4px}',
 '.atp-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:8px}.atp-actions button{flex:1;min-width:115px}.atp-submit{margin-top:9px;padding:12px;border:1px solid #d7e5ed;border-radius:13px;background:#fff}.atp-submit h3{margin:0 0 5px}.atp-msg{margin-top:8px;padding:9px;border-radius:10px;background:#eef6fa;color:#315d76}.atp-msg.ok{background:#e7f7ed;color:#17643a}.atp-msg.bad{background:#fff0ef;color:#8d302c}',
 '.atp-winner{text-align:center}.atp-winner img{width:min(100%,760px);max-height:58vh;object-fit:contain;border-radius:16px;border:1px solid #d8e6ee;background:#fff}.atp-winner h2{font-size:clamp(1.5rem,5vw,2.3rem);margin:10px 0 4px}.atp-score{display:inline-block;padding:7px 10px;border-radius:999px;background:#fff2cc;color:#705300;font-weight:1000}',
 '.atp-footer{text-align:center;font-size:.7rem;color:#758b99}.atp-exit{border:0;background:none;color:#456678;text-decoration:underline;cursor:pointer}',
 '@media(max-width:760px){.atp{padding:6px}.atp-workspace{grid-template-columns:1fr}.atp-tools{order:2}.atp-canvas-wrap{order:1}.atp-stickers{grid-template-columns:repeat(7,1fr)}.atp-actions{position:sticky;bottom:0;background:#eef5f8;padding:6px 0}}',
 '@media(max-width:430px){.atp-stickers{grid-template-columns:repeat(4,1fr)}.atp-color{grid-template-columns:repeat(5,1fr)}}'
 ].join('');
 document.head.appendChild(s);
}

export function openAtelierParticipant(rawCode){
 css();const code=normalizeCode(rawCode);if(!code)return false;
 document.body.classList.add('atelier-participant-open');
 const root=document.createElement('div');root.className='atp';root.id='atelierParticipant';document.body.appendChild(root);
 let client=null,name=localStorage.getItem('mobiliza.atelier.name')||'',team=localStorage.getItem('mobiliza.atelier.team')||'',state=null,closing=false;
 let mode='draw',color='#173f60',width=8,eraser=false,sticker=STICKERS[0],ops=[],current=null;
 const W=900,H=600;

 const shell=body=>'<div class="atp-shell"><div class="atp-brand"><img src="assets/icon-192.webp?v=9" alt=""><div><h1>MOBILIZA EDUCA</h1><p>Ateliê do Trânsito</p></div><span class="atp-code">'+esc(code)+'</span></div>'+body+'<div class="atp-footer">Sessão criativa ao vivo • <button class="atp-exit" id="atpExit">sair</button></div></div>';
 const bindExit=()=>root.querySelector('#atpExit')?.addEventListener('click',()=>{if(!confirm('Sair desta atividade?'))return;closing=true;try{client&&client.close();}catch{}const u=new URL(location.href);u.searchParams.delete('atelier');location.href=u.pathname+u.search+u.hash;});

 function join(error=''){
  root.innerHTML=shell('<section class="atp-card"><div class="atp-form"><div style="text-align:center"><div style="font-size:2.5rem">🎨</div><h2>Entrar no Ateliê do Trânsito</h2><p>Desenhe ou faça uma colagem e envie seu trabalho para a atividade.</p></div><label>Nome ou apelido<input id="atpName" maxlength="40" value="'+esc(name)+'"></label><label>Turma / equipe (opcional)<input id="atpTeam" maxlength="40" value="'+esc(team)+'"></label>'+(error?'<div class="atp-msg bad">'+esc(error)+'</div>':'')+'<button class="atp-btn" id="atpJoin">Entrar na sessão</button></div></section>');bindExit();
  root.querySelector('#atpJoin').onclick=()=>{name=root.querySelector('#atpName').value.trim();team=root.querySelector('#atpTeam').value.trim();if(!name){root.querySelector('#atpName').focus();return;}localStorage.setItem('mobiliza.atelier.name',name);localStorage.setItem('mobiliza.atelier.team',team);connect();};
 }
 function waiting(text='Você entrou. Aguarde o educador abrir os envios.'){root.innerHTML=shell('<section class="atp-card atp-status"><div class="big">🎨</div><h2>Ateliê conectado!</h2><p>'+esc(text)+'</p><span class="atp-chip">👤 '+esc(name)+(team?' • '+esc(team):'')+'</span></section>');bindExit();}
 function connecting(){root.innerHTML=shell('<section class="atp-card atp-status"><div class="big">📡</div><h2>Conectando...</h2><p>Procurando a sessão do educador.</p></section>');bindExit();}
 function drawScene(){
  const c=root.querySelector('#atpCanvas');if(!c)return;const x=c.getContext('2d');x.clearRect(0,0,W,H);x.fillStyle='#fff';x.fillRect(0,0,W,H);
  x.save();x.strokeStyle='#eef2f4';x.lineWidth=1;for(let i=0;i<W;i+=60){x.beginPath();x.moveTo(i,0);x.lineTo(i,H);x.stroke()}for(let j=0;j<H;j+=60){x.beginPath();x.moveTo(0,j);x.lineTo(W,j);x.stroke()}x.restore();
  ops.forEach(o=>{if(o.type==='stroke'){x.save();x.lineCap='round';x.lineJoin='round';x.lineWidth=o.width;x.globalCompositeOperation=o.erase?'destination-out':'source-over';x.strokeStyle=o.color;x.beginPath();o.points.forEach((p,i)=>i?x.lineTo(p.x,p.y):x.moveTo(p.x,p.y));x.stroke();x.restore();}else{x.save();x.textAlign='center';x.textBaseline='middle';x.font='72px "Segoe UI Emoji","Apple Color Emoji",sans-serif';x.fillText(o.char,o.x,o.y);x.restore();}});
 }
 const point=(e,c)=>{const r=c.getBoundingClientRect();return{x:clamp((e.clientX-r.left)*W/r.width,0,W),y:clamp((e.clientY-r.top)*H/r.height,0,H)};};

 function workspace(){
  root.innerHTML=shell('<section class="atp-challenge"><h2>'+esc(state.challenge?.title||'Desafio criativo')+'</h2><p>'+esc(state.challenge?.text||'Crie uma cena de trânsito segura.')+'</p><span class="atp-chip">✋ trabalho autoral</span></section><section class="atp-workspace"><aside class="atp-card atp-tools"><div class="atp-mode"><button class="atp-btn secondary '+(mode==='draw'?'active':'')+'" id="atpDrawMode">✍️ Desenho</button><button class="atp-btn secondary '+(mode==='collage'?'active':'')+'" id="atpCollageMode">🧩 Colagem</button></div><div id="atpDrawTools" '+(mode==='draw'?'':'hidden')+'><label>Espessura<input id="atpWidth" type="range" min="2" max="32" value="'+width+'"></label><div class="atp-color">'+['#173f60','#e74c3c','#f39c12','#27ae60','#2980b9','#8e44ad','#111111','#ffffff','#795548','#ff69b4'].map(c=>'<button type="button" data-color="'+c+'" style="background:'+c+'" class="'+(c===color?'active':'')+'"></button>').join('')+'</div><button class="atp-btn secondary" id="atpEraser">'+(eraser?'🧽 Borracha ativa':'🧽 Borracha')+'</button></div><div id="atpCollageTools" '+(mode==='collage'?'':'hidden')+'><label>Figurinhas</label><div class="atp-stickers">'+STICKERS.map(x=>'<button type="button" data-sticker="'+x+'" class="'+(x===sticker?'active':'')+'">'+x+'</button>').join('')+'</div></div><button class="atp-btn danger" id="atpClear">Limpar tela</button></aside><div class="atp-canvas-wrap"><div class="atp-canvas-box"><canvas id="atpCanvas" width="'+W+'" height="'+H+'"></canvas></div><div class="atp-hint">'+(mode==='draw'?'Desenhe com o dedo, mouse ou caneta digital.':'Escolha uma figurinha e toque no local onde ela deve aparecer.')+'</div><div class="atp-submit"><h3>Quando terminar</h3><p>Envie para a galeria. Você poderá reenviar enquanto os envios estiverem abertos.</p><div class="atp-actions"><button class="atp-btn" id="atpSubmit">Enviar trabalho</button></div><div id="atpMsg"></div></div></div></section>');bindExit();bindWorkspace();drawScene();
 }
 function bindWorkspace(){
  const c=root.querySelector('#atpCanvas');
  root.querySelector('#atpDrawMode').onclick=()=>{mode='draw';workspace()};root.querySelector('#atpCollageMode').onclick=()=>{mode='collage';workspace()};
  root.querySelector('#atpWidth')?.addEventListener('input',e=>width=+e.target.value);
  root.querySelectorAll('[data-color]').forEach(b=>b.onclick=()=>{color=b.dataset.color;eraser=false;workspace()});
  root.querySelector('#atpEraser')?.addEventListener('click',()=>{eraser=!eraser;workspace()});
  root.querySelectorAll('[data-sticker]').forEach(b=>b.onclick=()=>{sticker=b.dataset.sticker;workspace()});
  root.querySelector('#atpClear').onclick=()=>{if(confirm('Limpar todo o trabalho?')){ops=[];drawScene()}};
  root.querySelector('#atpSubmit').onclick=submit;
  c.addEventListener('pointerdown',e=>{e.preventDefault();c.setPointerCapture(e.pointerId);const p=point(e,c);if(mode==='collage'){ops.push({type:'sticker',char:sticker,x:p.x,y:p.y});drawScene();return;}current={type:'stroke',color,width,erase:eraser,points:[p]};ops.push(current);drawScene();});
  c.addEventListener('pointermove',e=>{if(!current||!c.hasPointerCapture(e.pointerId))return;current.points.push(point(e,c));drawScene();});
  const end=e=>{current=null;try{c.releasePointerCapture(e.pointerId)}catch{}};c.addEventListener('pointerup',end);c.addEventListener('pointercancel',end);
 }
 function msg(text,type=''){const b=root.querySelector('#atpMsg');if(b)b.innerHTML='<div class="atp-msg '+type+'">'+esc(text)+'</div>';}
 function submit(){
  if(!ops.length){msg('Crie algo antes de enviar.','bad');return;}const c=root.querySelector('#atpCanvas');drawScene();const image=c.toDataURL('image/jpeg',.82);root.querySelector('#atpSubmit').disabled=true;msg('Enviando para a galeria...');client.send({type:'atelier-submit',work:{name,team,mode:mode==='collage'?'colagem':'desenho',image}});
 }
 function winner(data){
  const w=data.work||{};root.innerHTML=shell('<section class="atp-card atp-winner"><p class="eyebrow">🏆 '+esc(data.label||'TRABALHO DESTAQUE')+'</p><h2>'+esc(data.challenge||'Ateliê do Trânsito')+'</h2><img src="'+(w.image||'')+'" alt="Trabalho destaque"><h2>'+esc(w.name||'Participante')+'</h2><p>'+esc(w.team||'')+'</p>'+(w.score?'<span class="atp-score">'+esc(w.score)+'/100</span>':'')+'<p>Parabéns! O mais importante é transformar criatividade em atitudes mais seguras.</p></section>');bindExit();SoundManager.play('celebrate');
 }
 function closed(){root.innerHTML=shell('<section class="atp-card atp-status"><div class="big">🏁</div><h2>Atividade encerrada</h2><p>Obrigado por participar.</p><button class="atp-btn secondary" id="atpDone">Voltar ao Mobiliza Educa</button></section>');bindExit();root.querySelector('#atpDone').onclick=()=>{const u=new URL(location.href);u.searchParams.delete('atelier');location.href=u.pathname+u.search+u.hash;};}
 function onMessage(data){
  if(!data||typeof data!=='object')return;
  if(data.type==='atelier-state'){state=data;state.accepting?workspace():waiting('O educador ainda não abriu os envios.');return;}
  if(data.type==='atelier-submit-ack'){const b=root.querySelector('#atpSubmit');if(b)b.disabled=false;msg(data.message||'Trabalho recebido.',data.ok?'ok':'bad');return;}
  if(data.type==='atelier-submission-status'){msg(data.status==='approved'?'✅ Seu trabalho foi aprovado para a galeria.':'Seu trabalho voltou para moderação.',data.status==='approved'?'ok':'');return;}
  if(data.type==='atelier-winner'){winner(data);return;}
  if(data.type==='session-finished'||data.type==='session-closed'){closed();return;}
 }
 async function connect(){
  connecting();
  try{client=await connectParticipant(code,name,{onMessage,onStatus:s=>{if((s.type==='closed'||s.type==='disconnected')&&!closing)setTimeout(()=>join('A conexão foi encerrada. Tente novamente.'),500);}});client.send({type:'atelier-ready'});waiting();}
  catch(e){try{client&&client.close()}catch{}client=null;join(e.message||'Não foi possível entrar na sessão.');}
 }
 join();return true;
}
