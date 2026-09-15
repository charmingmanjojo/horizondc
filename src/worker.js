import { createClient } from '@supabase/supabase-js';
import { verifyKey } from 'discord-interactions';

const DISCORD_API = 'https://discord.com/api/v10';
const EPHEMERAL = 64;
const ADMIN = 0x8n;

const SPECIES = [
  ['human','Human'],['metahuman','Metahuman'],['kryptonian','Kryptonian'],['atlantean','Atlantean'],['amazonian','Amazonian'],['alien','Alien / Other']
];
const AFFILIATIONS = [
  ['none','None / Independent'],['justice league','Justice League'],['a.r.g.u.s.','A.R.G.U.S.'],['plumbers','P.L.U.M.B.E.R.S.'],['s.t.a.r. laboratories','S.T.A.R. Laboratories'],['league of assassins','League of Assassins'],['order of st. dumas','Order of St. Dumas'],['challengers of the unknown','Challengers of the Unknown'],
  ['green lantern corps','Green Lantern Corps'],['blue lantern corps','Blue Lantern Corps'],['yellow lantern corps','Yellow Lantern Corps'],['red lantern corps','Red Lantern Corps'],['orange lantern corps','Orange Lantern Corps'],['indigo tribe','Indigo Tribe'],['star sapphires','Star Sapphires'],['black lantern corps','Black Lantern Corps'],['white lantern corps','White Lantern Corps']
];
const MANTLES = [['none','None'],['superman','Superman'],['wonder woman','Wonder Woman'],['aquaman','Aquaman']];

const THEMES = {
  default: 0x3c5f8a,
  kryptonian: 0x2563eb,
  atlantean: 0x0284c7,
  amazonian: 0xeab308,
  metahuman: 0x9333ea,
  alien: 0x84cc16,
  'green lantern corps': 0x16a34a,
  'blue lantern corps': 0x2563eb,
  'yellow lantern corps': 0xeab308,
  'red lantern corps': 0xdc2626,
  'orange lantern corps': 0xea580c,
  'indigo tribe': 0x7c3aed,
  'star sapphires': 0xdb2777,
  'black lantern corps': 0x111827,
  'white lantern corps': 0xe5e7eb,
  superman: 0xdc2626,
  'wonder woman': 0xeab308,
  aquaman: 0x0284c7,
  batman: 0xfacc15,
  robin: 0xf59e0b,
};

const BASELINES = {
  kryptonian: 'Solar absorption\nEnhanced strength, speed, durability, and senses\nFlight\nHeat vision and freeze breath\nSolar energy dependence',
  atlantean: 'Underwater breathing\nEnhanced strength and durability\nPressure resistance\nEnhanced swimming\nSurface adaptation',
  amazonian: 'Enhanced physicality\nLongevity\nAdvanced martial training\nWeapon familiarity',
  'green lantern corps': 'Power ring\nConstruct creation\nEnergy projection\nFlight\nProtective aura / environmental seal\nRing charge requirement',
  'blue lantern corps': 'Power ring\nConstruct creation\nEnergy projection\nFlight\nProtective aura / environmental seal\nRing charge requirement',
  'yellow lantern corps': 'Power ring\nConstruct creation\nEnergy projection\nFlight\nProtective aura / environmental seal\nRing charge requirement',
  'red lantern corps': 'Red power ring\nRage-based energy projection\nFlight\nProtective aura\nRing charge requirement',
  'orange lantern corps': 'Orange power ring\nConstruct creation\nEnergy projection\nFlight\nProtective aura / environmental seal\nRing charge requirement',
  'indigo tribe': 'Indigo ring / staff\nEnergy projection\nFlight\nProtective aura / environmental seal\nCharge requirement',
  'star sapphires': 'Star Sapphire ring\nConstruct creation\nEnergy projection\nFlight\nProtective aura / environmental seal\nRing charge requirement',
  'black lantern corps': 'Black power ring\nCorp-specific ring functions\nFlight\nProtective aura\nRing charge requirement',
  'white lantern corps': 'White power ring\nCorp-specific ring functions\nFlight\nProtective aura\nRing charge requirement',
};

function db(env) {
  return createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
}
function lower(v){ return String(v||'').trim().toLowerCase(); }
function isLantern(v){ v=lower(v); return v.includes('lantern') || v==='indigo tribe' || v==='star sapphires'; }
function colorFor(c){
  const b=c?.data?.basic||{}; const a=lower(b.affiliation); const m=lower(b.alias); const s=lower(b.species);
  if (isLantern(a) && THEMES[a]) return THEMES[a];
  if (THEMES[m]) return THEMES[m];
  if (THEMES[a]) return THEMES[a];
  return THEMES[s] || THEMES.default;
}
function completion(c){
  const d=c?.data||{}; const req=[d.basic?.name,d.basic?.age,d.basic?.species,d.appearance?.description,d.personality?.summary,d.history?.summary];
  return Math.round(req.filter(v=>String(v||'').trim()).length/req.length*100);
}
function baselineFor(c){
  const b=c?.data?.basic||{}; const chunks=[];
  if(BASELINES[lower(b.species)]) chunks.push(BASELINES[lower(b.species)]);
  if(BASELINES[lower(b.affiliation)]) chunks.push(BASELINES[lower(b.affiliation)]);
  return chunks.join('\n\n');
}
function sheetEmbed(c){
  const d=c.data||{}, b=d.basic||{}, a=d.appearance||{}, p=d.personality||{}, ab=d.abilities||{}, h=d.history||{}, rp=d.rp||{};
  return {
    title: `${b.name || 'Unnamed Character'}${b.alias ? ` — ${b.alias}`:''}`,
    description: `**Status:** ${String(c.status).replaceAll('_',' ').toUpperCase()}\n**Completion:** ${completion(c)}%`,
    color: colorFor(c),
    fields: [
      {name:'Basic Information', value:`**Age:** ${b.age||'—'}\n**Species:** ${b.species||'—'}\n**Affiliation:** ${b.affiliation||'None'}\n**Occupation:** ${b.occupation||'—'}\n**Origin:** ${b.origin||'—'}`, inline:false},
      {name:'Appearance', value:(a.description||'Not provided').slice(0,1024), inline:false},
      {name:'Personality', value:(p.summary||'Not provided').slice(0,1024), inline:false},
      {name:'Abilities / Equipment', value:(ab.summary||baselineFor(c)||'Not provided').slice(0,1024), inline:false},
      {name:'History', value:(h.summary||'Not provided').slice(0,1024), inline:false},
      {name:'RP Information', value:(rp.notes||'Not provided').slice(0,1024), inline:false},
    ],
    footer:{text:'Detective Comics: Horizon'}
  };
}
function select(custom_id, placeholder, values, current){
  return {type:1,components:[{type:3,custom_id,placeholder,min_values:1,max_values:1,options:values.map(([value,label])=>({label,value,default:lower(current)===value}))}]};
}
function editorComponents(c){
  const id=c.id,b=c.data?.basic||{};
  return [
    select(`species:${id}`,'Select species',SPECIES,b.species),
    select(`affiliation:${id}`,'Select affiliation',AFFILIATIONS,b.affiliation),
    select(`mantle:${id}`,'Select major mantle',MANTLES,b.alias),
    {type:1,components:[
      {type:2,style:2,label:'Basic',custom_id:`edit:${id}:basic`},
      {type:2,style:2,label:'Appearance',custom_id:`edit:${id}:appearance`},
      {type:2,style:2,label:'Personality',custom_id:`edit:${id}:personality`},
      {type:2,style:2,label:'Abilities',custom_id:`edit:${id}:abilities`},
      {type:2,style:2,label:'History',custom_id:`edit:${id}:history`}
    ]},
    {type:1,components:[
      {type:2,style:2,label:'RP Info',custom_id:`edit:${id}:rp`},
      {type:2,style:1,label:'Preview',custom_id:`preview:${id}`},
      {type:2,style:3,label:'Submit',custom_id:`submit:${id}`,disabled:completion(c)<100 || c.status==='pending'}
    ]}
  ];
}
function modalFor(c,tab){
  const d=c.data?.[tab]||{}, id=c.id;
  const inp=(cid,label,value='',style=1,required=false,max_length=1000)=>({type:1,components:[{type:4,custom_id:cid,label,style,required,max_length,value:String(value||'').slice(0,max_length)}]});
  let components=[];
  if(tab==='basic') components=[inp('name','Character Name',d.name,1,true,100),inp('age','Age',d.age,1,true,50),inp('occupation','Occupation',d.occupation,1,false,100),inp('origin','Origin / Nationality / Homeworld',d.origin,2,false,700)];
  if(tab==='appearance') components=[inp('description','Appearance',d.description,2,true,1800),inp('height','Height',d.height,1,false,80),inp('build','Build',d.build,1,false,120)];
  if(tab==='personality') components=[inp('summary','Personality',d.summary,2,true,2000),inp('goals','Goals / Motivations',d.goals,2,false,900),inp('flaws','Flaws / Fears',d.flaws,2,false,900)];
  if(tab==='abilities') components=[inp('summary','Abilities / Equipment',d.summary||baselineFor(c),2,false,3000)];
  if(tab==='history') components=[inp('summary','History / Backstory',d.summary,2,true,4000)];
  if(tab==='rp') components=[inp('notes','Writer Notes',d.notes,2,false,1500),inp('connections','Wanted Connections',d.connections,2,false,1200)];
  return {custom_id:`modal:${id}:${tab}`,title:`Edit ${tab}`,components};
}
async function discord(env,path,init={}){
  return fetch(`${DISCORD_API}${path}`,{...init,headers:{'Authorization':`Bot ${env.DISCORD_TOKEN}`,'Content-Type':'application/json',...(init.headers||{})}});
}
async function createMessage(env,channelId,body){ const r=await discord(env,`/channels/${channelId}/messages`,{method:'POST',body:JSON.stringify(body)}); if(!r.ok) throw new Error(await r.text()); return r.json(); }
async function editMessage(env,channelId,messageId,body){ const r=await discord(env,`/channels/${channelId}/messages/${messageId}`,{method:'PATCH',body:JSON.stringify(body)}); if(!r.ok) throw new Error(await r.text()); return r.json(); }
async function getCharacterById(env,id){ const {data,error}=await db(env).from('characters').select('*').eq('id',id).single(); if(error) throw error; return data; }
async function getByThread(env,thread){ const {data,error}=await db(env).from('characters').select('*').eq('thread_id',thread).maybeSingle(); if(error) throw error; return data; }
async function getByOwner(env,owner,statuses=['draft','pending','changes_requested','approved']){ const {data,error}=await db(env).from('characters').select('*').eq('owner_discord_id',owner).in('status',statuses).maybeSingle(); if(error) throw error; return data; }
async function save(env,id,patch){ const {data,error}=await db(env).from('characters').update(patch).eq('id',id).select('*').single(); if(error) throw error; return data; }
function response(data,type=4){ return Response.json({type,data}); }
function ephemeral(content,extra={}){ return response({content,flags:EPHEMERAL,...extra}); }
function userId(i){ return i.member?.user?.id || i.user?.id; }
function isAdmin(i){ try{return (BigInt(i.member?.permissions||'0') & ADMIN)===ADMIN;}catch{return false;} }

async function registerCommands(env){
  const commands=[
    {name:'create',description:'Create your Horizon character sheet'},
    {name:'sheet',description:'Open your character sheet editor'},
    {name:'view',description:'View an approved Horizon character',options:[{type:6,name:'user',description:'Member whose approved character you want to view',required:false}]},
    {name:'delete-character',description:'ADMIN: delete a character and free the slot',default_member_permissions:'8',options:[{type:6,name:'user',description:'Character owner',required:true}]},
    {name:'mantle',description:'ADMIN: assign Batman or Robin to a character',default_member_permissions:'8',options:[{type:6,name:'user',description:'Character owner',required:true},{type:3,name:'mantle',description:'Mantle',required:true,choices:[{name:'Batman',value:'batman'},{name:'Robin',value:'robin'},{name:'Clear',value:'none'}]}]}
  ];
  const r=await fetch(`${DISCORD_API}/applications/${env.DISCORD_CLIENT_ID}/guilds/${env.DISCORD_GUILD_ID}/commands`,{method:'PUT',headers:{Authorization:`Bot ${env.DISCORD_TOKEN}`,'Content-Type':'application/json'},body:JSON.stringify(commands)});
  return {ok:r.ok,status:r.status,text:await r.text()};
}

async function slash(i,env){
  const name=i.data.name, uid=userId(i), channelId=i.channel_id;
  if(name==='create'){
    if(i.channel?.parent_id!==env.CHARACTER_FORUM_ID) return ephemeral('Use `/create` inside a post in the Character Creation forum.');
    let existing=await getByOwner(env,uid);
    if(existing && existing.thread_id!==channelId) return ephemeral('You already have an active or approved character. Staff must delete that character before you can create a new one.');
    let c=await getByThread(env,channelId);
    if(!c){
      const {data,error}=await db(env).from('characters').insert({owner_discord_id:uid,guild_id:i.guild_id,thread_id:channelId,data:{basic:{},appearance:{},personality:{},abilities:{},history:{},rp:{}}}).select('*').single();
      if(error) return ephemeral(`Could not create character: ${error.message}`);
      c=data;
      const msg=await createMessage(env,channelId,{embeds:[sheetEmbed(c)]});
      c=await save(env,c.id,{sheet_message_id:msg.id});
    }
    if(c.owner_discord_id!==uid) return ephemeral('This forum post already belongs to another character.');
    return response({embeds:[sheetEmbed(c)],components:editorComponents(c),flags:EPHEMERAL});
  }
  if(name==='sheet'){
    if(i.channel?.parent_id!==env.CHARACTER_FORUM_ID) return ephemeral('Use `/sheet` inside your Character Creation forum post.');
    const c=await getByThread(env,channelId); if(!c) return ephemeral('No character sheet exists here yet. Use `/create` first.'); if(c.owner_discord_id!==uid) return ephemeral('Only the character owner can open the editor.');
    return response({embeds:[sheetEmbed(c)],components:editorComponents(c),flags:EPHEMERAL});
  }
  if(name==='view'){
    const opt=i.data.options?.find(x=>x.name==='user'); const target=opt?.value||uid;
    const c=await getByOwner(env,target,['approved']); if(!c) return ephemeral('That user does not have an approved character.');
    return response({embeds:[sheetEmbed(c)]});
  }
  if(name==='delete-character'){
    if(!isAdmin(i)) return ephemeral('Administrator permission required.');
    const target=i.data.options?.find(x=>x.name==='user')?.value; const c=await getByOwner(env,target,['draft','pending','changes_requested','approved','denied']); if(!c) return ephemeral('No character found for that user.');
    const {error}=await db(env).from('characters').delete().eq('id',c.id); if(error) return ephemeral(error.message); return ephemeral('Character deleted. That user may now create a new one.');
  }
  if(name==='mantle'){
    if(!isAdmin(i)) return ephemeral('Administrator permission required.');
    const target=i.data.options?.find(x=>x.name==='user')?.value; const mantle=i.data.options?.find(x=>x.name==='mantle')?.value; const c=await getByOwner(env,target); if(!c) return ephemeral('No active character found.');
    const data=structuredClone(c.data||{}); data.basic=data.basic||{}; data.basic.alias=mantle==='none'?'':mantle;
    const updated=await save(env,c.id,{data}); if(updated.sheet_message_id) await editMessage(env,updated.thread_id,updated.sheet_message_id,{embeds:[sheetEmbed(updated)]}); return ephemeral(`Mantle updated to ${mantle}.`);
  }
  return ephemeral('Unknown command.');
}

async function component(i,env){
  const uid=userId(i), [kind,id]=i.data.custom_id.split(':'); let c=await getCharacterById(env,id); if(!c) return ephemeral('Character not found.');
  if(kind==='preview') return response({embeds:[sheetEmbed(c)],flags:EPHEMERAL});
  if(c.owner_discord_id!==uid) return ephemeral('Only the character owner can edit this sheet.');
  if(kind==='edit'){
    const tab=i.data.custom_id.split(':')[2]; return response(modalFor(c,tab),9);
  }
  if(['species','affiliation','mantle'].includes(kind)){
    const val=i.data.values?.[0]||''; const data=structuredClone(c.data||{}); data.basic=data.basic||{};
    if(kind==='species') data.basic.species=SPECIES.find(x=>x[0]===val)?.[1]||val;
    if(kind==='affiliation') data.basic.affiliation=val==='none'?'':AFFILIATIONS.find(x=>x[0]===val)?.[1]||val;
    if(kind==='mantle') data.basic.alias=val==='none'?'':MANTLES.find(x=>x[0]===val)?.[1]||val;
    if(!data.abilities?.summary){ data.abilities=data.abilities||{}; data.abilities.summary=baselineFor({...c,data}); }
    c=await save(env,id,{data}); if(c.sheet_message_id) await editMessage(env,c.thread_id,c.sheet_message_id,{embeds:[sheetEmbed(c)]});
    return response({embeds:[sheetEmbed(c)],components:editorComponents(c)},7);
  }
  if(kind==='submit'){
    if(completion(c)<100) return ephemeral('Finish the required character sections before submitting.');
    const row={type:1,components:[{type:2,style:3,label:'Approve',custom_id:`reviewapprove:${id}`},{type:2,style:2,label:'Request Changes',custom_id:`reviewchanges:${id}`},{type:2,style:4,label:'Deny',custom_id:`reviewdeny:${id}`}]};
    const msg=await createMessage(env,env.CHARACTER_REVIEW_CHANNEL_ID,{content:`**CHARACTER SUBMISSION**\nCharacter: **${c.data?.basic?.name||'Unnamed'}**\nWriter: <@${c.owner_discord_id}>\nThread: <#${c.thread_id}>`,embeds:[sheetEmbed(c)],components:[row]});
    c=await save(env,id,{status:'pending',review_message_id:msg.id}); if(c.sheet_message_id) await editMessage(env,c.thread_id,c.sheet_message_id,{embeds:[sheetEmbed(c)]}); return response({embeds:[sheetEmbed(c)],components:editorComponents(c)},7);
  }
  return ephemeral('Unknown action.');
}

async function reviewComponent(i,env){
  const [kind,id]=i.data.custom_id.split(':'); const c=await getCharacterById(env,id); if(!c) return ephemeral('Character not found.');
  const allowed=isAdmin(i) || (env.CHARACTER_REVIEWER_ROLE_ID && i.member?.roles?.includes(env.CHARACTER_REVIEWER_ROLE_ID)); if(!allowed) return ephemeral('You do not have permission to review characters.');
  if(kind==='reviewapprove'){
    const u=await save(env,id,{status:'approved',review_note:null}); if(u.sheet_message_id) await editMessage(env,u.thread_id,u.sheet_message_id,{embeds:[sheetEmbed(u)]});
    return response({content:`${i.message.content}\n\n✅ **APPROVED** by <@${userId(i)}>`,embeds:[sheetEmbed(u)],components:[]},7);
  }
  const action=kind==='reviewchanges'?'changes':'deny';
  return response({custom_id:`reviewmodal:${action}:${id}`,title:action==='changes'?'Request Changes':'Deny Character',components:[{type:1,components:[{type:4,custom_id:'note',label:'Reason / Requested Changes',style:2,required:true,max_length:1800}]}]},9);
}

async function modal(i,env){
  const parts=i.data.custom_id.split(':');
  if(parts[0]==='modal'){
    const [,id,tab]=parts; let c=await getCharacterById(env,id); if(c.owner_discord_id!==userId(i)) return ephemeral('Only the character owner can edit this sheet.');
    const sec={...(c.data?.[tab]||{})}; for(const row of i.data.components||[]) for(const comp of row.components||[]) sec[comp.custom_id]=comp.value;
    const data=structuredClone(c.data||{}); data[tab]=sec; c=await save(env,id,{data,status:c.status==='denied'?'draft':c.status}); if(c.sheet_message_id) await editMessage(env,c.thread_id,c.sheet_message_id,{embeds:[sheetEmbed(c)]}); return ephemeral('Saved.');
  }
  if(parts[0]==='reviewmodal'){
    const [,action,id]=parts; const allowed=isAdmin(i)||(env.CHARACTER_REVIEWER_ROLE_ID&&i.member?.roles?.includes(env.CHARACTER_REVIEWER_ROLE_ID)); if(!allowed) return ephemeral('You do not have permission to review characters.');
    const note=i.data.components?.[0]?.components?.[0]?.value||''; let c=await save(env,id,{status:action==='changes'?'changes_requested':'denied',review_note:note}); if(c.sheet_message_id) await editMessage(env,c.thread_id,c.sheet_message_id,{embeds:[sheetEmbed(c)]});
    return response({content:`${i.message?.content||''}\n\n**${action==='changes'?'CHANGES REQUESTED':'DENIED'}** by <@${userId(i)}>\n${note}`,embeds:[sheetEmbed(c)],components:[]},7);
  }
  return ephemeral('Unknown modal.');
}

export default {
  async fetch(request, env) {
    const url=new URL(request.url);
    if(request.method==='GET' && url.pathname==='/') return new Response('Horizon Character Bot is online.');
    if(request.method==='GET' && url.pathname==='/register'){
      if(!env.SETUP_KEY || url.searchParams.get('key')!==env.SETUP_KEY) return new Response('Unauthorized',{status:401});
      const result=await registerCommands(env); return Response.json(result,{status:result.ok?200:500});
    }
    if(request.method!=='POST' || url.pathname!=='/interactions') return new Response('Not found',{status:404});
    const signature=request.headers.get('x-signature-ed25519'); const timestamp=request.headers.get('x-signature-timestamp'); const raw=await request.text();
    if(!signature || !timestamp || !(await verifyKey(raw,signature,timestamp,env.DISCORD_PUBLIC_KEY))) return new Response('Bad request signature',{status:401});
    const i=JSON.parse(raw);
    try{
      if(i.type===1) return Response.json({type:1});
      if(i.type===2) return await slash(i,env);
      if(i.type===3){ if(i.data.custom_id.startsWith('review')) return await reviewComponent(i,env); return await component(i,env); }
      if(i.type===5) return await modal(i,env);
      return ephemeral('Unsupported interaction.');
    }catch(e){ console.error(e); return ephemeral(`Something went wrong: ${e.message||e}`); }
  }
};
