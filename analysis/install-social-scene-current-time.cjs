'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const source='E:/AI/social-templates',version='20261029-current-time';
function replace(file,before,after){const full=path.join(source,file),text=fs.readFileSync(full,'utf8'),newline=text.includes('\r\n')?'\r\n':'\n';before=before.replace(/\r?\n/g,newline);after=after.replace(/\r?\n/g,newline);if(text.includes(after))return;assert(text.includes(before),'Expected source in '+file);fs.writeFileSync(full,text.replace(before,after));}
replace('scene.js',"  const chat = id.endsWith('chat') || id.endsWith('dm') || SCENE_CHAT_MODELS.native(id);", "  const now = new Date();\n  const chat = id.endsWith('chat') || id.endsWith('dm') || SCENE_CHAT_MODELS.native(id);");
replace('scene.js',"ratio: search ? 'landscape' : 'portrait', clock: '9:41',", "ratio: search ? 'landscape' : 'portrait', clock: now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0'),");
replace('scene.test.cjs',"  assert.equal(chat.date, '2031년 1월 2일 목요일');", "  assert.equal(chat.date, '2031년 1월 2일 목요일');\n  assert.equal(chat.clock, '12:00');");
replace('scene.test.cjs',"  assert.equal(newScene('kakao-chat').clock, '9:41');", "  for (const scene of SOCIAL_SCENES) assert.equal(newScene(scene.id).clock, '18:45');");
replace('chat-clock.test.cjs',"const p=newScene('kakao-chat');p.messages[0].time='오후 1:24';", "const p=newScene('kakao-chat');p.clock='9:41';p.messages[0].time='오후 1:24';");
const entry=path.join(source,'index.html');fs.writeFileSync(entry,fs.readFileSync(entry,'utf8').replace(/((?:src|href)="[\w./-]+)\?v=[^"&]+/g,'$1?v='+version));
console.log('New scene clocks use current local time; saved and manually edited clocks remain unchanged.');
