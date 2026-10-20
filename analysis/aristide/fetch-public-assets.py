from pathlib import Path
import urllib.request,urllib.parse,re,json,hashlib
root=Path('analysis/aristide');root.mkdir(parents=True,exist_ok=True)
url='https://aristidebenoist.com/'
def fetch(url):
    request=urllib.request.Request(url,headers={'User-Agent':'Mozilla/5.0'})
    with urllib.request.urlopen(request,timeout=40) as response:return response.read()
data=fetch(url);(root/'index.html').write_bytes(data)
html=data.decode('utf-8')
assets=re.findall(r'<script[^>]*src=[\"\x27]([^\"\x27]+)',html)+re.findall(r'<link[^>]*href=[\"\x27]([^\"\x27]+\.css[^\"\x27]*)',html)
if '"/static/js/"+n+".js?"' in html:
    assets += ['/static/js/d.js?2','/static/js/m.js?2','/static/css/d.css?2','/static/css/m.css?2']
manifest=[]
for asset in assets:
    address=urllib.parse.urljoin(url,asset)
    if urllib.parse.urlparse(address).hostname not in ['aristidebenoist.com','www.aristidebenoist.com']:continue
    name=Path(urllib.parse.urlparse(address).path).name
    content=fetch(address);(root/name).write_bytes(content)
    manifest.append({'url':address,'file':name,'bytes':len(content),'sha256':hashlib.sha256(content).hexdigest()})
(root/'manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
print(json.dumps({'html_bytes':len(data),'assets':manifest},ensure_ascii=False))

response=fetch(url+'?xhr=true&device=d&webp=false')
(root.parent/'aristide-desktop-response.json').write_bytes(response)
obj=json.loads(response)
print(json.dumps({'response_bytes':len(response),'keys':list(obj),'data_keys':list(obj.get('data',{})),'routes':obj.get('routes',{})},ensure_ascii=False))
