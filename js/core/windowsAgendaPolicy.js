import {validateAppointment} from './appointmentPolicy.js?v=1';
export const normalizeWindows=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]/g,'');
export function checkWindowsPackage(p){
 if(!p||Number(p.versao)!==1||!Array.isArray(p.escolas)||!Array.isArray(p.turmas)||!Array.isArray(p.agendamentos))throw new Error('Arquivo de agenda do Windows inválido. Use o exportador fornecido.');
 if(!p.agendamentos.length||p.agendamentos.length>2000)throw new Error('Importe de 1 a 2000 agendamentos por arquivo.');
 for(const [items,key] of [[p.escolas,'idEscola'],[p.turmas,'idTurma'],[p.agendamentos,'idAgenda']]){const seen=new Set();for(const r of items){if(!Number.isSafeInteger(Number(r[key]))||Number(r[key])<1||seen.has(String(r[key])))throw new Error('ID ausente ou duplicado em '+key);seen.add(String(r[key]));}}
 if(!/^[a-zA-Z0-9_-]{1,80}$/.test(p.banco||''))throw new Error('Identificador do banco inválido.');return p;
}
export function windowsDocumentId(p,row){return `windows-agenda-${p.banco}-${row.idAgenda}`;}
export function windowsStatus(row){if(Number(row.ativo)===0)return 'Cancelado';const s=normalizeWindows(row.status);return ({solicitado:'Solicitado',planejado:'Planejado',confirmado:'Confirmado',emandamento:'Em andamento',concluido:'Concluído',cancelado:'Cancelado',reagendado:'Planejado'})[s]||'';}
export function schoolSuggestion(source,schools){const found=schools.filter(s=>normalizeWindows(s.nome)===normalizeWindows(source.nome));return found.length===1?found[0].id:'';}
export function mapWindowsAppointment(p,row,schoolId,status,ctx){
 const school=p.escolas.find(s=>String(s.idEscola)===String(row.idEscola));
 const isSchool=!!row.idEscola||!!school;
 const ids=[];for(const oldId of row.idsTurmas||[]){const t=p.turmas.find(t=>String(t.idTurma)===String(oldId));if(!t)throw new Error('Turma Windows não encontrada: '+oldId);const found=ctx.classes.filter(c=>c.idEscola===schoolId&&normalizeWindows(c.nome)===normalizeWindows(t.nome)&&String(c.anoLetivo)===String(t.anoLetivo)&&normalizeWindows(c.turno)===normalizeWindows(t.turno));if(found.length!==1)throw new Error('Confira o vínculo da turma '+t.nome+' ('+t.anoLetivo+').');ids.push(found[0].id);}
 const begin=String(row.dataInicio||''),end=String(row.dataFim||'');
 const note=[row.observacoes||'',`Origem Windows: ${p.banco} / agenda ${row.idAgenda}. Status original: ${row.status||''}.`,row.programa?'Programa: '+row.programa:'',row.turno?'Turno: '+row.turno:'',`Quantidade de turmas no Windows: ${row.quantidadeTurmas||0}.`,!ids.length?'Sem vínculo de turmas específicas na origem; confira após importar.':'',row.prioridade?'Prioridade: '+row.prioridade:''].filter(Boolean).join('\n');
 const d={nome:String(row.titulo||row.programa||''),origem:isSchool?'Escola':'Demanda espontânea',tipo:'Outro',status,idEscola:isSchool?schoolId:'',idsTurmas:ids,solicitante:isSchool?'':String(row.contatoEscola||row.unidadeEscolar||row.titulo||''),contato:String(row.contatoEscola||''),telefone:String(row.telefone||''),email:'',publico:String(row.turno||''),dataInicio:begin.slice(0,10),horaInicio:begin.slice(11,16),dataFim:end.slice(0,10),horaFim:end.slice(11,16),local:String(row.endereco||''),responsavel:String(row.responsavel||''),previsto:Number(row.publicoEstimado||0),realizado:0,vagas:0,materiais:'',equipe:'',observacao:note};
 const prog=normalizeWindows(row.programa);if(prog.includes('agentedetransitomirim'))d.tipo='Agente de Trânsito Mirim';else if(prog.includes('palestra'))d.tipo='Palestra';
 return validateAppointment(d,ctx.schools,ctx.classes);
}
