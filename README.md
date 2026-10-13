# BuildIt2 — 디자인 자산 라이브러리

BuildIt AI 홈페이지 제작 서비스용 고품질 디자인 자산 카탈로그.

## 구조

```
buildit2/
├── catalog/
│   ├── assets.json       # 자산 메타데이터 (검색 태그·라이선스·호환성)
│   ├── categories.json   # 카테고리 정의
│   └── selected-10.md    # 1차 선정 10종 상세
├── assets/<id>/          # 자산 코드 (demo.html · style.css · script.js · README.md)
│                         #   id 접두: tmpl-(템플릿) · comp-(컴포넌트) · anim-(애니메이션)
├── previews/             # 미리보기 이미지 (최적화)
├── references/           # 라이선스 미확인 자산의 링크+분석
└── LICENSES/             # 라이선스 원문 및 고지
```

## 자산 현황

- 1차 선정: 10종 (템플릿 3, 컴포넌트 4, 애니메이션 3)
- 후보 조사: 30종 (상세는 `references/`)
- 모두 MIT/BSD-2-Clause 또는 상업 무료 라이선스 확인

## AI 검색

`catalog/assets.json`의 `tags`와 `natural_language_examples`를 사용:

- "고급스러운 학원 홈페이지" → `comp-hero-hyperui`, `tmpl-open-school`
- "강사진 소개를 카드로 바꿔줘" → `comp-team-tailblocks`
- "스크롤할 때 자연스럽게 등장하게 해줘" → `anim-gsap-scroll-fade`, `anim-slide-in-bottom`
- "합격자 수를 세는 효과로 보여줘" → `anim-gsap-counter`

## 라이선스 원칙

- 재배포 가능 자산만 코드 포함
- 라이선스 미확인 자산은 `references/`에 링크+분석만 기록
- 각 자산의 `LICENSES/` 고지 유지

## BuildIt 연동

> 데모(`demo.html`)에 들어 있는 학원명·강사·경력·수치·주소·전화번호는 **모두 가상의 예시**이며 실제 정보가 아니다. BuildIt에서는 회원이 입력한 값만 슬롯에 바인딩해 표시하고, 입력이 없으면 해당 영역/섹션을 내지 않는다(가짜 정보 생성 금지).
> `assets.json`의 `compatibility.buildit_renderer` 값은 독립 데모 기준 추정이며 BuildIt 적용 검증을 뜻하지 않는다. 적용 상태는 자산별 `buildit_integration`에 기록한다.

현재는 카탈로그만 제공. AI Agent 연결·운영 DB 등록은 별도 작업.

## Chart 교육자 데이터셋

- `chart-educators/` — BuildIt Chart(feel2real.co.kr/chart) 공개 카드 117명 원본+구조화 DB.
  교육철학·커리큘럼·수업방식·운영 방식의 실제 사례와 AI 분석(`knowledge/`),
  카탈로그 자산 매핑(`mapping/catalog_links.json`) 포함. 순위는 `meta.json`의 기준일(asOf) 기록.

기존 BuildIt 프리셋 10종(EXAM, ENGLISH, ARTS, STUDY, ONLINE, MINIMAL, DARK, WARM, PHOTO, DYNAMIC)과는 보완 관계 (테마 vs 구현체).
