'use strict';
const fs=require('node:fs'),path=require('node:path');
const source='E:/AI/social-templates';
const edits={
 'scene.js':[
  ["androidNavigation:'gesture',logoStyle:","androidNavigation:'gesture',iphoneNavigation:'gesture',logoStyle:"],
  ["['androidNavigation',['gesture','buttons']]","['androidNavigation',['gesture','buttons','none']],['iphoneNavigation',['gesture','none']]"],
 ],
 'editor.js':[
  ["'android-navigation':'androidNavigation','logo-style'","'android-navigation':'androidNavigation','iphone-navigation':'iphoneNavigation','logo-style'"],
  ["$('device-fields').hidden=false;$('android-navigation-field').hidden=project.device!=='android'||project.type==='kakao-overlay';","$('device-fields').hidden=false;$('android-navigation-field').hidden=project.device!=='android'||project.type==='kakao-overlay';$('iphone-navigation-field').hidden=project.device!=='iphone'||project.type==='kakao-overlay';"],
  ["'desktop-browser','android-navigation','theme'","'desktop-browser','android-navigation','iphone-navigation','theme'"],
 ],
 'index.html':[
  ['<label id="android-navigation-field">Android 하단 탐색<select id="android-navigation"><option value="gesture">제스처 바</option><option value="buttons">3버튼</option></select></label>','<label id="android-navigation-field">Galaxy 하단 탐색<select id="android-navigation"><option value="gesture">제스처 바</option><option value="buttons">3버튼</option><option value="none">표시 안 함</option></select></label><label id="iphone-navigation-field" hidden>iPhone 제스처 바<select id="iphone-navigation"><option value="gesture">표시</option><option value="none">표시 안 함</option></select></label>'],
 ],
 'native-icons.js':[
  ["function sceneSystemHome(p){\n","function sceneSystemHome(p){\n if((p.device==='android'?p.androidNavigation:p.iphoneNavigation)==='none')return '';\n"],
  ["function scenePaintSystemHome(ctx,p,width,height,color){\n","function scenePaintSystemHome(ctx,p,width,height,color){\n if((p.device==='android'?p.androidNavigation:p.iphoneNavigation)==='none')return;\n"],
 ],
 'phone.js':[
  ['const home=()=>sceneSystemHome({device,androidNavigation:navigation});','const home=()=>sceneSystemHome({device,androidNavigation:navigation,iphoneNavigation:navigation});'],
  ["navigation=p.androidNavigation||'gesture';","navigation=(device==='android'?p.androidNavigation:p.iphoneNavigation)||'gesture';"],
 ],
};
const prepared=Object.entries(edits).map(([name,replacements])=>{const file=path.join(source,name),original=fs.readFileSync(file,'utf8'),crlf=original.includes('\r\n');let text=original.replace(/\r\n/g,'\n');for(const [before,after]of replacements){if(text.split(before).length!==2)throw Error('Expected one source match: '+name+' '+before.slice(0,70));text=text.replace(before,after)}return[file,crlf?text.replace(/\n/g,'\r\n'):text]});
for(const [file,text]of prepared)fs.writeFileSync(file,text);
console.log('Updated navigation model, validation, controls, DOM and canvas renderers in '+prepared.length+' Social Scene source files.');
