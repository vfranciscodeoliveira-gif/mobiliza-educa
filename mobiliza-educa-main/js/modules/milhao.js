import { getGameQuestions } from '../core/questionEngine.js?v=3';
import { recordGameResult } from '../core/historyStore.js?v=1';
import { createHostSession, renderQr, makeSessionCode } from '../core/sharedSession.js?v=1';
let questions=[];

const ladder=[100,200,300,500,1000,2000,5000,10000,20000,50000,100000,200000,300000,500000,1000000];
const letters=['A','B','C','D'];
const MAX_LEVELS=ladder.length;
const INITIAL_TIME=30;
const INITIAL_JUMPS=3;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));

function shuffle(values){
 const a=[...values];
 for(let n=a.length-1;n>0;n--){const j=Math.floor(Math.random()*(n+1));[a[n],a[j]]=[a[j],a[n]];}
 return a;
}
function stats(correct,answers,score,streak){
 const s=JSON.parse(localStorage.getItem('mobiliza.results')||'{"games":0,"correct":0,"answers":0,"best":0,"streak":0}');
 s.games=(s.games||0)+1;s.correct=(s.correct||0)+correct;s.answers=(s.answers||0)+answers;s.best=Math.max(s.best||0,score);s.streak=Math.max(s.streak||0,streak);
 localStorage.setItem('mobiliza.results',JSON.stringify(s));
}
function ranking(name,score){
 const key='mobiliza.milhao.ranking',r=JSON.parse(localStorage.getItem(key)||'[]');
 r.push({name:name||'Jogador',score,date:new Date().toISOString()});
 r.sort((a,b)=>b.score-a.score);localStorage.setItem(key,JSON.stringify(r.slice(0,10)));return r.slice(0,10);
}
function beep(freq=660,dur=.08){
 try{const C=window.AudioContext||window.webkitAudioContext,c=new C(),o=c.createOscillator(),g=c.createGain();o.frequency.value=freq;g.gain.value=.04;o.connect(g);g.connect(c.destination);o.start();setTimeout(()=>{o.stop();c.close();},dur*1000);}catch{}
}
export function openMilhao(dialog,host,onFinish){
 let name='Jogador';
 let level=0;
 let score=0;
 let pulos=INITIAL_JUMPS;
 let cartas=1;
 let plateia=1;
 let time=INITIAL_TIME;
 let timer=null;
 let locked=false;
 let selected=null;
 let correctCount=0;
 let bestStreak=0;
 let streak=0;
 let answers=0;
 let order=[];
 let questionCursor=0;
 let finished=false;
 let startedAt=Date.now();
 let audienceSession=null;
 let audienceParticipants=[];
 let audienceVotes=new Map();
 let audienceRoundId=null;
 let audienceState='off';
 let audienceCurrentResult=null;
 let audienceMaxParticipants=0;
 let audienceConnectBusy=false;

 const stopTimer=()=>{if(timer){clearInterval(timer);timer=null;}};
 const milhaoEsc=(v='')=>String(v).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
 const audienceUid=()=>('m-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,9));
 const audienceQuestionPayload=()=>{
  const q=currentQuestion();
  if(!q||!audienceRoundId)return null;
  return {
   type:'question',
   roundId:audienceRoundId,
   index:level+1,
   total:MAX_LEVELS,
   prompt:q.q,
   options:q.a,
   image:q.image||null,
   category:q.category||'',
   difficulty:q.difficulty||''
  };
 };
 const updateAudienceIndicators=()=>{
  audienceMaxParticipants=Math.max(audienceMaxParticipants,audienceParticipants.length);
  const count=host.querySelector('#milhaoAudienceCount');
  if(count)count.textContent=String(audienceParticipants.length);
  const aid=host.querySelector('#audience');
  if(aid&&plateia)aid.innerHTML='👥 Plateia <b>'+plateia+'</b>'+(audienceSession?'<small> • '+audienceParticipants.length+' online</small>':'');
  const voters=host.querySelector('#milhaoAudienceVoters');
  if(voters&&audienceState==='voting'){
   voters.innerHTML=audienceParticipants.map(p=>'<span class="'+(audienceVotes.has(p.clientId)?'voted':'')+'">'+(audienceVotes.has(p.clientId)?'✓ ':'○ ')+milhaoEsc(p.name||'Participante')+'</span>').join('');
  }
  const vc=host.querySelector('#milhaoAudienceVoteCount');
  if(vc)vc.textContent=String(audienceVotes.size);
  const reveal=host.querySelector('#milhaoAudienceReveal');
  if(reveal)reveal.disabled=audienceVotes.size<1;
 };
 const syncAudienceParticipant=clientId=>{
  if(!audienceSession)return;
  if(audienceState==='voting'){
   const payload=audienceQuestionPayload();
   if(payload)audienceSession.sendTo(clientId,payload);
   if(audienceVotes.has(clientId))audienceSession.sendTo(clientId,{type:'already-voted',roundId:audienceRoundId,choice:audienceVotes.get(clientId)});
   return;
  }
  if(audienceState==='result'&&audienceCurrentResult){
   audienceSession.sendTo(clientId,audienceCurrentResult);
   return;
  }
  audienceSession.sendTo(clientId,{type:'waiting',message:'Você está conectado ao Show do Milhão. Aguarde o jogador pedir a ajuda da plateia.'});
 };
 const handleAudienceMessage=({data,clientId})=>{
  if(!data)return;
  if(data.type==='participant-ready'||data.type==='ready'){
   syncAudienceParticipant(clientId);
   return;
  }
  if(data.type==='vote'){
   if(audienceState!=='voting'||data.roundId!==audienceRoundId)return;
   const choice=Number(data.choice);
   if(!Number.isInteger(choice)||choice<0||choice>3)return;
   if(audienceVotes.has(clientId)){
    audienceSession?.sendTo(clientId,{type:'already-voted',roundId:audienceRoundId,choice:audienceVotes.get(clientId)});
    return;
   }
   audienceVotes.set(clientId,choice);
   audienceSession?.markVoted(clientId,audienceRoundId);
   audienceSession?.sendTo(clientId,{type:'vote-ack',roundId:audienceRoundId,choice});
   updateAudienceIndicators();
   beep(520,.045);
   return;
  }
  if(data.type==='participant-left')updateAudienceIndicators();
 };
 const paintAudienceRoom=()=>{
  const panel=host.querySelector('#milhaoAudienceRoom');
  const connect=host.querySelector('#milhaoConnectAudience');
  if(!panel||!connect)return;
  if(!audienceSession){
   panel.hidden=true;
   connect.disabled=audienceConnectBusy;
   connect.textContent=audienceConnectBusy?'Conectando...':'📱 Conectar plateia';
   return;
  }
  panel.hidden=false;
  connect.disabled=true;
  connect.textContent='✓ Sala ativa';
  const code=panel.querySelector('#milhaoAudienceCode');
  const link=panel.querySelector('#milhaoAudienceLink');
  if(code)code.textContent=audienceSession.code;
  if(link)link.textContent=audienceSession.joinUrl;
  updateAudienceIndicators();
  const qr=panel.querySelector('#milhaoAudienceQr');
  if(qr&&!qr.dataset.ready){
   qr.dataset.ready='1';
   renderQr(qr,audienceSession.joinUrl,150).catch(()=>{qr.innerHTML='<strong>'+milhaoEsc(audienceSession.code)+'</strong>';});
  }
 };
 const createAudienceRoom=async()=>{
  if(audienceSession||audienceConnectBusy)return;
  audienceConnectBusy=true;paintAudienceRoom();
  let lastError=null;
  for(let attempt=0;attempt<3&&!audienceSession;attempt++){
   try{
    audienceSession=await createHostSession({
     code:makeSessionCode(),
     onParticipants:list=>{audienceParticipants=list;updateAudienceIndicators();},
     onMessage:handleAudienceMessage,
     onStatus:s=>{
      if(s.type==='error'){
       const msg=host.querySelector('#milhaoAudienceRoomMessage');
       if(msg)msg.textContent='A conexão da plateia apresentou instabilidade.';
      }
     }
    });
   }catch(e){lastError=e;}
  }
  audienceConnectBusy=false;
  if(!audienceSession){
   const msg=host.querySelector('#milhaoAudienceStartMessage');
   if(msg)msg.textContent='Não foi possível abrir a sala agora. Você ainda pode jogar com a plateia simulada.'+(lastError?.message?' '+lastError.message:'');
   paintAudienceRoom();
   return;
  }
  audienceState='waiting';
  audienceSession.broadcast({type:'waiting',message:'Você está conectado ao Show do Milhão. Aguarde o jogador pedir a ajuda da plateia.'});
  paintAudienceRoom();
 };
 const currentQuestion=()=>questions[order[questionCursor]];
 const safeHalf=v=>Math.floor(Math.max(0,v)/2);
 const disableQuestion=()=>{
  host.querySelectorAll('[data-answer],#confirmYes,#confirmNo,#jump,#cards,#audience,#stopGame').forEach(el=>{if(el)el.disabled=true;});
 };
 const startTimer=(reset=false)=>{
  stopTimer();
  if(reset)time=INITIAL_TIME;
  const t=host.querySelector('#milhaoTimer');
  if(t){t.textContent=time;t.classList.toggle('danger',time<=10);}
  timer=setInterval(()=>{
   if(locked||finished)return;
   time--;
   const el=host.querySelector('#milhaoTimer');
   if(el){el.textContent=Math.max(0,time);if(time<=10)el.classList.add('danger');}
   if(time<=0)timeout();
  },1000);
 };
 const playIntro=async()=>{
  stopTimer();
  host.innerHTML=`<section class="game milhao windows-look milhao-intro">
    <div class="milhao-rings intro-rings"></div>
    <div class="intro-flare"></div>
    <div class="intro-stage intro-stage-v13">
      <div class="intro-cover">
        <img class="milhao-intro-art" src="assets/games/quiz_do_milhao_do_transito.svg?v=14" alt="Show do Milhão do Trânsito">
        <div class="intro-count intro-count-over"><span>3</span></div>
      </div>
      <p class="intro-player">Prepare-se, <strong>${name}</strong>!</p>
      <div class="intro-title">MOBILIZA EDUCA • SHOW DO MILHÃO DO TRÂNSITO</div>
    </div>
  </section>`;
  beep(360,.08);
  await sleep(600);
  const el=()=>host.querySelector('.intro-count span');
  if(el()){el().textContent='2';beep(430,.08);}
  await sleep(600);
  if(el()){el().textContent='1';beep(520,.08);}
  await sleep(600);
  if(el()){el().textContent='VALENDO!';el().classList.add('go');beep(880,.16);}
  await sleep(700);
 };
 const resetGame=()=>{
  questions=getGameQuestions('milhao',24).map(x=>({q:x.prompt,a:x.options,correct:x.correct,why:x.why,id:x.id,image:x.image,category:x.category||'',difficulty:x.difficulty||''}));
  level=0;score=0;pulos=INITIAL_JUMPS;cartas=1;plateia=1;time=INITIAL_TIME;locked=false;selected=null;correctCount=0;bestStreak=0;streak=0;answers=0;questionCursor=0;finished=false;startedAt=Date.now();
  order=shuffle(questions.map((_,idx)=>idx));
 };
 const openStart=()=>{
  stopTimer();
  host.innerHTML=`<section class="game milhao milhao-start windows-look"><div class="milhao-rings"></div><div class="milhao-start-stage"><div class="milhao-start-emblem"><div class="milhao-cover-frame"><img class="milhao-start-art" src="assets/games/quiz_do_milhao_do_transito.svg?v=14" alt="Show do Milhão do Trânsito"><div class="milhao-cover-badge">SHOW DO MILHÃO<br><small>DO TRÂNSITO</small></div></div></div><div class="milhao-start-copy"><p class="eyebrow">MOBILIZA EDUCA • DESAFIO PRINCIPAL</p><h2 class="milhao-title-3d">Show do Milhão do Trânsito</h2><p>Responda 15 perguntas e avance até 1.000.000. O pulo troca somente a pergunta, sem mudar o nível ou a premiação.</p><label class="player-name">Nome do jogador<input id="milhaoName" maxlength="40" value="${name==='Jogador'?'':name}" placeholder="Digite seu nome"></label><div class="milhao-rules"><span>⏱ 30 s</span><span>⏭ 3 pulos</span><span>🃏 1 cartas</span><span>👥 1 plateia</span></div>
  <div class="milhao-connected-start">
    <div class="milhao-connected-copy"><strong>📱 Plateia Conectada</strong><small>Opcional: conecte celulares por QR Code. Se não conectar ninguém, a ajuda continua disponível em modo simulado.</small><span id="milhaoAudienceStartMessage"></span></div>
    <button type="button" class="btn ghost" id="milhaoConnectAudience">📱 Conectar plateia</button>
  </div>
  <div class="milhao-connected-room" id="milhaoAudienceRoom" hidden>
    <div id="milhaoAudienceQr" class="milhao-connected-qr"></div>
    <div><small>SALA</small><strong id="milhaoAudienceCode">------</strong><span id="milhaoAudienceLink"></span><p><b id="milhaoAudienceCount">0</b> participante(s) conectado(s)</p><p id="milhaoAudienceRoomMessage">A sala permanece aberta durante a partida.</p></div>
    <button type="button" class="btn ghost small" id="milhaoCopyAudience">Copiar link</button>
  </div>
  <button type="button" class="btn primary big milhao-start-button" id="milhaoStart">▶ COMEÇAR DESAFIO</button></div></div></section>`;
  host.querySelector('#milhaoConnectAudience').onclick=createAudienceRoom;
  host.querySelector('#milhaoCopyAudience')?.addEventListener('click',async()=>{if(!audienceSession)return;try{await navigator.clipboard.writeText(audienceSession.joinUrl);host.querySelector('#milhaoCopyAudience').textContent='✓ Copiado';}catch{}});
  paintAudienceRoom();
  host.querySelector('#milhaoStart').onclick=async()=>{const btn=host.querySelector('#milhaoStart');btn.disabled=true;name=host.querySelector('#milhaoName').value.trim()||'Jogador';resetGame();if(audienceSession){audienceState='waiting';audienceSession.broadcast({type:'waiting',message:'Show do Milhão iniciado. Aguarde o jogador pedir a ajuda da plateia.'});}await playIntro();render();};
 };
 const ladderHtml=()=>ladder.map((v,n)=>`<span class="${n<level?'done':n===level?'current':''}"><small>${n+1}</small> ${v.toLocaleString('pt-BR')}</span>`).reverse().join('');
 const resumeAfterHelp=()=>{locked=false;startTimer(false);};
 const render=()=>{
  stopTimer();time=INITIAL_TIME;locked=false;selected=null;
  const q=currentQuestion();
  if(!q){end('questions',score);return;}
  host.innerHTML=`<section class="game milhao windows-look milhao-play"><div class="milhao-rings"></div><div class="milhao-top"><div><p class="eyebrow">SHOW DO MILHÃO DO TRÂNSITO</p><h2>${name}</h2><p class="milhao-score">Pontuação acumulada: <strong>${score.toLocaleString('pt-BR')}</strong> • Valendo: <strong>${ladder[level].toLocaleString('pt-BR')}</strong></p></div><div class="milhao-timer" id="milhaoTimer">${INITIAL_TIME}</div></div><div class="milhao-layout windows-layout"><div class="milhao-stage"><div class="milhao-brand-stage"><div class="milhao-logo-disc">SHOW<br><strong>DO MILHÃO</strong><small>DO TRÂNSITO</small></div></div><div class="milhao-question-wrap"><span>Pergunta ${level+1} de ${MAX_LEVELS}</span><h2 class="milhao-question">${q.q}</h2></div><div class="quiz-options milhao-options">${q.a.map((x,n)=>`<button type="button" class="quiz-option" data-answer="${n}"><b>${letters[n]}</b><span>${x}</span></button>`).join('')}</div><div class="milhao-confirm" id="milhaoConfirm" hidden><span>Confirma a alternativa <strong id="confirmLetter"></strong>?</span><button type="button" class="btn primary" id="confirmYes">CONFIRMAR</button><button type="button" class="btn ghost" id="confirmNo">TROCAR</button></div><div class="milhao-aids"><button type="button" class="btn ghost" id="jump" ${pulos?'':'disabled'}>⏭ Pular <b>${pulos}</b></button><button type="button" class="btn ghost" id="cards" ${cartas?'':'disabled'}>🃏 Cartas <b>${cartas}</b></button><button type="button" class="btn ghost" id="audience" ${plateia?'':'disabled'}>👥 Plateia <b>${plateia}</b>${audienceSession?`<small> • ${audienceParticipants.length} online</small>`:''}</button><button type="button" class="btn ghost" id="stopGame">⏹ Parar</button><button type="button" class="btn ghost" id="fullscreen">⛶ Telão</button></div><div id="feedback"></div></div><aside class="milhao-ladder">${ladderHtml()}</aside></div><div id="milhaoHelpOverlay" class="milhao-help-overlay"></div></section>`;
  const opts=[...host.querySelectorAll('[data-answer]')];
  opts.forEach(b=>b.onclick=e=>{e.preventDefault();e.stopPropagation();if(locked||b.disabled)return;opts.forEach(x=>x.classList.remove('selected'));b.classList.add('selected');selected=+b.dataset.answer;host.querySelector('#confirmLetter').textContent=letters[selected];host.querySelector('#milhaoConfirm').hidden=false;beep(520,.05);});
  host.querySelector('#confirmNo').onclick=e=>{e.preventDefault();e.stopPropagation();if(locked)return;selected=null;opts.forEach(x=>x.classList.remove('selected'));host.querySelector('#milhaoConfirm').hidden=true;};
  host.querySelector('#confirmYes').onclick=e=>{e.preventDefault();e.stopPropagation();if(selected!==null)answer(selected);};
  host.querySelector('#jump').onclick=async()=>{
   if(!pulos||locked||finished)return;
   locked=true;stopTimer();pulos--;
   const o=host.querySelector('#milhaoHelpOverlay');o.className='milhao-help-overlay show';o.innerHTML='<div class="help-stage jump-help"><div class="jump-track"></div><div class="jump-car">🚗</div><div class="jump-cones">🚧 🚧 🚧</div><h3>PULO!</h3><p>A pergunta será trocada. O nível e a premiação permanecem iguais.</p></div>';
   beep(430,.07);await sleep(1200);
   questionCursor++;
   render();
  };
  host.querySelector('#cards').onclick=()=>{
   if(!cartas||locked||finished)return;
   locked=true;stopTimer();

   const cardPool=[
    {key:'rei',label:'REI',remove:0,icon:'♔',desc:'Nenhuma alternativa será eliminada.'},
    {key:'as',label:'ÁS',remove:1,icon:'A',desc:'1 alternativa incorreta será eliminada.'},
    {key:'dois',label:'2',remove:2,icon:'2',desc:'2 alternativas incorretas serão eliminadas.'},
    {key:'tres',label:'3',remove:3,icon:'3',desc:'3 alternativas incorretas serão eliminadas.'}
   ].sort(()=>Math.random()-.5);

   const o=host.querySelector('#milhaoHelpOverlay');
   o.className='milhao-help-overlay show cards-pick-overlay';
   o.innerHTML=`<div class="help-stage cards-help cards-picker">
      <div class="cards-picker-title">
       <span class="cards-picker-icon">🃏</span>
       <div><h3>ESCOLHA UMA CARTA</h3><p>Clique em uma carta para virá-la e revelar a ajuda.</p></div>
      </div>
      <div class="milhao-card-grid">
       ${cardPool.map(card=>`<button type="button" class="milhao-card-pick" data-card="${card.key}" aria-label="Virar esta carta">
         <span class="milhao-card-face milhao-card-back"><i>★</i><strong>MOBILIZA</strong><small>CLIQUE PARA VIRAR</small></span>
         <span class="milhao-card-face milhao-card-front"><i>${card.icon}</i><strong>${card.label}</strong><small>${card.desc}</small></span>
       </button>`).join('')}
      </div>
    </div>`;

   let resolving=false;
   o.onclick=async e=>{
    const btn=e.target.closest('.milhao-card-pick');
    if(!btn||resolving)return;
    e.preventDefault();e.stopPropagation();
    resolving=true;

    const drawn=cardPool.find(x=>x.key===btn.dataset.card);
    if(!drawn){resolving=false;return;}

    o.querySelectorAll('.milhao-card-pick').forEach(x=>{
      x.disabled=true;
      if(x!==btn)x.classList.add('not-chosen');
    });
    btn.classList.add('flipped','chosen');
    cartas=0;
    beep(620,.09);

    await sleep(850);

    const wrong=q.a.map((_,n)=>n).filter(n=>n!==q.correct).sort(()=>Math.random()-.5).slice(0,drawn.remove);
    wrong.forEach(n=>{
      opts[n].disabled=true;
      opts[n].classList.add('eliminated');
    });

    host.querySelector('#cards').disabled=true;

    // Mantém a carta escolhida aberta e deixa o jogo visível ao fundo.
    o.className='milhao-help-overlay show cards-pick-overlay card-result-overlay';
    o.innerHTML=`<div class="help-stage card-result-stage">
      <div class="card-result-mini">
        <span class="card-result-icon">${drawn.icon}</span>
        <div><small>CARTA REVELADA</small><strong>${drawn.label}</strong></div>
      </div>
      <p>${drawn.desc}</p>
      <button type="button" class="btn primary card-continue" id="cardContinue">CONTINUAR</button>
    </div>`;

    host.querySelector('#feedback').innerHTML=`<div class="quiz-feedback milhao-feedback card-feedback"><strong>🃏 Carta ${drawn.label}</strong><p>${drawn.desc}</p></div>`;

    o.querySelector('#cardContinue').onclick=e2=>{
      e2.preventDefault();e2.stopPropagation();
      o.onclick=null;
      o.className='milhao-help-overlay';
      o.innerHTML='';
      resumeAfterHelp();
    };
   };
  };
  host.querySelector('#audience').onclick=async()=>{
   if(!plateia||locked||finished)return;
   locked=true;stopTimer();plateia--;

   const o=host.querySelector('#milhaoHelpOverlay');
   const connected=!!audienceSession&&audienceParticipants.length>0;

   if(connected){
    audienceState='voting';
    audienceRoundId=audienceUid();
    audienceVotes=new Map();
    audienceCurrentResult=null;
    audienceSession.resetVotes();
    audienceSession.broadcast(audienceQuestionPayload());

    o.className='milhao-help-overlay show audience-overlay connected-audience-overlay';
    o.innerHTML=`<div class="help-stage audience-help audience-help-v13 milhao-live-audience">
      <div class="milhao-live-audience-head"><div><p class="eyebrow">PLATEIA CONECTADA</p><h3>VOTAÇÃO AO VIVO</h3><p>A pergunta foi enviada para os celulares.</p></div><div class="milhao-live-count"><strong id="milhaoAudienceVoteCount">0</strong><small>votos</small></div></div>
      <div class="milhao-live-voters" id="milhaoAudienceVoters"></div>
      <div class="milhao-live-note">🔒 A distribuição das respostas fica oculta até encerrar a votação.</div>
      <div class="hero-actions"><button type="button" class="btn primary" id="milhaoAudienceReveal" disabled>📊 ENCERRAR VOTAÇÃO</button><button type="button" class="btn ghost" id="milhaoAudienceCancel">CANCELAR AJUDA</button></div>
    </div>`;
    updateAudienceIndicators();

    const audienceAction=await new Promise(resolve=>{
      o.querySelector('#milhaoAudienceReveal').onclick=()=>resolve('reveal');
      o.querySelector('#milhaoAudienceCancel').onclick=()=>resolve('cancel');
    });
    if(audienceAction==='cancel'){
      plateia++;
      audienceState='waiting';audienceCurrentResult=null;audienceVotes=new Map();
      audienceSession.broadcast({type:'waiting',message:'A votação foi cancelada. Aguarde uma nova solicitação do jogador.'});
      o.className='milhao-help-overlay';o.innerHTML='';
      resumeAfterHelp();
      return;
    }

    const counts=[0,0,0,0];
    audienceVotes.forEach(v=>{if(v>=0&&v<4)counts[v]++;});
    const total=counts.reduce((a,b)=>a+b,0);
    const percentages=counts.map(v=>total?Math.round(v/total*100):0);
    const results=counts.map((v,n)=>({count:v,percent:percentages[n]}));

    audienceCurrentResult={
      type:'result',
      roundId:audienceRoundId,
      prompt:q.q,
      options:q.a,
      image:q.image||null,
      category:q.category||'',
      difficulty:q.difficulty||'',
      correct:-1,
      revealCorrect:false,
      why:'',
      votes:total,
      results,
      modeLabel:'AJUDA DA PLATEIA'
    };
    audienceState='result';
    audienceSession.broadcast(audienceCurrentResult);

    o.innerHTML=`<div class="help-stage audience-help audience-help-v13 audience-result-stage">
      <p class="eyebrow">PLATEIA CONECTADA • ${total} VOTO${total===1?'':'S'}</p>
      <h3>RESULTADO DA PLATEIA</h3>
      <div class="audience-chart">
        ${percentages.map((p,n)=>`<div class="audience-chart-row"><span>${letters[n]}</span><i><b style="width:${p}%"></b></i><strong>${p}%</strong></div>`).join('')}
      </div>
      <button type="button" class="btn primary audience-continue" id="audienceContinue">CONTINUAR</button>
    </div>`;
    host.querySelector('#feedback').innerHTML=`<div class="audience-summary"><strong>📱 Plateia conectada:</strong> ${percentages.map((p,n)=>`<span>${letters[n]} ${p}%</span>`).join('')}</div>`;
    host.querySelector('#audience').disabled=true;
    beep(720,.1);

    o.querySelector('#audienceContinue').onclick=e=>{
      e.preventDefault();e.stopPropagation();
      audienceState='waiting';audienceCurrentResult=null;
      audienceSession.broadcast({type:'waiting',message:'Ajuda concluída. Aguarde a próxima solicitação do jogador.'});
      o.className='milhao-help-overlay';o.innerHTML='';
      resumeAfterHelp();
    };
    return;
   }

   const base=[12,12,12,12];
   base[q.correct]=64;

   o.className='milhao-help-overlay show audience-overlay';
   o.innerHTML=`<div class="help-stage audience-help audience-help-v13">
      <div class="audience-people" aria-hidden="true">
        <span>●</span><span>●</span><span>●</span><span>●</span><span>●</span><span>●</span><span>●</span>
      </div>
      <h3>PLATEIA ${audienceSession?'SIMULADA • NENHUM CELULAR CONECTADO':'SIMULADA'}</h3>
      <p>O público está votando...</p>
    </div>`;
   await sleep(650);

   o.innerHTML=`<div class="help-stage audience-help audience-help-v13 audience-result-stage">
      <p class="eyebrow">${audienceSession?'Nenhum participante estava conectado; foi usada a simulação.':'Modo simulado'}</p>
      <h3>RESULTADO DA PLATEIA</h3>
      <div class="audience-chart">
        ${base.map((p,n)=>`<div class="audience-chart-row"><span>${letters[n]}</span><i><b style="width:${p}%"></b></i><strong>${p}%</strong></div>`).join('')}
      </div>
      <button type="button" class="btn primary audience-continue" id="audienceContinue">CONTINUAR</button>
    </div>`;
   beep(720,.1);

   host.querySelector('#feedback').innerHTML=`<div class="audience-summary"><strong>👥 Plateia simulada:</strong> ${base.map((p,n)=>`<span>${letters[n]} ${p}%</span>`).join('')}</div>`;
   host.querySelector('#audience').disabled=true;

   o.querySelector('#audienceContinue').onclick=e=>{
     e.preventDefault();e.stopPropagation();
     o.className='milhao-help-overlay';
     o.innerHTML='';
     resumeAfterHelp();
   };
  };
  host.querySelector('#stopGame').onclick=()=>confirmStop();
  host.querySelector('#fullscreen').onclick=()=>{const el=dialog;if(!document.fullscreenElement)el.requestFullscreen?.();else document.exitFullscreen?.();};
  startTimer(true);
 };
 const confirmStop=()=>{
  if(locked||finished)return;
  locked=true;stopTimer();
  const o=host.querySelector('#milhaoHelpOverlay');
  o.className='milhao-help-overlay show';
  o.innerHTML=`<div class="help-stage"><h3>PARAR O JOGO?</h3><p>Se parar agora, você encerra com 100% da pontuação acumulada: <strong>${score.toLocaleString('pt-BR')}</strong>.</p><div class="hero-actions"><button type="button" class="btn primary" id="stopYes">SIM, PARAR</button><button type="button" class="btn ghost" id="stopNo">CONTINUAR</button></div></div>`;
  o.querySelector('#stopYes').onclick=()=>end('stop',score);
  o.querySelector('#stopNo').onclick=()=>{o.classList.remove('show');o.innerHTML='';resumeAfterHelp();};
 };
 const answer=n=>{
  if(locked||finished)return;
  locked=true;stopTimer();answers++;
  const q=currentQuestion();const ok=n===q.correct;
  if(ok){correctCount++;streak++;bestStreak=Math.max(bestStreak,streak);score=ladder[level];beep(880,.12);revealCorrect(n);}
  else{streak=0;beep(180,.22);revealTerminal(n,'wrong');}
 };
 const paintAnswers=n=>{
  const q=currentQuestion(),opts=[...host.querySelectorAll('[data-answer]')];
  opts.forEach((b,idx)=>{b.disabled=true;if(idx===q.correct)b.classList.add('correct');if(n===idx&&n!==q.correct)b.classList.add('wrong');});
  host.querySelector('#milhaoConfirm')?.setAttribute('hidden','');
 };
 const revealCorrect=n=>{
  const q=currentQuestion();paintAnswers(n);disableQuestion();
  const last=level>=MAX_LEVELS-1;
  host.querySelector('#feedback').innerHTML=`<div class="quiz-feedback milhao-feedback"><strong>✅ Resposta correta!</strong><p>${q.why}</p><button type="button" class="btn primary" id="milhaoNext">${last?'VER RESULTADO':'PRÓXIMA PERGUNTA'}</button></div>`;
  host.querySelector('#milhaoNext').onclick=e=>{e.preventDefault();e.stopPropagation();if(last){end('win',score);return;}level++;questionCursor++;render();};
 };
 const revealTerminal=(n,reason)=>{
  const q=currentQuestion();paintAnswers(n);disableQuestion();
  const finalScore=safeHalf(score);
  const title=reason==='timeout'?'⏱ TEMPO ACABOU!':'❌ RESPOSTA INCORRETA.';
  const detail=reason==='timeout'?'O cronômetro chegou a zero. A partida foi encerrada e não é possível avançar para a próxima pergunta.':'A partida foi encerrada.';
  host.querySelector('#feedback').innerHTML=`<div class="quiz-feedback milhao-feedback"><strong>${title}</strong><p>${detail}</p><p>${q.why}</p><p>Prêmio final: <strong>${finalScore.toLocaleString('pt-BR')}</strong> (50% do acumulado).</p><button type="button" class="btn primary" id="milhaoResult">VER RESULTADO</button></div>`;
  host.querySelector('#milhaoResult').onclick=e=>{e.preventDefault();e.stopPropagation();end(reason,finalScore);};
 };
 const timeout=()=>{
  if(locked||finished)return;
  locked=true;stopTimer();time=0;streak=0;beep(170,.35);revealTerminal(null,'timeout');
 };
 const end=(reason,finalScore=score)=>{
  if(finished)return;
  finished=true;stopTimer();
  const rank=ranking(name,finalScore);stats(correctCount,answers,finalScore,bestStreak);
  if(audienceSession){
   audienceState='waiting';audienceCurrentResult=null;
   audienceSession.broadcast({type:'waiting',message:'A partida terminou. Aguarde o operador iniciar uma nova rodada ou encerrar a sessão.'});
  }
  recordGameResult({
    kind:'game',moduleId:'milhao',title:'Show do Milhão do Trânsito',
    score:finalScore,correct:correctCount,answers,durationSec:Math.round((Date.now()-startedAt)/1000),
    status:reason,level:String(level+1),participants:audienceMaxParticipants||null,
    meta:{player:name,bestStreak,pulosRestantes:pulos,cartasRestantes:cartas,plateiaRestante:plateia,plateiaConectada:!!audienceSession}
  });
  const reasonText={win:'Você concluiu as 15 perguntas!',wrong:'Resposta incorreta: a rodada foi encerrada.',timeout:'Tempo esgotado: a rodada foi encerrada.',stop:'Você decidiu parar e levou 100% do acumulado.',questions:'Banco de perguntas insuficiente para continuar.'}[reason]||'Rodada encerrada.';
  host.innerHTML=`<section class="game milhao milhao-result"><div class="result-trophy">${reason==='win'?'🏆':'🚦'}</div><p class="eyebrow">RESULTADO FINAL</p><h2>${reason==='timeout'?'⏱ TEMPO ACABOU!':reason==='win'?'PARABÉNS!':'FIM DE JOGO'}</h2><p>${reasonText}</p><h2>${name}, você fez ${finalScore.toLocaleString('pt-BR')} pontos</h2><p>${correctCount} acerto(s) em ${answers} resposta(s). Melhor sequência: ${bestStreak}.</p><div class="ranking-box"><h3>Ranking local</h3>${rank.slice(0,5).map((r,n)=>`<div><span>#${n+1} ${r.name}</span><strong>${r.score.toLocaleString('pt-BR')}</strong></div>`).join('')}</div><div class="hero-actions"><button type="button" class="btn primary" id="milhaoAgain">Jogar novamente</button><button type="button" class="btn ghost" id="milhaoClose">Encerrar</button></div></section>`;
  onFinish?.();
  host.querySelector('#milhaoAgain').onclick=()=>openStart();
  host.querySelector('#milhaoClose').onclick=()=>dialog.close();
 };
 host.onclick=e=>e.stopPropagation();
 openStart();
 if(!dialog.open)dialog.showModal();
 dialog.addEventListener('close',()=>{finished=true;stopTimer();try{audienceSession?.broadcast({type:'session-finished'});audienceSession?.close();}catch{}audienceSession=null;},{once:true});
}