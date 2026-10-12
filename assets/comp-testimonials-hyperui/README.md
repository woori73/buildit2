# comp-testimonials-hyperui — 합격 후기 그리드

## 개요
합격 후기 카드 3종 그리드. 인용문 + 익명 작성자 + 합격 학교 + 별점. `blockquote` 시맨틱 태그 사용. 순수 HTML/CSS.

## 파일
- `demo.html` — 독립 실행 데모
- `style.css` — 바닐라 CSS (Tailwind 미사용)

## 사용법
1. `style.css`의 `.bi-testimonials` 관련 스타일을 프로젝트에 복사
2. `demo.html`의 `<section class="bi-testimonials">` 블록을 원하는 위치에 삽입
3. 후기 문구·작성자·합격 학교를 실제 내용으로 교체

## 클래스 구조
| 클래스 | 용도 |
|---|---|
| `.bi-testimonials` | 섹션 래퍼 |
| `.bi-testimonials__header` | 섹션 헤더 |
| `.bi-testimonials__grid` | 카드 그리드 (`<ul>`) |
| `.bi-testimonials__card` | 개별 후기 카드 |
| `.bi-testimonials__stars` | 별점 (★ 문자) |
| `.bi-testimonials__quote` | 인용문 (`<blockquote>`) |
| `.bi-testimonials__author` | 작성자 영역 |
| `.bi-testimonials__avatar` | 작성자 아바타 (이니셜) |
| `.bi-testimonials__name` / `.bi-testimonials__school` | 작성자명 / 합격 학교 |

## 반응형
- PC (901px~): 3열
- 태블릿·모바일 (900px 이하): 1열 (최대 너비 560px 중앙 정렬)

## 접근성
- `blockquote` 시맨틱 태그로 인용문 구조 표현
- 별점에 `aria-label`로 점수 명시

## 영감 출처 및 라이선스
- 영감: HyperUI testimonials 섹션 (MIT License) — 레이아웃 패턴만 참고
- **이 컴포넌트의 코드는 100% 오리지널 작성**이며 복사된 코드가 없습니다
- 이 컴포넌트 자체는 MIT 라이선스로 재배포 가능합니다
