const events=[
{t:'Faixa de pedestres',m:'Você respeitou a travessia. Avance 2 casas!',d:2},
{t:'Celular ao volante',m:'Distração detectada. Volte 2 casas.',d:-2},
{t:'Cinto de segurança',m:'Boa atitude! Avance 1 casa.',d:1},
{t:'Excesso de velocidade',m:'Risco aumentado. Volte 3 casas.',d:-3},
{t:'Ciclista respeitado',m:'Convivência segura! Avance 2 casas.',d:2},
{t:'Semáforo amarelo',m:'Atenção e prudência. Avance 1 casa.',d:1}
];
const questions=[
{q:'Antes de atravessar, o pedestre deve observar os dois sentidos?',ok:true},
{q:'É seguro usar celular enquanto dirige?',ok:false},
{q:'O cinto deve ser usado também no banco traseiro?',ok:true},
{q:'Em área escolar é importante reduzir a velocidade?',ok:true}
];
function saveResult(score){const s=JSON.parse(localStorage.getItem('mobiliza.results')||'{"games":0,"correct":0,"answers":0,"best":0,"streak":0}');s.games=(s.games||0)+1;s.best=Math.max(s.best||0,score);localStorage.setItem('mobiliza.results',JSON.stringify(s));}
export function openTrilha(dialog,host,onFinish){
 let players=[{name:'Azul',pos:0,icon:'🔵'},{name:'Amarelo',pos:0,icon:'🟡'}],turn=0,rolls=0;
 const total=24;
 const drawBoard=()=>Array.from({length:total},(_,i)=>{const here=players.filter(p=>p.pos===i);return `<div class="trail-cell ${i===0?'start':''} ${i===total-1?'finish':''}" data-cell="${i}"><span>${i===0?'INÍCIO':i===total-1?'CHEGADA':i+1}</span><b>${here.map(p=>p.icon).join(' ')}</b></div>`;}).join('');
 const render=()=>{host.innerHTML=`<section class="game trail-game"><div class="game-cover game-cover-trilha"></div><div class="trail-head"><div><p class="eyebrow">TRILHA DO TRÂNSITO</p><h2>Vez de ${players[turn].icon} ${players[turn].name}</h2></div><div class="dice-box" id="dice">🎲</div></div><div class="trail-board" id="trailBoard">${drawBoard()}</div><div class="trail-controls"><button class="btn primary big" id="rollDice">🎲 Jogar dado</button><span>Rodadas: ${rolls}</span></div><div id="trailMessage"></div></section>`;host.querySelector('#rollDice').onclick=roll;};
 const move=async(n)=>{const p=players[turn],start=p.pos,target=Math.min(total-1,Math.max(0,start+n));const step=target>=start?1:-1;for(let x=start+step;step>0?x<=target:x>=target;x+=step){p.pos=x;host.querySelectorAll('.trail-cell b').forEach(b=>b.textContent='');players.forEach(pp=>{const b=host.querySelector(`[data-cell="${pp.pos}"] b`);if(b)b.textContent+=(b.textContent?' ':'')+pp.icon;});await new Promise(r=>setTimeout(r,180));}if(p.pos>=total-1){finish(p);return true;}return false;};
 const roll=async()=>{const btn=host.querySelector('#rollDice');btn.disabled=true;const d=host.querySelector('#dice');for(let k=0;k<8;k++){d.textContent=['⚀','⚁','⚂','⚃','⚄','⚅'][Math.floor(Math.random()*6)];await new Promise(r=>setTimeout(r,70));}const value=Math.floor(Math.random()*6)+1;d.textContent=['⚀','⚁','⚂','⚃','⚄','⚅'][value-1];rolls++;if(await move(value))return;const p=players[turn];if(p.pos>0&&p.pos<total-1&&p.pos%5===0){const ev=events[Math.floor(Math.random()*events.length)];host.querySelector('#trailMessage').innerHTML=`<div class="quiz-feedback"><strong>${ev.t}</strong><p>${ev.m}</p></div>`;await new Promise(r=>setTimeout(r,650));if(await move(ev.d))return;}else if(p.pos%4===0){const q=questions[Math.floor(Math.random()*questions.length)],ans=confirm(q.q);host.querySelector('#trailMessage').innerHTML=`<div class="quiz-feedback"><strong>${ans===q.ok?'✅ Acertou!':'💡 Resposta educativa'}</strong><p>${q.q}</p></div>`;if(ans===q.ok)await move(1);}turn=(turn+1)%players.length;setTimeout(render,500);};
 const finish=p=>{saveResult(Math.max(0,1000-rolls*10));onFinish?.();host.innerHTML=`<section class="game trail-result"><div class="result-trophy">🏁</div><h2>${p.icon} ${p.name} chegou primeiro!</h2><p>Partida concluída em ${rolls} rodadas.</p><button class="btn primary" id="trailAgain">Jogar novamente</button></section>`;host.querySelector('#trailAgain').onclick=()=>openTrilha(dialog,host,onFinish);};
 render();if(!dialog.open)dialog.showModal();
}