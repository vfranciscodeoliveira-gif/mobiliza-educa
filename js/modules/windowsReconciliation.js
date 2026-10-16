import {listWindowsArchives,loadWindowsArchive} from '../core/windowsArchiveRepository.js?v=1';
import {reconcileWindowsReadOnly} from '../core/windowsReconciliationReadOnly.js?v=1';
import {buildWindowsReviewQueue} from '../core/windowsReviewQueue.js?v=1';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export async function renderWindowsReconciliation(host,ctx){
 const token=Symbol('reconciliation');host._reconciliationToken=token;host.hidden=false;
 const live=()=>host.isConnected&&host._reconciliationToken===token;
 const top=()=>{const scroller=host.closest('[role="dialog"],.modal-content,.admin-modal')||host;scroller.scrollTo?.({top:0,behavior:'auto'});host.scrollIntoView({block:'start',behavior:'auto'});};
 host.innerHTML='<h3>Reconciliação Windows 360</h3><p role="status">Consultando histórico preservado...</p>';
 try{
  const archives=await listWindowsArchives(ctx.tenantId);if(!live())return;
  host.innerHTML='<h3 id="wrTitle" tabindex="-1">Reconciliação Windows 360 — somente leitura</h3><p>Compare os agendamentos originais com a agenda online. Os registros não serão modificados. Fila de jogos não equivale a público atendido.</p><label>Histórico Windows <select id="wrArchive"><option value="">Selecione um arquivo</option>'+archives.map(a=>'<option value="'+esc(a.id)+'">'+esc(a.banco)+' • '+esc(a.agendamentos)+' agendamentos</option>').join('')+'</select></label><p id="wrStatus" role="status"></p><div id="wrResults"></div><button type="button" class="btn ghost" id="wrClose">Fechar reconciliação</button>';
  const qs=q=>host.querySelector(q);let seq=0;top();qs('#wrClose').onclick=()=>{host._reconciliationToken=null;host.hidden=true};
  qs('#wrArchive').onchange=async()=>{
   const index=++seq,hash=qs('#wrArchive').value;qs('#wrResults').innerHTML='';if(!hash)return;
   qs('#wrStatus').textContent='Comparando registros...';
   try{
    const archive=await loadWindowsArchive(hash,ctx.tenantId);
    if(!live()||index!==seq)return;
    const report=reconcileWindowsReadOnly(archive.pack,ctx.rows,hash);
    qs('#wrStatus').textContent='Diagnóstico realizado. Nenhuma informação foi gravada.';
    const review=buildWindowsReviewQueue(report,ctx.rows);
    const counts=report.rows.reduce((m,r)=>{for(const issue of r.issues)m[issue]=(m[issue]||0)+1;return m},{});
    qs('#wrResults').innerHTML='<div class="schedule-kpis"><div><strong>'+report.agendaOriginalCount+'</strong><small>Originais</small></div><div><strong>'+report.onlineCount+'</strong><small>Online</small></div><div><strong>'+report.matched+'</strong><small>Correspondências únicas</small></div><div><strong>'+report.notMatched+'</strong><small>Sem correspondência</small></div><div><strong>'+report.ambiguous+'</strong><small>Ambíguas</small></div></div><p>Online sem correspondência neste histórico: <strong>'+report.onlineWithoutMatch.length+'</strong>. Estimativas ausentes: <strong>'+(counts.estimativa_ausente||0)+'</strong>. Turmas sem vínculo online: <strong>'+(counts.turmas_sem_vinculo_online||0)+'</strong>.</p><div id="wrTableScroll" tabindex="0" role="region" aria-label="Tabela de divergências Windows" style="overflow:auto;max-height:min(48vh,420px);overscroll-behavior:contain;scrollbar-gutter:stable;"><table><thead><tr><th>ID Windows</th><th>Escola</th><th>Início</th><th>Status origem</th><th>Previstos</th><th>Correspondência online</th><th>Pendências</th></tr></thead><tbody>'+report.rows.map(r=>'<tr><td>'+esc(r.agendaId)+'</td><td>'+esc(r.escola)+'</td><td>'+esc(r.inicio)+'</td><td>'+esc(r.statusOriginal)+'</td><td>'+(r.publicoPrevistoOriginal===null?'Não informado':esc(r.publicoPrevistoOriginal))+'</td><td>'+esc(r.onlineIds.join(', ')||'Não encontrada')+'</td><td>'+esc(r.issues.join(' • ')||'—')+'</td></tr>').join('')+'</tbody></table></div><button class="btn ghost" id="wrDownload" type="button">Exportar diagnóstico JSON</button>';
    const queueHost=qs('#wrReviewRows');
    const drawQueue=()=>{const filter=qs('#wrQueueFilter').value;const items=review.items.filter(item=>filter==='all'||item.kind===filter);queueHost.innerHTML='<table><thead><tr><th>Origem</th><th>ID</th><th>Escola ou descrição</th><th>Data</th><th>Status</th></tr></thead><tbody>'+items.map(item=>'<tr><td>'+esc(item.kind==='windows_sem_online'?'Windows':'Online')+'</td><td>'+esc(item.id)+'</td><td>'+esc(item.name)+'</td><td>'+esc(item.date)+'</td><td>'+esc(item.status)+'</td></tr>').join('')+'</tbody></table>'};qs('#wrQueueFilter').onchange=drawQueue;drawQueue();
    const title=qs('#wrTitle');title?.focus({preventScroll:true});top();
    qs('#wrDownload').onclick=()=>{const blob=new Blob([JSON.stringify(report,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='reconciliacao-windows-360.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),30000)};
   }catch(error){if(live()&&index===seq)qs('#wrStatus').textContent='Falha ao conferir histórico: '+error.message}
  };
 }catch(error){if(live())host.innerHTML='<h3>Reconciliação Windows 360</h3><p role="alert">'+esc(error.message)+'</p>'}
}
