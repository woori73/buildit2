(function () {
  'use strict';
  const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F'];
  const box = document.getElementById('rv-items');

  async function boot() {
    const id = new URLSearchParams(location.search).get('attempt');
    if (!id) { box.innerHTML = '<p class="lead">No attempt specified.</p>'; return; }
    await TP.loadMe();
    let rv;
    try {
      rv = await TP.api('/api/testprep/attempts/' + id + '/review');
    } catch (err) { box.innerHTML = '<p class="lead">Cannot load review: ' + TP.esc(err.message) + '</p>'; return; }

    document.getElementById('rv-title').textContent = rv.examTitle;
    document.getElementById('rv-sub').textContent =
      (rv.submittedAt || '') + ' · ' + rv.items.length + ' questions' + (rv.overtime ? ' · submitted after time limit' : '');

    document.getElementById('rv-score').innerHTML =
      '<div class="stat-row">'
      + '<div class="stat"><b>' + (rv.overallBand != null ? rv.overallBand : '—') + '</b><span>overall band (internal)</span></div>'
      + '<div class="stat"><b>' + (rv.accuracy != null ? rv.accuracy + '%' : '—') + '</b><span>auto-score accuracy</span></div>'
      + (rv.sections || []).map(s => '<div class="stat"><b>' + (s.band != null ? s.band : '—') + '</b><span>' + TP.esc(s.section) + ' · ' + s.correct + '/' + s.autoCount + '</span></div>').join('')
      + '</div><p class="disclaimer">' + TP.esc(rv.bandDisclaimer) + '</p>';

    box.innerHTML = rv.items.map((it, idx) => {
      const verdict = !it.autoScore ? '<span class="tag neutral">manual review</span>'
        : it.isCorrect ? '<span class="tag good">correct</span>' : '<span class="tag bad">wrong</span>';
      let answerHtml = '';
      if (it.choices.length && it.taskType !== 'BUILD_SENTENCE') {
        answerHtml = '<div class="opts">' + it.choices.map((c, i) => {
          const isKey = it.correctAnswer === LETTERS[i];
          const isYours = it.yourAnswer === LETTERS[i];
          const cls = isKey ? 'sel' : '';
          return '<div class="opt ' + cls + '"><span><strong>' + LETTERS[i] + '.</strong> ' + TP.esc(c) + ' '
            + (isKey ? '✔ key' : '') + (isYours && !isKey ? ' (your answer)' : '') + '</span></div>';
        }).join('') + '</div>';
      } else if (it.taskType === 'BUILD_SENTENCE') {
        answerHtml = '<p style="margin:6px 0"><strong>Your order:</strong> ' + TP.esc(it.yourAnswer || '(blank)') + '</p>'
          + '<p style="margin:6px 0"><strong>Correct:</strong> ' + TP.esc(it.correctAnswer || '—') + '</p>';
      } else {
        answerHtml = '<div class="q-body">' + TP.esc(it.yourAnswer || '(no response recorded)') + '</div>';
      }
      return `<div class="q-card review-item ${it.autoScore ? (it.isCorrect ? 'correct' : 'wrong') : ''}">
        <div class="q-type">${TP.esc(it.section)} · ${TP.esc(it.taskType.replace(/_/g, ' '))} · Q${idx + 1}</div>
        <p class="q-prompt">${TP.esc(it.prompt)}</p>
        ${it.bodyText ? '<div class="q-body">' + TP.esc(it.bodyText) + '</div>' : ''}
        ${verdict} ${answerHtml}
        ${it.correctAnswer && it.choices.length ? '<p style="margin:8px 0 0;font-size:14px"><strong>Correct answer: ' + TP.esc(it.correctAnswer) + '</strong></p>' : ''}
        ${it.explanation ? '<p style="margin:8px 0 0;font-size:14px;color:var(--muted)">💡 ' + TP.esc(it.explanation) + '</p>' : ''}
      </div>`;
    }).join('')
      + '<div style="display:flex;gap:10px;margin:18px 0 40px"><a class="btn btn-primary" href="/testprep/learning">Practice wrong words again</a>'
      + '<a class="btn btn-outline" href="/testprep/scores">Back to My Scores</a></div>';
  }
  boot();
})();
