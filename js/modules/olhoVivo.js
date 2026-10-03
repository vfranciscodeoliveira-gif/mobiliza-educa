const SCENE='assets/games/cidade_mirim_realista_ai_v35.webp?v=36';

const DIFFICULTIES={
  facil:{label:'Fácil',count:5,time:120,wrong:0,hintCost:50},
  medio:{label:'Médio',count:7,time:90,wrong:50,hintCost:100},
  dificil:{label:'Difícil',count:9,time:70,wrong:100,hintCost:150}
};

const RISKS=[
  {x:31,y:63,title:'Veículo sobre a faixa',icon:'🚗',text:'A faixa deve permanecer livre para a travessia. Parar ou avançar sobre ela reduz a visibilidade e o espaço do pedestre.'},
  {x:50,y:44,title:'Pedestre em travessia de risco',icon:'🚶',text:'Antes de atravessar, é preciso buscar local adequado, observar os dois sentidos e confirmar que há condição segura.'},
  {x:49,y:78,title:'Motociclista em zona de conflito',icon:'🏍️',text:'Cruzamentos exigem atenção redobrada. Distância, velocidade compatível e previsibilidade reduzem o risco de colisão.'},
  {x:84,y:57,title:'Ciclista em área de conflito',icon:'🚲',text:'Ciclistas precisam ser percebidos pelos demais usuários. Conversões e cruzamentos exigem atenção especial à bicicleta.'},
  {x:91,y:42,title:'Veículo próximo da esquina',icon:'🚙',text:'Veículos próximos a esquinas podem reduzir a visibilidade entre pedestres, ciclistas e condutores.'},
  {x:20,y:34,title:'Área escolar movimentada',icon:'🏫',text:'Em área escolar, a velocidade deve ser compatível com o ambiente e a atenção precisa ser ampliada devido à circulação de crianças.'},
  {x:63,y:31,title:'Ponto de ônibus e travessia',icon:'🚌',text:'A região de parada de ônibus concentra pedestres e mudanças de trajetória. Observe antes de atravessar ou converter.'},
  {x:38,y:54,title:'Conflito de conversão',icon:'↪️',text:'Ao converter, o condutor deve observar pedestres, ciclistas e outros veículos antes de completar a manobra.'},
  {x:69,y:49,title:'Visibilidade reduzida no cruzamento',icon:'👀',text:'Fluxo intenso e veículos em diferentes posições podem esconder outros usuários. Reduza e amplie a observação.'}
];

function ensureStyles(){
  if(document.getElementById('olho-vivo-v36-css'))return;
  const s=document.createElement('style');
  s.id='olho-vivo-v36-css';
  s.textContent=`
  #gameDialog.olho-vivo-dialog{width:min(1480px,97vw)!important;max-width:97vw!important;max-height:95vh!important;overflow:hidden!important}
  #gameDialog.olho-vivo-dialog>.dialog-shell{height:95vh!important;max-height:95vh!important;overflow:hidden!important;border-radius:24px!important;background:#edf7fb!important}
  #gameDialog.olho-vivo-dialog #gameHost{height:100%!important;overflow:hidden!important}
  #gameDialog.olho-vivo-dialog .dialog-close{position:absolute!important;top:12px!important;right:12px!important;z-index:800!important}
  .ov{box-sizing:border-box;width:100%;height:100%;display:grid;grid-template-rows:74px 48px minmax(0,1fr) 34px;gap:7px;padding:8px 12px 10px;background:linear-gradient(180deg,#f9fdff,#e9f4f9);overflow:hidden}
  .ov .hero{display:grid;grid-template-columns:175px 1fr;align-items:center;gap:14px;padding:7px 58px 7px 9px;border-radius:17px;background:linear-gradient(135deg,#063e6a,#08699e 56%,#0ca1bf);color:#fff;overflow:hidden;box-shadow:0 8px 22px rgba(7,61,91,.15)}
  .ov .hero .cover{height:60px;border-radius:12px;background-image:linear-gradient(90deg,rgba(0,29,52,.12),rgba(0,29,52,.03)),url('${SCENE}');background-size:cover;background-position:center;box-shadow:inset 0 0 0 1px rgba(255,255,255,.24)}
  .ov .eyebrow{margin:0;color:#c9efff;font-size:.48rem;font-weight:1000;letter-spacing:.12em}
  .ov .hero h2{margin:2px 0 1px;font-size:1.3rem;line-height:1.05;color:#fff}
  .ov .hero small{font-size:.58rem;color:#e6f7ff}
  .ov .bar{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:6px}
  .ov .stats{display:grid;grid-template-columns:repeat(5,minmax(80px,1fr));gap:5px}
  .ov .stat,.ov .tools{height:48px;border:1px solid #d2e4ed;border-radius:11px;background:#fff}
  .ov .stat{display:flex;align-items:center;justify-content:space-between;gap:6px;padding:5px 10px}
  .ov .stat span{font-size:.5rem;color:#6b8394;font-weight:900}.ov .stat b{font-size:.88rem;color:#143f60}
  .ov .tools{display:flex;align-items:center;gap:4px;padding:4px}
  .ov button{font:inherit}
  .ov .tool{min-height:30px;padding:4px 8px;border:1px solid #cfdee7;border-radius:8px;background:#fff;color:#31536b;font-size:.48rem;font-weight:1000;cursor:pointer}
  .ov .main{min-height:0;display:grid;grid-template-columns:minmax(560px,1.5fr) minmax(300px,.5fr);gap:8px;overflow:hidden}
  .ov .sceneWrap,.ov .side{min-height:0;border:1px solid #cfe1eb;border-radius:18px;background:#fff;overflow:hidden}
  .ov .sceneWrap{padding:7px;background:#dcebf2}
  .ov .scene{position:relative;width:100%;height:100%;min-height:0;border-radius:14px;background-image:url('${SCENE}');background-size:cover;background-position:center;overflow:hidden;box-shadow:inset 0 0 0 2px rgba(255,255,255,.35),0 8px 20px rgba(8,55,80,.15);cursor:crosshair}
  .ov .scene:before{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(180deg,rgba(0,0,0,.02),rgba(0,0,0,.08))}
  .ov .sceneLabel{position:absolute;left:10px;top:10px;z-index:10;padding:5px 8px;border-radius:999px;background:rgba(3,32,54,.82);color:#fff;font-size:.43rem;font-weight:1000;backdrop-filter:blur(3px)}
  .ov .hot{position:absolute;z-index:20;transform:translate(-50%,-50%);width:58px;height:58px;border:0;border-radius:50%;background:rgba(255,255,255,.001);cursor:pointer}
  .ov .hot:after{content:"";position:absolute;inset:8px;border-radius:50%;border:2px dashed transparent}
  .ov .hot.hint:after{border-color:#ffd23f;background:rgba(255,210,63,.16);animation:ovPulse .75s infinite}
  .ov .hot.found{pointer-events:none;background:rgba(36,170,95,.14)}
  .ov .hot.found:after{content:"✓";display:grid;place-items:center;inset:10px;border:3px solid #fff;background:#28a761;color:#fff;font-size:1.15rem;font-weight:1000;box-shadow:0 4px 12px rgba(0,0,0,.24)}
  @keyframes ovPulse{50%{transform:scale(1.2);box-shadow:0 0 0 12px rgba(255,210,63,0)}}
  .ov .tap{position:absolute;z-index:50;transform:translate(-50%,-50%);width:36px;height:36px;border-radius:50%;display:grid;place-items:center;background:#e63b36;color:#fff;border:3px solid #fff;font-size:.86rem;font-weight:1000;pointer-events:none;animation:tapPop .7s ease forwards}
  @keyframes tapPop{0%{transform:translate(-50%,-50%) scale(.4);opacity:0}35%{transform:translate(-50%,-50%) scale(1.15);opacity:1}100%{transform:translate(-50%,-50%) scale(.92);opacity:0}}
  .ov .side{display:grid;grid-template-rows:auto auto minmax(0,1fr) auto;gap:7px;padding:9px;background:linear-gradient(180deg,#f8fcfe,#eef6fa)}
  .ov .sideCard{padding:9px;border:1px solid #d6e5ed;border-radius:13px;background:#fff}
  .ov .sideCard h3{margin:0;color:#163f60;font-size:.78rem}.ov .sideCard p{margin:4px 0 0;color:#6e8494;font-size:.54rem;line-height:1.35}
  .ov .meter{height:9px;margin-top:7px;border-radius:999px;background:#e2edf2;overflow:hidden}.ov .meter i{display:block;height:100%;width:0;background:linear-gradient(90deg,#28ad68,#69ce88);transition:.35s}
  .ov .difficulty{display:grid;grid-template-columns:repeat(3,1fr);gap:4px}.ov .level{min-height:34px;border:1px solid #ccdde7;border-radius:9px;background:#fff;color:#31536b;font-size:.47rem;font-weight:1000;cursor:pointer}.ov .level.active{background:#0d679b;color:#fff;border-color:#0d679b}
  .ov .riskList{min-height:0;overflow:auto;display:grid;align-content:start;gap:5px;padding-right:2px}
  .ov .riskItem{display:grid;grid-template-columns:28px minmax(0,1fr);gap:7px;align-items:center;padding:6px;border:1px solid #dce8ee;border-radius:10px;background:#f7fafc}
  .ov .riskItem .num{display:grid;place-items:center;width:26px;height:26px;border-radius:50%;background:#dce8ee;color:#7a8d99;font-size:.48rem;font-weight:1000}
  .ov .riskItem.found{background:#eaf8ef;border-color:#9bd1ab}.ov .riskItem.found .num{background:#2ca563;color:#fff}
  .ov .riskItem strong{display:block;font-size:.48rem;color:#294b61}.ov .riskItem small{display:block;font-size:.38rem;color:#7890a0}
  .ov .tip{display:flex;align-items:center;gap:7px;padding:8px;border-radius:11px;background:#fff6cf;border:1px solid #edd77c;color:#6c5714;font-size:.48rem;line-height:1.25}
  .ov .foot{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:6px}
  .ov .status,.ov .best{height:34px;display:flex;align-items:center;gap:6px;padding:4px 8px;border:1px solid #d5e5ed;border-radius:9px;background:#fff;color:#587285;font-size:.45rem}
  .ov .best{min-width:220px;justify-content:space-between}
  .ov .overlay{position:absolute;inset:0;z-index:300;display:grid;place-items:center;padding:20px;background:rgba(2,20,34,.74);backdrop-filter:blur(3px)}
  .ov .feedback{width:min(620px,92%);display:grid;gap:10px;padding:20px;border-radius:22px;background:linear-gradient(180deg,#fff,#eef7fb);box-shadow:0 30px 90px rgba(0,0,0,.38);border:2px solid #fff}
  .ov .feedback .icon{font-size:2.2rem}.ov .feedback h3{margin:0;color:#163f60;font-size:1.08rem}.ov .feedback p{margin:0;color:#5f7787;font-size:.66rem;line-height:1.4}
  .ov .feedback.ok{border-color:#8bd5a6}.ov .feedback.bad{border-color:#f0aaa6}
  .ov .feedbackActions{display:flex;justify-content:flex-end;gap:7px}
  .ovResult{box-sizing:border-box;width:100%;height:100%;overflow:hidden;display:grid;grid-template-rows:auto auto minmax(0,1fr) auto;gap:9px;padding:12px 16px 14px;background:linear-gradient(180deg,#f9fdff,#eaf5fa)}
  .ovResult .rh{display:grid;grid-template-columns:165px 1fr 70px;align-items:center;gap:14px;padding:10px 14px;border-radius:18px;background:linear-gradient(135deg,#063e6a,#08699e 58%,#0ca1bf);color:#fff}
  .ovResult .rcov{height:74px;border-radius:11px;background-image:url('${SCENE}');background-size:cover;background-position:center}.ovResult .rh p{margin:0;font-size:.52rem;color:#dff2fc;font-weight:900}.ovResult .rh h2{margin:2px 0;font-size:1.35rem;color:#fff}.ovResult .medal{display:grid;place-items:center;width:66px;height:66px;border-radius:50%;background:linear-gradient(145deg,#ffe15f,#f1aa25);font-size:2rem}
  .ovResult .rs{display:grid;grid-template-columns:repeat(4,1fr);gap:7px}.ovResult .rstat{display:flex;justify-content:space-between;align-items:center;padding:8px 11px;border:1px solid #d5e5ed;border-radius:12px;background:#fff}.ovResult .rstat span{font-size:.57rem;color:#6a8293}.ovResult .rstat b{font-size:.95rem;color:#173f60}
  .ovResult .learned{min-height:0;overflow:auto;display:grid;grid-template-columns:repeat(2,1fr);gap:7px;padding:8px;border:1px solid #d4e4ec;border-radius:14px;background:#fff}.ovResult .learn{display:grid;grid-template-columns:38px 1fr;align-items:center;gap:8px;padding:8px;border:1px solid #dce8ee;border-radius:11px;background:#f8fbfd}.ovResult .learn b{font-size:1.2rem}.ovResult .learn strong{display:block;color:#173f60;font-size:.61rem}.ovResult .learn small{display:block;color:#748b9a;font-size:.46rem;line-height:1.2}
  .ovResult .ra{display:flex;justify-content:center;gap:10px}.ovResult .ra .btn{min-width:160px}
  @media(max-width:760px){
    html:has(#gameDialog.olho-vivo-dialog[open]),body:has(#gameDialog.olho-vivo-dialog[open]){overflow:hidden!important}
    #gameDialog.olho-vivo-dialog{width:100vw!important;max-width:100vw!important;height:100dvh!important;max-height:100dvh!important;margin:0!important;padding:0!important;inset:0!important;border:0!important;border-radius:0!important}
    #gameDialog.olho-vivo-dialog>.dialog-shell{height:100dvh!important;max-height:100dvh!important;border-radius:0!important}
    #gameDialog.olho-vivo-dialog .dialog-close{top:8px!important;right:8px!important;width:44px!important;height:44px!important}
    .ov{grid-template-rows:56px 72px minmax(0,1fr) 28px;gap:5px;padding:6px}
    .ov .hero{grid-template-columns:82px 1fr;padding:4px 52px 4px 6px}.ov .hero .cover{height:43px}.ov .eyebrow{font-size:.36rem}.ov .hero h2{font-size:.88rem}.ov .hero small{display:none}
    .ov .bar{grid-template-columns:1fr;grid-template-rows:38px 30px;gap:4px}.ov .stats{gap:3px}.ov .stat{height:38px;display:grid;place-items:center;padding:2px}.ov .stat span{font-size:.34rem}.ov .stat b{font-size:.60rem}.ov .tools{height:30px}.ov .tool{flex:1;min-width:0;min-height:24px;padding:3px;font-size:.39rem}
    .ov .main{grid-template-columns:1fr;grid-template-rows:minmax(330px,62%) minmax(0,38%);gap:5px}.ov .sceneWrap{padding:5px}.ov .scene{min-height:320px;background-position:center}.ov .hot{width:48px;height:48px}
    .ov .side{grid-template-rows:auto auto minmax(0,1fr);padding:5px;gap:4px}.ov .sideCard{padding:6px}.ov .sideCard h3{font-size:.55rem}.ov .sideCard p{font-size:.40rem}.ov .meter{height:6px;margin-top:4px}.ov .level{min-height:29px;font-size:.40rem}.ov .riskList{display:none}.ov .tip{font-size:.39rem;padding:5px}
    .ov .status{font-size:.35rem}.ov .best{display:none}.ov .sceneLabel{font-size:.34rem}.ov .overlay{position:fixed;padding:62px 10px 10px}.ov .feedback{width:min(94vw,520px);max-height:calc(100dvh - 84px);overflow:auto;padding:14px}.ov .feedback h3{font-size:.88rem}.ov .feedback p{font-size:.56rem}
    .ovResult{height:100%;overflow:auto;grid-template-rows:auto auto auto auto;padding:9px}.ovResult .rh{grid-template-columns:92px 1fr 48px;padding:8px}.ovResult .rcov{height:60px}.ovResult .rh h2{font-size:1rem}.ovResult .medal{width:46px;height:46px;font-size:1.4rem}.ovResult .rs{grid-template-columns:repeat(2,1fr)}.ovResult .learned{grid-template-columns:1fr;overflow:visible}.ovResult .ra{display:grid;grid-template-columns:1fr 1fr}.ovResult .ra .btn{min-width:0;width:100%}
  }`;
  document.head.appendChild(s);
}

function saveGlobal(score,found,answers){
  const s=JSON.parse(localStorage.getItem('mobiliza.results')||'{"games":0,"correct":0,"answers":0,"best":0,"streak":0}');
  s.games=(s.games||0)+1;s.correct=(s.correct||0)+found;s.answers=(s.answers||0)+answers;s.best=Math.max(s.best||0,score);
  localStorage.setItem('mobiliza.results',JSON.stringify(s));
}

export function openOlhoVivo(dialog,host,onFinish){
  ensureStyles();
  dialog.classList.add('olho-vivo-dialog');
  let level='medio',cfg=DIFFICULTIES[level],active=[],found=new Set(),score=0,errors=0,left=cfg.time,timer=null,started=false,finished=false,sound=localStorage.getItem('mobiliza.olhovivo.sound')!=='0',ctx=null,hintIndex=null;

  const audio=()=>{if(!sound)return null;try{const C=window.AudioContext||window.webkitAudioContext;if(!ctx)ctx=new C();if(ctx.state==='suspended')ctx.resume();return ctx}catch{return null}};
  const tone=(f,d=.06,t=0,type='sine',g=.035)=>{const c=audio();if(!c)return;const o=c.createOscillator(),v=c.createGain(),st=c.currentTime+t;o.type=type;o.frequency.setValueAtTime(f,st);v.gain.setValueAtTime(.0001,st);v.gain.exponentialRampToValueAtTime(g,st+.01);v.gain.exponentialRampToValueAtTime(.0001,st+d);o.connect(v);v.connect(c.destination);o.start(st);o.stop(st+d+.03)};
  const snd={ok:()=>{tone(523,.06);tone(659,.06,.06);tone(784,.12,.12)},bad:()=>{tone(260,.08,0,'sawtooth',.025);tone(185,.1,.08,'sawtooth',.025)},finish:()=>{tone(523,.07);tone(659,.07,.07);tone(784,.07,.14);tone(1046,.2,.21)},click:()=>tone(500,.035,0,'square',.018)};
  const best=()=>JSON.parse(localStorage.getItem('mobiliza.olhovivo.best.'+level)||'null');

  function selectRisks(){
    active=RISKS.slice(0,cfg.count);
  }

  function render(){
    cfg=DIFFICULTIES[level];selectRisks();left=cfg.time;found=new Set();score=0;errors=0;started=true;finished=false;hintIndex=null;
    host.innerHTML=`<section class="game ov">
      <div class="hero"><div class="cover"></div><div><p class="eyebrow">OLHO VIVO NO TRÂNSITO • NOVO JOGO</p><h2>Encontre os riscos na cena</h2><small>Observe com atenção, toque nos pontos de risco e aprenda com cada descoberta.</small></div></div>
      <div class="bar">
        <div class="stats">
          <div class="stat"><span>🎯 Riscos</span><b id="ovFound">0/${cfg.count}</b></div>
          <div class="stat"><span>⭐ Pontos</span><b id="ovScore">0</b></div>
          <div class="stat"><span>⏱ Tempo</span><b id="ovTime">${left}s</b></div>
          <div class="stat"><span>❌ Erros</span><b id="ovErrors">0</b></div>
          <div class="stat"><span>📊 Nível</span><b>${cfg.label}</b></div>
        </div>
        <div class="tools">
          <button class="tool" id="ovSound">${sound?'🔊':'🔇'} Som</button>
          <button class="tool" id="ovHint">💡 Dica</button>
          <button class="tool" id="ovHelp">❔ Como jogar</button>
          <button class="tool" id="ovRestart">↻ Reiniciar</button>
        </div>
      </div>
      <div class="main">
        <div class="sceneWrap"><div class="scene" id="ovScene"><div class="sceneLabel">📷 Cena 1 • Saída da escola</div>${active.map((r,i)=>`<button class="hot" data-risk="${i}" style="left:${r.x}%;top:${r.y}%" aria-label="Ponto de risco ${i+1}"></button>`).join('')}</div></div>
        <aside class="side">
          <div class="sideCard"><h3>Encontre todos os riscos</h3><p>Toque diretamente na situação que representa perigo ou exige atenção especial.</p><div class="meter"><i id="ovMeter"></i></div></div>
          <div class="difficulty">${Object.entries(DIFFICULTIES).map(([k,v])=>`<button class="level ${k===level?'active':''}" data-level="${k}">${v.label}</button>`).join('')}</div>
          <div class="riskList" id="ovList">${active.map((r,i)=>`<div class="riskItem" data-item="${i}"><span class="num">${i+1}</span><div><strong>Risco ${i+1}</strong><small>Ainda não encontrado</small></div></div>`).join('')}</div>
          <div class="tip">💡 <span><b>Dica:</b> observe travessias, cruzamentos, velocidade, visibilidade e interação entre os diferentes usuários da via.</span></div>
        </aside>
      </div>
      <div class="foot"><div class="status" id="ovStatus">👀 Comece observando toda a cena antes de tocar.</div><div class="best"><span>🏆 Melhor ${cfg.label}</span><strong>${best()?best().score+' pts':'Sem recorde'}</strong></div></div>
      <div id="ovOverlay"></div>
    </section>`;
    bind();startTimer();
  }

  function bind(){
    host.querySelectorAll('[data-risk]').forEach(b=>b.onclick=e=>{e.stopPropagation();hit(+b.dataset.risk)});
    host.querySelector('#ovScene').onclick=e=>miss(e);
    host.querySelectorAll('[data-level]').forEach(b=>b.onclick=()=>{level=b.dataset.level;cfg=DIFFICULTIES[level];stopTimer();render()});
    host.querySelector('#ovSound').onclick=()=>{sound=!sound;localStorage.setItem('mobiliza.olhovivo.sound',sound?'1':'0');if(sound)snd.click();host.querySelector('#ovSound').textContent=(sound?'🔊':'🔇')+' Som'};
    host.querySelector('#ovHint').onclick=showHint;
    host.querySelector('#ovHelp').onclick=help;
    host.querySelector('#ovRestart').onclick=()=>{stopTimer();render()};
  }

  function startTimer(){
    stopTimer();
    timer=setInterval(()=>{if(finished)return;left--;updateHud();if(left<=0)finish(true)},1000);
  }
  function stopTimer(){if(timer){clearInterval(timer);timer=null}}
  function updateHud(){
    const a=host.querySelector('#ovFound'),b=host.querySelector('#ovScore'),c=host.querySelector('#ovTime'),d=host.querySelector('#ovErrors'),m=host.querySelector('#ovMeter');
    if(a)a.textContent=found.size+'/'+cfg.count;if(b)b.textContent=score;if(c)c.textContent=Math.max(0,left)+'s';if(d)d.textContent=errors;if(m)m.style.width=(found.size/cfg.count*100)+'%';
  }

  function hit(i){
    if(finished||found.has(i))return;
    audio();snd.ok();found.add(i);
    const r=active[i];
    score+=Math.max(120,300+left*2-errors*25);
    const hot=host.querySelector('[data-risk="'+i+'"]');if(hot)hot.classList.add('found');
    const item=host.querySelector('[data-item="'+i+'"]');if(item){item.classList.add('found');item.querySelector('.num').textContent='✓';item.querySelector('strong').textContent=r.title;item.querySelector('small').textContent='Risco encontrado'}
    const status=host.querySelector('#ovStatus');if(status)status.innerHTML='✅ <strong>'+r.title+'</strong> encontrado.';
    updateHud();
    feedback(r,i);
  }

  function miss(e){
    if(finished)return;
    if(e.target.closest('.hot'))return;
    errors++;score=Math.max(0,score-cfg.wrong);snd.bad();
    const rect=e.currentTarget.getBoundingClientRect(),x=(e.clientX-rect.left)/rect.width*100,y=(e.clientY-rect.top)/rect.height*100;
    const tap=document.createElement('div');tap.className='tap';tap.style.left=x+'%';tap.style.top=y+'%';tap.textContent='×';e.currentTarget.appendChild(tap);setTimeout(()=>tap.remove(),720);
    const status=host.querySelector('#ovStatus');if(status)status.textContent='❌ Nada aqui. Observe outra região da cena.';
    updateHud();
  }

  function feedback(r,i){
    stopTimer();
    const o=host.querySelector('#ovOverlay');o.className='overlay';o.innerHTML=`<div class="feedback ok"><div class="icon">${r.icon}</div><p class="eyebrow">RISCO ENCONTRADO • ${found.size}/${cfg.count}</p><h3>${r.title}</h3><p>${r.text}</p><div class="feedbackActions"><button class="btn primary" id="ovContinue">${found.size===cfg.count?'Ver resultado':'Continuar procurando'}</button></div></div>`;
    o.querySelector('#ovContinue').onclick=()=>{o.className='';o.innerHTML='';if(found.size===cfg.count)finish(false);else startTimer()};
  }

  function showHint(){
    if(finished)return;
    const remaining=active.map((_,i)=>i).filter(i=>!found.has(i));
    if(!remaining.length)return;
    const i=remaining[0];score=Math.max(0,score-cfg.hintCost);updateHud();snd.click();
    const h=host.querySelector('[data-risk="'+i+'"]');if(h){h.classList.add('hint');setTimeout(()=>h.classList.remove('hint'),1800)}
    const status=host.querySelector('#ovStatus');if(status)status.textContent='💡 Uma região de risco foi destacada por alguns segundos.';
  }

  function help(){
    stopTimer();snd.click();
    const o=host.querySelector('#ovOverlay');o.className='overlay';o.innerHTML=`<div class="feedback"><div class="icon">👀</div><p class="eyebrow">COMO JOGAR</p><h3>Olho Vivo no Trânsito</h3><p>Observe a cena e toque nos comportamentos ou situações que representam risco. Cada acerto revela uma explicação educativa. Toques incorretos podem descontar pontos nos níveis Médio e Difícil. A dica destaca temporariamente uma região ainda não encontrada.</p><div class="feedbackActions"><button class="btn primary" id="ovHelpOk">Entendi</button></div></div>`;o.querySelector('#ovHelpOk').onclick=()=>{o.className='';o.innerHTML='';startTimer()};
  }

  function finish(timeout){
    if(finished)return;finished=true;stopTimer();snd.finish();
    const rec={score,seconds:cfg.time-left,found:found.size,total:cfg.count,errors,date:new Date().toISOString()};
    const old=best();if(!old||score>old.score)localStorage.setItem('mobiliza.olhovivo.best.'+level,JSON.stringify(rec));
    saveGlobal(score,found.size,found.size+errors);onFinish?.();
    const learned=[...found].sort((a,b)=>a-b).map(i=>active[i]);
    host.innerHTML=`<section class="ovResult">
      <div class="rh"><div class="rcov"></div><div><p>OLHO VIVO NO TRÂNSITO • RESULTADO</p><h2>${found.size===cfg.count?'Todos os riscos encontrados!':timeout?'Tempo encerrado!':'Rodada concluída!'}</h2></div><div class="medal">${found.size===cfg.count?'🏆':'👀'}</div></div>
      <div class="rs"><div class="rstat"><span>🎯 Riscos</span><b>${found.size}/${cfg.count}</b></div><div class="rstat"><span>⭐ Pontos</span><b>${score}</b></div><div class="rstat"><span>⏱ Tempo</span><b>${cfg.time-left}s</b></div><div class="rstat"><span>❌ Erros</span><b>${errors}</b></div></div>
      <div class="learned">${learned.length?learned.map(r=>`<div class="learn"><b>${r.icon}</b><div><strong>${r.title}</strong><small>${r.text}</small></div></div>`).join(''):'<div class="learn"><b>💡</b><div><strong>Observe com calma</strong><small>Na próxima rodada, percorra a cena por regiões: calçada, travessia, cruzamento, veículos e ciclovia.</small></div></div>'}</div>
      <div class="ra"><button class="btn primary" id="ovAgain">↻ Jogar novamente</button><button class="btn ghost" id="ovClose">Encerrar</button></div>
    </section>`;
    host.querySelector('#ovAgain').onclick=render;host.querySelector('#ovClose').onclick=()=>dialog.close();
  }

  const onClose=()=>{stopTimer();dialog.classList.remove('olho-vivo-dialog');dialog.removeEventListener('close',onClose)};
  dialog.addEventListener('close',onClose);
  render();if(!dialog.open)dialog.showModal();
}
