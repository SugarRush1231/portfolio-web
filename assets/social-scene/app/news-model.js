'use strict';
const NewsModel=(()=>{
 const categories={top:'주요뉴스',issue:'이슈',politics:'정치',economy:'경제',society:'사회',life:'생활',it:'IT',world:'세계',clips:'클립',opinion:'사설·칼럼',ranking:'랭킹',my:'MY'};
 const fields={headline:5000,summary:5000,category:5000,imageCaption:5000,body:3000};
 const titles={top:'오늘의 주요 소식, 한눈에 살펴보기',issue:'지금 주목할 이야기와 다양한 시선',politics:'정책 논의와 의사결정 과정을 살펴보다',economy:'생활 속 경제 지표, 어떻게 읽을까',society:'우리 동네에서 시작된 작은 변화',life:'일상에 여유를 더하는 생활의 발견',world:'세계의 일상과 문화를 만나다',clips:'짧은 영상으로 전하는 오늘의 장면',opinion:'하나의 주제를 바라보는 여러 관점',ranking:'독자가 관심을 보인 소식 모아보기',my:'내가 고른 관심사를 한곳에서'};
 function defaults(type){if(type!=='news-article')return{};return{newsArticles:Object.fromEntries(Object.keys(categories).filter(key=>key!=='it').map(key=>[key,{headline:titles[key],summary:categories[key]+' 분야의 이야기를 전합니다.\n영상 제작에 맞게 제목과 내용을 수정하세요.',category:categories[key],imageCaption:'사진 설명을 입력하세요.',body:titles[key]+'를 주제로 사람들의 관심과 다양한 시각을 살펴봅니다.\n\n이 기사는 영상 제작을 위한 예시입니다. 필요한 자료와 대본을 바탕으로 문장을 직접 바꿔 사용할 수 있습니다.\n\n주요 배경과 세부 내용을 차례로 정리하고, 전달할 메시지에 맞게 장면을 구성합니다.'}]))}}
 function validate(input,type){
  if(type!=='news-article')return{};const out=defaults(type);if(input.newsArticles===undefined)return out;
  const rows=input.newsArticles;if(!rows||typeof rows!=='object'||Array.isArray(rows))throw Error('분류별 기사 형식을 확인해 주세요.');
  for(const key of Object.keys(rows)){
   if(!Object.hasOwn(out.newsArticles,key))throw Error('지원하지 않는 뉴스 분류입니다.');const item=rows[key];
   if(!item||typeof item!=='object'||Array.isArray(item)||Object.keys(item).some(field=>!Object.hasOwn(fields,field)))throw Error('분류별 기사 항목이 올바르지 않습니다.');
   for(const[field,max]of Object.entries(fields))if(item[field]!==undefined){if(typeof item[field]!=='string'||item[field].length>max)throw Error('분류별 기사 내용 길이를 확인해 주세요.');out.newsArticles[key][field]=item[field]}
  }return out;
 }
 function isAction(action){return action==='news-open'||action.startsWith('news-category:')&&Object.hasOwn(categories,action.slice(14))}
 function active(p,time){
  let section=Object.hasOwn(categories,p.props?.newsSection)?p.props.newsSection:'it',list=false;
  for(const event of [...(p.actions||[])].sort((a,b)=>a.at-b.at)){
   if(event.at>time)continue;
   if(event.action.startsWith('news-category:')&&event.value&&Object.hasOwn(categories,event.action.slice(14))){section=event.action.slice(14);list=true}
   else if(event.action==='news-open')list=!event.value;
  }return{section,list};
 }
 function read(p,time,key){const section=active(p,time).section;if(section==='it')return key==='body'?p.body:p.props[key];return p.newsArticles[section][key]}
 function write(p,time,key,value){const section=active(p,time).section;if(section==='it'){if(key==='body')p.body=value;else p.props[key]=value}else p.newsArticles[section][key]=value}
 function view(p,time){const state=active(p,time),props={...p.props};for(const key of Object.keys(fields))if(key!=='body')props[key]=read(p,time,key);return{newsCategory:state.section,newsList:state.list,props,body:read(p,time,'body')}}
 return{categories,fields,defaults,validate,isAction,active,read,write,view};
})();
if(typeof module!=='undefined')module.exports=NewsModel;
