'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),source=path.resolve(process.argv[2]||path.join(root,'../social-templates')),target=path.join(root,'assets/social-scene/app');
const version='20261029-naver-profile';
function inside(base,name){const full=path.resolve(base,name);if(!full.startsWith(base+path.sep))throw Error('Invalid bundle path: '+name);return full}
function collect(base,prefix=''){return fs.readdirSync(base,{withFileTypes:true}).flatMap(entry=>{const name=path.join(prefix,entry.name);return entry.isDirectory()?collect(path.join(base,entry.name),name):entry.isFile()?[name]:[]})}
if(!fs.existsSync(path.join(source,'index.html')))throw Error('Social Scene source directory was not found: '+source);
const files=fs.readdirSync(source,{withFileTypes:true}).filter(entry=>entry.isFile()&&/\.(html|css|js)$/.test(entry.name)).map(entry=>entry.name);
for(const directory of ['assets','fonts','vendor'])files.push(...collect(path.join(source,directory),directory));
fs.mkdirSync(target,{recursive:true});
const managed=path.join(target,'.managed-files.json'),previous=fs.existsSync(managed)?JSON.parse(fs.readFileSync(managed,'utf8')):[];
for(const name of previous)if(!files.includes(name)){const file=inside(target,name);if(fs.existsSync(file)&&fs.statSync(file).isFile())fs.unlinkSync(file)}
const hash=crypto.createHash('sha256');let bytes=0;
for(const name of files){const data=fs.readFileSync(inside(source,name)),dest=inside(target,name);hash.update(name);hash.update(data);bytes+=data.length;fs.mkdirSync(path.dirname(dest),{recursive:true});fs.writeFileSync(dest,data)}
const entry=path.join(target,'index.html');let html=fs.readFileSync(entry,'utf8');const sourceVersion=/\?v=([^"&]+)/.exec(html)?.[1]||'';
// The timeline shortcut must also leave plaintext-only and inherited editable text alone.
const timeline=path.join(target,'timeline-editor.js');
fs.writeFileSync(timeline,fs.readFileSync(timeline,'utf8').replace('[contenteditable=true]','[contenteditable]'));
html=html.replace(/((?:src|href)="[\w./-]+)\?v=[^"&]+/g,'$1?v='+version);
html=html.replace('<head>','<head>\n<script src="../embed-init.js?v='+version+'"></script>').replace('</head>','<link rel="stylesheet" href="../embed.css?v='+version+'">\n</head>').replace('</body>','<script src="../embed.js?v='+version+'"></script></body>');
fs.writeFileSync(entry,html);fs.writeFileSync(managed,JSON.stringify(files.sort(),null,2));
fs.writeFileSync(path.join(root,'assets/social-scene/source.json'),JSON.stringify({version,sourceVersion,fileCount:files.length,bytes,sha256:hash.digest('hex')},null,2));
console.log('Synced Social Scene: '+files.length+' runtime files; '+bytes+' bytes; portfolio embed enabled.');
