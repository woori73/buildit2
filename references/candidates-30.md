# 조사 후보 30종 — 전체 목록

1차 선정 10종은 `catalog/assets.json` 참조. 아래는 선정되지 않은 20종의 링크+분석 (코드 미포함).

## 템플릿 (선정 외 7종)

### EduHub (React 교육기관 템플릿)
- URL: https://github.com/themixlyweb/react-education-ngo-school-website-template
- 라이선스: MIT (재배포 가능)
- 제외 사유: React 19 의존. 디자인 구조 참고용으로만 적합.
- 유형 매핑: 종합학원

### shadcn-landing-page (leoMirandaa)
- URL: https://github.com/leoMirandaa/shadcn-landing-page
- 라이선스: MIT (직접 확인)
- 제외 사유: React+TS+shadcn. 프리미엄 랜딩 디자인 참고용.
- 유형 매핑: 프리미엄, 영어회화

### School-template (Ownerlost)
- URL: https://github.com/Ownerlost/School-template
- 라이선스: MIT
- 제외 사유: PHP 백엔드 의존. 폼 UX 참고용.
- 유형 매핑: 학교형

### coaching-landing-template (hemant1972)
- URL: https://github.com/hemant1972/coaching-landing-template
- 라이선스: **미확인 (LICENSE 파일 없음) — 코드 복사 금지**
- 참고: 입시 코칭 학원 특화도 최고. 섹션 구조(코스·강사진·후기·상담폼)만 참고.
- 유형 매핑: 입시·내신

### shadcn-ui-landing-page (akash3444)
- URL: https://github.com/akash3444/shadcn-ui-landing-page
- 라이선스: 미확인 — 구조 참고용
- 유형 매핑: 프리미엄

### nextjs-tailwind-website-templates (cekuu35)
- URL: https://github.com/cekuu35/nextjs-tailwind-website-templates
- 라이선스: 미확인 — 20종 중 Online Course 템플릿 구조 참고용
- 유형 매핑: 온라인 강의형

### nextjs-tailwind-course-details-page (Creative Tim)
- URL: https://github.com/creativetimofficial/nextjs-tailwind-course-details-page
- 라이선스: 미확인 — 커리큘럼 섹션 디자인 참고용
- 유형 매핑: 커리큘럼

## 컴포넌트 (선정 외 6종)

### shadcnblocks Hero125
- URL: https://github.com/sobshdev/audio-anything (shadcnblocks 레지스트리)
- 라이선스: **불확실 (API 키 언급) — 코드 복사 금지**
- 참고: 중앙형 히어로 구조만 참고

### shadcn/ui Button
- URL: https://ui.shadcn.com/docs
- 라이선스: MIT (재배포 가능)
- 제외 사유: React 의존. Tailwind 클래스 추출로 활용 가능. 2차 후보.
- 유형: CTA 버튼

### Magic UI ShimmerButton
- URL: https://github.com/clegleg/ui-4-u (Magic UI)
- 라이선스: MIT (Free 티어)
- 제외 사유: React+Motion 의존. CSS 키프레임으로 재구현 가능. 2차 후보.
- 유형: 애니메이션 CTA

### DaisyUI Card
- URL: https://github.com/saadeghi/daisyui
- 라이선스: MIT (재배포 가능)
- 제외 사유: Tailwind 플러그인 필요. 2차 후보.
- 유형: 카드

### Magic UI Marquee
- URL: https://github.com/clegleg/ui-4-u (Magic UI)
- 라이선스: MIT (Free 티어)
- 제외 사유: React 의존. CSS @keyframes로 재구현 가능. 2차 후보.
- 유형: 후기 티커

### shadcn/ui Accordion
- URL: https://ui.shadcn.com/docs
- 라이선스: MIT (재배포 가능)
- 제외 사유: React+Radix 의존. 바닐라 JS 재구현 필요. 2차 후보.
- 유형: FAQ

## 애니메이션 (선정 외 7종)

### css-fade-up (Animate.css)
- URL: https://github.com/animate-css/animate.css
- 라이선스: **Hippocratic 2.1 (현행) / v3.7.2까지 MIT**
- 제외 사유: 라이선스 조건부. v3.7.2 keyframes 추출 시 사용 가능. 2차 후보.

### css-puff-in (Magic CSS)
- URL: https://github.com/miniMAC/magic
- 라이선스: MIT
- 제외 사유: 1차 3종으로 충분. 모달·팝업용으로 2차 후보.

### css-hover-lift (Hover.css)
- URL: https://github.com/IanLunn/Hover
- 라이선스: **MIT (v2.1.0 이하만) — 버전 핀 필수**
- 제외 사유: 1차 3종으로 충분. 2차 후보.

### motion-fade-up-scroll / motion-stagger-hero / motion-hover-spring-card
- URL: https://motion.dev/docs
- 라이선스: Motion 본체 MIT / 예제 코드 무표기 (재작성 필요)
- 제외 사유: React 필수. BuildIt 렌더러 스택 확인 후 바닐라 대체안 설계 필요.

### gsap-text-mask-reveal
- URL: gsap.com 공식 패턴
- 라이선스: GSAP Standard (상업 무료)
- 제외 사유: 1차 3종으로 충분. 히어로 텍스트 효과용 2차 후보.

## 공통 관찰

- 한글 적합성: 모든 후보가 라틴 폰트 기준. Noto Sans KR 매핑 필수.
- BuildIt 직접 렌더 가능 (순수 HTML/CSS/JS): 템플릿 3종이 즉시 활용도 최고.
- 외부 이미지/폰트: Unsplash 등 데모 에셋은 라이선스 확인 후 교체 필요.
