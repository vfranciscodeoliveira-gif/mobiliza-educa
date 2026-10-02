const events=[
{t:'Faixa de pedestres',m:'Você respeitou a travessia. Avance 2 casas!',d:2,icon:'🚶'},
{t:'Celular ao volante',m:'Distração detectada. Volte 2 casas.',d:-2,icon:'📵'},
{t:'Cinto de segurança',m:'Boa atitude! Avance 1 casa.',d:1,icon:'🛡️'},
{t:'Excesso de velocidade',m:'Risco aumentado. Volte 3 casas.',d:-3,icon:'⚠️'},
{t:'Ciclista respeitado',m:'Convivência segura! Avance 2 casas.',d:2,icon:'🚲'},
{t:'Semáforo amarelo',m:'Atenção e prudência. Avance 1 casa.',d:1,icon:'🚦'}
];
const questions=[
{q:'Antes de atravessar, o pedestre deve observar os dois sentidos?',ok:true},
{q:'É seguro usar celular enquanto dirige?',ok:false},
{q:'O cinto deve ser usado também no banco traseiro?',ok:true},
{q:'Em área escolar é importante reduzir a velocidade?',ok:true}
];
const specials={4:['🚦','atenção'],7:['🚶','pedestre'],10:['📵','alerta'],13:['🚲','ciclista'],16:['🛡️','segurança'],19:['⚠️','desafio'],21:['🚸','escola']};
function saveResult(score){const s=JSON.parse(localStorage.getItem('mobiliza.results')||'{"games":0,"correct":0,"answers":0,"best":0,"streak":0}');s.games=(s.games||0)+1;s.best=Math.max(s.best||0,score);localStorage.setItem('mobiliza.results',JSON.stringify(s));}
export function openTrilha(dialog,host,onFinish){
 let players=[{name:'Azul',pos:0,icon:'🔵'},{name:'Amarelo',pos:0,icon:'🟡'}],turn=0,rolls=0;
 const total=24;
 const drawBoard=()=>Array.from({length:total},(_,i)=>{const here=players.filter(p=>p.pos===i);const sp=specials[i];return `<div class="trail-cell ${i===0?'start':''} ${i===total-1?'finish':''} ${sp?'special':''}" data-cell="${i}"><span class="trail-cell-no">${i===0?'INÍCIO':i===total-1?'CHEGADA':i+1}</span>${sp?`<em>${sp[0]}</em><small>${sp[1]}</small>`:''}<b>${here.map(p=>p.icon).join(' ')}</b></div>`;}).join('');
 const render=()=>{host.innerHTML=`<section class="game trail-game"><div class="trail-hero"><img src="assets/games/trilha_do_transito_agentes_mirins.webp?v=7" alt=""><div><p class="eyebrow">TRILHA DO TRÂNSITO</p><h2>Corrida pela segurança</h2><p>Avance pelo tabuleiro, enfrente desafios e pratique boas atitudes no trânsito.</p></div></div><div class="trail-head"><div><span class="turn-label">VEZ DE</span><h3>${players[turn].icon} ${players[turn].name}</h3></div><div class="dice-box" id="dice">🎲</div></div><div class="trail-board" id="trailBoard">${drawBoard()}</div><div class="trail-controls"><button class="btn primary big" id="rollDice">🎲 Jogar dado</button><span>Rodadas: <strong>${rolls}</strong></span></div><div id="trailMessage"></div></section>`;host.querySelector('#rollDice').onclick=roll;};
 const repaint=()=>{host.querySelectorAll('.trail-cell b').forEach(b=>b.textContent='');players.forEach(pp=>{const b=host.querySelector(`[data-cell="${pp.pos}"] b`);if(b)b.textContent+=(b.textContent?' ':'')+pp.icon;});};
 const move=async(n)=>{const p=players[turn],start=p.pos,target=Math.min(total-1,Math.max(0,start+n));const step=target>=start?1:-1;for(let x=start+step;step>0?x<=target:x>=target;x+=step){p.pos=x;repaint();const cell=host.querySelector(`[data-cell="${x}"]`);cell?.classList.add('pulse');await new Promise(r=>setTimeout(r,170));cell?.classList.remove('pulse');}if(p.pos>=total-1){finish(p);return true;}return false;};
 const roll=async()=>{const btn=host.querySelector('#rollDice');btn.disabled=true;const d=host.querySelector('#dice');d.classList.add('rolling');for(let k=0;k<10;k++){d.textContent=['⚀','⚁','⚂','⚃','⚄','⚅'][Math.floor(Math.random()*6)];await new Promise(r=>setTimeout(r,60));}const value=Math.floor(Math.random()*6)+1;d.textContent=['⚀','⚁','⚂','⚃','⚄','⚅'][value-1];d.classList.remove('rolling');rolls++;if(await move(value))return;const p=players[turn];if(p.pos>0&&p.pos<total-1&&specials[p.pos]){const ev=events[Math.floor(Math.random()*events.length)];host.querySelector('#trailMessage').innerHTML=`<div class="trail-event"><span>${ev.icon}</span><div><strong>${ev.t}</strong><p>${ev.m}</p></div></div>`;await new Promise(r=>setTimeout(r,700));if(await move(ev.d))return;}else if(p.pos%4===0){const q=questions[Math.floor(Math.random()*questions.length)],ans=confirm(q.q);host.querySelector('#trailMessage').innerHTML=`<div class="trail-event"><span>${ans===q.ok?'✅':'💡'}</span><div><strong>${ans===q.ok?'Acertou!':'Resposta educativa'}</strong><p>${q.q}</p></div></div>`;if(ans===q.ok)await move(1);}turn=(turn+1)%players.length;setTimeout(render,450);};
 const finish=p=>{saveResult(Math.max(0,1000-rolls*10));onFinish?.();host.innerHTML=`<section class="game trail-result"><div class="result-trophy">🏁</div><h2>${p.icon} ${p.name} chegou primeiro!</h2><p>Partida concluída em ${rolls} rodadas.</p><button class="btn primary" id="trailAgain">Jogar novamente</button></section>`;host.querySelector('#trailAgain').onclick=()=>openTrilha(dialog,host,onFinish);};
 render();if(!dialog.open)dialog.showModal();
}