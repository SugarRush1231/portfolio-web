# Relevant public source excerpts

These are static source excerpts, not runtime observations.

## Class v — original character range [29134, 38319)

```javascript
class v{
constructor(){
const t=_A;
R.BM(this,["sXFn","move","down","up","leave","modeOut","key","morphFn"]),this.sX=new x({
cb:this.sXFn}
),this.mm=new y({
cb:this.move}
),this.isRunning=!1,this.timer=new R.Delay((t=>{
this.isRunning=!1}
),300),this.prop=t.prop,this.propL=t.propL,this.pCurr=[],this.pTarg=[],t.x=0,this.x={
curr:0,targ:0,currLatency:0}
;
const i=t.color.bg.rgbNorm;
this.colorBase=i.slice(),this.color={
}
,t.color.gl=this.colorBase.slice(),this.sensi=1.2,this.latency=0,this.indexOver=0,this.isDown=!1,this.isDragging=!1,this.prev=0,this.morphA=[]}
intro(){
const t=_A,i=t.config.data;
this.work=i.work,this.workL=i.workL,this.limit=this.workL-1,this.plane=t.engine.gl.planeTex.plane}
init(){
const t=_A,i=t.is,s=t.was;
if(this.isHome=i.home,this.isHA=i.about||i.home,this.reset=!0,!this.isHA)return;
this.morph({
d:0,e:"o5",shape:"cross"}
);
const e=t.mode;
i.about?("in"===e?(t.pgn.up(),t.fx.title({
a:"hide",d:500,delay:0,r:!1}
),t.fx.info({
a:"hide",d:500,delay:0}
),t.fx.explore({
a:"hide",d:500,delay:0}
)):"w"===e&&(t.fx.title({
a:"hide",d:500,delay:0,r:!1}
),t.fx.info({
a:"hide",d:500,delay:0}
),t.fx.project({
a:"hide",d:500,delay:0}
)),"out"!==e&&t.nav.colorFix({
default:!0}
),t.aFx.play({
a:"show",d:1600,delay:100}
),t.mode="a"):s.about?(t.aFx.play({
a:"hide",d:500,delay:0}
),"in"===t.modePrev?(t.fx.title({
a:"show",d:1600,delay:0,r:!1}
),t.fx.info({
a:"show",d:1600,delay:400}
),t.fx.explore({
a:"show",d:1600,delay:600}
)):"w"===t.modePrev&&(t.fx.title({
a:"show",d:1600,delay:0,r:!1}
),t.fx.info({
a:"show",d:1600,delay:400}
),t.fx.project({
a:"show",d:1600,delay:400}
)),"out"!==t.modePrev&&t.nav.colorFix({
default:!1}
),t.mode=t.modePrev):s.work?(t.mode="in",t.fx.project({
a:"hide",d:500,delay:0}
),t.fx.explore({
a:"show",d:1600,delay:400}
),t.letter.move({
start:"work",end:"home",d:1200}
),t.pgn.up(),t.pgnX.show({
r:!1,out:!1,d:0}
)):t.mode="out",t.modePrev=e}
resize(){
const t=_A;
if(!this.isHA)return;
const i=t.index,s=t.mode,e=t.resizeRq||this.reset,r=this.reset&&("a"!==t.modePrev&&"a"!==t.mode||R.Is.und(this.min));
if((t.resizeRq||r)&&(this.min=0,this.gMax()),(t.resizeRq||r)&&this.xUp(this.x.targ),e){
let i;
"a"===s?"out"===t.modePrev?i=t.data.modeOut():"in"===t.modePrev?i=t.data.modeIn():"w"===t.modePrev&&(i=t.data.modeW()):"out"===s?i=t.data.modeOut():"in"===s?i=t.data.modeIn():"w"===s&&(i=t.data.modeW()),R.Is.def(this.delay)&&this.delay.stop();
const e=t.isIntro&&"out"===t.mode;
if(t.resizeRq)if(e){
const s=t.data.modeOutIntro();
this.pSet(this.pCurr,s),this.pSet(this.pTarg,s),this.delay=new R.Delay((t=>{
this.pSet(this.pTarg,i,!0)}
),400),this.delay.run()}
else this.pSet(this.pCurr,i);
else if(this.reset)if("w"===t.modePrev){
const i="a"===s?"modeW":"wToH",e=t.data[i]();
this.pSet(this.pCurr,e)}
else if("a"!==s&&"a"!==t.modePrev){
const i=t.data.modeOut();
this.pSet(this.pCurr,i)}
e||this.pSet(this.pTarg,i)}
let o;
o="out"===s||"a"===s?this.colorBase.slice():this.work[i].color.bg.slice(),this.color.targ=o,t.resizeRq?(this.color.curr=o,t.color.gl=o):this.reset&&(this.color.curr=t.color.gl),t.resizeRq||t.pgn.pageChange(),this.render(),this.reset=!1}
gMax(){
const t=_A;
this.gapXW=t.data.outGapXW(),this.max=R.R(this.limit*this.gapXW),this.x.targ=t.index*this.gapXW}
xUp(t){
this.x.targ=t,this.x.curr=t,this.x.currLatency=t}
timerReset(){
this.timer.stop(),this.isRunning||(this.isRunning=!0),this.timer.run()}
sXFn(t){
if(this.isDown)return;
this.timerReset();
const i=_A.mode;
"in"===i?this.modeOut():"out"===i&&this.xTargUp(this.x.targ+t)}
down(t){
const i=t.target;
t.ctrlKey||"A"===i.tagName||0!==t.button?t.preventDefault():(this.isDown=!0,this.start=t.pageX,this.targ=this.x.targ,this.targPrev=this.targ)}
move(t,i){
const s=_A;
if(s.cursor.x=t,s.cursor.y=i,!this.isDown)return;
const e=this.sensi;
t>this.prev&&this.targ===this.min?this.start=t-(this.targPrev-this.min)/e:t<this.prev&&this.targ===this.max&&(this.start=t-(this.targPrev-this.max)/e),this.prev=t,this.targ=-(t-this.start)*e+this.targPrev,this.isDragging=this.isDraggingUp(),this.isDragging&&this.timerReset();
const r=s.mode;
"in"===r?this.isDragging&&(this.targPrev=this.targ,this.modeOut()):"out"===r&&this.xTargUp(this.targ)}
leave(){
_A.cursor={
x:-1,y:-1}
}
isDraggingUp(){
return Math.abs(this.targ-this.targPrev)/this.sensi>6}
up(t){
if(0!==t.button||!this.isDown)return;
const i=_A;
this.isDown=!1,this.isDragging=this.isDraggingUp(),this.isDragging||(this.indexOver>-1?this.modeIn(this.indexOver):i.pOver>-1&&("out"===i.mode?this.x.targ=i.pOver*this.gapXW:this.modeIn(i.pOver)))}
modeIn(t){
const i=_A,s="out"===i.mode;
i.mode="in";
const e=t;
let r=!1;
!s&&e>i.index&&(r=!0),i.li.run({
index:t}
),s||(i.fx.title({
a:"hide",d:500,delay:0,r:r}
),i.fx.info({
a:"hide",d:500,delay:0}
),i.fx.explore({
a:"hide",d:500,delay:0}
),i.pgnX.hideCurr({
r:r,out:s}
)),i.index=e,this.gMax();
const o=i.data.modeIn();
this.pSet(this.pTarg,o),this.color.targ=this.work[i.index].color.bg.slice(),i.color.gl=this.color.curr,i.nav.color({
default:!1}
),i.fx.title({
a:"show",d:1600,delay:0,r:r}
),i.fx.info({
a:"show",d:1600,delay:400}
),i.fx.explore({
a:"show",d:1600,delay:600}
),i.pgnX.show({
r:r,out:s,d:1200}
),i.pgn.up()}
modeOut(t){
const i=_A;
R.Is.def(t)&&"n0"===t.target.id&&"out"===i.mode&&(location.href="/"),i.mode="out",this.gMax();
const s=i.data.modeOut();
this.pSet(this.pTarg,s),this.color.targ=this.colorBase,i.nav.color({
default:!0}
),i.pgn.up(),i.fx.title({
a:"hide",d:500,delay:0,r:!1}
),i.fx.info({
a:"hide",d:500,delay:0}
),i.fx.explore({
a:"hide",d:500,delay:0}
),i.pgnX.hideCurr({
r:!1,out:!0}
)}
over(){
const t=_A,i="out"===t.mode,s=t.index,e=this.work[s].inOverLight;
this.needOver=!1,this.indexOver=-1;
for(let r=0;
r<this.workL;
r++)if(r!==s||i){
const s=this.pCurr[r],o=this.pTarg[r],h=s.x-this.x.curr,n=t.cursor.x>=h&&t.cursor.x<=h+s.w,a=t.cursor.y>=s.y&&t.cursor.y<=s.y+s.h;
n&&a?i?r===this.indexOver||this.isRunning||(this.indexOver=r,o.light=1):(o.light=e,this.indexOver=r):0!==o.light&&(o.light=0),this.needOver||(this.needOver=R.R(s.light)!==R.R(o.light))}
}
needGl(){
const t=_A,i=t.index;
let s=!1;
for(let t=0;
t<3&&(s=R.R(this.color.curr[t])!==R.R(this.color.targ[t]),!s);
t++);
const e=this.pCurr[i],r=this.pTarg[i],o=R.R(e.o)!==R.R(r.o),h=R.R(e.h)!==R.R(r.h),n=R.R(e.w)!==R.R(r.w),a=R.R(e.y)!==R.R(r.y),l=R.R(e.x)!==R.R(r.x),d=R.R(this.x.curr)!==R.R(this.x.targ);
t.needGL=h||n||a||l||o||s||d||this.needOver}
loop(){
if(!this.isHA)return;
const t=_A,i=t.mode,s=t.index,e="out"===i||"a"===i;
if(this.over(),this.needGl(),t.needGL){
this.x.curr=R.Damp(this.x.curr,this.x.targ,t.lerp.scroll[i]),t.x=this.x.curr/this.max,this.x.currLatency=R.Damp(this.x.currLatency,this.x.targ,t.lerp.latency[i]);
let r=this.x.targ-this.x.currLatency;
e||(r=0),this.latency+=(r-this.latency)*t.lerp.latency[i];
const o=e?1:.6,h=500/o;
t.latency.x=Math.min(Math.abs(this.latency)/h,o);
const n=e?1.7:2,a=500/n;
t.latency.rotate=R.Clamp(this.latency/a,-n,n);
for(let t=0;
t<3;
t++)this.color.curr[t]=R.Damp(this.color.curr[t],this.color.targ[t],.05);
if(t.color.gl=this.color.curr,e){
const i=R.R(this.x.curr/this.gapXW,0);
i!==s&&(t.index=i)}
this.render()}
}
render(){
const t=_A,i=t.mode,s=t.lerp.tr[i],e=this.x.curr,r=t.prop,o=t.propL;
for(let t=0;
t<this.workL;
t++){
const i=this.pCurr[t],h=this.pTarg[t],n=this.plane[t];
for(let t=0;
t<o;
t++){
const o=r[t];
let a=s;
"light"===o?a=.1:"o"===o&&(a=0===h[o]?.23:.07),i[o]=R.Damp(i[o],h[o],a),n.tr[o]=i[o],"x"===o&&(n.tr[o]-=e)}
}
}
xTargUp(t){
const i=this.clamp(t);
this.x.targ=i,this.targ=i}
pSet(t,i){
const s=_A;
let e;
const r="in"===s.mode||"in"===s.modePrev||"w"===s.mode||"w"===s.modePrev&&"a"===s.mode,o=s.prop,h=s.propL;
for(let s=0;
s<this.workL;
s++){
t[s]={
}
;
for(let n=0;
n<h;
n++){
const h=o[n];
e=0,"x"===h&&r&&(e=this.x.targ),t[s][h]=R.R(i[s][h]+e)}
}
}
key(t){
const i=t.key;
if("Tab"===i)R.PD(t);
else{
const s=_A,e="ArrowRight"===i||" "===i,r="ArrowLeft"===i,o="Enter"===i||"ArrowDown"===i,h="Escape"===i||"ArrowUp"===i;
if("a"===i)R.G.id("n1-0").click();
else if("out"===s.mode){
if(e||r){
const t=e?1:-1;
let i=s.index+7*t;
i<0?i=0:i>this.limit&&(i=this.limit),this.x.targ=i*this.gapXW}
else if(o){
R.PD(t);
const i=this.indexOver>-1?this.indexOver:s.index;
this.modeIn(i)}
}
else if("in"===s.mode)if(e||r){
const t=e?1:-1;
let i=s.index+t;
i<0?i=0:i>this.limit&&(i=this.limit),this.modeIn(i)}
else h?this.modeOut():(o||"e"===i)&&(R.PD(t),R.G.class("e")[s.index].click())}
}
morphFn(t){
const i="mouseenter"===t.type?"arrow":"cross";
this.morph({
d:700,e:"o5",shape:i}
)}
morph(t){
const i=_A.index,s=R.G.class("e-s-p")[i];
R.Is.def(this.morphA[i])&&this.morphA[i].pause(),this.morphA[i]=new R.M({
el:s,svg:{
type:"polygon",end:{
cross:"7,11.042 6.08,11.042 6.08,7.889 2.958,7.889 2.958,6.096 6.08,6.096 6.08,2.958 7.921,2.958 7.921,6.096 11.042,6.096 11.042,7.889 7.921,7.889 7.921,11.042",arrow:"7,11.042 6.499,10.542 4.958,9 3.462,7.503 4.724,6.241 6.08,7.597 6.08,2.958 7.921,2.958 7.923,7.593 9.277,6.24 10.539,7.502 9.041,9 7.5,10.542"}
[t.shape]}
,d:t.d,e:t.e}
),this.morphA[i].play()}
l(t){
const i=document;
R.L(i,t,"mousedown",this.down),R.L(i,t,"mouseup",this.up),R.L(i,t,"mouseleave",this.leave),R.L("#n0",t,"click",this.modeOut),R.L(i,t,"keydown",this.key),R.L(".e",t,"mouseenter",this.morphFn),R.L(".e",t,"mouseleave",this.morphFn)}
on(){
this.isHome&&(this.sX.on(),this.mm.on(),this.l("a"))}
off(){
this.isHome&&(this.sX.off(),this.mm.off(),this.l("r"))}
clamp(t){
return R.R(R.Clamp(t,this.min,this.max))}
}

```

## Class O — original character range [60862, 63319)

```javascript
class O{
resize(){
const t=_A,i=t.config.data;
this.work=i.work,this.workL=i.workL;
const s=t.win;
this.winW=s.w,this.winH=s.h;
const e=t.winWpsdW;
this.mode={
out:{
gapX:20*t.ratio,w:100*t.ratio,h:370*t.ratio}
,in:{
w:1054*t.ratio,h:602*t.ratio,gapX:152*e}
}
,this.mode.out.x=.5*(this.winW-this.mode.out.w),this.mode.out.y=.5*(this.winH-this.mode.out.h),this.mode.in.x=.5*(this.winW-this.mode.in.w),this.mode.in.y=.5*(this.winH-this.mode.in.h)}
inGap(){
return this.mode.in.gapX}
outGapXW(){
return this.mode.out.w+this.mode.out.gapX}
modeOut(){
const t=_A,i=t.isIntro,s=this.mode.out,e="a"===t.mode,r=e?0:1,o=[];
for(let h=0;
h<this.workL;
h++){
const n=o[h]={
}
;
if(n.y=s.y,n.h=s.h,n.w=s.w,i)n.x=s.x+(s.gapX+s.w)*h;
else if(e){
const i=h-t.index;
n.x=s.x+(s.gapX+s.w)*h+(s.gapX+s.w)*i*.2}
else n.x=s.x+(s.gapX+s.w)*h;
n.light=0,n.multiply=0,n.o=r,n.pY=0,n.scale=0}
return o}
modeOutIntro(){
const t=this.mode.out,i=this.modeOut();
for(let s=0;
s<this.workL;
s++)i[s].x=this.winW+(t.gapX+t.w)*s*3;
return i}
modeIn(){
const t=_A,i=this.mode.in,s=this.mode.out,e=t.index,r=this.work[e].multiply,o="a"===t.mode,h=o?0:1,n=[];
for(let t=0;
t<this.workL;
t++){
const a=t-e,l=n[t]={
}
;
if(0===a)l.w=i.w,l.x=i.x;
else{
const t=.1,e=.5*i.w;
let r=.5*(this.winW-(i.w+2*i.gapX));
r<e&&(r=e),a>0?1===a?(l.w=r,l.x=o?i.x+(i.gapX+i.w)+i.gapX:i.x+(i.gapX+i.w)):(l.w=s.w,l.x=i.x+(i.gapX+i.w)+(i.gapX+r)+(i.gapX+s.w)*(a-2)+i.gapX*(a-1)*(a-1)*t):a<0&&(-1===a?(l.w=r,l.x=o?i.x-(i.gapX+r)-i.gapX:i.x-(i.gapX+r)):(l.w=s.w,l.x=i.x-(i.gapX+r)+(i.gapX+s.w)*(a+1)+i.gapX*(a+1)*-(a+1)*t))}
l.y=i.y,l.h=i.h,l.light=t===e?1:0,l.multiply=t===e?0:r,l.o=h,l.pY=0,l.scale=o?.15:0}
return n}
modeW(){
const t=_A,i=this.mode.out,s=this.mode.in,e=t.index,r=this.work[e].multiply,o="a"===t.mode?0:1,h=[];
for(let t=0;
t<this.workL;
t++){
const n=t-e,a=h[t]={
}
,l=0===n;
if(l)a.x=s.x,a.w=s.w,a.y=.8*-(s.h+s.gapX),a.h=.8*s.h;
else{
const t=.1,e=.5*s.w;
let r=.5*(this.winW-(s.w+2*s.gapX));
r<e&&(r=e),n>0?1===n?(a.w=r,a.x=this.winW+s.gapX):(a.w=i.w,a.x=s.x+(s.gapX+s.w)+(s.gapX+r)+(s.gapX+i.w)*(n-2)+s.gapX*(n-1)*(n-1)*t):n<0&&(-1===n?(a.w=r,a.x=-(r+s.gapX)):(a.w=i.w,a.x=s.x-(s.gapX+r)+(s.gapX+i.w)*(n+1)+s.gapX*(n+1)*-(n+1)*t)),a.y=s.y,a.h=s.h}
a.light=l?1:0,a.multiply=l?0:r,a.o=o,a.pY=l?-.1:0,a.scale=0}
return h}
hToW(){
const t=_A,i="in"===t.mode?0:t.index*this.outGapXW(),s=t.h.pCurr;
for(let t=0;
t<this.workL;
t++)s[t].x-=i;
return s}
wToH(){
const t=_A,i="in"===t.mode?0:t.index*this.outGapXW(),s=t.w.pCurr;
for(let t=0;
t<this.workL;
t++)s[t].x-=i;
return s}
}

```

## Class _ — original character range [49836, 52901)

```javascript
class _{
intro(){
const t=_A.config.data;
this.work=t.work;
const i=t.workL;
this.v=R.G.id("v"),this.e=R.G.class("e"),this.p=R.G.id("p"),this.pT=this.p.children[2].children[0],this.pPoly=R.G.id("p-s-p"),this.t=[],this.iL=[],this.iR=[],this.eA=[],this.eL=[],this.eS=[],this.vVisible=!1,this.pS=new L({
objChildren:!1,el:this.p.children[0],prop:["y",110,110],delay:0}
),this.pL=new L({
objChildren:!1,el:this.p.children[1],prop:["y",110,-110],delay:0}
),this.pA=new L({
objChildren:!1,el:this.p.children[2],prop:["y",101,101],delay:0}
),this.vT=new L({
objChildren:!1,el:this.v.children[0],prop:["y",101,101],delay:0}
),this.vB=new L({
objChildren:!1,el:this.v.children[1],prop:["y",101,101],delay:0}
);
for(let t=0;
t<i;
t++){
const i=this.work[t].title;
this.t[t]=new L({
objChildren:!0,el:R.G.class("t"+t),prop:["x",-101,101],delay:i.delay,lineStartTogether:i.lineStartTogether}
),this.iL[t]=new L({
objChildren:!0,el:R.G.class("i-l")[t],prop:["y",101,-101],delay:.04}
),this.iR[t]=new L({
objChildren:!0,el:R.G.class("i-r")[t],prop:["y",101,-101],delay:.04}
),this.eA[t]=new L({
objChildren:!1,el:this.e[t].children[0],prop:["y",101,-101],delay:0}
),this.eL[t]=new L({
objChildren:!1,el:R.G.class("e-l")[t],prop:["y",-110,110],delay:0}
),this.eS[t]=new L({
objChildren:!1,el:R.G.class("e-s")[t],prop:["y",110,-110],delay:0}
)}
}
project(t){
const i=this.value(t.a),s=this.work[_A.index],e=i.isShow&&s.visit,r=1600===t.d?1400:t.d,o=1600===t.d?1200:t.d,h=this.pA.motion({
action:t.a,d:r,e:i.e,delay:t.delay}
),n=this.pL.motion({
action:t.a,d:o,e:i.e,delay:t.delay+200}
),a=this.pS.motion({
action:t.a,d:r,e:i.e,delay:t.delay+200}
);
let l,d;
if((e||this.vVisible)&&(l=this.vB.motion({
action:t.a,d:t.d,e:i.e,delay:t.delay+100}
),d=this.vT.motion({
action:t.a,d:t.d,e:i.e,delay:t.delay+200}
)),i.isShow){
const t=s.color.txt.rgb,i=this.pT.children[0];
for(let s=0;
s<2;
s++)i.children[s].style.background=t;
if(this.pT.style.color=t,this.pPoly.style.fill=t,this.p.children[1].children[0].style.borderRightColor=t,e){
this.v.href=s.visit;
for(let i=0;
i<2;
i++)this.v.children[i].children[0].style.color=t;
this.v.children[1].children[0].children[0].style.background=t}
}
R.PE[i.pe](this.p),(e||this.vVisible)&&(R.PE[i.pe](this.v),d.play(),l.play()),e?this.vVisible=!0:this.vVisible&&(this.vVisible=!1),h.play(),n.play(),a.play()}
explore(t){
const i=this.value(t.a),s=this.gIndex(t.index),e=1600===t.d?1400:t.d,r=1600===t.d?1200:t.d,o=this.eA[s].motion({
action:t.a,d:e,e:i.e,delay:t.delay}
),h=this.eL[s].motion({
action:t.a,d:r,e:i.e,delay:t.delay+200}
),n=this.eS[s].motion({
action:t.a,d:e,e:i.e,delay:t.delay+200}
);
R.PE[i.pe](this.e[s]),o.play(),h.play(),n.play()}
info(t){
const i=this.value(t.a),s=this.gIndex(t.index),e=this.iL[s].motion({
action:t.a,d:t.d,e:i.e,delay:t.delay}
),r=this.iR[s].motion({
action:t.a,d:t.d,e:i.e,delay:t.delay}
);
e.play(),r.play()}
title(t){
const i=this.value(t.a),s=this.gIndex(t.index);
this.t[s].motion({
action:t.a,d:t.d,e:i.e,delay:t.delay,reverse:t.r}
).play()}
gIndex(t){
return R.Is.def(t)?t:_A.index}
value(t){
const i="show"===t;
return{
isShow:i,e:i?"o6":"o3",pe:i?"all":"none",cn:i?"add":"remove"}
}
}

```

## Class C — original character range [52901, 54704)

```javascript
class C{
intro(){
const t=_A.config.data;
this.work=t.work,this.workL=t.workL,this.x=[],this.xCurr=[]}
resize(){
const t=_A;
if(!t.resizeRq)return;
const i=t.index,s=R.G.class("t")[0],e=s.offsetWidth,r=parseFloat(getComputedStyle(s.children[0].children[0]).getPropertyValue("padding-right")),o=t.is.home||t.is.about&&"w"!==t.modePrev?"home":"work";
for(let t=0;
t<this.workL;
t++){
const s=R.G.class("t"+t),h=this.work[t].title;
this.x[t]={
home:[],work:[]}
;
const n=s,a=n.length;
for(let s=0;
s<a;
s++){
const a=n[s].children,l=a.length;
this.x[t].home[s]=[],this.x[t].work[s]=[];
let d=0;
const c=[];
for(let n=0;
n<l;
n++){
c[n]=a[n].offsetWidth-2*r*(1-h.x.workLetterSpacing[s][n]);
const p={
home:h.x.home[s][n]*e/100}
;
if(n>0?(d+=c[n-1],p.work=d):p.work=0,n>0){
const i=this.x[t].home[s][n-1]+c[n-1];
p.home<i&&(p.home=i)}
if(n===l-1){
const t=e-(a[n].offsetWidth-1.8*r);
p.home>t&&(p.home=t)}
const g=t===i?o:"home";
R.T(a[n],p[g],0,"px"),this.x[t].home[s][n]=p.home,this.x[t].work[s][n]=p.work}
}
}
}
move(t){
const i=t.start,s=t.end,e="home"===t.end,r=t.d,o=_A.index,h=R.G.class("t"+o),n=h.length,a=this.x[o];
R.Is.def(this.letterAnim)&&this.letterAnim.pause();
const l=[],d=R.Is.und(this.xCurr[o]);
d&&(this.xCurr[o]=[]);
const c=[],p=[];
for(let t=0;
t<n;
t++){
const s=h[t].children.length;
l[t]=[],d&&(this.xCurr[o][t]=[]),c[t]=[],p[t]=[];
for(let r=0;
r<s;
r++){
if(d){
const s=a[i][t][r];
this.xCurr[o][t][r]=s,l[t][r]=s}
else l[t][r]=this.xCurr[o][t][r];
e?(c[t][r]=.01*r,p[t][r]=1-.01*(s-1-r)):(c[t][r]=0,p[t][r]=1)}
}
const g=r+r*(1-p[0][0]);
this.letterAnim=new R.M({
d:g,update:t=>{
const i=t.prog;
for(let t=0;
t<n;
t++){
const e=h[t].children,r=e.length;
for(let h=0;
h<r;
h++){
const r=l[t][h],n=a[s][t][h],d=(R.Clamp(i,c[t][h],p[t][h])-c[t][h])/p[t][0],g=R.Lerp(r,n,R.Ease.o6(d));
this.xCurr[o][t][h]=g,R.T(e[h],g,0,"px")}
}
}
}
),this.letterAnim.play()}
}

```

## Class L — original character range [48632, 49836)

```javascript
class L{
constructor(t){
this.a=_A;
const i=t.delay,s=t.lineStartTogether||!1,e=t.objChildren,r=t.random||!1;
let o=t.el;
R.Is.und(o.length)&&(o=[o]),this.lineL=o.length;
const h=t.prop;
this.start=h[1],this.end=h[2],this.progEndMin={
show:1,hide:1}
,this.line=[];
let n=0;
for(let t=0;
t<this.lineL;
t++){
this.line[t]=new k({
indexStart:n,objChildren:e,el:o[t].children,prop:h,delay:i,random:r}
);
const a=this.line[t].progEndMinShow;
a<this.progEndMin.show&&(this.progEndMin.show=a),s||(n+=this.line[t].objL)}
}
motion(t){
R.Is.def(this.letterAnim)&&this.letterAnim.pause();
let i=this.start,s=this.end;
t.reverse&&(i=this.end,s=this.start);
const e=t.action,r="show"===e,o=t.d,h=R.Ease[t.e],n=this.line,a=this.lineL,l=n[0].obj[0].curr;
let d=!1;
r||(d=i<0&&l>0||(i>0&&l<0||Math.abs(l)<Math.abs(.3*i)));
let c=0;
Math.abs(l)===Math.abs(i)&&(c=t.delay);
for(let t=0;
t<a;
t++)n[t].prepare({
isShow:r,isRunning:this.isRunning,propEndIsEnd:d,start:i,end:s}
);
const p=o+o*(1-this.progEndMin[e]);
return this.letterAnim=new R.M({
delay:c,d:p,update:t=>{
const i=t.prog;
for(let t=0;
t<a;
t++)n[t].loop({
prog:i,lineProgEndFirst:n[t].lineProgEndFirst[e],rEase:h}
)}
,cb:t=>{
this.isRunning=!1}
}
),{
play:t=>{
this.isRunning=!0,this.letterAnim.play()}
}
}
}

```
