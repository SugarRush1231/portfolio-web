from pathlib import Path
import json, subprocess
import numpy as np

ROOT=Path(__file__).parent
video=ROOT/'out/mmt-portfolio.mp4'
meta=json.loads(subprocess.run(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(video)],capture_output=True,text=True,check=True).stdout)
v=next(s for s in meta['streams'] if s['codec_type']=='video')
a=next(s for s in meta['streams'] if s['codec_type']=='audio')
assert (v['width'],v['height'])==(1080,1920)
assert v['r_frame_rate']=='30/1'
assert int(v['nb_frames'])==720
assert abs(float(meta['format']['duration'])-24)<.04
assert a['channels']==2 and a['codec_name']=='aac'
assert v['color_space']=='bt709'

raw=subprocess.run(['ffmpeg','-v','error','-i',str(video),'-vf','scale=108:192,format=gray','-f','rawvideo','-'],capture_output=True,check=True).stdout
images=np.frombuffer(raw,np.uint8).reshape(-1,192,108).astype(np.float32)
assert len(images)==720
means=images.mean(axis=(1,2))
assert np.all(means>5), 'Unintended black frame'
d=np.abs(np.diff(images,axis=0)).mean(axis=(1,2))
pops=[]
for i in range(1,len(d)-1):
    if d[i]>3*max(d[i-1],d[i+1],.3) and d[i]>4:
        pops.append({'frame':i+1,'time':round((i+1)/30,3),'difference':round(float(d[i]),3)})

result=subprocess.run(['ffmpeg','-hide_banner','-i',str(video),'-af','loudnorm=I=-16:TP=-1.5:LRA=10:print_format=json','-f','null','-'],capture_output=True,text=True,check=True).stderr
sound=json.loads(result[result.rindex('{'):result.rindex('}')+1])
assert -17.2<=float(sound['input_i'])<=-14.8, sound
assert float(sound['input_tp'])<=-1, sound
report={'pass':not pops,'dimensions':[1080,1920],'duration':float(meta['format']['duration']),'fps':30,'frames':720,'audio':'AAC stereo','loudnessLUFS':float(sound['input_i']),'truePeakDBTP':float(sound['input_tp']),'blackFrames':int((means<=5).sum()),'isolatedFramePops':pops,'byteSize':video.stat().st_size,'sources':'references/SOURCES.md','notes':['Two temporal samples per frame.','Frame seeking was checked in a non-linear order.','Final identity screen intentionally holds for reading.','Real file processing is not recorded.']}
(ROOT/'out/qa.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps(report,ensure_ascii=False,indent=2))
if pops: raise SystemExit('Review isolated frame changes before delivery.')
