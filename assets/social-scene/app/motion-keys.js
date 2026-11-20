 'use strict';
const MotionKeys=(()=>{
 const timing=typeof SceneTiming!=='undefined'?SceneTiming:require('./scene-timing.js');
 function validate(p){const out={scrollKeys:[],slideKeys:[],recordGestures:false};for(const kind of ['scroll','slide']){const items=p[kind+'Keys']??[];if(!Array.isArray(items)||items.length>600)throw Error('키프레임은 종류별 600개까지 저장할 수 있습니다.');out[kind+'Keys']=items.map(k=>{if(!k||!Number.isFinite(k.at)||k.at<0||k.at>timing.maxDuration||!Number.isFinite(k.value)||k.value<0||k.value>(kind==='slide'?1:100000)||k.linear!==undefined&&typeof k.linear!=='boolean')throw Error('키프레임 시간과 값을 확인하세요.');return{at:k.at,value:k.value,linear:!!k.linear}}).sort((a,b)=>a.at-b.at)}if(p.recordGestures!==undefined){if(typeof p.recordGestures!=='boolean')throw Error('제스처 기록 설정을 확인하세요.');out.recordGestures=p.recordGestures}return out}
 function sample(keys,t,phone=false,viewport=600){
  if(!keys?.length)return null;const sorted=[...keys].sort((a,b)=>a.at-b.at);if(t<=sorted[0].at)return sorted[0].value;
  for(let i=1;i<sorted.length;i++){const a=sorted[i-1],b=sorted[i];if(t>b.at)continue;const x=Math.max(0,Math.min(1,(t-a.at)/Math.max(.001,b.at-a.at)));let ratio=x;
   if(!b.linear){const easing=typeof interactionEase==='function'?interactionEase:require('./interactions.js').interactionEase;ratio=easing(x);if(phone&&Math.abs(b.value-a.value)>viewport*.85){const scroll=typeof SceneScroll!=='undefined'?SceneScroll:require('./scroll-motion.js');ratio=scroll.position({device:'iphone',motion:'scroll',scroll:Math.abs(b.value-a.value),viewScroll:0,duration:b.at-a.at,scrollKeys:[]},t-a.at,viewport,Math.abs(b.value-a.value))/Math.abs(b.value-a.value)}}return a.value+(b.value-a.value)*ratio}
  return sorted.at(-1).value;
 }
 function slide(p,t){const value=sample(p.slideKeys,t);if(value!==null)return value;const answer=p.actions?.filter(e=>e.action==='call-answer'&&e.value&&e.at>=t).sort((a,b)=>a.at-b.at)[0];if(!answer||t<answer.at-.65)return 0;return Math.max(0,Math.min(1,(t-Math.max(0,answer.at-.65))/Math.max(.001,answer.at-Math.max(0,answer.at-.65))))}
 return{validate,sample,slide};
})();
if(typeof module!=='undefined')module.exports=MotionKeys;
