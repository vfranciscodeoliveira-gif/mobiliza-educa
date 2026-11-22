import {readFile} from 'node:fs/promises';
import {test} from 'node:test';
import assert from 'node:assert/strict';
const source=await readFile(new URL('../js/core/schoolPdfParser.js',import.meta.url),'utf8');
const {parseSchoolPages,linesFromPdfItems}=await import('data:text/javascript;base64,'+Buffer.from(source).toString('base64'));
const line=text=>({text,items:[]});
function page(){return [line('Ano Letivo: 2026'),line('Escola: 123 - ESCOLA EXEMPLO NR. Classe: 456'),line('Turma: 2° ANO A MANHA ANUAL'),line('Ativos: 1 Cadastrados: 2'),{text:'2 1 ALUNO EXEMPLO 000123456789 X SP 12/03/2018 ATIVO',items:[{text:'000123456789',x:220}]},{text:'SOBRENOME AUTISTA INFANTIL',items:[{text:'SOBRENOME',x:90},{text:'AUTISTA INFANTIL',x:540}]},line('2 2 ALUNA EXEMPLO 000987654321 1 SP 20/01/2018 REMA')];}
test('recompõe nomes quebrados e mantém situação sem importar deficiência',()=>{const result=parseSchoolPages([page()]);assert.equal(result.groups[0].students[0].nome,'ALUNO EXEMPLO SOBRENOME');assert.equal(result.groups[0].students[1].situacao,'REMA');assert.equal(result.groups[0].turno,'Manhã');assert.equal(JSON.stringify(result).includes('AUTISTA'),false);});
test('bloqueia leitura incompleta em vez de gravar lista parcial',()=>{const rows=page();rows.pop();assert.throws(()=>parseSchoolPages([rows]),/lidos 1 de 2/);});
test('bloqueia mistura de escolas',()=>{const second=page();second[1]=line('Escola: 789 - OUTRA ESCOLA NR. Classe: 456');assert.throws(()=>parseSchoolPages([page(),second]),/mais de uma escola/);});
test('não aceita PDF sem cabeçalho identificável',()=>assert.throws(()=>parseSchoolPages([[line('Texto sem lista')]]),/não reconhecidos/));
test('agrupa itens por linha e ordena colunas',()=>{const items=[{str:'B',transform:[1,0,0,1,100,50]},{str:'A',transform:[1,0,0,1,20,50]},{str:'C',transform:[1,0,0,1,20,30]}];assert.deepEqual(linesFromPdfItems(items).map(l=>l.text),['A B','C']);});
