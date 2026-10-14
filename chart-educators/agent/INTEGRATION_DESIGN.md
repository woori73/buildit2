# Chart 교육자 지식 DB ↔ 홈페이지 제작 Agent 연동 설계

작성일 2026-10-14 · 상태: **설계+로컬 시뮬레이션 완료, 운영 코드 변경은 승인 대기**

## 1. 기존 Agent 작업 흐름 (feel2real-buildit 운영 저장소, 그대로 재사용)

```
Builder UI(academy_builder.js)
→ AcademyAiGuideService / AcademyAiProposalService / AcademyAiSuggestionService   (Phase 5A/5B)
→ AcademyAiContextService   … 본인 Academy 상태 → normalized context (A급 필드만)
→ AcademyAiPromptBuilder    … Task별 프롬프트(GUIDE_TEXT, ACADEMY_COMPOSE 등 4종)
→ WikiRouterAcademyAiProvider(AI Router)
→ 응답 JSON 파싱·allowlist 검증(EDITABLE_TEXT_TARGETS, NON_EDITABLE_SECTION_IDS)
→ proposal 표시 → 사용자가 Builder에서 승인·적용(PUT /api/tutor/academy 경로만)
```

**새 Agent·새 Task·새 엔드포인트를 만들지 않는다.** 교육자 지식은 Context→Prompt 구간의
"참고 사례(reference examples)" 입력으로만 주입하고, 기존 지시 사항(instructions)·allowlist·
승인 흐름을 그대로 지난다.

## 2. 데이터 계층과 품질 보호

| 계층 | 파일 | 내용 |
|---|---|---|
| 원본 | `../educators.json`, `../raw/` | 117명 전체(변경 없음) |
| **검색 전용** | `retrievable.json` | **59명만** — 학습에 안전한 카드 |
| 제외 대장 | `retrievable.json` `excluded` | 본문 전무 40 · researchPending 17 · 중복 id 81(80 유지) |

- 본문 없는 카드는 참조 후보에서 원천 차단(수치·사실 없이 이름만 남는 카드가 문구에 스며드는 것 방지).
- 80·81 중복: 동일인이므로 상위 순위(id 80) 카드만 노출. 재수집 시 `quality_report.json`으로 판정.
- `usableReference: true` 레코드만 검색 대상. 순위·점수는 `rankAsOf`(2026-09-14) 시점 기록.

## 3. 검색·추천 파이프라인 (재사용 지점)

1. **사례 검색**: 학원장 프로필(과목·지역·대상·강조 문구) → classification 태그 매칭 +
   지역 가중 + 카드 원문 키워드 → top-K(기본 3~5). 구현 참고: `simulate_retrieval.py`
2. **구성 추천**: 검색된 사례의 특성(trait) → `../mapping/catalog_links.json` →
   디자인 자산(tmpl/comp/anim) + 섹션 골격. trait는 상위 3개만 사용(과다 추천 방지).
3. **문구 작성**: PromptBuilder의 GUIDE_TEXT/ACADEMY_COMPOSE 프롬프트에
   `[참고 사례]` 블록 주입(§4 규칙 포함). 문구 슬롯은 학원장 입력값만 채움.
4. **사용자 승인**: 기존 proposal→apply 경로. 지식 계층에는 적용 권한이 없다.

## 4. 출처 보호 규칙 (프롬프트에 고정 삽입)

- 참고 사례의 **이름·수치·실적·프로그램명·학원명을 출력 문구에 포함 금지** —
  구조(예: "반대/지향 대비문", "주기형 관리 서술")만 차용한다.
- 사례는 `(id, 지역, 기준일)` 각주와 함께 Agent 내부 로그에 남기고, 최종 홈페이지에는 표시하지 않는다.
- 의뢰 학원장이 제공하지 않은 사실은 기존 프롬프트의 "지어내지 말 것" 제약이 2차 차단.
- ProposalService의 allowlist(위험 키 제외·길이 검증)는 그대로 최종 방어선.

## 5. 필요한 변경 파일 목록

### buildit2 (이 저장소 — 완료)
- `chart-educators/agent/retrievable.json` — 품질 필터된 검색 레이어 ✅
- `chart-educators/agent/simulate_retrieval.py` — 매칭 규칙·프롬프트 블록 생성기(검증 통과) ✅
- `chart-educators/agent/INTEGRATION_DESIGN.md` — 본 문서 ✅

### feel2real-buildit (운영 저장소 — **별도 승인 전까지 보류**)
| 파일 | 종류 | 내용 |
|---|---|---|
| `src/main/resources/data/chart-educators/retrievable.json` | 추가 | buildit2 산출물 스냅샷(배포 시점 고정) |
| `domain/academy/service/EducatorKnowledgeService.java` | 추가 | 읽기 전용 로더+태그/지역/키워드 매처. DB·write path 없음 |
| `domain/academy/dto/AcademyAiContext.java` | 수정 | `referenceExamples` 필드 추가(선택 주입, null 허용) |
| `domain/academy/service/AcademyAiContextService.java` | 수정 | context 조립 시 EducatorKnowledgeService 호출(본인 academy 정보와 분리 유지) |
| `domain/academy/service/AcademyAiPromptBuilder.java` | 수정 | GUIDE_TEXT·ACADEMY_COMPOSE 프롬프트에 `[참고 사례]`+금지 조항 블록 |
| `test/.../EducatorKnowledgeServiceTest.java` | 추가 | 매칭/필터(42·17·81 제외) 규칙 테스트 |
| `test/.../AcademyAiPromptBuilderTest.java` | 수정 | 사례 주입·금지 조항 존재 여부 스냅샷 |

- 미변경: AcademyAiTaskType, ProposalService allowlist, 컨트롤러/API, Builder JS — 중복 기능 없음.
- 운영 Chart DB·feel2real.co.kr 사이트: 읽기만, 변경 0.

## 6. 시뮬레이션 테스트 결과 (2026-10-14, `simulate_retrieval.py`)

프로필: `경기 구리시 / 말하기 활동 중심·암기 반대 / 초등 중등`
1. 사례 검색 → id 89(구리시, 최상위 유사 지역)·110·63·100·56 — 지역+태그 가중 정상
2. 구성 추천 → trait 9종 매핑 출력(운영에서는 상위 3으로 제한 권장)
3. 프롬프트 블록 → `[참고 사례]` + 인용 금지 조항 생성 확인
4. 승인 대기 목업 → SECTION_ORDER는 NON_EDITABLE 섹션 제외, TEXT proposal은
   `suggestedValue:null`(학원장 입력 대기) — 적용 없음·상태 PENDING_USER_APPROVAL

재현: `python simulate_retrieval.py --profile '{"..."}'`

## 7. 승인 요청 항목
- [x] feel2real-buildit 운영 코드 변경(§5) 진행 — 2026-10-14 사용자 승인 완료
- [x] retrievable.json 스냅샷 동기화 주기 — **배포 시점 고정**으로 결정(주간 cron 없음)

## 8. 구현 상태 (2026-10-14)

- 브랜치: `woori73/feel2real-buildit` `feat/chart-educator-kb-integration` (base main a04ed5b7)
  - `cf259004` 지식 계층: `resources/data/chart-educators/retrievable.json`(59건) + `EducatorReference` + `EducatorKnowledgeService`
  - `06729466` 연동: PromptBuilder 6-arg 오버로드(`[참고 사례]`는 GUIDE_TEXT·ACADEMY_COMPOSE만, 빈 목록이면 레거시와 바이트 동일) + Guide/Proposal 전달 + 테스트
  - `172269d2` QA 격리 강화(검증 지시 1~7 수행 중 발견): 사례 카드 원문이 인물명·학원명을 포함하면 블록 렌더 시 마스킹(해당 교육자/다른 학원), 태그·지역 없이 일반 어휘만 겹치는 무관 업종 요청은 키워드 4개 이상 요구(요리학원 프로필 실측 0건)
- 시뮬레이터와 실제 구현의 차이: 운영은 상위 **3건**만 주입, 사례 라인에 원장·학원 이름 미포함(id·지역·기준일만), 원문 60자 제한.
- 테스트: 스코프 지정 gradle test(Guide/Proposal/Suggestion/Controller/Context/Determinism/Scenario/Chat/WikiRouter + 신규 EducatorKnowledge 7건, PromptBuilder 5건) 전부 PASS. 전체 suite는 @SpringBootTest MySQL 요구로 미실행(기존 CI가 커버).
- **PR #661 생성까지 완료 — 머지·운영 배포는 별도 승인 대기.** 운영 Chart DB·feel2real.co.kr 변경 0, Prod DB write 0.
- QA 검증(2026-10-14 지시 1~7): 병합 CLEAN·충돌 0, Chart criteria/publication LIVE 원본과 byte-identical,
  검색 적정성(당진→id 66 최상위 등), 무관 업종 배제, 이름 마스킹, before/after 바이트 동일 확인.
  실제 LLM A/B 6호스트(NVIDIA NIM 비교 경로) 성공 — 운영 1순위 Muse Spark A/B은 머지 후 스테이징 LIVE 확인 항목.
  CI(cf259004·172269d2 both): build pass, mysql-integration-test pass.
