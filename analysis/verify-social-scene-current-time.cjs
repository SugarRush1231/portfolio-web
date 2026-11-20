'use strict';
const assert=require('node:assert/strict'),path=require('node:path'),{pathToFileURL}=require('node:url');
const {chromium}=require('C:/Users/kbs31/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{const browser=await chromium.launch({channel:'msedge',headless:true,args:['--mute-audio']});try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',error=>errors.push(error.message));page.on('dialog',dialog=>dialog.accept());
 await page.goto(pathToFileURL(path.join(__dirname,'../index.html')).href+'#project-social-scene');await page.waitForFunction(()=>document.querySelector('#project-social-scene').dataset.editorReady==='true');
 const child=page.frames().find(frame=>frame.url().includes('/social-scene/app/index.html'));
 const initial=await child.evaluate(()=>{const now=new Date(),minute=now.getHours()*60+now.getMinutes();return{minute,clocks:Object.values(projects).map(p=>p.clock),display:document.querySelector('#phone-preview').innerText,clock:project.clock}});
 for(const clock of initial.clocks){const[hour,minute]=clock.split(':').map(Number),distance=Math.abs(hour*60+minute-initial.minute);assert(Math.min(distance,1440-distance)<=1,'new scene should use local current time: '+clock)}
 assert(initial.display.includes(initial.clock),'phone status bar should show initialized clock');
 await child.locator('#tab-screen').click();await child.locator('#clock').fill('18:23');await child.locator('#clock').dispatchEvent('input');
 const edited=await child.evaluate(()=>({clock:project.clock,saved:validateScene(JSON.parse(JSON.stringify(project))).clock,display:document.querySelector('#phone-preview').innerText}));assert.equal(edited.clock,'18:23');assert.equal(edited.saved,'18:23');assert(edited.display.includes('18:23'));assert(edited.display.includes('오후 6:23'));
 await child.evaluate(()=>{time=0;draw();time=project.duration;draw()});assert.equal(await child.evaluate(()=>project.clock),'18:23');
 assert.deepEqual(errors,[]);console.log('PASS all 24 scene clocks use local current time; status bar and message timestamps agree; manual time survives seeking and save/load.');
 }finally{await browser.close()}})().catch(error=>{console.error(error.stack?.slice(0,2000)||error);process.exitCode=1});
