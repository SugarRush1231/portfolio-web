'use strict';
const {saveScene}=require('./social-scene-save-helper.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url'),{execFileSync}=require('node:child_process');
const {chromium}=require('C:/Users/kbs31/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'..'),out=path.join(root,'analysis/site-audit/social-scene/navigation');
(async()=>{fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({channel:'msedge',headless:true,args:['--mute-audio']});try{
 const page=await browser.newPage({viewport:{width:1440,height:1050},acceptDownloads:true}),errors=[],samples=[],exports=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
 await page.goto(pathToFileURL(path.join(root,'index.html')).href+'#project-social-scene');await page.waitForFunction(()=>document.querySelector('#project-social-scene').dataset.editorReady==='true');const child=page.frames().find(f=>f.url().includes('/social-scene/app/index.html')),frame=page.frameLocator('#social-scene-frame');
 const ids=await child.evaluate(()=>SOCIAL_SCENES.map(s=>s.id));let states=0;
 for(const id of ids){await child.evaluate(id=>switchScene(id),id);await frame.locator('#tab-screen').click();if(id==='kakao-overlay'){assert.equal(await frame.locator('#iphone-navigation-field').isVisible(),false);assert.equal(await frame.locator('#android-navigation-field').isVisible(),false);continue}for(const device of ['iphone','android']){
  await frame.locator('#device').selectOption(device,{timeout:5000}).catch(async error=>{console.log(JSON.stringify({id,device,tab:await child.evaluate(()=>document.querySelector('.inspector-tabs [aria-selected=true]')?.id),deviceHidden:await child.evaluate(()=>({field:document.querySelector('#device-fields').hidden,panel:document.querySelector('#panel-screen').hidden}))}));throw error});const field=device==='iphone'?'iphone-navigation':'android-navigation',options=device==='iphone'?['gesture','none']:['gesture','buttons','none'];
  assert(await frame.locator('#'+field+'-field').isVisible());assert.equal(await frame.locator('#'+(device==='iphone'?'android':'iphone')+'-navigation-field').isVisible(),false);
  for(const option of options){await frame.locator('#'+field).selectOption(option);assert.equal(await child.evaluate(device=>project[device==='iphone'?'iphoneNavigation':'androidNavigation'],device),option);if(option==='none')assert.equal(await frame.locator('#phone-preview .ph-home-indicator,#phone-preview .ph-android-navigation').count(),0,id+' '+device);states++}
 }}
 console.log('PASS '+states+' template/device/navigation states and per-device controls');
 for(const id of ['kakao-chat','phone-call','google-search'])for(const device of ['iphone','android']){
  await child.evaluate(id=>switchScene(id),id);await frame.locator('#tab-screen').click();await frame.locator('#device').selectOption(device);
  const result=await child.evaluate(async device=>{
   const key=device==='iphone'?'iphoneNavigation':'androidNavigation',output=document.createElement('canvas'),sceneAssets={...brandAssets,...assets};
   project[key]='gesture';renderEditor();await renderOutputFrame(output,structuredClone(project),project.duration,sceneAssets);const shown=output.getContext('2d').getImageData(0,0,output.width,output.height),on=output.toDataURL('image/png');
   project[key]='none';renderEditor();await renderOutputFrame(output,structuredClone(project),project.duration,sceneAssets);const hidden=output.getContext('2d').getImageData(0,0,output.width,output.height),off=output.toDataURL('image/png');
   let changed=0,left=output.width,top=output.height,right=0,bottom=0;
   for(let y=Math.floor(output.height*.9);y<output.height;y++)for(let x=Math.floor(output.width*.25);x<output.width*.75;x++){const i=(y*output.width+x)*4;if(Math.max(...[0,1,2].map(c=>Math.abs(shown.data[i+c]-hidden.data[i+c])))>20){changed++;left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y)}}
   const reference=[];if(changed)for(let y=top;y<=bottom;y++)for(let x=left;x<=right;x++){const i=(y*output.width+x)*4;reference.push(hidden.data[i],hidden.data[i+1],hidden.data[i+2])}
   releaseOutputFrame();return{changed,width:output.width,height:output.height,rect:{left,top,right,bottom},reference,on,off};
  },device);
  assert(result.changed>100,id+' '+device+' output must visibly remove the bar');
  for(const [name,data]of [['shown',result.on],['hidden',result.off]])fs.writeFileSync(path.join(out,id+'-'+device+'-'+name+'.png'),Buffer.from(data.split(',')[1],'base64'));
  samples.push({id,device,changedPixels:result.changed,rect:result.rect});
  if(id==='kakao-chat'){
   await frame.locator('#tab-motion').click();await frame.locator('#motion').selectOption('still');await frame.locator('#duration').fill('2');
   let download=page.waitForEvent('download');await frame.locator('#save-project').click();const jsonFile=path.join(out,device+'.json');await(await download).saveAs(jsonFile);const saved=JSON.parse(fs.readFileSync(jsonFile,'utf8'));assert.equal(saved[device==='iphone'?'iphoneNavigation':'androidNavigation'],'none');
   await child.evaluate(device=>{project[device==='iphone'?'iphoneNavigation':'androidNavigation']='gesture';renderEditor()},device);await frame.locator('#project-file').setInputFiles(jsonFile);await child.waitForFunction(device=>project[device==='iphone'?'iphoneNavigation':'androidNavigation']==='none',device);
   download=page.waitForEvent('download',{timeout:90000});await saveScene(frame,'mp4');const video=path.join(out,device+'-hidden.mp4');await(await download).saveAs(video);await frame.locator('#export-dialog').waitFor({state:'hidden'});
   const rgb=execFileSync('ffmpeg',['-v','error','-i',video,'-frames:v','1','-f','rawvideo','-pix_fmt','rgb24','pipe:1'],{maxBuffer:12*1024*1024});let difference=0,index=0;for(let y=result.rect.top;y<=result.rect.bottom;y++)for(let x=result.rect.left;x<=result.rect.right;x++)for(let c=0;c<3;c++)difference+=Math.abs(rgb[(y*result.width+x)*3+c]-result.reference[index++]);const mean=difference/index;assert(mean<12,device+' video must match bar-hidden PNG; error '+mean);exports.push({device,meanPixelError:mean});
  }
 }
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'result.json'),JSON.stringify({pass:true,states,samples,exports,errors},null,2));console.log('PASS visible/hidden PNG differences in chat, call and search on both devices; actual JSON roundtrips and MP4 pixels contain no hidden bar');
 }finally{await browser.close()}})().catch(e=>{console.error(e.stack?.slice(0,3000)||e);process.exitCode=1});
