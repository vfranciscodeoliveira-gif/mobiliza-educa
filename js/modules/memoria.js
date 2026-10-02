const ALL_PAIRS=[
  {key:'pare',title:'PARE',image:'assets/memory/pare.svg?v=22',detail:'A placa PARE determina parada obrigatória antes de prosseguir com segurança.'},
  {key:'semaforo',title:'SEMÁFORO',image:'assets/memory/semaforo.svg?v=22',detail:'O semáforo organiza os fluxos e suas indicações devem ser respeitadas.'},
  {key:'pedestre',title:'PEDESTRE',image:'assets/memory/pedestre.svg?v=22',detail:'Na travessia, atenção e prioridade ao pedestre ajudam a prevenir sinistros.'},
  {key:'bicicleta',title:'BICICLETA',image:'assets/memory/bicicleta.svg?v=22',detail:'Ciclistas precisam de espaço, previsibilidade e respeito dos demais usuários da via.'},
  {key:'cinto',title:'CINTO',image:'assets/memory/cinto.svg?v=22',detail:'O cinto deve ser utilizado por todos os ocupantes, inclusive no banco traseiro.'},
  {key:'celular',title:'CELULAR',image:'assets/memory/celular.svg?v=22',detail:'Usar celular ao dirigir divide a atenção e aumenta o risco.'},
  {key:'velocidade',title:'VELOCIDADE',image:'assets/memory/velocidade.svg?v=22',detail:'Respeitar os limites e as condições da via reduz a gravidade dos riscos.'},
  {key:'escola',title:'ÁREA ESCOLAR',image:'assets/memory/escola.svg?v=22',detail:'Em área escolar, reduza a velocidade e redobre a atenção.'},
  {key:'capacete',title:'CAPACETE',image:'assets/memory/capacete.svg?v=22',detail:'O capacete corretamente afivelado é essencial para a segurança do motociclista.'},
  {key:'faixa',title:'FAIXA',image:'assets/memory/faixa.svg?v=22',detail:'A faixa organiza a travessia e deve ser respeitada por condutores e pedestres.'}
];

const LEVELS={
  easy:{label:'Fácil',pairs:6,cols:4,rows:3,bonus:1},
  medium:{label:'Médio',pairs:8,cols:4,rows:4,bonus:1.25},
  hard:{label:'Difícil',pairs:10,cols:5,rows:4,bonus:1.5}
};

function sleep(ms){return new Promise(r=>setTimeout(r,ms));}
function shuffle(a){const b=[...a];for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];}return b;}
function clamp(v,min,max){return Math.max(min,Math.min(max,v));}

function ensureMemoryStyles(){
  if(document.getElementById('memory-v22-critical'))return;
  const s=document.createElement('style');
  s.id='memory-v22-critical';
  s.textContent=`
  #gameDialog.memory-dialog-v22{width:min(1320px,96vw)!important;max-width:96vw!important;max-height:94vh!important;overflow:hidden!important}
  #gameDialog.memory-dialog-v22>.dialog-shell{height:94vh!important;max-height:94vh!important;overflow:hidden!important;background:#fff!important}
  #gameDialog.memory-dialog-v22 #gameHost{height:100%!important;min-height:0!important;overflow:hidden!important}
  #gameDialog.memory-dialog-v22 .dialog-close{position:absolute!important;right:12px!important;top:12px!important;z-index:300!important;margin:0!important}

  .memory-v22{box-sizing:border-box!important;height:100%!important;min-height:0!important;overflow:hidden!important;display:grid!important;grid-template-rows:66px 46px minmax(0,1fr) 34px!important;gap:6px!important;padding:8px 12px 10px!important;position:relative!important;background:linear-gradient(180deg,#f9fcff,#eef7fb)!important}
  .memory-v22 .memory-hero{display:grid!important;grid-template-columns:130px minmax(0,1fr)!important;align-items:center!important;gap:13px!important;margin:0!important;padding:6px 12px!important;min-height:0!important;border-radius:14px!important;background:linear-gradient(135deg,#0a3f70,#0f6ca4 58%,#1590b5)!important;color:#fff!important}
  .memory-v22 .memory-hero img{width:130px!important;height:52px!important;object-fit:cover!important;border-radius:10px!important;box-shadow:0 4px 12px rgba(0,0,0,.2)!important}
  .memory-v22 .memory-hero .eyebrow{margin:0 0 1px!important;font-size:.49rem!important;letter-spacing:.12em!important;color:#fff!important}
  .memory-v22 .memory-hero h2{margin:0 0 2px!important;font-size:1.22rem!important;line-height:1.04!important;color:#fff!important}
  .memory-v22 .memory-hero p{margin:0!important;font-size:.62rem!important;line-height:1.2!important;color:#e8f6ff!important}

  .memory-v22 .memory-toolbar{display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;gap:7px!important;min-height:0!important}
  .memory-v22 .memory-stats{display:grid!important;grid-template-columns:repeat(4,minmax(80px,1fr))!important;gap:5px!important}
  .memory-v22 .memory-stat{height:46px!important;min-height:0!important;display:flex!important;align-items:center!important;justify-content:space-between!important;gap:6px!important;padding:5px 8px!important;border-radius:11px!important;background:#fff!important;border:1px solid #d4e5ef!important;box-shadow:0 3px 9px rgba(15,60,102,.05)!important}
  .memory-v22 .memory-stat span{font-size:.56rem!important;color:#688093!important;font-weight:800!important}
  .memory-v22 .memory-stat strong{font-size:.9rem!important;color:#173f60!important}

  .memory-v22 .memory-tools{height:46px!important;display:flex!important;align-items:center!important;gap:4px!important;padding:4px!important;border-radius:11px!important;background:#fff!important;border:1px solid #d4e5ef!important}
  .memory-v22 .memory-levels{display:flex!important;gap:3px!important;align-items:center!important}
  .memory-v22 .memory-level{min-height:28px!important;padding:4px 7px!important;border:1px solid #cddde8!important;border-radius:8px!important;background:#f8fbfd!important;color:#31536c!important;font-size:.56rem!important;font-weight:900!important;cursor:pointer!important}
  .memory-v22 .memory-level.active{background:#0f649b!important;color:#fff!important;border-color:#0f649b!important;box-shadow:0 4px 10px rgba(15,100,155,.18)!important}
  .memory-v22 .memory-tool-btn{min-height:28px!important;padding:4px 7px!important;border:1px solid #cddde8!important;border-radius:8px!important;background:#fff!important;color:#31536c!important;font-size:.56rem!important;font-weight:900!important;cursor:pointer!important}

  .memory-v22 .memory-board-wrap{min-height:0!important;height:100%!important;overflow:hidden!important;padding:5px!important;border-radius:16px!important;border:1px solid #cbe1ec!important;background:linear-gradient(145deg,#e8f7ff,#fffaf0)!important}
  .memory-v22 .memory-grid{width:100%!important;height:100%!important;min-height:0!important;display:grid!important;gap:5px!important;padding:0!important;margin:0!important}
  .memory-v22.level-easy .memory-grid{grid-template-columns:repeat(4,minmax(0,1fr))!important;grid-template-rows:repeat(3,minmax(0,1fr))!important}
  .memory-v22.level-medium .memory-grid{grid-template-columns:repeat(4,minmax(0,1fr))!important;grid-template-rows:repeat(4,minmax(0,1fr))!important}
  .memory-v22.level-hard .memory-grid{grid-template-columns:repeat(5,minmax(0,1fr))!important;grid-template-rows:repeat(4,minmax(0,1fr))!important}

  .memory-v22 .memory-card{position:relative!important;display:block!important;min-height:0!important;height:auto!important;margin:0!important;padding:0!important;border:0!important;background:transparent!important;border-radius:11px!important;perspective:1000px!important;cursor:pointer!important}
  .memory-v22 .memory-card-inner{position:absolute!important;inset:0!important;transform-style:preserve-3d!important;transition:transform .46s cubic-bezier(.2,.75,.2,1),filter .18s ease!important}
  .memory-v22 .memory-card.open .memory-card-inner,.memory-v22 .memory-card.matched .memory-card-inner{transform:rotateY(180deg)!important}
  .memory-v22 .memory-card:not(.open):not(.matched):hover .memory-card-inner{transform:translateY(-2px) scale(1.012)!important}
  .memory-v22 .memory-card.matched .memory-card-inner{filter:drop-shadow(0 0 9px rgba(43,181,101,.28))!important}

  .memory-v22 .memory-back,.memory-v22 .memory-front{position:absolute!important;inset:0!important;display:grid!important;place-items:center!important;align-content:center!important;width:auto!important;height:auto!important;padding:5px!important;border-radius:11px!important;backface-visibility:hidden!important;-webkit-backface-visibility:hidden!important;overflow:hidden!important}
  .memory-v22 .memory-back{transform:rotateY(0deg)!important;background:radial-gradient(circle at 50% 30%,rgba(82,168,255,.30),transparent 25%),linear-gradient(145deg,#0d5bc6,#05265f)!important;color:#fff!important;border:2px solid rgba(255,255,255,.2)!important;box-shadow:inset 0 0 0 1px rgba(255,255,255,.07),0 4px 10px rgba(0,0,0,.14)!important}
  .memory-v22 .memory-back::before{content:"";position:absolute!important;inset:6px!important;border:1px solid rgba(255,255,255,.15)!important;border-radius:8px!important}
  .memory-v22 .memory-card-no{position:relative!important;z-index:2!important;display:grid!important;place-items:center!important;width:44px!important;height:44px!important;border-radius:50%!important;background:linear-gradient(145deg,#fff,#dcecff)!important;color:#0b4d8f!important;font-size:1.35rem!important;font-weight:1000!important;box-shadow:0 4px 12px rgba(0,0,0,.18)!important;border:3px solid rgba(255,255,255,.65)!important}
  .memory-v22 .memory-back small{position:relative!important;z-index:2!important;margin-top:4px!important;font-size:.38rem!important;letter-spacing:.13em!important;font-weight:900!important;opacity:.76!important}
  .memory-v22 .memory-front{transform:rotateY(180deg)!important;background:#fff!important;border:2px solid #d8e6ef!important;padding:4px!important}
  .memory-v22 .memory-front img{width:100%!important;height:calc(100% - 19px)!important;min-height:0!important;object-fit:cover!important;border-radius:7px!important;background:#eef6fa!important}
  .memory-v22 .memory-front strong{height:18px!important;display:flex!important;align-items:center!important;justify-content:center!important;width:100%!important;font-size:.48rem!important;line-height:1!important;color:#173e5d!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
  .memory-v22 .memory-card.matched::after{content:"✓";position:absolute!important;right:4px!important;top:4px!important;z-index:8!important;display:grid!important;place-items:center!important;width:17px!important;height:17px!important;border-radius:50%!important;background:#27aa63!important;color:#fff!important;font-size:.58rem!important;font-weight:1000!important;box-shadow:0 2px 6px rgba(0,0,0,.18)!important}

  .memory-v22 .memory-footer{display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;gap:6px!important;height:34px!important;min-height:0!important}
  .memory-v22 .memory-hint,.memory-v22 .memory-best{height:34px!important;display:flex!important;align-items:center!important;gap:6px!important;padding:4px 7px!important;border-radius:10px!important;background:#fff!important;border:1px solid #d5e5ee!important;color:#557185!important;font-size:.52rem!important}
  .memory-v22 .memory-best{min-width:190px!important;justify-content:space-between!important}

  .memory-v22 .memory-toast{position:absolute!important;left:50%!important;bottom:40px!important;z-index:90!important;width:min(560px,80%)!important;transform:translate(-50%,15px)!important;opacity:0!important;pointer-events:none!important;display:flex!important;align-items:center!important;gap:9px!important;padding:9px 11px!important;border-radius:14px!important;background:rgba(6,45,79,.96)!important;color:#fff!important;box-shadow:0 14px 32px rgba(0,0,0,.24)!important;transition:.2s!important}
  .memory-v22 .memory-toast.show{opacity:1!important;transform:translate(-50%,0)!important}
  .memory-v22 .memory-toast.ok{background:rgba(16,108,67,.97)!important}
  .memory-v22 .memory-toast.miss{background:rgba(112,61,40,.97)!important}
  .memory-v22 .memory-toast img{width:52px!important;height:38px!important;object-fit:cover!important;border-radius:7px!important;background:#fff!important}
  .memory-v22 .memory-toast strong{display:block!important;font-size:.7rem!important}
  .memory-v22 .memory-toast small{display:block!important;margin-top:2px!important;font-size:.55rem!important;line-height:1.2!important;color:#e7f2f8!important}

  .memory-v22 .memory-overlay{position:absolute!important;inset:0!important;z-index:120!important;display:grid!important;place-items:center!important;opacity:0!important;pointer-events:none!important;background:rgba(3,18,37,.10)!important;transition:.2s!important}
  .memory-v22 .memory-overlay.show{opacity:1!important;pointer-events:auto!important;background:rgba(3,18,37,.70)!important;backdrop-filter:blur(2px)!important}
  .memory-v22 .memory-modal{width:min(560px,88%)!important;display:grid!important;justify-items:center!important;gap:10px!important;text-align:center!important;padding:22px 26px!important;border-radius:22px!important;color:#fff!important;background:linear-gradient(180deg,#0b477a,#062c54)!important;border:2px solid rgba(255,255,255,.24)!important;box-shadow:0 26px 74px rgba(0,0,0,.42)!important}
  .memory-v22 .memory-modal h3{margin:0!important;font-size:1.45rem!important}
  .memory-v22 .memory-modal p{margin:0!important;color:#dceefa!important;line-height:1.4!important}
  .memory-v22 .memory-modal-actions{display:flex!important;justify-content:center!important;gap:8px!important;flex-wrap:wrap!important}
  .memory-v22 .memory-level-picker{display:grid!important;grid-template-columns:repeat(3,1fr)!important;gap:8px!important;width:100%!important}
  .memory-v22 .memory-level-choice{display:grid!important;gap:3px!important;padding:12px!important;border-radius:14px!important;border:1px solid rgba(255,255,255,.18)!important;background:rgba(255,255,255,.08)!important;color:#fff!important;cursor:pointer!important}
  .memory-v22 .memory-level-choice strong{font-size:.94rem!important}
  .memory-v22 .memory-level-choice small{font-size:.63rem!important;color:#cfe6f5!important}

  @media(max-height:650px) and (min-width:761px){
    .memory-v22{grid-template-rows:56px 40px minmax(0,1fr) 28px!important;gap:4px!important;padding:6px 9px 7px!important}
    .memory-v22 .memory-hero{grid-template-columns:105px minmax(0,1fr)!important;padding:4px 8px!important}
    .memory-v22 .memory-hero img{width:105px!important;height:44px!important}
    .memory-v22 .memory-hero h2{font-size:1.05rem!important}
    .memory-v22 .memory-hero p{font-size:.52rem!important}
    .memory-v22 .memory-stat,.memory-v22 .memory-tools{height:40px!important}
    .memory-v22 .memory-stat span{font-size:.48rem!important}
    .memory-v22 .memory-stat strong{font-size:.75rem!important}
    .memory-v22 .memory-level,.memory-v22 .memory-tool-btn{min-height:24px!important;font-size:.48rem!important;padding:3px 5px!important}
    .memory-v22 .memory-grid{gap:4px!important}
    .memory-v22 .memory-card-no{width:34px!important;height:34px!important;font-size:1.02rem!important;border-width:2px!important}
    .memory-v22 .memory-back small{font-size:.30rem!important}
    .memory-v22 .memory-front img{height:calc(100% - 15px)!important}
    .memory-v22 .memory-front strong{height:14px!important;font-size:.38rem!important}
    .memory-v22 .memory-footer,.memory-v22 .memory-hint,.memory-v22 .memory-best{height:28px!important}
    .memory-v22 .memory-hint,.memory-v22 .memory-best{font-size:.44rem!important;padding:3px 6px!important}
  }

  @media(max-width:760px){
    #gameDialog.memory-dialog-v22>.dialog-shell{height:auto!important;max-height:94vh!important;overflow:auto!important}
    #gameDialog.memory-dialog-v22 #gameHost{height:auto!important;overflow:visible!important}
    .memory-v22{height:auto!important;max-height:none!important;overflow:visible!important;display:block!important}
    .memory-v22 .memory-hero{grid-template-columns:1fr!important;height:auto!important}
    .memory-v22 .memory-hero img{width:100%!important;height:auto!important;max-height:150px!important}
    .memory-v22 .memory-toolbar{grid-template-columns:1fr!important;margin:7px 0!important}
    .memory-v22 .memory-stats{grid-template-columns:repeat(2,1fr)!important}
    .memory-v22 .memory-tools{height:auto!important;flex-wrap:wrap!important;justify-content:center!important}
    .memory-v22 .memory-board-wrap{height:auto!important}
    .memory-v22 .memory-grid{height:auto!important;grid-template-columns:repeat(3,1fr)!important;grid-template-rows:none!important}
    .memory-v22 .memory-card{min-height:100px!important}
    .memory-v22 .memory-footer{height:auto!important;grid-template-columns:1fr!important;margin-top:7px!important}
  }`;
  document.head.appendChild(s);
}

function saveGlobalResult(pairs,moves,score){
  const r=JSON.parse(localStorage.getItem('mobiliza.results')||'{"games":0,"correct":0,"answers":0,"best":0,"streak":0}');
  r.games=(r.games||0)+1;
  r.correct=(r.correct||0)+pairs;
  r.answers=(r.answers||0)+moves;
  r.best=Math.max(r.best||0,score);
  localStorage.setItem('mobiliza.results',JSON.stringify(r));
}

export function openMemoria(dialog,host,onFinish){
  ensureMemoryStyles();
  dialog.classList.add('memory-dialog-v22');
  dialog.addEventListener('close',()=>dialog.classList.remove('memory-dialog-v22'),{once:true});

  let level=localStorage.getItem('mobiliza.memoria.level')||'medium';
  if(!LEVELS[level])level='medium';
  let deck=[],firstCard=null,secondCard=null,matched=new Set(),moves=0,start=Date.now(),timerId=null,lock=false,finished=false;
  let soundOn=localStorage.getItem('mobiliza.memoria.sound')!=='0';
  let audioCtx=null;

  const cfg=()=>LEVELS[level];
  const pairCount=()=>cfg().pairs;
  const elapsed=()=>Math.floor((Date.now()-start)/1000);
  const score=()=>clamp(Math.round((3500-(moves*52)-(elapsed()*3))*cfg().bonus),100,9999);
  const matchedPairs=()=>matched.size/2;

  const bestKey=()=>`mobiliza.memoria.best.${level}`;
  const best=()=>JSON.parse(localStorage.getItem(bestKey())||'null');

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
  const tone=(freq,d=.07,delay=0,type='sine',gain=.04)=>{
    const c=ensureAudio();if(!c)return;
    const o=c.createOscillator(),g=c.createGain(),t=c.currentTime+delay;
    o.type=type;o.frequency.setValueAtTime(freq,t);
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(gain,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+d);
    o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+d+.03);
  };
  const sounds={
    flip:()=>tone(520,.04,0,'square',.02),
    match:()=>{tone(523,.07,0,'triangle',.045);tone(659,.07,.07,'triangle',.045);tone(784,.14,.14,'triangle',.05);},
    miss:()=>{tone(300,.07,0,'sawtooth',.03);tone(210,.11,.07,'sawtooth',.028);},
    click:()=>tone(470,.04,0,'square',.018),
    finish:()=>{tone(523,.08,0,'triangle',.05);tone(659,.08,.08,'triangle',.05);tone(784,.08,.16,'triangle',.05);tone(1046,.24,.24,'triangle',.06);}
  };

  const buildDeck=()=>{
    const selected=ALL_PAIRS.slice(0,pairCount());
    const cards=[];
    selected.forEach((p,idx)=>{
      cards.push({uid:`${p.key}-a-${idx}-${Math.random()}`,key:p.key,pair:p});
      cards.push({uid:`${p.key}-b-${idx}-${Math.random()}`,key:p.key,pair:p});
    });
    deck=shuffle(cards).map((c,index)=>({...c,index,number:index+1,state:'closed'}));
    firstCard=null;secondCard=null;matched=new Set();moves=0;lock=false;finished=false;start=Date.now();
  };

  const bestText=()=>{
    const b=best();
    return b?`${b.score} pts • ${b.moves} jogadas`:'Sem recorde';
  };

  const render=()=>{
    const levelClass=`level-${level}`;
    host.innerHTML=`<section class="game memory-game memory-v22 ${levelClass}">
      <div class="memory-hero">
        <img src="assets/games/jogo_da_memoria_mobiliza_educa.svg?v=22" alt="Jogo da Memória">
        <div><p class="eyebrow">JOGO DA MEMÓRIA</p><h2>Encontre os pares do trânsito</h2><p>Peça ao operador para abrir duas cartas pelo número e encontre os pares de imagens.</p></div>
      </div>

      <div class="memory-toolbar">
        <div class="memory-stats">
          <div class="memory-stat"><span>🎯 Jogadas</span><strong id="memoryMoves">${moves}</strong></div>
          <div class="memory-stat"><span>🧩 Pares</span><strong><b id="memoryPairs">${matchedPairs()}</b>/${pairCount()}</strong></div>
          <div class="memory-stat"><span>⏱ Tempo</span><strong id="memoryTime">0s</strong></div>
          <div class="memory-stat"><span>⭐ Pontos</span><strong id="memoryScore">${score()}</strong></div>
        </div>
        <div class="memory-tools">
          <div class="memory-levels">
            ${Object.entries(LEVELS).map(([k,v])=>`<button type="button" class="memory-level ${k===level?'active':''}" data-level="${k}">${v.label}</button>`).join('')}
          </div>
          <button type="button" class="memory-tool-btn" id="memorySound">${soundOn?'🔊':'🔇'} Som</button>
          <button type="button" class="memory-tool-btn" id="memoryRules">❔ Como jogar</button>
          <button type="button" class="memory-tool-btn" id="memoryRestart">↻ Reiniciar</button>
        </div>
      </div>

      <div class="memory-board-wrap">
        <div class="memory-grid" id="memoryGrid">
          ${deck.map(c=>`<button type="button" class="memory-card ${c.state==='matched'?'matched open':c.state==='open'?'open':''}" data-card-index="${c.index}" aria-label="Carta ${c.number}">
            <span class="memory-card-inner">
              <span class="memory-back"><b class="memory-card-no">${c.number}</b><small>CARTA</small></span>
              <span class="memory-front"><img src="${c.pair.image}" alt="${c.pair.title}" onerror="this.style.display='none'"><strong>${c.pair.title}</strong></span>
            </span>
          </button>`).join('')}
        </div>
      </div>

      <div class="memory-footer">
        <div class="memory-hint"><span>🎙️</span><strong>Diga ao operador os números das duas cartas que deseja abrir.</strong></div>
        <div class="memory-best"><span>🏆 Melhor ${cfg().label}</span><strong>${bestText()}</strong></div>
      </div>

      <div id="memoryToast" class="memory-toast"></div>
      <div id="memoryOverlay" class="memory-overlay"></div>
    </section>`;

    host.querySelectorAll('[data-card-index]').forEach(btn=>btn.onclick=e=>{e.preventDefault();flip(Number(btn.dataset.cardIndex));});
    host.querySelectorAll('[data-level]').forEach(btn=>btn.onclick=()=>changeLevel(btn.dataset.level));
    host.querySelector('#memorySound').onclick=()=>{soundOn=!soundOn;localStorage.setItem('mobiliza.memoria.sound',soundOn?'1':'0');if(soundOn){ensureAudio();sounds.click();}render();};
    host.querySelector('#memoryRules').onclick=showRules;
    host.querySelector('#memoryRestart').onclick=()=>restart(true);

    startTimer();
  };

  const startTimer=()=>{
    if(timerId)clearInterval(timerId);
    const update=()=>{
      if(finished)return;
      const t=host.querySelector('#memoryTime'),s=host.querySelector('#memoryScore');
      if(t)t.textContent=elapsed()+'s';
      if(s)s.textContent=score();
    };
    update();timerId=setInterval(update,500);
  };

  const updateHud=()=>{
    host.querySelector('#memoryMoves')?.replaceChildren(document.createTextNode(String(moves)));
    host.querySelector('#memoryPairs')?.replaceChildren(document.createTextNode(String(matchedPairs())));
    host.querySelector('#memoryScore')?.replaceChildren(document.createTextNode(String(score())));
  };

  const overlay=(html)=>{
    const o=host.querySelector('#memoryOverlay');if(!o)return null;
    o.className='memory-overlay show';o.innerHTML=html;return o;
  };
  const closeOverlay=()=>{const o=host.querySelector('#memoryOverlay');if(o){o.className='memory-overlay';o.innerHTML='';}};

  const showToast=(pair,ok)=>{
    const t=host.querySelector('#memoryToast');if(!t)return;
    t.className=`memory-toast show ${ok?'ok':'miss'}`;
    t.innerHTML=ok
      ?`<img src="${pair.image}" alt=""><div><strong>Par encontrado: ${pair.title}</strong><small>${pair.detail}</small></div>`
      :`<div><strong>Não formou par.</strong><small>Memorize as posições e escolha outros números.</small></div>`;
    setTimeout(()=>{if(t)t.className='memory-toast';},ok?1700:950);
  };

  const flip=async index=>{
    if(lock||finished)return;

    const card=deck[index];
    if(!card||card.state==='matched'||card.state==='open')return;

    ensureAudio();
    sounds.flip();

    const el=host.querySelector(`[data-card-index="${index}"]`);
    if(!el)return;

    card.state='open';
    el.classList.add('open');

    if(firstCard===null){
      firstCard=index;
      return;
    }

    secondCard=index;
    lock=true;
    moves++;
    updateHud();

    const a=deck[firstCard];
    const b=deck[secondCard];
    const aEl=host.querySelector(`[data-card-index="${firstCard}"]`);
    const bEl=host.querySelector(`[data-card-index="${secondCard}"]`);

    if(a&&b&&a.key===b.key&&firstCard!==secondCard){
      a.state='matched';
      b.state='matched';
      matched.add(firstCard);
      matched.add(secondCard);
      aEl?.classList.add('matched','open');
      bEl?.classList.add('matched','open');

      sounds.match();
      showToast(a.pair,true);

      firstCard=null;
      secondCard=null;
      lock=false;
      updateHud();

      if(matched.size===deck.length){
        await sleep(850);
        finish();
      }
      return;
    }

    sounds.miss();
    showToast(a?.pair||b?.pair,false);

    await sleep(1050);

    if(a)a.state='closed';
    if(b)b.state='closed';
    aEl?.classList.remove('open');
    bEl?.classList.remove('open');

    firstCard=null;
    secondCard=null;
    lock=false;
  };

  const changeLevel=newLevel=>{
    if(!LEVELS[newLevel]||newLevel===level)return;
    sounds.click();
    const o=overlay(`<div class="memory-modal"><h3>Mudar para nível ${LEVELS[newLevel].label}?</h3><p>A partida atual será reiniciada e as cartas serão embaralhadas.</p><div class="memory-modal-actions"><button type="button" class="btn primary" id="levelYes">MUDAR NÍVEL</button><button type="button" class="btn ghost" id="levelNo">CANCELAR</button></div></div>`);
    o.querySelector('#levelYes').onclick=()=>{level=newLevel;localStorage.setItem('mobiliza.memoria.level',level);if(timerId)clearInterval(timerId);buildDeck();render();};
    o.querySelector('#levelNo').onclick=closeOverlay;
  };

  const restart=confirm=>{
    sounds.click();
    if(!confirm){buildDeck();render();return;}
    const o=overlay(`<div class="memory-modal"><h3>Reiniciar o jogo?</h3><p>As cartas serão embaralhadas e a pontuação atual será zerada.</p><div class="memory-modal-actions"><button type="button" class="btn primary" id="restartYes">SIM, REINICIAR</button><button type="button" class="btn ghost" id="restartNo">CANCELAR</button></div></div>`);
    o.querySelector('#restartYes').onclick=()=>{if(timerId)clearInterval(timerId);buildDeck();render();};
    o.querySelector('#restartNo').onclick=closeOverlay;
  };

  const showRules=()=>{
    sounds.click();
    const o=overlay(`<div class="memory-modal"><h3>Como jogar</h3><p>As cartas ficam numeradas para facilitar atividades em telão. O participante diz, por exemplo, “abra a carta 3 e a carta 11”, e o operador clica nelas.</p><div class="memory-level-picker"><div class="memory-level-choice"><strong>Fácil</strong><small>6 pares • 12 cartas</small></div><div class="memory-level-choice"><strong>Médio</strong><small>8 pares • 16 cartas</small></div><div class="memory-level-choice"><strong>Difícil</strong><small>10 pares • 20 cartas</small></div></div><p>Ao encontrar um par, as duas imagens permanecem abertas e aparece uma orientação educativa.</p><button type="button" class="btn primary" id="rulesOk">ENTENDI</button></div>`);
    o.querySelector('#rulesOk').onclick=()=>{sounds.click();closeOverlay();};
  };

  const finish=()=>{
    if(finished)return;
    finished=true;if(timerId)clearInterval(timerId);sounds.finish();
    const seconds=elapsed(),finalScore=score(),record={score:finalScore,moves,seconds,date:new Date().toISOString()};
    const old=best();
    if(!old||finalScore>old.score||(finalScore===old.score&&moves<old.moves))localStorage.setItem(bestKey(),JSON.stringify(record));
    saveGlobalResult(pairCount(),moves,finalScore);onFinish?.();

    host.innerHTML=`<section class="game memory-result memory-v22 level-${level}" style="height:100%;display:grid;place-items:center;align-content:center;text-align:center;gap:12px;background:linear-gradient(180deg,#f8fcff,#eef8fb)">
      <img src="assets/games/jogo_da_memoria_mobiliza_educa.svg?v=22" alt="" style="width:min(470px,70%);aspect-ratio:16/9;object-fit:cover;border-radius:20px;box-shadow:0 18px 42px rgba(15,60,102,.16)">
      <div style="font-size:2.8rem">🧠</div>
      <h2 style="margin:0">Todos os pares encontrados!</h2>
      <p style="margin:0;color:#61788a">Nível <strong>${cfg().label}</strong> • ${moves} jogadas • ${seconds}s • <strong>${finalScore} pontos</strong></p>
      <div class="hero-actions"><button type="button" class="btn primary" id="memoryAgain">Jogar novamente</button><button type="button" class="btn ghost" id="memoryClose">Encerrar</button></div>
    </section>`;
    host.querySelector('#memoryAgain').onclick=()=>{buildDeck();render();};
    host.querySelector('#memoryClose').onclick=()=>dialog.close();
  };

  buildDeck();
  render();
  if(!dialog.open)dialog.showModal();
}