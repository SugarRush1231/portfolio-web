'use strict';
const ChatClock=(()=>{
 const models=typeof ChatModels!=='undefined'?ChatModels:require('./chat-models.js');
 const supports=p=>models.native(typeof p==='string'?p:p.type)||['discord-channel','discord-dm'].includes(typeof p==='string'?p:p.type);
 const defaults=type=>supports(type)?{chatClockAuto:true}:{};
 function parse(value){const m=/^\s*(오전|오후)?\s*(\d{1,2}):(\d{2})\s*(AM|PM)?\s*$/i.exec(value);if(!m)return null;let hour=Number(m[2]);const minute=Number(m[3]),period=m[1]||m[4]?.toUpperCase();if(minute>59||hour>23||period&&(hour<1||hour>12))return null;if(period){hour%=12;if(['오후','PM'].includes(period))hour+=12}return hour*60+minute}
 const wrap=value=>(value%1440+1440)%1440;
 const digits=value=>String(value).padStart(2,'0');
 function format(value){const minute=wrap(value);return Math.floor(minute/60)+':'+digits(minute%60)}
 function label(value){const minute=wrap(value),hour=Math.floor(minute/60);return(hour<12?'오전 ':'오후 ')+(hour%12||12)+':'+digits(minute%60)}
 function elapsed(p,time){return Math.floor(Math.max(0,p.motion==='messages'?time:Math.max(time,...p.messages.map(m=>m.at)))/60)}
 function stamp(p,message){const base=parse(p.clock);return p.chatClockAuto&&base!==null?label(base+Math.floor(message.at/60)):message.time}
 function view(p,time){if(!supports(p)||!p.chatClockAuto||parse(p.clock)===null)return{};return{clock:format(parse(p.clock)+elapsed(p,time)),messages:p.messages.map(message=>({...message,time:stamp(p,message)}))}}
 function freeze(p,time){if(!supports(p)||!p.chatClockAuto)return;const current=view(p,time);if(current.messages){p.messages.forEach((message,i)=>message.time=current.messages[i].time);p.clock=current.clock}p.chatClockAuto=false}
 function enable(p,time){if(!p.chatClockAuto&&parse(p.clock)!==null)p.clock=format(parse(p.clock)-elapsed(p,time));p.chatClockAuto=true}
 function setDisplay(p,value,time){const minute=parse(value);p.clock=p.chatClockAuto&&minute!==null?format(minute-elapsed(p,time)):value}
 function validate(input,p){if(!supports(p))return{};if(input.chatClockAuto!==undefined&&typeof input.chatClockAuto!=='boolean')throw Error('대화 시간 자동 맞춤 설정을 확인해 주세요.');return{chatClockAuto:input.chatClockAuto??false}}
 return{supports,defaults,parse,stamp,view,freeze,enable,setDisplay,validate};
})();
if(typeof module!=='undefined')module.exports=ChatClock;
