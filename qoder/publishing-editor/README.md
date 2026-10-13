# BuildIt 출판 편집기 (DesignCraft) — Qoder 독립 개발분

> 2026-10-14 · `qoder-tech-spec.md` 구현 범위 Q1~Q8 · **Mock 전용, 백엔드 미연결**
> 모든 화면 데이터는 Mock이며, 상단 `Mock` 배지와 페이지 워터마크로 표시된다.

## 실행

```bash
# 아무 정적 서버로 실행 (index.html 직접 열어도 동작)
python -m http.server 8014
# → http://127.0.0.1:8014/index.html
```

데모용 샘플 원고: `test-manuscript.md` (드롭존에 끌어다 놓기)

## 파일 구성 (BuildIt 배치는 문서 3장 기준)

| 이 프로젝트 경로 | 운영 배치 경로 (통합 시) |
|---|---|
| `index.html` | `src/main/resources/templates/tutor/publishing_editor.html` |
| `css/publishing_editor.css` | `src/main/resources/static/css/publishing_editor.css` |
| `js/publishing_mock.js` | (mock 전용 — 통합 시 제거 대상) |
| `js/publishing_api.js` | `src/main/resources/static/js/publishing_api.js` |
| `js/publishing_editor.js` | `src/main/resources/static/js/publishing_editor.js` |

- 1차 산출물은 Thymeleaf 단편(fragments/head·account_menu)을 쓰지 않는 독립 HTML이다.
  통합 시 `<head>`/상단바를 기존 tutor 셸 프래그먼트로 교체하고 상대 경로를 `/css/…`, `/js/…`로 바꾼다.
- 외부 폰트/CDN 의존 없음. 시스템 폰트 스택(DESIGN.md 기준).

## 기능 (F1~F8) — 전부 Mock 시연 가능

1. **F1 프로젝트 생성·목록** — 템플릿 3종(A4 교재/B5 문제집/46판) 선택, job QUEUED→RUNNING→DONE 폴링(2s)
2. **F2 원고 반입** — md·txt·docx·rtf 드롭/선택 → 스타일 매핑 미리보기 모달 → `file.place` 반입
3. **F3 미리보기** — 쪽 이동, 50~200% 확대, 대향(짝수 왼쪽) 보기, 저해상도 썸네일 레일
4. **F4 스타일** — 문단 13종(`ko-body`…`ko-time`)·글자 5종, Noto Sans KR 고정(변경 UI 없음)
5. **F5 AI 수정** — 채팅 → `ai/plan`(미실행) → 계획 미리보기 카드 → **승인 시에만** `revisions` 적용 + 자동 스냅샷. 판형·마스터·폰트 요청은 allowlist 차단
6. **F6 검수** — preflight 결과(overset/missingGlyphs/lowPpi) → `missingGlyphs>0`이면 PDF 버튼 비활성
7. **F7 출력** — PDF/X-4·A-2b·일반 선택 → export job → 산출물 목록 + 다운로드(Mock은 실제 유효한 1페이지 PDF blob)
8. **F8 버전** — 모든 적용 전 스냅샷, 버전 목록·복원(복원 전 현재 상태도 스냅샷)

Mock 검증 시나리오: 검수 탭의 "Mock 시나리오" 셀렉터(빠짐 글리프/정상/넘침만)로
PDF 안전망 ON/OFF를 모두 재현. "7쪽 글리프 문제 해결해줘" → 승인 → 재검수 흐름이 대표 데모.

## 반응형

- ≥1181px: 좌 240 / 중앙 1fr / 우 360 3열
- 761~1180px: 우 패널 하단 전폭
- ≤760px: 미리보기 → 썸네일 가로 레일 → 탭 패널 스택, 390px 가로 스크롤 없음(실측 PASS)

## Mock 전환

`js/publishing_api.js` 상단 `var USE_MOCK = true;` 하나만 `false`로 바꾸면
전 함수가 명세 4장의 `/api/publishing/*` REST 경로로 전환된다.
상세 계약·갭은 `docs/API_INTEGRATION.md` 참조.

## 하지 않은 것 (명세 6장 범위 구분)

백엔드 Java, DB, Publishing Worker, AI 프롬프트/모델 연동, CLI 호출, 배포,
EPUB·중철 제본(P2), WebSocket/SSE(P2), 루비·모지쿠미(엔진 미지원).
