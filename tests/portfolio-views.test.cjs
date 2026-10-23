const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { runInNewContext } = require('node:vm');
const { test } = require('node:test');
const source = readFileSync(`${__dirname}/../script.js`, 'utf8');
const init = source.match(/function initPortfolioViews\(\) \{[\s\S]*?(?=\n    function initScrollVideos)/)[0];

function setup(hash = '', { entryPlay = () => Promise.resolve(), hidden = false } = {}) {
    function element(id, classes = []) {
        const names = new Set(classes);
        return {
            id, hash: `#${id}`, hidden: false, attributes: {}, focused: false,
            classList: { add: name => names.add(name), contains: name => names.has(name), toggle(name, value) { value ? names.add(name) : names.delete(name); } },
            setAttribute(name, value) { this.attributes[name] = value; },
            removeAttribute(name) { delete this.attributes[name]; },
            focus() { this.focused = true; },
            querySelector(selector) { return this.matches?.[selector] || (selector.startsWith('video[') ? null : this.heading); },
        };
    }
    const panels = ['project-01', 'project-02', 'about', 'contact', 'project-mmt'].map(id => {
        const panel = element(id, id.startsWith('project') ? ['project'] : []);
        panel.heading = element(`${id}-title`);
        panel.heading.textContent = id;
        return panel;
    });
    const elements = Object.fromEntries(['view-toolbar', 'hero', 'view-label', 'gallery', 'caption'].map(id => [id, element(id)]));
    const links = ['work', 'about', 'contact'].map(id => element(id));
    const body = element('body');
    const events = {}, windowEvents = {};
    const video = { paused: 0, pause() { this.paused++; } };
    const entryVideo = {
        dataset: { src: 'assets/mmt/portfolio-film.mp4' }, plays: 0, paused: true,
        play() { this.plays++; this.paused = false; return entryPlay(); },
        pause() { this.paused = true; },
        closest() { return null; },
    };
    panels[4].matches = { 'video[data-play-on-entry]': entryVideo };
    const window = {
        location: { hash }, history: { pushState(state, title, value) { window.location.hash = value; } },
        addEventListener(name, callback) { windowEvents[name] = callback; }, scrollTo() {},
    };
    const document = {
        body, hidden, getElementById: id => elements[id],
        querySelector: selector => selector === '.work-index' ? elements.gallery : elements.caption,
        querySelectorAll: selector => selector === '.project, #about, #contact' ? panels : selector === '.nav-link' ? links : [video, entryVideo],
        addEventListener(name, callback) { events[name] = callback; },
    };
    runInNewContext(`${init}; initPortfolioViews();`, { document, window });
    function click(link, options = {}) {
        let prevented = false;
        events.click({ target: { closest: () => link }, button: 0, preventDefault() { prevented = true; }, ...options });
        return prevented;
    }
    return { panels, elements, body, links, video, entryVideo, window, windowEvents, events, element, click };
}

test('entry playback loads only the active project, pauses on exit and starts again on re-entry', () => {
    const app = setup();
    assert.equal(app.entryVideo.src, undefined);
    assert.equal(app.entryVideo.plays, 0);
    app.click(app.element('project-mmt'));
    assert.equal(app.entryVideo.src, 'assets/mmt/portfolio-film.mp4');
    assert.equal(app.entryVideo.dataset.src, undefined);
    assert.equal(app.entryVideo.plays, 1);
    app.click(app.links[1]);
    assert.equal(app.entryVideo.paused, true);
    assert.equal(app.entryVideo.plays, 1);
    app.click(app.element('project-mmt'));
    assert.equal(app.entryVideo.plays, 2);
});

test('entry playback handles direct links, background tabs and blocked autoplay', async () => {
    assert.equal(setup('#project-mmt').entryVideo.plays, 1);
    const background = setup('#project-mmt', { hidden: true });
    assert.equal(background.entryVideo.plays, 0);
    assert.equal(background.entryVideo.src, undefined);
    const blocked = setup('#project-mmt', { entryPlay: () => Promise.reject(new Error('NotAllowedError')) });
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(blocked.panels[4].hidden, false);
    assert.equal(blocked.entryVideo.plays, 1);
});

test('Project details opens one view, pauses media, and returns keyboard focus to the work', () => {
    const app = setup();
    assert.ok(app.panels.every(panel => panel.hidden));
    assert.equal(app.elements.gallery.hidden, false);
    const card = app.element('project-02', ['work-preview']);
    app.elements.gallery.matches = { '.work-preview[href="#project-02"]': card };
    const details = app.element('project-02', ['gallery-details']);
    assert.equal(app.click(details), true);
    assert.equal(app.window.location.hash, '#project-02');
    assert.equal(app.panels[1].hidden, false);
    assert.equal(app.panels.filter(panel => !panel.hidden).length, 1);
    assert.equal(app.panels[1].heading.focused, true);
    assert.equal(app.elements.gallery.hidden, true);
    assert.equal(app.links[0].attributes['aria-current'], 'page');
    assert.equal(app.video.paused, 2);
    app.click(app.links[0]);
    assert.equal(card.focused, true);
    assert.equal(card.attributes.tabindex, undefined);
    assert.equal(app.elements.gallery.hidden, false);
});

test('direct links, history, and About/Contact use the same view state', () => {
    const app = setup('#project-01');
    assert.equal(app.panels[0].hidden, false);
    app.click(app.links[1]);
    assert.equal(app.panels[2].hidden, false);
    assert.equal(app.links[1].attributes['aria-current'], 'page');
    app.window.location.hash = '#contact';
    app.windowEvents.popstate();
    assert.equal(app.panels[3].hidden, false);
    app.window.location.hash = '#work';
    app.windowEvents.hashchange();
    assert.ok(app.panels.every(panel => panel.hidden));
    assert.equal(app.elements['view-toolbar'].hidden, true);
});

test('Escape leaves a detail but preserves the lightbox and modified link clicks', () => {
    const app = setup('#project-01');
    assert.equal(app.click(app.links[1], { ctrlKey: true }), false);
    assert.equal(app.window.location.hash, '#project-01');
    app.events.keydown({ key: 'Escape', defaultPrevented: true });
    assert.equal(app.window.location.hash, '#project-01');
    app.body.classList.add('lightbox-open');
    app.events.keydown({ key: 'Escape' });
    assert.equal(app.window.location.hash, '#project-01');
    app.body.classList.toggle('lightbox-open', false);
    app.events.keydown({ key: 'Escape' });
    assert.equal(app.window.location.hash, '#work');
    assert.ok(app.panels.every(panel => panel.hidden));
});

test('pointer selection reveals the typographic title; keyboard and history remain immediate', () => {
    const app = setup();
    const card = app.element('project-01', ['work-preview']);
    app.click(card, { detail: 1 });
    assert.equal(app.panels[0].classList.contains('type-entry'), true);
    app.click(app.element('project-02'), { detail: 0 });
    assert.equal(app.panels[1].classList.contains('type-entry'), false);
    assert.equal(app.panels[0].classList.contains('type-entry'), false);
    app.window.location.hash = '#project-01';
    app.windowEvents.popstate();
    assert.equal(app.panels[0].classList.contains('type-entry'), false);
});

test('every project has an accessible display title and motion leaves a readable static fallback', () => {
    const html = readFileSync(`${__dirname}/../index.html`, 'utf8');
    const css = readFileSync(`${__dirname}/../style.css`, 'utf8');
    const projects = [...html.matchAll(/<article class="project"[\s\S]*?<\/article>/g)];
    assert.equal(projects.length, 5);
    projects.forEach(([project]) => {
        assert.match(project, /<h2 class="project-display-title" aria-label="[^"]+">/);
        assert.match(project, /class="project-display-glyph(?: [^"]*)?"/);
    });
    assert.match(css, /@media \(prefers-reduced-motion: no-preference\)\s*\{\s*\.type-entry \.project-display-glyph/);
    assert.match(css, /\.project-display-glyph\s*\{ display: inline-block; \}/);
});
