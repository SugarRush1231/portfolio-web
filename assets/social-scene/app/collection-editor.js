 'use strict';
const CollectionEditor=(()=>{
 const previous=new Map(),seeds=new Map(),mailScroll=new Map();
 const label=action=>{
  const scoped=SceneCollections.parseAction(action),key=scoped?.action||action;
  return(scoped?'게시물 '+(scoped.index+2)+' · ':'')+(SCENE_ACTION_LABELS[key]||(/^comment-like:\d+$/.test(key)?'댓글 '+(Number(key.split(':')[1])+1)+' 좋아요':'동작'));
 };
 function actionKeys(p){return(p.feedItems||[]).flatMap((_,i)=>(p.type==='facebook-feed'?['like','follow','comments']:['like','double-like','save','repost','comments']).map(key=>'feed:'+i+':'+key))}
 function apply(patch){
  for(const [key,value]of Object.entries(patch)){
   if(key==='props')Object.assign(project.props,SceneCollections.clone(value));else project[key]=SceneCollections.clone(value);
  }
 }
 function render(){
  $('collection-fields').hidden=!SceneCollections.supported.includes(project.type);
  $('collection-undo').disabled=!previous.has(project);
  $('collection-summary').textContent=project.type==='email-inbox'?'현재 '+(project.mailItems.length+1)+'개 메일':'현재 '+(project.feedItems.length+1)+'개 게시물';
  $('scroll').max=SceneCollections.supported.includes(project.type)?100000:1200;
 }
 function inlineEdit(field,value){
  const match=/^(feedItems|mailItems)\.(\d+)\.(.+)$/.exec(field);if(!match)return false;
  const [,kind,number,key]=match,item=project[kind]?.[Number(number)];if(!item)return true;
  if(kind==='feedItems'){
   const comment=/^commentItems\.(\d+)\.(author|text|time|likes)$/.exec(key);
   if(comment){const row=item.commentItems[Number(comment[1])];if(row)row[comment[2]]=value.slice(0,comment[2]==='text'?2000:60)}
   else if(Object.hasOwn(SceneCollections.feedText,key))item[key]=value.slice(0,SceneCollections.feedText[key]);
   else return true;
  }else{if(!Object.hasOwn(SceneCollections.mailText,key))return true;item[key]=value.slice(0,SceneCollections.mailText[key])}
  dirty.add(project.type);draw();return true;
 }
 async function image(index,key){
  const scene=project,row=scene.feedItems[index];if(!row)return;
  const picker=document.createElement('input');picker.type='file';picker.accept='image/png,image/jpeg,image/webp';picker.setAttribute('aria-label','게시물 '+(index+2)+' '+(key==='avatar'?'프로필':'이미지')+' 선택');picker.hidden=true;document.body.append(picker);
  picker.addEventListener('cancel',()=>picker.remove(),{once:true});
  picker.addEventListener('change',async()=>{
   const file=picker.files[0];picker.remove();if(!file)return;
   if(file.size>20*1024*1024||!/^image\/(png|jpeg|webp)$/.test(file.type)){tell('PNG, JPG, WebP 이미지를 20MB 이하로 선택해 주세요.');return}
   try{
    const source=await loadSceneAsset(await readSceneFile(file)),target=document.createElement('canvas'),ctx=target.getContext('2d');
    if(key==='avatar'){target.width=target.height=256;sceneCover(ctx,source,0,0,256,256)}
    else{const scale=Math.min(1,1200/Math.max(source.naturalWidth,source.naturalHeight));target.width=Math.max(1,Math.round(source.naturalWidth*scale));target.height=Math.max(1,Math.round(source.naturalHeight*scale));ctx.fillStyle='#fff';ctx.fillRect(0,0,target.width,target.height);ctx.drawImage(source,0,0,target.width,target.height)}
    const data=target.toDataURL('image/jpeg',.88);if(data.length>2000000)throw new Error('이미지를 더 작은 크기로 선택해 주세요.');
    if(!scene.feedItems.includes(row))return;row[key]=data;dirty.add(scene.type);if(project===scene){phonePreview.dataset.force='true';draw()}
   }catch(error){tell(error.message)}
  },{once:true});picker.click();
 }
 function action(value){
  if(project.type==='email-inbox'){
   if(/^mail-tab:(primary|promotions|social)$/.test(value)){project.viewScroll=0;if(typeof MotionEditor!=='undefined')MotionEditor.clearPreview();recordInteraction(value,true);return true}
   if(value==='mail-sidebar'){recordInteraction(value,!sceneInteractionState(project,time).mailSidebarCollapsed);return true}
   const rowAction=/^mail-(open|star):(\d+)$/.exec(value);
   if(rowAction){
    pausePreview();
    const n=Number(rowAction[2]);if(n<0||n>project.mailItems.length)return true;
    if(rowAction[1]==='star'){if(n)project.mailItems[n-1].starred=!project.mailItems[n-1].starred;else project.mailStarred=!project.mailStarred;dirty.add(project.type);draw();return true}
    if(project.actions.length>=60){tell('반응 동작은 60개까지 사용할 수 있어요.');return true}
    // shortcut: mail selection is scene-wide; record row IDs when a film must switch between different emails.
    mailScroll.set(project,project.viewScroll);project.selectedMail=n;project.viewScroll=0;if(n)project.mailItems[n-1].read=true;else project.mailRead=true;
    recordInteraction('mail',true);FilmEditor.render();return true;
   }
   if(value==='mail'){
    pausePreview();
    if(project.actions.length>=60){tell('반응 동작은 60개까지 사용할 수 있어요.');return true}
    const open=sceneInteractionState(project,time).mailOpen;if(!open){if(project.selectedMail)project.mailItems[project.selectedMail-1].read=true;else project.mailRead=true}project.viewScroll=open?(mailScroll.get(project)||0):0;recordInteraction('mail',!open);return true;
   }
  }
  const scoped=SceneCollections.parseAction(value);if(!scoped)return false;
  pausePreview();const row=project.feedItems[scoped.index];if(!row)return true;
  if(scoped.action==='avatar'||scoped.action==='media'){image(scoped.index,scoped.action);return true}
  if(scoped.action.startsWith('edit:')){
   const key=scoped.action.slice(5),selector='[data-phone-field="feedItems.'+scoped.index+'.'+key+'"],[data-film-field="feedItems.'+scoped.index+'.'+key+'"]';
   const node=phonePreview.querySelector(selector);node?.focus({preventScroll:true});return true;
  }
  if(scoped.action==='send-comment')return ReplyEditor.send(scoped.index);
  const state=sceneInteractionState(project,time).feedItems[scoped.index],key={like:'liked',save:'saved',follow:'followed',repost:'reposted',comments:'commentsOpen','close-comments':'commentsOpen'}[scoped.action];
  if(key){recordInteraction('feed:'+scoped.index+':'+(scoped.action==='close-comments'?'comments':scoped.action),scoped.action==='comments'?true:scoped.action==='close-comments'?false:!state[key]);return true}
  if(scoped.action==='double-like'){recordInteraction(value,true);return true}
  if(/^comment-like:\d+$/.test(scoped.action)){const c=state.commentItems.find(c=>c._sourceIndex===Number(scoped.action.split(':')[1]));if(c)recordInteraction(value,!c.liked);return true}
  return true;
 }
 function input(event){
  const match=/^feedItems\.(\d+)\.commentDraft$/.exec(event.target.dataset.phoneComposer||'');if(!match)return false;
  const item=project.feedItems[Number(match[1])];if(item){item.commentDraft=event.target.value.slice(0,2000);dirty.add(project.type)}return true;
 }
 function keydown(event){
  const match=/^feedItems\.(\d+)\.commentDraft$/.exec(event.target.dataset.phoneComposer||'');
  if(!match||event.key!=='Enter'||event.shiftKey||event.isComposing)return false;
  event.preventDefault();action('feed:'+match[1]+':send-comment');return true;
 }
 function init(){
  $('collection-fill').addEventListener('click',()=>{
   pausePreview();
   try{
    const patch=SceneCollections.generate(project.type,{language:$('collection-language').value,length:$('collection-length').value,count:Number($('collection-count').value)},seeds.get(project)||0);
    if(patch.feedItems)for(const [index,row]of patch.feedItems.entries()){const old=project.feedItems[index];if(old){row.avatar=old.avatar;row.media=old.media}}
    const before={};for(const key of Object.keys(patch))before[key]=key==='props'?Object.fromEntries(Object.keys(patch.props).map(k=>[k,project.props[k]])):SceneCollections.clone(project[key]);
    before.actions=SceneCollections.clone(project.actions);before.viewScroll=project.viewScroll;
    previous.set(project,before);apply(patch);project.actions=project.actions.filter(e=>!SceneCollections.parseAction(e.action));project.viewScroll=0;
    seeds.set(project,(seeds.get(project)||0)+1);phonePreview.dataset.force='true';dirty.add(project.type);renderEditor();tell((project.type==='email-inbox'?'메일 ':'게시물 ')+$('collection-count').value+'개를 채웠습니다. 내용은 미리보기에서 수정할 수 있어요.');
   }catch(error){tell(error.message)}
  });
  $('collection-undo').addEventListener('click',()=>{
   const before=previous.get(project);if(!before)return;pausePreview();apply(before);previous.delete(project);phonePreview.dataset.force='true';dirty.add(project.type);renderEditor();tell('예시 채우기 직전 내용과 목록으로 복원했습니다.');
  });
 }
 return{render,init,action,inlineEdit,input,keydown,label,actionKeys};
})();
