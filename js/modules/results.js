const TRACKS={
  pedestre:['🚶','Travessia'],
  distracao:['📱','Distração'],
  velocidade:['🛑','Velocidade'],
  protecao:['🛡️','Proteção'],
  bike:['🚲','Bicicleta'],
  moto:['🏍️','Motociclista'],
  familia:['👨‍👩‍👧','Família'],
  empresa:['🏢','Deslocamento']
};
const esc=v=>String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const json=(k,fallback)=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(fallback))}catch{return fallback}};
const avg=a=>a.length?a.reduce((s,x)=>s+Number(x||0),0)/a.length:0;
const pct=(n,d)=>d?Math.round(n/d*100):0;
const fmt=n=>Number(n||0).toLocaleString('pt-BR');
const date=v=>v?new Date(v).toLocaleDateString('pt-BR'):'—';

function css(){
 if(document.getElementById('results-v2-css'))return;
 const s=document.createElement('style');s.id='results-v2-css';
 s.textContent=[
  '.res2{display:grid;gap:16px}',
  '.res2-hero{position:relative;overflow:hidden;display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:22px;align-items:center;padding:26px;border-radius:24px;background:linear-gradient(135deg,#082f55,#0b75a4 62%,#10a7bd);color:#fff;box-shadow:0 16px 36px rgba(9,52,82,.18)}',
  '.res2-hero:after{content:"";position:absolute;width:380px;height:380px;border-radius:50%;right:-120px;top:-150px;background:radial-gradient(circle,rgba(255,255,255,.2),transparent 68%)}',
  '.res2-hero-copy{position:relative;z-index:2}.res2-hero .eyebrow{margin:0 0 5px;color:#a6edff;font-size:.7rem;font-weight:1000;letter-spacing:.12em}.res2-hero h3{font-size:2rem;line-height:1.05;margin:0 0 8px;color:#fff}.res2-hero p{margin:0;color:#dff6ff;line-height:1.5;max-width:720px}',
  '.res2-hero-score{position:relative;z-index:2;display:grid;grid-template-columns:repeat(2,1fr);gap:9px}.res2-hero-score div{padding:14px;border:1px solid rgba(255,255,255,.23);border-radius:16px;background:rgba(255,255,255,.12);backdrop-filter:blur(5px);text-align:center}.res2-hero-score strong{display:block;font-size:1.55rem}.res2-hero-score span{font-size:.7rem;color:#dff6ff}',
  '.res2-kpis{display:grid;grid-template-columns:repeat(6,1fr);gap:10px}.res2-kpi{padding:14px;border:1px solid #d8e6ed;border-radius:16px;background:#fff;box-shadow:0 7px 18px rgba(15,60,102,.05)}.res2-kpi span{display:block;font-size:.68rem;color:#728796}.res2-kpi strong{display:block;margin-top:3px;font-size:1.35rem;color:#0d6f9c}.res2-kpi small{display:block;margin-top:3px;color:#8193a0;font-size:.64rem}',
  '.res2-grid{display:grid;grid-template-columns:1.2fr .8fr;gap:14px}.res2-card{padding:18px;border:1px solid #d7e5ed;border-radius:18px;background:#fff;box-shadow:0 8px 22px rgba(15,60,102,.06)}.res2-card h3{margin:0;color:#103f61}.res2-card>p{margin:5px 0 0;color:#698090;line-height:1.45;font-size:.85rem}',
  '.res2-card-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;margin-bottom:14px}.res2-card-head .badge{white-space:nowrap}',
  '.res2-bars{display:grid;gap:10px}.res2-bar{display:grid;grid-template-columns:150px minmax(0,1fr) 54px;gap:9px;align-items:center}.res2-bar-label{display:flex;gap:7px;align-items:center;font-size:.78rem;font-weight:900;color:#345a72}.res2-track{height:16px;border-radius:999px;background:#e5eef3;overflow:hidden}.res2-track i{display:block;height:100%;background:linear-gradient(90deg,#168fbb,#2fc078);border-radius:inherit;min-width:0}.res2-bar strong{text-align:right;font-size:.78rem;color:#0d6e99}',
  '.res2-empty{padding:24px;border:1px dashed #c8dce6;border-radius:14px;background:#f9fcfd;text-align:center;color:#6f8492}.res2-empty strong{display:block;color:#34596f;margin-bottom:4px}',
  '.res2-ped{display:grid;grid-template-columns:1fr 1fr;gap:10px}.res2-ped-box{padding:15px;border:1px solid #dce8ee;border-radius:15px;background:linear-gradient(145deg,#fff,#f5fafc);text-align:center}.res2-ped-box strong{display:block;font-size:1.6rem;color:#0d729f}.res2-ped-box span{font-size:.72rem;color:#708493}.res2-evolution{margin-top:12px;padding:13px;border-radius:14px;background:#eef8fb;border:1px solid #d4e8ef}.res2-evolution strong{display:block;color:#0f6f97}.res2-evolution .line{height:14px;border-radius:999px;background:#dce9ef;overflow:hidden;margin-top:7px}.res2-evolution .line i{display:block;height:100%;background:linear-gradient(90deg,#efb13a,#31bd72)}',
  '.res2-impact{display:grid;grid-template-columns:repeat(4,1fr);gap:9px}.res2-impact div{padding:14px 10px;border-radius:14px;background:#f5fafc;border:1px solid #dce8ee;text-align:center}.res2-impact strong{display:block;font-size:1.4rem;color:#0d6e9a}.res2-impact span{font-size:.68rem;color:#6f8392}',
  '.res2-recent{display:grid;gap:8px;margin-top:12px}.res2-recent-row{display:grid;grid-template-columns:42px minmax(0,1fr) auto;gap:9px;align-items:center;padding:10px;border:1px solid #dce8ee;border-radius:13px;background:#fbfdfe}.res2-recent-icon{width:38px;height:38px;border-radius:12px;background:#e8f6fb;display:grid;place-items:center}.res2-recent-row strong{display:block;color:#173f60;font-size:.84rem}.res2-recent-row small{display:block;color:#758996;margin-top:2px}.res2-recent-row time{font-size:.68rem;color:#7c8d98}',
  '.res2-actions{display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap}.res2-note{padding:12px 14px;border-left:4px solid #18a4c5;background:#eaf8fc;border-radius:10px;color:#3d6379;font-size:.8rem;line-height:1.45}',
  '@media(max-width:980px){.res2-kpis{grid-template-columns:repeat(3,1fr)}.res2-grid{grid-template-columns:1fr}.res2-hero{grid-template-columns:1fr}.res2-impact{grid-template-columns:1fr 1fr}}',
  '@media(max-width:620px){.res2-hero{padding:18px}.res2-hero h3{font-size:1.55rem}.res2-hero-score{grid-template-columns:1fr 1fr}.res2-kpis{grid-template-columns:1fr 1fr}.res2-bar{grid-template-columns:105px minmax(0,1fr) 45px}.res2-ped,.res2-impact{grid-template-columns:1fr 1fr}.res2-recent-row{grid-template-columns:38px 1fr}.res2-recent-row time{grid-column:2}.res2-actions{display:grid;grid-template-columns:1fr}.res2-actions .btn{width:100%}}'
 ].join('');
 document.head.appendChild(s);
}
function collect(){
 const game=json('mobiliza.results',{games:0,correct:0,answers:0,best:0,streak:0});
 const learning=json('mobiliza.learning.progress',{});
 const evals=json('mobiliza.educador.avaliacoes',[]);
 const evid=json('mobiliza.educador.evidencias',[]);
 const agenda=json('mobiliza.educador.agenda',[]);
 const certs=json('mobiliza.educador.certificados',[]);
 const adminEvents=json('mobiliza.admin.eventos',[]);
 const tracks=Object.entries(TRACKS).map(([id,[icon,label]])=>{
   const p=learning[id]||{};
   return {id,icon,label,best:Number(p.bestPct||0),last:Number(p.lastPct||0),completions:Number(p.completions||0),date:p.last||null,completed:!!p.completed};
 });
 const completed=tracks.filter(x=>x.completed).length;
 const totalCompletions=tracks.reduce((s,x)=>s+x.completions,0);
 const validEvals=evals.filter(x=>Number.isFinite(Number(x.pre))&&Number.isFinite(Number(x.pos)));
 const pre=avg(validEvals.map(x=>x.pre)),post=avg(validEvals.map(x=>x.pos)),delta=post-pre;
 const people=evid.reduce((s,x)=>s+Number(x.publico||0),0);
 const materials=evid.reduce((s,x)=>s+Number(x.materiais||0),0);
 const photos=evid.reduce((s,x)=>s+Number(x.fotos||0),0);
 const actions=evid.length;
 const adminPresence=adminEvents.reduce((s,e)=>s+Object.values(e.presenca||{}).filter(Boolean).length,0);
 return {game,tracks,completed,totalCompletions,evals:validEvals,pre,post,delta,evid,people,materials,photos,actions,agenda,certs,adminEvents,adminPresence};
}
function activity(data){
 const rows=[];
 data.tracks.forEach(x=>{if(x.date)rows.push({type:'track',icon:x.icon,title:x.label,sub:'Trilha concluída • '+x.last+'% na última rodada',date:x.date})});
 data.evid.forEach(x=>rows.push({type:'evidence',icon:'📷',title:x.acao||'Ação educativa',sub:(x.publico||0)+' pessoa(s) alcançada(s)',date:x.createdAt||x.data}));
 data.evals.forEach(x=>rows.push({type:'eval',icon:'📈',title:x.atividade||'Avaliação',sub:'Pré '+x.pre+' • Pós '+x.pos,date:x.createdAt||x.data}));
 data.certs.forEach(x=>rows.push({type:'cert',icon:'🎓',title:x.nome||'Certificado',sub:x.atividade||'Certificado emitido',date:x.createdAt||x.data}));
 return rows.filter(x=>x.date).sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,8);
}
function summaryText(d){
 const acc=pct(d.game.correct,d.game.answers);
 return [
  'MOBILIZA EDUCA - RESUMO LOCAL',
  'Gerado em: '+new Date().toLocaleString('pt-BR'),
  '',
  'JOGOS',
  'Partidas: '+fmt(d.game.games),
  'Respostas: '+fmt(d.game.answers),
  'Acertos: '+fmt(d.game.correct)+' ('+acc+'%)',
  'Melhor pontuação: '+fmt(d.game.best),
  'Melhor sequência: '+fmt(d.game.streak),
  '',
  'TRILHAS',
  'Trilhas concluídas: '+d.completed+'/'+d.tracks.length,
  'Conclusões totais: '+d.totalCompletions,
  d.tracks.map(x=>'- '+x.label+': '+x.best+'% melhor resultado').join('\n'),
  '',
  'AVALIAÇÃO PEDAGÓGICA',
  'Registros: '+d.evals.length,
  'Média pré: '+d.pre.toFixed(1),
  'Média pós: '+d.post.toFixed(1),
  'Evolução média: '+(d.delta>=0?'+':'')+d.delta.toFixed(1),
  '',
  'IMPACTO DAS AÇÕES',
  'Ações registradas: '+d.actions,
  'Público alcançado: '+fmt(d.people),
  'Materiais distribuídos: '+fmt(d.materials),
  'Evidências registradas: '+fmt(d.photos),
  'Certificados emitidos: '+fmt(d.certs.length),
  '',
  'Observação: dados deste dispositivo/navegador.'
 ].join('\n');
}
function download(name,text,type='text/plain;charset=utf-8'){
 const a=document.createElement('a');a.href=URL.createObjectURL(new Blob(['\ufeff'+text],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);
}
export function renderResultsDashboard(host){
 if(!host)return;
 css();
 const d=collect(),acc=pct(d.game.correct,d.game.answers),recent=activity(d);
 const deltaPct=Math.max(0,Math.min(100,Math.round((d.post||0)*10)));
 host.innerHTML='<div class="res2">'+
  '<section class="res2-hero"><div class="res2-hero-copy"><p class="eyebrow">PAINEL DE IMPACTO • DADOS LOCAIS</p><h3>Resultados que mostram aprendizagem e alcance</h3><p>O painel combina desempenho dos jogos, trilhas concluídas e registros da Central do Educador neste dispositivo.</p></div><div class="res2-hero-score"><div><strong>'+acc+'%</strong><span>acertos nos jogos</span></div><div><strong>'+d.completed+'/'+d.tracks.length+'</strong><span>trilhas concluídas</span></div><div><strong>'+fmt(d.people)+'</strong><span>público registrado</span></div><div><strong>'+(d.delta>=0?'+':'')+d.delta.toFixed(1)+'</strong><span>evolução pré/pós</span></div></div></section>'+
  '<div class="res2-kpis"><div class="res2-kpi"><span>Partidas</span><strong>'+fmt(d.game.games)+'</strong><small>registro agregado</small></div><div class="res2-kpi"><span>Respostas</span><strong>'+fmt(d.game.answers)+'</strong><small>'+fmt(d.game.correct)+' corretas</small></div><div class="res2-kpi"><span>Melhor pontuação</span><strong>'+fmt(d.game.best)+'</strong><small>neste dispositivo</small></div><div class="res2-kpi"><span>Melhor sequência</span><strong>'+fmt(d.game.streak)+'</strong><small>acertos seguidos</small></div><div class="res2-kpi"><span>Conclusões de trilha</span><strong>'+fmt(d.totalCompletions)+'</strong><small>'+d.completed+' trilhas diferentes</small></div><div class="res2-kpi"><span>Certificados</span><strong>'+fmt(d.certs.length)+'</strong><small>emitidos localmente</small></div></div>'+
  '<div class="res2-grid"><section class="res2-card"><div class="res2-card-head"><div><h3>📚 Aprendizagem por trilha</h3><p>Melhor aproveitamento registrado em cada microtrilha.</p></div><span class="badge">'+d.completed+' concluídas</span></div>'+
    (d.tracks.some(x=>x.completions)?'<div class="res2-bars">'+d.tracks.map(x=>'<div class="res2-bar"><div class="res2-bar-label"><span>'+x.icon+'</span><span>'+esc(x.label)+'</span></div><div class="res2-track"><i style="width:'+x.best+'%"></i></div><strong>'+x.best+'%</strong></div>').join('')+'</div>':'<div class="res2-empty"><strong>Nenhuma trilha concluída ainda.</strong>Os resultados aparecem aqui assim que uma trilha for finalizada.</div>')+
  '</section><section class="res2-card"><div class="res2-card-head"><div><h3>📈 Evolução pedagógica</h3><p>Comparação dos registros pré e pós.</p></div><span class="badge">'+d.evals.length+' registro(s)</span></div>'+
    (d.evals.length?'<div class="res2-ped"><div class="res2-ped-box"><strong>'+d.pre.toFixed(1)+'</strong><span>média pré</span></div><div class="res2-ped-box"><strong>'+d.post.toFixed(1)+'</strong><span>média pós</span></div></div><div class="res2-evolution"><strong>'+(d.delta>=0?'↑ ':'↓ ')+(d.delta>=0?'+':'')+d.delta.toFixed(1)+' ponto(s)</strong><div class="line"><i style="width:'+deltaPct+'%"></i></div></div>':'<div class="res2-empty"><strong>Sem avaliação pré/pós.</strong>Registre uma avaliação na Central do Educador para acompanhar evolução.</div>')+
  '</section></div>'+
  '<section class="res2-card"><div class="res2-card-head"><div><h3>🌍 Impacto das ações educativas</h3><p>Indicadores registrados em Evidências e Impacto e nos eventos locais.</p></div><span class="badge">'+d.actions+' ação(ões)</span></div><div class="res2-impact"><div><strong>'+fmt(d.people)+'</strong><span>pessoas alcançadas</span></div><div><strong>'+fmt(d.materials)+'</strong><span>materiais distribuídos</span></div><div><strong>'+fmt(d.photos)+'</strong><span>evidências registradas</span></div><div><strong>'+fmt(d.adminPresence)+'</strong><span>presenças em eventos</span></div></div></section>'+
  '<div class="res2-grid"><section class="res2-card"><div class="res2-card-head"><div><h3>🕘 Atividade recente</h3><p>Últimos registros disponíveis neste navegador.</p></div></div>'+
    (recent.length?'<div class="res2-recent">'+recent.map(x=>'<div class="res2-recent-row"><span class="res2-recent-icon">'+x.icon+'</span><div><strong>'+esc(x.title)+'</strong><small>'+esc(x.sub)+'</small></div><time>'+date(x.date)+'</time></div>').join('')+'</div>':'<div class="res2-empty"><strong>Ainda sem histórico recente.</strong>Conclua trilhas ou registre ações para alimentar esta linha do tempo.</div>')+
  '</section><section class="res2-card"><div class="res2-card-head"><div><h3>📤 Relatório e portabilidade</h3><p>Exporte um resumo dos indicadores locais.</p></div></div><div class="res2-actions"><button type="button" class="btn primary" id="res2Export">⬇ Exportar resumo</button><button type="button" class="btn ghost" id="res2Print">🖨 Imprimir / PDF</button></div><div class="res2-note" style="margin-top:14px"><strong>Escopo dos dados:</strong> este painel não possui backend central. Ele resume somente os registros armazenados neste navegador/dispositivo. O detalhamento histórico por jogo ainda não é registrado individualmente; por isso jogos aparecem em totais agregados.</div></section></div>'+
 '</div>';
 host.querySelector('#res2Export')?.addEventListener('click',()=>download('mobiliza-educa-resumo.txt',summaryText(d)));
 host.querySelector('#res2Print')?.addEventListener('click',()=>window.print());
}
