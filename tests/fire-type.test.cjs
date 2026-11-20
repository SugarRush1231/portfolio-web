const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { runInNewContext } = require('node:vm');
const source = readFileSync(`${__dirname}/../script.js`, 'utf8');
const helper = source.match(/function initFireTypography\(title\) \{[\s\S]*?(?=\n    function initProjectGallery)/)[0];
function setup(reject = false) {
    let creates = 0, pauses = 0, draws = 0, removed = 0, callback, videoDraw;
    const classes = new Set();
    const ctx = { scale() {}, measureText: () => ({ fontBoundingBoxAscent: 70, fontBoundingBoxDescent: 20 }), fillText() {}, clearRect() {}, fillRect() {}, drawImage(...args) { draws++; if (args[0] === video) videoDraw = args.slice(1); } };
    const glyph = { textContent: 'F', getBoundingClientRect: () => ({ left: 0, top: 0, width: 60, height: 100 }) };
    const word = { classList: { add: c => classes.add(c), remove: c => classes.delete(c) }, querySelectorAll: () => [glyph], getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 100 }), appendChild() {} };
    const video = { readyState: 2, videoWidth: 960, videoHeight: 540, pause() { pauses++; }, play: () => reject ? Promise.reject(new Error('blocked')) : Promise.resolve() };
    const document = { createElement(name) { creates++; return name === 'video' ? video : { getContext: () => ctx, setAttribute() {}, remove() { removed++; } }; } };
    const title = { querySelectorAll(selector) { assert.equal(selector, '.project-display-title'); return [word]; } };
    const api = runInNewContext(`${helper}; initFireTypography(title)`, { title, document, window: { devicePixelRatio: 1 }, getComputedStyle: () => ({ fontWeight: '700', fontSize: '100px', fontFamily: 'Inter' }), requestAnimationFrame(fn) { callback = fn; return 1; }, cancelAnimationFrame() { callback = null; } });
    return { api, video, classes, count: () => ({ creates, pauses, draws, removed, callback, videoDraw }) };
}
test('fire footage is lazy, muted, masked, and stopped when the intro leaves', () => {
    const app = setup();
    assert.equal(app.count().creates, 0);
    app.api.prepare();
    assert.equal(app.video.muted, true);
    assert.equal(app.video.src, 'assets/brand/fire-rising.mp4');
    app.api.show();
    assert.equal(app.classes.has('fire-ready'), true);
    assert.equal(app.count().draws, 2);
    assert.equal(app.count().creates, 3);
    assert.equal(app.count().videoDraw[1], 0);
    assert.equal(app.count().videoDraw[3], 540);
    assert.equal(app.count().videoDraw[5], 12);
    assert.equal(app.count().videoDraw[6], 100);
    assert.equal(app.count().videoDraw[5] + app.count().videoDraw[7], 100);
    app.api.stop();
    assert.equal(app.classes.has('fire-ready'), false);
    assert.equal(app.count().callback, null);
    assert.equal(app.count().removed, 1);
    assert.equal(app.count().pauses, 1);
});
test('blocked or unready fire playback retains the readable text fallback', async () => {
    const app = setup(true);
    app.video.readyState = 0;
    app.api.prepare(); app.api.show();
    assert.equal(app.classes.has('fire-ready'), false);
    await Promise.resolve();
    assert.equal(app.count().callback, null);
    assert.equal(app.count().removed, 1);
});
