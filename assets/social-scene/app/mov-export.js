'use strict';
function transparentMovArguments(frameCount){
 if(!Number.isInteger(frameCount)||frameCount<1||frameCount>72000)throw Error('MOV 프레임 수가 올바르지 않습니다.');
 return['-hide_banner','-loglevel','warning','-framerate','30','-start_number','1','-i','frame_%06d.png','-frames:v',String(frameCount),'-vf','scale=out_color_matrix=bt709:in_range=pc:out_range=tv,format=yuva444p10le','-an','-c:v','prores_ks','-profile:v','4','-pix_fmt','yuva444p10le','-alpha_bits','16','-vendor','apl0','-color_primaries','bt709','-color_trc','bt709','-colorspace','bt709','-threads','1','-y','overlay.mov'];
}
function transparentMovScene(project){
 if(!['kakao-overlay','discord-voice'].includes(project.type))throw Error('이 화면은 투명 MOV 출력을 지원하지 않습니다.');
 const snapshot=structuredClone(project);
 if(snapshot.type==='discord-voice')snapshot.props.background='transparent';
 return{snapshot,filename:snapshot.type==='discord-voice'?'discord-voice-transparent.mov':'kakao-overlay-transparent.mov'};
}
const TransparentMov=(()=>{
 let wrapper;
 function loadWrapper(){
  if(globalThis.FFmpegWASM)return Promise.resolve();
  if(!wrapper)wrapper=new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=new URL('vendor/ffmpeg/ffmpeg.js',document.baseURI).href;script.onload=resolve;script.onerror=()=>{script.remove();wrapper=null;reject(Error('MOV 변환기를 불러오지 못했습니다. vendor/ffmpeg 폴더를 확인해 주세요.'))};document.head.append(script)});
  return wrapper;
 }
 async function exportScene(){
  pausePreview();const state={cancelled:false,encoder:null};recording=state;
  ExportFeedback.open('투명 MOV를 준비하고 있어요','변환기 준비 · 진행 상태와 경과 시간을 확인할 수 있습니다.');
  let timer,failed=false;
  try{
   const {snapshot,filename}=transparentMovScene(project),sceneAssets={...brandAssets,...assets};
   await new Promise(resolve=>requestAnimationFrame(()=>setTimeout(resolve,0)));
   if(location.protocol==='file:')throw Object.assign(Error('MOV 출력은 파일을 직접 연 화면에서 실행할 수 없습니다. 프로젝트를 저장한 뒤 로컬 미리보기에서 열어 주세요.'),{localPreview:true});
   await loadWrapper();if(state.cancelled)return;
   const engine=new FFmpegWASM.FFmpeg();state.encoder=engine;
   await Promise.race([engine.load({coreURL:new URL('vendor/ffmpeg/ffmpeg-core.js',document.baseURI).href,wasmURL:new URL('vendor/ffmpeg/ffmpeg-core.wasm',document.baseURI).href}),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error('MOV 변환기 로드가 지연됩니다. 미리보기 서버를 확인해 주세요.')),45000)})]);clearTimeout(timer);
   if(state.cancelled)return;
   await document.fonts.ready;await brandReady;
   const count=sceneExportFrames(snapshot),surface=document.createElement('canvas');let bytes=0;
   for(let frame=0;frame<count;frame++){
    if(state.cancelled)return;
    time=frame/SceneTiming.frameRate*snapshot.speed;
    if(sceneAssets.media instanceof HTMLVideoElement)await seekExportVideo(sceneAssets.media,FilmModels.mediaTime(snapshot,time)%sceneAssets.media.duration);
    await renderOutputFrame(surface,snapshot,time,sceneAssets,false);
    const blob=await new Promise(resolve=>surface.toBlob(resolve,'image/png'));if(!blob)throw Error('투명 프레임을 만들지 못했습니다.');
    bytes+=blob.size;if(bytes>256*1024*1024)throw Error('MOV 중간 프레임이 256MB를 넘었습니다. 브라우저 메모리 보호를 위해 장면을 나누어 저장해 주세요.');
    if(state.cancelled)return;
    await engine.writeFile('frame_'+String(frame+1).padStart(6,'0')+'.png',new Uint8Array(await blob.arrayBuffer()));
    $('export-progress').value=.6*(frame+1)/count;$('export-detail').textContent='투명 프레임 생성 · '+(frame+1)+' / '+count+' · 중간 이미지는 파일로 저장하지 않습니다.';
    if(frame%3===0)await new Promise(resolve=>setTimeout(resolve,0));
   }
   if(state.cancelled)return;
   $('export-detail').textContent='ProRes 4444 + 알파 채널로 변환 중 · MOV 파일 한 개로 저장합니다.';
   engine.on('progress',({progress})=>{if(!state.cancelled)$('export-progress').value=.6+.38*Math.max(0,Math.min(1,progress))});
   const result=await engine.exec(transparentMovArguments(count));if(state.cancelled)return;
   if(result!==0)throw Error('MOV 변환에 실패했습니다. 장면 길이를 줄여 다시 저장해 주세요.');
   const data=await engine.readFile('overlay.mov');if(state.cancelled)return;
   if(!(data instanceof Uint8Array)||data.length<32)throw Error('MOV 파일이 생성되지 않았습니다.');
   $('export-progress').value=1;downloadScene(new Blob([data],{type:'video/quicktime'}),filename);
   tell('투명 MOV 저장 완료 · ProRes 4444 + 알파 · 30fps · 프리미어에서 바로 합성할 수 있습니다.');
  }catch(error){if(!state.cancelled){failed=true;const message=error.message||'MOV 파일을 만들지 못했습니다. 장면 길이를 줄여 다시 시도해 주세요.';tell(message);ExportFeedback.fail(message,{localPreview:!!error.localPreview})}}
  finally{clearTimeout(timer);state.encoder?.terminate();releaseOutputFrame();recording=null;if(!failed)ExportFeedback.close();draw();if(state.cancelled)tell('MOV 저장을 취소했어요.')}
 }
 return{exportScene};
})();
if(typeof module!=='undefined')module.exports={transparentMovArguments,transparentMovScene};
