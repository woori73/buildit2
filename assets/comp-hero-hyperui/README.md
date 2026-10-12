# comp-hero-hyperui — 2열 히어로 섹션

## 개요
학원 홈페이지 최상단 히어로 섹션. 좌측 텍스트 + 우측 비주얼의 2열 구조, 이중 CTA 버튼 포함. JS 없음, 순수 HTML/CSS.

## 파일
- `demo.html` — 독립 실행 데모
- `style.css` — 바닐라 CSS (Tailwind 미사용)

## 사용법
1. `style.css`의 `.bi-hero` 관련 스타일을 프로젝트에 복사
2. `demo.html`의 `<section class="bi-hero">` 블록을 원하는 위치에 삽입
3. Noto Sans KR 폰트 링크 유지 (또는 프로젝트 폰트로 교체)

## 클래스 구조
| 클래스 | 용도 |
|---|---|
| `.bi-hero` | 섹션 래퍼 |
| `.bi-hero__inner` | 2열 그리드 컨테이너 |
| `.bi-hero__badge` | 모집 안내 뱃지 |
| `.bi-hero__title` / `.bi-hero__accent` | 헤드라인 / 강조 텍스트 |
| `.bi-hero__desc` | 설명 문단 |
| `.bi-hero__actions` | CTA 버튼 그룹 |
| `.bi-hero__btn--primary` / `--secondary` | 상담신청 / 커리큘럼 버튼 |
| `.bi-hero__visual` | 우측 이미지 플레이스홀더 (그라데이션) |
| `.bi-hero__visual-caption` | 실적 카드 오버레이 |

## 반응형
- 820px 이하: 1열 전환 (비주얼이 위로 배치)
- 420px 이하: CTA 버튼 전체 너비 세로 배치

## 영감 출처 및 라이선스
- 영감: HyperUI hero 섹션 (MIT License) — 레이아웃 패턴만 참고
- **이 컴포넌트의 코드는 100% 오리지널 작성**이며 복사된 코드가 없습니다
- 이 컴포넌트 자체는 MIT 라이선스로 재배포 가능합니다
