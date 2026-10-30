'use strict';

const $ = id => document.getElementById(id);
const canvas = $('canvas');
const phonePreview = $('phone-preview');
const projects = Object.fromEntries(SOCIAL_SCENES.map(scene => [scene.id, newScene(scene.id)]));
const assetsByScene = {};
const brandAssets = {};
let brandReady = Promise.resolve();
let project = projects['kakao-chat'];
let assets = {};
let time = project.duration;
let playing = false;
let animationFrame = 0;
let recording = null;
const dirty = new Set();
const propertyFields = {
  'show-other-stories':'showOtherStories','desktop-browser':'desktopBrowser',device:'device','android-navigation':'androidNavigation','iphone-navigation':'iphoneNavigation','logo-style':'logoStyle', speed: 'speed', liked: 'liked', saved: 'saved', followed: 'followed', reposted: 'reposted', 'comments-open': 'commentsOpen',
  views: 'views', location: 'location', joined: 'joined', 'custom-style': 'customStyle',
  'phone-background': 'phoneBackground', 'phone-foreground': 'phoneForeground', 'phone-muted': 'phoneMuted',
  theme: 'theme', ratio: 'ratio', clock: 'clock', name: 'name', handle: 'handle', bio: 'bio', followers: 'followers', following: 'following',
  body: 'body', 'post-time': 'postTime', likes: 'likes', comments: 'comments', reposts: 'reposts', music: 'music', verified: 'verified', date: 'date',
  motion: 'motion', duration: 'duration', scroll: 'scroll',
  receipt: 'receipt', 'bubble-color': 'bubbleColor', 'bubble-end': 'bubbleEnd',
  shares: 'shares', 'reaction-style': 'reactionStyle',
  'auto-read': 'autoRead', 'show-typing': 'showTyping', typewriter: 'typewriter', 'typing-duration': 'typingDuration', 'read-delay': 'readDelay',
  'chat-clock-auto':'chatClockAuto','overlay-format':'overlayFormat','overlay-scale':'overlayScale','google-ai-name':'name','naver-name':'name','naver-email':'naverEmail','naver-points':'naverPoints','naver-unread':'naverUnread',
  query: 'query', suggestions: 'suggestions', answer: 'answer', 'search-at': 'searchAt', 'query-duration': 'queryDuration', 'answer-duration': 'answerDuration',
  'browser-frame': 'browserFrame', 'ai-briefing': 'aiBriefing', 'search-expanded':'searchExpanded','search-extras':'searchExtras','naver-section-brand':'naverShowBrand','naver-section-clips':'naverShowClips','naver-section-news':'naverShowNews','naver-section-web':'naverShowWeb','naver-section-related':'naverShowRelated','naver-section-images':'naverShowImages','naver-section-posts':'naverShowPosts','naver-section-more':'naverShowMore', camera: 'camera', 'camera-zoom': 'cameraZoom',
};

for(const id of ['briefing-field','search-expanded-field','search-extras-field'])$('search-display-fields').append($(id));$('search-display-fields').append($('browser-frame').closest('label'));$('search-display-fields').after($('naver-sections-fields'));

function tell(message) { $('status').textContent = message; }
function formatSceneTime(seconds) {
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${(seconds % 60).toFixed(2).padStart(5, '0')}`;
}
function fitPreview() {
  const stage = $('stage'), padding = getComputedStyle(stage);
  const width = stage.clientWidth - parseFloat(padding.paddingLeft) - parseFloat(padding.paddingRight);
  const height = stage.clientHeight - parseFloat(padding.paddingTop) - parseFloat(padding.paddingBottom);
  const scale = Math.min(Math.max(1, width) / canvas.width, Math.max(1, height) / canvas.height);
  canvas.style.width = String(canvas.width * scale) + 'px';
  canvas.style.height = String(canvas.height * scale) + 'px';
  const search = SOCIAL_SCENES.find(scene => scene.id === project.type).section === '검색';
  canvas.hidden = !search; $('phone-frame').hidden = search;
  $('phone-frame').style.width = canvas.style.width; $('phone-frame').style.height = canvas.style.height;
  $('phone-frame').classList.toggle('is-transparent-scene',project.type==='kakao-overlay');
  $('phone-frame').style.background = project.theme === 'dark' ? '#171b1d' : '#e8ebe7';
  phonePreview.style.setProperty('--phone-scale', String(Math.min(canvas.width * scale / scenePhoneSize(project)[0], canvas.height * scale / scenePhoneSize(project)[1])));
}
function selectInspectorTab(name, focus = false) {
  for (const tab of document.querySelectorAll('[data-inspector-tab]')) {
    const selected = tab.dataset.inspectorTab === name;
    tab.setAttribute('aria-selected', String(selected)); tab.tabIndex = selected ? 0 : -1;
    $(tab.getAttribute('aria-controls')).hidden = !selected;
    if (selected && focus) tab.focus();
  }
  document.querySelector('.inspector-scroll').scrollTop = 0;
}
for (const tab of document.querySelectorAll('[data-inspector-tab]')) {
  tab.addEventListener('click', () => selectInspectorTab(tab.dataset.inspectorTab));
  tab.addEventListener('keydown', event => {
    const names = ['content', 'motion', 'screen'], index = names.indexOf(tab.dataset.inspectorTab);
    const next = { ArrowRight: (index + 1) % 3, ArrowLeft: (index + 2) % 3, Home: 0, End: 2 }[event.key];
    if (next === undefined) return;
    event.preventDefault(); selectInspectorTab(names[next], true);
  });
}
function draw(forceCanvas = false) {
  const motionPreview=typeof MotionEditor!=='undefined'?MotionEditor.preview(project):{};const paintProject={...project,...motionPreview};
  FilmEditor.syncVideo();FilmEditor.syncNews();CallAudio.sync(project,time,playing);
  const search = SOCIAL_SCENES.find(scene => scene.id === project.type).section === '검색';
  if (search || recording || forceCanvas === true) renderScene(canvas, paintProject, time, { ...brandAssets, ...assets });
  if (!recording) PhoneScene.render(phonePreview, {...sceneInteractionState(paintProject,time),_isPlaying:playing}, time, {...brandAssets,...assets});
  phonePreview.classList.toggle('touch-scroll-surface',project.device!=='desktop'&&!ElementEditor.active);
  ElementEditor.afterDraw();OverlayEditor.render();if(typeof MotionEditor!=='undefined')MotionEditor.render();
  $('comments').value=String(SceneReplies.count(project,time));
  for(const field of document.querySelectorAll('[data-film-prop=comments]'))field.value=$('comments').value;
  $('timeline').value = String(time);
  document.querySelector('.timeline-track').style.setProperty('--playhead', String(time / project.duration * 100) + '%');
  $('current-time').textContent = formatSceneTime(time / project.speed);
  if(typeof TimelineEditor!=='undefined')TimelineEditor.render();
}
function seekSource() {
  FilmEditor.seek(time);
  if (assets.media instanceof HTMLVideoElement && Number.isFinite(assets.media.duration)) {
    assets.media.currentTime = FilmModels.mediaTime(project,time) % assets.media.duration;
  }
}

function applyPreviewAudio(){
  CallAudio.sync(project,time,playing);
  const hasAudio=SceneAudio.hasExportSource(project,assets);
  document.querySelector('.preview-audio').hidden=!hasAudio;
  const status=SceneAudio.missingSource(project,assets)?'음원 다시 연결':assets.media?._sceneAudio?.error?'음원 확인 실패':hasAudio?(project.previewMuted||project.previewVolume===0?'음소거':'소리 포함'):'무음';
  $('output-audio-status').textContent='30 fps · '+status;

  if(assets.media instanceof HTMLVideoElement){assets.media.volume=project.previewVolume;assets.media.muted=!hasAudio||project.previewMuted;}
  (assets.voices||[]).forEach((track,i)=>{if(track?.audio){track.audio.volume=project.previewVolume;track.audio.muted=!hasAudio||project.previewMuted||!!project.voices[i]?.muted;}});
  $('preview-volume').value=String(Math.round(project.previewVolume*100));
  $('preview-volume-value').textContent=project.previewMuted?'음소거':Math.round(project.previewVolume*100)+'%';
  $('preview-mute').setAttribute('aria-pressed',String(project.previewMuted));
  $('preview-mute').setAttribute('aria-label',project.previewMuted?'영상 음소거 해제':'영상 음소거');
  $('preview-mute').classList.toggle('is-muted',project.previewMuted);
}
$('preview-volume').addEventListener('input',()=>{
 project.previewVolume=Number($('preview-volume').value)/100;project.previewMuted=project.previewVolume===0;
 if(project.type==='discord-voice')project.props.previewVolume=project.previewVolume;
 dirty.add(project.type);applyPreviewAudio();
});
$('preview-mute').addEventListener('click',()=>{project.previewMuted=!project.previewMuted;if(!project.previewMuted&&project.previewVolume===0)project.previewVolume=.7;dirty.add(project.type);applyPreviewAudio();});

function pausePreview() {
  playing = false; cancelAnimationFrame(animationFrame);VideoMedia.pause();FilmEditor.pause();CallAudio.sync(project,time,false);
  if (assets.media instanceof HTMLVideoElement) assets.media.pause();
  $('play').classList.remove('is-playing'); $('play').setAttribute('aria-label', '미리보기 재생');
}
function playPreview(stopAt = project.duration) {
  if (typeof stopAt !== 'number') stopAt=project.duration;
  if (recording) return;
  if(ElementEditor.active)ElementEditor.setActive(false);
  if (playing) { pausePreview(); return; }
  if (time >= project.duration - .01) time = 0;
  playing = true; seekSource();applyPreviewAudio();FilmEditor.play(time);
  if (assets.media instanceof HTMLVideoElement) assets.media.playbackRate = project.speed;
  if (assets.media instanceof HTMLVideoElement) assets.media.play().catch(() => tell('이 영상은 브라우저에서 재생할 수 없습니다. MP4 또는 WebM을 사용해 주세요.'));
  $('play').classList.add('is-playing'); $('play').setAttribute('aria-label', '미리보기 일시정지');
  const started = performance.now() - time / project.speed * 1000;
  function tick(now) {
    time = Math.min(stopAt,project.duration,(now-started)/1000*project.speed); draw();
    if (time >= stopAt || time >= project.duration) pausePreview(); else animationFrame = requestAnimationFrame(tick);
  }
  animationFrame = requestAnimationFrame(tick);
}


function renderInteractionEditor(){
  $('interaction-items').replaceChildren();
  const allowed=[...FilmModels.actions(project.type),...CollectionEditor.actionKeys(project)],previous=$('interaction-kind').value;
  $('interaction-kind').replaceChildren();
  for(const key of [...allowed,...(allowed.includes('like')?['unlike']:[])]){const option=document.createElement('option');option.value=key;option.textContent=CollectionEditor.label(key);$('interaction-kind').append(option)}
  if([...$('interaction-kind').options].some(o=>o.value===previous))$('interaction-kind').value=previous;
  for(const [index,event] of project.actions.entries()){
    const row=document.createElement('div');row.className='interaction-row';
    const action=document.createElement('select');action.setAttribute('aria-label','동작 '+(index+1)+' 종류');
    for(const key of [...new Set([...allowed,event.action])]){
      const option=document.createElement('option');option.value=key;option.textContent=CollectionEditor.label(key);action.append(option);
    }
    action.value=event.action;
    const at=document.createElement('input');at.type='number';at.min=0;at.max=SceneTiming.maxDuration;at.step='.01';at.value=event.at.toFixed(2);at.setAttribute('aria-label','동작 '+(index+1)+' 시간');
    const state=document.createElement('select');state.setAttribute('aria-label','동작 '+(index+1)+' 상태');
    for(const [value,label] of [['true','켜기'],['false','끄기']]){const option=document.createElement('option');option.value=value;option.textContent=label;state.append(option)}
    state.value=String(event.value);state.disabled=event.action.endsWith('double-like');
    const remove=document.createElement('button');remove.type='button';remove.textContent='×';remove.setAttribute('aria-label','동작 '+(index+1)+' 삭제');
    const update=()=>{pausePreview();dirty.add(project.type);draw()};
    action.addEventListener('change',()=>{event.action=action.value;if(event.action.endsWith('double-like'))event.value=true;renderInteractionEditor();update()});
    at.addEventListener('input',()=>{if(Number.isFinite(at.valueAsNumber)){event.at=Math.max(0,Math.min(SceneTiming.maxDuration,at.valueAsNumber));time=Math.min(project.duration,event.at);update()}});
    state.addEventListener('change',()=>{event.value=state.value==='true';update()});
    remove.addEventListener('click',()=>{project.actions.splice(index,1);renderInteractionEditor();update()});
    row.append(action,at,state,remove);$('interaction-items').append(row);
  }
  if(typeof TimelineEditor!=='undefined')TimelineEditor.render();
  $('add-interaction').disabled=project.actions.length>=60;
}
function recordInteraction(action,value){
  if(project.actions.length>=60){tell('반응 동작은 60개까지 사용할 수 있어요.');return}
  const at=Math.max(0,Math.min(time,project.duration-(ChatMedia.parseAction(action)?0:.8)));
  project.actions.push({at,action,value});time=at;phonePreview.dataset.force='true';dirty.add(project.type);
  renderInteractionEditor();draw();tell(CollectionEditor.label(action)+' 기록 · '+at.toFixed(2)+'초. 모션 탭에서 시간을 바꿀 수 있어요.');
  playPreview(Math.min(project.duration,at+.8));
}
$('add-interaction').addEventListener('click',()=>{
  const kind=$('interaction-kind').value;recordInteraction(kind==='unlike'?'like':kind,kind!=='unlike');
});

function renderCommentEditor() { ReplyEditor.render(); }
function syncPhoneEditors() {
  for (const [id,key] of Object.entries(propertyFields)) {
    const field = $(id); if (field === document.activeElement) continue;
    if (field.type === 'checkbox') field.checked = project[key]; else field.value = project[key];
  }
  $('story-names').value = project.storyNames.join('\n');
}
function phoneEdit(field,value) {
  if(field==='comments')return;
  if(field==='clock'&&ChatClock.supports(project)){ChatClock.setDisplay(project,value.slice(0,8),time);dirty.add(project.type);syncPhoneEditors();renderMessageEditor();draw();return;}
  if(CollectionEditor.inlineEdit(field,value))return;
  if(ChatEditor.inlineEdit(field,value))return;
  const match = /^(messages|commentItems)\.(\d+)\.(text|time|author|likes)$/.exec(field);
  const story = /^storyNames\.([0-3])$/.exec(field);
  if (match) {
    const item = project[match[1]][Number(match[2])]; if (!item || !Object.hasOwn(item,match[3])) return;
    if(match[1]==='messages'&&match[3]==='time'){ChatClock.freeze(project,time);syncPhoneEditors();}
    item[match[3]] = value.slice(0,match[3] === 'text' ? (match[1] === 'messages' ? 3000 : 2000) : (match[1] === 'messages' ? 30 : 60));
    if (match[1] === 'messages'){if(match[3]==='text')delete item.typing;renderMessageEditor();} else renderCommentEditor();
  } else if (story) project.storyNames[Number(story[1])] = value.slice(0,60);
  else {
    const limits = {clock:8,name:60,handle:60,bio:300,body:3000,postTime:60,likes:20,comments:20,reposts:20,shares:20,views:20,music:100,date:60,receipt:20,followers:20,following:20,location:120,joined:120};
    if (!Object.hasOwn(limits,field)) return;
    project[field] = value.slice(0,limits[field]);
  }
  for (const node of phonePreview.querySelectorAll('[data-phone-field]')) {
    if (node !== document.activeElement && node.dataset.phoneField === field) node.textContent = value;
  }
  dirty.add(project.type); syncPhoneEditors(); draw();
}
function phoneAction(action) {
  if(VideoMedia.action(action))return;
  if(ReplyEditor.action(action)||CollectionEditor.action(action))return;
  if(action==='media-mute'){$('preview-mute').click();draw();return}
  pausePreview();let animateTo;
  if(ChatEditor.action(action)||FilmEditor.action(action))return;
  if(action.startsWith('youtube-reply:')){const item=project.commentItems[Number(action.split(':')[1])];if(item){project.commentDraft='@'+item.author+' ';draw();phonePreview.querySelector('[data-phone-composer=commentDraft]')?.focus()}return}
  if(action==='discord-details'){const key=project.type==='discord-dm'?'showProfile':'showMembers';project.props[key]=!project.props[key];dirty.add(project.type);renderEditor();return}
  if(action==='send-heart'){project.chatDraft='❤️';action='send-message';}
  if (SOCIAL_SCENES.some(scene => scene.id === action)) { switchScene(action); return; }
  if (action === 'avatar' || action === 'media') { $(action === 'avatar' ? 'avatar-file' : 'media-file').click(); return; }
  if (action.startsWith('edit:')) {
    selectInspectorTab('content');
    const key = action.slice(5), fieldId = Object.keys(propertyFields).find(id => propertyFields[id] === key);
    const field = fieldId && $(fieldId);
    if (field && field.closest('fieldset') && !field.closest('fieldset').hidden) { field.scrollIntoView({block:'center'}); field.focus({preventScroll:true}); }
    return;
  }
  const visible=sceneInteractionState(project,time);
  const key={like:'liked',save:'saved',follow:'followed',repost:'reposted',comments:'commentsOpen','close-comments':'commentsOpen'}[action];
  if(key){recordInteraction(action==='close-comments'?'comments':action,action==='comments'?true:action==='close-comments'?false:!visible[key]);return}
  if(action==='double-like'){recordInteraction(action,true);return}
  if(action.startsWith('comment-like:')){const item=visible.commentItems.find(c=>c._sourceIndex===Number(action.split(':')[1]));if(item)recordInteraction(action,!item.liked);return}
  if (action === 'verified') { project.verified = !project.verified; }
  else if (action === 'send-comment') return ReplyEditor.send(-1);
  else if (action === 'send-message') {
    const value = project.chatDraft.trim(); if (!value) return;
    if (project.messages.length >= ChatModels.messageLimit(project)) { tell('이 장면의 메시지 한도에 도달했어요.'); return; }
    const take=ChatEditor.takeDraft();const at=take?take.at:Math.max(0,Math.min(project.duration-.35,time));
    const senderId=ChatModels.enabled(project)?project.composerSenderId:null;
    project.messages.push({side:senderId?ChatModels.side(project,senderId):'me',text:value.slice(0,3000),at,time:project.messages.at(-1)?.time || '오후 1:27',...(senderId?{senderId}:{}),...(take?{typing:take.typing}:{})});
    time=at;animateTo=Math.min(project.duration,at+.35);
    project.chatDraft = '';
  } else return;
  phonePreview.dataset.force = 'true'; dirty.add(project.type); syncPhoneEditors(); renderCommentEditor(); renderMessageEditor(); draw();if(animateTo)playPreview(animateTo);
}
phonePreview.addEventListener('dblclick', event => {
  if(project.type.startsWith('instagram')&&event.target.closest('.ph-media')){event.preventDefault();const index=event.target.closest('[data-feed-index]')?.dataset.feedIndex;phoneAction(index===undefined?'double-like':'feed:'+index+':double-like')}
});
phonePreview.addEventListener('click', event => {
  const target = event.target.closest('[data-phone-action]');
  if (target) phoneAction(target.dataset.phoneAction);
});
phonePreview.addEventListener('focusin', event => {
  if (event.target.matches('[contenteditable],[data-phone-composer]')) pausePreview();
  if (event.target.matches('[data-phone-field]')) selectInspectorTab('content');
});
phonePreview.addEventListener('input', event => {
  if(ReplyEditor.input(event)||CollectionEditor.input(event))return;
  const target = event.target;
  if (target.matches('[data-phone-field]')) phoneEdit(target.dataset.phoneField,target.innerText.replace(/\r/g,''));
  else if (target.matches('[data-phone-composer]')) {
    ChatEditor.draftInput(target);
    project[target.dataset.phoneComposer] = target.value.slice(0,target.dataset.phoneComposer === 'commentDraft' ? 2000 : 3000);
    dirty.add(project.type); draw();
  }
});
phonePreview.addEventListener('focusout', event => { if (!phonePreview.contains(event.relatedTarget)) requestAnimationFrame(() => draw()); });
phonePreview.addEventListener('keydown', event => {
  if(ReplyEditor.keydown(event)||CollectionEditor.keydown(event))return;
  const composer = event.target.dataset.phoneComposer;
  if (event.key === 'Enter' && !event.shiftKey && !event.isComposing && composer) {
    event.preventDefault(); phoneAction(composer === 'commentDraft' ? 'send-comment' : 'send-message');
  } else if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('[role=button][data-phone-action]')) {
    event.preventDefault(); phoneAction(event.target.dataset.phoneAction);
  }
});
function searchScrollBy(delta){
  if(!project.type.startsWith('google-')&&project.type!=='naver-search')return;
  pausePreview();project.viewScroll=Math.max(0,Math.min(canvas._searchMaxScroll||0,(canvas._searchScroll||0)+delta));
  if(typeof MotionEditor!=='undefined')MotionEditor.manual(project.viewScroll);dirty.add(project.type);draw();
}
canvas.tabIndex=0;
canvas.addEventListener('wheel',event=>{
  if(!project.type.startsWith('google-')&&project.type!=='naver-search')return;
  event.preventDefault();const rect=canvas.getBoundingClientRect();
  searchScrollBy(event.deltaY*(event.deltaMode===1?16:event.deltaMode===2?rect.height:1)*canvas.height/rect.height/(canvas._searchScale||1));
},{passive:false});
canvas.addEventListener('keydown',event=>{
  const delta={ArrowDown:45,ArrowUp:-45,PageDown:500,PageUp:-500,Home:-10000,End:10000}[event.key];
  if(delta===undefined||(!project.type.startsWith('google-')&&project.type!=='naver-search'))return;
  event.preventDefault();searchScrollBy(delta);
});
function searchHit(event){
  const rect=canvas.getBoundingClientRect(),x=(event.clientX-rect.left)*canvas.width/rect.width,y=(event.clientY-rect.top)*canvas.height/rect.height;
  return [...(canvas._searchControls||[])].reverse().find(r=>x>=r.left&&x<=r.right&&y>=r.top&&y<=r.bottom);
}
let searchHoverFrame=0;
canvas.addEventListener('pointermove',event=>{
  const hit=searchHit(event),pointer=canvas._searchPointer||={};canvas.style.cursor=hit?'pointer':'';
  if(pointer.hover===hit?.id)return;
  cancelAnimationFrame(searchHoverFrame);pointer.hover=hit?.id;pointer.alpha=0;
  const start=performance.now(),reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
  const tick=now=>{pointer.alpha=reduced?1:Math.min(1,(now-start)/130);draw();if(pointer.alpha<1)searchHoverFrame=requestAnimationFrame(tick)};
  searchHoverFrame=requestAnimationFrame(tick);
});
canvas.addEventListener('pointerdown',event=>{const pointer=canvas._searchPointer||={};pointer.pressed=searchHit(event)?.id;canvas.focus({preventScroll:true});draw()});
canvas.addEventListener('pointerleave',()=>{cancelAnimationFrame(searchHoverFrame);canvas._searchPointer={};canvas.style.cursor='';draw()});
window.addEventListener('pointerup',()=>{if(canvas._searchPointer?.pressed){canvas._searchPointer.pressed=undefined;draw()}});
canvas.addEventListener('keydown',event=>{if(event.key!=='Escape'||project.type!=='naver-search')return;const menu=SearchUI.naverMenu(project,time);if(menu.open){event.preventDefault();event.stopPropagation();recordInteraction('naver-'+menu.kind,false)}});
canvas.addEventListener('click',event=>{
  const hit=searchHit(event),menu=project.type==='naver-search'?SearchUI.naverMenu(project,time):null;
  if(menu?.open&&!hit?.action.startsWith('naver-'))recordInteraction('naver-'+menu.kind,false);
  if(!hit)return;
  if(hit.action==='naver-account'||hit.action==='naver-services'){recordInteraction(hit.action,!(menu?.open&&menu.kind===hit.action.slice(6)))}
  else if(hit.action==='naver-account-photo')$('avatar-file').click();
  else if(hit.action==='new-query'&&project.type==='google-ai'){pausePreview();time=0;project.viewScroll=0;draw()}
  else if(hit.action.startsWith('ai-suggestion:')&&project.type==='google-ai'){const value=project.suggestions.split('\n').filter(Boolean)[Number(hit.action.split(':')[1])];if(value){project.query=value;$('query').value=value;dirty.add(project.type);pausePreview();time=Math.min(project.duration,project.searchAt+.8);draw()}}
  else if(hit.action==='query'){selectInspectorTab('content');$('query').focus({preventScroll:true})}
  else if(hit.action==='ai-expand'||hit.action==='source-expand'){const state=SearchUI.state(project,time);recordInteraction(hit.action,!(hit.action==='ai-expand'?state.expanded.open:state.sources.open))}
  else if(hit.action==='submit'){pausePreview();time=Math.min(project.duration,project.searchAt+.8);project.viewScroll=0;draw()}
});
phonePreview.addEventListener('wheel', event => {
  if (event.target.closest('.ph-comments-sheet')) return;
  if (ChatModels.native(project.type) || project.type.endsWith('-dm')) return;
  const film=FilmModels.specs[project.type];
  if(film&&!phonePreview.querySelector('.film-scroll-body'))return;
  event.preventDefault(); pausePreview();
  const body = phonePreview.querySelector(film?'.film-scroll-body':'.ph-feed-body'), viewport = phonePreview.querySelector(film?'.film-scroll-viewport':'.ph-feed-viewport');
  const maxScroll = Math.max(0,body.scrollHeight - viewport.clientHeight);
  project.viewScroll = Math.max(0,Math.min(maxScroll,project.viewScroll + event.deltaY / 3));
  dirty.add(project.type); draw();
},{passive:false});
phonePreview.addEventListener('scroll', event => {
  if (!event.target.matches('.ph-comment-list') || recording || playing) return;
  project.commentScroll = event.target.scrollTop;
  dirty.add(project.type);
},true);
$('story-names').addEventListener('input', () => {
  const names = $('story-names').value.split('\n');
  project.storyNames = Array.from({length:4},(_,index) => (names[index] || '').slice(0,60));
  dirty.add(project.type); draw();
});
$('add-comment').addEventListener('click', () => ReplyEditor.add());

async function closePreviewFullscreen() {
  if (document.fullscreenElement) await document.exitFullscreen().catch(() => {});
  document.querySelector('.preview').classList.remove('is-expanded');document.querySelector('.workspace').classList.remove('is-preview-expanded');
  document.body.classList.remove('preview-expanded');
  $('fullscreen-preview').setAttribute('aria-pressed','false');
  $('fullscreen-preview').setAttribute('aria-label','미리보기 전체화면');
  fitPreview();
}
$('fullscreen-preview').addEventListener('click', async () => {
  const preview = document.querySelector('.preview');
  if (preview.classList.contains('is-expanded')) { await closePreviewFullscreen(); return; }
  preview.classList.add('is-expanded');document.querySelector('.workspace').classList.add('is-preview-expanded'); document.body.classList.add('preview-expanded');
  $('fullscreen-preview').setAttribute('aria-pressed','true'); $('fullscreen-preview').setAttribute('aria-label','전체화면 닫기');
  const workspace=document.querySelector('.workspace');if(workspace.requestFullscreen)await workspace.requestFullscreen().catch(()=>{});
  fitPreview();
});
document.addEventListener('fullscreenchange', () => {
  if (!document.fullscreenElement && document.querySelector('.preview').classList.contains('is-expanded')) closePreviewFullscreen();
  else fitPreview();
});
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && document.querySelector('.preview').classList.contains('is-expanded')) closePreviewFullscreen();
});

function renderMessageEditor() {
  ChatModels.sync(project);
  const list = $('messages'); list.replaceChildren();
  project.messages.forEach((message, index) => {
    const row = document.createElement('div'); row.className = 'message-row';
    const header = document.createElement('div'); header.className = 'message-row-header';
    const side = document.createElement('select'); side.setAttribute('aria-label', `메시지 ${index + 1} 보내는 쪽`);
    for (const [value, label] of (ChatModels.enabled(project)?project.participants.map(p=>[p.id,p.name+(p.id===project.selfId?' · 나':'')]):[['other', '상대'], ['me', '나']])) { const option = document.createElement('option'); option.value = value; option.textContent = label; side.appendChild(option); }
    side.value = ChatModels.enabled(project)?ChatModels.sender(project,message):message.side;
    const at = document.createElement('input'); at.type = 'number'; at.min = '0'; at.max = String(SceneTiming.maxDuration); at.step = '.1'; at.value = message.at; at.setAttribute('aria-label', `메시지 ${index + 1} 등장 시간`);
    const stamp = document.createElement('input'); stamp.type = 'text'; stamp.value = ChatClock.stamp(project,message); stamp.maxLength = 30; stamp.setAttribute('aria-label', `메시지 ${index + 1} 표시 시간`);
    const remove = document.createElement('button'); remove.type = 'button'; remove.className = 'delete-message'; remove.textContent = '×'; remove.setAttribute('aria-label', `메시지 ${index + 1} 삭제`);
    const text = document.createElement('textarea'); text.value = message.text; text.maxLength = 3000; text.rows = 2; text.setAttribute('aria-label', `메시지 ${index + 1} 내용`);
    side.addEventListener('change', () => { if(ChatModels.enabled(project)){message.senderId=side.value;message.side=ChatModels.side(project,side.value)}else message.side=side.value; dirty.add(project.type); draw(); });
    stamp.addEventListener('input', () => { ChatClock.freeze(project,time);message.time = stamp.value;syncPhoneEditors(); dirty.add(project.type); draw(); });
    at.addEventListener('input', () => {
      if (!Number.isFinite(at.valueAsNumber)) return;
      message.at = Math.min(SceneTiming.maxDuration, Math.max(0, at.valueAsNumber));if(project.chatClockAuto)stamp.value=ChatClock.stamp(project,message);delete message.typing; dirty.add(project.type); draw();
    });
    text.addEventListener('input', () => { message.text = text.value;delete message.typing; dirty.add(project.type); draw(); });
    remove.addEventListener('click', () => { project.messages.splice(index, 1); project.actions=project.actions.filter(e=>!ChatMedia.parseAction(e.action)||ChatMedia.isAction(e.action,project)); dirty.add(project.type); renderMessageEditor(); draw(); });
    header.append(side, stamp, at, remove);row.append(header);if(message.image){row.append(ChatEditor.photoControl(message,index));text.placeholder='사진 설명 · 선택';text.setAttribute('aria-label',`메시지 ${index+1} 사진 설명`)}row.append(text);list.appendChild(row);
  });
  $('add-message').disabled = project.messages.length >= ChatModels.messageLimit(project);
}
function renderEditor() {
  const scene = SOCIAL_SCENES.find(scene => scene.id === project.type);
  CollectionEditor.render();
  const chat = ChatModels.native(project.type) || project.type.endsWith('-dm');
  const search = scene.section === '검색';
  if (search) project.searchAt = Math.min(project.searchAt, project.duration - .8);
  for (const [id, property] of Object.entries(propertyFields)) {
    if ($(id).type === 'checkbox') $(id).checked = project[property]; else $(id).value = project[property];
  }
  $('search-display-fields').hidden=!search;$('naver-sections-fields').hidden=project.type!=='naver-search';
  $('scene-name').textContent = `${scene.name} · ${scene.kind}`;
  $('scene-category').textContent = scene.group;
  const darkTheme = project.theme === 'dark';
  $('preview-theme').textContent = darkTheme ? '다크' : '라이트';
  $('preview-theme').setAttribute('aria-pressed',String(darkTheme));
  $('preview-theme').setAttribute('aria-label','현재 '+(darkTheme?'다크':'라이트')+' 테마, '+(darkTheme?'라이트':'다크')+' 테마로 전환');
  canvas.setAttribute('aria-label', `${scene.name} ${scene.kind} 템플릿 미리보기`);
  for (const button of $('templates').querySelectorAll('button')) {
    const selected = button.dataset.template === project.type;
    button.setAttribute('aria-current', String(selected));
    if (selected) button.closest('details').open = true;
  }
  document.querySelector('[data-for=handle]').hidden = ChatModels.base(project.type) === 'kakao-chat';
  document.querySelector('[data-for=bio]').hidden = project.type !== 'x-profile';
  document.querySelector('[data-for=followers]').hidden = project.type !== 'x-profile';
  $('profile-meta-fields').hidden = project.type !== 'x-profile';
  $('comment-fields').hidden = chat || search;
  $('interaction-fields').hidden = chat || (search&&!['google-overview','naver-search'].includes(project.type));
  renderInteractionEditor();
  $('story-fields').hidden = project.type !== 'instagram-feed';
  $('phone-style-fields').hidden = search;
  $('desktop-browser-field').hidden=project.device!=='desktop'||!(search||['news-article','email-inbox'].includes(project.type));
  $('device-fields').hidden=false;$('android-navigation-field').hidden=project.device!=='android'||project.type==='kakao-overlay';$('iphone-navigation-field').hidden=project.device!=='iphone'||project.type==='kakao-overlay';
  const desktopOption=$('device').querySelector('[value=desktop]');desktopOption.hidden=desktopOption.disabled=!(search||FilmModels.specs[project.type]?.desktop);
  $('ratio').querySelector('[value=device]').hidden=false;
  $('instagram-logo-field').hidden = !project.type.startsWith('instagram');
  $('views-field').hidden = !project.type.startsWith('x-');
  $('story-names').value = project.storyNames.join('\n');
  for (const id of ['phone-background','phone-foreground','phone-muted']) $(id).disabled = !project.customStyle;
  $('overlay-scale-value').textContent=String(project.overlayScale??70)+'%';
  const overlay=project.type==='kakao-overlay';$('overlay-fields').hidden=!overlay;$('mov-origin-note').hidden=!(overlay&&project.overlayFormat==='mov'&&location.protocol==='file:');$('date').closest('label').hidden=overlay;$('device').closest('label').hidden=overlay;
  $('google-ai-user-fields').hidden=project.type!=='google-ai';
  $('naver-account-fields').hidden=project.type!=='naver-search';
  const avatarControls=$('change-avatar').closest('.asset-row');
  if(project.type==='naver-search')$('naver-avatar-controls').appendChild(avatarControls);
  else $('profile-fields').querySelector('legend').after(avatarControls);
  $('profile-fields').hidden = search; $('media-fields').hidden = search;
  $('clock').closest('label').hidden = search;const clockLabel=$('clock').closest('label').firstChild;if(clockLabel?.nodeType===3)clockLabel.textContent=ChatClock.supports(project)?'대화 기준 시각':'상태바 시각';$('chat-clock-auto-field').hidden=!ChatClock.supports(project);$('chat-clock-hint').hidden=!ChatClock.supports(project);
  $('post-fields').hidden = chat || search; $('message-fields').hidden = !chat;
  $('search-fields').hidden = !search; $('results-fields').hidden = !search; $('search-motion-fields').hidden = !search;
  $('story-visibility-field').hidden=project.type!=='instagram-feed';
  $('search-expanded-field').hidden=!['google-overview','naver-search'].includes(project.type);$('search-extras-field').hidden=['google-ai','naver-search'].includes(project.type);
  $('briefing-field').hidden = project.type !== 'naver-search';
  $('answer-field').hidden = project.type === 'google-search' || (project.type === 'naver-search' && !project.aiBriefing);
  $('answer-duration').closest('label').hidden = $('answer-field').hidden;
  $('search-at').max = Math.min(SceneTiming.maxDuration-1, project.duration - .8);
  $('chat-motion-fields').hidden = !chat;
  $('dm-colors').hidden = project.type !== 'instagram-dm';
  $('reaction-field').hidden = project.type !== 'instagram-feed';
  $('shares-field').hidden = !project.type.startsWith('instagram');
  $('music-field').hidden = project.type !== 'instagram-reels';
  const videoScene=SceneAudio.supportsVideo(project);
  $('media-label').textContent = ChatMedia.supports(project)?'대화에 사진·영상 추가':videoScene ? '이미지 또는 영상 올리기' : project.type === 'x-profile' ? '프로필 헤더 이미지 올리기' : '이미지 올리기';
  $('media-file').accept = videoScene ? 'image/png,image/jpeg,image/webp,video/mp4,video/webm,video/quicktime' : 'image/png,image/jpeg,image/webp';
  $('media-hint').textContent = videoScene ? 'MP4 / WebM 영상과 소리를 함께 저장합니다. 최대 20MB.' : chat ? '현재 타임라인 시점에 사진·영상 메시지를 추가합니다. 이전 시점에는 나타나지 않습니다. MP4·WebM·MOV · 파일당 최대 20MB. 영상 미리보기를 누르면 크게 보기·재생이 열립니다.' : '올린 사진은 화면에 맞춰 크롭합니다.';
  const motions = search ? ['search', 'still'] : chat ? ['messages', 'still'] : project.type === 'instagram-reels' ? ['reveal', 'still'] : ['scroll', 'reveal', 'still'];
  for (const option of $('motion').options) option.hidden = !motions.includes(option.value);
  $('scroll').max=search?10000:SceneCollections.supported.includes(project.type)?100000:1200;
  $('scroll').disabled = project.motion !== 'scroll';
  $('motion').querySelector('[value=scroll]').textContent=project.device==='desktop'?'페이지 스크롤':'스와이프 스크롤';
  $('scroll-motion-hint').hidden=project.motion!=='scroll'||!SceneScroll.supports(project.type);
  $('scroll-motion-hint').textContent=project.device==='desktop'?'PC 화면은 연속해서 스크롤합니다.':'폰 화면은 밀기·관성 감속·짧은 멈춤을 반복합니다. 거리가 크고 길이가 짧으면 빠르게 이동해요.';
  VideoMedia.trim(Object.values(projects));
  $('avatar-preview').replaceChildren();
  if (project.avatar) { const img = document.createElement('img'); img.src = project.avatar; img.alt = ''; $('avatar-preview').appendChild(img); }
  else $('avatar-preview').textContent = Array.from(project.name)[0] || 'S';
  $('media-name').textContent = ChatMedia.supports(project)?'사진·영상 메시지 '+project.messages.filter(m=>m.image).length+'개':project.mediaName||'기본 그래픽';$('remove-media').hidden=ChatMedia.supports(project);
  FilmEditor.render();ChatEditor.render();CallAudio.renderEditor();ElementEditor.renderFont();applyPreviewAudio();
  const [width, height] = sceneOutputSize(project); canvas.width = width; canvas.height = height;
  $('resolution').textContent = `${width} × ${height}`;
  $('timeline').max = project.duration; $('duration-label').textContent = formatSceneTime(sceneOutputDuration(project));
  $('clip-name').textContent = scene.name + ' · ' + scene.kind;
  $('mid-time').textContent = formatSceneTime(sceneOutputDuration(project) / 2).slice(0, 5);
  $('end-time').textContent = formatSceneTime(sceneOutputDuration(project)).slice(0, 5);
  renderMessageEditor(); renderCommentEditor(); renderInteractionEditor(); if (search) renderSearchEditor(); fitPreview(); draw();
}
function renderSearchEditor() {
  $('search-results').replaceChildren();
  project.results.forEach((result, index) => {
    const row = document.createElement('div'); row.className = 'result-row';
    const header = document.createElement('div'); header.className = 'result-row-header';
    const title = document.createElement('span'); title.textContent = `검색 결과 ${index + 1}`;
    const remove = document.createElement('button'); remove.type = 'button'; remove.textContent = '×'; remove.setAttribute('aria-label', `검색 결과 ${index + 1} 삭제`);
    remove.addEventListener('click', () => { project.results.splice(index, 1); dirty.add(project.type); renderSearchEditor(); draw(); });
    header.append(title, remove); row.appendChild(header);
    const iconTools = document.createElement('div'); iconTools.className = 'result-icon-tools';
    const preview = document.createElement('canvas'); preview.width = preview.height = 32; preview.setAttribute('aria-hidden', 'true');
    const repaint = () => { const ctx = preview.getContext('2d'); ctx.clearRect(0, 0, 32, 32); searchFavicon(ctx, result, 0, 0, 32, { field: '#303236', text: '#f1f1ee', muted: '#adb4bc' }, { ...brandAssets, ...assets }); };
    const iconLabel = document.createElement('label'); iconLabel.textContent = '사이트 아이콘';
    const preset = document.createElement('select'); preset.setAttribute('aria-label', '검색 결과 ' + (index + 1) + ' 사이트 아이콘');
    for (const [value, name] of Object.entries(SEARCH_FAVICONS)) { const option = document.createElement('option'); option.value = value; option.textContent = name; preset.appendChild(option); }
    preset.value = result.favicon;
    preset.addEventListener('change', () => { result.favicon = preset.value; dirty.add(project.type); repaint(); draw(); });
    iconLabel.appendChild(preset);
    const file = document.createElement('input'); file.type = 'file'; file.accept = 'image/png,image/jpeg,image/webp,image/x-icon,image/vnd.microsoft.icon,.ico'; file.hidden = true;
    const upload = document.createElement('button'); upload.type = 'button'; upload.textContent = '이미지 올리기'; upload.setAttribute('aria-label', '검색 결과 ' + (index + 1) + ' 아이콘 이미지 올리기');
    upload.addEventListener('click', () => file.click());
    file.addEventListener('change', async () => {
      const selected = file.files[0]; file.value = ''; if (!selected) return;
      const sceneId = project.type; pausePreview(); upload.disabled = true;
      try {
        if (selected.size > 2 * 1024 * 1024) throw new Error('아이콘은 2MB 이하로 올려 주세요.');
        if (!/^image\/(png|jpeg|webp|x-icon|vnd.microsoft.icon)$/.test(selected.type) && !/\.ico$/i.test(selected.name)) throw new Error('PNG, JPG, WebP, ICO 이미지를 사용해 주세요.');
        const image = await loadSceneAsset(await readSceneFile(selected));
        const thumb = document.createElement('canvas'); thumb.width = thumb.height = 128;
        const scale = 128 / Math.max(image.naturalWidth, image.naturalHeight);
        thumb.getContext('2d').drawImage(image, (128 - image.naturalWidth * scale) / 2, (128 - image.naturalHeight * scale) / 2, image.naturalWidth * scale, image.naturalHeight * scale);
        const data = thumb.toDataURL('image/png'), icon = await loadSceneAsset(data);
        if (!projects[sceneId].results.includes(result)) return;
        const sceneAssets = assetsByScene[sceneId] ||= {};
        sceneAssets.favicons ||= {};
        if (result.faviconImage && !projects[sceneId].results.some(other => other !== result && other.faviconImage === result.faviconImage)) delete sceneAssets.favicons[result.faviconImage];
        sceneAssets.favicons[data] = icon; result.faviconImage = data; result.favicon = 'custom'; dirty.add(sceneId);
        if (project.type === sceneId) { assets = sceneAssets; renderSearchEditor(); draw(); }
        tell('사이트 아이콘을 적용했어요. 프로젝트 저장 시 함께 보관됩니다.');
      } catch (error) { tell(error.message); } finally { upload.disabled = false; }
    });
    iconTools.append(preview, iconLabel, upload, file); row.appendChild(iconTools); repaint();
    const photo=document.createElement('input');photo.type='file';photo.accept='image/png,image/jpeg,image/webp';photo.hidden=true;
    const photoButton=document.createElement('button');photoButton.type='button';photoButton.textContent='결과 사진';photoButton.setAttribute('aria-label','검색 결과 '+(index+1)+' 사진 올리기');photoButton.addEventListener('click',()=>photo.click());
    photo.addEventListener('change',async()=>{const file=photo.files[0];photo.value='';if(!file)return;photoButton.disabled=true;const type=project.type;try{if(file.size>8*1024*1024||!/^image\/(png|jpeg|webp)$/.test(file.type))throw Error('8MB 이하 PNG, JPG, WebP 사진을 선택하세요.');const image=await loadSceneAsset(await readSceneFile(file)),small=document.createElement('canvas'),scale=Math.min(1,640/Math.max(image.naturalWidth,image.naturalHeight));small.width=Math.max(1,Math.round(image.naturalWidth*scale));small.height=Math.max(1,Math.round(image.naturalHeight*scale));small.getContext('2d').drawImage(image,0,0,small.width,small.height);const thumbnail=small.toDataURL('image/jpeg',.9);await SearchUI.ready({results:[{thumbnail}]});if(projects[type].results.includes(result)){result.thumbnail=thumbnail;dirty.add(type);if(type===project.type)draw()}}catch(error){tell(error.message)}finally{photoButton.disabled=false}});iconTools.append(photoButton,photo);
    const iconHint = document.createElement('p'); iconHint.className = 'hint'; iconHint.textContent = '직접 업로드: PNG / JPG / WebP / ICO · 최대 2MB'; row.appendChild(iconHint);
    for (const [key, name] of [['site', '사이트 이름'], ['domain', '표시 주소'], ['title', '제목'], ['snippet', '설명']]) {
      const label = document.createElement('label'); label.textContent = name;
      const field = document.createElement(key === 'snippet' ? 'textarea' : 'input');
      field.value = result[key]; field.maxLength = 2000; field.setAttribute('aria-label', `검색 결과 ${index + 1} ${name}`);
      if (key === 'snippet') field.rows = 3;
      field.addEventListener('input', () => { result[key] = field.value; dirty.add(project.type); if (key === 'site') repaint(); draw(); });
      label.appendChild(field); row.appendChild(label);
    }
    $('search-results').appendChild(row);
  });
  $('add-result').disabled = project.results.length >= 8;
}
function switchScene(id) {
  if(typeof MotionEditor!=='undefined')MotionEditor.clearPreview();
  phonePreview.dataset.force='true';
  pausePreview(); project = projects[id]; assets = assetsByScene[id] || {}; time = project.duration; renderEditor();
  tell(SOCIAL_SCENES.find(scene=>scene.id===id).section==='SNS'?'하트·댓글을 누르면 동작이 타임라인에 기록됩니다. MP4로 저장할 수 있어요.':'화면별 수정 내용은 작업 중 유지됩니다. 프로젝트 저장으로 파일을 남길 수 있어요.');
}
function downloadScene(blob, filename) {
  const url = URL.createObjectURL(blob), a = document.createElement('a');
  a.href = url; a.download = filename; a.click(); setTimeout(() => URL.revokeObjectURL(url), 60000);
}
async function readSceneFile(file) {
  if (file.size > 20 * 1024 * 1024) throw new Error('파일은 20MB 이하로 올려 주세요.');
  return new Promise((resolve, reject) => {
    const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = () => reject(new Error('파일을 읽지 못했습니다.')); reader.readAsDataURL(file);
  });
}
function loadSceneAsset(data, video = false) {
  if (!data) return Promise.resolve(null);
  return new Promise((resolve, reject) => {
    const element = document.createElement(video ? 'video' : 'img');
    const fail = () => { element.removeAttribute('src'); if (video) element.load(); reject(new Error('지원하지 않거나 손상된 미디어입니다. 다른 파일을 사용해 주세요.')); };
    element.addEventListener('error', fail, { once: true });
    if (video) {
      element.muted = true; element.preservesPitch=false; element.loop = true; element.playsInline = true; element.preload = 'auto';
      element.addEventListener('loadeddata',async()=>{await SceneAudio.inspectVideo(element,data);resolve(element)}, { once: true });
      element.addEventListener('seeked', draw);
    } else element.onload = () => resolve(element);
    element.src = data;
  });
}
async function uploadSceneAsset(file, avatar) {
  if (!file) return;
  if(!avatar&&ChatMedia.supports(project))return ChatEditor.photo(file);
  pausePreview();
  const id = project.type;
  try {
    const data = await readSceneFile(file);
    const video = !avatar && file.type.startsWith('video/');
    if (!/^image\/(png|jpeg|webp)$/.test(file.type) && !(video && SceneAudio.supportsVideo({type:id}) && /^video\/(mp4|webm|quicktime)$/.test(file.type))) throw new Error('PNG, JPG, WebP 이미지를 사용해 주세요. Instagram 피드·릴스와 영상 템플릿에는 MP4 / WebM도 올릴 수 있어요.');
    if(!avatar&&['x-feed','instagram-feed','facebook-feed'].includes(id)&&data.length+projects[id].feedItems.reduce((sum,item)=>sum+item.media.length,0)>64*1024*1024)throw Error('게시물 미디어의 총 크기는 64MB 이내로 사용해 주세요.');
    const element = await loadSceneAsset(data, video);
    if(avatar&&id==='naver-search')await SearchUI.ready({avatar:data});
    assetsByScene[id] ||= {};
    if (avatar) { projects[id].avatar = data; assetsByScene[id].avatar = element; }
    else {
      const old = assetsByScene[id].media; if (old instanceof HTMLVideoElement) { old.pause(); SceneAudio.releaseMedia(old);old.removeAttribute('src'); old.load(); }
      projects[id].media = data; projects[id].mediaKind = video ? 'video' : 'image'; projects[id].mediaName = file.name; assetsByScene[id].media = element;
    }
    dirty.add(id);
    if (project.type === id) { assets = assetsByScene[id]; renderEditor(); seekSource(); }
    tell('미디어를 적용했어요. 프로젝트 파일을 저장하면 미디어도 함께 보관됩니다.');
  } catch (error) { tell(error.message); }
}

const serviceBrandIcons = { kakao: 'kakaotalk-app.jpg', discord: 'discord-brand.svg', x: 'x-brand.svg', instagram: 'instagram-app.jpg', youtube: 'youtube-brand.svg', facebook: 'facebook-brand.svg', google: 'google-favicon.png', naver: 'naver-app.jpg', news: 'naver-app.jpg', mail: 'gmail-brand.svg', phone: 'phone-app.svg?v=20261029-2' };
$('template-count').textContent = String(SOCIAL_SCENES.length).padStart(2, '0');
for (const section of new Set(SOCIAL_SCENES.map(scene => scene.section))) {
  const category = document.createElement('div'); category.className = 'library-category';
  const heading = document.createElement('h2'); heading.className = 'library-section'; heading.textContent = section; category.appendChild(heading);
  const scenes = SOCIAL_SCENES.filter(scene => scene.section === section);
  for (const brand of new Set(scenes.map(scene => scene.brand))) {
    const children = scenes.filter(scene => scene.brand === brand), scene = children[0];
    const branch = document.createElement('details'); branch.className = 'library-brand'; branch.dataset.brand = brand;
    const summary = document.createElement('summary'); summary.setAttribute('aria-label', `${scene.name} 템플릿`);
    const icon = document.createElement('span'); icon.className = `template-icon ${brand}`; icon.setAttribute('aria-hidden', 'true');
    const brandAsset = serviceBrandIcons[brand];
    if (brandAsset) {
      icon.classList.add('has-logo');
      const image = document.createElement('img'); image.src = 'assets/' + brandAsset; image.alt = ''; image.width = 26; image.height = 26; image.draggable = false; icon.appendChild(image);
    } else {
      const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg'); svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('width', '15'); svg.setAttribute('height', '15');
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path'); path.setAttribute('d', SCENE_ICONS[scene.glyph]); path.setAttribute('fill', 'none'); path.setAttribute('stroke', 'currentColor'); path.setAttribute('stroke-width', '1.7'); svg.appendChild(path); icon.appendChild(svg);
    }
    const name = document.createElement('span'); name.textContent = scene.name;
    const count = document.createElement('span'); count.className = 'branch-count'; count.textContent = children.length;
    summary.append(icon, name, count); branch.appendChild(summary);
    for (const item of children) {
      const button = document.createElement('button'); button.type = 'button'; button.className = 'template-button'; button.dataset.template = item.id;
      button.textContent = item.kind; button.setAttribute('aria-label', `${item.name} ${item.kind}`);
      button.addEventListener('click', () => switchScene(item.id)); branch.appendChild(button);
    }
    category.appendChild(branch);
  }
  $('templates').appendChild(category);
}
$('preview-theme').addEventListener('click', () => {
  $('theme').value = project.theme === 'dark' ? 'light' : 'dark';
  $('theme').dispatchEvent(new Event('input',{bubbles:true}));
});
for (const [id, property] of Object.entries(propertyFields)) {
  $(id).addEventListener('input', () => {
    pausePreview(); const field = $(id);
    if(id==='comments')return;
    if(id==='chat-clock-auto'){field.checked?ChatClock.enable(project,time):ChatClock.freeze(project,time);dirty.add(project.type);renderEditor();return;}
    if(id==='comments-open'&&ReplyEditor.owner()!==project){ReplyEditor.owner().commentsOpen=field.checked;dirty.add(project.type);draw();return}
    if (field.type === 'number'||id==='overlay-scale') {
      if (!Number.isFinite(field.valueAsNumber)) return;
      project[property] = Math.max(Number(field.min), Math.min(Number(field.max), field.valueAsNumber));
    } else project[property] = field.type === 'checkbox' ? field.checked : id === 'speed' ? Number(field.value) : field.value;
    if (id === 'device') {
      project.ratio=project.device==='desktop'?'landscape':'device';
      project.viewScroll=0;
      if(project.type.startsWith('google-')||project.type==='naver-search')project.camera=project.device==='desktop'?'follow':'none';
    }
    if(id==='clock'&&ChatClock.supports(project))renderMessageEditor();
    if (id === 'theme') project.customStyle = false;
    dirty.add(project.type);
    if (['device','desktop-browser','android-navigation','iphone-navigation','theme', 'ratio', 'motion', 'duration', 'ai-briefing', 'speed', 'custom-style','overlay-format','overlay-scale'].includes(id)) { time = Math.min(time, project.duration); renderEditor(); }
    else { if (id === 'name' && !project.avatar) $('avatar-preview').textContent = Array.from(project.name)[0] || 'S'; draw(); }
  });
}
$('editor').addEventListener('submit', event => event.preventDefault());
$('play').addEventListener('click', playPreview);
$('rewind').addEventListener('click', () => { pausePreview(); time = 0; seekSource(); draw(); });
$('timeline').addEventListener('input', () => { pausePreview(); time = Number($('timeline').value); seekSource(); draw(); });
$('add-message').addEventListener('click', () => {
  if (project.messages.length >= ChatModels.messageLimit(project)) return;
  project.messages.push({ side: 'me', text: '새 메시지를 입력하세요.', at: Math.min(SceneTiming.maxDuration, (project.messages.at(-1)?.at || 0) + 1), time: '오후 1:27' });
  if(ChatModels.enabled(project)){const m=project.messages.at(-1);m.senderId=project.composerSenderId;m.side=ChatModels.side(project,m.senderId)}
  dirty.add(project.type); renderMessageEditor(); draw();
});
$('add-result').addEventListener('click', () => {
  if (project.results.length >= 8) return;
  project.results.push({ favicon: 'globe', faviconImage: '', site: '사이트 이름', domain: 'example.com', title: '검색 결과 제목', snippet: '검색 결과의 설명을 입력하세요.' });
  dirty.add(project.type); renderSearchEditor(); draw();
});
$('avatar-file').addEventListener('change', event => { uploadSceneAsset(event.target.files[0], true); event.target.value = ''; });
$('media-file').accept+=' ,video/mp4,video/webm,video/quicktime';
$('media-file').addEventListener('change', event => { uploadSceneAsset(event.target.files[0], false); event.target.value = ''; });
$('change-avatar').addEventListener('click', () => $('avatar-file').click());
$('change-media').addEventListener('click', () => {if(ChatMedia.supports(project))pausePreview();$('media-file').click();});
$('remove-avatar').addEventListener('click', () => { project.avatar = ''; delete assets.avatar; dirty.add(project.type); renderEditor(); });
$('remove-media').addEventListener('click', () => {
  pausePreview(); if (assets.media instanceof HTMLVideoElement) { SceneAudio.releaseMedia(assets.media);assets.media.removeAttribute('src'); assets.media.load(); }
  project.media = ''; project.mediaName = ''; project.mediaKind = 'image'; delete assets.media; dirty.add(project.type); renderEditor();
});
$('save-project').addEventListener('click', () => {
  downloadScene(new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' }), `${project.type}.social-scene.json`);
  dirty.delete(project.type); tell('현재 화면의 내용과 미디어를 프로젝트 파일로 저장했어요.');
});
$('open-project').addEventListener('click', () => $('project-file').click());
$('project-file').addEventListener('change', async event => {
  const file = event.target.files[0]; event.target.value = ''; if (!file) return;
  try {
    if (file.size > 256 * 1024 * 1024) throw new Error('프로젝트 파일은 256MB 이하로 열어 주세요.');
    const next = validateScene(JSON.parse(await file.text()));await ElementRender.ready(next);
    const [avatar, media, favicons,voices] = await Promise.all([
      loadSceneAsset(next.avatar), loadSceneAsset(next.media, next.mediaKind === 'video'),
      Promise.all([...new Set(next.results.map(result => result.faviconImage).filter(Boolean))].map(async data => [data, await loadSceneAsset(data)])),
      Promise.all(next.voices.map(async voice=>({avatar:await loadSceneAsset(voice.avatar)}))),
      Promise.all((next.participants||[]).map(member=>loadSceneAsset(ChatModels.avatar(next,member.id)))),
      Promise.all(next.messages.filter(message=>message.image).map(async message=>{const image=await loadSceneAsset(message.image);Object.assign(message,ChatMedia.attachment({...message,imageWidth:image.naturalWidth,imageHeight:image.naturalHeight}))})),
    ]);
    pausePreview(); projects[next.type] = next; assetsByScene[next.type] = { avatar, media, voices,favicons: Object.fromEntries(favicons) }; switchScene(next.type); dirty.delete(next.type); tell('프로젝트를 열었어요. 사진과 미디어도 함께 복원했습니다.');
  } catch (error) { tell(error instanceof SyntaxError ? '올바른 JSON 프로젝트 파일을 선택해 주세요.' : error.message); }
});
$('save-image').addEventListener('click',async()=>{
  if(recording)return;const preview=typeof MotionEditor!=='undefined'?MotionEditor.preview(project):{};pausePreview();const snapshot={...structuredClone(project),...preview,_capturePreview:true},position=time,sceneAssets={...brandAssets,...assets};
  $('save-image').disabled=true;$('save-video').disabled=true;
  try{await document.fonts.ready;await brandReady;const output=document.createElement('canvas');await renderOutputFrame(output,snapshot,position,{...brandAssets,...sceneAssets});
    const blob=await new Promise(resolve=>output.toBlob(resolve,'image/png'));if(!blob)throw new Error('이미지를 만들지 못했습니다.');downloadScene(blob,snapshot.type+'.png');tell('현재 프레임을 PNG로 저장했어요.');
  }catch(error){tell(error.message||'이미지 저장에 실패했습니다.');}finally{releaseOutputFrame();$('save-image').disabled=false;$('save-video').disabled=false;}
});

function cancelSceneExport() {
  if(recording){recording.cancelled=true;$('export-detail').textContent='내보내기를 취소하고 있습니다.';recording.encoder?.terminate();}else ExportFeedback.close();
}
function seekExportVideo(video, target) {
  if (Math.abs(video.currentTime - target) < .00001 && video.readyState >= 2) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const finish = error => {
      clearTimeout(timeout); video.removeEventListener('seeked', onSeek); video.removeEventListener('error', onError);
      error ? reject(error) : resolve();
    };
    const onSeek = () => finish(), onError = () => finish(new Error('소스 영상의 프레임을 읽지 못했습니다.'));
    const timeout = setTimeout(() => finish(new Error('소스 영상 읽기가 지연되어 저장을 중단했습니다.')), 15000);
    video.addEventListener('seeked', onSeek, { once: true }); video.addEventListener('error', onError, { once: true });
    video.currentTime = target;
  });
}
$('save-video').addEventListener('click', async () => {
  if (recording) return;
  if(project.type==='kakao-overlay'&&project.overlayFormat==='mov'||project.type==='discord-voice'&&project.props.exportFormat==='mov'){await TransparentMov.exportScene();return;}
  if(project.type==='discord-voice'&&project.props.exportFormat==='sequence'||project.type==='kakao-overlay'&&project.overlayFormat==='sequence'){await exportVoiceSequence();return;}
  if (typeof Mediabunny === 'undefined' || typeof VideoEncoder === 'undefined') { tell('MP4 저장은 최신 Chrome 또는 Edge에서 사용해 주세요. PNG 저장은 사용할 수 있어요.'); return; }
  pausePreview();
  const exportState = { cancelled: false }; recording = exportState;
  const { Output, Mp4OutputFormat, BufferTarget, CanvasSource, AudioBufferSource, Quality, canEncodeVideo, canEncodeAudio } = Mediabunny;
  const snapshot=structuredClone(project),sceneAssets={...brandAssets,...assets};
  const output = new Output({ format: new Mp4OutputFormat(), target: new BufferTarget() });
  try {
    await document.fonts.ready;
    await brandReady;
    ExportFeedback.open('장면을 영상으로 만드는 중','영상과 음원을 준비하고 있어요.');
    const audioBuffer=await SceneAudio.render(snapshot,sceneAssets,exportState);
    if(exportState.cancelled)return;
    const audioQuality=new Quality({bitrate:192000});
    if(audioBuffer&&!await canEncodeAudio('aac',{numberOfChannels:2,sampleRate:48000,quality:audioQuality}))throw new Error('이 브라우저는 AAC 소리 저장을 지원하지 않습니다. 최신 Chrome 또는 Edge로 열어 주세요.');
    const quality = new Quality({ bitrate: 12000000 });
    if (!await canEncodeVideo('avc', { width: canvas.width, height: canvas.height, quality })) throw new Error('이 브라우저에서 H.264 출력을 지원하지 않습니다. 최신 Chrome 또는 Edge로 열어 주세요.');
    const source = new CanvasSource(canvas, { codec: 'avc', quality });
    output.addVideoTrack(source, { frameRate: SceneTiming.frameRate });
    const audioSource=audioBuffer?new AudioBufferSource({codec:'aac',quality:audioQuality}):null;
    if(audioSource)output.addAudioTrack(audioSource);
    $('export-progress').value = 0; $('export-detail').textContent = `${sceneOutputDuration(snapshot).toFixed(2)}초 · MP4 · 30fps · ${audioBuffer?'소리 포함':'무음'} / 프레임을 생성하고 있어요.`;
    await output.start();
    if(audioSource){await audioSource.add(audioBuffer);audioSource.close();}
    const totalFrames = sceneExportFrames(snapshot);
    for (let frame = 0; frame < totalFrames; frame++) {
      if (exportState.cancelled) { tell('영상 저장을 취소했어요.'); return; }
      time = Math.min(snapshot.duration, frame / SceneTiming.frameRate * snapshot.speed);
      if (sceneAssets.media instanceof HTMLVideoElement) await seekExportVideo(sceneAssets.media, FilmModels.mediaTime(snapshot,time) % sceneAssets.media.duration);
      await renderOutputFrame(canvas,snapshot,time,sceneAssets,true); await source.add(frame / SceneTiming.frameRate, 1 / SceneTiming.frameRate);
      $('export-progress').value = (frame + 1) / totalFrames;
      if (frame % 3 === 0) await new Promise(resolve => setTimeout(resolve, 0));
    }
    await output.finalize();
    if (exportState.cancelled) { tell('영상 저장을 취소했어요.'); return; }
    downloadScene(new Blob([output.target.buffer], { type: 'video/mp4' }), `${snapshot.type}.mp4`);
    tell(`MP4 영상 저장 완료 · ${sceneOutputDuration(snapshot).toFixed(2)}초 · 30fps · ${audioBuffer?'소리 포함':'무음'}`);
  } catch (error) {
    tell(error.message || '영상을 만들지 못했습니다. 다시 시도해 주세요.');
  } finally {
    if (output.state !== 'finalized' && output.state !== 'canceled') await output.cancel().catch(() => {});
    if (assets.media instanceof HTMLVideoElement) assets.media.pause();
    recording = null;releaseOutputFrame(); ExportFeedback.close();
    draw();
  }
});
$('cancel-export').addEventListener('click', event => { event.preventDefault(); cancelSceneExport(); });
$('export-dialog').addEventListener('cancel', event => { event.preventDefault(); cancelSceneExport(); });
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) return;
  pausePreview();
});
document.addEventListener('keydown', event => {
  if (event.key !== ' ' || event.ctrlKey || event.metaKey || event.altKey || recording ||
    event.target.closest('input,select,textarea,button,a,[contenteditable]')) return;
  event.preventDefault(); if (!event.repeat) playPreview();
});
window.addEventListener('beforeunload', event => { if (dirty.size) { event.preventDefault(); event.returnValue = ''; } });
ElementEditor.init();CallAudio.init();ReplyEditor.init();FilmEditor.init();CollectionEditor.init();ChatEditor.init();OverlayEditor.init();
new ResizeObserver(fitPreview).observe($('stage'));
renderEditor();
brandReady = Promise.all([loadSceneAsset(GOOGLE_LOGO_DATA), loadSceneAsset(GOOGLE_FAVICON_DATA), loadSceneAsset(INSTAGRAM_WORDMARK_DATA),loadSceneAsset(INSTAGRAM_CLASSIC_WORDMARK_DATA),loadSceneAsset(GOOGLE_MIC_DATA),loadSceneAsset(GOOGLE_LENS_DATA), ...Object.entries(SCENE_NATIVE_ICONS.instagram).filter(([,icon])=>icon.image).map(([name,icon])=>loadSceneAsset(icon.image).then(image=>{(brandAssets.nativeIcons ||= {})[name]=image}))]).then(([logo, favicon, instagram,classic,mic,lens]) => {
  brandAssets.googleLogo = logo;brandAssets.googleMic=mic;brandAssets.googleLens=lens; brandAssets.googleFavicon = favicon; brandAssets.instagramLogo=instagram;brandAssets.instagramClassicLogo=classic;draw();
  if (SOCIAL_SCENES.find(scene => scene.id === project.type).section === '검색') renderSearchEditor();
}).catch(() => tell('브랜드 로고를 불러오지 못했어요. 새로고침해 주세요.'));
brandReady=Promise.all([brandReady,SearchUI.ready()]).then(draw).catch(()=>tell('검색 참고 이미지를 불러오지 못했어요.'));
Promise.all([document.fonts.load('400 16px Scene'), document.fonts.load('700 16px Scene'),...['SceneInter','SceneOpenSans','SceneKorean','SceneGoogle'].map(name=>document.fonts.load('400 16px '+name))]).then(draw).catch(() => tell('글꼴을 불러오지 못해 기본 글꼴로 표시합니다.'));
