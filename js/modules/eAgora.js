const ASSETS={
  school:'assets/ai/hero_area_escolar.webp?v=39',
  road:'assets/hero-ai.webp?v=39',
  life:'assets/mobiliza_educa_caminhos_para_a_vida.webp?v=39'
};

const EPISODES=[
  {
    id:'onibus',number:1,title:'O que existe atrás do ônibus?',kicker:'SAÍDA DA ESCOLA',
    image:ASSETS.school,pos:'50% 52%',zoom:'112%',
    observe:'Você se aproxima de uma área escolar. Um ônibus está parado e reduz parte da visão da calçada e da travessia.',
    freeze:'O ônibus cria uma área encoberta junto à faixa. Alguém pode surgir dali a qualquer instante.',
    question:'E agora, qual atitude preserva a maior margem de segurança?',
    choices:[
      {id:'A',text:'Ultrapassar logo para sair da região do ônibus.',safe:false},
      {id:'B',text:'Reduzir, manter distância e só avançar quando houver campo visual suficiente.',safe:true},
      {id:'C',text:'Buzinar e manter a velocidade para alertar quem estiver atrás do ônibus.',safe:false}
    ],
    reveal:'Uma criança pode surgir da área encoberta sem que você consiga percebê-la com antecedência.',
    safeText:'Você criou tempo e espaço para enxergar antes de decidir. Em áreas com visão bloqueada, reduzir e ampliar a observação é essencial.',
    dangerText:'Avançar sem visibilidade reduz drasticamente o tempo disponível para reagir a um pedestre que apareça de forma inesperada.',
    tool:'VISÃO 360',toolIcon:'◎',toolText:'A cena destaca a região que o ônibus impede você de enxergar com clareza.',
    clue:'O principal risco não é apenas o que está visível — é o que o veículo grande pode esconder.',
    replayLabel:'Rever o ponto cego',
    overlay:'blindspot'
  },
  {
    id:'bola',number:2,title:'A bola entrou na rua',kicker:'RUA RESIDENCIAL',
    image:ASSETS.school,pos:'37% 56%',zoom:'128%',
    observe:'Você circula devagar por uma rua residencial. Uma bola aparece de repente na pista, vindo da calçada.',
    freeze:'A bola já está na rua. Ainda não há nenhuma criança visível.',
    question:'Qual é a melhor leitura dessa situação?',
    choices:[
      {id:'A',text:'Reduzir imediatamente e ficar preparado para parar, pois uma criança pode vir atrás da bola.',safe:true},
      {id:'B',text:'Desviar da bola e seguir, porque não há pessoa na pista.',safe:false},
      {id:'C',text:'Acelerar para passar antes que alguém chegue à rua.',safe:false}
    ],
    reveal:'Uma bola na pista pode ser o primeiro sinal de que uma criança está prestes a correr atrás dela.',
    safeText:'Você antecipou o que poderia acontecer, em vez de reagir apenas ao que já estava visível. Isso é percepção de risco.',
    dangerText:'Olhar somente para a bola ignora o perigo mais importante: uma criança pode surgir logo depois, com trajetória imprevisível.',
    tool:'ANTECIPAÇÃO',toolIcon:'⚽',toolText:'O destaque mostra a trajetória provável da bola e a zona de onde uma criança pode aparecer.',
    clue:'No trânsito, pequenos sinais podem revelar um risco antes que ele entre totalmente no seu campo de visão.',
    replayLabel:'Rever a sequência',
    overlay:'ball'
  },
  {
    id:'faixa',number:3,title:'Faixa à frente',kicker:'ÁREA ESCOLAR',
    image:ASSETS.school,pos:'62% 50%',zoom:'121%',
    observe:'Você se aproxima de uma faixa de pedestres próxima a uma escola. Há pessoas junto à calçada.',
    freeze:'Um pedestre se aproxima da faixa enquanto você ainda está em movimento.',
    question:'Como você deve conduzir a aproximação?',
    choices:[
      {id:'A',text:'Manter a velocidade e decidir somente quando o pedestre entrar na pista.',safe:false},
      {id:'B',text:'Usar a buzina para avisar que o veículo está chegando.',safe:false},
      {id:'C',text:'Reduzir, observar a intenção de travessia e estar preparado para parar antes da faixa.',safe:true}
    ],
    reveal:'A aproximação em velocidade compatível aumenta o tempo para perceber a intenção do pedestre e evita uma frenagem tardia.',
    safeText:'Você tratou a faixa como uma zona de atenção antecipada, não apenas como um ponto de reação quando alguém já está atravessando.',
    dangerText:'Esperar o pedestre entrar na pista para só então reagir diminui a margem de segurança e pode produzir uma frenagem brusca.',
    tool:'FOCO NA FAIXA',toolIcon:'🚶',toolText:'A faixa e sua área de aproximação são destacadas para mostrar onde a decisão começa.',
    clue:'Uma travessia segura começa antes da faixa: velocidade, observação e previsibilidade importam.',
    replayLabel:'Rever a aproximação',
    overlay:'crosswalk'
  },
  {
    id:'ponto-cego',number:4,title:'Tem alguém no seu ponto cego',kicker:'MUDANÇA DE FAIXA',
    image:ASSETS.road,pos:'58% 52%',zoom:'126%',
    observe:'Você está em uma avenida e pretende mudar de faixa. O retrovisor parece livre por um instante.',
    freeze:'Você já sinalizou a manobra. Uma motocicleta se aproxima pela lateral.',
    question:'Antes de iniciar a mudança de faixa, o que você faz?',
    choices:[
      {id:'A',text:'Mudo logo de faixa porque a seta já foi acionada.',safe:false},
      {id:'B',text:'Confiro espelhos, ponto cego e só mudo quando houver espaço seguro.',safe:true},
      {id:'C',text:'Acelero para entrar à frente de quem estiver vindo.',safe:false}
    ],
    reveal:'A motocicleta pode permanecer fora do campo direto do retrovisor por alguns instantes.',
    safeText:'Você confirmou o espaço antes de ocupar a faixa. A seta comunica intenção, mas não substitui a verificação do ambiente.',
    dangerText:'Uma mudança de faixa sem checagem completa pode fechar a trajetória de uma motocicleta que permaneceu fora do seu campo visual.',
    tool:'RETROVISOR',toolIcon:'◫',toolText:'Uma segunda visão destaca a região lateral normalmente menos visível.',
    clue:'Sinalizar é comunicar sua intenção. Verificar se a manobra pode ser feita com segurança é uma etapa diferente.',
    replayLabel:'Rever em câmera lenta',
    overlay:'mirror'
  },
  {
    id:'amarelo',number:5,title:'O amarelo apareceu',kicker:'CRUZAMENTO SEMAFORIZADO',
    image:ASSETS.life,pos:'51% 48%',zoom:'118%',
    observe:'Você se aproxima de um cruzamento semaforizado. O fluxo está normal e há usuários nas proximidades.',
    freeze:'O semáforo muda para amarelo enquanto você se aproxima da linha de retenção.',
    question:'Qual atitude preserva a maior margem de segurança?',
    choices:[
      {id:'A',text:'Reduzir e parar com segurança quando isso for possível, sem criar uma manobra brusca.',safe:true},
      {id:'B',text:'Acelerar para garantir a passagem antes do vermelho.',safe:false},
      {id:'C',text:'Manter a velocidade sem reavaliar distância e condições de parada.',safe:false}
    ],
    reveal:'A decisão precisa considerar distância, velocidade, aderência e a possibilidade real de parar de forma segura.',
    safeText:'Você reavaliou a aproximação e manteve margem para uma parada previsível, sem transformar o amarelo em incentivo para acelerar.',
    dangerText:'Acelerar para “ganhar o sinal” reduz a margem de reação e pode aumentar o conflito com quem inicia a travessia ou entra no cruzamento.',
    tool:'CÂMERA LENTA',toolIcon:'◉',toolText:'O movimento desacelera e permite observar a distância até a linha de retenção.',
    clue:'A decisão correta depende de preservar segurança e previsibilidade, não de tentar vencer o tempo do semáforo.',
    replayLabel:'Rever a aproximação',
    overlay:'signal'
  }
];

function ensureCss(){
 if(document.getElementById('eagora-v40-css'))return;
 const s=document.createElement('style');s.id='eagora-v40-css';
 s.textContent=`
 #gameDialog.eagora-dialog{width:min(1500px,98vw)!important;max-width:98vw!important;max-height:96vh!important;overflow:hidden!important}
 #gameDialog.eagora-dialog>.dialog-shell{height:96vh!important;max-height:96vh!important;overflow:hidden!important;border-radius:22px!important;background:#07131d!important}
 #gameDialog.eagora-dialog #gameHost{height:100%!important;overflow:hidden!important}
 #gameDialog.eagora-dialog .dialog-close{position:absolute!important;top:10px!important;right:10px!important;z-index:1200!important;background:#fff!important}
 .ea{height:100%;position:relative;overflow:hidden;background:#07131d;color:#fff;font-family:inherit}
 .ea *{box-sizing:border-box}.ea button{font:inherit}
 .ea .stage{position:absolute;inset:0;overflow:hidden;background:#07131d}
 .ea .sceneBg{position:absolute;inset:-3%;background-repeat:no-repeat;background-position:var(--pos);background-size:var(--zoom);filter:saturate(1.04) contrast(1.04) brightness(.92);transform:scale(1.01);animation:eaDrive 12s ease-in-out infinite alternate;will-change:transform,background-position}
 .ea .sceneBg:after{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(3,10,16,.18),rgba(3,10,16,.03) 42%,rgba(3,10,16,.45));pointer-events:none}
 @keyframes eaDrive{0%{transform:scale(1.02) translate3d(-.4%,.2%,0)}100%{transform:scale(1.085) translate3d(.8%,-.6%,0)}}
 .ea.observing .sceneBg{animation-duration:6s}.ea.freeze .sceneBg{animation-play-state:paused;filter:saturate(.92) contrast(1.08) brightness(.72)}
 .ea.safeOutcome .sceneBg{animation:eaSafeMove 4s ease-out forwards;filter:saturate(1.02) contrast(1.03) brightness(.86)}
 @keyframes eaSafeMove{0%{transform:scale(1.07)}100%{transform:scale(1.02)}}
 .ea.dangerOutcome .sceneBg{animation:eaDanger .42s linear 2;filter:saturate(.8) contrast(1.16) brightness(.68)}
 @keyframes eaDanger{0%,100%{transform:scale(1.08) translateX(0)}25%{transform:scale(1.09) translateX(-6px)}75%{transform:scale(1.09) translateX(6px)}}
 .ea .vignette{position:absolute;inset:0;pointer-events:none;z-index:3;background:radial-gradient(circle at center,transparent 50%,rgba(0,0,0,.54) 100%)}
 .ea .topHud{position:absolute;left:14px;right:66px;top:12px;z-index:20;display:grid;grid-template-columns:minmax(250px,1fr) auto;gap:10px;align-items:start}
 .ea .titlebox{display:flex;align-items:center;gap:10px;padding:8px 12px;border:1px solid rgba(255,255,255,.18);border-radius:14px;background:rgba(3,22,34,.72);backdrop-filter:blur(8px);box-shadow:0 10px 28px rgba(0,0,0,.22)}
 .ea .badge{display:grid;place-items:center;min-width:44px;height:44px;border-radius:12px;background:linear-gradient(145deg,#0f80b4,#0c496f);font-weight:1000;font-size:1rem;border:1px solid rgba(255,255,255,.24)}
 .ea .titlebox p{margin:0;color:#8fdcff;font-size:.42rem;font-weight:1000;letter-spacing:.12em}.ea .titlebox h2{margin:2px 0 0;color:#fff;font-size:1.03rem;line-height:1}
 .ea .hudstats{display:flex;gap:6px}.ea .pill{min-width:94px;padding:7px 9px;border-radius:12px;border:1px solid rgba(255,255,255,.18);background:rgba(3,22,34,.72);backdrop-filter:blur(8px);text-align:center}.ea .pill span{display:block;font-size:.36rem;color:#b9d4e2;font-weight:800}.ea .pill b{display:block;font-size:.75rem;color:#fff}
 .ea .timeline{position:absolute;left:14px;right:14px;top:72px;z-index:16;height:4px;border-radius:9px;background:rgba(255,255,255,.18);overflow:hidden}.ea .timeline i{display:block;height:100%;width:0;background:linear-gradient(90deg,#20c8ff,#7ce1ff);transition:width .2s linear}
 .ea .caption{position:absolute;left:50%;bottom:22px;z-index:18;transform:translateX(-50%);width:min(900px,86%);padding:10px 15px;border-radius:14px;background:rgba(3,18,30,.72);backdrop-filter:blur(8px);border:1px solid rgba(255,255,255,.16);text-align:center;font-size:.66rem;line-height:1.35;color:#f3fbff;box-shadow:0 10px 30px rgba(0,0,0,.28)}
 .ea .caption strong{color:#72dcff}
 .ea .speedLines{position:absolute;inset:0;z-index:2;pointer-events:none;opacity:.12;background:repeating-linear-gradient(100deg,transparent 0 24px,rgba(255,255,255,.13) 25px 26px,transparent 27px 52px);transform:skewX(-9deg);animation:eaLines .5s linear infinite}
 @keyframes eaLines{to{background-position:100px 0}}
 .ea.freeze .speedLines{animation-play-state:paused;opacity:.02}
 .ea .freezeFlash{position:absolute;inset:0;z-index:5;pointer-events:none;opacity:0;background:rgba(255,255,255,.35)}.ea.freeze .freezeFlash{animation:eaFlash .45s ease}@keyframes eaFlash{0%{opacity:.75}100%{opacity:0}}
 .ea .decision{position:absolute;z-index:30;left:50%;bottom:18px;transform:translateX(-50%);width:min(1080px,92%);padding:14px;border-radius:20px;border:1px solid rgba(255,255,255,.22);background:linear-gradient(180deg,rgba(5,28,46,.96),rgba(2,16,29,.96));box-shadow:0 25px 70px rgba(0,0,0,.45);backdrop-filter:blur(10px)}
 .ea .decisionHead{display:grid;grid-template-columns:auto 1fr auto;gap:10px;align-items:center;margin-bottom:10px}.ea .freezeTag{padding:5px 8px;border-radius:999px;background:#ffbe2d;color:#102f46;font-size:.39rem;font-weight:1000}.ea .decisionHead h3{margin:0;font-size:.87rem;color:#fff}.ea .decisionTimer{width:44px;height:44px;border-radius:50%;display:grid;place-items:center;background:#fff;color:#0c3551;border:5px solid #ffbe2d;font-size:.78rem;font-weight:1000}
 .ea .question{margin:0 0 9px;font-size:.64rem;color:#cbe9f7}.ea .choices{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}.ea .choice{min-height:60px;display:grid;grid-template-columns:32px 1fr;gap:7px;align-items:center;padding:8px;border:1px solid rgba(255,255,255,.18);border-radius:12px;background:rgba(255,255,255,.07);color:#fff;text-align:left;cursor:pointer;transition:.18s}.ea .choice:hover{background:rgba(30,181,235,.18);border-color:#62d9ff;transform:translateY(-1px)}.ea .choice b{display:grid;place-items:center;width:30px;height:30px;border-radius:50%;background:#0b76ad;border:2px solid #8fe8ff}.ea .choice span{font-size:.49rem;line-height:1.3;font-weight:800}
 .ea .toolrow{display:flex;justify-content:center;margin-top:9px}.ea .power{min-height:33px;padding:5px 12px;border-radius:999px;border:1px solid #72dcff;background:#063f60;color:#eafaff;font-size:.43rem;font-weight:1000;cursor:pointer}.ea .power.used{opacity:.45;pointer-events:none}
 .ea .toolReveal{position:absolute;z-index:24;left:50%;top:50%;transform:translate(-50%,-50%);width:min(500px,82%);padding:14px;border-radius:18px;background:rgba(3,23,37,.94);border:1px solid #6ddcff;box-shadow:0 20px 60px rgba(0,0,0,.4);text-align:center}.ea .toolReveal .icon{font-size:2rem;color:#72dcff}.ea .toolReveal h4{margin:4px 0;font-size:.8rem}.ea .toolReveal p{margin:0;color:#c6dce8;font-size:.5rem;line-height:1.4}
 .ea .overlayClue{position:absolute;z-index:11;pointer-events:none;opacity:0;transition:.35s}.ea.showClue .overlayClue{opacity:1}
 .ea .blindspot{left:20%;top:30%;width:38%;height:46%;border-radius:45% 55% 60% 40%;border:3px dashed #ffd144;background:radial-gradient(circle,rgba(255,209,68,.22),rgba(255,209,68,.03) 60%,transparent 70%)}
 .ea .mirror{right:8%;top:24%;width:25%;height:32%;border-radius:46% 46% 50% 50%;border:3px dashed #65dfff;background:radial-gradient(circle,rgba(101,223,255,.20),transparent 68%)}
 .ea .signal{left:38%;top:22%;width:24%;height:34%;border-radius:22px;border:3px dashed #ffd144;background:radial-gradient(circle,rgba(255,209,68,.23),transparent 68%)}
 .ea .ball{left:38%;top:50%;width:36%;height:34%;border-radius:45%;border:3px dashed #ffd144;background:radial-gradient(circle,rgba(255,209,68,.22),rgba(255,209,68,.04) 55%,transparent 72%)}
 .ea .ball:after{content:"⚽";position:absolute;left:58%;top:57%;transform:translate(-50%,-50%);font-size:3rem;filter:drop-shadow(0 5px 8px rgba(0,0,0,.45))}
 .ea .crosswalk{left:31%;top:47%;width:42%;height:28%;border:3px dashed #7ee2ff;border-radius:18px;background:repeating-linear-gradient(100deg,rgba(255,255,255,.28) 0 18px,rgba(20,70,90,.10) 18px 34px)}
 .ea .resultPanel{position:absolute;z-index:32;left:50%;bottom:18px;transform:translateX(-50%);width:min(980px,92%);padding:15px;border-radius:20px;background:linear-gradient(180deg,rgba(4,27,44,.97),rgba(2,15,28,.97));border:1px solid rgba(255,255,255,.2);box-shadow:0 25px 70px rgba(0,0,0,.45)}
 .ea .resultPanel.safe{border-color:#60dfa0}.ea .resultPanel.danger{border-color:#ff7e79}.ea .resultTop{display:grid;grid-template-columns:48px 1fr auto;gap:9px;align-items:center}.ea .resultIcon{width:46px;height:46px;border-radius:50%;display:grid;place-items:center;font-size:1.2rem;background:#123d59}.ea .safe .resultIcon{background:#168653}.ea .danger .resultIcon{background:#b53232}.ea .resultTop h3{margin:0;font-size:.9rem;color:#fff}.ea .resultTop p{margin:3px 0 0;color:#c6dae5;font-size:.49rem}.ea .points{font-size:.8rem;color:#ffd34d;font-weight:1000}.ea .resultText{margin:9px 0 0;padding:9px;border-radius:12px;background:rgba(255,255,255,.06);font-size:.54rem;line-height:1.4;color:#e9f7fd}.ea .resultActions{display:flex;gap:7px;justify-content:flex-end;margin-top:9px}.ea .resultActions button{min-height:36px;padding:6px 11px;border-radius:9px;border:1px solid rgba(255,255,255,.18);font-weight:1000;font-size:.43rem;cursor:pointer}.ea .ghost{background:rgba(255,255,255,.07);color:#fff}.ea .primary{background:#0c78ae;color:#fff;border-color:#52d8ff!important}
 .ea .lesson{position:absolute;z-index:35;inset:0;display:grid;place-items:center;padding:20px;background:rgba(1,12,20,.82);backdrop-filter:blur(5px)}.ea .lessonCard{width:min(720px,92%);padding:18px;border-radius:20px;background:linear-gradient(180deg,#f8fcff,#eaf5fa);color:#173f60;box-shadow:0 30px 90px rgba(0,0,0,.45)}.ea .lessonCard .big{font-size:2rem}.ea .lessonCard h3{margin:5px 0;font-size:1rem}.ea .lessonCard p{font-size:.6rem;line-height:1.45;color:#5f7787}.ea .lessonCard .btn{float:right}
 .ea .episodeIntro{position:absolute;z-index:35;inset:0;display:grid;place-items:center;background:linear-gradient(90deg,rgba(2,16,27,.86),rgba(2,16,27,.48),rgba(2,16,27,.78));padding:20px}.ea .introCard{width:min(760px,90%);padding:20px;border-left:5px solid #57d9ff;background:rgba(3,24,39,.82);backdrop-filter:blur(8px);box-shadow:0 24px 80px rgba(0,0,0,.38)}.ea .introCard .k{font-size:.43rem;letter-spacing:.13em;font-weight:1000;color:#7bdfff}.ea .introCard h2{margin:5px 0;color:#fff;font-size:1.35rem}.ea .introCard p{margin:0;color:#c8dce8;font-size:.6rem;line-height:1.45}.ea .introCard .start{margin-top:12px}
 .eaSummary{height:100%;overflow:auto;padding:18px;background:linear-gradient(180deg,#07131d,#0b2130);color:#fff}.eaSummary .head{display:grid;grid-template-columns:150px 1fr 80px;gap:14px;align-items:center;padding:14px;border-radius:20px;background:linear-gradient(135deg,#063d69,#056799,#0aa1bb)}.eaSummary .cover{height:86px;border-radius:12px;background:url('${ASSETS.school}') center/cover}.eaSummary .head p{margin:0;font-size:.43rem;color:#c8ecfb;font-weight:1000}.eaSummary .head h2{margin:4px 0;font-size:1.4rem}.eaSummary .grade{width:72px;height:72px;border-radius:50%;display:grid;place-items:center;background:#ffd044;color:#15364c;font-weight:1000;font-size:1.4rem}.eaSummary .metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:10px}.eaSummary .metric{padding:10px;border:1px solid rgba(255,255,255,.13);border-radius:12px;background:rgba(255,255,255,.06)}.eaSummary .metric span{display:block;font-size:.43rem;color:#a9c6d4}.eaSummary .metric b{font-size:.9rem}.eaSummary .episodes{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:9px;margin-top:10px}.eaSummary .ep{padding:10px;border:1px solid rgba(255,255,255,.13);border-radius:13px;background:rgba(255,255,255,.06)}.eaSummary .ep strong{display:block;font-size:.6rem}.eaSummary .ep small{display:block;margin-top:4px;color:#adc8d6;font-size:.43rem;line-height:1.35}.eaSummary .footer{display:flex;justify-content:center;gap:9px;margin-top:12px}
 @media(max-width:760px){
   #gameDialog.eagora-dialog{width:100vw!important;max-width:100vw!important;height:100dvh!important;max-height:100dvh!important;margin:0!important;padding:0!important;inset:0!important;border:0!important;border-radius:0!important}
   #gameDialog.eagora-dialog>.dialog-shell{height:100dvh!important;max-height:100dvh!important;border-radius:0!important}
   .ea .topHud{left:7px;right:54px;top:7px;display:block}.ea .titlebox{padding:6px 8px}.ea .badge{min-width:36px;height:36px}.ea .titlebox p{font-size:.31rem}.ea .titlebox h2{font-size:.72rem}.ea .hudstats{position:absolute;left:0;top:47px}.ea .pill{min-width:74px;padding:4px 6px}.ea .pill span{font-size:.28rem}.ea .pill b{font-size:.56rem}.ea .timeline{top:94px;left:7px;right:7px}
   .ea .sceneBg{inset:-8%;background-size:cover!important;background-position:center!important}.ea .caption{bottom:10px;width:94%;font-size:.48rem;padding:8px 10px}
   .ea .decision{bottom:8px;width:96%;padding:10px}.ea .decisionHead{grid-template-columns:auto 1fr auto;gap:6px}.ea .freezeTag{font-size:.31rem}.ea .decisionHead h3{font-size:.66rem}.ea .decisionTimer{width:38px;height:38px;font-size:.64rem}.ea .question{font-size:.49rem}.ea .choices{grid-template-columns:1fr;gap:5px}.ea .choice{min-height:44px;padding:5px;grid-template-columns:28px 1fr}.ea .choice b{width:26px;height:26px}.ea .choice span{font-size:.41rem}
   .ea .toolrow{margin-top:6px}.ea .power{font-size:.36rem}.ea .resultPanel{bottom:8px;width:96%;padding:10px}.ea .resultTop{grid-template-columns:40px 1fr auto}.ea .resultIcon{width:38px;height:38px}.ea .resultTop h3{font-size:.66rem}.ea .resultTop p{font-size:.39rem}.ea .resultText{font-size:.42rem;padding:6px}.ea .resultActions{display:grid;grid-template-columns:repeat(3,1fr)}.ea .resultActions button{padding:4px;font-size:.33rem;min-height:34px}
   .ea .introCard{width:94%;padding:14px}.ea .introCard h2{font-size:1rem}.ea .introCard p{font-size:.48rem}.ea .toolReveal{width:90%}.eaSummary{padding:9px}.eaSummary .head{grid-template-columns:90px 1fr 52px;padding:9px}.eaSummary .cover{height:60px}.eaSummary .head h2{font-size:.95rem}.eaSummary .grade{width:48px;height:48px;font-size:.9rem}.eaSummary .metrics{grid-template-columns:repeat(2,1fr)}.eaSummary .episodes{grid-template-columns:1fr}.eaSummary .footer{display:grid;grid-template-columns:1fr 1fr}
 }
 `;document.head.appendChild(s);
}

function globalResult(score,correct,answers,streak){
 const s=JSON.parse(localStorage.getItem('mobiliza.results')||'{"games":0,"correct":0,"answers":0,"best":0,"streak":0}');
 s.games=(s.games||0)+1;s.correct=(s.correct||0)+correct;s.answers=(s.answers||0)+answers;s.best=Math.max(s.best||0,score);s.streak=Math.max(s.streak||0,streak);
 localStorage.setItem('mobiliza.results',JSON.stringify(s));
}

export function openEAgora(dialog,host,onFinish){
 ensureCss();dialog.classList.add('eagora-dialog');
 let ep=0,score=0,safety=100,correct=0,streak=0,bestStreak=0,answers=[],phaseTimer=null,decisionTimer=null,decisionLeft=12,toolUsed=false,sound=localStorage.getItem('mobiliza.eagora.sound')!=='0',ctx=null,replaying=false;
 const Ctx=()=>{if(!sound)return null;try{const C=window.AudioContext||window.webkitAudioContext;if(!ctx)ctx=new C();if(ctx.state==='suspended')ctx.resume();return ctx}catch{return null}};
 const tone=(f,d=.08,t=0,type='sine',g=.025)=>{const c=Ctx();if(!c)return;const o=c.createOscillator(),v=c.createGain(),st=c.currentTime+t;o.type=type;o.frequency.setValueAtTime(f,st);v.gain.setValueAtTime(.0001,st);v.gain.exponentialRampToValueAtTime(g,st+.01);v.gain.exponentialRampToValueAtTime(.0001,st+d);o.connect(v);v.connect(c.destination);o.start(st);o.stop(st+d+.03)};
 const snd={start:()=>{tone(220,.08);tone(330,.09,.08);tone(440,.12,.17)},freeze:()=>{tone(780,.04,0,'square',.018);tone(520,.08,.05,'square',.015)},safe:()=>{tone(523,.07);tone(659,.07,.07);tone(784,.14,.14)},danger:()=>{tone(190,.1,0,'sawtooth',.025);tone(140,.18,.1,'sawtooth',.022)},tool:()=>{tone(440,.05);tone(660,.08,.07)},finish:()=>{tone(523,.07);tone(659,.07,.07);tone(784,.07,.14);tone(1046,.2,.21)}};
 const e=()=>EPISODES[ep];
 const stop=()=>{if(phaseTimer){clearInterval(phaseTimer);phaseTimer=null}if(decisionTimer){clearInterval(decisionTimer);decisionTimer=null}};
 function hud(){
  const q=s=>host.querySelector(s);if(q('#eaScore'))q('#eaScore').textContent=score;if(q('#eaSafety'))q('#eaSafety').textContent=safety+'%';if(q('#eaEpisode'))q('#eaEpisode').textContent=(ep+1)+'/'+EPISODES.length;
 }
 function frame(inner='',klass=''){
   const x=e();
   return `<section class="ea ${klass}" id="eaRoot"><div class="stage"><div class="sceneBg" style="background-image:url('${x.image}');--pos:${x.pos};--zoom:${x.zoom}"></div><div class="speedLines"></div><div class="vignette"></div><div class="freezeFlash"></div><div class="overlayClue ${x.overlay}"></div></div>
   <div class="topHud"><div class="titlebox"><div class="badge">${String(x.number).padStart(2,'0')}</div><div><p>${x.kicker}</p><h2>${x.title}</h2></div></div><div class="hudstats"><div class="pill"><span>EPISÓDIO</span><b id="eaEpisode">${ep+1}/${EPISODES.length}</b></div><div class="pill"><span>SEGURANÇA</span><b id="eaSafety">${safety}%</b></div><div class="pill"><span>PONTOS</span><b id="eaScore">${score}</b></div></div></div><div class="timeline"><i id="eaLine"></i></div>${inner}</section>`;
 }
 function intro(){
  stop();toolUsed=false;const x=e();host.innerHTML=frame(`<div class="episodeIntro"><div class="introCard"><div class="k">EPISÓDIO ${x.number} • ${x.kicker}</div><h2>${x.title}</h2><p>${x.observe}</p><button class="btn primary start" id="eaStart">▶ INICIAR CENA</button></div></div>`,'observing');hud();host.querySelector('#eaStart').onclick=observe;
 }
 function observe(){
  snd.start();const x=e();host.innerHTML=frame(`<div class="caption"><strong>OBSERVE.</strong> ${x.observe}</div>`,'observing');hud();let t=0;const line=host.querySelector('#eaLine');phaseTimer=setInterval(()=>{t+=.1;if(line)line.style.width=Math.min(100,t/4.2*100)+'%';if(t>=4.2){clearInterval(phaseTimer);phaseTimer=null;decision()}},100);
 }
 function decision(){
  snd.freeze();decisionLeft=12;const x=e();host.innerHTML=frame(`<div class="decision"><div class="decisionHead"><span class="freezeTag">⏸ CENA CONGELADA</span><h3>${x.freeze}</h3><div class="decisionTimer" id="eaDecisionTime">${decisionLeft}</div></div><p class="question">${x.question}</p><div class="choices">${x.choices.map(c=>`<button class="choice" data-choice="${c.id}"><b>${c.id}</b><span>${c.text}</span></button>`).join('')}</div><div class="toolrow"><button class="power" id="eaPower">${x.toolIcon} ${x.tool}</button></div></div>`,'freeze');hud();
  host.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>choose(b.dataset.choice));
  host.querySelector('#eaPower').onclick=useTool;
  decisionTimer=setInterval(()=>{decisionLeft--;const el=host.querySelector('#eaDecisionTime');if(el)el.textContent=decisionLeft;if(decisionLeft<=0){clearInterval(decisionTimer);decisionTimer=null;choose(null)}},1000);
 }
 function useTool(){
  if(toolUsed)return;toolUsed=true;snd.tool();const root=host.querySelector('#eaRoot');root?.classList.add('showClue');const btn=host.querySelector('#eaPower');if(btn)btn.classList.add('used');const box=document.createElement('div');box.className='toolReveal';box.innerHTML=`<div class="icon">${e().toolIcon}</div><h4>${e().tool}</h4><p>${e().toolText}</p>`;root.appendChild(box);setTimeout(()=>box.remove(),1800);
 }
 function choose(id){
  if(decisionTimer){clearInterval(decisionTimer);decisionTimer=null}
  const x=e(),choice=x.choices.find(c=>c.id===id),safe=!!choice?.safe,timeBonus=Math.max(0,decisionLeft)*30;
  let pts=0;
  if(safe){
    streak++;
    const streakBonus=Math.max(0,streak-1)*100;
    pts=700+timeBonus+streakBonus;
    score+=pts;correct++;bestStreak=Math.max(bestStreak,streak);snd.safe();
  }else{
    safety=Math.max(0,safety-(id?20:25));streak=0;snd.danger();
  }
  answers.push({ep:ep,safe,id:id||'-',pts,streak});
  outcome(safe,choice,pts);
 }
 function outcome(safe,choice,pts){
  const x=e(),klass=safe?'safeOutcome':'dangerOutcome';host.innerHTML=frame(`<div class="resultPanel ${safe?'safe':'danger'}"><div class="resultTop"><div class="resultIcon">${safe?'✓':'!'}</div><div><h3>${safe?'Boa decisão — você preservou margem de segurança.':'Atenção — essa decisão reduz sua margem de segurança.'}</h3><p>${choice?choice.text:'O tempo terminou antes de uma decisão.'}</p></div><div class="points">${safe?'+'+pts+' pts'+(streak>1?' • sequência x'+streak:''):'0 pts'}</div></div><div class="resultText">${safe?x.safeText:x.dangerText}</div><div class="resultActions"><button class="ghost" id="eaReplay">◉ ${x.replayLabel}</button><button class="ghost" id="eaReveal">◎ O que eu não percebi?</button><button class="primary" id="eaNext">${ep===EPISODES.length-1?'Ver resultado':'Próxima situação →'}</button></div></div>`,klass);hud();
  host.querySelector('#eaReplay').onclick=()=>replay(safe,choice,pts);
  host.querySelector('#eaReveal').onclick=revealLesson;
  host.querySelector('#eaNext').onclick=next;
 }
 function replay(safe,choice,pts){
  if(replaying)return;replaying=true;const root=host.querySelector('#eaRoot');root.classList.add('showClue');const bg=root.querySelector('.sceneBg');if(bg){bg.style.animation='none';bg.style.transition='transform 3.2s linear,filter 3.2s';bg.style.transform='scale(1.14) translate3d(1%,-1%,0)';bg.style.filter='saturate(.72) contrast(1.12) brightness(.70)'}const panel=root.querySelector('.resultPanel');if(panel)panel.style.opacity='.22';setTimeout(()=>{replaying=false;outcome(safe,choice,pts)},3300);
 }
 function revealLesson(){
  const x=e(),root=host.querySelector('#eaRoot');root?.classList.add('showClue');const d=document.createElement('div');d.className='lesson';d.innerHTML=`<div class="lessonCard"><div class="big">👁️</div><h3>O que você talvez não tenha percebido</h3><p><b>${x.reveal}</b></p><p>${x.clue}</p><button class="btn primary" id="eaLessonOk">Voltar à cena</button></div>`;root.appendChild(d);d.querySelector('#eaLessonOk').onclick=()=>d.remove();
 }
 function next(){if(ep>=EPISODES.length-1){summary();return}ep++;intro()}
 function summary(){
  stop();snd.finish();globalResult(score,correct,EPISODES.length,bestStreak);onFinish?.();const grade=Math.max(0,Math.round((correct/EPISODES.length)*70+safety*.3));host.innerHTML=`<section class="eaSummary"><div class="head"><div class="cover"></div><div><p>E AGORA? VOCÊ DECIDE! • 5 SITUAÇÕES</p><h2>Seu perfil de segurança</h2><small>Percepção, antecipação e tomada de decisão em cinco situações de trânsito.</small></div><div class="grade">${grade}</div></div><div class="metrics"><div class="metric"><span>DECISÕES SEGURAS</span><b>${correct}/${EPISODES.length}</b></div><div class="metric"><span>MARGEM FINAL</span><b>${safety}%</b></div><div class="metric"><span>PONTOS</span><b>${score}</b></div><div class="metric"><span>MELHOR SEQUÊNCIA</span><b>${bestStreak}</b></div></div><div class="episodes">${EPISODES.map((x,i)=>{const a=answers[i];return `<div class="ep"><strong>${a?.safe?'✅':'⚠️'} ${x.title}</strong><small>${a?.safe?x.safeText:x.dangerText}</small></div>`}).join('')}</div><div class="footer"><button class="btn primary" id="eaAgain">↻ Jogar novamente</button><button class="btn ghost" id="eaClose">Encerrar</button></div></section>`;host.querySelector('#eaAgain').onclick=()=>{ep=0;score=0;safety=100;correct=0;streak=0;bestStreak=0;answers=[];intro()};host.querySelector('#eaClose').onclick=()=>dialog.close();
 }
 const onClose=()=>{stop();dialog.classList.remove('eagora-dialog');dialog.removeEventListener('close',onClose)};dialog.addEventListener('close',onClose);intro();if(!dialog.open)dialog.showModal();
}
