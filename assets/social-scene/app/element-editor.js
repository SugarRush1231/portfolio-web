 'use strict';
const ElementEditor=(()=>{
 let active=false,selected='',seen='',currentProject=null;const $e=id=>document.getElementById(id);
 function entries(){if(project.type.startsWith('google-')||project.type==='naver-search')return canvas._elementItems||[];return [...(phonePreview._elementRegistry?.values()||[])].filter(x=>x.nodes.some(n=>!n.closest('[inert]')))}
 function item(){return entries().find(x=>x.key===selected)}
 function node(entry){return entry?.nodes?.find(n=>!n.closest('[inert]'))||entry?.node}
 function setActive(value){if(value&&typeof OverlayEditor!=='undefined')OverlayEditor.setActive(false);active=value;ElementRender.editing=value;$e('edit-elements').setAttribute('aria-pressed',String(value));$e('element-fields').hidden=!value;if(value){pausePreview();selectInspectorTab('content')}draw()}
 function change(name,value){const entry=item();if(!entry)return;
  if(name==='text'&&entry.field){const target=node(entry);if(target.matches('input,textarea'))target.value=value;else target.textContent=value;target.dispatchEvent(new Event('input',{bubbles:true}));if(project.elementEdits?.[selected])delete project.elementEdits[selected].text;dirty.add(project.type);draw();return}
  const next={...(project.elementEdits||{}),[selected]:{...(project.elementEdits?.[selected]||{}),[name]:value}};
  try{project.elementEdits=ElementModel.validate({...project,elementEdits:next}).elementEdits;dirty.add(project.type);draw()}catch(e){tell(e.message)}
 }
 function select(key){selectInspectorTab('content');selected=key;renderControls();drawOutline()}
 function reset(){if(!selected)return;delete project.elementEdits[selected];dirty.add(project.type);seen='';draw();renderControls()}
 function renderControls(){
  const entry=item(),box=$e('element-controls');box.hidden=!entry;$e('element-empty').hidden=!!entry;if(!entry)return;
  const edit=project.elementEdits?.[selected]||{},target=node(entry),style=target?getComputedStyle(target):null;
  $e('element-source-note').textContent=entry.field?'원본 데이터도 함께 수정합니다.':entry.kind==='text'?'표시를 직접 바꿉니다. 자동 문구·수치보다 우선 적용됩니다.':'원래 버튼 동작을 유지하면서 모양을 수정합니다.';
  $e('element-label').textContent=({text:'글자',icon:'아이콘',image:'이미지',box:'영역'})[entry.kind]+' · '+entry.label;
  $e('element-text-label').hidden=entry.kind!=='text';$e('element-text').value=edit.text??(target?(target.value??target.textContent):entry.original??'');
  $e('element-icon-label').hidden=!['icon','image'].includes(entry.kind);$e('element-upload-label').hidden=!['icon','image'].includes(entry.kind);
  $e('element-icon').value=edit.icon||'';$e('element-hidden').checked=!!edit.hidden;
  for(const [key,defaultValue]of [['x',0],['y',0],['scale',1],['opacity',1],['fontSize',parseFloat(style?.fontSize)||15],['fontWeight',parseFloat(style?.fontWeight)||400]])$e('element-'+key).value=edit[key]??defaultValue;
  $e('element-font').value=edit.font||'auto';
  const hex=(v,fallback)=>{const rgb=/rgba?\((\d+)[ ,]+(\d+)[ ,]+(\d+)/.exec(v||'');return rgb?'#'+rgb.slice(1).map(x=>(+x).toString(16).padStart(2,'0')).join(''):fallback};
  $e('element-color').value=edit.color||hex(style?.color,'#111111');$e('element-background').value=edit.background||hex(style?.backgroundColor,'#ffffff');
  $e('element-type-controls').hidden=entry.kind!=='text';$e('element-parent').disabled=!target?.parentElement?.closest('[data-element-key]');
 }
 function drawOutline(){
  const outline=$e('element-outline');outline.hidden=!active;const entry=item();if(!active||!entry){outline.hidden=true;return}
  const stage=$e('stage').getBoundingClientRect();let box;
  if(entry.rect){const display=canvas.getBoundingClientRect();box={left:display.left+entry.rect.x*display.width/canvas.width,top:display.top+entry.rect.y*display.height/canvas.height,width:entry.rect.width*display.width/canvas.width,height:entry.rect.height*display.height/canvas.height}}
  else box=node(entry)?.getBoundingClientRect();if(!box){outline.hidden=true;return}
  Object.assign(outline.style,{left:box.left-stage.left-2+'px',top:box.top-stage.top-2+'px',width:Math.max(4,box.width)+4+'px',height:Math.max(4,box.height)+4+'px'});
 }
 function afterDraw(){
  if(currentProject!==project){currentProject=project;selected='';seen=''}
  if(!active){drawOutline();return}
  const list=entries(),signature=list.map(x=>x.key).join('|');
  if(signature!==seen){seen=signature;$e('element-list').replaceChildren();for(const entry of list){const option=document.createElement('option');option.value=entry.key;option.textContent=({text:'글',icon:'아이콘',image:'이미지',box:'영역'})[entry.kind]+' · '+entry.label;$e('element-list').append(option)}if(!list.some(x=>x.key===selected))selected=list[0]?.key||'';$e('element-list').value=selected;renderControls()}
  $e('element-summary').textContent=list.length+'개 요소 · '+Object.keys(project.elementEdits||{}).length+'개 수정';drawOutline();
 }
 function renderFont(){const field=$e('scene-font');if(!field)return;field.value=project.fontPreset||'auto';$e('scene-font-note').textContent=ElementModel.note(project);$e('scene-font-upload').hidden=project.fontPreset!=='custom'}
 function pick(event){if(!active)return;event.preventDefault();event.stopImmediatePropagation();if(event.type==='click')return;
  let key;
  if(event.target===canvas){const r=canvas.getBoundingClientRect(),x=(event.clientX-r.left)*canvas.width/r.width,y=(event.clientY-r.top)*canvas.height/r.height;const hit=entries().filter(e=>x>=e.rect.x&&x<=e.rect.x+e.rect.width&&y>=e.rect.y&&y<=e.rect.y+e.rect.height).sort((a,b)=>a.rect.width*a.rect.height-b.rect.width*b.rect.height);key=hit[0]?.key}
  else key=event.target.closest('[data-element-key]')?.dataset.elementKey;
  if(key){select(key);$e('element-list').value=key}
 }
 async function uploadIcon(file){if(!file)return;const p=project,key=selected;if(file.size>8*1024*1024){tell('이미지는 8MB 이하로 선택해 주세요.');return}
  try{if(file.type==='image/svg+xml'||/\.svg$/i.test(file.name)){const text=await file.text();const doc=new DOMParser().parseFromString(text,'image/svg+xml');if(doc.querySelector('parsererror')||doc.documentElement.localName!=='svg')throw Error('SVG 형식을 확인해 주세요.');if(/<script|foreignObject|\bon\w+\s*=|(?:href|src)\s*=\s*["'](?!#|data:)|@import|url\(\s*["']?(?:https?:|\/\/)/i.test(text))throw Error('외부 링크나 실행 코드가 없는 SVG만 사용할 수 있어요.')}
   const url=URL.createObjectURL(file);try{const img=new Image();await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=()=>reject(Error('이미지 형식을 확인해 주세요.'));img.src=url});const c=document.createElement('canvas'),ratio=Math.min(1,(item()?.kind==='image'?1600:768)/Math.max(img.naturalWidth,img.naturalHeight));c.width=Math.max(1,Math.round(img.naturalWidth*ratio));c.height=Math.max(1,Math.round(img.naturalHeight*ratio));c.getContext('2d').drawImage(img,0,0,c.width,c.height);const data=c.toDataURL(file.type==='image/jpeg'?'image/jpeg':file.type==='image/webp'?'image/webp':'image/png',.92);if(data.length>2e6)throw Error('이미지가 너무 복잡합니다. 작은 PNG로 올려 주세요.');if(project!==p||selected!==key)return;const edits={...p.elementEdits,[key]:{...p.elementEdits[key],image:data}};delete edits[key].icon;p.elementEdits=ElementModel.validate({...p,elementEdits:edits}).elementEdits;await ElementRender.ready(p);dirty.add(p.type);draw()}finally{URL.revokeObjectURL(url)}
  }catch(e){tell(e.message)}
 }
 function init(){
 SCENE_ICONS.star??='m12 2.5 2.9 6 6.6 1-4.8 4.6 1.1 6.6-5.8-3.1-5.8 3.1 1.1-6.6-4.8-4.6 6.6-1Z';
  const button=document.createElement('button');button.id='edit-elements';button.type='button';button.className='theme-toggle';button.textContent='요소 편집';button.setAttribute('aria-pressed','false');button.title='글자·아이콘·이미지·영역 선택';document.querySelector('.preview-tools').prepend(button);button.onclick=()=>setActive(!active);
  const box=document.createElement('fieldset');box.id='element-fields';box.hidden=true;box.innerHTML='<legend>요소 편집</legend><p class="hint">미리보기에서 요소를 누르거나 목록에서 고르세요. 편집 중에는 앱 버튼이 실행되지 않습니다.</p><label>요소 목록<select id="element-list" aria-label="편집할 요소"></select></label><small id="element-summary"></small><p id="element-empty" class="hint">화면을 누르면 편집할 요소를 선택합니다.</p><div id="element-controls" hidden><strong id="element-label"></strong><p class="hint" id="element-source-note"></p><label id="element-text-label">글자<textarea id="element-text" rows="3" maxlength="5000"></textarea></label><label id="element-icon-label">아이콘<select id="element-icon"><option value="">기본 아이콘</option></select></label><label id="element-upload-label">아이콘·이미지 교체<input id="element-image" type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml"></label><div class="field-row"><label>색상<input id="element-color" type="color"></label><label>배경<input id="element-background" type="color"></label></div><div class="field-row"><label>X 이동<input id="element-x" type="number" min="-5000" max="5000" step="1"></label><label>Y 이동<input id="element-y" type="number" min="-5000" max="5000" step="1"></label></div><div class="field-row"><label>크기 배율<input id="element-scale" type="number" min="0.1" max="5" step="0.05"></label><label>불투명도<input id="element-opacity" type="number" min="0" max="1" step="0.05"></label></div><div id="element-type-controls"><label>글꼴<select id="element-font"></select></label><div class="field-row"><label>글자 크기<input id="element-fontSize" type="number" min="1" max="240" step="1"></label><label>글자 굵기<input id="element-fontWeight" type="number" min="100" max="900" step="100"></label></div></div><label class="checkbox"><input id="element-hidden" type="checkbox">요소 숨기기 · 자리 유지</label><div class="field-row"><button type="button" id="element-parent">상위 요소</button><button type="button" id="element-reset">선택 요소 초기화</button></div></div>';
  $e('panel-content').prepend(box);const font=document.createElement('fieldset');font.id='typography-fields';font.innerHTML='<legend>화면 글꼴</legend><label>글꼴<select id="scene-font"></select></label><p class="hint" id="scene-font-note"></p><label id="scene-font-upload" hidden>내 글꼴 · 8MB 이하<input id="scene-font-file" type="file" accept=".woff2,.woff,.ttf,.otf"></label>';$e('panel-screen').prepend(font);const local=document.createElement('div');local.className='local-font-tools';local.innerHTML='<button type="button" id="local-font-load">설치된 폰트 선택</button><div id="local-font-picker" class="local-font-picker" hidden><input id="local-font-list" type="search" role="combobox" aria-label="설치된 폰트 검색" aria-controls="local-font-options" aria-expanded="false" aria-autocomplete="list" autocomplete="off" placeholder="사용할 폰트를 선택하세요"><div id="local-font-options" role="listbox" aria-label="설치된 폰트 목록" hidden></div></div><p class="hint" id="local-font-note">기본 제공 폰트는 위 글꼴 목록에서 선택합니다. TTF·OTF 파일도 직접 올릴 수 있습니다.</p>';font.append(local);
  for(const select of [$e('scene-font'),$e('element-font')])for(const [key,label]of Object.entries(ElementModel.presets)){const option=document.createElement('option');option.value=key;option.textContent=label;select.append(option)}
  for(const key of Object.keys(SCENE_ICONS).sort()){const option=document.createElement('option');option.value=key;option.textContent=key;$e('element-icon').append(option)}
  const outline=document.createElement('div');outline.id='element-outline';outline.hidden=true;outline.setAttribute('aria-hidden','true');$e('stage').append(outline);
  $e('stage').addEventListener('pointerdown',pick,true);$e('stage').addEventListener('click',pick,true);$e('element-list').onchange=()=>select($e('element-list').value);$e('element-reset').onclick=reset;$e('element-parent').onclick=()=>{const parent=node(item())?.parentElement?.closest('[data-element-key]');if(parent)select(parent.dataset.elementKey)};
  $e('element-text').oninput=()=>change('text',$e('element-text').value);
  $e('element-icon').onchange=()=>{const edit=project.elementEdits[selected]||{};delete edit.image;if($e('element-icon').value)change('icon',$e('element-icon').value);else{delete edit.icon;draw()}};
  for(const key of ['x','y','scale','opacity','fontSize','fontWeight'])$e('element-'+key).oninput=()=>{const v=$e('element-'+key).valueAsNumber;if(Number.isFinite(v))change(key,v)};
  for(const key of ['color','background','font'])$e('element-'+key).oninput=()=>change(key,$e('element-'+key).value);
  $e('element-hidden').onchange=()=>change('hidden',$e('element-hidden').checked);$e('element-image').onchange=()=>{uploadIcon($e('element-image').files[0]);$e('element-image').value=''};
  $e('scene-font').onchange=()=>{pausePreview();project.fontPreset=$e('scene-font').value;dirty.add(project.type);renderFont();draw()};
  $e('scene-font-file').onchange=async()=>{const file=$e('scene-font-file').files[0];$e('scene-font-file').value='';if(!file)return;const p=project;try{if(file.size>8*1024*1024)throw Error('글꼴은 8MB 이하로 선택해 주세요.');const data=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;reader.readAsDataURL(file)});const next=ElementModel.validate({...p,fontData:data,fontName:file.name,fontPreset:'custom'});await ElementRender.ready(next);Object.assign(p,next);dirty.add(p.type);if(project===p){renderFont();draw()}}catch(e){tell(e.message||'글꼴을 읽지 못했습니다.')}};
  let localFonts=[],fontMatches=[],activeFont=-1;
  const fontPicker=$e('local-font-picker'),fontInput=$e('local-font-list'),fontOptions=$e('local-font-options');
  function closeLocalFonts(){fontOptions.hidden=true;fontInput.setAttribute('aria-expanded','false');fontInput.removeAttribute('aria-activedescendant');activeFont=-1}
  function renderLocalFonts(query=''){
   fontOptions.replaceChildren();activeFont=-1;fontInput.removeAttribute('aria-activedescendant');
   const value=query.trim().toLocaleLowerCase();fontMatches=localFonts.map((font,index)=>({font,index})).filter(({font})=>font.fullName.toLocaleLowerCase().includes(value));
   for(const{font,index}of fontMatches){
    const option=document.createElement('button');option.type='button';option.role='option';option.id='local-font-option-'+index;option.dataset.fontIndex=String(index);option.tabIndex=-1;option.textContent=font.fullName;option.setAttribute('aria-selected','false');
    option.onpointerdown=event=>event.preventDefault();option.onclick=()=>chooseLocalFont(index);fontOptions.append(option);
   }
   if(!fontMatches.length){const empty=document.createElement('div');empty.className='local-font-empty';empty.role='status';empty.textContent='일치하는 폰트가 없습니다.';fontOptions.append(empty)}
   fontOptions.hidden=false;fontInput.setAttribute('aria-expanded','true');
  }
  async function chooseLocalFont(index){
   const f=localFonts[index];if(!f)return;fontInput.value=f.fullName;closeLocalFonts();
   try{const blob=await f.blob(),file=new File([blob],f.fullName+'.otf',{type:'font/otf'}),transfer=new DataTransfer();transfer.items.add(file);$e('scene-font-file').files=transfer.files;$e('scene-font-file').dispatchEvent(new Event('change'))}
   catch(error){tell('이 폰트를 읽지 못했습니다. 파일로 올려 주세요.')}
  }
  fontInput.onfocus=()=>renderLocalFonts();
  fontInput.onclick=()=>{if(fontOptions.hidden)renderLocalFonts()};
  fontInput.oninput=()=>renderLocalFonts(fontInput.value);
  fontInput.onkeydown=event=>{
   if(event.key==='Escape'&&!fontOptions.hidden){event.preventDefault();event.stopPropagation();closeLocalFonts();return}
   if(event.key==='Tab'){closeLocalFonts();return}
   if(event.key==='ArrowDown'||event.key==='ArrowUp'){
    event.preventDefault();if(fontOptions.hidden)renderLocalFonts(fontInput.value);
    if(!fontMatches.length)return;activeFont=activeFont<0?(event.key==='ArrowDown'?0:fontMatches.length-1):(activeFont+(event.key==='ArrowDown'?1:-1)+fontMatches.length)%fontMatches.length;
    for(const option of fontOptions.querySelectorAll('[role=option]'))option.setAttribute('aria-selected','false');
    const option=$e('local-font-option-'+fontMatches[activeFont].index);option.setAttribute('aria-selected','true');fontInput.setAttribute('aria-activedescendant',option.id);option.scrollIntoView({block:'nearest'});return;
   }
   if(event.key==='Enter'&&!fontOptions.hidden){event.preventDefault();const selected=fontMatches[activeFont<0?0:activeFont];if(selected)chooseLocalFont(selected.index)}
  };
  document.addEventListener('pointerdown',event=>{if(!fontPicker.contains(event.target))closeLocalFonts()});
  $e('local-font-load').onclick=async()=>{
   if(!window.queryLocalFonts){$e('local-font-note').textContent='이 브라우저는 설치 폰트 조회를 지원하지 않습니다. TTF·OTF 파일을 올려 주세요.';return}
   try{localFonts=await window.queryLocalFonts();localFonts.sort((a,b)=>a.fullName.localeCompare(b.fullName));fontInput.value='';fontPicker.hidden=false;closeLocalFonts();$e('local-font-note').textContent=localFonts.length+'개 폰트 · 이름으로 검색하세요. 새 폰트 설치 후에는 버튼을 다시 눌러 조회합니다.'}
   catch(error){$e('local-font-note').textContent='폰트 조회가 허용되지 않았습니다. 직접 파일 업로드도 가능합니다.'}
  };
  document.addEventListener('keydown',e=>{if(active&&e.key==='Escape'){e.preventDefault();setActive(false)}},true);
  new ResizeObserver(drawOutline).observe($e('stage'));
 }
 return{init,afterDraw,renderFont,setActive,get active(){return active}};
})();
