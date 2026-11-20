const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),{once}=require('node:events'),{spawn}=require('node:child_process');
const {chromium}=require('C:/Users/kbs31/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'../..'), out=path.join(__dirname,'out');
const args=process.argv.slice(2), mode=args[0]||'probe';
const fps=30, frames=24*fps, samples=mode==='full'?2:1;
const mime={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.otf':'font/otf','.wav':'audio/wav'};
async function main(){
 fs.mkdirSync(out,{recursive:true});
 const server=http.createServer((req,res)=>{const file=path.resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);return res.end();}res.setHeader('Content-Type',mime[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);});
 server.listen(0,'127.0.0.1');await once(server,'listening');
 const browser=await chromium.launch({channel:'msedge',headless:true,args:['--hide-scrollbars']});
 let encoder,encoderError='';
 try{
  const page=await browser.newPage({viewport:{width:1080,height:1920},deviceScaleFactor:1});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:'+server.address().port+'/analysis/mmt-reel/index.html?render',{waitUntil:'load'});
  await page.waitForFunction(()=>window.READY||window.BUILD_ERROR,{timeout:30000});
  const failure=await page.evaluate(()=>window.BUILD_ERROR);if(failure)throw Error(failure);
  const stage=page.locator('#stage');
  async function seek(t){await page.evaluate(t=>window.seek(t),t);await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));}
  fs.writeFileSync(path.join(out,'cues.json'),JSON.stringify(await page.evaluate(()=>window.CUES),null,2));
  if(mode==='probe'){
   const times=[0,.65,1.3,2.5,3.6,5.2,7.8,9.6,11.8,13.5,15.8,17.4,19.4,20.6,22.5,23.8];
   for(let i=0;i<times.length;i++){await seek(times[i]);await stage.screenshot({path:path.join(out,`probe-${String(i).padStart(2,'0')}.png`)});}
   await seek(5.2);const a=await stage.screenshot();await seek(17.4);await seek(5.2);const b=await stage.screenshot();
   if(!a.equals(b))throw Error('Frame depends on seek history');
   console.log('16 keyframes and out-of-order deterministic-frame check passed.');
  }else{
   const video=path.join(out,'mmt-portfolio-silent.mp4');
   const matrix='scale=in_color_matrix=bt601:out_color_matrix=bt709:in_range=pc:out_range=tv,format=yuv420p';
   const filter=samples===2?"tmix=frames=2:weights='1 1',select='eq(mod(n\\,2)\\,1)',setpts=N/(30*TB),"+matrix:matrix;
   encoder=spawn('ffmpeg',['-hide_banner','-loglevel','error','-y','-f','image2pipe','-vcodec','mjpeg','-framerate',String(fps*samples),'-i','pipe:0','-vf',filter,'-r',String(fps),'-frames:v',String(frames),'-c:v','libx264','-preset','fast','-crf','17','-threads','4','-pix_fmt','yuv420p','-color_primaries','bt709','-color_trc','bt709','-colorspace','bt709','-movflags','+faststart',video],{windowsHide:true,stdio:['pipe','ignore','pipe']});
   const ended=once(encoder,'close');encoder.stderr.on('data',d=>encoderError+=d);
   encoder.stdin.on('error',()=>{});
   for(let f=0;f<frames;f++){
    for(let s=0;s<samples;s++){
     await seek(Math.max(0,Math.min(24-1/fps,f/fps+(s-(samples-1)/2)/(fps*samples))));
     const image=await stage.screenshot({type:'jpeg',quality:96});
     if(!encoder.stdin.write(image))await once(encoder.stdin,'drain');
    }
    if(f%60===0)console.log(`Rendered ${f}/${frames} frames`);
   }
   encoder.stdin.end();const [code]=await ended;if(code!==0)throw Error(encoderError);
   console.log('Silent master:',video);
  }
  if(errors.length)throw Error(errors.join('\n'));
 }finally{
  if(encoder&&!encoder.stdin.destroyed)encoder.stdin.destroy();
  await browser.close();server.closeAllConnections();await new Promise(resolve=>server.close(resolve));
 }
}
main().catch(e=>{console.error(e);process.exitCode=1;});
