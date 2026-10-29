'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const source='E:/AI/social-templates',version='20261029-naver-profile';
function replace(file,before,after){const full=path.join(source,file),text=fs.readFileSync(full,'utf8'),newline=text.includes('\r\n')?'\r\n':'\n';before=before.replace(/\r?\n/g,newline);after=after.replace(/\r?\n/g,newline);if(text.includes(after))return;assert(text.includes(before),'Expected source in '+file);fs.writeFileSync(full,text.replace(before,after));}
replace('index.html','<fieldset id="naver-account-fields" hidden><legend>네이버 사용자 메뉴</legend>', '<fieldset id="naver-account-fields" hidden><legend>네이버 사용자 메뉴</legend><div id="naver-avatar-controls"></div>');
replace('editor.js',"  $('naver-account-fields').hidden=project.type!=='naver-search';", "  $('naver-account-fields').hidden=project.type!=='naver-search';\n  const avatarControls=$('change-avatar').closest('.asset-row');\n  if(project.type==='naver-search')$('naver-avatar-controls').appendChild(avatarControls);\n  else $('profile-fields').querySelector('legend').after(avatarControls);");
replace('editor.js',"  else if(hit.action==='new-query'&&project.type==='google-ai')", "  else if(hit.action==='naver-account-photo')$('avatar-file').click();\n  else if(hit.action==='new-query'&&project.type==='google-ai')");
replace('editor.js',"    const element = await loadSceneAsset(data, video);", "    const element = await loadSceneAsset(data, video);\n    if(avatar&&id==='naver-search')await SearchUI.ready({avatar:data});");
const entry=path.join(source,'index.html');fs.writeFileSync(entry,fs.readFileSync(entry,'utf8').replace(/((?:src|href)="[\w./-]+)\?v=[^"&]+/g,'$1?v='+version));
console.log('Naver account uses existing profile upload/remove controls; panel camera opens the same upload.');
