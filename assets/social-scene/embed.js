(function(){
    'use strict';
    if(document.documentElement.dataset.portfolioEmbed!=='true')return;
    for(const [id,brand,label] of [['news-article','naver','뉴스 기사'],['email-inbox','google','Gmail']]){
        const button=document.querySelector('[data-template="'+id+'"]'),target=document.querySelector('.library-brand[data-brand="'+brand+'"]');
        if(!button||!target)continue;
        const previous=button.closest('.library-brand');button.textContent=label;button.setAttribute('aria-label',(brand==='naver'?'NAVER':'Google')+' '+label);target.append(button);
        target.querySelector('.branch-count').textContent=String(target.querySelectorAll('.template-button').length);
        if(!previous.querySelector('.template-button'))previous.remove();
    }
    for(const category of document.querySelectorAll('.library-category')){
        if(!category.querySelector('.library-brand'))category.remove();
        else if(category.querySelector('.library-section')?.textContent==='검색')category.querySelector('.library-section').textContent='웹 서비스';
    }
    const detached=document.documentElement.dataset.portfolioPopout==='true',host=detached?window.opener:parent;
    const channel='portfolio-social-scene-v1',fileMode=location.protocol==='file:',origin=fileMode?'*':location.origin;
    const query=new URLSearchParams(location.search),workspace=query.get('workspace'),token=detached?query.get('token'):null;
    const send=(type,value)=>{if(host&&!host.closed)host.postMessage({channel,type,value,token},origin)};
    const stop=()=>{if(typeof pausePreview==='function')pausePreview()};
    const snapshot=()=>({version:1,scenes:Object.values(projects),active:project.type,time,dirty:[...dirty],tab:document.querySelector('.inspector-tabs [aria-selected=true]')?.id});
    const recoveryKey='portfolio-social-scene:'+workspace;
    let initialized=false,restoring=false,owns=!detached,queued=false,revision=0,database,pendingRecord=null,writing=false;
    const openRecovery=()=>database||(database=new Promise((resolve,reject)=>{
        const request=indexedDB.open('portfolio-social-scene-recovery',1);
        request.onupgradeneeded=()=>request.result.createObjectStore('workspaces');
        request.onsuccess=()=>resolve(request.result);request.onerror=()=>reject(request.error);
    }));
    async function recoveryRecord(record){
        const db=await openRecovery();
        return new Promise((resolve,reject)=>{
            const transaction=db.transaction('workspaces',record?'readwrite':'readonly'),store=transaction.objectStore('workspaces'),request=store.get(workspace);let result;
            request.onsuccess=()=>{result=request.result;if(record&&(!result||result.updatedAt<=record.updatedAt))store.put(record,workspace)};
            transaction.oncomplete=()=>resolve(result);transaction.onerror=transaction.onabort=()=>reject(transaction.error||Error('자동 저장 실패'));
        });
    }
    function backup(record){try{const text=JSON.stringify(record);if(text.length>2000000)return false;localStorage.setItem(recoveryKey,text);return true}catch{return false}}
    function recoveryError(){document.documentElement.dataset.recoveryState='unavailable';send('recovery-error',true)}
    function saveRecovery(){
        if(!workspace||!initialized||restoring||!owns)return;
        pendingRecord={updatedAt:Date.now(),owner:token,state:structuredClone(snapshot()),revision:++revision};
        document.documentElement.dataset.recoveryState='saving';
        if(!writing)persistRecovery();
    }
    async function persistRecovery(){
        writing=true;
        while(pendingRecord){
            const record=pendingRecord;pendingRecord=null;
            try{try{await recoveryRecord(record)}catch{if(!backup(record))throw Error('자동 저장 실패')}
                if(record.revision===revision){document.documentElement.dataset.recoveryState='saved';send('checkpoint',true)}
            }catch{recoveryError()}
        }
        writing=false;
    }
    function scheduleRecovery(){if(queued||!initialized||restoring||!owns)return;queued=true;queueMicrotask(()=>{queued=false;saveRecovery()})}
    for(const method of ['add','delete','clear']){const original=dirty[method];dirty[method]=function(...args){const result=original.apply(this,args);scheduleRecovery();return result}}
    for(const name of ['input','change','pointerup','keyup','click'])document.addEventListener(name,scheduleRecovery);
    async function readRecovery(){
        let record,quick;try{record=await recoveryRecord()}catch{recoveryError()}
        try{quick=JSON.parse(localStorage.getItem(recoveryKey))}catch{}
        if(quick&&Number.isFinite(quick.updatedAt)&&(!record||quick.updatedAt>=record.updatedAt))record=quick;
        return record;
    }
    async function restore(value,notify=true){
        if(!value||value.version!==1||!Array.isArray(value.scenes)||value.scenes.length!==SOCIAL_SCENES.length)throw Error('편집 내용을 이어받지 못했습니다.');
        const scenes=value.scenes.map(validateScene),ids=new Set(scenes.map(scene=>scene.type));
        if(ids.size!==SOCIAL_SCENES.length||!ids.has(value.active)||!Number.isFinite(value.time))throw Error('편집 화면 정보가 올바르지 않습니다.');
        stop();restoring=true;
        try{
        const restored=await Promise.all(scenes.map(async next=>{
            await ElementRender.ready(next);
            const [avatar,media,favicons,voices]=await Promise.all([
                loadSceneAsset(next.avatar),loadSceneAsset(next.media,next.mediaKind==='video'),
                Promise.all([...new Set(next.results.map(result=>result.faviconImage).filter(Boolean))].map(async data=>[data,await loadSceneAsset(data)])),
                Promise.all(next.voices.map(async voice=>({avatar:await loadSceneAsset(voice.avatar)}))),
                Promise.all((next.participants||[]).map(member=>loadSceneAsset(ChatModels.avatar(next,member.id)))),
                Promise.all(next.messages.filter(message=>message.image).map(async message=>{const image=await loadSceneAsset(message.image);Object.assign(message,ChatMedia.attachment({...message,imageWidth:image.naturalWidth,imageHeight:image.naturalHeight}))})),
            ]);
            return[next,{avatar,media,voices,favicons:Object.fromEntries(favicons)}];
        }));
        for(const [next,sceneAssets] of restored){const old=assetsByScene[next.type]?.media;if(old instanceof HTMLVideoElement)SceneAudio.releaseMedia(old);projects[next.type]=next;assetsByScene[next.type]=sceneAssets}
        switchScene(value.active);time=Math.max(0,Math.min(project.duration,value.time));dirty.clear();
        if(Array.isArray(value.dirty))for(const id of value.dirty)if(ids.has(id))dirty.add(id);
        if(['tab-content','tab-motion','tab-screen'].includes(value.tab))document.getElementById(value.tab).click();
        draw();if(notify)send('restored',true);
        }finally{restoring=false}
    }
    window.addEventListener('message',event=>{
        if(event.source!==host||!(fileMode?['null','file://'].includes(event.origin):event.origin===location.origin)||event.data?.channel!==channel)return;
        if(event.data.type==='theme'&&['light','dark'].includes(event.data.value))document.documentElement.dataset.portfolioTheme=event.data.value;
        if(event.data.type==='active'&&event.data.value===false)stop();
        if(event.data.type==='ownership'){owns=event.data.value===true;if(owns)scheduleRecovery()}
        if(event.data.type==='snapshot-request'){if(recording){send('error','저장 작업이 끝난 뒤 편집 창을 전환해 주세요.');return}stop();send('snapshot',snapshot())}
        if(event.data.type==='restore')restore(event.data.value).then(()=>{initialized=true;if(detached)owns=true;saveRecovery();if(detached)send('reconnect',true)}).catch(error=>send('error',error.message||'편집 내용을 이어받지 못했습니다.'));
        if(event.data.type==='close'&&detached){dirty.clear();window.close()}
    });
    function checkpoint(){if(initialized&&owns&&!restoring){backup({updatedAt:Date.now(),owner:token,state:snapshot()});saveRecovery();if(detached)send('snapshot',snapshot())}}
    window.addEventListener('beforeunload',checkpoint);window.addEventListener('pagehide',checkpoint);
    document.addEventListener('visibilitychange',()=>{if(document.hidden)stop()});
    document.addEventListener('click',event=>{
        const link=event.target.closest('#export-local-preview,#mov-origin-note a');
        if(!link)return;
        event.preventDefault();send('needs-server',true);
    });
    const localLink=document.getElementById('export-local-preview');
    if(localLink){localLink.removeAttribute('target');localLink.href='#';localLink.textContent='포트폴리오 실행 안내'}
    const originNote=document.getElementById('mov-origin-note');
    if(originNote)originNote.innerHTML='투명 MOV 저장은 웹 주소로 연 포트폴리오에서 이용할 수 있습니다. <a href="#">실행 안내</a>';
    const status=document.getElementById('status');
    if(status)new MutationObserver(()=>send('status',status.textContent.slice(0,240))).observe(status,{childList:true,subtree:true,characterData:true});
    const dialog=document.getElementById('export-dialog');
    document.addEventListener('scene-save-open',event=>send('dialog',event.detail));
    if(dialog)new MutationObserver(()=>{send('busy',dialog.open);if(dialog.open){const box=dialog.getBoundingClientRect();send('dialog',{top:Math.round(box.top),height:Math.round(box.height)})}}).observe(dialog,{attributes:true,attributeFilter:['open']});
    Promise.all([typeof brandReady==='undefined'?Promise.resolve():brandReady,document.fonts.ready]).then(async()=>{
        if(typeof renderOutputFrame!=='function'||typeof switchScene!=='function')throw Error('편집기 초기화를 완료하지 못했습니다.');
        if(workspace){const saved=await readRecovery();if(saved?.state&&(!detached||saved.owner===token)){try{await restore(saved.state,false);if(detached)owns=true;document.documentElement.dataset.recoveryState='saved'}catch{recoveryError()}}}
        initialized=true;
        send('ready',true);
        if(detached){if(owns)send('reconnect',true);setInterval(()=>{if(owns)send('reconnect',true)},500)}
    }).catch(error=>send('error',String(error.message||'편집기를 불러오지 못했습니다.').slice(0,160)));
})();
