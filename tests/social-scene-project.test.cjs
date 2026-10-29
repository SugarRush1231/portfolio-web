'use strict';
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');

function setup(fileMode=false,remembered={}){
 const listeners={},observations=[],sent=[],timers=[];
 const panel={hidden:true,dataset:{}},frame={dataset:{src:'assets/social-scene/app/index.html?embed=portfolio'},contentWindow:{postMessage:(data,origin)=>sent.push({data,origin})},addEventListener(){}};
 const button=()=>({hidden:false,disabled:true,addEventListener(){}});
 const elements={'project-social-scene':panel,'social-scene-frame':frame,'social-scene-loading':{hidden:false},'social-scene-status':{textContent:''},'social-scene-edit':button(),'social-scene-popout':button(),'social-scene-return':button(),'social-scene-retry':button(),'social-scene-detached':{hidden:true},'social-scene-run-note':{hidden:true,scrollIntoView(){}}};
 const html={dataset:{theme:'dark'}};
 const sessionStorage={getItem:key=>remembered[key]||null,setItem:(key,value)=>remembered[key]=value,removeItem:key=>delete remembered[key]};
 const context={URL,setTimeout:callback=>{timers.push(callback);return timers.length},clearTimeout(){},clearInterval(){},location:{protocol:fileMode?'file:':'https:',origin:fileMode?'file://':'https://portfolio.example'},document:{documentElement:html,baseURI:fileMode?'file:///E:/AI/portfolio-web/index.html':'https://portfolio.example/index.html',hidden:false,getElementById:id=>elements[id],addEventListener(){}},window:{addEventListener:(name,handler)=>listeners[name]=handler},IntersectionObserver:class{constructor(callback){this.callback=callback}observe(){context.intersect=this.callback}},MutationObserver:class{constructor(callback){this.callback=callback}observe(target){observations.push({target,callback:this.callback})}}};
 context.sessionStorage=sessionStorage;context.location.pathname='/index.html';context.window.crypto={getRandomValues:array=>array.fill(42)};context.setInterval=()=>1;
 vm.runInNewContext(fs.readFileSync(path.join(root,'social-scene-project.js'),'utf8'),context);
 return{context,elements,panel,frame,sent,html,timers,change:target=>observations.find(x=>x.target===target).callback(),message:(source,origin,type,value,token)=>listeners.message({source,origin,data:{channel:'portfolio-social-scene-v1',type,value,token}})};
}

test('a refreshed parent accepts only its saved popout token and reconnects that window',()=>{
 const remembered={'portfolio-social-scene:/index.html:workspace':'saved-workspace','portfolio-social-scene:/index.html:popout':'saved-token'},h=setup(false,remembered),received=[];
 const popup={closed:false,postMessage:data=>received.push(data)};
 h.message(popup,'https://portfolio.example','reconnect',true,'wrong-token');assert.equal(received.length,0);
 h.message(popup,'https://other.example','reconnect',true,'saved-token');assert.equal(received.length,0);
 h.message(popup,'https://portfolio.example','reconnect',true,'saved-token');assert.equal(received.at(-1).type,'snapshot-request');assert.equal(h.frame.inert,true);assert.equal(h.frame.hidden,true);
 h.panel.hidden=false;h.change(h.panel);assert.equal(new URL(h.frame.src).searchParams.get('workspace'),'saved-workspace');
});

test('file opening sends to its own iframe with a wildcard and accepts serialized null origin only from that frame',()=>{
 const h=setup(true);h.panel.hidden=false;h.change(h.panel);assert.equal(h.sent.at(-1).origin,'*');
 h.message({},'null','ready',true);h.message(h.frame.contentWindow,'https://other.example','ready',true);assert.equal(h.panel.dataset.editorReady,undefined);
 h.message(h.frame.contentWindow,'null','ready',true);assert.equal(h.panel.dataset.editorReady,'true');assert.equal(h.elements['social-scene-loading'].hidden,true);
});

test('a missing ready signal ends the spinner and exposes retry',()=>{
 const h=setup();h.panel.hidden=false;h.change(h.panel);h.timers[0]();assert.equal(h.elements['social-scene-loading'].hidden,true);assert.equal(h.elements['social-scene-retry'].hidden,false);
});

test('Social Scene loads once when opened and pauses without replacing its document',()=>{
 const h=setup();assert.equal(h.frame.src,undefined);
 h.panel.hidden=false;h.change(h.panel);
 assert.equal(new URL(h.frame.src).pathname,'/assets/social-scene/app/index.html');
 assert.equal(new URL(h.frame.src).searchParams.get('portfolio-theme'),'dark');
 h.context.intersect([{isIntersecting:true}]);
 assert.equal(h.sent.at(-1).data.value,true);
 const loaded=h.frame.src;h.panel.hidden=true;h.change(h.panel);
 assert.equal(h.sent.at(-1).data.value,false);assert.equal(h.frame.src,loaded);
 h.html.dataset.theme='light';h.change(h.html);
 assert.equal(h.sent.at(-2).data.value,'light');
 h.panel.hidden=false;h.change(h.panel);assert.equal(h.frame.src,loaded);
});

test('only messages from the embedded editor at the same origin update status',()=>{
 const h=setup(),origin='https://portfolio.example';
 h.message({},origin,'ready',true);h.message(h.frame.contentWindow,'https://other.example','ready',true);
 assert.equal(h.panel.dataset.editorReady,undefined);
 h.message(h.frame.contentWindow,origin,'ready',true);assert.equal(h.panel.dataset.editorReady,'true');assert.equal(h.elements['social-scene-loading'].hidden,true);
 h.message(h.frame.contentWindow,origin,'status','x'.repeat(500));assert.equal(h.elements['social-scene-status'].textContent.length,240);
 h.message(h.frame.contentWindow,origin,'error','출력 작업 실패');assert.equal(h.panel.dataset.editorReady,'true');assert.equal(h.elements['social-scene-status'].textContent,'출력 작업 실패');
 const failed=setup();failed.message(failed.frame.contentWindow,origin,'error','불러오기 실패');assert.equal(failed.panel.dataset.editorReady,'error');
});

test('project embeds actual downloads without a standalone-tab link or eager load',()=>{
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8'),tag=html.match(/<iframe id="social-scene-frame"[^>]+>/)?.[0];
 assert(tag);assert.match(tag,/sandbox="allow-scripts allow-same-origin allow-downloads"/);assert.match(tag,/data-src="assets\/social-scene\/app\/index\.html/);assert.doesNotMatch(tag,/\ssrc=/);
 const article=html.match(/<article[^>]*id="project-social-scene"[\s\S]*?<\/article>/)?.[0];assert(article);assert.doesNotMatch(article,/target="_blank"|127\.0\.0\.1|localhost/);
});
