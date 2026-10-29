'use strict';
function exportElapsed(milliseconds){const seconds=Math.max(0,Math.floor(milliseconds/1000));return Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0')}
const ExportFeedback=(()=>{
 let timer=null,started=0,buttonLabel='';
 function tick(){const progress=$('export-progress'),value=Number(progress.value);$('export-percent').textContent=Number.isFinite(value)?Math.floor(Math.max(0,Math.min(1,value))*100)+'%':'준비 중';$('export-elapsed').textContent=exportElapsed(performance.now()-started)+' 경과'}
 function stop(){if(timer!==null)clearInterval(timer);timer=null;$('export-dialog').setAttribute('aria-busy','false');$('save-video').disabled=false;$('save-video').setAttribute('aria-busy','false');if(buttonLabel){$('save-video').querySelector('span').textContent=buttonLabel;buttonLabel=''}}
 function open(title,detail){
  stop();started=performance.now();const dialog=$('export-dialog');dialog.classList.remove('is-export-error');dialog.setAttribute('aria-busy','true');$('export-title').textContent=title;$('export-detail').textContent=detail;$('export-progress').value=0;$('cancel-export').textContent='내보내기 취소';$('export-local-preview').hidden=true;
  buttonLabel=$('save-video').querySelector('span').textContent;$('save-video').querySelector('span').textContent='내보내는 중…';$('save-video').disabled=true;$('save-video').setAttribute('aria-busy','true');tick();timer=setInterval(tick,250);if(!dialog.open)dialog.showModal();
 }
 function fail(message,{localPreview=false}={}){tick();stop();const dialog=$('export-dialog');dialog.classList.add('is-export-error');$('export-title').textContent='내보내기를 시작하거나 완료하지 못했어요';$('export-detail').textContent=message;$('export-percent').textContent='중단됨';$('cancel-export').textContent='닫기';$('export-local-preview').hidden=!localPreview;if(!dialog.open)dialog.showModal()}
 function close(){stop();if($('export-dialog').open)$('export-dialog').close()}
 return{open,fail,close};
})();
if(typeof module!=='undefined')module.exports={exportElapsed};
