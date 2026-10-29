'use strict';
const TimelineEditor=(()=>{
 const history=new WeakMap(),nodes=new Map();let owner=null,selected=null,drag=null,snapping=true,pending=0,suppress=null;
 const track=()=>document.querySelector('.timeline-track');
 const collection=(p,kind)=>kind==='action'?p.actions:p[kind+'Keys'];
 const entries=()=>['action','scroll','slide'].flatMap(kind=>collection(project,kind).map((item,index)=>({kind,item,index}))).filter(entry=>entry.item.at<=project.duration);
 const same=(a,b)=>a&&b&&a.kind===b.kind&&a.item===b.item;
 const label=entry=>entry.kind==='action'?CollectionEditor.label(entry.item.action):entry.kind==='scroll'?'스크롤 위치':'밀기 위치';
 function clearPreview(){if(typeof MotionEditor!=='undefined')MotionEditor.clearPreview()}
 function seek(at){pausePreview();clearPreview();time=Math.max(0,Math.min(project.duration,at));seekSource();draw()}
 function refresh(markDirty=true){for(const kind of ['scroll','slide'])project[kind+'Keys'].sort((a,b)=>a.at-b.at);if(markDirty)dirty.add(project.type);renderInteractionEditor();draw()}
 function remember(command){let stack=history.get(project);if(!stack){stack={undo:[],redo:[]};history.set(project,stack)}stack.undo.push(command);if(stack.undo.length>100)stack.undo.shift();stack.redo=[]}
 function focusSelected(){const node=selected&&nodes.get(selected.item);if(node)node.focus({preventScroll:true})}
 function choose(entry){selected=entry;seek(entry.item.at);focusSelected()}
 function move(entry,at){const from=entry.item.at;if(Math.abs(from-at)<1e-8)return;remember({type:'move',kind:entry.kind,item:entry.item,from,to:at});entry.item.at=at;selected=entry;time=at;clearPreview();refresh();focusSelected()}
 function remove(){if(!selected)return;const list=collection(project,selected.kind),index=list.indexOf(selected.item);if(index<0)return;remember({type:'delete',kind:selected.kind,item:selected.item,index});list.splice(index,1);selected=null;refresh();$('timeline').focus({preventScroll:true})}
 function restore(reverse){
  const stack=history.get(project),source=stack?.[reverse?'undo':'redo'],target=stack?.[reverse?'redo':'undo'];if(!source?.length)return;
  const command=source.at(-1),list=collection(project,command.kind),index=list.indexOf(command.item);
  if(command.type==='move'){
   if(index<0||Math.abs(command.item.at-(reverse?command.to:command.from))>1e-7){tell('다른 곳에서 바뀐 키프레임은 타임라인 되돌리기로 덮어쓰지 않습니다.');return}
   command.item.at=reverse?command.from:command.to;
  }else if(reverse){if(index>=0||list.length>=(command.kind==='action'?60:600))return;list.splice(Math.min(command.index,list.length),0,command.item)}
  else{if(index<0)return;list.splice(index,1)}
  source.pop();target.push(command);selected=command.type==='delete'&&!reverse?null:{kind:command.kind,item:command.item};if(selected)time=Math.min(project.duration,selected.item.at);clearPreview();refresh();focusSelected();
 }
 function startDrag(event,entry,node){
  if(event.button!==0||recording)return;event.preventDefault();event.stopPropagation();pausePreview();
  const bounds=track().getBoundingClientRect();selected=entry;drag={entry,node,pointer:event.pointerId,x:event.clientX,from:entry.item.at,last:entry.item.at,width:bounds.width,duration:project.duration,playhead:time,moved:false};
  node.setPointerCapture(event.pointerId);seek(entry.item.at);node.focus({preventScroll:true});
 }
 function dragTo(event){
  if(!drag||event.pointerId!==drag.pointer)return;event.preventDefault();const distance=event.clientX-drag.x;if(!drag.moved&&Math.abs(distance)<2)return;drag.moved=true;
  let at=Math.max(0,Math.min(drag.duration,drag.from+distance/drag.width*drag.duration));
  if(snapping&&!event.shiftKey){const anchors=[0,drag.duration,drag.playhead,...entries().filter(entry=>!same(entry,drag.entry)).map(entry=>entry.item.at)];at=SceneTiming.snap(at,drag.duration,project.speed,anchors,8/drag.width*drag.duration)}else at=Math.round(at*1000)/1000;
  drag.last=at;drag.entry.item.at=at;time=at;clearPreview();if(!pending)pending=requestAnimationFrame(()=>{pending=0;seekSource();draw()});
 }
 function finishDrag(cancel=false){
  if(!drag)return;const current=drag;drag=null;if(pending){cancelAnimationFrame(pending);pending=0}
  if(cancel){current.entry.item.at=current.from;time=current.from}
  else if(current.moved&&Math.abs(current.last-current.from)>1e-8){remember({type:'move',kind:current.entry.kind,item:current.entry.item,from:current.from,to:current.last});suppress=current.entry.item}
  if(current.node.hasPointerCapture(current.pointer))current.node.releasePointerCapture(current.pointer);refresh(!cancel&&current.moved&&Math.abs(current.last-current.from)>1e-8);focusSelected();
 }
 function render(){
  const box=$('interaction-markers');if(!box)return;
  if(owner!==project){owner=project;nodes.clear();box.replaceChildren();selected=null;drag=null}
  const list=entries(),visible=new Set(list.map(entry=>entry.item)),kinds=['action','scroll','slide'].filter(kind=>list.some(entry=>entry.kind===kind));track().style.setProperty('--marker-lanes',String(kinds.length));const laneNames='<span>장면</span>'+kinds.map(kind=>'<span>'+({action:'동작',scroll:'스크롤',slide:'밀기'}[kind])+'</span>').join('');if($('timeline-lane-names').innerHTML!==laneNames)$('timeline-lane-names').innerHTML=laneNames;$('timeline-record-total').textContent=String(list.length);
  for(const[item,node]of nodes)if(!visible.has(item)){node.remove();nodes.delete(item);if(selected?.item===item)selected=null}
  for(const entry of list){
   let node=nodes.get(entry.item);
   if(!node){
    node=document.createElement('button');node.type='button';node.className='interaction-marker';nodes.set(entry.item,node);box.append(node);
    node.onpointerdown=event=>startDrag(event,entry,node);node.onpointermove=dragTo;node.onpointerup=()=>finishDrag();node.onpointercancel=()=>finishDrag(true);
    node.onclick=event=>{event.preventDefault();event.stopPropagation();if(suppress===entry.item){suppress=null;return}choose(entry)};
   }
   const title=label(entry)+' · '+formatSceneTime(entry.item.at/project.speed),position=String(entry.item.at/project.duration*100)+'%';
   if(node.style.left!==position)node.style.left=position;node.style.top=String(38+kinds.indexOf(entry.kind)*20)+'px';node.dataset.kind=entry.kind;node.dataset.at=String(entry.item.at);node.title=title+' · 드래그로 이동 · Delete로 삭제';node.setAttribute('aria-label',title);node.setAttribute('aria-pressed',String(!!same(selected,entry)));node.classList.toggle('is-selected',!!same(selected,entry));
  }
 }
 function editTime(kind){
  if(recording)return;pausePreview();const button=$(kind==='current'?'current-time':'duration-label'),input=$('edit-'+kind+'-time');button.hidden=true;input.hidden=false;input.value=formatSceneTime((kind==='current'?time:project.duration)/project.speed);input.removeAttribute('aria-invalid');input.focus();input.select();
 }
 function closeTime(kind,commit,blur=false){
  const button=$(kind==='current'?'current-time':'duration-label'),input=$('edit-'+kind+'-time');if(input.hidden)return;
  const parsed=SceneTiming.parse(input.value);
  if(commit&&parsed===null&&!blur){input.setAttribute('aria-invalid','true');tell('시간은 초 또는 분:초.소수 형식으로 입력하세요. 예: 90 / 01:30.50');return}
  input.hidden=true;button.hidden=false;
  if(commit&&parsed!==null){if(kind==='current')seek(parsed*project.speed);else{project.duration=Math.max(2,Math.min(SceneTiming.maxDuration,parsed*project.speed));$('duration').value=String(project.duration);time=Math.min(time,project.duration);clearPreview();dirty.add(project.type);renderEditor()}}
  if(!blur)button.focus({preventScroll:true});
 }
 function keydown(event){
  if(recording||event.ctrlKey&&event.altKey||event.target.closest('input:not([type=range]),textarea,select,[contenteditable],[role=combobox]')||event.target.matches('input[type=range]:not(#timeline)'))return;
  const inTimeline=event.target.closest('.transport'),preview=event.target===document.body||event.target===canvas||phonePreview.contains(event.target);if(!inTimeline&&!preview)return;
  const key=event.code==='KeyZ'?'z':event.code==='KeyS'?'s':event.key.toLowerCase(),modifier=event.ctrlKey||event.metaKey;
  if(modifier){if(key==='z'){const stack=history.get(project);if(stack?.[event.shiftKey?'redo':'undo'].length){event.preventDefault();event.stopPropagation();restore(!event.shiftKey)}}return}
  if(event.altKey)return;
  if(key===' '){if(event.target.closest('button')&&!event.target.closest('.interaction-marker'))return;event.preventDefault();event.stopPropagation();if(!event.repeat)playPreview();return}
  if(key==='escape'){if(drag)finishDrag(true);selected=null;render();return}
  if(key==='s'){event.preventDefault();snapping=!snapping;$('timeline-snap').setAttribute('aria-pressed',String(snapping));$('timeline-snap').textContent='스냅 '+(snapping?'켜짐':'꺼짐')+' · S';tell('키프레임 스냅 '+(snapping?'켜짐':'꺼짐'));return}
  if((key==='delete'||key==='backspace')&&selected){event.preventDefault();event.stopPropagation();remove();return}
  if(['arrowleft','arrowright'].includes(key)){
   event.preventDefault();event.stopPropagation();const step=(key==='arrowleft'?-1:1)*(event.shiftKey?10:1)*project.speed/SceneTiming.frameRate;
   if(selected)move(selected,SceneTiming.snap(selected.item.at+step,project.duration,project.speed));else seek(SceneTiming.snap(time+step,project.duration,project.speed));return;
  }
  if(key==='home'||key==='end'){event.preventDefault();event.stopPropagation();selected=null;seek(key==='home'?0:project.duration);return}
  if(key==='arrowup'||key==='arrowdown'){
   event.preventDefault();event.stopPropagation();const list=entries().sort((a,b)=>a.item.at-b.item.at),next=key==='arrowup'?[...list].reverse().find(entry=>entry.item.at<time-1e-6):list.find(entry=>entry.item.at>time+1e-6);if(next)choose(next);return;
  }
 }
 function init(){
  $('duration').max=String(SceneTiming.maxDuration);
  for(const kind of ['current','duration']){
   const button=$(kind==='current'?'current-time':'duration-label'),input=document.createElement('input');input.id='edit-'+kind+'-time';input.className='timeline-time-input';input.type='text';input.inputMode='decimal';input.hidden=true;input.setAttribute('aria-label',kind==='current'?'현재 시간 입력':'전체 길이 입력');input.title='초 / 분:초.소수 / 시:분:초:프레임';button.after(input);button.type='button';button.classList.add('timeline-time-button');button.title='클릭해서 '+(kind==='current'?'현재 시간':'전체 길이')+' 입력';button.onclick=()=>editTime(kind);input.onkeydown=event=>{if(event.key==='Enter'){event.preventDefault();event.stopPropagation();closeTime(kind,true)}else if(event.key==='Escape'){event.preventDefault();event.stopPropagation();closeTime(kind,false)}};input.onblur=()=>closeTime(kind,true,true);
  }
  const help=document.createElement('details');help.id='timeline-shortcuts';help.className='timeline-shortcuts';help.innerHTML='<summary>타임라인 단축키</summary><p>키프레임을 드래그해 이동합니다. Shift를 누르면 스냅을 잠시 끕니다.</p><dl><dt>← / →</dt><dd>선택 키프레임 또는 재생 위치 1프레임 이동</dd><dt>Shift + ← / →</dt><dd>10프레임 이동</dd><dt>↑ / ↓</dt><dd>이전 / 다음 키프레임 선택</dd><dt>Home / End</dt><dd>처음 / 끝으로 이동</dd><dt>Space</dt><dd>재생 / 일시정지</dd><dt>Delete / Backspace</dt><dd>선택 키프레임 삭제</dd><dt>Ctrl·⌘ + Z</dt><dd>타임라인 변경 되돌리기</dd><dt>Ctrl·⌘ + Shift + Z</dt><dd>다시 실행</dd></dl><button type="button" id="timeline-snap" aria-pressed="true">스냅 켜짐 · S</button><p>빈 트랙을 누르면 선택을 해제합니다. 현재 시간과 전체 길이는 숫자를 눌러 입력합니다.</p>';const helpContent=document.createElement('div');helpContent.className='timeline-shortcuts-content';while(help.children.length>1)helpContent.append(help.children[1]);help.append(helpContent);$('timeline-tool-help').append(help);$('timeline-records-toggle').before($('timeline-snap'));$('timeline-records-toggle').onclick=()=>{const open=$('timeline-records').hidden;$('timeline-records').hidden=!open;$('timeline-records-toggle').setAttribute('aria-expanded',String(open));fitPreview()};$('timeline-action-settings').append($('interaction-fields'));$('interaction-fields').querySelector('legend').textContent='기록된 동작';$('timeline-snap').onclick=()=>{snapping=!snapping;$('timeline-snap').setAttribute('aria-pressed',String(snapping));$('timeline-snap').textContent='스냅 '+(snapping?'켜짐':'꺼짐')+' · S'};
  track().addEventListener('pointerdown',event=>{if(!event.target.closest('.interaction-marker')){selected=null;render()}});
  document.addEventListener('keydown',keydown,true);draw();
 }
 return{render,init,get dragging(){return!!drag}};
})();
TimelineEditor.init();
