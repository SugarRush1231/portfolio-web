const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { runInNewContext } = require('node:vm');
const { test } = require('node:test');

const source = readFileSync(`${__dirname}/../script.js`, 'utf8');
const keyboard = source.match(/function handlePlayerKeydown\(e\) \{[\s\S]*?(?=\n            playerContainer.addEventListener\('keydown')/)[0];
const viewport = { window: { innerWidth: 1000, innerHeight: 800 }, document: { getElementById: () => ({ offsetHeight: 80 }) } };
const playerRect = { top: 100, bottom: 200, left: 0, right: 100, width: 100, height: 100 };

test('seeking waits for video metadata, then clamps to the timeline', () => {
    const seek = source.match(/function seekToPosition\(e\) \{[\s\S]*?\n            \}/)[0];
    const context = {
        video: { duration: NaN, currentTime: 0 },
        progressBar: { getBoundingClientRect: () => ({ left: 10, width: 100 }) },
        progressPlayed: { style: {} }, progressHandle: { style: {} }, timeDisplay: {},
        formatTime: String,
    };
    runInNewContext(`${seek}; seekToPosition({clientX: 60});`, context);
    assert.equal(context.video.currentTime, 0);
    context.video.duration = 20;
    runInNewContext('seekToPosition({clientX: 60})', context);
    assert.equal(context.video.currentTime, 10);
    runInNewContext('seekToPosition({clientX: 500})', context);
    assert.equal(context.video.currentTime, 20);
});

test('player shortcuts leave native controls and browser shortcuts alone; seconds mode uses 1s or Shift+5s', () => {
    let handler;
    let plays = 0;
    const playerContainer = { closest: () => null, getBoundingClientRect: () => playerRect };
    const context = {
        ...viewport,
        playerContainer,
        video: { duration: NaN, currentTime: 8 },
        togglePlay() { plays++; },
        frameStepMode: false, FRAME_DURATION: 1 / 30, clearTimeout() {}, seekingTimeout: null,
        bigPlayBtn: { classList: { add() {} } },
        updateProgress() {}, showControls() {},
        register(callback) { handler = callback; },
    };
    runInNewContext(`${keyboard}; register(handlePlayerKeydown);`, context);
    const event = { target: { closest: () => ({ tagName: 'BUTTON' }) }, key: ' ', preventDefault() {} };
    handler(event);
    assert.equal(plays, 0);
    event.target = playerContainer;
    handler(event);
    assert.equal(plays, 1);
    event.key = 'ArrowRight';
    handler(event);
    assert.equal(context.video.currentTime, 8);
    context.video.duration = 20;
    handler(event);
    assert.equal(context.video.currentTime, 9);
    handler({ ...event, shiftKey: true });
    assert.equal(context.video.currentTime, 14);
    handler({ ...event, key: 'ArrowLeft' });
    assert.equal(context.video.currentTime, 13);
    handler({ ...event, key: 'ArrowLeft', shiftKey: true });
    assert.equal(context.video.currentTime, 8);
    for (const modifier of ['altKey', 'ctrlKey', 'metaKey']) {
        handler({ ...event, [modifier]: true, preventDefault() { assert.fail('Browser shortcut was captured'); } });
        assert.equal(context.video.currentTime, 8);
    }
});

test('arrows on player buttons seek the same film; frame mode pauses and clamps without capturing native fields', () => {
    let handler;
    const context = {
        ...viewport,
        playerContainer: { closest: () => null, getBoundingClientRect: () => playerRect },
        video: { duration: 20, currentTime: 8, paused: false, pause() { this.paused = true; } },
        frameStepMode: runInNewContext(source.match(/let frameStepMode = (?:true|false);/)[0] + 'frameStepMode'),
        FRAME_DURATION: 1 / 30,
        clearTimeout() {}, seekingTimeout: null,
        bigPlayBtn: { classList: { add() {} } }, timeDisplay: {},
        formatTime: String, formatTimeWithFrame: String,
        updateProgress() {}, showControls() {}, register(callback) { handler = callback; },
    };
    runInNewContext(`${keyboard}; register(handlePlayerKeydown);`, context);
    const button = { closest: () => null };
    let prevented = 0;
    const event = { target: button, key: 'ArrowRight', preventDefault() { prevented++; } };
    handler(event);
    assert.ok(Math.abs(context.video.currentTime - (8 + 1 / 30)) < 1e-9, 'Frame stepping is the real default');
    assert.equal(context.video.paused, true);
    handler({ ...event, key: 'ArrowLeft', shiftKey: true });
    assert.ok(Math.abs(context.video.currentTime - (8 - 4 / 30)) < 1e-9);
    context.video.currentTime = 0;
    handler({ ...event, key: 'ArrowLeft' });
    assert.equal(context.video.currentTime, 0);
    context.video.currentTime = 20;
    handler(event);
    assert.equal(context.video.currentTime, 20);
    const count = prevented;
    handler({ ...event, target: { closest: () => ({ tagName: 'INPUT' }) } });
    assert.equal(prevented, count);
    handler({ ...event, key: ' ', target: { closest: selector => selector.startsWith('button,') ? button : null } });
    assert.equal(prevented, count, 'Space on a focused button keeps its native action');
    for (const duration of [1001 / 30000, 1 / 24]) {
        context.FRAME_DURATION = duration;
        context.video.currentTime = 8;
        handler(event);
        assert.ok(Math.abs(context.video.currentTime - (8 + duration)) < 1e-9);
    }
});

test('an open detail handles arrows without clicking the player, but hidden players and the main list do not', () => {
    const routing = source.match(/document.addEventListener\('keydown', e => \{[\s\S]*?handlePlayerKeydown\(e\);[\s\S]*?\n            \}\);/)[0];
    let onKey, hidden = false, visible = true, withinPlayer = false, lightbox = false, calls = 0;
    const gallery = { hidden: false, dataset: { phase: 'video' } };
    const playerContainer = {
        contains: () => withinPlayer,
        closest: selector => selector === '[hidden]' ? hidden : gallery,
        getClientRects: () => visible ? [{}] : [],
    };
    runInNewContext(routing, {
        playerContainer, handlePlayerKeydown() { calls++; },
        document: { body: { classList: { contains: () => lightbox } }, addEventListener(name, callback) { onKey = callback; } },
    });
    const event = { key: 'ArrowRight', target: { closest: () => null } };
    onKey(event);
    assert.equal(calls, 1);
    onKey({ ...event, key: ' ' });
    assert.equal(calls, 2, 'Space is routed from the detail without a player click');
    for (const phase of ['out', 'type', 'camera', 'closing']) { gallery.dataset.phase = phase; onKey(event); }
    assert.equal(calls, 2);
    gallery.dataset.phase = 'video';
    hidden = true; onKey(event); hidden = false;
    visible = false; onKey(event); visible = true;
    withinPlayer = true; onKey(event); withinPlayer = false;
    lightbox = true; onKey(event); lightbox = false;
    onKey({ ...event, defaultPrevented: true });
    onKey({ ...event, key: 'Tab' });
    onKey({ ...event, target: { closest: () => ({ tagName: 'BUTTON' }) } });
    assert.equal(calls, 2);
    gallery.hidden = true; onKey(event);
    assert.equal(calls, 2);
    gallery.hidden = false;
    const barcode = { closest: selector => selector === '.work-barcode' || selector.startsWith('button,') ? {} : null };
    onKey({ ...event, key: ' ', target: barcode });
    assert.equal(calls, 3, 'Space reaches the visible film even while the project menu has focus');
    onKey({ ...event, target: barcode });
    assert.equal(calls, 3, 'Other menu keys are not reassigned to the film');
});

test('Space from detail content toggles playback once and prevents scroll, while fields and buttons retain native keys', () => {
    let toggles = 0, handler;
    let bounds = playerRect;
    const context = { ...viewport, playerContainer: { getBoundingClientRect: () => bounds }, togglePlay() { toggles++; }, showControls() {}, register(callback) { handler = callback; } };
    runInNewContext(`${keyboard}; register(handlePlayerKeydown);`, context);
    const press = (options = {}) => {
        const event = { key: ' ', target: { closest: () => null }, preventDefault() { this.defaultPrevented = true; }, ...options };
        handler(event);
        return event;
    };
    assert.equal(press().defaultPrevented, true);
    assert.equal(toggles, 1);
    assert.equal(press({ repeat: true }).defaultPrevented, true);
    assert.equal(toggles, 1, 'holding Space must not rapidly pause and play');
    for (const target of [
        { closest: selector => selector.startsWith('input,') ? {} : null },
        { closest: selector => selector.startsWith('button,') ? {} : null },
    ]) assert.equal(press({ target }).defaultPrevented, undefined);
    assert.equal(toggles, 1);
    for (const offscreen of [
        { top: 800, bottom: 900 }, { top: -20, bottom: 80 },
        { left: 1000, right: 1100 }, { left: -100, right: 0 }, { width: 0 },
    ]) {
        bounds = { ...playerRect, ...offscreen };
        assert.equal(press().defaultPrevented, undefined, 'Fully hidden video must leave Space to the browser');
    }
    assert.equal(toggles, 1);
    bounds = { ...playerRect, top: 79, bottom: 81 };
    assert.equal(press().defaultPrevented, true, 'A visible sliver still permits video shortcuts');
    assert.equal(toggles, 2);
    const barcode = { closest: selector => selector === '.work-barcode' || selector.startsWith('button,') ? {} : null };
    assert.equal(press({ target: barcode }).defaultPrevented, true);
    assert.equal(toggles, 3, 'Space pauses the film instead of activating the focused project menu');
    assert.equal(press({ target: barcode, repeat: true }).defaultPrevented, true);
    assert.equal(toggles, 3);
});

test('only on-demand controls stay hidden until interaction, including when the entry state is reset', () => {
    const controls = source.match(/function showControls\(fromInteraction = false\) \{[\s\S]*?(?=\n            \/\/ ── 이벤트 리스너)/)[0];
    const classes = new Set();
    const context = {
        playerContainer: { dataset: { controls: 'on-demand' } },
        overlay: { classList: { add: value => classes.add(value), contains: value => classes.has(value), remove: value => classes.delete(value) } },
        isPlaying: true, hideControlsTimer: null, clearTimeout() {}, setTimeout() {},
    };
    runInNewContext(`${controls}; showControlsPermanent(); showControls();`, context);
    assert.equal(classes.has('show-controls'), false);
    runInNewContext('showControls(true);', context);
    assert.equal(classes.has('show-controls'), true);
    assert.equal(classes.has('controls-interacted'), true);
    classes.clear();
    runInNewContext('showControls();', context);
    assert.equal(classes.has('show-controls'), false);
    context.playerContainer.dataset = {};
    runInNewContext('showControlsPermanent();', context);
    assert.equal(classes.has('show-controls'), true, 'Other project players keep their initial controls');
});
