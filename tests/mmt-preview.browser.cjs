const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const http = require('node:http');
const {pathToFileURL} = require('node:url');
const {once} = require('node:events');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || path.join(os.homedir(), '.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
const root = path.resolve(__dirname, '..');
const output = path.join(root, 'analysis/site-audit/mmt-interactive');
const mime = {'.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.svg':'image/svg+xml', '.png':'image/png', '.otf':'font/otf', '.woff2':'font/woff2', '.jpg':'image/jpeg'};

async function main() {
    fs.mkdirSync(output, {recursive:true});
    const server = http.createServer((request, response) => {
        const file = path.resolve(root, '.' + decodeURIComponent(new URL(request.url, 'http://localhost').pathname));
        if (!file.startsWith(root + path.sep)) {response.writeHead(403); return response.end();}
        if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {response.writeHead(404); return response.end();}
        response.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
        fs.createReadStream(file).pipe(response);
    });
    server.listen(0, '127.0.0.1'); await once(server, 'listening');
    const base = 'http://127.0.0.1:' + server.address().port;
    const browser = await chromium.launch({channel:'msedge', headless:true});
    const page = await browser.newPage({viewport:{width:1440, height:1100}});
    const errors = [], unexpectedRequests = [];
    const releaseApi = 'https://api.github.com/repos/SugarRush1231/Multi_Media_Toolkit/releases/latest';
    const releases = 'https://github.com/SugarRush1231/Multi_Media_Toolkit/releases';
    page.on('pageerror', error => errors.push(error.message));
    await page.route('**/*', route => {
        const url = route.request().url();
        if (url === releaseApi && route.request().frame() === page.mainFrame()) return route.fulfill({json:{tag_name:'v1.4.0', assets:[{name:'MMT_Setup_v1.4.0.exe', browser_download_url:releases + '/download/v1.4.0/MMT_Setup_v1.4.0.exe'}]}, headers:{'Access-Control-Allow-Origin':'*'}});
        if (url.startsWith(base + '/') || url.startsWith('file:') || url.startsWith('data:')) return route.continue();
        // The existing portfolio has analytics and Google Fonts; the app preview must not contact any service.
        if (route.request().frame().url().includes('/preview/')) unexpectedRequests.push(url);
        return route.abort();
    });
    try {
        for (const address of [base + '/index.html#project-mmt', pathToFileURL(path.join(root, 'index.html')).href + '#project-mmt']) {
            await page.goto(address, {waitUntil:'load'});
            const iframe = page.locator('#project-mmt iframe'); await iframe.scrollIntoViewIfNeeded();
            const app = page.frameLocator('#project-mmt iframe');
            await app.getByRole('heading', {name:'AI 자막 · 번역', exact:true}).waitFor();
            assert.equal(await page.locator('[data-mmt-download]').getAttribute('href'), releases + '/download/v1.4.0/MMT_Setup_v1.4.0.exe');
            assert.equal(await page.locator('#project-mmt a[href$="/releases/latest"]').count(), 0, 'Only the installer button is shown, not a GitHub release-page link');
            assert.match(await page.locator('#mmt-preview-caption').innerText(), /실제 앱과 일부 다를 수 있습니다/);
            assert(await app.locator('body').evaluate(async () => {await document.fonts.load('700 24px "MMT Brand"'); return document.fonts.check('700 24px "MMT Brand"');}), 'Native brand font loads inside the sandbox');
            assert.equal(await app.getByRole('button', {name:'AI 자막 · 번역', exact:true}).getAttribute('aria-current'), 'page');
            await app.getByLabel('번역 언어', {exact:true}).selectOption({label:'한국어'});
            await app.getByRole('button', {name:'파일 선택', exact:true}).click();
            await app.getByRole('button', {name:'sample-video.mp4', exact:true}).click();
            assert(await app.locator('[data-source-path]').innerText() === 'sample-video.mp4');
            await app.getByRole('button', {name:'자막 생성', exact:true}).click();
            assert(await app.getByRole('dialog').isHidden(), 'Processing buttons do not interrupt browsing with notices');
            await app.getByRole('button', {name:'Pr/AE 코덱 해결', exact:true}).click();
            await app.getByRole('heading', {name:'Pr/AE 코덱 해결', exact:true}).waitFor();
            await app.getByRole('button', {name:'코덱 문제 해결 시작', exact:true}).click();
            assert(await app.getByRole('dialog').isHidden());
            await app.getByRole('button', {name:'포맷 변환기', exact:true}).click();
            await app.getByLabel('출력 포맷').selectOption({label:'PNG Sequence'});
            await app.getByRole('button', {name:'오디오 변환기', exact:true}).click();
            await app.getByLabel('출력 포맷').selectOption({label:'FLAC'});
            await app.getByRole('button', {name:'AI 자막 · 번역', exact:true}).click();
            assert.equal(await app.getByLabel('번역 언어', {exact:true}).inputValue(), '한국어');
            assert.equal(await app.locator('[data-source-path]').innerText(), 'sample-video.mp4');
            await app.getByRole('button', {name:'모델 관리', exact:true}).click();
            assert.match(await app.locator('#dialog-content').innerText(), /Whisper/);
            await app.getByRole('button', {name:'Whisper 삭제', exact:true}).click();
            assert.equal(await app.locator('#dialog-title').innerText(), '모델 관리', 'Model actions do not replace the dialog with a notice');
            await app.getByRole('button', {name:'닫기', exact:true}).click();
            assert(await app.getByRole('button', {name:'모델 관리', exact:true}).evaluate(node=>node===document.activeElement), 'Closing the dialog restores focus to the original control');
            await app.getByRole('button', {name:'노래 자막 생성', exact:true}).click();
            await app.getByRole('textbox', {name:'가사', exact:true}).fill('가사 화면을 직접 확인합니다.');
            await app.getByRole('button', {name:'영상 다운로드', exact:true}).click();
            assert(await app.getByRole('button', {name:'영상 확인', exact:true}).isDisabled());
            await app.locator('[name=video-url]').fill('https://example.com/preview');
            assert(await app.getByRole('button', {name:'영상 확인', exact:true}).isEnabled());
            await app.getByLabel('자막도 함께 다운로드', {exact:true}).check();
            assert(await app.getByLabel('다운로드 자막 언어').isVisible());
            await app.getByRole('button', {name:'영상 확인', exact:true}).click();
            assert(await app.getByRole('dialog').isHidden());
            await app.getByRole('button', {name:'설정', exact:true}).click();
            await app.getByLabel('파일명 규칙', {exact:true}).selectOption({label:'직접 입력'});
            assert(await app.getByLabel('사용자 파일명', {exact:true}).isEnabled());
            await app.getByRole('switch', {name:'사이트별 직접 폴더 지정', exact:true}).check();
            assert(await app.getByLabel('사이트 저장 위치', {exact:true}).isVisible());
            await app.getByRole('switch', {name:'위젯 모드', exact:true}).click();
            assert(await app.locator('#widget-preview').isVisible());
            assert.deepEqual(await app.locator('#widget-preview').evaluate(node => ({width:node.offsetWidth, height:node.offsetHeight, radius:getComputedStyle(node).borderRadius, background:getComputedStyle(node).backgroundColor, image:node.querySelector('img').getAttribute('src')})), {width:64, height:64, radius:'50%', background:'rgb(255, 255, 255)', image:'widget-download.png'});
            await app.getByRole('button', {name:'현재 브라우저 영상 다운로드', exact:true}).click();
            assert(await app.getByRole('dialog').isHidden(), 'The round widget does not show an explanatory modal');
            if (address.startsWith('http:')) await iframe.screenshot({path:path.join(output, 'widget.png')});
            await app.getByRole('button', {name:'현재 브라우저 영상 다운로드', exact:true}).press('Escape');
            assert(await app.locator('#widget-preview').isHidden());
            assert.equal(new URL(page.url()).hash, '#project-mmt', 'App interactions cannot navigate the portfolio');
            assert(await app.locator('body').evaluate(node=>!node.dispatchEvent(new MouseEvent('contextmenu', {bubbles:true,cancelable:true}))), 'Portfolio save-menu restriction applies inside the preview');
            assert(await app.locator('body').evaluate(node=>!node.dispatchEvent(new KeyboardEvent('keydown', {key:'s',ctrlKey:true,bubbles:true,cancelable:true}))), 'Page-save shortcut stays blocked');
            await app.getByRole('button', {name:'AI 자막 · 번역', exact:true}).click();
            if (address.startsWith('http:')) {
                await page.emulateMedia({reducedMotion:'reduce'});
                await iframe.screenshot({path:path.join(output, 'desktop.png')});
                await page.screenshot({path:path.join(output, 'portfolio.png'), fullPage:false});
                for (const width of [1024, 768, 390]) {
                    await page.setViewportSize({width, height:900});
                    await iframe.scrollIntoViewIfNeeded();
                    const overflow = await app.locator('body').evaluate(body => body.scrollWidth > body.clientWidth);
                    assert(!overflow, 'No iframe overflow at ' + width);
                    assert(await app.locator('#workspace').evaluate(node=>node.scrollWidth<=node.clientWidth), 'App controls fit at ' + width);
                    await iframe.screenshot({path:path.join(output, 'width-' + width + '.png')});
                }
                await page.setViewportSize({width:1440, height:1100});
            }
            // A new release updates the download and the already loaded or lazily created app labels.
            await page.route(releaseApi, route => route.fulfill({json:{tag_name:'v1.5.2', assets:[{name:'MMT_Setup_v1.5.2.exe', browser_download_url:releases + '/download/v1.5.2/MMT_Setup_v1.5.2.exe'}]}, headers:{'Access-Control-Allow-Origin':'*'}}));
            await page.reload({waitUntil:'load'});
            await iframe.scrollIntoViewIfNeeded();
            await page.waitForFunction(() => document.querySelector('[data-mmt-download]').href.endsWith('/v1.5.2/MMT_Setup_v1.5.2.exe'));
            await app.locator('.titlebar [data-mmt-version]').filter({hasText:'v1.5.2'}).waitFor();
            await app.getByRole('button', {name:'설정', exact:true}).click();
            assert.equal(await app.locator('#workspace [data-mmt-version]').innerText(), 'v1.5.2');
            await app.locator('body').evaluate(() => window.postMessage({type:'mmt-release', version:'v9.9.9'}, '*'));
            assert.equal(await app.locator('.titlebar [data-mmt-version]').innerText(), 'v1.5.2', 'Messages from other sources are ignored');
            await page.unroute(releaseApi);
        }
        assert.deepEqual(unexpectedRequests, []);
        assert.deepEqual(errors, []);
        fs.writeFileSync(path.join(output, 'checks.json'), JSON.stringify({pass:true, protocols:['http','file'], menus:7, sizes:[1440,1024,768,390], statePreserved:true, processingDisabled:true, repeatedNotices:false, roundWidget:true, automaticRelease:true, previewNetworkRequests:0}, null, 2));
        console.log('MMT: all 7 menus, state retention, no repeated notices, round widget, automatic releases, responsive sizes, isolated network and file:// passed.');
    } catch(error) {
        await page.screenshot({path:path.join(output, 'failure.png'), fullPage:true}).catch(()=>{});
        throw error;
    } finally { await browser.close(); server.closeAllConnections(); await new Promise(resolve=>server.close(resolve)); }
}
main().catch(error => {console.error(error); process.exitCode=1;});
