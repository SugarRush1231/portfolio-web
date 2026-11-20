
'use strict';
function storedZip(entries){
 const encoder=new TextEncoder(),parts=[],central=[];let offset=0;
 const table=Array.from({length:256},(_,n)=>{let c=n;for(let k=0;k<8;k++)c=(c&1)?0xedb88320^(c>>>1):c>>>1;return c>>>0});
 const crc=bytes=>{let c=0xffffffff;for(const b of bytes)c=table[(c^b)&255]^(c>>>8);return(c^0xffffffff)>>>0};
 for(const entry of entries){
  const name=encoder.encode(entry.name),data=entry.bytes,checksum=crc(data),header=new Uint8Array(30+name.length),h=new DataView(header.buffer);h.setUint32(0,0x04034b50,true);h.setUint16(4,20,true);h.setUint16(6,0x800,true);h.setUint32(14,checksum,true);h.setUint32(18,data.length,true);h.setUint32(22,data.length,true);h.setUint16(26,name.length,true);header.set(name,30);parts.push(header,data);
  const record=new Uint8Array(46+name.length),r=new DataView(record.buffer);r.setUint32(0,0x02014b50,true);r.setUint16(4,20,true);r.setUint16(6,20,true);r.setUint16(8,0x800,true);r.setUint32(16,checksum,true);r.setUint32(20,data.length,true);r.setUint32(24,data.length,true);r.setUint16(28,name.length,true);r.setUint32(42,offset,true);record.set(name,46);central.push(record);offset+=header.length+data.length;
 }
 const size=central.reduce((sum,x)=>sum+x.length,0),end=new Uint8Array(22),view=new DataView(end.buffer);view.setUint32(0,0x06054b50,true);view.setUint16(8,entries.length,true);view.setUint16(10,entries.length,true);view.setUint32(12,size,true);view.setUint32(16,offset,true);return new Blob([...parts,...central,end],{type:'application/zip'});
}
async function exportVoiceSequence(){
 pausePreview();const state={cancelled:false};recording=state;ExportFeedback.open('투명 PNG 시퀀스를 준비하고 있어요','투명 PNG 시퀀스 · 30fps · 원본 영상 위에 합성할 수 있습니다.');
 try{
  await document.fonts.ready;await brandReady;const p=structuredClone(project);if(p.type==='discord-voice')p.props.background='transparent';let bytes=0;const count=sceneExportFrames(p),frames=[],surface=document.createElement('canvas');
  for(let frame=0;frame<count;frame++){
   if(state.cancelled){tell('내보내기를 취소했어요.');return}
   time=frame/SceneTiming.frameRate*p.speed;await renderOutputFrame(surface,p,time,{...brandAssets,...assets},false);
   const blob=await new Promise(resolve=>surface.toBlob(resolve,'image/png'));if(!blob)throw new Error('투명 프레임 생성에 실패했습니다.');bytes+=blob.size;if(bytes>512*1024*1024)throw Error('투명 시퀀스가 512MB를 넘었습니다. 장면 길이를 나누어 저장하세요.');frames.push({name:'frames/frame_'+String(frame+1).padStart(6,'0')+'.png',bytes:new Uint8Array(await blob.arrayBuffer())});
   $('export-progress').value=(frame+1)/count;if(frame%3===0)await new Promise(resolve=>setTimeout(resolve,0));
  }
  const text=(p.type==='kakao-overlay'?'KakaoTalk transparent conversation overlay':'Discord voice overlay')+'\n30 fps\n'+count+' frames\nImport frames/frame_000001.png as an image sequence in Premiere / After Effects / Resolve.\nAudio is not included. Composite over the original video.\n';
  frames.push({name:'README.txt',bytes:new TextEncoder().encode(text)});downloadScene(storedZip(frames),(p.type==='kakao-overlay'?'kakao-overlay':'discord-voice')+'-transparent-30fps.zip');tell('투명 PNG 시퀀스를 저장했어요. 30fps 이미지 시퀀스로 불러오세요.');
 }catch(error){tell(error.message||'시퀀스를 만들지 못했습니다.')}
 finally{releaseOutputFrame();recording=null;ExportFeedback.close();draw()}
}
if(typeof module!=='undefined')module.exports={storedZip};
