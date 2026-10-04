// Gerador QR local, sem dependências externas.
// Usa QR Code versão 5-L (até 106 bytes UTF-8), adequado a URLs de check-in e tokens Mobiliza Educa.
function gfMul(x,y){let z=0;while(y){if(y&1)z^=x;y>>>=1;x<<=1;if(x&0x100)x^=0x11d;}return z&255;}
function rsDivisor(degree){const r=Array(degree).fill(0);r[degree-1]=1;let root=1;for(let i=0;i<degree;i++){for(let j=0;j<degree;j++){r[j]=gfMul(r[j],root);if(j+1<degree)r[j]^=r[j+1];}root=gfMul(root,2);}return r;}
function rsRemainder(data,div){const r=Array(div.length).fill(0);for(const b of data){const factor=b^r[0];r.shift();r.push(0);for(let i=0;i<r.length;i++)r[i]^=gfMul(div[i],factor);}return r;}
function appendBits(arr,val,len){for(let i=len-1;i>=0;i--)arr.push((val>>>i)&1);}

export function qrMatrix(text){
 const bytes=[...new TextEncoder().encode(String(text||''))];
 if(bytes.length>106)throw new Error('Conteúdo muito longo para o QR interno.');
 const bits=[];appendBits(bits,4,4);appendBits(bits,bytes.length,8);for(const b of bytes)appendBits(bits,b,8);
 const cap=108*8;for(let i=0;i<Math.min(4,cap-bits.length);i++)bits.push(0);while(bits.length%8)bits.push(0);
 const data=[];for(let i=0;i<bits.length;i+=8){let b=0;for(let j=0;j<8;j++)b=(b<<1)|bits[i+j];data.push(b);}for(let pad=0;data.length<108;pad++)data.push(pad%2?0x11:0xec);
 const code=[...data,...rsRemainder(data,rsDivisor(26))],size=37;
 const m=Array.from({length:size},()=>Array(size).fill(false)),fn=Array.from({length:size},()=>Array(size).fill(false));
 const setF=(x,y,v)=>{if(x>=0&&y>=0&&x<size&&y<size){m[y][x]=!!v;fn[y][x]=true;}};
 for(let i=0;i<size;i++){setF(6,i,i%2===0);setF(i,6,i%2===0);}
 const finder=(cx,cy)=>{for(let dy=-4;dy<=4;dy++)for(let dx=-4;dx<=4;dx++){const d=Math.max(Math.abs(dx),Math.abs(dy));setF(cx+dx,cy+dy,d!==2&&d!==4);}};
 finder(3,3);finder(size-4,3);finder(3,size-4);
 for(let dy=-2;dy<=2;dy++)for(let dx=-2;dx<=2;dx++)setF(30+dx,30+dy,Math.max(Math.abs(dx),Math.abs(dy))!==1);
 const mask=0,formatData=(1<<3)|mask;let rem=formatData;for(let i=0;i<10;i++)rem=(rem<<1)^(((rem>>>9)&1)*0x537);
 const fmt=((formatData<<10)|rem)^0x5412,bit=i=>((fmt>>>i)&1)!==0;
 for(let i=0;i<=5;i++)setF(8,i,bit(i));setF(8,7,bit(6));setF(8,8,bit(7));setF(7,8,bit(8));
 for(let i=9;i<15;i++)setF(14-i,8,bit(i));for(let i=0;i<8;i++)setF(size-1-i,8,bit(i));for(let i=8;i<15;i++)setF(8,size-15+i,bit(i));setF(8,size-8,true);
 let bi=0;
 for(let right=size-1;right>=1;right-=2){if(right===6)right=5;for(let vert=0;vert<size;vert++){const up=((right+1)&2)===0,y=up?size-1-vert:vert;for(let j=0;j<2;j++){const x=right-j;if(fn[y][x])continue;let v=false;if(bi<code.length*8)v=((code[bi>>>3]>>>(7-(bi&7)))&1)!==0;m[y][x]=v;bi++;}}}
 for(let y=0;y<size;y++)for(let x=0;x<size;x++)if(!fn[y][x]&&((x+y)%2===0))m[y][x]=!m[y][x];
 return m;
}

export function qrSvg(text,{scale=5,quiet=4,ariaLabel='QR Code'}={}){
 const m=qrMatrix(text),n=m.length+quiet*2,px=n*scale;let d='';
 for(let y=0;y<m.length;y++)for(let x=0;x<m.length;x++)if(m[y][x])d+=`M${x+quiet} ${y+quiet}h1v1h-1z`;
 return `<svg xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${String(ariaLabel).replace(/"/g,'&quot;')}" viewBox="0 0 ${n} ${n}" width="${px}" height="${px}" shape-rendering="crispEdges"><rect width="100%" height="100%" fill="#fff"/><path d="${d}" fill="#000"/></svg>`;
}

export function makeCheckinToken(prefix='Q'){
 const raw=(Date.now().toString(36)+Math.random().toString(36).slice(2,10)).toUpperCase().replace(/[^A-Z0-9]/g,'');
 return String(prefix||'Q').slice(0,2).toUpperCase()+raw.slice(-11);
}
