// Web port of MMT.WinUI's XAML pages. Processing stays in the Windows application.
(() => {
    'use strict';
    const workspace = document.getElementById('workspace');
    const dialog = document.getElementById('preview-dialog');
    const dialogTitle = document.getElementById('dialog-title');
    const dialogDescription = document.getElementById('dialog-description');
    const dialogContent = document.getElementById('dialog-content');
    const closeButton = document.getElementById('dialog-close');
    const names = { youtube: '영상 다운로드', codec: 'Pr/AE 코덱 해결', format: '포맷 변환기', audio: '오디오 변환기', subtitles: 'AI 자막 · 번역', lyrics: '노래 자막 생성', settings: '설정' };
    const pages = new Map();
    let activePage = 'subtitles';
    let version = document.querySelector('[data-mmt-version]').textContent;
    let restoreDialogFocus;
    const svgNS = 'http://www.w3.org/2000/svg';
    const glyphs = { 0xE714:'clapperboard', 0xE90F:'settings-2', 0xE8AB:'repeat-2', 0xE189:'music-2', 0xE190:'captions', 0xE8D6:'audio-lines', 0xE713:'settings-2', 0xE8E5:'folder-open', 0xE8B7:'folder', 0xE711:'x', 0xE74E:'save', 0xE774:'globe', 0xE721:'scan-search', 0xE8F9:'list-checks', 0xE896:'arrow-down-to-line' };

    function decorateIcons(root) {
        root.querySelectorAll('.native-icon').forEach(node => {
            const name = glyphs[node.textContent.codePointAt(0)];
            if (!name) return;
            const svg = document.createElementNS(svgNS, 'svg'), use = document.createElementNS(svgNS, 'use');
            svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('aria-hidden', 'true');
            use.setAttribute('href', '#icon-' + name); svg.append(use); node.replaceChildren(svg);
        });
    }
    function conversionPage(name) {
        const definitions = {
            codec: { title:'Pr/AE 코덱 해결', description:'Premiere Pro 또는 After Effects에서 영상만 나오거나 소리가 안 나오는 문제를 H.264/AAC 호환 MP4로 변환합니다.', input:'영상 파일', start:'코덱 문제 해결 시작', formats:[] },
            format: { title:'포맷 변환기', description:'영상 포맷 또는 이미지 시퀀스로 변환합니다.', input:'영상 파일', start:'포맷 변환 시작', formats:['WebM (.webm)','MOV (.mov)','MKV (.mkv)','AVI (.avi)','WMV (.wmv)','GIF (.gif)','JPG Sequence','PNG Sequence'] },
            audio: { title:'오디오 변환기', description:'영상 또는 오디오 파일에서 MP3, WAV, FLAC, OGG, M4A를 만듭니다.', input:'영상 또는 오디오 파일', start:'오디오 추출/변환 시작', formats:['MP3','WAV','FLAC','OGG','M4A'] }
        };
        const d = definitions[name], page = document.createElement('section');
        page.className = 'page'; page.setAttribute('aria-labelledby', name + '-title');
        page.innerHTML = `<header class="page-heading"><h1 id="${name}-title">${d.title}</h1><p>${d.description}</p></header>
            <section class="section input-row"><label>${d.input}<input type="text" data-source-path readonly placeholder="파일을 선택하거나 화면에 끌어다 놓으세요."></label><button type="button" data-pick-file><span class="native-icon" aria-hidden="true">&#xE8E5;</span>파일 선택</button></section>
            <section class="section stack"><div class="input-row"><label>저장 위치<input type="text" readonly placeholder="저장 위치를 선택하세요."></label><button type="button" data-preview-action="위치 설정"><span class="native-icon" aria-hidden="true">&#xE8B7;</span>위치 설정</button></div>
            ${d.formats.length ? `<select name="output-format" aria-label="출력 포맷">${d.formats.map(text=>`<option>${text}</option>`).join('')}</select>` : ''}</section>
            <section class="section section-bottom stack"><div class="conversion-actions"><button type="button" class="primary conversion" data-preview-action="${d.start}"><span class="native-icon" aria-hidden="true">&#xE8AB;</span>${d.start}</button><button type="button" class="danger" disabled><span class="native-icon" aria-hidden="true">&#xE711;</span>취소</button></div><p data-status>대기 중...</p><div class="progress" aria-hidden="true"></div><button type="button" class="icon-button" data-preview-action="폴더 열기" aria-label="폴더 열기" title="폴더 열기"><span class="native-icon" aria-hidden="true">&#xE8B7;</span></button></section>`;
        return page;
    }
    function navigate(name, focus = true) {
        if (!Object.hasOwn(names, name)) return;
        if (!pages.has(name)) {
            const template = document.getElementById('page-' + name);
            const page = template ? template.content.firstElementChild.cloneNode(true) : conversionPage(name);
            decorateIcons(page); pages.set(name, page);
        }
        pages.get(name).querySelectorAll('[data-mmt-version]').forEach(label => {label.textContent = version;});
        activePage = name;
        workspace.replaceChildren(pages.get(name)); workspace.scrollTop = 0;
        document.getElementById('section-name').textContent = names[name];
        document.querySelectorAll('[data-page]').forEach(button => {
            if (button.dataset.page === name) button.setAttribute('aria-current', 'page');
            else button.removeAttribute('aria-current');
        });
        if (focus) { const heading = workspace.querySelector('h1'); heading.tabIndex = -1; heading.focus({preventScroll:true}); }
    }
    function showDialog(title, description, contents = []) {
        if (!dialog.open) restoreDialogFocus = document.activeElement;
        dialogTitle.textContent = title; dialogDescription.textContent = description;
        dialogContent.replaceChildren(...contents);
        if (!dialog.open) dialog.showModal();
        closeButton.focus({preventScroll:true});
    }
    function closeDialog() { dialog.close(); }
    function pickSample() {
        const page = pages.get(activePage);
        const buttons = ['sample-video.mp4', 'sample-audio.wav'].map(filename => {
            const button = document.createElement('button'); button.type = 'button'; button.className = 'sample-file'; button.textContent = filename;
            button.addEventListener('click', () => {
                const path = page.querySelector('[data-source-path]');
                if (path instanceof HTMLInputElement) path.value = filename; else path.textContent = filename;
                const status = page.querySelector('[data-status]');
                if (status) status.textContent = filename;
                closeDialog();
            });
            return button;
        });
        showDialog('파일 선택', '예시 파일을 선택하세요.', buttons);
    }
    function showModels() {
        const models = [
            ['Whisper', 'Large V3 Turbo · 빠름 · 정확\nLarge V3 · 느림 · 대용량\nSmall · 매우 빠름 · 경량'],
            ['AI 번역', '자막 생성과 노래 자막 작업에서 공통 모델을 관리합니다.']
        ].map(([title, description]) => {
            const card = document.createElement('section'); card.className = 'model-card';
            const heading = document.createElement('h3'), text = document.createElement('p'); heading.textContent = title; text.textContent = description; card.append(heading, text); return card;
        });
        const actions = document.createElement('div'); actions.className = 'button-row';
        ['Whisper 삭제', '번역 모델 삭제', 'AI 모델 저장 위치 변경'].forEach(label => {
            const button = document.createElement('button'); button.type = 'button'; button.textContent = label;
            button.dataset.previewAction = label; if (label.endsWith('삭제')) button.className = 'danger'; actions.append(button);
        });
        showDialog('모델 관리', '로컬 음성 인식·번역 모델', [...models, actions]);
    }
    function setWidget(enabled) {
        document.getElementById('widget-toggle').setAttribute('aria-checked', String(enabled));
        const widget = document.getElementById('widget-preview'); widget.hidden = !enabled;
        if (enabled) widget.focus(); else document.getElementById('widget-toggle').focus();
    }
    document.addEventListener('click', event => {
        const button = event.target.closest('button'); if (!button || button.disabled) return;
        if (button.dataset.page) navigate(button.dataset.page);
        else if (button.id === 'dialog-close') closeDialog();
        else if (button.hasAttribute('data-pick-file')) pickSample();
        else if (button.hasAttribute('data-models')) showModels();
        else if (button.id === 'widget-toggle') setWidget(button.getAttribute('aria-checked') !== 'true');
    });
    document.addEventListener('input', event => {
        if (event.target.name === 'video-url') workspace.querySelector('[data-check-video]').disabled = !event.target.value.trim();
    });
    document.addEventListener('change', event => {
        const input = event.target;
        if (input.name === 'with-subtitles') workspace.querySelector('[name=subtitle-language]').hidden = !input.checked;
        if (input.name === 'custom-folders') workspace.querySelector('[data-site-folders]').hidden = !input.checked;
        if (input.name === 'filename-rule') workspace.querySelector('[name=filename-template]').disabled = input.value !== '직접 입력';
        if (input.name === 'section-download' && input.checked) {
            const fields = document.createElement('div'); fields.className = 'options options-two';
            fields.innerHTML = '<label>시작 시간<input type="text" value="00:00:00" inputmode="numeric"></label><label>종료 시간<input type="text" value="00:00:30" inputmode="numeric"></label>';
            showDialog('구간만 받기', '다운로드할 시작·종료 시간을 지정하세요.', [fields]);
        }
    });
    document.addEventListener('dragover', event => event.preventDefault());
    document.addEventListener('drop', event => event.preventDefault());
    document.addEventListener('contextmenu', event => event.preventDefault());
    document.addEventListener('keydown', event => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') event.preventDefault(); });
    document.addEventListener('dragstart', event => { if (event.target.closest('img, svg')) event.preventDefault(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && !dialog.open && !document.getElementById('widget-preview').hidden) { event.preventDefault(); setWidget(false); } });
    dialog.addEventListener('close', () => { if (restoreDialogFocus?.isConnected) restoreDialogFocus.focus({preventScroll:true}); });
    window.addEventListener('message', event => {
        if (event.source !== window.parent || event.origin !== (location.protocol === 'file:' ? 'null' : location.origin) || event.data?.type !== 'mmt-release' || !/^v\d+\.\d+\.\d+$/.test(event.data.version)) return;
        version = event.data.version;
        document.querySelectorAll('[data-mmt-version]').forEach(label => {label.textContent = version;});
    });
    decorateIcons(document); navigate('subtitles', false);
})();
