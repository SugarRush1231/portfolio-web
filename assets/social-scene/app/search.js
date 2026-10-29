'use strict';

const SEARCH_UI=typeof SearchUI!=='undefined'?SearchUI:require('./search-layout.js');
const SearchMotion = typeof module !== 'undefined' ? require('./scene.js') : { chatTypingText, easeScene };

function searchPlayback(p, time) {
  const still = p.motion === 'still';
  const start = Math.max(0, p.searchAt - p.queryDuration - .2);
  const end = Math.max(start + .1, p.searchAt - .2);
  const queryProgress = still ? 1 : Math.max(0, Math.min(1, (time - start) / (end - start)));
  const resultsAt = p.searchAt + .4;
  return {
    ...SEARCH_UI.state(p,time),
    phase: still || time >= resultsAt ? 'results' : time >= p.searchAt ? 'loading' : 'typing',
    query: SearchMotion.chatTypingText(p.query, queryProgress),
    queryProgress,
    answerProgress: still ? 1 : Math.max(0, Math.min(1, (time - resultsAt - .2) / Math.max(.2, Math.min(p.answerDuration, p.duration - resultsAt - .2)))),
    resultsOpacity: still ? 1 : SearchMotion.easeScene((time - resultsAt) / .3),
  };
}

function searchCamera(p, time, width, height) {
  if (p.camera === 'none') return { zoom: 1, x: width / 2, y: height / 2 };
  const t = p.motion === 'still' ? p.duration + 20 : time;
  const resultProgress = SearchMotion.easeScene((t - p.searchAt - .4) / 1.4);
  const approach = p.camera === 'follow' ? SearchMotion.easeScene(t / 1.2) * (1 - SearchMotion.easeScene((t - p.searchAt + .55) / .55)) : 0;
  const zoom = 1 + (p.cameraZoom - 1) * (approach + resultProgress);
  const targetX = width < 700 ? width / 2 : width * .43;
  const x = width / 2 + (targetX - width / 2) * resultProgress;
  const y = height * (.45 + .07 * resultProgress);
  return {
    zoom,
    x: Math.max(width / (2 * zoom), Math.min(width - width / (2 * zoom), x)),
    y: Math.max(height / (2 * zoom), Math.min(height - height / (2 * zoom), y)),
  };
}

function searchWordmark(ctx, brand, assets, x, y, width) {
  if (brand === 'google' && assets.googleLogo) {
    ctx.drawImage(assets.googleLogo, x, y, width, width * assets.googleLogo.naturalHeight / assets.googleLogo.naturalWidth); return;
  }
  if (brand === 'naver') { sceneText(ctx, 'NAVER', x, y + width * .24, width * .255, '#03c75a', 700); return; }
  let cursor = x; const letters = 'Google', colors = ['#4285f4', '#ea4335', '#fbbc05', '#4285f4', '#34a853', '#ea4335'];
  [...letters].forEach((letter, i) => { sceneText(ctx, letter, cursor, y + width * .32, width * .36, colors[i], 600); cursor += ctx.measureText(letter).width; });
}
function searchStrokeBox(ctx, x, y, width, height, radius, fill, stroke) {
  sceneBox(ctx, x, y, width, height, radius, fill); ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.stroke();
}
function searchControl(ctx,action,x,y,width,height,radius=9){
  const transform=ctx.getTransform(),a=transform.transformPoint({x,y}),b=transform.transformPoint({x:x+width,y:y+height});
  const clip=ctx.canvas._searchClip||{left:0,top:0,right:ctx.canvas.width,bottom:ctx.canvas.height};
  const left=Math.max(a.x,clip.left),top=Math.max(a.y,clip.top),right=Math.min(b.x,clip.right),bottom=Math.min(b.y,clip.bottom);
  if(right<=left||bottom<=top)return;
  const id=action+'@'+x+','+y;
  ctx.canvas._searchControls?.push({id,action,left,top,right,bottom});
  const pointer=ctx.canvas._searchPointer;
  if(!pointer||ctx._searchExport||action==='naver-panel')return;
  const opacity=pointer.pressed===id?.14:pointer.hover===id?.07*(pointer.alpha??1):0;
  if(opacity){ctx.save();ctx.globalAlpha=opacity;sceneBox(ctx,x,y,width,height,radius,ctx._searchFeedbackColor||'#808080');ctx.restore()}
}
function searchBrowser(ctx,p,width,colors,phase){
  const desktop=width>700;
  if(!p.browserFrame)return 0;
  const host=p.type==='naver-search'?'search.naver.com':'www.google.com';
  if(desktop)return SceneBrowser.paint(ctx,p,width,colors,phase==='typing'?host:host+'/search?q='+p.query,phase==='typing'?'새 탭':p.query+' - 검색',searchControl);
  const height=p.device==='android'?80:91;
  sceneBox(ctx,0,0,width,height,0,colors.bg);scenePaintSystemStatus(ctx,p,width,colors.text,colors.bg);
  sceneBox(ctx,16,36,width-72,39,p.device==='android'?24:12,colors.field);searchControl(ctx,'browser-address',16,36,width-72,39,12);
  sceneIcon(ctx,'globe',28,47,15,colors.muted);sceneText(ctx,host,51,62,14,colors.text,400,'left',width-135);
  searchControl(ctx,'browser-menu',width-48,38,35,35,18);sceneIcon(ctx,p.device==='android'?'more-vertical':'share',width-41,45,22,colors.muted);return height;
}
function searchInput(ctx, p, state, x, y, width, height, colors, naver = false, assets = {}) {
  searchStrokeBox(ctx, x, y, width, height, height / 2, colors.field, naver ? colors.field : colors.line);
  searchControl(ctx,'query',x,y,width-104,height,height/2);
  const size = width < 500 ? 16 : 20;
  if (naver) sceneText(ctx, 'N', x + 22, y + height * .68, 30, '#03c75a', 700);
  else sceneIcon(ctx, 'search', x + 18, y + (height - 22) / 2, 22, colors.muted);
  ctx.save(); ctx.beginPath(); ctx.rect(x + 58, y + 6, width - 160, height - 12); ctx.clip();
  sceneText(ctx, state.query, x + 58, y + height * .64, size, colors.text);
  if (state.phase === 'typing' && Math.floor(state.queryProgress * 14) % 2 === 0) {
    const cursor = Math.min(width - 104, 60 + ctx.measureText(state.query).width);
    sceneLine(ctx, x + cursor, y + height * .28, x + cursor, y + height * .74, colors.text);
  }
  ctx.restore();
  searchControl(ctx,naver?'keyboard':'voice',x+width-94,y+(height-36)/2,36,36,18);
  searchControl(ctx,naver?'submit':'lens',x+width-52,y+(height-36)/2,36,36,18);
  if(!naver&&assets.googleMic){ctx.save();if(p.theme==='dark')ctx.filter='brightness(2.5)';ctx.drawImage(assets.googleMic,x+width-85,y+(height-22)/2,22,22);ctx.restore()}
  else sceneIcon(ctx,naver?'keyboard':'mic',x+width-85,y+(height-22)/2,22,colors.muted);
  if(!naver&&assets.googleLens){ctx.save();if(p.theme==='dark')ctx.filter='brightness(2.5)';ctx.drawImage(assets.googleLens,x+width-43,y+(height-22)/2,22,22);ctx.restore()}
  else sceneIcon(ctx,naver?'search':'camera',x+width-43,y+(height-22)/2,22,naver?'#03c75a':colors.muted);
}
function searchHome(ctx, p, state, width, height, top, assets, colors) {
  const mobile = width < 700, naver = p.type === 'naver-search';
  const inputWidth = mobile ? width - 32 : Math.min(760, width - 360);
  const x = (width - inputWidth) / 2, y = Math.max(top + 140, height * .43), boxHeight = mobile ? 53 : 60;
  searchWordmark(ctx, naver ? 'naver' : 'google', assets, (width - (naver ? 260 : 272)) / 2, y - (mobile ? 95 : 120), naver ? 260 : 272);
  searchInput(ctx, p, state, x, y, inputWidth, boxHeight, colors, naver, assets);
  if (state.phase === 'typing' && state.query && p.suggestions.trim()) {
    const suggestions = p.suggestions.split('\n').filter(Boolean).slice(0, 4);
    searchStrokeBox(ctx, x, y + boxHeight + 8, inputWidth, suggestions.length * 42 + 16, 15, colors.bg, colors.line);
    suggestions.forEach((value, i) => {
      searchControl(ctx,'submit',x+8,y+boxHeight+16+i*42,inputWidth-16,42,8);
      sceneIcon(ctx, 'search', x + 20, y + boxHeight + 29 + i * 42, 18, colors.muted);
      sceneText(ctx, value, x + 58, y + boxHeight + 44 + i * 42, mobile ? 14 : 17, colors.text, 400, 'left', inputWidth - 92);
    });
  } else if (state.phase === 'loading') {
    sceneText(ctx, '검색 중', width / 2 - 18, y + boxHeight + 48, 14, colors.muted, 400, 'center');
    for (let i = 0; i < 3; i++) sceneBox(ctx, width / 2 + 18 + i * 9, y + boxHeight + 42, 4, 4, 2, ['#4285f4', '#ea4335', '#34a853'][i]);
  } else {
    searchControl(ctx,'submit',width/2-150,y+boxHeight+22,300,40,6);
    const label = naver ? '메일     카페     블로그     쇼핑     뉴스' : 'Google 검색          I’m Feeling Lucky';
    sceneText(ctx, label, width / 2, y + boxHeight + 48, mobile ? 12 : 14, colors.muted, 400, 'center');
  }
  if (!mobile) sceneText(ctx, naver ? 'NAVER' : '대한민국', 32, height - 28, 13, colors.muted);
}
function searchHeader(ctx, p, state, width, top, assets, colors) {
  const mobile = width < 700, naver = p.type === 'naver-search';
  if (naver) {
    searchInput(ctx, p, state, mobile ? 16 : 70, top + 19, mobile ? width - 32 : Math.min(800, width - 360), 56, colors, true, assets);
  } else {
    searchWordmark(ctx, 'google', assets, mobile ? (width - 92) / 2 : 36, top + (mobile ? 17 : 31), mobile ? 92 : 118);
    searchInput(ctx, p, state, mobile ? 16 : 204, top + (mobile ? 72 : 18), mobile ? width - 32 : Math.min(760, width - 360), mobile ? 49 : 56, colors, false, assets);
  }
  const navY = top + (mobile && !naver ? 158 : 114), left = mobile ? 20 : naver ? 82 : 216;
  const tabs = naver ? ['AI', '뉴스', '어학사전', '클립', '이미지', '블로그', '카페', '지식iN', '동영상', '쇼핑', '···'] : ['AI 모드', '전체', '이미지', '동영상', '뉴스', '더보기'];
  let cursor = left;
  tabs.forEach((label, i) => {
    if (cursor > width - 50) return;
    searchControl(ctx,'tab-'+label,cursor-7,navY-23,ctx.measureText(label).width+14,40,8);
    sceneText(ctx, label, cursor, navY, mobile ? 13 : 15, !naver && i === 1 ? colors.text : colors.muted, !naver && i === 1 ? 700 : 400);
    if (naver && i === 0) { sceneBox(ctx, cursor + 16, navY - 22, 13, 13, 7, '#ff555c'); sceneText(ctx, 'N', cursor + 22.5, navY - 12, 8, '#fff', 700, 'center'); }
    if (!naver && i === 1) sceneBox(ctx, cursor, navY + 12, 28, 3, 1, colors.text);
    cursor += ctx.measureText(label).width + (mobile ? 25 : 30);
  });
  sceneLine(ctx, 0, navY + 18, width, navY + 18, colors.line);
  if (!mobile) {
    searchControl(ctx,'apps',width-(naver?67:120),top+21,37,37,19);
    sceneIcon(ctx, 'grid', width - (naver ? 58 : 111), top + 30, 19, colors.muted);
    if (naver) { searchStrokeBox(ctx, width - 142, top + 25, 58, 26, 2, colors.bg, colors.line);searchControl(ctx,'login',width-142,top+25,58,26,2); sceneText(ctx, '로그인', width - 113, top + 43, 12, colors.muted, 400, 'center'); }
    else { sceneBox(ctx, width - 66, top + 26, 35, 35, 18, '#d5e6d1');searchControl(ctx,'account',width-70,top+22,43,43,22); sceneText(ctx, 'S', width - 48, top + 50, 16, '#365647', 700, 'center'); }
  }
  return navY + 50;
}
function searchFavicon(ctx, result, x, y, size, colors, assets = {}) {
  ctx.save(); ctx.translate(x, y); ctx.scale(size / 28, size / 28);
  sceneBox(ctx, 0, 0, 28, 28, 14, colors.field);
  const image = result.favicon === 'custom' ? assets.favicons?.[result.faviconImage] : result.favicon === 'google' ? assets.googleFavicon : null;
  if (image) {
    const scale = 24 / Math.max(image.naturalWidth, image.naturalHeight);
    ctx.drawImage(image, (28 - image.naturalWidth * scale) / 2, (28 - image.naturalHeight * scale) / 2, image.naturalWidth * scale, image.naturalHeight * scale);
  } else if (result.favicon === 'naver') sceneText(ctx, 'N', 14, 22, 22, '#03c75a', 700, 'center');
  else if (result.favicon === 'youtube') {
    sceneBox(ctx, 1, 5, 26, 18, 5, '#ff0033');
    ctx.beginPath(); ctx.moveTo(11, 9); ctx.lineTo(19, 14); ctx.lineTo(11, 19); ctx.closePath(); ctx.fillStyle = '#fff'; ctx.fill();
  } else if (result.favicon === 'wikipedia') {
    ctx.font = '22px Georgia,serif'; ctx.fillStyle = colors.text; ctx.textAlign = 'center'; ctx.fillText('W', 14, 22);
  } else if (result.favicon === 'letter') {
    const first = [...new Intl.Segmenter('ko', { granularity: 'grapheme' }).segment(result.site.trim())][0]?.segment || 'S';
    sceneText(ctx, first.toUpperCase(), 14, 21, 18, colors.text, 700, 'center');
  } else sceneIcon(ctx, 'globe', 5, 5, 18, colors.muted);
  ctx.restore();
}
function searchResultCard(ctx, result, x, y, width, colors, naver = false, assets = {}) {
  searchControl(ctx,'result',x-7,y-5,width+14,84+Math.min(2,sceneLines(ctx,result.title,width,width<500?18:21).length)*28+Math.min(4,sceneLines(ctx,result.snippet,width,width<500?13:15).length)*22,8);
  searchFavicon(ctx, result, x, y, 27, colors, assets);
  sceneText(ctx, result.site, x + 39, y + 10, 13, colors.text, 500, 'left', width - 50);
  sceneText(ctx, result.domain, x + 39, y + 28, 11, colors.muted, 400, 'left', width - 50);
  const title = sceneParagraph(ctx, result.title, x, y + 62, width, width < 500 ? 18 : 21, colors.link, 28, 400, 2);
  const snippet = sceneParagraph(ctx, result.snippet, x, y + 68 + title, width, width < 500 ? 13 : 15, colors.muted, 22, 400, 4);
  return 84 + title + snippet + (naver ? 12 : 25);
}
function searchSources(ctx, p, x, y, width, colors, compact = false, assets = {}) {
  let cursor = x;
  for (const item of p.results.slice(0, 3)) {
    if (compact) {
      const w = Math.min(width, 120);
      if (cursor + w > x + width) break;
      searchStrokeBox(ctx, cursor, y, w, 31, 16, colors.bg, colors.line);
      searchControl(ctx,'source',cursor,y,w,31,16);
      searchFavicon(ctx, item, cursor + 8, y + 7, 17, colors, assets);
      sceneText(ctx, item.site, cursor + 31, y + 21, 11, colors.text, 400, 'left', w - 39); cursor += w + 7;
    } else {
      searchStrokeBox(ctx, x, y, width, 116, 13, colors.bg, colors.line);
      searchControl(ctx,'source',x,y,width,116,13);
      searchFavicon(ctx, item, x + 15, y + 10, 22, colors, assets);
      sceneText(ctx, item.site, x + 46, y + 25, 12, colors.muted, 500, 'left', width - 61);
      sceneParagraph(ctx, item.title, x + 15, y + 54, width - 30, 15, colors.text, 23, 500, 2); y += 130;
    }
  }
}
function searchAnswer(ctx, p, state, x, y, width, colors, naver = false, assets = {}) {
  sceneIcon(ctx, 'sparkles', x, y - 20, 24, naver ? '#03c75a' : '#6b63df');
  sceneText(ctx, naver ? 'AI 브리핑' : p.type === 'google-ai' ? 'AI 답변' : 'AI 개요', x + 35, y, 19, colors.text, 700);
  const segments = [...new Intl.Segmenter('ko', { granularity: 'grapheme' }).segment(p.answer)].map(item => item.segment);
  const answer = segments.slice(0, Math.floor(segments.length * state.answerProgress)).join('');
  const lineHeight = width < 500 ? 25 : 29, font = width < 500 ? 15 : 17;
  const height = sceneParagraph(ctx, answer || '답변을 준비하고 있어요…', x, y + 41, width, font, answer ? colors.text : colors.muted, lineHeight, 400, 500);
  searchSources(ctx, p, x, y + height + 64, width, colors, true, assets);
  return height + 126;
}
function searchResults(ctx,p,state,width,height,top,assets,colors){
  return p.type==='naver-search'?SEARCH_UI.naverBody(ctx,p,state,width,top,assets,colors):SEARCH_UI.googleBody(ctx,p,state,width,top,assets,colors);
}
function searchAiMode(ctx,p,state,width,height,top,assets,colors){return SEARCH_UI.aiBody(ctx,p,state,width,height,top,assets,colors)}
function searchAiComposer(ctx,p,width,height,assets,colors){return SEARCH_UI.aiComposer(ctx,p,searchPlayback(p,ctx.sceneTime),width,height,ctx._searchTop,assets,colors)}
function renderSearchScene(canvas, p, time, assets) {
  const ctx = canvas.getContext('2d'), mobile = p.device !== 'desktop';
  ctx.scenePlatform=p.type;ctx.sceneProject=p;ctx.sceneTime=time;ctx.sceneIconAssets=assets.nativeIcons;
  ElementRender.beginCanvas(ctx,p,searchPlayback(p,time).phase);
  const width = mobile ? 432 : 1920, height = mobile ? (p.ratio==='device'?(p.device==='android'?960:432*2532/1170):768) : 1080;
  const colors = p.theme === 'dark' ? {
    bg: '#202124', page: '#17191c', field: '#35363f', chrome: '#17181a', text: '#e8eaed', muted: '#adb4bc', line: '#45484e', link: '#a8c7fa',
  } : { bg: '#fff', page: '#f5f6f8', field: '#f2f4f7', chrome: '#e9edf3', text: '#202124', muted: '#687078', line: '#dfe3e8', link: '#1a0dab' };
  if (p.type === 'naver-search' && p.theme === 'light') { colors.page = '#fff'; colors.field = '#f6f6f6'; colors.link = '#1559a5'; colors.line = '#e3e5e8'; }
  if(p.type==='google-ai'){colors.bg=p.theme==='dark'?'#22252a':'#fff';colors.field=p.theme==='dark'?'#363940':'#f0f4f9';colors.line=p.theme==='dark'?'#4a4e56':'#dce1e8';colors.muted=p.theme==='dark'?'#a1a6b0':'#70757a'}
  const state=searchPlayback(p,time),camera=searchCamera(p,time,width,height);
  const top=p.browserFrame?(mobile?(p.device==='android'?80:91):SceneBrowser.height(p)):mobile?32:0;
  const bottom=mobile?25:0,composer=state.phase==='results'&&p.type==='google-ai';
  const scale=Math.min(canvas.width/width,canvas.height/height),left=(canvas.width-width*scale)/2,offsetY=(canvas.height-height*scale)/2;
  const visibleBottom=height-bottom-(composer?146:0);
  ctx._searchTop=top;
  const elapsed=Math.max(0,time-p.searchAt-.4),scrollProject={...p,duration:Math.max(.1,p.duration-p.searchAt-.4)};
  const scroll=state.phase==='results'?(p._scrollPaint??SceneScroll.position(scrollProject,p.scrollKeys?.length?time:elapsed,visibleBottom-top,10000,!p._export&&matchMedia('(prefers-reduced-motion:reduce)').matches)):0;
  canvas._searchControls=[];canvas._searchScale=scale*camera.zoom;
  ctx._searchExport=p._export;ctx._searchFeedbackColor=colors.text;
  ctx.save();ctx.fillStyle=colors.bg;ctx.fillRect(0,0,canvas.width,canvas.height);
  ctx.translate(left,offsetY);ctx.scale(scale,scale);
  const pinned=state.phase==='results'&&p.type!=='google-ai',clipTop=top+(p.type==='google-ai'?SEARCH_UI.aiLayout(width,height,top).header:pinned?SEARCH_UI.layout(width,p.type==='naver-search').header:0);
  ctx.beginPath();ctx.rect(0,clipTop,width,visibleBottom-clipTop);ctx.clip();
  canvas._searchClip={left,top:offsetY+top*scale,right:left+width*scale,bottom:offsetY+visibleBottom*scale};
  ctx.translate(width/2,height/2);ctx.scale(camera.zoom,camera.zoom);ctx.translate(-camera.x,-camera.y-scroll);
  sceneBox(ctx,0,0,width,height+scroll,0,colors.bg);
  let contentBottom=0;
  if(state.phase!=='results'){if(p.type==='google-ai')SEARCH_UI.aiHome(ctx,p,state,width,height,top,assets,colors);else searchHome(ctx,p,state,width,height,top,assets,colors)}
  else{
    ctx.save();ctx.globalAlpha=state.resultsOpacity;
    contentBottom=p.type==='google-ai'?searchAiMode(ctx,p,state,width,height,top,assets,colors):searchResults(ctx,p,state,width,height,top,assets,colors);
    ctx.restore();
  }
  ctx.restore();
  const worldBottom=camera.y+(visibleBottom-height/2)/camera.zoom;
  canvas._searchMaxScroll=state.phase==='results'?Math.min(10000,Math.max(0,contentBottom-worldBottom)):0;
  canvas._searchScroll=Math.min(scroll,canvas._searchMaxScroll);
  if(scroll>canvas._searchMaxScroll+.1&&p._scrollPaint===undefined)return renderSearchScene(canvas,{...p,_scrollPaint:canvas._searchMaxScroll},time,assets);
  canvas._searchClip={left,top:offsetY,right:left+width*scale,bottom:offsetY+(height-bottom)*scale};
  ctx.save();ctx.translate(left,offsetY);ctx.scale(scale,scale);
  if(pinned){ctx.save();ctx.globalAlpha=state.resultsOpacity;SEARCH_UI.header(ctx,p,state,width,top,assets,colors);ctx.restore()}
  if(p.type==='google-ai')SEARCH_UI.aiChrome(ctx,p,width,height-bottom,top,assets,colors);
  if(composer)searchAiComposer(ctx,p,width,height-bottom,assets,colors);
  searchBrowser(ctx,p,width,colors,state.phase);
  if(p.type==='naver-search'&&!mobile&&!pinned)SEARCH_UI.naverToolbar(ctx,p,width,top,colors);
  SEARCH_UI.naverOverlay(ctx,p,width,top,colors);
  if(mobile){
    if(!p.browserFrame){sceneBox(ctx,0,0,width,top,0,colors.bg);scenePaintSystemStatus(ctx,p,width,colors.text,colors.bg)}
    sceneBox(ctx,0,height-bottom,width,bottom,0,colors.bg);scenePaintSystemHome(ctx,p,width,height,colors.text);
  }
  ctx.restore();ElementRender.endCanvas(ctx);
}

if (typeof module !== 'undefined') module.exports = { searchPlayback, searchCamera };
