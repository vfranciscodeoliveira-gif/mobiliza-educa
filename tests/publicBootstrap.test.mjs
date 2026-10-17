import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
const app=await readFile(new URL('../js/app.js',import.meta.url),'utf8');
const fallback=await readFile(new URL('../js/publicBootstrap.js',import.meta.url),'utf8');
test('Bootstrap independente carrega antes do app completo',()=>{assert.ok(html.indexOf('publicBootstrap.js')<html.indexOf('src="js/app.js'));assert.match(fallback,/from '\.\/content\.js/);assert.doesNotMatch(fallback,/firebase|cloudGateway/);});
test('App principal sinaliza conclusão de render',()=>assert.match(app,/__mobilizaMainReady=true/));
test('Bootstrap possui módulos e navegação mínima sem gestor',()=>{assert.match(fallback,/audienceGrid/);assert.match(fallback,/gameGrid/);assert.match(fallback,/learningGrid/);assert.match(fallback,/data-public-view/);});
