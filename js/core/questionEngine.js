import { QUESTION_BANK, CATEGORY_IMAGES } from '../data/questionBank.js?v=1';

const RECENT_KEY='mobiliza.questions.recent';
const MAX_RECENT=36;

function shuffle(a){
 const b=[...a];
 for(let i=b.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[b[i],b[j]]=[b[j],b[i]];}
 return b;
}
function recentIds(){
 try{return JSON.parse(localStorage.getItem(RECENT_KEY)||'[]')}catch{return[]}
}
function saveRecent(ids){
 const old=recentIds();
 const merged=[...ids,...old.filter(x=>!ids.includes(x))].slice(0,MAX_RECENT);
 localStorage.setItem(RECENT_KEY,JSON.stringify(merged));
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
 markRecent=true
}={}){
 let pool=QUESTION_BANK.filter(q=>audiencesMatch(q,audiences)&&difficultyMatch(q,difficulties)&&categoryMatch(q,categories));
 if(!pool.length)pool=[...QUESTION_BANK];
 const recent=avoidRecent?new Set(recentIds()):new Set();
 const fresh=pool.filter(q=>!recent.has(q.id));
 const used=fresh.length>=count?fresh:[...fresh,...pool.filter(q=>recent.has(q.id))];
 const selected=shuffle(used).slice(0,Math.min(count,used.length)).map(remapOptions);
 if(markRecent&&selected.length)saveRecent(selected.map(x=>x.id));
 return selected;
}

export function getGameQuestions(game,count){
 const config={
   quiz:{audiences:['criancas'],difficulties:['facil','medio']},
   milhao:{audiences:['criancas','adolescentes'],difficulties:['facil','medio','dificil']},
   trilha:{audiences:['criancas','adolescentes'],difficulties:['facil','medio']},
   adulto:{audiences:['adultos'],difficulties:['facil','medio','dificil']}
 }[game]||{};
 return getQuestionSet({...config,count});
}

export function resetRecentQuestions(){localStorage.removeItem(RECENT_KEY)}
export function questionStats(){
 const r=recentIds();
 return {bank:QUESTION_BANK.length,recent:r.length,remaining:Math.max(0,QUESTION_BANK.length-r.length)};
}
