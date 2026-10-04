import {connectParticipant,normalizeCode} from '../core/sharedSession.js?v=1';
import {SoundManager} from '../core/soundManager.js?v=1';

const STICKERS=[
 {id:'faixa',label:'Faixa de pedestres',src:'assets/atelier/faixa-pedestres.svg',emoji:'🚸',w:220,h:90},
 {id:'pedestre',label:'Pedestre',src:'assets/memory/pedestre.svg',emoji:'🚶',w:95,h:125},
 {id:'semaforo',label:'Semáforo',src:'assets/memory/semaforo.svg',emoji:'🚦',w:90,h:125},
 {id:'semaforo-pedestre',label:'Semáforo pedestre',src:'assets/atelier/semaforo-pedestre.svg',emoji:'🚶',w:80,h:125},
 {id:'pare',label:'PARE',src:'assets/memory/pare.svg',emoji:'🛑',w:105,h:105},
 {id:'preferencia',label:'Dê a preferência',src:'assets/atelier/de-preferencia.svg',emoji:'🔻',w:110,h:110},
 {id:'velocidade',label:'Velocidade',src:'assets/memory/velocidade.svg',emoji:'50',w:105,h:105},
 {id:'carro',label:'Carro',src:'assets/atelier/carro.svg',emoji:'🚗',w:175,h:90},
 {id:'onibus',label:'Ônibus escolar',src:'assets/atelier/onibus-escolar.svg',emoji:'🚌',w:190,h:100},
 {id:'moto',label:'Motocicleta',src:'assets/atelier/motocicleta.svg',emoji:'🏍️',w:160,h:100},
 {id:'bicicleta',label:'Bicicleta',src:'assets/memory/bicicleta.svg',emoji:'🚲',w:140,h:105},
 {id:'ciclovia',label:'Ciclovia',src:'assets/atelier/ciclovia.svg',emoji:'🚲',w:115,h:115},
 {id:'escola',label:'Escola',src:'assets/memory/escola.svg',emoji:'🏫',w:165,h:125},
 {id:'cone',label:'Cone',src:'assets/atelier/cone.svg',emoji:'🚧',w:75,h:100},
 {id:'agente',label:'Agente de trânsito',src:'assets/atelier/agente-transito.svg',emoji:'👮',w:90,h:125},
 {id:'capacete',label:'Capacete',src:'assets/memory/capacete.svg',emoji:'⛑️',w:105,h:85}
];

const esc=s=>String(s||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const clamp=(n,a,b)=>Math.max(a,Math.min(b,Number(n)||0));
const copy=v=>JSON.parse(JSON.stringify(v));

function css(){
 if(document.getElementById('atelier-participant-css'))return;
 const s=document.createElement('style');s.id='atelier-participant-css';
 s.textContent=[
 'body.atelier-participant-open{overflow:hidden;background:#eef5f8}',
 '.atp{position:fixed;inset:0;z-index:100000;background:#eef5f8;overflow:auto;color:#173f60;padding:10px}.atp *{box-sizing:border-box}',
 '.atp-shell{width:min(1040px,100%);margin:auto;display:grid;gap:10px}.atp-brand{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:15px;background:#0b3c64;color:#fff}.atp-brand img{width:42px;height:42px;border-radius:10px}.atp-brand h1{margin:0;font-size:1rem}.atp-brand p{margin:2px 0 0;color:#bfe7fa;font-size:.72rem}.atp-code{margin-left:auto;background:#fff;color:#0f3c66;padding:7px 9px;border-radius:10px;font-weight:1000;letter-spacing:.12em}',
 '.atp-card{background:#fff;border:1px solid #d8e6ee;border-radius:17px;padding:15px;box-shadow:0 8px 24px rgba(15,60,102,.07)}.atp-card h2{margin:0 0 6px;color:#0f3c66}.atp-card p{color:#607788;line-height:1.45}',
 '.atp-form{display:grid;gap:11px;max-width:520px;margin:auto}.atp-form label{display:grid;gap:5px;font-size:.8rem;font-weight:900}.atp-form input{padding:13px;border:1px solid #cbdce6;border-radius:11px;font-size:1rem}',
 '.atp-btn{min-height:46px;border:0;border-radius:12px;background:#1688b7;color:#fff;font-weight:1000;cursor:pointer;padding:10px 14px}.atp-btn.secondary{background:#edf5f9;color:#0f3c66;border:1px solid #d3e2ea}.atp-btn.danger{background:#b64040}.atp-btn:disabled{opacity:.45;cursor:default}',
 '.atp-status{text-align:center;padding:34px 14px}.atp-status .big{font-size:3rem}.atp-status h2{margin:8px 0}.atp-challenge{padding:13px;border-radius:14px;background:#eef8fc;border:1px solid #d4e5ed}.atp-challenge h2{font-size:1.1rem;margin:0 0 4px}.atp-challenge p{margin:0}.atp-chip{display:inline-flex;margin-top:7px;padding:5px 8px;border-radius:999px;background:#eaf5fa;color:#0f668f;font-size:.72rem;font-weight:900}',
 '.atp-workspace{display:grid;grid-template-columns:290px minmax(0,1fr);gap:10px}.atp-tools{display:grid;gap:9px;align-content:start}.atp-mode{display:grid;grid-template-columns:1fr 1fr;gap:6px}.atp-mode button.active{background:#0f3c66;color:#fff}.atp-tools label{display:grid;gap:4px;font-size:.74rem;font-weight:900}.atp-color{display:grid;grid-template-columns:repeat(5,1fr);gap:6px}.atp-color button{height:38px;border:2px solid #fff;outline:1px solid #cbdbe5;border-radius:9px}.atp-color button.active{outline:3px solid #1688b7}',
 '.atp-history{display:grid;grid-template-columns:repeat(3,1fr);gap:6px}.atp-history .atp-btn{padding:7px 5px;min-height:42px;font-size:.76rem}',
 '.atp-stickers{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;max-height:390px;overflow:auto;padding:2px}.atp-stickers button{min-height:76px;border:1px solid #d7e5ed;border-radius:11px;background:#fff;padding:5px;display:grid;place-items:center;gap:2px;color:#173f60}.atp-stickers button.active{border:3px solid #1688b7;background:#eef9fd}.atp-stickers img{width:48px;height:42px;object-fit:contain}.atp-stickers small{font-size:.61rem;line-height:1.05;font-weight:800}',
 '.atp-context-tools{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:6px;margin-top:7px;padding:8px;border-radius:12px;background:#f5fafc;border:1px solid #dce8ef}.atp-context-tools strong{grid-column:1/-1;font-size:.76rem;color:#36596d}.atp-context-tools .atp-btn{min-height:40px;padding:6px 5px;font-size:.72rem}.atp-context-tools[hidden]{display:none!important}.atp-clear-row{display:flex;gap:7px;margin-top:7px}.atp-clear-row .atp-btn{flex:1}',
 '.atp-canvas-box{border:1px solid #cfdde6;border-radius:14px;background:#fff;overflow:hidden;touch-action:none}.atp-canvas-box canvas{display:block;width:100%;height:auto;aspect-ratio:3/2;background:#fff;touch-action:none}.atp-hint{text-align:center;font-size:.74rem;color:#567181;margin:6px 0;min-height:20px}',
 '.atp-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:8px}.atp-actions button{flex:1;min-width:115px}.atp-submit{margin-top:9px;padding:12px;border:1px solid #d7e5ed;border-radius:13px;background:#fff}.atp-submit h3{margin:0 0 5px}.atp-msg{margin-top:8px;padding:9px;border-radius:10px;background:#eef6fa;color:#315d76}.atp-msg.ok{background:#e7f7ed;color:#17643a}.atp-msg.bad{background:#fff0ef;color:#8d302c}',
 '.atp-winner{text-align:center}.atp-winner img{width:min(100%,760px);max-height:58vh;object-fit:contain;border-radius:16px;border:1px solid #d8e6ee;background:#fff}.atp-winner h2{font-size:clamp(1.5rem,5vw,2.3rem);margin:10px 0 4px}.atp-score{display:inline-block;padding:7px 10px;border-radius:999px;background:#fff2cc;color:#705300;font-weight:1000}',
 '.atp-footer{text-align:center;font-size:.7rem;color:#758b99}.atp-exit{border:0;background:none;color:#456678;text-decoration:underline;cursor:pointer}',
 '@media(max-width:840px){.atp-workspace{grid-template-columns:1fr}.atp-tools{order:2}.atp-canvas-wrap{order:1}.atp-stickers{grid-template-columns:repeat(5,1fr);max-height:none}.atp-actions{position:sticky;bottom:0;background:#eef5f8;padding:6px 0}}',
 '@media(max-width:700px){.atp-context-tools{grid-template-columns:repeat(3,minmax(0,1fr))}}',
 '@media(max-width:520px){.atp{padding:6px}.atp-stickers{grid-template-columns:repeat(4,1fr)}.atp-context-tools{grid-template-columns:repeat(2,minmax(0,1fr))}.atp-clear-row{flex-direction:column}}'
 ].join('');
 document.head.appendChild(s);
}

export function openAtelierParticipant(rawCode){
 css();
 const code=normalizeCode(rawCode);if(!code)return false;
 document.body.classList.add('atelier-participant-open');
 const root=document.createElement('div');root.className='atp';root.id='atelierParticipant';document.body.appendChild(root);

 let client=null,name=localStorage.getItem('mobiliza.atelier.name')||'',team=localStorage.getItem('mobiliza.atelier.team')||'',state=null,closing=false;
 let mode='draw',color='#173f60',width=8,eraser=false,insertStickerId=null,ops=[],undoStack=[],redoStack=[],current=null,selectedId=null,draggingId=null,dragOffset=null,dragBackup=null,dragMoved=false,submitTimer=null,sending=false,hasSubmitted=false;
 const W=900,H=600,images=new Map();

 const shell=body=>'<div class="atp-shell"><div class="atp-brand"><img src="assets/icon-192.webp?v=9" alt=""><div><h1>MOBILIZA EDUCA</h1><p>Ateliê do Trânsito</p></div><span class="atp-code">'+esc(code)+'</span></div>'+body+'<div class="atp-footer">Sessão criativa ao vivo • <button class="atp-exit" id="atpExit">sair</button></div></div>';
 const bindExit=()=>root.querySelector('#atpExit')?.addEventListener('click',()=>{if(!confirm('Sair desta atividade?'))return;closing=true;try{client&&client.close();}catch{}const u=new URL(location.href);u.searchParams.delete('atelier');location.href=u.pathname+u.search+u.hash;});
 const stickerDef=id=>STICKERS.find(x=>x.id===id);
 const selectedObj=()=>ops.find(x=>x.type==='sticker'&&x.id===selectedId)||null;
 const snapshot=()=>copy(ops);
 const storeUndo=(snap=snapshot())=>{undoStack.push(snap);if(undoStack.length>60)undoStack.shift();redoStack=[];};
 const restore=s=>{ops=copy(s);current=null;selectedId=null;draggingId=null;insertStickerId=null;drawScene();refreshUi();};

 function loadImage(def){
  if(!def?.src)return null;
  if(images.has(def.src))return images.get(def.src);
  const img=new Image();images.set(def.src,img);
  img.onload=()=>drawScene();img.onerror=()=>{};
  img.src=def.src;return img;
 }

 function join(error=''){
  root.innerHTML=shell('<section class="atp-card"><div class="atp-form"><div style="text-align:center"><div style="font-size:2.5rem">🎨</div><h2>Entrar no Ateliê do Trânsito</h2><p>Desenhe ou faça uma colagem e envie seu trabalho para a atividade.</p></div><label>Nome ou apelido<input id="atpName" maxlength="40" value="'+esc(name)+'"></label><label>Turma / equipe (opcional)<input id="atpTeam" maxlength="40" value="'+esc(team)+'"></label>'+(error?'<div class="atp-msg bad">'+esc(error)+'</div>':'')+'<button class="atp-btn" id="atpJoin">Entrar na sessão</button></div></section>');bindExit();
  root.querySelector('#atpJoin').onclick=()=>{name=root.querySelector('#atpName').value.trim();team=root.querySelector('#atpTeam').value.trim();if(!name){root.querySelector('#atpName').focus();return;}localStorage.setItem('mobiliza.atelier.name',name);localStorage.setItem('mobiliza.atelier.team',team);connect();};
 }
 function waiting(text='Você entrou. Aguarde o educador abrir os envios.'){root.innerHTML=shell('<section class="atp-card atp-status"><div class="big">🎨</div><h2>Ateliê conectado!</h2><p>'+esc(text)+'</p><span class="atp-chip">👤 '+esc(name)+(team?' • '+esc(team):'')+'</span></section>');bindExit();}
 function connecting(){root.innerHTML=shell('<section class="atp-card atp-status"><div class="big">📡</div><h2>Conectando...</h2><p>Procurando a sessão do educador.</p></section>');bindExit();}

 function drawScene(showSelection=true,showGrid=true){
  const c=root.querySelector('#atpCanvas');if(!c)return;
  const x=c.getContext('2d');x.clearRect(0,0,W,H);x.fillStyle='#fff';x.fillRect(0,0,W,H);
  if(showGrid){
   x.save();x.strokeStyle='#eef2f4';x.lineWidth=1;
   for(let i=0;i<W;i+=60){x.beginPath();x.moveTo(i,0);x.lineTo(i,H);x.stroke();}
   for(let j=0;j<H;j+=60){x.beginPath();x.moveTo(0,j);x.lineTo(W,j);x.stroke();}
   x.restore();
  }
  ops.forEach(o=>{
   if(o.type==='stroke'){
    x.save();x.lineCap='round';x.lineJoin='round';x.lineWidth=o.width;x.globalCompositeOperation=o.erase?'destination-out':'source-over';x.strokeStyle=o.color;x.beginPath();o.points.forEach((p,i)=>i?x.lineTo(p.x,p.y):x.moveTo(p.x,p.y));x.stroke();x.restore();
    return;
   }
   if(o.type==='sticker'){
    const def=stickerDef(o.stickerId);if(!def)return;
    x.save();x.translate(o.x,o.y);x.rotate((o.rotation||0)*Math.PI/180);
    const img=loadImage(def);
    if(img&&img.complete&&img.naturalWidth){x.drawImage(img,-o.w/2,-o.h/2,o.w,o.h);}
    else{x.textAlign='center';x.textBaseline='middle';x.font=Math.max(44,Math.min(o.w,o.h)*.68)+'px "Segoe UI Emoji","Apple Color Emoji",sans-serif';x.fillText(def.emoji||'🚦',0,0);}
    if(showSelection&&o.id===selectedId){x.setLineDash([10,7]);x.lineWidth=4;x.strokeStyle='#0b88bd';x.strokeRect(-o.w/2-7,-o.h/2-7,o.w+14,o.h+14);x.setLineDash([]);x.fillStyle='#0b88bd';x.beginPath();x.arc(o.w/2+8,-o.h/2-8,8,0,Math.PI*2);x.fill();}
    x.restore();
   }
  });
 }

 const point=(e,c)=>{const r=c.getBoundingClientRect();return{x:clamp((e.clientX-r.left)*W/r.width,0,W),y:clamp((e.clientY-r.top)*H/r.height,0,H)};};
 function hitSticker(p){
  for(let i=ops.length-1;i>=0;i--){
   const o=ops[i];if(o.type!=='sticker')continue;
   const a=-(o.rotation||0)*Math.PI/180,dx=p.x-o.x,dy=p.y-o.y,rx=dx*Math.cos(a)-dy*Math.sin(a),ry=dx*Math.sin(a)+dy*Math.cos(a);
   if(Math.abs(rx)<=o.w/2+10&&Math.abs(ry)<=o.h/2+10)return o;
  }
  return null;
 }
 function setHint(text){const h=root.querySelector('#atpHint');if(h)h.textContent=text;}
 function refreshUi(){
  const u=root.querySelector('#atpUndo'),r=root.querySelector('#atpRedo');if(u)u.disabled=!undoStack.length;if(r)r.disabled=!redoStack.length;
  root.querySelectorAll('[data-sticker]').forEach(b=>b.classList.toggle('active',b.dataset.sticker===insertStickerId));
  const obj=selectedObj(),label=root.querySelector('#atpSelectedLabel'),tools=root.querySelector('#atpContextTools');
  if(label)label.textContent=obj?(stickerDef(obj.stickerId)?.label||'Objeto selecionado'):'Nenhum objeto selecionado';
  if(tools)tools.hidden=mode!=='collage';
  ['atpRotateLeft','atpRotateRight','atpSizeDown','atpSizeUp','atpDeleteObj','atpDuplicateObj'].forEach(id=>{const b=root.querySelector('#'+id);if(b)b.disabled=!obj;});
 }
 function undo(){if(!undoStack.length)return;redoStack.push(snapshot());restore(undoStack.pop());setHint('↶ Última ação desfeita.');}
 function redo(){if(!redoStack.length)return;undoStack.push(snapshot());restore(redoStack.pop());setHint('↷ Ação refeita.');}

 function workspace(){
  const palette=STICKERS.map(x=>'<button type="button" data-sticker="'+x.id+'" title="'+esc(x.label)+'"><img src="'+x.src+'" alt=""><small>'+esc(x.label)+'</small></button>').join('');
  root.innerHTML=shell('<section class="atp-challenge"><h2>'+esc(state?.challenge?.title||'Desafio criativo')+'</h2><p>'+esc(state?.challenge?.text||'Crie uma cena de trânsito segura.')+'</p><span class="atp-chip">✋ trabalho autoral</span></section><section class="atp-workspace"><aside class="atp-card atp-tools"><div class="atp-mode"><button class="atp-btn secondary '+(mode==='draw'?'active':'')+'" id="atpDrawMode">✍️ Desenho</button><button class="atp-btn secondary '+(mode==='collage'?'active':'')+'" id="atpCollageMode">🧩 Colagem</button></div><div class="atp-history"><button class="atp-btn secondary" id="atpUndo">↶ Voltar</button><button class="atp-btn secondary" id="atpRedo">↷ Refazer</button><button class="atp-btn secondary" id="atpReload">↻ Reload</button></div><div id="atpDrawTools" '+(mode==='draw'?'':'hidden')+'><label>Espessura<input id="atpWidth" type="range" min="2" max="32" value="'+width+'"></label><div class="atp-color">'+['#173f60','#e74c3c','#f39c12','#27ae60','#2980b9','#8e44ad','#111111','#ffffff','#795548','#ff69b4'].map(c=>'<button type="button" data-color="'+c+'" style="background:'+c+'" class="'+(c===color?'active':'')+'"></button>').join('')+'</div><button class="atp-btn secondary" id="atpEraser">'+(eraser?'🧽 Borracha ativa':'🧽 Borracha')+'</button></div><div id="atpCollageTools" '+(mode==='collage'?'':'hidden')+'><label>Figuras de trânsito</label><div class="atp-stickers">'+palette+'</div></div></aside><div class="atp-canvas-wrap"><div class="atp-canvas-box"><canvas id="atpCanvas" width="'+W+'" height="'+H+'"></canvas></div><div class="atp-context-tools" id="atpContextTools" '+(mode==='collage'?'':'hidden')+'><strong>Objeto selecionado: <span id="atpSelectedLabel">Nenhum objeto selecionado</span></strong><button class="atp-btn secondary" id="atpRotateLeft">⟲ -15°</button><button class="atp-btn secondary" id="atpRotateRight">⟳ +15°</button><button class="atp-btn secondary" id="atpSizeDown">− Menor</button><button class="atp-btn secondary" id="atpSizeUp">+ Maior</button><button class="atp-btn secondary" id="atpDuplicateObj">⧉ Duplicar</button><button class="atp-btn danger" id="atpDeleteObj">🗑 Excluir</button></div><div class="atp-hint" id="atpHint">'+(mode==='draw'?'Desenhe com o dedo, mouse ou caneta digital.':'Selecione uma figura para inserir. Depois, segure e arraste qualquer objeto já colado para movimentá-lo.')+'</div><div class="atp-clear-row"><button class="atp-btn danger" id="atpClearArtwork">🧹 Limpar desenho</button></div><div class="atp-submit"><h3>Quando terminar</h3><p>Envie para a galeria. Você poderá reenviar enquanto os envios estiverem abertos.</p><div class="atp-actions"><button class="atp-btn" id="atpSubmit">Enviar trabalho</button></div><div id="atpMsg"></div></div></div></section>');
  bindExit();bindWorkspace();drawScene();refreshUi();
 }

 function bindWorkspace(){
  const c=root.querySelector('#atpCanvas');
  root.querySelector('#atpDrawMode').onclick=()=>{mode='draw';insertStickerId=null;selectedId=null;workspace();};
  root.querySelector('#atpCollageMode').onclick=()=>{mode='collage';insertStickerId=null;workspace();};
  root.querySelector('#atpWidth')?.addEventListener('input',e=>width=+e.target.value);
  root.querySelectorAll('[data-color]').forEach(b=>b.onclick=()=>{color=b.dataset.color;eraser=false;workspace();});
  root.querySelector('#atpEraser')?.addEventListener('click',()=>{eraser=!eraser;workspace();});
  root.querySelectorAll('[data-sticker]').forEach(b=>b.onclick=()=>{insertStickerId=b.dataset.sticker;selectedId=null;refreshUi();setHint('Toque no quadro para inserir '+(stickerDef(insertStickerId)?.label||'a figura')+'. A seleção será desativada depois da aplicação.');});

  root.querySelector('#atpUndo').onclick=undo;
  root.querySelector('#atpRedo').onclick=redo;
  root.querySelector('#atpReload').onclick=()=>{if(!ops.length||confirm('Reiniciar o quadro e apagar todas as ações?')){if(ops.length)storeUndo();ops=[];selectedId=null;insertStickerId=null;drawScene();refreshUi();setHint('Quadro reiniciado.');}};
  root.querySelector('#atpRotateLeft').onclick=()=>rotateSelected(-15);
  root.querySelector('#atpRotateRight').onclick=()=>rotateSelected(15);
  root.querySelector('#atpSizeDown').onclick=()=>resizeSelected(.85);
  root.querySelector('#atpSizeUp').onclick=()=>resizeSelected(1.18);
  root.querySelector('#atpDeleteObj').onclick=deleteSelected;
  root.querySelector('#atpDuplicateObj').onclick=duplicateSelected;
  root.querySelector('#atpClearArtwork').onclick=clearArtwork;
  root.querySelector('#atpSubmit').onclick=submit;

  c.addEventListener('pointerdown',e=>{
   e.preventDefault();const p=point(e,c);
   if(mode==='collage'){
    if(insertStickerId){
     const def=stickerDef(insertStickerId);if(!def)return;
     storeUndo();const id='S'+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
     ops.push({type:'sticker',id,stickerId:def.id,x:p.x,y:p.y,w:def.w,h:def.h,rotation:0});selectedId=id;insertStickerId=null;drawScene();refreshUi();setHint(def.label+' inserido. Segure e arraste para mover ou use os botões de rotação.');return;
    }
    const hit=hitSticker(p);selectedId=hit?.id||null;refreshUi();drawScene();
    if(hit){draggingId=hit.id;dragOffset={x:p.x-hit.x,y:p.y-hit.y,startX:p.x,startY:p.y};dragBackup=snapshot();dragMoved=false;c.setPointerCapture(e.pointerId);setHint('Objeto selecionado. Segure e arraste para mover.');}
    else setHint('Nenhum objeto selecionado. Escolha uma figura na biblioteca ou toque sobre um objeto existente.');
    return;
   }
   c.setPointerCapture(e.pointerId);storeUndo();current={type:'stroke',color,width,erase:eraser,points:[p]};ops.push(current);drawScene();refreshUi();
  });

  c.addEventListener('pointermove',e=>{
   const p=point(e,c);
   if(mode==='collage'&&draggingId){
    const o=ops.find(x=>x.id===draggingId);if(!o)return;
    if(Math.hypot(p.x-dragOffset.startX,p.y-dragOffset.startY)>3)dragMoved=true;
    o.x=clamp(p.x-dragOffset.x,o.w/2,W-o.w/2);o.y=clamp(p.y-dragOffset.y,o.h/2,H-o.h/2);drawScene();return;
   }
   if(!current||!c.hasPointerCapture(e.pointerId))return;current.points.push(p);drawScene();
  });
  const end=e=>{
   if(mode==='collage'&&draggingId){if(dragMoved){undoStack.push(dragBackup);if(undoStack.length>60)undoStack.shift();redoStack=[];setHint('Objeto movido.');}draggingId=null;dragOffset=null;dragBackup=null;dragMoved=false;try{c.releasePointerCapture(e.pointerId)}catch{}refreshUi();return;}
   current=null;try{c.releasePointerCapture(e.pointerId)}catch{}refreshUi();
  };
  c.addEventListener('pointerup',end);c.addEventListener('pointercancel',end);
 }

 function rotateSelected(delta){
  const o=selectedObj();if(!o)return;storeUndo();o.rotation=((o.rotation||0)+delta+360)%360;drawScene();refreshUi();setHint('Objeto rotacionado para '+o.rotation+'°.');
 }
 function resizeSelected(factor){
  const o=selectedObj();if(!o)return;
  const nw=clamp(Math.round(o.w*factor),40,430),nh=clamp(Math.round(o.h*factor),35,360);
  if(nw===o.w&&nh===o.h)return;
  storeUndo();o.w=nw;o.h=nh;
  o.x=clamp(o.x,o.w/2,W-o.w/2);o.y=clamp(o.y,o.h/2,H-o.h/2);
  drawScene();refreshUi();setHint(factor>1?'Objeto ampliado.':'Objeto reduzido.');
 }
 function clearArtwork(){
  if(!ops.length&&!hasSubmitted){msg('O quadro já está vazio.');return;}
  const text=hasSubmitted?'Limpar o desenho? O trabalho que já foi enviado também será removido da galeria da plataforma.':'Limpar todo o desenho?';
  if(!confirm(text))return;
  if(ops.length)storeUndo();
  ops=[];selectedId=null;insertStickerId=null;current=null;draggingId=null;drawScene();refreshUi();
  if(hasSubmitted&&client?.conn?.open){msg('Limpando desenho e removendo o trabalho enviado...');client.send({type:'atelier-delete-submission'});}
  else{hasSubmitted=false;msg('✅ Desenho limpo.','ok');}
  setHint('Quadro limpo. Você pode começar um novo trabalho.');
 }
 function deleteSelected(){
  const o=selectedObj();if(!o)return;storeUndo();ops=ops.filter(x=>x.id!==o.id);selectedId=null;drawScene();refreshUi();setHint('Objeto removido.');
 }
 function duplicateSelected(){
  const o=selectedObj();if(!o)return;storeUndo();const n=copy(o);n.id='S'+Date.now().toString(36)+Math.random().toString(36).slice(2,5);n.x=clamp(o.x+35,n.w/2,W-n.w/2);n.y=clamp(o.y+35,n.h/2,H-n.h/2);ops.push(n);selectedId=n.id;drawScene();refreshUi();setHint('Objeto duplicado. Segure e arraste para reposicionar.');
 }

 function msg(text,type=''){const b=root.querySelector('#atpMsg');if(b)b.innerHTML='<div class="atp-msg '+type+'">'+esc(text)+'</div>';}
 function compactImage(source){
  const sizes=[[640,427,.68],[560,373,.62],[480,320,.56]];let image='';
  for(const spec of sizes){const w=spec[0],h=spec[1],q=spec[2],out=document.createElement('canvas');out.width=w;out.height=h;const x=out.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,w,h);x.drawImage(source,0,0,w,h);image=out.toDataURL('image/jpeg',q);if(image.length<=420000)break;}
  return image;
 }
 const sleep=ms=>new Promise(r=>setTimeout(r,ms));
 async function submit(){
  if(sending)return;if(!ops.length){msg('Crie algo antes de enviar.','bad');return;}
  if(!client?.conn?.open){msg('A conexão com a sessão foi interrompida. Saia e entre novamente pelo QR Code.','bad');return;}
  const c=root.querySelector('#atpCanvas');drawScene(false,false);const image=compactImage(c);drawScene();
  if(!image||image.length>650000){msg('O desenho ficou grande demais para transmissão. Tente reduzir alguns elementos e reenviar.','bad');return;}
  const button=root.querySelector('#atpSubmit');if(button)button.disabled=true;sending=true;
  const uploadId='U'+Date.now().toString(36)+Math.random().toString(36).slice(2,7),chunkSize=12000,total=Math.ceil(image.length/chunkSize);
  msg('Enviando para a galeria • 0%');
  client.send({type:'atelier-submit-start',uploadId,total,name,team,mode:mode==='collage'?'colagem':'desenho'});await sleep(45);
  for(let i=0;i<total;i++){if(!sending)return;client.send({type:'atelier-submit-chunk',uploadId,index:i,chunk:image.slice(i*chunkSize,(i+1)*chunkSize)});if(i%2===1||i===total-1){msg('Enviando para a galeria • '+Math.round(((i+1)/total)*100)+'%');await sleep(22);}}
  client.send({type:'atelier-submit-end',uploadId});msg('Envio concluído. Aguardando confirmação da galeria...');
  clearTimeout(submitTimer);submitTimer=setTimeout(()=>{sending=false;const b=root.querySelector('#atpSubmit');if(b)b.disabled=false;msg('Não recebemos a confirmação da galeria. Sua arte continua na tela — toque em Enviar trabalho novamente.','bad');},12000);
 }

 function winner(data){
  const w=data.work||{};root.innerHTML=shell('<section class="atp-card atp-winner"><p class="eyebrow">🏆 '+esc(data.label||'TRABALHO DESTAQUE')+'</p><h2>'+esc(data.challenge||'Ateliê do Trânsito')+'</h2><img src="'+(w.image||'')+'" alt="Trabalho destaque"><h2>'+esc(w.name||'Participante')+'</h2><p>'+esc(w.team||'')+'</p>'+(w.score?'<span class="atp-score">'+esc(w.score)+'/100</span>':'')+'<p>Parabéns! O mais importante é transformar criatividade em atitudes mais seguras.</p></section>');bindExit();SoundManager.play('celebrate');
 }
 function closed(){root.innerHTML=shell('<section class="atp-card atp-status"><div class="big">🏁</div><h2>Atividade encerrada</h2><p>Obrigado por participar.</p><button class="atp-btn secondary" id="atpDone">Voltar ao Mobiliza Educa</button></section>');bindExit();root.querySelector('#atpDone').onclick=()=>{const u=new URL(location.href);u.searchParams.delete('atelier');location.href=u.pathname+u.search+u.hash;};}

 function onMessage(data){
  if(!data||typeof data!=='object')return;
  if(data.type==='atelier-state'){state=data;state.accepting?workspace():waiting('O educador ainda não abriu os envios.');return;}
  if(data.type==='atelier-upload-ready'){msg('Preparando transmissão do desenho...');return;}
  if(data.type==='atelier-upload-progress'){const pct=Math.round((Number(data.received)||0)*100/Math.max(1,Number(data.total)||1));msg('Enviando para a galeria • '+pct+'%');return;}
  if(data.type==='atelier-submit-ack'){clearTimeout(submitTimer);submitTimer=null;sending=false;const b=root.querySelector('#atpSubmit');if(b)b.disabled=false;if(data.ok)hasSubmitted=true;msg(data.message||'Trabalho recebido.',data.ok?'ok':'bad');if(data.ok)SoundManager.play('correct');return;}
  if(data.type==='atelier-delete-ack'){hasSubmitted=false;msg(data.message||'✅ Trabalho removido da galeria.',data.ok?'ok':'bad');return;}
  if(data.type==='atelier-submission-status'){msg(data.status==='approved'?'✅ Seu trabalho foi aprovado para a galeria.':'Seu trabalho voltou para moderação.',data.status==='approved'?'ok':'');return;}
  if(data.type==='atelier-winner'){winner(data);return;}
  if(data.type==='session-finished'||data.type==='session-closed'){closed();return;}
 }
 async function connect(){
  connecting();
  try{client=await connectParticipant(code,name,{onMessage,onStatus:s=>{if((s.type==='closed'||s.type==='disconnected')&&!closing){clearTimeout(submitTimer);sending=false;setTimeout(()=>join('A conexão foi encerrada. Tente novamente.'),500);}}});client.send({type:'atelier-ready'});waiting();}
  catch(e){try{client&&client.close()}catch{}client=null;join(e.message||'Não foi possível entrar na sessão.');}
 }
 join();return true;
}
