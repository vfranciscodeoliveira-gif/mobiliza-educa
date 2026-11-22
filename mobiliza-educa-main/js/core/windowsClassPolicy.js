import {normalizeWindows} from './windowsAgendaPolicy.js?v=3';
export function windowsClassData(source,banco,schoolId,pack){
 if(!/^[a-zA-Z0-9_-]{1,80}$/.test(banco||'')||!Number.isSafeInteger(Number(source?.idTurma))||Number(source.idTurma)<1||!schoolId||schoolId.includes('/'))throw new Error('Identificador de turma ou escola inválido.');
 const nome=String(source.descricao||source.nome||'').trim();if(!nome||nome.length>250)throw new Error('Confira o nome da turma.');
 const registro=pack?.integral?.tabelas?.tblTurma?.find(t=>Number(t.idTurma)===Number(source.idTurma))||source;
 const vinculos=(pack?.integral?.tabelas?.tblEventoTurma||[]).filter(t=>Number(t.idTurma)===Number(source.idTurma));
 if(new TextEncoder().encode(JSON.stringify({registro,vinculos})).length>100000)throw new Error('Dados da turma excedem o limite.');
 return {id:`windows-class-${banco}-${Number(source.idTurma)}`,nome,idEscola:schoolId,ano:String(source.serie||''),anoLetivo:String(source.anoLetivo||''),turno:String(source.turno||''),periodo:String(source.periodo||''),letra:String(source.letra||''),quantidadeAlunos:Number(source.quantidadeAlunos||0),ativo:Number(source.ativo??1)!==0,windowsOrigin:{banco,idTurma:Number(source.idTurma),idEscola:Number(source.idEscola),registro,vinculos}};
}
export function matchingWindowsClasses(row,classes){return classes.filter(c=>c.idEscola===row.idEscola&&normalizeWindows(c.nome)===normalizeWindows(row.nome)&&String(c.anoLetivo||'')===row.anoLetivo&&normalizeWindows(c.turno)===normalizeWindows(row.turno));}
export function matchingWindowsSchools(source,banco,schools){const origin=schools.filter(s=>s.windowsOrigin?.banco===banco&&Number(s.windowsOrigin?.idEscola)===Number(source.idEscola));return origin.length?origin:schools.filter(s=>normalizeWindows(s.nome)===normalizeWindows(source.nome));}
