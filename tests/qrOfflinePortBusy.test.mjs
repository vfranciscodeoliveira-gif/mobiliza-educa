import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:net';
import {spawn} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const cwd=fileURLToPath(new URL('../qr-educacao/offline/',import.meta.url));

test('Servidor informa porta ocupada sem imprimir stack trace nem trocar o endereço dos QR Codes',async()=>{
 const blocker=createServer();
 await new Promise((resolve,reject)=>blocker.once('error',reject).listen(0,'127.0.0.1',resolve));
 const port=blocker.address().port;
 try{
  const child=spawn(process.execPath,['server.mjs'],{
   cwd,env:{...process.env,NODE_ENV:'production',HOST:'127.0.0.1',PORT:String(port),ADMIN_TOKEN:'test-token'},
   stdio:['ignore','pipe','pipe']
  });
  let stderr='';
  child.stderr.on('data',chunk=>{stderr+=chunk.toString()});
  const exit=await Promise.race([
   new Promise((resolve,reject)=>{child.once('error',reject);child.once('exit',(code,signal)=>resolve({code,signal}))}),
   new Promise((_,reject)=>setTimeout(()=>reject(Error('Servidor não encerrou após EADDRINUSE')),4000))
  ]).finally(()=>{if(child.exitCode===null)child.kill()});
  assert.equal(exit.code,1);
  assert.match(stderr,/porta .* já está em uso/);
  assert.match(stderr,/Get-NetTCPConnection/);
  assert.match(stderr,/Não altere a porta/);
  assert.doesNotMatch(stderr,/Unhandled 'error' event/);
  assert.equal(blocker.listening,true,'A primeira instância deve continuar ativa');
 }finally{
  await new Promise(resolve=>blocker.close(resolve));
 }
});
