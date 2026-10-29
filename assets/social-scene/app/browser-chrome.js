 'use strict';
const SceneBrowser=(()=>{
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const height=p=>p.desktopBrowser==='macos'?62:76;
 function html(p,host,title,icon,address){
  const control=(name,label,cls='')=>'<button type="button" class="browser-control '+cls+'" data-preview-control aria-label="'+label+'">'+icon(name,16)+'</button>';
  const url='<div class="browser-address">'+icon('lock',12)+(address||'<span>'+esc(host)+'</span>')+'</div>';
  if(p.desktopBrowser==='macos')return'<div class="scene-browser browser-macos"><div class="browser-lights">'+['닫기','최소화','확대'].map((v,i)=>'<button type="button" data-preview-control aria-label="'+v+'" class="browser-light light-'+i+'"><span>'+['×','−','+'][i]+'</span></button>').join('')+'</div>'+control('grid','사이드바')+control(p.desktopBrowser==='macos'?'back':'browser-back','뒤로')+control('browser-forward','앞으로','browser-next')+url+control('share','공유')+control('plus','새 탭')+control('grid','탭 개요')+'</div>';
  return'<div class="scene-browser browser-windows"><div class="browser-tab-strip"><div class="browser-tab">'+icon('globe',14)+'<span>'+esc(title)+'</span>'+control('close','탭 닫기')+'</div>'+control('plus','새 탭')+'<div class="browser-window-tools"><button type="button" data-preview-control aria-label="최소화">−</button><button type="button" data-preview-control aria-label="최대화">□</button><button type="button" data-preview-control aria-label="닫기">×</button></div></div><div class="browser-toolbar">'+control(p.desktopBrowser==='macos'?'back':'browser-back','뒤로')+control('browser-forward','앞으로','browser-next')+control('reload','새로고침')+url+control('star','북마크')+control('more-vertical','메뉴')+'</div></div>';
 }
 function paint(ctx,p,width,colors,host,title,control){
  const mac=p.desktopBrowser==='macos',h=height(p),button=(id,name,x,y,w=30)=>{
   control(ctx,'browser-'+id,x,y,w,28,6);sceneIcon(ctx,name,x+(w-16)/2,y+6,16,colors.muted);
  };
  sceneBox(ctx,0,0,width,h,0,colors.chrome);
  if(mac){
   ['#ff5f57','#ffbd2e','#28c840'].forEach((color,i)=>{control(ctx,'window-'+i,12+i*21,20,16,20,8);sceneBox(ctx,14+i*21,24,12,12,6,color)});
   button('sidebar','grid',85,17);button('back','back',121,17);button('forward','browser-forward',154,17);
   sceneBox(ctx,width*.27,14,width*.46,34,8,colors.bg);control(ctx,'address',width*.27,14,width*.46,34,8);
   sceneIcon(ctx,'lock',width*.27+14,25,12,colors.muted);sceneText(ctx,host,width/2,36,13,colors.text,400,'center',width*.4);
   button('share','share',width-112,17);button('new','plus',width-76,17);button('tabs','grid',width-40,17);
  }else{
   sceneBox(ctx,8,5,250,30,[9,9,0,0],colors.bg);sceneIcon(ctx,'globe',21,13,14,colors.muted);sceneText(ctx,title,45,24,12,colors.text,400,'left',175);
   button('tab-close','close',225,5,28);button('new','plus',266,4);
   [['minimize','−'],['maximize','□'],['close','×']].forEach(([id,label],i)=>{control(ctx,'window-'+id,width-138+i*46,0,46,34,0);sceneText(ctx,label,width-115+i*46,23,16,colors.text,400,'center')});
   button('back','browser-back',8,40);button('forward','browser-forward',42,40);button('reload','reload',76,40);
   sceneBox(ctx,115,40,width-204,29,16,colors.bg);control(ctx,'address',115,40,width-204,29,16);sceneIcon(ctx,'lock',128,48,13,colors.muted);sceneText(ctx,host,151,60,12,colors.text,400,'left',width-269);
   button('bookmark','bookmark',width-80,40);button('menu','more-vertical',width-40,40);
  }
  sceneLine(ctx,0,h-.5,width,h-.5,colors.line);return h;
 }
 return{height,html,paint};
})();
if(typeof module!=='undefined')module.exports=SceneBrowser;
