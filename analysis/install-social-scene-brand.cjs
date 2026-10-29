'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),source='E:/AI/social-templates',version='20261029-frame-ink';
const icon=fs.readFileSync(path.join(root,'assets/social-scene/icon.svg'),'utf8');
assert(icon.includes('fill="#242824"')&&icon.includes('viewBox="0 0 32 32"'));
fs.writeFileSync(path.join(source,'assets/favicon.svg'),icon);
function replace(file,before,after){const full=path.join(source,file),text=fs.readFileSync(full,'utf8');if(text.includes(after))return;assert(text.includes(before),'Expected source in '+file);fs.writeFileSync(full,text.replace(before,after));}
replace('index.html','<span class="brand-symbol"><svg class="" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M17 5H9a4 4 0 0 0 0 8h6a3 3 0 0 1 0 6H6"/></svg></span>',`<span class="brand-symbol"><img src="assets/favicon.svg?v=${version}" width="30" height="30" alt=""></span>`);
replace('studio.css','.brand-symbol{display:grid;place-items:center;width:30px;height:30px;border:1px solid #aa8eff55;background:linear-gradient(145deg,#8c6ff1,#5135ac);border-radius:9px;box-shadow:0 2px 8px #0003}', '.brand-symbol{display:grid;place-items:center;width:30px;height:30px;flex:none}');
replace('studio.css','.brand-symbol svg{width:22px;height:22px;stroke:#fff;stroke-width:2.2}', '.brand-symbol img{display:block;width:30px;height:30px}');
const entry=path.join(source,'index.html');let html=fs.readFileSync(entry,'utf8');html=html.replace(/((?:src|href)="[\w./-]+)\?v=[^"&]+/g,'$1?v='+version).replace('href="assets/favicon.svg"','href="assets/favicon.svg?v='+version+'"');fs.writeFileSync(entry,html);
console.log('Applied approved frame/ink icon to native header and favicon.');
