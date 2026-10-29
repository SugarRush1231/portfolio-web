'use strict';
const OverlayEditor=(()=>{
 let active=false,free=false,owner=null,drag=null;
 function finish(cancel=false){if(!drag)return;const take=drag;drag=null;try{phonePreview.releasePointerCapture(take.id)}catch{}if(cancel)take.owner.overlayOffsets[take.side]={...take.start};else if(take.moved)dirty.add(take.owner.type);draw()}
 function setActive(value){if(value&&project.type!=='kakao-overlay')return;finish(true);active=!!value;free=false;owner=project;if(active){pausePreview();if(ElementEditor.active)ElementEditor.setActive(false)}render()}
 function render(){if(owner!==project||project.type!=='kakao-overlay'){active=false;free=false;owner=project}phonePreview.classList.toggle('overlay-layout-mode',active);phonePreview.classList.toggle('overlay-free-move',active&&free);$('overlay-free-move').disabled=!active;$('overlay-free-move').setAttribute('aria-pressed',String(free));$('overlay-layout-toggle').setAttribute('aria-pressed',String(active));$('overlay-layout-toggle').textContent=active?'배치 조절 종료':'대화 위치 조절';$('overlay-layout-hint').textContent=active?(free?'자유 이동: 상하좌우로 드래그합니다. 같은 쪽의 프로필·시간·사진도 함께 이동합니다.':'좌우 이동: 위아래 위치를 유지합니다. 세로로 옮기려면 자유 이동을 켜세요.'):'기본은 좌우 이동입니다. 위치를 조절한 뒤 프로젝트와 PNG·MOV에 같은 배치를 저장합니다.'}
 function init(){
  $('overlay-layout-toggle').onclick=()=>setActive(!active);
  $('overlay-free-move').onclick=()=>{finish(true);free=!free;render()};
  $('overlay-layout-reset').onclick=()=>{finish(true);free=false;project.overlayOffsets=ChatMedia.defaults('kakao-overlay').overlayOffsets;dirty.add(project.type);draw()};
  phonePreview.addEventListener('pointerdown',event=>{
   if(!active||ElementEditor.active||event.button!==0||recording)return;const group=event.target.closest('[data-overlay-side]');if(!group)return;
   event.preventDefault();event.stopImmediatePropagation();pausePreview();
   const side=group.dataset.overlaySide,root=phonePreview.getBoundingClientRect(),boxes=[...phonePreview.querySelectorAll('[data-overlay-side="'+side+'"]> [data-chat-row],[data-overlay-side="'+side+'"]> [data-chat-for]')].map(n=>n.getBoundingClientRect()).filter(b=>b.bottom>root.top&&b.top<root.bottom);
   if(!boxes.length)return;const bounds={left:Math.min(...boxes.map(b=>b.left)),right:Math.max(...boxes.map(b=>b.right)),top:Math.max(root.top,Math.min(...boxes.map(b=>b.top))),bottom:Math.min(root.bottom,Math.max(...boxes.map(b=>b.bottom)))};
   project.overlayOffsets??=ChatMedia.defaults('kakao-overlay').overlayOffsets;
   drag={id:event.pointerId,owner:project,side,free,x:event.clientX,y:event.clientY,start:{...project.overlayOffsets[side]},scale:root.width/phonePreview.clientWidth,root,bounds,moved:false};phonePreview.setPointerCapture(event.pointerId);
  },true);
  phonePreview.addEventListener('pointermove',event=>{if(!drag||event.pointerId!==drag.id)return;event.preventDefault();event.stopImmediatePropagation();const take=drag,clamp=(n,a,b)=>Math.max(a,Math.min(b,n)),dx=clamp(event.clientX-take.x,take.root.left-take.bounds.left,take.root.right-take.bounds.right),dy=take.free?clamp(event.clientY-take.y,take.root.top-take.bounds.top,take.root.bottom-take.bounds.bottom):0;take.owner.overlayOffsets[take.side]={x:Math.round((take.start.x+dx/take.scale)*10)/10,y:take.free?Math.round((take.start.y+dy/take.scale)*10)/10:take.start.y};take.moved||=dx!==0||dy!==0;draw()},true);
  phonePreview.addEventListener('pointerup',event=>{if(drag&&event.pointerId===drag.id){event.preventDefault();event.stopImmediatePropagation();finish()}},true);
  phonePreview.addEventListener('pointercancel',()=>finish(true),true);
  phonePreview.addEventListener('click',event=>{if(active){event.preventDefault();event.stopImmediatePropagation()}},true);
 }
 return{get active(){return active},init,render,setActive};
})();
