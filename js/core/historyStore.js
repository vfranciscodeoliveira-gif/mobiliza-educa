const KEY='mobiliza.history.v1';
const MAX_ITEMS=500;

const cleanText=(v,max=120)=>String(v??'').trim().slice(0,max);
const num=v=>Number.isFinite(Number(v))?Number(v):0;
const nullableNum=v=>v===null||v===undefined||v===''?null:(Number.isFinite(Number(v))?Number(v):null);

function readAll(){
  try{
    const x=JSON.parse(localStorage.getItem(KEY)||'[]');
    return Array.isArray(x)?x:[];
  }catch{return []}
}
function writeAll(items){
  localStorage.setItem(KEY,JSON.stringify(items.slice(0,MAX_ITEMS)));
  window.dispatchEvent(new CustomEvent('mobiliza-history-change',{detail:{count:items.length}}));
}
function safeMeta(meta){
  if(!meta||typeof meta!=='object'||Array.isArray(meta))return {};
  const out={};
  Object.entries(meta).slice(0,20).forEach(([k,v])=>{
    const key=cleanText(k,40);
    if(!key)return;
    if(typeof v==='string')out[key]=cleanText(v,160);
    else if(typeof v==='number'||typeof v==='boolean'||v===null)out[key]=v;
    else if(Array.isArray(v))out[key]=v.slice(0,10).map(x=>typeof x==='string'?cleanText(x,80):x);
  });
  return out;
}

export function recordGameResult(input={}){
  const answers=Math.max(0,num(input.answers));
  const correct=Math.max(0,num(input.correct));
  const score=num(input.score);
  const item={
    id:(crypto?.randomUUID?.()||('h-'+Date.now()+'-'+Math.random().toString(36).slice(2))).slice(0,90),
    at:new Date().toISOString(),
    kind:cleanText(input.kind||'game',30),
    moduleId:cleanText(input.moduleId||'unknown',60),
    title:cleanText(input.title||input.moduleId||'Atividade',100),
    score,
    correct,
    answers,
    accuracy:answers?Math.round(correct/answers*100):null,
    durationSec:nullableNum(input.durationSec),
    level:input.level==null?'':cleanText(input.level,60),
    audience:input.audience==null?'':cleanText(input.audience,60),
    difficulty:input.difficulty==null?'':cleanText(input.difficulty,60),
    status:input.status==null?'concluido':cleanText(input.status,60),
    participants:nullableNum(input.participants),
    votes:nullableNum(input.votes),
    meta:safeMeta(input.meta)
  };
  const list=readAll();
  list.unshift(item);
  writeAll(list);
  return item;
}

export function getGameHistory({kind,moduleId,limit=MAX_ITEMS}={}){
  let list=readAll();
  if(kind)list=list.filter(x=>x.kind===kind);
  if(moduleId)list=list.filter(x=>x.moduleId===moduleId);
  return list.slice(0,Math.max(1,Math.min(MAX_ITEMS,Number(limit)||MAX_ITEMS)));
}

export function getHistorySummary(){
  const list=readAll();
  const byModule={};
  for(const x of list){
    const id=x.moduleId||'unknown';
    if(!byModule[id])byModule[id]={moduleId:id,title:x.title||id,kind:x.kind||'game',plays:0,scoreTotal:0,bestScore:null,correct:0,answers:0,durationTotal:0,durationCount:0,lastAt:null};
    const g=byModule[id];
    g.plays++;
    g.scoreTotal+=num(x.score);
    g.bestScore=g.bestScore===null?num(x.score):Math.max(g.bestScore,num(x.score));
    g.correct+=num(x.correct);
    g.answers+=num(x.answers);
    if(Number.isFinite(Number(x.durationSec))){g.durationTotal+=Number(x.durationSec);g.durationCount++}
    if(!g.lastAt||String(x.at)>String(g.lastAt))g.lastAt=x.at;
  }
  Object.values(byModule).forEach(g=>{
    g.accuracy=g.answers?Math.round(g.correct/g.answers*100):null;
    g.avgScore=g.plays?Math.round(g.scoreTotal/g.plays):0;
    g.avgDurationSec=g.durationCount?Math.round(g.durationTotal/g.durationCount):null;
  });
  return {count:list.length,byModule:Object.values(byModule).sort((a,b)=>b.plays-a.plays),recent:list.slice(0,20)};
}

export function clearGameHistory(){
  localStorage.removeItem(KEY);
  window.dispatchEvent(new CustomEvent('mobiliza-history-change',{detail:{count:0,cleared:true}}));
}

export function exportHistoryCsv(){
  const list=readAll();
  const cols=['data','tipo','modulo','titulo','pontuacao','acertos','respostas','aproveitamento','duracao_seg','nivel','publico','dificuldade','status','participantes','votos'];
  const rows=[cols.join(';')];
  const q=v=>'"'+String(v??'').replace(/"/g,'""')+'"';
  for(const x of list){
    rows.push([
      x.at,x.kind,x.moduleId,x.title,x.score,x.correct,x.answers,x.accuracy??'',x.durationSec??'',x.level,x.audience,x.difficulty,x.status,x.participants??'',x.votes??''
    ].map(q).join(';'));
  }
  return rows.join('\n');
}
