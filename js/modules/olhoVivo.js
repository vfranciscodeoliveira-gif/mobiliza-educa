const BASE_SCENE='assets/games/cidade_mirim_realista_ai_v35.webp?v=37';

const LEVELS={
  facil:{label:'Fácil',time:105,wrong:0,hintCost:0,showZones:true,zoneLabel:true},
  medio:{label:'Médio',time:85,wrong:50,hintCost:75,showZones:true,zoneLabel:false},
  dificil:{label:'Difícil',time:65,wrong:100,hintCost:125,showZones:false,zoneLabel:false}
};

const SCENES=[
  {
    id:'escola',title:'Saída da escola',subtitle:'Crianças, travessia e veículos no mesmo espaço',emoji:'🏫',
    bgSize:'116%',bgPos:'48% 46%',tone:'',
    tip:'Observe a faixa, a aproximação dos veículos, a escola e os usuários mais vulneráveis.',
    risks:[
      {x:39,y:56,w:16,h:19,icon:'🚗',title:'Veículo ocupando área de travessia',text:'A faixa e sua aproximação precisam permanecer livres para preservar a visibilidade e o espaço do pedestre.',hint:'Observe a faixa de pedestres.'},
      {x:50,y:49,w:13,h:20,icon:'🚶',title:'Pedestre em situação de conflito',text:'Travessias exigem observação dos dois sentidos e confirmação de que os veículos perceberam o pedestre.',hint:'Observe quem está atravessando.'},
      {x:60,y:54,w:14,h:18,icon:'🏍️',title:'Motociclista em zona de conflito',text:'Em áreas escolares e cruzamentos, velocidade compatível e distância são essenciais para reduzir riscos.',hint:'Observe as motocicletas.'},
      {x:71,y:48,w:14,h:18,icon:'🚌',title:'Veículo grande reduzindo a visibilidade',text:'Ônibus e veículos altos podem esconder pedestres e outros veículos. Redobre a atenção antes de avançar.',hint:'Observe os veículos maiores.'},
      {x:23,y:42,w:18,h:20,icon:'🚸',title:'Área escolar exige atenção ampliada',text:'A presença de crianças muda o nível de risco da via. Reduza a velocidade e antecipe movimentos inesperados.',hint:'Observe a região da escola.'}
    ]
  },
  {
    id:'cruzamento',title:'Cruzamento urbano',subtitle:'Prioridade, retenção, conversões e visibilidade',emoji:'🚦',
    bgSize:'145%',bgPos:'51% 48%',tone:'scene-zoom',
    tip:'Procure conflitos entre quem segue em frente, quem converte e quem atravessa.',
    risks:[
      {x:46,y:55,w:15,h:18,icon:'🛑',title:'Linha de retenção e faixa',text:'Parar antes da linha de retenção preserva a faixa de pedestres e melhora a leitura do cruzamento.',hint:'Observe a área anterior à faixa.'},
      {x:57,y:48,w:14,h:18,icon:'↪️',title:'Conversão com conflito',text:'Antes de converter, o condutor deve verificar pedestres, ciclistas e veículos que já têm prioridade.',hint:'Observe quem está mudando de direção.'},
      {x:34,y:50,w:14,h:19,icon:'🚶',title:'Travessia em área de conflito',text:'O pedestre precisa ser percebido e respeitado. O condutor deve antecipar a possibilidade de travessia.',hint:'Observe os pedestres próximos ao cruzamento.'},
      {x:66,y:60,w:13,h:18,icon:'🏍️',title:'Motocicleta próxima ao ponto de conflito',text:'Cruzamentos exigem redução de velocidade e leitura do movimento de todos os usuários.',hint:'Observe a motocicleta.'},
      {x:75,y:47,w:16,h:18,icon:'👀',title:'Visibilidade parcialmente bloqueada',text:'Veículos podem esconder outros usuários. Avance somente quando houver campo visual suficiente.',hint:'Observe o que pode estar encoberto.'}
    ]
  },
  {
    id:'avenida',title:'Avenida movimentada',subtitle:'Velocidade, distância e mudanças de trajetória',emoji:'🛣️',
    bgSize:'135%',bgPos:'57% 50%',tone:'scene-warm',
    tip:'Observe a velocidade aparente, o espaçamento entre veículos e mudanças de faixa.',
    risks:[
      {x:52,y:55,w:16,h:18,icon:'📏',title:'Distância insuficiente',text:'Manter distância permite reagir e frear com segurança diante de uma parada inesperada.',hint:'Compare a distância entre os veículos.'},
      {x:68,y:49,w:13,h:18,icon:'🏍️',title:'Motociclista muito próximo do fluxo',text:'O motociclista fica mais vulnerável quando circula sem margem de reação entre veículos.',hint:'Observe a posição das motocicletas.'},
      {x:40,y:46,w:13,h:19,icon:'📱',title:'Possível distração ao volante',text:'Desviar a atenção da via reduz o tempo disponível para perceber e reagir a um risco.',hint:'Observe o comportamento dos condutores.'},
      {x:77,y:56,w:15,h:19,icon:'🚲',title:'Ciclista próximo ao fluxo motorizado',text:'Ao ultrapassar ou converter, é necessário manter distância e conferir a presença de ciclistas.',hint:'Observe a ciclovia e o ciclista.'},
      {x:59,y:38,w:17,h:17,icon:'⚠️',title:'Fluxo intenso exige velocidade compatível',text:'Quanto maior a densidade de tráfego, maior a necessidade de reduzir velocidade e ampliar a atenção.',hint:'Observe o conjunto da avenida.'}
    ]
  },
  {
    id:'ciclistas',title:'Ciclistas e pedestres',subtitle:'Convivência entre usuários vulneráveis',emoji:'🚲',
    bgSize:'154%',bgPos:'67% 55%',tone:'scene-cool',
    tip:'Procure situações em que bicicletas, pedestres e veículos dividem a mesma área.',
    risks:[
      {x:72,y:55,w:15,h:22,icon:'🚲',title:'Ciclista em área de conflito',text:'O ciclista deve ser considerado nas conversões e ultrapassagens. Preserve distância lateral e previsibilidade.',hint:'Observe o ciclista.'},
      {x:46,y:58,w:17,h:21,icon:'🚶',title:'Pedestres próximos ao fluxo',text:'Pedestres podem alterar a trajetória rapidamente. Reduza e esteja pronto para parar.',hint:'Observe quem está a pé.'},
      {x:58,y:52,w:15,h:18,icon:'↩️',title:'Conflito de trajetórias',text:'Quando trajetórias se cruzam, sinalização, velocidade e contato visual ajudam a evitar colisões.',hint:'Observe onde trajetórias se encontram.'},
      {x:33,y:48,w:14,h:18,icon:'🚗',title:'Veículo próximo à travessia',text:'O condutor deve preservar a área de travessia e não bloquear a visão de pedestres e ciclistas.',hint:'Observe os veículos próximos da faixa.'},
      {x:80,y:43,w:15,h:18,icon:'👀',title:'Ponto cego e visibilidade',text:'Antes de mudar de direção, é necessário verificar espelhos e pontos cegos para detectar usuários menores.',hint:'Observe as laterais dos veículos.'}
    ]
  },
  {
    id:'chuva',title:'Chuva e baixa visibilidade',subtitle:'Mais distância, menos velocidade, mais atenção',emoji:'🌧️',
    bgSize:'126%',bgPos:'50% 50%',tone:'scene-rain',
    tip:'Imagine a pista molhada: procure situações que exigem maior distância e redução de velocidade.',
    risks:[
      {x:50,y:57,w:17,h:20,icon:'💧',title:'Distância de frenagem aumenta',text:'Com pista molhada, a aderência diminui e o espaço necessário para parar pode aumentar.',hint:'Observe a distância entre os veículos.'},
      {x:65,y:52,w:14,h:18,icon:'🌧️',title:'Velocidade incompatível com baixa visibilidade',text:'Na chuva, reduza a velocidade para manter controle e tempo de reação.',hint:'Observe o ritmo do fluxo.'},
      {x:38,y:47,w:14,h:20,icon:'🚶',title:'Pedestre menos visível',text:'Chuva e reflexos dificultam a percepção. Redobre a atenção nas travessias.',hint:'Observe os pedestres.'},
      {x:72,y:60,w:15,h:18,icon:'🚲',title:'Ciclista mais vulnerável',text:'Piso molhado e menor visibilidade aumentam a vulnerabilidade do ciclista. Amplie a distância lateral.',hint:'Observe a ciclovia.'},
      {x:57,y:37,w:16,h:17,icon:'💡',title:'Necessidade de maior percepção visual',text:'Condições adversas exigem atenção constante à sinalização, iluminação e movimentos do tráfego.',hint:'Observe a sinalização e a visibilidade.'}
    ]
  }
];

function css(){
  if(document.getElementById('olho-vivo-v37-css'))return;
  const s=document.createElement('style');s.id='olho-vivo-v37-css';
  s.textContent=`
  #gameDialog.olho-vivo-dialog{width:min(1500px,98vw)!important;max-width:98vw!important;max-height:96vh!important;overflow:hidden!important}
  #gameDialog.olho-vivo-dialog>.dialog-shell{height:96vh!important;max-height:96vh!important;overflow:hidden!important;border-radius:22px!important;background:#eef7fb!important}
  #gameDialog.olho-vivo-dialog #gameHost{height:100%!important;overflow:hidden!important}
  #gameDialog.olho-vivo-dialog .dialog-close{position:absolute!important;top:10px!important;right:10px!important;z-index:900!important}
  .ov37{box-sizing:border-box;height:100%;display:grid;grid-template-rows:72px 48px minmax(0,1fr) 70px 30px;gap:6px;padding:8px;background:linear-gradient(180deg,#f9fdff,#e9f4f9);overflow:hidden;color:#173f60}
  .ov37 *{box-sizing:border-box}.ov37 button{font:inherit}
  .ov37 .hero{display:grid;grid-template-columns:164px 1fr;gap:12px;align-items:center;padding:7px 58px 7px 9px;border-radius:17px;background:linear-gradient(135deg,#063d69,#056799 58%,#0a9db8);color:#fff;overflow:hidden}
  .ov37 .heroCover{height:58px;border-radius:12px;background:url('${BASE_SCENE}') center/cover;box-shadow:inset 0 0 0 1px rgba(255,255,255,.25)}
  .ov37 .eyebrow{margin:0;font-size:.44rem;letter-spacing:.11em;font-weight:1000;color:#c9efff}.ov37 .hero h2{margin:2px 0;font-size:1.18rem;line-height:1.03;color:#fff}.ov37 .hero small{font-size:.55rem;color:#e8f8ff}
  .ov37 .top{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:6px}.ov37 .stats{display:grid;grid-template-columns:repeat(5,1fr);gap:5px}.ov37 .stat,.ov37 .tools{height:48px;border:1px solid #d4e4ec;border-radius:11px;background:#fff}.ov37 .stat{display:flex;justify-content:space-between;align-items:center;gap:5px;padding:5px 9px}.ov37 .stat span{font-size:.45rem;color:#708796;font-weight:900}.ov37 .stat b{font-size:.82rem}
  .ov37 .tools{display:flex;gap:4px;padding:4px}.ov37 .tool{min-height:30px;border:1px solid #cbdde6;border-radius:8px;background:#fff;color:#31536b;font-size:.43rem;font-weight:1000;padding:3px 7px;cursor:pointer}.ov37 .tool:hover{background:#eef7fb}
  .ov37 .main{min-height:0;display:grid;grid-template-columns:minmax(560px,1.56fr) minmax(300px,.44fr);gap:7px;overflow:hidden}
  .ov37 .sceneWrap,.ov37 .side{min-height:0;border:1px solid #cfe1eb;border-radius:17px;background:#fff;overflow:hidden}
  .ov37 .sceneWrap{padding:6px;background:#dfeef4}.ov37 .scene{position:relative;width:100%;height:100%;min-height:0;border-radius:13px;background-image:url('${BASE_SCENE}');background-repeat:no-repeat;overflow:hidden;cursor:crosshair;box-shadow:inset 0 0 0 2px rgba(255,255,255,.35)}
  .ov37 .scene:before{content:"";position:absolute;inset:0;z-index:1;pointer-events:none;background:linear-gradient(180deg,rgba(0,0,0,.015),rgba(0,0,0,.10))}
  .ov37 .scene.scene-warm:before{background:linear-gradient(180deg,rgba(255,186,74,.05),rgba(0,0,0,.12))}.ov37 .scene.scene-cool:before{background:linear-gradient(180deg,rgba(43,143,185,.06),rgba(0,0,0,.12))}
  .ov37 .scene.scene-rain:before{background:linear-gradient(180deg,rgba(22,42,58,.25),rgba(11,25,39,.40)),repeating-linear-gradient(105deg,transparent 0 18px,rgba(220,241,255,.28) 18px 20px,transparent 20px 38px)}
  .ov37 .sceneLabel{position:absolute;left:9px;top:9px;z-index:5;padding:5px 8px;border-radius:999px;background:rgba(3,31,52,.86);color:#fff;font-size:.41rem;font-weight:1000;backdrop-filter:blur(4px)}
  .ov37 .phaseBadge{position:absolute;right:9px;top:9px;z-index:5;padding:5px 8px;border-radius:999px;background:rgba(255,184,37,.94);color:#173f60;font-size:.4rem;font-weight:1000}
  .ov37 .zone{position:absolute;z-index:10;transform:translate(-50%,-50%);border:0;background:transparent;cursor:pointer;border-radius:28px}
  .ov37 .zone:before{content:"";position:absolute;inset:4px;border-radius:inherit;border:2px solid transparent;transition:.2s}.ov37 .show-zones .zone:before{border-color:rgba(255,208,60,.72);background:rgba(255,208,60,.10);box-shadow:0 0 0 6px rgba(255,208,60,.08);animation:ov37Pulse 1.35s infinite}.ov37 .medium-zones .zone:before{border-style:dashed;opacity:.62}
  .ov37 .zone .suspect{display:none;position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);min-width:27px;height:27px;padding:0 6px;border-radius:999px;background:#ffb829;color:#123957;border:2px solid #fff;font-size:.44rem;font-weight:1000;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,.23)}.ov37 .label-zones .zone .suspect{display:flex}
  .ov37 .zone.hint:before{border-color:#fff!important;background:rgba(255,213,58,.24)!important;box-shadow:0 0 0 10px rgba(255,211,58,.18)!important;animation:ov37Hint .55s infinite!important}.ov37 .zone.found{pointer-events:none}.ov37 .zone.found:before{border:3px solid #fff!important;background:#27a962!important;box-shadow:0 4px 14px rgba(0,0,0,.3)!important;inset:calc(50% - 18px);border-radius:50%}.ov37 .zone.found:after{content:"✓";position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);color:#fff;font-size:1.05rem;font-weight:1000;z-index:2}
  @keyframes ov37Pulse{50%{box-shadow:0 0 0 12px rgba(255,208,60,0)}}@keyframes ov37Hint{50%{transform:scale(1.05)}}.ov37 .miss{position:absolute;z-index:30;transform:translate(-50%,-50%);width:34px;height:34px;border-radius:50%;display:grid;place-items:center;background:#dc3834;border:3px solid #fff;color:#fff;font-weight:1000;pointer-events:none;animation:ov37Miss .65s forwards}@keyframes ov37Miss{0%{scale:.5;opacity:0}35%{scale:1.1;opacity:1}100%{scale:.9;opacity:0}}
  .ov37 .side{display:grid;grid-template-rows:auto auto minmax(0,1fr) auto;gap:6px;padding:8px;background:linear-gradient(180deg,#f9fcfe,#eef6fa)}.ov37 .sideCard{padding:8px;border:1px solid #d7e6ed;border-radius:12px;background:#fff}.ov37 .sideCard h3{margin:0;font-size:.72rem}.ov37 .sideCard p{margin:3px 0 0;font-size:.49rem;line-height:1.35;color:#6c8393}.ov37 .meter{height:8px;margin-top:6px;border-radius:99px;background:#e2edf2;overflow:hidden}.ov37 .meter i{display:block;height:100%;background:linear-gradient(90deg,#2db26d,#73d492);width:0;transition:.3s}
  .ov37 .levels{display:grid;grid-template-columns:repeat(3,1fr);gap:4px}.ov37 .level{min-height:31px;border:1px solid #ccdde7;border-radius:8px;background:#fff;color:#31536b;font-size:.42rem;font-weight:1000;cursor:pointer}.ov37 .level.active{background:#0b679b;color:#fff;border-color:#0b679b}
  .ov37 .riskList{min-height:0;overflow:auto;display:grid;align-content:start;gap:4px}.ov37 .risk{display:grid;grid-template-columns:25px 1fr;gap:6px;align-items:center;padding:5px;border:1px solid #dce8ee;border-radius:9px;background:#f8fbfd}.ov37 .risk i{font-style:normal;width:24px;height:24px;border-radius:50%;display:grid;place-items:center;background:#dfe9ef;color:#718695;font-size:.42rem;font-weight:1000}.ov37 .risk strong{display:block;font-size:.44rem}.ov37 .risk small{display:block;font-size:.36rem;color:#7a8f9c}.ov37 .risk.found{background:#eaf8ef;border-color:#9bd3ad}.ov37 .risk.found i{background:#29a661;color:#fff}
  .ov37 .tip{padding:7px;border:1px solid #efd77d;border-radius:10px;background:#fff6cf;font-size:.43rem;line-height:1.25;color:#695716}
  .ov37 .phases{display:grid;grid-template-columns:repeat(5,1fr);gap:5px;min-height:0}.ov37 .phase{min-height:64px;display:grid;grid-template-columns:46px 1fr;align-items:center;gap:6px;padding:6px;border:1px solid #d3e3eb;border-radius:11px;background:#fff;color:#31536b;cursor:pointer;text-align:left;overflow:hidden}.ov37 .phase .pic{height:50px;border-radius:8px;background:url('${BASE_SCENE}') center/cover}.ov37 .phase b{display:block;font-size:.43rem}.ov37 .phase small{display:block;font-size:.34rem;color:#7b8e9a}.ov37 .phase.current{border:2px solid #ffbf2e;background:#fff9e4}.ov37 .phase.locked{opacity:.48;cursor:not-allowed}.ov37 .phase.done{border-color:#85cea0;background:#edf9f1}
  .ov37 .foot{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:5px}.ov37 .status,.ov37 .best{height:30px;display:flex;align-items:center;gap:6px;padding:4px 8px;border:1px solid #d4e4ec;border-radius:8px;background:#fff;font-size:.4rem;color:#5e7787}.ov37 .best{min-width:195px;justify-content:space-between}
  .ov37 .overlay{position:absolute;inset:0;z-index:400;display:grid;place-items:center;padding:20px;background:rgba(2,20,34,.77);backdrop-filter:blur(4px)}.ov37 .card{width:min(620px,92%);display:grid;gap:9px;padding:19px;border-radius:20px;background:linear-gradient(180deg,#fff,#eef7fb);border:2px solid #fff;box-shadow:0 30px 90px rgba(0,0,0,.4)}.ov37 .card .ico{font-size:2rem}.ov37 .card h3{margin:0;font-size:1rem}.ov37 .card p{margin:0;font-size:.62rem;line-height:1.42;color:#607888}.ov37 .actions{display:flex;gap:7px;justify-content:flex-end}.ov37 .actions .btn{min-width:150px}
  .ov37Result{height:100%;overflow:auto;padding:12px 15px;background:linear-gradient(180deg,#f9fdff,#eaf5fa)}.ov37Result .resultHero{display:grid;grid-template-columns:150px 1fr 68px;gap:12px;align-items:center;padding:10px 14px;border-radius:17px;background:linear-gradient(135deg,#063d69,#056799,#0a9db8);color:#fff}.ov37Result .resultPic{height:72px;border-radius:10px;background:url('${BASE_SCENE}') center/cover}.ov37Result h2{margin:2px 0;color:#fff}.ov37Result .medal{width:62px;height:62px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(145deg,#ffe15f,#f1aa25);font-size:1.8rem}.ov37Result .summary{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin-top:8px}.ov37Result .sum{display:flex;justify-content:space-between;padding:9px;border:1px solid #d4e4ec;border-radius:10px;background:#fff}.ov37Result .sum span{font-size:.52rem;color:#6c8494}.ov37Result .sum b{font-size:.82rem}.ov37Result .learn{margin-top:8px;display:grid;grid-template-columns:repeat(2,1fr);gap:7px}.ov37Result .learnItem{display:grid;grid-template-columns:34px 1fr;gap:7px;padding:8px;border:1px solid #dce8ee;border-radius:10px;background:#fff}.ov37Result .learnItem b{font-size:1.1rem}.ov37Result .learnItem strong{display:block;font-size:.54rem}.ov37Result .learnItem small{display:block;font-size:.42rem;color:#748b99;line-height:1.25}.ov37Result .resultActions{display:flex;justify-content:center;gap:8px;margin-top:10px}
  @media(max-width:760px){
    #gameDialog.olho-vivo-dialog{width:100vw!important;max-width:100vw!important;height:100dvh!important;max-height:100dvh!important;margin:0!important;padding:0!important;inset:0!important;border:0!important;border-radius:0!important}
    #gameDialog.olho-vivo-dialog>.dialog-shell{height:100dvh!important;max-height:100dvh!important;border-radius:0!important}.ov37{grid-template-rows:54px 72px minmax(0,1fr) 62px 27px;padding:5px;gap:4px}.ov37 .hero{grid-template-columns:72px 1fr;padding:4px 50px 4px 5px}.ov37 .heroCover{height:42px}.ov37 .eyebrow{font-size:.31rem}.ov37 .hero h2{font-size:.82rem}.ov37 .hero small{display:none}.ov37 .top{grid-template-columns:1fr;grid-template-rows:38px 30px;gap:4px}.ov37 .stats{gap:3px}.ov37 .stat{height:38px;display:grid;place-items:center;padding:2px}.ov37 .stat span{font-size:.29rem}.ov37 .stat b{font-size:.55rem}.ov37 .tools{height:30px}.ov37 .tool{flex:1;min-width:0;padding:2px;font-size:.34rem}
    .ov37 .main{grid-template-columns:1fr;grid-template-rows:minmax(315px,64%) minmax(0,36%);gap:4px}.ov37 .sceneWrap{padding:4px}.ov37 .scene{min-height:305px}.ov37 .sceneLabel,.ov37 .phaseBadge{font-size:.31rem}.ov37 .side{grid-template-rows:auto auto auto;padding:5px;gap:4px}.ov37 .sideCard{padding:5px}.ov37 .sideCard h3{font-size:.5rem}.ov37 .sideCard p{font-size:.36rem}.ov37 .riskList{display:none}.ov37 .tip{font-size:.34rem}.ov37 .level{min-height:27px;font-size:.35rem}.ov37 .zone .suspect{height:24px;min-width:24px;font-size:.35rem}
    .ov37 .phases{gap:3px}.ov37 .phase{min-height:60px;display:block;padding:3px;text-align:center}.ov37 .phase .pic{height:34px}.ov37 .phase b{font-size:.29rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.ov37 .phase small{display:none}.ov37 .status{font-size:.31rem}.ov37 .best{display:none}.ov37 .overlay{position:fixed;padding:62px 10px 10px}.ov37 .card{padding:13px;max-height:calc(100dvh - 80px);overflow:auto}.ov37 .card h3{font-size:.82rem}.ov37 .card p{font-size:.52rem}.ov37Result .resultHero{grid-template-columns:90px 1fr 48px}.ov37Result .resultPic{height:58px}.ov37Result .summary{grid-template-columns:repeat(2,1fr)}.ov37Result .learn{grid-template-columns:1fr}.ov37Result .resultActions{display:grid;grid-template-columns:1fr 1fr}
  }`;
  document.head.appendChild(s);
}

function saveGlobal(score,correct,answers){
  const s=JSON.parse(localStorage.getItem('mobiliza.results')||'{"games":0,"correct":0,"answers":0,"best":0,"streak":0}');
  s.games=(s.games||0)+1;s.correct=(s.correct||0)+correct;s.answers=(s.answers||0)+answers;s.best=Math.max(s.best||0,score);
  localStorage.setItem('mobiliza.results',JSON.stringify(s));
}

export function openOlhoVivo(dialog,host,onFinish){
  css();dialog.classList.add('olho-vivo-dialog');
  let level='medio',sceneIndex=0,unlocked=0,sceneFound=new Set(),completed=new Set(),score=0,errors=0,totalFound=0,left=LEVELS[level].time,timer=null,finished=false,sound=localStorage.getItem('mobiliza.olhovivo.sound')!=='0',ctx=null;

  const audio=()=>{if(!sound)return null;try{const C=window.AudioContext||window.webkitAudioContext;if(!ctx)ctx=new C();if(ctx.state==='suspended')ctx.resume();return ctx}catch{return null}};
  const tone=(f,d=.06,t=0,type='sine',g=.03)=>{const c=audio();if(!c)return;const o=c.createOscillator(),v=c.createGain(),st=c.currentTime+t;o.type=type;o.frequency.setValueAtTime(f,st);v.gain.setValueAtTime(.0001,st);v.gain.exponentialRampToValueAtTime(g,st+.01);v.gain.exponentialRampToValueAtTime(.0001,st+d);o.connect(v);v.connect(c.destination);o.start(st);o.stop(st+d+.03)};
  const snd={ok:()=>{tone(523,.06);tone(659,.06,.06);tone(784,.12,.12)},bad:()=>{tone(250,.08,0,'sawtooth',.022);tone(170,.1,.08,'sawtooth',.022)},phase:()=>{tone(523,.07);tone(659,.07,.07);tone(784,.12,.14)},finish:()=>{tone(523,.07);tone(659,.07,.07);tone(784,.07,.14);tone(1046,.2,.21)},click:()=>tone(500,.035,0,'square',.015)};
  const cfg=()=>LEVELS[level],scene=()=>SCENES[sceneIndex],best=()=>JSON.parse(localStorage.getItem('mobiliza.olhovivo.best.'+level)||'null');

  function stop(){if(timer){clearInterval(timer);timer=null}}
  function start(){stop();timer=setInterval(()=>{if(finished)return;left--;hud();if(left<=0)phaseTimeout()},1000)}
  function hud(){
    const s=scene(),a=host.querySelector('#ov37Found'),b=host.querySelector('#ov37Score'),c=host.querySelector('#ov37Time'),d=host.querySelector('#ov37Err'),m=host.querySelector('#ov37Meter');
    if(a)a.textContent=sceneFound.size+'/'+s.risks.length;if(b)b.textContent=score;if(c)c.textContent=Math.max(0,left)+'s';if(d)d.textContent=errors;if(m)m.style.width=(sceneFound.size/s.risks.length*100)+'%';
  }
  function phaseButtons(){
    return SCENES.map((s,i)=>`<button class="phase ${i===sceneIndex?'current':''} ${completed.has(i)?'done':''} ${i>unlocked?'locked':''}" data-phase="${i}"><span class="pic" style="background-size:${s.bgSize};background-position:${s.bgPos}"></span><span><b>${completed.has(i)?'✓ ':''}${i+1}. ${s.title}</b><small>${i>unlocked?'Bloqueada':i===sceneIndex?'Em jogo':'Disponível'}</small></span></button>`).join('');
  }
  function render(){
    const c=cfg(),s=scene();left=c.time;sceneFound=new Set();finished=false;
    host.innerHTML=`<section class="game ov37">
      <div class="hero"><div class="heroCover"></div><div><p class="eyebrow">OLHO VIVO NO TRÂNSITO • FASE ${sceneIndex+1} DE ${SCENES.length}</p><h2>Encontre os riscos</h2><small>Observe a cena e toque nas situações que exigem atenção ou representam perigo.</small></div></div>
      <div class="top"><div class="stats"><div class="stat"><span>🎯 Riscos</span><b id="ov37Found">0/${s.risks.length}</b></div><div class="stat"><span>⭐ Pontos</span><b id="ov37Score">${score}</b></div><div class="stat"><span>⏱ Tempo</span><b id="ov37Time">${left}s</b></div><div class="stat"><span>❌ Erros</span><b id="ov37Err">${errors}</b></div><div class="stat"><span>📊 Nível</span><b>${c.label}</b></div></div><div class="tools"><button class="tool" id="ov37Sound">${sound?'🔊':'🔇'} Som</button><button class="tool" id="ov37Hint">💡 Dica</button><button class="tool" id="ov37Help">❔ Ajuda</button><button class="tool" id="ov37Restart">↻ Reiniciar</button></div></div>
      <div class="main">
        <div class="sceneWrap"><div id="ov37Scene" class="scene ${s.tone} ${c.showZones?'show-zones':''} ${level==='medio'?'medium-zones':''} ${c.zoneLabel?'label-zones':''}" style="background-size:${s.bgSize};background-position:${s.bgPos}"><div class="sceneLabel">${s.emoji} ${s.title}</div><div class="phaseBadge">Fase ${sceneIndex+1}/${SCENES.length}</div>${s.risks.map((r,i)=>`<button class="zone" data-risk="${i}" style="left:${r.x}%;top:${r.y}%;width:${r.w}%;height:${r.h}%"><span class="suspect">?</span></button>`).join('')}</div></div>
        <aside class="side"><div class="sideCard"><h3>${s.title}</h3><p>${s.subtitle}</p><div class="meter"><i id="ov37Meter"></i></div></div><div class="levels">${Object.entries(LEVELS).map(([k,v])=>`<button class="level ${k===level?'active':''}" data-level="${k}">${v.label}</button>`).join('')}</div><div class="riskList">${s.risks.map((r,i)=>`<div class="risk" data-item="${i}"><i>${i+1}</i><span><strong>Risco ${i+1}</strong><small>Ainda não identificado</small></span></div>`).join('')}</div><div class="tip">💡 <b>Dica da cena:</b> ${s.tip}</div></aside>
      </div>
      <div class="phases" id="ov37Phases">${phaseButtons()}</div>
      <div class="foot"><div class="status" id="ov37Status">👀 Observe toda a cena antes de tocar.</div><div class="best"><span>🏆 Melhor ${c.label}</span><strong>${best()?best().score+' pts':'Sem recorde'}</strong></div></div><div id="ov37Overlay"></div>
    </section>`;
    bind();hud();start();
  }
  function bind(){
    host.querySelectorAll('[data-risk]').forEach(b=>b.onclick=e=>{e.stopPropagation();hit(+b.dataset.risk)});
    host.querySelector('#ov37Scene').onclick=miss;
    host.querySelectorAll('[data-level]').forEach(b=>b.onclick=()=>{level=b.dataset.level;score=0;errors=0;totalFound=0;sceneIndex=0;unlocked=0;completed=new Set();stop();render()});
    host.querySelectorAll('[data-phase]').forEach(b=>b.onclick=()=>{const i=+b.dataset.phase;if(i<=unlocked){sceneIndex=i;stop();render()}});
    host.querySelector('#ov37Sound').onclick=()=>{sound=!sound;localStorage.setItem('mobiliza.olhovivo.sound',sound?'1':'0');if(sound)snd.click();host.querySelector('#ov37Sound').textContent=(sound?'🔊':'🔇')+' Som'};
    host.querySelector('#ov37Hint').onclick=hint;host.querySelector('#ov37Help').onclick=help;host.querySelector('#ov37Restart').onclick=()=>{score=0;errors=0;totalFound=0;sceneIndex=0;unlocked=0;completed=new Set();stop();render()};
  }
  function hit(i){
    if(finished||sceneFound.has(i))return;const r=scene().risks[i];sceneFound.add(i);totalFound++;score+=500+Math.max(0,left*2)-errors*15;snd.ok();
    const z=host.querySelector('[data-risk="'+i+'"]');if(z)z.classList.add('found');const it=host.querySelector('[data-item="'+i+'"]');if(it){it.classList.add('found');it.querySelector('i').textContent='✓';it.querySelector('strong').textContent=r.title;it.querySelector('small').textContent='Identificado'}
    hud();showRisk(r);
  }
  function miss(e){
    if(finished||e.target.closest('.zone'))return;errors++;score=Math.max(0,score-cfg().wrong);snd.bad();const rect=e.currentTarget.getBoundingClientRect(),x=(e.clientX-rect.left)/rect.width*100,y=(e.clientY-rect.top)/rect.height*100;const m=document.createElement('div');m.className='miss';m.style.left=x+'%';m.style.top=y+'%';m.textContent='×';e.currentTarget.appendChild(m);setTimeout(()=>m.remove(),650);const st=host.querySelector('#ov37Status');if(st)st.textContent='❌ Nada aqui. Procure outra situação.';hud();
  }
  function showRisk(r){
    stop();const o=host.querySelector('#ov37Overlay');o.className='overlay';o.innerHTML=`<div class="card"><div class="ico">${r.icon}</div><p class="eyebrow">RISCO IDENTIFICADO • ${sceneFound.size}/${scene().risks.length}</p><h3>${r.title}</h3><p>${r.text}</p><div class="actions"><button class="btn primary" id="ov37Continue">${sceneFound.size===scene().risks.length?'Concluir fase':'Continuar procurando'}</button></div></div>`;o.querySelector('#ov37Continue').onclick=()=>{o.className='';o.innerHTML='';if(sceneFound.size===scene().risks.length)finishPhase();else start()};
  }
  function finishPhase(){
    completed.add(sceneIndex);unlocked=Math.max(unlocked,Math.min(SCENES.length-1,sceneIndex+1));snd.phase();if(sceneIndex===SCENES.length-1){finishGame();return}const current=scene();const next=SCENES[sceneIndex+1];const o=host.querySelector('#ov37Overlay');o.className='overlay';o.innerHTML=`<div class="card"><div class="ico">🏆</div><p class="eyebrow">FASE ${sceneIndex+1} CONCLUÍDA</p><h3>${current.title} concluída!</h3><p>Você encontrou todos os riscos desta situação. A próxima cena aborda <b>${next.title.toLowerCase()}</b>.</p><div class="actions"><button class="btn primary" id="ov37Next">Próxima cena →</button></div></div>`;o.querySelector('#ov37Next').onclick=()=>{sceneIndex++;o.className='';o.innerHTML='';render()};
  }
  function hint(){
    if(finished)return;const remaining=scene().risks.map((_,i)=>i).filter(i=>!sceneFound.has(i));if(!remaining.length)return;const i=remaining[0],r=scene().risks[i];score=Math.max(0,score-cfg().hintCost);hud();snd.click();const z=host.querySelector('[data-risk="'+i+'"]');if(z){z.classList.add('hint');setTimeout(()=>z.classList.remove('hint'),1800)}const st=host.querySelector('#ov37Status');if(st)st.textContent='💡 '+r.hint;
  }
  function help(){
    stop();const o=host.querySelector('#ov37Overlay');o.className='overlay';o.innerHTML=`<div class="card"><div class="ico">👀</div><p class="eyebrow">COMO JOGAR</p><h3>Observe, identifique e aprenda</h3><p>Toque nas situações de risco da cena. No Fácil as regiões suspeitas ficam mais evidentes; no Médio aparecem apenas áreas discretas; no Difícil os pontos ficam totalmente ocultos. Cada acerto abre uma explicação educativa. Complete as cinco fases.</p><div class="actions"><button class="btn primary" id="ov37Ok">Entendi</button></div></div>`;o.querySelector('#ov37Ok').onclick=()=>{o.className='';o.innerHTML='';start()};
  }
  function phaseTimeout(){
    stop();const o=host.querySelector('#ov37Overlay');o.className='overlay';o.innerHTML=`<div class="card"><div class="ico">⏱️</div><p class="eyebrow">TEMPO ENCERRADO</p><h3>O tempo desta fase acabou.</h3><p>Você encontrou ${sceneFound.size} de ${scene().risks.length} riscos. Revise a cena e tente novamente.</p><div class="actions"><button class="btn primary" id="ov37Retry">Tentar novamente</button></div></div>`;o.querySelector('#ov37Retry').onclick=()=>{o.className='';o.innerHTML='';render()};
  }
  function finishGame(){
    stop();finished=true;snd.finish();const elapsed=SCENES.length*cfg().time-left,rec={score,found:totalFound,errors,date:new Date().toISOString()};const old=best();if(!old||score>old.score)localStorage.setItem('mobiliza.olhovivo.best.'+level,JSON.stringify(rec));saveGlobal(score,totalFound,totalFound+errors);onFinish?.();
    const learned=SCENES.flatMap(s=>s.risks).slice(0,10);
    host.innerHTML=`<section class="ov37Result"><div class="resultHero"><div class="resultPic"></div><div><p class="eyebrow">OLHO VIVO NO TRÂNSITO • RESULTADO FINAL</p><h2>Missão completa!</h2><small>Você concluiu as cinco situações de percepção de risco.</small></div><div class="medal">🏆</div></div><div class="summary"><div class="sum"><span>🎯 Riscos</span><b>${totalFound}/${SCENES.length*5}</b></div><div class="sum"><span>⭐ Pontos</span><b>${score}</b></div><div class="sum"><span>❌ Erros</span><b>${errors}</b></div><div class="sum"><span>📊 Nível</span><b>${cfg().label}</b></div></div><div class="learn">${learned.map(r=>`<div class="learnItem"><b>${r.icon}</b><div><strong>${r.title}</strong><small>${r.text}</small></div></div>`).join('')}</div><div class="resultActions"><button class="btn primary" id="ov37Again">↻ Jogar novamente</button><button class="btn ghost" id="ov37Close">Encerrar</button></div></section>`;host.querySelector('#ov37Again').onclick=()=>{score=0;errors=0;totalFound=0;sceneIndex=0;unlocked=0;completed=new Set();render()};host.querySelector('#ov37Close').onclick=()=>dialog.close();
  }

  const onClose=()=>{stop();dialog.classList.remove('olho-vivo-dialog');dialog.removeEventListener('close',onClose)};dialog.addEventListener('close',onClose);render();if(!dialog.open)dialog.showModal();
}
