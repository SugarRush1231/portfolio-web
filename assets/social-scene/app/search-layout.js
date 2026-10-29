 'use strict';
const SearchUI=(()=>{
 const refs=typeof SCENE_SEARCH_REFERENCE!=='undefined'?SCENE_SEARCH_REFERENCE:require('./assets/search-reference.js');
 const pictures=new Map();
 function image(data){if(!data)return null;if(!pictures.has(data)){const node=new Image(),task=new Promise((resolve,reject)=>{node.onload=()=>resolve(node);node.onerror=()=>reject(Error('검색 이미지 로딩 실패'))});node.src=data;pictures.set(data,{node,task});task.catch(()=>pictures.delete(data))}return pictures.get(data).node}
 async function ready(p){const all=[...refs.ai,...refs.clips,...refs.gallery,...refs.news,...refs.imageGrid,...refs.trends,refs.source,...(p?.avatar?[p.avatar]:[]),...(p?.results||[]).flatMap(x=>[x.thumbnail,x.faviconImage]).filter(Boolean)];for(const data of all)image(data);await Promise.all(all.map(data=>pictures.get(data).task))}
 function defaults(type){
  const extra={searchExpanded:false,searchSourcesOpen:false,searchExtras:true,naverShowBrand:true,naverShowClips:true,naverShowNews:true,naverShowWeb:true,naverShowRelated:true,naverShowImages:true,naverShowPosts:true,naverShowMore:true,naverEmail:'user01@naver.com',naverPoints:'23,650원',naverUnread:'99+'};
  if(type==='google-ai')return{...extra,theme:'dark',browserFrame:false,camera:'none',cameraZoom:1,query:'영상 제작 방식별 특징을 비교해줘',suggestions:'제품 소개 영상을 준비하는 순서를 정리해줘\n영상 제작 방식별 특징을 비교해줘\n화면 녹화 영상을 읽기 좋게 편집하는 방법',answer:'영상은 **촬영·그래픽·화면 녹화** 등 여러 방식으로 만들 수 있습니다. 전달하려는 내용과 준비할 수 있는 소스에 따라 적합한 구성이 달라집니다. 주요 제작 방식의 특징을 비교한 예시입니다. [1]\n\n## 주요 영상 제작 방식 비교\n\n| 제작 방식 | 주요 소스 | 준비 과정 | 표현 특성 | 장점 | 확인 사항 |\n| --- | --- | --- | --- | --- | --- |\n| 실사 촬영 | 인물·제품·공간 | 장소와 조명 준비 | 현장감과 실제 질감 | 구체적인 모습 전달 | 촬영 환경과 소리 점검 |\n| 모션 그래픽 | 글자·도형·이미지 | 정보 구조와 화면 설계 | 움직임으로 정보 강조 | 복잡한 내용의 시각화 | 글자 가독성과 속도 조절 |\n| 화면 녹화 | 앱·웹 사용 화면 | 시연 순서와 데이터 준비 | 실제 사용 흐름 전달 | 기능과 동작 설명 | 개인정보와 화면 크기 점검 |\n| 혼합형 | 촬영·그래픽·화면 | 소스별 제작 기준 정리 | 장면별 표현 연결 | 다양한 정보를 한 흐름으로 구성 | 색감·글꼴·전환의 일관성 |\n\n제작 목적과 시청 환경을 먼저 정한 뒤, 필요한 장면과 설명을 고르는 것이 좋습니다. [2]'};
  if(!['google-overview','naver-search'].includes(type))return extra;
  const results=[
   {site:'Frame Notes',domain:'frame-notes.example › production',title:'콘텐츠 제작의 시작: 기획과 준비',snippet:'전달할 메시지와 대상을 정하고 자료를 모아 제작 계획을 세웁니다. 단계별 체크리스트를 확인해 보세요.'},
   {site:'Studio Journal',domain:'studio-journal.example › workflow',title:'작업 흐름을 정리하는 제작 노트',snippet:'소스 정리부터 편집과 검토까지. 반복 작업을 줄이고 결과물의 일관성을 유지하는 방법을 소개합니다.'},
   {site:'Creative Archive',domain:'creative-archive.example › guide',title:'이미지와 영상으로 메시지 전달하기',snippet:'화면 구성, 글자, 사운드를 함께 고려하는 콘텐츠 제작 가이드입니다.'},
   {site:'Design Weekly',domain:'design-weekly.example › news',title:'창작자가 정리한 이번 주 제작 이야기',snippet:'새로운 도구와 작업 방식에 관한 예시 소식입니다. 촬영할 내용에 맞게 이 문구를 수정하세요.'},
   {site:'Worklog',domain:'worklog.example › notes',title:'프로젝트 자료를 관리하는 방법',snippet:'폴더 구조와 파일 이름, 검토본을 정리하는 작업 기록입니다.'},
   {site:'Media Guide',domain:'media-guide.example › basics',title:'콘텐츠 제작에 필요한 기본 단계',snippet:'기획, 제작, 후반 작업과 검수를 하나의 흐름으로 연결합니다.'},
   {site:'Open Studio',domain:'open-studio.example › archive',title:'제작 과정과 아이디어 아카이브',snippet:'프로젝트를 준비하고 완성하는 과정을 기록한 샘플 페이지입니다.'},
   {site:'Project Lab',domain:'project-lab.example › process',title:'함께 만드는 프로젝트 워크플로',snippet:'역할을 나누고 의견을 모아 결과물을 발전시키는 방법을 살펴봅니다.'}
  ].map(item=>({...item,favicon:'globe',faviconImage:'',thumbnail:''}));
  return{...extra,theme:type==='google-overview'?'dark':'light',browserFrame:false,camera:'none',cameraZoom:1,query:'콘텐츠 제작',suggestions:'콘텐츠 제작 과정\n영상 제작 준비\n기획안 작성\n제작 도구\n편집 워크플로\n프로젝트 관리',answer:'콘텐츠 제작은 **기획·제작·후반 작업**을 연결해 메시지를 전달하는 과정입니다. 목적과 대상에 맞는 형식을 정하고, 필요한 자료와 일정을 준비하는 것에서 시작합니다. [1]\n\n# 주요 제작 단계\n- **기획과 준비:** 전달할 핵심 메시지와 보는 사람을 정합니다. 자료를 조사하고 필요한 장면, 디자인과 소스를 계획해 작업의 기준을 만듭니다. [1]\n- **제작과 편집:** 준비한 소스를 구성하고 화면, 글자와 사운드를 다듬습니다. 반복 작업을 정리하고 중간 결과를 확인해 전체 흐름을 조정합니다. [2]\n- **검토와 완성:** 내용과 기술 규격을 확인하고 필요한 수정을 반영합니다. 완성된 결과와 제작 자료를 정리해 다음 작업에 활용합니다. [3]',results};
 }
 function validate(p){const out={searchExpanded:false,searchSourcesOpen:false,searchExtras:true,naverShowBrand:true,naverShowClips:true,naverShowNews:true,naverShowWeb:true,naverShowRelated:true,naverShowImages:true,naverShowPosts:true,naverShowMore:true};if(p.type==='naver-search'&&p.searchExtras===false)for(const key of ['naverShowBrand','naverShowClips','naverShowNews','naverShowRelated','naverShowImages','naverShowPosts'])if(p[key]===undefined)out[key]=false;for(const key of Object.keys(out))if(p[key]!==undefined){if(typeof p[key]!=='boolean')throw Error('검색 화면 표시 설정이 올바르지 않습니다.');out[key]=p[key]}for(const[key,max]of [['naverEmail',160],['naverPoints',24],['naverUnread',8]]){const value=p[key]??defaults(p.type)[key];if(typeof value!=='string'||value.length>max)throw Error('네이버 계정 표시 값을 확인해 주세요.');out[key]=value}return out}
 function expansion(p,t,action,initial){let from=initial?1:0,to=from,start=-Infinity;const ease=x=>typeof interactionEase==='function'?interactionEase(x):require('./interactions.js').interactionEase(x);for(const e of [...(p.actions||[])].sort((a,b)=>a.at-b.at)){if(e.action!==action||e.at>t)continue;from=from+(to-from)*ease((e.at-start)/.28);to=e.value?1:0;start=e.at}return{value:from+(to-from)*ease((t-start)/.28),open:!!to}}
 function state(p,t){return{expanded:expansion(p,t,'ai-expand',p.searchExpanded),sources:expansion(p,t,'source-expand',p.searchSourcesOpen)}}
 function layout(width,naver){const mobile=width<700;if(mobile)return{mobile,x:16,w:width-32,right:0,side:0,header:naver?112:156};if(naver)return{mobile,x:Math.max(26,(width-1137)/2+24),w:680,right:Math.max(26,(width-1137)/2+24)+732,side:400,header:134};const x=Math.max(28,(width-1360)/2+8);return{mobile,x,w:652,right:x+728,side:370,header:136}}
 function uiText(ctx,value,x,y,size=15,color='#111',weight=400,align='left',maxWidth){
  let copy=String(value);if(maxWidth){ctx.font=weight+' '+size+'px '+(ctx.sceneFontFamily||'Arial');if(ctx.measureText(copy).width>maxWidth){const parts=[...new Intl.Segmenter('ko',{granularity:'grapheme'}).segment(copy)].map(x=>x.segment);while(parts.length&&ctx.measureText(parts.join('')+'…').width>maxWidth)parts.pop();copy=parts.join('')+'…'}}sceneText(ctx,copy,x,y,size,color,weight,align);
 }
 function box(ctx,x,y,w,h,r,fill,line){searchStrokeBox(ctx,x,y,w,h,r,fill,line)}
 function group(ctx,p,label,x,y,w,h,draw){return ElementRender.group(ctx,label,{x,y,width:w,height:h},draw)}
 function nlogo(ctx,x,y,size,color='#03c75a'){return ElementRender.paint(ctx,'icon','naver-logo:'+x+','+y,{x,y,width:size,height:size},'NAVER 로고',edit=>{ctx.save();ctx.translate(x,y);ctx.scale(size/26,size/26);ctx.fillStyle=edit.color||color;ctx.fill(new Path2D('M0 0h8.8l8.4 14.1V0H26v26h-8.8L8.8 11.9V26H0Z'));ctx.restore()})}
 function spark(ctx,x,y,size,naver=false){return ElementRender.paint(ctx,'icon',(naver?'naver-ai:':'google-ai:')+x+','+y,{x,y,width:size,height:size},naver?'AI 브리핑 아이콘':'AI 개요 아이콘',edit=>{ctx.save();ctx.translate(x,y);ctx.scale(size/24,size/24);const gradient=ctx.createLinearGradient(2,0,24,24);gradient.addColorStop(0,naver?'#3d8fff':'#c2d9ff');gradient.addColorStop(1,naver?'#00cfb5':'#76a3ec');ctx.fillStyle=edit.color||gradient;ctx.fill(new Path2D('M12 0C13 7 17 11 24 12C17 13 13 17 12 24C11 17 7 13 0 12C7 11 11 7 12 0Z'));if(naver){ctx.fillStyle=edit.color||'#7967ed';ctx.beginPath();ctx.ellipse(5,7,4,7,.65,0,Math.PI*2);ctx.fill()}ctx.restore()})}
 function dots(ctx,x,y,c){return ElementRender.paint(ctx,'icon','apps:'+x+','+y,{x,y,width:24,height:24},'Google 앱',edit=>{ctx.fillStyle=edit.color||c;for(let a=0;a<3;a++)for(let b=0;b<3;b++){ctx.beginPath();ctx.arc(x+4+a*8,y+4+b*8,2,0,Math.PI*2);ctx.fill()}})}
 function thumb(ctx,data,x,y,w,h,r=12,label='이미지'){
  return ElementRender.paint(ctx,'image',label+':'+x+','+y,{x,y,width:w,height:h},label,()=>{ctx.save();ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.clip();const img=image(data);if(img?.complete&&img.naturalWidth){const s=Math.max(w/img.naturalWidth,h/img.naturalHeight);ctx.drawImage(img,x+(w-img.naturalWidth*s)/2,y+(h-img.naturalHeight*s)/2,img.naturalWidth*s,img.naturalHeight*s)}else{ctx.fillStyle='#f5f5f5';ctx.fillRect(x,y,w,h)}ctx.restore()})
 }
 function aiLayout(width,height,top=0){
  const mobile=width<700,x=mobile?18:Math.max(98,(width-1120)/2+2),w=mobile?width-36:628;
  return{mobile,x,w,side:mobile?0:372,right:x+728,header:mobile?82:96,composerX:mobile?14:x-20,composerW:mobile?width-28:w+64,composerY:height-(mobile?126:138),homeX:mobile?18:(width+60-Math.min(750,width-160))/2,homeW:mobile?width-36:Math.min(750,width-160),greetingY:top+Math.max(mobile?154:190,(height-top)*(mobile?.27:.337))};
 }
 function aiCells(value){return value.trim().replace(/^\|/,'').replace(/\|$/,'').split(/(?<!\\)\|/).map(cell=>cell.trim().replace(/\\\|/g,'|').replace(/<br\s*\/?\s*>/gi,'\n'))}
 function aiBlocks(text){
  const lines=text.split('\n'),blocks=[];let offset=0;
  for(let i=0;i<lines.length;){
   const cells=aiCells(lines[i]),separator=lines[i+1]&&aiCells(lines[i+1]);
   if(lines[i].includes('|')&&cells.length>1&&separator?.length===cells.length&&separator.every(cell=>/^:?-{3,}:?$/.test(cell))){
    const rows=[{text:lines[i],at:offset,cells}];offset+=lines[i].length+1+lines[i+1].length+1;i+=2;
    while(i<lines.length&&lines[i].trim()&&lines[i].includes('|')){rows.push({text:lines[i],at:offset,cells:aiCells(lines[i])});offset+=lines[i].length+1;i++}
    blocks.push({table:true,rows});
   }else{blocks.push({text:lines[i],at:offset});offset+=lines[i].length+1;i++}
  }return blocks;
 }
 function aiTable(ctx,p,block,visible,x,y,w,c,paint=true){
  const columns=block.rows[0].cells.length,colW=w/columns,font=w<500?12:14,line=w<500?19:22,pad=w<500?5:8;let cursor=y;
  for(const[rowIndex,row]of block.rows.entries()){
   const values=Array.from({length:columns},(_,i)=>String(row.cells[i]||'').replace(/\*\*/g,''));
   const cellLines=values.map(value=>sceneLines(ctx,value,colW-pad*2,font,rowIndex?400:600)),height=Math.max(rowIndex?54:43,...cellLines.map(lines=>lines.length*line+24));
   if(paint&&visible>row.at){
    const shown=aiCells(row.text.slice(0,Math.max(0,visible-row.at)));
    for(let col=0;col<columns;col++)group(ctx,p,'AI 비교표 '+rowIndex+' '+col,x+col*colW,cursor,colW,height,()=>{
     const lines=sceneLines(ctx,String(shown[col]||'').replace(/\*\*/g,''),colW-pad*2,font,rowIndex?400:600);
     lines.forEach((value,i)=>uiText(ctx,value,x+col*colW+pad,cursor+21+i*line,font,c.text,rowIndex?400:600));
    });
    sceneLine(ctx,x,cursor+height,x+w,cursor+height,c.line);
   }cursor+=height;
  }return cursor-y+24;
 }
 function aiAnswer(ctx,p,state,x,y,w,c,paint=true){
  const visible=answerText(p,state).length;let cursor=y,previousHeading=false;
  for(const block of aiBlocks(p.answer)){
   if(block.table){cursor+=aiTable(ctx,p,block,visible,x,cursor,w,c,paint);continue}
   if(!block.text.trim()){if(!previousHeading)cursor+=20;continue}
   const heading=/^#{1,3}\s+/.test(block.text),height=rich(ctx,p,block.text,x,cursor,w,c,{font:16,line:25,paint:false})-(heading?10:0);
   if(paint&&visible>block.at)rich(ctx,p,block.text.slice(0,Math.max(0,visible-block.at)),x,cursor,w,c,{font:16,line:25});
   cursor+=height;previousHeading=heading;
  }return cursor-y;
 }
 function aiChrome(ctx,p,width,height,top,assets,c){
  const l=aiLayout(width,height,top),ink=c.muted,rail=p.theme==='dark'?'#26292f':'#f0f4f9';
  sceneBox(ctx,0,top,width,l.header,0,c.bg);
  if(!l.mobile)sceneBox(ctx,0,top,60,height-top,0,rail);
  ElementRender.paint(ctx,'icon','google-ai-logo',{x:17,y:top+34,width:28,height:28},'Google G 로고',()=>{if(assets.googleFavicon)ctx.drawImage(assets.googleFavicon,17,top+34,28,28);else searchFavicon(ctx,{favicon:'google'},17,top+34,28,c,assets)});
  searchControl(ctx,'new-query',10,top+25,42,45,22);
  if(!l.mobile){
   sceneIcon(ctx,'equal',23,top+101,17,ink);searchControl(ctx,'menu',12,top+90,36,36,18);
   sceneIcon(ctx,'attach',22,top+140,19,ink);searchControl(ctx,'new-query',12,top+130,36,36,18);
   sceneIcon(ctx,'settings',23,height-43,17,ink);searchControl(ctx,'ai-settings',12,height-54,36,36,18);
  }
  let at=l.mobile?65:l.x;const tabs=l.mobile?['AI 모드','전체','이미지','동영상']:['AI 모드','전체','이미지','동영상','뉴스','더보기'];
  for(const[index,label]of tabs.entries()){
   if(at+45>width-(l.mobile?58:330))break;
   uiText(ctx,label,at,top+56,l.mobile?12:14,index?ink:c.text,index?400:600);ctx.font='400 '+(l.mobile?12:14)+'px '+ElementModel.family(p);const w=ctx.measureText(label).width;
   searchControl(ctx,'tab-'+label,at-7,top+32,w+14,36,18);at+=w+(l.mobile?19:26);if(label==='더보기')sceneIcon(ctx,'chevron',at-20,top+47,10,ink);
  }
  if(!l.mobile){
   sceneBox(ctx,width-246,top+35,104,32,18,p.theme==='dark'?'#2c303c':'#edf2fc');spark(ctx,width-232,top+44,14);uiText(ctx,'업그레이드',width-213,top+56,12,c.text,600);searchControl(ctx,'ai-upgrade',width-246,top+35,104,32,18);
   dots(ctx,width-110,top+43,ink);searchControl(ctx,'apps',width-115,top+34,33,34,17);
  }
  sceneBox(ctx,width-66,top+35,32,32,16,'#ed3b80');uiText(ctx,Array.from(p.name||'User')[0].toUpperCase(),width-50,top+57,16,'#fff',500,'center');searchControl(ctx,'account',width-70,top+31,40,40,20);
 }
 function aiInput(ctx,p,state,x,y,w,assets,c,home=false){
  const h=108;group(ctx,p,home?'AI 모드 새 대화 입력창':'AI 모드 하단 입력창',x,y,w,h,edit=>{
   box(ctx,x,y,w,h,24,edit.background||c.field,c.line);
   const value=home?state.query:'';if(value){sceneParagraph(ctx,value,x+20,y+32,w-48,16,c.text,23,400,2)}else uiText(ctx,'무엇이든 물어보세요',x+20,y+32,16,c.muted);
   searchControl(ctx,'query',x+8,y+5,w-16,51,18);
   sceneBox(ctx,x+12,y+60,48,36,18,p.theme==='dark'?'#4a4e58':'#e5e9ef');sceneIcon(ctx,'plus',x+27,y+69,18,c.text);searchControl(ctx,'ai-attach',x+12,y+60,48,36,18);
   sceneIcon(ctx,value?'up':'mic',x+w-45,y+68,20,c.text);searchControl(ctx,value?'submit':'voice',x+w-56,y+58,40,40,20);
  });
 }
 function aiHome(ctx,p,state,width,height,top,assets,c){
  const l=aiLayout(width,height,top),x=l.homeX,y=l.greetingY;
  const greeting=(p.name||'User')+'님, 안녕하세요. 어떤 생각을 하고 계시나요?';
  const greetingHeight=sceneParagraph(ctx,greeting,x,y,l.homeW,l.mobile?23:32,c.text,l.mobile?34:43,400,2);
  const inputY=y+Math.max(45,greetingHeight+(l.mobile?12:2));aiInput(ctx,p,state,x,inputY,l.homeW,assets,c,true);
  p.suggestions.split('\n').filter(Boolean).slice(0,3).forEach((suggestion,i)=>{
   const sy=inputY+151+i*40;sceneIcon(ctx,'search',x+18,sy-15,18,c.muted);spark(ctx,x+31,sy-20,10);uiText(ctx,suggestion,x+47,sy,15,c.muted,400,'left',l.homeW-65);searchControl(ctx,'ai-suggestion:'+i,x+8,sy-25,l.homeW-16,36,16);
  });
  if(state.phase==='loading'){for(let i=0;i<3;i++)sceneBox(ctx,x+l.homeW/2-12+i*9,inputY+121,4,4,2,['#4285f4','#ea4335','#34a853'][i])}
 }
 function aiSources(ctx,p,state,x,y,w,c){
  if(!p.results.length)return 0;const count=state.sources.open?p.results.length:Math.min(3,p.results.length),rowH=128,h=count*rowH+62;
  group(ctx,p,'AI 모드 출처 패널',x,y,w,h,edit=>{
   box(ctx,x,y,w,h,24,edit.background||c.bg,c.line);
   for(const[index,item]of p.results.slice(0,count).entries())group(ctx,p,'AI 모드 출처 '+index,x+16,y+18+index*rowH,w-32,rowH,()=>{
    const sy=y+18+index*rowH;searchFavicon(ctx,item,x+18,sy+8,16,c,{...brandAssets});uiText(ctx,item.site,x+40,sy+21,12,c.text,600,'left',w-90);sceneIcon(ctx,'more-vertical',x+w-32,sy+9,16,c.muted);searchControl(ctx,'source-menu-'+index,x+w-39,sy+2,30,30,15);
    const titleH=sceneParagraph(ctx,item.title,x+18,sy+48,w-126,15,c.text,20,600,2);sceneParagraph(ctx,item.snippet,x+18,sy+55+titleH,w-126,13,c.muted,18,400,2);thumb(ctx,item.thumbnail||refs.gallery[index%refs.gallery.length],x+w-85,sy+37,68,68,9,'출처 썸네일');searchControl(ctx,'source',x+14,sy+34,w-28,78,9);
    if(index<count-1)sceneLine(ctx,x+18,sy+rowH-2,x+w-18,sy+rowH-2,c.line);
   });
   sceneBox(ctx,x+17,y+h-51,w-34,34,18,p.theme==='dark'?'#2d3037':'#f0f3f7');uiText(ctx,state.sources.open?'간략히':'모두 표시',x+w/2,y+h-29,14,c.text,600,'center');searchControl(ctx,'source-expand',x+17,y+h-51,w-34,34,18);
  });return h;
 }
 function aiBody(ctx,p,state,width,height,top,assets,c){
  const l=aiLayout(width,height,top),x=l.x,w=l.w,questionY=top+l.header+23;ctx.font='500 16px '+ElementModel.family(p);
  const questionW=Math.min(w-20,Math.max(145,ctx.measureText(p.query).width+32)),lines=sceneLines(ctx,p.query,questionW-30,16,500).slice(0,5),questionH=Math.max(48,lines.length*23+22),questionX=x+w-questionW;
  group(ctx,p,'AI 모드 질문',questionX,questionY,questionW,questionH,edit=>{sceneBox(ctx,questionX,questionY,questionW,questionH,22,edit.background||(p.theme==='dark'?'#2b2e35':'#f0f4f9'));lines.forEach((value,i)=>uiText(ctx,value,questionX+16,questionY+30+i*23,16,c.text,500));searchControl(ctx,'query',questionX,questionY,questionW,questionH,22)});
  if(questionX-x>80){sceneIcon(ctx,'copy',questionX-81,questionY+13,18,c.muted);searchControl(ctx,'copy-query',questionX-87,questionY+7,31,32,16);sceneIcon(ctx,'edit',questionX-36,questionY+13,18,c.muted);searchControl(ctx,'query',questionX-42,questionY+7,31,32,16)}
  const answerY=questionY+questionH+38;
  let answerH=0;group(ctx,p,'AI 모드 답변',x,answerY-19,w,aiAnswer(ctx,p,state,x,answerY,w,c,false)+25,()=>{answerH=aiAnswer(ctx,p,state,x,answerY,w,c)});
  let bottom=answerY+answerH+34;
  if(l.side)bottom=Math.max(bottom,questionY+aiSources(ctx,p,state,l.right,questionY,l.side,c));
  else bottom+=aiSources(ctx,p,state,x,bottom,w,c)+24;
  return bottom+30;
 }
 function aiComposer(ctx,p,state,width,height,top,assets,c){const l=aiLayout(width,height,top);sceneBox(ctx,l.composerX-4,l.composerY-8,l.composerW+8,145,0,c.bg);aiInput(ctx,p,state,l.composerX,l.composerY,l.composerW,assets,c)}

 function naverMenu(p,t){
  let kind='',open=false,from=0,start=-Infinity;
  const ease=value=>typeof interactionEase==='function'?interactionEase(value):require('./interactions.js').interactionEase(value);
  const value=at=>from+((open?1:0)-from)*ease((at-start)/.14);
  for(const event of [...(p.actions||[])].sort((a,b)=>a.at-b.at)){
   if(event.at>t||!['naver-account','naver-services'].includes(event.action))continue;
   const next=event.action.slice(6);
   if(event.value){from=kind===next?value(event.at):0;kind=next;open=true;start=event.at}
   else if(kind===next){from=value(event.at);open=false;start=event.at}
  }
  return{kind,open,value:value(t)};
 }
 function naverGlyph(ctx,key,x,y,size,color){
  const paths={
   talk:'M12 2C5.9 2 1 6.1 1 11.1c0 2.8 1.5 5.3 4 7l-1 4.1 4.3-2.3c1.2.3 2.4.5 3.7.5 6.1 0 11-4.2 11-9.3S18.1 2 12 2ZM6.9 9.8a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6ZM12 9.8a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6ZM17.1 9.8a1.3 1.3 0 1 0 0 2.6 1.3 1.3 0 0 0 0-2.6Z',
   bell:'M10 2h4v2c3 .8 5 3.1 5 6.5v4l2 3v1H3v-1l2-3v-4C5 7.1 7 4.8 10 4ZM9 20h6a3 3 0 0 1-6 0Z',
   mail:'M2 4h20v16H2ZM3.5 6l8.5 7L20.5 6l-1-1-7.5 6-7.5-6ZM3 18l6-5-1-1-5 4ZM21 18v-2l-5-4-1 1Z',
   person:'M12 3a5 5 0 1 1 0 10 5 5 0 0 1 0-10ZM3 23v-3c0-4 4-7 9-7s9 3 9 7v3Z'
  };
  return ElementRender.paint(ctx,'icon','naver-'+key+':'+x+','+y,{x,y,width:size,height:size},'네이버 '+({talk:'톡',bell:'알림',mail:'메일',services:'서비스',person:'기본 프로필'}[key]||key),edit=>{
   ctx.save();ctx.translate(x,y);ctx.scale(size/24,size/24);ctx.fillStyle=edit.color||color;
   if(key==='services'){for(let row=0;row<3;row++)for(let col=0;col<3;col++)ctx.fillRect(2+col*8,2+row*8,4,4)}
   else ctx.fill(new Path2D(paths[key]),'evenodd');
   ctx.restore();
  });
 }
 function naverAvatar(ctx,p,x,y,size,c){
  if(p.avatar){thumb(ctx,p.avatar,x,y,size,size,size/2,'네이버 프로필 사진');return}
  const dark=p.theme==='dark';box(ctx,x,y,size,size,size/2,dark?'#35383b':'#fafafa',dark?'#53575b':'#e3e3e3');
  naverGlyph(ctx,'person',x+size*.16,y+size*.12,size*.68,dark?'#777c83':'#dedfe1');
 }
 function naverToolbar(ctx,p,width,top,c){
  const y=top+15,ink=p.theme==='dark'?'#c1c3c6':'#707070';
  ctx.font='400 12px '+ElementModel.family(p);const nameWidth=Math.min(76,Math.max(30,ctx.measureText(p.name).width)),left=width-172-nameWidth-44;
  group(ctx,p,'네이버 사용자',left,y,44+nameWidth,30,()=>{
   naverAvatar(ctx,p,left,y,28,c);uiText(ctx,p.name,left+36,y+19,12,c.text,400,'left',nameWidth);sceneIcon(ctx,'chevron',left+38+nameWidth,y+13,8,ink);
   searchControl(ctx,'naver-account',left-4,y-4,nameWidth+54,36,4);
  });
  for(const[key,x]of [['talk',width-153],['bell',width-117],['mail',width-81],['services',width-43]]){
   searchControl(ctx,key==='services'?'naver-services':'naver-header-'+key,x-6,y-1,32,32,4);naverGlyph(ctx,key,x,y+6,key==='services'?19:20,ink);
   if(key==='mail'&&p.naverUnread){const label=p.naverUnread,badge=Math.max(18,Math.min(38,label.length*6+8));box(ctx,x+7,y-1,badge,15,8,'#00c73c',c.bg);uiText(ctx,label,x+7+badge/2,y+10,10,'#fff',600,'center',badge-3)}
  }
 }
 function naverPanelFrame(ctx,x,y,w,h,tip,c){
  ctx.save();ctx.shadowColor='rgba(0,0,0,.16)';ctx.shadowBlur=5;ctx.shadowOffsetY=1;box(ctx,x,y,w,h,0,c.bg,c.line);ctx.restore();
  ctx.beginPath();ctx.moveTo(tip-6,y);ctx.lineTo(tip,y-6);ctx.lineTo(tip+6,y);ctx.fillStyle=c.bg;ctx.fill();ctx.strokeStyle=c.line;ctx.stroke();
  searchControl(ctx,'naver-panel',x,y,w,h,0);
 }
 function naverAccountPanel(ctx,p,x,y,w,c){
  const h=156,muted=p.theme==='dark'?'#aaaeb4':'#777',ink=p.theme==='dark'?'#dadce0':'#333';
  naverPanelFrame(ctx,x,y,w,h,x+170,c);
  group(ctx,p,'네이버 계정 패널',x,y,w,h,()=>{
   naverAvatar(ctx,p,x+20,y+18,72,c);sceneBox(ctx,x+16,y+74,24,24,12,'#858b90');sceneIcon(ctx,'camera',x+21,y+79,14,'#fff');searchControl(ctx,'naver-account-photo',x+14,y+13,84,89,44);
   uiText(ctx,p.name,x+108,y+30,14,ink,700,'left',64);uiText(ctx,'님',x+110+Math.min(64,ctx.measureText(p.name).width),y+30,13,muted);
   box(ctx,x+183,y+15,55,22,0,c.bg,c.line);uiText(ctx,'로그아웃',x+210.5,y+30,11,muted,400,'center');searchControl(ctx,'naver-logout',x+183,y+15,55,22,0);
   uiText(ctx,p.naverEmail,x+108,y+49,12,muted,400,'left',w-124);
   for(const[label,dx]of [['네이버ID',0],['보안설정',53],['내인증서',109]]){uiText(ctx,label,x+108+dx,y+70,11,muted);searchControl(ctx,'naver-account-'+label,x+105+dx,y+56,49,20,0);if(dx)sceneLine(ctx,x+103+dx,y+60,x+103+dx,y+70,c.line)}
   sceneBox(ctx,x+108,y+79,16,16,8,'#00c73c');uiText(ctx,'N',x+116,y+91,10,'#fff',700,'center');uiText(ctx,p.naverPoints,x+130,y+92,12,ink,700,'left',w-146);searchControl(ctx,'naver-points',x+105,y+76,w-116,23,0);
   sceneBox(ctx,x+1,y+117,w-2,38,0,p.theme==='dark'?'#272a2e':'#fafafa');sceneLine(ctx,x,y+117,x+w,y+117,c.line);
   for(let i=1;i<3;i++)sceneLine(ctx,x+w*i/3,y+117,x+w*i/3,y+h,c.line);
   for(const[label,i]of [['내 블로그',0],['가입한 카페',1]]){uiText(ctx,label,x+w*(i+.5)/3,y+141,12,ink,600,'center');searchControl(ctx,'naver-account-footer-'+i,x+w*i/3,y+118,w/3,37,0)}
   box(ctx,x+w*2/3+13,y+128,21,21,3,'#4074ff','#4074ff');uiText(ctx,'N+',x+w*2/3+23.5,y+142,10,'#fff',700,'center');uiText(ctx,'최대',x+w*2/3+40,y+133,9,muted);uiText(ctx,'5% 적립',x+w*2/3+40,y+146,11,ink,600);searchControl(ctx,'naver-membership',x+w*2/3,y+118,w/3,37,0);
  });return h;
 }
 function naverServicesPanel(ctx,p,x,y,w,c){
  const h=414,ink=p.theme==='dark'?'#d4d7db':'#444',faint=p.theme==='dark'?'#5b6066':'#ececec';naverPanelFrame(ctx,x,y,w,h,x+w-13,c);
  group(ctx,p,'네이버 서비스 패널',x,y,w,h,()=>{
   sceneIcon(ctx,'settings',x+w-24,y+8,16,p.theme==='dark'?'#969ca3':'#bababa');searchControl(ctx,'naver-services-settings',x+w-29,y+3,26,26,0);
   for(let i=0;i<4;i++){const tx=x+28+i*65;box(ctx,tx,y+28,35,35,0,c.bg,faint);sceneLine(ctx,tx+9,y+45,tx+26,y+45,faint,3);sceneLine(ctx,tx+17.5,y+36,tx+17.5,y+54,faint,3);uiText(ctx,'추가',tx+17.5,y+80,12,ink,500,'center');searchControl(ctx,'naver-service-add-'+i,tx-5,y+25,46,61,0)}
   sceneLine(ctx,x,y+98,x+w,y+98,c.line);box(ctx,x+9,y+118,w-24,32,0,c.bg,p.theme==='dark'?'#666':'#aaa');uiText(ctx,'더 많은 서비스를 간편하게 시작해보세요!',x+19,y+139,12,p.theme==='dark'?'#969ca3':'#a5a5a5',400,'left',w-63);sceneIcon(ctx,'search',x+w-43,y+125,19,p.theme==='dark'?'#969ca3':'#aaa');searchControl(ctx,'naver-services-search',x+10,y+119,w-26,30,0);
   const columns=[['카페','뉴스','웹툰','도서','지식iN'],['블로그','증권','치지직','사전','캘린더'],['메일','부동산','날씨','스포츠','MYBOX'],['스토어','지도','페이','웹소설','MBE']];
   for(let col=0;col<4;col++){const cx=x+19+col*69;if(col)sceneLine(ctx,cx-11,y+168,cx-11,y+316,c.line);for(const[row,label]of columns[col].entries()){uiText(ctx,label,cx,y+178+row*26,row?12:13,ink,row?400:700);searchControl(ctx,'naver-service-'+col+'-'+row,cx-5,y+162+row*26,62,24,0)}}
   sceneLine(ctx,x+17,y+331,x+w-17,y+331,c.line);uiText(ctx,'N pay',x+24,y+360,19,ink,700);uiText(ctx,'이벤트 참여하면 포인트 적립!',x+86,y+359,14,'#00c73c',700,'left',w-104);searchControl(ctx,'naver-pay-event',x+15,y+338,w-30,35,0);
   sceneBox(ctx,x+1,y+380,w-2,33,0,p.theme==='dark'?'#292c30':'#fafafa');sceneLine(ctx,x,y+380,x+w,y+380,c.line);uiText(ctx,'전체 서비스 보기',x+w/2-4,y+402,12,ink,600,'center');sceneIcon(ctx,'chevron',x+w/2+45,y+392,12,ink);searchControl(ctx,'naver-all-services',x+1,y+381,w-2,32,0);
  });return h;
 }
 function naverOverlay(ctx,p,width,top,c){
  if(p.type!=='naver-search'||width<700)return;
  const menu=naverMenu(p,ctx.sceneTime);if(!menu.kind||menu.value<.0001)return;
  ctx.save();ctx.globalAlpha*=menu.value;ctx.translate(0,-3*(1-menu.value));
  if(menu.kind==='account')naverAccountPanel(ctx,p,width-344,top+57,320,c);else naverServicesPanel(ctx,p,width-326,top+57,306,c);
  ctx.restore();
 }

 function header(ctx,p,state,width,top,assets,c){
  const nav=p.type==='naver-search',l=layout(width,nav),mobile=l.mobile;
  sceneBox(ctx,0,top,width,l.header,0,c.bg);
  let barX,barY,barW,barH;
  if(nav){barX=mobile?12:l.x-12;barY=top+7;barW=mobile?width-24:690;barH=60;box(ctx,barX,barY,barW,barH,31,c.field,c.field);nlogo(ctx,barX+24,barY+17,26);}
  else{const logoX=mobile?(width-90)/2:l.x-158;ctx.save();if(p.theme==='dark')ctx.filter='grayscale(1) brightness(0) invert(.93)';searchWordmark(ctx,'google',assets,logoX,top+(mobile?18:34),92);ctx.restore();barX=mobile?16:l.x-20;barY=top+(mobile?64:19);barW=mobile?width-32:Math.min(864,width-barX-250);barH=50;box(ctx,barX,barY,barW,barH,26,c.field,c.field);}
  const textX=barX+(nav?66:20);searchControl(ctx,'query',barX,barY,barW-(nav?95:185),barH,26);ctx.save();ctx.beginPath();ctx.rect(textX,barY+8,barW-(nav?145:205),barH-16);ctx.clip();uiText(ctx,state.query,textX,barY+barH/2+6,nav?19:17,c.text,nav?600:400);ctx.restore();
  if(nav){searchControl(ctx,'keyboard',barX+barW-107,barY+12,32,36,14);sceneIcon(ctx,'keyboard',barX+barW-96,barY+22,22,'#b4b4b4');searchControl(ctx,'submit',barX+barW-58,barY+9,42,42,21);sceneIcon(ctx,'search',barX+barW-49,barY+18,25,'#03c75a')}
  else{
   const right=barX+barW;for(const [id,x]of [['clear-query',right-185],['keyboard',right-141],['voice',right-98],['lens',right-55]])searchControl(ctx,id,x,barY+7,35,36,17);
   sceneIcon(ctx,'close',right-178,barY+17,18,c.text);sceneLine(ctx,right-156,barY+12,right-156,barY+38,c.line);sceneIcon(ctx,'keyboard',right-134,barY+17,21,c.text);
   if(assets.googleMic){ctx.save();if(p.theme==='dark')ctx.filter='grayscale(1) brightness(0) invert(.9)';ctx.drawImage(assets.googleMic,right-90,barY+14,19,23);ctx.restore()}else sceneIcon(ctx,'mic',right-90,barY+14,22,c.text);
   if(assets.googleLens){ctx.save();if(p.theme==='dark')ctx.filter='grayscale(1) brightness(0) invert(.9)';ctx.drawImage(assets.googleLens,right-48,barY+14,23,23);ctx.restore()}
  }
  const navY=top+l.header-23;let cursor=mobile?18:nav?l.x+12:l.x;
  const tabs=nav?['AI','뉴스','어학사전','클립','이미지','블로그','카페','지식iN','동영상','쇼핑','···']:['AI 모드','전체','이미지','동영상','쇼핑','뉴스','짧은 동영상','더보기','도구'];
  for(const [i,title]of tabs.entries()){ctx.font='400 '+(mobile?13:15)+'px '+ElementModel.family(p);const w=ctx.measureText(title).width;if(cursor+w>width-14)break;uiText(ctx,title,cursor,navY,mobile?13:15,!nav&&i===1?c.text:c.muted,!nav&&i===1?700:400);searchControl(ctx,'tab-'+title,cursor-6,navY-23,w+12,39,6);if(!nav&&i===1)sceneBox(ctx,cursor,navY+18,w,3,0,c.text);if(nav&&i===0){sceneBox(ctx,cursor+17,navY-25,14,14,7,'#ff575f');uiText(ctx,'N',cursor+24,navY-15,8,'#fff',700,'center')}cursor+=w+(mobile?22:nav?25:28)}
  sceneLine(ctx,0,top+l.header,width,top+l.header,c.line);
  if(!mobile){const y=top+25;if(nav){naverToolbar(ctx,p,width,top,c)}else{searchControl(ctx,'share',width-151,y,32,34,16);sceneIcon(ctx,'google-share',width-145,y+8,21,c.text);searchControl(ctx,'apps',width-102,y,34,34,17);dots(ctx,width-97,y+7,c.text);sceneBox(ctx,width-56,y+3,32,32,16,'#ee3a80');searchControl(ctx,'account',width-60,y-1,40,40,20);uiText(ctx,(p.handle||'S').slice(0,1).toUpperCase(),width-40,y+25,17,'#fff',500,'center')}}
  return top+l.header;
 }
 function citation(ctx,p,index,x,y,c,max=130){const item=p.results[index%Math.max(1,p.results.length)];if(!item)return 0;ctx.font='400 10px '+ElementModel.family(p);const w=Math.min(max,ctx.measureText(item.site).width+29);sceneBox(ctx,x,y-13,w,21,11,p.theme==='dark'?'#35373b':'#f0f4f9');searchFavicon(ctx,item,x+5,y-10,14,c,{...brandAssets});uiText(ctx,item.site,x+23,y+2,10,c.muted,400,'left',w-29);searchControl(ctx,'source',x,y-14,w,24,12);return w}
 function rich(ctx,p,text,x,y,w,c,{font=16,line=27,paint=true}={}){
  let cursor=y;
  for(const raw of text.split('\n')){
   if(!raw.trim()){cursor+=20;continue}
   const heading=/^#{1,3}\s+/.test(raw),bullet=/^[-•]\s+/.test(raw),content=raw.replace(/^#{1,3}\s+|^[-•]\s+/,'');
   if(heading){if(paint)uiText(ctx,content,x,cursor,19,c.text,600,'left',w);cursor+=38;continue}
   let px=x+(bullet?19:0);if(bullet&&paint)uiText(ctx,'•',x,cursor,font,c.text);
   const tokens=content.split(/(\*\*.*?\*\*|\[\d+\])/g).filter(Boolean);
   for(const token of tokens){
    const source=/^\[(\d+)\]$/.exec(token);if(source){const width=86;if(px+width>x+w){cursor+=line;px=x+(bullet?19:0)}if(paint)citation(ctx,p,+source[1]-1,px+4,cursor-1,c);px+=width;continue}
    const bold=token.startsWith('**'),value=bold?token.slice(2,-2):token;let run='',start=px;ctx.font=(bold?700:400)+' '+font+'px '+ElementModel.family(p);
    const flush=()=>{if(run&&paint)uiText(ctx,run,start,cursor,font,c.text,bold?700:400);run=''};
    for(const {segment}of new Intl.Segmenter('ko',{granularity:'grapheme'}).segment(value)){ctx.font=(bold?700:400)+' '+font+'px '+ElementModel.family(p);const width=ctx.measureText(segment).width;if(px+width>x+w&&px>x+(bullet?19:0)){flush();cursor+=line;px=x+(bullet?19:0);start=px}run+=segment;px+=width}flush();
   }cursor+=line;
  }return cursor-y;
 }
 function answerText(p,state){const units=[...new Intl.Segmenter('ko',{granularity:'grapheme'}).segment(p.answer)];return units.slice(0,Math.floor(units.length*state.answerProgress)).map(x=>x.segment).join('')}
 function more(ctx,p,x,y,w,label,c){box(ctx,x,y,w,50,26,c.bg,p.theme==='dark'?'#6577a5':'#c9d4e7');uiText(ctx,label,x+w/2-7,y+31,14,c.text,600,'center');sceneIcon(ctx,'chevron',x+w/2+28,y+20,13,c.text);searchControl(ctx,'ai-expand',x,y,w,50,26)}
 function overview(ctx,p,state,x,y,w,c){
  const full=rich(ctx,p,p.answer,x,y+55,w,c,{paint:false}),collapsed=Math.min(250,full),height=collapsed+(full-collapsed)*state.expanded.value;
  group(ctx,p,'Google AI 개요',x,y,w,height+110,()=>{
   spark(ctx,x,y-2,23);uiText(ctx,'AI 개요',x+31,y+15,14,c.text,600);ctx.save();ctx.beginPath();ctx.rect(x,y+32,w,height+10);ctx.clip();rich(ctx,p,answerText(p,state)||'답변을 준비하고 있습니다.',x,y+55,w,c);
   if(full>collapsed&&state.expanded.value<1){const gradient=ctx.createLinearGradient(0,y+height-15,0,y+height+48);gradient.addColorStop(0,p.theme==='dark'?'#20212400':'#ffffff00');gradient.addColorStop(1,c.bg);ctx.fillStyle=gradient;ctx.fillRect(x,y+height-15,w,63)}ctx.restore();
   more(ctx,p,x,y+height+58,w,state.expanded.open?'간략히':'더보기',c);
  });return height+131;
 }
 function googleSources(ctx,p,state,x,y,w,c){if(!p.results.length)return 0;const expanded=state.sources.open,count=expanded?Math.min(5,p.results.length):1,h=expanded?count*133+64:187;
  group(ctx,p,'AI 개요 출처',x,y,w,h,edit=>{box(ctx,x,y,w,h,22,edit.background||c.bg,c.line);let at=y+24;for(const item of p.results.slice(0,count)){searchFavicon(ctx,item,x+20,at,18,c,{...brandAssets});uiText(ctx,item.site,x+46,at+14,12,c.text,600);sceneIcon(ctx,'more-vertical',x+w-29,at+3,17,c.muted);uiText(ctx,item.title+(item.title.includes(item.site)?'':' - '+item.site),x+20,at+44,15,c.text,600,'left',w-112);sceneParagraph(ctx,item.snippet,x+20,at+67,w-122,13,c.muted,19,400,2);thumb(ctx,item.thumbnail||refs.source,x+w-105,at+24,75,75,9,'출처 썸네일');at+=133}sceneBox(ctx,x+18,y+h-51,w-36,34,18,c.field);uiText(ctx,expanded?'간략히':'모두 표시',x+w/2,y+h-29,14,c.text,600,'center');searchControl(ctx,'source-expand',x+18,y+h-51,w-36,34,18)});return h;
 }
 function result(ctx,p,item,x,y,w,c,naver=false){
  const textWidth=w-(naver&&item.thumbnail?100:0),titleLines=sceneLines(ctx,item.title,textWidth,naver?17:20).slice(0,2),snippet=sceneLines(ctx,item.snippet,textWidth,14).slice(0,2),h=105+Math.max(0,titleLines.length-1)*26+snippet.length*21;
  group(ctx,p,'검색 결과 '+p.results.indexOf(item),x,y,w,h,()=>{
searchFavicon(ctx,item,x,y,27,c,{...brandAssets});uiText(ctx,item.site,x+39,y+11,14,c.text,500,'left',w-65);uiText(ctx,item.domain,x+39,y+28,12,c.muted,400,'left',w-60);sceneIcon(ctx,'more-vertical',Math.min(x+w-16,x+39+Math.min(280,item.domain.length*6)),y+10,16,c.muted);
  titleLines.forEach((line,i)=>uiText(ctx,line,x,y+60+i*26,naver?17:20,c.link));snippet.forEach((line,i)=>uiText(ctx,line,x,y+64+titleLines.length*26+i*21,14,c.muted,400,'left',w-(naver&&item.thumbnail?100:0)));
  if(naver&&item.thumbnail)thumb(ctx,item.thumbnail,x+w-82,y+45,82,82,11,'검색 결과 이미지');searchControl(ctx,'result',x-5,y-5,w+10,h-8,8);});return h;
 }
 function gallery(ctx,p,x,y,w,c,naver=false){const small=w<500,h=naver?430:small?300:360,photoH=naver?127:small?132:192,photos=naver?refs.imageGrid:refs.gallery;
  group(ctx,p,naver?'네이버 이미지':'Google 이미지',x,y,w,h,edit=>{
   if(naver)box(ctx,x,y,w,h,16,edit.background||c.bg,c.line);const left=x,inside=w;uiText(ctx,'이미지',left+(naver?20:0),y+28,naver?16:20,c.text,600);if(naver)uiText(ctx,'사람     로봇     인공지능     아이돌     종류     영화',left+20,y+61,12,c.muted);
   const n=naver?5:3,gap=naver?3:28,tile=(inside-gap*(n-1))/n,top=y+(naver?78:52),rows=naver?2:1;
   for(let row=0;row<rows;row++)for(let i=0;i<n;i++){
    const xx=left+i*(tile+gap),yy=top+row*(naver?130:0);thumb(ctx,photos[(row*n+i)%photos.length],xx,yy,tile,photoH,naver?0:18,'이미지 검색 '+(row*n+i+1));
    if(!naver){const titles=[p.query+' · 이미지 예시 01',p.query+' 관련 제품과 소식',p.query+' · 공간과 일상의 기록'];uiText(ctx,titles[i],xx,yy+photoH+23,13,c.text,400,'left',tile);uiText(ctx,p.results[i]?.site||'검색 결과',xx,yy+photoH+46,12,c.muted,400,'left',tile);sceneIcon(ctx,'more-vertical',xx+tile-13,yy+photoH+33,15,c.muted)}
   }
   const buttonY=y+h-38;if(naver){sceneLine(ctx,x,buttonY-9,x+w,buttonY-9,c.line);uiText(ctx,'이미지 더보기 →',x+w/2,buttonY+16,12,c.muted,400,'center')}
   else{sceneLine(ctx,x,buttonY+5,x+w,buttonY+5,c.line);sceneBox(ctx,x+w*.2,buttonY-15,w*.6,40,22,c.field);uiText(ctx,'이미지 더보기 ⌄',x+w/2,buttonY+10,14,c.text,500,'center')}
   searchControl(ctx,'images-more',x,buttonY-15,w,47,10);
  });return h;
 }
 function related(ctx,p,x,y,w,c,naver=false){const labels=p.suggestions.split('\n').filter(Boolean),items=labels.length?labels:[p.query+' 뜻',p.query+' 관련 정보',p.query+' 종류',p.query+' 활용'];const count=naver?6:4,h=naver?295:174;
  group(ctx,p,'관련 검색어',x,y,w,h,edit=>{if(naver)box(ctx,x,y,w,h,16,edit.background||c.bg,c.line);const left=x+(naver?20:0),inside=w-(naver?40:0);uiText(ctx,naver?'함께 많이 찾은':'관련 검색어',left,y+27,naver?16:20,c.text,600);const gap=14,cell=(inside-gap)/2;
   for(let i=0;i<count;i++){const xx=left+i%2*(cell+gap),yy=y+48+Math.floor(i/2)*(naver?53:60);sceneBox(ctx,xx,yy,cell,naver?43:49,naver?22:8,c.field);uiText(ctx,items[i%items.length],xx+18,yy+28,14,c.text,500,'left',cell-55);sceneIcon(ctx,'search',xx+cell-33,yy+14,18,c.muted);searchControl(ctx,'related-query:'+i,xx,yy,cell,naver?43:49,12)}
   if(naver){uiText(ctx,'‹    1 / 3    ›',x+w/2,y+h-24,13,c.muted,400,'center');searchControl(ctx,'related-page',x+w/2-70,y+h-47,140,36,18)}
  });return h;
 }
 function footer(ctx,p,width,y,x,w,c){
  const nav=p.type==='naver-search';group(ctx,p,'검색 페이지 번호',x,y,w,88,()=>{if(nav){uiText(ctx,'‹        1   2   3   4   5   6   7   8   9   10        ›',x+w/2,y+42,13,c.muted,400,'center')}
   else{uiText(ctx,'Goooooooooogle',x+w/2,y+36,32,c.text,400,'center');uiText(ctx,'1   2   3   4   5   6   7   8   9   10     다음',x+w/2,y+64,13,c.link,400,'center')}searchControl(ctx,'pagination',x,y,w,78,8)});
  const top=y+105,h=nav?168:150;sceneBox(ctx,0,top,width,h,0,p.theme==='dark'?'#17181a':'#f5f6f8');uiText(ctx,nav?'이용약관  개인정보처리방침  검색 고객센터  © NAVER Corp.':'검색 결과가 맞춤설정되어 있지 않습니다.',x,top+40,12,c.muted);if(!nav){uiText(ctx,'대한민국    · 위치 설정 · 위치 업데이트',x,top+80,13,c.muted);sceneLine(ctx,x,top+96,Math.min(width-28,x+w+450),top+96,c.line);uiText(ctx,'도움말    의견 보내기    개인정보처리방침    약관',x,top+126,12,c.muted)}return top+h;
 }
 function googleBody(ctx,p,state,width,top,assets,c){const l=layout(width,false),{x,w}=l;let y=top+l.header+42;
  if(p.type==='google-overview'){y+=overview(ctx,p,state,x,y,w,c);sceneLine(ctx,x,y+7,l.mobile?x+w:x+w+450,y+7,c.line);if(!l.mobile)googleSources(ctx,p,state,l.right,top+l.header+80,l.side,c);y+=47}
  const split=Math.min(2,p.results.length);for(let i=0;i<split;i++){y+=result(ctx,p,p.results[i],x,y,w,c);y+=12}
  if(p.searchExtras&&p.results.length){y+=20;y+=gallery(ctx,p,x,y,w,c,false)+26}
  for(const item of p.results.slice(split)){y+=result(ctx,p,item,x,y,w,c)+14}
  if(p.searchExtras){y+=16;y+=related(ctx,p,x,y,w,c,false)+20}
  return footer(ctx,p,width,y,x,w,c)+24;
 }
 function naverAI(ctx,p,state,x,y,w,c){
  const imageH=w<500?124:168,shift=168-imageH,bodyWidth=w-40,full=rich(ctx,p,p.answer,x+20,y+276-shift,bodyWidth,c,{font:16,line:26,paint:false}),collapsed=Math.min(226,full),bodyH=collapsed+(full-collapsed)*state.expanded.value,h=377-shift+bodyH;
  group(ctx,p,'네이버 AI 브리핑',x,y,w,h,edit=>{
   box(ctx,x,y,w,h,18,edit.background||(p.theme==='dark'?'#25282d':'#fafcfe'),c.line);spark(ctx,x+22,y+24,17,true);uiText(ctx,'AI 브리핑',x+46,y+39,17,c.text,600);sceneIcon(ctx,'more-vertical',x+w-31,y+23,18,c.muted);
   const gap=3,tile=(w-40-gap*2)/3;for(let i=0;i<3;i++)thumb(ctx,refs.ai[i],x+20+i*(tile+gap),y+60,tile,imageH,12,'AI 브리핑 이미지 '+(i+1));
   ctx.save();ctx.beginPath();ctx.rect(x+20,y+248-shift,bodyWidth,bodyH+2);ctx.clip();rich(ctx,p,answerText(p,state)||'답변을 준비하고 있습니다.',x+20,y+274-shift,bodyWidth,c,{font:16,line:26});if(full>collapsed&&state.expanded.value<1){const gradient=ctx.createLinearGradient(0,y+bodyH+205-shift,0,y+bodyH+250-shift);gradient.addColorStop(0,p.theme==='dark'?'#25282d00':'#fafcfe00');gradient.addColorStop(1,p.theme==='dark'?'#25282d':'#fafcfe');ctx.fillStyle=gradient;ctx.fillRect(x+20,y+bodyH+205-shift,bodyWidth,48)}ctx.restore();
   const buttonY=y+h-134;sceneLine(ctx,x+20,buttonY+14,x+w-20,buttonY+14,c.line);sceneBox(ctx,x+w/2-74,buttonY-2,148,39,21,p.theme==='dark'?'#353e50':'#e7eef9');uiText(ctx,state.expanded.open?'접어두기 ⌃':'펼쳐서 더보기⌄',x+w/2,buttonY+23,13,c.text,500,'center');searchControl(ctx,'ai-expand',x+w/2-74,buttonY-2,148,39,20);
   const askY=y+h-81;sceneBox(ctx,x+20,askY,w-40,60,32,p.theme==='dark'?'#303338':'#f5f5f5');uiText(ctx,'무엇이든 물어보세요',x+44,askY+37,18,c.muted,400,'left',w-126);sceneBox(ctx,x+w-74,askY+12,38,38,20,'#b8b8b8');sceneIcon(ctx,'up',x+w-64,askY+21,18,'#fff');searchControl(ctx,'query',x+20,askY,w-40,60,30);
  });return h;
 }
 function naverSide(ctx,p,x,y,w,c){const titles=p.results.slice(0,5).map(item=>item.title);
  group(ctx,p,'숏텐츠 카테크 종합',x,y,w,467,edit=>{box(ctx,x,y,w,467,18,edit.background||c.bg,c.line);uiText(ctx,'숏텐츠 · 함께 보는 이야기  ⓘ',x+20,y+35,17,c.text,600);uiText(ctx,'AI가 생성한 결과로 정확하지 않을 수 있어요.',x+20,y+61,14,c.muted);let yy=y+83;for(let i=0;i<5;i++){sceneBox(ctx,x+20,yy,w-40,52,15,c.field);sceneIcon(ctx,'search',x+35,yy+17,19,'#6d81aa');uiText(ctx,titles[i],x+65,yy+32,15,c.text,600,'left',w-140);thumb(ctx,refs.trends[i],x+w-69,yy+8,36,36,8,'숏텐츠 썸네일 '+(i+1));searchControl(ctx,'trend:'+i,x+20,yy,w-40,52,14);yy+=62;if(i===2){sceneParagraph(ctx,'새로운 소식과 다양한 사용 후기를 살펴보세요.',x+36,yy+7,w-108,13,c.muted,19,400,2);yy+=48}}});
  group(ctx,p,'네이버 소식',x,y+489,w,249,edit=>{box(ctx,x,y+489,w,249,18,edit.background||c.bg,c.line);for(const [i,title]of ['제작 도구 살펴보기','새로운 작업 이야기','프로젝트 자료 모음','아이디어를 기록하는 방법'].entries()){const yy=y+511+i*53;sceneBox(ctx,x+20,yy,32,32,17,['#b07ce9','#3bc59d','#345ec3','#2cb2c5'][i]);sceneIcon(ctx,['star','gift','grid','sparkles'][i],x+27,yy+7,18,'#fff');uiText(ctx,title,x+67,yy+14,14,c.text,600,'left',w-100);uiText(ctx,['작업에 필요한 도구를 찾아보세요','제작 과정과 팁을 나눕니다','필요한 자료를 정리해 보세요','다음 프로젝트를 준비하세요'][i],x+67,yy+34,12,c.muted,400,'left',w-100);sceneIcon(ctx,'chevron',x+w-30,yy+11,13,c.muted);searchControl(ctx,'promotion:'+i,x+15,yy-5,w-30,48,10)}});
 }
 function clips(ctx,p,x,y,w,c){const h=424;
  group(ctx,p,'네이버 클립',x,y,w,h,edit=>{box(ctx,x,y,w,h,17,edit.background||c.bg,c.line);uiText(ctx,'네이버 클립  ⓘ',x+20,y+31,17,c.text,600);const gap=12,tile=(w-40-gap*3)/4;
   for(let i=0;i<4;i++){const xx=x+20+i*(tile+gap);thumb(ctx,refs.clips[i],xx,y+53,tile,250,12,'클립 영상 '+(i+1));uiText(ctx,['Studio One','Frame Journal','Creator Notes','Project Lab'][i],xx,y+329,12,c.text,500,'left',tile);uiText(ctx,['1일 전 · 조회 815','8시간 전 · 조회 203','1일 전 · 조회 82','5일 전 · 조회 6.7천'][i],xx,y+349,11,c.muted,400,'left',tile);searchControl(ctx,'clip:'+i,xx,y+53,tile,250,10)}sceneLine(ctx,x,y+h-53,x+w,y+h-53,c.line);uiText(ctx,'클립 더보기 →',x+w/2,y+h-21,13,c.muted,400,'center');searchControl(ctx,'clips-more',x,y+h-53,w,53,12)
  });return h;
 }
 function news(ctx,p,x,y,w,c){const h=610;
  group(ctx,p,'네이버 뉴스',x,y,w,h,edit=>{box(ctx,x,y,w,h,17,edit.background||c.bg,c.line);uiText(ctx,'뉴스',x+20,y+32,17,c.text,600);uiText(ctx,'관련도순 · 최신순',x+w-24,y+31,12,c.muted,400,'right');let yy=y+62;
   for(let i=0;i<3;i++){const item=p.results[(i+3)%Math.max(1,p.results.length)];if(!item)break;sceneParagraph(ctx,item.title,x+20,yy+18,w-142,17,c.link,25,500,1);sceneParagraph(ctx,item.snippet,x+20,yy+48,w-142,14,c.muted,22,400,2);thumb(ctx,refs.news[i],x+w-106,yy,86,86,10,'뉴스 사진 '+(i+1));searchFavicon(ctx,item,x+20,yy+105,17,c,{...brandAssets});uiText(ctx,item.site+' · 8시간 전 · 네이버뉴스',x+46,yy+118,12,c.muted);if(i===0){sceneBox(ctx,x+20,yy+135,w-40,45,10,c.field);uiText(ctx,'관련 기사 더보기 ›',x+34,yy+163,13,c.link);searchControl(ctx,'news-related',x+20,yy+135,w-40,45,10)}searchControl(ctx,'news:'+i,x+15,yy-3,w-30,i===0?180:141,8);yy+=i===0?197:151;if(i<2)sceneLine(ctx,x+20,yy-10,x+w-20,yy-10,c.line)}sceneLine(ctx,x,y+h-48,x+w,y+h-48,c.line);uiText(ctx,'뉴스 더보기 →',x+w/2,y+h-19,13,c.muted,400,'center');searchControl(ctx,'news-more',x,y+h-48,w,48,10)
  });return h;
 }
 function naverBody(ctx,p,state,width,top,assets,c){const l=layout(width,true),{x,w}=l;let y=top+l.header+28;
  if(p.aiBriefing){y+=naverAI(ctx,p,state,x,y,w,c)+40;if(!l.mobile)naverSide(ctx,p,l.right,top+l.header+28,l.side,c)}
  if(p.naverShowBrand!==false){group(ctx,p,'브랜드 콘텐츠',x,y,w,112,edit=>{box(ctx,x,y,w,112,15,edit.background||c.bg,c.line);uiText(ctx,'브랜드 콘텐츠',x+20,y+32,16,c.text,600);sceneLine(ctx,x,y+58,x+w,y+58,c.line);uiText(ctx,'브랜드 콘텐츠 더보기 →',x+w/2,y+90,13,c.muted,400,'center');searchControl(ctx,'brand-more',x,y+58,w,54,10)});y+=152}
  if(p.naverShowClips!==false)y+=clips(ctx,p,x,y,w,c)+40;
  if(p.naverShowNews!==false)y+=news(ctx,p,x,y,w,c)+40;
  if(p.naverShowRelated!==false)y+=related(ctx,p,x,y,w,c,true)+40;
  const organic=p.results.slice(0,3),heights=[275,340,240],organicH=organic.reduce((sum,_,i)=>sum+heights[i],0);
  if(p.naverShowWeb!==false&&organic.length){group(ctx,p,'통합검색 웹 결과',x,y,w,organicH,edit=>{box(ctx,x,y,w,organicH,16,edit.background||c.bg,c.line);let yy=y;for(const [i,item]of organic.entries()){const h=heights[i];group(ctx,p,'통합검색 결과 '+(i+1),x+20,yy+20,w-40,h-40,()=>{result(ctx,p,item,x+20,yy+25,w-40,c,i===2);if(i===0){uiText(ctx,'감독 · 제작 · 분야별 정보',x+20,yy+181,13,c.muted);uiText(ctx,'줄거리     출연진     관련 문서     이미지     외부 링크',x+20,yy+h-32,12,c.muted,400,'left',w-40)}if(i===1)for(let j=0;j<4;j++)thumb(ctx,refs.ai[j%3],x+20+j*(w-40)/4,yy+165,(w-46)/4,135,7,'교육 콘텐츠 '+j)});yy+=h;if(i<organic.length-1)sceneLine(ctx,x+20,yy,x+w-20,yy,c.line)}});y+=organicH+18}
  if(p.naverShowImages!==false){y+=22;y+=gallery(ctx,p,x,y,w,c,true)+40;}
  if(p.naverShowPosts!==false){
   const h=1390;group(ctx,p,'블로그·카페 검색',x,y,w,h,edit=>{box(ctx,x,y,w,h,16,edit.background||c.bg,c.line);let yy=y+26;for(let i=0;i<5;i++){const item=p.results[(i+3)%Math.max(1,p.results.length)];if(!item)break;result(ctx,p,item,x+20,yy,w-40,c,true);if(i<3){for(let j=0;j<4;j++)thumb(ctx,refs.ai[(i+j)%3],x+20+j*(w-40)/4,yy+143,(w-46)/4,105,7,'블로그 첨부 이미지 '+i+'-'+j);yy+=110}yy+=205}});y+=h+28;
  }
  const count=p.searchExtras?9:Math.max(0,p.results.length-3);
  for(let i=0;p.naverShowMore!==false&&i<count;i++){const item=p.results[(i+3)%Math.max(1,p.results.length)];if(!item)break;const h=p.searchExtras?235:190;group(ctx,p,'추가 검색 결과 '+(i+1),x,y,w,h,edit=>{box(ctx,x,y,w,h,16,edit.background||c.bg,c.line);result(ctx,p,item,x+20,y+25,w-40,c,false)});y+=h+18}
  return footer(ctx,p,width,y+10,x,w,c)+24;
 }
 return{refs,defaults,validate,ready,image,state,aiLayout,aiBlocks,aiHome,aiChrome,aiBody,aiComposer,naverMenu,naverToolbar,naverOverlay,layout,group,header,thumb,nlogo,spark,rich,answerText,overview,googleSources,citation,result,gallery,googleBody,naverBody};
})();
if(typeof module!=='undefined')module.exports=SearchUI;
