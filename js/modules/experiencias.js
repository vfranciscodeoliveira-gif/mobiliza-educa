import { SoundManager } from '../core/soundManager.js?v=1';
const MEMORY_BASE='assets/memory/';
const ARR_ITEMS=[
 {id:'capacete',label:'Capacete',img:MEMORY_BASE+'capacete.svg',target:'moto'},
 {id:'cinto',label:'Cinto de segurança',img:MEMORY_BASE+'cinto.svg',target:'carro'},
 {id:'faixa',label:'Faixa de pedestres',img:MEMORY_BASE+'faixa.svg',target:'pedestre'},
 {id:'bicicleta',label:'Bicicleta',img:MEMORY_BASE+'bicicleta.svg',target:'bike'}
];
const TARGETS=[
 {id:'moto',icon:'🏍️',title:'Motociclista',text:'Qual proteção combina com esta situação?'},
 {id:'carro',icon:'🚗',title:'Passageiro do carro',text:'Qual proteção deve acompanhar a viagem?'},
 {id:'pedestre',icon:'🚶',title:'Travessia',text:'Qual elemento organiza a travessia?'},
 {id:'bike',icon:'🚲',title:'Ciclista',text:'Qual item pertence a este modo de deslocamento?'}
];
const MYTHS=[
 {q:'Usar o celular enquanto dirige divide a atenção e reduz o tempo disponível para reagir.',a:true,why:'A condução exige atenção contínua. Desviar os olhos ou a mente da via reduz a percepção do que muda ao redor.'},
 {q:'A seta, sozinha, garante que o condutor já pode mudar de faixa.',a:false,why:'A seta comunica intenção. Ainda é necessário verificar espelhos, ponto cego e se há espaço seguro.'},
 {q:'Na chuva, aumentar a distância do veículo da frente ajuda a compensar a menor aderência.',a:true,why:'Piso molhado pode aumentar a distância necessária para reduzir a velocidade ou parar.'},
 {q:'Dirigir muito próximo do veículo da frente economiza tempo sem aumentar o risco.',a:false,why:'A menor distância reduz a margem para perceber, reagir e frear diante de uma mudança inesperada.'},
 {q:'Um capacete corretamente ajustado e afivelado oferece proteção melhor do que um capacete solto.',a:true,why:'O equipamento precisa permanecer corretamente posicionado para cumprir sua função de proteção.'},
 {q:'Se um pedestre está na calçada, o motorista sempre consegue vê-lo com facilidade.',a:false,why:'Veículos, postes, chuva, iluminação e pontos cegos podem reduzir a visibilidade. Antecipar essa possibilidade é parte da direção preventiva.'}
];
const PERCEPTION_SET=[
 {id:'semaforo',label:'Semáforo',img:MEMORY_BASE+'semaforo.svg'},
 {id:'pedestre',label:'Pedestre',img:MEMORY_BASE+'pedestre.svg'},
 {id:'celular',label:'Celular',img:MEMORY_BASE+'celular.svg'},
 {id:'escola',label:'Área escolar',img:MEMORY_BASE+'escola.svg'},
 {id:'velocidade',label:'Limite de velocidade',img:MEMORY_BASE+'velocidade.svg'},
 {id:'cinto',label:'Cinto',img:MEMORY_BASE+'cinto.svg'}
];
const SAFETY_STEPS=[
 {icon:'📱',title:'1. Distração também é tempo perdido',text:'Quando a atenção sai da via, você perde segundos de leitura do ambiente. Em deslocamentos a trabalho, uma mensagem pode esperar; uma situação de trânsito, não.'},
 {icon:'📏',title:'2. Espaço é margem de segurança',text:'Manter distância ajuda a absorver imprevistos sem transformar uma mudança de velocidade em frenagem brusca ou colisão.'},
 {icon:'🧠',title:'3. Pressa muda decisões',text:'A sensação de urgência pode incentivar aproximação excessiva, velocidade incompatível e escolhas impulsivas. Planejar o deslocamento reduz essa pressão.'}
];

function css(){
 if(document.getElementById('aud-exp-v42'))return;
 const s=document.createElement('style');s.id='aud-exp-v42';
 s.textContent=`
 #gameDialog.aud-exp{width:min(1120px,96vw)!important;max-width:96vw!important;max-height:94vh!important}
 #gameDialog.aud-exp>.dialog-shell{max-height:94vh!important;overflow:auto!important;background:#f3f8fb!important}
 .ax{padding:28px;color:#173f60;min-height:560px}.ax *{box-sizing:border-box}.ax h2,.ax h3{color:#0f3c66}.ax .ax-head{padding:20px;border-radius:18px;background:linear-gradient(135deg,#0f3c66,#1677a7);color:#fff;margin-bottom:16px}.ax .ax-head .eyebrow{color:#bceeff}.ax .ax-head h2{color:#fff;margin:4px 0 6px}.ax .ax-head p{margin:0;color:#e0f4fb;line-height:1.5}.ax .ax-stats{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.ax .ax-chip{padding:6px 9px;border-radius:999px;background:rgba(255,255,255,.13);border:1px solid rgba(255,255,255,.2);font-size:.78rem;font-weight:800}
 .ax .ax-grid{display:grid;grid-template-columns:1fr 1fr;gap:14px}.ax .ax-card{background:#fff;border:1px solid #dce8f1;border-radius:16px;padding:16px;box-shadow:0 8px 24px rgba(15,60,102,.07)}.ax .ax-card h3{margin:0 0 6px}.ax .ax-card p{margin:0;color:#607286;line-height:1.45}
 .ax .drag-items{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin:16px 0}.ax .drag-item{border:2px solid #d9e6ef;background:#fff;border-radius:14px;padding:10px;cursor:grab;text-align:center;min-height:112px;transition:.18s}.ax .drag-item:hover,.ax .drag-item.selected{border-color:#1782b7;transform:translateY(-2px);box-shadow:0 8px 18px rgba(21,90,138,.13)}.ax .drag-item img{width:58px;height:58px;object-fit:contain}.ax .drag-item strong{display:block;font-size:.82rem;margin-top:4px}.ax .drag-item.done{opacity:.35;pointer-events:none;filter:grayscale(1)}
 .ax .drop-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}.ax .drop{min-height:125px;border:2px dashed #b9cedb;border-radius:16px;background:#f9fcfe;padding:14px;cursor:pointer;transition:.18s}.ax .drop:hover{border-color:#45a7cf}.ax .drop.hit{border-style:solid;border-color:#39a86b;background:#edf9f2}.ax .drop .big{font-size:1.7rem}.ax .drop strong{display:block;margin-top:5px}.ax .drop small{display:block;margin-top:3px;color:#718594}
 .ax .feedback{margin-top:12px;padding:12px;border-radius:12px;background:#eef6fb;color:#31536b;font-weight:700}.ax .feedback.ok{background:#eaf7ef;color:#17643a}.ax .feedback.bad{background:#fff0ef;color:#8c302d}
 .ax .perception-stage{position:relative;min-height:360px;border-radius:18px;overflow:hidden;background:linear-gradient(145deg,#0d2f4c,#0f5277 58%,#1785a7);display:grid;place-items:center;padding:30px}.ax .perception-stage:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 50% 42%,rgba(255,255,255,.12),transparent 38%),linear-gradient(90deg,transparent 0 49%,rgba(255,255,255,.04) 50% 51%,transparent 52%);pointer-events:none}.ax .scene-icons{position:relative;z-index:2;display:grid;grid-template-columns:repeat(3,120px);gap:24px}.ax .scene-icon{height:120px;border-radius:18px;background:#fff;display:grid;place-items:center;padding:10px;box-shadow:0 14px 30px rgba(0,0,0,.22)}.ax .scene-icon img{max-width:82px;max-height:82px}.ax .scene-icon small{font-size:.68rem;color:#385a70;font-weight:800}.ax .countdown{position:absolute;right:18px;top:18px;z-index:3;width:54px;height:54px;border-radius:50%;display:grid;place-items:center;background:#f4b740;color:#102033;font-size:1.25rem;font-weight:1000;border:4px solid #fff}.ax .curtain{position:absolute;inset:0;z-index:4;display:grid;place-items:center;background:#0d2942;color:#fff;text-align:center;padding:25px}.ax .curtain h3{color:#fff;font-size:1.5rem;margin:0}.ax .curtain p{color:#cde5f2}
 .ax .answer-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:14px}.ax .answer{border:2px solid #dce8f1;border-radius:14px;background:#fff;padding:10px;cursor:pointer;display:grid;grid-template-columns:48px 1fr;gap:8px;align-items:center;text-align:left}.ax .answer img{width:44px;height:44px}.ax .answer.chosen{border-color:#155a8a;background:#eef6fb}.ax .answer.correct{border-color:#39a86b;background:#edf9f2}.ax .answer.wrong{border-color:#d64a4a;background:#fff0ef}
 .ax .myth{max-width:760px;margin:0 auto}.ax .myth-card{padding:28px;border-radius:18px;background:#fff;border:1px solid #dce8f1;box-shadow:0 12px 32px rgba(15,60,102,.08)}.ax .myth-card h3{font-size:1.35rem;line-height:1.4}.ax .tf{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:18px}.ax .tf button{min-height:70px;border:2px solid #dce8f1;border-radius:14px;background:#fff;color:#0f3c66;font-weight:900;cursor:pointer;font-size:1.05rem}.ax .tf button:hover{border-color:#155a8a;background:#eef6fb}.ax .myth-explain{margin-top:14px;padding:14px;border-radius:12px;background:#eef6fb;color:#385468;line-height:1.5}
 .ax .safety-step{display:grid;grid-template-columns:70px 1fr;gap:14px;align-items:start;padding:18px;border-radius:16px;background:#fff;border:1px solid #dce8f1;margin-bottom:10px}.ax .safety-step .ico{width:64px;height:64px;border-radius:18px;display:grid;place-items:center;background:#eaf4fb;font-size:2rem}.ax .safety-step h3{margin:0 0 6px}.ax .safety-step p{margin:0;color:#607286;line-height:1.5}.ax .quiz-mini{margin-top:16px}.ax .quiz-mini button{width:100%;text-align:left;padding:13px;border:1px solid #dce8f1;background:#fff;border-radius:11px;margin:5px 0;cursor:pointer}.ax .quiz-mini button:hover{border-color:#155a8a}.ax .complete{padding:22px;border-radius:18px;background:linear-gradient(135deg,#eaf7ef,#fff);border:1px solid #b8dfc7;text-align:center}.ax .complete .big{font-size:2.4rem}.ax .complete h3{margin:5px 0}.ax .complete p{color:#5d7566}
 .ax .ax-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:16px}
 @media(max-width:760px){#gameDialog.aud-exp{width:100vw!important;max-width:100vw!important;height:100dvh!important;max-height:100dvh!important;margin:0!important;border-radius:0!important}.ax{padding:16px;min-height:100dvh}.ax .ax-grid{grid-template-columns:1fr}.ax .drag-items{grid-template-columns:repeat(2,1fr)}.ax .drop-grid{grid-template-columns:1fr}.ax .scene-icons{grid-template-columns:repeat(2,100px);gap:14px}.ax .scene-icon{height:100px}.ax .answer-grid{grid-template-columns:1fr 1fr}.ax .tf{grid-template-columns:1fr}.ax .safety-step{grid-template-columns:50px 1fr}.ax .safety-step .ico{width:48px;height:48px;font-size:1.5rem}}
 `;document.head.appendChild(s);
}
function addResult(score,correct,answers){
 const s=JSON.parse(localStorage.getItem('mobiliza.results')||'{"games":0,"correct":0,"answers":0,"best":0,"streak":0}');
 s.games=(s.games||0)+1;s.correct=(s.correct||0)+correct;s.answers=(s.answers||0)+answers;s.best=Math.max(s.best||0,score);
 localStorage.setItem('mobiliza.results',JSON.stringify(s));
}
function head(title,subtitle,badges=''){
 return `<div class="ax-head"><p class="eyebrow">MOBILIZA EDUCA • EXPERIÊNCIA RÁPIDA</p><h2>${title}</h2><p>${subtitle}</p>${badges?'<div class="ax-stats">'+badges+'</div>':''}</div>`;
}
function end(dialog,host,onFinish,title,score,text){
 SoundManager.play('finish');addResult(score,1,1);onFinish?.();host.innerHTML=`<section class="ax">${head(title,'Experiência concluída.')}<div class="complete"><div class="big">🏆</div><h3>Concluído!</h3><p>${text}</p><strong>${score} pontos</strong><div class="ax-actions"><button class="btn primary" id="axAgain">Jogar novamente</button><button class="btn ghost" id="axClose">Encerrar</button></div></div></section>`;host.querySelector('#axAgain').onclick=()=>openExperience(dialog,host,dialog.dataset.experience,onFinish);host.querySelector('#axClose').onclick=()=>dialog.close();
}
function arraste(dialog,host,onFinish){
 let selected=null,done=new Set(),score=0,moves=0;
 function render(){
  host.innerHTML=`<section class="ax">${head('Arraste para o lugar certo','Associe cada elemento à situação correspondente. No celular, toque primeiro no item e depois no destino.',`<span class="ax-chip">🧩 4 associações</span><span class="ax-chip">⭐ <b id="axScore">${score}</b> pts</span>`)}
   <div class="drag-items">${ARR_ITEMS.map(x=>`<button class="drag-item ${done.has(x.id)?'done':''} ${selected===x.id?'selected':''}" draggable="true" data-item="${x.id}"><img src="${x.img}" alt=""><strong>${x.label}</strong></button>`).join('')}</div>
   <div class="drop-grid">${TARGETS.map(t=>`<div class="drop ${[...done].some(id=>ARR_ITEMS.find(x=>x.id===id)?.target===t.id)?'hit':''}" data-target="${t.id}"><div class="big">${t.icon}</div><strong>${t.title}</strong><small>${t.text}</small></div>`).join('')}</div>
   <div class="feedback" id="axFeedback">Escolha um item e encontre o lugar certo.</div></section>`;
  bind();
 }
 function bind(){
  host.querySelectorAll('[data-item]').forEach(b=>{
   b.onclick=()=>{if(done.has(b.dataset.item))return;selected=b.dataset.item;render()};
   b.ondragstart=e=>{selected=b.dataset.item;e.dataTransfer.setData('text/plain',selected)};
  });
  host.querySelectorAll('[data-target]').forEach(d=>{
   d.ondragover=e=>e.preventDefault();d.ondrop=e=>{e.preventDefault();selected=e.dataTransfer.getData('text/plain')||selected;check(d.dataset.target)};
   d.onclick=()=>{if(selected)check(d.dataset.target)};
  });
 }
 function check(target){
  const item=ARR_ITEMS.find(x=>x.id===selected);if(!item)return;moves++;
  if(item.target===target){SoundManager.play('correct');done.add(item.id);score+=250;const msg=item.id==='capacete'?'Capacete e motociclista: proteção adequada faz parte da condução segura.':item.id==='cinto'?'O cinto acompanha todos os ocupantes do veículo.':item.id==='faixa'?'A faixa organiza a travessia e chama atenção para a presença do pedestre.':'A bicicleta é um modo de deslocamento e precisa de espaço e respeito.';selected=null;render();const f=host.querySelector('#axFeedback');if(f){f.className='feedback ok';f.textContent='✓ '+msg}if(done.size===ARR_ITEMS.length)setTimeout(()=>end(dialog,host,onFinish,'Arraste para o lugar certo',score,'Você completou todas as associações.'),850)}
  else{SoundManager.play('wrong');score=Math.max(0,score-25);const wrong=item.label;selected=null;render();const f=host.querySelector('#axFeedback');if(f){f.className='feedback bad';f.textContent='Ainda não. Pense onde '+wrong.toLowerCase()+' faz mais sentido.'}}
 }
 render();
}
function percepcao(dialog,host,onFinish){
 let shown=PERCEPTION_SET.slice(0,4),chosen=new Set(),time=5,score=0,timer=null;
 host.innerHTML=`<section class="ax">${head('Teste sua percepção','Você terá poucos segundos para observar. Depois, a cena desaparece e você precisa lembrar o que estava presente.',`<span class="ax-chip">👁️ Observe</span><span class="ax-chip">⏱ 5 segundos</span>`)}<div class="perception-stage"><div class="countdown" id="pTime">5</div><div class="scene-icons">${shown.map(x=>`<div class="scene-icon"><img src="${x.img}" alt=""><small>${x.label}</small></div>`).join('')}</div><div class="curtain" id="curtain" style="display:none"><div><h3>O que você viu?</h3><p>Selecione os quatro elementos que estavam na cena.</p></div></div></div><div id="answers"></div></section>`;
 SoundManager.play('open');timer=setInterval(()=>{time--;const el=host.querySelector('#pTime');if(el)el.textContent=time;if(time<=0){clearInterval(timer);const c=host.querySelector('#curtain');if(c)c.style.display='grid';setTimeout(showAnswers,650)}},1000);
 function showAnswers(){
  const stage=host.querySelector('.perception-stage');if(stage)stage.style.display='none';
  const options=[...PERCEPTION_SET].sort(()=>Math.random()-.5);
  const a=host.querySelector('#answers');a.innerHTML=`<div class="ax-card"><h3>Marque os quatro elementos presentes</h3><p>Você não precisa responder correndo. O objetivo é perceber quanto da cena ficou na memória.</p><div class="answer-grid">${options.map(x=>`<button class="answer" data-a="${x.id}"><img src="${x.img}" alt=""><strong>${x.label}</strong></button>`).join('')}</div><div class="ax-actions"><button class="btn primary" id="checkP">Conferir</button></div></div>`;
  a.querySelectorAll('[data-a]').forEach(b=>b.onclick=()=>{if(chosen.has(b.dataset.a))chosen.delete(b.dataset.a);else if(chosen.size<4)chosen.add(b.dataset.a);b.classList.toggle('chosen')});
  a.querySelector('#checkP').onclick=()=>{let hits=0;a.querySelectorAll('[data-a]').forEach(b=>{const correct=shown.some(x=>x.id===b.dataset.a),sel=chosen.has(b.dataset.a);if(sel&&correct){hits++;b.classList.add('correct')}else if(sel&&!correct)b.classList.add('wrong')});score=hits*250;SoundManager.play(hits>=3?'correct':'wrong');setTimeout(()=>end(dialog,host,onFinish,'Teste sua percepção',score,`Você reconheceu ${hits} de 4 elementos. Percepção melhora quando observamos a cena inteira, não apenas um ponto.`),1000)};
 }
}
function mito(dialog,host,onFinish){
 let i=0,score=0,correct=0;
 function render(explain=''){
  const m=MYTHS[i];host.innerHTML=`<section class="ax">${head('Mito ou Verdade?','Afirmações rápidas para revisar hábitos e corrigir ideias comuns sobre segurança no trânsito.',`<span class="ax-chip">${i+1}/${MYTHS.length}</span><span class="ax-chip">⭐ ${score} pts</span>`)}<div class="myth"><div class="myth-card"><p class="eyebrow">AFIRMAÇÃO ${i+1}</p><h3>${m.q}</h3>${explain?'<div class="myth-explain">'+explain+'</div>':`<div class="tf"><button data-v="true">✓ VERDADE</button><button data-v="false">✕ MITO</button></div>`}</div></div></section>`;
  if(!explain)host.querySelectorAll('[data-v]').forEach(b=>b.onclick=()=>answer(b.dataset.v==='true'));
 }
 function answer(v){const m=MYTHS[i],ok=v===m.a;SoundManager.play(ok?'correct':'wrong');if(ok){score+=200;correct++}render(`<strong>${ok?'✓ Resposta correta.':'Resposta diferente da esperada.'}</strong><br>${m.why}<div class="ax-actions"><button class="btn primary" id="nextM">${i===MYTHS.length-1?'Ver resultado':'Próxima'}</button></div>`);host.querySelector('#nextM').onclick=()=>{if(i===MYTHS.length-1){addResult(score,correct,MYTHS.length);onFinish?.();host.innerHTML=`<section class="ax">${head('Mito ou Verdade?','Resultado final')}<div class="complete"><div class="big">⚖️</div><h3>${correct} de ${MYTHS.length}</h3><p>O mais importante é levar as explicações para as decisões do dia a dia.</p><strong>${score} pontos</strong><div class="ax-actions"><button class="btn primary" id="againM">Refazer</button><button class="btn ghost" id="closeM">Encerrar</button></div></div></section>`;host.querySelector('#againM').onclick=()=>mito(dialog,host,onFinish);host.querySelector('#closeM').onclick=()=>dialog.close()}else{i++;render()}};
 }
 render();
}
function empresa(dialog,host,onFinish){
 let step=0,quiz=false,score=0;
 function render(){
  if(step<SAFETY_STEPS.length){const s=SAFETY_STEPS[step];host.innerHTML=`<section class="ax">${head('Pausa de Segurança','Microtreinamento para equipes e deslocamentos a trabalho.',`<span class="ax-chip">💼 Etapa ${step+1}/3</span><span class="ax-chip">⏱ 3–5 min</span>`)}<div class="safety-step"><div class="ico">${s.icon}</div><div><h3>${s.title}</h3><p>${s.text}</p></div></div><div class="ax-actions"><button class="btn primary" id="nextS">${step===2?'Ir para a checagem':'Continuar'}</button></div></section>`;host.querySelector('#nextS').onclick=()=>{SoundManager.play('next');step++;render()};return}
  if(!quiz){quiz=true;host.innerHTML=`<section class="ax">${head('Pausa de Segurança','Checagem final de compreensão')}<div class="ax-card quiz-mini"><h3>Qual atitude amplia a margem de segurança em um deslocamento a trabalho?</h3><button data-q="0">Responder mensagens rapidamente enquanto o veículo está em movimento.</button><button data-q="1">Manter distância, reduzir distrações e evitar decisões guiadas pela pressa.</button><button data-q="0">Aproximar-se do veículo da frente para impedir que outros entrem na faixa.</button></div><div class="feedback" id="sf">Escolha a alternativa mais segura.</div></section>`;host.querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>{const ok=b.dataset.q==='1';SoundManager.play(ok?'correct':'wrong');const f=host.querySelector('#sf');f.className='feedback '+(ok?'ok':'bad');f.innerHTML=ok?'✓ Isso reúne os três pontos desta pausa.<div class="ax-actions"><button class="btn primary" id="finishS">Concluir</button></div>':'Revise: distração, pouca distância e pressa reduzem a margem de segurança.';if(ok){score=1000;host.querySelector('#finishS').onclick=()=>{localStorage.setItem('mobiliza.pausa-seguranca.last',new Date().toISOString());end(dialog,host,onFinish,'Pausa de Segurança',score,'Treinamento concluído e registrado neste dispositivo.')}}});}
 }
 render();
}
export function openExperience(dialog,host,id,onFinish){
 css();SoundManager.play('open');dialog.classList.add('aud-exp');dialog.dataset.experience=id;
 const close=()=>{dialog.classList.remove('aud-exp');dialog.removeEventListener('close',close)};dialog.addEventListener('close',close);
 if(id==='arraste')arraste(dialog,host,onFinish);
 else if(id==='percepcao')percepcao(dialog,host,onFinish);
 else if(id==='mito-verdade')mito(dialog,host,onFinish);
 else if(id==='empresa-rapido')empresa(dialog,host,onFinish);
 else host.innerHTML=`<section class="ax">${head('Em preparação','Esta experiência ainda está em planejamento.')}</section>`;
 if(!dialog.open)dialog.showModal();
}
