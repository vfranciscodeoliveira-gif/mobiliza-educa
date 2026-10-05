// Parser for school lists with selectable text and the SED table layout.
export const normalizeSchoolText=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/\s+/g,' ').trim();
export function linesFromPdfItems(items){
 const lines=[];
 for(const item of items.filter(i=>i.str?.trim()).sort((a,b)=>b.transform[5]-a.transform[5]||a.transform[4]-b.transform[4])){
  let line=lines.find(l=>Math.abs(l.y-item.transform[5])<2);
  if(!line){line={y:item.transform[5],items:[]};lines.push(line);}line.items.push({text:item.str,x:item.transform[4]});
 }
 return lines.sort((a,b)=>b.y-a.y).map(l=>({items:l.items.sort((a,b)=>a.x-b.x),text:l.items.sort((a,b)=>a.x-b.x).map(i=>i.text).join(' ')}));
}
export function parseSchoolPages(pages){
 const groups=[],schools=new Set(),warnings=[];
 for(let pageIndex=0;pageIndex<pages.length;pageIndex++){
  const lines=pages[pageIndex],text=lines.map(l=>l.text).join('\n');
  const school=text.match(/Escola:\s*(\d+)\s*-\s*(.+?)(?:\s+NR\.\s*Classe:|\n)/i);
  const year=text.match(/Ano Letivo:\s*(\d{4})/i),classInfo=text.match(/Turma:\s*(.+)/i);
  if(!school||!year||!classInfo)throw new Error(`Página ${pageIndex+1}: escola, ano ou turma não reconhecidos. Use uma lista no modelo SED com texto selecionável.`);
  const classText=classInfo[1].trim(),norm=normalizeSchoolText(classText),turno=/MANHA/.test(norm)?'Manhã':/TARDE/.test(norm)?'Tarde':/NOITE/.test(norm)?'Noite':/INTEGRAL/.test(norm)?'Integral':'';
  if(!turno)throw new Error(`Página ${pageIndex+1}: turno não reconhecido.`);
  const expected=Number(text.match(/Cadastrados:\s*(\d+)/i)?.[1]||0),activeExpected=Number(text.match(/Ativos:\s*(\d+)/i)?.[1]||0);
  const group={schoolCode:school[1],schoolName:school[2].trim(),anoLetivo:year[1],nome:classText.replace(/\s+(MANH[ÃA]|TARDE|NOITE|INTEGRAL).*$/i,''),turno,students:[],expected,activeExpected,page:pageIndex+1};
  schools.add(group.schoolCode);let last=null,raX=null;
  for(const line of lines){
   const match=line.text.match(/^\s*(\d+)\s+(\d+)\s+(.+?)\s+(\d{10,14})\s+([\dX])\s+([A-Z]{2})\s+(\d{2}\/\d{2}\/\d{4})\s+([A-Z]+)\b/i);
   if(match){
    const [,serie,numero,nome,ra,digito,uf,nascimento,situacao]=match;
    last={numero:Number(numero),nome:nome.trim(),ra,digito,uf,dataNascimento:nascimento.split('/').reverse().join('-'),situacao:situacao.toUpperCase()};group.students.push(last);
    raX=line.items.find(i=>i.text.trim()===ra)?.x??raX;
   }else if(last&&raX!==null){
    const namePart=line.items.filter(i=>i.x>raX*.18&&i.x<raX-2).map(i=>i.text.trim()).join(' ').trim();
    if(namePart&&/^[\p{L}\s.'’-]+$/u.test(namePart))last.nome+=' '+namePart;
   }
  }
  if(!group.students.length)throw new Error(`Página ${pageIndex+1}: nenhum aluno reconhecido. PDFs escaneados precisam de OCR e revisão antes da importação.`);
  if(expected&&group.students.length!==expected)throw new Error(`Página ${pageIndex+1}: foram lidos ${group.students.length} de ${expected} alunos. A importação foi bloqueada para evitar nomes incompletos.`);
  const active=group.students.filter(s=>s.situacao==='ATIVO').length;
  if(activeExpected&&active!==activeExpected)throw new Error(`Página ${pageIndex+1}: total de ativos não confere com o cabeçalho.`);
  const key=group.schoolCode+'|'+group.anoLetivo+'|'+group.nome+'|'+group.turno,existing=groups.find(g=>g.key===key);
  if(existing)existing.students.push(...group.students);else groups.push({...group,key});
 }
 if(schools.size!==1)throw new Error('O arquivo contém mais de uma escola. Envie um arquivo por escola.');
 return {schoolName:groups[0].schoolName,schoolCode:groups[0].schoolCode,groups,warnings};
}
