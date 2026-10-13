# API 연동 명세 — publishing_editor 프론트 ↔ `/api/publishing/*`

> 수신: Muse·Claude (백엔드 M1~M5) · 기준: `qoder-tech-spec.md` 4장
> 프론트는 `js/publishing_api.js` 단일 모듈로만 서버에 접근한다.
> `USE_MOCK = false` 전환 전 백엔드가 아래 표를 충족하면 화면 코드 수정은 불필요하다.

## 1. 함수 ↔ 엔드포인트 매핑

| publishing_api.js 함수 | METHOD PATH (실계약) | 요청 본문 | 응답 | 상태 |
|---|---|---|---|---|
| `listJobs()` | `GET /api/publishing/jobs` | — | `{ jobs: [...] }` | 계약대로 |
| `createJob(template, title, file)` | `POST /api/publishing/jobs` | **multipart**: `template`, `title`, `manuscript?` | `202 { jobId, status:"QUEUED" }` | ⚠ 아래 갭-G1 |
| `getJob(jobId)` | `GET /api/publishing/jobs/{jobId}` | — | `{ jobId, status, progress, currentStep, error? }` | 계약대로. 프론트 2s 폴링 |
| `cancelJob(jobId)` | `POST .../jobs/{jobId}/cancel` | — | `{ jobId, status:"CANCELLED" }` | 계약대로 |
| `getPagePng(jobId, n, scale)` | `GET .../pages/{n}/png?scale=` | — | PNG 바이너리 | 프론트가 blob→objectURL 변환 후 `<img>` 표시 |
| `getThumbPng(jobId, n)` | `GET .../pages/{n}/thumb` | — | PNG 바이너리 | 동일 |
| `applyCommands(jobId, cmds, label)` | `POST .../jobs/{jobId}/commands` | `{ commands:[{id, params}] }` | `{ jobId, applied, snapshotId }` | ⚠ 갭-G2 |
| `aiPlan(jobId, message)` | `POST /api/publishing/ai/plan` | `{ jobId, message }` | `{ plan:[{command, params, description}], needsApproval }` | ⚠ 갭-G3 (차단 응답) |
| `applyRevision(jobId, plan)` | `POST .../jobs/{jobId}/revisions` | `{ plan }` | `{ jobId, applied, snapshotId }` | ⚠ 갭-G4 (touchedPages) |
| `runPreflight(jobId)` | `POST .../jobs/{jobId}/preflight` | — | `{ overset[], missingGlyphs[], lowPpi[], passed }` | finding 항목은 §2 참조 |
| `startExport(jobId, 'pdf', std)` | `POST .../jobs/{jobId}/export` | `{ format:"pdf", standard:"x4"|"a2b"|"none" }` | `202 { artifactId, status:"QUEUED" }` | ⚠ 갭-G5 |
| `listArtifacts(jobId)` | `GET .../jobs/{jobId}/artifacts` | — | `{ artifacts:[{artifactId, format, standard, createdAt}] }` | ⚠ 갭-G4(fileName) |
| `downloadArtifact(jobId, artId)` | `GET .../artifacts/{artifactId}` | — | 파일 바이너리 | 프론트는 이 URL을 `<a download>`로 사용 |
| `listVersions(jobId)` | `GET .../jobs/{jobId}/versions` | — | `{ versions:[{versionId, label, source, createdAt}] }` | ⚠ 갭-G4(label/source) |
| `restoreVersion(jobId, verId)` | `POST .../versions/{versionId}/restore` | — | — | ⚠ 갭-G4 |
| `saveNow(jobId)` | **계약 없음** — `commands` 빈 배열로 대체 | `{ commands: [] }` | `{ applied, snapshotId }` | ⚠ 갭-G6 |
| `inspectManuscript(name, text)` | **계약 없음** — 제안: `POST .../jobs/{id}/manuscript/inspect` | `{ fileName, sample? }` | `{ rows:[{source,count,target}], estPages }` | ⚠ 갭-G7 |
| `importManuscript(jobId, name, pages)` | `commands`의 `file.place` 명령으로 대체 가능 | — | — | ⚠ 갭-G7 |
| `constants()` | **계약 없음** — mock이 템플릿 3종·문단 13종·글자 5종·allowlist 제공 | — | — | ⚠ 갭-G8 |

## 2. 프론트가 가정한 응답 필드 세부 (백엔드 매핑 시 필수)

- **preflight findings**: 프론트는 각 항목에서 `page`(숫자)와 `detail`(표시 문자열)을 읽는다.
  `missingGlyphs[]`는 additionally `glyph`, `lowPpi[]`는 `ppi`를 표시에 사용.
  명세 4.4는 배열만 정의했고 항목 스키마는 미정의 → **§2 스키마로 확정 필요**.
- **missingGlyphs.length > 0 → PDF 출력 버튼 비활성화** 로직은 프론트에 구현 완료
  (F6 안전망). 백엔드도 export 요청 시 409로 이중 차단 권장.
- **AI 차단 응답**: allowlist 밖 요청은 프론트가 `{ plan: [], needsApproval: false, blocked: true, reason }`
  을 기대한다(mock). 실백엔드도 같은 형태 또는 `plan: []` + 사유 필드 협의(G3).
- **적용 후 변경 쪽**: 프론트는 `touchedPages: [n,...]` 응답 시 해당 쪽 캐시를 무효화해
  미리보기·썸네일을 갱신한다. 없으면 응답 후 `pages/{n}/png`를 다시 요청하되,
  **PNG에 캐시 브레이커(버전/etag 쿼리)가 필요**하다. G4로 통합 협의.
- **AI 모델명·프롬프트**: 프론트 어디에도 하드코딩 없음(명세 5장 준수).

## 3. 프론트 안전 규칙 (구현 완료 — 백엔드도 동일 검증 필요)

1. AI는 plan만 반환, **승인 클릭 전까지 어떤 실행도 없다**
2. 적용·반입·복원 전부 **적용 전 스냅샷 자동 생성** (commands/revisions 응답의 `snapshotId`)
3. allowlist: `style.paragraph.apply`, `style.character.apply`, `text.replaceGlyphs`,
   `layout.reflow`, `text.insertPlaceholder` — 판형·마스터·폰트 명령은 계획 단계에서 차단
   (백엔드 M3에서 **재검증** 명시됨)

## 4. 미구현·제외 항목 정리 (인수인계용)

| 항목 | 상태 | 비고 |
|---|---|---|
| 실제 `/api/publishing/*` 호출 | 미연결 (`USE_MOCK=true`) | fetch 경로는 전부 작성됨 |
| PNG 미리보기 | Mock canvas 렌더(회색 박스+MOCK 워터마크) | spec 4.6 허용. 실렌더는 M4 |
| PDF 산출물 | Mock: 유효 1p PDF blob("MOCK PREVIEW" 텍스트) | 실조판은 Worker(M2) |
| EPUB·중철 제본 | UI 없음 (P2) | export modal에 "P2" 안내만 |
| 진행 수신 | 폴링 2s만 | SSE/WS는 P2 |
| docx/rtf 파싱 | 프론트에서 텍스트 샘플 없음 → 추정 매핑 표시 | 실매핑은 서버 `file.place` 전처리 |
| 인증 | 없음(독립 실행) | 운영 배치 시 BuildIt 세션 + tutor 셸 프래그먼트 채택 |
| 저장 엔드포인트 | 계약에 없음 | G6: `versions` 생성 API 또는 commands 대체 확정 필요 |
| 원고 inspect/import | 계약에 없음 | G7: 경로 확정 필요 |
| 템플릿·스타일 목록 공급 | mock 상수 | G8: `GET /api/publishing/styles` 추가 권장 |
| 글자 스타일 5종 ID | `ko-char-*` 잠정 명명 | 템플릿 정본 확인 후 교체 (spec 미확인 사항) |
| 루비·모지쿠미 | 미구현 | DesignCraft 엔진 미지원 |

## 5. 통합 체크리스트 (M5)

- [ ] `publishing_api.js`의 `USE_MOCK = false` 전환 후 위 G1~G8 확정
- [ ] Thymeleaf 배치: `templates/tutor/publishing_editor.html` + `/css`·`/js` 절대경로,
      tutor 셸(`_head`, `_account_menu`) 삽입
- [ ] PNG 응답에 캐시 브레이커 또는 `touchedPages` 필드
- [ ] preflight finding 스키마 §2로 고정
- [ ] allowlist 백엔드 재검증 테스트
- [ ] `publishing_mock.js` 스크립트 태그 제거 + Mock 배지 로직 정리(`isMock()` false 시 자동 숨김 — 구현됨)
