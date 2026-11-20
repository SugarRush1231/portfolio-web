// Deterministic frame engine; camera and critically damped motion informed by the sources in references/SOURCES.md.
(() => {
  'use strict';
  const $ = id => document.getElementById(id), W=1080, H=1920, T=24, B=60/120.19;
  const stage=$('stage'), panel=$('panel'), frames=[...document.querySelectorAll('iframe')], layers=[...document.querySelectorAll('.native-layer')];
  const clamp=x=>Math.min(1,Math.max(0,x)), lerp=(a,b,u)=>a+(b-a)*u;
  const ease=u=>{u=clamp(u);return u*u*(3-2*u);};
  const p=(t,a,d=.65)=>ease((t-a)/d);
  // Closed-form critically damped response: any frame can be evaluated without playback history.
  const spring=(t,w=14)=>t<=0?0:1-Math.exp(-w*t)*(1+w*t);
  function opacity(el,a){el.style.opacity=clamp(a);el.style.visibility=a>.001?'visible':'hidden';}
  function transform(el,x,y,s=1,r=0){el.style.transform=`translate3d(${x}px,${y}px,0) scale(${s}) rotate(${r}deg)`;}
  function color(a,b,u){return '#'+[1,3,5].map(i=>Math.round(lerp(parseInt(a.slice(i,i+2),16),parseInt(b.slice(i,i+2),16),u)).toString(16).padStart(2,'0')).join('');}
  const beats=n=>n*B;
  const S=[beats(6),beats(14),beats(22),beats(30),beats(38)];
  const shots=[
    {at:S[0],end:S[1],layer:0,kicker:'VIDEO DOWNLOAD',title:'보고 있던 영상에서\n바로 다운로드.',sub:'흰 원형 위젯으로 이어지는 작업.',label:'영상 다운로드',feature:'현재 브라우저 영상 감지',a:[620,235,.84],b:[740,150,1.52]},
    {at:S[1],end:S[2],layer:1,kicker:'MEDIA CONVERSION',title:'편집을 위한\n호환부터.',sub:'Pr / AE 코덱 문제 해결',label:'출력 규격',feature:'H.264 + AAC · MP4',a:[645,180,1.12],b:[660,340,1.54]},
    {at:S[2],end:S[3],layer:2,kicker:'AI SUBTITLES',title:'음성을 듣고,\n자막으로.',sub:'로컬 음성 인식 · Whisper',label:'자막 생성',feature:'Whisper → SRT',a:[742,230,1.62],b:[510,388,1.38]},
    {at:S[3],end:S[4],layer:2,kicker:'AI TRANSLATION',title:'자막을 넘어,\n다른 언어로.',sub:'음성 인식과 번역을 한 흐름 안에서.',label:'AI 번역',feature:'자막 생성 · 언어 선택',a:[510,230,1.65],b:[510,230,1.75]}
  ];
  const positions=[[.2,850,1420],[S[0]+.9,815,1240],[S[0]+1.65,815,1240],[S[1]+1.4,680,1250],[S[2]+1.1,665,1050],[S[2]+2.35,440,1290],[S[3]+1.05,528,1070],[S[3]+2.1,610,1070]];
  function cursorPosition(t){let a=positions[0];for(let i=1;i<positions.length;i++){const b=positions[i];if(t<=b[0]){const u=p(t,a[0],b[0]-a[0]);return [lerp(a[1],b[1],u),lerp(a[2],b[2],u)];}a=b;}return a.slice(1);}
  const clicks=[S[0]+1.65,S[1]+1.4,S[2]+2.35,S[3]+1.05];
  let nativeDocs=[],bass=[];
  const wave=$('wave');
  for(let i=0;i<44;i++){const bar=document.createElementNS('http://www.w3.org/2000/svg','rect');bar.setAttribute('x',i*20.5);bar.setAttribute('width',8);bar.setAttribute('rx',4);wave.append(bar);}
  window.VIDEO={w:W,h:H,duration:T,fps:30};
  window.CUES={beat:B,sceneStarts:[0,...S],clicks};
  window.seek=function(time){
    const t=Math.max(0,Math.min(T,time));
    const end=p(t,S[4],.9);
    const subtitleNight=p(t,S[2]-.15,.6)*(1-p(t,S[3]-.2,.6));
    const night=Math.max(p(t,S[4]+.35,.8),subtitleNight);
    stage.style.background=color('#edf1f3','#102b3f',night);
    stage.style.color=color('#172d3e','#f2f5f7',night);
    $('brand').style.color=stage.style.color; $('film-footer').style.color=stage.style.color;
    opacity($('opening'),1-p(t,2.12,.6));
    document.querySelectorAll('.word-mask span').forEach((el,i)=>{
      const u=spring(t-i*.48+.2,14), exit=p(t,2.12+i*.035,.6);
      transform(el,0,(1-u)*158-exit*155,1,0);
    });
    opacity(document.querySelector('.intro-caption'),p(t,1.2,.5));
    const marks=[[-225,-100,0],[225,-40,.12],[170,225,.24]];
    [...$('file-marks').children].forEach((el,i)=>{const u=spring(t-.55-i*.1,12);transform(el,540+marks[i][0]-45,1120+marks[i][1]+(1-u)*50,1,i===0?-9:i===1?8:-5);opacity(el,u*(1-p(t,2.1+marks[i][2],.45)));});
    let x=360,y=985,w=360,h=420,r=32;
    const open=p(t,2.08,.85);
    x=lerp(x,80,open);y=lerp(y,730,open);w=lerp(w,920,open);h=lerp(h,710,open);r=lerp(r,26,open);
    const codecFrame=p(t,S[1]-.15,.6),subtitleFrame=p(t,S[2]-.15,.6),translateFrame=p(t,S[3]-.15,.6);
    y+=codecFrame*70-subtitleFrame*70;
    h-=codecFrame*160+subtitleFrame*20+translateFrame*200;
    x=lerp(x,402,end);y=lerp(y,626,end);w=lerp(w,276,end);h=lerp(h,276,end);r=lerp(r,60,end);
    panel.style.width=w+'px';panel.style.height=h+'px';panel.style.borderRadius=r+'px';
    transform(panel,x,y,1,lerp(-5,0,open));
    opacity($('file-face'),1-p(t,2.17,.5));
    opacity($('original-icon'),end);
    opacity($('ui-port'),open*(1-p(t,S[4],.5)));
    opacity($('file-marks'),1-p(t,2.45,.3));
    let shot=shots[0];for(const q of shots)if(t>=q.at)shot=q;
    const within=t>=S[0]&&t<S[4];
    const incoming=p(t,shot.at,.38), leaving=p(t,shot.end-.22,.22);
    opacity($('headline'),within?incoming*(1-leaving):0);
    transform($('headline'),0,(1-incoming)*40-leaving*32);
    $('eyebrow').textContent=shot.kicker;$('headline-text').textContent=shot.title;$('subline').textContent=shot.sub;
    $('eyebrow').style.color=color('#077bbd','#67c6f5',night);$('subline').style.color=color('#536a79','#a7c1d2',night);
    opacity($('feature'),within&&shot.layer!==2?incoming*(1-leaving):within&&shot.at===S[2]?incoming*(1-leaving):0);
    transform($('feature'),0,(1-incoming)*24);
    $('feature-label').textContent=shot.label;$('feature-text').textContent=shot.feature;
    const shotIndex=shots.indexOf(shot),previousShot=shots[shotIndex-1];
    const uiHandoff=p(t,shot.at,.35),differentPage=previousShot&&previousShot.layer!==shot.layer;
    layers.forEach((layer,i)=>{opacity(layer,i===shot.layer?(differentPage?uiHandoff:1):differentPage&&i===previousShot.layer&&uiHandoff<1?1:0);});
    const camera=p(t,shot.at+.35,2.6);
    let cx=lerp(shot.a[0],shot.b[0],camera),cy=lerp(shot.a[1],shot.b[1],camera);
    let zoom=Math.exp(lerp(Math.log(shot.a[2]),Math.log(shot.b[2]),camera));
    const nativeTarget=nativeDocs.length?nativeDocs[shot.layer].querySelector(shot.at===S[0]?'[name=video-url]':shot.at===S[1]?'button.conversion':shot.at===S[2]?'[name=whisper-model]':'[name=target-language]'):null;
    let rect;
    if(nativeTarget){rect=nativeTarget.getBoundingClientRect();const close=p(t,shot.at+.7,1.3);cx=lerp(cx,rect.x+rect.width/2,close);cy=lerp(cy,rect.y+rect.height/2,close);zoom=lerp(zoom,shot.at===S[0]?1.5:shot.at===S[1]?1.8:shot.at===S[2]?2.6:3.0,close);}
    if(previousShot&&nativeDocs.length){
      const previousTarget=nativeDocs[previousShot.layer].querySelector(previousShot.layer===0?'[name=video-url]':previousShot.layer===1?'button.conversion':'[name=whisper-model]').getBoundingClientRect();
      const u=p(t,shot.at,.55),previousZoom=previousShot.layer===0?1.5:previousShot.layer===1?1.8:2.6;
      cx=lerp(previousTarget.x+previousTarget.width/2,cx,u);cy=lerp(previousTarget.y+previousTarget.height/2,cy,u);zoom=Math.exp(lerp(Math.log(previousZoom),Math.log(zoom),u));
    }
    frames.forEach(frame=>transform(frame,w/2-cx*zoom,h/2-cy*zoom,zoom));
    const widgetVisible=t>=S[0]+.35&&t<S[1]-.25;
    const press=clamp(1-Math.abs(t-clicks[0])/.12);
    transform($('widget'),762,1190,1-press*.08);
    opacity($('widget'),widgetVisible?p(t,S[0]+.35,.32)*(1-p(t,S[1]-.55,.3)):0);
    const cursorVisible=t>=S[0]+.6&&t<S[4]-.4;
    let xy=cursorPosition(t);
    if(rect&&shot.at!==S[0]){const u=p(t,shot.at+.25,.7);xy=[lerp(xy[0],x+w/2+(rect.x+rect.width*.65-cx)*zoom,u),lerp(xy[1],y+h/2+(rect.y+rect.height*.55-cy)*zoom,u)];}
    transform($('cursor'),xy[0],xy[1],1-press*.09);
    opacity($('cursor'),cursorVisible?.95:0);
    let ring=0;for(const at of clicks){const u=(t-at)/.36;if(u>=0&&u<1){ring=1-u;transform($('click-ring'),xy[0]-25,xy[1]-24,.45+u*.65);}}
    opacity($('click-ring'),ring*.65);
    opacity($('example'),p(t,S[3]+.65,.5)*(1-p(t,S[4]-.35,.35)));
    transform($('example'),0,(1-p(t,S[3]+.65,.5))*32);
    const amplitude=bass[Math.min(bass.length-1,Math.max(0,Math.floor(t*120)))]||0;
    [...wave.children].forEach((bar,i)=>{const height=8+(32+amplitude*100)*Math.pow(Math.abs(Math.sin(i*1.317+t*1.4)),1.5);bar.setAttribute('y',(168-height)/2);bar.setAttribute('height',height);});
    opacity(wave,p(t,S[2]+.4,.45)*(1-p(t,S[3]-.2,.45)));
    $('feature-label').style.color=color('#617888','#a7c1d2',night);
    opacity($('ending'),p(t,S[4]+.5,.6));
    transform($('ending'),0,(1-spring(t-S[4]-.5,10))*45);
    if(nativeDocs.length){
      const url=nativeDocs[0].querySelector('[name=video-url]');url.value=t<S[0]+.9?'':'https://video.example/watch';
      nativeDocs[2].querySelector('[name=target-language]').value=t>=S[3]?'영어':'번역 안 함';
    }
  };
  async function prepare(){
    await document.fonts.ready;await Promise.all([...document.images].map(img=>img.decode()));
    bass=await fetch('out/bass.json').then(response=>response.ok?response.json():[]).catch(()=>[]);
    nativeDocs=await Promise.all(frames.map(async(frame,i)=>{
      if(!frame.contentDocument?.querySelector('#workspace h1'))await new Promise(resolve=>frame.addEventListener('load',resolve,{once:true}));
      const doc=frame.contentDocument;doc.querySelector(`[data-page="${['youtube','codec','subtitles'][i]}"]`).click();
      doc.activeElement?.blur();
      const style=doc.createElement('style');style.textContent='*,*::before,*::after{transition:none!important;animation:none!important;caret-color:transparent!important}';doc.head.append(style);
      if(i===2){const path=doc.querySelector('[data-source-path]');path.textContent='sample-video.mp4';}
      await doc.fonts.ready;return doc;
    }));
    window.seek(0);window.READY=true;
  }
  function fit(){if(document.body.classList.contains('render'))return;const s=Math.min((innerWidth-36)/W,(innerHeight-125)/H,.52);$('preview').style.width=W*s+'px';$('preview').style.height=H*s+'px';stage.style.transform=`scale(${s})`;}
  if(new URLSearchParams(location.search).has('render'))document.body.classList.add('render');
  fit();window.addEventListener('resize',fit);
  const audio=$('music');audio.volume=.5;let manualTime=0,playing=false;
  function display(){const t=playing?Math.min(T,audio.currentTime):manualTime;window.seek(t);$('scrub').value=t;$('time').textContent=`00:${String(Math.floor(t)).padStart(2,'0')} / 00:24`;if(playing&&t>=T){playing=false;audio.pause();manualTime=0;$('play').textContent='재생';}requestAnimationFrame(display);}
  $('play').addEventListener('click',async()=>{if(!window.READY)return;if(playing){manualTime=audio.currentTime;audio.pause();playing=false;}else{audio.currentTime=manualTime;try{await audio.play();playing=true;}catch{$('play').textContent='오디오 준비 후 재생';return;}}$('play').textContent=playing?'일시정지':'재생';});
  $('scrub').addEventListener('input',()=>{manualTime=+$('scrub').value;if(playing)audio.currentTime=manualTime;window.seek(manualTime);});
  $('volume').addEventListener('input',()=>{audio.volume=+$('volume').value;});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing){manualTime=audio.currentTime;audio.pause();playing=false;$('play').textContent='재생';}});
  prepare().then(()=>{if(!document.body.classList.contains('render'))requestAnimationFrame(display);}).catch(error=>{window.BUILD_ERROR=error.message;console.error(error);});
})();
