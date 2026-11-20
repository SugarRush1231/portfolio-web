 'use strict';
const ChatTyping=(()=>{
 const timing=typeof SceneTiming!=='undefined'?SceneTiming:require('./scene-timing.js');
 const supports=p=>['discord-channel','discord-dm'].includes(typeof p==='string'?p:p.type);
 const defaults=type=>supports(type)?{recordTyping:true,chatDraftTrace:null}:{};
 function validate(input,p){
  if(!supports(p))return{};
  if(input.recordTyping!==undefined&&typeof input.recordTyping!=='boolean')throw Error('입력 과정 기록 설정을 확인하세요.');
  let total=0;
  function trace(value,end){
   if(value==null)return null;
   if(!value||!Number.isFinite(value.start)||value.start<0||value.start>end||!Array.isArray(value.events)||value.events.length>1500)throw Error('입력 기록의 시간이나 개수가 올바르지 않습니다.');
   let previous=-1;
   const events=value.events.map(e=>{
    if(!e||!Number.isFinite(e.at)||e.at<0||e.at<previous||e.at>end-value.start+.001||typeof e.value!=='string'||e.value.length>3000||!Number.isInteger(e.from)||!Number.isInteger(e.to)||e.from<0||e.to<e.from||e.to>e.value.length)throw Error('입력 기록의 글자·선택 범위·시간을 확인하세요.');
    previous=e.at;total+=e.value.length;if(total>2*1024*1024)throw Error('입력 기록은 총 2MB까지 저장할 수 있습니다.');return{at:e.at,value:e.value,from:e.from,to:e.to};
   });return{start:value.start,events};
  }
  const messages=p.messages.map((m,i)=>{const typing=trace(input.messages[i].typing,m.at);if(typing&&typing.events.at(-1)?.value.trim()!==m.text.trim())throw Error('입력 기록의 마지막 문장이 보낸 메시지와 다릅니다.');return typing?{...m,typing}:m});
  const chatDraftTrace=trace(input.chatDraftTrace,timing.maxDuration);if(chatDraftTrace&&chatDraftTrace.events.at(-1)?.value!==(input.chatDraft||''))throw Error('입력 기록과 현재 초안이 다릅니다.');
  return{recordTyping:input.recordTyping??true,chatDraftTrace,messages};
 }
 function frame(trace,time){
  let value='',from=0,to=0,at=trace.start;
  for(const event of trace.events){if(event.at>time-trace.start+.000001)break;({value,from,to}=event);at=trace.start+event.at}
  return{value,from,to,caret:(time-at<.5||Math.floor((time-at)/.5)%2===0),recorded:true};
 }
 function at(p,time){
  if(!supports(p)||p.motion!=='messages')return null;
  const message=[...p.messages].sort((a,b)=>a.at-b.at).find(m=>m.typing&&time>=m.typing.start&&time<m.at);
  if(message)return{...frame(message.typing,time),senderId:message.senderId||p.selfId};
  if(p.chatDraftTrace&&time>=p.chatDraftTrace.start)return{...frame(p.chatDraftTrace,time),senderId:p.composerSenderId||p.selfId};
  return null;
 }
 function append(trace,value,from,to,at){
  const event={at:Math.round(Math.max(0,at)*1000)/1000,value:value.slice(0,3000),from:Math.min(from,3000),to:Math.min(to,3000)};
  const last=trace.events.at(-1);if(last&&last.value===event.value&&last.from===event.from&&last.to===event.to)return;
  if(trace.events.length>=1500)throw Error('입력 기록이 1,500단계에 도달했습니다. 메시지를 전송한 뒤 이어서 입력하세요.');
  trace.events.push(event);
 }
 function trimTrace(message){
  if(!message.typing)return;
  // Source text/timing edits replace the recorded take rather than replaying stale wording.
  if(message.typing.start>message.at||message.typing.events.at(-1)?.value.trim()!==message.text.trim())delete message.typing;
  else message.typing.events=message.typing.events.filter(e=>e.at<=message.at-message.typing.start+.001);
 }
 return{supports,defaults,validate,frame,at,append,trimTrace};
})();
if(typeof module!=='undefined')module.exports=ChatTyping;
