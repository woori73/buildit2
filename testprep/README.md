# TestPrep — TOEFL iBT Test Preparation

Practice Tests · Vocabulary Quiz · Score Analysis. Independent Spring Boot app inside `buildit2`.

Structure reference only was taken from the official ETS TOEFL iBT pages (Jan 2026 redesign:
1–6 half-band scale, Reading → Listening → Writing → Speaking, adaptive Reading/Listening).
No ETS content, audio, or trademarks are reproduced — all items are originally written
(see `src/main/resources/db/migration/V2__testprep_content.sql`).

**Band scores in this app are TestPrep internal estimates, never presented as official ETS scores.**

## Stack
Spring Boot 4.0 · Java 21 · Thymeleaf · Spring Security (stateless, **shared SSO** via feel2real's `ACCESS_TOKEN` JWT cookie) · MySQL 8 · Flyway

## Authentication — shared SSO with feel2real (no own signup)
TestPrep does not create accounts. Existing feel2real members log in at feel2real and arrive with
the `ACCESS_TOKEN` cookie (domain `.feel2real.co.kr`); TestPrep verifies the same HS256 signature
and reads identity from the token claims (`sub`=userId, `loginId`, `role`). Test data is keyed by
that shared `user_id` in TestPrep's own DB — no FK to the feel2real `users` table.
The shared secret is injected **only** via environment variable at deploy time (reuse
`JWT_SECRET` from `/etc/f2r/env` on the EC2 box); it is never copied into this repo.
`POST /api/auth/dev-login` is `@Profile("!prd")` — a localhost convenience to mint a local cookie,
disabled in production.

## Run locally
```bash
export TESTPREP_DB_URL="jdbc:mysql://localhost:3309/testprep_db?useSSL=false&serverTimezone=Asia/Seoul&characterEncoding=UTF-8"
export TESTPREP_DB_USER=root TESTPREP_DB_PASSWORD="<local pw>"
./gradlew bootRun
```
`TESTPREP_JWT_SECRET` defaults to the same public local-dev string feel2real uses locally, so a
local feel2real login cookie verifies out of the box; set it explicitly when you want a private
secret. First boot applies Flyway `V1__testprep_core.sql` (exam engine tables) and
`V2__testprep_content.sql` (seed exams). Then open `http://localhost:8090/home` and use
"Login → Local development login".

## Pages
| URL | Purpose |
|---|---|
| `/home` | TestPrep landing (2026 structure facts, 3 CTAs) |
| `/testprep/practice` · `/testprep/vocab` | exam catalogs → start attempts |
| `/testprep/run?attempt=ID` | exam runner: timer, autosave, TTS listening, sentence builder, speaking recorder |
| `/testprep/scores` · `/testprep/review?attempt=ID` | attempt history, per-section bands, wrong answers + explanations |
| `/testprep/learning` | progress stats + wrong-answer bank with retry |
| `/login` | redirect to the feel2real login entry (SSO — no TestPrep login page exists) |

## API
`GET /api/testprep/exams?kind=`, `POST/GET /api/testprep/attempts[/{id}]`,
`PUT /api/testprep/attempts/{id}/answers`, `POST /api/testprep/attempts/{id}/submit[/review]`,
`GET /api/testprep/attempts`, `GET /api/testprep/learning`.
Auth: `GET /api/auth/me`, `POST /api/auth/logout` (shared feel2real cookie),
`POST /api/auth/dev-login` (non-prd only). Students see only their own data; role `ADMIN`
may open any attempt (ownership enforced server-side from token claims — no user table lookup).

## Security rules for this directory
- Never commit `TESTPREP_JWT_SECRET` (the shared feel2real secret), DB credentials, or `application-local.yaml`.
- `.gitignore` excludes them; config values come only from environment variables.
- Speaking recordings are stored base64 in `tp_attempt_answers.answer_text` (≤4 MB guard) and are
  auto-scored never — manual tutor review only.

## QA local review (검수)
1. MySQL: docker container `testprep-mysql` (localhost:3309, db `testprep_db`, root/testprep), or any local MySQL 8.
2. Run: `./gradlew bootRun` with `TESTPREP_DB_URL/USER/PASSWORD` env set (JDK 21).
3. Open http://localhost:8090/home → **Login** → expand *Local development login* → any userId/loginId/role → exam flow.
4. Pre-seeded: PRACTICE mini set (18 questions, 4 sections) + VOCAB EASY/MEDIUM/HARD (8 questions each).

| What you can review | Where |
|---|---|
| Reading/Listening/Writing/Speaking practice | /testprep/practice → run (timer, autosave, TTS audio, sentence chips, mic recording) |
| Auto-scoring + internal band | Submit → scorecard overlay → /testprep/scores |
| Wrong-answer review with keys & explanations | /testprep/review?attempt=ID |
| Progress + wrong bank + retry-only-wrongs | /testprep/learning |

**Dev JWT vs real feel2real SSO (verified separately):**
- Local review uses `/api/auth/dev-login` (`@Profile("!prd")`, hidden on prd) which mints an ACCESS_TOKEN cookie with the local dev secret. The home page shows a QA banner when the `prd` profile is inactive.
- Real SSO = same cookie *verified*, never minted, by TestPrep: at deploy set `TESTPREP_JWT_SECRET` to the value already in `/etc/f2r/env` (`JWT_SECRET`) and `TESTPREP_COOKIE_DOMAIN=.feel2real.co.kr`; a member logged into feel2real then opens TestPrep on any `*.feel2real.co.kr` host with no second login. The production secret is env-injected only — it must not be committed or logged.

## Known limits (honest list)
- Listening uses browser speech synthesis (practice mode), not recorded audio assets.
- Speaking/Writing (except Build a Sentence) have no AI scoring; stored for review.
- Adaptive routing (2-stage) is simulated as a single fixed set; item counts are below ETS maxima.
