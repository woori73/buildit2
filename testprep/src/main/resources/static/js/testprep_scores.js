(async function () {
  'use strict';
  const box = document.getElementById('score-list');
  await TP.loadMe();
  if (!TP.user) { box.innerHTML = '<p class="lead">Please <a href="/home">log in</a> to see your scores.</p>'; return; }
  try {
    const rows = await TP.api('/api/testprep/attempts');
    if (!rows.length) { box.innerHTML = '<p class="lead">No attempts yet — start from <a href="/testprep/practice">iBT Practice</a> or <a href="/testprep/vocab">Vocabulary Quiz</a>.</p>'; return; }
    box.innerHTML = '<table class="tp"><tr><th>When</th><th>Exam</th><th>Type</th><th>Status</th><th>Band (internal)</th><th>Accuracy</th><th></th></tr>'
      + rows.map(r => `<tr>
        <td>${TP.esc((r.startedAt || '').slice(0, 16))}</td>
        <td>${TP.esc(r.examTitle)}<br><span class="meta" style="font-size:12px;color:var(--muted)">${r.questionCount} questions</span></td>
        <td>${TP.esc(r.kind)}</td>
        <td>${TP.esc(r.status)}${r.overtime ? ' ⏱' : ''}</td>
        <td>${r.overallBand != null ? '<strong>' + r.overallBand + '</strong>' : '—'}</td>
        <td>${r.accuracy != null ? r.accuracy + '%' : '—'}</td>
        <td>${r.status === 'SUBMITTED' ? '<a class="btn btn-outline btn-sm" href="/testprep/review?attempt=' + r.attemptId + '">Review</a>'
          : r.status === 'IN_PROGRESS' ? '<a class="btn btn-primary btn-sm" href="/testprep/run?attempt=' + r.attemptId + '">Resume</a>' : ''}</td>
      </tr>`).join('')
      + '</table><p class="disclaimer" style="margin-top:12px">Band = TestPrep internal estimate, not an official ETS score.</p>';
  } catch (err) {
    box.innerHTML = '<p class="lead">Failed to load: ' + TP.esc(err.message) + '</p>';
  }
})();
