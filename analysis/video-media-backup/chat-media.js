'use strict';
const ChatMedia=(()=>{
 const models=typeof ChatModels!=='undefined'?ChatModels:require('./chat-models.js');
 const supports=p=>models.native(typeof p==='string'?p:p.type);
 const defaults=type=>type==='kakao-overlay'?{overlayOffsets:{other:{x:0,y:0},me:{x:0,y:0}}}:{};
 function attachment(m){
  if(typeof m.image!=='string'||m.image.length>32*1024*1024||!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(m.image))throw Error('사진 메시지 형식이나 크기를 확인해 주세요.');
  const imageWidth=m.imageWidth??282,imageHeight=m.imageHeight??185,imageName=m.imageName??'사진';
  if(!Number.isFinite(imageWidth)||!Number.isFinite(imageHeight)||imageWidth<1||imageHeight<1||imageWidth>16384||imageHeight>16384||typeof imageName!=='string'||imageName.length>300)throw Error('사진 메시지의 크기나 이름을 확인해 주세요.');
  return{image:m.image,imageWidth,imageHeight,imageName};
 }
 function size(m){const ratio=Math.min(282/m.imageWidth,260/m.imageHeight);return{width:Math.max(24,Math.round(m.imageWidth*ratio)),height:Math.max(24,Math.round(m.imageHeight*ratio))}}
 function validate(input,p){
  const out=defaults(p.type);let bytes=0;
  out.messages=p.messages.map((m,i)=>{const original=input.messages[i];if(original.image===undefined)return m;if(!supports(p))throw Error('이 화면은 사진 메시지를 지원하지 않습니다.');const image=attachment(original);bytes+=image.image.length;return{...m,...image}});
  if(supports(p)&&p.media){
   if(p.mediaKind==='video')throw Error('대화에는 PNG·JPG·WebP 사진을 사용해 주세요.');
   if(out.messages.length>=models.messageLimit(p))throw Error('기존 사진을 변환하려면 메시지 한 칸을 비워 주세요.');
   const at=out.messages.length?Math.min(...out.messages.map(m=>m.at)):0;
   const photo={side:'me',text:'',time:out.messages[0]?.time||'오후 1:27',at,...attachment({image:p.media,imageName:p.mediaName||'사진'})};
   if(models.enabled(p))photo.senderId=p.selfId;
   out.messages.unshift(photo);out.media='';out.mediaName='';out.mediaKind='image';bytes+=p.media.length;
  }
  if(bytes>64*1024*1024)throw Error('대화 사진의 총 크기는 64MB 이내로 사용해 주세요.');
  if(p.type==='kakao-overlay'&&input.overlayOffsets!==undefined){
   const rows=input.overlayOffsets;if(!rows||typeof rows!=='object'||Array.isArray(rows)||Object.keys(rows).some(key=>!['other','me'].includes(key)))throw Error('대화 배치 형식을 확인해 주세요.');
   for(const side of ['other','me'])if(rows[side]!==undefined){const pos=rows[side];if(!pos||typeof pos!=='object'||Array.isArray(pos)||Object.keys(pos).some(key=>!['x','y'].includes(key)))throw Error('대화 위치 형식을 확인해 주세요.');for(const key of ['x','y'])if(pos[key]!==undefined){if(!Number.isFinite(pos[key])||Math.abs(pos[key])>2000)throw Error('대화 위치 범위를 확인해 주세요.');out.overlayOffsets[side][key]=pos[key]}}
  }
  return out;
 }
 return{supports,defaults,attachment,size,validate};
})();
if(typeof module!=='undefined')module.exports=ChatMedia;
