const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { runInNewContext } = require('node:vm');
const { test } = require('node:test');

const source = readFileSync(`${__dirname}/../script.js`, 'utf8');

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

test('player shortcuts leave focused controls alone and use five-second seeking', () => {
    const body = source.match(/playerContainer.addEventListener\('keydown', \(e\) => \{([\s\S]*?)\n            \}\);/)[1];
    let handler;
    let plays = 0;
    const playerContainer = {};
    const context = {
        playerContainer,
        video: { duration: NaN, currentTime: 8 },
        togglePlay() { plays++; },
        frameStepMode: false, clearTimeout() {}, seekingTimeout: null,
        bigPlayBtn: { classList: { add() {} } },
        updateProgress() {}, showControls() {},
        register(callback) { handler = callback; },
    };
    runInNewContext(`register(e => {${body}})`, context);
    const event = { target: {}, key: ' ', preventDefault() {} };
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
    assert.equal(context.video.currentTime, 13);
    for (const modifier of ['altKey', 'ctrlKey', 'metaKey']) {
        handler({ ...event, [modifier]: true, preventDefault() { assert.fail('Browser shortcut was captured'); } });
        assert.equal(context.video.currentTime, 13);
    }
});
