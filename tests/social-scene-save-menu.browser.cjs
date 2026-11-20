'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http'),{once}=require('node:events'),{execFileSync}=require('node:child_process');
const {chromium}=require('C:/Users/kbs31/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const {saveScene}=require('./social-scene-save-helper.cjs'),{sceneSaveFormats}=require('../assets/social-scene/save-menu.js');
const root=path.resolve(__dirname,'..'),out=path.join(root,'analysis/site-audit/social-scene/save-menu');
async function main(){
 fs.mkdirSync(out,{recursive:true});const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.wasm':'application/wasm','.svg':'image/svg+xml','.woff2':'font/woff2','.ttf':'font/ttf'};
 const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);return res.end()}res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res)});
 server.listen(0,'127.0.0.1');await once(server,'listening');let browser;
 try{
  browser=await chromium.launch({channel:'msedge',headless:true,args:['--mute-audio']});const page=await browser.newPage({viewport:{width:1547,height:1000},acceptDownloads:true}),errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());
  await page.goto('http://127.0.0.1:'+server.address().port+'/index.html#project-social-scene');await page.waitForFunction(()=>document.querySelector('#project-social-scene').dataset.editorReady==='true');
  const frame=page.frameLocator('#social-scene-frame'),child=page.frames().find(f=>f.url().includes('/social-scene/app/index.html'));
  const templates=await child.evaluate(()=>SOCIAL_SCENES.map(scene=>scene.id));
  for(const type of templates){
   await child.evaluate(type=>switchScene(type),type);await frame.locator('#save-output').click();
   assert.deepEqual(await frame.locator('[data-save-format]').evaluateAll(nodes=>nodes.map(n=>n.dataset.saveFormat)),sceneSaveFormats(type).map(format=>format.id));
   if(type==='kakao-overlay')assert(await frame.locator('#overlay-format').isHidden());
   if(type==='discord-voice')assert(await frame.locator('[data-film-prop="exportFormat"]').isHidden());
   await frame.locator('[data-save-format="png"]').press('Escape');
  }
  await child.evaluate(()=>switchScene('kakao-overlay'));await frame.locator('#tab-motion').click();await frame.locator('#motion').selectOption('still');await frame.locator('#duration').fill('2');
  for(const theme of ['light','dark']){await page.evaluate(theme=>document.documentElement.dataset.theme=theme,theme);await child.waitForFunction(theme=>document.documentElement.dataset.portfolioTheme===theme,theme);await frame.locator('#save-output').click();assert((await frame.locator('.scene-save-note').innerText()).includes('MP4에는 마젠타'));await frame.locator('#scene-save-menu').screenshot({path:path.join(out,'menu-'+theme+'.png')});await page.waitForFunction(()=>{const f=document.querySelector('#social-scene-frame'),m=f.contentDocument.querySelector('#scene-save-menu'),a=f.getBoundingClientRect(),b=m.getBoundingClientRect();return a.top+b.top>=100&&a.top+b.bottom<=innerHeight-12});await page.screenshot({path:path.join(out,'context-'+theme+'.png')});const a=await frame.locator('#save-output').boundingBox(),b=await frame.locator('#scene-save-menu').boundingBox(),x=Math.max(0,Math.min(a.x,b.x)-12),y=Math.max(0,a.y-12);await page.screenshot({path:path.join(out,'save-control-'+theme+'.png'),clip:{x,y,width:Math.min(1547-x,Math.max(a.x+a.width,b.x+b.width)-x+12),height:Math.min(1000-y,b.y+b.height-y+12)}});await frame.locator('[data-save-format="png"]').press('Escape')}
  const pending=page.waitForEvent('download',{timeout:90000});await saveScene(frame,'mp4');const download=await pending,movie=path.join(out,'kakao-magenta.mp4');await download.saveAs(movie);await frame.locator('#export-dialog').waitFor({state:'hidden'});
  const rgb=execFileSync('ffmpeg',['-v','error','-i',movie,'-frames:v','1','-vf','crop=2:2:0:0','-f','rawvideo','-pix_fmt','rgb24','pipe:1']);const pixel=[...rgb.subarray(0,3)];assert(pixel[0]>230&&pixel[1]<20&&pixel[2]>230,'MP4 corner must be magenta: '+pixel.join(','));
  execFileSync('ffmpeg',['-v','error','-y','-i',movie,'-frames:v','1',path.join(out,'kakao-magenta-frame.png')]);
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'result.json'),JSON.stringify({pass:true,templates:templates.length,magentaRGB:pixel,actualMP4:true,errors},null,2));console.log('PASS Save menu for '+templates.length+' templates, hidden duplicate controls, light/dark and actual magenta MP4: '+pixel.join(','));
 }finally{if(browser)await browser.close();server.closeAllConnections();server.close()}
}
main().catch(e=>{console.error(e.stack?.slice(0,2200)||e);process.exitCode=1});
