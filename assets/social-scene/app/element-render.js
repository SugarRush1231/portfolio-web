 'use strict';
const ElementRender=(()=>{
 const images=new Map(),fonts=new Map(),requestedFonts=new Map();let editing=false;
 const embedded=document.createElement('style');embedded.textContent=SCENE_ELEMENT_FONTS;document.head.append(embedded);
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const iconSVG=name=>'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="'+(SCENE_ICONS[name]||SCENE_ICONS.more)+'"/></svg>';
 function image(data){if(!images.has(data)){const node=new Image();const task=new Promise((resolve,reject)=>{node.onload=()=>resolve(node);node.onerror=()=>reject(Error('요소 이미지를 읽지 못했습니다.'))});node.src=data;images.set(data,{node,task});task.catch(()=>images.delete(data))}return images.get(data)}
 async function ready(p){
  if(typeof VideoMedia!=='undefined')await VideoMedia.ready(p);
  await Promise.all(Object.values(p.elementEdits||{}).filter(x=>x.image).map(x=>image(x.image).task));
  if(p.fontData&&!fonts.has(p.fontData)){const face=new FontFace(ElementModel.userFamily(p.fontData),'url('+p.fontData+')',{weight:'100 900'});const task=face.load().then(f=>document.fonts.add(f));fonts.set(p.fontData,task);task.catch(()=>fonts.delete(p.fontData))}
  if(p.fontData)await fonts.get(p.fontData);if(typeof SearchUI!=='undefined'&&(p.type?.startsWith('google-')||p.type==='naver-search'))await SearchUI.ready(p);
  const family=ElementModel.family(p),key=family+'|'+p.device;if(!requestedFonts.has(key))requestedFonts.set(key,Promise.all([400,600,700].map(weight=>document.fonts.load(weight+' 16px '+family,'가나다 ABC0123')).concat([document.fonts.load('600 13px SceneInter','9:41'),document.fonts.load('700 8px SceneRoboto','100')])));await requestedFonts.get(key);await document.fonts.ready;
 }
 const embeddedFaces=SCENE_ELEMENT_FONTS.match(/@font-face\{[^}]+\}/g)||[];
 function fontCSS(p){const families=ElementModel.family(p)+' SceneInter '+Object.values(p.elementEdits||{}).filter(x=>x.font).map(x=>ElementModel.family(p,x.font)).join(' ');return embeddedFaces.filter(face=>families.includes(/font-family:([^;]+)/.exec(face)[1])).join('')+(p.fontData?'@font-face{font-family:'+ElementModel.userFamily(p.fontData)+';src:url('+p.fontData+');font-weight:100 900}':'')}
 function applyFont(root,p){root.style.setProperty('--scene-font',ElementModel.family(p));root.style.fontFamily=ElementModel.family(p);root.style.setProperty('--system-font',p.device==='android'?'SceneRoboto,SceneKorean,sans-serif':'SceneInter,Scene,sans-serif')}
 function path(root,node){const parts=[];for(let n=node;n&&n!==root;n=n.parentElement){const action=n.dataset.phoneAction;if(action){const scope=n.closest('[data-feed-index],[data-call-layer]');parts.unshift((scope?.dataset.feedIndex!==undefined?'feed:'+scope.dataset.feedIndex+'/':scope?.dataset.callLayer?'call:'+scope.dataset.callLayer+'/':'')+'action:'+action);break}const field=n.dataset.phoneField||n.dataset.filmField;if(field){parts.unshift('field:'+field);break}if(n.dataset.callLayer){parts.unshift('call:'+n.dataset.callLayer);break}if(n.dataset.feedIndex!==undefined){parts.unshift('feed:'+n.dataset.feedIndex);break}const tag=n.tagName.toLowerCase(),siblings=n.parentElement?[...n.parentElement.children].filter(s=>s.tagName===n.tagName):[n];parts.unshift(tag+':'+siblings.indexOf(n))}return parts.join('/')}
 function build(root){
  const nodes=[],walker=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);while(walker.nextNode()){const text=walker.currentNode;if(text.textContent.trim()&&!text.parentElement.closest('svg,style,script,textarea,input,[contenteditable],[data-element-text]'))nodes.push(text)}
  for(const text of nodes){const span=document.createElement('span');span.dataset.elementText='';text.replaceWith(span);span.append(text)}
  const registry=new Map();
  for(const node of [root,...root.querySelectorAll('*')]){
   if(node.closest('svg')&&node.tagName.toLowerCase()!=='svg'||node.matches('path,defs,style,script,source,.ph-feedback,.ph-media-edit,.film-media-edit,.film-call-scene[aria-hidden=true]'))continue;
   const field=node.dataset.phoneField||node.dataset.filmField||node.dataset.phoneComposer,tag=node.tagName.toLowerCase();
   const kind=node.matches('svg,.ph-native-raster,.sys-icon')?'icon':tag==='img'||tag==='canvas'?'image':field||node.hasAttribute('data-element-text')||node.matches('input,textarea')?'text':'box';
   if(node.matches('.sys-icon')&&node.querySelector('svg'))continue;
   if(node.parentElement?.closest('svg,.ph-native-raster'))continue;
   const key=field?'dom:'+(node.dataset.phoneComposer?'composer:':'field:')+field:'dom:'+kind+':'+(node===root?'root':path(root,node));
   const label=(node.getAttribute('aria-label')||node.getAttribute('alt')||node.closest('button')?.getAttribute('aria-label')||node.textContent||tag).trim().replace(/\s+/g,' ').slice(0,50);
   let item=registry.get(key);if(!item){item={key,kind,label,node,nodes:[],field,fieldKind:node.dataset.filmField?'film':'phone',original:kind==='text'?(node.value??node.textContent):'',base:[]};registry.set(key,item)}item.nodes.push(node);node.dataset.elementKey=key;
  }root._elementRegistry=registry;root._elementMarkup=root._phoneMarkup;
 }
 function style(node,name,value){const base=node._elementStyles??={},prior=base[name];if(!prior||node.style.getPropertyValue(name)!==prior.applied)base[name]={value:node.style.getPropertyValue(name),priority:node.style.getPropertyPriority(name),applied:''};node.style.setProperty(name,value,'important');base[name].applied=node.style.getPropertyValue(name);node._elementStyles=base}
 function applyDOM(root,p){
  applyFont(root,p);const modified=Object.keys(p.elementEdits||{}).length>0;if(!editing&&!modified&&!root._elementHadEdits)return;root._elementHadEdits=modified;
  if(!root._elementRegistry||root._elementMarkup!==root._phoneMarkup)build(root);
  for(const item of root._elementRegistry.values())for(const node of item.nodes){
   const edit=p.elementEdits?.[item.key];
   if(node._elementStyles)for(const [name,base]of Object.entries(node._elementStyles)){if(node.style.getPropertyValue(name)===base.applied)node.style.setProperty(name,base.value,base.priority)}node._elementStyles={};
   if(node._elementOriginal&&!edit?.icon&&!edit?.image){const original=node._elementOriginal;node.innerHTML=original.html;for(const [name,value]of Object.entries(original.attributes)){if(value===null)node.removeAttribute(name);else node.setAttribute(name,value)}delete node._elementOriginal;delete node._elementReplacement}
   if(node._elementTextOriginal!==undefined&&edit?.text===undefined){if(node.matches('input,textarea'))node.value=node._elementTextOriginal;else node.textContent=node._elementTextOriginal;delete node._elementTextOriginal}
   if(!edit)continue;
   if(edit.hidden)style(node,'visibility','hidden');
   if(edit.opacity!==undefined)style(node,'opacity',String(edit.opacity));
   if(edit.color){style(node,'color',edit.color);if(node.matches('svg')){if(node.getAttribute('fill')!=='none')style(node,'fill',edit.color);if(node.getAttribute('stroke')!=='none')style(node,'stroke',edit.color)}}
   if(edit.background)style(node,'background',edit.background);
   if(edit.font)style(node,'font-family',ElementModel.family(p,edit.font));
   if(edit.fontSize)style(node,'font-size',edit.fontSize+'px');
   if(edit.fontWeight)style(node,'font-weight',String(edit.fontWeight));
   if(edit.x!==undefined||edit.y!==undefined||edit.scale!==undefined){style(node,'translate',(edit.x||0)+'px '+(edit.y||0)+'px');style(node,'scale',String(edit.scale??1));style(node,'transform-origin','center')}
   if(edit.text!==undefined){node._elementTextOriginal??=node.value??node.textContent;if(node.matches('input,textarea'))node.value=edit.text;else node.textContent=edit.text}
   if((edit.icon||edit.image)&&!node.matches('canvas')){
    const signature=edit.icon||edit.image;if(node._elementReplacement!==signature){node._elementOriginal??={html:node.innerHTML,attributes:Object.fromEntries(['src','viewBox','fill','stroke'].map(name=>[name,node.getAttribute(name)]))};node._elementReplacement=signature;
     if(node.tagName.toLowerCase()==='svg'){node.innerHTML=edit.icon?'<path d="'+(SCENE_ICONS[edit.icon]||SCENE_ICONS.more)+'"/>':'<image href="'+edit.image+'" width="24" height="24"/>';node.setAttribute('viewBox','0 0 24 24');node.setAttribute('fill','none');node.setAttribute('stroke','currentColor')}
     else if(node.matches('img'))node.src=edit.image||'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(iconSVG(edit.icon));
     else {node.innerHTML=edit.image?'<img data-element-replacement alt="" src="'+edit.image+'">':iconSVG(edit.icon);if(node.matches('.ph-native-raster')){style(node,'mask-image','none');style(node,'-webkit-mask-image','none');style(node,'background','transparent')}}
    }if(node.tagName.toLowerCase()==='svg'&&edit.icon){style(node,'fill','none');style(node,'stroke',edit.color||'currentColor')}if(node.matches('.ph-native-raster')){style(node,'mask-image','none');style(node,'-webkit-mask-image','none');style(node,'background','transparent')}
   }
  }
 }
 function applyMedia(root,p){
  for(const item of root._elementRegistry?.values()||[]){const edit=p.elementEdits?.[item.key];if(!edit?.image&&!edit?.icon)continue;
   for(const canvas of item.nodes.filter(n=>n.matches('canvas'))){const ctx=canvas.getContext('2d'),w=canvas.width,h=canvas.height;ctx.save();ctx.resetTransform();ctx.clearRect(0,0,w,h);
    if(edit.image){const img=image(edit.image).node;if(img.complete&&img.naturalWidth){const scale=Math.max(w/img.naturalWidth,h/img.naturalHeight);ctx.drawImage(img,(w-img.naturalWidth*scale)/2,(h-img.naturalHeight*scale)/2,img.naturalWidth*scale,img.naturalHeight*scale)}}
    else{const size=Math.min(w,h);ctx.save();ctx.translate((w-size)/2,(h-size)/2);ctx.scale(size/24,size/24);ctx.strokeStyle=edit.color||'#111111';ctx.lineWidth=1.8;ctx.stroke(new Path2D(SCENE_ICONS[edit.icon]||SCENE_ICONS.more));ctx.restore()}ctx.restore();
   }
  }
 }
 function rect(ctx,x,y,w,h){const m=ctx.getTransform(),points=[[x,y],[x+w,y],[x,y+h],[x+w,y+h]].map(([x,y])=>({x:m.a*x+m.c*y+m.e,y:m.b*x+m.d*y+m.f}));const left=Math.min(...points.map(p=>p.x)),top=Math.min(...points.map(p=>p.y));return{x:left,y:top,width:Math.max(...points.map(p=>p.x))-left,height:Math.max(...points.map(p=>p.y))-top}}
 function localHint(pass,kind,hint,bounds){if(!pass.origin)return hint;const values=kind==='text'?hint.split(',').map(Number):[bounds.x,bounds.y,bounds.width,bounds.height];return values.map((v,i)=>Math.round((v-(i===0?pass.origin.x:i===1?pass.origin.y:0))*100)/100).join(',')}
 function paint(ctx,kind,hint,bounds,original,draw){
  const pass=ctx._elementPass;if(!pass||pass.depth)return draw({});
  const base='canvas:'+pass.phase+':'+kind+':'+localHint(pass,kind,hint,bounds),n=pass.counts[base]||0;pass.counts[base]=n+1;const key=base+':'+n,edit=pass.project.elementEdits?.[key]||{};
  ctx.save();pass.depth++;
  try{
   ctx.translate(edit.x||0,edit.y||0);const s=edit.scale??1;ctx.translate(bounds.x+bounds.width/2,bounds.y+bounds.height/2);ctx.scale(s,s);ctx.translate(-bounds.x-bounds.width/2,-bounds.y-bounds.height/2);if(edit.opacity!==undefined)ctx.globalAlpha*=edit.opacity;
   const area=rect(ctx,bounds.x,bounds.y,bounds.width,bounds.height);if(ctx.globalAlpha>.01&&area.x+area.width>0&&area.y+area.height>0&&area.x<ctx.canvas.width&&area.y<ctx.canvas.height)pass.items.push({key,kind,label:String(original).slice(0,50),original,rect:area});
   if(edit.hidden)return;
   if(edit.image){const cached=image(edit.image);if(cached.node.complete&&cached.node.naturalWidth)ctx._elementNative.drawImage.call(ctx,cached.node,bounds.x,bounds.y,bounds.width,bounds.height);else draw(edit)}
   else if(edit.icon&&SCENE_ICONS[edit.icon]){ctx.translate(bounds.x,bounds.y);ctx.scale(bounds.width/24,bounds.height/24);ctx.strokeStyle=edit.color||ctx.fillStyle;ctx.lineWidth=1.8;ctx.lineCap='round';ctx.lineJoin='round';ctx.stroke(new Path2D(SCENE_ICONS[edit.icon]))}
   else draw(edit);
  }finally{pass.depth--;ctx.restore()}
 }
 function group(ctx,label,bounds,draw){
  const pass=ctx._elementPass;if(!pass||pass.depth)return draw({});
  const phase=pass.phase,origin=pass.origin,base='canvas:'+phase+':group:'+label,n=pass.counts[base]||0;pass.counts[base]=n+1;
  const key=base+':'+n,edit=pass.project.elementEdits?.[key]||{};ctx.save();
  try{
   ctx.translate(edit.x||0,edit.y||0);const scale=edit.scale??1;ctx.translate(bounds.x+bounds.width/2,bounds.y+bounds.height/2);ctx.scale(scale,scale);ctx.translate(-bounds.x-bounds.width/2,-bounds.y-bounds.height/2);if(edit.opacity!==undefined)ctx.globalAlpha*=edit.opacity;
   const area=rect(ctx,bounds.x,bounds.y,bounds.width,bounds.height);pass.items.push({key,kind:'box',label,original:label,rect:area});if(edit.hidden)return;
   pass.phase=phase+':'+label+':'+n;pass.origin=bounds;draw(edit);
  }finally{pass.phase=phase;pass.origin=origin;ctx.restore()}
 }
 function beginCanvas(ctx,p,phase){
  ctx.sceneFontFamily=ElementModel.family(p);const enabled=editing||Object.keys(p.elementEdits||{}).length;
  ctx._elementPass=enabled?{project:p,phase,items:[],counts:{},depth:0}:null;
  if(ctx._elementNative)return;
  const native={fillText:ctx.fillText,drawImage:ctx.drawImage,fillRect:ctx.fillRect};ctx._elementNative=native;
  ctx.fillText=function(value,x,y,max){
   if(!this._elementPass||this._elementPass.depth)return max===undefined?native.fillText.call(this,value,x,y):native.fillText.call(this,value,x,y,max);
   const pass=this._elementPass,hint=x+','+y,base='canvas:'+pass?.phase+':text:'+localHint(pass,'text',hint),edit=pass&&!pass.depth?(pass.project.elementEdits?.[base+':'+(pass.counts[base]||0)]||{}):{};
   const size=edit.fontSize||parseFloat(/([\d.]+)px/.exec(this.font)?.[1]||15),weight=edit.fontWeight||/^([1-9]\d{2})\s/.exec(this.font)?.[1]||400;
   const font=weight+' '+size+'px '+(edit.font?ElementModel.family(pass?.project||p,edit.font):this.font.slice(this.font.indexOf('px')+2)),lines=String(edit.text??value).split('\n');
   this.save();this.font=font;const metrics=lines.map(line=>this.measureText(line));this.restore();
   const w=Math.min(Math.max(2,...metrics.map(m=>m.width)),max??Infinity),left=x-(this.textAlign==='center'?w/2:this.textAlign==='right'||this.textAlign==='end'?w:0),top=y-Math.max(1,...metrics.map(m=>m.actualBoundingBoxAscent)),height=Math.max(size,...metrics.map(m=>m.actualBoundingBoxAscent+m.actualBoundingBoxDescent))+(lines.length-1)*size*1.4;
   return paint(this,'text',hint,{x:left,y:top,width:w,height},String(value),settings=>{if(settings.color)this.fillStyle=settings.color;this.font=font;lines.forEach((line,i)=>{if(max!==undefined)native.fillText.call(this,line,x,y+i*size*1.4,max);else native.fillText.call(this,line,x,y+i*size*1.4)})});
  };
  ctx.drawImage=function(source,...args){const tail=args.length===8?args.slice(4):args,b=tail.length===2?[...tail,source.naturalWidth||source.width,source.naturalHeight||source.height]:tail;return paint(this,'image',b[0]+','+b[1]+','+b[2]+','+b[3],{x:b[0],y:b[1],width:b[2],height:b[3]},'이미지',()=>native.drawImage.call(this,source,...args))};
  ctx.fillRect=function(x,y,w,h){return paint(this,'box',x+','+y+','+w+','+h,{x,y,width:w,height:h},'배경',edit=>{if(edit.color||edit.background)this.fillStyle=edit.background||edit.color;native.fillRect.call(this,x,y,w,h)})};
 }
 function endCanvas(ctx){ctx.canvas._elementItems=ctx._elementPass?.items||[];ctx._elementPass=null}
 return{get editing(){return editing},set editing(v){editing=v},esc,iconSVG,ready,fontCSS,applyFont,applyDOM,applyMedia,paint,group,beginCanvas,endCanvas};
})();
