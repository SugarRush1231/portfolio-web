'use strict';
const fs=require('node:fs'),path=require('node:path'),source='E:/AI/social-templates';
const edits={
 'film-models.js':[["options:{sequence:'투명 PNG 시퀀스 · ZIP',mp4:'MP4 · 배경 포함'}","options:{mov:'투명 MOV · ProRes 4444',sequence:'투명 PNG 시퀀스 · ZIP',mp4:'MP4 · 배경 포함'}"]],
 'editor.js':[["if(project.type==='kakao-overlay'&&project.overlayFormat==='mov'){await TransparentMov.exportScene();return;}","if(project.type==='kakao-overlay'&&project.overlayFormat==='mov'||project.type==='discord-voice'&&project.props.exportFormat==='mov'){await TransparentMov.exportScene();return;}"]],
 'scene-audio.js':[["function sequence(p){return p.type==='discord-voice'&&p.props.exportFormat==='sequence'}","function sequence(p){return p.type==='discord-voice'&&['sequence','mov'].includes(p.props.exportFormat)}"]],
 'film-editor.js':[
  ["const text=project.type==='kakao-overlay'&&project.overlayFormat==='mov'?'투명 MOV 내보내기'","const text=(project.type==='kakao-overlay'&&project.overlayFormat==='mov'||project.type==='discord-voice'&&project.props.exportFormat==='mov')?'투명 MOV 내보내기'"],
  ["const label=document.createElement('label');label.textContent=descriptor.label;","const label=document.createElement('label');label.textContent=descriptor.label;\n   const movHint=descriptor.key==='exportFormat'&&p.type==='discord-voice'?document.createElement('small'):null;\n   const updateMovHint=()=>{if(!movHint)return;movHint.hidden=p.props.exportFormat!=='mov';movHint.textContent='배경 선택과 관계없이 투명 · 30fps · 무음으로 저장합니다.'+(location.protocol==='file:'?' MOV는 파일 직접 열기 대신 웹 주소에서 저장해 주세요.':'')};"],
  ["set(p,descriptor.key,next);dirty.add(p.type);draw();updateExportLabel();applyPreviewAudio();","set(p,descriptor.key,next);dirty.add(p.type);draw();updateExportLabel();applyPreviewAudio();updateMovHint();"],
  ["label.append(control);return label;","label.append(control);if(movHint){movHint.id='voice-mov-note';movHint.className='hint';label.append(movHint);updateMovHint()}return label;"],
 ],
 'mov-export.js':[
  ["const TransparentMov=(()=>{","function transparentMovScene(project){\n if(!['kakao-overlay','discord-voice'].includes(project.type))throw Error('이 화면은 투명 MOV 출력을 지원하지 않습니다.');\n const snapshot=structuredClone(project);\n if(snapshot.type==='discord-voice')snapshot.props.background='transparent';\n return{snapshot,filename:snapshot.type==='discord-voice'?'discord-voice-transparent.mov':'kakao-overlay-transparent.mov'};\n}\nconst TransparentMov=(()=>{"],
  ["  try{\n   await new Promise(resolve=>requestAnimationFrame(()=>setTimeout(resolve,0)));","  try{\n   const {snapshot,filename}=transparentMovScene(project),sceneAssets={...brandAssets,...assets};\n   await new Promise(resolve=>requestAnimationFrame(()=>setTimeout(resolve,0)));"],
  ["const snapshot=structuredClone(project),sceneAssets={...brandAssets,...assets},count=sceneExportFrames(snapshot),surface=document.createElement('canvas');let bytes=0;","const count=sceneExportFrames(snapshot),surface=document.createElement('canvas');let bytes=0;"],
  ["downloadScene(new Blob([data],{type:'video/quicktime'}),'kakao-overlay-transparent.mov');","downloadScene(new Blob([data],{type:'video/quicktime'}),filename);"],
  ["module.exports={transparentMovArguments};","module.exports={transparentMovArguments,transparentMovScene};"],
 ],
};
const prepared=Object.entries(edits).map(([name,replacements])=>{const file=path.join(source,name),original=fs.readFileSync(file,'utf8'),crlf=original.includes('\r\n');let text=original.replace(/\r\n/g,'\n');for(const [before,after]of replacements){if(text.split(before).length!==2)throw Error('Expected one source match: '+name+' '+before.slice(0,65));text=text.replace(before,after)}return[file,crlf?text.replace(/\n/g,'\r\n'):text]});
for(const [file,text]of prepared)fs.writeFileSync(file,text);
console.log('Added Discord transparent MOV using the existing encoder in '+prepared.length+' source files.');
