(async function () {
  'use strict';
  const wrongsBox = document.getElementById('wrongs');
  await TP.loadMe();
  if (!TP.user) { wrongsBox.innerHTML = '<p class="lead">Please <a href="/home">log in</a> to see your learning data.</p>'; return; }

  try {
    const lv = await TP.api('/api/testprep/learning');
    document.getElementById('stats').innerHTML = '<div class="stat-row">'
      + '<div class="stat"><b>' + lv.totalAttempts + '</b><span>attempts</span></div>'
      + '<div class="stat"><b>' + lv.submittedAttempts + '</b><span>submitted</span></div>'
      + '<div class="stat"><b>' + lv.practiceAttempts + '</b><span>practice tests</span></div>'
      + '<div class="stat"><b>' + lv.vocabAttempts + '</b><span>vocab quizzes</span></div>'
      + '<div class="stat"><b>' + (lv.bestBand != null ? lv.bestBand : '—') + '</b><span>best internal band</span></div>'
      + '</div><p class="disclaimer">' + TP.esc(lv.bandDisclaimer) + '</p>';

    document.getElementById('sections').innerHTML = lv.latestSectionScores.length
      ? '<table class="tp"><tr><th>Section</th><th>Band</th><th>Accuracy</th><th>Auto-scored</th></tr>'
      + lv.latestSectionScores.map(s => '<tr><td>' + TP.esc(s.section) + '</td><td>' + (s.band != null ? s.band : '—')
        + '</td><td>' + (s.accuracy != null ? s.accuracy + '%' : '—') + '</td><td>' + s.correct + '/' + s.autoCount + '</td></tr>').join('') + '</table>'
      : '<p class="lead">Finish a practice test to see your first section bands.</p>';

    if (!lv.wrongItems.length) { wrongsBox.innerHTML = '<p class="lead">No wrong answers on record. Perfect — or nothing taken yet.</p>'; return; }

    const byExam = {};
    lv.wrongItems.forEach(w => { (byExam[w.examCode] = byExam[w.examCode] || []).push(w); });
    wrongsBox.innerHTML = Object.entries(byExam).map(([code, items]) => `
      <div class="card" style="margin-bottom:14px">
        <h3>${TP.esc(items[0].examTitle)}</h3>
        <p>${items.length} wrong item(s) from this exam.</p>
        <table class="tp"><tr><th>Last wrong</th><th>Section</th><th>Question</th></tr>
        ${items.map(w => '<tr><td>' + TP.esc((w.lastWrongAt || '').slice(0, 16)) + '</td><td>' + TP.esc(w.section)
          + '</td><td>' + TP.esc(w.promptShort) + '</td></tr>').join('')}</table>
        <button class="btn btn-primary" style="margin-top:12px" data-retry="${TP.esc(code)}"
          data-ids="${items.map(w => w.questionId).join(',')}">Retry these ${items.length} items</button>
      </div>`).join('');
    wrongsBox.querySelectorAll('[data-retry]').forEach(btn => btn.addEventListener('click', async () => {
      btn.disabled = true;
      try {
        const attempt = await TP.api('/api/testprep/attempts', { method: 'POST', body: JSON.stringify({
          examCode: btn.dataset.retry, questionIds: btn.dataset.ids.split(',').map(Number) }) });
        location.href = '/testprep/run?attempt=' + attempt.attemptId;
      } catch (e) { btn.disabled = false; alert('Retry failed: ' + e.message); }
    }));
  } catch (err) {
    wrongsBox.innerHTML = '<p class="lead">Failed to load: ' + TP.esc(err.message) + '</p>';
  }
})();
