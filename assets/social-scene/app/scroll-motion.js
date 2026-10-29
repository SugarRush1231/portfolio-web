 'use strict';
const SceneScroll=(()=>{
 const easing=typeof module!=='undefined'?{easeScene:require('./scene.js').easeScene,interactionEase:require('./interactions.js').interactionEase}:{easeScene,interactionEase};
 const supported=['instagram-feed','x-feed','x-profile','facebook-feed','email-inbox','news-article','youtube-watch','discord-channel','discord-dm'];
 const clamp=(value,min,max)=>Math.max(min,Math.min(max,Number.isFinite(value)?value:0));
 function plan(distance,duration,viewport){
  const lead=Math.min(.5,duration*.25),tail=lead,available=Math.max(.01,duration-lead-tail);
  const naturalBurst=.16+.5,minimumRest=.25;
  const wanted=Math.max(1,Math.ceil(distance/Math.max(1,viewport*.72)));
  const count=Math.max(1,Math.min(wanted,Math.floor((available+minimumRest)/(naturalBurst+minimumRest))));
  const burst=Math.min(naturalBurst,available/count),drag=burst*(.16/naturalBurst),coast=burst-drag;
  const rest=count>1?Math.max(0,(available-count*burst)/(count-1)):0;
  // Match the finger's velocity to the initial slope of the existing .23,1,.32,1 ease-out.
  const dragFraction=(drag/.23)/(coast+drag/.23);
  return{count,burst,drag,coast,rest,dragFraction,start:count===1?(duration-burst)/2:lead};
 }
 function position(p,time,viewport,max,reduced=false){
  const extent=Math.max(0,max);if(p._scrollPaint!==undefined)return clamp(p._scrollPaint,0,extent);const keyed=typeof MotionKeys!=='undefined'?MotionKeys.sample(p.scrollKeys,time,p.device!=='desktop',viewport):require('./motion-keys.js').sample(p.scrollKeys,time,p.device!=='desktop',viewport);if(keyed!==null)return clamp(keyed,0,extent);const base=clamp(p.viewScroll,0,extent);
  if(p.motion!=='scroll'||p.scroll<=0)return base;
  const t=clamp(time,0,p.duration);
  if(p.device==='desktop')return Math.min(extent,base+p.scroll*easing.easeScene(t/p.duration));
  const distance=Math.min(p.scroll,extent-base);if(!distance)return base;
  if(reduced)return base+distance*easing.easeScene(t/p.duration);
  const step=plan(distance,p.duration,viewport),elapsed=t-step.start;
  if(elapsed<=0)return base;
  const i=Math.floor(elapsed/(step.burst+step.rest));if(i>=step.count)return base+distance;
  const local=elapsed-i*(step.burst+step.rest);
  const fraction=local>=step.burst?1:local<=step.drag?step.dragFraction*local/step.drag:step.dragFraction+(1-step.dragFraction)*easing.interactionEase((local-step.drag)/step.coast);
  return base+distance*(i+fraction)/step.count;
 }
 function apply(root,p,time){
  if(!supported.includes(p.type))return;
  const body=root.querySelector('.ph-feed-body,.film-scroll-body,.dc-message-content'),viewport=root.querySelector('.ph-feed-viewport,.film-scroll-viewport,.film-discord-messages');if(!body||!viewport)return;
  const max=Math.max(0,body.scrollHeight-viewport.clientHeight),reduced=!p._export&&matchMedia('(prefers-reduced-motion:reduce)').matches;
  const follows=p.type.startsWith('discord-')&&p._scrollPaint===undefined&&!p.scrollKeys?.length&&p.motion!=='scroll';const offset=follows?max:position(p,time,viewport.clientHeight,max,reduced);
  body.style.transform='translateY(-'+offset+'px)';
  const tabs=body.querySelector('.ph-x-tabs');
  if(tabs)tabs.style.transform='translateY('+Math.max(0,offset-tabs.offsetTop)+'px)';
  root._sceneScroll={offset,max,viewport:viewport.clientHeight};
 }
 return{supports:type=>supported.includes(type),plan,position,apply};
})();
if(typeof module!=='undefined')module.exports=SceneScroll;
