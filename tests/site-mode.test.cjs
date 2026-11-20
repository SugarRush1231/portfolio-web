const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { runInNewContext } = require('node:vm');
const { test } = require('node:test');

const html = readFileSync(`${__dirname}/../index.html`, 'utf8');
const headScript = html.match(/<script>\s*\/\* site-mode:[\s\S]*?<\/script>/)[0].replace(/^<script>|<\/script>$/g, '');

function load(url, protocol = 'http:') {
    const { pathname, hash, search } = new URL(url, 'http://localhost');
    const root = { dataset: {} };
    const window = {
        location: { protocol, pathname, hash, search },
        history: {
            state: null, replaced: null,
            replaceState(state, title, value) { this.replaced = value; },
        },
    };
    runInNewContext(headScript, { window, document: { documentElement: root } });
    return { mode: root.dataset.mode, replaced: window.history.replaced };
}

test('head script runs before any relative stylesheet or script loads', () => {
    const at = html.indexOf('/* site-mode:');
    assert.ok(at > 0 && at < html.indexOf('<link'));
});

test('path chooses the mode', () => {
    assert.deepEqual(load('/'), { mode: 'entry', replaced: null });
    assert.deepEqual(load('/video'), { mode: 'video', replaced: null });
    assert.deepEqual(load('/software'), { mode: 'software', replaced: null });
    assert.deepEqual(load('/video#project-03'), { mode: 'video', replaced: null });
    assert.deepEqual(load('/software#about'), { mode: 'software', replaced: null });
});

test('trailing slashes are normalised so relative assets still resolve', () => {
    assert.deepEqual(load('/video/'), { mode: 'video', replaced: '/video' });
    assert.deepEqual(load('/software/#project-mmt'), { mode: 'software', replaced: '/software#project-mmt' });
});

test('old single-page links continue to the right side', () => {
    assert.deepEqual(load('/#project-mmt'), { mode: 'software', replaced: '/software#project-mmt' });
    assert.deepEqual(load('/#project-social-scene'), { mode: 'software', replaced: '/software#project-social-scene' });
    for (const id of ['01', '02', '03', '04', '05']) {
        assert.deepEqual(load(`/#project-${id}`), { mode: 'video', replaced: `/video#project-${id}` });
    }
    assert.deepEqual(load('/#about'), { mode: 'video', replaced: '/video#about' });
    assert.deepEqual(load('/index.html#contact'), { mode: 'video', replaced: '/video#contact' });
    assert.deepEqual(load('/?utm=x#project-01'), { mode: 'video', replaced: '/video?utm=x#project-01' });
});

test('the old home anchor and bare index land on the entry', () => {
    assert.deepEqual(load('/#hero'), { mode: 'entry', replaced: '/' });
    assert.deepEqual(load('/#'), { mode: 'entry', replaced: null });
    assert.deepEqual(load('/index.html'), { mode: 'entry', replaced: '/' });
});

test('file:// previews keep their path and pick the mode from the hash', () => {
    assert.deepEqual(load('/E:/portfolio/index.html#project-mmt', 'file:'), { mode: 'software', replaced: null });
    assert.deepEqual(load('/E:/portfolio/index.html', 'file:'), { mode: 'entry', replaced: null });
});

test('_redirects serves index.html for both sides', () => {
    const rules = readFileSync(`${__dirname}/../_redirects`, 'utf8').split(/\r?\n/).filter(line => line && !line.startsWith('#'))
        .map(line => line.trim().split(/\s+/));
    assert.deepEqual(rules, [['/video', '/index.html', '200!'], ['/software', '/index.html', '200!']]);
});

test('software cards and articles are marked so each side can pick them', () => {
    for (const id of ['project-mmt', 'project-social-scene']) {
        assert.match(html, new RegExp(`class="work-preview" href="#${id}" data-kind="software"`));
        assert.match(html, new RegExp(`<article class="project software-project[^"]*" id="${id}"`));
    }
    assert.equal((html.match(/class="work-preview" href="#project-0\d"/g) || []).length, 5);
});
