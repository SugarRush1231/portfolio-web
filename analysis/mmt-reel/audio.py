"""Mix the credited music excerpt and real UI sounds against the frame engine's cues."""
from pathlib import Path
import json, subprocess, wave
import numpy as np

ROOT=Path(__file__).parent
SR=48000
N=24*SR
FF='ffmpeg'
def load(path):
    raw=subprocess.run([FF,'-v','error','-i',str(path),'-f','f32le','-ar',str(SR),'-ac','2','-'],capture_output=True,check=True).stdout
    return np.frombuffer(raw,np.float32).reshape(-1,2).copy()

def write(path,data):
    with wave.open(str(path),'wb') as file:
        file.setnchannels(2);file.setsampwidth(2);file.setframerate(SR);file.writeframes((np.clip(data,-1,1)*32767).astype('<i2').tobytes())

cue=json.loads((ROOT/'out/cues.json').read_text())
song=load(ROOT/'assets/music.mp3')
start=round(3.0186*SR)
mix=song[start:start+N]*.62
assert len(mix)==N
mix[:int(.06*SR)]*=np.linspace(0,1,int(.06*SR))[:,None]
events=[(t,'click',.18) for t in cue['clicks']]
events += [(0,'place',.14),(.48,'place',.14),(.96,'place',.14),(2.3,'slide',.13)]
events += [(t,'slide',.12) for t in cue['sceneStarts'][1:-1]]
events += [(cue['sceneStarts'][-1]+.72,'impact',.13)]
for when,name,gain in events:
    sound=load(ROOT/f'assets/{name}.ogg')
    peak=int(np.abs(sound).sum(1).argmax())
    sound=sound/(np.abs(sound).max()+1e-8)*gain
    first=round(when*SR)-peak
    lo,hi=max(0,first),min(N,first+len(sound))
    if hi>lo: mix[lo:hi]+=sound[lo-first:hi-first]
fade=int(1.2*SR)
mix[-fade:]*=np.linspace(1,0,fade)[:,None]**1.3
write(ROOT/'out/raw.wav',mix)
mono=mix.mean(axis=1)
freq=np.fft.rfftfreq(N,1/SR)
low=np.fft.irfft(np.fft.rfft(mono)*(freq<=160),n=N)
windows=low.reshape(24*120,SR//120)
energy=np.sqrt(np.mean(windows**2,axis=1))
energy=np.clip(energy/(np.percentile(energy,95)+1e-8),0,1)
(ROOT/'out/bass.json').write_text(json.dumps(np.round(energy,4).tolist()))
result=subprocess.run([FF,'-hide_banner','-i',str(ROOT/'out/raw.wav'),'-af','loudnorm=I=-16:TP=-1.5:LRA=10:print_format=json','-f','null','-'],capture_output=True,text=True,check=True)
stats=json.loads(result.stderr[result.stderr.rindex('{'):result.stderr.rindex('}')+1])
af=f"loudnorm=I=-16:TP=-1.5:LRA=10:measured_I={stats['input_i']}:measured_TP={stats['input_tp']}:measured_LRA={stats['input_lra']}:measured_thresh={stats['input_thresh']}:offset={stats['target_offset']}:linear=true"
subprocess.run([FF,'-v','error','-y','-i',str(ROOT/'out/raw.wav'),'-af',af,'-ar',str(SR),str(ROOT/'out/audio.wav')],check=True)
(ROOT/'out/audio-measurement.json').write_text(json.dumps(stats,indent=2))
print('Audio mix ready: 24 s, stereo, target -16 LUFS, original music + real UI sounds.')
