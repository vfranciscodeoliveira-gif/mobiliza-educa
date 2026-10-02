const MEMORY_PAIRS=[
  {key:'pare',title:'PARE',image:'assets/memory/pare.svg?v=25',detail:'A placa PARE determina parada obrigatória antes de prosseguir com segurança.'},
  {key:'semaforo',title:'SEMÁFORO',image:'assets/memory/semaforo.svg?v=25',detail:'O semáforo organiza os fluxos e suas indicações devem ser respeitadas.'},
  {key:'faixa',title:'FAIXA',image:'assets/memory/faixa.svg?v=25',detail:'A faixa organiza a travessia e deve ser respeitada por condutores e pedestres.'},
  {key:'cinto',title:'CINTO',image:'assets/memory/cinto.svg?v=25',detail:'O cinto deve ser utilizado por todos os ocupantes, inclusive no banco traseiro.'},
  {key:'capacete',title:'CAPACETE',image:'assets/memory/capacete.svg?v=25',detail:'O capacete corretamente afivelado é essencial para a segurança.'},
  {key:'celular',title:'CELULAR',image:'assets/memory/celular.svg?v=25',detail:'Usar celular ao dirigir divide a atenção e aumenta o risco.'},
  {key:'bicicleta',title:'BICICLETA',image:'assets/memory/bicicleta.svg?v=25',detail:'Ciclistas precisam de espaço, previsibilidade e respeito.'},
  {key:'escola',title:'ÁREA ESCOLAR',image:'assets/memory/escola.svg?v=25',detail:'Em área escolar, reduza a velocidade e redobre a atenção.'},
  {key:'velocidade',title:'VELOCIDADE',image:'assets/memory/velocidade.svg?v=25',detail:'Respeitar os limites e as condições da via reduz riscos.'},
  {key:'pedestre',title:'PEDESTRE',image:'assets/memory/pedestre.svg?v=25',detail:'Na travessia, atenção e prioridade ao pedestre ajudam a prevenir sinistros.'}
];

const MEMORY_LEVELS={
  easy:{label:'Fácil',pairs:6,cols:4,rows:3,mult:1},
  medium:{label:'Médio',pairs:8,cols:4,rows:4,mult:1.25},
  hard:{label:'Difícil',pairs:10,cols:5,rows:4,mult:1.5}
};

function sleep(ms){return new Promise(r=>setTimeout(r,ms));}
function shuffle(a){
  const b=[...a];
  for(let i=b.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [b[i],b[j]]=[b[j],b[i]];
  }
  return b;
}
function clamp(v,min,max){return Math.max(min,Math.min(max,v));}

function ensureMemoryV27Styles(){
  if(document.getElementById('memory-v27-styles')) return;
  const style=document.createElement('style');
  style.id='memory-v27-styles';
  style.textContent=`
  #gameDialog.memory-v27-dialog{width:min(1320px,96vw)!important;max-width:96vw!important;max-height:94vh!important;overflow:hidden!important}
  #gameDialog.memory-v27-dialog>.dialog-shell{height:94vh!important;max-height:94vh!important;overflow:hidden!important;background:#fff!important}
  #gameDialog.memory-v27-dialog #gameHost{height:100%!important;min-height:0!important;overflow:hidden!important}
  #gameDialog.memory-v27-dialog .dialog-close{position:absolute!important;top:12px!important;right:12px!important;z-index:300!important}

  .memory-v27{height:100%!important;min-height:0!important;box-sizing:border-box!important;overflow:hidden!important;display:grid!important;grid-template-rows:64px 46px minmax(0,1fr) 32px!important;gap:6px!important;padding:8px 12px 10px!important;background:linear-gradient(180deg,#f9fcff,#edf6fb)!important;position:relative!important}
  .memory-v27 .mem-hero{display:grid!important;grid-template-columns:126px minmax(0,1fr)!important;align-items:center!important;gap:12px!important;padding:6px 10px!important;border-radius:14px!important;background:linear-gradient(135deg,#0a3f70,#0f6ca4 58%,#1491b6)!important;color:#fff!important;overflow:hidden!important}
  .memory-v27 .mem-hero img{width:126px!important;height:52px!important;object-fit:cover!important;border-radius:10px!important}
  .memory-v27 .mem-hero .eyebrow{margin:0 0 1px!important;font-size:.48rem!important;letter-spacing:.12em!important;color:#fff!important}
  .memory-v27 .mem-hero h2{margin:0 0 2px!important;font-size:1.18rem!important;line-height:1.05!important;color:#fff!important}
  .memory-v27 .mem-hero p{margin:0!important;font-size:.60rem!important;color:#e9f6ff!important}

  .memory-v27 .mem-toolbar{display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;gap:6px!important}
  .memory-v27 .mem-stats{display:grid!important;grid-template-columns:repeat(4,minmax(76px,1fr))!important;gap:5px!important}
  .memory-v27 .mem-stat,.memory-v27 .mem-tools{height:46px!important;border:1px solid #d5e5ee!important;border-radius:11px!important;background:#fff!important;box-shadow:0 3px 9px rgba(15,60,102,.05)!important}
  .memory-v27 .mem-stat{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:6px!important;padding:5px 8px!important}
  .memory-v27 .mem-stat span{font-size:.55rem!important;color:#6a8090!important;font-weight:800!important}
  .memory-v27 .mem-stat strong{font-size:.90rem!important;color:#173f60!important}
  .memory-v27 .mem-tools{display:flex!important;align-items:center!important;gap:4px!important;padding:4px!important}
  .memory-v27 .mem-level,.memory-v27 .mem-tool{min-height:28px!important;padding:4px 7px!important;border:1px solid #cfdee8!important;border-radius:8px!important;background:#fff!important;color:#31536b!important;font-size:.55rem!important;font-weight:900!important;cursor:pointer!important}
  .memory-v27 .mem-level.active{background:#0e659d!important;color:#fff!important;border-color:#0e659d!important}

  .memory-v27 .mem-board-wrap{height:100%!important;min-height:0!important;overflow:hidden!important;padding:5px!important;border:1px solid #c9dfeb!important;border-radius:16px!important;background:linear-gradient(145deg,#e8f7ff,#fffaf0)!important}
  .memory-v27 .mem-grid{width:100%!important;height:100%!important;min-height:0!important;display:grid!important;gap:5px!important}
  .memory-v27.level-easy .mem-grid{grid-template-columns:repeat(4,minmax(0,1fr))!important;grid-template-rows:repeat(3,minmax(0,1fr))!important}
  .memory-v27.level-medium .mem-grid{grid-template-columns:repeat(4,minmax(0,1fr))!important;grid-template-rows:repeat(4,minmax(0,1fr))!important}
  .memory-v27.level-hard .mem-grid{grid-template-columns:repeat(5,minmax(0,1fr))!important;grid-template-rows:repeat(4,minmax(0,1fr))!important}
  .memory-v27 .mem-grid.locked{pointer-events:none!important}

  .memory-v27 .mem-card{position:relative!important;display:grid!important;place-items:center!important;min-height:0!important;height:auto!important;margin:0!important;padding:0!important;border:0!important;border-radius:12px!important;overflow:hidden!important;cursor:pointer!important;background:linear-gradient(145deg,#145fc3,#063a83)!important;color:#fff!important;box-shadow:inset 0 0 0 2px rgba(255,255,255,.14),0 4px 10px rgba(0,0,0,.12)!important;transition:transform .16s ease,box-shadow .16s ease!important}
  .memory-v27 .mem-card:hover:not(.is-open):not(.is-matched){transform:translateY(-2px)!important;box-shadow:inset 0 0 0 2px rgba(255,255,255,.22),0 7px 15px rgba(0,0,0,.16)!important}
  .memory-v27 .mem-card.is-open,.memory-v27 .mem-card.is-matched{background:#fff!important;color:#173e5d!important;box-shadow:inset 0 0 0 2px #cbdfea,0 4px 10px rgba(15,60,102,.10)!important;animation:memReveal .23s ease both!important}
  .memory-v27 .mem-card.is-matched{box-shadow:inset 0 0 0 3px #39b86d,0 0 16px rgba(57,184,109,.28)!important}
  .memory-v27 .mem-card.is-matched::after{content:'✓';position:absolute!important;top:5px!important;right:5px!important;z-index:4!important;width:18px!important;height:18px!important;display:grid!important;place-items:center!important;border-radius:50%!important;background:#28a962!important;color:#fff!important;font-size:.62rem!important;font-weight:1000!important}
  @keyframes memReveal{0%{transform:scale(.94) rotateY(12deg)}100%{transform:scale(1) rotateY(0)}}

  .memory-v27 .mem-closed{display:grid!important;place-items:center!important;gap:3px!important}
  .memory-v27 .mem-number{display:grid!important;place-items:center!important;width:46px!important;height:46px!important;border-radius:50%!important;background:linear-gradient(145deg,#fff,#ddecfb)!important;color:#0b4e90!important;border:3px solid rgba(255,255,255,.72)!important;font-size:1.38rem!important;font-weight:1000!important;box-shadow:0 4px 10px rgba(0,0,0,.18)!important}
  .memory-v27 .mem-closed small{font-size:.38rem!important;letter-spacing:.13em!important;font-weight:900!important;opacity:.82!important}

  .memory-v27 .mem-open{position:absolute!important;inset:0!important;display:grid!important;grid-template-rows:minmax(0,1fr) 20px!important;padding:4px!important;background:#fff!important}
  .memory-v27 .mem-open img{width:100%!important;height:100%!important;min-height:0!important;object-fit:contain!important;border-radius:8px!important;background:#eef7fb!important}
  .memory-v27 .mem-open strong{display:flex!important;align-items:center!important;justify-content:center!important;font-size:.48rem!important;color:#173e5d!important;line-height:1!important;white-space:nowrap!important;overflow:hidden!important;text-overflow:ellipsis!important}
  .memory-v27 .mem-open-number{position:absolute!important;top:6px!important;left:6px!important;z-index:5!important;display:grid!important;place-items:center!important;width:24px!important;height:24px!important;border-radius:50%!important;background:#0b4e90!important;color:#fff!important;font-size:.70rem!important;font-weight:1000!important;box-shadow:0 2px 7px rgba(0,0,0,.22)!important}
  .memory-v27 .mem-card.first-choice{outline:4px solid #f4c542!important;outline-offset:-4px!important}
  .memory-v27 .mem-card.second-choice{outline:4px solid #38a7e8!important;outline-offset:-4px!important}
  .memory-v27 .mem-card.is-matched{outline:4px solid #39b86d!important;outline-offset:-4px!important}
  .memory-v27 .mem-card:disabled{opacity:1!important;cursor:default!important}

  .memory-v27 .mem-footer{height:32px!important;display:grid!important;grid-template-columns:minmax(0,1fr) auto!important;gap:6px!important}
  .memory-v27 .mem-hint,.memory-v27 .mem-best{height:32px!important;display:flex!important;align-items:center!important;gap:6px!important;padding:4px 7px!important;border:1px solid #d5e5ee!important;border-radius:10px!important;background:#fff!important;color:#5b7385!important;font-size:.50rem!important}
  .memory-v27 .mem-best{min-width:190px!important;justify-content:space-between!important}

  .memory-v27 .mem-toast{position:absolute!important;left:50%!important;bottom:38px!important;z-index:80!important;width:min(560px,80%)!important;transform:translate(-50%,15px)!important;opacity:0!important;pointer-events:none!important;padding:9px 11px!important;border-radius:14px!important;background:rgba(6,45,79,.96)!important;color:#fff!important;box-shadow:0 14px 32px rgba(0,0,0,.24)!important;transition:.2s!important}
  .memory-v27 .mem-toast.show{opacity:1!important;transform:translate(-50%,0)!important}
  .memory-v27 .mem-toast.ok{background:rgba(16,108,67,.97)!important}
  .memory-v27 .mem-toast.miss{background:rgba(112,61,40,.97)!important}
  .memory-v27 .mem-toast strong{display:block!important;font-size:.70rem!important}
  .memory-v27 .mem-toast small{display:block!important;margin-top:2px!important;font-size:.55rem!important;line-height:1.2!important;color:#eef7fb!important}

  .memory-v27 .mem-overlay{position:absolute!important;inset:0!important;z-index:120!important;display:grid!important;place-items:center!important;opacity:0!important;pointer-events:none!important;background:rgba(3,18,37,.12)!important;transition:.2s!important}
  .memory-v27 .mem-overlay.show{opacity:1!important;pointer-events:auto!important;background:rgba(3,18,37,.72)!important;backdrop-filter:blur(2px)!important}
  .memory-v27 .mem-modal{width:min(560px,88%)!important;padding:22px 26px!important;border-radius:22px!important;background:linear-gradient(180deg,#0b477a,#062c54)!important;color:#fff!important;text-align:center!important;border:2px solid rgba(255,255,255,.24)!important;box-shadow:0 26px 74px rgba(0,0,0,.42)!important}
  .memory-v27 .mem-modal h3{margin:0 0 9px!important;font-size:1.35rem!important}
  .memory-v27 .mem-modal p{margin:0 0 12px!important;color:#dceefa!important}
  .memory-v27 .mem-modal-actions{display:flex!important;justify-content:center!important;gap:8px!important;flex-wrap:wrap!important}

  @media(max-height:650px) and (min-width:761px){
    .memory-v27{grid-template-rows:54px 40px minmax(0,1fr) 28px!important;gap:4px!important;padding:6px 9px 7px!important}
    .memory-v27 .mem-hero{grid-template-columns:100px minmax(0,1fr)!important;padding:4px 8px!important}
    .memory-v27 .mem-hero img{width:100px!important;height:42px!important}
    .memory-v27 .mem-hero h2{font-size:1rem!important}
    .memory-v27 .mem-hero p{font-size:.50rem!important}
    .memory-v27 .mem-stat,.memory-v27 .mem-tools{height:40px!important}
    .memory-v27 .mem-level,.memory-v27 .mem-tool{min-height:24px!important;font-size:.47rem!important;padding:3px 5px!important}
    .memory-v27 .mem-number{width:34px!important;height:34px!important;font-size:1rem!important;border-width:2px!important}
    .memory-v27 .mem-open{grid-template-rows:minmax(0,1fr) 16px!important}
    .memory-v27 .mem-open strong{font-size:.38rem!important}
    .memory-v27 .mem-footer,.memory-v27 .mem-hint,.memory-v27 .mem-best{height:28px!important}
  }


  /* Resultado final independente do grid da partida */
  .memory-result-v27{
    box-sizing:border-box!important;
    width:100%!important;
    height:100%!important;
    min-height:0!important;
    overflow:hidden!important;
    display:grid!important;
    grid-template-rows:auto auto minmax(0,1fr) auto!important;
    gap:10px!important;
    padding:14px 18px 16px!important;
    background:
      radial-gradient(circle at 15% 10%,rgba(49,162,224,.14),transparent 28%),
      radial-gradient(circle at 85% 90%,rgba(244,190,58,.12),transparent 30%),
      linear-gradient(180deg,#f9fcff,#edf7fb)!important;
    color:#173e5d!important;
  }
  .memory-result-v27 .mem-result-hero{
    display:grid!important;
    grid-template-columns:150px minmax(0,1fr) auto!important;
    align-items:center!important;
    gap:14px!important;
    padding:10px 14px!important;
    border-radius:18px!important;
    background:linear-gradient(135deg,#0b4779,#0f6ca4 58%,#1593b8)!important;
    color:#fff!important;
    box-shadow:0 12px 28px rgba(15,60,102,.13)!important;
  }
  .memory-result-v27 .mem-result-hero img{
    width:150px!important;
    height:76px!important;
    object-fit:cover!important;
    border-radius:12px!important;
    box-shadow:0 5px 14px rgba(0,0,0,.18)!important;
  }
  .memory-result-v27 .mem-result-hero .eyebrow{
    margin:0 0 2px!important;
    font-size:.56rem!important;
    letter-spacing:.12em!important;
    color:#d8effd!important;
  }
  .memory-result-v27 .mem-result-hero h2{
    margin:0!important;
    font-size:1.45rem!important;
    line-height:1.05!important;
    color:#fff!important;
  }
  .memory-result-v27 .mem-result-trophy{
    display:grid!important;
    place-items:center!important;
    width:68px!important;
    height:68px!important;
    border-radius:50%!important;
    background:linear-gradient(145deg,#ffd85b,#f1a623)!important;
    box-shadow:0 0 0 8px rgba(255,216,91,.14),0 8px 20px rgba(0,0,0,.18)!important;
    font-size:2.15rem!important;
  }

  .memory-result-v27 .mem-result-summary{
    display:grid!important;
    grid-template-columns:repeat(4,minmax(0,1fr))!important;
    gap:8px!important;
  }
  .memory-result-v27 .mem-result-stat{
    display:flex!important;
    align-items:center!important;
    justify-content:space-between!important;
    gap:8px!important;
    min-height:58px!important;
    padding:9px 12px!important;
    border:1px solid #d4e5ef!important;
    border-radius:14px!important;
    background:#fff!important;
    box-shadow:0 5px 14px rgba(15,60,102,.06)!important;
  }
  .memory-result-v27 .mem-result-stat span{
    color:#6c8292!important;
    font-size:.68rem!important;
    font-weight:800!important;
  }
  .memory-result-v27 .mem-result-stat strong{
    color:#123f63!important;
    font-size:1.05rem!important;
  }

  .memory-result-v27 .mem-result-body{
    min-height:0!important;
    overflow:hidden!important;
    display:grid!important;
    grid-template-columns:minmax(0,1fr) 300px!important;
    gap:12px!important;
  }
  .memory-result-v27 .mem-result-pairs{
    min-height:0!important;
    overflow:hidden!important;
    display:grid!important;
    grid-template-columns:repeat(3,minmax(0,1fr))!important;
    grid-auto-rows:minmax(0,1fr)!important;
    gap:8px!important;
    padding:10px!important;
    border:1px solid #d4e5ef!important;
    border-radius:16px!important;
    background:#fff!important;
  }
  .memory-result-v27 .mem-result-pair{
    min-height:0!important;
    display:grid!important;
    grid-template-columns:76px minmax(0,1fr)!important;
    align-items:center!important;
    gap:8px!important;
    padding:7px!important;
    border:1px solid #dbe8ef!important;
    border-radius:12px!important;
    background:linear-gradient(180deg,#fbfdff,#f2f8fb)!important;
  }
  .memory-result-v27 .mem-result-pair img{
    width:76px!important;
    height:54px!important;
    object-fit:contain!important;
    border-radius:8px!important;
    background:#edf6fa!important;
  }
  .memory-result-v27 .mem-result-pair strong{
    display:block!important;
    color:#173e5d!important;
    font-size:.68rem!important;
    line-height:1.05!important;
  }
  .memory-result-v27 .mem-result-pair small{
    display:block!important;
    margin-top:2px!important;
    color:#748b9b!important;
    font-size:.50rem!important;
    line-height:1.15!important;
  }

  .memory-result-v27 .mem-result-message{
    min-height:0!important;
    display:grid!important;
    align-content:center!important;
    justify-items:center!important;
    gap:10px!important;
    padding:18px!important;
    border-radius:16px!important;
    text-align:center!important;
    background:linear-gradient(180deg,#0d4d7d,#08345b)!important;
    color:#fff!important;
    box-shadow:0 12px 28px rgba(15,60,102,.12)!important;
  }
  .memory-result-v27 .mem-result-message .big{
    font-size:3rem!important;
  }
  .memory-result-v27 .mem-result-message h3{
    margin:0!important;
    font-size:1.25rem!important;
    color:#fff!important;
  }
  .memory-result-v27 .mem-result-message p{
    margin:0!important;
    color:#d9ecf8!important;
    font-size:.75rem!important;
    line-height:1.35!important;
  }
  .memory-result-v27 .mem-result-actions{
    display:flex!important;
    align-items:center!important;
    justify-content:center!important;
    gap:10px!important;
    min-height:46px!important;
  }
  .memory-result-v27 .mem-result-actions .btn{
    min-width:150px!important;
  }

  @media(max-height:650px) and (min-width:761px){
    .memory-result-v27{
      gap:6px!important;
      padding:9px 12px 10px!important;
    }
    .memory-result-v27 .mem-result-hero{
      grid-template-columns:118px minmax(0,1fr) 52px!important;
      padding:6px 10px!important;
    }
    .memory-result-v27 .mem-result-hero img{
      width:118px!important;
      height:56px!important;
    }
    .memory-result-v27 .mem-result-hero h2{
      font-size:1.15rem!important;
    }
    .memory-result-v27 .mem-result-trophy{
      width:50px!important;height:50px!important;font-size:1.55rem!important;
    }
    .memory-result-v27 .mem-result-stat{
      min-height:44px!important;
      padding:6px 8px!important;
    }
    .memory-result-v27 .mem-result-stat span{font-size:.56rem!important}
    .memory-result-v27 .mem-result-stat strong{font-size:.86rem!important}
    .memory-result-v27 .mem-result-body{
      grid-template-columns:minmax(0,1fr) 245px!important;
      gap:7px!important;
    }
    .memory-result-v27 .mem-result-pairs{
      gap:5px!important;
      padding:6px!important;
    }
    .memory-result-v27 .mem-result-pair{
      grid-template-columns:56px minmax(0,1fr)!important;
      padding:5px!important;
    }
    .memory-result-v27 .mem-result-pair img{
      width:56px!important;height:40px!important;
    }
    .memory-result-v27 .mem-result-pair strong{font-size:.56rem!important}
    .memory-result-v27 .mem-result-pair small{font-size:.42rem!important}
    .memory-result-v27 .mem-result-message{
      padding:10px!important;
      gap:6px!important;
    }
    .memory-result-v27 .mem-result-message .big{font-size:2.1rem!important}
    .memory-result-v27 .mem-result-message h3{font-size:1rem!important}
    .memory-result-v27 .mem-result-message p{font-size:.62rem!important}
    .memory-result-v27 .mem-result-actions{min-height:38px!important}
  }
  @media(max-width:760px){
    #gameDialog.memory-v27-dialog>.dialog-shell{height:auto!important;max-height:94vh!important;overflow:auto!important}
    #gameDialog.memory-v27-dialog #gameHost{height:auto!important;overflow:visible!important}
    .memory-v27{height:auto!important;display:block!important;overflow:visible!important}
    .memory-v27 .mem-toolbar{grid-template-columns:1fr!important;margin:7px 0!important}
    .memory-v27 .mem-stats{grid-template-columns:repeat(2,1fr)!important}
    .memory-v27 .mem-tools{height:auto!important;flex-wrap:wrap!important;justify-content:center!important}
    .memory-v27 .mem-board-wrap{height:auto!important}
    .memory-v27 .mem-grid{height:auto!important;grid-template-columns:repeat(3,1fr)!important;grid-template-rows:none!important}
    .memory-v27 .mem-card{min-height:105px!important}
    .memory-v27 .mem-footer{height:auto!important;grid-template-columns:1fr!important;margin-top:7px!important}
  }`;
  document.head.appendChild(style);
}

function saveMemoryResult(pairs,moves,score){
  const r=JSON.parse(localStorage.getItem('mobiliza.results')||'{"games":0,"correct":0,"answers":0,"best":0,"streak":0}');
  r.games=(r.games||0)+1;
  r.correct=(r.correct||0)+pairs;
  r.answers=(r.answers||0)+moves;
  r.best=Math.max(r.best||0,score);
  localStorage.setItem('mobiliza.results',JSON.stringify(r));
}

export function openMemoria(dialog,host,onFinish){
  ensureMemoryV27Styles();
  dialog.classList.add('memory-v27-dialog');
  dialog.addEventListener('close',()=>dialog.classList.remove('memory-v27-dialog'),{once:true});

  let level=localStorage.getItem('mobiliza.memoria.level')||'medium';
  if(!MEMORY_LEVELS[level]) level='medium';

  let deck=[];
  let firstIndex=null;
  let secondIndex=null;
  let lock=false;
  let moves=0;
  let matchedPairs=0;
  let finished=false;
  let startedAt=Date.now();
  let timerId=null;
  let soundOn=localStorage.getItem('mobiliza.memoria.sound')!=='0';
  let audioCtx=null;

  const cfg=()=>MEMORY_LEVELS[level];
  const elapsed=()=>Math.floor((Date.now()-startedAt)/1000);
  const score=()=>clamp(Math.round((3500-moves*50-elapsed()*3)*cfg().mult),100,9999);
  const bestKey=()=>`mobiliza.memoria.best.${level}`;
  const best=()=>JSON.parse(localStorage.getItem(bestKey())||'null');

  const ensureAudio=()=>{
    if(!soundOn) return null;
    try{
      const C=window.AudioContext||window.webkitAudioContext;
      if(!C) return null;
      if(!audioCtx) audioCtx=new C();
      if(audioCtx.state==='suspended') audioCtx.resume();
      return audioCtx;
    }catch{return null;}
  };
  const tone=(f,d=.06,delay=0,type='sine',gain=.04)=>{
    const c=ensureAudio(); if(!c) return;
    const o=c.createOscillator(),g=c.createGain(),t=c.currentTime+delay;
    o.type=type;o.frequency.setValueAtTime(f,t);
    g.gain.setValueAtTime(.0001,t);
    g.gain.exponentialRampToValueAtTime(gain,t+.01);
    g.gain.exponentialRampToValueAtTime(.0001,t+d);
    o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+d+.03);
  };
  const sounds={
    flip:()=>tone(520,.04,0,'square',.02),
    ok:()=>{tone(523,.07,0,'triangle',.045);tone(659,.07,.07,'triangle',.045);tone(784,.14,.14,'triangle',.05);},
    no:()=>{tone(300,.07,0,'sawtooth',.03);tone(210,.11,.07,'sawtooth',.028);},
    finish:()=>{tone(523,.08,0,'triangle',.05);tone(659,.08,.08,'triangle',.05);tone(784,.08,.16,'triangle',.05);tone(1046,.24,.24,'triangle',.06);}
  };

  const buildDeck=()=>{
    const pairs=MEMORY_PAIRS.slice(0,cfg().pairs);
    const cards=[];
    pairs.forEach((p,pairIndex)=>{
      cards.push({key:p.key,pair:p,copy:1,state:'closed'});
      cards.push({key:p.key,pair:p,copy:2,state:'closed'});
    });
    deck=shuffle(cards).map((c,index)=>({...c,index,number:index+1}));
    firstIndex=null;secondIndex=null;lock=false;moves=0;matchedPairs=0;finished=false;startedAt=Date.now();
  };

  const closedMarkup=card=>`<span class="mem-closed"><b class="mem-number">${card.number}</b><small>CARTA</small></span>`;
  const openMarkup=card=>`<span class="mem-open"><b class="mem-open-number">${card.number}</b><img src="${card.pair.image}" alt="${card.pair.title}" draggable="false"><strong>${card.pair.title}</strong></span>`;

  const cardClass=card=>`mem-card ${card.state==='open'?'is-open':''} ${card.state==='matched'?'is-open is-matched':''}`;

  const paintCard=index=>{
    const card=deck[index];
    const btn=host.querySelector(`[data-memory-index="${index}"]`);
    if(!card||!btn) return;
    btn.className=cardClass(card);
    btn.setAttribute('aria-pressed',card.state==='closed'?'false':'true');
    btn.dataset.state=card.state;
    btn.disabled=card.state==='matched';
    btn.innerHTML=card.state==='closed'?closedMarkup(card):openMarkup(card);
  };

  const updateHud=()=>{
    const m=host.querySelector('#memMoves'),p=host.querySelector('#memPairs'),t=host.querySelector('#memTime'),s=host.querySelector('#memScore');
    if(m)m.textContent=String(moves);
    if(p)p.textContent=String(matchedPairs);
    if(t)t.textContent=elapsed()+'s';
    if(s)s.textContent=String(score());
  };

  const startTimer=()=>{
    if(timerId)clearInterval(timerId);
    updateHud();
    timerId=setInterval(()=>{if(!finished)updateHud();},500);
  };

  const showToast=(ok,pair)=>{
    const t=host.querySelector('#memToast'); if(!t) return;
    t.className=`mem-toast show ${ok?'ok':'miss'}`;
    t.innerHTML=ok
      ?`<strong>✅ Par encontrado: ${pair.title}</strong><small>${pair.detail}</small>`
      :`<strong>❌ Não formou par.</strong><small>As duas cartas serão fechadas. Memorize as posições.</small>`;
    setTimeout(()=>{if(t)t.className='mem-toast';},ok?1600:1000);
  };

  const resetSelection=()=>{
    firstIndex=null;
    secondIndex=null;
    lock=false;
    host.querySelector('#memGrid')?.classList.remove('locked');
  };

  const finish=()=>{
    if(finished)return;
    finished=true;
    if(timerId)clearInterval(timerId);
    sounds.finish();

    const seconds=elapsed();
    const finalScore=score();
    const record={score:finalScore,moves,seconds,date:new Date().toISOString()};
    const old=best();
    if(!old||finalScore>old.score||(finalScore===old.score&&moves<old.moves)){
      localStorage.setItem(bestKey(),JSON.stringify(record));
    }
    saveMemoryResult(cfg().pairs,moves,finalScore);
    onFinish?.();

    const completedPairs=MEMORY_PAIRS.slice(0,cfg().pairs);
    host.innerHTML=`<section class="memory-result-v27">
      <div class="mem-result-hero">
        <img src="assets/games/jogo_da_memoria_mobiliza_educa.svg?v=27" alt="Jogo da Memória">
        <div>
          <p class="eyebrow">JOGO DA MEMÓRIA • RESULTADO</p>
          <h2>Todos os pares encontrados!</h2>
        </div>
        <div class="mem-result-trophy">🏆</div>
      </div>

      <div class="mem-result-summary">
        <div class="mem-result-stat"><span>🎚️ Nível</span><strong>${cfg().label}</strong></div>
        <div class="mem-result-stat"><span>🎯 Jogadas</span><strong>${moves}</strong></div>
        <div class="mem-result-stat"><span>⏱ Tempo</span><strong>${seconds}s</strong></div>
        <div class="mem-result-stat"><span>⭐ Pontos</span><strong>${finalScore}</strong></div>
      </div>

      <div class="mem-result-body">
        <div class="mem-result-pairs">
          ${completedPairs.map(p=>`<div class="mem-result-pair"><img src="${p.image}" alt="${p.title}"><div><strong>✅ ${p.title}</strong><small>${p.detail}</small></div></div>`).join('')}
        </div>
        <div class="mem-result-message">
          <div class="big">🧠✨</div>
          <h3>Missão cumprida!</h3>
          <p>Você encontrou os ${cfg().pairs} pares e revisou atitudes importantes para um trânsito mais seguro.</p>
          <p><strong>Melhor resultado ${cfg().label}:</strong><br>${best()?.score||finalScore} pontos</p>
        </div>
      </div>

      <div class="mem-result-actions">
        <button type="button" class="btn primary" id="memAgain">↻ Jogar novamente</button>
        <button type="button" class="btn ghost" id="memClose">Encerrar</button>
      </div>
    </section>`;
    host.querySelector('#memAgain').onclick=()=>{buildDeck();render();};
    host.querySelector('#memClose').onclick=()=>dialog.close();
  };

  const chooseCard=async index=>{
    if(lock||finished) return;

    const card=deck[index];
    if(!card||card.state!=='closed') return;

    ensureAudio();
    sounds.flip();

    // PRIMEIRA ESCOLHA: abre e permanece aberta.
    if(firstIndex===null){
      firstIndex=index;
      card.state='open';
      paintCard(index);
      const firstBtn=host.querySelector(`[data-memory-index="${index}"]`);
      firstBtn?.classList.add('first-choice');
      const hint=host.querySelector('#memHint');
      if(hint)hint.innerHTML=`<span>👀</span><strong>1ª escolha: carta ${card.number}. Ela ficará aberta até você escolher a segunda.</strong>`;
      return;
    }

    // Não permite escolher novamente a própria primeira carta.
    if(index===firstIndex) return;

    // SEGUNDA ESCOLHA: abre antes da comparação e bloqueia novos cliques.
    secondIndex=index;
    card.state='open';
    paintCard(index);

    const first=deck[firstIndex];
    const second=deck[secondIndex];
    const firstBtn=host.querySelector(`[data-memory-index="${firstIndex}"]`);
    const secondBtn=host.querySelector(`[data-memory-index="${secondIndex}"]`);
    firstBtn?.classList.add('first-choice');
    secondBtn?.classList.add('second-choice');

    lock=true;
    host.querySelector('#memGrid')?.classList.add('locked');
    moves++;
    updateHud();

    const hint=host.querySelector('#memHint');
    if(hint)hint.innerHTML=`<span>🔎</span><strong>Comparando cartas ${first.number} e ${second.number}...</strong>`;

    // Dá tempo para as DUAS imagens ficarem visíveis simultaneamente.
    await sleep(700);

    const isMatch=first.key===second.key;

    if(isMatch){
      first.state='matched';
      second.state='matched';
      paintCard(firstIndex);
      paintCard(secondIndex);

      // Depois do repaint, reforça visual de par fixado.
      host.querySelector(`[data-memory-index="${firstIndex}"]`)?.classList.add('is-matched');
      host.querySelector(`[data-memory-index="${secondIndex}"]`)?.classList.add('is-matched');

      matchedPairs++;
      sounds.ok();
      showToast(true,first.pair);
      updateHud();

      const complete=matchedPairs===cfg().pairs;
      resetSelection();

      if(complete){
        await sleep(950);
        finish();
      }else{
        const h=host.querySelector('#memHint');
        if(h)h.innerHTML=`<span>✅</span><strong>Par ${first.number} + ${second.number} fixado! As duas cartas permanecerão abertas.</strong>`;
      }
      return;
    }

    // ERRO: mantém as duas abertas por 2 segundos antes de fechar.
    sounds.no();
    showToast(false,first?.pair||second?.pair);
    if(hint)hint.innerHTML=`<span>⏳</span><strong>Cartas ${first.number} e ${second.number} não formam par. Memorize as imagens...</strong>`;

    await sleep(2000);

    first.state='closed';
    second.state='closed';
    paintCard(firstIndex);
    paintCard(secondIndex);

    resetSelection();
    const h=host.querySelector('#memHint');
    if(h)h.innerHTML='<span>🎙️</span><strong>Diga ao operador os números das duas cartas que deseja abrir.</strong>';
  };

  const overlay=html=>{
    const o=host.querySelector('#memOverlay'); if(!o)return null;
    o.className='mem-overlay show';o.innerHTML=html;return o;
  };
  const closeOverlay=()=>{const o=host.querySelector('#memOverlay');if(o){o.className='mem-overlay';o.innerHTML='';}};

  const changeLevel=newLevel=>{
    if(!MEMORY_LEVELS[newLevel]||newLevel===level)return;
    const o=overlay(`<div class="mem-modal"><h3>Mudar para ${MEMORY_LEVELS[newLevel].label}?</h3><p>A partida atual será reiniciada e as cartas serão embaralhadas.</p><div class="mem-modal-actions"><button class="btn primary" id="memLevelYes">Mudar nível</button><button class="btn ghost" id="memLevelNo">Cancelar</button></div></div>`);
    o.querySelector('#memLevelYes').onclick=()=>{level=newLevel;localStorage.setItem('mobiliza.memoria.level',level);if(timerId)clearInterval(timerId);buildDeck();render();};
    o.querySelector('#memLevelNo').onclick=closeOverlay;
  };

  const showRules=()=>{
    const o=overlay(`<div class="mem-modal"><h3>Como jogar</h3><p>1. O participante fala o número da primeira carta e o operador abre.<br>2. A primeira carta fica aberta.<br>3. O participante escolhe a segunda carta.<br>4. O jogo compara automaticamente.<br>5. Se forem iguais, as duas ficam abertas; se forem diferentes, fecham após 1,2 segundo.</p><p><strong>Fácil:</strong> 6 pares • <strong>Médio:</strong> 8 pares • <strong>Difícil:</strong> 10 pares</p><button class="btn primary" id="memRulesOk">Entendi</button></div>`);
    o.querySelector('#memRulesOk').onclick=closeOverlay;
  };

  const restart=()=>{
    const o=overlay(`<div class="mem-modal"><h3>Reiniciar?</h3><p>As posições serão embaralhadas e os contadores zerados.</p><div class="mem-modal-actions"><button class="btn primary" id="memRestartYes">Sim, reiniciar</button><button class="btn ghost" id="memRestartNo">Cancelar</button></div></div>`);
    o.querySelector('#memRestartYes').onclick=()=>{if(timerId)clearInterval(timerId);buildDeck();render();};
    o.querySelector('#memRestartNo').onclick=closeOverlay;
  };

  const render=()=>{
    const b=best();
    host.innerHTML=`<section class="game memory-v27 level-${level}">
      <div class="mem-hero">
        <img src="assets/games/jogo_da_memoria_mobiliza_educa.svg?v=27" alt="Jogo da Memória">
        <div><p class="eyebrow">JOGO DA MEMÓRIA • MOTOR v27</p><h2>Encontre os pares do trânsito</h2><p>A primeira carta permanece aberta até a escolha da segunda. O jogo faz a comparação automaticamente.</p></div>
      </div>

      <div class="mem-toolbar">
        <div class="mem-stats">
          <div class="mem-stat"><span>🎯 Jogadas</span><strong id="memMoves">${moves}</strong></div>
          <div class="mem-stat"><span>🧩 Pares</span><strong><b id="memPairs">${matchedPairs}</b>/${cfg().pairs}</strong></div>
          <div class="mem-stat"><span>⏱ Tempo</span><strong id="memTime">0s</strong></div>
          <div class="mem-stat"><span>⭐ Pontos</span><strong id="memScore">${score()}</strong></div>
        </div>
        <div class="mem-tools">
          ${Object.entries(MEMORY_LEVELS).map(([k,v])=>`<button class="mem-level ${k===level?'active':''}" data-mem-level="${k}">${v.label}</button>`).join('')}
          <button class="mem-tool" id="memSound">${soundOn?'🔊':'🔇'} Som</button>
          <button class="mem-tool" id="memRules">❔ Como jogar</button>
          <button class="mem-tool" id="memRestart">↻ Reiniciar</button>
        </div>
      </div>

      <div class="mem-board-wrap">
        <div class="mem-grid" id="memGrid">
          ${deck.map(card=>`<button type="button" class="${cardClass(card)}" data-memory-index="${card.index}" aria-label="Carta ${card.number}" aria-pressed="false">${closedMarkup(card)}</button>`).join('')}
        </div>
      </div>

      <div class="mem-footer">
        <div class="mem-hint" id="memHint"><span>🎙️</span><strong>Diga ao operador os números das duas cartas que deseja abrir.</strong></div>
        <div class="mem-best"><span>🏆 Melhor ${cfg().label}</span><strong>${b?`${b.score} pts • ${b.moves} jogadas`:'Sem recorde'}</strong></div>
      </div>

      <div id="memToast" class="mem-toast"></div>
      <div id="memOverlay" class="mem-overlay"></div>
    </section>`;

    const grid=host.querySelector('#memGrid');
    grid.onclick=e=>{
      const btn=e.target.closest('[data-memory-index]');
      if(!btn||!grid.contains(btn))return;
      chooseCard(Number(btn.dataset.memoryIndex));
    };

    host.querySelectorAll('[data-mem-level]').forEach(btn=>btn.onclick=()=>changeLevel(btn.dataset.memLevel));
    host.querySelector('#memSound').onclick=()=>{
      soundOn=!soundOn;
      localStorage.setItem('mobiliza.memoria.sound',soundOn?'1':'0');
      host.querySelector('#memSound').textContent=(soundOn?'🔊':'🔇')+' Som';
    };
    host.querySelector('#memRules').onclick=showRules;
    host.querySelector('#memRestart').onclick=restart;

    startTimer();
  };

  buildDeck();
  render();
  if(!dialog.open)dialog.showModal();
}