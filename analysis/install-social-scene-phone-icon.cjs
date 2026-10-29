'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),source='E:/AI/social-templates',entry=path.join(source,'editor.js');
fs.copyFileSync(path.join(root,'assets/social-scene/phone-app.svg'),path.join(source,'assets/phone-app.svg'));
let text=fs.readFileSync(entry,'utf8');const before="phone: 'phone-app.svg'",after="phone: 'phone-app.svg?v=20261029-2'";
if(!text.includes(after)){assert(text.includes(before),'Expected shared sidebar icon map');text=text.replace(before,after);fs.writeFileSync(entry,text);}
const index=path.join(source,'index.html');fs.writeFileSync(index,fs.readFileSync(index,'utf8').replace(/((?:src|href)="[\w./-]+)\?v=[^"&]+/g,'$1?v=20261029-phone-icon-2'));
console.log('Phone sidebar now uses the same app-icon rendering as other templates.');
