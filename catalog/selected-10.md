# BuildIt 디자인 에셋 — 최종 선정 10종

선정 기준: 명확한 재배포 라이선스(MIT/BSD) + 순수 HTML/CSS/JS (BuildIt 렌더러 직접 호환) + 학원 적합성 + 한글/모바일 대응

## 템플릿 3종

### T1. open-school-website-template
- ID: `tmpl-open-school`
- 출처: https://github.com/dimartarmizi/open-school-website-template
- 라이선스: MIT (재배포 가능)
- 유형: 종합학원·학교형 멀티페이지
- 특징: Tailwind, 반응형, 섹션 완비
- 한글: 폰트 교체 필요 (Titillium Web → Noto Sans KR)
- 호환성: ★★★ (순수 HTML/CSS/JS)
- 태그: 종합학원, 학교형, 멀티페이지, 반응형

### T2. demo_school
- ID: `tmpl-demo-school`
- 출처: https://github.com/abneesh/demo_school
- 라이선스: MIT (재배포 가능)
- 유형: 학교형, 모바일 퍼스트
- 특징: CSS 변수 테마, 외부 의존성 최소
- 한글: 폰트 교체 필요
- 호환성: ★★★ (순수 HTML/CSS)
- 태그: 학교형, 모바일퍼스트, 경량, CSS변수

### T3. tailwind-landing-page
- ID: `tmpl-minimal-landing`
- 출처: https://github.com/tailwindtoolbox/Landing-Page
- 라이선스: MIT (재배포 가능)
- 유형: 미니멀 랜딩 (단일 HTML)
- 특징: Tailwind CDN, 즉시 렌더 가능
- 한글: 폰트 교체 필요
- 호환성: ★★★ (단일 HTML)
- 태그: 미니멀, 랜딩, 단일페이지, 경량

## 컴포넌트 4종

### C1. hyperui-hero
- ID: `comp-hero-hyperui`
- 출처: http://tailkits.com/components/hyperui/
- 라이선스: MIT (재배포 가능)
- 유형: 히어로 섹션 (2열 변형)
- 특징: 좌측 텍스트+우측 이미지, JS 없음
- 한글: 우수 (순수 HTML)
- 호환성: ★★★
- 태그: 히어로, 2열, CTA, 반응형

### C2. tailblocks-team
- ID: `comp-team-tailblocks`
- 출처: https://dev.to/themesberg/free-tailwind-css-themes-and-templates-26ll
- 라이선스: MIT (재배포 가능)
- 유형: 강사진 소개 카드 그리드
- 특징: 사진+이름+과목+경력, 다크/라이트 모드
- 한글: 우수
- 호환성: ★★★
- 태그: 강사진, 카드, 그리드, 팀소개

### C3. hyperui-testimonials
- ID: `comp-testimonials-hyperui`
- 출처: http://tailkits.com/components/hyperui/
- 라이선스: MIT (재배포 가능)
- 유형: 합격 후기 그리드
- 특징: 인용문+작성자+별점, 정적 안정형
- 한글: 우수
- 호환성: ★★★
- 태그: 후기, 합격실적, 인용문, 그리드

### C4. hyperui-nav-footer
- ID: `comp-nav-footer-hyperui`
- 출처: http://tailkits.com/components/hyperui/
- 라이선스: MIT (재배포 가능)
- 유형: 내비게이션 + 푸터
- 특징: 사업자 정보 영역 포함, 햄버거 메뉴
- 한글: 우수
- 호환성: ★★★ (모바일 토글용 바닐라 JS 10줄)
- 태그: 내비게이션, 푸터, 사업자정보, 햄버거메뉴

## 애니메이션 3종

### A1. css-slide-in-bottom
- ID: `anim-slide-in-bottom`
- 출처: https://animista.net (Ana Travas)
- 라이선스: BSD-2-Clause (재배포 가능, 고지 유지)
- 유형: 스크롤 등장 (slide-up)
- 특징: GPU 가속, 1KB, 스태거 지원
- 접근성: prefers-reduced-motion 게이트 필요
- 호환성: ★★★ (순수 CSS)
- 태그: 스크롤등장, 카드그리드, 스태거
- 자연어: "카드들이 아래에서 차례대로 올라오게 해줘"

### A2. gsap-scroll-fade-up
- ID: `anim-gsap-scroll-fade`
- 출처: https://github.com/boccdotdev/data-reveal (MIT)
- 라이선스: MIT 예제 + GSAP Standard (상업 무료, CDN 로드)
- 유형: 스크롤 순차 페이드업 (ScrollTrigger.batch)
- 특징: data 속성 선언형, once 실행
- 접근성: gsap.matchMedia 분기 필요
- 호환성: ★★★ (바닐라 JS, 빌드 불필요)
- 태그: 스크롤등장, 순차등장, data속성
- 자연어: "스크롤할 때 자연스럽게 등장하게 해줘"

### A3. gsap-counter-up
- ID: `anim-gsap-counter`
- 출처: https://github.com/boccdotdev/data-reveal (MIT)
- 라이선스: MIT 예제 + GSAP Standard (상업 무료, CDN 로드)
- 유형: 숫자 카운트업
- 특징: data-count 속성 하나, 천단위 구분자 지원
- 접근성: reduced-motion 시 즉시 최종값
- 호환성: ★★★ (바닐라 JS)
- 태그: 숫자애니메이션, 합격자수, 카운트업
- 자연어: "합격자 수를 세는 효과로 보여줘"

## 제외된 후보 (참고용)

라이선스 불확실 또는 조건부 (코드 복사 금지, 링크+분석만):
- shadcnblocks Hero125 (라이선스 불확실)
- coaching-landing-template (LICENSE 없음)
- shadcn-ui-landing-page, nextjs-tailwind-website-templates (구조 참고용)
- css-fade-up (Hippocratic 2.1, v3.7.2 MIT 버전으로 대체 가능)
- css-hover-lift (v2.1.0 이하만 MIT)
- Motion 3종 (예제 코드 무표기, 패턴 재작성 필요)
- shadcn Button/Accordion, DaisyUI Card, Magic UI 2종 (React 의존, 변환 필요)

## BuildIt 프리셋 10종과의 관계

기존 프리셋 (EXAM, ENGLISH, ARTS, STUDY, ONLINE, MINIMAL, DARK, WARM, PHOTO, DYNAMIC)은 색상·타이포·레이아웃 테마이다.
이번 선정 자산은 실제 HTML/CSS 구현체로, 프리셋의 시각적 변형을 구현하는 재료가 된다. 중복이 아닌 보완 관계.
