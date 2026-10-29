(function(){
    'use strict';
    const panel=document.getElementById('project-social-scene'),frame=document.getElementById('social-scene-frame');
    if(!panel||!frame)return;
    const channel='portfolio-social-scene-v1',loading=document.getElementById('social-scene-loading'),status=document.getElementById('social-scene-status');
    const root=document.documentElement,fileMode=location.protocol==='file:',targetOrigin=fileMode?'*':location.origin;
    const popoutButton=document.getElementById('social-scene-popout'),returnButton=document.getElementById('social-scene-return'),detachedNote=document.getElementById('social-scene-detached');
    const storageKey='portfolio-social-scene:'+location.pathname;
    const remember=(key,value)=>{try{if(value===null)sessionStorage.removeItem(storageKey+key);else if(value!==undefined)sessionStorage.setItem(storageKey+key,value);else return sessionStorage.getItem(storageKey+key)}catch{}return null};
    const randomId=()=>Array.from(window.crypto.getRandomValues(new Uint32Array(4)),value=>value.toString(16).padStart(8,'0')).join('');
    const workspace=remember(':workspace')||randomId();remember(':workspace',workspace);
    let popoutToken=remember(':popout');
    let ready=false,inView=false,detached=null,poll=null,loadTimer=null,pendingSnapshot=null,returning=false,detachedReady=false;
    const theme=()=>root.dataset.theme==='light'?'light':'dark';
    const active=()=>!panel.hidden&&!document.hidden&&inView&&!detached&&!popoutToken;
    const post=(receiver,type,value)=>{if(receiver&&!receiver.closed)receiver.postMessage({channel,type,value},targetOrigin)};
    const send=(type,value)=>post(frame.contentWindow,type,value);
    function sync(){send('ownership',!popoutToken&&!detached);send('theme',theme());send('active',active());post(detached,'theme',theme())}
    function load(){
        if(panel.hidden||frame.dataset.loaded)return;
        frame.dataset.loaded='true';
        const url=new URL(frame.dataset.src,document.baseURI);url.searchParams.set('portfolio-theme',theme());url.searchParams.set('workspace',workspace);frame.src=url.href;
        clearTimeout(loadTimer);loadTimer=setTimeout(()=>{if(!ready){loading.hidden=true;status.textContent='편집기 로딩이 지연됩니다. 다시 불러오기를 눌러 주세요.';document.getElementById('social-scene-retry').hidden=false}},30000);
    }
    function unlock(){frame.inert=false;frame.hidden=false;detachedNote.hidden=true;popoutButton.textContent='별도 창으로 크게 보기';clearInterval(poll);poll=null;detached=null;pendingSnapshot=null;returning=false;popoutToken=null;remember(':popout',null);sync()}
    function restore(){if(pendingSnapshot){if(!ready)return;send('restore',pendingSnapshot);pendingSnapshot=null;returning=true}else unlock()}
    function lock(){frame.inert=true;frame.hidden=true;send('active',false);send('ownership',false);detachedNote.hidden=false;popoutButton.textContent='편집 창으로 이동';returnButton.disabled=false;clearInterval(poll);poll=setInterval(()=>{if(detached?.closed){clearInterval(poll);restore()}},400)}
    const observer=new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;sync()},{threshold:0});observer.observe(frame);
    new MutationObserver(()=>{load();sync()}).observe(panel,{attributes:true,attributeFilter:['hidden']});
    new MutationObserver(sync).observe(root,{attributes:true,attributeFilter:['data-theme']});
    document.addEventListener('visibilitychange',sync);
    frame.addEventListener('load',sync);
    window.addEventListener('message',event=>{
        const validOrigin=fileMode?['null','file://'].includes(event.origin):event.origin===location.origin;
        if(validOrigin&&event.data?.channel===channel&&event.source&&event.source!==frame.contentWindow&&!detached&&popoutToken&&event.data.token===popoutToken&&['reconnect','snapshot'].includes(event.data.type)){
            detached=event.source;detachedReady=true;lock();status.textContent='별도 편집 창에 다시 연결했습니다.';post(detached,'snapshot-request',true);
        }
        const fromFrame=event.source===frame.contentWindow,fromDetached=detached&&event.source===detached;
        if((!fromFrame&&!fromDetached)||!validOrigin||event.data?.channel!==channel)return;
        const {type,value}=event.data;
        if(type==='recovery-error'){const note=document.getElementById('social-scene-run-note');note.hidden=false;note.textContent='브라우저 자동 복구 저장을 사용할 수 없습니다. 현재 작업을 프로젝트 파일로 저장해 주세요.';return}
        if(type==='checkpoint'&&value===true){status.textContent='이 브라우저에 작업 내용을 자동 저장했습니다.';return}
        if(fromDetached){
            if(type==='ready'&&value===true){if(detachedReady)post(detached,'snapshot-request',true);else if(ready)send('snapshot-request',true)}
            if(type==='snapshot'&&value){pendingSnapshot=value;if(returning||detached.closed)restore()}
            if(type==='restored'){detachedReady=true;status.textContent='별도 편집 창에서 작업 중입니다. 창을 닫으면 여기에 반영됩니다.'}
            if(type==='error'&&typeof value==='string'){status.textContent=value.slice(0,160);returning=false;returnButton.disabled=false;if(!detachedReady){post(detached,'close',true);unlock()}}
            return;
        }
        if(type==='ready'&&value===true){ready=true;clearTimeout(loadTimer);loading.hidden=true;document.getElementById('social-scene-retry').hidden=true;panel.dataset.editorReady='true';popoutButton.disabled=false;status.textContent='템플릿과 내용을 편집한 뒤 PNG·영상으로 저장할 수 있습니다.';sync();if(pendingSnapshot&&detached?.closed)restore();else if(detached&&!detachedReady)send('snapshot-request',true)}
        if(type==='snapshot'&&value){if(detached&&!detached.closed)post(detached,'restore',value)}
        if(type==='busy')popoutButton.disabled=!ready||value===true;
        if(type==='restored'&&returning){post(detached,'close',true);unlock();status.textContent='별도 창의 편집 내용을 이어받았습니다.'}
        if(type==='status'&&typeof value==='string'&&ready&&!detached)status.textContent=value.slice(0,240);
        if(type==='error'&&typeof value==='string'){clearTimeout(loadTimer);loading.hidden=true;status.textContent=value.slice(0,160);if(!ready)panel.dataset.editorReady='error';if(returning){returning=false;returnButton.disabled=false}else if(detached){post(detached,'close',true);unlock()}}
        if(type==='needs-server'){
            const note=document.getElementById('social-scene-run-note');note.hidden=false;note.textContent='투명 MOV는 웹 주소로 연 포트폴리오에서 저장할 수 있습니다. 현재 작업은 편집기의 프로젝트 저장으로 보관할 수 있습니다.';note.scrollIntoView({block:'center',behavior:'smooth'});
        }
        if(type==='dialog'&&value&&Number.isFinite(value.top)&&Number.isFinite(value.height)&&value.top>=0&&value.height>0&&value.height<2000&&active()){
            const box=frame.getBoundingClientRect(),top=box.top+value.top,bottom=top+value.height;
            if(top<110||bottom>innerHeight-24)window.scrollTo({top:scrollY+top-Math.max(110,(innerHeight-value.height)/2),behavior:'instant'});
        }
    });
    popoutButton.addEventListener('click',()=>{
        if(detached&&!detached.closed){detached.focus();return}
        popoutToken=randomId();remember(':popout',popoutToken);
        const url=new URL(frame.dataset.src,document.baseURI);url.searchParams.set('popout','1');url.searchParams.set('portfolio-theme',theme());url.searchParams.set('workspace',workspace);url.searchParams.set('token',popoutToken);
        detached=window.open(url.href,'_blank','popup,width=1440,height=960,resizable=yes,scrollbars=yes');
        if(!detached){popoutToken=null;remember(':popout',null);status.textContent='별도 편집 창을 열 수 없습니다. 브라우저의 팝업 허용 설정을 확인해 주세요.';return}
        detachedReady=false;lock();
    });
    returnButton.addEventListener('click',()=>{if(detached&&!detached.closed){returning=true;returnButton.disabled=true;post(detached,'snapshot-request',true)}else restore()});
    document.getElementById('social-scene-retry').addEventListener('click',()=>{if(ready)return;delete frame.dataset.loaded;loading.hidden=false;document.getElementById('social-scene-retry').hidden=true;load()});
    document.getElementById('social-scene-edit').addEventListener('click',()=>{
        load();document.getElementById('social-scene-editor').scrollIntoView({block:'start',behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
    });
    if(popoutToken){lock();setTimeout(()=>{if(!detached){unlock();status.textContent='별도 창이 닫혀 브라우저에 저장된 작업을 이어갑니다.'}},3000)}
    load();
})();
