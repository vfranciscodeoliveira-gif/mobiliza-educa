const questions=[
{q:'Ao se aproximar de uma faixa de pedestres ocupada, o condutor deve:',a:['Acelerar para passar primeiro','Reduzir e dar passagem com segurança','Buzinar para o pedestre sair','Desviar pela contramão'],correct:1,why:'A travessia deve ser protegida com velocidade compatível e prioridade ao pedestre.'},
{q:'Usar o celular ao dirigir aumenta o risco porque:',a:['Divide a atenção entre a via e outra tarefa','Melhora o tempo de reação','Só atrapalha em rodovias','Reduz a velocidade automaticamente'],correct:0,why:'A distração visual, manual e cognitiva reduz percepção e tempo disponível para reagir.'},
{q:'O cinto de segurança deve ser usado:',a:['Só pelo motorista','Só nos bancos dianteiros','Por todos os ocupantes','Somente em rodovias'],correct:2,why:'Todos os ocupantes precisam estar protegidos, inclusive no banco traseiro.'},
{q:'Em área escolar, a atitude mais segura é:',a:['Acelerar para liberar a via','Adequar a velocidade e redobrar atenção','Parar sobre a faixa','Usar a buzina continuamente'],correct:1,why:'Áreas escolares exigem atenção reforçada, velocidade adequada e respeito às travessias.'},
{q:'Ao ultrapassar um ciclista, é correto:',a:['Passar muito perto','Manter distância lateral segura e só ultrapassar com visibilidade','Buzinar até ele sair','Ultrapassar em curva'],correct:1,why:'Distância lateral e visibilidade reduzem conflitos e protegem usuários vulneráveis.'},
{q:'No semáforo amarelo, o condutor deve:',a:['Acelerar sempre','Reduzir e parar com segurança quando possível','Ignorar a sinalização','Parar no meio do cruzamento'],correct:1,why:'O amarelo indica atenção e transição. A decisão deve priorizar uma parada segura.'},
{q:'Ao atravessar a rua, o pedestre deve:',a:['Usar a faixa e observar os dois sentidos','Correr entre veículos','Olhar apenas para um lado','Usar o celular durante a travessia'],correct:0,why:'A faixa organiza a travessia, mas a observação e a atenção continuam indispensáveis.'},
{q:'Uma criança no veículo deve ser transportada:',a:['De qualquer forma se o trajeto for curto','Conforme as regras de retenção e segurança aplicáveis','No colo de um adulto','Sem cinto no banco traseiro'],correct:1,why:'Dispositivos e formas corretas de retenção reduzem o risco de lesões em colisões e frenagens.'},
{q:'Dirigir acima da velocidade adequada:',a:['Reduz a distância de parada','Aumenta tempo para reagir','Aumenta distância de parada e gravidade dos impactos','Não muda o risco'],correct:2,why:'Quanto maior a velocidade, maior a distância percorrida durante percepção, reação e frenagem.'},
{q:'Convivência segura no trânsito significa:',a:['Cada um defender seu espaço','Agir com previsibilidade, respeito e atenção aos mais vulneráveis','Priorizar apenas os veículos','Ignorar quem circula mais devagar'],correct:1,why:'Segurança viária depende de cooperação, previsibilidade, respeito e proteção dos usuários vulneráveis.'},
{q:'Antes de mudar de faixa, o condutor deve:',a:['Mudar rapidamente sem sinalizar','Sinalizar e verificar espelhos e ponto cego','Apenas buzinar','Olhar somente para frente'],correct:1,why:'Sinalização prévia e verificação do entorno tornam a manobra previsível e reduzem conflitos.'},
{q:'Em pista molhada, a condução mais segura exige:',a:['Aumentar a velocidade','Reduzir a distância do veículo da frente','Reduzir a velocidade e aumentar a distância de segurança','Frear bruscamente nas curvas'],correct:2,why:'A aderência diminui na chuva, aumentando a distância necessária para parar com segurança.'},
{q:'Ao perceber um veículo de emergência em atendimento, com sinais regulamentares acionados, o condutor deve:',a:['Disputar espaço','Facilitar sua passagem com segurança','Acelerar para segui-lo','Parar no meio do cruzamento'],correct:1,why:'A prioridade deve ser facilitada de modo seguro, sem criar novos riscos para os demais usuários.'},
{q:'Para o motociclista, o capacete deve:',a:['Ser usado apenas em rodovias','Estar corretamente colocado e afivelado','Ser levado no braço em trajetos curtos','Ser dispensado em baixa velocidade'],correct:1,why:'O capacete corretamente utilizado é equipamento essencial de proteção.'},
{q:'Ao se aproximar de um cruzamento com visibilidade reduzida, o mais seguro é:',a:['Acelerar para passar logo','Reduzir a velocidade e aumentar a atenção','Usar somente a buzina e seguir','Invadir a faixa contrária'],correct:1,why:'Menor velocidade amplia o tempo disponível para perceber riscos e reagir.'},
{q:'Manter distância segura do veículo da frente ajuda a:',a:['Diminuir o tempo de reação','Evitar qualquer necessidade de atenção','Criar espaço para reagir e frear','Aumentar a velocidade média'],correct:2,why:'A distância de segurança fornece espaço para percepção, reação e frenagem.'},
{q:'Se o motorista estiver cansado ou sonolento, a atitude segura é:',a:['Abrir a janela e seguir normalmente','Aumentar a velocidade para chegar logo','Interromper a condução e descansar em local seguro','Usar o celular para se manter acordado'],correct:2,why:'Sonolência compromete atenção e tempo de reação; continuar dirigindo aumenta o risco.'},
{q:'Ao estacionar, o condutor deve evitar:',a:['Observar a sinalização','Bloquear faixa de pedestres ou acesso de pedestres','Verificar se o local é permitido','Deixar espaço para circulação segura'],correct:1,why:'Áreas de travessia e circulação de pedestres precisam permanecer desobstruídas.'},
{q:'A seta deve ser usada:',a:['Somente em rodovias','Antes de conversões e mudanças de faixa','Apenas quando houver fiscalização','Depois que a manobra já começou'],correct:1,why:'A sinalização deve anteceder a manobra para que os demais usuários possam prever sua intenção.'},
{q:'Ao dirigir, a atenção deve estar:',a:['Principalmente no celular','Dividida com mensagens e vídeos','Voltada ao ambiente viário e aos demais usuários','Somente no veículo da frente'],correct:2,why:'A condução segura depende de atenção contínua ao conjunto do ambiente viário.'}
];

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

 const stopTimer=()=>{if(timer){clearInterval(timer);timer=null;}};
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
  level=0;score=0;pulos=INITIAL_JUMPS;cartas=1;plateia=1;time=INITIAL_TIME;locked=false;selected=null;correctCount=0;bestStreak=0;streak=0;answers=0;questionCursor=0;finished=false;
  order=shuffle(questions.map((_,idx)=>idx));
 };
 const openStart=()=>{
  stopTimer();
  host.innerHTML=`<section class="game milhao milhao-start windows-look"><div class="milhao-rings"></div><div class="milhao-start-stage"><div class="milhao-start-emblem"><div class="milhao-cover-frame"><img class="milhao-start-art" src="assets/games/quiz_do_milhao_do_transito.svg?v=14" alt="Show do Milhão do Trânsito"><div class="milhao-cover-badge">SHOW DO MILHÃO<br><small>DO TRÂNSITO</small></div></div></div><div class="milhao-start-copy"><p class="eyebrow">MOBILIZA EDUCA • DESAFIO PRINCIPAL</p><h2 class="milhao-title-3d">Show do Milhão do Trânsito</h2><p>Responda 15 perguntas e avance até 1.000.000. O pulo troca somente a pergunta, sem mudar o nível ou a premiação.</p><label class="player-name">Nome do jogador<input id="milhaoName" maxlength="40" value="${name==='Jogador'?'':name}" placeholder="Digite seu nome"></label><div class="milhao-rules"><span>⏱ 30 s</span><span>⏭ 3 pulos</span><span>🃏 1 cartas</span><span>👥 1 plateia</span></div><button type="button" class="btn primary big milhao-start-button" id="milhaoStart">▶ COMEÇAR DESAFIO</button></div></div></section>`;
  host.querySelector('#milhaoStart').onclick=async()=>{const btn=host.querySelector('#milhaoStart');btn.disabled=true;name=host.querySelector('#milhaoName').value.trim()||'Jogador';resetGame();await playIntro();render();};
 };
 const ladderHtml=()=>ladder.map((v,n)=>`<span class="${n<level?'done':n===level?'current':''}"><small>${n+1}</small> ${v.toLocaleString('pt-BR')}</span>`).reverse().join('');
 const resumeAfterHelp=()=>{locked=false;startTimer(false);};
 const render=()=>{
  stopTimer();time=INITIAL_TIME;locked=false;selected=null;
  const q=currentQuestion();
  if(!q){end('questions',score);return;}
  host.innerHTML=`<section class="game milhao windows-look milhao-play"><div class="milhao-rings"></div><div class="milhao-top"><div><p class="eyebrow">SHOW DO MILHÃO DO TRÂNSITO</p><h2>${name}</h2><p class="milhao-score">Pontuação acumulada: <strong>${score.toLocaleString('pt-BR')}</strong> • Valendo: <strong>${ladder[level].toLocaleString('pt-BR')}</strong></p></div><div class="milhao-timer" id="milhaoTimer">${INITIAL_TIME}</div></div><div class="milhao-layout windows-layout"><div class="milhao-stage"><div class="milhao-brand-stage"><div class="milhao-logo-disc">SHOW<br><strong>DO MILHÃO</strong><small>DO TRÂNSITO</small></div></div><div class="milhao-question-wrap"><span>Pergunta ${level+1} de ${MAX_LEVELS}</span><h2 class="milhao-question">${q.q}</h2></div><div class="quiz-options milhao-options">${q.a.map((x,n)=>`<button type="button" class="quiz-option" data-answer="${n}"><b>${letters[n]}</b><span>${x}</span></button>`).join('')}</div><div class="milhao-confirm" id="milhaoConfirm" hidden><span>Confirma a alternativa <strong id="confirmLetter"></strong>?</span><button type="button" class="btn primary" id="confirmYes">CONFIRMAR</button><button type="button" class="btn ghost" id="confirmNo">TROCAR</button></div><div class="milhao-aids"><button type="button" class="btn ghost" id="jump" ${pulos?'':'disabled'}>⏭ Pular <b>${pulos}</b></button><button type="button" class="btn ghost" id="cards" ${cartas?'':'disabled'}>🃏 Cartas <b>${cartas}</b></button><button type="button" class="btn ghost" id="audience" ${plateia?'':'disabled'}>👥 Plateia <b>${plateia}</b></button><button type="button" class="btn ghost" id="stopGame">⏹ Parar</button><button type="button" class="btn ghost" id="fullscreen">⛶ Telão</button></div><div id="feedback"></div></div><aside class="milhao-ladder">${ladderHtml()}</aside></div><div id="milhaoHelpOverlay" class="milhao-help-overlay"></div></section>`;
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

   const base=[12,12,12,12];
   base[q.correct]=64;

   const o=host.querySelector('#milhaoHelpOverlay');
   o.className='milhao-help-overlay show audience-overlay';
   o.innerHTML=`<div class="help-stage audience-help audience-help-v13">
      <div class="audience-people" aria-hidden="true">
        <span>●</span><span>●</span><span>●</span><span>●</span><span>●</span><span>●</span><span>●</span>
      </div>
      <h3>PLATEIA</h3>
      <p>O público está votando...</p>
    </div>`;
   await sleep(850);

   o.innerHTML=`<div class="help-stage audience-help audience-help-v13 audience-result-stage">
      <h3>RESULTADO DA PLATEIA</h3>
      <div class="audience-chart">
        ${base.map((p,n)=>`<div class="audience-chart-row"><span>${letters[n]}</span><i><b style="width:${p}%"></b></i><strong>${p}%</strong></div>`).join('')}
      </div>
      <button type="button" class="btn primary audience-continue" id="audienceContinue">CONTINUAR</button>
    </div>`;
   beep(720,.1);

   host.querySelector('#feedback').innerHTML=`<div class="audience-summary"><strong>👥 Plateia:</strong> ${base.map((p,n)=>`<span>${letters[n]} ${p}%</span>`).join('')}</div>`;
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
  const reasonText={win:'Você concluiu as 15 perguntas!',wrong:'Resposta incorreta: a rodada foi encerrada.',timeout:'Tempo esgotado: a rodada foi encerrada.',stop:'Você decidiu parar e levou 100% do acumulado.',questions:'Banco de perguntas insuficiente para continuar.'}[reason]||'Rodada encerrada.';
  host.innerHTML=`<section class="game milhao milhao-result"><div class="result-trophy">${reason==='win'?'🏆':'🚦'}</div><p class="eyebrow">RESULTADO FINAL</p><h2>${reason==='timeout'?'⏱ TEMPO ACABOU!':reason==='win'?'PARABÉNS!':'FIM DE JOGO'}</h2><p>${reasonText}</p><h2>${name}, você fez ${finalScore.toLocaleString('pt-BR')} pontos</h2><p>${correctCount} acerto(s) em ${answers} resposta(s). Melhor sequência: ${bestStreak}.</p><div class="ranking-box"><h3>Ranking local</h3>${rank.slice(0,5).map((r,n)=>`<div><span>#${n+1} ${r.name}</span><strong>${r.score.toLocaleString('pt-BR')}</strong></div>`).join('')}</div><div class="hero-actions"><button type="button" class="btn primary" id="milhaoAgain">Jogar novamente</button><button type="button" class="btn ghost" id="milhaoClose">Encerrar</button></div></section>`;
  onFinish?.();
  host.querySelector('#milhaoAgain').onclick=()=>openStart();
  host.querySelector('#milhaoClose').onclick=()=>dialog.close();
 };
 host.onclick=e=>e.stopPropagation();
 openStart();
 if(!dialog.open)dialog.showModal();
 dialog.addEventListener('close',()=>{finished=true;stopTimer();},{once:true});
}