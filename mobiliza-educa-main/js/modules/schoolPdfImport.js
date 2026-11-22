import {recognizeSchoolPdf} from '../core/schoolPdfOcr.js?v=1';
import {parseScannedSchoolPages} from '../core/schoolScanParser.js?v=1';
import {parseSchoolDocxBlocks,docxXmlBlocks} from '../core/schoolDocxParser.js?v=1';
import {educationRows,saveEducation,loadEducation} from '../core/educationRepository.js?v=2';
import {getCloudTenantId} from '../cloudGateway.js?v=6';
import {linesFromPdfItems,parseSchoolPages,normalizeSchoolText} from '../core/schoolPdfParser.js?v=1';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function stableId(value){const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));return 'pdf_'+[...new Uint8Array(bytes)].map(b=>b.toString(16).padStart(2,'0')).join('').slice(0,32);}
async function readPdf(file,onProgress){
 if(!file||file.size>10*1024*1024)throw new Error('Selecione um PDF de até 10 MB.');
 const pdfjs=await import('https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.min.mjs');
 pdfjs.GlobalWorkerOptions.workerSrc='https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs';
 const pdf=await pdfjs.getDocument({data:new Uint8Array(await file.arrayBuffer()),isEvalSupported:false}).promise;
 try{if(pdf.numPages>50)throw new Error('Envie até 50 páginas por arquivo.');const pages=[];
  for(let i=1;i<=pdf.numPages;i++){const page=await pdf.getPage(i);pages.push(linesFromPdfItems((await page.getTextContent()).items));}
  if(pages.every(p=>!p.length))return parseScannedSchoolPages(await recognizeSchoolPdf(pdf,onProgress));
  if(pages.some(p=>!p.length))throw new Error('PDF com páginas de texto e páginas digitalizadas. Separe os arquivos para conferir a leitura.');
  return parseSchoolPages(pages);
 }finally{await pdf.destroy();}
}
async function readSchoolFile(file,onProgress){
 if(!file||file.size>10*1024*1024)throw new Error('Selecione um PDF ou DOCX de até 10 MB.');
 if(/\.pdf$/i.test(file.name))return readPdf(file,onProgress);
 if(!/\.docx$/i.test(file.name))throw new Error('Formato não suportado. Use PDF ou DOCX; arquivos .doc devem ser salvos como .docx no Word.');
 const {default:JSZip}=await import('https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm');
 const zip=await JSZip.loadAsync(await file.arrayBuffer()),entry=zip.file('word/document.xml');
 if(!entry)throw new Error('Este arquivo não é um DOCX válido.');
 if(entry._data?.uncompressedSize>8*1024*1024)throw new Error('O conteúdo do DOCX é muito grande. Divida a lista.');
 const xml=await entry.async('string');if(xml.length>8*1024*1024)throw new Error('O conteúdo do DOCX é muito grande.');
 return parseSchoolDocxBlocks(docxXmlBlocks(xml));
}
export function openSingleSchoolImport(box,onDone){
 let parsed=null,sourceTenant=getCloudTenantId(),busy=false,completed=false;
 box.hidden=false;box.innerHTML=`<div class="crud-editor-head"><h3>Importar lista de alunos — PDF ou DOCX</h3><button type="button" class="icon-btn" id="pdfClose">×</button></div><p>PDF com texto, PDF digitalizado (OCR) ou DOCX com tabela/lista de alunos. PDFs digitalizados aceitam até 10 páginas e exigem revisão dos nomes. Confira a escola, as turmas e os nomes antes de gravar. O arquivo é lido no navegador.</p><div id="schoolFileDrop" role="button" tabindex="0" aria-label="Selecionar ou soltar lista escolar" style="border:2px dashed #1593aa;border-radius:14px;padding:24px;text-align:center;background:#eef8fb;cursor:pointer"><strong>Arraste e solte aqui um PDF ou DOCX</strong><p>ou clique para escolher — um arquivo de até 10 MB</p></div><input id="schoolPdfFile" type="file" accept="application/pdf,.pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" aria-label="Arquivo da lista escolar"><p id="schoolPdfMessage" role="status"></p><div id="schoolPdfPreview"></div>`;
 const message=box.querySelector('#schoolPdfMessage'),preview=box.querySelector('#schoolPdfPreview'),fileInput=box.querySelector('#schoolPdfFile');
 box.querySelector('#pdfClose').onclick=()=>{if(!busy)box.hidden=true;};
 const drop=box.querySelector('#schoolFileDrop');
 drop.onclick=()=>{if(!busy)fileInput.click();};
 drop.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();if(!busy)fileInput.click();}};
 for(const event of ['dragenter','dragover'])drop.addEventListener(event,e=>{e.preventDefault();e.stopPropagation();if(!busy)drop.style.background='#d7f3f7';});
 drop.addEventListener('dragleave',()=>drop.style.background='#eef8fb');
 drop.addEventListener('drop',e=>{e.preventDefault();e.stopPropagation();drop.style.background='#eef8fb';if(busy)return;if(e.dataTransfer.files.length!==1){message.textContent='Solte um arquivo por vez.';return;}analyze(e.dataTransfer.files[0]);});
 fileInput.onchange=()=>analyze(fileInput.files[0]);
 async function analyze(file){
  if(busy||!file)return;busy=true;completed=false;parsed=null;preview.innerHTML='';message.textContent='Lendo '+file.name+'...';fileInput.disabled=true;
  try{
   parsed=await readSchoolFile(file,t=>message.textContent=t);sourceTenant=getCloudTenantId();
   const schools=educationRows('escolas'),match=schools.find(s=>normalizeSchoolText(s.nome)===normalizeSchoolText(parsed.schoolName));
   preview.innerHTML=`<p><strong>Escola no arquivo:</strong> ${esc(parsed.schoolName||'Não identificada — selecione a escola abaixo')}${parsed.schoolCode?' — código '+esc(parsed.schoolCode):''}</p><label>Escola de destino<select id="pdfSchool"><option value="">Selecione a escola correta</option>${schools.map(s=>`<option value="${esc(s.id)}" ${s.id===match?.id?'selected':''}>${esc(s.nome)}</option>`).join('')}${parsed.schoolName?'<option value="__new">Criar escola com o nome do arquivo</option>':''}</select></label><label ${parsed.ocr?'hidden':''}><input type="checkbox" id="pdfBirth"> Incluir data de nascimento</label>${parsed.ocr?'<p><strong>PDF digitalizado: revisão obrigatória.</strong> O OCR pode trocar letras ou não ler linhas riscadas. Compare com o original; edite os nomes e marque somente os alunos que devem ser importados. Datas de nascimento não são importadas por OCR.</p>':''}${parsed.warnings?.length?'<ul>'+parsed.warnings.map(w=>'<li>'+esc(w)+'</li>').join('')+'</ul>':''}<p>Somente alunos com situação ATIVO serão importados. RA será usado para identificar duplicados. Informações de deficiência não serão importadas.</p><div class="table-wrap"><table class="admin-table"><thead><tr><th>Turma</th><th>Turno</th><th>Ativos</th><th>Ignorados</th></tr></thead><tbody>${parsed.groups.map((g,index)=>`<tr><td><input data-group-name="${index}" aria-label="Nome da turma ${index+1}" value="${esc(g.nome)}" placeholder="Ex.: 2º ANO A"><input data-group-year="${index}" aria-label="Ano letivo da turma ${index+1}" type="number" min="2000" max="2100" value="${esc(g.anoLetivo)}"></td><td><select data-group-shift="${index}" aria-label="Turno da turma ${index+1}"><option value="">Selecione</option>${['Manhã','Tarde','Noite','Integral'].map(turno=>`<option ${turno===g.turno?'selected':''}>${turno}</option>`).join('')}</select></td><td>${g.students.filter(s=>s.situacao==='ATIVO').length}</td><td>${g.students.filter(s=>s.situacao!=='ATIVO').length}</td></tr>`).join('')}</tbody></table></div>${parsed.groups.map((g,gi)=>`<details ${parsed.ocr?'open':''}><summary>Conferir nomes — ${esc(g.nome)} / ${esc(g.turno)}</summary>${parsed.ocr?`<button type="button" class="btn ghost" data-review-group="${gi}">Conferi os nomes desta turma — marcar para importar</button><button type="button" class="btn ghost" data-ocr-add="${gi}">Adicionar aluno não reconhecido</button><div style="overflow:auto"><table><thead><tr><th>Linha</th><th>Nome (editável)</th><th>RA (editável)</th><th>Importar?</th></tr></thead><tbody data-ocr-list="${gi}">${g.students.map((student,si)=>`<tr><td>${esc(student.numero)}</td><td><input data-ocr-name="${gi}:${si}" value="${esc(student.nome)}" aria-label="Nome linha ${student.numero}"></td><td><input data-ocr-ra="${gi}:${si}" value="${esc([student.ra,student.digito].filter(Boolean).join('-'))}" aria-label="RA linha ${student.numero}"></td><td><select data-ocr-status="${gi}:${si}"><option value="CONFERIR" ${student.situacao==='CONFERIR'?'selected':''}>Conferir</option><option value="ATIVO" ${student.situacao==='ATIVO'?'selected':''}>Importar</option><option value="IGNORAR" ${student.situacao==='IGNORAR'?'selected':''}>Não importar</option></select></td></tr>`).join('')}</tbody></table></div>`:`<ol>${g.students.map(student=>`<li>${esc(student.nome)} — ${esc(student.situacao)}</li>`).join('')}</ol>`}</details>`).join('')}<label><input type="checkbox" id="pdfReviewed"> Conferi a escola de destino, as turmas e os nomes.</label><button type="button" class="btn primary" id="pdfSave">Importar turmas e alunos</button>`;
   message.textContent='Leitura concluída. Nada foi gravado ainda.';
   preview.querySelector('#pdfSave').onclick=commit;
   preview.querySelectorAll('[data-review-group]').forEach(button=>button.onclick=()=>{const gi=Number(button.dataset.reviewGroup);preview.querySelectorAll('[data-ocr-status]').forEach(el=>{if(el.dataset.ocrStatus.startsWith(gi+':')&&el.value==='CONFERIR')el.value='ATIVO';});syncOcrReview();});
   preview.querySelectorAll('[data-ocr-name],[data-ocr-ra],[data-ocr-status]').forEach(el=>el.onchange=syncOcrReview);
   preview.querySelectorAll('[data-ocr-add]').forEach(button=>button.onclick=()=>{const gi=Number(button.dataset.ocrAdd),g=parsed.groups[gi],si=g.students.length,key=gi+':'+si;g.students.push({numero:'Manual',nome:'',ra:'',digito:'',uf:'',dataNascimento:'',situacao:'CONFERIR'});const body=preview.querySelector('[data-ocr-list="'+gi+'"]');body.insertAdjacentHTML('beforeend',`<tr><td>Manual</td><td><input data-ocr-name="${key}" aria-label="Nome adicionado"></td><td><input data-ocr-ra="${key}" aria-label="RA adicionado"></td><td><select data-ocr-status="${key}"><option value="CONFERIR">Conferir</option><option value="ATIVO">Importar</option><option value="IGNORAR">Não importar</option></select></td></tr>`);body.querySelectorAll('input,select').forEach(el=>el.onchange=syncOcrReview);syncOcrReview();});
  }catch(e){message.textContent=e.message||'Não foi possível ler o arquivo.';}finally{fileInput.disabled=false;busy=false;}
 }
 function syncOcrReview(){
  if(!parsed?.ocr)return;parsed.groups.forEach((g,gi)=>g.students.forEach((student,si)=>{const key=gi+':'+si;student.nome=preview.querySelector('[data-ocr-name="'+key+'"]').value.trim();const ra=preview.querySelector('[data-ocr-ra="'+key+'"]').value.trim().replace(/[.\s]/g,'');const m=ra.match(/^(\d+)-([0-9X])$/i);student.ra=m?m[1]:ra;student.digito=m?m[2].toUpperCase():'';student.situacao=preview.querySelector('[data-ocr-status="'+key+'"]').value;}));
  preview.querySelectorAll('[data-group-name]').forEach((el,gi)=>{const cells=el.closest('tr').querySelectorAll('td');cells[2].textContent=parsed.groups[gi].students.filter(student=>student.situacao==='ATIVO').length;cells[3].textContent=parsed.groups[gi].students.filter(student=>student.situacao!=='ATIVO').length;});
 }
 function ocrReviewError(){syncOcrReview();if(!parsed?.ocr)return '';if(parsed.groups.some(g=>g.students.some(student=>student.situacao==='CONFERIR')))return 'Confira cada nome do OCR e escolha Importar ou Não importar antes de gravar.';if(parsed.groups.some(g=>g.students.some(student=>student.situacao==='ATIVO'&&!student.nome)))return 'Informe os nomes dos alunos selecionados.';if(!parsed.groups.some(g=>g.students.some(student=>student.situacao==='ATIVO')))return 'Marque ao menos um aluno para importar.';return '';}
 async function commit(){
  if(busy||!parsed)return;const reviewError=ocrReviewError();if(reviewError){message.textContent=reviewError;return;}
  for(let i=0;i<parsed.groups.length;i++){const g=parsed.groups[i];g.nome=preview.querySelector('[data-group-name="'+i+'"]').value.trim();g.turno=preview.querySelector('[data-group-shift="'+i+'"]').value;g.anoLetivo=preview.querySelector('[data-group-year="'+i+'"]').value;if(!g.nome||!g.turno||!/^20\d{2}$/.test(g.anoLetivo)){message.textContent='Informe nome, turno e ano letivo de todas as turmas.';return;}g.key=[g.nome,g.turno,g.anoLetivo].join('|');}
  const schoolSelection=preview.querySelector('#pdfSchool').value,includeBirth=preview.querySelector('#pdfBirth').checked;
  if(!schoolSelection||!preview.querySelector('#pdfReviewed').checked){message.textContent='Selecione a escola e confirme a revisão antes de importar.';return;}
  if(getCloudTenantId()!==sourceTenant){message.textContent='A organização mudou. Leia o arquivo novamente.';return;}
  const existingSchool=educationRows('escolas').find(s=>s.id===schoolSelection);
  if(existingSchool&&parsed.schoolName&&normalizeSchoolText(existingSchool.nome)!==normalizeSchoolText(parsed.schoolName)&&!confirm(`O arquivo é de ${parsed.schoolName}, mas você selecionou ${existingSchool.nome}. Confirma o vínculo com essa escola?`))return;
  busy=true;box.querySelectorAll('button,input,select').forEach(el=>el.disabled=true);let imported=0,skipped=0,conflicts=0,classesCreated=0;
  try{
   await loadEducation();
   const ensureTenant=()=>{if(getCloudTenantId()!==sourceTenant)throw new Error('A organização mudou. Operação interrompida.');};
   ensureTenant();let school=educationRows('escolas').find(s=>s.id===schoolSelection);
   if(schoolSelection==='__new'){
    school=educationRows('escolas').find(s=>(parsed.schoolCode&&s.codigoEscola===parsed.schoolCode)||normalizeSchoolText(s.nome)===normalizeSchoolText(parsed.schoolName));
    if(!school){school={id:await stableId(sourceTenant+'|school|'+(parsed.schoolCode||normalizeSchoolText(parsed.schoolName))),nome:parsed.schoolName,codigoEscola:parsed.schoolCode};await saveEducation('escolas',school);}
   }
   if(!school)throw new Error('Escola de destino não encontrada.');
   for(const group of parsed.groups){
    ensureTenant();let turma=educationRows('turmas').find(t=>t.idEscola===school.id&&normalizeSchoolText(t.nome)===normalizeSchoolText(group.nome)&&t.turno===group.turno&&String(t.anoLetivo||'')===group.anoLetivo);
    if(!turma){turma={id:await stableId(sourceTenant+'|'+school.id+'|'+group.key),nome:group.nome,turno:group.turno,ano:group.nome.split(' ANO')[0]+' ANO',anoLetivo:group.anoLetivo,idEscola:school.id};await saveEducation('turmas',turma);classesCreated++;}
    for(const student of group.students.filter(s=>s.situacao==='ATIVO')){
     ensureTenant();const ra=student.ra?[student.ra,student.digito,student.uf].filter(Boolean).join('-'):'';
     const existing=educationRows('alunos').find(a=>(ra&&a.ra===ra)||(a.idTurma===turma.id&&normalizeSchoolText(a.nome)===normalizeSchoolText(student.nome)));
     if(existing){if(existing.idTurma!==turma.id)conflicts++;else skipped++;continue;}
     message.textContent=`Gravando... ${imported} aluno(s) salvo(s).`;
     const row={id:await stableId(sourceTenant+'|'+turma.id+'|'+(ra||normalizeSchoolText(student.nome))),nome:student.nome,ra,idTurma:turma.id,idEscola:school.id,anoLetivo:group.anoLetivo,situacao:'ATIVO'};
     if(includeBirth&&student.dataNascimento)row.dataNascimento=student.dataNascimento;
     await saveEducation('alunos',row);imported++;
    }
   }
   message.textContent=`Concluído: ${classesCreated} turma(s) criada(s), ${imported} aluno(s) importado(s), ${skipped} já cadastrado(s), ${conflicts} conflito(s) de turma não alterado(s).`;
   if(conflicts)message.textContent+=' Confira alunos com o mesmo RA em outra turma.';
   completed=true;onDone?.();
  }catch(e){message.textContent=`Importação interrompida: ${e.message}. ${imported} aluno(s) já foi(ram) gravado(s). Você pode tentar novamente; os registros existentes serão ignorados.`;}
  finally{busy=false;box.querySelectorAll('button,input,select').forEach(el=>el.disabled=false);}
 }
 return {analyze,commit,state:()=>({parsed:!!parsed,busy,completed,message:message.textContent}),validate:()=>{
  if(!parsed)return 'Arquivo não reconhecido: '+message.textContent;const reviewError=ocrReviewError();if(reviewError)return reviewError;
  if(!preview.querySelector('#pdfSchool')?.value||!preview.querySelector('#pdfReviewed')?.checked)return 'Selecione a escola e confirme a revisão.';
  for(let i=0;i<parsed.groups.length;i++){
   if(!preview.querySelector('[data-group-name="'+i+'"]').value.trim()||!preview.querySelector('[data-group-shift="'+i+'"]').value||!/^20\d{2}$/.test(preview.querySelector('[data-group-year="'+i+'"]').value))return 'Informe turma, turno e ano letivo.';
  }
  if(getCloudTenantId()!==sourceTenant)return 'A organização mudou. Leia o arquivo novamente.';
  return '';
 }};

}


export function openSchoolPdfImport(box,onDone){
 const entries=[];let processing=false;
 box.hidden=false;
 box.innerHTML=`<div class="crud-editor-head"><h3>Importar listas de escolas — PDF e DOCX</h3><button type="button" class="icon-btn" id="batchClose">×</button></div><div id="schoolBatchDrop" role="button" tabindex="0" aria-label="Selecionar ou soltar listas escolares" style="border:2px dashed #1593aa;border-radius:14px;padding:24px;text-align:center;background:#eef8fb;cursor:pointer"><strong>Arraste e solte vários PDFs ou DOCX aqui</strong><p>ou clique para selecionar — até 20 arquivos, 10 MB por arquivo</p></div><input id="schoolBatchFiles" type="file" multiple accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"><p id="schoolBatchMessage" role="status">Adicione os arquivos e revise cada prévia antes de importar.</p><div id="schoolBatchList" class="admin-tabs"></div><div id="schoolBatchPreviews"></div><button type="button" class="btn primary" id="schoolBatchSave" disabled>Importar arquivos revisados</button>`;
 const drop=box.querySelector('#schoolBatchDrop'),input=box.querySelector('#schoolBatchFiles'),message=box.querySelector('#schoolBatchMessage'),list=box.querySelector('#schoolBatchList'),previews=box.querySelector('#schoolBatchPreviews'),save=box.querySelector('#schoolBatchSave');
 const select=entry=>{for(const item of entries){item.pane.hidden=item!==entry;item.button.classList.toggle('active',item===entry);}};
 const refresh=()=>{entries.forEach(entry=>{const state=entry.controller.state();entry.button.textContent=entry.name+' — '+(state.completed?'Importado':state.parsed?'Revisar':'Erro de leitura');});save.disabled=processing||!entries.some(e=>e.controller.state().parsed&&!e.controller.state().completed);};
 box.querySelector('#batchClose').onclick=()=>{if(!processing)box.hidden=true;};
 async function addFiles(files){
  if(processing||!files.length)return;
  if(entries.length+files.length>20){message.textContent='A fila aceita até 20 arquivos. Termine este lote antes de abrir outro.';return;}
  processing=true;input.disabled=true;save.disabled=true;
  try{
   for(const file of files){
    message.textContent='Lendo '+file.name+'...';
    const pane=document.createElement('div'),button=document.createElement('button');button.type='button';button.className='admin-tab';button.textContent=file.name+' — Lendo';previews.appendChild(pane);list.appendChild(button);
    const controller=openSingleSchoolImport(pane),entry={name:file.name,pane,button,controller};entries.push(entry);button.onclick=()=>select(entry);select(entry);
    // The queue owns file selection. Per-file controls only review this file.
    pane.querySelector('#schoolFileDrop').hidden=true;pane.querySelector('#schoolPdfFile').hidden=true;pane.querySelector('#pdfClose').hidden=true;
    await controller.analyze(file);
    const perFileSave=pane.querySelector('#pdfSave');if(perFileSave)perFileSave.hidden=true;
    refresh();
   }
   message.textContent=entries.length+' arquivo(s) na fila. Clique em cada arquivo para revisar escola e turmas. Arquivos com erro de leitura serão ignorados.';
  }finally{processing=false;input.disabled=false;refresh();}
 }
 input.onchange=()=>{addFiles(Array.from(input.files));input.value='';};
 drop.onclick=()=>{if(!processing)input.click();};
 drop.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();if(!processing)input.click();}};
 for(const type of ['dragenter','dragover'])drop.addEventListener(type,e=>{e.preventDefault();e.stopPropagation();if(!processing)drop.style.background='#d7f3f7';});
 drop.addEventListener('dragleave',()=>drop.style.background='#eef8fb');
 drop.addEventListener('drop',e=>{e.preventDefault();e.stopPropagation();drop.style.background='#eef8fb';addFiles(Array.from(e.dataTransfer.files));});
 save.onclick=async()=>{
  if(processing)return;
  const pending=entries.filter(e=>e.controller.state().parsed&&!e.controller.state().completed);
  for(const entry of pending){const error=entry.controller.validate();if(error){select(entry);message.textContent=entry.name+': '+error;return;}}
  processing=true;input.disabled=true;save.disabled=true;previews.querySelectorAll('button,input,select').forEach(el=>el.disabled=true);let finished=0;
  try{
   for(const entry of pending){select(entry);message.textContent='Importando '+entry.name+'...';await entry.controller.commit();refresh();
    if(!entry.controller.state().completed){message.textContent='Lote interrompido em '+entry.name+': '+entry.controller.state().message;return;}
    finished++;
   }
   const invalid=entries.filter(e=>!e.controller.state().parsed).length;
   message.textContent='Lote concluído: '+finished+' arquivo(s) importado(s) nesta execução; '+invalid+' com erro de leitura não importado(s). Confira o resumo individual de cada arquivo.';
  }finally{processing=false;input.disabled=false;previews.querySelectorAll('button,input,select').forEach(el=>el.disabled=false);refresh();onDone?.();}
 };
}

