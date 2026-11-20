# AI_PROD_OS 업무 자동화 GitHub 조사

조사일: 2026-10-21. 제품·라이브러리 12개와 워크플로 모음 2개를 비교했다. README, 일부 설치 문서와 라이선스, 아래 두 워크플로 JSON을 읽었다. 저장소 전체 감사나 설치·실행 검증은 하지 않았다. 링크의 기본 브랜치는 이후 변경될 수 있다.

## 목표와 판단

사용자는 여러 분야의 완성된 업무를 골라, 필요한 입력과 최초 계정 연결 후 한 번에 실행하기를 원한다. AI 생성과 지속적인 유료 서버 운영은 제외한다.

현재 우선 후보는 **Node-RED를 사용자 PC에서 실행하고, 기존 사이트에는 준비된 업무를 선택하는 화면을 제공하는 방식**이다. 기존 프로젝트가 Express를 사용하고, Node-RED가 공식적으로 Express 내 실행을 지원하기 때문이다. 이는 설계 제안이며 현재 구현되거나 연결된 기능이 아니다. 공개 HTTPS 사이트와 로컬 실행기 사이의 연결·인증·배포 방식은 별도 검증이 필요하다.

사용자에게 노드를 직접 조립하게 하면 목표와 어긋난다. 개발자가 업무 흐름을 만들고 검증하며, 사용자는 입력·실행·결과 확인만 하는 형태가 적합하다. 아래 후보를 모두 설치한다는 뜻은 아니다.

## 저장소 비교

| 저장소 | 확인한 용도 | 무료 운영·재사용 조건과 한계 | 판단 |
| --- | --- | --- | --- |
| [Node-RED](https://github.com/node-red/node-red) | 이벤트·API·데이터 처리 흐름, 로컬 실행 | Apache-2.0. 실행할 PC나 서버 필요. 추가 노드·외부 서비스는 각각 조건 확인 | 자체 서비스 구현 기반 우선 후보 |
| [Automa](https://github.com/AutomaApp/automa) | 브라우저 확장으로 폼 입력·반복 작업·웹 데이터 추출·스크린샷 | business 외 소스 AGPL, business는 별도 상용 라이선스. 확장 설치와 브라우저 필요 | 브라우저 업무에 한정할 때 유력 |
| [Activepieces](https://github.com/activepieces/activepieces) | 여러 앱 연결, 트리거·액션·조건·반복 처리 | 일반 소스 MIT, EE 경로 별도. 공식 제품 임베딩은 Enterprise. 앱·DB·작업 실행 환경 운영 필요 | 업무 구성·사용 흐름 참고 가치 높음 |
| [OpenRPA](https://github.com/open-rpa/openrpa) | Windows 데스크톱·브라우저 업무 자동화 | MPL-2.0. 로컬 프로그램 설치 필요. OpenFlow 없이 가능한 실행 범위는 미검증 | Windows 앱까지 다룰 경우 후보 |
| [RPA Framework](https://github.com/robocorp/rpaframework) | Python/Robot Framework용 브라우저·데스크톱·Excel·메일·PDF 도구 | Apache-2.0. 완성된 업무 선택 사이트는 아니며 작업별 구현 필요. 선택적 외부 서비스는 비용 가능 | 로컬 업무 구현용 라이브러리 후보 |
| [Automatisch](https://github.com/automatisch/automatisch) | 앱 간 업무 자동화 | CE AGPL-3.0, EE 파일 별도 조건. 자체 호스팅은 실행 환경 운영 필요 | Activepieces와 비교할 대안 |
| [Huginn](https://github.com/huginn/huginn) | 웹·RSS·메일 등 감시와 이벤트 기반 처리 | MIT. 웹 프로세스·작업 프로세스·DB 운영 필요 | 수동 한 번 실행보다 지속 감시 업무에 적합 |
| [n8n](https://github.com/n8n-io/n8n) | 앱 연결과 워크플로 실행 | Sustainable Use License. 내부 사용과 고객용 호스팅·제품 통합의 조건을 구분해야 함 | 템플릿 참고 가능, 제품 재사용 조건 먼저 확인 |
| [Windmill](https://github.com/windmill-labs/windmill) | 스크립트 기반 업무·입력 폼·앱 구성 | 소스와 배포 바이너리의 조건이 다름. 배포 CE의 내부 사용과 재판매·서비스 포장 조건 구분 필요 | 제품 구조 참고, 무료 재포장 전제 제외 |
| [Kestra](https://github.com/kestra-io/kestra) | 이벤트·일정 기반 작업 통합 | Apache-2.0. 실행 인프라와 설정 필요 | 현재 규모에는 운영 부담이 클 가능성 |
| [Sim](https://github.com/simstudioai/sim) | AI 에이전트·워크플로 구성 | Apache-2.0 소스. 모델·외부 서비스·자체 운영 조건 별도 | AI 생성 제외 목표에서 우선순위 낮음 |
| [TagUI](https://github.com/aisingapore/TagUI) | 웹·데스크톱 RPA | Apache-2.0. README에 AI Singapore의 유지보수·지원 중단과 커뮤니티 지속 안내 | 신규 기반 1순위로 선택하지 않음 |

주요 근거:

- [Node-RED의 Express 내 실행 공식 예제](https://nodered.org/docs/user-guide/runtime/embedding), [라이선스](https://github.com/node-red/node-red/blob/main/LICENSE)
- [Automa 라이선스 경계](https://github.com/AutomaApp/automa/blob/main/LICENSE.txt)
- [Activepieces 라이선스 경계](https://github.com/activepieces/activepieces/blob/main/LICENSE), [공식 임베딩의 Enterprise 안내](https://github.com/activepieces/activepieces/blob/main/docs/overview/welcome.mdx), [Docker 설치 구성](https://github.com/activepieces/activepieces/blob/main/docs/install/options/docker-compose.mdx)
- [n8n 사용 라이선스](https://github.com/n8n-io/n8n/blob/master/LICENSE.md)
- [Windmill README의 사용 조건 안내](https://github.com/windmill-labs/windmill#readme)
- [TagUI 유지보수 안내](https://github.com/aisingapore/TagUI#readme)

라이선스 표기는 조사 시점의 문서 요약이다. 선택할 정확한 버전·파일·배포 방식과 타사 구성 요소에 적용되는 조건까지 검토한 법률 판단은 아니다.

## 업무 사례를 찾는 모음

1. [enescingoz/awesome-n8n-templates](https://github.com/enescingoz/awesome-n8n-templates): 메일·시트·고객 접수·마케팅 등 업무 사례와 JSON. AI 또는 외부 유료 API를 쓰는 항목도 많다. 모음에 포함됐다는 이유로 모든 항목의 권리가 같거나 무료 실행이 보장되지는 않는다.
2. [Zie619/n8n-workflows](https://github.com/Zie619/n8n-workflows): 분야별 검색과 워크플로 탐색·다운로드 구조 참고. 사이트에서 목록을 검색하는 것과 실제로 업무를 실행하는 것은 별개다. 저장소의 대규모 수량·실행 준비 완료 주장은 전수 검증하지 않았다.

## 실제 JSON까지 읽은 두 사례

### 고객 접수 → 대장 등록 + 안내 메일

[ClientFlow Lite JSON](https://github.com/enescingoz/awesome-n8n-templates/blob/main/Other_Integrations_and_Use_Cases/ClientFlow%20Lite%20-%20Client%20Onboarding%20Automation.json)

- POST 접수 → 입력 정리 → Gmail 고정 안내 문구 발송과 Google Sheets 기록으로 분기한다.
- 생성형 AI 없이 구성되어 있다. 원본 시작 방식은 버튼이 아닌 웹훅이다.
- 계정 연결과 시트·발신 정보 설정이 필요하다. 메일 입력 검증·중복 발송 방지·분기 실패 처리는 실서비스 기준으로 다시 확인해야 한다.
- 사례의 업무 흐름을 확인한 것이며 메일을 실제로 보내거나 계정에 연결하지 않았다.

### Airtable 변경 자료 → Google Sheets 갱신

[Airtable to Google Sheets Auto-Sync JSON](https://github.com/enescingoz/awesome-n8n-templates/blob/main/Google_Drive_and_Google_Sheets/Airtable%20to%20Google%20Sheets%20Auto-Sync.json)

- 수동 실행 → Airtable의 최근 수정 자료 검색 → 이메일을 기준으로 Sheets 반영하는 구성이다.
- 소개의 양방향 동기화 표현과 달리, 읽은 파일에는 **Airtable → Sheets 한 방향만** 있다.
- ID·계정 설정이 필요하다. 검색 기간, 키 중복, 삭제 반영, 노드 버전 호환성과 대량 처리 동작은 미검증이다.

## 비용과 배포에 대한 결론

사용자 PC에서 실행하면 소유자가 모든 사용자의 작업을 유료 서버로 처리하는 구조를 피할 수 있다. 대신 최초 설치와 계정 연결이 필요하고, PC가 꺼지면 로컬 작업은 진행되지 않는다. 외부 앱의 요금·할당량은 별개다.

ai-prod.live는 업무 선택·설명·설치 안내 화면으로 유지할 수 있다는 설계 가능성이 있다. 정적 화면만으로 임의의 Windows 앱·메일 계정·외부 사이트 작업까지 모두 처리할 수 있다고 보장하지 않는다. 공개 사이트에서 로컬 실행기를 호출한다면 허용 출처·명시적 연결·최소 권한·입력 검증이 필요하며, 해당 연결은 아직 구현·검증하지 않았다.

다음 구현 판단 전에 필요한 것은 선택한 실행 기반 하나와 실제 업무 하나의 전체 실행 검증이다. 검증된 업무가 늘어날 때 같은 선택 화면에 추가하는 방식이 적합하다. 현재 사이트와 AI_PROD_OS 소스는 이번 조사로 변경하지 않았다.
