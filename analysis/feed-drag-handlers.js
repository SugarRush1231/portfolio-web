  phonePreview.addEventListener('pointerdown',event=>{
   stopCoast();
   const info=current(),viewport=phonePreview.querySelector('.ph-feed-viewport,.film-scroll-viewport,.film-discord-messages');
   const emptyFeed=!info.max&&SceneScroll.supports(project.type)&&viewport?.contains(event.target);
   if(event.button!==0||!event.isPrimary||project.device==='desktop'||ElementEditor.active||(!info.max&&!emptyFeed)||event.target.closest('a,button,input,textarea,select,video,[contenteditable]:not([contenteditable=false]),[role=button],[data-phone-action],[data-call-slide],.chat-video-viewer'))return;
   event.preventDefault();pausePreview();const rect=phonePreview.getBoundingClientRect();
   drag={id:event.pointerId,owner:project,startY:event.clientY,top:rect.top,bottom:rect.bottom,scale:rect.width/phonePreview.clientWidth,start:info.offset,viewport:info.viewport,moved:false,lastWall:performance.now(),lastOffset:info.offset,velocity:0};
   phonePreview.setPointerCapture(event.pointerId);phonePreview.dataset.touchDragging='true';scrollTake=null;
   if(project.recordGestures&&info.max)put('scroll',time,drag.start,true);
  },true);
  phonePreview.addEventListener('pointermove',event=>{
   if(!drag||event.pointerId!==drag.id)return;if(project!==drag.owner){cancelDrag();return}
   const dy=clamp(event.clientY,drag.top+8,drag.bottom-8)-drag.startY;if(Math.abs(dy)>4)drag.moved=true;if(!drag.moved)return;
   event.preventDefault();const change=clamp(-dy/drag.scale,-drag.viewport*.9,drag.viewport*.9),next=SceneScroll.dragPosition(drag.start+change,current().max,drag.viewport),now=performance.now();
   const instant=(next.offset-drag.lastOffset)/Math.max(.016,(now-drag.lastWall)/1000);drag.velocity=drag.velocity*.35+instant*.65;drag.lastWall=now;drag.lastOffset=next.offset;
   phonePreview.style.setProperty('--touch-pull',next.pull+'px');
   const selection=getSelection();if(selection?.anchorNode&&phonePreview.contains(selection.anchorNode))selection.removeAllRanges();
   if(Math.abs(current().offset-next.offset)>.01)manual(next.offset);draw();
  });
  const end=event=>{
   if(!drag||event.pointerId!==drag.id)return;try{phonePreview.releasePointerCapture(event.pointerId)}catch{}
   const gesture=drag;drag=null;delete phonePreview.dataset.touchDragging;phonePreview._suppressClick=gesture.moved;setTimeout(()=>phonePreview._suppressClick=false,0);
   if(!gesture.moved){stopCoast();scrollTake=null;return}
   const owner=project,start=current().offset,pull=parseFloat(phonePreview.style.getPropertyValue('--touch-pull'))||0,reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
   const age=performance.now()-gesture.lastWall,budget=Math.max(0,gesture.viewport*.95-Math.abs(start-gesture.start));
   const coast=!reduced&&event.type!=='pointercancel'&&age<100?clamp(gesture.velocity*.09,-budget,budget):0,target=clamp(start+coast,0,current().max),wall=performance.now();
   if(reduced||(Math.abs(target-start)<1&&Math.abs(pull)<.5)){phonePreview.style.setProperty('--touch-pull','0px');scrollTake=null;last='';draw();return}
   const tick=now=>{
    if(project!==owner||playing||ElementEditor.active){stopCoast();scrollTake=null;return}
    const x=Math.min(1,(now-wall)/240),progress=interactionEase(x);phonePreview.style.setProperty('--touch-pull',pull*(1-progress)+'px');
    if(Math.abs(target-start)>1)manual(start+(target-start)*progress);draw();
    if(x<1)coastFrame=requestAnimationFrame(tick);else{coastFrame=0;phonePreview.style.setProperty('--touch-pull','0px');scrollTake=null;last=''}
   };coastFrame=requestAnimationFrame(tick);
  };
  phonePreview.addEventListener('pointerup',end);phonePreview.addEventListener('pointercancel',end);
  phonePreview.addEventListener('click',event=>{if(phonePreview._suppressClick){event.preventDefault();event.stopImmediatePropagation()}},true);
  window.addEventListener('blur',cancelDrag);document.addEventListener('visibilitychange',()=>{if(document.hidden)cancelDrag()});
