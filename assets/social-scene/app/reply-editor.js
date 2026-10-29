 'use strict';
const ReplyEditor=(()=>{
 const targets=new WeakMap(),index=()=>targets.get(project)??-1,owner=()=>index()<0?project:project.feedItems[index()]||project;
 function target(value){targets.set(project,Number(value));}
 function update(){dirty.add(project.type);phonePreview.dataset.force='true';renderCommentEditor();draw()}
 function render(){
  $('comment-fields').hidden=!SceneReplies.supports(project.type);if($('comment-fields').hidden)return;
  const select=$('reply-target');select.replaceChildren();
  for(let n=-1;n<project.feedItems.length;n++){const option=document.createElement('option');option.value=n;option.textContent=(n+2)+'번째 게시물';select.append(option)}
  if(index()>=project.feedItems.length)target(-1);select.value=index();select.closest('label').hidden=!project.feedItems.length;
  const itemOwner=owner();$('comments-open').checked=itemOwner.commentsOpen;$('comment-items').replaceChildren();
  itemOwner.commentItems.forEach((item,n)=>{
   const row=document.createElement('div');row.className='message-row comment-editor-row';
   const head=document.createElement('div');head.className='result-row-header';const title=document.createElement('span');title.textContent='댓글 '+(n+1);
   const remove=document.createElement('button');remove.type='button';remove.textContent='×';remove.setAttribute('aria-label','댓글 '+(n+1)+' 삭제');remove.onclick=()=>{
    itemOwner.commentItems.splice(n,1);const prefix=index()<0?'':'feed:'+index()+':';
    project.actions=project.actions.filter(e=>e.action!==prefix+'comment-like:'+n).map(e=>{const m=new RegExp('^'+prefix+'comment-like:(\\d+)$').exec(e.action);return m&&+m[1]>n?{...e,action:prefix+'comment-like:'+(+m[1]-1)}:e});renderInteractionEditor();update();
   };head.append(title,remove);row.append(head);
   for(const [key,labelText]of [['author','작성자'],['text','댓글 내용'],['time','표시 시간'],['likes','좋아요 수']]){
    const label=document.createElement('label');label.textContent=labelText;const input=document.createElement(key==='text'?'textarea':'input');input.value=item[key];input.maxLength=key==='text'?2000:60;
    input.setAttribute('aria-label','댓글 '+(n+1)+' '+labelText);input.oninput=()=>{item[key]=input.value;dirty.add(project.type);draw()};label.append(input);row.append(label);
   }
   const check=(text,value,change)=>{const label=document.createElement('label');label.className='checkbox';const field=document.createElement('input');field.type='checkbox';field.checked=value;field.onchange=()=>change(field.checked);label.append(field,document.createTextNode(text));row.append(label)};
   check('댓글 좋아요 누름',item.liked,value=>{item.liked=value;dirty.add(project.type);draw()});
   check('입력창에서 타이핑 후 게시',item.typingDuration>0,value=>{if(value){const cue=SceneReplies.schedule({...itemOwner,commentDraft:item.text,commentDraftDuration:0},project,Math.min(time,18),index()<0?'':'feed:'+index()+':');Object.assign(item,cue);delete item.openAt;delete item.end;project.duration=cue.end;if(cue.openAt!==null&&project.actions.length<60)project.actions.push({at:cue.openAt,action:(index()<0?'':'feed:'+index()+':')+'comments',value:true})}else{delete item.typingAt;delete item.typingDuration}renderEditor();dirty.add(project.type)});
   for(const [key,labelText]of item.typingDuration>0?[['typingAt','입력 시작 · 초'],['typingDuration','입력 길이 · 초']]:[['at','게시 시점 · 초']]){
    const label=document.createElement('label');label.textContent=labelText;const field=document.createElement('input');field.type='number';field.min=key==='typingDuration'?.2:0;field.max=key==='typingDuration'?15:SceneTiming.maxDuration-.5;field.step='.1';field.value=item[key]??0;
    field.onchange=()=>{const next={...item,[key]:field.valueAsNumber};if(next.typingDuration>0)next.at=next.typingAt+next.typingDuration+.2;try{SceneReplies.validateCue(next);if(next.at>SceneTiming.maxDuration-.5)throw Error('게시 시점은 장면 최대 길이 이내여야 합니다.');Object.assign(item,next);project.duration=Math.max(project.duration,Math.ceil((next.at+.5)*2)/2);renderEditor();dirty.add(project.type)}catch(e){field.value=item[key]??0;tell(e.message)}};label.append(field);row.append(label);
   }
   if(item.typingDuration>0){const note=document.createElement('small');note.textContent=item.at.toFixed(2)+'초에 게시';row.append(note)}
   $('comment-items').append(row);
  });$('add-comment').disabled=itemOwner.commentItems.length>=30;
 }
 function parse(value){const match=/^feedItems\.(\d+)\.commentDraft$/.exec(value||'');return value==='commentDraft'?-1:match?+match[1]:null}
 function input(event){const n=parse(event.target.dataset.phoneComposer);if(n===null)return false;pausePreview();target(n);const row=owner();if(!row.commentDraft){row.commentDraftAt=time;row.commentDraftDuration=0}row.commentDraft=event.target.value.slice(0,2000);row.commentDraftDuration=SceneReplies.duration(row.commentDraft);dirty.add(project.type);draw();return true}
 function send(n){pausePreview();target(n);const row=owner(),text=row.commentDraft.trim();if(!text)return true;if(row.commentItems.length>=30){tell('댓글은 30개까지 사용할 수 있어요.');return true}
  try{const prefix=n<0?'':'feed:'+n+':',cue=SceneReplies.schedule(row,project,time,prefix);if(cue.openAt!==null&&project.actions.length>=60)throw Error('반응 동작은 60개까지 사용할 수 있어요.');
   if(cue.openAt!==null)project.actions.push({at:cue.openAt,action:prefix+'comments',value:true});
   row.commentItems.push({author:project.handle||'나',text,time:'방금',likes:'0',liked:false,at:cue.at,typingAt:cue.typingAt,typingDuration:cue.typingDuration});row.commentDraft='';row.commentDraftAt=row.commentDraftDuration=0;project.duration=cue.end;time=cue.typingAt;dirty.add(project.type);renderEditor();renderInteractionEditor();tell(cue.typingAt.toFixed(2)+'초 입력 시작 · '+cue.at.toFixed(2)+'초 게시');playPreview(Math.min(project.duration,cue.at+.4));
  }catch(e){tell(e.message)}return true;
 }
 function action(value){const s=SceneCollections.parseAction(value),n=s?s.index:-1,a=s?s.action:value;if(a==='comments'){target(n);render()}if(a==='send-comment')return send(n);return false}
 function keydown(event){const n=parse(event.target.dataset.phoneComposer);if(n===null||event.key!=='Enter'||event.shiftKey||event.isComposing)return false;event.preventDefault();send(n);return true}
 function add(){const row=owner();if(row.commentItems.length>=30)return;row.commentItems.push({author:'새 계정',text:'댓글을 입력하세요.',time:'방금',likes:'0',liked:false});update()}
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function composer(p,avatar=''){const hint=p.type.startsWith('x')?'답글을 작성하세요…':'댓글 달기…';return '<div class="ph-comment-composer"><span class="ph-comment-avatar">'+avatar+'</span><div class="ph-reply-input"><input data-phone-composer="commentDraft" aria-label="댓글 입력" placeholder="'+hint+'" value="'+esc(p._sourceCommentDraft??p.commentDraft)+'"><div class="ph-reply-display" aria-hidden="true"><span class="ph-reply-line">'+(p.commentDraft?esc(p.commentDraft):p._commentTyping?'':'<span class="ph-muted">'+hint+'</span>')+(p._commentTyping?'<i style="opacity:'+(p._commentCursor?1:0)+'"></i>':'')+'</span></div></div><button type="button" data-phone-action="send-comment">게시</button></div>'}
 function layout(root){for(const line of root.querySelectorAll('.ph-reply-line')){const width=line.parentElement.clientWidth;line.style.transform='translateX(-'+Math.max(0,line.scrollWidth-width)+'px)'}}
 function init(){$('reply-target').onchange=()=>{target($('reply-target').value);render()};$('comments').readOnly=true}
 return{render,input,send,action,keydown,add,composer,layout,init,owner};
})();
