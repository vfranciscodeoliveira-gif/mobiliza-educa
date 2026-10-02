const qs=[
{q:'Quem deve usar cinto de segurança?',a:['Só o motorista','Todos os ocupantes','Só quem vai na frente','Só em rodovias'],c:1},
{q:'Ao atravessar, a atitude mais segura é:',a:['Usar a faixa e observar','Correr entre carros','Olhar o celular','Seguir sem observar'],c:0},
{q:'Perto de escolas, o condutor deve:',a:['Adequar a velocidade','Acelerar','Buzinar sem parar','Parar sobre a faixa'],c:0}
];
export function openPlateia(dialog,host,onFinish){
 let i=0,total=0,correct=0;
 const render=()=>{const q=qs[i];host.innerHTML=`<section class="game audience-game"><p class="eyebrow">PLATEIA INTERATIVA • MODO LOCAL</p><h2>${q.q}</h2><p>Use este modo em demonstrações no mesmo dispositivo. A sincronização real entre celulares entrará com o backend.</p><div class="audience-buttons">${q.a.map((x,n)=>`<button class="audience-vote vote-${n}" data-vote="${n}"><b>${String.fromCharCode(65+n)}</b><span>${x}</span></button>`).join('')}</div><div id="voteResults"></div></section>`;host.querySelectorAll('[data-vote]').forEach(b=>b.onclick=()=>vote(+b.dataset.vote));};
 const vote=n=>{total++;if(n===qs[i].c)correct++;const base=[0,0,0,0];for(let k=0;k<total;k++)base[Math.floor(Math.random()*4)]++;base[n]+=4;const sum=base.reduce((a,b)=>a+b,0);host.querySelector('#voteResults').innerHTML=`<div class="audience-panel"><strong>Resultado da plateia</strong>${base.map((v,idx)=>{const p=Math.round(v/sum*100);return `<div class="audience-row"><span>${String.fromCharCode(65+idx)}</span><i><b style="width:${p}%"></b></i><em>${p}%</em></div>`;}).join('')}<button class="btn primary" id="nextVote">${i===qs.length-1?'Encerrar':'Próxima pergunta'}</button></div>`;host.querySelector('#nextVote').onclick=()=>{i++;if(i<qs.length)render();else finish();};};
 const finish=()=>{onFinish?.();host.innerHTML=`<section class="game"><div class="result-trophy">📱</div><h2>Sessão local concluída</h2><p>${total} interação(ões) registradas nesta demonstração.</p><button class="btn primary" id="audAgain">Nova sessão</button></section>`;host.querySelector('#audAgain').onclick=()=>openPlateia(dialog,host,onFinish);};
 render();if(!dialog.open)dialog.showModal();
}