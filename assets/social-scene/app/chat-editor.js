
'use strict';
const ChatEditor=(()=>{
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const clocks=new WeakMap();
 const photoId=id=>'participant-photo-'+id;
 function refreshLabels(p){
  for(const row of $('participant-items').children){
   const member=ChatModels.person(p,row.dataset.participant);if(!member)continue;
   row.querySelector('.voice-avatar-button')?.setAttribute('aria-label',member.name+' 사진 바꾸기');
   row.querySelector('input[type=radio]')?.setAttribute('aria-label',member.name+' 내 계정으로 설정');
   const buttons=row.querySelectorAll('.text-button');buttons[0]?.setAttribute('aria-label',member.name+' 참가자 삭제');buttons[1]?.setAttribute('aria-label',member.name+' 사진 지우기');
  }
  for(const option of $('composer-sender').options){const member=ChatModels.person(p,option.value);if(member)option.textContent=member.name+(member.id===p.selfId?' · 나':'')}
 }
 function finish(p,rebuild=true){ChatModels.sync(p);dirty.add(p.type);if(project===p){if(rebuild)renderEditor();else{refreshLabels(p);renderMessageEditor();draw()}}}
 function render(){
  const p=project,on=ChatModels.enabled(p);$('chat-recording-fields').hidden=!ChatTyping.supports(p);$('record-typing').checked=p.recordTyping!==false;$('participants-fields').hidden=!on;if(!on)return;
  $('profile-fields').hidden=true;$('group-name-label').hidden=p.type==='discord-channel'||!ChatModels.group(p);$('group-name').value=p.groupName;
  $('participant-count').textContent=p.participants.length+' / '+ChatModels.limit(p)+'명';
  $('participant-limit-hint').textContent=p.type==='discord-dm'?'Discord 그룹 DM은 나를 포함해 최대 10명입니다.':'영상 템플릿의 참가자는 최대 100명입니다.';
  const list=$('participant-items');list.replaceChildren();
  p.participants.forEach((member,index)=>{
   const row=document.createElement('div');row.className='participant-row';row.dataset.participant=member.id;
   const picker=document.createElement('input');picker.type='file';picker.hidden=true;picker.accept='image/png,image/jpeg,image/webp';picker.id=photoId(member.id);picker.setAttribute('aria-label',member.name+' 사진 파일');
   const photo=document.createElement('button');photo.type='button';photo.className='voice-avatar-button';photo.setAttribute('aria-label',member.name+' 사진 바꾸기');
   const image=ChatModels.avatar(p,member.id);if(image){const img=document.createElement('img');img.src=image;img.alt='';photo.append(img)}else photo.textContent=member.name.slice(0,1)||'U';
   photo.addEventListener('click',()=>picker.click());
   picker.addEventListener('change',async()=>{
    const file=picker.files[0];picker.value='';if(!file)return;pausePreview();
    try{if(!/^image\/(png|jpeg|webp)$/.test(file.type))throw new Error('PNG, JPG, WebP 사진을 선택해 주세요.');
     const image=await loadSceneAsset(await readSceneFile(file)),canvas=document.createElement('canvas');canvas.width=canvas.height=256;sceneCover(canvas.getContext('2d'),image,0,0,256,256);
     if(!p.participants.includes(member))return;member.avatar=canvas.toDataURL('image/png');finish(p);
    }catch(error){tell(error.message)}
   });
   const name=document.createElement('input');name.value=member.name;name.maxLength=60;name.setAttribute('aria-label','참가자 '+(index+1)+' 이름');
   name.addEventListener('input',()=>{pausePreview();member.name=name.value;finish(p,false)});
   const self=document.createElement('label');self.className='participant-self';
   const radio=document.createElement('input');radio.type='radio';radio.name='self-participant';radio.value=member.id;radio.checked=member.id===p.selfId;radio.setAttribute('aria-label',member.name+' 내 계정으로 설정');
   radio.addEventListener('change',()=>{pausePreview();p.selfId=member.id;p.composerSenderId=member.id;finish(p);$('participant-items').querySelector('[data-participant="'+member.id+'"] input[type=radio]')?.focus({preventScroll:true})});self.append(radio,document.createTextNode('나'));
   const remove=document.createElement('button');remove.type='button';remove.className='text-button';remove.textContent='삭제';remove.setAttribute('aria-label',member.name+' 참가자 삭제');
   remove.disabled=member.id===p.selfId||p.participants.length<=2;
   remove.addEventListener('click',()=>{
    if(p.messages.some(m=>ChatModels.sender(p,m)===member.id)){tell('이 참가자의 메시지가 있어요. 메시지의 보낸 사람을 바꾸거나 메시지를 삭제한 뒤 지워 주세요.');return}
    p.participants=p.participants.filter(x=>x!==member);if(member.id==='person-1')p.props.selfAvatar='';if(member.id==='person-2'){p.props.otherAvatar='';p.avatar=''}finish(p);
   });
   const clear=document.createElement('button');clear.type='button';clear.className='text-button';clear.textContent='사진 지우기';clear.setAttribute('aria-label',member.name+' 사진 지우기');
   clear.addEventListener('click',()=>{member.avatar='';if(member.id==='person-1')p.props.selfAvatar='';if(member.id==='person-2'){p.props.otherAvatar='';p.avatar=''}finish(p)});
   row.append(photo,name,self,remove,clear,picker);list.append(row);
  });
  $('add-participant').disabled=p.participants.length>=ChatModels.limit(p);
  const selector=$('composer-sender');selector.replaceChildren(...p.participants.map(member=>{const o=document.createElement('option');o.value=member.id;o.textContent=member.name+(member.id===p.selfId?' · 나':'');return o}));selector.value=p.composerSenderId;
 }
 function inlineEdit(key,value){
  if(key==='groupName'){project.groupName=value.slice(0,80);$('group-name').value=project.groupName;dirty.add(project.type);draw();return true}

  const match=/^participants\.(\d+)\.name$/.exec(key);if(!match)return false;
  const member=project.participants?.[Number(match[1])];if(!member)return true;
  member.name=value.slice(0,60);ChatModels.sync(project);dirty.add(project.type);
  for(const node of phonePreview.querySelectorAll('[data-phone-field],[data-film-field]'))if(node!==document.activeElement&&(node.dataset.phoneField===key||node.dataset.filmField===key))node.textContent=member.name;
  const field=$('participant-items').children[Number(match[1])]?.querySelector('input:not([type=radio]):not([type=file])');if(field&&field!==document.activeElement)field.value=member.name;
  refreshLabels(project);renderMessageEditor();draw();return true;
 }
 function action(action){
  const image=/^chat-image:(\d+)$/.exec(action);if(image&&ChatMedia.supports(project)){selectInspectorTab('content');renderMessageEditor();$('messages').querySelector('[data-chat-photo="'+image[1]+'"]')?.click();return true}
  if(!ChatModels.enabled(project))return false;
  if(action==='participants'||action.startsWith('participant-photo:')){
   selectInspectorTab('content');
   if(action==='participants'){$('participants-fields').scrollIntoView({block:'start'});return true}
   const id=action.slice('participant-photo:'.length);$(photoId(id))?.click();return true;
  }return false;
 }
 function resumeDraft(p){const clock=clocks.get(p);if(clock&&!clock.wall)clock.wall=performance.now()}
 function suspendDraft(p){const clock=clocks.get(p);if(clock?.wall){clock.elapsed+=(performance.now()-clock.wall)/1000;clock.wall=0}}
 function draftInput(target,selection=false){
  const p=project;if(!ChatTyping.supports(p)||!p.recordTyping||target.dataset.phoneComposer!=='chatDraft')return;
  let clock=clocks.get(p);
  if(!clock){
   if(selection||!target.value&&!p.chatDraftTrace)return;
   const start=p.chatDraftTrace?.start??Math.min(time,SceneTiming.maxDuration-.5),last=p.chatDraftTrace?.events.at(-1)?.at||0;
   p.chatDraftTrace??={start,events:[{at:0,value:'',from:0,to:0}]};clock={elapsed:last,wall:performance.now()};clocks.set(p,clock);p.motion='messages';$('motion').value='messages';
  }
  if(!clock.wall)clock.wall=performance.now();
  const realElapsed=clock.elapsed+(performance.now()-clock.wall)/1000,elapsed=Math.min(realElapsed,(SceneTiming.maxDuration-.2)-p.chatDraftTrace.start),position=p.chatDraftTrace.start+elapsed;
  if(realElapsed>elapsed)tell('장면 최대 길이에 도달했습니다. 마지막 글은 유지하며 입력 기록은 끝 위치에 모읍니다.');
  try{ChatTyping.append(p.chatDraftTrace,target.value,target.selectionStart??target.value.length,target.selectionEnd??target.value.length,elapsed)}catch(error){clearDraft();p.recordTyping=false;$('record-typing').checked=false;tell(error.message+' 입력한 글은 유지합니다.');return}
  time=position;p.duration=Math.max(p.duration,Math.ceil((position+.2)*10)/10);$('duration').value=String(p.duration);$('timeline').max=String(p.duration);$('duration-label').textContent=formatSceneTime(p.duration/p.speed);
  $('chat-recording-status').textContent='기록 중 · '+p.chatDraftTrace.events.length+'단계 · '+elapsed.toFixed(1)+'초';dirty.add(p.type);
 }
 function takeDraft(){
  const p=project;if(!ChatTyping.supports(p)||!p.chatDraftTrace)return null;
  suspendDraft(p);const trace=p.chatDraftTrace,clock=clocks.get(p),span=Math.min((SceneTiming.maxDuration-.2)-trace.start,Math.max(trace.events.at(-1)?.at||0,clock?.elapsed||0));
  // Keep every captured state when the final wait exceeds the scene duration limit.
  const available=(SceneTiming.maxDuration-.2)-trace.start,scale=span>available?available/span:1;
  if(scale<1)trace.events.forEach(e=>e.at*=scale);
  const at=trace.start+span*scale;p.duration=Math.min(SceneTiming.maxDuration,Math.max(p.duration,at+.2));$('duration').value=String(p.duration);$('timeline').max=String(p.duration);time=at;p.chatDraftTrace=null;clocks.delete(p);$('chat-recording-status').textContent='기록됨 · '+trace.events.length+'단계';return{at,typing:trace};
 }
 function clearDraft(){clocks.delete(project);if(ChatTyping.supports(project))project.chatDraftTrace=null}
 function init(){
  $('record-typing').addEventListener('change',()=>{project.recordTyping=$('record-typing').checked;if(!project.recordTyping)clearDraft();dirty.add(project.type);draw()});
  phonePreview.addEventListener('focusin',event=>{if(event.target.matches('[data-phone-composer=chatDraft]'))resumeDraft(project)});
  phonePreview.addEventListener('focusout',event=>{if(event.target.matches('[data-phone-composer=chatDraft]'))suspendDraft(project)});
  phonePreview.addEventListener('select',event=>{if(event.target.matches('[data-phone-composer=chatDraft]'))draftInput(event.target,true)});
  $('add-participant').addEventListener('click',()=>{
   const p=project;if(!ChatModels.enabled(p)||p.participants.length>=ChatModels.limit(p))return;
   let n=1;while(p.participants.some(x=>x.id==='person-'+n))n++;p.participants.push({id:'person-'+n,name:'User '+n,avatar:''});finish(p);
   const last=$('participant-items').lastElementChild;last?.scrollIntoView({block:'nearest'});const field=last?.querySelector('input:not([type=radio]):not([type=file])');field?.focus({preventScroll:true});field?.select();
  });
  $('group-name').addEventListener('input',()=>{project.groupName=$('group-name').value.slice(0,80);dirty.add(project.type);draw()});
  $('composer-sender').addEventListener('change',()=>{project.composerSenderId=$('composer-sender').value;dirty.add(project.type)});
 }
 async function photo(file,index=null){
  if(!file)return;pausePreview();const p=project,position=time,target=index===null?null:project.messages[index];
  try{
   const video=file.type.startsWith('video/');if(!/^image\/(png|jpeg|webp)$/.test(file.type)&&!/^video\/(mp4|webm|quicktime)$/.test(file.type))throw Error('PNG·JPG·WebP 사진 또는 MP4·WebM·MOV 영상을 사용해 주세요.');
   if(index===null&&p.messages.length>=ChatModels.messageLimit(p))throw Error('메시지 한도에 도달했습니다. 메시지를 지운 뒤 미디어를 추가해 주세요.');
   let value;if(video)value=await VideoMedia.attachment(file);else{const data=await readSceneFile(file),image=await loadSceneAsset(data);value=ChatMedia.attachment({image:data,imageName:file.name.slice(0,300),imageWidth:image.naturalWidth,imageHeight:image.naturalHeight})}
   const bytes=p.messages.reduce((sum,m)=>sum+(m===target?0:ChatMedia.bytes(m)),0)+ChatMedia.bytes(value);if(bytes>64*1024*1024)throw Error('대화 미디어의 총 크기는 64MB 이내로 사용해 주세요.');
   const at=Math.max(0,Math.min(SceneTiming.maxDuration,position));if(index===null){if(at>=SceneTiming.maxDuration)throw Error('영상 길이의 끝보다 앞쪽에 미디어를 추가해 주세요.');p.duration=Math.min(SceneTiming.maxDuration,Math.max(p.duration,Math.ceil((at+(video?value.videoDuration+.8:.35))*10)/10))}
   if(index===null){if(p.messages.length>=ChatModels.messageLimit(p))throw Error('메시지 한도에 도달했습니다.');const senderId=ChatModels.enabled(p)?p.composerSenderId:null;p.messages.push({side:senderId?ChatModels.side(p,senderId):'me',text:'',time:p.messages.at(-1)?.time||'오후 1:27',at,...value,...(senderId?{senderId}:{})})}
   else{if(!target||!p.messages.includes(target)){tell('원래 메시지가 삭제되어 교체를 취소했어요.');return}const previous=target.videoId;if(previous)p.actions=p.actions.filter(e=>ChatMedia.parseAction(e.action)?.id!==previous);delete target.video;delete target.videoId;delete target.videoDuration;Object.assign(target,value)}
   dirty.add(p.type);if(project===p){if(index===null)time=at;renderEditor();draw();if(index===null)playPreview(Math.min(p.duration,at+.35))}
   tell(video?'영상을 대화에 추가했어요. 재생 버튼을 누르면 크게 볼 수 있습니다.':'사진을 대화에 적용했어요.');
  }catch(error){tell(error.message||'미디어 메시지를 추가하지 못했습니다.')}
 }
 function photoControl(message,index){
  const box=document.createElement('div');box.className='chat-photo-editor';const image=document.createElement('img');image.src=message.image;image.alt=message.imageName||'사진 메시지';
  const picker=document.createElement('input');picker.type='file';picker.hidden=true;picker.dataset.chatPhoto=String(index);picker.accept='image/png,image/jpeg,image/webp,video/mp4,video/webm,video/quicktime';picker.setAttribute('aria-label','메시지 '+(index+1)+' 사진 교체');
  const button=document.createElement('button');button.type='button';button.className='text-button';button.textContent=message.video?'영상 교체':'사진·영상 교체';button.onclick=()=>picker.click();picker.onchange=()=>{photo(picker.files[0],index);picker.value=''};
  box.append(image,button,picker);return box;
 }

 return{render,init,inlineEdit,action,draftInput,takeDraft,clearDraft,photo,photoControl};
})();

