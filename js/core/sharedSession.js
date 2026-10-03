const PEER_SCRIPT='https://cdn.jsdelivr.net/npm/peerjs@1.5.5/dist/peerjs.min.js';
const QR_SCRIPT='https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js';
const HOST_PREFIX='mobiliza-educa-';

let peerPromise=null;
let qrPromise=null;

function loadScript(src,globalName){
  return new Promise((resolve,reject)=>{
    if(window[globalName]){resolve(window[globalName]);return;}
    const existing=[...document.scripts].find(s=>s.src===src);
    if(existing){
      existing.addEventListener('load',()=>window[globalName]?resolve(window[globalName]):reject(new Error(globalName+' indisponível')),{once:true});
      existing.addEventListener('error',()=>reject(new Error('Falha ao carregar '+src)),{once:true});
      return;
    }
    const s=document.createElement('script');
    s.src=src;
    s.async=true;
    s.crossOrigin='anonymous';
    s.onload=()=>window[globalName]?resolve(window[globalName]):reject(new Error(globalName+' indisponível'));
    s.onerror=()=>reject(new Error('Falha ao carregar '+src));
    document.head.appendChild(s);
  });
}

export function ensurePeer(){
  if(!peerPromise)peerPromise=loadScript(PEER_SCRIPT,'Peer').catch(e=>{peerPromise=null;throw e;});
  return peerPromise;
}

export function ensureQr(){
  if(!qrPromise)qrPromise=loadScript(QR_SCRIPT,'QRCode').catch(e=>{qrPromise=null;throw e;});
  return qrPromise;
}

export function makeSessionCode(){
  const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes=new Uint32Array(6);
  if(window.crypto?.getRandomValues)window.crypto.getRandomValues(bytes);
  else for(let i=0;i<bytes.length;i++)bytes[i]=Math.floor(Math.random()*0xffffffff);
  return [...bytes].map(v=>alphabet[v%alphabet.length]).join('');
}

export function normalizeCode(value=''){
  return String(value).toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,8);
}

export function sessionJoinUrl(code){
  const u=new URL(location.href);
  u.search='';
  u.hash='';
  u.searchParams.set('plateia',normalizeCode(code));
  return u.toString();
}

export async function renderQr(target,text,size=220){
  await ensureQr();
  target.innerHTML='';
  new window.QRCode(target,{
    text,
    width:size,
    height:size,
    colorDark:'#071f37',
    colorLight:'#ffffff',
    correctLevel:window.QRCode.CorrectLevel?.M ?? 0
  });
}

function clientId(){
  const key='mobiliza.plateia.clientId';
  let id=localStorage.getItem(key);
  if(!id){
    const part=()=>Math.random().toString(36).slice(2,10);
    id='p-'+part()+part();
    localStorage.setItem(key,id);
  }
  return id;
}

function waitForOpen(peer,timeout=10000){
  return new Promise((resolve,reject)=>{
    let done=false;
    const finish=(fn,v)=>{if(done)return;done=true;clearTimeout(t);fn(v);};
    const t=setTimeout(()=>finish(reject,new Error('Tempo esgotado ao abrir a conexão.')),timeout);
    peer.once('open',id=>finish(resolve,id));
    peer.once('error',err=>finish(reject,err instanceof Error?err:new Error(String(err))));
  });
}

export async function createHostSession({
  code=makeSessionCode(),
  onParticipants=()=>{},
  onMessage=()=>{},
  onStatus=()=>{}
}={}){
  await ensurePeer();
  code=normalizeCode(code)||makeSessionCode();
  const peerId=HOST_PREFIX+code.toLowerCase();
  const peer=new window.Peer(peerId,{debug:1});
  await waitForOpen(peer);
  onStatus({type:'open',code,peerId});

  const participants=new Map();

  const snapshot=()=>[...participants.values()].map(p=>({
    clientId:p.clientId,
    name:p.name,
    joinedAt:p.joinedAt,
    online:!!p.conn?.open,
    votedRound:p.votedRound||null
  }));

  const notify=()=>onParticipants(snapshot());
  const safeSend=(conn,data)=>{try{if(conn?.open)conn.send(data);}catch{}};
  const broadcast=data=>participants.forEach(p=>safeSend(p.conn,data));
  const sendTo=(id,data)=>{const p=participants.get(id);if(p)safeSend(p.conn,data);};

  const markVoted=(id,roundId)=>{
    const p=participants.get(id);
    if(p){p.votedRound=roundId;notify();}
  };

  const resetVotes=()=>{
    participants.forEach(p=>p.votedRound=null);
    notify();
  };

  peer.on('connection',conn=>{
    let boundClientId=null;

    conn.on('open',()=>safeSend(conn,{type:'host-ready',code,serverTime:Date.now()}));

    conn.on('data',raw=>{
      const data=raw&&typeof raw==='object'?raw:{};
      if(data.type==='hello'){
        const cid=String(data.clientId||'').slice(0,80);
        if(!cid)return;
        boundClientId=cid;
        const old=participants.get(cid);
        if(old?.conn&&old.conn!==conn){try{old.conn.close();}catch{}}
        participants.set(cid,{
          clientId:cid,
          name:String(data.name||'Participante').trim().slice(0,40)||'Participante',
          joinedAt:old?.joinedAt||Date.now(),
          votedRound:old?.votedRound||null,
          conn
        });
        safeSend(conn,{type:'hello-ack',clientId:cid,code});
        notify();
        onMessage({data:{type:'participant-ready',clientId:cid,name:participants.get(cid).name},clientId:cid,conn});
        return;
      }

      const cid=boundClientId||String(data.clientId||'');
      if(!cid||!participants.has(cid))return;
      onMessage({data,clientId:cid,participant:participants.get(cid),conn});
    });

    conn.on('close',()=>{
      if(boundClientId){
        const p=participants.get(boundClientId);
        if(p?.conn===conn){
          participants.delete(boundClientId);
          notify();
          onMessage({data:{type:'participant-left',clientId:boundClientId},clientId:boundClientId});
        }
      }
    });

    conn.on('error',err=>onStatus({type:'connection-error',error:err}));
  });

  peer.on('disconnected',()=>onStatus({type:'disconnected'}));
  peer.on('error',err=>onStatus({type:'error',error:err}));

  const close=()=>{
    try{broadcast({type:'session-closed'});}catch{}
    participants.forEach(p=>{try{p.conn?.close();}catch{}});
    participants.clear();
    try{peer.destroy();}catch{}
    onStatus({type:'closed'});
  };

  return {code,peerId,peer,participants,snapshot,broadcast,sendTo,markVoted,resetVotes,close,joinUrl:sessionJoinUrl(code)};
}

export async function connectParticipant(code,name,{onMessage=()=>{},onStatus=()=>{}}={}){
  await ensurePeer();
  code=normalizeCode(code);
  if(!code)throw new Error('Código de sessão inválido.');

  const peer=new window.Peer(undefined,{debug:1});
  await waitForOpen(peer);

  const id=clientId();
  const hostId=HOST_PREFIX+code.toLowerCase();
  const conn=peer.connect(hostId,{reliable:true,serialization:'json'});

  const ready=new Promise((resolve,reject)=>{
    let settled=false;
    const finish=(fn,v)=>{if(settled)return;settled=true;clearTimeout(timer);fn(v);};
    const timer=setTimeout(()=>finish(reject,new Error('Não foi possível localizar a sessão. Confira o código e a conexão.')),12000);

    conn.on('open',()=>{
      onStatus({type:'connected',code});
      conn.send({type:'hello',clientId:id,name:String(name||'Participante').trim().slice(0,40)||'Participante'});
    });

    conn.on('data',data=>{
      if(data?.type==='hello-ack')finish(resolve,data);
      onMessage(data);
    });

    conn.on('error',err=>finish(reject,err instanceof Error?err:new Error(String(err))));
    conn.on('close',()=>onStatus({type:'closed'}));
  });

  peer.on('error',err=>onStatus({type:'error',error:err}));
  peer.on('disconnected',()=>onStatus({type:'disconnected'}));

  await ready;

  return {
    code,
    clientId:id,
    peer,
    conn,
    send:data=>{try{if(conn.open)conn.send({...data,clientId:id});}catch{}},
    close:()=>{try{conn.close();}catch{}try{peer.destroy();}catch{}}
  };
}
