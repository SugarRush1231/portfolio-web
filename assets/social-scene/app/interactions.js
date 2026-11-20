
'use strict';
const InteractionClock=typeof ChatClock!=='undefined'?ChatClock:require('./chat-clock.js');
const InteractionNews=typeof NewsModel!=='undefined'?NewsModel:require('./news-model.js');
const SCENE_ACTION_LABELS={'mail-sidebar':'메일 기본 메뉴 접기','mail-tab:primary':'메일 · Primary','mail-tab:promotions':'메일 · Promotions','mail-tab:social':'메일 · Social',...Object.fromEntries(Object.entries(InteractionNews.categories).map(([key,label])=>['news-category:'+key,'뉴스 · '+label])), 'news-open':'기사 본문 열기','naver-account':'네이버 계정 메뉴','naver-services':'네이버 서비스 메뉴','ai-expand':'AI 답변 펼치기','source-expand':'출처 펼치기','call-start':'통화 시작','call-answer':'통화 연결','call-end':'통화 종료','call-mute':'통화 음소거','call-speaker':'스피커','call-keypad':'통화 키패드',mail:'메일 열기',video:'동영상 재생',notices:'알림 표시','lock-light':'손전등',like:'좋아요',unlike:'좋아요 취소','double-like':'사진 더블탭',save:'저장',follow:'팔로우',repost:'리포스트',comments:'댓글 창'};
const ReplyPlayback=typeof SceneReplies!=='undefined'?SceneReplies:require('./comment-motion.js');
const interactionTyping=typeof chatTypingText==='function'?chatTypingText:require('./scene.js').chatTypingText;
const interactionBump=typeof sceneCountDelta==='function'?sceneCountDelta:require('./scene.js').sceneCountDelta;
function interactionEase(value) {
  const x=Math.max(0,Math.min(1,value));if(x===0||x===1)return x;let lo=0,hi=1,t=x;
  for(let i=0;i<14;i++){t=(lo+hi)/2;const v=3*(1-t)*(1-t)*t*.23+3*(1-t)*t*t*.32+t*t*t;if(v<x)lo=t;else hi=t}
  return 3*(1-t)*(1-t)*t+3*(1-t)*t*t+t*t*t;
}
function sceneInteractionState(project,time) {
  const state={...project,callState:project.type==='discord-dm'&&project.props.callMode==='none'?'idle':'ringing',callMuted:false,callSpeaker:false,callKeypad:false,mailOpen:false,mailTab:'primary',mailSidebarCollapsed:false,videoPlaying:true,noticesVisible:true,lockLight:false,commentItems:project.commentItems.map(x=>({...x}))};
  const callFrame=()=>({callState:state.callState,callKeypad:state.callState==='active'&&state.callKeypad});
  const callKey=frame=>frame.callState+':'+Number(frame.callKeypad);
  let callFrom=[{...callFrame(),weight:1}],callTo=callFrame(),callStart=-Infinity;
  const callLayers=at=>{
    const progress=interactionEase((at-callStart)/.26),layers=new Map();
    for(const frame of [...callFrom.map(x=>({...x,weight:x.weight*(1-progress)})),{...callTo,weight:progress}]){
      const key=callKey(frame),prior=layers.get(key);layers.set(key,{...frame,weight:(prior?.weight||0)+frame.weight});
    }
    return [...layers.values()].filter(x=>x.weight>1e-7||callKey(x)===callKey(callTo));
  };
  let sheetFrom=project.commentsOpen?1:0,sheetTo=sheetFrom,sheetStart=-Infinity;
  for(const event of (project.actions||[]).map((item,index)=>({...item,index})).sort((a,b)=>a.at-b.at||a.index-b.index)) {
    if(event.at>time)continue;
    const beforeCall=callKey(callFrame());
    const action=event.action==='double-like'?'like':event.action;
    const key={like:'liked',save:'saved',follow:'followed',repost:'reposted',comments:'commentsOpen',mail:'mailOpen','mail-sidebar':'mailSidebarCollapsed',video:'videoPlaying',notices:'noticesVisible','lock-light':'lockLight','call-mute':'callMuted','call-speaker':'callSpeaker','call-keypad':'callKeypad'}[action];
    if(/^mail-tab:(primary|promotions|social)$/.test(action)&&event.value){state.mailTab=action.slice(9);state.mailOpen=false}
    if(action==='call-start')state.callState=event.value?'ringing':'idle';
    if(action==='call-answer')state.callState=event.value?'active':'ringing';
    if(action==='call-end')state.callState=event.value?'ended':'active';
    if(action==='comments'){sheetFrom=sheetFrom+(sheetTo-sheetFrom)*interactionEase((event.at-sheetStart)/.28);sheetTo=event.value?1:0;sheetStart=event.at}
    if(key){const prior=state[key];state[key]=event.value;
      const count={like:'likes',repost:'reposts'}[action];if(count&&prior!==event.value)state[count]=interactionBump(state[count],event.value?1:-1);
    }else if(action.startsWith('comment-like:')){
      const item=state.commentItems[Number(action.split(':')[1])];if(!item)continue;
      if(item.liked!==event.value)item.likes=interactionBump(item.likes,event.value?1:-1);item.liked=event.value;
    }
    if(project.type==='phone-call'&&beforeCall!==callKey(callFrame())){
      callFrom=callLayers(event.at).map(x=>({...x,frozenAt:x.frozenAt??event.at}));callTo=callFrame();callStart=event.at;
    }
  }
  if(project.type==='phone-call')state._callLayers=callLayers(time);
  state._sheetProgress=sheetFrom+(sheetTo-sheetFrom)*interactionEase((time-sheetStart)/.28);
  state._sheetVisible=state.commentsOpen||state._sheetProgress>0;
  Object.assign(state,ReplyPlayback.playback(project,time,state.commentItems,interactionTyping));
  state.feedItems=(project.feedItems||[]).map((item,index)=>{
    const prefix='feed:'+index+':';
    return sceneInteractionState({...project,...item,feedItems:[],actions:(project.actions||[]).filter(e=>e.action.startsWith(prefix)).map(e=>({...e,action:e.action.slice(prefix.length)}))},time);
  });
  if(project.type==='news-article')Object.assign(state,InteractionNews.view(project,time));
  Object.assign(state,InteractionClock.view(project,time));
  return state;
}
function sceneTypingOpacity(time,index){return .35+.65*(.5+.5*Math.sin((time-index*.15)*Math.PI*2/1.2));}
function sceneLastAction(project,action,time) {
  let latest=null;
  for(const event of project.actions||[])if((event.action===action||(action==='like'&&event.action==='double-like'))&&event.at<=time&&(!latest||event.at>=latest.at))latest=event;
  return latest;
}
function scenePressScale(project,action,time,reduce=false) {
  const event=sceneLastAction(project,action,time);if(!event||reduce)return 1;
  const t=time-event.at;if(t<0||t>.36)return 1;
  if(t<.09)return 1-.22*interactionEase(t/.09);
  if(t<.22)return .78+.37*interactionEase((t-.09)/.13);
  return 1.15-.15*interactionEase((t-.22)/.14);
}
function sceneCallPressScale(project,action,time,reduce=false){
  const event=sceneLastAction(project,action,time);if(!event||reduce)return 1;
  const elapsed=time-event.at;if(elapsed<0||elapsed>=.16)return 1;
  return 1-.05*(elapsed<.06?interactionEase(elapsed/.06):1-interactionEase((elapsed-.06)/.1));
}
function drawSceneFeedback(ctx,project,time,positions,reduce=false) {
  const event=sceneLastAction(project,'like',time);if(!event||!event.value||reduce)return;
  const elapsed=time-event.at;if(elapsed<0||elapsed>.72)return;
  const point=positions.like;
  if(project.type.startsWith('x-')&&point){
    const t=elapsed/.6;if(t<=1){const radius=5+22*interactionEase(t);ctx.save();ctx.globalAlpha=(1-t)*.95;
      for(let i=0;i<12;i++){const a=i*Math.PI/6;ctx.fillStyle=['#f91880','#ffad1f','#7856ff'][i%3];ctx.beginPath();ctx.arc(point.x+Math.cos(a)*radius,point.y+Math.sin(a)*radius,Math.max(.4,2*(1-t)),0,Math.PI*2);ctx.fill()}
      ctx.restore();
    }
  }
  if(event.action==='double-like'&&positions.media){
    const t=elapsed/.72,center=positions.media;
    const alpha=t<.18?interactionEase(t/.18):t>.65?1-interactionEase((t-.65)/.35):1;
    const scale=t<.25?.9+.25*interactionEase(t/.25):1.15-.15*interactionEase((t-.25)/.75);
    ctx.save();ctx.translate(center.x,center.y);ctx.rotate(-.12*(1-interactionEase(t)));ctx.scale(scale,scale);ctx.globalAlpha=alpha;ctx.shadowColor='#0003';ctx.shadowBlur=9;
    const icon=sceneNativeIcon('instagram-feed','heart',true);ctx.fillStyle='#fff';ctx.scale(4,4);ctx.translate(-12,-12);ctx.fill(new Path2D(icon.path));ctx.restore();
  }
}
if(typeof module!=='undefined')module.exports={SCENE_ACTION_LABELS,interactionEase,sceneInteractionState,sceneLastAction,scenePressScale,sceneCallPressScale};
