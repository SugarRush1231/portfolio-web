 'use strict';
const SceneCollections=(()=>{
 const replies=typeof module!=='undefined'?require('./comment-motion.js'):SceneReplies;
 const supported=['email-inbox','x-feed','instagram-feed','facebook-feed'];
 const feedText={name:60,handle:60,body:3000,postTime:60,likes:20,comments:20,reposts:20,shares:20,views:20,commentDraft:2000,privacy:60};
 const flags=['verified','liked','saved','followed','reposted','commentsOpen'];
 const mailCategories={primary:'Primary',promotions:'Promotions',social:'Social'};
 const mailText={subject:240,sender:60,senderAddress:240,recipient:240,emailTime:60,attachment:240,body:3000};
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const clone=value=>JSON.parse(JSON.stringify(value));
 function defaults(type){
  const rows=type==='email-inbox'?['자료 공유드립니다','미팅 일정이 변경되었습니다'].map((subject,i)=>({subject,sender:i?'Studio':'알림',senderAddress:'user'+(i+3)+'@example.com',recipient:'creator@example.com',emailTime:'어제',attachment:'',body:subject+'\n\n내용을 입력하세요.',read:true,starred:false,mailCategory:'primary'})):[];
  return{feedItems:[],mailItems:rows,selectedMail:0,mailStarred:false,mailRead:false};
 }
 function comments(input){
  if(!Array.isArray(input)||input.length>30)throw new Error('게시물 댓글은 30개까지입니다.');
  return input.map(c=>{
   if(!c||typeof c!=='object'||Object.entries({author:60,text:2000,time:60,likes:60}).some(([k,max])=>typeof c[k]!=='string'||c[k].length>max)||typeof c.liked!=='boolean')throw new Error('게시물 댓글 형식이 올바르지 않습니다.');
   return{author:c.author,text:c.text,time:c.time,likes:c.likes,liked:c.liked,...replies.validateCue(c)};
  });
 }
 function textItem(input,fields){
  if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('목록 항목 형식이 올바르지 않습니다.');
  const result={};
  for(const [key,max]of Object.entries(fields)){
   if(typeof input[key]!=='string'||input[key].length>max)throw new Error('목록의 '+key+' 값을 확인해 주세요.');
   result[key]=input[key];
  }
  return result;
 }
 function validate(input,result){
  const out=defaults(result.type);
  if(input.feedItems!==undefined){
   if(!Array.isArray(input.feedItems)||input.feedItems.length>19||input.feedItems.length&&!['x-feed','instagram-feed','facebook-feed'].includes(result.type))throw new Error('피드는 최대 20개 게시물입니다.');
   out.feedItems=input.feedItems.map(value=>{
    const row=textItem(value,feedText);
    for(const key of flags){if(typeof value[key]!=='boolean')throw new Error('게시물 상태가 올바르지 않습니다.');row[key]=value[key]}
    for(const key of ['avatar','media']){
     if(typeof value[key]!=='string'||value[key].length>(key==='media'?32*1024*1024:2000000)||value[key]&&!(key==='media'?/^data:(image\/(png|jpeg|webp)|video\/(mp4|webm|quicktime));base64,[A-Za-z0-9+/=]+$/:/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/).test(value[key]))throw new Error('게시물 사진이 올바르지 않습니다.');
     row[key]=value[key];
    }
    if(!Number.isInteger(value.artwork)||value.artwork<0||value.artwork>5)throw new Error('예시 이미지 번호가 올바르지 않습니다.');
    row.artwork=value.artwork;row.commentItems=comments(value.commentItems);row.comments=String(row.commentItems.length);Object.assign(row,replies.validateDraft(value));return row;
   });
  }
  if(out.feedItems.reduce((sum,item)=>sum+item.media.length,result.media?.length||0)>64*1024*1024)throw Error('게시물 미디어의 총 크기는 64MB 이내로 사용해 주세요.');
  if(input.mailItems!==undefined){
   if(!Array.isArray(input.mailItems)||input.mailItems.length>19||input.mailItems.length&&result.type!=='email-inbox')throw new Error('메일은 최대 20개 항목입니다.');
   out.mailItems=input.mailItems.map(value=>{const row=textItem(value,mailText);row.mailCategory=value.mailCategory??'primary';if(!Object.hasOwn(mailCategories,row.mailCategory))throw new Error('메일 분류가 올바르지 않습니다.');for(const k of ['read','starred']){if(typeof value[k]!=='boolean')throw new Error('메일 상태가 올바르지 않습니다.');row[k]=value[k]}return row});
  }
  if(input.selectedMail!==undefined){
   if(!Number.isInteger(input.selectedMail)||input.selectedMail<0||input.selectedMail>out.mailItems.length)throw new Error('선택한 메일 번호가 올바르지 않습니다.');
   out.selectedMail=input.selectedMail;
  }
  for(const key of ['mailStarred','mailRead'])if(input[key]!==undefined){if(typeof input[key]!=='boolean')throw new Error('메일 상태가 올바르지 않습니다.');out[key]=input[key]}
  return out;
 }
 const ko=[
  ['새로운 프로젝트를 시작합니다','작은 아이디어를 모아 새로운 장면을 만들고 있습니다. 오늘의 기록이 다음 작업의 출발점이 됩니다.','서로 다른 시선을 연결하면서 어제와는 다른 결과를 찾아갑니다.','몇 번의 시도와 수정 끝에 마음에 드는 순간을 발견했습니다.'],
  ['오늘의 작업 기록','빛이 들어오는 시간에 맞춰 잠시 주변을 둘러봤습니다. 익숙한 풍경도 자세히 보면 새로운 색을 보여줍니다.','좋아하는 색과 질감을 모아 이번 작업의 분위기를 정리했습니다.','서두르지 않고 하나씩 살펴보니 놓쳤던 디테일이 보이기 시작합니다.'],
  ['함께 만드는 다음 장면','생각을 나누고 작은 결과물을 함께 확인했습니다. 다른 사람의 의견이 새로운 방향을 열어주기도 합니다.','완성된 결과만큼 그 과정에서 나눈 대화도 오래 남습니다.','이번에 정리한 내용은 다음 작업에 차근차근 반영할 예정입니다.'],
  ['주말에 발견한 풍경','잠깐의 산책에서 마음에 드는 장면을 만났습니다. 평소 지나치던 길에도 기록하고 싶은 순간이 있습니다.','사진 몇 장과 짧은 메모로 그때의 분위기를 남겼습니다.','일상에서 모은 장면들이 다음 아이디어로 자연스럽게 이어집니다.'],
  ['업데이트 내용을 공유합니다','준비하던 작업의 첫 번째 결과를 공유합니다. 사용하면서 느낀 점들을 모아 흐름을 조금 더 다듬었습니다.','직접 확인하고 수정하는 시간을 거치며 필요한 부분을 골라냈습니다.','피드백을 바탕으로 더 편하게 사용할 수 있는 방향을 찾아가고 있습니다.'],
  ['작은 실험의 결과','평소와 다른 조합을 시도해 봤습니다. 생각하지 못한 결과 덕분에 다음 단계의 방향이 선명해졌습니다.','색과 움직임을 조금씩 바꾸며 여러 가능성을 비교했습니다.','완벽한 답을 정하기보다 지금 필요한 선택을 쌓아가고 있습니다.']
 ];
 const latin=['Lorem ipsum dolor sit amet, consectetur adipiscing elit.','Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.','Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.','Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.','Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.','Integer posuere erat a ante venenatis dapibus posuere velit aliquet.'];
 function body(language,length,index){
  const amount={short:1,medium:3,long:8}[length],topic=ko[index%ko.length];
  return Array.from({length:amount},(_,j)=>language==='lorem'?latin[(index+j)%latin.length]:topic[1+j%3]).join(length==='long'?'\n\n':' ');
 }
 function generate(type,{language='ko',length='medium',count=6}={},seed=0){
  if(!supported.includes(type)||!['ko','lorem'].includes(language)||!['short','medium','long'].includes(length)||!Number.isInteger(count)||count<1||count>20||!Number.isInteger(seed)||seed<0)throw new Error('예시 채우기 설정을 확인해 주세요.');
  const list=Array.from({length:count},(_,i)=>{
   const n=seed+i,user='User '+(n+2),handle='user_'+String(n+2).padStart(2,'0');
   if(type==='email-inbox')return{mailCategory:i%5===3?'promotions':i%5===4?'social':'primary',subject:language==='ko'?ko[n%6][0]:['Project update','Meeting notes','Files for review','Schedule confirmation','Weekly summary','Next steps'][n%6],sender:user,senderAddress:handle+'@example.com',recipient:'creator@example.com',emailTime:i<4?(language==='ko'?'오전 ':'')+String(11-i).padStart(2,'0')+':'+String((n*7)%60).padStart(2,'0'):language==='ko'?'어제':'Yesterday',attachment:i%3===0?'project-notes.pdf':'',body:(language==='ko'?'안녕하세요.\n\n':'Hello,\n\n')+body(language,length,n)+(language==='ko'?'\n\n감사합니다.\n':'\n\nBest regards,\n')+user,read:i%3!==0,starred:i%5===2};
   return{name:user,handle,body:body(language,length,n),postTime:language==='ko'?(i+1)+'시간 전':(i+1)+'h',likes:String(127+n*83),comments:'1',reposts:String(2+n%18),shares:String(1+n%12),views:(2+n%8)+'.'+(n%10)+'만',privacy:language==='ko'?'전체 공개':'Public',verified:n%3===1,liked:false,saved:false,followed:false,reposted:false,commentsOpen:false,commentDraft:'',commentDraftAt:0,commentDraftDuration:0,avatar:'',media:'',artwork:n%6,commentItems:[{author:'user_'+String(n+23),text:language==='ko'?['좋은 기록이네요. 다음 작업도 기대할게요!','분위기와 색감이 잘 어울려요.','공유해 주셔서 감사합니다.'][n%3]:'Lorem ipsum dolor sit amet.',time:language==='ko'?'방금':'Now',likes:String(n%7),liked:false}]};
  });
  if(type==='email-inbox'){
   const first=list.shift();return{body:first.body,props:Object.fromEntries(Object.entries(first).filter(([k])=>!['body','read','starred'].includes(k))),mailItems:list,selectedMail:0,mailStarred:false,mailRead:false};
  }
  const first=list.shift(),patch=Object.fromEntries(Object.entries({...first,feedItems:list}).filter(([k])=>!['avatar','media','artwork','privacy','commentDraft','commentDraftAt','commentDraftDuration','commentsOpen','liked','saved','followed','reposted'].includes(k)));
  if(type==='instagram-feed')patch.storyNames=Array.from({length:4},(_,i)=>'user_'+String(seed+i+2).padStart(2,'0'));
  return patch;
 }
 function parseAction(value){const m=/^feed:(\d+):(.+)$/.exec(value);return m?{index:Number(m[1]),action:m[2]}:null}
 function context(project,item,index){return{...project,...item,feedItems:[],mailItems:[],props:{...project.props,privacy:item.privacy??project.props.privacy},mediaKind:item.media?.startsWith('data:video/')?'video':'image',_collectionIndex:index}}
 function scope(markup,index){
  if(!markup)return '';
  return '<div class="collection-post" data-feed-index="'+index+'">'+markup.replace(/data-phone-action="([^"]+)"/g,(_,v)=>'data-phone-action="feed:'+index+':'+v+'"').replace(/data-(phone|film)-field="([^"]+)"/g,(_,kind,key)=>'data-'+kind+'-field="feedItems.'+index+'.'+key.replace(/^props\./,'')+'"').replace(/data-phone-composer="commentDraft"/g,'data-phone-composer="feedItems.'+index+'.commentDraft"')+'</div>';
 }
 function media(item,cls=''){
  return '<div class="ph-media collection-media '+cls+'" data-artwork="'+item.artwork+'">'+(item.media?(item.media.startsWith('data:video/')?'<canvas data-collection-video="'+item._collectionIndex+'"></canvas><button type="button" class="collection-video-toggle" data-phone-action="video" aria-label="게시물 영상 재생·일시정지"><svg viewBox="0 0 24 24"><path d="M8 5v14l11-7Z"/></svg></button>':'<img alt="게시물 이미지" src="'+esc(item.media)+'">'):'<div class="collection-art" aria-label="예시 이미지"><i></i><i></i><i></i><span>STUDIO NOTES</span><b>'+String(item.artwork+1).padStart(2,'0')+'</b></div>')+'<button type="button" class="ph-media-edit" data-phone-action="media" aria-label="게시물 이미지 바꾸기">미디어 변경</button></div>';
 }
 return{supported,feedText,mailText,mailCategories,flags,defaults,validate,generate,parseAction,context,scope,media,clone};
})();
if(typeof module!=='undefined')module.exports=SceneCollections;
