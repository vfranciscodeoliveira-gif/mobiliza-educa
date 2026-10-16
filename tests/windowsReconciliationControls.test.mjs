import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
const ui=await readFile(new URL('../js/modules/windowsReconciliation.js',import.meta.url),'utf8');
test('Controles renderizados antes da configuração de handlers',()=>{
 for(const id of ['wrQueueFilter','wrReviewRows','wrSource','wrTarget','wrCompare','wrComparison']){
  const html=ui.indexOf('id="'+id+'"');
  const handler=ui.indexOf("qs('#"+id+"')");
  assert.ok(html>0,'HTML não cria '+id);
  assert.ok(handler>html,'Handler instalado antes do HTML: '+id);
 }
});
test('A interface permanece sem gravação de dados',()=>assert.doesNotMatch(ui,/\b(?:setDoc|updateDoc|addDoc|deleteDoc|writeBatch)\s*\(/));
