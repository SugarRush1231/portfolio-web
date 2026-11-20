#!/usr/bin/env node
// 로컬 확인용 정적 서버. Netlify _redirects의 200 규칙(/video, /software → index.html)을 흉내 냅니다.
// 사용: node tools/serve.cjs [port]   (기본 8888)
'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const port = Number(process.argv[2] || process.env.PORT || 8888);
const types = {
    '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
    '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
    '.gif': 'image/gif', '.ico': 'image/x-icon', '.webp': 'image/webp', '.mp4': 'video/mp4', '.webm': 'video/webm',
    '.mov': 'video/quicktime', '.mp3': 'audio/mpeg', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.otf': 'font/otf',
    '.wasm': 'application/wasm', '.txt': 'text/plain; charset=utf-8', '.md': 'text/plain; charset=utf-8',
};

function rewrites() {
    try {
        return fs.readFileSync(path.join(root, '_redirects'), 'utf8').split(/\r?\n/)
            .map(line => line.trim()).filter(line => line && !line.startsWith('#'))
            .map(line => line.split(/\s+/)).filter(([, , status]) => status && status.startsWith('200'))
            .map(([from, to]) => ({ from: from.replace(/\/+$/, ''), to }));
    } catch (_) {
        return [];
    }
}

http.createServer((req, res) => {
    let pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const rule = rewrites().find(({ from }) => pathname.replace(/\/+$/, '') === from);
    if (rule) pathname = rule.to;
    if (pathname.endsWith('/')) pathname += 'index.html';
    const file = path.join(root, pathname);
    if (!file.startsWith(root + path.sep)) { res.writeHead(403).end(); return; }
    fs.stat(file, (error, stat) => {
        if (error || !stat.isFile()) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('404 Not Found'); return; }
        const headers = { 'Content-Type': types[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Accept-Ranges': 'bytes', 'Cache-Control': 'no-cache' };
        const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
        if (range && (range[1] || range[2])) {
            const start = range[1] ? Number(range[1]) : Math.max(0, stat.size - Number(range[2]));
            const end = range[1] && range[2] ? Math.min(Number(range[2]), stat.size - 1) : stat.size - 1;
            if (start >= stat.size || start > end) { res.writeHead(416, { 'Content-Range': `bytes */${stat.size}` }).end(); return; }
            res.writeHead(206, { ...headers, 'Content-Range': `bytes ${start}-${end}/${stat.size}`, 'Content-Length': end - start + 1 });
            if (req.method === 'HEAD') { res.end(); return; }
            fs.createReadStream(file, { start, end }).pipe(res);
            return;
        }
        res.writeHead(200, { ...headers, 'Content-Length': stat.size });
        if (req.method === 'HEAD') { res.end(); return; }
        fs.createReadStream(file).pipe(res);
    });
}).listen(port, '127.0.0.1', () => {
    console.log(`Portfolio: http://localhost:${port}/  ·  /video  ·  /software`);
});
