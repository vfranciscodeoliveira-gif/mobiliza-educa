const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');const root=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(root,p),'utf8');
const editor=read('convites/lorena-15/editor.html'),invite=read('convites/lorena-15/index.html'),rules=read('firestore.rules'),storage=read('storage.rules');
test('frontend scripts can be parsed',()=>{for(const html of [editor,invite])for(const m of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)){const code=m[2].replace(/^import[^\n]*;\s*$/gm,'');assert.doesNotThrow(()=>new Function('return (async()=>{'+code+'})'), 'Invalid JavaScript inside HTML')}});
test('publisher has authentication, role check and no anonymous edits',()=>{assert.match(editor,/signInWithEmailAndPassword/);assert.match(editor,/platformOwners/);assert.match(editor,/owner\.data\(\)\.active!==true/);assert.match(rules,/match \/publicInvites\/\{inviteId\}/);assert.match(rules,/allow create,update: if owner\(\)/);assert.match(rules,/allow list: if false/);assert.match(storage,/public-invites\/lorena-15/);assert.match(storage,/request\.resource\.size < 5 \* 1024 \* 1024/)});
test('gallery uses public GitHub Pages links without browser GitHub tokens',()=>{
 assert.match(editor,/const photoUrl=name/);
 assert.match(editor,/addGithubPhoto/);
 assert.doesNotMatch(editor,/getStorage\(/);
 assert.doesNotMatch(editor,/uploadBytes\(/);
 assert.doesNotMatch(editor,/deleteObject\(/);
 assert.doesNotMatch(editor,/GITHUB_TOKEN|ghp_/);
});
test('public page uses published document, countdown and safe dialog output',()=>{assert.match(invite,/snap\.data\(\)\.publicado===true/);assert.match(invite,/eventDate=data\.data/);assert.match(invite,/container\.replaceChildren\(\)/);assert.ok(invite.indexOf('id="galeria"')<invite.indexOf('</main>'))});
test('public invitation has no active RSVP until secure backend exists',()=>{assert.match(invite,/Confirmações ainda não habilitadas/);assert.doesNotMatch(invite,/collection\(db,\s*['"]confirmacoes/);});

test('editor exposes configurable layouts, colors and animation controls',()=>{
 for(const id of ['estilo','paleta','corFundo','corDestaque','corTitulo','fundo','fonte','animacoes'])assert.match(editor,new RegExp('id="'+id+'"'));
 for(const mode of ['encantado','moderno','floral','noite'])assert.ok(editor.includes('value="'+mode+'"'));
 assert.match(editor,/presetColors/);
 assert.match(editor,/function preview\(\)/);
});
test('visual options are applied to public page only after approved publication',()=>{
 assert.match(invite,/snap\.data\(\)\.publicado===true/);
 assert.match(invite,/allowedStyle\.includes\(data\.estilo\)/);
 assert.match(invite,/validHex\(data\.corFundo\)/);
 assert.match(invite,/effects-off/);
 for(const key of ['estilo','paleta','corFundo','corDestaque','corTitulo','fundo','fonte','animacoes'])assert.ok(rules.includes("'"+key+"'"));
});

test('controles de musica e experiencia sao persistidos e aplicados',()=>{for(const name of ['musicaAtiva','musicaArquivo','musicaVolume','abrirEnvelope','mostrarContador','mostrarGaleria','mostrarPresentes']){assert.ok(editor.includes('id="'+name+'"'));assert.ok(rules.includes("'"+name+"'"));assert.ok(invite.includes('data.'+name))}assert.match(invite,/new Audio/);assert.match(editor,/testeMusica/);});
