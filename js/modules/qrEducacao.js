import {qrSvg} from '../core/qr.js?v=1';
import {loadAppointments} from '../core/appointmentRepository.js?v=8';

const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const DEMO='blitz-capacete-demo';
const urlFor=()=>new URL('./qr-educacao.html?acao='+DEMO,location.href.replace(/admin\.html.*$/,'')).href;

export async function renderQREducacao(host){
 host.innerHTML='<section class="admin-module"><h2>📱 QR Educação 360</h2><p role="status">Carregando ações educativas...</p></section>';
 let context=null,rows=[];
 try{context=await loadAppointments();rows=Array.isArray(context.rows)?context.rows:Array.isArray(context.events)?context.events:[];}catch(e){
  host.querySelector('p').textContent='Não foi possível consultar a agenda: '+(e.message||e);
 }
 const onlineUrl=urlFor();
 const localUrl='http://192.168.4.1:8080/a/'+DEMO;
 const box=document.createElement('section');box.className='admin-module';
 box.innerHTML=`<h2>📱 QR Educação 360</h2>
 <p>Distribuição híbrida de conteúdos educativos por QR Code. Esta etapa disponibiliza um evento demonstrativo publicado e orienta a preparação do modo offline.</p>
 <div class="callout card"><strong>Publicação de demonstração</strong>
 <p>Blitz Educativa — Motociclista Seguro • Conteúdo demonstrativo, não homologado para uso oficial.</p>
 <div id="qrEduSvg" style="max-width:290px;background:white;padding:16px;border-radius:16px"></div>
 <p><a id="qrEduLink" href="${esc(onlineUrl)}" target="_blank" rel="noopener">Abrir página pública online ↗</a></p>
 <button type="button" class="btn primary" id="qrEduPrint">🖨️ Imprimir QR Code</button></div>
 <div class="callout card"><strong>Rede local sem internet</strong><p>Após configurar o kit de campo, conecte os participantes ao Wi-Fi e abra <code>${esc(localUrl)}</code>. O IP é exemplificativo e deve ser ajustado no local.</p><p>Os QR Codes online e offline são diferentes. O modo offline exige servidor local ativo.</p></div>
 <div class="callout card"><strong>Agenda existente</strong><p id="qrEduSchedule"></p><p>O vínculo e a publicação de conteúdos por ação no Firestore estão previstos para a próxima integração. Nenhuma alteração foi feita nos agendamentos.</p></div>`;
 host.replaceChildren(box);
 const svg=box.querySelector('#qrEduSvg');
 try{svg.innerHTML=qrSvg(onlineUrl,5);}catch(e){svg.textContent='URL excede a capacidade do gerador de QR atual. '+e.message;}
 box.querySelector('#qrEduSchedule').textContent=context?`Agenda consultada no Firestore. ${rows.length?rows.length+' registros retornados.':'Os dados foram carregados, mas a listagem ainda não foi mapeada neste módulo.'}`:'Agenda indisponível neste acesso.';
 box.querySelector('#qrEduPrint').onclick=()=>{
  const win=window.open('','_blank','width=620,height=680');
  if(!win){alert('Permita pop-ups para imprimir.');return;}
  win.document.write('<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>QR Educação</title><body style="font-family:Arial;text-align:center"><h1>Mobiliza Educa</h1><h2>Blitz Educativa — Demonstração</h2>'+svg.innerHTML+'<p>'+esc(onlineUrl)+'</p><p>Escaneie para acessar o material educativo.</p></body></html>');
  win.document.close();win.focus();win.print();
 };
}