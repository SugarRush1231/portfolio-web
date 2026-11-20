
'use strict';
const ChatModels=(()=>{
 const aliases={'kakao-group':'kakao-chat','instagram-group':'instagram-dm','x-group':'x-dm'};
 const base=id=>id==='kakao-overlay'?'kakao-chat':aliases[id]||id;
 const native=id=>['kakao-chat','instagram-dm','x-dm'].includes(base(id));
 const enabled=p=>!!aliases[p.type]||['discord-channel','discord-dm'].includes(p.type);
 const group=p=>!!aliases[p.type]||p.type==='discord-channel'||(p.type==='discord-dm'&&p.participants?.length>2);
 const limit=p=>p.type==='discord-dm'?10:100;
 const messageLimit=p=>enabled(p)?300:30;
 function defaults(p){
  if(!enabled(p))return{};
  const n=aliases[p.type]?4:2,participants=Array.from({length:n},(_,i)=>({id:'person-'+(i+1),name:i===0?(p.type.startsWith('discord')?p.handle:'User 1'):i===1?p.name:'User '+(i+1),avatar:''}));
  const messages=p.messages.map((m,i)=>{const senderId=aliases[p.type]?['person-2','person-1','person-3','person-4'][i%4]:m.side==='me'?'person-1':'person-2';return{...m,senderId,side:senderId==='person-1'?'me':'other'}});
  return{participants,selfId:'person-1',composerSenderId:'person-1',groupName:'프로젝트 채팅방',messages,...(aliases[p.type]&&base(p.type)==='kakao-chat'?{receipt:String(n-1)}:{})};
 }
 const person=(p,id)=>p.participants.find(x=>x.id===id);
 const sender=(p,m)=>m.senderId|| (m.side==='me'?p.selfId:p.participants.find(x=>x.id!==p.selfId)?.id);
 const side=(p,id)=>id===p.selfId?'me':'other';
 const avatar=(p,id)=>person(p,id)?.avatar||(id==='person-1'?p.props?.selfAvatar||'':id==='person-2'?p.props?.otherAvatar||p.avatar||'':'');
 function sync(p){
  if(!enabled(p))return;
  p.messages.forEach(m=>{m.senderId=sender(p,m);m.side=side(p,m.senderId)});
  if(!person(p,p.composerSenderId))p.composerSenderId=p.selfId;
  if(p.type.startsWith('discord')){p.handle=person(p,p.selfId).name;p.name=p.participants.find(x=>x.id!==p.selfId)?.name||p.handle}
 }
 function validate(input,p){
  if(!enabled(p))return{};
  const fallback=defaults(p),items=input.participants??fallback.participants;
  if(!Array.isArray(items)||items.length<2||items.length>limit(p))throw new Error('참가자는 2~'+limit(p)+'명까지 설정할 수 있습니다.');
  const ids=new Set(),participants=items.map(x=>{
   if(!x||typeof x.id!=='string'||!/^person-[1-9][0-9]{0,8}$/.test(x.id)||ids.has(x.id)||typeof x.name!=='string'||x.name.length>60||typeof x.avatar!=='string'||x.avatar.length>2e6||(x.avatar&&!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(x.avatar)))throw new Error('참가자 이름·사진·ID를 확인해 주세요.');
   ids.add(x.id);return{id:x.id,name:x.name,avatar:x.avatar};
  });
  const selfId=input.selfId??fallback.selfId,composerSenderId=input.composerSenderId??selfId,groupName=input.groupName??fallback.groupName;
  if(!ids.has(selfId)||!ids.has(composerSenderId)||typeof groupName!=='string'||groupName.length>80)throw new Error('그룹과 내 계정 설정이 올바르지 않습니다.');
  const messages=p.messages.map((m,i)=>{const id=input.messages[i].senderId??(m.side==='me'?selfId:participants.find(x=>x.id!==selfId).id);if(!ids.has(id))throw new Error('메시지의 보낸 사람이 참가자 목록에 없습니다.');return{...m,senderId:id,side:id===selfId?'me':'other'}});
  return{participants,selfId,composerSenderId,groupName,messages};
 }
 function unread(p,m,time){
  if(!p.autoRead||p.motion!=='messages')return p.receipt;
  return String(p.participants.filter(x=>x.id!==p.selfId).filter(x=>{
   const reply=p.messages.find(v=>sender(p,v)===x.id&&v.at>m.at);
   return !reply||time<Math.max(m.at,reply.at-(p.showTyping&&!reply.image?p.typingDuration:0)+p.readDelay);
  }).length);
 }
 return{aliases,base,native,enabled,group,limit,messageLimit,defaults,person,sender,side,avatar,sync,validate,unread};
})();
if(typeof module!=='undefined')module.exports=ChatModels;

