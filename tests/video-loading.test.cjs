const assert = require('node:assert/strict');
const { readFileSync, existsSync } = require('node:fs');
const { test } = require('node:test');
const { runInNewContext } = require('node:vm');

test('video requests are deferred until main play or preview visibility', () => {
    const html = readFileSync(`${__dirname}/../index.html`, 'utf8');
    const videos = [...html.matchAll(/<video\b[^>]*>/g)];
    assert.equal(videos.length, 11);
    for (const [tag] of videos) {
        assert.doesNotMatch(tag, /\ssrc=|\sautoplay\b/);
        assert.match(tag, /preload="none"/);
    }
    assert.equal([...html.matchAll(/data-src="video\/web\//g)].length, 5);
    assert.equal([...html.matchAll(/class="video-preview"/g)].length, 5);
    assert.equal([...html.matchAll(/class="scroll-play-video"/g)].length, 5);
    assert.equal([...html.matchAll(/poster="Thumbnail\/webm-0[1-5]\.jpg"/g)].length, 5);
    for (const [, path] of html.matchAll(/(?:data-src|data-video-src|poster)="([^"]+)"/g)) {
        assert.ok(existsSync(`${__dirname}/../${path}`), `Missing media: ${path}`);
    }
});

test('first play attaches the video URL; failed playback allows retry', async () => {
    const source = readFileSync(`${__dirname}/../script.js`, 'utf8');
    const toggle = source.match(/function togglePlay\(\) \{[\s\S]*?(?=\s*\/\/ ── 재생 상태 업데이트)/)[0];
    const hidden = new Set();
    const video = { paused: true, dataset: { src: 'video/web/project-01.mp4' }, play: async () => {} };
    const context = {
        video,
        hasStarted: false,
        bigPlayBtn: { classList: { add: value => hidden.add(value), remove: value => hidden.delete(value) } },
        playerContainer: { classList: { remove() {} } },
        loadStatus: { hidden: true },
        showActionIndicator() {},
    };
    runInNewContext(`${toggle}; togglePlay();`, context);
    assert.equal(video.src, 'video/web/project-01.mp4');
    assert.equal(video.dataset.src, undefined);
    assert.ok(hidden.has('hidden'));
    video.play = async () => { throw new Error('Offline'); };
    runInNewContext('togglePlay()', context);
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(context.hasStarted, false);
    assert.equal(context.loadStatus.hidden, false);
    assert.equal(hidden.has('hidden'), false);
});

test('main player starts at half volume and restores half volume after mute', () => {
    const source = readFileSync(`${__dirname}/../script.js`, 'utf8');
    const initial = source.match(/\/\/ 초기 상태: 볼륨 50%[\s\S]*?showControlsPermanent\(\);/)[0];
    const context = {
        video: { volume: 1, muted: true },
        previousVolume: 1,
        updateVolumeIcon() {}, updateVolumeSlider() {}, showControlsPermanent() {},
    };
    runInNewContext(initial, context);
    assert.equal(context.video.volume, 0.5);
    assert.equal(context.video.muted, false);
    assert.equal(context.previousVolume, 0.5);
    const toggle = source.match(/function toggleMute\(\) \{[\s\S]*?(?=\s*\/\/)/)[0];
    runInNewContext(`${toggle}; toggleMute(); toggleMute();`, context);
    assert.equal(context.video.volume, 0.5);
    assert.equal(context.video.muted, false);
    assert.match(source, /lightboxVideo\.volume = 0\.5/);
});

test('preview loads on visibility, pauses offscreen or in another tab, and resumes', () => {
    const source = readFileSync(`${__dirname}/../script.js`, 'utf8');
    const init = source.match(/function initScrollVideos\(\) \{[\s\S]*?(?=\n    \/\/ ─)/)[0];
    let onIntersection;
    let onLightboxChange;
    const events = {};
    let lightboxOpen = false;
    let plays = 0;
    let pauses = 0;
    const motionEvents = {};
    const motion = { matches: false, addEventListener: (name, callback) => { motionEvents[name] = callback; } };
    const video = {
        dataset: { src: 'video/Movie MV.webm' }, currentTime: 3,
        play() { plays++; return Promise.resolve(); },
        pause() { pauses++; },
    };
    const document = {
        hidden: false,
        body: { classList: { contains: () => lightboxOpen } },
        querySelectorAll: () => [video],
        addEventListener: (name, callback) => { events[name] = callback; },
    };
    runInNewContext(`${init}; initScrollVideos();`, {
        document, console,
        window: { matchMedia: () => motion },
        IntersectionObserver: class {
            constructor(callback) { onIntersection = callback; }
            observe(target) { assert.equal(target, video); }
        },
        MutationObserver: class {
            constructor(callback) { onLightboxChange = callback; }
            observe() {}
        },
    });
    assert.equal(video.src, undefined);
    onIntersection([{ target: video, isIntersecting: true, intersectionRatio: 0.1 }]);
    assert.equal(video.src, undefined);
    onIntersection([{ target: video, isIntersecting: true, intersectionRatio: 0.5 }]);
    assert.equal(video.src, 'video/Movie MV.webm');
    assert.equal(video.muted, true);
    assert.equal(plays, 1);
    onIntersection([{ target: video, isIntersecting: false, intersectionRatio: 0 }]);
    assert.equal(pauses, 2);
    onIntersection([{ target: video, isIntersecting: true, intersectionRatio: 1 }]);
    document.hidden = true;
    events.visibilitychange();
    assert.equal(pauses, 3);
    document.hidden = false;
    events.visibilitychange();
    assert.equal(plays, 3);
    lightboxOpen = true;
    onLightboxChange();
    assert.equal(pauses, 4);
    lightboxOpen = false;
    onLightboxChange();
    assert.equal(plays, 4);
    assert.equal(video.currentTime, 3);
    motion.matches = true;
    motionEvents.change();
    assert.equal(pauses, 5);
});

test('lightbox isolates background, cycles keyboard focus, and restores focus on Escape', () => {
    const source = readFileSync(`${__dirname}/../script.js`, 'utf8');
    const init = source.match(/function initImageLightbox\(\) \{[\s\S]*?(?=\n    \/\/ ── Init)/)[0];
    const keyboard = {};
    const document = { addEventListener: (name, callback) => { keyboard[name] = callback; } };
    function element() {
        const classes = new Set();
        return {
            tagName: 'DIV', inert: false, style: {}, handlers: {},
            classList: { add: name => classes.add(name), remove: name => classes.delete(name), contains: name => classes.has(name) },
            addEventListener(name, callback) { this.handlers[name] = callback; },
            focus() { document.activeElement = this; },
            removeAttribute() {}, pause() {}, play: () => Promise.resolve(),
        };
    }
    const background = element();
    const lightbox = element();
    const close = element();
    const video = element();
    const image = element();
    const trigger = element();
    trigger.dataset = { videoSrc: 'video/Movie MV.webm' };
    document.body = element();
    document.body.children = [background, lightbox];
    document.activeElement = trigger;
    document.getElementById = id => ({ lightbox, 'lightbox-close': close, 'lightbox-video': video, 'lightbox-img': image })[id];
    document.querySelectorAll = selector => selector === '.video-preview' ? [trigger] : [];
    runInNewContext(`${init}; initImageLightbox();`, { document, clearTimeout() {}, setTimeout() {} });
    trigger.handlers.click({ preventDefault() {}, stopPropagation() {} });
    assert.equal(background.inert, true);
    assert.equal(document.activeElement, close);
    keyboard.keydown({ key: 'Tab', shiftKey: true, preventDefault() {} });
    assert.equal(document.activeElement, video);
    keyboard.keydown({ key: 'Tab', shiftKey: false, preventDefault() {} });
    assert.equal(document.activeElement, close);
    const escape = { key: 'Escape', preventDefault() { this.defaultPrevented = true; } };
    keyboard.keydown(escape);
    assert.equal(escape.defaultPrevented, true);
    assert.equal(background.inert, false);
    assert.equal(document.activeElement, trigger);
    assert.equal(lightbox.classList.contains('active'), false);
});


test('scroll pauses the main film below 20 percent but does not interrupt entry or resume it', () => {
    const source = readFileSync(`${__dirname}/../script.js`, 'utf8');
    const init = source.match(/function initVideoAutoPause\(\) \{[\s\S]*?(?=\n    \/\/ ─)/)[0];
    const events = {}, header = { offsetHeight: 88 }, gallery = { dataset: { phase: 'type' } };
    let ratio = 0;
    const video = { paused: false, pauses: 0, plays: 0, pause() { this.paused = true; this.pauses++; }, play() { this.plays++; } };
    const player = { querySelector: () => video, closest: () => gallery,
        getBoundingClientRect: () => ({ left: 0, right: 100, width: 100, top: header.offsetHeight - 100 * (1 - ratio), bottom: header.offsetHeight + 100 * ratio, height: 100 }) };
    runInNewContext(`${init}; initVideoAutoPause();`, {
        document: { querySelectorAll: () => [player], getElementById: () => header },
        window: { innerWidth: 1000, innerHeight: 800, addEventListener(name, callback) { events[name] = callback; } },
    });
    assert.equal(video.pauses, 0);
    events.scroll();
    assert.equal(video.pauses, 0, 'the hidden intro must not cancel click-primed playback');
    gallery.dataset.phase = 'video'; ratio = 1;
    assert.equal(video.pauses, 0, 'revealing the film itself must not trigger a pause');
    ratio = .21; events.scroll();
    assert.equal(video.pauses, 0);
    ratio = .19; events.scroll();
    assert.equal(video.pauses, 1);
    ratio = 1; events.scroll();
    assert.equal(video.paused, true);
    assert.equal(video.plays, 0);
    video.paused = false; header.offsetHeight = 112; ratio = .1; events.resize();
    assert.equal(video.pauses, 2);
});
