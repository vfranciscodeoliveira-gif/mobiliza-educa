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

function ensureMemoryV21Styles(){
  if(document.getElementById('memory-v21-critical'))return;
  const style=document.createElement('style');
  style.id='memory-v21-critical';
  style.textContent=`
  #gameDialog.memory-dialog-fit{width:min(1320px,96vw)!important;max-width:96vw!important;max-height:94vh!important;overflow:hidden!important}
  #gameDialog.memory-dialog-fit>.dialog-shell{height:94vh!important;max-height:94vh!important;overflow:hidden!important;border-radius:24px!important;background:#fff!important}
  #gameDialog.memory-dialog-fit #gameHost{height:100%!important;min-height:0!important;overflow:hidden!important}
  #gameDialog.memory-dialog-fit .dialog-close{position:absolute!important;right:12px!important;top:12px!important;z-index:200!important;margin:0!important}

  .memory-v21{box-sizing:border-box!important;height:100%!important;max-height:100%!important;min-height:0!important;overflow:hidden!important;display:grid!important;grid-template-rows:72px 48px minmax(0,1fr) 34px!important;gap:6px!important;padding:8px 12px 10px!important;position:relative!important;background:linear-gradient(180deg,#f9fcff,#eef7fb)!important}
  .memory-v21 .memory-hero{display:grid!important;grid-template-columns:145px minmax(0,1fr)!important;gap:14px!important;align-items:center!important;margin:0!important;padding:7px 12px!important;min-height:0!important;border-radius:15px!important;background:linear-gradient(135deg,#0a3f70,#0f6ca4 58%,#1491b6)!important;color:#fff!important}
  .memory-v21 .memory-hero img{width:145px!important;height:58px!important;object-fit:cover!important;border-radius:11px!important;box-shadow:0 5px 14px rgba(0,0,0,.20)!important}
  .memory-v21 .memory-hero .eyebrow{margin:0 0 1px!important;font-size:.52rem!important;color:#fff!important;letter-spacing:.12em!important}
  .memory-v21 .memory-hero h2{margin:0 0 2px!important;font-size:1.32rem!important;line-height:1.05!important;color:#fff!important}
  .memory-v21 .memory-hero p{margin:0!important;font-size:.68rem!important;line-height:1.2!important;color:#e8f6ff!important}

  .memory-v21 .memory-dashboard{display:grid!important;grid-template-columns:repeat(4,minmax(86px,1fr)) 255px!important;gap:5px!important;align-items:stretch!important;min-height:0!important}
  .memory-v21 .memory-stat,.memory-v21 .memory-actions{min-height:0!important;height:48px!important;border-radius:12px!important;border:1px solid #d6e5ef!important;background:#fff!important;box-shadow:0 4px 12px rgba(15,60,102,.05)!important}
  .memory-v21 .memory-stat{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:6px!important;padding:5px 8px!important}
  .memory-v21 .memory-stat span{font-size:.60rem!important;color:#668094!important;font-weight:800!important}
  .memory-v21 .memory-stat strong{font-size:.94rem!important;color:#173f60!important}
  .memory-v21 .memory-actions{display:flex!important;align-items:center!important;justify-content:flex-end!important;gap:4px!important;padding:5px!important}
  .memory-v21 .memory-actions .btn{min-height:28px!important;padding:4px 7px!important;border-radius:9px!important;font-size:.60rem!important;white-space:nowrap!important}

  .memory-v21 .memory-board-wrap{min-height:0!important;height:100%!important;overflow:hidden!important;padding:5px!important;border-radius:16px!important;border:1px solid #cbe1ec!important;background:linear-gradient(145deg,#eaf8ff,#fffaf0)!important}
  .memory-v21 .memory-grid{width:100%!important;height:100%!important;min-height:0!important;display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;grid-template-rows:repeat(4,minmax(0,1fr))!important;gap:5px!important;padding:0!important;margin:0!important}
  .memory-v21 .memory-card{position:relative!important;display:block!important;min-height:0!important;height:auto!important;margin:0!important;padding:0!important;border:0!important;background:transparent!important;box-shadow:none!important;border-radius:11px!important;perspective:1000px!important;overflow:visible!important}
  .memory-v21 .memory-card-inner{position:absolute!important;inset:0!important;display:block!important;transform-style:preserve-3d!important;transition:transform .46s cubic-bezier(.2,.72,.2,1)!important}
  .memory-v21 .memory-card.open .memory-card-inner,.memory-v21 .memory-card.matched .memory-card-inner{transform:rotateY(180deg)!important}
  .memory-v21 .memory-card:not(.open):not(.matched):hover .memory-card-inner{transform:translateY(-2px) scale(1.012)!important}

  .memory-v21 .memory-back,.memory-v21 .memory-front{position:absolute!important;inset:0!important;display:grid!important;place-items:center!important;align-content:center!important;width:auto!important;height:auto!important;min-height:0!important;margin:0!important;padding:5px!important;border-radius:11px!important;backface-visibility:hidden!important;-webkit-backface-visibility:hidden!important;overflow:hidden!important}
  .memory-v21 .memory-back{transform:rotateY(0deg)!important;background:radial-gradient(circle at 50% 34%,rgba(82,168,255,.32),transparent 25%),linear-gradient(145deg,#0d5bc6,#05265f)!important;color:#fff!important;border:2px solid rgba(255,255,255,.20)!important}
  .memory-v21 .memory-front{transform:rotateY(180deg)!important;background:linear-gradient(180deg,#fff,#f4f9fc)!important;border:2px solid #d7e6ef!important}
  .memory-v21 .memory-back i{font-style:normal!important;font-size:1.05rem!important;line-height:1!important}
  .memory-v21 .memory-back strong{margin-top:3px!important;font-size:.55rem!important;letter-spacing:.07em!important;line-height:1!important}
  .memory-v21 .memory-back small{margin-top:1px!important;font-size:.35rem!important;letter-spacing:.12em!important;line-height:1!important}
  .memory-v21 .memory-symbol,.memory-v21 .memory-concept{width:100%!important;height:100%!important;display:grid!important;place-items:center!important;align-content:center!important;text-align:center!important;gap:1px!important;position:relative!important}
  .memory-v21 .memory-symbol b{font-size:1.25rem!important;line-height:1!important}
  .memory-v21 .memory-symbol strong,.memory-v21 .memory-concept strong{font-size:.55rem!important;line-height:1.05!important;color:#173e5d!important}
  .memory-v21 .memory-symbol small,.memory-v21 .memory-concept small,.memory-v21 .memory-concept span{font-size:.31rem!important;line-height:1!important}
  .memory-v21 .memory-symbol::before,.memory-v21 .memory-concept::before{top:4px!important;left:6px!important;right:6px!important;height:3px!important}
  .memory-v21 .memory-card.matched::after{width:16px!important;height:16px!important;right:4px!important;top:4px!important;font-size:.58rem!important}

  .memory-v21 .memory-footer{display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;gap:6px!important;min-height:0!important;height:34px!important}
  .memory-v21 .memory-hint,.memory-v21 .memory-best{display:flex!important;align-items:center!important;gap:6px!important;border-radius:10px!important;border:1px solid #d5e5ee!important;background:#fff!important;padding:4px 7px!important;font-size:.54rem!important;color:#557185!important}
  .memory-v21 .memory-best{min-width:190px!important;justify-content:space-between!important}
  .memory-v21 .memory-toast{bottom:40px!important}

  @media(max-height:650px) and (min-width:761px){
    .memory-v21{grid-template-rows:60px 42px minmax(0,1fr) 30px!important;gap:4px!important;padding:6px 9px 7px!important}
    .memory-v21 .memory-hero{grid-template-columns:115px minmax(0,1fr)!important;padding:5px 9px!important}
    .memory-v21 .memory-hero img{width:115px!important;height:48px!important}
    .memory-v21 .memory-hero h2{font-size:1.12rem!important}
    .memory-v21 .memory-hero p{font-size:.58rem!important}
    .memory-v21 .memory-dashboard{grid-template-columns:repeat(4,minmax(70px,1fr)) 230px!important}
    .memory-v21 .memory-stat,.memory-v21 .memory-actions{height:42px!important}
    .memory-v21 .memory-stat span{font-size:.52rem!important}
    .memory-v21 .memory-stat strong{font-size:.82rem!important}
    .memory-v21 .memory-actions .btn{font-size:.54rem!important;padding:3px 5px!important;min-height:25px!important}
    .memory-v21 .memory-grid{gap:4px!important}
    .memory-v21 .memory-back i{font-size:.92rem!important}
    .memory-v21 .memory-back strong{font-size:.48rem!important}
    .memory-v21 .memory-symbol b{font-size:1.05rem!important}
    .memory-v21 .memory-symbol strong,.memory-v21 .memory-concept strong{font-size:.48rem!important}
    .memory-v21 .memory-footer{height:30px!important}
    .memory-v21 .memory-hint,.memory-v21 .memory-best{font-size:.48rem!important;padding:3px 6px!important}
  }

  @media(max-width:760px){
    #gameDialog.memory-dialog-fit>.dialog-shell{height:auto!important;max-height:94vh!important;overflow:auto!important}
    #gameDialog.memory-dialog-fit #gameHost{height:auto!important;overflow:visible!important}
    .memory-v21{height:auto!important;max-height:none!important;overflow:visible!important;display:block!important}
    .memory-v21 .memory-hero{grid-template-columns:1fr!important;height:auto!important}
    .memory-v21 .memory-hero img{width:100%!important;height:auto!important;max-height:150px!important}
    .memory-v21 .memory-dashboard{grid-template-columns:repeat(2,1fr)!important;margin:7px 0!important}
    .memory-v21 .memory-actions{grid-column:1/-1!important}
    .memory-v21 .memory-board-wrap{height:auto!important}
    .memory-v21 .memory-grid{height:auto!important;grid-template-columns:repeat(2,1fr)!important;grid-template-rows:none!important}
    .memory-v21 .memory-card{min-height:100px!important}
    .memory-v21 .memory-footer{height:auto!important;grid-template-columns:1fr!important;margin-top:7px!important}
  }`;
  document.head.appendChild(style);
}

export function openMemoria(dialog,host,onFinish){
  ensureMemoryV21Styles();
  dialog.classList.add('memory-dialog-fit');
  dialog.addEventListener('close',()=>dialog.classList.remove('memory-dialog-fit'),{once:true});
  const footerVersion=document.querySelector('footer span:first-child');
  if(footerVersion)footerVersion.textContent='Mobiliza Educa • versão web 0.10.3';
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
    host.innerHTML=`<section class="game memory-game memory-v21">
      <div class="memory-hero">
        <img src="assets/games/jogo_da_memoria_mobiliza_educa.svg?v=21" alt="Jogo da Memória Mobiliza Educa">
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

    host.innerHTML=`<section class="game memory-result memory-v21">
      <img class="memory-result-cover" src="assets/games/jogo_da_memoria_mobiliza_educa.svg?v=21" alt="">
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