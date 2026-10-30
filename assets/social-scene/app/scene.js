const SCENE_CHAT_CLOCK=typeof ChatClock!=='undefined'?ChatClock:require('./chat-clock.js');
const SCENE_CHAT_MEDIA=typeof ChatMedia!=='undefined'?ChatMedia:require('./chat-media.js');
const SCENE_NEWS=typeof NewsModel!=='undefined'?NewsModel:require('./news-model.js');
const SCENE_TIMING=typeof SceneTiming!=='undefined'?SceneTiming:require('./scene-timing.js');
const SCENE_MOTION_KEYS=typeof MotionKeys!=='undefined'?MotionKeys:require('./motion-keys.js');
const SCENE_CHAT_TYPING=typeof ChatTyping!=='undefined'?ChatTyping:require('./chat-typing.js');
const SCENE_SEARCH_UI=typeof SearchUI!=='undefined'?SearchUI:require('./search-layout.js');
const SCENE_CHAT_MODELS=typeof ChatModels!=='undefined'?ChatModels:require('./chat-models.js');
'use strict';
const SCENE_FILM_MODELS=typeof FilmModels!=='undefined'?FilmModels:require('./film-models.js');

const SOCIAL_SCENES = [
  { id: 'kakao-chat', name: '카카오톡', kind: '대화방', group: 'MESSENGER', section: '메신저', brand: 'kakao', glyph: 'chat' },
  { id: 'kakao-overlay', name: '카카오톡', kind: '투명 대화', group: 'TEXT OVERLAY', section: '메신저', brand: 'kakao', glyph: 'chat' },
  { id: 'x-feed', name: 'X', kind: '피드', group: 'SOCIAL FEED', section: 'SNS', brand: 'x', glyph: 'x' },
  { id: 'x-profile', name: 'X', kind: '프로필', group: 'PROFILE', section: 'SNS', brand: 'x', glyph: 'x' },
  { id: 'x-dm', name: 'X', kind: 'DM', group: 'DIRECT MESSAGE', section: 'SNS', brand: 'x', glyph: 'x' },
  { id: 'instagram-feed', name: 'Instagram', kind: '피드', group: 'SOCIAL FEED', section: 'SNS', brand: 'instagram', glyph: 'camera' },
  { id: 'instagram-reels', name: 'Instagram', kind: '릴스', group: 'REELS', section: 'SNS', brand: 'instagram', glyph: 'camera' },
  { id: 'instagram-dm', name: 'Instagram', kind: 'DM', group: 'DIRECT MESSAGE', section: 'SNS', brand: 'instagram', glyph: 'camera' },
  { id: 'google-search', name: 'Google', kind: '검색', group: 'WEB SEARCH', section: '검색', brand: 'google', glyph: 'search' },
  { id: 'google-overview', name: 'Google', kind: 'AI 개요', group: 'AI OVERVIEW', section: '검색', brand: 'google', glyph: 'search' },
  { id: 'google-ai', name: 'Google', kind: 'AI 모드', group: 'AI MODE', section: '검색', brand: 'google', glyph: 'search' },
  { id: 'naver-search', name: 'NAVER', kind: '통합검색', group: 'WEB SEARCH', section: '검색', brand: 'naver', glyph: 'search' },
  ...[['kakao-group','카카오톡','kakao'],['instagram-group','Instagram','instagram'],['x-group','X','x']].map(([id,name,brand])=>({id,name,kind:'그룹 채팅',group:'GROUP CHAT',section:brand==='kakao'?'메신저':'SNS',brand,glyph:'chat'})),
  ...SCENE_FILM_MODELS.scenes,
];
const SCENE_SIZES = { portrait: [1080, 1920], landscape: [1920, 1080], square: [1080, 1080], device: [1170,2532] };
const SEARCH_FAVICONS = {
  globe: '기본 · 지구본', letter: '사이트 첫 글자', google: 'Google', naver: 'NAVER · N',
  youtube: 'YouTube · 재생', wikipedia: 'Wikipedia · W', custom: '직접 올린 이미지',
};
const SCENE_CALL_AUDIO=typeof module!=='undefined'?require('./call-audio.js'):CallAudio;
const SCENE_ELEMENTS=typeof module!=='undefined'?require('./element-model.js'):ElementModel;
const SCENE_REPLIES=typeof module!=='undefined'?require('./comment-motion.js'):SceneReplies;
const SCENE_COLLECTIONS=typeof module!=='undefined'?require('./content-collections.js'):SceneCollections;

const SCENE_ICONS = {
  equal:'M4 8h16M4 15h16',attach:'M21 11.5 11.5 21a6 6 0 0 1-8.5-8.5L12 3a4 4 0 0 1 5.7 5.7l-9.6 9.6a2 2 0 0 1-2.8-2.8L14 6.8',copy:'M8 3h12v14H8zM4 7H2v14h13v-2',edit:'m4 16-1 5 5-1L21 7l-5-5zM13 5l5 5',
  settings:'M9 3h6l1 3 3 1 2 5-2 5-3 1-1 3H9l-1-3-3-1-2-5 2-5 3-1zM16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0',
  'thumb-down':'M7 14V3H3v11h4Zm0 0 5 8c2 0 3-2 2-5l-1-3h7l1-2-3-9H7',inbox:'M3 4h18v16H3zM3 13h5l2 3h4l2-3h5',calendar:'M3 5h18v16H3zM7 2v6M17 2v6M3 10h18',gift:'M3 8h18v4H3zM5 12v9h14v-9M12 8v13M12 8C4-1 3 8 12 8s8-9 0 0',
  'google-share':'M21 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM9 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM21 19a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM8.6 10.5l6.8-4M8.6 13.5l6.8 4',
  chevron:'m6 9 6 6 6-6',up:'M12 20V4m-6 6 6-6 6 6',
  reels: 'M3 4h18v16H3zM3 9h18M8 4l4 5m3-5 4 5M10 12l6 3-6 3z',
  close:'M6 6l12 12M18 6 6 18',play:'M8 5v14l11-7Z',pause:'M8 5v14M16 5v14',mail:'M3 5h18v14H3zM3 5l9 7 9-7',thumb:'M7 10v11H3V10h4Zm0 0 5-8c2 0 3 2 2 5l-1 3h7l1 2-3 9H7',
  reload:'M20 8V3l-3 3a8 8 0 1 0 3 9M20 8h-5',lock:'M7 10V7a5 5 0 0 1 10 0v3M5 10h14v11H5z','browser-back':'M19 12H5m7-7-7 7 7 7','browser-forward':'M5 12h14m-7-7 7 7-7 7',
  back: 'M15 5 8 12l7 7', search: 'M21 21l-5-5M19 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0',
  keyboard: 'M2 5h20v14H2zM5 9h.01M9 9h.01M13 9h.01M17 9h.01M5 12h.01M9 12h.01M13 12h.01M17 12h.01M7 16h10',
  menu: 'M4 6h16M4 12h16M4 18h16', plus: 'M12 4v16M4 12h16', more: 'M5 12h.01M12 12h.01M19 12h.01',
  phone: 'M6 3 3 6c0 7 8 15 15 15l3-3-5-4-3 2-5-5 2-3z',
  video: 'M3 6h12v12H3zM15 10l6-4v12l-6-4', send: 'm3 3 19 8-9 3-3 9-7-20Zm10 11 9-3',
  heart: 'M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z',
  chat: 'M21 11a9 9 0 0 1-9 9H5l-4 3 1-7a9 9 0 1 1 19-5Z',
  repost: 'm4 9 3-3 3 3M7 6v11h10m3-2-3 3-3-3m3 3V7H7',
  stats: 'M5 20v-6M12 20V4M19 20v-11', share: 'M12 16V3m-5 5 5-5 5 5M4 13v8h16v-8',
  bookmark: 'M5 3h14v19l-7-5-7 5z', home: 'm3 10 9-7 9 7v11h-6v-7H9v7H3z',
  bell: 'M5 16h14l-2-3V8a5 5 0 0 0-10 0v5zM10 21h4',
  person: 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 22v-3a8 8 0 0 1 16 0v3',
  smile: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM8 10h.01M16 10h.01M8 15q4 4 8 0',
  camera: 'M8 5l2-3h4l2 3h6v16H2V5zM17 13a5 5 0 1 1-10 0 5 5 0 0 1 10 0Z',
  music: 'M9 18V4l12-2v14M9 4l12-2M9 18a3 3 0 1 1-3-3q3 0 3 3Zm12-2a3 3 0 1 1-3-3q3 0 3 3Z',
  info:'M12 11v6M12 7h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0', image:'M3 4h18v16H3zM3 16l5-5 4 4 3-3 6 6M16 8h.01', 'more-vertical':'M12 5h.01M12 12h.01M12 19h.01',
  check: 'm5 12 4 4L19 6', grid: 'M3 3h7v7H3zM14 3h7v7h-7zM3 14h7v7H3zM14 14h7v7h-7z',
  mic: 'M9 5a3 3 0 0 1 6 0v7a3 3 0 0 1-6 0ZM5 10v2a7 7 0 0 0 14 0v-2M12 19v3M8 22h8',
  globe: 'M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM3 12h18M12 3q-8 9 0 18 8-9 0-18Z',
  sparkles: 'm12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5ZM20 2v4m-2-2h4',
};

function newScene(id) {
  if (!SOCIAL_SCENES.some(scene => scene.id === id)) throw new Error('지원하지 않는 템플릿입니다.');
  const now = new Date();
  const chat = id.endsWith('chat') || id.endsWith('dm') || SCENE_CHAT_MODELS.native(id);
  const search = SOCIAL_SCENES.find(scene => scene.id === id).section === '검색';
  const base = {
    ...SCENE_MOTION_KEYS.validate({}),...SCENE_ELEMENTS.validate({}),version: 1, type: id, theme: SCENE_CHAT_MODELS.base(id) === 'x-dm' || id === 'instagram-reels' ? 'dark' : 'light',
    ratio: search ? 'landscape' : 'portrait', clock: now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0'), name: chat?'User 2':'User 1', handle: 'user_01',
    bio: '작은 장면들을 모아 이야기를 만듭니다.\nVisual diary, Seoul.', followers: '1.2만', following: '248',
    body: '조금 느리게 바라보면,\n평범한 하루에도 좋은 장면이 있어요.\n\n오늘의 기록을 남겨봅니다. #일상 #기록',
    postTime: id.startsWith('instagram') ? 'Seoul, Korea' : '2시간',
    likes: '1,284', comments: '2', reposts: '86', shares: '21', reactionStyle: 'modern', music: 'User 1 · Original audio', verified: false,
    receipt: SCENE_CHAT_MODELS.base(id) === 'kakao-chat' ? '1' : '읽음', bubbleColor: '#a033ff', bubbleEnd: '#0a7cff',
    autoRead: chat, showTyping: chat, typewriter: chat, typingDuration: 1.2, readDelay: .5,
    date: new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' }), duration: search ? 10 : 8, scroll: 100, motion: search ? 'search' : chat ? 'messages' : 'still',
    query: '좋은 영상은 어떻게 만들어질까', suggestions: '좋은 영상 만드는 방법\n영상 스토리텔링의 기본\n촬영과 편집으로 이야기 만들기',
    answer: '좋은 영상은 분명한 의도와 일관된 시각적 선택에서 시작됩니다. 무엇을 보여줄지 정한 뒤, 장면의 순서와 길이, 시선의 흐름을 함께 설계하는 것이 중요합니다.\n\n1. 전달할 이야기를 한 문장으로 정리하세요.\n2. 구도와 빛으로 장면의 감정을 표현하세요.\n3. 편집의 리듬과 사운드로 흐름을 완성하세요.',
    searchAt: 3.2, queryDuration: 2.4, answerDuration: 2.5, browserFrame: true, desktopBrowser: 'windows', aiBriefing: true, camera: search ? 'follow' : 'none', cameraZoom: 1.18,
    results: [
      { site: 'Frame Notes', domain: 'frame-notes.example', title: '이야기를 만드는 영상 제작의 기본', snippet: '기획에서 촬영, 편집까지. 시선을 이끄는 장면과 자연스러운 흐름을 만드는 방법을 알아봅니다.' },
      { site: 'Studio Journal', domain: 'studio-journal.example', title: '일상의 장면을 한 편의 영상으로', snippet: '좋은 구도와 빛, 적절한 컷의 길이. 기록을 이야기로 바꾸는 제작 노트를 소개합니다.' },
      { site: 'Creative Archive', domain: 'creative-archive.example', title: '촬영과 편집을 연결하는 스토리텔링', snippet: '무엇을 보여주고 언제 전환할까요? 영상의 의도와 리듬을 함께 설계하는 실무 가이드.' },
    ].map(result => ({ ...result, favicon: 'globe', faviconImage: '', thumbnail: '' })),
    avatar: '', media: '', mediaKind: 'image', mediaName: '',
    previewVolume:.7,previewMuted:false,device:search?'desktop':'iphone',androidNavigation:'gesture',iphoneNavigation:'gesture',logoStyle:id==='instagram-feed'?'classic':'current', actions: [], viewScroll: 0, commentScroll: 0, speed: 1, liked: false, saved: false, followed: false, reposted: false, commentsOpen: false,
    ringtoneEnabled:true,ringtoneKind:'auto',ringtoneData:'',ringtoneName:'',
    chatDraft: '', commentDraft: '',commentDraftAt:0,commentDraftDuration:0, views: '2.4만', location: 'Seoul', joined: new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' }),
    showOtherStories:true,storyNames: ['user_01','user_02','user_03','user_04'],
    customStyle: false, phoneBackground: '#ffffff', phoneForeground: '#11161a', phoneMuted: '#747e86',
    commentItems: [
      { author: 'user_02', text: '분위기 너무 좋아요!', time: '1시간', likes: '12', liked: false },
      { author: 'user_03', text: '이런 장면 오래 보고 싶네요.', time: '35분', likes: '3', liked: false },
    ],
    messages: [
      { side: 'other', text: '오늘 촬영 몇 시에 시작해?', at: 0.4, time: '오후 1:24' },
      { side: 'me', text: '오후 두 시!\n장소 먼저 보내줄게.', at: 1.9, time: '오후 1:25' },
      { side: 'other', text: '좋아. 카메라 챙겨서 갈게.', at: 3.6, time: '오후 1:25' },
      { side: 'me', text: '이따 봐. 오늘도 잘 만들어보자!', at: 5.1, time: '오후 1:26' },
    ],
  };
  if(id==='kakao-overlay')Object.assign(base,{ratio:'landscape',overlayFormat:'mov',overlayScale:70,showTyping:false});
  const complete=Object.assign(base,SCENE_CHAT_TYPING.defaults(id),SCENE_SEARCH_UI.defaults(id),SCENE_FILM_MODELS.defaults(id),SCENE_COLLECTIONS.defaults(id),SCENE_NEWS.defaults(id),SCENE_CHAT_MEDIA.defaults(id),SCENE_CHAT_CLOCK.defaults(id));return Object.assign(complete,SCENE_CHAT_MODELS.defaults(complete));
}

function validateScene(input) {
  if (!input || input.version !== 1) throw new Error('Social Scene 프로젝트 파일이 아닙니다.');
  const result = newScene(input.type);
  if(input.type==='kakao-overlay'&&input.overlayFormat!==undefined){if(!['mov','sequence','mp4'].includes(input.overlayFormat))throw Error('투명 대화 출력 형식을 확인해 주세요.');result.overlayFormat=input.overlayFormat}
  if(input.type==='kakao-overlay'&&input.overlayScale!==undefined){if(!Number.isFinite(input.overlayScale)||input.overlayScale<45||input.overlayScale>100)throw Error('대화 폭은 45~100%로 설정해 주세요.');result.overlayScale=input.overlayScale}
  for (const key of ['theme', 'ratio', 'motion']) {
    const allowed = { theme: ['light', 'dark'], ratio: Object.keys(SCENE_SIZES), motion: ['messages', 'scroll', 'reveal', 'still', 'search'] }[key];
    if (!allowed.includes(input[key])) throw new Error('프로젝트의 화면 설정이 올바르지 않습니다.');
    result[key] = input[key];
  }
  for (const key of ['clock', 'name', 'handle', 'bio', 'followers', 'following', 'body', 'postTime', 'likes', 'comments', 'reposts', 'music', 'date', 'mediaName']) {
    if (typeof input[key] !== 'string' || input[key].length > 3000) throw new Error('프로젝트의 텍스트가 올바르지 않습니다.');
    result[key] = input[key];
  }
  for (const [key, min, max] of [['duration', 2, SCENE_TIMING.maxDuration], ['scroll', 0, SCENE_COLLECTIONS.supported.includes(result.type)?100000:result.type.startsWith('google-')||result.type==='naver-search'?10000:1200]]) {
    if (!Number.isFinite(input[key]) || input[key] < min || input[key] > max) throw new Error('프로젝트의 시간 또는 스크롤 값이 올바르지 않습니다.');
    result[key] = input[key];
  }
  for (const key of ['avatar', 'media']) {
    const pattern = key === 'avatar' ? /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/ : /^data:(image\/(png|jpeg|webp)|video\/(mp4|webm|quicktime));base64,[A-Za-z0-9+/=]+$/;
    if (typeof input[key] !== 'string' || input[key].length > 32 * 1024 * 1024 || (input[key] && !pattern.test(input[key]))) throw new Error('미디어 형식이나 크기를 확인해 주세요.');
    result[key] = input[key];
  }
  result.mediaKind = result.media.startsWith('data:video/') ? 'video' : 'image';
  result.verified = input.verified === true;
  if (input.shares !== undefined) {
    if (typeof input.shares !== 'string' || input.shares.length > 20) throw new Error('공유 수치가 올바르지 않습니다.');
    result.shares = input.shares;
  }
  if (input.reactionStyle !== undefined) {
    if (!['modern', 'classic'].includes(input.reactionStyle)) throw new Error('반응 표시 형식이 올바르지 않습니다.');
    result.reactionStyle = input.reactionStyle;
  }
  if (input.receipt !== undefined) {
    if (typeof input.receipt !== 'string' || input.receipt.length > 20) throw new Error('읽음 표시 형식이 올바르지 않습니다.');
    result.receipt = input.receipt;
  }
  for (const key of ['bubbleColor', 'bubbleEnd']) {
    if (input[key] !== undefined) {
      if (!/^#[a-f\d]{6}$/i.test(input[key])) throw new Error('말풍선 색상이 올바르지 않습니다.');
      result[key] = input[key];
    }
  }
  for (const key of ['autoRead', 'showTyping', 'typewriter', 'browserFrame', 'aiBriefing']) {
    if (input[key] !== undefined) {
      if (typeof input[key] !== 'boolean') throw new Error('대화 모션 옵션이 올바르지 않습니다.');
      result[key] = input[key];
    }
  }
  for (const [key, min, max] of [['typingDuration', .2, 10], ['readDelay', 0, 10], ['searchAt', .6, SCENE_TIMING.maxDuration-1], ['queryDuration', .2, 10], ['answerDuration', .2, 15], ['cameraZoom', 1, 1.8]]) {
    if (input[key] !== undefined) {
      if (!Number.isFinite(input[key]) || input[key] < min || input[key] > max) throw new Error('대화 모션 시간이 올바르지 않습니다.');
      result[key] = input[key];
    }
  }
  for (const key of ['query', 'suggestions', 'answer']) {
    if (input[key] !== undefined) {
      if (typeof input[key] !== 'string' || input[key].length > 5000) throw new Error('검색 화면 텍스트가 올바르지 않습니다.');
      result[key] = input[key];
    }
  }
  if (input.camera !== undefined) {
    if (!['none', 'follow', 'focus'].includes(input.camera)) throw new Error('카메라 설정이 올바르지 않습니다.');
    result.camera = input.camera;
  }
  if (input.results !== undefined) {
    if (!Array.isArray(input.results) || input.results.length > 8) throw new Error('검색 결과는 8개까지 추가할 수 있습니다.');
    result.results = input.results.map(item => {
      if (!item || ['site', 'domain', 'title', 'snippet'].some(key => typeof item[key] !== 'string' || item[key].length > 2000)) throw new Error('검색 결과 항목이 올바르지 않습니다.');
      const favicon = item.favicon ?? 'globe', faviconImage = item.faviconImage ?? '';
      if (!Object.hasOwn(SEARCH_FAVICONS, favicon) || typeof faviconImage !== 'string' || faviconImage.length > 1024 * 1024 ||
        (faviconImage && !/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(faviconImage))) throw new Error('사이트 아이콘 형식이나 크기를 확인해 주세요.');
      const thumbnail=item.thumbnail??'';if(typeof thumbnail!=='string'||thumbnail.length>2*1024*1024||(thumbnail&&!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(thumbnail)))throw new Error('검색 결과 이미지 형식이나 크기를 확인해 주세요.');
      return { site: item.site, domain: item.domain, title: item.title, snippet: item.snippet, favicon, faviconImage, thumbnail };
    });
  }
  if (!Array.isArray(input.messages) || input.messages.length > SCENE_CHAT_MODELS.messageLimit(result)) throw new Error('메시지 개수가 허용 범위를 넘었습니다.');
  result.messages = input.messages.map(message => {
    if (!message || !['me', 'other'].includes(message.side) || typeof message.text !== 'string' || message.text.length > 3000 ||
      typeof message.time !== 'string' || message.time.length > 30 || !Number.isFinite(message.at) || message.at < 0 || message.at > SCENE_TIMING.maxDuration) throw new Error('메시지 형식이 올바르지 않습니다.');
    return { side: message.side, text: message.text, time: message.time, at: message.at };
  });
  for (const key of ['liked','saved','followed','reposted','commentsOpen','customStyle','showOtherStories']) {
    if (input[key] !== undefined) {
      if (typeof input[key] !== 'boolean') throw new Error('화면 상태가 올바르지 않습니다.');
      result[key] = input[key];
    }
  }
  for (const key of ['chatDraft','commentDraft','views','location','joined']) {
    if (input[key] !== undefined) {
      if (typeof input[key] !== 'string' || input[key].length > 3000) throw new Error('화면 텍스트가 올바르지 않습니다.');
      result[key] = input[key];
    }
  }
  if(input.desktopBrowser!==undefined){
    if(!['windows','macos'].includes(input.desktopBrowser))throw new Error('브라우저 종류가 올바르지 않습니다.');
    result.desktopBrowser=input.desktopBrowser;
  }
  for (const key of ['viewScroll','commentScroll']) {
    if (input[key] !== undefined) {
      if (!Number.isFinite(input[key]) || input[key] < 0 || input[key] > (key==='viewScroll'&&(SCENE_COLLECTIONS.supported.includes(result.type)||SCENE_CHAT_MODELS.enabled(result)||SCENE_CHAT_MODELS.native(result.type))?100000:10000)) throw new Error('화면 스크롤 값이 올바르지 않습니다.');
      result[key] = input[key];
    }
  }
  if(input.previewVolume!==undefined){
    if(!Number.isFinite(input.previewVolume)||input.previewVolume<0||input.previewVolume>1)throw new Error('미리보기 음량은 0~100%로 설정해 주세요.');
    result.previewVolume=input.previewVolume;
  }else if(input.type==='discord-voice'&&Number.isFinite(input.props?.previewVolume))result.previewVolume=input.props.previewVolume;
  if(input.previewMuted!==undefined){
    if(typeof input.previewMuted!=='boolean')throw new Error('미리보기 음소거 설정이 올바르지 않습니다.');
    result.previewMuted=input.previewMuted;
  }
  if (input.speed !== undefined) {
    if (!Number.isFinite(input.speed) || input.speed < .25 || input.speed > 3) throw new Error('재생 속도는 0.25~3배로 설정해 주세요.');
    result.speed = input.speed;
  }
  for (const key of ['phoneBackground','phoneForeground','phoneMuted']) {
    if (input[key] !== undefined) {
      if (typeof input[key] !== 'string' || !/^#[a-f0-9]{6}$/i.test(input[key])) throw new Error('폰 화면 색상이 올바르지 않습니다.');
      result[key] = input[key];
    }
  }
  if (input.storyNames !== undefined) {
    if (!Array.isArray(input.storyNames) || input.storyNames.length !== 4 || input.storyNames.some(name => typeof name !== 'string' || name.length > 60)) throw new Error('스토리 이름은 네 개까지, 각 60자 안으로 입력해 주세요.');
    result.storyNames = [...input.storyNames];
  }
  if (input.commentItems !== undefined) {
    if (!Array.isArray(input.commentItems) || input.commentItems.length > 30) throw new Error('댓글은 30개까지 사용할 수 있습니다.');
    result.commentItems = input.commentItems.map(item => {
      if (!item || ['author','text','time','likes'].some(key => typeof item[key] !== 'string' || item[key].length > (key === 'text' ? 2000 : 60)) ||
        typeof item.liked !== 'boolean') throw new Error('댓글 형식이 올바르지 않습니다.');
      return { author:item.author, text:item.text, time:item.time, likes:item.likes, liked:item.liked,...SCENE_REPLIES.validateCue(item) };
    });
  }
  for(const [key,allowed] of [['device',['desktop','iphone','android']],['androidNavigation',['gesture','buttons','none']],['iphoneNavigation',['gesture','none']]]){if(input[key]!==undefined){if(!allowed.includes(input[key]))throw new Error('기기 설정이 올바르지 않습니다.');result[key]=input[key]}}
  if(input.logoStyle!==undefined&&!['current','classic'].includes(input.logoStyle))throw new Error('Instagram 로고 형식이 올바르지 않습니다.');
  result.logoStyle=input.logoStyle||'classic';
  if(input.actions!==undefined){
    if(!Array.isArray(input.actions)||input.actions.length>60)throw new Error('반응 동작은 60개까지 사용할 수 있습니다.');
    result.actions=input.actions.map(event=>{
      const scoped=event&&SCENE_COLLECTIONS.parseAction(event.action);
      if(scoped&&(!Number.isInteger(scoped.index)||scoped.index<0||scoped.index>18||!Array.isArray(input.feedItems)||scoped.index>=input.feedItems.length||!['x-feed','instagram-feed','facebook-feed'].includes(input.type)))throw new Error('게시물 동작의 대상이 올바르지 않습니다.');
      const action=scoped?scoped.action:event?.action;
      if(scoped&&!/^(like|double-like|save|follow|repost|comments|video|comment-like:(?:[0-9]|[12][0-9]))$/.test(action))throw new Error('게시물 동작이 올바르지 않습니다.');
      if(!event||!Number.isFinite(event.at)||event.at<0||event.at>SCENE_TIMING.maxDuration||typeof event.value!=='boolean'||typeof event.action!=='string'||
        !/^(ai-expand|source-expand|naver-account|naver-services|call-start|call-answer|call-end|call-mute|call-speaker|call-keypad|mail|mail-sidebar|mail-tab:(?:primary|promotions|social)|video|notices|lock-light|like|double-like|save|follow|repost|comments|comment-like:(?:[0-9]|[12][0-9]))$/.test(action)&&!SCENE_NEWS.isAction(action)&&!SCENE_CHAT_MEDIA.isAction(action,input)||
        (action==='double-like'&&!event.value))throw new Error('반응 동작 형식이 올바르지 않습니다.');
      return{at:event.at,action:event.action,value:event.value};
    });
  }
  if(result.device==='desktop'&&!SCENE_FILM_MODELS.specs[result.type]?.desktop&&!result.type.startsWith('google-')&&result.type!=='naver-search')result.device='iphone';
  Object.assign(result,SCENE_FILM_MODELS.validate(input.type,input.props,input.voices));
  Object.assign(result,SCENE_CHAT_MODELS.validate(input,result));
  Object.assign(result,SCENE_COLLECTIONS.validate(input,result),SCENE_REPLIES.validateDraft(input),SCENE_CALL_AUDIO.validate(input),SCENE_ELEMENTS.validate(input),SCENE_SEARCH_UI.validate(input));
  Object.assign(result,SCENE_CHAT_TYPING.validate(input,result),SCENE_MOTION_KEYS.validate(input),SCENE_NEWS.validate(input,result.type));
  Object.assign(result,SCENE_CHAT_MEDIA.validate(input,result),SCENE_CHAT_CLOCK.validate(input,result));
  if(SCENE_REPLIES.supports(result.type))result.comments=String(result.commentItems.length);
  return result;
}

function sceneOutputSize(p){return p.ratio==='device'&&p.device==='desktop'?[1920,1080]:p.ratio==='device'?(p.device==='android'?[1080,2400]:[1170,2532]):SCENE_SIZES[p.ratio];}
function scenePhoneSize(p){const film=SCENE_FILM_MODELS.size(p);if(film)return film;const [w,h]=sceneOutputSize(p);if(p.type==='kakao-overlay'){const logical=44800/(p.overlayScale??70);return[logical,logical*h/w]}return [432,p.ratio==='device'?432*h/w:768];}
function sceneCountDelta(value, amount) {
  if (!/^[\d,]+$/.test(value.trim())) return value;
  const count = Number(value.replaceAll(',', ''));
  if (!Number.isSafeInteger(count)) return value;
  return Math.max(0, count + amount).toLocaleString('en-US');
}
function sceneOutputDuration(project) { return project.duration / (project.speed || 1); }
function sceneExportFrames(project) { return Math.max(1, Math.round(sceneOutputDuration(project) * SCENE_TIMING.frameRate)); }

function chatPlayback(p, time) {
  const staged = p.motion === 'messages';
  const messages = [...p.messages].sort((a, b) => a.at - b.at).map((message, i, sorted) => ({
    ...message, sourceIndex: p.messages.indexOf(message), typingAt: Math.min(message.at, Math.max(0, message.at - p.typingDuration, i ? sorted[i - 1].at + .28 : 0)),
  }));
  const next = staged ? messages.find(message => message.at > time) : null;
  const typing = next && !next.image && time >= next.typingAt && (next.side === 'me' ? p.typewriter : p.showTyping) ? next : null;
  return {
    typing,
    messages: messages.map((message, i) => {
      const reply = messages.slice(i + 1).find(item => item.side === 'other');
      const readAt = reply ? Math.max(message.at, Math.min(message.at + p.readDelay, p.showTyping && !reply.image ? reply.typingAt : reply.at)) : Infinity;
      return { ...message, read: staged && p.autoRead && message.side === 'me' && time >= readAt };
    }),
  };
}

function chatTypingText(text, progress) {
  const initial = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
  const vowelFirst = { 9: 8, 10: 8, 11: 8, 14: 13, 15: 13, 16: 13, 19: 18 };
  const finalFirst = { 2: 1, 3: 1, 5: 4, 6: 4, 9: 8, 10: 8, 11: 8, 12: 8, 13: 8, 14: 8, 15: 8, 18: 17, 20: 19 };
  const syllables = [...new Intl.Segmenter('ko', { granularity: 'grapheme' }).segment(text)].map(({ segment }) => {
    const code = segment.codePointAt(0) - 0xac00;
    if (segment.length !== 1 || code < 0 || code >= 11172) return [segment];
    const lead = Math.floor(code / 588), vowel = Math.floor(code / 28) % 21, tail = code % 28;
    const states = [initial[lead]];
    if (vowelFirst[vowel] !== undefined) states.push(String.fromCharCode(0xac00 + lead * 588 + vowelFirst[vowel] * 28));
    states.push(String.fromCharCode(0xac00 + lead * 588 + vowel * 28));
    if (finalFirst[tail]) states.push(String.fromCharCode(0xac00 + lead * 588 + vowel * 28 + finalFirst[tail]));
    if (tail) states.push(segment);
    return states;
  });
  let remaining = Math.floor(Math.max(0, Math.min(1, progress)) * syllables.reduce((sum, states) => sum + states.length, 0));
  let result = '';
  for (const states of syllables) {
    if (remaining >= states.length) { result += states.at(-1); remaining -= states.length; }
    else { if (remaining) result += states[remaining - 1]; break; }
  }
  return result;
}

function easeScene(value) {
  const t = Math.max(0, Math.min(1, value));
  let low = 0, high = 1, s = t;
  for (let i = 0; i < 12; i++) {
    const x = 3 * (1 - s) ** 2 * s * .23 + 3 * (1 - s) * s ** 2 * .32 + s ** 3;
    if (x < t) low = s; else high = s;
    s = (low + high) / 2;
  }
  return 3 * (1 - s) ** 2 * s + 3 * (1 - s) * s ** 2 + s ** 3;
}

function sceneText(ctx, value, x, y, size = 15, color = '#111', weight = 400, align = 'left', maxWidth) {
  ctx.font = `${weight} ${size}px ${ctx.sceneFontFamily||'Scene,Arial,sans-serif'}`;
  ctx.fillStyle = color; ctx.textAlign = align; ctx.textBaseline = 'alphabetic';
  if (maxWidth) ctx.fillText(String(value), x, y, maxWidth); else ctx.fillText(String(value), x, y);
}
function sceneBoxOriginal(ctx, x, y, width, height, radius, color) {
  ctx.beginPath(); ctx.roundRect(x, y, width, height, radius); ctx.fillStyle = color; ctx.fill();
}
function sceneBox(ctx,x,y,width,height,radius,color){
  if(typeof ElementRender==='undefined')return sceneBoxOriginal(ctx,x,y,width,height,radius,color);
  return ElementRender.paint(ctx,'box',x+','+y+','+width+','+height,{x,y,width,height},'영역',edit=>sceneBoxOriginal(ctx,x,y,width,height,radius,edit.background||edit.color||color));
}
function sceneLine(ctx, x, y, endX, endY, color) {
  ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(endX, endY); ctx.strokeStyle = color; ctx.lineWidth = .7; ctx.stroke();
}
function sceneIconOriginal(ctx,name,x,y,size=24,color='#111',active=false) {
  const native=typeof sceneNativeIcon==='function'?sceneNativeIcon(ctx.scenePlatform,name,active):null;
  ctx.save();ctx.translate(x,y);
  if(native?.image){
    const image=ctx.sceneIconAssets?.[name];
    if(image){const mask=document.createElement('canvas');mask.width=mask.height=48;const paint=mask.getContext('2d');paint.drawImage(image,0,0,48,48);paint.globalCompositeOperation='source-in';paint.fillStyle=color;paint.fillRect(0,0,48,48);ctx.drawImage(mask,0,0,size,size)}
  }else if(native){ctx.scale(size/(native.size||24),size/(native.size||24));ctx.fillStyle=color;ctx.strokeStyle=color;ctx.lineWidth=1.8;ctx.lineCap='round';ctx.lineJoin='round';if(native.path)ctx.fill(new Path2D(native.path),'evenodd');else ctx.stroke(new Path2D(native.stroke))}
  else {ctx.scale(size/24,size/24);ctx.strokeStyle=color;ctx.fillStyle=color;ctx.lineWidth=1.7;ctx.lineCap='round';ctx.lineJoin='round';const path=new Path2D(SCENE_ICONS[name]||SCENE_ICONS.more);if(active)ctx.fill(path);else ctx.stroke(path)}
  ctx.restore();
}
function sceneIcon(ctx,name,x,y,size=24,color='#111',active=false){
  if(typeof ElementRender==='undefined')return sceneIconOriginal(ctx,name,x,y,size,color,active);
  return ElementRender.paint(ctx,'icon',name+':'+x+','+y,{x,y,width:size,height:size},name,edit=>sceneIconOriginal(ctx,name,x,y,size,edit.color||color,active));
}
function sceneLines(ctx, value, maxWidth, size = 15, weight = 400) {
  ctx.font = `${weight} ${size}px ${ctx.sceneFontFamily||'Scene, Arial, "Malgun Gothic", sans-serif'}`;
  const segmenter = new Intl.Segmenter('ko', { granularity: 'grapheme' });
  const lines = [];
  for (const paragraph of String(value).split('\n')) {
    let line = '';
    for (const { segment } of segmenter.segment(paragraph)) {
      if (line && ctx.measureText(line + segment).width > maxWidth) { lines.push(line); line = ''; }
      line += segment;
    }
    lines.push(line);
  }
  return lines;
}
function sceneParagraph(ctx, value, x, y, maxWidth, size, color, lineHeight, weight = 400, limit = 80) {
  const lines = sceneLines(ctx, value, maxWidth, size, weight).slice(0, limit);
  lines.forEach((line, i) => sceneText(ctx, line, x, y + i * lineHeight, size, color, weight));
  return lines.length * lineHeight;
}
function sceneCover(ctx, image, x, y, width, height) {
  const iw = image.videoWidth || image.naturalWidth, ih = image.videoHeight || image.naturalHeight;
  if (!iw || !ih) return;
  const scale = Math.max(width / iw, height / ih), sw = width / scale, sh = height / scale;
  ctx.drawImage(image, (iw - sw) / 2, (ih - sh) / 2, sw, sh, x, y, width, height);
}
function sceneArt(ctx, x, y, width, height) {
  ctx.save(); ctx.beginPath(); ctx.rect(x, y, width, height); ctx.clip();
  const gradient = ctx.createLinearGradient(x, y, x + width, y + height);
  gradient.addColorStop(0, '#dce6dd'); gradient.addColorStop(1, '#a9c3b4');
  ctx.fillStyle = gradient; ctx.fillRect(x, y, width, height);
  ctx.translate(x, y); const scale = width / 432; ctx.scale(scale, scale); const h = height / scale;
  ctx.fillStyle = '#f7f3e5'; ctx.beginPath(); ctx.ellipse(330, h * .36, 138, 174, .5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#688b7f'; ctx.beginPath(); ctx.moveTo(-50, h); ctx.bezierCurveTo(120, h - 160, 240, h - 160, 500, h - 10); ctx.lineTo(500, h + 30); ctx.fill();
  for (let i = 0; i < 11; i++) sceneLine(ctx, -30, h * .67 + i * 12, 490, h * .48 + i * 12, '#597b6b45');
  if (height / width > .45) {
    sceneText(ctx, 'SLOW DAYS', 27, 42, 11, '#365346', 700);
    sceneText(ctx, 'A little', 27, Math.max(90, h * .36), 45, '#254b40', 700);
    sceneText(ctx, 'room to', 27, Math.max(137, h * .36 + 49), 45, '#254b40', 700);
    sceneText(ctx, 'breathe.', 27, Math.max(184, h * .36 + 98), 45, '#254b40', 700);
    sceneText(ctx, 'COLLECT MOMENTS, NOT THINGS.', 28, h - 26, 9, '#edf3dc', 400);
  }
  ctx.restore();
}
function sceneMedia(ctx, assets, x, y, width, height, radius = 0) {
  ctx.save(); ctx.beginPath(); ctx.roundRect(x, y, width, height, radius); ctx.clip();
  if (assets.media) sceneCover(ctx, assets.media, x, y, width, height); else sceneArt(ctx, x, y, width, height);
  ctx.restore();
}
function sceneAvatar(ctx, p, assets, x, y, size, square = false) {
  ctx.save(); ctx.beginPath(); ctx.roundRect(x, y, size, size, square ? size * .36 : size / 2); ctx.clip();
  if (assets.avatar) sceneCover(ctx, assets.avatar, x, y, size, size);
  else { sceneBox(ctx,x,y,size,size,0,'#d8dde2');sceneIcon(ctx,'person',x,y,size,'#fff'); }
  ctx.restore();
}
function sceneAccount(ctx, label, x, y, size, color, verified, maxWidth = 280) {
  ctx.font = '700 ' + size + 'px Scene, Arial, "Malgun Gothic", sans-serif';
  const room = maxWidth - (verified ? 21 : 0), graphemes = [...new Intl.Segmenter('ko', {granularity:'grapheme'}).segment(label)].map(item => item.segment);
  let text = label;
  while (ctx.measureText(text).width > room && graphemes.length) { graphemes.pop(); text = graphemes.join('') + '…'; }
  sceneText(ctx, text, x, y, size, color, 700);
  if (verified) sceneBadge(ctx, x + ctx.measureText(text).width + 5, y - 12);
}
function sceneReactionIcon(ctx,name,x,y,size,color,active=false,action) {
  action ||= name==='heart'?'like':name==='bookmark'?'save':name;
  if(ctx.sceneReactionPositions&&ctx.sceneRootTransform){
    const world=ctx.getTransform().transformPoint({x:x+size/2,y:y+size/2});
    ctx.sceneReactionPositions[action]=ctx.sceneRootTransform.inverse().transformPoint(world);
  }
  const scale=ctx.sceneProject&&typeof scenePressScale==='function'?scenePressScale(ctx.sceneProject,action,ctx.sceneTime):1;
  ctx.save();ctx.translate(x+size/2,y+size/2);ctx.scale(scale,scale);sceneIcon(ctx,name,-size/2,-size/2,size,color,active);ctx.restore();
}
function sceneCommentSheet(ctx,p,colors) {
  if (!p._sheetVisible) return;
  const progress=p._sheetProgress;
  ctx.save();ctx.globalAlpha=progress;sceneBox(ctx,0,0,432,768,0,'#0006');ctx.restore();
  ctx.save();ctx.translate(0,(1-progress)*520);
  const top=248;sceneBox(ctx,0,top,432,520,[20,20,0,0],colors.bg);
  sceneBox(ctx,197,top+10,38,4,2,colors.muted);
  sceneText(ctx,p.type.startsWith('x-')?'답글':'댓글',216,top+45,16,colors.text,600,'center');
  sceneLine(ctx,402,top+27,414,top+39,colors.text);sceneLine(ctx,414,top+27,402,top+39,colors.text);
  sceneLine(ctx,0,top+67,432,top+67,colors.line);
  ctx.save();ctx.beginPath();ctx.rect(0,top+68,432,376);ctx.clip();
  let y=top+86-p.commentScroll;
  for(const [index,item] of p.commentItems.entries()) {
    sceneAvatar(ctx,{...p,name:item.author}, {},16,y,34);
    sceneText(ctx,item.author,61,y+12,13,colors.text,700,'left',240);
    const authorWidth=Math.min(240,ctx.measureText(item.author).width);
    sceneText(ctx,item.time,70+authorWidth,y+12,11,colors.muted);
    const h=sceneParagraph(ctx,item.text,61,y+36,320,13,colors.text,20,400,20);
    sceneText(ctx,'좋아요 '+item.likes+'개    답글 달기',61,y+44+h,10,colors.muted);
    sceneReactionIcon(ctx,'heart',398,y+12,14,item.liked?'#ff3040':colors.muted,item.liked,'comment-like:'+index);
    y+=h+67;
  }
  ctx.restore();
  sceneBox(ctx,0,693,432,75,0,colors.bg);sceneLine(ctx,0,693,432,693,colors.line);
  sceneAvatar(ctx,{...p,name:'나'}, {},16,706,34);
  sceneText(ctx,p.commentDraft || '댓글 달기…',61,730,13,p.commentDraft?colors.text:colors.muted,400,'left',300);
  sceneText(ctx,'게시',401,730,13,'#2997ee',600,'center');ctx.restore();
}
function sceneBadge(ctx, x, y) {
  sceneIcon(ctx,'verified',x,y,14,'#0095f6');
}
function sceneStatus(ctx, p, text) {
  sceneText(ctx, p.clock, 29, 27, 14, text, 700);
  sceneIcon(ctx,'signal',346,11,19,text);sceneIcon(ctx,'wifi',370,11,19,text);
  sceneBox(ctx, 396, 15, 21, 10, 3, text); sceneBox(ctx, 418, 18, 2, 4, .5, text);
}
function sceneBottom(ctx, p, colors, instagram = false) {
  sceneBox(ctx, 0, 705, 432, 63, 0, colors.bg); sceneLine(ctx, 0, 705, 432, 705, colors.line);
  const icons = instagram ? ['home', 'reels', 'send', 'search', 'person'] : ['home', 'search', 'bell', 'chat'];
  icons.forEach((icon, i) => sceneIcon(ctx, icon, 30 + i * (instagram ? 86 : 112), 722, 23, colors.text));
  sceneBox(ctx, 161, 757, 110, 4, 2, colors.text);
}
function sceneChat(ctx, p, time, assets, colors) {
  const kakao = SCENE_CHAT_MODELS.base(p.type) === 'kakao-chat', insta = SCENE_CHAT_MODELS.base(p.type) === 'instagram-dm';
  const bg = kakao && p.customStyle ? p.phoneBackground : kakao ? (p.theme === 'dark' ? '#2c343c' : '#b2c7d9') : colors.bg;
  sceneBox(ctx, 0, 0, 432, 768, 0, bg); sceneStatus(ctx, p, colors.text);
  sceneIcon(ctx, 'back', 16, 51, 23, colors.text);
  if (kakao) {
    sceneText(ctx, p.name, 52, 69, 18, colors.text, 600, 'left', 245);
    sceneIcon(ctx, 'search', 347, 51, 23, colors.text); sceneIcon(ctx, 'menu', 389, 51, 23, colors.text);
  } else {
    sceneAvatar(ctx, p, assets, 49, 45, 37); sceneText(ctx, insta ? p.handle : p.name, 97, 61, 16, colors.text, 600, 'left', 215);
    sceneText(ctx, insta ? p.name : `@${p.handle}`, 97, 77, 11, colors.muted);
    sceneIcon(ctx, insta ? 'phone' : 'search', 350, 53, 21, colors.text); sceneIcon(ctx, insta ? 'video' : 'more', 390, 53, 23, colors.text);
    sceneLine(ctx, 0, 92, 432, 92, colors.line);
  }
  const centerDate = kakao ? (p.theme === 'dark' ? '#bac7d1' : '#536577') : colors.muted;
  if (kakao && p.date) {
    ctx.font = '400 10px Scene'; const width = Math.min(390, ctx.measureText(p.date).width + 26);
    sceneBox(ctx, 216 - width / 2, 106, width, 24, 12, '#53657738');
  }
  sceneText(ctx, p.date, 216, 122, kakao ? 10 : 11, centerDate, 400, 'center', 380);
  const playback = chatPlayback(p, time), messages = playback.messages;
  const rows = messages.map((message, i) => {
    const lines = sceneLines(ctx, message.text, 254, 15);
    const groupStart = !i || messages[i - 1].side !== message.side || messages[i - 1].time !== message.time;
    return { ...message, lines, groupStart, height: Math.max(43, lines.length * 22 + 22) };
  });
  let total = 150;
  const visible = rows.filter(row => p.motion !== 'messages' || time >= row.at);
  visible.forEach(row => total += row.height + (row.side === 'other' && kakao && row.groupStart ? 29 : 12));
  if (p.media) total += 210;
  if (playback.typing?.side === 'other') total += 70;
  const scroll = Math.max(0, total - 670);
  ctx.save(); ctx.beginPath(); ctx.rect(0, 138, 432, 550); ctx.clip();
  let y = 150 - scroll;
  visible.forEach((row, i) => {
    const other = row.side === 'other', entry = p.motion === 'messages' ? easeScene((time - row.at) / .28) : 1;
    ctx.save(); ctx.globalAlpha = entry; ctx.translate(0, (1 - entry) * 11);
    if (other && row.groupStart) { sceneAvatar(ctx, p, assets, 15, y, 37, kakao); if (kakao) sceneText(ctx, p.name, 62, y + 10, 11, colors.text, 400, 'left', 230); }
    const top = y + (other && kakao && row.groupStart ? 20 : 0);
    ctx.font = '400 15px Scene, Arial, "Malgun Gothic", sans-serif';
    const width = Math.min(282, Math.max(45, ...row.lines.map(line => ctx.measureText(line).width + 27)));
    const x = other ? 62 : 415 - width;
    let fill = kakao ? (other ? (p.theme === 'dark' ? '#41474c' : '#fff') : '#fee500') : (other ? colors.bubble : '#1d9bf0');
    if (insta && !other) { fill = ctx.createLinearGradient(0, 138, 0, 688); fill.addColorStop(0, p.bubbleColor); fill.addColorStop(1, p.bubbleEnd); }
    const text = kakao && !other ? '#25231a' : (!other ? '#fff' : colors.text);
    sceneBox(ctx, x, top, width, row.height, kakao ? 10 : 20, fill);
    if (kakao && row.groupStart) {
      ctx.fillStyle = fill; ctx.beginPath(); ctx.moveTo(other ? x + 7 : x + width - 7, top + 2);
      ctx.lineTo(other ? x - 5 : x + width + 5, top + 2); ctx.lineTo(other ? x + 2 : x + width - 2, top + 14); ctx.fill();
    }
    row.lines.forEach((line, i) => sceneText(ctx, line, x + 13, top + 27 + i * 22, 15, text));
    const next = visible[i + 1], groupEnd = !next || next.groupStart;
    if (kakao && groupEnd) {
      sceneText(ctx, row.time, other ? x + width + 7 : x - 7, top + row.height - 3, 9, centerDate, 400, other ? 'left' : 'right');
    } else if (!kakao && !other && i === visible.length - 1) sceneText(ctx, p.receipt, 415, top + row.height + 13, 10, colors.muted, 400, 'right');
    if (kakao && !other && p.receipt && !row.read) sceneText(ctx, p.receipt, x - 7, top + row.height - 16, 10, p.theme === 'dark' ? '#fee500' : '#806e00', 400, 'right');
    ctx.restore(); y += row.height + (other && kakao && row.groupStart ? 29 : 12);
  });
  if (p.media) sceneMedia(ctx, assets, 180, y + 6, 235, 185, 15);
  if (playback.typing?.side === 'other') {
    const top = y + (p.media ? 210 : 0);
    sceneAvatar(ctx, p, assets, 15, top, 37, kakao);
    sceneBox(ctx, 62, top + 3, 82, 34, 17, p.theme === 'dark' ? colors.bubble : '#fff');
    for (let i = 0; i < 3; i++) {
      const pulse = Math.sin((time - playback.typing.typingAt) * 8 - i * .8);
      sceneBox(ctx, 81 + i * 17, top + 17 - pulse * 2, 6, 6, 3, centerDate);
    }
    sceneText(ctx, `${p.name}님이 입력 중`, 62, top + 56, 11, centerDate, 400, 'left', 320);
  }
  ctx.restore();
  const inputBg = kakao ? (p.theme === 'dark' ? '#282b2e' : '#fff') : colors.bg;
  sceneBox(ctx, 0, 693, 432, 75, 0, inputBg); sceneIcon(ctx, kakao ? 'plus' : 'camera', 17, 711, 23, kakao && p.theme === 'light' ? '#81868c' : colors.text);
  sceneBox(ctx, 54, 702, 315, 42, 23, kakao ? (p.theme === 'dark' ? '#3c4144' : '#f3f4f5') : colors.bubble);
  const draft = p.chatDraft || (playback.typing?.side === 'me' ? chatTypingText(playback.typing.text, (time - playback.typing.typingAt) / (playback.typing.at - playback.typing.typingAt)) : null);
  const inputLine = draft === null ? '메시지 보내기…' : sceneLines(ctx, draft, 247, 13).at(-1);
  sceneText(ctx, inputLine, 70, 728, 13, draft === null ? colors.muted : colors.text);
  if (draft !== null && Math.floor(time * 2.5) % 2 === 0) sceneLine(ctx, 72 + ctx.measureText(inputLine).width, 713, 72 + ctx.measureText(inputLine).width, 731, '#20a66a');
  sceneIcon(ctx, 'smile', 334, 712, 21, colors.muted); sceneIcon(ctx, kakao ? 'send' : 'plus', 389, 710, 24, draft === null ? colors.muted : '#20a66a');
  sceneBox(ctx, 161, 757, 110, 4, 2, kakao && p.theme === 'light' ? '#222' : colors.text);
}
function sceneXPost(ctx, p, assets, colors, y, compact = false) {
  sceneAvatar(ctx,p,assets,17,y,43);sceneAccount(ctx,p.name,71,y+16,15,colors.text,p.verified,300);
  sceneText(ctx, `@${p.handle} · ${p.postTime}`, 71, y + 35, 11, colors.muted, 400, 'left', 300); sceneIcon(ctx, 'more', 393, y + 1, 21, colors.muted);
  const h = sceneParagraph(ctx, p.body, 71, y + 63, 339, 15, colors.text, 22, 400, compact ? 3 : 11);
  let bottom = y + 70 + h;
  sceneMedia(ctx, assets, 71, bottom, 342, compact ? 160 : 287, 14); bottom += compact ? 181 : 310;
  [['chat', p.comments], ['repost', p.reposts], ['heart', p.likes], ['stats', p.views]].forEach(([icon, count], i) => {
    sceneReactionIcon(ctx,icon,73+i*84,bottom,16,icon==='heart'&&p.liked?'#ff3040':icon==='repost'&&p.reposted?'#00a67a':colors.muted,icon==='heart'&&p.liked); sceneText(ctx, count, 94 + i * 84, bottom + 12, 10, colors.muted, 400, 'left', 54);
  });
  sceneLine(ctx, 0, bottom + 32, 432, bottom + 32, colors.line);
}
function sceneX(ctx, p, time, assets, colors) {
  sceneBox(ctx, 0, 0, 432, 768, 0, colors.bg);
  const shift = p.motion === 'scroll' ? p.scroll * easeScene((time - .5) / Math.max(1, p.duration - 1.5)) : 0;
  const reveal = p.motion === 'reveal' ? easeScene(time / .4) : 1;
  ctx.save(); ctx.translate(0, 98 - shift - p.viewScroll + (1 - reveal) * 12); ctx.globalAlpha = reveal;
  if (p.type === 'x-profile') {
    sceneMedia(ctx, assets, 0, 0, 432, 144); sceneBox(ctx, 16, 99, 92, 92, 46, colors.bg); sceneAvatar(ctx, p, assets, 20, 103, 84);
    sceneBox(ctx, 315, 157, 99, 34, 18, colors.text); sceneText(ctx, p.followed ? '팔로잉' : '팔로우', 364, 179, 13, colors.bg, 700, 'center');
    sceneText(ctx, p.name, 18, 217, 21, colors.text, 700); if (p.verified) sceneBadge(ctx, Math.min(300, 24 + ctx.measureText(p.name).width), 203);
    sceneText(ctx, `@${p.handle}`, 18, 238, 13, colors.muted);
    const bioHeight = sceneParagraph(ctx, p.bio, 18, 267, 394, 14, colors.text, 21, 400, 4);
    const metaY = 274 + bioHeight; sceneText(ctx, p.location + ' · 가입일: ' + p.joined, 18, metaY, 12, colors.muted);
    sceneText(ctx, `${p.following}  팔로잉     ${p.followers}  팔로워`, 18, metaY + 28, 13, colors.text, 600);
    ['게시물', '답글', '하이라이트', '미디어'].forEach((label, i) => sceneText(ctx, label, 54 + i * 108, metaY + 72, 13, i ? colors.muted : colors.text, i ? 400 : 700, 'center'));
    sceneBox(ctx, 30, metaY + 84, 48, 4, 2, '#1d9bf0'); sceneLine(ctx, 0, metaY + 89, 432, metaY + 89, colors.line);
    sceneXPost(ctx, p, assets, colors, metaY + 108, true);
  } else {
    sceneText(ctx, '추천', 108, 29, 14, colors.text, 700, 'center'); sceneText(ctx, '팔로잉', 324, 29, 14, colors.muted, 400, 'center');
    sceneBox(ctx, 85, 43, 47, 4, 2, '#1d9bf0'); sceneLine(ctx, 0, 49, 432, 49, colors.line); sceneXPost(ctx, p, assets, colors, 69);
  }
  ctx.restore(); sceneBox(ctx, 0, 0, 432, 98, 0, colors.bg); sceneStatus(ctx, p, colors.text);
  if (p.type === 'x-profile') { sceneIcon(ctx, 'back', 17, 53, 23, colors.text); sceneText(ctx, p.name, 62, 62, 18, colors.text, 700, 'left', 300); sceneText(ctx, '게시물', 62, 80, 11, colors.muted); }
  else { sceneAvatar(ctx, p, assets, 17, 46, 32); sceneIcon(ctx, 'x', 203, 50, 26, colors.text); sceneIcon(ctx, 'more', 390, 51, 24, colors.text); }
  sceneBottom(ctx, p, colors);
}
function sceneInstagram(ctx, p, time, assets, colors) {
  const reels = p.type === 'instagram-reels';
  sceneBox(ctx, 0, 0, 432, 768, 0, colors.bg);
  if (reels) {
    sceneMedia(ctx, assets, 0, 0, 432, 705);ctx.sceneReactionPositions.media={x:216,y:352};
    const shade = ctx.createLinearGradient(0, 340, 0, 710); shade.addColorStop(0, '#0000'); shade.addColorStop(1, '#000b'); ctx.fillStyle = shade; ctx.fillRect(0, 0, 432, 705);
    sceneStatus(ctx, p, '#fff'); sceneText(ctx, '릴스', 19, 70, 21, '#fff', 700); sceneIcon(ctx, 'camera', 388, 50, 23, '#fff');
    const opacity = p.motion === 'reveal' ? easeScene(time / .4) : 1;
    ctx.save(); ctx.globalAlpha = opacity; ctx.translate(0, (1 - opacity) * 12);
    [['heart', p.likes], ['chat', p.comments], ['repost', p.reposts], ['send', p.shares]].forEach(([icon, count], i) => {
      sceneReactionIcon(ctx,icon,389,350+i*73,25,icon==='heart'&&p.liked?'#ff3040':'#fff',icon==='heart'&&p.liked); sceneText(ctx, count, 402, 394 + i * 73, 11, '#fff', 600, 'center');
    });
    sceneAvatar(ctx, p, assets, 17, 548, 33); sceneAccount(ctx,p.handle,62,569,14,'#fff',p.verified,195);
    ctx.strokeStyle = '#fffb'; ctx.lineWidth = 1; ctx.beginPath(); ctx.roundRect(265, 548, 61, 29, 8); ctx.stroke(); sceneText(ctx, p.followed ? '팔로잉' : '팔로우', 296, 568, 11, '#fff', 600, 'center');
    sceneParagraph(ctx, p.body, 18, 606, 344, 14, '#fff', 21, 400, 2); sceneIcon(ctx, 'music', 18, 662, 15, '#fff'); sceneText(ctx, p.music, 41, 675, 11, '#fff', 400, 'left', 310); ctx.restore();
    sceneBottom(ctx, p, { ...colors, bg: '#080808', text: '#fff', line: '#262626' }, true); return;
  }
  const scroll = p.motion === 'scroll' ? p.scroll * easeScene((time - .5) / Math.max(1, p.duration - 1.5)) : 0;
  const reveal = p.motion === 'reveal' ? easeScene(time / .4) : 1;
  ctx.save(); ctx.translate(0, 103 - scroll - p.viewScroll + (1 - reveal) * 12); ctx.globalAlpha = reveal;
  const storyNames = p.storyNames;
  storyNames.forEach((name, i) => {
    const x = 18 + i * 104; ctx.strokeStyle = i ? '#db3d88' : colors.line; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(x + 31, 34, 31, 0, Math.PI * 2); ctx.stroke();
    sceneAvatar(ctx, { ...p, name: i ? name.toUpperCase() : p.name }, i ? {} : assets, x + 3, 6, 56); sceneText(ctx, name, x + 31, 83, 10, colors.text, 400, 'center');
  });
  sceneLine(ctx, 0, 97, 432, 97, colors.line);
  sceneAvatar(ctx, p, assets, 15, 110, 33); sceneAccount(ctx, p.handle, 59, 126, 13, colors.text, p.verified, 310);
  sceneText(ctx, p.postTime, 59, 142, 10, colors.muted, 400, 'left', 310);
  sceneIcon(ctx, 'more', 393, 116, 22, colors.text); sceneMedia(ctx, assets, 0, 157, 432, 328);
  ctx.sceneReactionPositions.media={x:216,y:103-scroll-p.viewScroll+321};
  if (p.reactionStyle === 'modern') {
    [['heart', p.likes], ['chat', p.comments], ['repost', p.reposts], ['send', p.shares]].forEach(([icon, count], i) => {
      sceneReactionIcon(ctx,icon,15+i*93,500,22,icon==='heart'&&p.liked?'#ff3040':colors.text,icon==='heart'&&p.liked); sceneText(ctx, count, 43 + i * 93, 517, 12, colors.text, 600, 'left', 59);
    });
    sceneReactionIcon(ctx,'bookmark',392,500,22,colors.text,p.saved);
  } else {
    [['heart', 15], ['chat', 53], ['send', 91], ['bookmark', 391]].forEach(([name, x]) => sceneReactionIcon(ctx,name,x,499,24,name==='heart'&&p.liked?'#ff3040':colors.text,name==='heart'&&p.liked||name==='bookmark'&&p.saved));
    sceneText(ctx, `좋아요 ${p.likes}개`, 17, 546, 13, colors.text, 700);
  }
  sceneParagraph(ctx, `${p.handle}  ${p.body}`, 17, p.reactionStyle === 'modern' ? 551 : 573, 398, 13, colors.text, 20, 400, 5);
  sceneText(ctx, `댓글 ${p.comments}개 모두 보기`, 17, 693, 12, colors.muted);
  ctx.restore(); sceneBox(ctx, 0, 0, 432, 98, 0, colors.bg); sceneStatus(ctx, p, colors.text);
  if (assets.instagramLogo) { ctx.save(); if (p.theme === 'dark') ctx.filter = 'invert(1)'; ctx.drawImage(assets.instagramLogo,17,46,128,128 * assets.instagramLogo.naturalHeight / assets.instagramLogo.naturalWidth); ctx.restore(); }
  sceneIcon(ctx, 'heart', 346, 54, 25, colors.text); sceneIcon(ctx, 'send', 391, 54, 25, colors.text); sceneBottom(ctx, p, colors, true);
}
function renderScene(canvas, project, time, assets = {}) {
  if (SOCIAL_SCENES.find(scene => scene.id === project.type)?.section === '검색') { renderSearchScene(canvas, project, time, assets); return; }
  const ctx = canvas.getContext('2d');
  project=sceneInteractionState(project,time);ctx.scenePlatform=project.type;ctx.sceneIconAssets=assets.nativeIcons;ctx.sceneProject=project;ctx.sceneTime=time;ctx.sceneReactionPositions={};
  ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.save();
  const scale = Math.min(canvas.width / 432, canvas.height / 768);
  const dark = project.theme === 'dark';
  const colors = dark ? { bg: '#08090a', text: '#f3f5f7', muted: '#939da6', line: '#2c3034', bubble: '#25282b' } : { bg: '#fff', text: '#11161a', muted: '#747e86', line: '#e2e5e8', bubble: '#efefef' };
  if (project.customStyle) Object.assign(colors,{bg:project.phoneBackground,text:project.phoneForeground,muted:project.phoneMuted});
  ctx.fillStyle = dark ? '#171b1d' : '#e8ebe7'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.translate((canvas.width - 432 * scale) / 2, (canvas.height - 768 * scale) / 2); ctx.scale(scale, scale);
  ctx.beginPath(); ctx.rect(0, 0, 432, 768); ctx.clip();ctx.sceneRootTransform=ctx.getTransform();
  if (SCENE_CHAT_MODELS.native(project.type) || project.type.endsWith('-dm')) sceneChat(ctx, project, time, assets, colors);
  else if (project.type.startsWith('x-')) sceneX(ctx, project, time, assets, colors);
  else sceneInstagram(ctx, project, time, assets, colors);
  if (!SCENE_CHAT_MODELS.native(project.type) && !project.type.endsWith('-dm')) sceneCommentSheet(ctx,project,colors);
  drawSceneFeedback(ctx,project,time,ctx.sceneReactionPositions);ctx.restore();
}

if (typeof module !== 'undefined') module.exports = { SOCIAL_SCENES, SCENE_SIZES, sceneOutputSize, scenePhoneSize, SEARCH_FAVICONS, sceneCountDelta, sceneOutputDuration, sceneExportFrames, newScene, validateScene, easeScene, chatPlayback, chatTypingText };
