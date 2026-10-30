'use strict';

const PhoneScene = (() => {
  const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
  const icons = { ...SCENE_ICONS, 'speaker-on':'M3 9h4l5-4v14l-5-4H3zM16 8a6 6 0 0 1 0 8M19 5a10 10 0 0 1 0 14','speaker-off':'M3 9h4l5-4v14l-5-4H3zM16 9l6 6M22 9l-6 6', close:'M6 6l12 12M18 6 6 18', reels:'M3 4h18v16H3zM3 9h18M8 4l4 5m3-5 4 5M10 12l6 3-6 3z' };
  let platform='kakao-chat',device='iphone',navigation='gesture';
  const genericSvg = (name, filled = false) => '<svg viewBox="0 0 24 24" aria-hidden="true" fill="' + (filled ? 'currentColor' : 'none') + '"><path d="' + (icons[name] || icons.more) + '"/></svg>';

  const svg = (name,filled=false) => {
    const icon=device==='android'&&name==='back'&&!platform.startsWith('kakao')?SCENE_NATIVE_ICONS.x.back:sceneNativeIcon(platform,name,filled);
    if(!icon)return genericSvg(name,filled);
    if(icon.image)return '<span class="ph-native-raster" aria-hidden="true" style="mask-image:url('+icon.image+');-webkit-mask-image:url('+icon.image+')"></span>';
    return '<svg data-native viewBox="0 0 '+(icon.size||24)+' '+(icon.size||24)+'" aria-hidden="true" fill="'+(icon.path?'currentColor':'none')+'" stroke="'+(icon.stroke?'currentColor':'none')+'"><path fill-rule="evenodd" d="'+(icon.path||icon.stroke)+'"/></svg>';
  };
  const button = (action, name, label, extra = '', active = false) => '<button type="button" class="ph-button ' + extra + '" '+(action==='preview-search'?'data-preview-control':'data-phone-action="'+action+'"')+' aria-label="' + esc(label) + '"' + (['like','save','follow','repost','media-mute'].includes(action) ? ' aria-pressed="' + active + '"' : '') + '>' + svg(name, active && ['heart','bookmark','home','reels','send'].includes(name)) + '</button>';
  const text = (value, field, cls = '', label = field) => field==='comments'?'<span class="'+cls+'">'+esc(value)+'</span>': '<span contenteditable="plaintext-only" role="textbox" spellcheck="false" data-phone-field="' + field + '" aria-label="' + esc(label) + '" class="ph-edit ' + cls + '" title="눌러서 수정">' + esc(value) + '</span>';
  const badge = verified => verified ? '<button type="button" class="ph-badge" data-phone-action="verified" aria-label="인증 배지 끄기">' + svg('verified') + '</button>' : '';
  const account = (p, field, cls = '') => '<div class="ph-account ' + cls + '">' + text(p[field], field, 'ph-account-label', field === 'handle' ? '사용자 이름 수정' : '표시 이름 수정') + badge(p.verified) + '</div>';
  const avatar = (p, cls = '', name) => '<button type="button" class="ph-avatar ' + cls + '" data-phone-action="avatar" aria-label="프로필 사진 바꾸기">' + (p.avatar && !name ? '<img alt="" src="' + esc(p.avatar) + '">' : '<svg viewBox="0 0 24 24" data-native fill="currentColor" aria-hidden="true"><path d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM2 23v-1c0-4.8 4.5-7.5 10-7.5s10 2.7 10 7.5v1Z"/></svg>') + '</button>';
  const media = (p,cls='') => p._collectionIndex!==undefined?SceneCollections.media(p,cls): '<div class="ph-media '+cls+'" '+(p.type.startsWith('instagram')?'':'role="button" tabindex="0" data-phone-action="media"')+' aria-label="'+(p.mediaKind==='video'?'게시물 영상':'게시물 이미지')+'"><canvas data-phone-media aria-hidden="true"></canvas>'+((p.type==='instagram-feed'&&p.mediaKind==='video'&&p._hasAudio)?button('media-mute',p.previewMuted||p.previewVolume===0?'speaker-off':'speaker-on',p.previewMuted||p.previewVolume===0?'영상 음소거 해제':'영상 음소거','ph-media-sound',p.previewMuted||p.previewVolume===0):'')+'<button type="button" class="ph-media-edit" data-phone-action="media" aria-label="게시물 이미지 또는 영상 바꾸기">미디어 변경</button></div>';
  const status=p=>sceneSystemStatus(p,text(p.clock,'clock','','상태바 시간 수정'));
  const home=()=>sceneSystemHome({device,androidNavigation:navigation,iphoneNavigation:navigation});
  function bottom(p) {
    const insta = p.type.startsWith('instagram');
    const items = insta ? [['instagram-feed','home','피드'],['instagram-reels','reels','릴스'],['instagram-dm','send','DM'],['preview-search','search','검색'],['edit:handle','person','프로필 편집']] :
      [['x-feed','home','피드'],['edit:handle','search','계정 설정'],['edit:postTime','bell','표시 시간 편집'],['x-dm','mail','DM']];
    return '<div class="ph-bottom">' + items.map(([action, icon, label]) => insta&&action==='edit:handle'?'<button type="button" class="ph-button ph-nav-profile" data-phone-action="edit:handle" aria-label="프로필 편집">'+(p.avatar?'<img alt="" src="'+esc(p.avatar)+'">':svg('person'))+'</button>':button(action,icon,label,p.type===action?'is-current':'',p.type===action)).join('') + home() + '</div>';
  }
  function reactions(p, reels = false) {
    const modern = p.reactionStyle === 'modern' || reels || p.type.startsWith('x');
    const values = [['like','heart',p.likes,'좋아요',p.liked],['comments','chat',p.comments,'댓글 열기',false],['repost','repost',p.reposts,'리포스트',p.reposted],['edit:shares','send',p.shares,'공유 수 편집',false]];
    return '<div class="ph-reactions ' + (reels?'is-vertical':'') + '">' + values.filter((_,i)=>modern||i!==2).map(([action,icon,count,label,on])=>'<div class="ph-reaction ' + (on?'is-active ':'') + (action==='like'?'is-like':'') + '">' + button(action,icon,label,'',on) + (modern?text(count,action==='like'?'likes':action==='comments'?'comments':action==='repost'?'reposts':'shares','ph-count',label+' 수치 수정'):'') + '</div>').join('') + (!reels ? button('save','bookmark','게시물 저장',p.saved?'is-saved':'',p.saved) : '') + '</div>';
  }
  function comments(p) {
    if (!p._sheetVisible) return '';
    const x = p.type.startsWith('x');
    return '<div class="ph-sheet-backdrop" style="opacity:' + p._sheetProgress + '" data-phone-action="close-comments"></div><section class="ph-comments-sheet" style="transform:translateY(' + (1-p._sheetProgress)*100 + '%)" role="region" aria-label="' + (x?'답글':'댓글') + '"><div class="ph-sheet-grabber"></div><header><strong>' + (x?'답글':'댓글') + '</strong>' + button('close-comments','close','댓글 닫기') + '</header><div class="ph-comment-list">' +
      p.commentItems.map((item,visibleIndex)=>{const i=item._sourceIndex??visibleIndex;return '<article class="ph-comment"><div class="ph-comment-avatar">'  + svg('person',true) + '</div><div class="ph-comment-copy"><div class="ph-comment-author">' + text(item.author,'commentItems.'+i+'.author','','댓글 '+(i+1)+' 작성자 수정') + text(item.time,'commentItems.'+i+'.time','ph-muted','댓글 '+(i+1)+' 시간 수정') + '</div>' + text(item.text,'commentItems.'+i+'.text','ph-comment-text','댓글 '+(i+1)+' 내용 수정') + '<div class="ph-comment-meta">' + '좋아요 ' + text(item.likes,'commentItems.'+i+'.likes','','댓글 '+(i+1)+' 좋아요 수 수정') + '개<span>답글 달기</span></div></div>' + button('comment-like:'+i,'heart','댓글 '+(i+1)+' 좋아요',item.liked?'ph-comment-liked':'',item.liked) + '</article>'}).join('') +
      '</div>'+ReplyEditor.composer(p,svg('person',true))+'</section>';
  }
  function instagramPost(p){return '<article class="ph-instagram-post">'+'<div class="ph-post-account">' + avatar(p) + '<div class="ph-post-identity">' + account(p,'handle') + text(p.postTime,'postTime','ph-muted','위치·표시 시간 수정') + '</div>' + button('edit:body','more','게시물 편집') + '</div>' + media(p) + reactions(p) + (p.reactionStyle==='classic'?'<div class="ph-classic-likes">좋아요 ' + text(p.likes,'likes','','좋아요 수 수정') + '개</div>':'') + '<div class="ph-caption"><strong>' + text(p.handle,'handle','','사용자 이름 수정') + '</strong> ' + text(p.body,'body','','게시물 본문 수정') + '</div><button type="button" class="ph-view-comments" data-phone-action="comments">댓글 ' + esc(p.comments) + '개 모두 보기</button>'+'</article>';
  }
  function instagram(p,time) {
    const reels = p.type === 'instagram-reels';
    if (reels) return '<div class="ph-reels">' + media(p) + '<div class="ph-reels-shade"></div>' + status(p) + '<header class="ph-reels-header"><strong>릴스</strong>' + button('media','camera','릴스 미디어 바꾸기') + '</header>' + reactions(p,true) + '<div class="ph-reels-copy"><div class="ph-reels-account">' + avatar(p) + account(p,'handle') + '<button class="ph-follow" type="button" data-phone-action="follow" aria-pressed="' + p.followed + '">' + (p.followed?'팔로잉':'팔로우') + '</button></div>' + text(p.body,'body','ph-caption','릴스 본문 수정') + '<div class="ph-audio">' + svg('music') + text(p.music,'music','','오디오 이름 수정') + '</div></div>' + bottom(p) + '</div>' + comments(p);
    const scroll = 0;
    return status(p) + '<header class="ph-instagram-header">'+button('media','plus','게시물 미디어 바꾸기','ph-instagram-create')+'<img class="ph-wordmark" src="' + (p.logoStyle==='classic'?INSTAGRAM_CLASSIC_WORDMARK_DATA:INSTAGRAM_WORDMARK_DATA) + '" alt="Instagram"><div>' + button('edit:verified','heart','게시물 상태 편집') + '</div></header><div class="ph-feed-viewport"><div class="ph-feed-body" style="transform:translateY(-' + scroll + 'px)"><div class="ph-stories">' + p.storyNames.map((name,i)=>i>0&&p.showOtherStories===false?'':'<div class="ph-story"><div class="ph-story-ring">' + avatar(p,'',i?name:undefined)+(i===0?button('media','plus','스토리 미디어 바꾸기','ph-story-add'):'') + '</div>' + text(name,'storyNames.'+i,'','스토리 '+(i+1)+' 이름 수정') + '</div>').join('') + '</div>'+ instagramPost(p)+(p.feedItems||[]).map((item,index)=>SceneCollections.scope(instagramPost(SceneCollections.context(p,item,index)),index)).join('') + '</div></div>' + bottom(p) + comments(p)+(p.feedItems||[]).map((item,index)=>SceneCollections.scope(comments(SceneCollections.context(p,item,index)),index)).join('');
  }
  function xPost(p, compact) {
    return '<article class="ph-x-post">' + avatar(p) + '<div class="ph-x-post-main">' + account(p,'name') + '<div class="ph-x-post-meta">@' + text(p.handle,'handle','','사용자 이름 수정') + ' · ' + text(p.postTime,'postTime','','표시 시간 수정') + '</div>' + text(p.body,'body','ph-x-body','게시물 본문 수정') + media(p,compact?'is-compact':'') + '<div class="ph-x-reactions"><div class="ph-reaction">' + button('comments','chat','답글 열기') + text(p.comments,'comments','ph-count','답글 수 수정') + '</div><div class="ph-reaction ' + (p.reposted?'is-reposted':'') + '">' + button('repost','repost','리포스트','',p.reposted) + text(p.reposts,'reposts','ph-count','리포스트 수 수정') + '</div><div class="ph-reaction ' + (p.liked?'is-like is-active':'') + '">' + button('like','heart','좋아요','',p.liked) + text(p.likes,'likes','ph-count','좋아요 수 수정') + '</div><div class="ph-reaction">' + button('edit:views','stats','조회 수 편집') + text(p.views,'views','ph-count','조회 수 수정') + '</div>' + button('save','bookmark','게시물 저장',p.saved?'is-saved':'',p.saved) + '</div></div>' + button('edit:body','more','게시물 편집','ph-x-more') + '</article>';
  }
  function x(p,time) {
    const profile=p.type==='x-profile', scroll=0;
    let body='';
    if(profile) body=media(p,'ph-profile-banner') + '<div class="ph-profile-avatar">' + avatar(p) + '</div><button type="button" class="ph-profile-follow" data-phone-action="follow" aria-pressed="' + p.followed + '">' + (p.followed?'팔로잉':'팔로우') + '</button><section class="ph-profile-info">' + account(p,'name') + '<div class="ph-muted">@' + text(p.handle,'handle','','사용자 이름 수정') + '</div>' + text(p.bio,'bio','ph-bio','프로필 소개 수정') + '<div class="ph-profile-location">' + text(p.location,'location','','지역 수정') + ' · 가입일: ' + text(p.joined,'joined','','가입일 수정') + '</div><div class="ph-profile-counts">' + text(p.following,'following','','팔로잉 수 수정') + ' <span>팔로잉</span>　' + text(p.followers,'followers','','팔로워 수 수정') + ' <span>팔로워</span></div></section><div class="ph-x-tabs"><b>게시물</b><span>답글</span><span>하이라이트</span><span>미디어</span></div>' + xPost(p,true);
    else body='<div class="ph-x-tabs"><b>추천</b><span>팔로잉</span></div>'+xPost(p,false)+(p.feedItems||[]).map((item,index)=>SceneCollections.scope(xPost(SceneCollections.context(p,item,index),false),index)).join('');
    return status(p)+'<header class="ph-x-header">'+(profile?button('x-feed','back','X 피드로')+'<div><strong>'+esc(p.name)+'</strong><small>게시물</small></div>':avatar(p)+'<span class="ph-x-logo">'+svg('x')+'</span>')+button('edit:name','more','계정 편집')+'</header><div class="ph-feed-viewport"><div class="ph-feed-body" style="transform:translateY(-'+scroll+'px)">'+body+'</div></div>'+bottom(p)+comments(p)+(p.feedItems||[]).map((item,index)=>SceneCollections.scope(comments(SceneCollections.context(p,item,index)),index)).join('');
  }

  function chatSendTools(p,draft){
    if(ChatModels.base(p.type)==='kakao-chat')return draft?'<button class="ph-kakao-send" data-phone-action="send-message" type="button" aria-label="메시지 보내기">'+svg('send')+'</button>':button('edit:receipt','hash','대화 표시 편집');
    if(ChatModels.base(p.type)==='instagram-dm')return draft?'<button class="ph-dm-send" data-phone-action="send-message" type="button" aria-label="메시지 보내기">보내기</button>':button('edit:receipt','mic','메시지 표시 편집')+button('media','image','사진 메시지 바꾸기')+button('send-heart','heart','하트 보내기');
    return button('send-message','send','메시지 보내기');
  }

  function participantAvatar(p,id){
    const person=ChatModels.person(p,id),image=ChatModels.avatar(p,id);
    return'<button type="button" class="ph-avatar" data-participant-id="'+id+'" data-phone-action="participant-photo:'+id+'" aria-label="'+esc(person.name)+' 사진 바꾸기">'+(image?'<img alt="" src="'+esc(image)+'">':'<span class="ph-person-initial">'+esc(person.name.slice(0,1)||'U')+'</span>')+'</button>';
  }
  function participantName(p,id){
    const index=p.participants.findIndex(x=>x.id===id);return text(p.participants[index].name,'participants.'+index+'.name','','참가자 '+(index+1)+' 이름 수정');
  }
  function groupAvatar(p){
    return'<button type="button" class="ph-group-avatar" data-phone-action="participants" aria-label="그룹 참가자 편집">'+p.participants.filter(x=>x.id!==p.selfId).slice(0,3).map(x=>{const image=ChatModels.avatar(p,x.id);return image?'<img alt="" src="'+esc(image)+'">':'<span>'+esc(x.name.slice(0,1)||'U')+'</span>'}).join('')+'</button>';
  }
  function chat(p,time) {
    const kind=ChatModels.base(p.type),kakao=kind==='kakao-chat',insta=kind==='instagram-dm',multi=ChatModels.enabled(p),state=chatPlayback(p,time),authorLine=kakao||multi;
    const ctx=document.createElement('canvas').getContext('2d');ctx.sceneFontFamily=ElementModel.family(p);
    const wrap=(html,side)=>{if(p.type!=='kakao-overlay')return html;const pos=p.overlayOffsets?.[side]||{x:0,y:0};return '<div class="ph-overlay-group" data-overlay-side="'+side+'" style="translate:'+pos.x+'px '+pos.y+'px">'+html+'</div>'};
    const rows=state.messages.filter(item=>p.motion!=='messages'||time>=item.at).map((item,i,all)=>{
      const lines=sceneLines(ctx,item.text,254,15);ctx.font='400 15px '+(ctx.sceneFontFamily||'Scene, Arial, "Malgun Gothic", sans-serif');
      const photo=item.image?ChatMedia.size(item):null;return{...item,index:item.sourceIndex,groupStart:!i||all[i-1].side!==item.side||all[i-1].senderId!==item.senderId||all[i-1].time!==item.time,height:photo?Math.max(43,photo.height+(item.text?sceneLines(ctx,item.text,Math.max(94,photo.width-26),15).length*22+20:0)):Math.max(43,lines.length*22+22),width:photo?Math.max(item.text?120:24,photo.width):Math.min(282,Math.max(45,...lines.map(line=>Math.ceil(ctx.measureText(line).width)+30))),imageHeight:photo?.height};
    });
    let total=150;rows.forEach(row=>total+=row.height+(row.side==='other'&&authorLine&&row.groupStart?29:12));if(state.typing?.side==='other')total+=70;
    const scroll=Math.max(0,total-(scenePhoneSize(p)[1]-98));let y=150-scroll,messages='';
    rows.forEach((row,i)=>{let entryMarkup='';
      const other=row.side==='other',top=y+(other&&authorLine&&row.groupStart?20:0),left=other?62:415-row.width,entry=p.motion==='messages'?easeScene((time-row.at)/.28):1,id=multi?ChatModels.sender(p,row):null;
      if(other&&row.groupStart)entryMarkup+='<div class="ph-chat-avatar" data-chat-for="'+row.index+'" style="top:'+y+'px">'+(multi?participantAvatar(p,id):avatar(p))+'</div>'+(authorLine?'<div class="ph-chat-author" data-chat-for="'+row.index+'" style="top:'+y+'px">'+(multi?participantName(p,id):text(p.name,'name','','상대 이름 수정'))+'</div>':'');
      entryMarkup+='<div class="ph-message '+(other?'is-other':'is-me')+(row.image?' is-image':'')+(row.groupStart?' is-first':'')+'" '+(id?'data-message-sender="'+id+'"':'')+' data-chat-row="'+row.index+'" style="left:'+left+'px;top:'+top+'px;width:'+row.width+'px;min-height:'+row.height+'px;opacity:'+(p.type==='kakao-overlay'?1:entry)+'">'+(row.image?'<img class="ph-message-image" src="'+row.image+'" alt="'+esc(row.imageName||'사진 메시지')+'" style="height:'+row.imageHeight+'px" draggable="false"><button type="button" class="ph-media-edit" data-phone-action="chat-image:'+row.index+'" aria-label="사진 메시지 교체">사진 교체</button>':'')+(!row.image||row.text?text(row.text,'messages.'+row.index+'.text','','메시지 '+(row.index+1)+' 내용 수정'):'')+'</div>';
      const next=rows[i+1],end=!next||next.groupStart;
      if(kakao&&end)entryMarkup+='<div class="ph-message-time '+(other?'is-other':'is-me')+'" data-chat-for="'+row.index+'" style="left:'+(other?left+row.width+7:left-7)+'px;top:'+(top+row.height-13)+'px">'+text(row.time,'messages.'+row.index+'.time','','메시지 '+(row.index+1)+' 시간 수정')+'</div>';
      if(kakao&&!other){const unread=multi?ChatModels.unread(p,row,time):!row.read?p.receipt:'';if(unread&&unread!=='0')entryMarkup+='<span class="ph-unread" data-chat-for="'+row.index+'" style="left:'+(left-16)+'px;top:'+(top+row.height-29)+'px">'+(multi?esc(unread):text(unread,'receipt','','읽음 숫자 수정'))+'</span>'}
      if(!kakao&&!other&&i===rows.length-1)entryMarkup+='<div class="ph-dm-receipt" data-chat-for="'+row.index+'" style="top:'+(top+row.height+3)+'px">'+text(p.motion==='still'||row.read?p.receipt:'보냄','receipt','','읽음 표시 수정')+'</div>';
      messages+=wrap(entryMarkup,row.side);
      y+=row.height+(other&&authorLine&&row.groupStart?29:12);
    });
    if(state.typing?.side==='other')messages+=wrap('<div class="ph-typing" style="top:'+y+'px">'+[0,1,2].map(i=>'<span style="opacity:'+sceneTypingOpacity(time,i)+'">●</span>').join('')+'<small>'+esc(multi?ChatModels.person(p,ChatModels.sender(p,state.typing)).name:p.name)+'님이 입력 중</small></div>','other');
    const timedDraft=state.typing?.side==='me'?chatTypingText(state.typing.text,(time-state.typing.typingAt)/(state.typing.at-state.typing.typingAt)):'';
    const header=multi
      ?button('participants','back','그룹 설정')+(kakao?'<div class="ph-group-heading">'+text(p.groupName,'groupName','','그룹 이름 수정')+'<span>'+p.participants.length+'</span></div>':groupAvatar(p)+'<div class="ph-group-heading">'+text(p.groupName,'groupName','','그룹 이름 수정')+'<small>참가자 '+p.participants.length+'명</small></div>')+'<div class="ph-chat-tools">'+(insta?button('participants','phone','그룹 참가자 편집')+button('participants','video','참가자 관리'):kakao?button('participants','search','그룹 참가자 편집')+button('participants','menu','참가자 관리'):button('participants','info','참가자 관리'))+'</div>'
      :button(insta?'instagram-feed':kakao?'edit:name':'x-feed','back','대화방 설정')+(kakao?account(p,'name'):avatar(p)+'<div>'+account(p,insta?'handle':'name')+'<small>'+text(insta?p.name:p.handle,insta?'name':'handle','','프로필 표시 수정')+'</small></div>')+'<div class="ph-chat-tools">'+(insta?button('edit:name','phone','대화방 정보 편집')+button('edit:receipt','video','대화 표시 편집'):kakao?button('edit:name','search','대화방 정보 편집')+button('edit:receipt','menu','대화 표시 편집'):button('edit:name','info','대화방 정보 편집'))+'</div>';
    if(p.type==='kakao-overlay')return'<div class="ph-chat-messages">'+messages+'</div>';
    return status(p)+'<header class="ph-chat-header">'+header+'</header><div class="ph-chat-date">'+text(p.date,'date','','날짜 수정')+'</div><div class="ph-chat-messages">'+messages+'</div><div class="ph-chat-composer">'+button('media',kakao?'plus':insta?'camera':'image','사진 메시지 바꾸기')+'<div class="ph-chat-input"><input data-phone-composer="chatDraft" aria-label="메시지 입력" placeholder="메시지 보내기…" value="'+esc(p.chatDraft||timedDraft)+'">'+button('edit:receipt','smile','읽음 표시 편집')+'</div><span class="ph-send-tools">'+chatSendTools(p,p.chatDraft||timedDraft)+'</span>'+home()+'</div>';
  }
  function layoutChat(root,p){
    const rows=[...root.querySelectorAll('[data-chat-row]')].map(node=>({node,top:parseFloat(node.style.top),height:parseFloat(node.style.minHeight)}));const overlay=p.type==='kakao-overlay',start=overlay?22:150;if(!rows.length){if(overlay)root._sceneScroll={offset:0,max:0,viewport:root.clientHeight};return}
    const origin=rows[0].top-(root.querySelector('[data-chat-for="'+rows[0].node.dataset.chatRow+'"].ph-chat-author')?start+20:start);rows.forEach(row=>row.top-=origin);for(const node of root.querySelectorAll('[data-chat-for]'))node.style.top=(parseFloat(node.style.top)-origin)+'px';
    const meta=[...root.querySelectorAll('[data-chat-for]')].map(node=>({node,top:parseFloat(node.style.top),index:node.dataset.chatFor}));let delta=0;
    for(const row of rows){const actual=row.node.offsetHeight,extra=Math.max(0,actual-row.height);row.node.style.top=(row.top+delta)+'px';for(const item of meta.filter(x=>x.index===row.node.dataset.chatRow)){const bottom=item.node.matches('.ph-message-time,.ph-unread,.ph-dm-receipt');item.node.style.top=(item.top+delta+(bottom?extra:0))+'px'}delta+=extra}
    if(overlay)for(const row of rows){const message=p.messages[Number(row.node.dataset.chatRow)],progress=p.motion==='messages'?easeScene(((p._sceneTime||0)-message.at)/.28):1,offset='0 '+((1-progress)*8)+'px';row.node.style.translate=offset;row.node.style.filter='opacity('+progress+')';for(const item of meta.filter(x=>x.index===row.node.dataset.chatRow)){item.node.style.filter='opacity('+progress+')';item.node.style.translate=offset}}
    const photo=root.querySelector('.ph-chat-photo');if(photo)photo.style.top=(parseFloat(photo.style.top)+delta)+'px';const bottom=Math.max(...rows.map(x=>parseFloat(x.node.style.top)+x.node.offsetHeight),photo?parseFloat(photo.style.top)+photo.offsetHeight:0),max=Math.max(0,bottom-root.clientHeight+(overlay?24:105)),keyed=p.scrollKeys?.length||p._scrollPaint!==undefined||p.motion==='scroll',shift=keyed?SceneScroll.position(p,typeof p._sceneTime==='number'?p._sceneTime:0,Math.max(1,root.clientHeight-(overlay?48:245)),max):max;root._sceneScroll={offset:shift,max,viewport:Math.max(1,root.clientHeight-(overlay?48:245))};
    if(shift)for(const node of root.querySelectorAll('.ph-chat-messages [data-chat-row],.ph-chat-messages [data-chat-for],.ph-chat-messages>.ph-typing'))if(node.style.top)node.style.top=(parseFloat(node.style.top)-shift)+'px';
  }
  function render(root,p,time,assets) {
    const search=SOCIAL_SCENES.find(scene=>scene.id===p.type).section==='검색';
    root.hidden=search;
    if(search)return;
    if(FilmModels.specs[p.type]){FilmTemplates.render(root,p,time,assets);return;}
    const active=document.activeElement, editing=!p._isPlaying&&root.contains(active)&&(active.matches('[contenteditable]')||active.matches('[data-phone-composer]'));
    platform=ChatModels.base(p.type);device=p.device||'iphone';navigation=(device==='android'?p.androidNavigation:p.iphoneNavigation)||'gesture';
    const markup=ChatModels.native(p.type)?chat(p,time):p.type.startsWith('x-')?x(p,time):instagram({...p,_hasAudio:SceneAudio.hasExportSource(p,assets)},time);
    const force=root.dataset.force==='true';delete root.dataset.force;
    if(!editing||force){
      if(root._phoneMarkup!==markup){
        const focusKey=root.contains(active)?active.dataset.phoneComposer:null;
        root.innerHTML=markup+'<canvas class="ph-feedback" width="432" height="768" aria-hidden="true"></canvas>';root._phoneMarkup=markup;
        if(focusKey&&!p._isPlaying)root.querySelector('[data-phone-composer="'+focusKey+'"]')?.focus({preventScroll:true});
      }
    }
    if(editing&&active.matches('[data-phone-composer=chatDraft]')){const tools=root.querySelector('.ph-send-tools');if(tools)tools.innerHTML=chatSendTools(p,p.chatDraft)}
    root.className='phone-surface '+(p.type==='kakao-overlay'?'ph-overlay ':'')+(ChatModels.enabled(p)?'ph-group-chat ':'')+(p.device==='android'?'ph-android ':'')+(p.theme==='dark'?'ph-dark ':'')+(ChatModels.base(p.type)==='kakao-chat'?'ph-kakao ':'')+(platform!=='kakao-chat'?'ph-'+platform+' ':'')+(p._isPlaying?'ph-playing ':'')+(p._export?'ph-export ':'');
    root.style.setProperty('--phone-height',scenePhoneSize(p)[1]+'px');
    root.style.setProperty('--overlay-width',scenePhoneSize(p)[0]+'px');root.style.setProperty('--overlay-left',Math.max(0,(scenePhoneSize(p)[0]-432)/2)+'px');
    const source=assets.media,mediaWidth=source?.videoWidth||source?.naturalWidth,mediaHeight=source?.videoHeight||source?.naturalHeight;
    root.style.setProperty('--ph-post-ratio',mediaWidth&&mediaHeight?String(Math.max(.75,Math.min(1.91,mediaWidth/mediaHeight))):'1');
    root.style.setProperty('--ph-bg',p.customStyle?p.phoneBackground:p.theme==='dark'?'#08090a':'#fff');
    root.style.setProperty('--ph-text',p.customStyle?p.phoneForeground:p.theme==='dark'?'#f3f5f7':'#11161a');
    root.style.setProperty('--ph-muted',p.customStyle?p.phoneMuted:p.theme==='dark'?'#939da6':'#747e86');
    root.style.setProperty('--ph-line',p.theme==='dark'?'#2c3034':'#e2e5e8');
    root.style.setProperty('--ph-bubble',p.theme==='dark'?'#25282b':'#efefef');
    root.style.setProperty('--ph-chat-bg',p.customStyle?p.phoneBackground:p.theme==='dark'?'#2c343c':'#b2c7d9');
    root.style.setProperty('--ph-bubble-start',p.bubbleColor);root.style.setProperty('--ph-bubble-end',p.bubbleEnd);
    ElementRender.applyDOM(root,p);layoutChat(root,{...p,_sceneTime:time});SceneScroll.apply(root,p,time);ReplyEditor.layout(root);
    applyFeedback(root,p,time,assets);
    const commentList=root.querySelector('.ph-comment-list');
    if(commentList){
      if(p._export){commentList.style.overflow='hidden';for(const item of commentList.children)item.style.transform='translateY(-'+p.commentScroll+'px)'}
      else if(Math.abs(commentList.scrollTop-p.commentScroll)>1)commentList.scrollTop=p.commentScroll;
    }
    for(const node of root.querySelectorAll('[data-phone-media]')){
      const box=node.parentElement;
      const width=Math.round(box.clientWidth)||432,height=Math.round(box.clientHeight)||328,ratio=p._pixelRatio||1;
      if(node.width!==Math.round(width*ratio))node.width=Math.round(width*ratio);if(node.height!==Math.round(height*ratio))node.height=Math.round(height*ratio);
      const ctx=node.getContext('2d');ctx.setTransform(ratio,0,0,ratio,0,0);sceneMedia(ctx,assets,0,0,width,height);
    }
    ElementRender.applyMedia(root,p);
  }

  function applyFeedback(root,p,time,assets){
    const reduce=!p._export&&matchMedia('(prefers-reduced-motion: reduce)').matches, positions={};
    const bounds=root.getBoundingClientRect(),factor=bounds.width/432;
    for(const button of root.querySelectorAll('[data-phone-action]')){
      const scoped=SceneCollections.parseAction(button.dataset.phoneAction),action=scoped?.action||button.dataset.phoneAction,source=scoped?p.feedItems[scoped.index]:p;
      if(!['like','save','repost','follow'].includes(action)&&!action.startsWith('comment-like:'))continue;
      button.style.transform='scale('+scenePressScale(source,action,time,reduce)+')';
      const box=button.getBoundingClientRect(),key=scoped?'feed:'+scoped.index: 'root';positions[key]||={};positions[key][action]={x:(box.left+box.width/2-bounds.left)/factor,y:(box.top+box.height/2-bounds.top)/factor};
    }
    for(const media of root.querySelectorAll('.ph-media')){const box=media.getBoundingClientRect(),index=media.closest('[data-feed-index]')?.dataset.feedIndex,key=index===undefined?'root':'feed:'+index;positions[key]||={};positions[key].media={x:(box.left+box.width/2-bounds.left)/factor,y:(box.top+box.height/2-bounds.top)/factor}}
    const overlay=root.querySelector('.ph-feedback');if(!overlay)return;
    const ratio=p._pixelRatio||1;if(overlay.width!==Math.round(432*ratio))overlay.width=Math.round(432*ratio);if(overlay.height!==Math.round(scenePhoneSize(p)[1]*ratio))overlay.height=Math.round(scenePhoneSize(p)[1]*ratio);
    const ctx=overlay.getContext('2d');ctx.setTransform(ratio,0,0,ratio,0,0);ctx.clearRect(0,0,432,scenePhoneSize(p)[1]);ctx.scenePlatform=p.type;ctx.sceneIconAssets=assets.nativeIcons;drawSceneFeedback(ctx,p,time,positions.root||{},reduce);for(const [index,item]of(p.feedItems||[]).entries())drawSceneFeedback(ctx,item,time,positions['feed:'+index]||{},reduce);
  }
  return {render};
})();
