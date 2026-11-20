#!/usr/bin/env node
// 로컬 확인용 정적 서버. Netlify _redirects의 200 규칙(/video, /software → index.html)을 흉내 냅니다.
// 사용: node tools/serve.cjs [port] [--mbps N] [--latency ms]   (기본 8888, 제한 없음)
//      --mbps 20 --latency 40 처럼 주면 연결별로 회선 속도·지연을 흉내 내고 캐시를 끕니다.
'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const { Transform } = require('node:stream');

const root = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const option = name => { const at = args.indexOf(`--${name}`); return at >= 0 ? Number(args[at + 1]) : 0; };
const mbps = option('mbps');
const latency = option('latency');
const port = Number(args.find((arg, i) => /^\d+$/.test(arg) && !/^--/.test(args[i - 1] || '')) || process.env.PORT || 8888);

// 청크마다 전송 시간을 기다려 대략적인 회선 속도를 흉내 냅니다.
function throttle() {
    if (!mbps) return new Transform({ transform(chunk, _, done) { done(null, chunk); } });
    return new Transform({
        highWaterMark: 64 * 1024,
        transform(chunk, _, done) { setTimeout(() => done(null, chunk), chunk.length * 8 / (mbps * 1e6) * 1000); },
    });
}
function send(res, status, headers, file, range) {
    setTimeout(() => {
        res.writeHead(status, headers);
        if (!file) { res.end(); return; }
        const stream = fs.createReadStream(file, range);
        res.on('close', () => stream.destroy());
        stream.pipe(throttle()).pipe(res);
    }, latency);
}
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
        const headers = { 'Content-Type': types[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Accept-Ranges': 'bytes', 'Cache-Control': mbps ? 'no-store' : 'no-cache' };
        const body = req.method === 'HEAD' ? null : file;
        const range = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range || '');
        if (range && (range[1] || range[2])) {
            const start = range[1] ? Number(range[1]) : Math.max(0, stat.size - Number(range[2]));
            const end = range[1] && range[2] ? Math.min(Number(range[2]), stat.size - 1) : stat.size - 1;
            if (start >= stat.size || start > end) { res.writeHead(416, { 'Content-Range': `bytes */${stat.size}` }).end(); return; }
            send(res, 206, { ...headers, 'Content-Range': `bytes ${start}-${end}/${stat.size}`, 'Content-Length': end - start + 1 }, body, { start, end });
            return;
        }
        send(res, 200, { ...headers, 'Content-Length': stat.size }, body);
    });
}).listen(port, '127.0.0.1', () => {
    console.log(`Portfolio: http://localhost:${port}/  ·  /video  ·  /software${mbps ? `  (throttled ${mbps} Mbps, ${latency} ms)` : ''}`);
});
