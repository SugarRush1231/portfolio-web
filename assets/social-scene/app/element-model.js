 'use strict';
const ElementModel=(()=>{
 const presets={auto:'앱·기기에 맞춤',inter:'Inter · iPhone/X 대체',roboto:'Roboto · Android/YouTube',google:'Google Sans Flex',open:'Open Sans · Discord 대체',noto:'Noto Sans KR',pretendard:'Pretendard',custom:'직접 올린 폰트'};
 const families={inter:'SceneInter,Scene,sans-serif',roboto:'SceneRoboto,SceneKorean,sans-serif',google:'SceneGoogle,SceneKorean,sans-serif',open:'SceneOpenSans,SceneKorean,sans-serif',noto:'SceneKorean,sans-serif',pretendard:'Scene,sans-serif'};
 const userNames=new Map();
 function userFamily(data){if(!userNames.has(data)){let h=2166136261;for(let i=0;i<data.length;i++)h=Math.imul(h^data.charCodeAt(i),16777619);userNames.set(data,'SceneUser'+(h>>>0))}return userNames.get(data)}
 function family(p,preset=p.fontPreset||'auto'){
  if(preset==='custom')return p.fontData?userFamily(p.fontData)+',SceneKorean,sans-serif':families.inter;
  if(preset!=='auto')return families[preset]||families.inter;
  if(p.type.startsWith('google-')||p.type==='email-inbox')return families.google;
  if(p.type==='youtube-watch')return families.roboto;
  if(p.type.startsWith('discord-'))return '"gg sans",'+families.open;
  if(p.type==='naver-search'||p.type==='news-article')return 'Arial,SceneKorean,sans-serif';
  if(p.type.startsWith('x-'))return 'Chirp,'+families.inter;
  if(p.device==='android')return '"One UI Sans",SamsungOne,'+families.roboto;
  return '-apple-system,BlinkMacSystemFont,'+families.inter;
 }
 function note(p){if(p.fontPreset&&p.fontPreset!=='auto')return presets[p.fontPreset]+(p.fontPreset==='custom'?' · '+p.fontName:'');if(p.type.startsWith('google-')||p.type==='email-inbox')return 'Google Sans Flex / 한글 Noto Sans KR';if(p.type==='youtube-watch')return 'Roboto / 한글 Noto Sans KR';if(p.type.startsWith('discord-'))return 'gg sans가 없으면 Open Sans / 한글 Noto Sans KR';if(p.type.startsWith('x-'))return 'Chirp가 없으면 Inter / 한글 Pretendard';if(p.type==='naver-search'||p.type==='news-article')return 'Arial / 한글 Noto Sans KR';return p.device==='android'?'One UI Sans가 없으면 Roboto / 한글 Noto Sans KR':'Apple 시스템 글꼴이 없으면 Inter / 한글 Pretendard'}
 function validate(p){
  const out={elementEdits:{},fontPreset:'auto',fontData:'',fontName:''};
  if(p.fontPreset!==undefined){if(!Object.hasOwn(presets,p.fontPreset))throw Error('글꼴 설정이 올바르지 않습니다.');out.fontPreset=p.fontPreset}
  if(p.fontName!==undefined){if(typeof p.fontName!=='string'||p.fontName.length>300)throw Error('글꼴 이름이 올바르지 않습니다.');out.fontName=p.fontName}
  if(p.fontData!==undefined){if(typeof p.fontData!=='string'||p.fontData.length>12e6||(p.fontData&&!/^data:(?:font\/(?:woff2?|ttf|otf)|application\/(?:font-woff|x-font-ttf|x-font-opentype|octet-stream));base64,[A-Za-z0-9+/=]+$/.test(p.fontData)))throw Error('글꼴은 8MB 이하 TTF·OTF·WOFF·WOFF2로 올려 주세요.');out.fontData=p.fontData}
  const edits=p.elementEdits??{};if(!edits||typeof edits!=='object'||Array.isArray(edits)||Object.keys(edits).length>512||JSON.stringify(edits).length>16e6)throw Error('요소 수정 데이터가 너무 크거나 올바르지 않습니다.');
  const numeric={x:[-5000,5000],y:[-5000,5000],scale:[.1,5],opacity:[0,1],fontSize:[1,240],fontWeight:[100,900]};
  for(const [key,value]of Object.entries(edits)){
   if(key.length>800||['__proto__','constructor','prototype'].includes(key)||!value||typeof value!=='object'||Array.isArray(value))throw Error('요소 수정 대상이 올바르지 않습니다.');const safe={};
   for(const [name,item]of Object.entries(value)){
    if(Object.hasOwn(numeric,name)){const [a,b]=numeric[name];if(!Number.isFinite(item)||item<a||item>b)throw Error('요소 크기·위치 범위를 확인해 주세요.')}
    else if(name==='text'){if(typeof item!=='string'||item.length>5000)throw Error('요소 글은 5000자 이내여야 합니다.')}
    else if(name==='icon'){if(typeof item!=='string'||!/^[a-z][a-z0-9-]{0,60}$/.test(item))throw Error('아이콘 이름이 올바르지 않습니다.')}
    else if(name==='image'){if(typeof item!=='string'||item.length>2e6||!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(item))throw Error('요소 이미지는 1.4MB 이하 PNG·JPG·WebP여야 합니다.')}
    else if(name==='color'||name==='background'){if(typeof item!=='string'||!/^#[a-f0-9]{6}$/i.test(item))throw Error('요소 색상이 올바르지 않습니다.')}
    else if(name==='font'){if(!Object.hasOwn(presets,item))throw Error('요소 글꼴 설정이 올바르지 않습니다.')}
    else if(name==='hidden'){if(typeof item!=='boolean')throw Error('요소 표시 설정이 올바르지 않습니다.')}
    else throw Error('알 수 없는 요소 설정입니다.');safe[name]=item;
   }out.elementEdits[key]=safe;
  }return out;
 }
 return{presets,families,family,note,userFamily,validate};
})();
if(typeof module!=='undefined')module.exports=ElementModel;
