'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..'),source='E:/AI/social-templates';
function replace(file,before,after){const full=path.join(source,file),text=fs.readFileSync(full,'utf8'),newline=text.includes('\r\n')?'\r\n':'\n';before=before.replace(/\r?\n/g,newline);after=after.replace(/\r?\n/g,newline);if(text.includes(after))return;assert(text.includes(before),'Expected source in '+file);fs.writeFileSync(full,text.replace(before,after));}
for(const name of ['kakaotalk','instagram','naver'])fs.copyFileSync(path.join(__dirname,'service-brand-assets',name+'-app.jpg'),path.join(source,'assets',name+'-app.jpg'));
fs.writeFileSync(path.join(source,'assets/x-brand.svg'),'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#fff"><title>X</title><path d="m21.62 21.5-7.47-10.9 6.97-8.1H18.7l-5.62 6.54L8.6 2.5H2.48L9.68 13l-7.3 8.5H4.8l5.96-6.93 4.76 6.93zM7.8 4.03l10.93 15.94H16.3L5.38 4.03z"/></svg>\n');
const old=`    if (brand === 'x') icon.textContent = '𝕏';
    else if (brand === 'google' || brand === 'naver') icon.textContent = brand === 'google' ? 'G' : 'N';
    else {`;
const next=`    const brandAsset = serviceBrandIcons[brand];
    if (brandAsset) {
      icon.classList.add('has-logo');
      const image = document.createElement('img'); image.src = 'assets/' + brandAsset; image.alt = ''; image.width = 26; image.height = 26; image.draggable = false; icon.appendChild(image);
    } else {`;
replace('editor.js',old,next);
replace('editor.js',"$('template-count').textContent = String(SOCIAL_SCENES.length).padStart(2, '0');",`const serviceBrandIcons = { kakao: 'kakaotalk-app.jpg', discord: 'discord-brand.svg', x: 'x-brand.svg', instagram: 'instagram-app.jpg', youtube: 'youtube-brand.svg', facebook: 'facebook-brand.svg', google: 'google-favicon.png', naver: 'naver-app.jpg', news: 'naver-app.jpg', mail: 'gmail-brand.svg' };
$('template-count').textContent = String(SOCIAL_SCENES.length).padStart(2, '0');`);
replace('studio.css',`.template-icon.kakao{background:#f7da32;color:#332b09;border-color:#f7da32}
.template-icon.instagram{color:#eca4cb;background:#30252f}
.template-icon.google{color:#95b3ff}
.template-icon.naver{color:#03cf64;background:#213027}`,`.template-icon.has-logo{padding:0;overflow:hidden;background:#fff;border:0}
.template-icon.has-logo img{display:block;width:26px;height:26px;object-fit:contain;filter:none}
.template-icon.has-logo.x{background:#0f1419}
.template-icon.has-logo.x img{width:19px;height:19px}
.template-icon.has-logo.discord{background:#5865f2}
.template-icon.has-logo.discord img{width:19px;height:19px;filter:brightness(0) invert(1)}
.template-icon.has-logo.youtube img{width:24px;height:24px}
.template-icon.has-logo.google img{width:20px;height:20px}
.template-icon.has-logo.mail img{width:22px;height:22px}`);
const references=path.join(source,'assets/SERVICE-BRAND-SOURCES.md');
const entry=path.join(source,'index.html');fs.writeFileSync(entry,fs.readFileSync(entry,'utf8').replace(/((?:src|href)="[\w./-]+)\?v=[^"&]+/g,'$1?v=20261029-service-icons-1'));
const catalog=JSON.parse(fs.readFileSync(path.join(__dirname,'service-icon-catalog.json'),'utf8').replace(/^\uFEFF/,''));
fs.writeFileSync(references,'# Sidebar service icons\n\nChecked 2026-10-29. Service marks identify their respective templates.\n\n'+catalog.map(item=>`- ${item.Requested}: official publisher artwork from Apple App Store lookup; bundle ${item.Bundle}. [Artwork](${item.Artwork})`).join('\n')+'\n- X: existing native-icons.js X UI path; https://about.x.com/en/who-we-are/brand-toolkit\n- YouTube, Facebook, Discord and Gmail: existing local brand SVG assets.\n- Google: existing official gstatic Google G image; https://www.gstatic.com/images/branding/product/1x/googleg_32dp.png\n');
console.log('Updated native sidebar brand assets and shared icon rendering.');
