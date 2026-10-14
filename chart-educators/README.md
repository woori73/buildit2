# chart-educators — BuildIt Chart 교육자 데이터베이스

BuildIt Chart(https://feel2real.co.kr/chart)에 등록된 실제 영어교육자의 카드 원본을 보존하고,
BuildIt 홈페이지 제작 AI Agent가 검색·학습할 수 있게 구조화된 데이터셋이다.

## 수집 기준

- 출처 사이트: https://feel2real.co.kr/chart (공개 카드만 수집, 운영 DB 미변경)
- 순위 기준일: `meta.json`의 `rankAsOf` (Chart 주 단위 갱신 — 순위는 변동될 수 있음)
- 수집일: `meta.json`의 `collectedAt`
- 카드 원문은 수정하지 않았다. 원문 없음 = 카드에 없는 정보이며, 추측으로 채우지 않는다.

## 구조

```
chart-educators/
├── README.md              # 이 문서
├── meta.json              # 기준일·publicationId·판정 기준(criteria)·집계
├── educators.json         # 교육자 117명 통합 레코드 (id 키) — 검색/활용용
├── index.json             # 이름·학원·지역·순위 초록 인덱스
├── quality_report.json    # 중복 카드·누락(원본 미기재) 필드 목록 — 재수집 체크리스트
├── raw/                   # 원본 보존 (API 응답 그대로)
│   ├── publication.json   # TOP100 공개 판정 (weeklyUpdateDate 기준)
│   ├── criteria.json      # BuildIt Score 판정 기준
│   ├── regions.json       # 시·도 / 시·군·구별 교육자 수
│   ├── educators/{id}.json  # 상세 카드 API 원본 (117)
│   ├── rankings/{id}.json   # 순위 API 원본 (117)
│   └── search/{시도}.json    # 지역별 검색 응답 원본 (12)
├── knowledge/             # AI 분석 결과 (원본과 분리)
│   └── *.md               # 유형별 사례 분석 — 인용 시 반드시 educators.json id로 출처 표기
├── agent/                 # 홈페이지 제작 Agent 연동 레이어 (retrievable/설계/시뮬레이터)
└── mapping/
    └── catalog_links.json # 교육자 특성 ↔ buildit2 디자인 자산(tmpl/comp/anim) 매핑
```

## agent/ — 홈페이지 제작 Agent 연동 레이어

`agent/`는 buildit2의 `chart-educators`를 운영 홈페이지 제작 Agent(Phase 5A/5B)의
Context/Prompt 단계에 연결하기 위한 검색 레이어다. 구현은
`feel2real-buildit` PR #661(`feat/chart-educator-kb-integration`)로 완료 —
**머지·운영 배포는 별도 승인 대기 중**.

- `retrievable.json` — 본문 없는 40건·researchPending 17건·중복(id 81→80 흡수)을 제외한
  학습 가능한 **59건**만 수록. 순위 점수만 있고 근거 본문이 없는 카드는 참조 후보에서 배제해
  Agent 학습 품질을 보호한다.
- `INTEGRATION_DESIGN.md` — 기존 Agent 흐름 재사용 설계, 운영 코드 변경 파일 목록(보류), 승인 항목.
- `simulate_retrieval.py` — 사례검색→구성추천→Prompt블록→PENDING_USER_APPROVAL 검증 하네스(읽기 전용).

운영 Agent는 새 Task·엔드포인트 없이 `AcademyAiContext`에 `referenceExamples`로 주입되고,
`[참고 사례]` 금지 조항으로 다른 교육자의 이름·수치·실적·프로그램명 유출을 차단한다(§4).

## 레코드 스키마 (educators.json)

| 필드 | 내용 |
|---|---|
| `id`, `source.cardUrl` | 카드 식별자·원본 URL |
| `name` `role` `academyName` `province` `cityDistrict` `activityRegion` | 교육자·학원·지역 |
| `rank.*` | 전국/지역 순위, BuildIt Score, previousRank, 기준일(asOf) |
| `card.educationPhilosophy` | 교육철학 (원문) |
| `card.curriculum` | 커리큘럼 구성 방식 (원문) |
| `card.distinctiveTeaching` | 실제 수업 방식·교수법 (원문) |
| `card.recentActivity`, `card.evidence` | 운영·활동 기록과 근거 URL |
| `card.strengths` `card.improvementSuggestions` | 차별화 강점 / 개선 제안 |
| `card.discoveryReason` | 발견 경위 (학원 운영 방식 단서 포함) |
| `card.officialChannels` | 블로그·YouTube 등 원본 채널 |
| `chartExtras` | TOP100 판정 부가(scoreBreakdown, evidenceJson) |
| `researchPending` | true = 카드 본문 미기재가 많음(재수집 대상) |

## Agent 활용 규칙

1. **원본 vs 분석 분리**: `educators.json`/`raw/`는 원문, `knowledge/`는 AI 분석이다.
   홈페이지 문구로 인용할 때 타 교육자의 실제 경험을 의뢰 학원장의 사실처럼 쓰지 말 것 —
   `knowledge/`와 `mapping/`의 각 사례에는 출처 id와 적용 대상 구분이 명시돼 있다.
2. ** 없는 정보 생성 금지**: 카드에 없는 필드(예: 학부모 소통 방식)는 해당 교육자 레코드에
   없으므로 추정 문구를 만들지 않는다. `quality_report.json`의 누락 목록参照.
3. **순위 사용**: 순위는 `asOf` 시점 기록이다. 현재 표시가 필요하면 Chart 재조회.
4. **검색 진입점**: `index.json`(이름/지역/순위) → `educators.json[id]`, 또는
   `knowledge/*.md`의 유형 분류 → 사례 id → 레코드 원문.

## 집계 (수집 시점)

- 지역 검색으로 확인한 전체 카드: **117명** (12개 시·도, 누락·접근 실패 0)
- 순위 판정(RANKED) 100명 / 조사 대기(researchPending) 17명
- 중복 의심: id 80·81 (동일인 추정, 원본 보존)
