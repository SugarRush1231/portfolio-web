const assert = require('node:assert/strict');
const {readFileSync} = require('node:fs');
const {runInNewContext} = require('node:vm');
const {test} = require('node:test');
const source = readFileSync(`${__dirname}/../mmt-release.js`, 'utf8');
const releases = 'https://github.com/SugarRush1231/Multi_Media_Toolkit/releases';
function release(version) {
    return {tag_name:version, assets:[{name:`MMT_Setup_${version}.exe`, browser_download_url:`${releases}/download/${version}/MMT_Setup_${version}.exe`}]};
}
function setup(fetcher) {
    const labels = [{textContent:'v1.4.0'}, {textContent:'v1.4.0'}];
    const download = {href:release('v1.4.0').assets[0].browser_download_url};
    const events = {}, messages = [];
    const preview = {contentWindow:{postMessage:(...args)=>messages.push(args)}, addEventListener:(name,callback)=>{events[name]=callback;}};
    let now = 1000000, requests = 0, abort;
    runInNewContext(source, {
        document:{querySelector:selector=>selector === '[data-mmt-download]' ? download : selector === '[data-mmt-version]' ? labels[0] : preview, querySelectorAll:()=>labels},
        window:{addEventListener:(name,callback)=>{events[name]=callback;}},
        location:{protocol:'file:',origin:'null'},
        fetch:async (...args)=>{requests++; return fetcher(...args);},
        Date:{now:()=>now}, AbortController,
        setTimeout:callback=>{abort=callback; return 1;}, clearTimeout:()=>{}
    });
    return {labels, download, events, messages, requests:()=>requests, advance:()=>{now+=600001;}, abort:()=>abort()};
}
const settle = () => new Promise(resolve=>setImmediate(resolve));

test('latest installer and every visible version stay in sync, including an iframe loaded later', async () => {
    const app = setup(async () => ({ok:true, json:async()=>release('v1.5.2')}));
    await settle();
    assert.equal(app.download.href, `${releases}/download/v1.5.2/MMT_Setup_v1.5.2.exe`);
    app.labels.forEach(label=>assert.equal(label.textContent,'v1.5.2'));
    app.events.load();
    assert.equal(app.messages.at(-1)[0].version, 'v1.5.2');
    app.events.focus(); app.events.pageshow();
    assert.equal(app.requests(), 1, 'Repeated focus must not consume GitHub rate limits');
    app.advance(); app.events.focus(); await settle();
    assert.equal(app.requests(), 2, 'An open tab checks again after the refresh interval');
});

test('unavailable, incomplete or untrusted releases preserve the known installer', async () => {
    const foreign = release('v1.5.2'); foreign.assets[0].browser_download_url = 'https://example.com/installer.exe';
    for (const response of [
        {ok:false},
        {ok:true, json:async()=>null},
        {ok:true, json:async()=>({...release('v1.5.2'), prerelease:true})},
        {ok:true, json:async()=>({...release('v1.5.2'), draft:true})},
        {ok:true, json:async()=>({...release('v1.5.2'), assets:[]})},
        {ok:true, json:async()=>release('v1.5.2/../bad')},
        {ok:true, json:async()=>foreign},
        {ok:true, json:async()=>{throw Error('invalid JSON');}}
    ]) {
        const app = setup(async()=>response); await settle();
        assert.equal(app.download.href, release('v1.4.0').assets[0].browser_download_url);
        app.labels.forEach(label=>assert.equal(label.textContent,'v1.4.0'));
    }
    const app = setup(async()=>{throw Error('offline');}); await settle();
    assert.equal(app.labels[0].textContent, 'v1.4.0');
});

test('a hung request times out, remains single-flight and can be checked later', async () => {
    const app = setup((url, options)=>new Promise((resolve,reject)=>options.signal.addEventListener('abort',()=>reject(Error('aborted')))));
    app.events.focus(); assert.equal(app.requests(),1);
    app.abort(); await settle();
    assert.equal(app.labels[0].textContent,'v1.4.0');
    app.advance(); app.events.focus(); assert.equal(app.requests(),2);
    app.abort(); await settle();
});
