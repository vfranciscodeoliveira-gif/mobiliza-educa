const PREF_KEY='mobiliza.sound.enabled';
let ctx=null,master=.75;

function enabled(){return localStorage.getItem(PREF_KEY)!=='0'}
function context(){
 if(!enabled())return null;
 try{
  const C=window.AudioContext||window.webkitAudioContext;
  if(!C)return null;
  if(!ctx)ctx=new C();
  if(ctx.state==='suspended')ctx.resume();
  return ctx;
 }catch{return null}
}
function tone(freq,duration=.07,delay=0,type='sine',gain=.035){
 const c=context();if(!c)return;
 const o=c.createOscillator(),g=c.createGain(),t=c.currentTime+delay;
 o.type=type;o.frequency.setValueAtTime(freq,t);
 g.gain.setValueAtTime(.0001,t);
 g.gain.exponentialRampToValueAtTime(Math.max(.0002,gain*master),t+.01);
 g.gain.exponentialRampToValueAtTime(.0001,t+duration);
 o.connect(g);g.connect(c.destination);o.start(t);o.stop(t+duration+.03);
}
const cues={
 click:()=>tone(520,.035,0,'square',.018),
 open:()=>{tone(392,.05);tone(523,.06,.055);},
 correct:()=>{tone(523,.07);tone(659,.07,.075);tone(784,.14,.15);},
 wrong:()=>{tone(300,.08,0,'sawtooth',.025);tone(205,.13,.09,'sawtooth',.02);},
 bonus:()=>{tone(659,.06,0,'triangle',.035);tone(784,.06,.065,'triangle',.038);tone(988,.14,.13,'triangle',.04);},
 warning:()=>{tone(760,.045,0,'square',.018);tone(760,.045,.1,'square',.018);},
 timeout:()=>{tone(280,.09,0,'sawtooth',.022);tone(210,.12,.1,'sawtooth',.02);tone(150,.18,.22,'sawtooth',.018);},
 next:()=>{tone(440,.035,0,'triangle',.015);tone(554,.045,.04,'triangle',.016);},
 flip:()=>tone(650,.035,0,'triangle',.018),
 step:()=>tone(380,.03,0,'square',.014),
 dice:()=>{tone(250,.035,0,'square',.016);tone(410,.05,.04,'square',.016);},
 finish:()=>{tone(523,.07);tone(659,.07,.07);tone(784,.08,.14);tone(1046,.22,.22);},
 celebrate:()=>{tone(659,.06);tone(784,.06,.06);tone(988,.08,.12);tone(1318,.2,.2);}
};

export const SoundManager={
 play(name){try{(cues[name]||cues.click)()}catch{}},
 isEnabled(){return enabled()},
 setEnabled(value){localStorage.setItem(PREF_KEY,value?'1':'0');if(value){context();cues.open()}},
 toggle(){const v=!enabled();this.setEnabled(v);return v},
 setVolume(value){master=Math.max(.1,Math.min(1,Number(value)||.75))},
 cue(name){return()=>this.play(name)}
};
