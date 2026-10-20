const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { runInNewContext } = require('node:vm');
const source = readFileSync(`${__dirname}/../script.js`, 'utf8');
const frameHelper = source.match(/function galleryCardFrame\(position, gap, frameWidth\) \{[\s\S]*?(?=\n    function initGallerySurface)/)[0];
const helper = source.match(/function initGallerySurface\(gallery, cards, redraw\) \{[\s\S]*?(?=\n    function initProjectGallery)/)[0];
function setup(available = true, blockedImage = false) {
    const calls = [], events = {}, classes = new Set();
    const gl = new Proxy({}, { get(target, name) {
        if (/^[A-Z_]+$/.test(name)) return name;
        if (name === 'getShaderParameter' || name === 'getProgramParameter') return () => true;
        if (name === 'getUniformLocation') return (_, key) => key;
        if (name === 'getAttribLocation') return () => 0;
        if (name === 'texImage2D' && blockedImage) return () => { throw new Error('Cross-origin image blocked'); };
        if (String(name).startsWith('create')) return () => ({});
        return (...args) => calls.push([name, ...args]);
    } });
    const canvas = { width: 0, height: 0, getContext: () => available ? gl : null, setAttribute() {}, addEventListener: (name, fn) => events[name] = fn };
    const gallery = { appendChild() {}, classList: { toggle(name, value) { value ? classes.add(name) : classes.delete(name); }, remove: name => classes.delete(name) } };
    const cards = Array.from({ length: 5 }, (_, i) => ({ querySelector: () => ({ complete: true, naturalWidth: 960, naturalHeight: i === 4 ? 1720 : 540, addEventListener() {} }), addEventListener() {} }));
    const api = runInNewContext(`${frameHelper}; ${helper}; initGallerySurface(gallery, cards, () => {});`, { gallery, cards, document: { createElement: () => canvas }, window: { devicePixelRatio: 2 }, requestAnimationFrame() {}, console });
    return { api, canvas, calls, events, classes };
}
test('gallery mesh draws 20 columns per card, caps resolution, and defers to native cards outside the list', () => {
    const app = setup();
    const frame = { width: 1440, height: 900, frameWidth: 1000, gap: 120, offset: 240, angle: 12, energy: 0.6, visible: true };
    app.api.render(frame);
    assert.equal(app.canvas.width, 2160);
    assert.equal(app.canvas.height, 1350);
    assert.ok(app.classes.has('surface-ready'));
    assert.equal(app.calls.filter(call => call[0] === 'drawArrays').length, 5);
    assert.ok(app.calls.filter(call => call[0] === 'drawArrays').every(call => call[3] === 120));
    assert.ok(app.calls.some(call => call[0] === 'uniform1f' && call[1] === 'energy' && call[2] === 0.6));
    app.api.render({ ...frame, visible: false });
    assert.equal(app.classes.has('surface-ready'), false);
    app.api.render(frame);
    app.events.webglcontextlost({ preventDefault() {} });
    app.api.render(frame);
    assert.equal(app.classes.has('surface-ready'), false);
});
test('unsupported WebGL keeps the original clickable cards available', () => {
    assert.equal(setup(false).api, null);
});

test('blocked local-file images keep native cards without interrupting page setup', () => {
    const app = setup(true, true);
    assert.ok(app.api);
    app.api.render({ width: 1440, height: 900, frameWidth: 1000, gap: 120, offset: 240, angle: 0, energy: 0, visible: true });
    assert.equal(app.classes.has('surface-ready'), false);
    assert.equal(app.calls.filter(call => call[0] === 'drawArrays').length, 0);
});

test('only the focused thumbnail stays fully colored, including between wheel stops', () => {
    const app = setup();
    for (const offset of [0, 120, 150, 240, 290, 360, 480]) {
        app.api.render({ width: 1440, height: 900, frameWidth: 1000, gap: 120, offset, angle: 15, energy: .8, visible: true });
        const focus = app.calls.filter(call => call[0] === 'uniform1f' && call[1] === 'focus').slice(-5).map(call => call[2]);
        assert.deepEqual(focus, Array.from({ length: 5 }, (_, i) => i === Math.round(offset / 120) ? 1 : 0));
    }
    const fragment = app.calls.find(call => call[0] === 'shaderSource' && call[2].includes('gl_FragColor'))[2];
    assert.match(fragment, /mix\(vec3\(gray \* .7\), pixel.rgb, focus\)/);
});

test('portrait thumbnails use a centered cover crop instead of stretching into landscape cards', () => {
    const app = setup();
    app.api.render({ width: 1440, height: 900, frameWidth: 1000, gap: 120, offset: 480, angle: 0, energy: 0, visible: true });
    const scales = app.calls.filter(call => call[0] === 'uniform2f' && call[1] === 'imageScale');
    assert.deepEqual(scales[0].slice(2), [1, 1]);
    assert.equal(scales[4][2], 1);
    assert.ok(Math.abs(scales[4][3] - (960 / 1720) / (16 / 9)) < 1e-9);
});

test('featured cards stay separated throughout scrolling and keep side cards narrow', () => {
    const frame = runInNewContext(`${frameHelper}; galleryCardFrame;`);
    for (const width of [350, 640, 1054]) {
        const gap = 80;
        assert.equal(frame(0, gap, width).width, width * .72);
        assert.equal(frame(gap, gap, width).width, gap - 20);
        for (let offset = 0; offset <= gap; offset += 4) {
            const left = frame(-offset, gap, width);
            const right = frame(gap - offset, gap, width);
            assert.ok(right.x - right.width / 2 - (left.x + left.width / 2) >= 19.99);
        }
    }
});
