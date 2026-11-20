'use strict';
const VideoMedia=(()=>{
 const clips=new Map(),esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const isVideo=value=>typeof value==='string'&&value.startsWith('data:video/');
 const stamp=value=>{value=Math.max(0,Math.floor(value||0));return Math.floor(value/60)+':'+String(value%60).padStart(2,'0')};
 const icon=name=>'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="'+(SCENE_ICONS[name]||SCENE_ICONS.play)+'"/></svg>';
 function load(data){
  if(!clips.has(data)){const item={node:null,task:null};item.task=loadSceneAsset(data,true).then(node=>{if(!Number.isFinite(node.duration)||node.duration<=0)throw Error('영상 길이를 확인하지 못했습니다. MP4 / WebM 파일을 사용해 주세요.');item.node=node;return node}).catch(error=>{clips.delete(data);throw error});clips.set(data,item)}return clips.get(data).task;
 }
 function data(p){return[...(p.messages||[]).map(m=>m.video),...(p.feedItems||[]).map(m=>m.media)].filter(isVideo)}
 async function ready(p){await Promise.all([...new Set(data(p))].map(load))}
 function trim(list){const keep=new Set(list.flatMap(data));for(const[key,item]of clips)if(!keep.has(key)){item.node?.pause();if(item.node){SceneAudio.releaseMedia(item.node);item.node.removeAttribute('src');item.node.load()}clips.delete(key)}}
 function pause(){for(const item of clips.values())item.node?.pause()}
 async function seekNode(node,position){
  position=Math.min(Math.max(0,position),Math.max(0,node.duration-.002));if(Math.abs(node.currentTime-position)<.015&&node.readyState>=2)return;
  await new Promise((resolve,reject)=>{const finish=()=>{clearTimeout(timer);node.removeEventListener('seeked',done);node.removeEventListener('error',fail)},done=()=>{finish();resolve()},fail=()=>{finish();reject(Error('영상 프레임을 읽지 못했습니다.'))},timer=setTimeout(fail,10000);node.addEventListener('seeked',done,{once:true});node.addEventListener('error',fail,{once:true});node.currentTime=position});
 }
 function feedState(p,index,t){let at=0,position=0,playing=false;for(const event of [...(p.actions||[])].sort((a,b)=>a.at-b.at)){if(event.at>t)break;if(event.action!=='feed:'+index+':video')continue;if(playing)position+=event.at-at;at=event.at;playing=event.value}if(playing)position+=t-at;return{playing,position}}
 function sources(p,t){const chat=ChatMedia.state(p,t),out=[];if(chat.message)out.push({data:chat.message.video,position:chat.position,playing:chat.playing,loop:false});(p.feedItems||[]).forEach((item,index)=>{if(isVideo(item.media)){const state=feedState(p,index,t);out.push({data:item.media,...state,loop:true})}});return out}
 async function seek(p,t){await ready(p);for(const source of sources(p,t)){const node=clips.get(source.data)?.node;if(node)await seekNode(node,source.loop?source.position%node.duration:source.position)}}
 async function attachment(file){
  if(!/^video\/(mp4|webm|quicktime)$/.test(file.type))throw Error('MP4 / WebM / MOV 영상을 선택해 주세요.');
  const source=await readSceneFile(file),node=await load(source);await seekNode(node,Math.min(.08,node.duration/2));const poster=document.createElement('canvas'),scale=Math.min(1,1200/Math.max(node.videoWidth,node.videoHeight));poster.width=Math.max(1,Math.round(node.videoWidth*scale));poster.height=Math.max(1,Math.round(node.videoHeight*scale));poster.getContext('2d').drawImage(node,0,0,poster.width,poster.height);
  const id='v'+Array.from(crypto.getRandomValues(new Uint32Array(2)),x=>x.toString(16).padStart(8,'0')).join('');return ChatMedia.attachment({image:poster.toDataURL('image/jpeg',.88),imageName:file.name.slice(0,300),imageWidth:poster.width,imageHeight:poster.height,video:source,videoDuration:node.duration,videoId:id});
 }
 function thumbnail(row,height){
  const photo='<img class="ph-message-image" src="'+esc(row.image)+'" alt="'+esc(row.imageName||'미디어 메시지')+'" style="height:'+height+'px" draggable="false">';
  const edit='<button type="button" class="ph-media-edit" data-phone-action="chat-image:'+row.index+'" aria-label="사진 또는 영상 교체">교체</button>';
  return(row.video?'<button type="button" class="chat-video-thumb" data-phone-action="chat-video:open:'+row.videoId+'" aria-label="영상 크게 보기">'+photo+'<span class="chat-video-play">'+icon('play')+'</span><span class="chat-video-length">'+stamp(row.videoDuration)+'</span></button>':photo)+edit;
 }
 function viewer(p,t){
  const state=ChatMedia.state(p,t),m=state.message;if(!m)return'';const action='chat-video:play:'+m.videoId,play='<button type="button" data-phone-action="'+action+'" aria-label="'+(state.playing?'영상 일시정지':'영상 재생')+'">'+icon(state.playing?'pause':'play')+'</button>';
  return'<section class="chat-video-viewer" aria-label="대화 동영상 보기"><header class="chat-video-header"><button type="button" data-phone-action="chat-video:close:'+m.videoId+'" aria-label="영상 닫기">'+icon('back')+'</button><strong>'+esc(m.imageName)+'</strong></header><div class="chat-video-stage"><canvas data-chat-video="'+m.videoId+'"></canvas>'+play+'</div><footer class="chat-video-controls">'+play+'<span data-chat-video-current>0:00</span><div class="chat-video-progress"><i></i></div><span>'+stamp(m.videoDuration)+'</span></footer></section>';
 }
 function paintNode(canvas,node,p,contain=false){
  const box=canvas.parentElement,w=box.clientWidth||432,h=box.clientHeight||240,ratio=p._pixelRatio||1;canvas.width=Math.round(w*ratio);canvas.height=Math.round(h*ratio);const ctx=canvas.getContext('2d');ctx.scale(ratio,ratio);ctx.fillStyle='#080a0d';ctx.fillRect(0,0,w,h);if(node?.readyState<2||!node)return;
  if(contain){const scale=Math.min(w/node.videoWidth,h/node.videoHeight),width=node.videoWidth*scale,height=node.videoHeight*scale;ctx.drawImage(node,(w-width)/2,(h-height)/2,width,height)}else sceneCover(ctx,node,0,0,w,h);
 }
 function paint(root,p,t){
  if(['x-feed','facebook-feed'].includes(p.type)&&p.mediaKind==='video'){
   const holder=root.querySelector('[data-phone-media],[data-film-media]')?.parentElement;
   if(holder){let button=holder.querySelector('[data-phone-action="media-video"]');if(!button){button=document.createElement('button');button.type='button';button.className='collection-video-toggle';button.dataset.phoneAction='media-video';holder.appendChild(button)}const running=p.videoPlaying!==false;button.setAttribute('aria-label',running?'게시물 영상 일시정지':'게시물 영상 재생');button.innerHTML=icon(running?'pause':'play')}
  }
  for(const button of root.querySelectorAll('.collection-video-toggle')){const scope=button.closest('[data-feed-index]');if(scope){const state=feedState(p,Number(scope.dataset.feedIndex),t);button.innerHTML=icon(state.playing?'pause':'play');button.setAttribute('aria-label',state.playing?'게시물 영상 일시정지':'게시물 영상 재생')}}
  const active=sources(p,t),used=new Set();for(const source of active){const node=clips.get(source.data)?.node;if(!node)continue;used.add(node);node.loop=source.loop;const position=source.loop?source.position%node.duration:Math.min(source.position,Math.max(0,node.duration-.002));
   if(!p._export){node.playbackRate=p.speed;node.volume=p.previewVolume;node.muted=p.previewMuted||!p._isPlaying||!source.playing;if(Math.abs(node.currentTime-position)>(p._isPlaying&&source.playing?.25:.015))node.currentTime=position;if(p._isPlaying&&source.playing){if(node.paused)node.play().catch(()=>{})}else node.pause()}
  }
  if(!p._export)for(const item of clips.values())if(item.node&&!used.has(item.node))item.node.pause();
  const state=ChatMedia.state(p,t);if(state.message){const current=root.querySelector('[data-chat-video-current]'),progress=root.querySelector('.chat-video-progress i');if(current)current.textContent=stamp(state.position);if(progress)progress.style.width=Math.min(100,state.position/state.message.videoDuration*100)+'%'}for(const canvas of root.querySelectorAll('[data-chat-video]'))paintNode(canvas,clips.get(state.message?.video)?.node,p,true);
  for(const canvas of root.querySelectorAll('[data-collection-video]'))paintNode(canvas,clips.get(p.feedItems?.[Number(canvas.dataset.collectionVideo)]?.media)?.node,p);
 }
 function action(value){
  const chat=ChatMedia.parseAction(value);if(chat){if(!ChatMedia.isAction(value,project))return true;pausePreview();const current=ChatMedia.state(project,time);if(chat.kind==='play'){const m=project.messages.find(m=>m.videoId===chat.id);project.duration=Math.min(SceneTiming.maxDuration,Math.max(project.duration,Math.ceil(time+m.videoDuration-current.position)));$('duration').value=project.duration;recordInteraction(value,!current.playing);if(!current.playing){pausePreview();playPreview(project.duration)}}else recordInteraction(value,chat.kind==='open');return true}
  const feed=/^feed:(\d+):video$/.exec(value);if(feed){const index=Number(feed[1]),data=project.feedItems[index]?.media;if(!isVideo(data))return true;pausePreview();const state=feedState(project,index,time),node=clips.get(data)?.node;if(!state.playing&&node){project.duration=Math.min(SceneTiming.maxDuration,Math.max(project.duration,Math.ceil(time+node.duration-state.position%node.duration)));$('duration').value=project.duration}recordInteraction(value,!state.playing);if(!state.playing){pausePreview();playPreview(project.duration)}return true}
  if(value==='media-video'){pausePreview();const state=sceneInteractionState(project,time);recordInteraction('video',state.videoPlaying===false);if(state.videoPlaying===false){pausePreview();playPreview(project.duration)}return true}return false;
 }
 function audioSegments(p){const out=ChatMedia.segments(p).map(item=>({...item,data:item.message.video}));(p.feedItems||[]).forEach((item,index)=>{if(!isVideo(item.media))return;const node=clips.get(item.media)?.node;if(!node)return;const points=[0,p.duration,...p.actions.filter(e=>e.action==='feed:'+index+':video'&&e.at<p.duration).map(e=>e.at)].sort((a,b)=>a-b);for(let i=0;i<points.length-1;i++){const current=feedState(p,index,points[i]);if(!current.playing)continue;let cursor=points[i],offset=current.position%node.duration;while(cursor<points[i+1]){const length=Math.min(points[i+1]-cursor,node.duration-offset);out.push({data:item.media,at:cursor/p.speed,offset,length,rate:p.speed});cursor+=length;offset=0}}});return out}
 function hasAudio(p){return audioSegments(p).some(segment=>clips.get(segment.data)?.node?._sceneAudio?.hasAudio)}
 async function renderAudio(p,ctx,gain,state){
  for(const segment of audioSegments(p)){const info=clips.get(segment.data)?.node?._sceneAudio;if(info?.error)throw Error(info.error);if(!info?.hasAudio)continue;if(!await info.track.canDecode())throw Error('AAC 오디오가 포함된 MP4 영상을 사용해 주세요.');const sink=new Mediabunny.AudioBufferSink(info.track);for await(const chunk of sink.buffers(segment.offset,segment.offset+segment.length)){if(state.cancelled)return;const from=Math.max(segment.offset,chunk.timestamp),to=Math.min(segment.offset+segment.length,chunk.timestamp+chunk.duration);if(to<=from)continue;const source=ctx.createBufferSource();source.buffer=chunk.buffer;source.playbackRate.value=segment.rate;source.connect(gain);source.start(segment.at+(from-segment.offset)/segment.rate,from-chunk.timestamp,to-from)}}
 }
 return{isVideo,load,ready,trim,pause,seek,attachment,thumbnail,viewer,paint,action,feedState,hasAudio,renderAudio,icon};
})();
