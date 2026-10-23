const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { runInNewContext } = require('node:vm');
const { test } = require('node:test');
const source = readFileSync(`${__dirname}/../script.js`, 'utf8');
const frameHelper = source.match(/function galleryCardFrame\(position, gap, frameWidth\) \{[\s\S]*?(?=\n    function initGallerySurface)/)[0];
const init = source.match(/function initProjectGallery\(\) \{[\s\S]*?(?=\n    function initPortfolioViews)/)[0];

function setup(reduced = false, withSoftware = false, hash = '') {
    let now = 0, timerId = 0;
    const fireCalls = { prepare: 0, show: 0, stop: 0 };
    const timers = new Map(), events = {}, windowEvents = {};
    function element() {
        const classes = new Set(), handlers = {};
        return {
            hidden: false, offsetWidth: 900, dataset: {}, handlers, attributes: {}, children: [], style: { setProperty(name, value) { this[name] = value; } },
            classList: { add: name => classes.add(name), remove: name => classes.delete(name), contains: name => classes.has(name), toggle(name, value) { value ? classes.add(name) : classes.delete(name); } },
            addEventListener(name, fn) { handlers[name] = fn; },
            getBoundingClientRect: () => ({ left: 0, top: 0, width: 900, height: 500 }),
            closest: () => null, matches: () => false,
            focus() { this.focused = true; },
            replaceChildren(...children) { this.children = children; },
            setAttribute(name, value) { this.attributes[name] = value; },
            getAttribute(name) { return this.attributes[name]; },
            appendChild(child) { this.children.push(child); },
            cloneNode() { return element(); },
        };
    }
    const ids = Object.fromEntries(['back-to-top', 'gallery-focus', 'gallery-type', 'gallery-cinema', 'gallery-camera', 'gallery-portal', 'gallery-controls', 'gallery-details', 'gallery-status', 'gallery-back', 'gallery-prev', 'gallery-next', 'gallery-project-kind', 'gallery-project-credit'].map(id => [id, element()]));
    const projects = Array.from({ length: withSoftware ? 6 : 5 }, (_, i) => {
        const video = { dataset: { src: `video/web/project-0${i + 1}.mp4` }, loads: 0, pauses: 0, plays: 0, primes: 0, play() { if (this.muted) this.primes++; else this.plays++; return Promise.resolve(); }, load() { this.loads++; }, pause() { this.pauses++; } };
        const media = element();
        const project = element();
        media.parent = project;
        media.before = marker => { marker.originalParent = project; };
        media.querySelector = selector => selector === 'video' ? video : { click() { video.plays++; } };
        const heading = { getAttribute: () => `Project ${i + 1}`, cloneNode() { return this; } };
        project.querySelector = selector => selector === '.main-media' ? media : heading;
        project.video = video; project.media = media; project.hidden = true;
        project.scrollIntoView = options => { project.scrolled = options; };
        ids[i === 5 ? 'project-mmt' : `project-0${i + 1}`] = project;
        return project;
    });
    ids['gallery-cinema'].appendChild = media => { media.parent = ids['gallery-cinema']; };
    ids['gallery-cinema'].getBoundingClientRect = () => ({ left: 0, top: 0, width: String(ids['gallery-cinema'].dataset.portrait) === 'true' ? 280 : 900, height: 500 });
    projects[4].media.classList.add('shorts-media');
    const glyphs = [{ textContent: 'O', querySelector: () => null, getBoundingClientRect: () => ({ left: 200, top: 100, width: 100, height: 200 }) }];
    const inkSvgs = [];
    ids['gallery-type'].querySelectorAll = selector => selector === 'svg[data-ink]' ? inkSvgs : glyphs;
    const cards = projects.map((project, i) => {
        const card = element();
        card.hash = i === 5 ? '#project-mmt' : `#project-0${i + 1}`;
        if (i === 5) card.dataset.kind = 'software';
        card.querySelector = selector => ({ textContent: selector === '.work-card-type' ? 'Motion' : '0:35 / 100%' });
        return card;
    });
    const gallery = element(); gallery.clientWidth = 1400; gallery.setPointerCapture = () => {};
    gallery.querySelectorAll = () => cards;
    const counter = element(), body = element(), nav = element();
    for (const [id, label] of [['gallery-prev', 'Previous project'], ['gallery-next', 'Next project']]) {
        ids[id].setAttribute('aria-label', label);
        ids[id].querySelector = () => element();
    }
    const detailLinks = () => projects.flatMap(project => project.children.filter(child => child.className === 'project-pagination').flatMap(nav => nav.children));
    const barcode = element();
    const motion = { matches: reduced, addEventListener(name, callback) { this.change = callback; } };
    const window = { scrollTo() {}, innerWidth: 1400, location: { hash }, matchMedia: () => motion, addEventListener(name, fn) { windowEvents[name] = fn; } };
    nav.click = () => {
        nav.handlers.click();
        gallery.hidden = false;
        projects.forEach(project => { project.hidden = true; });
        window.location.hash = '#work';
    };
    ids['gallery-details'].click = () => {
        gallery.hidden = true;
        window.location.hash = ids['gallery-details'].href;
        ids[window.location.hash.slice(1)].hidden = false;
    };
    const document = {
        body, hidden: false, getElementById: id => ids[id],
        querySelector: selector => selector === '.work-index' ? gallery : selector === '.work-barcode' ? barcode : selector === '.nav-link[href="#work"]' ? nav : counter,
        querySelectorAll: selector => selector === '.project-pagination a' ? detailLinks() : [nav],
        addEventListener(name, fn) { events[name] = fn; },
        createElement(tag) {
            const result = element();
            if (tag === 'a') Object.defineProperty(result, 'href', { set(value) { this.hash = value; } });
            return result;
        },
        createElementNS: () => element(),
        createComment() { return { replaceWith(media) { media.parent = this.originalParent; } }; },
    };
    runInNewContext(`${frameHelper}; ${init}; initProjectGallery();`, {
        ResizeObserver: class { constructor(fn) { windowEvents.galleryResize = fn; } observe() {} },
        document, window, Date: { now: () => now },
        initFireTypography: () => ({ prepare() { fireCalls.prepare++; }, show() { fireCalls.show++; }, stop() { fireCalls.stop++; } }),
        initGallerySurface: () => null,
        getComputedStyle: () => ({ fontFamily: 'Inter', fontSize: '180px', fontWeight: '400' }),
        setTimeout(fn, delay) { timers.set(++timerId, { fn, at: now + delay }); return timerId; },
        clearTimeout(id) { timers.delete(id); },
        requestAnimationFrame(fn) { timers.set(++timerId, { fn: () => fn(now), at: now + 16 }); return timerId; },
        cancelAnimationFrame(id) { timers.delete(id); },
    });
    function fire(target, event, options = {}) {
        const e = { target, button: 0, detail: 1, preventDefault() { this.defaultPrevented = true; }, ...options };
        target.handlers[event](e); return e;
    }
    function tick(ms) {
        const end = now + ms;
        while (true) {
            const due = [...timers].filter(([, timer]) => timer.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
            if (!due) break;
            timers.delete(due[0]); now = due[1].at; due[1].fn();
        }
        now = end;
    }
    return { windowEvents, ids, projects, cards, get pagination() { return cards.map(card => detailLinks().find(link => link.hash === card.hash)); }, get barcode() { return barcode.children; }, gallery, glyphs, inkSvgs, counter, body, motion, nav, events, window, document, fire, tick, timers, fireCalls };
}

test('the gallery initially selects Google Chrome as project 01', () => {
    const app = setup();
    assert.match(app.counter.textContent, /01 \/ 05/);
    assert.equal(app.cards[0].classList.contains('is-current'), true);
    assert.equal(app.barcode[0].attributes['aria-pressed'], 'true');
    assert.equal(app.ids['gallery-prev'].disabled, true);
    assert.equal(app.gallery.dataset.phase, 'out');
});

test('first click starts typography immediately, then enters the letter and plays the same player without navigation', () => {
    const app = setup(), card = app.cards[0], project = app.projects[0];
    assert.equal(project.video.src, undefined);
    assert.equal(app.fire(card, 'click').defaultPrevented, true);
    assert.equal(app.gallery.dataset.phase, 'type');
    assert.equal(app.window.location.hash, '');
    assert.equal(project.media.parent, app.ids['gallery-cinema']);
    assert.equal(project.video.loads, 1);
    assert.equal(project.video.plays, 0);
    assert.equal(app.cards[0], card);
    app.tick(0);
    assert.equal(app.gallery.dataset.phase, 'type');
    assert.equal(app.ids['gallery-focus'].hidden, false);
    app.tick(1300);
    assert.equal(app.gallery.dataset.phase, 'camera');
    assert.equal(app.ids['gallery-camera'].style['--camera-x'], `${232 * 1.12}px`);
    assert.equal(app.ids['gallery-cinema'].style['--video-x'], `${-232 * 1.12}px`);
    assert.equal(app.ids['gallery-portal'].children.length, 0);
    app.tick(1100);
    assert.equal(app.gallery.dataset.phase, 'video');
    assert.equal(project.video.plays, 1);
    assert.equal(project.video.volume, 0.5);
    assert.equal(app.ids['gallery-cinema'].inert, false);
    assert.equal(project.hidden, false);
    assert.equal(project.classList.contains('gallery-story'), true);
    assert.equal(app.body.classList.contains('gallery-playing'), true);
});

test('endpoint arrows are disabled and cannot restart the first or last video', () => {
    const app = setup();
    app.fire(app.cards[0], 'click'); app.tick(4500);
    assert.equal(app.ids['gallery-prev'].disabled, true);
    assert.equal(app.ids['gallery-next'].disabled, false);
    const firstPlays = app.projects[0].video.plays;
    app.fire(app.ids['gallery-prev'], 'click'); app.tick(4500);
    assert.equal(app.projects[0].video.plays, firstPlays);
    assert.equal(app.gallery.dataset.phase, 'video');
    app.fire(app.cards[4], 'click'); app.tick(4500);
    assert.equal(app.ids['gallery-prev'].disabled, false);
    assert.equal(app.ids['gallery-next'].disabled, true);
    const lastPlays = app.projects[4].video.plays;
    app.fire(app.ids['gallery-next'], 'click'); app.tick(4500);
    assert.equal(app.projects[4].video.plays, lastPlays);
    app.fire(app.ids['gallery-prev'], 'click'); app.tick(4500);
    assert.equal(app.ids['gallery-prev'].disabled, false);
    assert.equal(app.ids['gallery-next'].disabled, false);
    assert.equal(app.projects[3].hidden, false);
});

test('leaving during the camera transition cancels playback and returns the original player', () => {
    const app = setup();
    app.fire(app.cards[0], 'click'); app.tick(1300);
    app.fire(app.ids['gallery-back'], 'click'); app.tick(650);
    app.tick(5000);
    assert.equal(app.gallery.dataset.phase, 'out');
    assert.equal(app.projects[0].video.plays, 0);
    assert.equal(app.projects[0].media.parent, app.projects[0]);
    assert.equal(app.timers.size, 0);
    assert.equal(app.cards[0].focused, true);
});

test('switching projects cancels the old sequence; video scrolling remains native and list scrolling browses', () => {
    const app = setup();
    app.fire(app.cards[0], 'click'); app.tick(500);
    app.fire(app.cards[3], 'click'); app.tick(4500);
    assert.equal(app.projects[0].video.plays, 0);
    assert.equal(app.projects[3].video.plays, 1);
    assert.equal(app.projects[0].media.parent, app.projects[0]);
    const wheel = { deltaX: 0, deltaY: -150, deltaMode: 0 };
    assert.equal(app.fire(app.gallery, 'wheel', wheel).defaultPrevented, undefined);
    assert.equal(app.gallery.dataset.phase, 'video');
    assert.equal(app.projects[3].hidden, false);
    app.fire(app.ids['gallery-back'], 'click'); app.tick(650);
    assert.equal(app.projects[3].hidden, true);
    assert.equal(app.gallery.dataset.phase, 'out');
    assert.equal(app.projects[3].media.parent, app.projects[3]);
    app.tick(501); app.fire(app.gallery, 'wheel', wheel);
    assert.match(app.counter.textContent, /03 \/ 05/);
});

test('rapid wheel input during opening keeps the selected project and lets the intro finish', () => {
    const app = setup();
    app.fire(app.cards[0], 'click');
    for (const [delay, expected] of [[100, 'type'], [600, 'type'], [600, 'camera']]) {
        app.tick(delay);
        for (const deltaY of [450, -300, 700]) {
            const event = app.fire(app.gallery, 'wheel', { deltaX: 0, deltaY, deltaMode: 0 });
            assert.equal(event.defaultPrevented, true);
            assert.equal(app.gallery.dataset.phase, expected);
            assert.equal(app.projects[0].media.parent, app.ids['gallery-cinema']);
        }
    }
    app.tick(1100);
    assert.equal(app.gallery.dataset.phase, 'video');
    assert.equal(app.projects[0].hidden, false);
    assert.equal(app.projects[0].video.plays, 1);
    assert.equal(app.fire(app.gallery, 'wheel', { deltaY: 450, deltaX: 0, deltaMode: 0 }).defaultPrevented, undefined);
});

test('reduced motion and keyboard activation keep the title visible before video; modified clicks keep native links', () => {
    for (const [reduced, detail] of [[true, 1], [false, 0]]) {
        const app = setup(reduced);
        assert.equal(app.fire(app.cards[0], 'click', { ctrlKey: true }).defaultPrevented, undefined);
        assert.equal(app.projects[0].video.src, undefined);
        app.fire(app.cards[0], 'click', { detail });
        assert.equal(app.gallery.dataset.cinematic, String(detail > 0));
        assert.equal(app.gallery.classList.contains('instant-motion'), detail === 0);
        assert.equal(app.gallery.dataset.phase, 'type');
        assert.equal(app.ids['gallery-focus'].hidden, false);
        assert.equal(app.projects[0].video.plays, 0);
        app.tick(0);
        assert.equal(app.gallery.dataset.phase, 'type');
        assert.equal(app.ids['gallery-focus'].hidden, false);
        app.tick(1300);
        assert.equal(app.gallery.dataset.phase, 'camera');
        assert.equal(app.ids['gallery-focus'].hidden, false);
        app.tick(1100);
        assert.equal(app.gallery.dataset.phase, 'video');
        assert.equal(app.projects[0].video.plays, 1);
        assert.equal(app.timers.size, 0);
    }
});

test('gallery safely skips missing or empty galleries', () => {
    for (const gallery of [null, { querySelectorAll: () => [] }]) {
        runInNewContext(`${frameHelper}; ${init}; initProjectGallery();`, { document: { querySelector: () => gallery } });
    }
});

test('dragging browses without opening a work, and hiding the tab settles a pending reveal without playback', () => {
    const app = setup();
    app.fire(app.gallery, 'pointerdown', { clientX: 100, pointerId: 1 });
    app.fire(app.gallery, 'pointermove', { clientX: -100, pointerId: 1 });
    app.fire(app.gallery, 'pointerup');
    assert.match(app.counter.textContent, /03 \/ 05/);
    app.fire(app.cards[4], 'click');
    assert.equal(app.gallery.dataset.phase, 'out');
    app.fire(app.cards[1], 'click');
    app.events.visibilitychange.call(null);
    assert.equal(app.gallery.dataset.phase, 'type');
    app.document.hidden = true;
    app.events.visibilitychange();
    app.tick(5000);
    assert.equal(app.gallery.dataset.phase, 'video');
    assert.equal(app.projects[1].video.plays, 0);
    assert.equal(app.projects[1].hidden, false);
    assert.equal(app.projects[1].media.parent, app.ids['gallery-cinema']);
    assert.equal(app.timers.size, 0);
    app.document.hidden = false;
    app.events.visibilitychange();
    assert.equal(app.gallery.dataset.phase, 'video');
    assert.equal(app.projects[1].video.plays, 0);
});

test('switching tabs keeps the active project, player, and playback position without automatically resuming', () => {
    const app = setup();
    app.fire(app.cards[2], 'click');
    app.tick(4500);
    const project = app.projects[2];
    project.video.currentTime = 42;
    const plays = project.video.plays, pauses = project.video.pauses;
    app.document.hidden = true;
    app.events.visibilitychange();
    app.tick(5000);
    assert.equal(project.video.pauses, pauses + 1);
    assert.equal(app.gallery.dataset.phase, 'video');
    assert.equal(project.media.parent, app.ids['gallery-cinema']);
    assert.equal(project.hidden, false);
    assert.equal(app.body.classList.contains('gallery-playing'), true);
    assert.equal(project.video.currentTime, 42);
    app.document.hidden = false;
    app.events.visibilitychange();
    assert.equal(project.video.plays, plays);
    assert.equal(project.video.currentTime, 42);
    assert.equal(app.gallery.dataset.phase, 'video');
});

test('changing the motion preference does not skip the title or duplicate playback', () => {
    const app = setup();
    app.fire(app.cards[0], 'click');
    app.tick(250);
    app.motion.matches = true;
    app.motion.change();
    assert.equal(app.gallery.dataset.cinematic, 'true');
    assert.equal(app.gallery.classList.contains('instant-motion'), false);
    assert.equal(app.gallery.dataset.phase, 'type');
    assert.equal(app.projects[0].video.plays, 0);
    app.tick(5000);
    assert.equal(app.gallery.dataset.phase, 'video');
    assert.equal(app.projects[0].video.plays, 1);
    assert.equal(app.timers.size, 0);
});

test('Process & credits scrolls to the visible project without moving the player or changing the page', () => {
    const app = setup();
    app.fire(app.cards[2], 'click');
    app.tick(4500);
    const project = app.projects[2];
    assert.equal(app.fire(app.ids['gallery-details'], 'click').defaultPrevented, true);
    assert.equal(project.hidden, false);
    assert.equal(project.scrolled.block, 'start');
    assert.equal(project.media.parent, app.ids['gallery-cinema']);
    assert.equal(project.video.plays, 1);
    assert.equal(app.window.location.hash, '');
});

test('all shipped projects expose the shared main player, including the portrait film', () => {
    const html = readFileSync(`${__dirname}/../index.html`, 'utf8');
    const projects = [...html.matchAll(/<article class="project"[^>]*>[\s\S]*?<\/article>/g)];
    assert.equal(projects.length, 5);
    projects.forEach(([project]) => assert.match(project, /class="project-media main-media(?: shorts-media)?"/));
    assert.match(projects[4][0], /class="project-media main-media shorts-media"/);
});

test('playback is primed muted within the click, then rewound before the film is revealed', async () => {
    const app = setup();
    app.fire(app.cards[0], 'click');
    const video = app.projects[0].video;
    assert.equal(video.primes, 1);
    assert.equal(video.muted, true);
    await Promise.resolve();
    assert.equal(video.currentTime, 0);
    assert.ok(video.pauses > 0);
    app.tick(4500);
    assert.equal(video.muted, false);
    assert.equal(video.volume, 0.5);
    assert.equal(video.plays, 1);
});

test('back holds the closing phase before returning the player and cancelling playback', () => {
    const app = setup();
    app.fire(app.cards[0], 'click');
    app.tick(4500);
    app.fire(app.ids['gallery-back'], 'click');
    assert.equal(app.gallery.dataset.phase, 'closing');
    assert.equal(app.ids['gallery-cinema'].inert, true);
    app.tick(650);
    assert.equal(app.gallery.dataset.phase, 'out');
    assert.equal(app.projects[0].media.parent, app.projects[0]);
    assert.equal(app.projects[0].hidden, true);
});

test('opening a navigation link in another tab leaves the active film alone', () => {
    const app = setup();
    app.fire(app.cards[0], 'click'); app.tick(4500);
    for (const options of [{ ctrlKey: true }, { metaKey: true }, { shiftKey: true }, { altKey: true }, { button: 1 }, { defaultPrevented: true }]) {
        app.fire(app.nav, 'click', options);
        assert.equal(app.gallery.dataset.phase, 'video');
        assert.equal(app.projects[0].hidden, false);
    }
    app.fire(app.nav, 'click');
    assert.equal(app.gallery.dataset.phase, 'out');
});

test('browser zoom and modified arrow shortcuts are not captured by the gallery', () => {
    const app = setup();
    const wheel = app.fire(app.gallery, 'wheel', { ctrlKey: true, deltaY: 300, deltaX: 0, deltaMode: 0 });
    assert.equal(wheel.defaultPrevented, undefined);
    for (const options of [{ altKey: true }, { ctrlKey: true }, { metaKey: true }]) {
        let prevented = false;
        app.events.keydown({ key: 'ArrowRight', target: { closest: () => null }, preventDefault() { prevented = true; }, ...options });
        assert.equal(prevented, false);
        assert.match(app.counter.textContent, /01 \/ 05/);
    }
});

test('arrow keys browse only the main list and never switch projects during an open film', () => {
    const app = setup();
    const press = key => {
        const event = { key, target: { closest: () => null }, preventDefault() { this.defaultPrevented = true; } };
        app.events.keydown(event);
        return event;
    };
    assert.equal(press('ArrowRight').defaultPrevented, true);
    assert.match(app.counter.textContent, /02 \/ 05/);
    app.fire(app.cards[1], 'click');
    for (const phase of ['type', 'camera', 'video', 'closing']) {
        app.gallery.dataset.phase = phase;
        assert.equal(press('ArrowRight').defaultPrevented, undefined);
        assert.equal(press('ArrowLeft').defaultPrevented, undefined);
        assert.match(app.counter.textContent, /02 \/ 05/);
    }
});

test('late click-priming completion cannot rewind a film already playing', async () => {
    const app = setup(), video = app.projects[0].video;
    let finishPrime;
    video.play = function () { return this.muted ? new Promise(resolve => { finishPrime = resolve; }) : Promise.resolve(); };
    app.fire(app.cards[0], 'click'); app.tick(4500);
    video.currentTime = 9;
    finishPrime(); await Promise.resolve();
    assert.equal(video.currentTime, 9);
});

test('an old priming request cannot reset the same film after closing and reopening it', async () => {
    const app = setup(), video = app.projects[0].video, completions = [];
    video.play = () => new Promise(resolve => completions.push(resolve));
    app.fire(app.cards[0], 'click');
    app.nav.handlers.click();
    app.fire(app.cards[0], 'click');
    video.currentTime = 2;
    const pauses = video.pauses;
    completions[0](); await Promise.resolve();
    assert.equal(video.currentTime, 2);
    assert.equal(video.pauses, pauses);
});

test('Google keeps the original G and enters its real counter without constructing a mask', () => {
    const app = setup();
    const vector = {
        dataset: { cameraX: '0.40', cameraY: '0.50' },
        getBoundingClientRect: () => ({ left: 200, top: 100, width: 100, height: 100 }),
        getAttribute: () => '10 10 20 20',
        querySelector: () => ({ getAttribute: () => 'M10 10H30V30H10Z' }),
    };
    app.glyphs.unshift({ textContent: 'G', querySelector: () => vector });
    app.fire(app.cards[0], 'click');
    app.tick(1300);
    assert.equal(app.ids['gallery-camera'].style['--camera-x'], `${210 * 1.12}px`);
    assert.equal(app.ids['gallery-camera'].style['--camera-y'], `${100 * 1.12}px`);
    assert.equal(app.ids['gallery-portal'].children.length, 0);
    app.tick(1100);
    assert.equal(app.projects[0].video.plays, 1);
});

test('Chrome keeps a full-size two-word title, with a G logo as its first letter', () => {
    const html = readFileSync(`${__dirname}/../index.html`, 'utf8');
    const heading = html.match(/<h2 class="project-display-title" aria-label="GOOGLE CHROME">.*?<\/h2>/)[0];
    assert.equal([...heading.matchAll(/class="project-display-word/g)].length, 2);
    assert.equal([...heading.matchAll(/class="project-display-glyph"/g)].length, 12);
    assert.match(heading, /data-camera-x="0.40"/);
    assert.doesNotMatch(heading, /data-opening/);
    assert.doesNotMatch(heading, /google-project-label/);
    assert.doesNotMatch(heading, /;color:/);
});

test('repeated arrow navigation cancels earlier reveals and keeps only the final player and story active', () => {
    const app = setup();
    app.fire(app.cards[1], 'click'); app.tick(4500);
    app.fire(app.ids['gallery-next'], 'click'); app.tick(0);
    app.fire(app.ids['gallery-next'], 'click'); app.tick(1300);
    app.fire(app.ids['gallery-next'], 'click'); app.tick(200);
    app.fire(app.ids['gallery-prev'], 'click'); app.tick(4500);
    assert.equal(app.gallery.dataset.phase, 'video');
    assert.equal(app.timers.size, 0);
    assert.equal(app.projects.filter(project => !project.hidden).length, 1);
    assert.equal(app.projects[3].hidden, false);
    assert.equal(app.projects[3].media.parent, app.ids['gallery-cinema']);
    for (const i of [0, 1, 2, 4]) {
        assert.equal(app.projects[i].media.parent, app.projects[i]);
        assert.equal(app.projects[i].hidden, true);
    }
    assert.equal(app.projects[2].video.plays, 0);
    assert.equal(app.projects[4].video.plays, 0);
});

test('camera keeps the original title and live flame texture until the film is revealed', () => {
    const app = setup();
    app.fire(app.cards[2], 'click'); app.tick(0);
    const heading = app.ids['gallery-type'].children[0];
    const stops = app.fireCalls.stop;
    assert.equal(app.fireCalls.show, 1);
    app.tick(1300);
    assert.equal(app.gallery.dataset.phase, 'camera');
    assert.equal(app.fireCalls.stop, stops);
    assert.equal(app.ids['gallery-type'].children[0], heading);
    assert.equal(app.ids['gallery-focus'].hidden, false);
    app.tick(1100);
    assert.equal(app.fireCalls.stop, stops + 1);
    assert.equal(app.ids['gallery-focus'].hidden, true);
});

test('CHANEL uses its editorial camera without a letter target and waits before starting the film', () => {
    const app = setup();
    const vector = { dataset: { cameraX: '0.428', cameraY: '0.40' }, getBoundingClientRect: () => ({ left: 200, top: 100, width: 100, height: 100 }) };
    app.glyphs.splice(0, 1, { textContent: 'CHANEL', querySelector: () => vector });
    app.fire(app.cards[3], 'click'); app.tick(1300);
    assert.equal(app.ids['gallery-camera'].style['--camera-x'], undefined);
    assert.equal(app.ids['gallery-camera'].style['--camera-y'], undefined);
    app.tick(1100);
    assert.equal(app.gallery.dataset.phase, 'camera');
    assert.equal(app.projects[3].video.plays, 0);
    app.tick(800);
    assert.equal(app.gallery.dataset.phase, 'video');
    assert.equal(app.projects[3].video.plays, 1);
});

test('Fire on up uses a short forward camera while the flame remains active, and cancels safely', () => {
    const app = setup();
    app.fire(app.cards[2], 'click'); app.tick(1300);
    assert.equal(app.gallery.dataset.phase, 'camera');
    assert.equal(app.ids['gallery-camera'].style['--camera-x'], undefined);
    assert.equal(app.fireCalls.show, 1);
    app.tick(999);
    assert.equal(app.projects[2].video.plays, 0);
    app.tick(1);
    assert.equal(app.gallery.dataset.phase, 'video');
    assert.equal(app.projects[2].video.plays, 1);
    app.fire(app.cards[2], 'click');
    app.fire(app.ids['gallery-prev'], 'click'); app.tick(2150);
    app.fire(app.ids['gallery-next'], 'click'); app.tick(2100);
    assert.equal(app.gallery.dataset.phase, 'camera');
    app.fire(app.ids['gallery-back'], 'click'); app.tick(1300);
    assert.equal(app.gallery.dataset.phase, 'out');
    assert.equal(app.projects[2].hidden, true);
});

test('handwriting masks belong to the gallery clone and finish before its camera starts', () => {
    const app = setup(), mask = { id: 'sugar-ink-Sugar' }, shape = { attributes: {}, setAttribute(name, value) { this.attributes[name] = value; } };
    app.inkSvgs.push({ querySelector: selector => selector === 'mask' ? mask : shape });
    app.fire(app.cards[1], 'click');
    assert.equal(mask.id, 'gallery-ink-0');
    assert.equal(shape.attributes.mask, 'url(#gallery-ink-0)');
    app.tick(1200);
    assert.equal(app.gallery.dataset.phase, 'type');
    assert.equal(app.projects[1].video.plays, 0);
    app.tick(250);
    assert.equal(app.gallery.dataset.phase, 'camera');
    assert.equal(app.ids['gallery-camera'].style['--camera-x'], undefined);
    app.tick(1100);
    assert.equal(app.gallery.dataset.phase, 'video');
});

test('Sugar is already written while Rush alone writes in before the camera, with a static fallback', () => {
    const html = readFileSync(`${__dirname}/../index.html`, 'utf8');
    const heading = html.match(/<h2 class="project-display-title" aria-label="SUGAR RUSH">.*?<\/h2>/)[0];
    assert.equal([...heading.matchAll(/class="ink-word"/g)].length, 2);
    assert.equal([...heading.matchAll(/class="ink-stroke"/g)].length, 9);
    assert.match(heading, /<title>Sugar<\/title>/);
    assert.match(heading, /<title>Rush<\/title>/);
    const rush = heading.match(/<svg class="ink-word" data-ink="Rush".*?<\/svg>/)[0];
    const finishes = [...rush.matchAll(/--ink-delay:(\d+)ms;--ink-duration:(\d+)ms/g)].map(([, delay, duration]) => Number(delay) + Number(duration));
    assert.equal(finishes.length, 4);
    assert.equal(Math.max(...finishes), 1120);
    assert.ok(Math.max(...finishes) < 1450);
    assert.match(heading, /data-ink="Sugar"/);
    const strings = heading.match(/<svg class="band-strings"[\s\S]*?<\/svg>/)[0];
    assert.equal([...strings.matchAll(/<path /g)].length, 6);
    assert.match(strings, /aria-hidden="true"/);
    const notes = [...heading.matchAll(/class="band-note"[^>]*--note-delay:(\d+)ms/g)];
    assert.equal(notes.length, 3);
    assert.ok(notes.every(([, delay]) => Number(delay) + 650 < 1450));
    const css = readFileSync(`${__dirname}/../style.css`, 'utf8');
    assert.ok(css.includes('[data-phase="type"] .ink-word[data-ink="Rush"] .ink-stroke'));
    assert.match(css, /\.ink-stroke \{ stroke-dasharray: 1; stroke-dashoffset: 0; \}/);
});

test('a configured opening time survives priming and repeated gallery entry', async () => {
    const app = setup(), video = app.projects[3].video;
    video.dataset.start = '0.1'; video.readyState = 1;
    app.fire(app.cards[3], 'click');
    assert.equal(video.currentTime, 0.1);
    await Promise.resolve();
    assert.equal(video.currentTime, 0.1);
    app.tick(3900);
    assert.equal(app.gallery.dataset.phase, 'video');
    app.fire(app.ids['gallery-back'], 'click'); app.tick(650);
    video.currentTime = 12;
    app.fire(app.cards[3], 'click'); await Promise.resolve();
    assert.equal(video.currentTime, 0.1);
});

test('barcode browses the list, follows selection, and switches the active project', () => {
    const app = setup();
    app.barcode[0].focus();
    app.fire(app.barcode[0], 'click');
    assert.equal(app.barcode[0].focused, true, 'Browsing the main list keeps the menu focus');
    assert.match(app.counter.textContent, /01 \/ 05/);
    assert.equal(app.barcode[0].attributes['aria-pressed'], 'true');
    assert.equal(app.gallery.dataset.phase, 'out');
    app.fire(app.cards[0], 'click'); app.tick(3100);
    app.barcode[4].focus();
    app.fire(app.barcode[4], 'click'); app.tick(3100);
    assert.equal(app.barcode[4].focused, true, 'An existing focus does not affect project switching');
    assert.equal(app.projects[0].hidden, true);
    assert.equal(app.projects[4].hidden, false);
    assert.equal(app.barcode[4].attributes['aria-pressed'], 'true');
});

test('the project menu is pointer-only on the main list and project details', () => {
    const app = setup();
    for (const button of app.barcode) {
        assert.equal(button.tabIndex, -1);
        assert.equal(app.fire(button, 'pointerdown').defaultPrevented, true, 'Clicking a barcode must not take keyboard focus');
    }
    const target = { closest: selector => selector === '.work-barcode' ? app.barcode[0] : null };
    for (const hidden of [false, true]) {
        app.gallery.hidden = hidden;
        const event = { key: ' ', target, preventDefault() { this.defaultPrevented = true; } };
        app.events.keydown(event);
        assert.equal(event.defaultPrevented, true);
        assert.equal(app.gallery.dataset.phase, 'out');
    }
    app.gallery.hidden = false;
    const enter = { key: 'Enter', target, preventDefault() { this.defaultPrevented = true; } };
    app.events.keydown(enter);
    assert.equal(enter.defaultPrevented, true, 'Enter cannot activate the pointer-only menu');
});

test('wheel lift reacts, settles, and cancels on entry or reduced motion', () => {
    const app = setup();
    app.fire(app.gallery, 'wheel', { deltaX: 0, deltaY: 90, deltaMode: 0 }); app.tick(32);
    assert.ok(parseFloat(app.gallery.style['--card-tilt']) < 0);
    assert.equal(app.gallery.classList.contains('wheel-motion'), true);
    app.tick(2500);
    assert.equal(app.gallery.style['--card-tilt'], '0deg');
    assert.equal(app.timers.size, 0);
    app.fire(app.gallery, 'wheel', { deltaX: 0, deltaY: -90, deltaMode: 0 }); app.tick(32);
    assert.ok(parseFloat(app.gallery.style['--card-tilt']) > 0);
    app.fire(app.cards[1], 'click');
    assert.equal(app.gallery.style['--card-tilt'], '0deg');
    const reduced = setup(true);
    reduced.fire(reduced.gallery, 'wheel', { deltaX: 0, deltaY: 90, deltaMode: 0 });
    reduced.tick(32);
    assert.equal(reduced.gallery.classList.contains('wheel-motion'), true);
    reduced.tick(2500);
    assert.equal(reduced.timers.size, 0);
});


test('barcode keeps vertical lines when a project is open', () => {
    const css = readFileSync(`${__dirname}/../style.css`, 'utf8');
    assert.ok(css.includes('width: 1px; height: var(--index-height, 14px)'));
    assert.doesNotMatch(css, /\.work-barcode[^{}]*data-open[^{}]*::before/);
});


test('returning from a hidden panel recalculates the gallery frame', () => {
    const app = setup();
    app.gallery.hidden = true;
    app.gallery.clientWidth = 0;
    app.windowEvents.resize();
    app.gallery.hidden = false;
    app.gallery.clientWidth = 1400;
    app.windowEvents.galleryResize();
    assert.equal(app.gallery.style['--strip-width'], '91px');
    assert.match(app.counter.textContent, /01 \/ 05/);
});


test('leaving Initial D resets portrait sizing before laying out the main thumbnails', () => {
    const app = setup();
    const homeWidth = app.cards[0].style['--preview-width'];
    app.fire(app.cards[4], 'click'); app.tick(4500);
    assert.equal(app.ids['gallery-cinema'].dataset.portrait, true);
    app.ids['gallery-cinema'].getBoundingClientRect = () => ({ width: 280 });
    app.nav.handlers.click();
    assert.equal(app.gallery.dataset.phase, 'out');
    assert.equal(app.ids['gallery-cinema'].dataset.portrait, 'false');
    assert.equal(app.cards[4].style['--preview-width'], homeWidth);
    app.fire(app.barcode[0], 'click', { detail: 0 });
    assert.equal(app.cards[0].style['--preview-width'], homeWidth);
    app.fire(app.cards[4], 'click'); app.tick(4500);
    app.fire(app.ids['gallery-back'], 'click'); app.tick(650);
    assert.equal(app.ids['gallery-cinema'].dataset.portrait, 'false');
    app.fire(app.barcode[0], 'click', { detail: 0 });
    assert.equal(app.cards[0].style['--preview-width'], homeWidth);
});

test('TOP scrolls back to the video without closing the current project', () => {
    const app = setup();
    let scroll;
    app.window.scrollTo = options => { scroll = options; };
    app.fire(app.cards[2], 'click'); app.tick(4500);
    const plays = app.projects[2].video.plays;
    app.fire(app.ids['back-to-top'], 'click');
    assert.equal(scroll.top, 0);
    assert.equal(scroll.behavior, 'smooth');
    assert.equal(app.gallery.dataset.phase, 'video');
    assert.equal(app.projects[2].hidden, false);
    assert.equal(app.projects[2].video.plays, plays);
    const html = readFileSync(`${__dirname}/../index.html`, 'utf8');
    assert.match(html, /<button type="button" class="footer-top" id="back-to-top">/);
});


test('Initial D camera aims inside the D counter instead of its left stem', () => {
    const app = setup();
    app.glyphs.push({ textContent: 'D', querySelector: () => null,
        getBoundingClientRect: () => ({ left: 650, top: 100, width: 100, height: 200 }) });
    app.fire(app.cards[4], 'click');
    app.tick(1300);
    assert.equal(app.gallery.dataset.phase, 'camera');
    assert.equal(app.ids['gallery-camera'].style['--camera-x'], `${(450 - 705) * 1.12}px`);
    assert.equal(app.ids['gallery-camera'].style['--camera-y'], `${(250 - 210) * 1.12}px`);
    app.tick(1100);
    assert.equal(app.projects[4].video.plays, 1);
});


test('software card opens its project view without borrowing a video or starting typography', () => {
    const app = setup();
    app.cards[4].dataset.kind = 'software';
    let opened = false;
    app.ids['gallery-details'].click = () => { opened = true; };
    app.fire(app.cards[4], 'click');
    assert.equal(opened, true);
    assert.equal(app.ids['gallery-details'].href, app.cards[4].hash);
    assert.equal(app.gallery.dataset.phase, 'out');
    assert.equal(app.projects[4].video.primes, 0);
    assert.equal(app.projects[4].media.parent, app.projects[4]);
});


test('software detail link reaches the shared view router instead of scrolling a video story', () => {
    const app = setup();
    app.cards[0].dataset.kind = 'software';
    const event = app.fire(app.ids['gallery-details'], 'click');
    assert.equal(event.defaultPrevented, undefined);
    assert.equal(app.gallery.dataset.phase, 'out');
});

test('Initial D can enter MMT and return through its detail arrow with typography and playback', () => {
    const app = setup(false, true);
    app.fire(app.cards[4], 'click'); app.tick(4500);
    app.fire(app.ids['gallery-next'], 'click');
    assert.equal(app.gallery.hidden, true);
    assert.equal(app.window.location.hash, '#project-mmt');
    assert.equal(app.projects[5].hidden, false);
    assert.equal(app.projects[4].media.parent, app.projects[4]);
    assert.equal(app.fire(app.pagination[4], 'click').defaultPrevented, true);
    assert.equal(app.gallery.hidden, false);
    assert.equal(app.projects[5].hidden, true);
    assert.equal(app.gallery.dataset.phase, 'type');
    assert.equal(app.gallery.dataset.cinematic, 'true');
    app.tick(4500);
    assert.equal(app.projects[4].hidden, false);
    assert.equal(app.projects[4].video.plays, 2);
    assert.equal(app.ids['gallery-next'].disabled, false);
});

test('barcode opens a film from MMT, while About and Contact still select a main card', () => {
    const app = setup(false, true);
    app.fire(app.cards[5], 'click');
    app.barcode[1].focus();
    app.fire(app.barcode[1], 'click');
    assert.equal(app.barcode[1].focused, true);
    assert.equal(app.gallery.hidden, false);
    assert.equal(app.projects[5].hidden, true);
    assert.equal(app.gallery.dataset.phase, 'type');
    app.tick(4500);
    assert.equal(app.projects[1].video.plays, 1);
    for (const hash of ['#about', '#contact']) {
        app.nav.click(); app.gallery.hidden = true; app.window.location.hash = hash;
        app.fire(app.barcode[0], 'click');
        assert.equal(app.gallery.hidden, false);
        assert.equal(app.gallery.dataset.phase, 'out');
    }
});

test('detail project arrows preserve modified clicks', () => {
    const app = setup(false, true);
    app.fire(app.cards[5], 'click');
    assert.equal(app.fire(app.pagination[4], 'click', { ctrlKey: true }).defaultPrevented, undefined);
    assert.equal(app.gallery.hidden, true);
    assert.equal(app.window.location.hash, '#project-mmt');
});

test('detail navigation follows card order automatically when a software project is added', () => {
    for (const withSoftware of [false, true]) {
        const app = setup(false, withSoftware);
        assert.equal(app.barcode.length, app.cards.length);
        assert.equal(app.ids['gallery-next'].disabled, false);
        app.fire(app.barcode[app.cards.length - 1], 'click', { detail: 0 });
        assert.equal(app.ids['gallery-next'].disabled, true);
        assert.equal(app.barcode.at(-1).attributes['aria-pressed'], 'true');
        app.projects.forEach((project, i) => {
            const links = project.children.find(child => child.className === 'project-pagination').children;
            const prev = links.find(link => link.className === 'project-step-prev');
            const next = links.find(link => link.className === 'project-step-next');
            assert.equal(prev?.hash, app.cards[i - 1]?.hash);
            assert.equal(next?.hash, app.cards[i + 1]?.hash);
            if (prev) assert.equal(prev.attributes['aria-label'], 'Previous project');
            if (next) assert.equal(next.attributes['aria-label'], 'Next project');
        });
    }
});

test('dragging during typography, camera, playback, and closing does not browse or close the project', () => {
    const app = setup();
    app.fire(app.cards[1], 'click');
    for (const delay of [0, 1450, 1100]) {
        app.tick(delay);
        const phase = app.gallery.dataset.phase;
        const counter = app.counter.textContent;
        app.fire(app.gallery, 'pointerdown', { clientX: 100, pointerId: 1 });
        app.fire(app.gallery, 'pointermove', { clientX: -500, pointerId: 1 });
        app.fire(app.gallery, 'pointerup');
        assert.equal(app.gallery.dataset.phase, phase);
        assert.equal(app.counter.textContent, counter);
        assert.equal(app.projects[1].media.parent, app.ids['gallery-cinema']);
    }
    app.fire(app.ids['gallery-back'], 'click');
    app.fire(app.gallery, 'pointerdown', { clientX: 100, pointerId: 1 });
    app.fire(app.gallery, 'pointermove', { clientX: -500, pointerId: 1 });
    assert.equal(app.gallery.dataset.phase, 'closing');
    app.tick(650);
    assert.equal(app.cards[1].classList.contains('is-current'), true);
});

test('opening a project cancels any pending main drag, and hidden detail views cannot start one', () => {
    const app = setup(false, true);
    app.fire(app.gallery, 'pointerdown', { clientX: 100, pointerId: 1 });
    app.fire(app.cards[1], 'click'); app.tick(4500);
    app.fire(app.gallery, 'pointermove', { clientX: -500, pointerId: 1 });
    assert.equal(app.gallery.dataset.phase, 'video');
    app.fire(app.cards[5], 'click');
    const counter = app.counter.textContent;
    app.fire(app.gallery, 'pointerdown', { clientX: 100, pointerId: 2 });
    app.fire(app.gallery, 'pointermove', { clientX: -500, pointerId: 2 });
    assert.equal(app.counter.textContent, counter);
    assert.equal(app.window.location.hash, '#project-mmt');
});

test('direct project links and browser history keep the barcode selection in sync', () => {
    const app = setup(false, true, '#project-mmt');
    assert.equal(app.barcode[5].attributes['aria-pressed'], 'true');
    assert.equal(app.ids['gallery-next'].disabled, true);
    app.window.location.hash = '#project-05';
    app.windowEvents.popstate();
    assert.equal(app.barcode[4].attributes['aria-pressed'], 'true');
    app.window.location.hash = '#project-01';
    app.windowEvents.hashchange();
    assert.equal(app.barcode[0].attributes['aria-pressed'], 'true');
    assert.equal(app.ids['gallery-prev'].disabled, true);
});
