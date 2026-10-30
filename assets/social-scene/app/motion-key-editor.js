'use strict';
const MotionEditor=(()=>{
 const manualFrames=new WeakMap(),undo=new WeakMap();let coastFrame=0,drag=null,slideTake=null,scrollTake=null,last='',isDrawing=false;
 const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 function current(){return project.type.startsWith('google-')||project.type==='naver-search'?{offset:canvas._searchScroll||0,max:canvas._searchMaxScroll||0,viewport:700}:phonePreview._sceneScroll||{offset:project.viewScroll||0,max:0,viewport:600}}
 function preview(p){if(manualFrames.has(p)&&manualFrames.get(p)!==p.viewScroll)manualFrames.delete(p);return!playing&&manualFrames.has(p)?{_scrollPaint:manualFrames.get(p)}:{}}
 function stopCoast(){cancelAnimationFrame(coastFrame);coastFrame=0;phonePreview.style.setProperty('--touch-pull','0px')}
 function cancelDrag(){stopCoast();if(drag){try{phonePreview.releasePointerCapture(drag.id)}catch{}}drag=null;delete phonePreview.dataset.touchDragging;scrollTake=null}
 function clearPreview(){cancelDrag();manualFrames.delete(project);scrollTake=null}
 function manual(value){value=clamp(value,0,100000);manualFrames.set(project,value);project.viewScroll=value;if(project.recordGestures){const now=performance.now();if(!scrollTake){put('scroll',time,current().offset,true);scrollTake={at:Math.min(time,SceneTiming.maxDuration-.5),wall:now,last:0}}const at=Math.min(SceneTiming.maxDuration-.2,Math.max(scrollTake.at+.04,scrollTake.at+(now-scrollTake.wall)/1000));put('scroll',at,value,true);time=at;extend(at+.2)} }
 function put(kind,at,value,linear=false){const keys=project[kind+'Keys'];at=Math.round(clamp(at,0,SceneTiming.maxDuration)*1000)/1000;const existing=keys.find(k=>Math.abs(k.at-at)<.035);if(existing)Object.assign(existing,{at,value,linear});else if(keys.length<600)keys.push({at,value,linear});keys.sort((a,b)=>a.at-b.at);dirty.add(project.type)}
 function extend(at){project.duration=Math.min(SceneTiming.maxDuration,Math.max(project.duration,at));$('duration').value=String(project.duration);$('timeline').max=String(project.duration)}
 function slide(range,value){
  const now=performance.now();if(!slideTake){slideTake={at:Math.min(time,SceneTiming.maxDuration-1),wall:now};put('slide',slideTake.at,0,true)}const at=Math.min(SceneTiming.maxDuration-.2,Math.max(slideTake.at+.04,slideTake.at+(now-slideTake.wall)/1000));put('slide',at,value,true);time=at;extend(at+.4);range.closest('.film-answer-slider').style.setProperty('--answer-progress',value);$('timeline').value=String(time);$('current-time').textContent=formatSceneTime(time/project.speed);
  if(value>=.94){put('slide',at,1,true);project.actions.push({at,action:'call-answer',value:true});slideTake=null;phonePreview.dataset.force='true';draw();playPreview(Math.min(project.duration,at+.4))}
 }
 function endSlide(range){if(!slideTake)return;const at=Math.min(SceneTiming.maxDuration,time+.2);put('slide',at,0,false);extend(at+.1);slideTake=null;phonePreview.dataset.force='true';draw()}
 function render(){
  if(isDrawing||typeof TimelineEditor!=='undefined'&&TimelineEditor.dragging)return;const pane=$('motion-keys-fields');if(!pane)return;const info=current(),on=project.type.startsWith('google-')||project.type==='naver-search'||SceneScroll.supports(project.type)||ChatModels.native(project.type)||info.max>0||project.scrollKeys.length||project.type==='phone-call'||project.actions.length||project.messages.some(m=>m.typing);pane.hidden=!on;$('timeline-key-settings').hidden=!on;$('timeline-key-empty').hidden=!!(project.scrollKeys.length+project.slideKeys.length);const canScroll=project.type.startsWith('google-')||project.type==='naver-search'||SceneScroll.supports(project.type)||ChatModels.native(project.type)||info.max>0||project.scrollKeys.length>0;$('add-scroll-key').disabled=!canScroll;$('record-scroll-gestures').disabled=!canScroll;$('record-scroll-gestures').checked=project.recordGestures;
  const signature=project.type+project.duration+JSON.stringify([project.scrollKeys,project.slideKeys,project.actions])+project.messages.filter(m=>m.typing).length;
  if(last===signature)return;last=signature;isDrawing=true;const list=$('motion-key-list');list.replaceChildren();
  for(const kind of ['scroll','slide'])for(const [index,k]of project[kind+'Keys'].entries()){const row=document.createElement('div');row.className='motion-key-row';const label=document.createElement('span');label.textContent=kind==='slide'?'밀기':'스크롤';const at=document.createElement('input');at.type='number';at.min=0;at.max=SceneTiming.maxDuration;at.step=.05;at.value=k.at;at.setAttribute('aria-label',label.textContent+' '+(index+1)+' 키프레임 시간');const value=document.createElement('input');value.type='number';value.min=0;value.max=kind==='slide'?1:100000;value.step=kind==='slide'?.01:1;value.value=Math.round(k.value*100)/100;value.setAttribute('aria-label',label.textContent+' '+(index+1)+' 위치');const remove=document.createElement('button');remove.type='button';remove.textContent='×';remove.setAttribute('aria-label','키프레임 삭제');at.onchange=()=>{k.at=clamp(at.valueAsNumber||0,0,SceneTiming.maxDuration);clearPreview();dirty.add(project.type);last='';draw()};value.onchange=()=>{k.value=clamp(value.valueAsNumber||0,0,kind==='slide'?1:100000);clearPreview();dirty.add(project.type);last='';draw()};remove.onclick=()=>{project[kind+'Keys'].splice(index,1);dirty.add(project.type);last='';draw()};row.append(label,at,value,remove);list.append(row)}
  const count=project.actions.length+project.scrollKeys.length+project.slideKeys.length+project.messages.filter(m=>m.typing).length;$('motion-record-count').textContent=count+'개 기록';$('undo-motion-clear').hidden=!undo.has(project);isDrawing=false;
 }
 function reset(){$('motion-settings-note').textContent='';undo.set(project,{viewScroll:project.viewScroll,actions:structuredClone(project.actions),scrollKeys:structuredClone(project.scrollKeys),slideKeys:structuredClone(project.slideKeys),typing:project.messages.map(m=>({text:m.text,typing:structuredClone(m.typing)}))});project.viewScroll=0;project.actions=[];project.scrollKeys=[];project.slideKeys=[];project.messages.forEach(m=>delete m.typing);ChatEditor.clearDraft();clearPreview();dirty.add(project.type);last='';renderInteractionEditor();draw();tell('현재 장면의 모션 기록을 지웠습니다. 되돌리기로 복원할 수 있습니다.')}
 function init(){
  const pane=document.createElement('div');pane.id='motion-keys-fields';pane.className='timeline-capture-tools';pane.innerHTML='<button type="button" id="add-scroll-key" title="현재 미리보기의 스크롤 위치를 현재 시간에 기록합니다">＋ 스크롤 위치 기록</button><label class="checkbox"><input type="checkbox" id="record-scroll-gestures">드래그·휠 자동 기록</label><small id="motion-record-count"></small>';$('timeline-record-controls').append(pane);$('timeline-key-settings').insertAdjacentHTML('beforeend','<p class="timeline-empty" id="timeline-key-empty">화면을 스크롤한 뒤 현재 위치를 기록하세요.</p><div class="keyframe-table-head"><span>종류</span><span>시간 · 초</span><span>위치</span><span></span></div><div id="motion-key-list"></div>');$('timeline-reset-controls').innerHTML='<button type="button" id="clear-motion-records">이 장면의 모션 기록 초기화</button><button type="button" id="undo-motion-clear" hidden>초기화 되돌리기</button><p class="hint" id="motion-settings-note"></p>';
  $('add-scroll-key').onclick=()=>{put('scroll',time,current().offset);clearPreview();last='';draw();tell('현재 시간과 스크롤 위치를 기록했습니다.')};$('record-scroll-gestures').onchange=()=>{project.recordGestures=$('record-scroll-gestures').checked;scrollTake=null;dirty.add(project.type)};$('clear-motion-records').onclick=reset;$('undo-motion-clear').onclick=()=>{const old=undo.get(project);if(!old)return;Object.assign(project,{viewScroll:old.viewScroll,actions:old.actions,scrollKeys:old.scrollKeys,slideKeys:old.slideKeys});project.messages.forEach((m,i)=>{if(old.typing[i]?.text===m.text&&old.typing[i].typing)m.typing=old.typing[i].typing});undo.delete(project);last='';renderInteractionEditor();draw()};
  document.addEventListener('change',event=>{if(!event.target.matches('#device,#ratio,#motion,#duration,[data-film-prop]'))return;const count=project.actions.length+project.scrollKeys.length+project.slideKeys.length;if(count){pane.hidden=false;$('motion-settings-note').textContent='설정이 바뀌었습니다. 이전 모션 기록 '+count+'개가 남아 있습니다. 필요하면 이 장면만 초기화하세요.';tell('기존 모션 기록이 적용 중입니다. 모션 탭에서 초기화하거나 유지할 수 있습니다.')}});
  $('timeline').addEventListener('input',clearPreview,{capture:true});$('play').addEventListener('click',clearPreview,{capture:true});$('rewind').addEventListener('click',clearPreview,{capture:true});
  phonePreview.addEventListener('wheel',event=>{const info=current();if(!info.max||event.target.closest('.ph-comments-sheet,.ph-comment-list,textarea,input,select'))return;event.preventDefault();event.stopImmediatePropagation();pausePreview();if(!scrollTake&&project.recordGestures)put('scroll',time,info.offset,true);manual(clamp(info.offset+event.deltaY/2,0,info.max));draw();clearTimeout(phonePreview._keyWheelEnd);phonePreview._keyWheelEnd=setTimeout(()=>{scrollTake=null},200)},{passive:false,capture:true});
  let sliderDrag=null;
  phonePreview.addEventListener('pointerdown',event=>{const range=event.target.closest('[data-call-slide]');if(!range||ElementEditor.active)return;event.preventDefault();event.stopImmediatePropagation();pausePreview();const box=range.closest('.film-answer-slider').getBoundingClientRect();if(event.clientX>box.left+box.width*.29)return;sliderDrag={id:event.pointerId,x:event.clientX,range,width:box.width*(1-64/320),accepted:false};phonePreview.setPointerCapture(event.pointerId)},true);
  phonePreview.addEventListener('pointermove',event=>{if(!sliderDrag||event.pointerId!==sliderDrag.id||sliderDrag.accepted)return;const value=clamp((event.clientX-sliderDrag.x)/sliderDrag.width,0,1);sliderDrag.range.value=String(value*100);sliderDrag.accepted=value>=.94;slide(sliderDrag.range,value)});
  const finishSlider=event=>{if(!sliderDrag||event.pointerId!==sliderDrag.id)return;try{phonePreview.releasePointerCapture(event.pointerId)}catch{}if(!sliderDrag.accepted)endSlide(sliderDrag.range);sliderDrag=null};phonePreview.addEventListener('pointerup',finishSlider);phonePreview.addEventListener('pointercancel',finishSlider);
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
  draw();
 }
 return{preview,manual,render,slide,endSlide,clearPreview,init};
})();
MotionEditor.init();
