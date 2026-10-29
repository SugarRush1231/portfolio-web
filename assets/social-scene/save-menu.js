'use strict';
function sceneSaveFormats(type){
    const formats=[{id:'png',name:'PNG 이미지',note:'현재 프레임'}];
    if(['kakao-overlay','discord-voice'].includes(type))formats.push(
        {id:'mov',name:'투명 MOV',note:'ProRes 4444 · 알파 채널 · 권장'},
        {id:'sequence',name:'투명 PNG 시퀀스',note:'30 fps · ZIP 파일'}
    );
    formats.push({id:'mp4',name:'MP4 영상',note:type==='kakao-overlay'?'마젠타 배경 · 크로마키 합성용':type==='discord-voice'?'배경 포함':'H.264'});
    return formats;
}
if(typeof module!=='undefined')module.exports={sceneSaveFormats};
if(typeof document!=='undefined')(function(){
    const image=document.getElementById('save-image'),video=document.getElementById('save-video');
    if(!image||!video)return;
    const actions=video.closest('.export-actions'),legacy=document.createElement('div'),control=document.createElement('div');
    legacy.hidden=true;legacy.append(image,video);control.className='scene-save-control';
    const button=document.createElement('button');button.id='save-output';button.type='button';button.className='primary';
    button.setAttribute('aria-haspopup','menu');button.setAttribute('aria-expanded','false');button.setAttribute('aria-controls','scene-save-menu');
    button.innerHTML='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 3v12m-4-4 4 4 4-4M5 16v5h14v-5"/></svg><span>저장</span><svg class="scene-save-chevron" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg>';
    const menu=document.createElement('div');menu.id='scene-save-menu';menu.className='scene-save-menu';menu.hidden=true;menu.setAttribute('role','menu');menu.setAttribute('aria-label','저장 형식');
    control.append(button);actions.append(legacy,control);actions.classList.add('has-save-menu');document.body.append(menu);
    function close(focus=false){menu.hidden=true;button.setAttribute('aria-expanded','false');if(focus)button.focus({preventScroll:true})}
    function choose(format){
        close(true);
        if(format==='png'){image.click();return}
        const field=project.type==='kakao-overlay'?document.getElementById('overlay-format'):project.type==='discord-voice'?document.querySelector('[data-film-prop="exportFormat"]'):null;
        if(field){field.value=format;field.dispatchEvent(new Event('input',{bubbles:true}))}
        video.click();
    }
    function open(last=false){
        if(button.disabled)return;
        menu.replaceChildren();
        for(const format of sceneSaveFormats(project.type)){
            const item=document.createElement('button'),name=document.createElement('span'),note=document.createElement('small');
            item.type='button';item.tabIndex=-1;item.dataset.saveFormat=format.id;item.setAttribute('role','menuitem');name.textContent=format.name;note.textContent=format.note;item.append(name,note);item.addEventListener('click',()=>choose(format.id));menu.append(item);
        }
        const notes=[];
        if(project.type==='kakao-overlay')notes.push('MP4에는 마젠타 배경이 들어가며 키잉 후 색 테두리가 남을 수 있습니다. 합성용은 투명 MOV를 권장합니다.');
        if(location.protocol==='file:'&&['kakao-overlay','discord-voice'].includes(project.type))notes.push('투명 MOV는 웹 주소에서 저장할 수 있습니다.');
        if(notes.length){const note=document.createElement('p');note.className='scene-save-note';note.textContent=notes.join(' ');menu.append(note)}
        const rect=button.getBoundingClientRect();menu.style.right=Math.max(8,innerWidth-rect.right)+'px';menu.style.top=(rect.bottom+8)+'px';menu.hidden=false;button.setAttribute('aria-expanded','true');
        const items=menu.querySelectorAll('[role=menuitem]');items[last?items.length-1:0].focus({preventScroll:true});
        const box=menu.getBoundingClientRect();document.dispatchEvent(new CustomEvent('scene-save-open',{detail:{top:Math.round(box.top),height:Math.round(box.height)}}));
    }
    button.addEventListener('click',()=>menu.hidden?open():close());
    window.addEventListener('keydown',event=>{
        if(event.target!==button&&!menu.contains(event.target))return;
        event.stopPropagation();
        if(event.key==='Escape'){event.preventDefault();close(true);return}
        if(event.key==='Tab'){close();return}
        if(event.target===button&&['ArrowDown','ArrowUp'].includes(event.key)){event.preventDefault();open(event.key==='ArrowUp');return}
        if(!['ArrowDown','ArrowUp','Home','End'].includes(event.key)||menu.hidden)return;
        event.preventDefault();const items=[...menu.querySelectorAll('[role=menuitem]')],index=items.indexOf(document.activeElement);
        items[event.key==='Home'?0:event.key==='End'?items.length-1:(index+(event.key==='ArrowDown'?1:-1)+items.length)%items.length].focus({preventScroll:true});
    },true);
    document.addEventListener('pointerdown',event=>{if(!control.contains(event.target)&&!menu.contains(event.target))close()});
    document.addEventListener('focusin',event=>{if(!control.contains(event.target)&&!menu.contains(event.target))close()});
    window.addEventListener('resize',()=>close());window.addEventListener('scroll',()=>close(),true);
    const busy=()=>{button.disabled=image.disabled||video.disabled||typeof recording!=='undefined'&&!!recording;if(button.disabled)close()};
    const observer=new MutationObserver(busy);for(const target of [image,video,document.getElementById('export-dialog')])if(target)observer.observe(target,{attributes:true,attributeFilter:['disabled','open']});busy();
    const hideSettings=()=>{for(const field of document.querySelectorAll('#overlay-format,[data-film-prop="exportFormat"]')){const label=field.closest('label');if(label&&!label.hidden)label.hidden=true}};
    hideSettings();const fields=document.getElementById('film-fields');if(fields)new MutationObserver(hideSettings).observe(fields,{childList:true,subtree:true});
})();
