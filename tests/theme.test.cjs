const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { runInNewContext } = require('node:vm');
const { test } = require('node:test');

const source = readFileSync(`${__dirname}/../theme.js`, 'utf8');

function luminance(hex) {
    return hex.match(/[a-f\d]{2}/gi).map(value => {
        const channel = parseInt(value, 16) / 255;
        return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
    }).reduce((total, value, index) => total + value * [0.2126, 0.7152, 0.0722][index], 0);
}

function setup(saved, dark = false, storageBlocked = false) {
    const root = { dataset: {} };
    const themeName = {};
    const button = {
        setAttribute(name, value) { this[name] = value; },
        querySelector: () => themeName,
        addEventListener(name, callback) { this[name] = callback; },
    };
    const metadata = {};
    const events = {};
    const stored = {};
    let ready = false;
    const media = { matches: dark, addEventListener(name, callback) { this[name] = callback; } };
    runInNewContext(source, {
        window: { matchMedia: () => media },
        localStorage: {
            getItem() { if (storageBlocked) throw new Error('Storage blocked'); return saved; },
            setItem(key, value) { if (storageBlocked) throw new Error('Storage blocked'); stored[key] = value; },
        },
        document: {
            documentElement: root,
            getElementById: () => ready ? button : null,
            querySelector: () => ready ? metadata : null,
            addEventListener: (name, callback) => { events[name] = callback; },
        },
    });
    const initialTheme = root.dataset.theme;
    ready = true;
    events.DOMContentLoaded();
    return { root, initialTheme, button, metadata, media, stored, themeName };
}

test('theme is applied before the page loads and initially follows the device', () => {
    const html = readFileSync(`${__dirname}/../index.html`, 'utf8');
    const themeIndex = html.search(/src="theme\.js(?:\?[^"]*)?"/);
    const styleIndex = html.search(/href="style\.css(?:\?[^"]*)?"/);
    assert.ok(themeIndex >= 0 && styleIndex > themeIndex);
    assert.match(html, /id="theme-toggle"/);
    const page = setup(null, true);
    assert.equal(page.initialTheme, 'dark');
    assert.equal(page.themeName.textContent, 'Light');
    page.media.matches = false;
    page.media.change();
    assert.equal(page.root.dataset.theme, 'light');
    assert.equal(page.metadata.content, '#f7f7f5');
});

test('manual and saved choices override the system preference', () => {
    const page = setup('light', true);
    assert.equal(page.initialTheme, 'light');
    page.button.click();
    assert.equal(page.root.dataset.theme, 'dark');
    assert.equal(page.stored['portfolio-theme'], 'dark');
    assert.equal(page.button['aria-label'], 'Switch to light theme');
    page.media.matches = false;
    page.media.change();
    assert.equal(page.root.dataset.theme, 'dark');
});

test('invalid preferences and blocked storage do not break theme switching', () => {
    assert.equal(setup('invalid', false).initialTheme, 'light');
    const page = setup(null, false, true);
    page.button.click();
    assert.equal(page.root.dataset.theme, 'dark');
});

test('both themes keep normal text above 4.5:1 contrast', () => {
    const css = readFileSync(`${__dirname}/../style.css`, 'utf8');
    const palettes = [css.match(/:root \{([\s\S]*?)\}/)[1], css.match(/:root\[data-theme="light"\] \{([\s\S]*?)\}/)[1]];
    for (const palette of palettes) {
        const values = Object.fromEntries([...palette.matchAll(/--([\w-]+): (#[a-f\d]{6});/gi)].map(([, key, value]) => [key, luminance(value)]));
        for (const text of ['text-primary', 'text-secondary', 'text-muted']) {
            for (const background of ['bg-primary', 'bg-secondary']) {
                const ratio = (Math.max(values[text], values[background]) + 0.05) / (Math.min(values[text], values[background]) + 0.05);
                assert.ok(ratio >= 4.5, `${text} on ${background}: ${ratio.toFixed(2)}`);
            }
        }
    }
});

test('every project palette keeps titles, accents and supporting text readable in both themes', () => {
    const css = readFileSync(`${__dirname}/../style.css`, 'utf8');
    const chapters = [...css.matchAll(/\.gallery-home\.gallery-expanded\[data-gallery-project="(\d)"\] \{([^}]+)\}/g)];
    assert.equal(chapters.length, 5);
    for (const [, chapter, declarations] of chapters) {
        const values = Object.fromEntries([...declarations.matchAll(/--([\w-]+): (#[a-f\d]{6});/gi)].map(([, key, value]) => [key, luminance(value)]));
        for (const mode of ['light', 'dark']) {
            const background = values[`gallery-${mode}`];
            const colors = [values[`title-${mode}`], values[`accent-${mode}`], luminance(mode === 'light' ? '#41413d' : '#deded8')];
            colors.forEach(color => {
                const ratio = (Math.max(color, background) + 0.05) / (Math.min(color, background) + 0.05);
                assert.ok(ratio >= 4.5, `Project ${chapter}, ${mode}: ${ratio.toFixed(2)} contrast`);
            });
        }
    }
});
