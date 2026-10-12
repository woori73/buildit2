# comp-nav-footer-hyperui — 내비게이션 + 푸터

## 개요
상단 고정 내비게이션(로고 + 메뉴 + 햄버거 모바일 메뉴)과 하단 사업자 정보 푸터. 바닐라 JS 약 10줄로 모바일 메뉴 토글. 순수 HTML/CSS.

## 파일
- `demo.html` — 독립 실행 데모 (JS 포함)
- `style.css` — 바닐라 CSS (Tailwind 미사용)

## 사용법
1. `style.css`의 `.bi-nav` / `.bi-footer` 관련 스타일을 프로젝트에 복사
2. `demo.html`의 `<header class="bi-nav">`와 `<footer class="bi-footer">` 블록을 삽입
3. `demo.html` 하단의 `<script>` 토글 코드를 함께 복사 (ID: `biNavToggle`, `biNavMenu` 유지)

## 클래스 구조
| 클래스 | 용도 |
|---|---|
| `.bi-nav` | 상단 내비 래퍼 (sticky) |
| `.bi-nav__inner` | 내비 컨테이너 |
| `.bi-nav__logo` | 로고 |
| `.bi-nav__toggle` | 햄버거 버튼 (모바일만 표시) |
| `.bi-nav__menu` / `.bi-nav__menu--open` | 메뉴 목록 / 열림 상태 |
| `.bi-nav__link` | 메뉴 링크 |
| `.bi-nav__cta` | 상담신청 버튼 |
| `.bi-footer` | 푸터 래퍼 |
| `.bi-footer__info` | 사업자 정보 (`<dl>`) |
| `.bi-footer__links` | 약관 링크 |
| `.bi-footer__copyright` | 저작권 문구 |

## 반응형
- PC (761px~): 가로 메뉴
- 모바일 (760px 이하): 햄버거 버튼 + 드롭다운 메뉴 (X 애니메이션 포함)

## 접근성
- `aria-expanded`, `aria-controls`, `aria-label`로 메뉴 상태 전달
- `<dl>` 시맨틱 태그로 사업자 정보 구조화

## 사업자 정보 안내
푸터의 상호·대표자·사업자등록번호·주소·전화번호는 **데모용 가상 정보**입니다. 실제 사용 시 반드시 실제 사업자 정보로 교체하세요.

## 영감 출처 및 라이선스
- 영감: HyperUI nav/footer 섹션 (MIT License) — 레이아웃 패턴만 참고
- **이 컴포넌트의 코드는 100% 오리지널 작성**이며 복사된 코드가 없습니다
- 이 컴포넌트 자체는 MIT 라이선스로 재배포 가능합니다
