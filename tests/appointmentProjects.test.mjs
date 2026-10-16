import test from 'node:test';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
const src=await readFile(new URL('../js/core/appointmentProjects.js',import.meta.url),'utf8');
const {PROJECTS,projectMatches,validProject}=await import('data:text/javascript;base64,'+Buffer.from(src).toString('base64'));
test('Três projetos separados',()=>{assert.equal(PROJECTS.length,3);assert.ok(validProject('na-pista-certa-mapfre'));assert.ok(validProject('agente-mirim'));});
test('Históricos sem projeto não são classificados automaticamente',()=>{assert.ok(projectMatches({nome:'Atendimento antigo'},'sem-projeto'));assert.equal(projectMatches({nome:'Atendimento antigo'},'agente-mirim'),false);});
test('Projeto explícito isola agendas',()=>{assert.equal(projectMatches({projetoId:'na-pista-certa-mapfre'},'agente-mirim'),false);assert.ok(projectMatches({projetoId:'na-pista-certa-mapfre'},'na-pista-certa-mapfre'));});
