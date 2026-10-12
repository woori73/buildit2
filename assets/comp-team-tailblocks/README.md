# comp-team-tailblocks — 강사진 카드 그리드

## 개요
강사진 소개 카드 4종 그리드. 사진 플레이스홀더(이니셜 아바타) + 이름 + 과목 + 경력. 순수 HTML/CSS.

## 파일
- `demo.html` — 독립 실행 데모
- `style.css` — 바닐라 CSS (Tailwind 미사용)

## 사용법
1. `style.css`의 `.bi-team` 관련 스타일을 프로젝트에 복사
2. `demo.html`의 `<section class="bi-team">` 블록을 원하는 위치에 삽입
3. `.bi-team__photo` 플레이스홀더를 실제 강사 사진(`<img>`)으로 교체 가능

## 클래스 구조
| 클래스 | 용도 |
|---|---|
| `.bi-team` | 섹션 래퍼 |
| `.bi-team__header` | 섹션 헤더 (소제목·제목·설명) |
| `.bi-team__grid` | 카드 그리드 (`<ul>`) |
| `.bi-team__card` | 개별 강사 카드 |
| `.bi-team__photo` | 사진 플레이스홀더 (그라데이션 아바타) |
| `.bi-team__name` | 강사 이름 |
| `.bi-team__subject` | 담당 과목 뱃지 |
| `.bi-team__career` | 경력 설명 |

## 반응형
- PC (961px~): 4열
- 태블릿 (561~960px): 2열
- 모바일 (560px 이하): 1열

## 영감 출처 및 라이선스
- 영감: TailBlocks team 섹션 (MIT License) — 레이아웃 패턴만 참고
- **이 컴포넌트의 코드는 100% 오리지널 작성**이며 복사된 코드가 없습니다
- 이 컴포넌트 자체는 MIT 라이선스로 재배포 가능합니다
