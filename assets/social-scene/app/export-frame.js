
'use strict';
let sceneExportRoot,sceneExportCache;
async function renderOutputFrame(target,project,time,assets,opaque=false){
 await ElementRender.ready(project);
 await VideoMedia.seek(project,time);
 const[width,height]=sceneOutputSize(project);if(target.width!==width)target.width=width;if(target.height!==height)target.height=height;
 if(project.type==='discord-voice'&&!project._capturePreview&&!Object.keys(project.elementEdits||{}).length){FilmTemplates.paintVoice(target,project,time,assets,!opaque);return}
 if(SOCIAL_SCENES.find(scene=>scene.id===project.type).section==='검색'){renderScene(target,{...project,_export:true},time,assets);return}
 const[w,h]=scenePhoneSize(project),scale=Math.min(width/w,height/h);
 if(!sceneExportRoot){const host=document.createElement('div');host.style.cssText='position:fixed;left:-10000px;top:0;pointer-events:none';host.inert=true;host.setAttribute('aria-hidden','true');sceneExportRoot=document.createElement('div');sceneExportRoot.style.cssText='position:relative;left:0;top:0;transform:none;--phone-scale:1';host.append(sceneExportRoot);document.body.append(host)}
 sceneExportRoot.style.width=w+'px';sceneExportRoot.style.height=h+'px';
 PhoneScene.render(sceneExportRoot,{...sceneInteractionState(project,time),_export:true,_pixelRatio:scale},time,assets);
 const changing=!!ChatMedia.state(project,time).message||project.feedItems.some(item=>VideoMedia.isVideo(item.media))||project.scrollKeys?.length||project.slideKeys?.length||(ChatTyping.supports(project)&&project.motion==='messages')||SceneReplies.typingActive(project,time)||['messages','scroll','reveal'].includes(project.motion)||assets.media instanceof HTMLVideoElement||project.actions.some(e=>time>=e.at&&time<e.at+.8)||project.type==='phone-call'||project.type==='youtube-watch';
 const key=sceneExportRoot.className+sceneExportRoot.style.cssText+sceneExportRoot._phoneMarkup+project.avatar+project.media+'|edits:'+JSON.stringify(project.elementEdits||{})+'|scroll:'+project.viewScroll+':'+project.scroll+':'+project._scrollPaint+'|'+scale+(changing?time:0);
 const frame=sceneExportCache?.key===key?sceneExportCache.frame:await htmlToImage.toCanvas(sceneExportRoot,{width:w,height:h,pixelRatio:scale,fontEmbedCSS:SCENE_EXPORT_FONTS+ElementRender.fontCSS(project),filter:node=>!node.classList?.contains('ph-media-edit')&&!node.classList?.contains('film-media-edit')});
 sceneExportCache={key,frame};const ctx=target.getContext('2d');ctx.clearRect(0,0,width,height);if(!['discord-voice','kakao-overlay'].includes(project.type)||opaque){ctx.fillStyle=project.type==='kakao-overlay'?'#ff00ff':project.theme==='dark'?'#171b1d':'#e8ebe7';ctx.fillRect(0,0,width,height);}ctx.drawImage(frame,(width-frame.width)/2,(height-frame.height)/2);
}
function releaseOutputFrame(){sceneExportRoot?.parentElement?.remove();sceneExportRoot=null;sceneExportCache=null}
