import {qrSvg} from '../core/qr.js?v=1';
import {loadAppointments} from '../core/appointmentRepository.js?v=8';
import {accessDb,permissionAllowed} from '../core/cloudAccess.js?v=1';

const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const validUrl=value=>{try{const u=new URL(value);return u.protocol==='https:'&&u.username===''&&u.password==='';}catch{return false;}};
const publicURL=code=>new URL('qr-educacao.html?acao='+encodeURIComponent(code),new URL('../..',import.meta.url)).href;
const serializeMaterials=text=>String(text||'').split('\n').map(x=>x.trim()).filter(Boolean).map((line,i)=>{
  const split=line.indexOf('|');if(split<1)throw Error('Use Título | https://... em cada linha de material.');
  const title=line.slice(0,split).trim(),url=line.slice(split+1).trim();
  if(!title||title.length>120||!validUrl(url)||url.length>1200)throw Error('Material '+(i+1)+': use título (até 120 caracteres) e endereço HTTPS válido.');
  return {id:'m'+(i+1),title,url,type:/\.pdf(?:[?#]|$)/i.test(url)?'pdf':'link'};
});
const readableDate=x=>x?String(x).split('-').reverse().join('/'):'';
const fmt=a=>[readableDate(a.dataInicio),a.horaInicio,a.nome].filter(Boolean).join(' • ');
const makeCode=()=>[...crypto.getRandomValues(new Uint8Array(10))].map(v=>v.toString(16).padStart(2,'0')).join('');
function saveDownload(name,obj){
 const blob=new Blob([JSON.stringify(obj,null,2)],{type:'application/json'}),link=document.createElement('a'),url=URL.createObjectURL(blob);
 link.href=url;link.download=name;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
function printQR(title,url,svg){
 const win=window.open('','_blank','width=650,height=760');if(!win){alert('Autorize a abertura de janelas para imprimir.');return;}
 win.document.write('<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>QR Educação</title><body style="text-align:center;font:18px Arial;padding:24px"><h1>Mobiliza Educa • QR Educação</h1><h2>'+esc(title)+'</h2>'+svg+'<p>'+esc(url)+'</p><p>Escaneie com o celular e acesse os materiais desta ação.</p></body></html>');
 win.document.close();win.focus();win.print();
}
export async function renderQREducacao(host){
 const signal=Symbol();host._qrEduSignal=signal;
 host.innerHTML='<section class="admin-module"><h2>📱 QR Educação 360</h2><p role="status">Consultando agenda e publicações no Firestore...</p></section>';
 try{
  const ctx=await loadAppointments(),{db,fs}=await accessDb();
  const tenantId=ctx.tenantId,base=fs.collection(db,'qrPublic');
  const own=()=>host.isConnected&&host._qrEduSignal===signal;
  const rows=ctx.rows.filter(x=>x.id&&x.status!=='Cancelado').sort((a,b)=>String(b.dataInicio).localeCompare(String(a.dataInicio)));
  const canManage=ctx.access.allSchools&&permissionAllowed(ctx.access,'events.manage');
  let docs=[];
  const refresh=async()=>{
   const snaps=await fs.getDocsFromServer(fs.query(base,fs.where('tenantId','==',tenantId)));
   docs=snaps.docs.map(x=>({id:x.id,...x.data()})).filter(x=>rows.some(a=>a.id===x.actionId));
  };
  // Queries by tenantId require list privilege only for allowed managers and tenant members.
  await refresh();if(!own())return;
  const section=document.createElement('section');section.className='admin-module';
  section.innerHTML=`<h2>📱 QR Educação 360</h2>
  <p>Distribua conteúdos da sua agenda com QR Codes específicos por evento. Publicações aprovadas ficam acessíveis sem login.</p>
  <p id="qrMsg" role="status"></p>
  <div class="callout card"><h3>1. Selecione a ação da agenda</h3>
    <label>Evento / blitz / palestra<select id="qrAction"><option value="">Selecione um agendamento</option>${rows.map(a=>`<option value="${esc(a.id)}">${esc(fmt(a))}</option>`).join('')}</select></label>
    <p id="qrEmpty" ${rows.length?'hidden':''}>Nenhum atendimento disponível para este acesso.</p></div>
  <div class="callout card"><h3>2. Configure os materiais</h3>
    <label>Título público <input id="qrTitle" maxlength="120" placeholder="Ex.: Blitz Motociclista Seguro"></label>
    <label>Orientações iniciais <textarea id="qrDescription" rows="3" maxlength="600" placeholder="Apresente o objetivo da ação e as principais orientações."></textarea></label>
    <label>Materiais (uma linha por arquivo ou página, no formato Título | URL HTTPS)
    <textarea id="qrMaterials" rows="6" placeholder="Cartilha sobre capacete | https://exemplo.org/cartilha.pdf"></textarea></label>
    <p>Utilize apenas arquivos públicos, autorizados e hospedados em HTTPS. PDFs privados do Firebase Storage não são automaticamente públicos.</p>
    <div class="form-actions"><button id="qrSave" class="btn primary" ${canManage?'':'disabled'}>💾 Salvar e publicar</button>
    <button id="qrHide" class="btn ghost" ${canManage?'':'disabled'}>Retirar publicação</button></div>
  </div>
  <div class="callout card"><h3>3. Divulgue o QR Code</h3>
    <p id="qrState">Selecione uma ação para consultar a publicação.</p>
    <div id="qrSvg" style="background:white;display:inline-block;max-width:100%;padding:12px"></div>
    <p><a id="qrLink" target="_blank" rel="noopener noreferrer" hidden>Abrir página do participante ↗</a></p>
    <div class="form-actions"><button id="qrPrint" class="btn ghost" disabled>🖨️ Imprimir</button><button id="qrExport" class="btn ghost" disabled>📦 Exportar manifesto offline</button></div>
    <small>Para o modo offline, os arquivos precisam estar armazenados no kit local. Links HTTPS externos não funcionam sem internet.</small>
  </div>
  <p>Registro de acessos e sincronização de quizzes ainda não estão habilitados nesta etapa.</p>`;
  host.replaceChildren(section);
  const q=id=>section.querySelector('#'+id),message=s=>{q('qrMsg').textContent=s;};
  let selected=null,record=null;
  function draw(){
   const a=rows.find(x=>x.id===q('qrAction').value);
   selected=a||null;record=a?docs.find(x=>x.actionId===a.id)||null:null;
   q('qrTitle').value=record?.title||a?.nome||'';
   q('qrDescription').value=record?.description||'';
   q('qrMaterials').value=(record?.materials||[]).map(m=>m.title+' | '+m.url).join('\n');
   const published=record?.published===true;
   q('qrState').textContent=record?(published?'Publicado e acessível ao público.':'Publicação desativada.'):'Sem publicação para esta ação.';
   q('qrSvg').replaceChildren();q('qrLink').hidden=true;q('qrPrint').disabled=true;q('qrExport').disabled=!record;
   if(!published)return;
   const link=publicURL(record.id);let svg='';
   try{svg=qrSvg(link,{scale:5,ariaLabel:'QR Code do evento'});}catch(e){q('qrState').textContent='QR não gerado: '+e.message;return;}
   q('qrSvg').innerHTML=svg;q('qrLink').href=link;q('qrLink').hidden=false;q('qrLink').textContent=link;q('qrPrint').disabled=false;
  }
  q('qrAction').onchange=()=>{message('');draw();};
  q('qrSave').onclick=async()=>{
   if(!canManage||!selected)return message('Selecione uma ação e confirme sua permissão de gestão.');
   try{
    const title=q('qrTitle').value.trim(),description=q('qrDescription').value.trim(),materials=serializeMaterials(q('qrMaterials').value);
    if(!title||title.length>120||description.length>600||materials.length>20)throw Error('Informe título e até 20 materiais.');
    if(!materials.length)throw Error('Inclua pelo menos um material público.');
    const id=record?.id||makeCode();
    const payload={tenantId,actionId:selected.id,title,description,materials,published:true,updatedBy:ctx.access.uid,updatedAt:fs.serverTimestamp()};
    q('qrSave').disabled=true;
    await fs.setDoc(fs.doc(db,'qrPublic',id),payload,{merge:false});
    await refresh();if(!own())return;
    message('Publicação salva no Firestore. Confira o QR Code e teste os links antes da ação.');
    draw();
   }catch(e){message('Não foi possível publicar: '+(e.message||e));}finally{if(own())q('qrSave').disabled=false;}
  };
  q('qrHide').onclick=async()=>{
   if(!record||!canManage)return message('Não há publicação para retirar.');
   if(!confirm('Retirar o conteúdo do acesso público?'))return;
   try{
    await fs.updateDoc(fs.doc(db,'qrPublic',record.id),{published:false,updatedBy:ctx.access.uid,updatedAt:fs.serverTimestamp()});
    await refresh();if(own()){message('Publicação retirada.');draw();}
   }catch(e){message('Erro ao retirar: '+(e.message||e));}
  };
  q('qrPrint').onclick=()=>{if(record?.published)printQR(record.title,publicURL(record.id),q('qrSvg').innerHTML);};
  q('qrExport').onclick=()=>{
   if(!record)return;
   const manifest={schemaVersion:1,actionId:record.id,revision:1,title:record.title,description:record.description,materials:(record.materials||[]).map(m=>({id:m.id,title:m.title,type:m.type,path:'assets/'+m.id+(m.type==='pdf'?'.pdf':'.html'),sourceUrl:m.url})),quiz:null};
   saveDownload('qr-educacao-'+record.id+'.manifest.json',manifest);
   message('Manifesto exportado. Copie os arquivos autorizados para o kit local, nos caminhos indicados; a exportação não baixa os materiais.');
  };
  if(rows.length){q('qrAction').value=rows[0].id;draw();}
 }catch(e){if(host._qrEduSignal===signal)host.innerHTML='<section class="admin-module"><h2>QR Educação 360</h2><p role="alert">Não foi possível carregar o módulo: '+esc(e.message||e)+'</p></section>';}
}
