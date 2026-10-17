import {readFile,access} from 'node:fs/promises';import path from 'node:path';import assert from 'node:assert/strict';import {test} from 'node:test';
const root=process.cwd(),visited=new Set(),errors=[];
async function inspect(filename){if(visited.has(filename))return;visited.add(filename);let code;try{code=await readFile(path.join(root,filename),'utf8')}catch{errors.push('Arquivo ausente: '+filename);return}
const imports=[...code.matchAll(/(?:import|export)\s+(?:[\s\S]*?\s+from\s*)?['"]([^'"]+)['"]/g)];
for(const match of imports){const name=match[1].split('?')[0];if(!name.startsWith('.'))continue;const dest=path.posix.normalize(path.posix.join(path.posix.dirname(filename),name));if(!dest.startsWith('js/'))continue;await inspect(dest);}
}
test('Todas as dependências relativas da aplicação pública existem',async()=>{await inspect('js/app.js');await inspect('js/publicBootstrap.js');assert.deepEqual(errors,[]);});
