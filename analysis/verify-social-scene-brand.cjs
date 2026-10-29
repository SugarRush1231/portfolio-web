'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{pathToFileURL}=require('node:url');
const {chromium}=require('C:/Users/kbs31/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'..'),out=path.join(__dirname,'site-audit/social-scene/brand');
(async()=>{
 fs.mkdirSync(out,{recursive:true});
 const approved=fs.readFileSync(path.join(__dirname,'social-scene-icons-v3/frame-ink.svg'),'utf8').trim(),icon=fs.readFileSync(path.join(root,'assets/social-scene/icon.svg'),'utf8').trim();assert.equal(icon,approved);
 for(const file of [path.join(root,'assets/social-scene/app/assets/favicon.svg'),'E:/AI/social-templates/assets/favicon.svg'])assert.equal(fs.readFileSync(file,'utf8').trim(),icon);
 const parentHtml=fs.readFileSync(path.join(root,'index.html'),'utf8'),head=parentHtml.split('</head>')[0];assert(head.includes('ico/favicon-32x32.png')&&head.includes('ico/favicon-16x16.png'));assert(!head.includes('social-scene/icon.svg'));
 const browser=await chromium.launch({channel:'msedge',headless:true,args:['--mute-audio']});try{
  const context=await browser.newContext({viewport:{width:1547,height:1000}}),page=await context.newPage(),errors=[];
  context.on('page',tab=>{tab.on('pageerror',error=>errors.push(error.message));tab.on('dialog',dialog=>dialog.accept())});page.on('pageerror',error=>errors.push(error.message));page.on('dialog',dialog=>dialog.accept());
  await page.goto(pathToFileURL(path.join(root,'index.html')).href+'#project-social-scene');await page.waitForFunction(()=>document.querySelector('#project-social-scene').dataset.editorReady==='true');
  await page.waitForFunction(()=>document.querySelector('.social-scene-mark img').naturalWidth>0);assert((await page.locator('.social-scene-mark img').getAttribute('src')).includes('social-scene/icon.svg'));
  const thumbnail=page.locator('a.work-preview[href="#project-social-scene"] img');assert((await thumbnail.getAttribute('src')).includes('20261029-frame-ink'));
  for(const theme of ['light','dark']){await page.evaluate(theme=>document.documentElement.dataset.theme=theme,theme);await page.locator('.social-scene-intro').screenshot({path:path.join(out,'detail-'+theme+'.png')});}
  const frame=page.frameLocator('#social-scene-frame');await frame.locator('#messages textarea').first().fill('아이콘 변경 후 창 전환 확인');const opened=page.waitForEvent('popup');await page.locator('#social-scene-popout').click();const popup=await opened;await popup.waitForFunction(()=>document.querySelector('#messages textarea')?.value==='아이콘 변경 후 창 전환 확인');
  assert((await popup.locator('link[rel="icon"]').getAttribute('href')).startsWith('assets/favicon.svg?v='));assert(await page.locator('#social-scene-detached').isVisible());await popup.close();await page.waitForFunction(()=>!document.querySelector('#social-scene-frame').hidden);assert.equal(await frame.locator('#messages textarea').first().inputValue(),'아이콘 변경 후 창 전환 확인');
  const native=await context.newPage();await native.goto(pathToFileURL('E:/AI/social-templates/index.html').href);await native.waitForFunction(()=>document.querySelector('.brand-symbol img')?.naturalWidth>0);await native.locator('.brand').screenshot({path:path.join(out,'editor-brand.png')});assert.equal(await native.locator('.brand-symbol svg').count(),0);assert((await native.locator('link[rel="icon"]').getAttribute('href')).startsWith('assets/favicon.svg?v='));
  await native.goto(pathToFileURL(path.join(root,'assets/social-scene/thumbnail.svg')).href);await native.locator('svg').first().screenshot({path:path.join(out,'main-thumbnail.png')});
  await page.setViewportSize({width:390,height:844});assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.locator('.social-scene-intro').screenshot({path:path.join(out,'detail-mobile.png')});
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'result.json'),JSON.stringify({pass:true,approvedIcon:true,mainThumbnail:true,detailThemes:['light','dark'],nativeHeader:true,popoutFavicon:true,parentFaviconPreserved:true,popoutEditPreserved:true,mobileWidth:390,errors},null,2));console.log('PASS approved frame/ink: card, detail, native header, popout favicon; parent favicon preserved; popup editing and mobile layout.');
 }finally{await browser.close()}
})().catch(error=>{console.error(error.stack?.slice(0,2200)||error);process.exitCode=1});
