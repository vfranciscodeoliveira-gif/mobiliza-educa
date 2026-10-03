const MISSIONS=[
 {id:'pedestres',title:'Travessia segura',text:'Há pedestres aguardando. Organize o cruzamento e libere a travessia sem conflito com os veículos.',goal:'Faça 4 pedestres atravessarem com segurança.'},
 {id:'ambulancia',title:'Corredor de emergência',text:'Uma ambulância se aproxima pela avenida principal. Abra caminho sem criar conflito no cruzamento.',goal:'Libere a ambulância com segurança.'},
 {id:'rush',title:'Hora de pico',text:'O fluxo aumentou. Mantenha o cruzamento funcionando por 30 segundos sem colisões e sem bloquear a faixa.',goal:'Mantenha fluidez e segurança.'}
];

function ensureStyles(){
 if(document.getElementById('central-transito-v39-css'))return;
 const s=document.createElement('style');
 s.id='central-transito-v39-css';
 s.textContent=`
 #gameDialog.central-transito-dialog{width:min(1500px,98vw)!important;max-width:98vw!important;max-height:96vh!important;overflow:hidden!important}
 #gameDialog.central-transito-dialog>.dialog-shell{height:96vh!important;max-height:96vh!important;overflow:hidden!important;border-radius:22px!important;background:#07131c!important}
 #gameDialog.central-transito-dialog #gameHost{height:100%!important;overflow:hidden!important}
 #gameDialog.central-transito-dialog .dialog-close{position:absolute!important;z-index:2000!important;top:10px!important;right:10px!important;background:#fff!important}
 .ct{height:100%;display:grid;grid-template-rows:76px minmax(0,1fr) 112px 30px;gap:7px;padding:8px;background:linear-gradient(180deg,#07131c,#0d2230);color:#fff;overflow:hidden;box-sizing:border-box}
 .ct *{box-sizing:border-box}.ct button{font:inherit}
 .ct .header{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;padding:8px 58px 8px 12px;border-radius:16px;background:linear-gradient(135deg,#083b5b,#0a6c93 60%,#149bb0);box-shadow:0 12px 35px rgba(0,0,0,.28)}
 .ct .brand small{display:block;font-size:.4rem;letter-spacing:.13em;font-weight:1000;color:#bceeff}.ct .brand h2{margin:3px 0 0;font-size:1.16rem;color:#fff}.ct .brand p{margin:3px 0 0;font-size:.5rem;color:#d9f2fb}
 .ct .headerStats{display:flex;gap:6px}.ct .stat{min-width:92px;padding:7px 10px;border-radius:11px;background:rgba(4,26,40,.45);border:1px solid rgba(255,255,255,.18);text-align:center}.ct .stat span{display:block;font-size:.31rem;color:#bad7e5;font-weight:900}.ct .stat b{display:block;font-size:.72rem;margin-top:2px}
 .ct .main{min-height:0;display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:8px}
 .ct .scenePanel,.ct .panel{min-height:0;border-radius:18px;border:1px solid rgba(255,255,255,.12);overflow:hidden;background:#102431}
 .ct .scenePanel{padding:7px;position:relative}
 .ct .scene{position:relative;width:100%;height:100%;min-height:420px;overflow:hidden;border-radius:13px;background:
   radial-gradient(circle at 14% 15%,rgba(255,255,255,.07),transparent 17%),
   radial-gradient(circle at 86% 85%,rgba(255,255,255,.05),transparent 18%),
   linear-gradient(180deg,#3f7b48 0 29%,#4b834f 29% 71%,#3e7446 71%);
   box-shadow:inset 0 0 0 2px rgba(255,255,255,.08),0 15px 35px rgba(0,0,0,.24)}
 .ct .scene:before,.ct .scene:after{content:"";position:absolute;z-index:1;background:#30383d;box-shadow:inset 0 0 20px rgba(0,0,0,.35)}
 .ct .scene:before{left:0;right:0;top:36%;height:28%}
 .ct .scene:after{top:0;bottom:0;left:38%;width:24%}
 .ct .roadTex{position:absolute;z-index:2;inset:0;pointer-events:none;background:
   repeating-linear-gradient(90deg,transparent 0 58px,rgba(255,255,255,.018) 59px 60px,transparent 61px 119px),
   repeating-linear-gradient(0deg,transparent 0 51px,rgba(255,255,255,.014) 52px 53px,transparent 54px 105px)}
 .ct .curb{position:absolute;z-index:3;background:#c7c9c8;box-shadow:0 0 0 2px #f3f4f3,inset 0 0 10px rgba(0,0,0,.12)}
 .ct .curb.t{left:0;right:0;top:32.8%;height:3.2%}.ct .curb.b{left:0;right:0;top:64%;height:3.2%}.ct .curb.l{top:0;bottom:0;left:34.8%;width:3.2%}.ct .curb.r{top:0;bottom:0;left:62%;width:3.2%}
 .ct .laneH,.ct .laneV{position:absolute;z-index:4;pointer-events:none;opacity:.84}
 .ct .laneH{left:0;right:0;top:49.5%;height:2px;background:repeating-linear-gradient(90deg,#e8e4b1 0 28px,transparent 28px 48px)}
 .ct .laneV{top:0;bottom:0;left:49.5%;width:2px;background:repeating-linear-gradient(0deg,#e8e4b1 0 28px,transparent 28px 48px)}
 .ct .cross{position:absolute;z-index:5;pointer-events:none;background:repeating-linear-gradient(90deg,rgba(255,255,255,.94) 0 8px,transparent 8px 14px);filter:drop-shadow(0 1px 0 rgba(0,0,0,.15))}
 .ct .cross.n{left:39.5%;top:29.9%;width:21%;height:5.5%}.ct .cross.s{left:39.5%;top:64.8%;width:21%;height:5.5%}.ct .cross.w{left:33.8%;top:39%;width:5.2%;height:22%;transform:rotate(90deg)}.ct .cross.e{left:61.1%;top:39%;width:5.2%;height:22%;transform:rotate(90deg)}
 .ct .stop{position:absolute;z-index:5;background:#f7f7f7}.ct .stop.n{left:39%;top:35.4%;width:22%;height:3px}.ct .stop.s{left:39%;top:63.2%;width:22%;height:3px}.ct .stop.w{left:37.3%;top:39%;width:3px;height:22%}.ct .stop.e{left:62.7%;top:39%;width:3px;height:22%}
 .ct .building{position:absolute;z-index:6;border-radius:8px;background:linear-gradient(145deg,#e6e0d1,#c8bda8);box-shadow:0 10px 20px rgba(0,0,0,.22),inset 0 0 0 3px rgba(255,255,255,.25)}
 .ct .building.school{left:4%;top:5%;width:23%;height:20%;background:linear-gradient(145deg,#f0d36e,#dfb746)}.ct .building.school:after{content:"ESCOLA";position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:.55rem;font-weight:1000;color:#5a4512;letter-spacing:.08em}
 .ct .building.shop{right:4%;top:7%;width:20%;height:17%;background:linear-gradient(145deg,#d7e9ef,#9cc5d4)}.ct .building.shop:after{content:"COMÉRCIO";position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:.5rem;font-weight:1000;color:#2b5565}
 .ct .park{position:absolute;z-index:5;right:4%;bottom:6%;width:24%;height:20%;border-radius:16px;background:radial-gradient(circle at 20% 30%,#396d3f 0 6%,transparent 7%),radial-gradient(circle at 75% 25%,#3b7543 0 7%,transparent 8%),radial-gradient(circle at 48% 70%,#377040 0 7%,transparent 8%),linear-gradient(145deg,#6da866,#4e8d52);box-shadow:inset 0 0 0 2px rgba(255,255,255,.16)}
 .ct .park:after{content:"PARQUE";position:absolute;right:8px;bottom:7px;font-size:.4rem;font-weight:1000;color:#e9ffe9}
 .ct .lamp{position:absolute;z-index:8;width:5px;height:28px;background:#222c31;border-radius:3px}.ct .lamp:after{content:"";position:absolute;left:-5px;top:-8px;width:15px;height:10px;border-radius:50%;background:#f6e6a2;box-shadow:0 0 12px rgba(246,230,162,.35)}
 .ct .l1{left:31%;top:28%}.ct .l2{right:31%;bottom:27%}
 .ct .signal{position:absolute;z-index:18;width:26px;height:64px;padding:5px;border-radius:8px;background:#11191d;border:2px solid #d8e4e7;box-shadow:0 7px 15px rgba(0,0,0,.4);display:grid;gap:4px;place-items:center}
 .ct .signal i{display:block;width:14px;height:14px;border-radius:50%;background:#273238;box-shadow:inset 0 1px 3px rgba(0,0,0,.7)}
 .ct .signal.red i:nth-child(1){background:#ef3b37;box-shadow:0 0 10px rgba(239,59,55,.75)}.ct .signal.yellow i:nth-child(2){background:#ffd13e;box-shadow:0 0 10px rgba(255,209,62,.75)}.ct .signal.green i:nth-child(3){background:#39d36b;box-shadow:0 0 10px rgba(57,211,107,.75)}
 .ct .sigN{left:34.1%;top:27.5%}.ct .sigS{left:63%;top:61.5%}.ct .sigW{left:31.5%;top:64%;transform:rotate(90deg)}.ct .sigE{left:63%;top:27%;transform:rotate(90deg)}
 .ct .pedLight{position:absolute;z-index:18;width:26px;height:36px;border-radius:7px;background:#142027;border:2px solid #dbe5e8;display:grid;place-items:center;font-size:.6rem;font-weight:1000;color:#ff5e58;box-shadow:0 6px 14px rgba(0,0,0,.35)}.ct .pedLight.go{color:#45dc76}.ct .pedN{left:61%;top:31%}.ct .pedS{left:36%;top:64%}
 .ct .vehicle{position:absolute;z-index:12;width:52px;height:25px;border-radius:8px 11px 7px 8px;box-shadow:0 6px 7px rgba(0,0,0,.35),inset 0 0 0 1px rgba(255,255,255,.35);background:linear-gradient(180deg,var(--c1) 0 23%,var(--c2) 23% 77%,var(--c3) 77%);transition:filter .2s}
 .ct .vehicle:before{content:"";position:absolute;left:11px;top:3px;width:28px;height:8px;border-radius:5px;background:linear-gradient(90deg,#c8e0ea,#7394a4 48%,#b8d3df);box-shadow:inset 0 0 0 1px rgba(255,255,255,.32)}
 .ct .vehicle:after{content:"";position:absolute;left:7px;bottom:-4px;width:38px;height:6px;background:radial-gradient(circle at 3px 3px,#111 0 3px,transparent 3.5px),radial-gradient(circle at 35px 3px,#111 0 3px,transparent 3.5px)}
 .ct .vehicle.vertical{transform:rotate(90deg)}
 .ct .vehicle.ambulance{width:62px;height:28px;background:linear-gradient(180deg,#eef5f7 0 55%,#d72c35 55% 67%,#f6fbfc 67%);border:1px solid #fff}.ct .vehicle.ambulance:before{background:linear-gradient(90deg,#9ec3d1,#d8edf5)}.ct .vehicle.ambulance .lightbar{position:absolute;left:21px;top:-5px;width:20px;height:5px;border-radius:3px;background:linear-gradient(90deg,#1ba7ff 0 50%,#ff3340 50%);box-shadow:0 0 8px rgba(90,180,255,.8);animation:flashBar .35s infinite alternate}
 @keyframes flashBar{to{filter:brightness(2)}}
 .ct .walker{position:absolute;z-index:14;width:16px;height:29px;filter:drop-shadow(0 4px 3px rgba(0,0,0,.3));transform-origin:50% 100%}
 .ct .walker:before{content:"";position:absolute;left:5px;top:0;width:8px;height:8px;border-radius:50%;background:var(--skin,#d9a675)}
 .ct .walker:after{content:"";position:absolute;left:4px;top:7px;width:10px;height:17px;border-radius:5px 5px 3px 3px;background:var(--shirt,#2770a2);box-shadow:-4px 11px 0 -2px #263238,7px 11px 0 -2px #263238}
 .ct .walker.waiting{animation:bob 1.2s ease-in-out infinite alternate}@keyframes bob{to{transform:translateY(-2px)}}
 .ct .cyclist{position:absolute;z-index:13;width:40px;height:18px;filter:drop-shadow(0 4px 3px rgba(0,0,0,.35))}.ct .cyclist:before,.ct .cyclist:after{content:"";position:absolute;bottom:0;width:14px;height:14px;border:2px solid #1c2428;border-radius:50%}.ct .cyclist:before{left:1px}.ct .cyclist:after{right:1px}.ct .cyclist i{position:absolute;left:10px;top:2px;width:20px;height:10px;border-bottom:3px solid #247b99;transform:skew(-20deg)}
 .ct .eventTag{position:absolute;z-index:40;left:50%;top:12px;transform:translateX(-50%);padding:7px 11px;border-radius:999px;background:rgba(4,30,45,.9);border:1px solid rgba(255,255,255,.2);font-size:.43rem;font-weight:1000;box-shadow:0 8px 20px rgba(0,0,0,.28);backdrop-filter:blur(6px)}
 .ct .missionTag{position:absolute;z-index:40;left:12px;bottom:12px;padding:7px 10px;border-radius:10px;background:rgba(3,28,42,.86);border:1px solid rgba(255,255,255,.18);font-size:.4rem;line-height:1.3;max-width:300px}
 .ct .missionTag b{display:block;color:#78e3ff;font-size:.46rem;margin-bottom:2px}
 .ct .panel{display:grid;grid-template-rows:auto auto minmax(0,1fr) auto;gap:7px;padding:9px;background:linear-gradient(180deg,#122c3d,#0d2230)}
 .ct .panel h3{margin:0;font-size:.72rem}.ct .panel p{margin:4px 0 0;font-size:.48rem;line-height:1.35;color:#bfd1db}
 .ct .missionBox,.ct .statusBox,.ct .controlBox{padding:9px;border-radius:12px;border:1px solid rgba(255,255,255,.11);background:rgba(255,255,255,.045)}
 .ct .missionBox small{display:block;font-size:.34rem;letter-spacing:.1em;color:#7cdfff;font-weight:1000}.ct .missionBox b{display:block;font-size:.69rem;margin-top:2px}.ct .progress{height:8px;margin-top:7px;border-radius:99px;background:#203b4a;overflow:hidden}.ct .progress i{display:block;height:100%;width:0;background:linear-gradient(90deg,#22c46e,#67e493);transition:.3s}
 .ct .controls{display:grid;grid-template-columns:1fr 1fr;gap:6px;align-content:start}.ct .ctrl{min-height:58px;border:1px solid rgba(255,255,255,.14);border-radius:11px;background:#17384a;color:#fff;cursor:pointer;padding:7px;text-align:left;transition:.18s}.ct .ctrl:hover{transform:translateY(-1px);border-color:#63ddff;background:#1b465d}.ct .ctrl strong{display:block;font-size:.47rem}.ct .ctrl span{display:block;margin-top:3px;font-size:.35rem;color:#b5ccd8;line-height:1.25}.ct .ctrl.active{border-color:#65dfa0;background:#164b3a;box-shadow:0 0 0 2px rgba(101,223,160,.12)}
 .ct .controlBox{display:grid;gap:6px}.ct .row{display:flex;gap:6px}.ct .mini{flex:1;min-height:34px;border:1px solid rgba(255,255,255,.14);border-radius:8px;background:#142f40;color:#fff;font-size:.39rem;font-weight:900;cursor:pointer}.ct .mini.active{background:#0d6f99;border-color:#69dfff}
 .ct .statusBox{font-size:.42rem;line-height:1.35;color:#c8d9e3;overflow:auto}.ct .statusBox b{color:#fff}
 .ct .bottom{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}.ct .missionCard{border:1px solid rgba(255,255,255,.12);border-radius:12px;background:#112938;color:#fff;padding:8px;text-align:left;cursor:pointer;opacity:.5}.ct .missionCard.unlocked{opacity:1}.ct .missionCard.current{border-color:#6adfff;background:#17435a;box-shadow:0 0 0 2px rgba(106,223,255,.10)}.ct .missionCard.done{border-color:#61d596;background:#153d33}.ct .missionCard strong{display:block;font-size:.47rem}.ct .missionCard small{display:block;font-size:.34rem;color:#abc4d0;margin-top:3px}
 .ct .footer{display:flex;align-items:center;justify-content:space-between;padding:0 5px;font-size:.36rem;color:#8eabba}
 .ct .toast{position:absolute;z-index:100;left:50%;top:50%;transform:translate(-50%,-50%);min-width:280px;max-width:520px;padding:13px 16px;border-radius:14px;background:rgba(2,21,33,.96);border:1px solid #69dfff;box-shadow:0 20px 60px rgba(0,0,0,.48);text-align:center;animation:toastIn .2s ease}.ct .toast.ok{border-color:#5dda98}.ct .toast.bad{border-color:#ff746e}.ct .toast h4{margin:0 0 4px;font-size:.75rem}.ct .toast p{margin:0;font-size:.46rem;line-height:1.35;color:#c6d9e3}@keyframes toastIn{from{opacity:0;transform:translate(-50%,-46%) scale(.96)}}
 @media(max-width:760px){
  #gameDialog.central-transito-dialog{width:100vw!important;max-width:100vw!important;height:100dvh!important;max-height:100dvh!important;margin:0!important;padding:0!important;inset:0!important;border:0!important;border-radius:0!important}
  #gameDialog.central-transito-dialog>.dialog-shell{height:100dvh!important;max-height:100dvh!important;border-radius:0!important}
  .ct{grid-template-rows:62px minmax(0,1fr) 94px 24px;padding:5px;gap:4px}.ct .header{padding:5px 50px 5px 8px}.ct .brand small{font-size:.28rem}.ct .brand h2{font-size:.8rem}.ct .brand p{font-size:.34rem}.ct .headerStats{gap:3px}.ct .stat{min-width:55px;padding:4px 5px}.ct .stat span{font-size:.24rem}.ct .stat b{font-size:.5rem}
  .ct .main{grid-template-columns:1fr;grid-template-rows:minmax(360px,64%) minmax(0,36%);gap:4px}.ct .scenePanel{padding:4px}.ct .scene{min-height:350px}.ct .panel{grid-template-rows:auto auto minmax(0,1fr);padding:5px;gap:4px}.ct .statusBox{display:none}.ct .missionBox{padding:6px}.ct .missionBox small{font-size:.27rem}.ct .missionBox b{font-size:.5rem}.ct .missionBox p{font-size:.36rem}.ct .controls{grid-template-columns:repeat(4,1fr);gap:3px}.ct .ctrl{min-height:46px;padding:4px;text-align:center}.ct .ctrl strong{font-size:.34rem}.ct .ctrl span{display:none}.ct .controlBox{display:none}
  .ct .bottom{gap:3px}.ct .missionCard{padding:5px}.ct .missionCard strong{font-size:.33rem}.ct .missionCard small{font-size:.26rem}.ct .missionTag{font-size:.31rem;max-width:210px}.ct .missionTag b{font-size:.35rem}.ct .eventTag{font-size:.32rem;padding:5px 7px}
  .ct .vehicle{transform:scale(.76)}.ct .vehicle.vertical{transform:rotate(90deg) scale(.76)}.ct .walker{transform:scale(.78)}.ct .signal{transform:scale(.78);transform-origin:center}.ct .sigW,.ct .sigE{transform:rotate(90deg) scale(.78)}
 }
 `;
 document.head.appendChild(s);
}

function saveGlobal(score,success,attempts){
 const s=JSON.parse(localStorage.getItem('mobiliza.results')||'{"games":0,"correct":0,"answers":0,"best":0,"streak":0}');
 s.games=(s.games||0)+1;s.correct=(s.correct||0)+success;s.answers=(s.answers||0)+attempts;s.best=Math.max(s.best||0,score);
 localStorage.setItem('mobiliza.results',JSON.stringify(s));
}

export function openCentralTransito(dialog,host,onFinish){
 ensureStyles();dialog.classList.add('central-transito-dialog');
 let running=true,raf=0,last=0,score=0,safety=100,mission=0,unlocked=0,missionDone=new Set(),elapsed=0,missionElapsed=0,crossed=0,ambulancePassed=false,incidents=0,speedLimit=30,sound=localStorage.getItem('mobiliza.central.sound')!=='0',ctx=null;
 let phase='EW_GREEN',phaseChangedAt=performance.now(),pedRequested=false,allRedUntil=0,eventText='Fluxo normal';
 let vehicles=[],walkers=[],cyclists=[],id=1,eventTimer=0,spawnTimer=0,pedSpawnTimer=0,ambulanceSpawned=false,rushStable=0;

 const audio=()=>{if(!sound)return null;try{const C=window.AudioContext||window.webkitAudioContext;if(!ctx)ctx=new C();if(ctx.state==='suspended')ctx.resume();return ctx}catch{return null}};
 const tone=(f,d=.05,t=0,type='sine',g=.02)=>{const c=audio();if(!c)return;const o=c.createOscillator(),v=c.createGain(),st=c.currentTime+t;o.type=type;o.frequency.setValueAtTime(f,st);v.gain.setValueAtTime(.0001,st);v.gain.exponentialRampToValueAtTime(g,st+.01);v.gain.exponentialRampToValueAtTime(.0001,st+d);o.connect(v);v.connect(c.destination);o.start(st);o.stop(st+d+.03)};
 const snd={switch:()=>{tone(420,.04);tone(620,.06,.05)},ok:()=>{tone(523,.05);tone(659,.05,.06);tone(784,.1,.12)},bad:()=>{tone(180,.1,0,'sawtooth',.02);tone(125,.12,.1,'sawtooth',.018)},siren:()=>{tone(760,.15);tone(560,.15,.15);tone(760,.15,.3)},finish:()=>{tone(523,.06);tone(659,.06,.06);tone(784,.06,.12);tone(1046,.18,.18)}};

 const COLORS=[
  ['#dbe6ec','#66889a','#314a58'],['#eb5c4d','#9c2e2b','#5d1b1b'],['#e9c04c','#a4761f','#6e4e15'],
  ['#6aaed4','#34769b','#214f69'],['#e9e9e9','#a5aeb4','#5f686d'],['#5778c7','#324b91','#1e2d57']
 ];

 function carEl(v){
  const [a,b,c]=v.colors;return `<div class="vehicle ${v.axis==='V'?'vertical':''} ${v.kind==='ambulance'?'ambulance':''}" data-v="${v.id}" style="--c1:${a};--c2:${b};--c3:${c};left:${v.x}%;top:${v.y}%">${v.kind==='ambulance'?'<span class="lightbar"></span>':''}</div>`;
 }
 function walkerEl(w){return `<div class="walker ${w.state==='WAIT'?'waiting':''}" data-w="${w.id}" style="--shirt:${w.shirt};--skin:${w.skin};left:${w.x}%;top:${w.y}%"></div>`}
 function cyclistEl(c){return `<div class="cyclist" data-cy="${c.id}" style="left:${c.x}%;top:${c.y}%"><i></i></div>`}
 function signalClass(dir){
   const ew=phase==='EW_GREEN',ns=phase==='NS_GREEN',yellow=phase==='EW_YELLOW'||phase==='NS_YELLOW';
   if(dir==='EW'){if(ew)return'green';if(phase==='EW_YELLOW')return'yellow';return'red'}
   if(ns)return'green';if(phase==='NS_YELLOW')return'yellow';return'red';
 }
 function pedGo(){return phase==='ALL_RED'&&performance.now()<allRedUntil}
 function render(){
  const m=MISSIONS[mission];
  host.innerHTML=`<section class="game ct">
   <div class="header"><div class="brand"><small>CENTRAL DE TRÂNSITO • SIMULAÇÃO EM TEMPO REAL</small><h2>Você no controle do cruzamento</h2><p>Os veículos obedecem ao sinal. Pedestres, eventos e missões reagem às suas decisões.</p></div><div class="headerStats"><div class="stat"><span>SEGURANÇA</span><b id="ctSafety">${safety}%</b></div><div class="stat"><span>PONTOS</span><b id="ctScore">${score}</b></div><div class="stat"><span>MISSÃO</span><b id="ctMission">${mission+1}/${MISSIONS.length}</b></div></div></div>
   <div class="main">
    <div class="scenePanel"><div class="scene" id="ctScene">
      <div class="roadTex"></div><div class="curb t"></div><div class="curb b"></div><div class="curb l"></div><div class="curb r"></div><div class="laneH"></div><div class="laneV"></div>
      <div class="cross n"></div><div class="cross s"></div><div class="cross w"></div><div class="cross e"></div><div class="stop n"></div><div class="stop s"></div><div class="stop w"></div><div class="stop e"></div>
      <div class="building school"></div><div class="building shop"></div><div class="park"></div><div class="lamp l1"></div><div class="lamp l2"></div>
      <div class="signal sigN ${signalClass('NS')}"><i></i><i></i><i></i></div><div class="signal sigS ${signalClass('NS')}"><i></i><i></i><i></i></div><div class="signal sigW ${signalClass('EW')}"><i></i><i></i><i></i></div><div class="signal sigE ${signalClass('EW')}"><i></i><i></i><i></i></div>
      <div class="pedLight pedN ${pedGo()?'go':''}">${pedGo()?'GO':'■'}</div><div class="pedLight pedS ${pedGo()?'go':''}">${pedGo()?'GO':'■'}</div>
      <div id="ctObjects">${vehicles.map(carEl).join('')}${walkers.map(walkerEl).join('')}${cyclists.map(cyclistEl).join('')}</div>
      <div class="eventTag" id="ctEvent">${eventText}</div><div class="missionTag"><b>${m.title}</b>${m.goal}</div>
    </div></div>
    <aside class="panel">
      <div class="missionBox"><small>MISSÃO ${mission+1}</small><b>${m.title}</b><p>${m.text}</p><div class="progress"><i id="ctProgress"></i></div></div>
      <div class="controls">
       <button class="ctrl ${phase.startsWith('EW_')?'active':''}" id="ctEW"><strong>AVENIDA ↔</strong><span>Dar verde ao fluxo horizontal.</span></button>
       <button class="ctrl ${phase.startsWith('NS_')?'active':''}" id="ctNS"><strong>RUA ↕</strong><span>Dar verde ao fluxo vertical.</span></button>
       <button class="ctrl ${pedGo()?'active':''}" id="ctPed"><strong>PEDESTRES</strong><span>Parar veículos e liberar travessia.</span></button>
       <button class="ctrl" id="ctAllRed"><strong>PARAR TUDO</strong><span>Colocar todos os movimentos no vermelho.</span></button>
      </div>
      <div class="statusBox" id="ctStatus"><b>Status:</b> controle ativo. Observe as filas, a travessia e os eventos.</div>
      <div class="controlBox"><div class="row"><button class="mini ${speedLimit===30?'active':''}" data-speed="30">30 km/h</button><button class="mini ${speedLimit===40?'active':''}" data-speed="40">40 km/h</button></div><div class="row"><button class="mini" id="ctSound">${sound?'Som ligado':'Som desligado'}</button><button class="mini" id="ctRestart">Reiniciar</button></div></div>
    </aside>
   </div>
   <div class="bottom">${MISSIONS.map((x,i)=>`<button class="missionCard ${i<=unlocked?'unlocked':''} ${i===mission?'current':''} ${missionDone.has(i)?'done':''}" data-m="${i}"><strong>${missionDone.has(i)?'✓ ':''}${i+1}. ${x.title}</strong><small>${i>unlocked?'Bloqueada':x.goal}</small></button>`).join('')}</div>
   <div class="footer"><span id="ctClock">Tempo de operação: ${Math.floor(elapsed)}s</span><span>Mobiliza Educa • Central de Trânsito</span></div>
  </section>`;
  bind();sync();
 }
 function bind(){
  host.querySelector('#ctEW').onclick=()=>requestPhase('EW_GREEN');
  host.querySelector('#ctNS').onclick=()=>requestPhase('NS_GREEN');
  host.querySelector('#ctPed').onclick=()=>requestPed();
  host.querySelector('#ctAllRed').onclick=()=>setAllRed(4000,'Todos os fluxos parados');
  host.querySelectorAll('[data-speed]').forEach(b=>b.onclick=()=>{speedLimit=+b.dataset.speed;snd.switch();syncControls()});
  host.querySelector('#ctSound').onclick=()=>{sound=!sound;localStorage.setItem('mobiliza.central.sound',sound?'1':'0');if(sound)snd.switch();const b=host.querySelector('#ctSound');if(b)b.textContent=sound?'Som ligado':'Som desligado'};
  host.querySelector('#ctRestart').onclick=reset;
  host.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{const i=+b.dataset.m;if(i<=unlocked){mission=i;missionElapsed=0;crossed=0;ambulancePassed=false;ambulanceSpawned=false;rushStable=0;eventText='Missão iniciada';render()}});
 }
 function syncControls(){
  host.querySelectorAll('[data-speed]').forEach(b=>b.classList.toggle('active',+b.dataset.speed===speedLimit))
 }
 function sync(){
  const q=s=>host.querySelector(s);if(q('#ctSafety'))q('#ctSafety').textContent=safety+'%';if(q('#ctScore'))q('#ctScore').textContent=score;if(q('#ctMission'))q('#ctMission').textContent=(mission+1)+'/'+MISSIONS.length;if(q('#ctEvent'))q('#ctEvent').textContent=eventText;if(q('#ctClock'))q('#ctClock').textContent='Tempo de operação: '+Math.floor(elapsed)+'s';
  const p=q('#ctProgress');if(p){let pct=0;if(mission===0)pct=Math.min(100,crossed/4*100);else if(mission===1)pct=ambulancePassed?100:ambulanceSpawned?55:15;else pct=Math.min(100,rushStable/30*100);p.style.width=pct+'%'}
  const scene=q('#ctScene');if(scene){scene.querySelectorAll('.signal').forEach(el=>el.classList.remove('red','yellow','green'));scene.querySelectorAll('.sigN,.sigS').forEach(el=>el.classList.add(signalClass('NS')));scene.querySelectorAll('.sigW,.sigE').forEach(el=>el.classList.add(signalClass('EW')));scene.querySelectorAll('.pedLight').forEach(el=>{el.classList.toggle('go',pedGo());el.textContent=pedGo()?'GO':'■'})}
  syncObjects();
 }
 function syncObjects(){
  for(const v of vehicles){const el=host.querySelector('[data-v="'+v.id+'"]');if(el){el.style.left=v.x+'%';el.style.top=v.y+'%';el.style.filter=v.wait?'brightness(.82)':'none'}}
  for(const w of walkers){const el=host.querySelector('[data-w="'+w.id+'"]');if(el){el.style.left=w.x+'%';el.style.top=w.y+'%';el.classList.toggle('waiting',w.state==='WAIT')}}
  for(const c of cyclists){const el=host.querySelector('[data-cy="'+c.id+'"]');if(el){el.style.left=c.x+'%';el.style.top=c.y+'%'}}
  const obj=host.querySelector('#ctObjects');if(obj){
    const existing=new Set([...obj.children].map(x=>x.dataset.v||x.dataset.w||x.dataset.cy).filter(Boolean).map(String));
    for(const v of vehicles)if(!existing.has(String(v.id)))obj.insertAdjacentHTML('beforeend',carEl(v));
    for(const w of walkers)if(!existing.has(String(w.id)))obj.insertAdjacentHTML('beforeend',walkerEl(w));
    for(const c of cyclists)if(!existing.has(String(c.id)))obj.insertAdjacentHTML('beforeend',cyclistEl(c));
    [...obj.querySelectorAll('[data-v]')].forEach(el=>{if(!vehicles.some(v=>String(v.id)===el.dataset.v))el.remove()});
    [...obj.querySelectorAll('[data-w]')].forEach(el=>{if(!walkers.some(w=>String(w.id)===el.dataset.w))el.remove()});
    [...obj.querySelectorAll('[data-cy]')].forEach(el=>{if(!cyclists.some(c=>String(c.id)===el.dataset.cy))el.remove()});
  }
 }
 function requestPhase(target){
  if(phase===target)return;
  if(phase==='ALL_RED'&&performance.now()<allRedUntil)return;
  const current=phase.startsWith('EW')?'EW':phase.startsWith('NS')?'NS':null;
  const targetAxis=target.startsWith('EW')?'EW':'NS';
  if(current&&current!==targetAxis){
    phase=current+'_YELLOW';eventText='Atenção: transição do fluxo';snd.switch();setTimeout(()=>{phase='ALL_RED';allRedUntil=performance.now()+1100;eventText='Intervalo de segurança';setTimeout(()=>{phase=target;phaseChangedAt=performance.now();eventText='Fluxo liberado';snd.switch();sync()},1150);sync()},1800);
  }else{phase=target;phaseChangedAt=performance.now();eventText='Fluxo liberado';snd.switch()}
  sync();
 }
 function setAllRed(ms=3500,text='Todos os fluxos parados'){phase='ALL_RED';allRedUntil=performance.now()+ms;eventText=text;snd.switch();sync()}
 function requestPed(){
  if(pedGo())return;
  setAllRed(6500,'Travessia de pedestres liberada');pedRequested=true;
 }
 function spawnVehicle(axis,dir,kind='car'){
   const col=COLORS[Math.floor(Math.random()*COLORS.length)],v={id:id++,axis,dir,kind,colors:col,x:0,y:0,speed:(speedLimit===30?.007:.009)*(kind==='ambulance'?1.25:.85+Math.random()*.25),wait:false};
   if(axis==='H'){v.y=dir===1?43.5:55.5;v.x=dir===1?-8:108}else{v.x=dir===1?44.3:55.5;v.y=dir===1?-9:109}
   vehicles.push(v);
 }
 function spawnWalker(){
   const south=Math.random()>.5;walkers.push({id:id++,x:south?35.3:61.5,y:south?71:27.8,state:'WAIT',dir:south?-1:1,shirt:['#2770a2','#c94c52','#e0a531','#5b7c44'][Math.floor(Math.random()*4)],skin:['#d9a675','#9f6b4e','#e3b58b'][Math.floor(Math.random()*3)]});
 }
 function spawnCyclist(){cyclists.push({id:id++,x:-6,y:69+Math.random()*5,dir:1,speed:.0065})}
 function canMove(v){
  if(v.kind==='ambulance'&&mission===1){
    if(v.axis==='H')return phase==='EW_GREEN'||(v.x<34||v.x>65);
  }
  if(v.axis==='H'){
    if(v.dir===1&&v.x>27&&v.x<35)return phase==='EW_GREEN';
    if(v.dir===-1&&v.x<70&&v.x>62)return phase==='EW_GREEN';
    return true;
  }else{
    if(v.dir===1&&v.y>25&&v.y<36)return phase==='NS_GREEN';
    if(v.dir===-1&&v.y<73&&v.y>63)return phase==='NS_GREEN';
    return true;
  }
 }
 function gapBlocked(v){
   for(const o of vehicles){if(o===v||o.axis!==v.axis||o.dir!==v.dir)continue;const d=v.axis==='H'?(o.x-v.x)*v.dir:(o.y-v.y)*v.dir;if(d>0&&d<7)return true}
   return false;
 }
 function stepVehicles(dt){
  for(const v of vehicles){
    const go=canMove(v)&&!gapBlocked(v);v.wait=!go;if(!go)continue;
    const sp=v.speed*dt*(mission===2?1.2:1);
    if(v.axis==='H')v.x+=sp*v.dir;else v.y+=sp*v.dir;
    if(v.kind==='ambulance'&&v.x>105){ambulancePassed=true;score+=1500;eventText='Ambulância liberada com segurança';snd.ok();completeMission()}
  }
  vehicles=vehicles.filter(v=>v.x>-14&&v.x<114&&v.y>-14&&v.y<114);
 }
 function stepWalkers(dt){
  const go=pedGo();
  for(const w of walkers){
    if(w.state==='WAIT'&&go)w.state='CROSS';
    if(w.state==='CROSS'){w.y+=w.dir*.0072*dt;if((w.dir<0&&w.y<28)||(w.dir>0&&w.y>72)){w.state='DONE';crossed++;score+=250;eventText='Travessia concluída com segurança';snd.ok();if(mission===0&&crossed>=4)completeMission()}}
  }
  walkers=walkers.filter(w=>w.state!=='DONE');
 }
 function stepCyclists(dt){for(const c of cyclists)c.x+=c.speed*dt;cyclists=cyclists.filter(c=>c.x<110)}
 function collisionCheck(){
   // Conservative conflict detector at the core: mixed moving axes while not all-red.
   const h=vehicles.some(v=>v.axis==='H'&&!v.wait&&v.x>38&&v.x<62&&v.y>38&&v.y<62);
   const v=vehicles.some(o=>o.axis==='V'&&!o.wait&&o.x>38&&o.x<62&&o.y>38&&o.y<62);
   if(h&&v){incident('Conflito no cruzamento — fluxos incompatíveis!');}
   if(pedGo()){
     const car=vehicles.some(vh=>!vh.wait&&vh.x>34&&vh.x<66&&vh.y>32&&vh.y<68);
     if(car)incident('Veículo entrou na área de travessia durante a fase de pedestres.');
   }
 }
 let incidentCooldown=0;
 function incident(msg){
  const now=performance.now();if(now<incidentCooldown)return;incidentCooldown=now+3500;incidents++;safety=Math.max(0,safety-20);score=Math.max(0,score-400);eventText=msg;snd.bad();toast('Atenção',msg,false);if(safety<=0){running=false;setTimeout(summary,1000)}
 }
 function toast(title,msg,ok=true){
  const scene=host.querySelector('#ctScene');if(!scene)return;scene.querySelector('.toast')?.remove();const d=document.createElement('div');d.className='toast '+(ok?'ok':'bad');d.innerHTML='<h4>'+title+'</h4><p>'+msg+'</p>';scene.appendChild(d);setTimeout(()=>d.remove(),2200)
 }
 function completeMission(){
  if(missionDone.has(mission))return;missionDone.add(mission);score+=1000;snd.finish();toast('Missão concluída',MISSIONS[mission].title,true);unlocked=Math.max(unlocked,Math.min(MISSIONS.length-1,mission+1));setTimeout(()=>{if(mission<MISSIONS.length-1){mission++;missionElapsed=0;crossed=0;ambulancePassed=false;ambulanceSpawned=false;rushStable=0;eventText='Nova missão iniciada';render()}else summary()},2400)
 }
 function missionLogic(dt){
  missionElapsed+=dt/1000;
  if(mission===0){
    if(walkers.length<4&&missionElapsed<9&&pedSpawnTimer<=0){spawnWalker();pedSpawnTimer=1.2}
    if(missionElapsed>3&&crossed===0)eventText='Pedestres aguardando a travessia';
  }else if(mission===1){
    if(!ambulanceSpawned&&missionElapsed>3){spawnVehicle('H',1,'ambulance');ambulanceSpawned=true;eventText='EMERGÊNCIA: ambulância se aproxima';snd.siren()}
    if(ambulanceSpawned&&!ambulancePassed&&missionElapsed>5)eventText='Abra o corredor na avenida principal';
  }else{
    rushStable+=dt/1000;if(rushStable>=30&&incidents===0)completeMission();else if(rushStable>=30)completeMission();
    if(missionElapsed<4)eventText='Hora de pico: fluxo aumentado';
  }
 }
 function spawnLogic(dt){
   spawnTimer-=dt/1000;pedSpawnTimer-=dt/1000;eventTimer-=dt/1000;
   if(spawnTimer<=0){
     const axis=Math.random()<.62?'H':'V',dir=Math.random()<.5?1:-1;spawnVehicle(axis,dir);if(mission===2&&Math.random()<.45)spawnVehicle(axis,dir);spawnTimer=mission===2?.9+Math.random()*1.2:1.6+Math.random()*1.8;
   }
   if(Math.random()<.002*dt/16&&cyclists.length<2)spawnCyclist();
 }
 function tick(t){
  if(!running)return;const dt=Math.min(40,t-last||16);last=t;elapsed+=dt/1000;missionLogic(dt);spawnLogic(dt);stepVehicles(dt);stepWalkers(dt);stepCyclists(dt);collisionCheck();sync();raf=requestAnimationFrame(tick)
 }
 function reset(){
  cancelAnimationFrame(raf);running=true;last=0;score=0;safety=100;mission=0;unlocked=0;missionDone=new Set();elapsed=0;missionElapsed=0;crossed=0;ambulancePassed=false;incidents=0;speedLimit=30;phase='EW_GREEN';phaseChangedAt=performance.now();pedRequested=false;allRedUntil=0;eventText='Fluxo normal';vehicles=[];walkers=[];cyclists=[];eventTimer=0;spawnTimer=0;pedSpawnTimer=0;ambulanceSpawned=false;rushStable=0;render();raf=requestAnimationFrame(tick)
 }
 function summary(){
  running=false;cancelAnimationFrame(raf);saveGlobal(score,missionDone.size,MISSIONS.length);onFinish?.();host.innerHTML=`<section class="ct" style="grid-template-rows:auto 1fr"><div class="header"><div class="brand"><small>CENTRAL DE TRÂNSITO • RESULTADO</small><h2>Operação encerrada</h2><p>Você controlou uma interseção com veículos, pedestres e eventos em tempo real.</p></div></div><div style="display:grid;place-items:center;padding:20px"><div style="width:min(720px,92%);padding:22px;border:1px solid rgba(255,255,255,.15);border-radius:20px;background:#102938;text-align:center"><div style="font-size:2rem">🚦</div><h2 style="margin:8px 0">${missionDone.size===MISSIONS.length?'Todas as missões concluídas!':'Fim da operação'}</h2><p style="color:#bcd1dc;font-size:.62rem">Segurança final: <b>${safety}%</b> • Pontos: <b>${score}</b> • Incidentes: <b>${incidents}</b></p><div style="display:flex;gap:8px;justify-content:center;margin-top:14px"><button class="btn primary" id="ctAgain">Jogar novamente</button><button class="btn ghost" id="ctClose">Encerrar</button></div></div></div></section>`;host.querySelector('#ctAgain').onclick=reset;host.querySelector('#ctClose').onclick=()=>dialog.close();
 }
 const onClose=()=>{running=false;cancelAnimationFrame(raf);dialog.classList.remove('central-transito-dialog');dialog.removeEventListener('close',onClose)};
 dialog.addEventListener('close',onClose);
 reset();if(!dialog.open)dialog.showModal();
}
