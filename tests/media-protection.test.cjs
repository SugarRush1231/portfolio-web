const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { runInNewContext } = require('node:vm');
const { test } = require('node:test');
const source = readFileSync(`${__dirname}/../script.js`, 'utf8');
const init = source.match(/function initMediaProtection\(\) \{[\s\S]*?(?=\n    \/\/ ── Init)/)[0];

function setup() {
    const events = {}, controls = new Set(['noremoteplayback']);
    const document = {
        querySelectorAll: () => [{ controlsList: { add: value => controls.add(value) } }, {}],
        addEventListener: (name, handler) => { events[name] = handler; },
    };
    runInNewContext(`${init}; initMediaProtection();`, { document });
    const fire = (name, ancestor, options = {}) => {
        let prevented = false;
        events[name]({
            target: { closest: selector => selector.split(', ').includes(ancestor) ? {} : null },
            preventDefault() { prevented = true; },
            ...options,
        });
        return prevented;
    };
    return { fire, controls };
}

test('saving menus are blocked across the entire page, including text and blank areas', () => {
    const app = setup();
    for (const ancestor of ['video', 'img', '.video-player', '.work-preview', '.media-placeholder']) {
        assert.equal(app.fire('contextmenu', ancestor), true, ancestor);
    }
    assert.equal(app.fire('contextmenu', 'p'), true);
    assert.equal(app.fire('contextmenu', 'a'), true);
    assert.equal(app.fire('contextmenu', 'body'), true);
    assert.equal(app.controls.has('nodownload'), true);
    assert.equal(app.controls.has('noremoteplayback'), true);
});

test('page save shortcuts are blocked without blocking ordinary typing or copy shortcuts', () => {
    const app = setup();
    for (const options of [{ ctrlKey: true }, { metaKey: true }, { ctrlKey: true, shiftKey: true }]) {
        assert.equal(app.fire('keydown', 'body', { key: 'S', ...options }), true);
    }
    assert.equal(app.fire('keydown', 'body', { key: 's' }), false);
    assert.equal(app.fire('keydown', 'body', { key: 'c', ctrlKey: true }), false);
    assert.equal(app.fire('keydown', 'body', { key: 's', altKey: true, ctrlKey: true }), false);
});

test('media drag saving is blocked while ordinary text and link dragging remain available', () => {
    const app = setup();
    assert.equal(app.fire('dragstart', 'video'), true);
    assert.equal(app.fire('dragstart', 'img'), true);
    assert.equal(app.fire('dragstart', 'p'), false);
    assert.equal(app.fire('dragstart', 'a'), false);
});
