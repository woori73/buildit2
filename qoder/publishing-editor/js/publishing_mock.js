/* publishing_mock.js — DesignCraft 출판 편집기 Mock 서버 (Qoder)
 * 명세 4장 API 계약과 동일한 형태 가짜 응답. USE_MOCK=true일 때만 사용된다.
 * 모든 산출물은 Mock이며 실제 조판/렌더 결과가 아니다. */
(function (global) {
  'use strict';

  /* ── 상수: 템플릿·스타일 (DesignCraft 한글 템플릿 기준) ─────── */
  var TEMPLATES = [
    { id: 'ko-textbook-a4', name: 'A4 교재',  size: '210 × 297 mm', mm: [210, 297] },
    { id: 'ko-workbook-b5', name: 'B5 문제집', size: '176 × 250 mm', mm: [176, 250] },
    { id: 'ko-book-46',     name: '46판 단행본', size: '152 × 225 mm', mm: [152, 225] }
  ];

  var PARAGRAPH_STYLES = [
    { id: 'ko-body',     label: '본문' },
    { id: 'ko-heading1', label: '대제목' },
    { id: 'ko-heading2', label: '중제목' },
    { id: 'ko-heading3', label: '소제목' },
    { id: 'ko-passage',  label: '지문' },
    { id: 'ko-choice',   label: '선택지' },
    { id: 'ko-footnote', label: '각주' },
    { id: 'ko-quote',    label: '인용' },
    { id: 'ko-caption',  label: '캡션' },
    { id: 'ko-qnum',     label: '문항 번호' },
    { id: 'ko-explain',  label: '해설' },
    { id: 'ko-vocab',    label: '어휘' },
    { id: 'ko-time',     label: '시간 배정' }
  ];

  var CHAR_STYLES = [
    { id: 'ko-char-em',     label: '강조' },
    { id: 'ko-char-strong', label: '굵게' },
    { id: 'ko-char-sub',    label: '작은 글자' },
    { id: 'ko-char-under',  label: '밑줄' },
    { id: 'ko-char-accent', label: '색상 강조' }
  ];

  /* AI가 계획할 수 있는 명령 allowlist (판형·마스터·폰트 제외) */
  var COMMAND_ALLOWLIST = [
    'style.paragraph.apply', 'style.character.apply',
    'text.replaceGlyphs', 'layout.reflow', 'text.insertPlaceholder'
  ];

  var STEPS = ['원고 반입 (file.place)', '스타일 매핑', '조판 (layout)', '페이지 렌더 (render_page)'];

  /* ── 상태 저장소 ──────────────────────────────────────────── */
  var jobs = {};          // jobId -> job
  var exportJobs = {};    // jobId -> export 진행 상태
  var artifactBlobs = {}; // artifactId -> objectURL
  var seq = 0;
  function nextId(prefix) { seq += 1; return prefix + '-' + Date.now().toString(36) + '-' + seq; }
  function delay(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }
  function clone(o) { return JSON.parse(JSON.stringify(o)); }

  function makeJob(template, title) {
    var jobId = nextId('job');
    jobs[jobId] = {
      jobId: jobId,
      title: title,
      template: template,
      status: 'QUEUED',
      progress: 0,
      currentStep: '',
      createdAt: Date.now(),
      startedAt: Date.now(),
      durationMs: 7000,
      pageCount: 16,
      seed: Math.floor(Math.random() * 9999) + 1,
      preflightScenario: 'glyph', // glyph | clean | overset  (Mock 시나리오)
      glyphPages: { 7: true },
      pageStyles: {},  // page -> [styleId,...]
      oversetPages: { 12: true },
      lowPpiPages: { 5: true },
      versions: [],
      artifacts: [],
      lastManuscript: null,
      cancelled: false
    };
    return jobs[jobId];
  }

  /* 진행은 시간 기반: GET 폴링(2s)에서 계산 */
  function tickJob(job) {
    if (job.cancelled || job.status === 'DONE' || job.status === 'FAILED') return;
    var el = Date.now() - job.startedAt;
    var pct = Math.min(100, Math.round((el / job.durationMs) * 100));
    if (pct >= 100) {
      job.status = 'DONE'; job.progress = 100; job.currentStep = '완료';
    } else {
      job.status = 'RUNNING'; job.progress = pct;
      job.currentStep = STEPS[Math.min(STEPS.length - 1, Math.floor(pct / (100 / STEPS.length)))];
    }
  }

  function pushVersion(job, label, source) {
    var v = {
      versionId: nextId('ver'),
      label: label,
      source: source,
      createdAt: Date.now(),
      snapshot: { pageStyles: clone(job.pageStyles), glyphPages: clone(job.glyphPages), pageCount: job.pageCount }
    };
    job.versions.unshift(v);
    return v;
  }

  /* ── 페이지 PNG 렌더 (canvas → dataURL) ───────────────────── */
  function seededRandom(seed) {
    var s = seed % 2147483647;
    if (s <= 0) s += 2147483646;
    return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; };
  }

  function renderPagePng(job, pageNo, targetW) {
    var tpl = null;
    for (var i = 0; i < TEMPLATES.length; i++) if (TEMPLATES[i].id === job.template) tpl = TEMPLATES[i];
    if (!tpl) tpl = TEMPLATES[0];
    var w = Math.max(60, Math.round(targetW));
    var h = Math.round(w * tpl.mm[1] / tpl.mm[0]);
    var canvas = document.createElement('canvas');
    canvas.width = w; canvas.height = h;
    var ctx = canvas.getContext('2d');
    var rnd = seededRandom(job.seed * 131 + pageNo * 7717);

    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h);
    /* 재단 여백 가이드 */
    var m = w * 0.09;
    ctx.strokeStyle = '#E3E8F0'; ctx.lineWidth = 1;
    ctx.strokeRect(m, m, w - m * 2, h - m * 2);

    var styles = (job.pageStyles[pageNo] || job.pageStyles[String(pageNo)]) || [];
    var x = m + 6, cw = w - m * 2 - 12, y = m + 10;
    ctx.font = 'bold ' + Math.round(w * 0.028) + 'px "Noto Sans KR", sans-serif';

    /* 1쪽 또는 대제목 적용: 책 이름/제목 블록 */
    if (pageNo === 1 || styles.indexOf('ko-heading1') >= 0) {
      ctx.fillStyle = '#2F6FED';
      ctx.fillRect(x, y, styles.indexOf('ko-heading1') >= 0 ? cw * 0.7 : cw * 0.5, w * 0.035);
      if (styles.indexOf('ko-heading1') >= 0) {
        ctx.fillStyle = '#1C2430';
        ctx.fillText('ko-heading1 적용됨', x + 4, y + w * 0.026);
      }
      y += w * 0.06;
    }
    if (styles.indexOf('ko-heading2') >= 0) {
      ctx.fillStyle = '#6E8BE8'; ctx.fillRect(x, y, cw * 0.45, w * 0.022); y += w * 0.04;
    }

    /* 본문 줄 (gray bars) */
    var lineH = Math.max(3, w * 0.016);
    ctx.fillStyle = '#C6CEDB';
    var lines = 16 + Math.floor(rnd() * 8);
    for (var L = 0; L < lines && y < h - m - lineH; L++) {
      var lw = cw * (0.62 + rnd() * 0.38);
      if (styles.indexOf('ko-choice') >= 0 && L % 5 === 3) lw = cw * 0.3; // 선택지 느낌
      ctx.fillRect(x, y, lw, lineH * 0.72);
      y += lineH;
      if (L % 6 === 5) y += lineH * 0.8;
    }

    /* 저해상도 이미지 블록 */
    if (job.lowPpiPages[pageNo]) {
      var bw = cw * 0.4, bh = bw;
      var bx = x + (cw - bw) / 2, by = h * 0.55;
      for (var py = 0; py < 6; py++) for (var px = 0; px < 6; px++) {
        ctx.fillStyle = ['#B7C4D8', '#8FA3C2', '#D8E0EC', '#6E83A8'][(px * 6 + py + pageNo) % 4];
        ctx.fillRect(bx + px * bw / 6, by + py * bh / 6, bw / 6, bh / 6);
      }
      ctx.fillStyle = '#D64545';
      ctx.font = Math.round(w * 0.02) + 'px sans-serif';
      ctx.fillText('이미지 ~96ppi (저해상도)', bx, by + bh + w * 0.024);
    }

    /* 빠짐 글리프 표시 */
    if (job.glyphPages[pageNo]) {
      ctx.fillStyle = '#1C2430';
      ctx.font = Math.round(w * 0.035) + 'px serif';
      ctx.fillText('특수문자: □ □ 𩸽 → 빠짐', x, h - m - w * 0.03);
    }

    /* 넘침(overset) 마커 */
    if (job.oversetPages[pageNo]) {
      ctx.fillStyle = '#C77700';
      ctx.font = 'bold ' + Math.round(w * 0.03) + 'px sans-serif';
      ctx.fillText('▾ 넘침', w - m - w * 0.09, h - m + w * 0.035);
    }

    /* 쪽수 */
    ctx.fillStyle = '#8A94A6';
    ctx.font = Math.round(w * 0.022) + 'px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(String(pageNo), w / 2, h - m * 0.4);
    /* Mock 워터마크 */
    ctx.fillStyle = 'rgba(47,111,237,.10)';
    ctx.font = 'bold ' + Math.round(w * 0.09) + 'px sans-serif';
    ctx.fillText('MOCK', w / 2, h * 0.45);

    return canvas.toDataURL('image/png');
  }

  /* ── 최소 valid PDF (Mock 다운로드용) ──────────────────────── */
  function makeMockPdf(job, standard) {
    var body = 'BT /F1 18 Tf 60 740 Td (BuildIt Publishing - MOCK PREVIEW) Tj ET\n' +
      'BT /F1 12 Tf 60 710 Td (Title: ' + job.title.replace(/[()\\]/g, '') + ') Tj ET\n' +
      'BT /F1 12 Tf 60 692 Td (Template: ' + job.template + '  Pages: ' + job.pageCount + ') Tj ET\n' +
      'BT /F1 12 Tf 60 674 Td (Standard: ' + standard + ') Tj ET\n' +
      'BT /F1 12 Tf 60 640 Td (This is MOCK data, not a real DesignCraft render.) Tj ET';
    var objs = [];
    objs.push('<< /Type /Catalog /Pages 2 0 R >>');
    objs.push('<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
    objs.push('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>');
    objs.push('<< /Length ' + body.length + ' >>\nstream\n' + body + '\nendstream');
    objs.push('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
    var pdf = '%PDF-1.4\n', offsets = [];
    for (var i = 0; i < objs.length; i++) {
      offsets.push(pdf.length);
      pdf += (i + 1) + ' 0 obj\n' + objs[i] + '\nendobj\n';
    }
    var xref = pdf.length;
    pdf += 'xref\n0 ' + (objs.length + 1) + '\n0000000000 65535 f \n';
    for (var j = 0; j < offsets.length; j++) pdf += ('0000000000' + offsets[j]).slice(-10) + ' 00000 n \n';
    pdf += 'trailer\n<< /Size ' + (objs.length + 1) + ' /Root 1 0 R >>\nstartxref\n' + xref + '\n%%EOF';
    return new Blob([pdf], { type: 'application/pdf' });
  }

  /* ── AI plan 생성 (자연어 -> 명령 계획, 미실행) ────────────── */
  function pageFromText(msg) {
    var mm = msg.match(/(\d+)\s*쪽/);
    return mm ? parseInt(mm[1], 10) : null;
  }

  function styleFromText(msg) {
    var table = [
      ['ko-heading1', /대제목|제목\s*1|heading\s*1|h1/i],
      ['ko-heading2', /중제목|heading\s*2|h2/i],
      ['ko-heading3', /소제목|heading\s*3|h3/i],
      ['ko-passage', /지문|passage/i],
      ['ko-choice', /선택지|choice/i],
      ['ko-footnote', /각주|footnote/i],
      ['ko-quote', /인용|quote/i],
      ['ko-caption', /캡션|caption/i],
      ['ko-qnum', /문항\s*번호|qnum/i],
      ['ko-explain', /해설|explain/i],
      ['ko-vocab', /어휘|vocab/i],
      ['ko-time', /시간\s*배정|time/i],
      ['ko-body', /본문|body/i]
    ];
    for (var i = 0; i < table.length; i++) if (table[i][1].test(msg)) return table[i][0];
    return /제목|heading/i.test(msg) ? 'ko-heading1' : null;
  }

  function aiPlan(jobId, message) {
    var job = jobs[jobId];
    if (!job) return { error: 'JOB_NOT_FOUND' };
    /* allowlist 밖 요청 차단: 판형·마스터·폰트 */
    if (/판형|마스터|폰트|font\s*변경|크기\s*변경/i.test(message) && !/본문/.test(message)) {
      return {
        plan: [], needsApproval: false, blocked: true,
        reason: '템플릿 판형·마스터·폰트는 AI 수정 대상이 아닙니다 (allowlist 밖).'
      };
    }
    var page = pageFromText(message);
    var plan = [];
    if (/글리프|빠짐|안\s*나오는|한자|□|깨진/i.test(message)) {
      var target = page || Object.keys(job.glyphPages).map(Number)[0] || 1;
      plan.push({ command: 'text.replaceGlyphs', params: { page: target },
        description: target + '쪽 빠진 글리프를 Noto Sans KR 안전 문자로 치환' });
      plan.push({ command: 'layout.reflow', params: { page: target },
        description: target + '쪽 재조판 (reflow)' });
    } else {
      var style = styleFromText(message);
      var targetPage = page || 1;
      if (!style) {
        plan.push({ command: 'layout.reflow', params: { page: targetPage },
          description: targetPage + '쪽 재조판 (문맥 불명확 — 안전한 재조판만 계획)' });
      } else {
        plan.push({ command: 'style.paragraph.apply', params: { page: targetPage, style: style },
          description: targetPage + '쪽 제목/문단에 ' + style + ' 스타일 적용' });
        plan.push({ command: 'layout.reflow', params: { page: targetPage },
          description: targetPage + '쪽 재조판' });
      }
    }
    /* allowlist 재검증 (백엔드 이중 검증 상당) */
    plan = plan.filter(function (p) { return COMMAND_ALLOWLIST.indexOf(p.command) >= 0; });
    return { plan: plan, needsApproval: true };
  }

  /* ── 명령 실행 (승인/적용 시에만) ─────────────────────────── */
  function execCommands(job, commands) {
    var appliedPages = {};
    commands.forEach(function (c) {
      var id = c.id || c.command, p = c.params || {};
      if (id === 'style.paragraph.apply' && p.page) {
        var key = String(p.page);
        job.pageStyles[key] = (job.pageStyles[key] || []).concat([p.style]);
        delete job.oversetPages[p.page];
        appliedPages[p.page] = true;
      } else if (id === 'text.replaceGlyphs' && p.page) {
        delete job.glyphPages[p.page];
        appliedPages[p.page] = true;
      } else if (id === 'layout.reflow' && p.page) {
        appliedPages[p.page] = true;
      } else if (id === 'file.place' || id === 'manuscript.import') {
        job.pageCount = Math.min(40, job.pageCount + 2);
        job.seed = job.seed + 17;
      }
    });
    return Object.keys(appliedPages).map(Number);
  }

  /* ── preflight ────────────────────────────────────────────── */
  function runPreflight(job) {
    var sc = job.preflightScenario;
    var overset = [], missing = [], lowPpi = [];
    if (sc !== 'clean') {
      Object.keys(job.oversetPages).forEach(function (pg) {
        overset.push({ page: Number(pg), detail: '본문 상자를 넘침 (약 3줄) — 줄간격 조정 또는 텍스트 분할 필요' });
      });
      if (sc === 'glyph') {
        Object.keys(job.glyphPages).forEach(function (pg) {
          missing.push({ page: Number(pg), detail: 'U+2FD3 (𩸽) 외 2자 — 폰트 지원 글리프 없음', glyph: '𩸽' });
        });
      }
      Object.keys(job.lowPpiPages).forEach(function (pg) {
        lowPpi.push({ page: Number(pg), detail: '배치 이미지 약 96ppi — 인쇄 최소 300ppi 미달', ppi: 96 });
      });
    }
    return {
      overset: overset, missingGlyphs: missing, lowPpi: lowPpi,
      passed: overset.length === 0 && missing.length === 0,
      checkedAt: Date.now()
    };
  }

  /* ── 공개 API (publishing_api.js가 호출) ───────────────────── */
  var PublishingMock = {
    meta: { TEMPLATES: TEMPLATES, PARAGRAPH_STYLES: PARAGRAPH_STYLES, CHAR_STYLES: CHAR_STYLES, ALLOWLIST: COMMAND_ALLOWLIST },

    listJobs: function () {
      return Object.keys(jobs).map(function (k) {
        var j = jobs[k]; tickJob(j);
        return { jobId: j.jobId, title: j.title, template: j.template, status: j.status,
          pageCount: j.pageCount, createdAt: j.createdAt };
      });
    },

    createJob: function (template, title, manuscriptName) {
      var j = makeJob(template, title || '제목 없는 프로젝트');
      if (manuscriptName) j.lastManuscript = { name: manuscriptName, importedAt: Date.now() };
      pushVersion(j, '프로젝트 생성', 'init');
      return { jobId: j.jobId, status: 'QUEUED' };
    },

    getJob: function (jobId) {
      var j = jobs[jobId];
      if (!j) return { jobId: jobId, status: 'FAILED', progress: 0, currentStep: '', error: 'JOB_NOT_FOUND' };
      tickJob(j);
      return { jobId: j.jobId, status: j.status, progress: j.progress, currentStep: j.currentStep };
    },

    cancelJob: function (jobId) {
      var j = jobs[jobId];
      if (j) { j.cancelled = true; j.status = 'CANCELLED'; }
      return { jobId: jobId, status: j ? 'CANCELLED' : 'FAILED' };
    },

    getProject: function (jobId) {
      var j = jobs[jobId];
      return j ? { jobId: j.jobId, title: j.title, template: j.template, pageCount: j.pageCount,
        status: j.status, lastManuscript: j.lastManuscript } : null;
    },

    getPagePng: function (jobId, n, scale) {
      var j = jobs[jobId];
      if (!j) return null;
      return renderPagePng(j, n, Math.round(520 * (scale || 1)));
    },

    getThumbPng: function (jobId, n) {
      var j = jobs[jobId];
      if (!j) return null;
      return renderPagePng(j, n, 110);
    },

    /* F2: 원고 반입 — 매핑 미리보기 (실제 파싱은 파일 텍스트로 추정) */
    inspectManuscript: function (fileName, textSample) {
      var lines = textSample ? textSample.split(/\r?\n/) : [];
      var counts = { h1: 0, h2: 0, h3: 0, quote: 0, body: 0, list: 0 };
      lines.forEach(function (l) {
        if (/^#\s/.test(l)) counts.h1++;
        else if (/^##\s/.test(l)) counts.h2++;
        else if (/^###\s/.test(l)) counts.h3++;
        else if (/^>\s/.test(l)) counts.quote++;
        else if (/^[-*]\s/.test(l)) counts.list++;
        else if (l.trim()) counts.body++;
      });
      var isBinary = /\.(docx|rtf)$/i.test(fileName);
      var estPages = Math.max(4, Math.round((counts.body + counts.h1 + counts.h2 + counts.h3) / 14) + 2);
      return {
        fileName: fileName, binary: isBinary,
        rows: [
          { source: isBinary ? '제목 1 (Heading 1)' : '# 제목', count: isBinary ? '≈' + (counts.h1 || 3) : counts.h1, target: 'ko-heading1' },
          { source: isBinary ? '제목 2 (Heading 2)' : '## 제목', count: isBinary ? '≈' + (counts.h2 || 8) : counts.h2, target: 'ko-heading2' },
          { source: isBinary ? '제목 3' : '### 제목', count: isBinary ? '≈' + (counts.h3 || 5) : counts.h3, target: 'ko-heading3' },
          { source: isBinary ? '본문 문단' : '문단', count: isBinary ? '≈' + (counts.body || 120) : counts.body, target: 'ko-body' },
          { source: isBinary ? '인용 블록' : '> 인용', count: isBinary ? '≈' + (counts.quote || 2) : counts.quote, target: 'ko-quote' },
          { source: isBinary ? '목록' : '- 목록', count: isBinary ? '≈' + (counts.list || 6) : counts.list, target: 'ko-vocab' }
        ],
        estPages: estPages
      };
    },

    importManuscript: function (jobId, fileName, estPages) {
      var j = jobs[jobId];
      if (!j) return { applied: false };
      var snap = pushVersion(j, '원고 반입 전: ' + fileName, 'manuscript');
      j.pageCount = Math.min(48, Math.max(8, estPages || j.pageCount));
      j.seed = j.seed + 23;
      j.lastManuscript = { name: fileName, importedAt: Date.now() };
      return { applied: true, snapshotId: snap.versionId, pageCount: j.pageCount };
    },

    /* F4/F8 공용: 명령 적용 (적용 전 자동 스냅샷) */
    applyCommands: function (jobId, commands, label) {
      var j = jobs[jobId];
      if (!j) return { applied: false };
      var snap = pushVersion(j, label || ('편집 적용 (' + commands.length + '개 명령)'), 'command');
      var pages = execCommands(j, commands);
      return { jobId: jobId, applied: true, snapshotId: snap.versionId, touchedPages: pages };
    },

    aiPlan: function (jobId, message) { return aiPlan(jobId, message); },

    applyRevision: function (jobId, plan) {
      var j = jobs[jobId];
      if (!j) return { applied: false };
      var cmds = plan.map(function (p) { return { id: p.command, params: p.params }; });
      var snap = pushVersion(j, 'AI 적용: ' + (plan[0] ? plan[0].description : '계획'), 'ai');
      var pages = execCommands(j, cmds);
      return { jobId: jobId, applied: true, snapshotId: snap.versionId, touchedPages: pages };
    },

    setPreflightScenario: function (jobId, scenario) {
      var j = jobs[jobId];
      if (j) {
        j.preflightScenario = scenario;
        if (scenario === 'overset') j.glyphPages = {};
        if (scenario === 'glyph' && Object.keys(j.glyphPages).length === 0) j.glyphPages = { 7: true };
      }
    },

    preflight: function (jobId) {
      var j = jobs[jobId];
      if (!j) return { overset: [], missingGlyphs: [], lowPpi: [], passed: false };
      return runPreflight(j);
    },

    /* F7: export도 job으로 처리 */
    startExport: function (jobId, format, standard) {
      var j = jobs[jobId];
      if (!j) return { artifactId: null, status: 'FAILED' };
      exportJobs[jobId] = { startedAt: Date.now(), durationMs: 5000, standard: standard, format: format, done: false };
      return { artifactId: nextId('art') + ':pending', status: 'QUEUED' };
    },

    getExportState: function (jobId) {
      var ex = exportJobs[jobId];
      if (!ex) return null;
      var pct = Math.min(100, Math.round((Date.now() - ex.startedAt) / ex.durationMs * 100));
      return { status: pct >= 100 ? 'DONE' : 'RUNNING', progress: pct, currentStep: pct >= 100 ? '완료' : 'PDF 내보내기 (' + ex.standard + ')' };
    },

    listArtifacts: function (jobId) {
      var j = jobs[jobId];
      if (!j) return { artifacts: [] };
      var ex = exportJobs[jobId];
      if (ex && !ex.done && Date.now() - ex.startedAt >= ex.durationMs) {
        ex.done = true;
        var id = nextId('art');
        var art = { artifactId: id, format: ex.format, standard: ex.standard,
          fileName: j.title.replace(/[^\w가-힣-]/g, '_') + '-' + ex.standard.toUpperCase() + '.pdf',
          createdAt: Date.now() };
        j.artifacts.unshift(art);
      }
      return { artifacts: clone(j.artifacts) };
    },

    downloadArtifact: function (jobId, artifactId) {
      var j = jobs[jobId];
      if (!j) return null;
      var art = null;
      for (var i = 0; i < j.artifacts.length; i++) if (j.artifacts[i].artifactId === artifactId) art = j.artifacts[i];
      if (!art) return null;
      if (!artifactBlobs[artifactId]) {
        artifactBlobs[artifactId] = URL.createObjectURL(makeMockPdf(j, art.standard));
      }
      return { url: artifactBlobs[artifactId], fileName: art.fileName };
    },

    /* F8 */
    listVersions: function (jobId) {
      var j = jobs[jobId];
      if (!j) return { versions: [] };
      return { versions: clone(j.versions.map(function (v) {
        return { versionId: v.versionId, label: v.label, source: v.source, createdAt: v.createdAt };
      })) };
    },

    restoreVersion: function (jobId, versionId) {
      var j = jobs[jobId];
      if (!j) return { restored: false };
      var target = null;
      for (var i = 0; i < j.versions.length; i++) if (j.versions[i].versionId === versionId) target = j.versions[i];
      if (!target) return { restored: false };
      pushVersion(j, '복원 전 상태 자동 저장', 'pre-restore');
      j.pageStyles = clone(target.snapshot.pageStyles);
      j.glyphPages = clone(target.snapshot.glyphPages);
      j.pageCount = target.snapshot.pageCount;
      return { restored: true, jobId: jobId, snapshotId: j.versions[0].versionId };
    },

    saveNow: function (jobId) {
      var j = jobs[jobId];
      if (!j) return { saved: false };
      var snap = pushVersion(j, '수동 저장', 'manual');
      return { saved: true, snapshotId: snap.versionId };
    }
  };

  global.PublishingMock = PublishingMock;
})(window);
