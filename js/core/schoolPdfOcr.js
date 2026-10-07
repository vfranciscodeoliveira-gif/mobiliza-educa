let library;
async function engine(){if(window.Tesseract)return window.Tesseract;if(!library)library=new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/tesseract.min.js';s.onload=()=>window.Tesseract?resolve(window.Tesseract):reject(new Error('OCR indisponível.'));s.onerror=()=>reject(new Error('Não foi possível carregar o OCR. Verifique a conexão e tente novamente.'));document.head.appendChild(s);}).catch(e=>{library=null;throw e;});return library;}
export function clearTableLines(canvas){
 const ctx=canvas.getContext('2d'),im=ctx.getImageData(0,0,canvas.width,canvas.height),{width:w,height:h,data:d}=im,mask=new Uint8Array(w*h),dark=(x,y)=>{const p=(y*w+x)*4;return (d[p]+d[p+1]+d[p+2])/3<150;};
 const mark=(x,y)=>{if(x>=0&&x<w&&y>=0&&y<h)mask[y*w+x]=1;};
 for(let y=0;y<h;y++){let start=-1;for(let x=0;x<=w;x++){if(x<w&&dark(x,y)){if(start<0)start=x;}else if(start>=0){if(x-start>=Math.max(60,w*.045))for(let k=start;k<x;k++)for(let j=-1;j<=1;j++)mark(k,y+j);start=-1;}}}
 for(let x=0;x<w;x++){let start=-1;for(let y=0;y<=h;y++){if(y<h&&dark(x,y)){if(start<0)start=y;}else if(start>=0){if(y-start>=Math.max(60,h*.04))for(let k=start;k<y;k++)for(let j=-1;j<=1;j++)mark(x+j,k);start=-1;}}}
 for(let i=0;i<mask.length;i++)if(mask[i])d[i*4]=d[i*4+1]=d[i*4+2]=255;ctx.putImageData(im,0,0);
}
export async function recognizeSchoolPdf(pdf,onProgress){
 if(pdf.numPages>10)throw new Error('PDF digitalizado: envie até 10 páginas por arquivo para leitura por OCR.');
 const Tesseract=await engine();let pageNumber=1,worker;
 try{worker=await Tesseract.createWorker('por',1,{logger:m=>{if(m.status==='recognizing text')onProgress?.(`OCR: página ${pageNumber} de ${pdf.numPages} — ${Math.round((m.progress||0)*100)}%.`);}});await worker.setParameters({tessedit_pageseg_mode:'6',preserve_interword_spaces:'1'});const texts=[];
 for(pageNumber=1;pageNumber<=pdf.numPages;pageNumber++){onProgress?.(`Preparando OCR: página ${pageNumber} de ${pdf.numPages}.`);const page=await pdf.getPage(pageNumber),vp=page.getViewport({scale:2.5}),canvas=document.createElement('canvas');canvas.width=Math.ceil(vp.width);canvas.height=Math.ceil(vp.height);await page.render({canvasContext:canvas.getContext('2d'),viewport:vp}).promise;clearTableLines(canvas);const {data}=await worker.recognize(canvas);texts.push(data.text);canvas.width=canvas.height=0;page.cleanup();}return texts;
 }catch(e){throw new Error('Não foi possível concluir a leitura OCR: '+e.message);}finally{if(worker)await worker.terminate();}
}
