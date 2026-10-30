
'use strict';
const FilmModels=(()=>{
 const field=(key,label,kind='text',extra={})=>({key,label,kind,...extra});
 const specs={
  'phone-call':{name:'전화',kind:'수신·통화',section:'시스템',brand:'phone',glyph:'phone',group:'PHONE CALL',fields:[field('name','연락처 이름'),field('number','전화번호'),field('network','통화 안내'),field('iphoneLocked','iPhone 잠금 상태','checkbox')],props:{iphoneLocked:true,number:'010-1234-5678',network:'휴대전화'},person:'User 2'},
  'phone-notifications':{name:'잠금화면',kind:'알림',section:'시스템',brand:'phone',glyph:'bell',group:'LOCK SCREEN',messages:true,fields:[field('lockDate','날짜'),field('appA','상대 알림 앱'),field('appB','내 알림 앱'),field('name','상대 알림 제목'),field('handle','내 알림 제목'),field('notificationStyle','알림 표시','select',{options:{cards:'내용 카드',icons:'앱 아이콘'}})],props:{notificationStyle:'cards',get lockDate(){return new Date().toLocaleDateString('ko-KR',{month:'long',day:'numeric',weekday:'long'})},appA:'카카오톡',appB:'Mail'},person:'User 2',handle:'User 1'},
  'news-article':{name:'뉴스',kind:'기사',section:'웹 화면',brand:'news',glyph:'grid',group:'NEWS ARTICLE',desktop:true,fields:[field('newsSection','초기 카테고리','select',{options:(typeof NewsModel!=='undefined'?NewsModel:require('./news-model.js')).categories}),field('browserAddress','인터넷 주소'),field('publisher','매체 이름'),field('headline','제목','textarea'),field('summary','요약문','textarea'),field('imageCaption','사진 설명'),field('category','분류'),field('byline','기자'),field('published','발행 시각'),field('body','기사 본문','textarea')],props:{newsSection:'it',browserAddress:'n.news.naver.com/article/000/0000000000',publisher:'크리에이티브뉴스',summary:'기술과 창작이 만나는 새로운 작업 방식\n아이디어를 현실로 연결하는 사람들',imageCaption:'사진 설명을 입력하세요.',headline:'우리의 일상을 바꾸는 새로운 기술',category:'테크 · 라이프',byline:'User 1 기자',get published(){return new Date().toLocaleDateString('ko-KR',{year:'numeric',month:'2-digit',day:'2-digit'}).replace(/\s/g,'')}}},
  'email-inbox':{name:'이메일',kind:'받은편지함·본문',section:'웹 화면',brand:'mail',glyph:'mail',group:'MAIL',desktop:true,fields:[field('browserAddress','인터넷 주소'),field('service','메일 서비스'),field('mailCategory','메일 분류','select',{options:{primary:'Primary',promotions:'Promotions',social:'Social'}}),field('subject','제목'),field('sender','보낸 사람'),field('senderAddress','발신 주소'),field('recipient','수신 주소'),field('emailTime','표시 시각'),field('attachment','첨부 이름'),field('body','메일 본문','textarea')],props:{browserAddress:'mail.google.com/mail/u/0/#inbox',service:'Gmail',mailCategory:'primary',subject:'다음 프로젝트 미팅 일정 안내',sender:'User 2',senderAddress:'studio@example.com',recipient:'creator@example.com',emailTime:'오전 9:41',attachment:'project-brief.pdf'}},
  'youtube-watch':{name:'YouTube',kind:'영상·댓글',section:'SNS',brand:'youtube',glyph:'video',group:'VIDEO PLATFORM',desktop:true,video:true,fields:[field('title','영상 제목'),field('name','채널 이름'),field('subscribers','구독자 표시'),field('views','조회수'),field('postTime','게시 시점'),field('body','설명','textarea'),field('videoLength','영상 길이 · 초','number',{min:1,max:36000}),field('videoStart','원본 시작 · 초','number',{min:0,max:36000})],props:{title:'오늘의 작업을 기록합니다',subscribers:'구독자 1.2만명',videoLength:222,videoStart:0},person:'User 1'},
  'facebook-feed':{name:'Facebook',kind:'피드·댓글',section:'SNS',brand:'facebook',glyph:'person',group:'SOCIAL FEED',desktop:true,video:true,fields:[field('name','게시자 이름'),field('postTime','표시 시각'),field('body','게시물','textarea'),field('likes','반응 수'),field('comments','댓글 수'),field('shares','공유 수'),field('privacy','공개 범위')],props:{privacy:'전체 공개'},person:'User 2'},
  'discord-channel':{name:'Discord',kind:'채널 채팅',section:'메신저',brand:'discord',glyph:'chat',group:'DISCORD CHAT',desktop:true,messages:true,fields:[field('showMembers','멤버 목록 표시','checkbox'),field('server','서버 이름'),field('channel','채널 이름'),field('topic','채널 설명'),field('name','상대 이름'),field('handle','내 이름'),field('otherAvatar','상대 프로필 사진','avatar'),field('selfAvatar','내 프로필 사진','avatar')],props:{showMembers:true,otherAvatar:'',selfAvatar:'',server:'CREATIVE STUDIO',channel:'작업실',topic:'아이디어와 작업물을 공유하는 곳'},person:'User 2',handle:'User 1'},
  'discord-dm':{name:'Discord',kind:'DM',section:'메신저',brand:'discord',glyph:'chat',group:'DISCORD DM',desktop:true,messages:true,fields:[field('showProfile','프로필·멤버 패널 표시','checkbox'),field('callMode','통화 시작 상태','select',{options:{none:'채팅 화면',incoming:'전화 수신',outgoing:'전화 발신'}}),field('name','상대 이름'),field('handle','내 이름'),field('status','상태'),field('otherAvatar','상대 프로필 사진','avatar'),field('selfAvatar','내 프로필 사진','avatar')],props:{showProfile:true,callMode:'none',otherAvatar:'',selfAvatar:'',status:'온라인'},person:'User 2',handle:'User 1'},
  'discord-voice':{name:'Discord',kind:'발화자 오버레이',section:'메신저',brand:'discord',glyph:'mic',group:'VOICE OVERLAY',desktop:true,fields:[field('exportFormat','동영상 출력','select',{options:{mov:'투명 MOV · ProRes 4444',sequence:'투명 PNG 시퀀스 · ZIP',mp4:'MP4 · 배경 포함'}}),field('layout','배치','select',{options:{horizontal:'가로',vertical:'세로'}}),field('ringColor','발화 테두리','color'),field('background','배경','select',{options:{transparent:'투명',dark:'어두운 배경',chroma:'크로마키 · 마젠타'}}),field('sensitivity','감지 기준 · RMS','number',{min:.005,max:.2,step:.005}),field('sourceStart','음성 원본 시작 · 초','number',{min:0,max:600,step:.1}),field('hold','발화 유지 · 초','number',{min:0,max:1,step:.02}),field('previewVolume','미리보기 음량','number',{min:0,max:1,step:.05}),field('showNames','이름 표시','checkbox'),field('dimInactive','비발화자 어둡게','checkbox')],props:{exportFormat:'sequence',layout:'horizontal',ringColor:'#23a559',background:'transparent',sensitivity:.025,sourceStart:0,hold:.16,previewVolume:.7,showNames:true,dimInactive:true}}
 };
 const scenes=Object.entries(specs).map(([id,s])=>({id,name:s.name,kind:s.kind,section:s.section,brand:s.brand,glyph:s.glyph,group:s.group,film:true}));
 function defaults(id){
  const s=specs[id];if(!s)return{props:{},voices:[]};
  const result={props:{...s.props},voices:[],device:s.desktop?'desktop':'iphone',ratio:s.desktop?'landscape':'device',motion:s.messages?'messages':'still',name:s.person||'User 1'};
  if(s.handle)result.handle=s.handle;
  if(id.startsWith('discord-'))result.theme='dark';
  if(id==='phone-call')result.name='User 2';
  if(id==='news-article')result.body='좋은 아이디어는 익숙한 장면을 새로운 시선으로 바라보는 데서 시작된다.\n\n창작자들은 도구와 기술을 활용해 작업 방식을 바꾸고 있다. 반복되는 과정을 줄이고, 더 중요한 판단에 집중하는 것이다.\n\n새로운 가능성은 일상에서 발견된다. 사람과 기술이 만나는 현장을 기록했다.';
  if(id==='email-inbox')result.body='안녕하세요.\n\n다음 프로젝트의 킥오프 미팅은 내일 오후 2시에 진행합니다.\n첨부한 기획안을 미리 확인해 주세요.\n\n감사합니다.\nUser 2 드림';
  if(id.startsWith('discord-'))result.messages=[{side:'other',text:'오늘 편집본 확인했어요!',at:.3,time:'오전 9:41'},{side:'me',text:'좋아요. 피드백 남겨주세요.',at:1.8,time:'오전 9:41'},{side:'other',text:'마지막 전환만 조금 빠르게 해볼까요?',at:3.4,time:'오전 9:42'},{side:'me',text:'반영해서 다시 공유할게요.',at:5.2,time:'오전 9:42'}];
  if(id==='phone-notifications')result.messages=[{side:'other',text:'지금 어디야? 곧 도착해.',at:.5,time:'지금'},{side:'me',text:'새 프로젝트 미팅 일정이 도착했습니다.',at:2,time:'지금'},{side:'other',text:'입구에서 기다릴게!',at:3.6,time:'지금'}];
  if(id==='discord-voice')result.voices=[{name:'User 1',avatar:'',audioName:'',gain:1,muted:false,envelope:[],segments:[{start:.5,end:2},{start:4.2,end:5.8}]},{name:'User 2',avatar:'',audioName:'',gain:1,muted:false,envelope:[],segments:[{start:2.1,end:4},{start:6,end:7.5}]}];
  return result;
 }
 function validate(id,input,voices){
  const s=specs[id],out={...(s?.props||{})};input??={};
  if(typeof input!=='object'||Array.isArray(input)||input===null)throw new Error('화면 설정 형식이 올바르지 않습니다.');
  const fields=s?.fields.filter(f=>Object.hasOwn(s.props,f.key))||[];
  for(const[key,value]of Object.entries(input)){
   const f=fields.find(f=>f.key===key);if(!f)throw new Error('알 수 없는 화면 설정입니다.');
   if(f.kind==='number'){if(!Number.isFinite(value)||value<f.min||value>f.max)throw new Error(f.label+' 범위를 확인해 주세요.')}
   else if(f.kind==='avatar'){if(typeof value!=='string'||value.length>2e6||(value&&!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(value)))throw new Error('프로필 사진이 올바르지 않습니다.')}
   else if(f.kind==='checkbox'){if(typeof value!=='boolean')throw new Error(f.label+' 형식을 확인해 주세요.')}
   else if(typeof value!=='string'||value.length>5000||(f.kind==='color'&&!/^#[0-9a-f]{6}$/i.test(value))||(f.kind==='select'&&!Object.hasOwn(f.options,value)))throw new Error(f.label+' 값이 올바르지 않습니다.');
   out[key]=value;
  }
  if(voices===undefined)voices=defaults(id).voices;
  if(!Array.isArray(voices)||voices.length>6)throw new Error('음성 참가자는 6명까지 사용할 수 있습니다.');
  const safeVoices=voices.map(v=>{
   if(!v||typeof v.name!=='string'||v.name.length>60||typeof v.audioName!=='string'||v.audioName.length>300||typeof v.muted!=='boolean'||!Number.isFinite(v.gain)||v.gain<0||v.gain>4||
     typeof v.avatar!=='string'||v.avatar.length>2e6||(v.avatar&&!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(v.avatar))||
     !Array.isArray(v.envelope)||v.envelope.length>30000||v.envelope.some(x=>!Number.isInteger(x)||x<0||x>1000)||!Array.isArray(v.segments)||v.segments.length>100)throw new Error('참가자 데이터가 올바르지 않습니다.');
   const segments=v.segments.map(x=>{if(!x||!Number.isFinite(x.start)||!Number.isFinite(x.end)||x.start<0||x.end<=x.start||x.end>600)throw new Error('발화 구간이 올바르지 않습니다.');return{start:x.start,end:x.end}});
   return{name:v.name,audioName:v.audioName,muted:v.muted,gain:v.gain,avatar:v.avatar,envelope:[...v.envelope],segments};
  });
  return{props:out,voices:safeVoices};
 }
 function size(p){
  if(!specs[p.type])return null;
  if(specs[p.type].desktop&&p.device==='desktop')return ['youtube-watch','email-inbox'].includes(p.type)?[1920,1080]:[1280,720];
  return[432,p.ratio==='device'?(p.device==='android'?960:432*2532/1170):768];
 }
 function parseSegments(text){
  if(!text.trim())return[];
  return text.split(/[,;\n]+/).filter(x=>x.trim()).map(part=>{const m=/^\s*(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*$/.exec(part);if(!m||Number(m[2])<=Number(m[1])||Number(m[2])>600)throw new Error('0.5-2.0, 3.2-4.8 형식으로 입력해 주세요.');return{start:Number(m[1]),end:Number(m[2])}});
 }
 function voiceLevel(p,v,time){
  if(v.muted)return 0;
  if(!v.envelope.length)return v.segments.some(s=>time>=s.start&&time<s.end)?1:0;
  const index=Math.floor((time+p.props.sourceStart)*50),hold=Math.ceil(p.props.hold*50);let level=0;
  for(let i=Math.max(0,index-hold);i<=index&&i<v.envelope.length;i++)level=Math.max(level,v.envelope[i]/1000*v.gain);
  return level>=p.props.sensitivity?Math.min(1,level/Math.max(.005,p.props.sensitivity*3)):0;
 }
 function envelope(samples,rate,maxSeconds=600){
  const count=Math.min(Math.ceil(samples.length/rate*50),maxSeconds*50),out=[];
  for(let i=0;i<count;i++){const start=Math.floor(i*rate/50),end=Math.min(samples.length,Math.floor((i+1)*rate/50));let sum=0;for(let j=start;j<end;j++)sum+=samples[j]*samples[j];out.push(Math.min(1000,Math.round(Math.sqrt(sum/Math.max(1,end-start))*1000)))}
  return out;
 }

 function mediaTime(p,time){
  if(!['youtube-watch','x-feed','instagram-feed','instagram-reels','facebook-feed'].includes(p.type))return time;let elapsed=0,cursor=0,playing=true;
  for(const e of p.actions.filter(e=>e.action==='video'&&e.at<=time).sort((a,b)=>a.at-b.at)){if(playing)elapsed+=e.at-cursor;cursor=e.at;playing=e.value}
  if(playing)elapsed+=time-cursor;return(p.type==='youtube-watch'?p.props.videoStart:0)+elapsed;
 }
 function actions(id){
  if(id==='discord-dm')return['call-start','call-answer','call-end','call-mute','call-speaker'];
  if(id==='phone-call')return['call-answer','call-end','call-mute','call-speaker','call-keypad'];
  if(id==='naver-search')return['ai-expand','source-expand','naver-account','naver-services'];
  if(id.startsWith('google-'))return id==='google-ai'?['source-expand']:id==='google-search'?[]:['ai-expand','source-expand'];
  if(id==='phone-notifications')return['notices','lock-light'];
  if(id==='news-article')return['like','follow','comments',...Object.keys((typeof NewsModel!=='undefined'?NewsModel:require('./news-model.js')).categories).map(key=>'news-category:'+key),'news-open'];
   if(id==='email-inbox')return['mail','mail-sidebar','mail-tab:primary','mail-tab:promotions','mail-tab:social'];
  if(id==='youtube-watch')return['like','follow','video','comments'];
  if(id==='facebook-feed')return['like','comments','follow'];
  return specs[id]?[]:['like','double-like','save','follow','repost','comments'];
 }
 return{specs,scenes,defaults,validate,size,parseSegments,voiceLevel,envelope,mediaTime,actions};
})();
if(typeof module!=='undefined')module.exports=FilmModels;
