const PAIRS=[
  {key:'pare',icon:'🛑',title:'PARE',concept:'Parada obrigatória',detail:'A placa PARE exige imobilização antes de prosseguir com segurança.',accent:'#e54b45'},
  {key:'semaforo',icon:'🚦',title:'SEMÁFORO',concept:'Controle do fluxo',detail:'As luzes do semáforo organizam a circulação e devem ser respeitadas.',accent:'#33a36b'},
  {key:'bicicleta',icon:'🚲',title:'BICICLETA',concept:'Respeito ao ciclista',detail:'Mantenha distância lateral segura e compartilhe a via com responsabilidade.',accent:'#3d8edb'},
  {key:'pedestre',icon:'🚸',title:'PEDESTRE',concept:'Travessia segura',detail:'Na faixa, reduza a velocidade e dê prioridade ao pedestre.',accent:'#f0b73d'},
  {key:'cinto',icon:'🛡️',title:'CINTO',concept:'Proteção para todos',detail:'Todos os ocupantes devem utilizar o cinto, inclusive no banco traseiro.',accent:'#775fd2'},
  {key:'veiculo',icon:'🚗',title:'VEÍCULO',concept:'Direção defensiva',detail:'Conduzir com atenção, previsibilidade e distância segura reduz riscos.',accent:'#1d79c7'},
  {key:'velocidade',icon:'30',title:'VELOCIDADE',concept:'Respeite o limite',detail:'A velocidade deve ser compatível com a via, a sinalização e as condições do trânsito.',accent:'#ef8d31'},
  {key:'celular',icon:'📵',title:'CELULAR',concept:'Atenção total',detail:'O celular divide a atenção e aumenta o risco de sinistros.',accent:'#c74a68'}
];

function sleep(ms){return new Promise(r=>setTimeout(r,ms));}
function shuffle(a){const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;}
function clamp(v,min,max){return Math.max(min,Math.min(max,v));}

function saveResult(pairs,moves,score,seconds){
  const s=JSON.parse(localStorage.getItem('mobiliza.results')||'{"games":0,"correct":0,"answers":0,"best":0,"streak":0}');
  s.games=(s.games||0)+1;
  s.correct=(s.correct||0)+pairs;
  s.answers=(s.answers||0)+moves;
  s.best=Math.max(s.best||0,score);
  localStorage.setItem('mobiliza.results',JSON.stringify(s));

  const key='mobiliza.memoria.best';
  const old=JSON.parse(localStorage.getItem(key)||'null');
  const current={score,moves,seconds,date:new Date().toISOString()};
  if(!old||score>old.score||(score===old.score&&moves<old.moves))localStorage.setItem(key,JSON.stringify(current));
}

export function openMemoria(dialog,host,onFinish){
  let deck=[];
  let opened=[];
  let matched=new Set();
  let moves=0;
  let start=Date.now();
  let lock=false;
  let finished=false;
  let soundOn=localStorage.getItem('mobiliza.memoria.sound')!=='0';
  let audioCtx=null;
  let timerId=null;

  const ensureAudio=()=>{
    if(!soundOn)return null;
    try{
      const C=window.AudioContext||window.webkitAudioContext;
      if(!C)return null;
      if(!audioCtx)audioCtx=new C();
      if(audioCtx.state==='suspended')audioCtx.resume();
      return audioCtx;
    }catch{return null;}
  };

  const tone=(freq,duration=.08,delay=0,type='sine',gain=.04)=>{
    const c=ensureAudio();
    if(!c)return;
    const o=c.createOscillator(),g=c.createGain(),t=c.currentTime+delay;
    o.type=type;
    o.frequency.setValueAtTime(freq,t);
    g.gain.setValueAtTime(.0001,t);
    g.gain.exponentialRampToValueAtTime(gain,t+.01);
    g.gain.exponentialRampToValueAtTime(.0001,t+duration);
    o.connect(g);g.connect(c.destination);
    o.start(t);o.stop(t+duration+.03);
  };

  const sounds={
    flip:()=>tone(540,.045,0,'square',.02),
    match:()=>{tone(523,.08,0,'triangle',.045);tone(659,.08,.08,'triangle',.045);tone(784,.15,.16,'triangle',.05);},
    miss:()=>{tone(300,.08,0,'sawtooth',.03);tone(210,.12,.08,'sawtooth',.03);},
    click:()=>tone(470,.04,0,'square',.018),
    finish:()=>{tone(523,.09,0,'triangle',.05);tone(659,.09,.09,'triangle',.05);tone(784,.09,.18,'triangle',.05);tone(1046,.25,.27,'triangle',.06);}
  };

  const buildDeck=()=>{
    const cards=[];
    PAIRS.forEach((p,index)=>{
      cards.push({id:`${p.key}-symbol-${index}`,key:p.key,type:'symbol',pair:p});
      cards.push({id:`${p.key}-concept-${index}`,key:p.key,type:'concept',pair:p});
    });
    deck=shuffle(cards);
  };

  const elapsed=()=>Math.floor((Date.now()-start)/1000);
  const matchedPairs=()=>matched.size/2;
  const scoreNow=()=>Math.max(100,3000-(moves*55)-(elapsed()*3));

  const bestText=()=>{
    const best=JSON.parse(localStorage.getItem('mobiliza.memoria.best')||'null');
    return best?`${best.score} pts • ${best.moves} jogadas`:'Sem recorde';
  };

  const cardFront=c=>c.type==='symbol'
    ?`<div class="memory-symbol" style="--memory-accent:${c.pair.accent}"><b>${c.pair.icon}</b><strong>${c.pair.title}</strong><small>SÍMBOLO</small></div>`
    :`<div class="memory-concept" style="--memory-accent:${c.pair.accent}"><span>CONCEITO</span><strong>${c.pair.concept}</strong><small>${c.pair.title}</small></div>`;

  const render=()=>{
    host.innerHTML=`<section class="game memory-game memory-v20">
      <div class="memory-hero">
        <img src="assets/games/jogo_da_memoria_mobiliza_educa.svg?v=20" alt="Jogo da Memória Mobiliza Educa">
        <div>
          <p class="eyebrow">JOGO DA MEMÓRIA</p>
          <h2>Encontre os pares do trânsito</h2>
          <p>Associe cada símbolo ao seu conceito de segurança no trânsito.</p>
        </div>
      </div>

      <div class="memory-dashboard">
        <div class="memory-stat"><span>🎯 Jogadas</span><strong id="memoryMoves">${moves}</strong></div>
        <div class="memory-stat"><span>🧩 Pares</span><strong><b id="memoryPairs">${matchedPairs()}</b>/${PAIRS.length}</strong></div>
        <div class="memory-stat"><span>⏱ Tempo</span><strong id="memoryTime">0s</strong></div>
        <div class="memory-stat"><span>⭐ Pontos</span><strong id="memoryScore">${scoreNow()}</strong></div>
        <div class="memory-actions">
          <button type="button" class="btn ghost" id="memorySound">${soundOn?'🔊 Som':'🔇 Som'}</button>
          <button type="button" class="btn ghost" id="memoryRules">❔ Como jogar</button>
          <button type="button" class="btn ghost" id="memoryRestart">↻ Reiniciar</button>
        </div>
      </div>

      <div class="memory-board-wrap">
        <div class="memory-grid" id="memoryGrid">
          ${deck.map(c=>`<button type="button" class="memory-card ${matched.has(c.id)?'matched open':''}" data-card="${c.id}" aria-label="Carta da memória">
            <span class="memory-card-inner">
              <span class="memory-back"><i>🧠</i><strong>MOBILIZA</strong><small>MEMÓRIA</small></span>
              <span class="memory-front">${cardFront(c)}</span>
            </span>
          </button>`).join('')}
        </div>
      </div>

      <div class="memory-footer">
        <div class="memory-hint" id="memoryHint"><span>💡</span><strong>Encontre o símbolo e o conceito correspondente.</strong></div>
        <div class="memory-best"><span>🏆 Melhor</span><strong>${bestText()}</strong></div>
      </div>

      <div id="memoryToast" class="memory-toast" aria-live="polite"></div>
      <div id="memoryOverlay" class="memory-overlay"></div>
    </section>`;

    host.querySelectorAll('[data-card]').forEach(b=>b.onclick=e=>{
      e.preventDefault();e.stopPropagation();
      flip(b.dataset.card);
    });

    host.querySelector('#memorySound').onclick=()=>{
      soundOn=!soundOn;
      localStorage.setItem('mobiliza.memoria.sound',soundOn?'1':'0');
      if(soundOn){ensureAudio();sounds.click();}
      const btn=host.querySelector('#memorySound');
      if(btn)btn.textContent=soundOn?'🔊 Som':'🔇 Som';
    };
    host.querySelector('#memoryRules').onclick=showRules;
    host.querySelector('#memoryRestart').onclick=confirmRestart;

    startTimer();
  };

  const startTimer=()=>{
    if(timerId)clearInterval(timerId);
    const update=()=>{
      if(finished)return;
      const t=host.querySelector('#memoryTime');
      const s=host.querySelector('#memoryScore');
      if(t)t.textContent=elapsed()+'s';
      if(s)s.textContent=scoreNow();
    };
    update();
    timerId=setInterval(update,500);
  };

  const updateHud=()=>{
    const m=host.querySelector('#memoryMoves');
    const p=host.querySelector('#memoryPairs');
    const s=host.querySelector('#memoryScore');
    if(m)m.textContent=moves;
    if(p)p.textContent=matchedPairs();
    if(s)s.textContent=scoreNow();
  };

  const overlay=(html,extra='')=>{
    const o=host.querySelector('#memoryOverlay');
    if(!o)return null;
    o.className=`memory-overlay show ${extra}`;
    o.innerHTML=html;
    return o;
  };

  const closeOverlay=()=>{
    const o=host.querySelector('#memoryOverlay');
    if(!o)return;
    o.className='memory-overlay';
    o.innerHTML='';
  };

  const showToast=(pair,ok)=>{
    const t=host.querySelector('#memoryToast');
    if(!t)return;
    t.className=`memory-toast show ${ok?'ok':'miss'}`;
    t.innerHTML=ok
      ?`<span class="memory-toast-icon">${pair.icon}</span><div><strong>${pair.title} ↔ ${pair.concept}</strong><small>${pair.detail}</small></div>`
      :'<span class="memory-toast-icon">↻</span><div><strong>Não formou par.</strong><small>Observe as cartas e tente novamente na próxima jogada.</small></div>';
    setTimeout(()=>{if(t)t.className='memory-toast';},ok?1800:1100);
  };

  const flip=async id=>{
    if(lock||finished||matched.has(id)||opened.includes(id))return;
    ensureAudio();
    sounds.flip();

    const card=deck.find(c=>c.id===id);
    const el=host.querySelector(`[data-card="${id}"]`);
    if(!card||!el)return;

    el.classList.add('open');
    opened.push(id);

    if(opened.length<2)return;

    lock=true;
    moves++;
    updateHud();

    const [a,b]=opened.map(x=>deck.find(c=>c.id===x));
    const pair=a.key===b.key&&a.id!==b.id;

    if(pair){
      matched.add(a.id);
      matched.add(b.id);
      host.querySelector(`[data-card="${a.id}"]`)?.classList.add('matched');
      host.querySelector(`[data-card="${b.id}"]`)?.classList.add('matched');
      sounds.match();
      showToast(a.pair,true);
      opened=[];
      lock=false;
      updateHud();

      if(matched.size===deck.length){
        await sleep(900);
        finish();
      }
    }else{
      sounds.miss();
      showToast(a.pair,false);
      await sleep(950);
      opened.forEach(x=>host.querySelector(`[data-card="${x}"]`)?.classList.remove('open'));
      opened=[];
      lock=false;
    }
  };

  const showRules=()=>{
    sounds.click();
    const o=overlay(`<div class="memory-modal memory-rules-modal">
      <div class="memory-modal-icon">🧠</div>
      <p class="eyebrow">COMO JOGAR</p>
      <h3>Associe símbolo e conceito</h3>
      <div class="memory-rules-list">
        <p><b>1.</b> Clique em uma carta para virá-la.</p>
        <p><b>2.</b> Vire uma segunda carta.</p>
        <p><b>3.</b> O par correto é formado por <strong>símbolo + conceito</strong> do mesmo tema.</p>
        <p><b>4.</b> Ao acertar, o par permanece aberto e você recebe uma explicação educativa.</p>
        <p><b>5.</b> Complete os 8 pares com o menor número de jogadas e no menor tempo.</p>
      </div>
      <button type="button" class="btn primary" id="memoryRulesClose">ENTENDI</button>
    </div>`,'rules-overlay');
    o.querySelector('#memoryRulesClose').onclick=()=>{sounds.click();closeOverlay();};
  };

  const confirmRestart=()=>{
    sounds.click();
    const o=overlay(`<div class="memory-modal">
      <div class="memory-modal-icon">↻</div>
      <h3>Reiniciar o jogo?</h3>
      <p>As cartas serão embaralhadas e a pontuação atual será perdida.</p>
      <div class="memory-modal-actions">
        <button type="button" class="btn primary" id="memoryRestartYes">SIM, REINICIAR</button>
        <button type="button" class="btn ghost" id="memoryRestartNo">CANCELAR</button>
      </div>
    </div>`,'restart-overlay');
    o.querySelector('#memoryRestartYes').onclick=()=>{sounds.click();if(timerId)clearInterval(timerId);openMemoria(dialog,host,onFinish);};
    o.querySelector('#memoryRestartNo').onclick=()=>{sounds.click();closeOverlay();};
  };

  const finish=()=>{
    if(finished)return;
    finished=true;
    if(timerId)clearInterval(timerId);
    const seconds=elapsed();
    const score=clamp(3000-(moves*55)-(seconds*3),100,9999);
    saveResult(PAIRS.length,moves,score,seconds);
    sounds.finish();
    onFinish?.();

    host.innerHTML=`<section class="game memory-result memory-v20">
      <img class="memory-result-cover" src="assets/games/jogo_da_memoria_mobiliza_educa.svg?v=20" alt="">
      <div class="result-trophy">🧠</div>
      <p class="eyebrow">MEMÓRIA CONCLUÍDA!</p>
      <h2>Você encontrou todos os pares!</h2>
      <div class="memory-result-stats">
        <div><span>🎯 Jogadas</span><strong>${moves}</strong></div>
        <div><span>⏱ Tempo</span><strong>${seconds}s</strong></div>
        <div><span>⭐ Pontos</span><strong>${score}</strong></div>
      </div>
      <p>Você associou sinais, equipamentos e atitudes de segurança no trânsito.</p>
      <div class="hero-actions">
        <button type="button" class="btn primary" id="memoryAgain">Jogar novamente</button>
        <button type="button" class="btn ghost" id="memoryClose">Encerrar</button>
      </div>
    </section>`;

    host.querySelector('#memoryAgain').onclick=()=>openMemoria(dialog,host,onFinish);
    host.querySelector('#memoryClose').onclick=()=>dialog.close();
  };

  buildDeck();
  render();
  if(!dialog.open)dialog.showModal();
}