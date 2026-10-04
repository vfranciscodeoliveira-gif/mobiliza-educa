import {QUESTION_BANK,CATEGORY_IMAGES} from '../data/questionBank.js?v=1';
import {recordAudit,currentUser} from './accessControl.js?v=1';

const KEY='mobiliza.content.questions';
const HISTORY='mobiliza.content.history';
const CATEGORIES='mobiliza.content.categories';
const SEED_VERSION='2026.10';
const now=()=>new Date().toISOString();
const safe=(k,f)=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(f))}catch{return f}};
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,8);

function defaultRow(q){return{
 id:q.id,
 audience:q.audience,
 category:q.category,
 difficulty:q.difficulty,
 prompt:q.prompt,
 options:[...q.options],
 correct:q.correct,
 why:q.why||'',
 image:q.image||CATEGORY_IMAGES[q.category]||null,
 status:'Homologado',
 revision:1,
 source:'base',
 createdAt:null,
 updatedAt:null,
 homologatedAt:'2026-10-01T00:00:00.000Z',
 homologatedBy:'conteúdo base'
};}
function normalizeRow(x){
 return{
  id:String(x.id||uid()).toUpperCase(),
  audience:['criancas','adolescentes','adultos'].includes(x.audience)?x.audience:'criancas',
  category:String(x.category||'geral').trim().toLowerCase(),
  difficulty:['facil','medio','dificil'].includes(x.difficulty)?x.difficulty:'medio',
  prompt:String(x.prompt||'').trim(),
  options:Array.isArray(x.options)?x.options.map(v=>String(v||'').trim()).slice(0,6):[],
  correct:Math.max(0,Number(x.correct)||0),
  why:String(x.why||'').trim(),
  image:x.image||null,
  status:['Rascunho','Em revisão','Homologado','Arquivado'].includes(x.status)?x.status:'Rascunho',
  revision:Math.max(1,Number(x.revision)||1),
  source:x.source||'editorial',
  createdAt:x.createdAt||now(),
  updatedAt:x.updatedAt||now(),
  homologatedAt:x.homologatedAt||null,
  homologatedBy:x.homologatedBy||null
 };
}
export function ensureEditorialSeed(){
 let rows=safe(KEY,null);
 if(!Array.isArray(rows)){
  rows=QUESTION_BANK.map(defaultRow);
  localStorage.setItem(KEY,JSON.stringify(rows));
  localStorage.setItem('mobiliza.content.seedVersion',SEED_VERSION);
 }
 if(!localStorage.getItem(CATEGORIES)){
  const cats=[...new Set(rows.map(x=>x.category).filter(Boolean))].sort().map(id=>({id,name:id.replace(/-/g,' ').replace(/\b\w/g,c=>c.toUpperCase()),active:true}));
  localStorage.setItem(CATEGORIES,JSON.stringify(cats));
 }
 return rows;
}
export function listEditorialQuestions(){return ensureEditorialSeed().map(normalizeRow);}
export function getPublishedQuestions(){
 const rows=listEditorialQuestions().filter(x=>x.status==='Homologado');
 return rows.map(q=>({id:q.id,audience:q.audience,category:q.category,difficulty:q.difficulty,prompt:q.prompt,options:[...q.options],correct:q.correct,why:q.why,image:q.image||CATEGORY_IMAGES[q.category]||null}));
}
export function listCategories(){ensureEditorialSeed();return safe(CATEGORIES,[]);}
export function saveCategory(row){
 const cats=listCategories(),id=String(row.id||row.name||'').trim().toLowerCase().replace(/[^a-z0-9à-ú]+/gi,'-').replace(/^-|-$/g,'');
 if(!id)throw new Error('Informe uma categoria válida.');
 const i=cats.findIndex(x=>x.id===id),saved={id,name:String(row.name||id).trim(),active:row.active!==false};
 if(i>=0)cats[i]=saved;else cats.push(saved);
 localStorage.setItem(CATEGORIES,JSON.stringify(cats));recordAudit('CONTEUDO_CATEGORIA','conteudo',id,saved.name);return saved;
}
function appendHistory(type,row,before=null){
 const all=safe(HISTORY,[]),u=currentUser();
 all.unshift({id:uid(),at:now(),type,questionId:row.id,revision:row.revision,status:row.status,userId:u?.id||'',userName:u?.name||'Sistema',snapshot:row,before});
 localStorage.setItem(HISTORY,JSON.stringify(all.slice(0,5000)));
}
export function listEditorialHistory(){return safe(HISTORY,[]);}
export function saveEditorialQuestion(input){
 const rows=listEditorialQuestions(),i=rows.findIndex(x=>x.id===input.id),before=i>=0?rows[i]:null;
 const row=normalizeRow({...before,...input,revision:before?before.revision+1:1,source:before?.source||'editorial',createdAt:before?.createdAt||now(),updatedAt:now()});
 if(row.options.length<2)throw new Error('Informe pelo menos duas alternativas.');
 if(row.correct>=row.options.length)throw new Error('A alternativa correta não existe.');
 if(!row.prompt)throw new Error('Informe o enunciado.');
 if(!row.why)throw new Error('Informe a explicação pedagógica.');
 if(i>=0)rows[i]=row;else rows.unshift(row);
 localStorage.setItem(KEY,JSON.stringify(rows));appendHistory(before?'EDITADA':'CRIADA',row,before);
 recordAudit('CONTEUDO_EDITADO','questao',row.id,`${row.status} • revisão ${row.revision}`);
 window.dispatchEvent(new CustomEvent('mobiliza-data-change',{detail:{entity:'conteudo',audited:true}}));
 return row;
}
export function setQuestionStatus(id,status){
 if(status==='Homologado'&&currentUser()?.profileId!=='GESTOR')throw new Error('Somente Gestor pode homologar conteúdo.');
 const rows=listEditorialQuestions(),i=rows.findIndex(x=>x.id===id);if(i<0)throw new Error('Questão não encontrada.');
 const before={...rows[i]},row={...rows[i],status,revision:rows[i].revision+1,updatedAt:now()};
 if(status==='Homologado'){const u=currentUser();row.homologatedAt=now();row.homologatedBy=u?.name||'Gestor';}
 rows[i]=row;localStorage.setItem(KEY,JSON.stringify(rows));appendHistory('STATUS',row,before);recordAudit('CONTEUDO_STATUS','questao',id,`${before.status} → ${status}`);
 window.dispatchEvent(new CustomEvent('mobiliza-data-change',{detail:{entity:'conteudo',audited:true}}));return row;
}
export function duplicateQuestion(id){
 const src=listEditorialQuestions().find(x=>x.id===id);if(!src)throw new Error('Questão não encontrada.');
 let n=1,newId;const ids=new Set(listEditorialQuestions().map(x=>x.id));
 do{newId=src.id+'-C'+n++;}while(ids.has(newId));
 return saveEditorialQuestion({...src,id:newId,status:'Rascunho',source:'copia',revision:0,homologatedAt:null,homologatedBy:null,prompt:src.prompt+' (cópia)'});
}
export function questionStats(){
 const rows=listEditorialQuestions();
 return{total:rows.length,published:rows.filter(x=>x.status==='Homologado').length,drafts:rows.filter(x=>x.status==='Rascunho').length,review:rows.filter(x=>x.status==='Em revisão').length,archived:rows.filter(x=>x.status==='Arquivado').length,categories:new Set(rows.map(x=>x.category)).size};
}
export function resetEditorialToBase(){
 const rows=QUESTION_BANK.map(defaultRow);localStorage.setItem(KEY,JSON.stringify(rows));localStorage.setItem(HISTORY,JSON.stringify([]));localStorage.setItem('mobiliza.content.seedVersion',SEED_VERSION);recordAudit('CONTEUDO_RESET','conteudo','','Banco editorial restaurado para a base embarcada.');return rows;
}
