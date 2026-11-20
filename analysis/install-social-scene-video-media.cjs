'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),source='E:/AI/social-templates',version='20261029-video-media-2';
const backup=path.join(__dirname,'video-media-backup');fs.mkdirSync(backup,{recursive:true});for(const name of ['index.html','chat-media.js','scene-audio.js','element-render.js','editor.js','scene.js','film-editor.js','export-frame.js','phone.js','film-templates.js','collection-editor.js','content-collections.js','chat-editor.js']){const saved=path.join(backup,name);if(!fs.existsSync(saved))fs.copyFileSync(path.join(source,name),saved)}
function patch(file,before,after){const full=path.join(source,file),text=fs.readFileSync(full,'utf8'),nl=text.includes('\r\n')?'\r\n':'\n';before=before.replace(/\r?\n/g,nl);after=after.replace(/\r?\n/g,nl);if(text.includes(after))return;assert(text.includes(before),'Expected source in '+file+': '+before.slice(0,90));fs.writeFileSync(full,text.replace(before,after));}
function section(file,start,end,replacement){const full=path.join(source,file),text=fs.readFileSync(full,'utf8'),a=text.indexOf(start),b=text.indexOf(end,a);assert(a>=0&&b>a,'Expected section '+file);fs.writeFileSync(full,text.slice(0,a)+replacement.replace(/\r?\n/g,text.includes('\r\n')?'\r\n':'\n')+text.slice(b));}
for(const file of ['chat-media.js','video-media.js','video-media.css'])fs.copyFileSync(path.join(root,'assets/social-scene',file),path.join(source,file));
let html=fs.readFileSync(path.join(source,'index.html'),'utf8');
if(!html.includes('src="video-media.js'))html=html.replace(/(<script src="chat-media\.js[^"<>]*"><\/script>)/,'$1<script src="video-media.js?v='+version+'"></script>');
if(!html.includes('href="video-media.css'))html=html.replace('</head>','<link rel="stylesheet" href="video-media.css?v='+version+'">\n</head>');
html=html.replace(/((?:src|href)="[\w./-]+)\?v=[^"&]+/g,'$1?v='+version);fs.writeFileSync(path.join(source,'index.html'),html);
if(fs.readFileSync(path.join(source,'scene-audio.js'),'utf8').includes("['instagram-feed','instagram-reels','x-feed','x-profile','facebook-feed'].includes(p.type)"))patch('scene-audio.js',"['instagram-feed','instagram-reels','x-feed','x-profile','facebook-feed'].includes(p.type)","['instagram-feed','instagram-reels','x-feed','facebook-feed'].includes(p.type)");
patch('scene-audio.js',"['instagram-feed','instagram-reels'].includes(p.type)","['instagram-feed','instagram-reels','x-feed','facebook-feed'].includes(p.type)");
patch('scene-audio.js',"return mediaScene(p)&&!!a.media?._sceneAudio?.hasAudio", "return(typeof VideoMedia!=='undefined'&&VideoMedia.hasAudio(p))||(mediaScene(p)&&!!a.media?._sceneAudio?.hasAudio)");
patch('scene-audio.js',"if(!voice&&p.type==='youtube-watch')for", "if(!voice)for");
patch('scene-audio.js'," async function render(p,a,state){", " async function render(p,a,state){\n  if(typeof VideoMedia!=='undefined')await VideoMedia.ready(p);");
patch('scene-audio.js',"  if(state.cancelled)return null;return ctx.startRendering();", "  if(typeof VideoMedia!=='undefined')await VideoMedia.renderAudio(p,ctx,gain,state);\n  if(state.cancelled)return null;return ctx.startRendering();");
patch('element-render.js'," async function ready(p){", " async function ready(p){\n  if(typeof VideoMedia!=='undefined')await VideoMedia.ready(p);");
patch('editor.js',"function phoneAction(action) {", "function phoneAction(action) {\n  if(VideoMedia.action(action))return;");
patch('editor.js',"playing = false; cancelAnimationFrame(animationFrame);FilmEditor.pause();", "playing = false; cancelAnimationFrame(animationFrame);VideoMedia.pause();FilmEditor.pause();");
patch('editor.js',"Math.min(time,project.duration-.8)", "Math.min(time,project.duration-(ChatMedia.parseAction(action)?0:.8))");
patch('editor.js',"    const element = await loadSceneAsset(data, video);", "    if(!avatar&&['x-feed','instagram-feed','facebook-feed'].includes(id)&&data.length+projects[id].feedItems.reduce((sum,item)=>sum+item.media.length,0)>64*1024*1024)throw Error('게시물 미디어의 총 크기는 64MB 이내로 사용해 주세요.');\n    const element = await loadSceneAsset(data, video);");
patch('editor.js'," project.messages.splice(index, 1);", " project.messages.splice(index, 1); project.actions=project.actions.filter(e=>!ChatMedia.parseAction(e.action)||ChatMedia.isAction(e.action,project));");
patch('editor.js',"  $('avatar-preview').replaceChildren();", "  VideoMedia.trim(Object.values(projects));\n  $('avatar-preview').replaceChildren();");
patch('editor.js',"'사진 메시지 '+project.messages.filter(m=>m.image).length+'개'", "'사진·영상 메시지 '+project.messages.filter(m=>m.image).length+'개'");
patch('editor.js',"ChatMedia.supports(project)?'대화에 사진 추가'", "ChatMedia.supports(project)?'대화에 사진·영상 추가'");
patch('editor.js',"'현재 타임라인 시점에 사진 메시지를 추가합니다. 그 이전에는 나타나지 않습니다. 메시지 목록에서 보낸 사람·등장 시간·순서를 조절하고 사진을 삭제·교체할 수 있습니다.'", "'현재 타임라인 시점에 사진·영상 메시지를 추가합니다. 이전 시점에는 나타나지 않습니다. MP4·WebM·MOV · 파일당 최대 20MB. 영상 미리보기를 누르면 크게 보기·재생이 열립니다.'");
patch('editor.js',"$('media-file').addEventListener('change'", "$('media-file').accept+=' ,video/mp4,video/webm,video/quicktime';\n$('media-file').addEventListener('change'");
patch('scene.js',"!SCENE_NEWS.isAction(action)||", "!SCENE_NEWS.isAction(action)&&!SCENE_CHAT_MEDIA.isAction(action,input)||");
patch('scene.js',"/^(like|double-like|save|follow|repost|comments|comment-like:", "/^(like|double-like|save|follow|repost|comments|video|comment-like:");
patch('film-editor.js',"if(project.type==='youtube-watch'&&assets.media instanceof HTMLVideoElement)", "if(SceneAudio.supportsVideo(project)&&assets.media instanceof HTMLVideoElement)");
patch('film-editor.js',"if(!playing||!state.videoPlaying)", "if(!playing||state.videoPlaying===false)");
patch('film-models.js',"if(p.type!=='youtube-watch')return time;", "if(!['youtube-watch','x-feed','instagram-feed','instagram-reels','facebook-feed'].includes(p.type))return time;");
patch('film-models.js',"return p.props.videoStart+elapsed;", "return(p.type==='youtube-watch'?p.props.videoStart:0)+elapsed;");
patch('export-frame.js'," await ElementRender.ready(project);", " await ElementRender.ready(project);\n await VideoMedia.seek(project,time);");
patch('export-frame.js',"const changing=project.scrollKeys", "const changing=!!ChatMedia.state(project,time).message||project.feedItems.some(item=>VideoMedia.isVideo(item.media))||project.scrollKeys");
patch('phone.js',"const markup=ChatModels.native(p.type)?chat(p,time):p.type.startsWith('x-')?x(p,time):instagram({...p,_hasAudio:SceneAudio.hasExportSource(p,assets)},time);", "const markup=(ChatModels.native(p.type)?chat(p,time):p.type.startsWith('x-')?x(p,time):instagram({...p,_hasAudio:SceneAudio.hasExportSource(p,assets)},time))+VideoMedia.viewer(p,time);");
const phoneFile=path.join(source,'phone.js');let phone=fs.readFileSync(phoneFile,'utf8');const oldPhoto="'<img class=\"ph-message-image\" src=\"'+row.image+'\" alt=\"'+esc(row.imageName||'사진 메시지')+'\" style=\"height:'+row.imageHeight+'px\" draggable=\"false\"><button type=\"button\" class=\"ph-media-edit\" data-phone-action=\"chat-image:'+row.index+'\" aria-label=\"사진 메시지 교체\">사진 교체</button>'";
if(!phone.includes('VideoMedia.thumbnail(row,row.imageHeight)')){assert(phone.includes(oldPhoto),'Expected chat photo markup');phone=phone.replace(oldPhoto,'VideoMedia.thumbnail(row,row.imageHeight)');fs.writeFileSync(phoneFile,phone)}
patch('phone.js',"    ElementRender.applyMedia(root,p);", "    VideoMedia.paint(root,p,time);\n    ElementRender.applyMedia(root,p);");
patch('film-templates.js',"  ElementRender.applyMedia(root,p);", "  VideoMedia.paint(root,p,t);\n  ElementRender.applyMedia(root,p);");
patch('collection-editor.js'," const label=action=>{", " const label=action=>{\n  const chat=ChatMedia.parseAction(action);if(chat)return({open:'영상 크게 보기',play:'영상 재생·일시정지',close:'영상 닫기'})[chat.kind];");
patch('collection-editor.js',"function actionKeys(p){return(p.feedItems||[]).flatMap((_,i)=>(p.type==='facebook-feed'?['like','follow','comments']:['like','double-like','save','repost','comments']).map(key=>'feed:'+i+':'+key))}", "function actionKeys(p){return(p.feedItems||[]).flatMap((item,i)=>[...(p.type==='facebook-feed'?['like','follow','comments']:['like','double-like','save','repost','comments']),...(item.media?.startsWith('data:video/')?['video']:[])].map(key=>'feed:'+i+':'+key))}");
patch('collection-editor.js',"picker.accept='image/png,image/jpeg,image/webp';picker.setAttribute('aria-label','게시물 '", "picker.accept='image/png,image/jpeg,image/webp'+(key==='media'?',video/mp4,video/webm,video/quicktime':'');picker.setAttribute('aria-label','게시물 '");
patch('collection-editor.js',"if(file.size>20*1024*1024||!/^image\\/(png|jpeg|webp)$/.test(file.type))", "if(file.size>20*1024*1024||(!/^image\\/(png|jpeg|webp)$/.test(file.type)&&!(key==='media'&&/^video\\/(mp4|webm|quicktime)$/.test(file.type))))");
patch('collection-editor.js',"tell('PNG, JPG, WebP 이미지를 20MB 이하로 선택해 주세요.');return", "tell(key==='media'?'PNG·JPG·WebP 또는 MP4·WebM·MOV 파일을 20MB 이하로 선택해 주세요.':'프로필은 PNG·JPG·WebP 이미지를 20MB 이하로 선택해 주세요.');return");
patch('collection-editor.js',"   try{\n    const source=await loadSceneAsset(await readSceneFile(file)),target=", "   try{\n    if(key==='media'&&file.type.startsWith('video/')){const data=await readSceneFile(file);if(data.length+(scene.media?.length||0)+scene.feedItems.reduce((sum,item)=>sum+(item===row?0:item.media.length),0)>64*1024*1024)throw Error('게시물 미디어의 총 크기는 64MB 이내로 사용해 주세요.');await VideoMedia.load(data);if(!scene.feedItems.includes(row))return;row.media=data;dirty.add(scene.type);if(project===scene){phonePreview.dataset.force='true';draw()}return}\n    const source=await loadSceneAsset(await readSceneFile(file)),target=");
patch('content-collections.js',"value[key].length>2000000||value[key]&&!/^data:image\\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(value[key])", "value[key].length>(key==='media'?32*1024*1024:2000000)||value[key]&&!(key==='media'?/^data:(image\\/(png|jpeg|webp)|video\\/(mp4|webm|quicktime));base64,[A-Za-z0-9+/=]+$/:/^data:image\\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/).test(value[key])");
patch('content-collections.js',"  if(input.mailItems!==undefined){", "  if(out.feedItems.reduce((sum,item)=>sum+item.media.length,result.media?.length||0)>64*1024*1024)throw Error('게시물 미디어의 총 크기는 64MB 이내로 사용해 주세요.');\n  if(input.mailItems!==undefined){");
patch('content-collections.js',"mediaKind:'image',_collectionIndex:index", "mediaKind:item.media?.startsWith('data:video/')?'video':'image',_collectionIndex:index");
patch('content-collections.js',"(item.media?'<img alt=\"게시물 이미지\" src=\"'+esc(item.media)+'\">'", "(item.media?(item.media.startsWith('data:video/')?'<canvas data-collection-video=\"'+item._collectionIndex+'\"></canvas><button type=\"button\" class=\"collection-video-toggle\" data-phone-action=\"video\" aria-label=\"게시물 영상 재생·일시정지\"><svg viewBox=\"0 0 24 24\"><path d=\"M8 5v14l11-7Z\"/></svg></button>':'<img alt=\"게시물 이미지\" src=\"'+esc(item.media)+'\">')");
section('chat-editor.js',' async function photo(file,index=null){',' function photoControl(message,index){',` async function photo(file,index=null){
  if(!file)return;pausePreview();const p=project,position=time,target=index===null?null:project.messages[index];
  try{
   const video=file.type.startsWith('video/');if(!/^image\\/(png|jpeg|webp)$/.test(file.type)&&!/^video\\/(mp4|webm|quicktime)$/.test(file.type))throw Error('PNG·JPG·WebP 사진 또는 MP4·WebM·MOV 영상을 사용해 주세요.');
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
`);
patch('chat-editor.js',"picker.dataset.chatPhoto=String(index);picker.accept='image/png,image/jpeg,image/webp';", "picker.dataset.chatPhoto=String(index);picker.accept='image/png,image/jpeg,image/webp,video/mp4,video/webm,video/quicktime';");
patch('chat-editor.js',"button.textContent='사진 교체';", "button.textContent=message.video?'영상 교체':'사진·영상 교체';");
console.log('Connected video message model, timeline actions, native viewers, feed media, audio and frame export.');
