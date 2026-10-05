import {normalizeSchoolText} from './schoolPdfParser.js?v=1';
const clean=s=>String(s||'').replace(/\s+/g,' ').trim();
function metadata(text,context){
 const school=text.match(/^Escola:\s*(?:\d+\s*-\s*)?(.+?)(?:\s+NR\.\s*Classe:|$)/i);if(school)context.schoolName=school[1].trim();
 const year=text.match(/Ano Letivo:\s*(\d{4})/i);if(year)context.anoLetivo=year[1];
 const turma=text.match(/^Turma:\s*(.+)/i)||text.match(/^(\d+[º°o]?\s*(?:ANO|S[ÉE]RIE)\s+[A-Z](?:\s*[-–/]?\s*(?:MANH[ÃA]|TARDE|NOITE|INTEGRAL))?)/i);
 if(turma){const value=turma[1],n=normalizeSchoolText(value);context.nome=value.replace(/\s*[-–/]?\s*(MANH[ÃA]|TARDE|NOITE|INTEGRAL).*$/i,'').trim();context.turno=/MANHA/.test(n)?'Manhã':/TARDE/.test(n)?'Tarde':/NOITE/.test(n)?'Noite':/INTEGRAL/.test(n)?'Integral':'';return true;}
 return false;
}
export function parseSchoolDocxBlocks(blocks){
 const context={schoolName:'',anoLetivo:String(new Date().getFullYear()),nome:'',turno:''},groups=[];let current=null;
 const group=()=>{if(!current){current={...context,schoolCode:'',students:[],key:'docx-'+groups.length};groups.push(current);}return current;};
 for(const block of blocks){
  if(block.type==='paragraph'){
   const priorSchool=context.schoolName;const changedClass=metadata(clean(block.text),context);if(changedClass||priorSchool!==context.schoolName){current=null;continue;}
   const numbered=clean(block.text).match(/^\d+\s*[.)\-–]\s*(.+)$/),name=numbered?.[1]||(block.numbered?clean(block.text):'');
   if(name&&/^[\p{L}\s.'’-]+$/u.test(name)&&name.split(' ').length>=2)group().students.push({nome:name,ra:'',digito:'',uf:'',dataNascimento:'',situacao:'ATIVO'});
  }else if(block.type==='table'){
   const rows=block.rows.map(row=>row.map(clean));let header=-1,nameIndex=-1;
   for(let i=0;i<Math.min(rows.length,10);i++){
    const names=rows[i].map(normalizeSchoolText);const idx=names.findIndex(s=>/^(NOME(?: DO| DOS)? (?:ALUNO|ALUNOS|ESTUDANTE|ESTUDANTES)|ALUNO|ALUNOS|NOME|NOME COMPLETO)$/.test(s));
    if(idx>=0){header=i;nameIndex=idx;break;}
    rows[i].forEach(value=>{if(metadata(value,context))current=null;});
   }
   if(header<0)continue;
   const labels=rows[header].map(normalizeSchoolText),index=(regex)=>labels.findIndex(v=>regex.test(v));
   const raIndex=index(/^(RA|REGISTRO DO ALUNO|MATRICULA)$/),birthIndex=index(/NASCIMENTO/),statusIndex=index(/SITUACAO|STATUS/),digitIndex=index(/DIG/),ufIndex=index(/^UF/);
   for(const row of rows.slice(header+1)){
    const nome=row[nameIndex];if(!nome||normalizeSchoolText(nome)===labels[nameIndex]||!/[\p{L}]/u.test(nome)||normalizeSchoolText(nome).startsWith('TOTAL'))continue;
    const nascimento=birthIndex>=0?row[birthIndex]||'':'',date=nascimento.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    group().students.push({nome,ra:raIndex>=0?row[raIndex]||'':'',digito:digitIndex>=0?row[digitIndex]||'':'',uf:ufIndex>=0?row[ufIndex]||'':'',dataNascimento:date?`${date[3]}-${date[2]}-${date[1]}`:'',situacao:statusIndex>=0?normalizeSchoolText(row[statusIndex]||'ATIVO'):'ATIVO'});
   }
  }
 }
 const nonempty=groups.filter(g=>g.students.length);if(!nonempty.length)throw new Error('Nenhum aluno reconhecido no DOCX. Use tabela com coluna Nome do aluno ou uma lista numerada.');
 if(nonempty.reduce((sum,g)=>sum+g.students.length,0)>5000)throw new Error('Divida a lista em arquivos com até 5.000 alunos.');
 const schools=new Set(nonempty.map(g=>g.schoolName).filter(Boolean));if(schools.size>1)throw new Error('Envie um arquivo por escola.');
 return {schoolName:context.schoolName,schoolCode:'',groups:nonempty,warnings:[],format:'docx'};
}
export function docxXmlBlocks(xml){
 const document=new DOMParser().parseFromString(xml,'application/xml');
 if(document.getElementsByTagName('parsererror').length)throw new Error('O DOCX contém XML inválido.');
 const ns='http://schemas.openxmlformats.org/wordprocessingml/2006/main',body=document.getElementsByTagNameNS(ns,'body')[0];
 if(!body)throw new Error('Conteúdo do DOCX não encontrado.');
 const text=node=>Array.from(node.getElementsByTagNameNS(ns,'p')).map(p=>Array.from(p.getElementsByTagNameNS(ns,'t')).map(t=>t.textContent).join('')).join(' ');
 return Array.from(body.children).flatMap(node=>{
  if(node.localName==='p')return [{type:'paragraph',text:Array.from(node.getElementsByTagNameNS(ns,'t')).map(t=>t.textContent).join(''),numbered:node.getElementsByTagNameNS(ns,'numPr').length>0}];
  if(node.localName==='tbl')return [{type:'table',rows:Array.from(node.children).filter(n=>n.localName==='tr').map(row=>Array.from(row.children).filter(n=>n.localName==='tc').map(text))}];
  return [];
 });
}
