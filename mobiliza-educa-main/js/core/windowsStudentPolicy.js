import {normalizeWindows} from './windowsAgendaPolicy.js?v=3';
export function checkWindowsStudents(p){
 if(!p||p.formato!=='mobiliza-windows-alunos'||Number(p.versao)!==1||!/^[a-zA-Z0-9_-]{1,80}$/.test(p.banco||'')||!Array.isArray(p.escolas)||!Array.isArray(p.turmas)||!Array.isArray(p.alunos)||!p.alunos.length||p.alunos.length>10000)throw new Error('Arquivo de alunos inválido. Use o pacote ou o exportador de alunos do Windows.');
 for(const [rs,key]of [[p.escolas,'idEscola'],[p.turmas,'idTurma'],[p.alunos,'idParticipante']]){const ids=new Set();for(const r of rs){const n=Number(r?.[key]);if(!Number.isSafeInteger(n)||n<1||ids.has(n))throw new Error('ID inválido ou duplicado: '+key);ids.add(n);}}
 const schools=new Set(p.escolas.map(s=>Number(s.idEscola))),classes=new Map(p.turmas.map(t=>[Number(t.idTurma),t]));for(const t of p.turmas)if(!schools.has(Number(t.idEscola)))throw new Error('Escola ausente para turma '+t.idTurma);
 for(const a of p.alunos){const t=classes.get(Number(a.idTurma));if(!t||Number(t.idEscola)!==Number(a.idEscola)||String(a.tipoParticipante||'').toUpperCase()!=='ALUNO')throw new Error('Aluno sem vínculo consistente: '+a.idParticipante);if(!String(a.nome||'').trim()||String(a.nome).trim().length>250)throw new Error('Nome inválido: '+a.idParticipante);}
 return p;
}
export function windowsStudentData(a,banco,classId){
 if(!/^[a-zA-Z0-9_-]{1,80}$/.test(banco||'')||!Number.isSafeInteger(Number(a?.idParticipante))||Number(a.idParticipante)<1||!classId||classId.includes('/'))throw new Error('ID de aluno ou turma inválido.');
 const nome=String(a.nome||'').trim();if(!nome||nome.length>250)throw new Error('Nome de aluno inválido.');if(new TextEncoder().encode(JSON.stringify(a)).length>30000)throw new Error('Dados do aluno excedem o limite.');
 return {id:`windows-student-${banco}-${Number(a.idParticipante)}`,nome,idTurma:classId,dataNascimento:'',responsavel:'',telefoneResponsavel:'',idade:a.idade??null,sexo:String(a.sexo||''),observacao:String(a.observacao||''),telefone:String(a.telefone||''),ativo:Number(a.ativo??1)!==0,windowsOrigin:{banco,idParticipante:Number(a.idParticipante),idTurma:Number(a.idTurma),idEscola:Number(a.idEscola),registro:a}};
}
export function studentNameMatches(a,classId,students){return students.filter(s=>s.idTurma===classId&&normalizeWindows(s.nome)===normalizeWindows(a.nome));}
export function studentOriginMatch(a,banco,students){return students.find(s=>s.id===`windows-student-${banco}-${Number(a.idParticipante)}`||s.windowsOrigin?.banco===banco&&Number(s.windowsOrigin?.idParticipante)===Number(a.idParticipante));}
