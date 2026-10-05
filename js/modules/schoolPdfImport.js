import {educationRows,saveEducation,loadEducation} from '../core/educationRepository.js?v=1';
import {getCloudTenantId} from '../cloudGateway.js?v=6';
import {linesFromPdfItems,parseSchoolPages,normalizeSchoolText} from '../core/schoolPdfParser.js?v=1';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
async function stableId(value){const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));return 'pdf_'+[...new Uint8Array(bytes)].map(b=>b.toString(16).padStart(2,'0')).join('').slice(0,32);}
async function readPdf(file){
 if(!file||file.size>10*1024*1024)throw new Error('Selecione um PDF de até 10 MB.');
 const pdfjs=await import('https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.min.mjs');
 pdfjs.GlobalWorkerOptions.workerSrc='https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs';
 const pdf=await pdfjs.getDocument({data:new Uint8Array(await file.arrayBuffer()),isEvalSupported:false}).promise;
 try{if(pdf.numPages>50)throw new Error('Envie até 50 páginas por arquivo.');const pages=[];
  for(let i=1;i<=pdf.numPages;i++){const page=await pdf.getPage(i);pages.push(linesFromPdfItems((await page.getTextContent()).items));}
  return parseSchoolPages(pages);
 }finally{await pdf.destroy();}
}
export function openSchoolPdfImport(box,onDone){
 let parsed=null,sourceTenant=getCloudTenantId(),busy=false;
 box.hidden=false;box.innerHTML=`<div class="crud-editor-head"><h3>Importar lista de alunos da escola</h3><button type="button" class="icon-btn" id="pdfClose">×</button></div><p>PDF com texto selecionável no modelo de lista SED. Confira a escola, as turmas e os nomes antes de gravar. O arquivo é lido no navegador.</p><input id="schoolPdfFile" type="file" accept="application/pdf,.pdf"><p id="schoolPdfMessage" role="status"></p><div id="schoolPdfPreview"></div>`;
 const message=box.querySelector('#schoolPdfMessage'),preview=box.querySelector('#schoolPdfPreview'),fileInput=box.querySelector('#schoolPdfFile');
 box.querySelector('#pdfClose').onclick=()=>{if(!busy)box.hidden=true;};
 fileInput.onchange=async()=>{
  if(busy)return;parsed=null;preview.innerHTML='';message.textContent='Lendo o PDF...';fileInput.disabled=true;
  try{
   parsed=await readPdf(fileInput.files[0]);sourceTenant=getCloudTenantId();
   const schools=educationRows('escolas'),match=schools.find(s=>normalizeSchoolText(s.nome)===normalizeSchoolText(parsed.schoolName));
   preview.innerHTML=`<p><strong>Escola no PDF:</strong> ${esc(parsed.schoolName)} — código ${esc(parsed.schoolCode)}</p><label>Escola de destino<select id="pdfSchool"><option value="">Selecione a escola correta</option>${schools.map(s=>`<option value="${esc(s.id)}" ${s.id===match?.id?'selected':''}>${esc(s.nome)}</option>`).join('')}<option value="__new">Criar escola com o nome do PDF</option></select></label><label><input type="checkbox" id="pdfBirth"> Incluir data de nascimento</label><p>Somente alunos com situação ATIVO serão importados. RA será usado para identificar duplicados. Informações de deficiência não serão importadas.</p><div class="table-wrap"><table class="admin-table"><thead><tr><th>Turma</th><th>Turno</th><th>Ativos</th><th>Ignorados</th></tr></thead><tbody>${parsed.groups.map(g=>`<tr><td>${esc(g.nome)} — ${esc(g.anoLetivo)}</td><td>${esc(g.turno)}</td><td>${g.students.filter(s=>s.situacao==='ATIVO').length}</td><td>${g.students.filter(s=>s.situacao!=='ATIVO').length}</td></tr>`).join('')}</tbody></table></div>${parsed.groups.map(g=>`<details><summary>Conferir nomes — ${esc(g.nome)} / ${esc(g.turno)}</summary><ol>${g.students.map(s=>`<li>${esc(s.nome)} — ${esc(s.situacao)}</li>`).join('')}</ol></details>`).join('')}<label><input type="checkbox" id="pdfReviewed"> Conferi a escola de destino, as turmas e os nomes.</label><button type="button" class="btn primary" id="pdfSave">Importar turmas e alunos</button>`;
   message.textContent='Leitura concluída. Nada foi gravado ainda.';
   preview.querySelector('#pdfSave').onclick=commit;
  }catch(e){message.textContent=e.message||'Não foi possível ler o PDF.';}finally{fileInput.disabled=false;}
 };
 async function commit(){
  if(busy||!parsed)return;
  const schoolSelection=preview.querySelector('#pdfSchool').value,includeBirth=preview.querySelector('#pdfBirth').checked;
  if(!schoolSelection||!preview.querySelector('#pdfReviewed').checked){message.textContent='Selecione a escola e confirme a revisão antes de importar.';return;}
  if(getCloudTenantId()!==sourceTenant){message.textContent='A organização mudou. Leia o PDF novamente.';return;}
  const existingSchool=educationRows('escolas').find(s=>s.id===schoolSelection);
  if(existingSchool&&normalizeSchoolText(existingSchool.nome)!==normalizeSchoolText(parsed.schoolName)&&!confirm(`O PDF é de ${parsed.schoolName}, mas você selecionou ${existingSchool.nome}. Confirma o vínculo com essa escola?`))return;
  busy=true;box.querySelectorAll('button,input,select').forEach(el=>el.disabled=true);let imported=0,skipped=0,conflicts=0,classesCreated=0;
  try{
   await loadEducation();
   const ensureTenant=()=>{if(getCloudTenantId()!==sourceTenant)throw new Error('A organização mudou. Operação interrompida.');};
   ensureTenant();let school=educationRows('escolas').find(s=>s.id===schoolSelection);
   if(schoolSelection==='__new'){
    school=educationRows('escolas').find(s=>s.codigoEscola===parsed.schoolCode||normalizeSchoolText(s.nome)===normalizeSchoolText(parsed.schoolName));
    if(!school){school={id:await stableId(sourceTenant+'|school|'+parsed.schoolCode),nome:parsed.schoolName,codigoEscola:parsed.schoolCode};await saveEducation('escolas',school);}
   }
   if(!school)throw new Error('Escola de destino não encontrada.');
   for(const group of parsed.groups){
    ensureTenant();let turma=educationRows('turmas').find(t=>t.idEscola===school.id&&normalizeSchoolText(t.nome)===normalizeSchoolText(group.nome)&&t.turno===group.turno&&String(t.anoLetivo||'')===group.anoLetivo);
    if(!turma){turma={id:await stableId(sourceTenant+'|'+school.id+'|'+group.key),nome:group.nome,turno:group.turno,ano:group.nome.split(' ANO')[0]+' ANO',anoLetivo:group.anoLetivo,idEscola:school.id};await saveEducation('turmas',turma);classesCreated++;}
    for(const student of group.students.filter(s=>s.situacao==='ATIVO')){
     ensureTenant();const ra=student.ra+'-'+student.digito+'-'+student.uf;
     const existing=educationRows('alunos').find(a=>a.ra===ra||(a.idTurma===turma.id&&normalizeSchoolText(a.nome)===normalizeSchoolText(student.nome)));
     if(existing){if(existing.idTurma!==turma.id)conflicts++;else skipped++;continue;}
     message.textContent=`Gravando... ${imported} aluno(s) salvo(s).`;
     const row={id:await stableId(sourceTenant+'|'+turma.id+'|'+ra),nome:student.nome,ra,idTurma:turma.id,idEscola:school.id,anoLetivo:group.anoLetivo,situacao:'ATIVO'};
     if(includeBirth)row.dataNascimento=student.dataNascimento;
     await saveEducation('alunos',row);imported++;
    }
   }
   message.textContent=`Concluído: ${classesCreated} turma(s) criada(s), ${imported} aluno(s) importado(s), ${skipped} já cadastrado(s), ${conflicts} conflito(s) de turma não alterado(s).`;
   if(conflicts)message.textContent+=' Confira alunos com o mesmo RA em outra turma.';
   onDone?.();
  }catch(e){message.textContent=`Importação interrompida: ${e.message}. ${imported} aluno(s) já foi(ram) gravado(s). Você pode tentar novamente; os registros existentes serão ignorados.`;}
  finally{busy=false;box.querySelectorAll('button,input,select').forEach(el=>el.disabled=false);}
 }
}
