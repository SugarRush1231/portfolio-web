/* ═══════════════════════════════════════════════════
   SITE MODE
   head의 site-mode 스크립트가 정한 <html data-mode>에 맞춰
   다른 갈래의 카드·상세 글을 script.js 실행 전에 DOM에서 뺍니다.
   프로그램 프로젝트는 카드에 data-kind="software",
   상세 글에 class="project software-project"를 붙이면 /software에 나옵니다.
   ═══════════════════════════════════════════════════ */

(function () {
    'use strict';

    const mode = document.documentElement.dataset.mode || 'video';
    const remove = selector => document.querySelectorAll(selector).forEach(element => element.remove());
    const switchLink = document.querySelector('[data-mode-switch]');

    if (mode === 'entry') {
        remove('.nav-links, .work-barcode, [data-mode-switch], #view-toolbar, #hero, #work, .project, #about, #contact');
        return;
    }

    remove('#entry');

    function setSwitch(href, label) {
        if (!switchLink) return;
        switchLink.href = href;
        switchLink.firstChild.textContent = `${label} `;
    }

    if (mode === 'video') {
        remove('.work-preview[data-kind="software"], .project.software-project');
        setSwitch('/software', 'AI Software');
        return;
    }

    // software
    remove('.work-preview:not([data-kind="software"]), .project:not(.software-project), #project-side-nav');
    setSwitch('/video', 'Video & AI');

    const lines = ['AI Tools', 'for Work.'];
    const setText = (selector, text) => {
        const element = document.querySelector(selector);
        if (element) element.textContent = text;
    };
    setText('.hero-label', 'AI SOFTWARE · AUTOMATION');
    setText('.hero-desc', 'AI로 업무 도구를 만듭니다');
    document.querySelectorAll('.hero-title, .nav-logo').forEach(title => {
        title.replaceChildren(...lines.map(line => {
            const span = document.createElement('span');
            span.textContent = line;
            return span;
        }));
    });
    document.querySelector('.nav-logo')?.setAttribute('data-shine', lines.join('\n'));
    document.title = '김병석 | AI Software';
    document.querySelector('meta[name="description"]')
        ?.setAttribute('content', '김병석의 AI 업무 도구·자동화 프로그램 포트폴리오.');
})();
