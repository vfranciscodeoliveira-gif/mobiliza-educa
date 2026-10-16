import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../js/core/windowsLinkPreview.js',import.meta.url),'utf8');
const {previewWindowsLink}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const report={rows:[{agendaId:35,escola:'Escola A',inicio:'2026-08-26',statusOriginal:'CONCLUÍDO',onlineIds:[]},{agendaId:2,onlineIds:['ocupado']}],onlineWithoutMatch:[{id:'livre'}]};
test('Produz somente prévia sem confirmar vínculo',()=>{const r=previewWindowsLink(report,[{id:'livre',nome:'Atendimento'}],35,'livre');assert.equal(r.mode,'preview_only');assert.equal(r.onlineId,'livre');assert.equal(r.requiresExplicitConfirmation,true);});
test('Bloqueia associação de agendamento online já atribuído',()=>{assert.throws(()=>previewWindowsLink(report,[{id:'ocupado'}],35,'ocupado'),/já vinculado/);});
test('Bloqueia substituição de origem existente',()=>{assert.throws(()=>previewWindowsLink(report,[{id:'livre',windowsSource:{agendaId:20}}],35,'livre'),/já tem origem/);});
test('Bloqueia vínculo de histórico já associado',()=>{assert.throws(()=>previewWindowsLink(report,[{id:'livre'}],2,'livre'),/já possui correspondência/);});
