# anim-gsap-counter

GSAP 기반 숫자 카운트업 애니메이션. `data-bi-count` 속성의 숫자가 스크롤 진입 시 0부터 목표값까지 셉니다.

## 사용법

```html
<link rel="stylesheet" href="style.css">

<span class="bi-counter" data-bi-count="1250" data-bi-suffix="명">1,250명</span>

<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/gsap.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/gsap@3.13.0/dist/ScrollTrigger.min.js"></script>
<script src="script.js"></script>
```

### 속성

| 속성 | 예 | 설명 |
|------|-----|------|
| `data-bi-count` | `"1250"` | 목표 숫자 (필수) |
| `data-bi-suffix` | `"명"` | 뒤에 붙는 단위 |
| `data-bi-prefix` | `"약 "` | 앞에 붙는 문자 |
| `data-bi-decimals` | `"1"` | 소수점 자릿수 (기본 0) |
| `data-bi-format` | `"plain"` | `"plain"`이면 천단위 구분자 없음 (기본 구분자 사용) |
| `data-bi-duration` | `"2"` | 카운트 지속 시간(초, 기본 1.6) |

- 스크롤 진입(`top 90%`) 시 한 번만 실행
- `font-variant-numeric: tabular-nums`로 숫자 폭 고정 (깜빡임 방지)
- GSAP 로드 실패 시에도 최종값을 즉시 표시 (점진적 향상)
- `prefers-reduced-motion` 설정 시 애니메이션 없이 즉시 최종값 표시

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

- 영감: `data-reveal` 카운터 패턴 (MIT, boccdotdev, https://github.com/boccdotdev/data-reveal)
- 본 자산의 모든 JS·CSS는 BuildIt이 100% 새로 작성한 오리지널 코드입니다.

## 파일

- `demo.html` — 독립 실행 데모 (학원 실적 통계 4종)
- `style.css` — 카운터 스타일
- `script.js` — 카운트업 로직 (바닐라 JS, 빌드 불필요)
