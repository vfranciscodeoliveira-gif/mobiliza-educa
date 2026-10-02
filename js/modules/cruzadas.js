
const ALL_WORDS=[
  {key:'velocidade',word:'VELOCIDADE',image:'assets/memory/velocidade.svg?v=28',clue:'Ritmo de deslocamento que deve respeitar os limites e as condições da via.',row:7,col:2,dir:'H'},
  {key:'seguranca',word:'SEGURANCA',image:'assets/memory/capacete.svg?v=28',clue:'Objetivo principal das atitudes responsáveis no trânsito.',row:6,col:3,dir:'V'},
  {key:'bicicleta',word:'BICICLETA',image:'assets/memory/bicicleta.svg?v=28',clue:'Veículo de duas rodas movido principalmente pela força humana.',row:6,col:7,dir:'V'},
  {key:'transito',word:'TRANSITO',image:'assets/memory/faixa.svg?v=28',clue:'Espaço de convivência e circulação de pessoas, veículos e animais.',row:14,col:5,dir:'H'},
  {key:'respeito',word:'RESPEITO',image:'assets/memory/pedestre.svg?v=28',clue:'Valor essencial para uma convivência mais segura entre todos.',row:12,col:6,dir:'H'},
  {key:'pedestre',word:'PEDESTRE',image:'assets/memory/pedestre.svg?v=28',clue:'Pessoa que se desloca a pé pelas vias e espaços de circulação.',row:5,col:10,dir:'V'},
  {key:'semaforo',word:'SEMAFORO',image:'assets/memory/semaforo.svg?v=28',clue:'Sinal luminoso que organiza e controla os fluxos de circulação.',row:2,col:5,dir:'V'},
  {key:'capacete',word:'CAPACETE',image:'assets/memory/capacete.svg?v=28',clue:'Equipamento de proteção essencial para motociclistas.',row:3,col:0,dir:'H'},
  {key:'escola',word:'ESCOLA',image:'assets/memory/escola.svg?v=28',clue:'Local que exige atenção redobrada e velocidade compatível no entorno.',row:9,col:9,dir:'H'},
  {key:'cinto',word:'CINTO',image:'assets/memory/cinto.svg?v=28',clue:'Equipamento de proteção obrigatório para os ocupantes do veículo.',row:3,col:0,dir:'V'}
];

const LEVELS={
  easy:{label:'Fácil',keys:['velocidade','seguranca','bicicleta','semaforo','pedestre'],base:3000},
  medium:{label:'Médio',keys:['velocidade','seguranca','bicicleta','semaforo','pedestre','escola','respeito'],base:4500},
  hard:{label:'Difícil',keys:['velocidade','seguranca','bicicleta','semaforo','pedestre','escola','respeito','transito','capacete','cinto'],base:6500}
};

const clean=s=>(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z]/g,'');
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));

function saveResult(count,attempts,score){
  const s=JSON.parse(localStorage.getItem('mobiliza.results')||'{"games":0,"correct":0,"answers":0,"best":0,"streak":0}');
  s.games=(s.games||0)+1;
  s.correct=(s.correct||0)+count;
  s.answers=(s.answers||0)+attempts;
  s.best=Math.max(s.best||0,score);
  localStorage.setItem('mobiliza.results',JSON.stringify(s));
}

function ensureCrosswordV30Styles(){
  if(document.getElementById('crossword-v30-styles'))return;
  const style=document.createElement('style');
  style.id='crossword-v30-styles';
  style.textContent=`
  #gameDialog.crossword-v30-dialog{
    width:min(1360px,96vw)!important;
    max-width:96vw!important;
    max-height:94vh!important;
    overflow:hidden!important;
  }
  #gameDialog.crossword-v30-dialog>.dialog-shell{
    height:94vh!important;
    max-height:94vh!important;
    overflow:hidden!important;
    border-radius:24px!important;
    background:#fff!important;
  }
  #gameDialog.crossword-v30-dialog #gameHost{
    height:100%!important;
    min-height:0!important;
    overflow:hidden!important;
  }
  #gameDialog.crossword-v30-dialog .dialog-close{
    position:absolute!important;
    top:12px!important;
    right:12px!important;
    z-index:300!important;
    margin:0!important;
  }

  .crossword-v30{
    box-sizing:border-box!important;
    width:100%!important;
    height:100%!important;
    min-height:0!important;
    overflow:hidden!important;
    display:grid!important;
    grid-template-rows:72px 48px minmax(0,1fr) 36px!important;
    gap:6px!important;
    padding:8px 12px 10px!important;
    position:relative!important;
    background:
      radial-gradient(circle at 12% 8%,rgba(74,175,232,.12),transparent 24%),
      linear-gradient(180deg,#f9fcff,#eef7fb)!important;
  }

  .crossword-v30 .cross-hero{
    min-height:0!important;
    display:grid!important;
    grid-template-columns:150px minmax(0,1fr)!important;
    align-items:center!important;
    gap:14px!important;
    padding:7px 12px!important;
    border-radius:15px!important;
    overflow:hidden!important;
    background:linear-gradient(135deg,#0a3f70,#0f6ca4 58%,#1591b6)!important;
    color:#fff!important;
  }
  .crossword-v30 .cross-hero img{
    width:150px!important;
    height:58px!important;
    object-fit:cover!important;
    border-radius:11px!important;
    box-shadow:0 5px 14px rgba(0,0,0,.20)!important;
  }
  .crossword-v30 .cross-hero .eyebrow{
    margin:0 0 1px!important;
    color:#fff!important;
    font-size:.50rem!important;
    letter-spacing:.12em!important;
  }
  .crossword-v30 .cross-hero h2{
    margin:0 0 2px!important;
    color:#fff!important;
    font-size:1.28rem!important;
    line-height:1.05!important;
  }
  .crossword-v30 .cross-hero p{
    margin:0!important;
    color:#e7f5fd!important;
    font-size:.64rem!important;
    line-height:1.2!important;
  }

  .crossword-v30 .cross-toolbar{
    min-height:0!important;
    display:grid!important;
    grid-template-columns:minmax(0,1fr) auto!important;
    gap:6px!important;
  }
  .crossword-v30 .cross-stats{
    min-height:0!important;
    display:grid!important;
    grid-template-columns:repeat(4,minmax(80px,1fr))!important;
    gap:5px!important;
  }
  .crossword-v30 .cross-stat,
  .crossword-v30 .cross-tools{
    height:48px!important;
    min-height:0!important;
    border:1px solid #d4e5ef!important;
    border-radius:11px!important;
    background:#fff!important;
    box-shadow:0 3px 9px rgba(15,60,102,.05)!important;
  }
  .crossword-v30 .cross-stat{
    display:flex!important;
    align-items:center!important;
    justify-content:space-between!important;
    gap:6px!important;
    padding:5px 9px!important;
  }
  .crossword-v30 .cross-stat span{
    color:#688093!important;
    font-size:.56rem!important;
    font-weight:800!important;
  }
  .crossword-v30 .cross-stat strong{
    color:#173f60!important;
    font-size:.90rem!important;
  }
  .crossword-v30 .cross-tools{
    display:flex!important;
    align-items:center!important;
    gap:4px!important;
    padding:4px!important;
  }
  .crossword-v30 .cross-level,
  .crossword-v30 .cross-tool{
    min-height:28px!important;
    padding:4px 7px!important;
    border:1px solid #cfdee8!important;
    border-radius:8px!important;
    background:#fff!important;
    color:#31536b!important;
    font-size:.54rem!important;
    font-weight:900!important;
    cursor:pointer!important;
    white-space:nowrap!important;
  }
  .crossword-v30 .cross-level.active{
    background:#0e659d!important;
    color:#fff!important;
    border-color:#0e659d!important;
  }

  .crossword-v30 .cross-main{
    min-height:0!important;
    overflow:hidden!important;
    display:grid!important;
    grid-template-columns:minmax(390px,.94fr) minmax(420px,1.06fr)!important;
    gap:8px!important;
  }
  .crossword-v30 .cross-board-panel,
  .crossword-v30 .cross-side{
    min-height:0!important;
    overflow:hidden!important;
    border:1px solid #cfdfE9!important;
    border-radius:17px!important;
    background:#fff!important;
  }
  .crossword-v30 .cross-board-panel{
    display:grid!important;
    place-items:center!important;
    padding:8px!important;
    background:
      radial-gradient(circle at 18% 12%,rgba(56,150,211,.16),transparent 24%),
      linear-gradient(145deg,#0a3a62,#0b527f)!important;
    box-shadow:inset 0 1px 0 rgba(255,255,255,.10)!important;
  }
  .crossword-v30 .cross-board{
    width:100%!important;
    height:100%!important;
    min-height:0!important;
    display:grid!important;
    gap:3px!important;
  }
  .crossword-v30 .cw-cell{
    position:relative!important;
    min-width:0!important;
    min-height:0!important;
    overflow:hidden!important;
    border-radius:5px!important;
    background:#fff!important;
    border:1px solid rgba(15,60,102,.16)!important;
    box-shadow:0 1px 3px rgba(0,0,0,.08)!important;
  }
  .crossword-v30 .cw-cell.block{
    background:rgba(255,255,255,.035)!important;
    border-color:rgba(255,255,255,.03)!important;
    box-shadow:none!important;
  }
  .crossword-v30 .cw-cell input{
    width:100%!important;
    height:100%!important;
    min-width:0!important;
    min-height:0!important;
    box-sizing:border-box!important;
    border:0!important;
    outline:0!important;
    padding:0!important;
    background:transparent!important;
    text-align:center!important;
    text-transform:uppercase!important;
    color:#103c62!important;
    font-size:clamp(.55rem,1.25vw,1.02rem)!important;
    line-height:1!important;
    font-weight:1000!important;
    caret-color:#0e659d!important;
  }
  .crossword-v30 .cw-cell .cw-number{
    position:absolute!important;
    left:2px!important;
    top:1px!important;
    z-index:3!important;
    color:#31566f!important;
    font-size:clamp(.28rem,.48vw,.46rem)!important;
    line-height:1!important;
    font-weight:1000!important;
    pointer-events:none!important;
  }
  .crossword-v30 .cw-cell.active{
    z-index:2!important;
    background:#fff7ca!important;
    border-color:#f0c446!important;
  }
  .crossword-v30 .cw-cell.current{
    box-shadow:inset 0 0 0 3px #efb62c,0 0 0 2px rgba(239,182,44,.18)!important;
  }
  .crossword-v30 .cw-cell.correct{
    background:#dcf5e5!important;
    border-color:#7dca9b!important;
  }
  .crossword-v30 .cw-cell.wrong{
    background:#ffe2df!important;
    border-color:#e98077!important;
    animation:crossShake .28s ease!important;
  }
  .crossword-v30 .cw-cell.hint{
    background:#e5f1ff!important;
    border-color:#77aee0!important;
  }
  @keyframes crossShake{
    0%,100%{transform:translateX(0)}
    35%{transform:translateX(-3px)}
    70%{transform:translateX(3px)}
  }

  .crossword-v30 .cross-side{
    display:grid!important;
    grid-template-rows:104px minmax(0,1fr)!important;
    gap:6px!important;
    padding:7px!important;
    background:linear-gradient(180deg,#f7fbfd,#eef6fa)!important;
  }
  .crossword-v30 .cross-focus{
    min-height:0!important;
    display:grid!important;
    grid-template-columns:94px minmax(0,1fr) auto!important;
    align-items:center!important;
    gap:10px!important;
    padding:7px 9px!important;
    border-radius:13px!important;
    border:1px solid #d3e3ed!important;
    background:#fff!important;
    box-shadow:0 4px 12px rgba(15,60,102,.05)!important;
  }
  .crossword-v30 .cross-focus img{
    width:94px!important;
    height:78px!important;
    object-fit:contain!important;
    border-radius:9px!important;
    background:#eaf4f8!important;
  }
  .crossword-v30 .cross-focus .dir{
    display:block!important;
    color:#6b8799!important;
    font-size:.46rem!important;
    text-transform:uppercase!important;
    letter-spacing:.10em!important;
    font-weight:1000!important;
  }
  .crossword-v30 .cross-focus h3{
    margin:2px 0!important;
    color:#173e5d!important;
    font-size:.80rem!important;
    line-height:1.15!important;
  }
  .crossword-v30 .cross-focus p{
    margin:0!important;
    color:#647d90!important;
    font-size:.58rem!important;
    line-height:1.2!important;
  }
  .crossword-v30 .cross-focus-actions{
    display:grid!important;
    gap:4px!important;
  }
  .crossword-v30 .cross-focus-actions button{
    min-width:82px!important;
    min-height:30px!important;
    padding:4px 7px!important;
    border:0!important;
    border-radius:8px!important;
    font-size:.52rem!important;
    font-weight:1000!important;
    cursor:pointer!important;
  }
  .crossword-v30 .cross-check{
    background:#0f6398!important;
    color:#fff!important;
  }
  .crossword-v30 .cross-clear{
    background:#eef4f7!important;
    color:#426074!important;
  }

  .crossword-v30 .cross-clues{
    min-height:0!important;
    overflow:auto!important;
    display:grid!important;
    align-content:start!important;
    gap:5px!important;
    padding-right:2px!important;
    scrollbar-width:thin!important;
  }
  .crossword-v30 .cross-clue{
    display:grid!important;
    grid-template-columns:30px 50px minmax(0,1fr) auto!important;
    align-items:center!important;
    gap:7px!important;
    min-height:56px!important;
    padding:5px 7px!important;
    border:1px solid #d5e4ed!important;
    border-radius:11px!important;
    background:#fff!important;
    color:#173e5d!important;
    text-align:left!important;
    cursor:pointer!important;
  }
  .crossword-v30 .cross-clue:hover,
  .crossword-v30 .cross-clue.active{
    border-color:#63a8d2!important;
    background:#f0f8fd!important;
  }
  .crossword-v30 .cross-clue.solved{
    border-color:#8bcaa2!important;
    background:#e9f8ee!important;
  }
  .crossword-v30 .cross-clue-no{
    display:grid!important;
    place-items:center!important;
    width:26px!important;
    height:26px!important;
    border-radius:50%!important;
    background:#0e5687!important;
    color:#fff!important;
    font-size:.66rem!important;
    font-weight:1000!important;
  }
  .crossword-v30 .cross-clue img{
    width:50px!important;
    height:40px!important;
    object-fit:contain!important;
    border-radius:7px!important;
    background:#edf5f9!important;
  }
  .crossword-v30 .cross-clue strong{
    display:block!important;
    color:#678397!important;
    font-size:.44rem!important;
    text-transform:uppercase!important;
    letter-spacing:.08em!important;
  }
  .crossword-v30 .cross-clue p{
    margin:2px 0 0!important;
    color:#28485e!important;
    font-size:.55rem!important;
    line-height:1.15!important;
  }
  .crossword-v30 .cross-clue-status{
    color:#0f5f91!important;
    font-size:.48rem!important;
    font-weight:1000!important;
    white-space:nowrap!important;
  }
  .crossword-v30 .cross-clue.solved .cross-clue-status{
    color:#278951!important;
  }

  .crossword-v30 .cross-footer{
    min-height:0!important;
    display:grid!important;
    grid-template-columns:minmax(0,1fr) auto!important;
    gap:6px!important;
    height:36px!important;
  }
  .crossword-v30 .cross-hint,
  .crossword-v30 .cross-best{
    display:flex!important;
    align-items:center!important;
    gap:6px!important;
    min-height:0!important;
    padding:4px 8px!important;
    border:1px solid #d5e5ee!important;
    border-radius:10px!important;
    background:#fff!important;
    color:#557185!important;
    font-size:.52rem!important;
  }
  .crossword-v30 .cross-best{
    min-width:205px!important;
    justify-content:space-between!important;
  }

  .crossword-v30 .cross-toast{
    position:absolute!important;
    left:50%!important;
    bottom:42px!important;
    z-index:120!important;
    width:min(570px,80%)!important;
    transform:translate(-50%,14px)!important;
    opacity:0!important;
    pointer-events:none!important;
    display:flex!important;
    align-items:center!important;
    gap:9px!important;
    padding:9px 11px!important;
    border-radius:14px!important;
    background:rgba(7,49,83,.97)!important;
    color:#fff!important;
    box-shadow:0 14px 34px rgba(0,0,0,.24)!important;
    transition:.2s ease!important;
  }
  .crossword-v30 .cross-toast.show{
    opacity:1!important;
    transform:translate(-50%,0)!important;
  }
  .crossword-v30 .cross-toast.ok{background:rgba(15,108,66,.97)!important}
  .crossword-v30 .cross-toast.no{background:rgba(133,61,43,.97)!important}
  .crossword-v30 .cross-toast img{
    width:58px!important;
    height:42px!important;
    object-fit:contain!important;
    border-radius:8px!important;
    background:#fff!important;
  }
  .crossword-v30 .cross-toast strong{display:block!important;font-size:.68rem!important}
  .crossword-v30 .cross-toast small{display:block!important;margin-top:2px!important;font-size:.54rem!important;color:#e5f2f8!important}

  .crossword-v30 .cross-overlay{
    position:absolute!important;
    inset:0!important;
    z-index:150!important;
    display:grid!important;
    place-items:center!important;
    opacity:0!important;
    pointer-events:none!important;
    background:rgba(3,18,37,.10)!important;
    transition:.2s!important;
  }
  .crossword-v30 .cross-overlay.show{
    opacity:1!important;
    pointer-events:auto!important;
    background:rgba(3,18,37,.70)!important;
    backdrop-filter:blur(2px)!important;
  }
  .crossword-v30 .cross-modal{
    width:min(560px,88%)!important;
    display:grid!important;
    justify-items:center!important;
    gap:10px!important;
    padding:22px 26px!important;
    border-radius:22px!important;
    text-align:center!important;
    background:linear-gradient(180deg,#0b477a,#062c54)!important;
    color:#fff!important;
    border:2px solid rgba(255,255,255,.24)!important;
    box-shadow:0 26px 74px rgba(0,0,0,.42)!important;
  }
  .crossword-v30 .cross-modal h3{margin:0!important;color:#fff!important;font-size:1.35rem!important}
  .crossword-v30 .cross-modal p{margin:0!important;color:#dceefa!important;line-height:1.4!important}
  .crossword-v30 .cross-modal-actions{display:flex!important;gap:8px!important;justify-content:center!important;flex-wrap:wrap!important}

  .crossword-result-v28{
    box-sizing:border-box!important;
    width:100%!important;
    height:100%!important;
    min-height:0!important;
    overflow:hidden!important;
    display:grid!important;
    grid-template-rows:auto auto minmax(0,1fr) auto!important;
    gap:10px!important;
    padding:14px 18px 16px!important;
    background:linear-gradient(180deg,#f9fcff,#edf7fb)!important;
  }
  .crossword-result-v28 .cross-result-hero{
    display:grid!important;
    grid-template-columns:150px minmax(0,1fr) 68px!important;
    align-items:center!important;
    gap:14px!important;
    padding:10px 14px!important;
    border-radius:18px!important;
    background:linear-gradient(135deg,#0b4779,#0f6ca4 58%,#1593b8)!important;
    color:#fff!important;
  }
  .crossword-result-v28 .cross-result-hero img{
    width:150px!important;height:76px!important;object-fit:cover!important;border-radius:12px!important;
  }
  .crossword-result-v28 .cross-result-hero h2{margin:0!important;color:#fff!important;font-size:1.4rem!important}
  .crossword-result-v28 .cross-result-hero p{margin:0 0 2px!important;color:#d9effc!important;font-size:.56rem!important;letter-spacing:.1em!important;font-weight:900!important}
  .crossword-result-v28 .cross-result-trophy{
    display:grid!important;place-items:center!important;width:64px!important;height:64px!important;border-radius:50%!important;background:linear-gradient(145deg,#ffd85b,#f1a623)!important;font-size:2rem!important;
  }
  .crossword-result-v28 .cross-result-stats{
    display:grid!important;grid-template-columns:repeat(4,1fr)!important;gap:8px!important;
  }
  .crossword-result-v28 .cross-result-stat{
    display:flex!important;align-items:center!important;justify-content:space-between!important;gap:8px!important;padding:9px 12px!important;border:1px solid #d4e5ef!important;border-radius:14px!important;background:#fff!important;
  }
  .crossword-result-v28 .cross-result-stat span{color:#6c8292!important;font-size:.68rem!important;font-weight:800!important}
  .crossword-result-v28 .cross-result-stat strong{color:#123f63!important;font-size:1.05rem!important}
  .crossword-result-v28 .cross-result-body{
    min-height:0!important;overflow:auto!important;display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:7px!important;padding:8px!important;border:1px solid #d4e5ef!important;border-radius:15px!important;background:#fff!important;
  }
  .crossword-result-v28 .cross-result-word{
    display:grid!important;grid-template-columns:64px minmax(0,1fr)!important;align-items:center!important;gap:8px!important;padding:7px!important;border:1px solid #dbe8ef!important;border-radius:11px!important;background:#f8fbfd!important;
  }
  .crossword-result-v28 .cross-result-word img{width:64px!important;height:46px!important;object-fit:contain!important;border-radius:7px!important;background:#edf6fa!important}
  .crossword-result-v28 .cross-result-word strong{display:block!important;color:#173e5d!important;font-size:.68rem!important}
  .crossword-result-v28 .cross-result-word small{display:block!important;color:#748b9b!important;font-size:.50rem!important;line-height:1.15!important}
  .crossword-result-v28 .cross-result-actions{display:flex!important;justify-content:center!important;gap:10px!important}
  .crossword-result-v28 .cross-result-actions .btn{min-width:150px!important}

  @media(max-height:650px) and (min-width:761px){
    .crossword-v30{grid-template-rows:58px 40px minmax(0,1fr) 28px!important;gap:4px!important;padding:6px 9px 7px!important}
    .crossword-v30 .cross-hero{grid-template-columns:112px minmax(0,1fr)!important;padding:4px 8px!important}
    .crossword-v30 .cross-hero img{width:112px!important;height:46px!important}
    .crossword-v30 .cross-hero h2{font-size:1.06rem!important}
    .crossword-v30 .cross-hero p{font-size:.52rem!important}
    .crossword-v30 .cross-stat,.crossword-v30 .cross-tools{height:40px!important}
    .crossword-v30 .cross-stat span{font-size:.48rem!important}
    .crossword-v30 .cross-stat strong{font-size:.76rem!important}
    .crossword-v30 .cross-level,.crossword-v30 .cross-tool{min-height:24px!important;padding:3px 5px!important;font-size:.47rem!important}
    .crossword-v30 .cross-main{grid-template-columns:minmax(350px,.96fr) minmax(380px,1.04fr)!important;gap:5px!important}
    .crossword-v30 .cross-side{grid-template-rows:84px minmax(0,1fr)!important;padding:5px!important;gap:4px!important}
    .crossword-v30 .cross-focus{grid-template-columns:72px minmax(0,1fr) auto!important;padding:5px 7px!important;gap:7px!important}
    .crossword-v30 .cross-focus img{width:72px!important;height:60px!important}
    .crossword-v30 .cross-focus h3{font-size:.66rem!important}
    .crossword-v30 .cross-focus p{font-size:.48rem!important}
    .crossword-v30 .cross-focus-actions button{min-height:25px!important;font-size:.45rem!important}
    .crossword-v30 .cross-clue{grid-template-columns:26px 42px minmax(0,1fr) auto!important;min-height:46px!important;padding:4px 6px!important;gap:5px!important}
    .crossword-v30 .cross-clue img{width:42px!important;height:34px!important}
    .crossword-v30 .cross-clue p{font-size:.46rem!important}
    .crossword-v30 .cross-clue strong,.crossword-v30 .cross-clue-status{font-size:.39rem!important}
    .crossword-v30 .cross-footer{height:28px!important}
    .crossword-v30 .cross-hint,.crossword-v30 .cross-best{font-size:.44rem!important;padding:3px 6px!important}
  }

  @media(max-width:760px){
    #gameDialog.crossword-v30-dialog>.dialog-shell{height:auto!important;max-height:94vh!important;overflow:auto!important}
    #gameDialog.crossword-v30-dialog #gameHost{height:auto!important;overflow:visible!important}
    .crossword-v30{height:auto!important;max-height:none!important;overflow:visible!important;display:block!important}
    .crossword-v30 .cross-hero{grid-template-columns:1fr!important}
    .crossword-v30 .cross-hero img{width:100%!important;height:auto!important;max-height:150px!important}
    .crossword-v30 .cross-toolbar{grid-template-columns:1fr!important;margin:7px 0!important}
    .crossword-v30 .cross-stats{grid-template-columns:repeat(2,1fr)!important}
    .crossword-v30 .cross-tools{height:auto!important;flex-wrap:wrap!important;justify-content:center!important}
    .crossword-v30 .cross-main{grid-template-columns:1fr!important}
    .crossword-v30 .cross-board-panel{min-height:430px!important}
    .crossword-v30 .cross-side{min-height:520px!important}
    .crossword-v30 .cross-footer{height:auto!important;grid-template-columns:1fr!important;margin-top:7px!important}
  }`;
  document.head.appendChild(style);
}

export function openCruzadas(dialog,host,onFinish){
  ensureCrosswordV30Styles();
  dialog.classList.add('crossword-v30-dialog');
  dialog.addEventListener('close',()=>dialog.classList.remove('crossword-v30-dialog'),{once:true});

  let level=localStorage.getItem('mobiliza.cruzadas.level')||'medium';
  if(!LEVELS[level])level='medium';

  let solved=new Set();
  let attempts=0;
  let hints=0;
  let start=Date.now();
  let timerId=null;
  let activeIndex=0;
  let cells=new Map();
  let wordCells=[];
  let wordNumbers=[];
  let bounds=null;
  let soundOn=localStorage.getItem('mobiliza.cruzadas.sound')!=='0';
  let audioCtx=null;
  let finished=false;

  const levelCfg=()=>LEVELS[level];
  const words=()=>levelCfg().keys.map(k=>ALL_WORDS.find(w=>w.key===k)).filter(Boolean);
  const elapsed=()=>Math.floor((Date.now()-start)/1000);
  const score=()=>clamp(levelCfg().base-(attempts*45)-(hints*90)-(elapsed()*2),100,9999);
  const bestKey=()=>`mobiliza.cruzadas.best.${level}`;
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
  const tone=(freq,d=.07,delay=0,type='sine',gain=.035)=>{
    const c=ensureAudio();if(!c)return;
    const o=c.createOscillator(),g=c.createGain(),t=c.currentTime+delay;
    o.type=type;o.frequency.setValueAtTime(freq,t);
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(gain,t+.01);g.gain.exponentialRampToValueAtTime(.0001,t+d);
    o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+d+.03);
  };
  const sounds={
    key:()=>tone(540,.035,0,'square',.014),
    ok:()=>{tone(523,.07,0,'triangle',.04);tone(659,.07,.07,'triangle',.04);tone(784,.13,.14,'triangle',.045);},
    no:()=>{tone(285,.08,0,'sawtooth',.025);tone(205,.11,.08,'sawtooth',.025);},
    hint:()=>{tone(660,.06,0,'sine',.03);tone(880,.12,.07,'sine',.035);},
    finish:()=>{tone(523,.08,0,'triangle',.05);tone(659,.08,.08,'triangle',.05);tone(784,.08,.16,'triangle',.05);tone(1046,.24,.24,'triangle',.06);}
  };

  const buildPuzzle=()=>{
    cells=new Map();
    wordCells=[];
    const selected=words();

    selected.forEach((w,wi)=>{
      const list=[];
      [...w.word].forEach((letter,n)=>{
        const r=w.row+(w.dir==='V'?n:0);
        const c=w.col+(w.dir==='H'?n:0);
        const key=`${r}-${c}`;
        if(!cells.has(key))cells.set(key,{r,c,letter,words:[]});
        const cell=cells.get(key);
        if(!cell.words.includes(wi))cell.words.push(wi);
        list.push(key);
      });
      wordCells.push(list);
    });

    const rs=[...cells.values()].map(x=>x.r);
    const cs=[...cells.values()].map(x=>x.c);
    bounds={minR:Math.min(...rs),maxR:Math.max(...rs),minC:Math.min(...cs),maxC:Math.max(...cs)};
    bounds.rows=bounds.maxR-bounds.minR+1;
    bounds.cols=bounds.maxC-bounds.minC+1;

    const startKeys=[...new Set(selected.map(w=>`${w.row}-${w.col}`))]
      .map(k=>{const [r,c]=k.split('-').map(Number);return {k,r,c};})
      .sort((a,b)=>a.r-b.r||a.c-b.c);
    const startNo=new Map(startKeys.map((x,i)=>[x.k,i+1]));
    wordNumbers=selected.map(w=>startNo.get(`${w.row}-${w.col}`));

    solved=new Set();
    attempts=0;
    hints=0;
    activeIndex=0;
    finished=false;
    start=Date.now();
  };

  const gridMarkup=()=>{
    let html='';
    for(let r=bounds.minR;r<=bounds.maxR;r++){
      for(let c=bounds.minC;c<=bounds.maxC;c++){
        const key=`${r}-${c}`;
        const cell=cells.get(key);
        if(!cell){
          html+='<span class="cw-cell block"></span>';
          continue;
        }
        const starts=[];
        words().forEach((w,wi)=>{if(w.row===r&&w.col===c)starts.push(wordNumbers[wi]);});
        const number=starts.length?Math.min(...starts):'';
        html+=`<label class="cw-cell" data-cell="${key}" data-words="${cell.words.join(',')}">
          ${number?`<span class="cw-number">${number}</span>`:''}
          <input maxlength="1" autocomplete="off" spellcheck="false" inputmode="text" aria-label="Linha ${r+1}, coluna ${c+1}" data-r="${r}" data-c="${c}">
        </label>`;
      }
    }
    return html;
  };

  const clueMarkup=()=>words().map((w,i)=>`
    <button type="button" class="cross-clue ${i===activeIndex?'active':''} ${solved.has(i)?'solved':''}" data-clue="${i}">
      <span class="cross-clue-no">${wordNumbers[i]}</span>
      <img src="${w.image}" alt="">
      <div>
        <strong>${w.dir==='H'?'Horizontal':'Vertical'} • ${w.word.length} letras</strong>
        <p>${w.clue}</p>
      </div>
      <span class="cross-clue-status">${solved.has(i)?'✓ Resolvida':'Selecionar'}</span>
    </button>`).join('');

  const bestText=()=>{
    const b=best();
    return b?`${b.score} pts • ${b.attempts} tentativas`:'Sem recorde';
  };

  const render=()=>{
    const w=words()[activeIndex]||words()[0];
    host.innerHTML=`<section class="game crossword-v30">
      <div class="cross-hero">
        <img src="assets/games/palavras_cruzadas_do_transito.svg?v=30" alt="Palavras Cruzadas do Trânsito">
        <div>
          <p class="eyebrow">PALAVRAS CRUZADAS DO TRÂNSITO • v30</p>
          <h2>Complete a grade pelas pistas</h2>
          <p>Escolha uma pista, digite a palavra e use os cruzamentos para descobrir as demais.</p>
        </div>
      </div>

      <div class="cross-toolbar">
        <div class="cross-stats">
          <div class="cross-stat"><span>✅ Concluídas</span><strong><b id="crossSolved">${solved.size}</b>/${words().length}</strong></div>
          <div class="cross-stat"><span>🎯 Tentativas</span><strong id="crossAttempts">${attempts}</strong></div>
          <div class="cross-stat"><span>⏱ Tempo</span><strong id="crossTime">0s</strong></div>
          <div class="cross-stat"><span>⭐ Pontos</span><strong id="crossScore">${score()}</strong></div>
        </div>
        <div class="cross-tools">
          ${Object.entries(LEVELS).map(([k,v])=>`<button type="button" class="cross-level ${k===level?'active':''}" data-level="${k}">${v.label}</button>`).join('')}
          <button type="button" class="cross-tool" id="crossSound">${soundOn?'🔊':'🔇'} Som</button>
          <button type="button" class="cross-tool" id="crossHelp">💡 Letra</button>
          <button type="button" class="cross-tool" id="crossRules">❔ Como jogar</button>
          <button type="button" class="cross-tool" id="crossRestart">↻ Reiniciar</button>
        </div>
      </div>

      <div class="cross-main">
        <div class="cross-board-panel">
          <div class="cross-board" id="crossBoard" style="grid-template-columns:repeat(${bounds.cols},minmax(0,1fr));grid-template-rows:repeat(${bounds.rows},minmax(0,1fr))">
            ${gridMarkup()}
          </div>
        </div>

        <div class="cross-side">
          <div class="cross-focus" id="crossFocus">
            <img id="crossFocusImage" src="${w.image}" alt="">
            <div>
              <span class="dir" id="crossFocusDir">${wordNumbers[activeIndex]} • ${w.dir==='H'?'Horizontal':'Vertical'} • ${w.word.length} letras</span>
              <h3 id="crossFocusTitle">Pista selecionada</h3>
              <p id="crossFocusText">${w.clue}</p>
            </div>
            <div class="cross-focus-actions">
              <button type="button" class="cross-check" id="crossCheck">✓ Conferir</button>
              <button type="button" class="cross-clear" id="crossClear">⌫ Limpar</button>
            </div>
          </div>
          <div class="cross-clues" id="crossClues">${clueMarkup()}</div>
        </div>
      </div>

      <div class="cross-footer">
        <div class="cross-hint" id="crossHint"><span>✏️</span><strong>Selecione uma pista para destacar a palavra na grade.</strong></div>
        <div class="cross-best"><span>🏆 Melhor ${levelCfg().label}</span><strong>${bestText()}</strong></div>
      </div>

      <div class="cross-toast" id="crossToast"></div>
      <div class="cross-overlay" id="crossOverlay"></div>
    </section>`;

    bind();
    selectWord(activeIndex,false);
    startTimer();
  };

  const getInputByKey=key=>{
    const [r,c]=key.split('-').map(Number);
    return host.querySelector(`[data-r="${r}"][data-c="${c}"]`);
  };

  const getWordInputs=i=>wordCells[i].map(getInputByKey).filter(Boolean);

  const selectWord=(i,focus=true)=>{
    if(i<0||i>=words().length)return;
    activeIndex=i;
    const w=words()[i];

    host.querySelectorAll('.cw-cell').forEach(el=>el.classList.remove('active','current'));
    host.querySelectorAll('.cross-clue').forEach(el=>el.classList.remove('active'));

    wordCells[i].forEach(key=>host.querySelector(`[data-cell="${key}"]`)?.classList.add('active'));
    host.querySelector(`[data-clue="${i}"]`)?.classList.add('active');

    const img=host.querySelector('#crossFocusImage');
    const dir=host.querySelector('#crossFocusDir');
    const text=host.querySelector('#crossFocusText');
    const title=host.querySelector('#crossFocusTitle');
    if(img)img.src=w.image;
    if(dir)dir.textContent=`${wordNumbers[i]} • ${w.dir==='H'?'Horizontal':'Vertical'} • ${w.word.length} letras`;
    if(text)text.textContent=w.clue;
    if(title)title.textContent=solved.has(i)?`✓ Palavra resolvida`:'Pista selecionada';

    const h=host.querySelector('#crossHint');
    if(h)h.innerHTML=`<span>🔎</span><strong>Pista ${wordNumbers[i]} ${w.dir==='H'?'horizontal':'vertical'} selecionada.</strong>`;

    if(focus&&!solved.has(i)){
      const inputs=getWordInputs(i);
      const target=inputs.find(x=>!x.readOnly&&!clean(x.value));

      if(target){
        focusInput(target);
      }else{
        // Pode acontecer de os cruzamentos já terem completado toda a palavra.
        autoCheckIfCorrect(i);
      }
    }
  };

  const focusInput=inp=>{
    if(!inp)return false;
    inp.focus();
    host.querySelectorAll('.cw-cell').forEach(el=>el.classList.remove('current'));
    inp.closest('.cw-cell')?.classList.add('current');
    return true;
  };

  const moveInWord=(from,delta,{skipFilled=false}={})=>{
    const inputs=getWordInputs(activeIndex);
    const idx=inputs.indexOf(from);
    if(idx<0)return false;

    for(let j=idx+delta;j>=0&&j<inputs.length;j+=delta){
      const candidate=inputs[j];

      // Ao digitar, letras já existentes nos cruzamentos são reconhecidas
      // automaticamente e o cursor procura a próxima casa vazia.
      if(skipFilled&&(candidate.readOnly||clean(candidate.value))){
        continue;
      }

      // Na navegação para trás, nunca para em letra bloqueada por palavra resolvida.
      if(delta<0&&candidate.readOnly){
        continue;
      }

      return focusInput(candidate);
    }
    return false;
  };

  const wordValue=i=>getWordInputs(i).map(inp=>clean(inp.value)).join('');
  const wordIsComplete=i=>getWordInputs(i).every(inp=>clean(inp.value).length===1);

  const autoCheckIfCorrect=i=>{
    if(solved.has(i)||!wordIsComplete(i))return false;
    const w=words()[i];

    // A conferência automática só dispara quando a palavra completa está correta.
    // Assim um erro de digitação não penaliza o jogador antes de ele pedir "Conferir".
    if(wordValue(i)!==w.word)return false;

    const h=host.querySelector('#crossHint');
    if(h)h.innerHTML='<span>⚡</span><strong>Palavra completa! Conferindo automaticamente...</strong>';

    setTimeout(()=>{
      if(!solved.has(i)&&wordValue(i)===words()[i].word){
        checkWord(i,{automatic:true});
      }
    },120);
    return true;
  };

  const bind=()=>{
    host.querySelectorAll('.cw-cell input').forEach(inp=>{
      inp.addEventListener('focus',()=>{
        const cell=inp.closest('.cw-cell');
        const choices=(cell?.dataset.words||'').split(',').map(Number).filter(Number.isFinite);
        if(!choices.includes(activeIndex)&&choices.length){
          const candidate=choices.find(i=>!solved.has(i))??choices[0];
          selectWord(candidate,false);
        }
        host.querySelectorAll('.cw-cell').forEach(el=>el.classList.remove('current'));
        cell?.classList.add('current');
      });

      inp.addEventListener('input',()=>{
        inp.value=clean(inp.value).slice(-1);
        if(!inp.value)return;

        sounds.key();

        // Se as casas seguintes já têm letras vindas de cruzamentos,
        // pula todas elas e leva o cursor à próxima casa realmente vazia.
        const moved=moveInWord(inp,1,{skipFilled:true});

        // Ao preencher a última casa necessária, a palavra correta é
        // reconhecida e validada sem exigir o botão "Conferir".
        if(!moved||wordIsComplete(activeIndex)){
          autoCheckIfCorrect(activeIndex);
        }
      });

      inp.addEventListener('keydown',e=>{
        if(e.key==='Backspace'){
          if(inp.value){
            inp.value='';
            e.preventDefault();
          }else{
            moveInWord(inp,-1,{skipFilled:false});
          }
        }else if(e.key==='ArrowRight'||e.key==='ArrowDown'){
          e.preventDefault();moveInWord(inp,1);
        }else if(e.key==='ArrowLeft'||e.key==='ArrowUp'){
          e.preventDefault();moveInWord(inp,-1);
        }else if(e.key==='Enter'){
          e.preventDefault();checkWord(activeIndex);
        }
      });
    });

    host.querySelectorAll('[data-clue]').forEach(btn=>btn.onclick=()=>selectWord(+btn.dataset.clue,true));
    host.querySelectorAll('[data-level]').forEach(btn=>btn.onclick=()=>changeLevel(btn.dataset.level));
    host.querySelector('#crossCheck').onclick=()=>checkWord(activeIndex);
    host.querySelector('#crossClear').onclick=()=>clearWord(activeIndex);
    host.querySelector('#crossHelp').onclick=showLetter;
    host.querySelector('#crossRestart').onclick=restart;
    host.querySelector('#crossRules').onclick=showRules;
    host.querySelector('#crossSound').onclick=()=>{
      soundOn=!soundOn;
      localStorage.setItem('mobiliza.cruzadas.sound',soundOn?'1':'0');
      if(soundOn){ensureAudio();sounds.key();}
      const b=host.querySelector('#crossSound');
      if(b)b.textContent=(soundOn?'🔊':'🔇')+' Som';
    };
  };

  const updateHud=()=>{
    const a=host.querySelector('#crossAttempts');
    const s=host.querySelector('#crossSolved');
    const t=host.querySelector('#crossTime');
    const p=host.querySelector('#crossScore');
    if(a)a.textContent=attempts;
    if(s)s.textContent=solved.size;
    if(t)t.textContent=elapsed()+'s';
    if(p)p.textContent=score();
  };

  const startTimer=()=>{
    if(timerId)clearInterval(timerId);
    updateHud();
    timerId=setInterval(()=>{if(!finished)updateHud();},500);
  };

  const toast=(ok,w,text)=>{
    const t=host.querySelector('#crossToast');if(!t)return;
    t.className=`cross-toast show ${ok?'ok':'no'}`;
    t.innerHTML=`<img src="${w.image}" alt=""><div><strong>${ok?'✅ Palavra correta!':'❌ Ainda não.'}</strong><small>${text}</small></div>`;
    setTimeout(()=>{if(t)t.className='cross-toast';},ok?1700:1200);
  };

  const checkWord=(i,{automatic=false}={})=>{
    if(solved.has(i))return;
    const w=words()[i];
    const inputs=getWordInputs(i);
    attempts++;
    let ok=true;

    inputs.forEach((inp,n)=>{
      const expected=w.word[n];
      const got=clean(inp.value);
      const cell=inp.closest('.cw-cell');
      cell?.classList.remove('wrong');
      if(got!==expected){
        ok=false;
        if(got)cell?.classList.add('wrong');
      }
    });

    updateHud();

    if(!ok){
      sounds.no();
      toast(false,w,'Confira as letras preenchidas e use os cruzamentos como pista.');
      setTimeout(()=>getWordInputs(i).forEach(inp=>inp.closest('.cw-cell')?.classList.remove('wrong')),650);
      return;
    }

    solved.add(i);
    inputs.forEach((inp,n)=>{
      inp.value=w.word[n];
      inp.readOnly=true;
      inp.closest('.cw-cell')?.classList.add('correct');
    });
    sounds.ok();

    const clue=host.querySelector(`[data-clue="${i}"]`);
    clue?.classList.add('solved');
    const status=clue?.querySelector('.cross-clue-status');
    if(status)status.textContent='✓ Resolvida';

    const title=host.querySelector('#crossFocusTitle');
    if(title)title.textContent='✓ Palavra resolvida';
    const h=host.querySelector('#crossHint');
    if(h)h.innerHTML=`<span>✅</span><strong>${w.word} concluída! As letras cruzadas ajudam nas outras palavras.</strong>`;

    toast(true,w,`${automatic?'Conferida automaticamente. ':''}${w.word}: ${w.clue}`);
    updateHud();

    if(solved.size===words().length){
      setTimeout(finish,900);
      return;
    }

    const next=words().findIndex((_,idx)=>!solved.has(idx));
    if(next>=0)setTimeout(()=>selectWord(next,true),500);
  };

  const clearWord=i=>{
    if(solved.has(i))return;
    getWordInputs(i).forEach(inp=>{
      if(!inp.readOnly){
        const key=`${inp.dataset.r}-${inp.dataset.c}`;
        const cell=cells.get(key);
        const belongsSolved=cell?.words.some(wi=>solved.has(wi));
        if(!belongsSolved)inp.value='';
      }
    });
    selectWord(i,true);
  };

  const showLetter=()=>{
    const i=activeIndex;
    if(solved.has(i))return;
    const w=words()[i];
    const inputs=getWordInputs(i);
    const blanks=inputs.map((inp,n)=>({inp,n})).filter(x=>clean(x.inp.value)!==w.word[x.n]);
    if(!blanks.length){
      checkWord(i);
      return;
    }
    const pick=blanks[Math.floor(Math.random()*blanks.length)];
    pick.inp.value=w.word[pick.n];
    pick.inp.closest('.cw-cell')?.classList.add('hint');
    hints++;
    sounds.hint();
    updateHud();
    const h=host.querySelector('#crossHint');
    if(h)h.innerHTML=`<span>💡</span><strong>Uma letra da pista ${wordNumbers[i]} foi revelada. Ajuda usada: ${hints}.</strong>`;
    setTimeout(()=>pick.inp.closest('.cw-cell')?.classList.remove('hint'),1000);
  };

  const overlay=html=>{
    const o=host.querySelector('#crossOverlay');if(!o)return null;
    o.className='cross-overlay show';o.innerHTML=html;return o;
  };
  const closeOverlay=()=>{
    const o=host.querySelector('#crossOverlay');
    if(o){o.className='cross-overlay';o.innerHTML='';}
  };

  const changeLevel=newLevel=>{
    if(!LEVELS[newLevel]||newLevel===level)return;
    const o=overlay(`<div class="cross-modal"><h3>Mudar para nível ${LEVELS[newLevel].label}?</h3><p>A grade será reconstruída e a partida atual será reiniciada.</p><div class="cross-modal-actions"><button class="btn primary" id="crossLevelYes">Mudar nível</button><button class="btn ghost" id="crossLevelNo">Cancelar</button></div></div>`);
    o.querySelector('#crossLevelYes').onclick=()=>{
      level=newLevel;
      localStorage.setItem('mobiliza.cruzadas.level',level);
      if(timerId)clearInterval(timerId);
      buildPuzzle();render();
    };
    o.querySelector('#crossLevelNo').onclick=closeOverlay;
  };

  const restart=()=>{
    const o=overlay(`<div class="cross-modal"><h3>Reiniciar palavras cruzadas?</h3><p>As letras, tentativas, tempo e pontuação serão zerados.</p><div class="cross-modal-actions"><button class="btn primary" id="crossRestartYes">Sim, reiniciar</button><button class="btn ghost" id="crossRestartNo">Cancelar</button></div></div>`);
    o.querySelector('#crossRestartYes').onclick=()=>{if(timerId)clearInterval(timerId);buildPuzzle();render();};
    o.querySelector('#crossRestartNo').onclick=closeOverlay;
  };

  const showRules=()=>{
    const o=overlay(`<div class="cross-modal"><h3>Como jogar</h3><p>1. Clique em uma pista para destacar a palavra na grade.<br>2. Digite as letras; o cursor avança na direção da palavra e pula automaticamente casas já preenchidas pelos cruzamentos.<br>3. Ao completar corretamente a palavra, ela é conferida automaticamente. Você ainda pode usar <strong>Enter</strong> ou <strong>Conferir</strong>.<br>4. Palavras corretas ficam verdes e ajudam nos cruzamentos.<br>5. O botão <strong>Letra</strong> revela uma letra, mas reduz a pontuação.</p><p><strong>Fácil:</strong> 5 palavras • <strong>Médio:</strong> 7 palavras • <strong>Difícil:</strong> 10 palavras.</p><button class="btn primary" id="crossRulesOk">Entendi</button></div>`);
    o.querySelector('#crossRulesOk').onclick=closeOverlay;
  };

  const finish=()=>{
    if(finished)return;
    finished=true;
    if(timerId)clearInterval(timerId);
    sounds.finish();

    const seconds=elapsed();
    const finalScore=score();
    const record={score:finalScore,attempts,hints,seconds,date:new Date().toISOString()};
    const old=best();
    if(!old||finalScore>old.score||(finalScore===old.score&&attempts<old.attempts)){
      localStorage.setItem(bestKey(),JSON.stringify(record));
    }
    saveResult(words().length,attempts,finalScore);
    onFinish?.();

    host.innerHTML=`<section class="crossword-result-v28">
      <div class="cross-result-hero">
        <img src="assets/games/palavras_cruzadas_do_transito.svg?v=30" alt="Palavras Cruzadas do Trânsito">
        <div><p>PALAVRAS CRUZADAS • RESULTADO</p><h2>Grade concluída!</h2></div>
        <div class="cross-result-trophy">✏️</div>
      </div>

      <div class="cross-result-stats">
        <div class="cross-result-stat"><span>🎚️ Nível</span><strong>${levelCfg().label}</strong></div>
        <div class="cross-result-stat"><span>🎯 Tentativas</span><strong>${attempts}</strong></div>
        <div class="cross-result-stat"><span>⏱ Tempo</span><strong>${seconds}s</strong></div>
        <div class="cross-result-stat"><span>⭐ Pontos</span><strong>${finalScore}</strong></div>
      </div>

      <div class="cross-result-body">
        ${words().map(w=>`<div class="cross-result-word"><img src="${w.image}" alt=""><div><strong>✅ ${w.word}</strong><small>${w.clue}</small></div></div>`).join('')}
      </div>

      <div class="cross-result-actions">
        <button type="button" class="btn primary" id="crossAgain">↻ Jogar novamente</button>
        <button type="button" class="btn ghost" id="crossClose">Encerrar</button>
      </div>
    </section>`;

    host.querySelector('#crossAgain').onclick=()=>{buildPuzzle();render();};
    host.querySelector('#crossClose').onclick=()=>dialog.close();
  };

  buildPuzzle();
  render();
  if(!dialog.open)dialog.showModal();
}
