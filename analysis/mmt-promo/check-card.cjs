const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const {once} = require('node:events');
const {chromium} = require('C:/Users/kbs31/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

(async () => {
    const root = process.cwd();
    const server = http.createServer((req,res) => {
        const file = path.join(root, decodeURIComponent(new URL(req.url,'http://localhost').pathname));
        if (!fs.existsSync(file) || !fs.statSync(file).isFile()) {res.writeHead(404); return res.end();}
        res.setHeader('Content-Type', ({'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg'})[path.extname(file)] || 'application/octet-stream');
        fs.createReadStream(file).pipe(res);
    });
    server.listen(0,'127.0.0.1'); await once(server,'listening');
    const base = 'http://127.0.0.1:' + server.address().port;
    const browser = await chromium.launch({channel:'msedge',headless:true});
    try {
        const page = await browser.newPage({viewport:{width:1440,height:1000}, reducedMotion:'reduce'});
        const errors = []; page.on('pageerror',error=>errors.push(error.message));
        await page.route('**/*',route=>/^(file:|data:)/.test(route.request().url()) || route.request().url().startsWith(base) ? route.continue() : route.abort());
        for (const [name,url] of [['http',base+'/index.html#work'],['file','file:///E:/AI/portfolio-web/index.html#work']]) {
            await page.goto(url,{waitUntil:'load'});
            await page.getByRole('button',{name:'View MMT',exact:true}).press('Enter');
            const image = page.locator('a[href="#project-mmt"] > img');
            await image.evaluate(img=>img.decode());
            const state = await image.evaluate(img=>({width:img.naturalWidth,height:img.naturalHeight,selected:img.parentElement.classList.contains('is-current'),source:img.getAttribute('src')}));
            if (!state.selected || state.width !== 1200) throw Error('MMT thumbnail not ready');
            await page.locator('.work-index').screenshot({path:path.join(__dirname,'card-'+name+'.png')});
            console.log(name,state);
        }
        if (errors.length) throw Error(errors.join('\n'));
    } finally {
        await browser.close(); server.closeAllConnections(); await new Promise(resolve=>server.close(resolve));
    }
})().catch(error=>{console.error(error);process.exitCode=1;});
