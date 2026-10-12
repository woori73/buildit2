# BuildIt2 — 디자인 자산 라이브러리

BuildIt AI 홈페이지 제작 서비스용 고품질 디자인 자산 카탈로그.

## 구조

```
buildit2/
├── catalog/
│   ├── assets.json       # 자산 메타데이터 (검색 태그·라이선스·호환성)
│   ├── categories.json   # 카테고리 정의
│   └── selected-10.md    # 1차 선정 10종 상세
├── templates/            # 홈페이지 템플릿 (유형별)
├── components/           # UI 컴포넌트 (용도별)
├── animations/           # 웹 애니메이션 (기술별)
├── previews/            # 미리보기 이미지 (최적화)
├── references/          # 라이선스 미확인 자산의 링크+분석
└── LICENSES/            # 라이선스 원문 및 고지
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

현재는 카탈로그만 제공. AI Agent 연결·운영 DB 등록은 별도 작업.

기존 BuildIt 프리셋 10종(EXAM, ENGLISH, ARTS, STUDY, ONLINE, MINIMAL, DARK, WARM, PHOTO, DYNAMIC)과는 보완 관계 (테마 vs 구현체).
