const words=[
{word:'TRANSITO',clue:'Espaço de convivência e circulação de pessoas e veículos.'},
{word:'RESPEITO',clue:'Valor essencial para uma convivência segura.'},
{word:'SEGURANCA',clue:'Objetivo principal da educação para o trânsito.'},
{word:'PEDESTRE',clue:'Pessoa que se desloca a pé.'},
{word:'CINTO',clue:'Equipamento de proteção obrigatório no veículo.'},
{word:'SEMÁFORO'.normalize('NFD').replace(/[\u0300-\u036f]/g,''),clue:'Sinal luminoso que organiza fluxos.'}
];
const clean=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z]/g,'');
export function openCruzadas(dialog,host,onFinish){
 let solved=new Set(),attempts=0;
 const render=()=>{host.innerHTML=`<section class="game crossword-game"><div class="game-cover game-cover-cruzadas"></div><p class="eyebrow">PALAVRAS CRUZADAS DO TRÂNSITO</p><h2>Descubra as palavras pelas pistas</h2><div class="crossword-list">${words.map((w,i)=>`<div class="crossword-row ${solved.has(i)?'solved':''}"><span class="clue-number">${i+1}</span><p>${w.clue}</p><input data-word="${i}" maxlength="${w.word.length}" placeholder="${'•'.repeat(w.word.length)}"><button class="btn ghost small" data-check="${i}">Conferir</button></div>`).join('')}</div><div class="game-score"><span>Concluídas: <strong id="crossCount">${solved.size}/${words.length}</strong></span><span>Tentativas: <strong>${attempts}</strong></span></div></section>`;host.querySelectorAll('[data-check]').forEach(b=>b.onclick=()=>check(+b.dataset.check));host.querySelectorAll('[data-word]').forEach(i=>i.onkeydown=e=>{if(e.key==='Enter')check(+i.dataset.word);});};
 const check=i=>{if(solved.has(i))return;attempts++;const inp=host.querySelector(`[data-word="${i}"]`);if(clean(inp.value)===clean(words[i].word)){solved.add(i);inp.value=words[i].word;inp.closest('.crossword-row').classList.add('solved');inp.disabled=true;host.querySelector('#crossCount').textContent=`${solved.size}/${words.length}`;if(solved.size===words.length)setTimeout(finish,350);}else{inp.classList.add('shake');setTimeout(()=>inp.classList.remove('shake'),350);}};
 const finish=()=>{const score=Math.max(100,1200-attempts*30);const s=JSON.parse(localStorage.getItem('mobiliza.results')||'{"games":0,"correct":0,"answers":0,"best":0,"streak":0}');s.games=(s.games||0)+1;s.correct=(s.correct||0)+words.length;s.answers=(s.answers||0)+attempts;s.best=Math.max(s.best||0,score);localStorage.setItem('mobiliza.results',JSON.stringify(s));onFinish?.();host.innerHTML=`<section class="game"><div class="result-trophy">✏️</div><h2>Palavras concluídas!</h2><p>${score} pontos em ${attempts} tentativa(s).</p><button class="btn primary" id="crossAgain">Jogar novamente</button></section>`;host.querySelector('#crossAgain').onclick=()=>openCruzadas(dialog,host,onFinish);};
 render();dialog.showModal();
}