 'use strict';
const SceneReplies=(()=>{
 const timing=typeof SceneTiming!=='undefined'?SceneTiming:require('./scene-timing.js');
 const supported=['x-feed','x-profile','instagram-feed','instagram-reels','facebook-feed','news-article','youtube-watch'];
 function duration(text){return Math.max(.6,Math.min(10,[...new Intl.Segmenter('ko',{granularity:'grapheme'}).segment(text)].length*.09))}
 function validateCue(value){
  const result={};
  for(const [key,max]of [['at',timing.maxDuration],['typingAt',timing.maxDuration],['typingDuration',15]])if(value[key]!==undefined){
   if(!Number.isFinite(value[key])||value[key]<0||value[key]>max)throw new Error('댓글 입력·게시 시점이 올바르지 않습니다.');result[key]=value[key];
  }
  if(result.typingDuration>0&&(!Number.isFinite(result.at)||!Number.isFinite(result.typingAt)||result.at+.0001<result.typingAt+result.typingDuration))throw new Error('댓글은 타이핑이 끝난 뒤 게시해야 합니다.');
  return result;
 }
 function validateDraft(value){
  const result={commentDraftAt:0,commentDraftDuration:0};
  for(const [key,max]of [['commentDraftAt',30],['commentDraftDuration',15]])if(value[key]!==undefined){if(!Number.isFinite(value[key])||value[key]<0||value[key]>max)throw new Error('답글 타이핑 설정이 올바르지 않습니다.');result[key]=value[key]}
  return result;
 }
 function count(owner,time){return(owner.commentItems||[]).filter(c=>(c.at??0)<=time).length}
 function playback(owner,time,items,typeText){
  const visible=items.map((item,index)=>({...item,_sourceIndex:index})).filter(item=>(item.at??0)<=time).sort((a,b)=>(a.at??0)-(b.at??0)||a._sourceIndex-b._sourceIndex);
  const cues=(owner.commentItems||[]).filter(c=>c.typingDuration>0&&time>=c.typingAt&&time<c.at).sort((a,b)=>a.typingAt-b.typingAt);
  const cue=cues.at(-1),draft=owner.commentDraft||'',start=cue?cue.typingAt:owner.commentDraftAt||0,span=cue?cue.typingDuration:owner.commentDraftDuration||duration(draft);
  const text=cue?cue.text:draft,active=Boolean(text)&&time>=start;
  const progress=active?Math.min(1,Math.max(0,(time-start)/span)):0;
  return{commentItems:visible,comments:String(visible.length),commentDraft:active?typeText(text,progress):'',_sourceCommentDraft:draft,_commentTyping:active,_commentCursor:active&&Math.floor((time-start)/.5)%2===0};
 }
 function changedAt(p,time,prefix=''){
  let opened=p.commentsOpen?0:null;
  for(const e of [...(p.actions||[])].sort((a,b)=>a.at-b.at))if(e.action===prefix+'comments'&&e.at<=time)opened=e.value?e.at:null;
  return opened;
 }
 function schedule(owner,p,time,prefix=''){
  const opened=changedAt({...p,commentsOpen:owner.commentsOpen},time,prefix),start=Math.max(0,time,opened===null?time+.3:opened+.3),span=owner.commentDraftDuration||duration(owner.commentDraft);
  const at=Math.round((start+span+.2)*1000)/1000;
  if(at+.5>timing.maxDuration)throw new Error('장면의 최대 길이 안에 입력과 게시를 넣을 수 없어요. 재생 위치를 앞쪽으로 옮겨 주세요.');
  return{typingAt:start,typingDuration:span,at,openAt:opened===null?Math.max(0,start-.3):null,end:Math.max(p.duration,Math.ceil((at+.5)*2)/2)};
 }
 function typingActive(p,time){
  const own=(p.commentDraft&&time>=(p.commentDraftAt||0))||(p.commentItems||[]).some(c=>c.typingDuration>0&&time>=c.typingAt&&time<c.at);
  return Boolean(own||(p.feedItems||[]).some(row=>typingActive(row,time)));
 }
 return{supports:type=>supported.includes(type),duration,validateCue,validateDraft,count,playback,changedAt,schedule,typingActive};
})();
if(typeof module!=='undefined')module.exports=SceneReplies;
