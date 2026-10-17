const plain=x=>String(x??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase().replace(/\s+/g,' ');
export const SEMOB_PRESET=Object.freeze({name:'SEMOB — Presidente Prudente',legalName:'Secretaria Municipal de Mobilidade Urbana',municipality:'Presidente Prudente',state:'SP',type:'ORGAO_PUBLICO_MUNICIPAL'});
export function normalizeInstitutionDraft(data,existing=[]){
 const name=String(data.name||'').trim(),legalName=String(data.legalName||'').trim();
 const municipality=String(data.municipality||'').trim(),state=String(data.state||'').trim().toUpperCase(),type=String(data.type||'').trim();
 if(name.length<3||name.length>180)throw new Error('Nome institucional deve conter de 3 a 180 caracteres.');
 if(municipality.length<2||municipality.length>100)throw new Error('Informe o município.');
 if(!/^[A-Z]{2}$/.test(state))throw new Error('Informe a UF com duas letras.');
 if(!['ORGAO_PUBLICO_MUNICIPAL','ESCOLA','ENTIDADE_PARCEIRA','OUTRO'].includes(type))throw new Error('Tipo institucional inválido.');
 if(legalName.length>180)throw new Error('Razão/denominação muito longa.');
 const normalized=plain(name),city=plain(municipality);
 if(existing.some(item=>plain(item.name)===normalized&&plain(item.municipality||'')===city&&String(item.state||'').toUpperCase()===state))throw new Error('Instituição já cadastrada neste município. Selecione o cadastro existente.');
 return {name,legalName,municipality,state,type};
}
