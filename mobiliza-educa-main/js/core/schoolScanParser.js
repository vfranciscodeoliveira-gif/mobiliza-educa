import {normalizeSchoolText} from './schoolPdfParser.js?v=1';
export function parseScannedSchoolPages(pages){
 const groups=[],warnings=['Leitura por OCR: confira cada nome, RA e alunos riscados/transferidos no PDF original.'];let schoolName='';
 for(let i=0;i<pages.length;i++){
  const text=pages[i],lines=text.split(/\r?\n/).map(s=>s.replace(/[|_]/g,' ').replace(/\s+/g,' ').trim()).filter(Boolean),norm=normalizeSchoolText(text);
  const header=norm.match(/(\d+)\s*[º°O]?\s*ANO\s*[-–]\s*([A-Z])\s*[-–]\s*(MANHA|TARDE|NOITE|INTEGRAL)\s*[-–]\s*(20\d{2})/);
  if(!header)throw new Error(`Página ${i+1}: turma, turno e ano não reconhecidos pelo OCR. Envie uma digitalização mais nítida ou uma lista DOCX.`);
  const school=lines.find(s=>/^E[.\s]*M[.\s]*[-–]|^ESCOLA\b/i.test(s));if(school&&!schoolName)schoolName=school.replace(/^\W+/,'').trim();
  const students=[],seen=new Set();
  for(const line of lines){
   const row=line.match(/^[\s\[(']*([0-9]{1,2})[\]\s.)-]+(.+)/);if(!row)continue;const numero=Number(row[1]);if(numero<1||numero>99||seen.has(numero))continue;
   const tail=row[2],raMatch=tail.match(/\b(\d{2,3}[.\s]\d{3}[.\s]\d{3})\s*[-–.]\s*([0-9X])\b/i),firstNumber=tail.search(/\d/),rawName=raMatch?tail.slice(0,raMatch.index):firstNumber>=0?tail.slice(0,firstNumber):tail;
   const nome=rawName.replace(/[^\p{L}\s.'’–-]/gu,'').replace(/[–—-]+$/g,'').replace(/\s+/g,' ').trim();if(!/^[\p{L}\s.'’-]+$/u.test(nome)||nome.split(/\s+/).length<2)continue;
   const date=tail.match(/\b(\d{2})\/(\d{2})\/(\d{4})\b/),transferred=/TRANSF|TRANSFER|\bD[.]?M[.]?/i.test(tail.slice(rawName.length));
   students.push({numero,nome,ra:raMatch?raMatch[1].replace(/\D/g,''):'',digito:raMatch?.[2]?.toUpperCase()||'',uf:'',dataNascimento:'',situacao:transferred?'IGNORAR':'CONFERIR'});seen.add(numero);
  }
  if(!students.length)throw new Error(`Página ${i+1}: nenhum nome legível pelo OCR. Envie uma digitalização mais nítida.`);
  const highest=students[students.length-1].numero,missing=Array.from({length:highest},(_,j)=>j+1).filter(n=>!seen.has(n));if(missing.length)warnings.push(`Página ${i+1}: linhas não reconhecidas (${missing.join(', ')}). Confira com o PDF; não serão importadas automaticamente.`);
  const nome=`${header[1]}º ANO ${header[2]}`,turno=({MANHA:'Manhã',TARDE:'Tarde',NOITE:'Noite',INTEGRAL:'Integral'})[header[3]],anoLetivo=header[4];groups.push({nome,turno,anoLetivo,students,key:[i,nome,turno,anoLetivo].join('|'),page:i+1});
 }
 if(new Set(groups.map(g=>g.anoLetivo)).size>1)warnings.push('O documento informa anos letivos diferentes entre as turmas. Confira cada ano; não foi corrigido automaticamente.');
 return {schoolName,schoolCode:'',groups,warnings,ocr:true};
}
