const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { runInNewContext } = require('node:vm');
const { test } = require('node:test');
const source = readFileSync(`${__dirname}/../script.js`, 'utf8');
const init = source.match(/function initCopyToClipboard\(\) \{[\s\S]*?(?=\n\}\)\(\);)/)[0];

function setup({ modern, legacy = false, throws = false } = {}) {
    let click, removed = false, focused = false, selected = false;
    const classes = new Set(), label = {}, icon = { style: {} };
    const toast = { querySelector: selector => selector === 'span' ? label : icon,
        classList: { add: name => classes.add(name), remove: name => classes.delete(name) } };
    const document = {
        activeElement: { focus() { focused = true; } },
        querySelectorAll: () => [{ getAttribute: () => 'person@example.com', addEventListener(name, fn) { click = fn; } }],
        getElementById: () => toast,
        createElement: () => ({ style: {}, select() { selected = true; } }),
        body: { appendChild() {}, removeChild() { removed = true; } },
        execCommand() { if (throws) throw new Error('Copy denied'); return legacy; },
    };
    const navigator = modern ? { clipboard: { writeText: modern } } : {};
    runInNewContext(`${init}; initCopyToClipboard();`, { document, navigator, setTimeout() {}, clearTimeout() {} });
    return { click: () => click({ preventDefault() {} }), state: () => ({ removed, focused, selected, shown: classes.has('show'), message: label.textContent, iconHidden: icon.style.display === 'none' }) };
}

test('clipboard success is only announced after the browser confirms the copy', async () => {
    let resolveCopy;
    const app = setup({ modern: () => new Promise(resolve => { resolveCopy = resolve; }) });
    const result = app.click();
    assert.equal(app.state().shown, false);
    resolveCopy(); await result;
    assert.equal(app.state().message, '클립보드에 복사되었습니다!');
    assert.equal(app.state().iconHidden, false);
});

test('denied clipboard and failed fallback show an error and restore focus', async () => {
    for (const throws of [false, true]) {
        const app = setup({ modern: () => Promise.reject(new Error('Denied')), throws });
        await app.click();
        const state = app.state();
        assert.equal(state.message, '복사하지 못했습니다. 표시된 연락처를 직접 복사해 주세요.');
        assert.equal(state.iconHidden, true);
        assert.equal(state.removed, true);
        assert.equal(state.focused, true);
    }
});

test('local-file fallback reports the actual result and cleans up its temporary field', async () => {
    const app = setup({ legacy: true });
    await app.click();
    assert.equal(app.state().message, '클립보드에 복사되었습니다!');
    assert.equal(app.state().removed, true);
    assert.equal(app.state().focused, true);
});
