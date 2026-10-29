'use strict';
const {saveScene}=require('./social-scene-save-helper.cjs');
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http'),{once}=require('node:events'),{pathToFileURL}=require('node:url');
const {chromium}=require('C:/Users/kbs31/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'..'),out=path.join(root,'analysis/site-audit/social-scene/popout');
async function main(){
 fs.mkdirSync(out,{recursive:true});
 const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2','.ttf':'font/ttf','.wasm':'application/wasm'};
 const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);return res.end()}res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res)});
 server.listen(0,'127.0.0.1');await once(server,'listening');let browser;
 try{
  browser=await chromium.launch({channel:'msedge',headless:true,args:['--mute-audio']});
  for(const mode of ['file','http']){
   const context=await browser.newContext({viewport:{width:1547,height:910},acceptDownloads:true}),page=await context.newPage(),errors=[];
   context.on('page',p=>{p.on('pageerror',e=>errors.push(e.message));p.on('dialog',d=>d.accept())});page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
   const url=(mode==='file'?pathToFileURL(path.join(root,'index.html')).href:'http://127.0.0.1:'+server.address().port+'/index.html')+'#project-social-scene';
   await page.goto(url);await page.waitForFunction(()=>document.querySelector('#project-social-scene').dataset.editorReady==='true',null,{timeout:30000});assert(await page.locator('#social-scene-loading').isHidden());
   let embedded=page.frames().find(f=>f.url().includes('/social-scene/app/index.html'));const frame=page.frameLocator('#social-scene-frame');
   await frame.locator('#messages textarea').first().fill('창을 키우기 전 편집 내용');
   const avatar='data:image/png;base64,'+fs.readFileSync(path.join(root,'assets/social-scene/app/assets/google-favicon.png')).toString('base64');
   await embedded.evaluate(async avatar=>{projects['instagram-feed'].body='다른 템플릿의 내용도 유지';project.avatar=avatar;assets.avatar=await loadSceneAsset(project.avatar);draw()},avatar);
   const originalHeight=(await page.locator('.social-scene-frame-wrap').boundingBox()).height;
   let opened=page.waitForEvent('popup');await page.locator('#social-scene-popout').click();let popup=await opened;await popup.waitForFunction(()=>document.querySelector('#messages textarea')?.value==='창을 키우기 전 편집 내용',null,{timeout:30000}).catch(async error=>{console.log(JSON.stringify({mode,status:await page.locator('#social-scene-status').textContent(),popup:await popup.evaluate(()=>({embed:document.documentElement.dataset.portfolioEmbed,popout:document.documentElement.dataset.portfolioPopout,status:document.querySelector('#status')?.textContent,editor:typeof project==='undefined'?'undefined':project.type})),errors}));throw error});
   assert(!popup.url().includes('#project-'));assert.equal(await popup.locator('.nav-link').count(),0);assert.equal(await popup.evaluate(()=>projects['instagram-feed'].body),'다른 템플릿의 내용도 유지');assert.equal(await popup.evaluate(()=>project.avatar),avatar);assert(await popup.evaluate(()=>assets.avatar.naturalWidth>0));assert(await page.locator('#social-scene-detached').isVisible());
   assert(await page.locator('#social-scene-frame').isHidden());assert.equal((await page.locator('.social-scene-frame-wrap').boundingBox()).height,originalHeight);await page.locator('#social-scene-editor').screenshot({path:path.join(out,mode+'-original-detached.png')});
   for(const width of [390,1547]){await page.setViewportSize({width,height:910});assert.equal((await page.locator('.social-scene-frame-wrap').boundingBox()).height,await page.locator('#social-scene-frame').evaluate(n=>parseFloat(getComputedStyle(n).height)))}
   await popup.locator('#messages textarea').first().fill('큰 편집 창에서 바꾼 내용');
   let downloaded=popup.waitForEvent('download');await popup.locator('#save-project').click();await(await downloaded).saveAs(path.join(out,mode+'-project.json'));assert.equal(JSON.parse(fs.readFileSync(path.join(out,mode+'-project.json'),'utf8')).messages[0].text,'큰 편집 창에서 바꾼 내용');
   await popup.locator('#save-output').click({trial:true});downloaded=popup.waitForEvent('download');await saveScene(popup,'png');await(await downloaded).saveAs(path.join(out,mode+'.png'));
   await popup.screenshot({path:path.join(out,mode+'-editor.png')});
   const closed=popup.waitForEvent('close');await page.locator('#social-scene-return').click();await closed;await page.waitForFunction(()=>!document.querySelector('#social-scene-frame').inert);assert.equal(await frame.locator('#messages textarea').first().inputValue(),'큰 편집 창에서 바꾼 내용');
   assert(await page.locator('#social-scene-frame').isVisible());
   opened=page.waitForEvent('popup');await page.locator('#social-scene-popout').click();popup=await opened;await popup.waitForFunction(()=>document.querySelector('#messages textarea')?.value==='큰 편집 창에서 바꾼 내용');await popup.locator('#messages textarea').first().fill('창 닫기로 돌아온 내용');await popup.close({runBeforeUnload:true});await page.waitForFunction(()=>!document.querySelector('#social-scene-frame').inert);assert.equal(await frame.locator('#messages textarea').first().inputValue(),'창 닫기로 돌아온 내용');
   assert(await page.locator('#social-scene-frame').isVisible());
   opened=page.waitForEvent('popup');await page.locator('#social-scene-popout').click();popup=await opened;await popup.waitForFunction(()=>document.querySelector('#messages textarea')?.value==='창 닫기로 돌아온 내용');
   await popup.locator('#messages textarea').first().fill('부모 새로고침 전 작업');await popup.waitForFunction(()=>document.documentElement.dataset.recoveryState==='saved');
   await page.reload();await page.waitForFunction(()=>document.querySelector('#project-social-scene').dataset.editorReady==='true'&&document.querySelector('#social-scene-frame').inert);assert(await page.locator('#social-scene-detached').isVisible());
   await popup.reload();await popup.waitForFunction(()=>typeof project!=='undefined'&&project.messages[0].text==='부모 새로고침 전 작업');
   await popup.locator('#messages textarea').first().fill('부모 새로고침 후 마지막 글자');await popup.evaluate(()=>{time=2.25;document.getElementById('tab-motion').click();dirty.add(project.type);draw()});
   await popup.close({runBeforeUnload:true});await page.waitForFunction(()=>!document.querySelector('#social-scene-frame').inert);embedded=page.frames().find(f=>f.url().includes('/social-scene/app/index.html'));
   assert.equal(await embedded.evaluate(()=>project.messages[0].text),'부모 새로고침 후 마지막 글자');assert.equal(await embedded.evaluate(()=>time),2.25);assert.equal(await frame.locator('#tab-motion').getAttribute('aria-selected'),'true');
   await embedded.waitForFunction(()=>document.documentElement.dataset.recoveryState==='saved');await page.reload();await page.waitForFunction(()=>document.querySelector('#project-social-scene').dataset.editorReady==='true');embedded=page.frames().find(f=>f.url().includes('/social-scene/app/index.html'));
   assert.equal(await embedded.evaluate(()=>project.messages[0].text),'부모 새로고침 후 마지막 글자');assert.equal(await embedded.evaluate(()=>projects['instagram-feed'].body),'다른 템플릿의 내용도 유지');assert.equal(await embedded.evaluate(()=>project.avatar),avatar);assert(await embedded.evaluate(()=>assets.avatar.naturalWidth>0));assert.equal(await embedded.evaluate(()=>time),2.25);
   opened=page.waitForEvent('popup');await page.locator('#social-scene-popout').click();popup=await opened;await popup.waitForFunction(()=>typeof project!=='undefined'&&project.messages[0].text==='부모 새로고침 후 마지막 글자');await popup.locator('#tab-content').click();await popup.locator('#messages textarea').first().fill('동시에 새로고침하고 닫아도 유지');
   const reloading=page.reload({waitUntil:'domcontentloaded'});await popup.close({runBeforeUnload:true});await reloading;await page.waitForFunction(()=>document.querySelector('#project-social-scene').dataset.editorReady==='true'&&!document.querySelector('#social-scene-frame').inert);embedded=page.frames().find(f=>f.url().includes('/social-scene/app/index.html'));assert.equal(await embedded.evaluate(()=>project.messages[0].text),'동시에 새로고침하고 닫아도 유지');
   await page.evaluate(()=>document.documentElement.dataset.theme='dark');await embedded.waitForFunction(()=>document.documentElement.dataset.portfolioTheme==='dark');
   if(mode==='file'){await frame.locator('#tab-motion').click();await frame.locator('#duration').fill('2');downloaded=page.waitForEvent('download',{timeout:90000});await saveScene(frame,'mp4');await(await downloaded).saveAs(path.join(out,'file.mp4'));await frame.locator('#export-dialog').waitFor({state:'hidden'})}
   await page.locator('#social-scene-editor').screenshot({path:path.join(out,mode+'-returned.png')});assert.deepEqual(errors,[]);await context.close();console.log('PASS '+mode+': editor appears, popup restores all scenes and media, actual JSON/PNG export, return button and window close retain edits');
  }
    fs.writeFileSync(path.join(out,'result.json'),JSON.stringify({pass:true,modes:['file','http'],fileExports:['JSON','PNG','MP4'],popupState:true,windowClose:true,keepsWorkspaceHeight:true,parentReloadRecovery:true,simultaneousReloadAndClose:true},null,2));
 }finally{if(browser)await browser.close();server.closeAllConnections();server.close()}
}
main().catch(e=>{console.error(e.stack?.slice(0,3000)||e);process.exitCode=1});
