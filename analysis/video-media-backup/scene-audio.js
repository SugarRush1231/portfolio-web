
'use strict';
const SceneAudio=(()=>{
 const calls=typeof CallAudio!=='undefined'?CallAudio:require('./call-audio.js');
 const models=typeof FilmModels!=='undefined'?FilmModels:require('./film-models.js');
 const mediaScene=p=>['instagram-feed','instagram-reels'].includes(p.type)||!!models.specs[p.type]?.video;
 function sequence(p){return p.type==='discord-voice'&&['sequence','mov'].includes(p.props.exportFormat)}
 function hasExportSource(p,a){if(calls.hasSource(p))return true;if(sequence(p))return false;if(p.type==='discord-voice')return p.voices.some((v,i)=>!v.muted&&!!a.voices?.[i]?.buffer);return mediaScene(p)&&!!a.media?._sceneAudio?.hasAudio}
 function missingSource(p,a){return !sequence(p)&&p.type==='discord-voice'&&p.voices.some((v,i)=>!v.muted&&!!v.audioName&&!a.voices?.[i]?.buffer)}
 function segments(p,duration,voice=false){
  if(!Number.isFinite(duration)||duration<=0)return[];
  const intervals=[];let at=0,playing=true;
  if(!voice&&p.type==='youtube-watch')for(const e of p.actions.filter(e=>e.action==='video'&&e.at<=p.duration).sort((a,b)=>a.at-b.at)){if(playing&&e.at>at)intervals.push([at,e.at]);at=e.at;playing=e.value}
  if(playing&&at<p.duration)intervals.push([at,p.duration]);
  const out=[];
  for(const[from,to]of intervals){let cursor=from,offset=voice?p.props.sourceStart+from:models.mediaTime(p,from)%duration;
   while(cursor<to-1e-7){if(voice&&offset>=duration)break;const length=Math.min(to-cursor,duration-offset);if(length<1e-7)break;out.push({at:cursor/p.speed,offset,length,rate:p.speed});cursor+=length;offset=voice?offset+length:0}
  }return out;
 }
 async function inspectVideo(element,data){
  const info={hasAudio:false,input:null,track:null,error:''};element._sceneAudio=info;
  try{const blob=await(await fetch(data)).blob();info.input=new Mediabunny.Input({formats:Mediabunny.ALL_FORMATS,source:new Mediabunny.BlobSource(blob)});info.track=await info.input.getPrimaryAudioTrack();info.hasAudio=!!info.track}
  catch(error){info.error='영상의 오디오 트랙을 확인하지 못했습니다. MP4 / WebM으로 다시 저장해 주세요.'}
 }
 function releaseMedia(element){element?._sceneAudio?.input?.dispose();if(element)delete element._sceneAudio}
 async function render(p,a,state){
  if(p.previewMuted||p.previewVolume===0||sequence(p))return null;
  if(missingSource(p,a))throw new Error('소리를 저장하려면 참가자의 음성 원본을 다시 연결해 주세요.');
  if(mediaScene(p)&&a.media?._sceneAudio?.error)throw new Error(a.media._sceneAudio.error);
  if(!hasExportSource(p,a))return null;
  const rate=48000,length=Math.ceil(sceneOutputDuration(p)*rate),ctx=new OfflineAudioContext(2,length,rate),gain=ctx.createGain();gain.gain.value=p.previewVolume;gain.connect(ctx.destination);
  const schedule=(buffer,when,offset,duration,speed)=>{if(duration<=0||when>=length/rate)return;const node=ctx.createBufferSource();node.buffer=buffer;node.playbackRate.value=speed;node.connect(gain);node.start(when,Math.max(0,offset),duration)};
  if(calls.hasSource(p))await calls.render(p,ctx,gain);
  if(p.type==='discord-voice')p.voices.forEach((v,i)=>{const buffer=a.voices?.[i]?.buffer;if(v.muted||!buffer)return;for(const s of segments(p,buffer.duration,true))schedule(buffer,s.at,s.offset,s.length,s.rate)});
  else if(mediaScene(p)&&a.media?._sceneAudio?.hasAudio){
   const info=a.media._sceneAudio;if(!await info.track.canDecode())throw new Error('이 영상의 음성 코덱을 읽을 수 없습니다. AAC 오디오가 포함된 MP4로 바꿔 주세요.');
   for(const s of segments(p,a.media.duration)){const sink=new Mediabunny.AudioBufferSink(info.track);for await(const chunk of sink.buffers(s.offset,s.offset+s.length)){if(state.cancelled)return null;const from=Math.max(s.offset,chunk.timestamp),to=Math.min(s.offset+s.length,chunk.timestamp+chunk.duration);schedule(chunk.buffer,s.at+(from-s.offset)/s.rate,from-chunk.timestamp,to-from,s.rate)}}
  }
  if(state.cancelled)return null;return ctx.startRendering();
 }
 return{supportsVideo:mediaScene,sequence,hasExportSource,missingSource,segments,inspectVideo,releaseMedia,render};
})();
if(typeof module!=='undefined')module.exports=SceneAudio;

