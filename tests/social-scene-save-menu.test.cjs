'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),{sceneSaveFormats}=require('../assets/social-scene/save-menu.js');
test('normal scenes offer PNG and MP4 while alpha overlays also offer MOV and PNG sequence',()=>{
 assert.deepEqual(sceneSaveFormats('instagram-feed').map(item=>item.id),['png','mp4']);
 for(const type of ['discord-voice','kakao-overlay'])assert.deepEqual(sceneSaveFormats(type).map(item=>item.id),['png','mov','sequence','mp4']);
 assert.equal(sceneSaveFormats('kakao-overlay').find(item=>item.id==='mp4').note,'마젠타 배경 · 크로마키 합성용');
 assert.equal(sceneSaveFormats('discord-voice').find(item=>item.id==='mp4').note,'배경 포함');
});
