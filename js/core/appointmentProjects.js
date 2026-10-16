export const PROJECTS=[
 {id:'agente-mirim',label:'Agente de Trânsito Mirim'},
 {id:'na-pista-certa-mapfre',label:'Na Pista Certa — MAPFRE'},
 {id:'acoes-gerais',label:'Outras ações educativas'}
];
export const projectLabel=id=>PROJECTS.find(p=>p.id===id)?.label||'Sem projeto definido (histórico)';
export const validProject=id=>PROJECTS.some(p=>p.id===id);
export const projectOptions=(selected='')=>PROJECTS.map(p=>'<option value="'+p.id+'"'+(p.id===selected?' selected':'')+'>'+p.label+'</option>').join('');
// Históricos não são redistribuídos automaticamente; o gestor atribui o projeto ao editar.
export function projectMatches(row,projectId){return !projectId||(projectId==='sem-projeto'?!row.projetoId:row.projetoId===projectId);}
