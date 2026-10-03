import { QUESTION_BANK, CATEGORY_IMAGES } from '../data/questionBank.js?v=1';

const RECENT_KEY='mobiliza.questions.recent';
const MAX_RECENT=64;

function shuffle(a){
 const b=[...a];
 for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];}
 return b;
}
function recentKey(scope='global'){return scope==='global'?RECENT_KEY:RECENT_KEY+'.'+scope}
function recentIds(scope='global'){
 try{
  const value=JSON.parse(localStorage.getItem(recentKey(scope))||'[]');
  return Array.isArray(value)?value:[];
 }catch{return[]}
}
function saveRecent(ids,scope='global',limit=MAX_RECENT){
 const old=recentIds(scope);
 const merged=[...ids,...old.filter(x=>!ids.includes(x))].slice(0,Math.max(1,limit));
 localStorage.setItem(recentKey(scope),JSON.stringify(merged));
}
function audiencesMatch(q,audiences){
 if(!audiences||!audiences.length)return true;
 return audiences.includes(q.audience);
}
function difficultyMatch(q,difficulties){
 if(!difficulties||!difficulties.length)return true;
 return difficulties.includes(q.difficulty);
}
function categoryMatch(q,categories){
 if(!categories||!categories.length)return true;
 return categories.includes(q.category);
}
function remapOptions(q){
 const indexed=q.options.map((text,i)=>({text,i}));
 const mixed=shuffle(indexed);
 return {
   id:q.id,audience:q.audience,category:q.category,difficulty:q.difficulty,
   prompt:q.prompt,
   options:mixed.map(x=>x.text),
   correct:mixed.findIndex(x=>x.i===q.correct),
   why:q.why,
   image:q.image||CATEGORY_IMAGES[q.category]||null
 };
}

export function getQuestionSet({
 count=10,
 audiences=[],
 difficulties=[],
 categories=[],
 avoidRecent=true,
 markRecent=true,
 recentScope='global',
 recentLimit=MAX_RECENT
}={}){
 let pool=QUESTION_BANK.filter(q=>audiencesMatch(q,audiences)&&difficultyMatch(q,difficulties)&&categoryMatch(q,categories));
 if(!pool.length)pool=[...QUESTION_BANK];
 const recent=avoidRecent?new Set(recentIds(recentScope)):new Set();
 const fresh=pool.filter(q=>!recent.has(q.id));
 const used=fresh.length>=count?fresh:[...fresh,...pool.filter(q=>recent.has(q.id))];
 const selected=shuffle(used).slice(0,Math.min(count,used.length)).map(remapOptions);
 if(markRecent&&selected.length)saveRecent(selected.map(x=>x.id),recentScope,recentLimit);
 return selected;
}

export function getGameQuestions(game,count){
 const config={
   quiz:{audiences:['criancas'],difficulties:['facil','medio']},
   milhao:{audiences:['criancas','adolescentes'],difficulties:['facil','medio','dificil']},
   trilha:{audiences:['criancas','adolescentes'],difficulties:['facil','medio']},
   adulto:{audiences:['adultos'],difficulties:['facil','medio','dificil']}
 }[game]||{};
 return getQuestionSet({...config,count,recentScope:'game:'+game,recentLimit:Math.min(MAX_RECENT,Math.max(count*3,count))});
}

export function resetRecentQuestions(){
 const keys=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith(RECENT_KEY))keys.push(k)}
 keys.forEach(k=>localStorage.removeItem(k));
}
export function questionStats(scope='global'){
 const r=recentIds(scope);
 return {bank:QUESTION_BANK.length,recent:r.length,remaining:Math.max(0,QUESTION_BANK.length-r.length),scope};
}
