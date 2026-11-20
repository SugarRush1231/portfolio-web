 'use strict';
const CallAudio=(()=>{
 const maxFileBytes=100*1024*1024,maxDuration=600;
 const supported=p=>p.type==='phone-call'||p.type==='discord-dm';
 function key(p){return p.ringtoneKind==='custom'?'custom':p.ringtoneKind&&p.ringtoneKind!=='auto'?p.ringtoneKind:p.type==='discord-dm'?(p.props.callMode==='outgoing'||p.props.callMode==='none'?'discord-outgoing':'discord'):p.device==='android'?'galaxy':'iphone-reflection'}
 function hasSource(p){return supported(p)&&p.ringtoneEnabled!==false&&(key(p)!=='custom'||Boolean(p.ringtoneData))&&(p.type==='phone-call'||p.props.callMode!=='none'||p.actions.some(e=>e.action==='call-start'&&e.value))}
 function validate(p){const out={ringtoneEnabled:true,ringtoneKind:'auto',ringtoneData:'',ringtoneName:''};
  if(p.ringtoneEnabled!==undefined){if(typeof p.ringtoneEnabled!=='boolean')throw Error('벨소리 설정이 올바르지 않습니다.');out.ringtoneEnabled=p.ringtoneEnabled}
  if(p.ringtoneKind!==undefined){if(!['auto','iphone-reflection','iphone','galaxy','discord','custom'].includes(p.ringtoneKind))throw Error('벨소리 종류가 올바르지 않습니다.');out.ringtoneKind=p.ringtoneKind}
  if(p.ringtoneData!==undefined){if(typeof p.ringtoneData!=='string'||p.ringtoneData.length>Math.ceil(maxFileBytes/3)*4+100||(p.ringtoneData&&!/^data:(audio\/(mpeg|mp3|mp4|m4a|x-m4a|wav|x-wav|ogg|webm|aac|flac|x-flac)|video\/mp4);base64,[A-Za-z0-9+/=]+$/.test(p.ringtoneData)))throw Error('벨소리는 100MB 이하 오디오 또는 MP4 파일을 사용해 주세요.');if(p.ringtoneData){const payload=p.ringtoneData.slice(p.ringtoneData.indexOf(',')+1),bytes=payload.length*3/4-(payload.endsWith('==')?2:payload.endsWith('=')?1:0);if(bytes>maxFileBytes)throw Error('벨소리 파일은 100MB 이하로 선택해 주세요.');}out.ringtoneData=p.ringtoneData}
  if(p.ringtoneName!==undefined){if(typeof p.ringtoneName!=='string'||p.ringtoneName.length>300)throw Error('벨소리 파일명이 올바르지 않습니다.');out.ringtoneName=p.ringtoneName}return out;
 }
 function intervals(p){
  let state=p.type==='phone-call'||p.props.callMode!=='none'?'ringing':'idle',active=state==='ringing',start=0;const out=[];
  for(const e of (p.actions||[]).map((e,i)=>({...e,i})).sort((a,b)=>a.at-b.at||a.i-b.i)){
   if(e.at>p.duration||!['call-start','call-answer','call-end'].includes(e.action))continue;
   state=e.action==='call-start'?(e.value?'ringing':'idle'):e.action==='call-answer'?(e.value?'active':'ringing'):(e.value?'ended':'active');const next=state==='ringing';if(next===active)continue;
   if(active&&e.at>start)out.push({from:start,to:e.at});active=next;start=e.at;
  }if(active&&start<p.duration)out.push({from:start,to:p.duration});return out;
 }
 const buffers=new Map();let statusOwner=null;let context,node,gain,desired,started='',loading=null,lastTime=0;
 function stop(){if(node){node.stop();node.disconnect();node=null}started=''}
 function data(p){return key(p)==='custom'?p.ringtoneData:SCENE_CALL_SOUNDS[key(p)]}
 async function buffer(p,ctx){const source=data(p);if(!source)throw Error('벨소리 파일을 선택해 주세요.');if(!buffers.has(source)){const task=fetch(source).then(r=>r.arrayBuffer()).then(b=>ctx.decodeAudioData(b)).then(audio=>{if(audio.duration>maxDuration)throw Error('벨소리는 10분 이하 파일을 선택해 주세요.');return audio});buffers.set(source,task);task.catch(()=>buffers.delete(source))}return buffers.get(source)}
 function sync(p,t,running){desired={p,t,running};if(!running||!hasSource(p)||p.previewMuted||p.previewVolume===0){stop();return}
  const range=intervals(p).find(x=>t>=x.from&&t<x.to);if(!range){stop();return}
  context??=new AudioContext();if(context.state==='suspended')context.resume().catch(()=>{});if(!gain){gain=context.createGain();gain.connect(context.destination)}gain.gain.value=p.previewVolume;
  const id=key(p)+'|'+range.from+'|'+p.speed;
  if(node&&started===id&&Math.abs(t-lastTime)<.35){lastTime=t;return}stop();lastTime=t;
  if(loading)return;const requested=data(p);loading=buffer(p,context).then(b=>{loading=null;if(!desired.running||desired.p!==p||!hasSource(p)||p.previewMuted)return;if(data(p)!==requested){sync(desired.p,desired.t,desired.running);return}const current=intervals(p).find(x=>desired.t>=x.from&&desired.t<x.to);if(!current)return;node=context.createBufferSource();node.buffer=b;node.loop=true;node.playbackRate.value=p.speed;node.connect(gain);node.start(0,(desired.t-current.from)%b.duration);started=key(p)+'|'+current.from+'|'+p.speed;lastTime=desired.t}).catch(()=>{loading=null;stop();if(typeof tell==='function')tell('벨소리를 읽지 못했습니다. MP3 / WAV 또는 AAC 소리가 있는 MP4를 선택해 주세요.')});
 }
 async function render(p,ctx,destination){if(!hasSource(p))return;const b=await buffer(p,ctx);
  for(const range of intervals(p)){const length=(range.to-range.from)/p.speed;if(length<=0)continue;const source=ctx.createBufferSource(),volume=ctx.createGain();source.buffer=b;source.loop=true;source.playbackRate.value=p.speed;volume.gain.value=1;const at=range.from/p.speed;volume.gain.setValueAtTime(0,at);volume.gain.linearRampToValueAtTime(1,at+.005);volume.gain.setValueAtTime(1,Math.max(at+.005,at+length-.008));volume.gain.linearRampToValueAtTime(0,at+length);source.connect(volume);volume.connect(destination);source.start(at);source.stop(at+length)}
 }
 function renderEditor(){if(statusOwner!==project){$('ringtone-upload-status').textContent='';$('ringtone-upload-status').classList.remove('is-error');statusOwner=project}const box=$('call-sound-fields');box.hidden=!supported(project);if(box.hidden)return;
  $('ringtone-enabled').checked=project.ringtoneEnabled;$('ringtone-kind').value=project.ringtoneKind;$('ringtone-name').textContent=(key(project)==='custom'?project.ringtoneName:'')||({'iphone-reflection':'iPhone · Reflection (기본)',iphone:'iPhone · Opening',galaxy:'Galaxy · Over the Horizon 2026',discord:'Discord · 수신음','discord-outgoing':'Discord · 발신음',custom:'음원 파일을 선택하세요.'}[key(project)]);$('ringtone-custom').hidden=project.ringtoneKind!=='custom';
 }
 function init(){
  $('ringtone-enabled').onchange=()=>{project.ringtoneEnabled=$('ringtone-enabled').checked;dirty.add(project.type);applyPreviewAudio()};
  $('ringtone-kind').onchange=()=>{pausePreview();project.ringtoneKind=$('ringtone-kind').value;dirty.add(project.type);renderEditor();applyPreviewAudio()};
  $('ringtone-file').onchange=async()=>{const input=$('ringtone-file'),file=input.files[0];input.value='';if(!file)return;pausePreview();const p=project,status=$('ringtone-upload-status');status.textContent='소리를 확인하고 있어요…';status.classList.remove('is-error');input.disabled=true;try{if(file.size>maxFileBytes)throw Error('벨소리는 100MB 이하로 선택해 주세요.');let source=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=()=>reject(Error('파일을 읽지 못했습니다. 다시 선택해 주세요.'));reader.readAsDataURL(file)});if(/\.mp4$/i.test(file.name))source=source.replace(/^data:[^;]*;/,'data:video/mp4;');const next=validate({...p,ringtoneData:source,ringtoneName:file.name,ringtoneKind:'custom'}),ctx=new AudioContext();try{await buffer(next,ctx)}catch(error){if(error.message.includes('10분'))throw error;throw Error('파일에서 소리를 읽지 못했습니다. MP4에는 AAC 오디오 트랙이 있어야 합니다. 다른 MP3 / WAV / M4A 파일도 사용할 수 있습니다.')}finally{await ctx.close()}buffers.delete(p.ringtoneData);Object.assign(p,next);dirty.add(p.type);if(project===p){renderEditor();applyPreviewAudio();status.textContent='소리 적용 완료 · '+file.name+(/\.mp4$/i.test(file.name)?' · 영상 화면은 표시하지 않습니다.':'');tell('벨소리를 적용했어요. 미리보기와 저장 영상에 소리만 사용합니다.')}}catch(error){if(project===p){status.textContent=error.message||'파일을 읽을 수 없습니다.';status.classList.add('is-error');tell(status.textContent)}}finally{input.disabled=false}};
 }
 return{maxFileBytes,maxDuration,supported,key,hasSource,validate,intervals,buffer,sync,render,renderEditor,init};
})();
if(typeof module!=='undefined')module.exports=CallAudio;
