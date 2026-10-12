# anim-gsap-scroll-fade

GSAP ScrollTrigger 기반 스크롤 페이드업 애니메이션. `data-bi-reveal` 속성이 있는 요소가 화면에 진입하면 자연스럽게 등장합니다.

## 사용법

```html
<link rel="stylesheet" href="style.css">

<div data-bi-reveal="up">아래에서 등장</div>
<div data-bi-reveal="left">왼쪽에서 등장</div>
<div data-bi-reveal="right" data-bi-delay="0.15">오른쪽에서 0.15초 지연</div>
<div data-bi-reveal="scale">확대되며 등장</div>

<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js"></script>
<script src="script.js"></script>
```

### 속성

| 속성 | 값 | 설명 |
|------|-----|------|
| `data-bi-reveal` | `up` / `left` / `right` / `scale` | 등장 방향 (기본 `up`) |
| `data-bi-delay` | 초 단위 숫자 (예: `0.2`) | 등장 지연 시간 |

- 한 번만 실행 (`once: true`), 스크롤 진입 지점 `top 88%`
- JS 로드 실패 시 요소가 숨겨지지 않고 정상 표시 (점진적 향상)
- `prefers-reduced-motion` 설정 시 애니메이션 없이 즉시 표시

## GSAP 버전 및 라이선스

- **GSAP 3.13.0 고정** (CDN):
  - https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js
  - https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js
- **GSAP Standard License** (Webflow 소유):
  - 2025-04-30 정책부터 **상업 이용 100% 무료** (SplitText 포함)
  - 오픈소스가 아님. 재배포 시 번들 내 저작권 고지 제거 금지
  - CDN 로드 권장 (이 자산은 CDN 로드 방식)
  - 공식 라이선스: https://gsap.com/standard-license
- 본 자산의 JS/CSS 코드는 BuildIt 오리지널이며, GSAP 라이브러리 본체는 위 라이선스를 따릅니다.

## 영감 출처

- 영감: `data-reveal` 패턴 (MIT, boccdotdev, https://github.com/boccdotdev/data-reveal)
- 본 자산의 모든 JS·CSS는 BuildIt이 100% 새로 작성한 오리지널 코드입니다.

## 파일

- `demo.html` — 독립 실행 데모 (학원 소개 스크롤 페이지)
- `style.css` — 초기 상태·방향 변형 스타일
- `script.js` — ScrollTrigger 연결 로직 (바닐라 JS, 빌드 불필요)
