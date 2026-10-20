const assert = require('node:assert/strict');
const { readFileSync, existsSync, statSync } = require('node:fs');
const { runInNewContext } = require('node:vm');
const { test } = require('node:test');

test('year follows the device date, including after returning to an open tab', () => {
    const source = readFileSync(`${__dirname}/../script.js`, 'utf8');
    const years = [{ textContent: '' }, { textContent: '' }];
    const metadata = { content: '' };
    const events = {};
    let currentYear = 2026;
    const document = {
        title: '김병석 | Portfolio',
        querySelectorAll: selector => selector === '[data-current-year]' ? years : [],
        querySelector: selector => selector === 'meta[name="description"]' ? metadata : null,
        getElementById: id => id === 'nav' ? { classList: { remove() {} } } : null,
        addEventListener: (event, callback) => { (events[event] ??= []).push(callback); },
    };
    runInNewContext(source, {
        document,
        window: { scrollY: 0, matchMedia: () => ({ matches: false, addEventListener() {} }), addEventListener: (event, callback) => { (events[event] ??= []).push(callback); } },
        Date: class { getFullYear() { return currentYear; } },
        IntersectionObserver: class { observe() {} },
        MutationObserver: class { observe() {} },
        ResizeObserver: class { observe() {} },
        setInterval(callback, delay) { assert.equal(delay, 60000); events.yearTimer = [callback]; },
        Set,
    });
    for (const [year, event] of [[2026, 'pageshow'], [2027, 'visibilitychange'], [2030, 'pageshow'], [2031, 'yearTimer'], [2032, 'focus']]) {
        currentYear = year;
        events[event].forEach(callback => callback());
        years.forEach(element => assert.equal(element.textContent, year));
        assert.equal(document.title, '김병석 | Portfolio');
        assert.ok(metadata.content.startsWith(`${year} 김병석`));
    }
    const html = readFileSync(`${__dirname}/../index.html`, 'utf8');
    assert.match(html, /<title>김병석 \| Portfolio<\/title>/);
    assert.equal([...html.matchAll(/data-current-year/g)].length, 2);
});

test('all five projects have contribution credits and linked previews', () => {
    const html = readFileSync(`${__dirname}/../index.html`, 'utf8');
    const projects = [...html.matchAll(/<article class="project" id="([^"]+)"[\s\S]*?<\/article>/g)];
    assert.equal(projects.length, 5);
    for (const [project, id] of projects) {
        assert.match(project, /class="project-contribution">개인 기여도 <span>100%<\/span>/);
        assert.match(project, /class="project-scope">/);
        assert.ok(html.includes(`class="work-preview" href="#${id}"`));
    }
    for (const [, src] of html.matchAll(/<a class="work-preview"[^>]*>\s*<img[^>]* src="([^"]+)"/g)) {
        assert.ok(existsSync(`${__dirname}/../${src}`), `Missing preview: ${src}`);
        assert.ok(statSync(`${__dirname}/../${src}`).size < 150 * 1024, `Preview too large: ${src}`);
    }
    assert.match(html, /id="contact-email" data-copy="kbs318@naver.com"/);
});
