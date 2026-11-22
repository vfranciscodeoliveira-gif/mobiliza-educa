import {getPublishedQuestions} from './contentRepository.js?v=1';

const AUD_TO_CODE={criancas:'C',adolescentes:'T',adultos:'A'};
const CODE_TO_AUD={C:'criancas',T:'adolescentes',A:'adultos'};

function hash32(s){
 let h=2166136261>>>0;
 for(const ch of String(s||'')){h^=ch.charCodeAt(0);h=Math.imul(h,16777619);}
 return h>>>0;
}
function rng(seed){
 let a=hash32(seed)||1;
 return ()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
}
function shuffle(arr,seed){
 const out=[...arr],r=rng(seed);
 for(let i=out.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[out[i],out[j]]=[out[j],out[i]];}
 return out;
}
export function assessmentQuestionIds({audience='criancas',count=8,seed='MOBILIZA',phase='PRE'}={}){
 const pool=getPublishedQuestions().filter(q=>q.audience===audience);
 const mixed=shuffle(pool,seed+'|BASE');
 const pre=[],post=[];
 for(let i=0;i<mixed.length;i++){(i%2===0?pre:post).push(mixed[i].id);}
 const chosen=(String(phase).toUpperCase()==='POS'?post:pre);
 if(chosen.length>=count)return chosen.slice(0,count);
 return shuffle(pool.map(q=>q.id),seed+'|'+phase).slice(0,Math.min(count,pool.length));
}
export function resolveAssessmentQuestions(ids=[]){
 const map=new Map(getPublishedQuestions().map(q=>[q.id,q]));
 return ids.map(id=>map.get(id)).filter(Boolean);
}
export function scoreAssessment(questionIds=[],answers=[]){
 const qs=resolveAssessmentQuestions(questionIds);let correct=0;
 const details=qs.map((q,i)=>{const selected=Number(answers[i]);const ok=selected===q.correct;if(ok)correct++;return{id:q.id,category:q.category,correct:ok,selected};});
 return{correct,total:qs.length,pct:qs.length?Math.round(correct*100/qs.length):0,details};
}
export function makeShortCode(len=5){
 return Math.random().toString(36).slice(2,2+len).toUpperCase().padEnd(len,'X');
}
export function audienceCode(a){return AUD_TO_CODE[a]||'C';}
export function audienceFromCode(c){return CODE_TO_AUD[String(c||'').toUpperCase()]||'criancas';}

export function buildInviteToken({planCode,participantCode,phase,audience,count,seed}){
 return [planCode,participantCode,String(phase).toUpperCase()==='POS'?'O':'P',audienceCode(audience),Number(count)||8,String(seed||'MOBILIZA')].join('.');
}
export function parseInviteToken(token){
 const [planCode,participantCode,p,aud,count,seed]=String(token||'').split('.');
 if(!planCode||!participantCode||!seed)return null;
 return{planCode,participantCode,phase:p==='O'?'POS':'PRE',audience:audienceFromCode(aud),count:Math.max(1,Math.min(15,Number(count)||8)),seed};
}
export function buildResultToken({planCode,participantCode,phase,answers=[]}){
 return ['MZAR',planCode,participantCode,String(phase).toUpperCase()==='POS'?'O':'P',answers.map(x=>Math.max(0,Math.min(9,Number(x)||0))).join('')].join('|');
}
export function parseResultToken(raw){
 const s=String(raw||'').trim(),parts=s.split('|');
 if(parts[0]!=='MZAR'||parts.length<5)return null;
 return{planCode:parts[1],participantCode:parts[2],phase:parts[3]==='O'?'POS':'PRE',answers:[...parts[4]].map(x=>Number(x))};
}
