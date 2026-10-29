'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const app=path.resolve(__dirname,'../assets/social-scene/app'),{newScene,validateScene}=require(path.join(app,'scene.js')),{sceneSystemHome}=require(path.join(app,'native-icons.js'));
test('both device navigation options survive JSON while older projects keep visible gesture bars',()=>{
 for(const device of ['android','iphone'])for(const navigation of device==='android'?['gesture','buttons','none']:['gesture','none']){
  const p=newScene('kakao-chat');p.device=device;p[device==='android'?'androidNavigation':'iphoneNavigation']=navigation;
  const restored=validateScene(JSON.parse(JSON.stringify(p)));assert.equal(restored[device==='android'?'androidNavigation':'iphoneNavigation'],navigation);
 }
 const old=newScene('kakao-chat');delete old.iphoneNavigation;assert.equal(validateScene(old).iphoneNavigation,'gesture');
 for(const key of ['androidNavigation','iphoneNavigation'])assert.throws(()=>validateScene({...newScene('kakao-chat'),[key]:'invalid'}));
});
test('DOM navigation uses each device option independently',()=>{
 assert.equal(sceneSystemHome({device:'android',androidNavigation:'none',iphoneNavigation:'gesture'}),'');
 assert.equal(sceneSystemHome({device:'iphone',androidNavigation:'gesture',iphoneNavigation:'none'}),'');
 assert.match(sceneSystemHome({device:'iphone',androidNavigation:'none',iphoneNavigation:'gesture'}),/ph-home-indicator/);
 assert.match(sceneSystemHome({device:'android',androidNavigation:'buttons',iphoneNavigation:'none'}),/ph-android-navigation/);
});
test('canvas search output also omits the hidden system bar',()=>{
 const context={module:{exports:{}}};vm.runInNewContext(fs.readFileSync(path.join(app,'native-icons.js'),'utf8'),context);
 let calls=0;const ctx=new Proxy({},{get:()=>()=>{calls++},set:()=>true});
 context.scenePaintSystemHome(ctx,{device:'iphone',iphoneNavigation:'none'},432,768,'black');
 context.scenePaintSystemHome(ctx,{device:'android',androidNavigation:'none'},432,768,'black');assert.equal(calls,0);
 context.scenePaintSystemHome(ctx,{device:'iphone',iphoneNavigation:'gesture'},432,768,'black');assert(calls>0);
});
