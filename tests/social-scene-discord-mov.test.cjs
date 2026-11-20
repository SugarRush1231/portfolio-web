'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
const app=path.resolve(__dirname,'../assets/social-scene/app'),{newScene,validateScene}=require(path.join(app,'scene.js')),{transparentMovArguments,transparentMovScene}=require(path.join(app,'mov-export.js')),audio=require(path.join(app,'scene-audio.js'));
test('Discord MOV forces alpha in its snapshot and keeps preview choices untouched',()=>{
 const p=newScene('discord-voice');p.props.background='dark';p.props.exportFormat='mov';
 const result=transparentMovScene(p);assert.equal(result.filename,'discord-voice-transparent.mov');assert.equal(result.snapshot.props.background,'transparent');assert.equal(p.props.background,'dark');assert.notEqual(result.snapshot.voices,p.voices);
 const restored=validateScene(JSON.parse(JSON.stringify(p)));assert.equal(restored.props.exportFormat,'mov');
 const a={voices:[{buffer:{duration:2}}]};assert.equal(audio.hasExportSource(p,a),false);assert.equal(audio.missingSource(p,a),false);
 p.props.exportFormat='mp4';assert.equal(audio.hasExportSource(p,a),true);
});
test('the shared MOV encoder keeps Kakao naming, ProRes alpha and silent overlay output',()=>{
 assert.equal(transparentMovScene(newScene('kakao-overlay')).filename,'kakao-overlay-transparent.mov');
 const args=transparentMovArguments(60);assert(args.includes('prores_ks'));assert.equal(args[args.indexOf('-profile:v')+1],'4');assert(args.includes('yuva444p10le'));assert(args.includes('-an'));
 assert.throws(()=>transparentMovScene(newScene('instagram-feed')));
});
