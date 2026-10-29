'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),{pathToFileURL}=require('node:url');
const {chromium}=require('C:/Users/kbs31/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'..'),out=path.join(root,'analysis/site-audit/social-scene/service-icons');
const expected={kakao:'kakaotalk-app.jpg',discord:'discord-brand.svg',x:'x-brand.svg',instagram:'instagram-app.jpg',youtube:'youtube-brand.svg',facebook:'facebook-brand.svg',google:'google-favicon.png',naver:'naver-app.jpg',phone:'phone-app.svg?v=20261029-2'};
async function check(frame){
 await frame.waitForFunction(()=>[...document.querySelectorAll('.template-icon.has-logo img')].every(image=>image.complete&&image.naturalWidth>0));
 for(const [brand,file] of Object.entries(expected)){
  const icon=frame.locator('.template-icon.'+brand);assert.equal(await icon.locator('img').getAttribute('src'),'assets/'+file);assert.equal(await icon.innerText(),'');assert.equal(await icon.locator('svg').count(),0);
  const shape=await icon.evaluate(node=>{const box=node.getBoundingClientRect(),image=node.querySelector('img'),inner=image.getBoundingClientRect();return{width:box.width,height:box.height,offsetX:Math.abs(inner.x+inner.width/2-box.x-box.width/2),offsetY:Math.abs(inner.y+inner.height/2-box.y-box.height/2),filter:getComputedStyle(image).filter}});
  assert.equal(shape.width,26,brand+' holder width');assert.equal(shape.height,26,brand+' holder height');assert(shape.offsetX<.6&&shape.offsetY<.6,brand+' centered');if(brand!=='discord')assert.equal(shape.filter,'none',brand+' original colors');
  const branch=frame.locator('.library-brand[data-brand="'+brand+'"]');if(!await branch.evaluate(node=>node.open))await branch.locator('summary').click();
  const button=branch.locator('[data-template]').first(),id=await button.getAttribute('data-template');await button.click();assert.equal(await frame.evaluate(()=>project.type),id,brand+' menu click');
 }
}
(async()=>{fs.mkdirSync(out,{recursive:true});const browser=await chromium.launch({channel:'msedge',headless:true,args:['--mute-audio']});try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}}),errors=[];page.on('pageerror',error=>errors.push(error.message));page.on('dialog',dialog=>dialog.accept());
 await page.goto(pathToFileURL(path.join(root,'index.html')).href+'#project-social-scene');await page.waitForFunction(()=>document.querySelector('#project-social-scene').dataset.editorReady==='true');
 const frame=page.frames().find(item=>item.url().includes('/social-scene/app/index.html'));
 for(const theme of ['light','dark']){await page.evaluate(theme=>document.documentElement.dataset.theme=theme,theme);await frame.waitForFunction(theme=>document.documentElement.dataset.portfolioTheme===theme,theme);await check(frame);await frame.evaluate(()=>{document.querySelectorAll('.library-brand').forEach(branch=>branch.open=false);document.querySelector('.library').scrollTop=0});await frame.locator('.library').screenshot({path:path.join(out,'services-'+theme+'.png')});}
 await page.setViewportSize({width:390,height:844});await check(frame);assert(await frame.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await frame.locator('.library').screenshot({path:path.join(out,'services-mobile.png')});
 const native=await browser.newPage({viewport:{width:1440,height:1000}});native.on('pageerror',error=>errors.push(error.message));native.on('dialog',dialog=>dialog.accept());await native.goto(pathToFileURL('E:/AI/social-templates/index.html').href);await native.waitForFunction(()=>document.querySelector('.template-icon.kakao img')?.naturalWidth>0);await check(native);
 assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'result.json'),JSON.stringify({pass:true,brands:Object.keys(expected),themes:['light','dark'],mobile:390,standalone:true,errors},null,2));console.log('PASS 9 sidebar icons: local assets, original colors, centered 26px holders; menu clicks; embedded light/dark/mobile; standalone.');
 }finally{await browser.close()}})().catch(error=>{console.error(error.stack?.slice(0,2000)||error);process.exitCode=1});
