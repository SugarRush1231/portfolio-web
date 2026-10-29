
'use strict';
const FilmEditor=(()=>{

 function avatarControl(p,key,labelText){
  const row=document.createElement('div');row.className='discord-avatar-editor';
  const title=document.createElement('span');title.textContent=labelText;
  const picker=document.createElement('input');picker.type='file';picker.hidden=true;picker.accept='image/png,image/jpeg,image/webp';picker.dataset.discordAvatar=key;picker.setAttribute('aria-label',labelText+' 파일');
  const button=document.createElement('button');button.type='button';button.className='voice-avatar-button';button.setAttribute('aria-label',labelText+' 변경');
  const data=p.props[key]||(key==='otherAvatar'?p.avatar:'');if(data){const image=document.createElement('img');image.src=data;image.alt='';button.append(image)}else button.textContent=key==='selfAvatar'?'1':'2';
  button.addEventListener('click',()=>picker.click());
  const remove=document.createElement('button');remove.type='button';remove.className='text-button';remove.textContent='사진 지우기';remove.setAttribute('aria-label',labelText+' 지우기');
  remove.addEventListener('click',()=>{p.props[key]='';if(key==='otherAvatar')p.avatar='';dirty.add(p.type);if(project===p)renderEditor()});
  picker.addEventListener('change',async()=>{
   const file=picker.files[0];picker.value='';if(!file)return;pausePreview();
   try{
    if(!/^image\/(png|jpeg|webp)$/.test(file.type))throw new Error('PNG, JPG, WebP 사진을 선택해 주세요.');
    const img=await loadSceneAsset(await readSceneFile(file)),canvas=document.createElement('canvas');canvas.width=canvas.height=256;sceneCover(canvas.getContext('2d'),img,0,0,256,256);
    p.props[key]=canvas.toDataURL('image/png');dirty.add(p.type);if(project===p)renderEditor();
   }catch(error){tell(error.message)}
  });
  row.append(title,button,remove,picker);return row;
 }

 function value(p,key){if(p.type==='news-article'&&Object.hasOwn(NewsModel.fields,key))return NewsModel.read(p,time,key);if(p.type==='email-inbox'&&p.selectedMail>0&&(Object.hasOwn(SceneCollections.mailText,key)||key==='mailCategory'))return p.mailItems[p.selectedMail-1][key];return Object.hasOwn(p.props,key)?p.props[key]:p[key]}
 function set(p,key,next){if(key==='comments')return;if(key==='clock'&&ChatClock.supports(p)){ChatClock.setDisplay(p,next,time);if(p===project){syncPhoneEditors();renderMessageEditor();}return}if(p.type==='news-article'&&Object.hasOwn(NewsModel.fields,key)){NewsModel.write(p,time,key,next);return}if(p.type==='email-inbox'&&p.selectedMail>0&&(Object.hasOwn(SceneCollections.mailText,key)||key==='mailCategory')){p.mailItems[p.selectedMail-1][key]=next;return}if(Object.hasOwn(p.props,key))p.props[key]=next;else p[key]=next}
 function fieldControl(p,descriptor){
  if(descriptor.kind==='avatar')return avatarControl(p,descriptor.key,descriptor.label);
  const label=document.createElement('label');label.textContent=descriptor.label;
   const movHint=descriptor.key==='exportFormat'&&p.type==='discord-voice'?document.createElement('small'):null;
   const updateMovHint=()=>{if(!movHint)return;movHint.hidden=p.props.exportFormat!=='mov';movHint.textContent='배경 선택과 관계없이 투명 · 30fps · 무음으로 저장합니다.'+(location.protocol==='file:'?' MOV는 파일 직접 열기 대신 웹 주소에서 저장해 주세요.':'')};
  const control=document.createElement(descriptor.kind==='textarea'?'textarea':descriptor.kind==='select'?'select':'input');
  control.dataset.filmProp=descriptor.key;if(descriptor.key==='comments')control.readOnly=true;control.setAttribute('aria-label',descriptor.label);
  if(descriptor.kind==='select')for(const[k,v]of Object.entries(descriptor.key==='notificationStyle'&&p.device==='iphone'?{cards:'목록',icons:'개수'}:descriptor.options)){const option=document.createElement('option');option.value=k;option.textContent=v;control.append(option)}
  else if(descriptor.kind==='checkbox')control.type='checkbox';
  else if(descriptor.kind==='number'){control.type='number';control.min=descriptor.min;control.max=descriptor.max;control.step=descriptor.step||1}
  else if(descriptor.kind==='color')control.type='color';
  else {if(control.tagName==='INPUT')control.type='text';control.maxLength=['name','handle'].includes(descriptor.key)?60:descriptor.key==='body'?3000:5000;if(descriptor.kind==='textarea')control.rows=4}
  if(descriptor.kind==='checkbox'){label.className='checkbox';control.checked=value(p,descriptor.key)}else control.value=value(p,descriptor.key)??'';
  control.addEventListener('input',()=>{
   pausePreview();let next=control.type==='checkbox'?control.checked:control.value;
   if(control.type==='number'){if(!Number.isFinite(control.valueAsNumber))return;next=Math.max(Number(control.min),Math.min(Number(control.max),control.valueAsNumber))}
   set(p,descriptor.key,next);dirty.add(p.type);draw();updateExportLabel();applyPreviewAudio();updateMovHint();
  });
  label.append(control);if(movHint){movHint.id='voice-mov-note';movHint.className='hint';label.append(movHint);updateMovHint()}return label;
 }
 function updateExportLabel(){
  const text=(project.type==='kakao-overlay'&&project.overlayFormat==='mov'||project.type==='discord-voice'&&project.props.exportFormat==='mov')?'투명 MOV 내보내기':project.type==='discord-voice'&&project.props.exportFormat==='sequence'?'투명 시퀀스 내보내기':'영상 내보내기';$('save-video').querySelector('span').textContent=text;
 }
 function render(){
  const spec=FilmModels.specs[project.type],film=!!spec;
  $('film-fields').hidden=!film;$('voice-fields').hidden=project.type!=='discord-voice';
  $('phone-frame').classList.toggle('alpha-preview',project.type==='discord-voice'&&project.props.background==='transparent');
  updateExportLabel();
  $('receipt').closest('label').hidden=film;$('date').closest('label').hidden=film;
  if(!film)return;
  for(const id of ['profile-fields','profile-meta-fields','post-fields','comment-fields','story-fields','search-fields','results-fields','search-motion-fields','phone-style-fields','chat-motion-fields'])$(id).hidden=true;
  $('message-fields').hidden=!spec.messages;
  $('media-fields').hidden=project.type==='discord-voice';
  $('device-fields').hidden=false;$('ratio').querySelector('[value=device]').hidden=false;
  $('film-props').replaceChildren(...spec.fields.filter(descriptor=>!(descriptor.key==='status'&&project.type==='discord-dm'&&ChatModels.group(project))&&!(ChatModels.enabled(project)&&['name','handle','selfAvatar','otherAvatar'].includes(descriptor.key))&&descriptor.key!=='previewVolume'&&!(descriptor.key==='iphoneLocked'&&project.device==='android')).map(descriptor=>fieldControl(project,descriptor)));
  $('interaction-fields').hidden=['discord-channel','discord-voice','news-article'].includes(project.type);
  $('media-file').accept=spec.video?'image/png,image/jpeg,image/webp,video/mp4,video/webm,video/quicktime':'image/png,image/jpeg,image/webp';
  $('media-label').textContent=spec.video?'이미지 또는 영상 올리기':project.type==='phone-notifications'?'배경 이미지 올리기':'이미지 올리기';
  $('media-hint').textContent=spec.video?'MP4 / WebM도 사용할 수 있어요. 오디오 트랙이 있는 영상은 소리도 출력합니다. 최대 20MB.':'사진은 PNG / JPG / WebP로 올려 주세요.';
  const motions=spec.messages?['messages','still']:SceneScroll.supports(project.type)?['still','scroll','reveal']:['still','reveal'];for(const option of $('motion').options)option.hidden=!motions.includes(option.value);
  if(project.type==='discord-voice')renderVoices();
 }
 function renderVoices(){
  const p=project;$('voice-items').replaceChildren();
  p.voices.forEach((voice,index)=>{
   const row=document.createElement('div');row.className='voice-editor-row';
   const head=document.createElement('div');head.className='voice-heading';
   const photo=document.createElement('button');photo.type='button';photo.className='voice-avatar-button';photo.setAttribute('aria-label','참가자 '+(index+1)+' 프로필 사진');
   if(voice.avatar){const img=document.createElement('img');img.src=voice.avatar;img.alt='';photo.append(img)}else photo.textContent=String(index+1);
   const name=document.createElement('input');name.value=voice.name;name.maxLength=60;name.setAttribute('aria-label','참가자 '+(index+1)+' 이름');
   name.addEventListener('input',()=>{voice.name=name.value;dirty.add(p.type);draw()});
   const remove=document.createElement('button');remove.type='button';remove.textContent='×';remove.setAttribute('aria-label','참가자 '+(index+1)+' 삭제');
   remove.addEventListener('click',()=>{pausePreview();const a=assetsByScene[p.type]?.voices?.[index];if(a?.url)URL.revokeObjectURL(a.url);p.voices.splice(index,1);assetsByScene[p.type]?.voices?.splice(index,1);renderVoices();dirty.add(p.type);draw()});
   const image=document.createElement('input');image.type='file';image.accept='image/png,image/jpeg,image/webp';image.hidden=true;photo.addEventListener('click',()=>image.click());
   image.addEventListener('change',async()=>{
    const file=image.files[0];image.value='';if(!file)return;
    try{const img=await loadSceneAsset(await readSceneFile(file)),canvas=document.createElement('canvas');canvas.width=canvas.height=256;sceneCover(canvas.getContext('2d'),img,0,0,256,256);const data=canvas.toDataURL('image/png'),avatar=await loadSceneAsset(data),at=p.voices.indexOf(voice);if(at<0)return;
     voice.avatar=data;const group=assetsByScene[p.type]||={};group.voices||=[];(group.voices[at]||={}).avatar=avatar;if(project.type===p.type){assets=group;renderVoices();draw()}dirty.add(p.type);
    }catch(error){tell(error.message)}
   });
   head.append(photo,name,remove);row.append(head,image);
   const controls=document.createElement('div');controls.className='field-row';
   const muted=document.createElement('label');muted.className='checkbox';const mute=document.createElement('input');mute.type='checkbox';mute.checked=voice.muted;mute.addEventListener('change',()=>{voice.muted=mute.checked;dirty.add(p.type);applyPreviewAudio();draw()});muted.append(mute,document.createTextNode('비활성'));
   const gainLabel=document.createElement('label');gainLabel.textContent='감지 증폭';const gain=document.createElement('input');gain.type='number';gain.min=0;gain.max=4;gain.step=.1;gain.value=voice.gain;gain.addEventListener('input',()=>{if(!Number.isFinite(gain.valueAsNumber))return;voice.gain=Math.min(4,Math.max(0,gain.valueAsNumber));dirty.add(p.type);draw()});gainLabel.append(gain);controls.append(muted,gainLabel);row.append(controls);
   const audioLabel=document.createElement('label');audioLabel.textContent='이 참가자만의 음성 파일';const audio=document.createElement('input');audio.type='file';audio.accept='audio/*,video/mp4,video/webm';audio.setAttribute('aria-label','참가자 '+(index+1)+' 음성 분석');
   audio.addEventListener('change',async()=>{const file=audio.files[0];audio.value='';if(file)await analyzeAudio(p,voice,file,audio)});
   audioLabel.append(audio);row.append(audioLabel);
   const status=document.createElement('p');status.className='voice-audio-status';status.textContent=voice.envelope.length?(voice.audioName+' · '+(voice.envelope.length/50).toFixed(1)+'초 분석 데이터'):'수동 예시 구간 · 분리 음성을 올리면 자동 감지로 전환';row.append(status);
   const manual=document.createElement('label');manual.textContent='수동 발화 구간 · 초';const segments=document.createElement('textarea');segments.rows=2;segments.value=voice.segments.map(s=>s.start+'-'+s.end).join(', ');segments.setAttribute('aria-label','참가자 '+(index+1)+' 수동 구간');
   const error=document.createElement('p');error.className='voice-segments-error';error.setAttribute('role','status');
   segments.addEventListener('input',()=>{try{const list=FilmModels.parseSegments(segments.value);if(list.length>100)throw new Error('발화 구간은 100개까지입니다.');voice.segments=list;voice.envelope=[];voice.audioName='';error.textContent='';dirty.add(p.type);draw()}catch(e){error.textContent=e.message}});
   manual.append(segments);row.append(manual,error);$('voice-items').append(row);
  });
  $('add-voice').disabled=p.voices.length>=6;
 }
 async function analyzeAudio(p,voice,file,input){
  if(file.size>50*1024*1024){tell('음성은 50MB 이하로 올려 주세요.');return}
  input.disabled=true;pausePreview();let url=URL.createObjectURL(file),context;
  try{
   const audio=new Audio();audio.preservesPitch=false;audio.preload='metadata';audio.src=url;
   await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('음성 정보를 읽지 못했습니다.')),10000);audio.onloadedmetadata=()=>{clearTimeout(timer);resolve()};audio.onerror=()=>{clearTimeout(timer);reject(new Error('오디오가 포함된 파일을 선택해 주세요.'))}});
   if(!Number.isFinite(audio.duration)||audio.duration>600)throw new Error('음성 원본은 최대 10분입니다. 필요한 구간을 잘라 올려 주세요.');
   context=new AudioContext();const buffer=await context.decodeAudioData(await file.arrayBuffer()),channels=Array.from({length:buffer.numberOfChannels},(_,i)=>buffer.getChannelData(i)),samples=new Float32Array(buffer.length);
   for(let i=0;i<samples.length;i++)for(const channel of channels)samples[i]=Math.max(samples[i],Math.abs(channel[i]));
   const data=FilmModels.envelope(samples,buffer.sampleRate),index=p.voices.indexOf(voice);if(index<0)return;
   voice.envelope=data;voice.segments=[];voice.audioName=file.name;const group=assetsByScene[p.type]||={};group.voices||=[];const previous=group.voices[index]||{};if(previous.url)URL.revokeObjectURL(previous.url);group.voices[index]={...previous,audio,url,buffer};url=null;
   p.duration=Math.min(SceneTiming.maxDuration,Math.max(2,Math.ceil(buffer.duration-p.props.sourceStart)));dirty.add(p.type);
   if(project.type===p.type){assets=group;time=0;renderEditor()}
   tell('참가자 음성을 로컬에서 분석했어요. '+buffer.duration.toFixed(1)+'초 · 50Hz 감지 데이터.');
  }catch(error){tell(error.message||'이 오디오 코덱을 분석할 수 없습니다. WAV / MP3로 바꿔 주세요.')}
  finally{if(context)await context.close().catch(()=>{});if(url)URL.revokeObjectURL(url);input.disabled=false}
 }
 function seek(t){
  if(project.type!=='discord-voice')return;
  for(const track of assets.voices||[])if(track?.audio&&Number.isFinite(track.audio.duration))track.audio.currentTime=Math.min(Math.max(0,project.props.sourceStart+t),Math.max(0,track.audio.duration-.001));
 }
 function play(t){
  if(project.type!=='discord-voice'||!SceneAudio.hasExportSource(project,assets))return;seek(t);
  (assets.voices||[]).forEach((track,i)=>{if(track?.audio){track.audio.volume=project.previewVolume;track.audio.muted=project.previewMuted||project.voices[i]?.muted||false;track.audio.playbackRate=project.speed;track.audio.play().catch(()=>{})}});
 }
 function pause(){for(const track of assets.voices||[])track?.audio?.pause()}
 function action(action){
  if(!FilmModels.specs[project.type])return false;
  if(project.type==='news-article'&&(NewsModel.isAction(action)||action==='news-list')){project.viewScroll=0;if(typeof MotionEditor!=='undefined')MotionEditor.clearPreview();recordInteraction(action==='news-list'?'news-open':action,action!=='news-list');return true}
  if(action.startsWith('discord-avatar:')){
   const side=action.split(':')[1],key=side==='me'?'selfAvatar':'otherAvatar';selectInspectorTab('content');$('film-props').querySelector('[data-discord-avatar="'+key+'"]').click();return true;
  }
  if(['call-start','call-answer','call-end'].includes(action)){recordInteraction(action,true);return true}
  if(['mail','video','notices','call-mute','call-speaker','call-keypad'].includes(action)){const state=sceneInteractionState(project,time),key={mail:'mailOpen',video:'videoPlaying',notices:'noticesVisible','call-mute':'callMuted','call-speaker':'callSpeaker','call-keypad':'callKeypad'}[action];recordInteraction(action,!state[key]);return true}
  if(action==='lock-light'){recordInteraction(action,!sceneInteractionState(project,time).lockLight);return true}
  if(action.startsWith('voice-toggle:')){
   const index=Number(action.split(':')[1]),voice=project.voices[index];if(!voice)return true;
   if(voice.envelope.length){
    const from=Math.max(0,Math.floor((time+project.props.sourceStart)*50)),next=voice.envelope.findIndex((level,i)=>i>=from&&level/1000*voice.gain>=project.props.sensitivity);
    if(next<0){tell('현재 위치 뒤에 감지된 발화가 없어요.');return true}
    time=Math.max(0,Math.min(project.duration-1,next/50-project.props.sourceStart));draw();playPreview(Math.min(project.duration,time+1));return true;
   }
   voice.envelope=[];const start=Math.max(0,Math.min(project.duration-1,time));voice.segments.push({start,end:Math.min(project.duration,start+1)});voice.segments=voice.segments.slice(-100);time=start;dirty.add(project.type);renderVoices();draw();playPreview(Math.min(project.duration,start+1));return true;
  }
  if(action.startsWith('edit:')){
   const field=$('film-props').querySelector('[data-film-prop="'+CSS.escape(action.slice(5))+'"]');if(field){selectInspectorTab('content');field.focus();field.scrollIntoView({block:'center'});return true}
  }
  return false;
 }
 function inlineEdit(key,value){
  if(CollectionEditor.inlineEdit(key,value))return;
  if(ChatEditor.inlineEdit(key,value))return;
  if(/^(messages|commentItems)\.\d+\./.test(key)){phoneEdit(key,value);return}
  const spec=FilmModels.specs[project.type],descriptor=spec?.fields.find(f=>f.key===key.replace(/^props\./,''));const clean=key.replace(/^props\./,'');
  if(!descriptor&&clean!=='clock')return;
  set(project,clean,value.slice(0,clean==='clock'?8:['name','handle'].includes(clean)?60:clean==='body'?3000:5000));
  const control=$('film-props').querySelector('[data-film-prop="'+CSS.escape(clean)+'"]');if(control&&control!==document.activeElement)control.value=getCurrent(clean);dirty.add(project.type);draw();
 }
 function getCurrent(key){return value(project,key)}
 function syncNews(){if(project.type!=='news-article')return;for(const control of $('film-props').querySelectorAll('[data-film-prop]'))if(Object.hasOwn(NewsModel.fields,control.dataset.filmProp)&&control!==document.activeElement){const next=value(project,control.dataset.filmProp);if(control.value!==next)control.value=next}}
 function syncVideo(){if(project.type==='youtube-watch'&&assets.media instanceof HTMLVideoElement){const state=sceneInteractionState(project,time);if(!playing||!state.videoPlaying)assets.media.pause();else if(assets.media.paused)assets.media.play().catch(()=>{})}}
 function init(){
  phonePreview.addEventListener('input',event=>{
   if(!event.target.matches('[data-call-slide]'))return;
   pausePreview();const range=event.target,progress=Number(range.value)/100;if(typeof MotionEditor!=='undefined'){MotionEditor.slide(range,progress);return}range.closest('.film-answer-slider').style.setProperty('--answer-progress',progress);
   if(progress>=.94){recordInteraction('call-answer',true);}
  });
  phonePreview.addEventListener('change',event=>{if(event.target.matches('[data-call-slide]')){if(typeof MotionEditor!=='undefined'){MotionEditor.endSlide(event.target);return}event.target.value='0';event.target.closest('.film-answer-slider')?.style.setProperty('--answer-progress',0)}});

  phonePreview.addEventListener('focusin',event=>{if(event.target.matches('[data-film-field]'))selectInspectorTab('content')});
  phonePreview.addEventListener('input',event=>{if(event.target.matches('[data-film-field]'))inlineEdit(event.target.dataset.filmField,event.target.innerText.replace(/\r/g,''))});
  $('add-voice').addEventListener('click',()=>{if(project.voices.length>=6)return;project.voices.push({name:'User '+(project.voices.length+1),avatar:'',audioName:'',muted:false,gain:1,envelope:[],segments:[]});dirty.add(project.type);renderVoices();draw()});
 }
 return{render,init,action,seek,play,pause,syncVideo,syncNews,renderVoices};
})();
