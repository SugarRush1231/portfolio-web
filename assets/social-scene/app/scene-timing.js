'use strict';
const SceneTiming=(()=>{
 const maxDuration=600,frameRate=30;
 function parse(value){
  const text=String(value).trim();if(!text)return null;
  const parts=text.split(':');if(parts.length>4||parts.some(x=>!/^\d+(?:\.\d+)?$/.test(x)))return null;
  if(parts.slice(0,-1).some(x=>!/^\d+$/.test(x)))return null;
  const values=parts.map(Number);let seconds;
  if(parts.length===1)seconds=values[0];
  else if(parts.length===2){if(values[1]>=60)return null;seconds=values[0]*60+values[1]}
  else{if(values[1]>=60||values[2]>=60)return null;seconds=values[0]*3600+values[1]*60+values[2];if(parts.length===4){if(!/^\d+$/.test(parts[3])||values[3]>=frameRate)return null;seconds+=values[3]/frameRate}}
  return Number.isFinite(seconds)?seconds:null;
 }
 function snap(value,duration,speed=1,anchors=[],tolerance=0){
  let at=Math.max(0,Math.min(duration,value));const frame=speed/frameRate;
  at=Math.max(0,Math.min(duration,Math.round(at/frame)*frame));
  const frameAt=at;let best=tolerance;for(const anchor of anchors){if(!Number.isFinite(anchor)||anchor<0||anchor>duration)continue;const distance=Math.abs(frameAt-anchor);if(distance<=best){best=distance;at=anchor}}
  return at;
 }
 return Object.freeze({maxDuration,frameRate,parse,snap});
})();
if(typeof module!=='undefined')module.exports=SceneTiming;
