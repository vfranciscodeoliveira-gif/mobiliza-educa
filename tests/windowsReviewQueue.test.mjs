import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../js/core/windowsReviewQueue.js',import.meta.url),'utf8');
const {buildWindowsReviewQueue}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
test('Conserva divergências separadas, sem criar equivalências',()=>{
const report={rows:[{agendaId:35,escola:'Escola teste',inicio:'2026-08-26',statusOriginal:'CONCLUÍDO',issues:['sem_correspondencia_online'],onlineIds:[]}],onlineWithoutMatch:[{id:'online-1',source:null}]};
const online=[{id:'online-1',nome:'Palestra',dataInicio:'2026-10-16',status:'Planejado'}];
const review=buildWindowsReviewQueue(report,online);
assert.equal(review.sourceOnly,1);assert.equal(review.onlineOnly,1);
assert.equal(review.items[0].onlineId,null);assert.equal(review.items[1].onlineId,'online-1');
assert.equal(review.items[0].name,'Escola teste');
});
