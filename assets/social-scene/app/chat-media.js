'use strict';
const ChatMedia=(()=>{
 const models=typeof ChatModels!=='undefined'?ChatModels:require('./chat-models.js');
 const supports=p=>models.native(typeof p==='string'?p:p.type);
 const defaults=type=>type==='kakao-overlay'?{overlayOffsets:{other:{x:0,y:0},me:{x:0,y:0}}}:{};
 function attachment(m){
  if(typeof m.image!=='string'||m.image.length>32*1024*1024||!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(m.image))throw Error('사진 메시지 형식이나 크기를 확인해 주세요.');
  const imageWidth=m.imageWidth??282,imageHeight=m.imageHeight??185,imageName=m.imageName??'사진';
  if(!Number.isFinite(imageWidth)||!Number.isFinite(imageHeight)||imageWidth<1||imageHeight<1||imageWidth>16384||imageHeight>16384||typeof imageName!=='string'||imageName.length>300)throw Error('미디어 메시지의 크기나 이름을 확인해 주세요.');
  const out={image:m.image,imageWidth,imageHeight,imageName};
  if(m.video!==undefined){
   if(typeof m.video!=='string'||m.video.length>32*1024*1024||!/^data:video\/(mp4|webm|quicktime);base64,[A-Za-z0-9+/=]+$/.test(m.video)||!/^v[0-9a-f]{16}$/.test(m.videoId)||!Number.isFinite(m.videoDuration)||m.videoDuration<=0||m.videoDuration>86400)throw Error('동영상 메시지 형식이나 길이를 확인해 주세요.');
   Object.assign(out,{video:m.video,videoId:m.videoId,videoDuration:m.videoDuration});
  }
  return out;
 }
 const bytes=m=>(m.image?.length||0)+(m.video?.length||0);
 function size(m){const ratio=Math.min(282/m.imageWidth,260/m.imageHeight);return{width:Math.max(24,Math.round(m.imageWidth*ratio)),height:Math.max(24,Math.round(m.imageHeight*ratio))}}
 function parseAction(action){const match=/^chat-video:(open|play|close):(v[0-9a-f]{16})$/.exec(action);return match?{kind:match[1],id:match[2]}:null}
 function isAction(action,p){const parsed=parseAction(action);return!!(parsed&&supports(p)&&p.messages?.some(m=>m.video&&m.videoId===parsed.id))}
 function state(p,t){
  let message=null,position=0,last=0,playing=false;
  for(const event of [...(p.actions||[])].sort((a,b)=>a.at-b.at)){
   if(event.at>t)break;const action=parseAction(event.action);if(!action)continue;
   if(playing&&message)position=Math.min(message.videoDuration,position+event.at-last);last=event.at;
   if(action.kind==='open'){const found=p.messages.find(m=>m.videoId===action.id&&m.video&&m.at<=event.at);if(found){message=found;position=0;playing=false}}
   else if(message?.videoId===action.id){if(action.kind==='close'){message=null;playing=false;position=0}else{if(event.value&&position>=message.videoDuration)position=0;playing=event.value}}
  }
  if(playing&&message)position=Math.min(message.videoDuration,position+Math.max(0,t-last));
  return{message,position,playing:!!message&&playing&&position<message.videoDuration};
 }
 function segments(p){
  const points=[...new Set([0,p.duration,...(p.actions||[]).filter(e=>parseAction(e.action)&&e.at<p.duration).map(e=>e.at)])].sort((a,b)=>a-b),out=[];
  for(let i=0;i<points.length-1;i++){const at=points[i],current=state(p,at);if(!current.playing)continue;const length=Math.min(points[i+1]-at,current.message.videoDuration-current.position);if(length>0)out.push({message:current.message,at:at/p.speed,offset:current.position,length,rate:p.speed})}return out;
 }
 function validate(input,p){
  const out=defaults(p.type);let total=0;const ids=new Set();
  out.messages=p.messages.map((m,i)=>{const original=input.messages[i];if(original.image===undefined){if(original.video!==undefined)throw Error('영상 미리보기 사진이 필요합니다.');return m}if(!supports(p))throw Error('이 화면은 미디어 메시지를 지원하지 않습니다.');const image=attachment(original);if(image.videoId){if(ids.has(image.videoId))throw Error('영상 메시지 ID가 중복되었습니다.');ids.add(image.videoId)}total+=bytes(image);return{...m,...image}});
  if(supports(p)&&p.media){
   if(p.mediaKind==='video')throw Error('동영상은 대화의 미디어 메시지로 추가해 주세요.');
   if(out.messages.length>=models.messageLimit(p))throw Error('기존 사진을 변환하려면 메시지 한 칸을 비워 주세요.');
   const at=out.messages.length?Math.min(...out.messages.map(m=>m.at)):0;
   const photo={side:'me',text:'',time:out.messages[0]?.time||'오후 1:27',at,...attachment({image:p.media,imageName:p.mediaName||'사진'})};
   if(models.enabled(p))photo.senderId=p.selfId;
   out.messages.unshift(photo);out.media='';out.mediaName='';out.mediaKind='image';total+=p.media.length;
  }
  if(total>64*1024*1024)throw Error('대화 미디어의 총 크기는 64MB 이내로 사용해 주세요.');
  if(p.type==='kakao-overlay'&&input.overlayOffsets!==undefined){
   const rows=input.overlayOffsets;if(!rows||typeof rows!=='object'||Array.isArray(rows)||Object.keys(rows).some(key=>!['other','me'].includes(key)))throw Error('대화 배치 형식을 확인해 주세요.');
   for(const side of ['other','me'])if(rows[side]!==undefined){const pos=rows[side];if(!pos||typeof pos!=='object'||Array.isArray(pos)||Object.keys(pos).some(key=>!['x','y'].includes(key)))throw Error('대화 위치 형식을 확인해 주세요.');for(const key of ['x','y'])if(pos[key]!==undefined){if(!Number.isFinite(pos[key])||Math.abs(pos[key])>2000)throw Error('대화 위치 범위를 확인해 주세요.');out.overlayOffsets[side][key]=pos[key]}}
  }
  return out;
 }
 return{supports,defaults,attachment,bytes,size,parseAction,isAction,state,segments,validate};
})();
if(typeof module!=='undefined')module.exports=ChatMedia;
