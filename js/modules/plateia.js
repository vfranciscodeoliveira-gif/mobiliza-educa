import { getQuestionSet } from '../core/questionEngine.js?v=2';
import { SoundManager } from '../core/soundManager.js?v=1';

function css(){
 if(document.getElementById('plateia-local-v2'))return;
 const s=document.createElement('style');s.id='plateia-local-v2';
 s.textContent=[
 '.aud2{padding:24px;min-height:560px;color:#173f60}.aud2 *{box-sizing:border-box}',
 '.aud2-head{padding:18px 20px;border-radius:18px;background:linear-gradient(135deg,#0f3c66,#175f96);color:#fff}.aud2-head h2{margin:3px 0 5px;color:#fff}.aud2-head p{margin:0;color:#dceffc}.aud2-head .eyebrow{color:#bdeaff}',
 '.aud2-top{display:grid;grid-template-columns:1fr auto;gap:12px;align-items:center;margin:12px 0}.aud2-counter{padding:10px 14px;border:1px solid #d6e5ed;border-radius:12px;background:#fff;font-weight:900}.aud2-counter b{color:#0d78ad;font-size:1.2rem}',
 '.aud2-question{padding:18px;border:1px solid #d7e5ed;border-radius:16px;background:#fff;box-shadow:0 9px 24px rgba(15,60,102,.07)}.aud2-question h3{font-size:1.35rem;margin:0;color:#0f3c66}',
 '.aud2-votes{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px}.aud2-vote{min-height:92px;border:2px solid #d9e6ee;border-radius:16px;background:#fff;color:#173f60;text-align:left;padding:14px;cursor:pointer;font-weight:900;transition:.15s}.aud2-vote:hover{transform:translateY(-2px);border-color:#1689bd}.aud2-vote b{display:inline-grid;place-items:center;width:34px;height:34px;border-radius:50%;background:#0e6faa;color:#fff;margin-right:9px}.aud2-vote small{display:block;margin:5px 0 0 44px;color:#6a8191}.aud2-vote.flash{animation:audFlash .22s ease}@keyframes audFlash{50%{transform:scale(.97);background:#e9f7fd}}',
 '.aud2-actions{display:flex;justify-content:flex-end;gap:8px;margin-top:12px}.aud2-results{margin-top:14px;padding:16px;border:1px solid #d7e5ed;border-radius:16px;background:#fff}.aud2-row{display:grid;grid-template-columns:34px 1fr 54px;gap:8px;align-items:center;margin:8px 0}.aud2-row>span{display:grid;place-items:center;width:30px;height:30px;border-radius:50%;background:#0e6faa;color:#fff;font-weight:900}.aud2-row i{height:18px;border-radius:999px;background:#e5edf2;overflow:hidden}.aud2-row i b{display:block;height:100%;background:linear-gradient(90deg,#1689bd,#2fb36d)}.aud2-row em{font-style:normal;text-align:right;font-weight:900}.aud2-answer{margin-top:12px;padding:12px;border-radius:12px;background:#eaf8ef;color:#17643a}',
 '.aud2-complete{text-align:center;padding:26px;border:1px solid #c6e3d0;border-radius:18px;background:linear-gradient(145deg,#eefaf2,#fff);margin-top:14px}.aud2-complete .big{font-size:2.8rem}',
 '@media(max-width:760px){.aud2{padding:14px;min-height:100dvh}.aud2-votes{grid-template-columns:1fr}.aud2-top{grid-template-columns:1fr}.aud2-actions{display:grid;grid-template-columns:1fr 1fr}}'
 ].join('');
 document.head.appendChild(s);
}
function save(score,correct,answers){
 const r=JSON.parse(localStorage.getItem('mobiliza.results')||'{"games":0,"correct":0,"answers":0,"best":0,"streak":0}');
 r.games=(r.games||0)+1;r.correct=(r.correct||0)+correct;r.answers=(r.answers||0)+answers;r.best=Math.max(r.best||0,score);
 localStorage.setItem('mobiliza.results',JSON.stringify(r));
}
export function openPlateia(dialog,host,onFinish){
 css();
 const questions=getQuestionSet({count:6,audiences:['criancas','adolescentes','adultos'],avoidRecent:true,markRecent:true,recentScope:'game:plateia',recentLimit:18});
 let i=0,votes=[0,0,0,0],closed=false,totalSession=0,correctSession=0,score=0;
 function render(){
  const q=questions[i];votes=[0,0,0,0];closed=false;
  host.innerHTML='<section class="aud2"><div class="aud2-head"><p class="eyebrow">PLATEIA INTERATIVA • MODO LOCAL</p><h2>Votação ao vivo no mesmo dispositivo</h2><p>Use em sala, evento ou telão. Cada participante toca sua alternativa; o operador encerra a votação e revela os percentuais.</p></div>'+
   '<div class="aud2-top"><div class="aud2-counter">Pergunta '+(i+1)+'/'+questions.length+' • Votos: <b id="aud2Total">0</b></div><button class="btn ghost" id="aud2Sound">'+(SoundManager.isEnabled()?'🔊 Som':'🔇 Som')+'</button></div>'+
   '<div class="aud2-question"><h3>'+q.prompt+'</h3></div><div class="aud2-votes">'+q.options.map((x,n)=>'<button class="aud2-vote" data-vote="'+n+'"><b>'+String.fromCharCode(65+n)+'</b>'+x+'<small><span id="aud2Count'+n+'">0</span> voto(s)</small></button>').join('')+'</div>'+
   '<div class="aud2-actions"><button class="btn ghost" id="aud2Reset">↻ Zerar votação</button><button class="btn primary" id="aud2CloseVote">📊 Encerrar e mostrar resultado</button></div><div id="aud2Results"></div></section>';
  host.querySelectorAll('[data-vote]').forEach(b=>b.onclick=()=>vote(Number(b.dataset.vote),b));
  host.querySelector('#aud2Reset').onclick=()=>{votes=[0,0,0,0];SoundManager.play('click');updateCounts()};
  host.querySelector('#aud2CloseVote').onclick=reveal;
  host.querySelector('#aud2Sound').onclick=()=>{SoundManager.toggle();render()};
 }
 function updateCounts(){
  const t=votes.reduce((a,b)=>a+b,0);const el=host.querySelector('#aud2Total');if(el)el.textContent=t;
  votes.forEach((v,n)=>{const x=host.querySelector('#aud2Count'+n);if(x)x.textContent=v});
 }
 function vote(n,b){
  if(closed)return;votes[n]++;SoundManager.play('click');b.classList.remove('flash');void b.offsetWidth;b.classList.add('flash');updateCounts();
 }
 function reveal(){
  if(closed)return;const total=votes.reduce((a,b)=>a+b,0);if(!total){const out=host.querySelector('#aud2Results');out.className='aud2-results';out.innerHTML='<strong>Registre pelo menos um voto antes de encerrar.</strong>';SoundManager.play('warning');return}
  closed=true;totalSession+=total;const q=questions[i],winner=votes.indexOf(Math.max(...votes));if(winner===q.correct){correctSession++;score+=200}SoundManager.play(winner===q.correct?'correct':'next');
  host.querySelectorAll('[data-vote]').forEach(b=>b.disabled=true);host.querySelector('#aud2CloseVote').disabled=true;host.querySelector('#aud2Reset').disabled=true;
  const out=host.querySelector('#aud2Results');out.className='aud2-results';
  out.innerHTML='<strong>Resultado da plateia</strong>'+votes.map((v,n)=>{const p=Math.round(v/total*100);return '<div class="aud2-row"><span>'+String.fromCharCode(65+n)+'</span><i><b style="width:'+p+'%"></b></i><em>'+p+'%</em></div>'}).join('')+
   '<div class="aud2-answer"><strong>Resposta de referência: '+String.fromCharCode(65+q.correct)+'</strong><br>'+q.why+'</div><div class="aud2-actions"><button class="btn primary" id="aud2Next">'+(i===questions.length-1?'Encerrar sessão':'Próxima pergunta')+'</button></div>';
  host.querySelector('#aud2Next').onclick=()=>{i++;if(i>=questions.length)finish();else{SoundManager.play('next');render()}};
 }
 function finish(){
  save(score,correctSession,questions.length);if(onFinish)onFinish();SoundManager.play('finish');
  host.innerHTML='<section class="aud2"><div class="aud2-head"><p class="eyebrow">PLATEIA INTERATIVA • RESULTADO</p><h2>Sessão local concluída</h2><p>Os dados desta sessão ficam apenas neste dispositivo.</p></div><div class="aud2-complete"><div class="big">📱</div><h3>'+totalSession+' votos registrados</h3><p>'+questions.length+' perguntas apresentadas • '+correctSession+' resultados majoritários coincidiram com a resposta de referência.</p><strong>'+score+' pontos</strong><div class="aud2-actions"><button class="btn primary" id="aud2Again">Nova sessão</button><button class="btn ghost" id="aud2Exit">Encerrar</button></div></div></section>';
  host.querySelector('#aud2Again').onclick=()=>openPlateia(dialog,host,onFinish);host.querySelector('#aud2Exit').onclick=()=>dialog.close();
 }
 render();SoundManager.play('open');if(!dialog.open)dialog.showModal();
}
