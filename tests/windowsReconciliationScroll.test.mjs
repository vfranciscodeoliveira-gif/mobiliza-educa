import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
const source=await readFile(new URL('../js/modules/windowsReconciliation.js',import.meta.url),'utf8');
test('Rolagem acessível e restrita ao painel',()=>{assert.match(source,/wrTableScroll/);assert.match(source,/overscroll-behavior:contain/);assert.match(source,/scrollIntoView/);assert.match(source,/wrTitle.*tabindex/);});
test('Painel não grava alterações no Firestore',()=>{assert.doesNotMatch(source,/\b(?:setDoc|updateDoc|addDoc|deleteDoc|writeBatch)\s*\(/)});
