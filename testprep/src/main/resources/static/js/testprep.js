(function () {
  'use strict';
  const TP = window.TP = { user: null };
  const SSO_LOGIN = window.TP_SSO_LOGIN || '/login';

  TP.esc = function (v) {
    return String(v == null ? '' : v).replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[c]));
  };

  TP.api = async function (url, opts) {
    opts = opts || {};
    const res = await fetch(url, Object.assign({
      credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' }
    }, opts));
    if (res.status === 401 && url !== '/api/auth/me') { TP.openLoginModal(); throw new Error('login required'); }
    if (!res.ok) {
      let msg = res.statusText;
      try { const j = await res.json(); msg = j.message || msg; } catch (e) { /* ignore */ }
      throw new Error(msg);
    }
    if (res.status === 204) return null;
    const text = await res.text();
    return text ? JSON.parse(text) : null;
  };

  TP.loadMe = async function () {
    try {
      const res = await fetch('/api/auth/me', { credentials: 'same-origin' });
      TP.user = res.ok ? await res.json() : null;
    } catch (e) { TP.user = null; }
    TP.renderAuth();
    return TP.user;
  };

  TP.renderAuth = function () {
    const slot = document.getElementById('tp-auth');
    if (!slot) return;
    if (TP.user) {
      slot.innerHTML = '<span class="who">' + TP.esc(TP.user.loginId) + '</span>'
        + '<a class="btn btn-ghost btn-sm" href="/testprep/scores">My Scores</a>'
        + '<button class="btn btn-ghost btn-sm" type="button" data-tp-logout>Logout</button>';
      slot.querySelector('[data-tp-logout]').addEventListener('click', async () => {
        // feel2real과 세션을 공유 — TestPrep 로그아웃은 Feel2Real에서도 로그아웃된다.
        if (!confirm('TestPrep uses your Feel2Real account. Logging out here signs you out of Feel2Real too. Continue?')) return;
        await fetch('/api/auth/logout', { method: 'POST', credentials: 'same-origin' });
        location.href = '/home';
      });
    } else {
      slot.innerHTML = '<button class="btn btn-ghost btn-sm" type="button" data-tp-login>Login</button>';
      slot.querySelector('[data-tp-login]').addEventListener('click', () => TP.openLoginModal());
    }
  };

  TP.requireLogin = function (then) {
    if (TP.user) { then(); return; }
    TP.openLoginModal();
    window.addEventListener('tp:login', then, { once: true });
  };

  TP.openLoginModal = function () {
    if (document.getElementById('tp-login-modal')) return;
    const next = new URLSearchParams(location.search).get('next');
    const div = document.createElement('div');
    div.id = 'tp-login-modal';
    div.className = 'login-modal';
    const loginHref = SSO_LOGIN + (SSO_LOGIN.includes('?') ? '&' : '?') + 'next=' + encodeURIComponent(location.pathname + location.search);
    div.innerHTML = '<div class="modal-card"><h2>Log in to TestPrep</h2>'
      + '<p class="section lead" style="margin:0">TestPrep uses your existing <b>Feel2Real</b> account — no separate signup. '
      + 'New here? Create an account at Feel2Real first.</p>'
      + '<p class="modal-msg" data-msg></p>'
      + '<div style="display:flex;gap:10px;margin-top:14px">'
      + '<a class="btn btn-primary" href="' + TP.esc(loginHref) + '">Login with Feel2Real</a>'
      + '<button class="btn btn-outline" type="button" data-close>Cancel</button></div>'
      + '<details style="margin-top:14px;font-size:12px"><summary>Local development login (non-production only)</summary>'
      + '<form data-tp-dev-form style="margin-top:8px">'
      + '<label>User ID<input name="userId" type="number" value="1" required></label>'
      + '<label>Login ID<input name="loginId" value="dev.student" required></label>'
      + '<label>Role<select name="role"><option>STUDENT</option><option>ADMIN</option></select></label>'
      + '<button class="btn btn-outline btn-sm" type="submit">Dev login</button></form></details>'
      + '</div>';
    document.body.appendChild(div);
    div.querySelector('[data-close]').addEventListener('click', () => div.remove());
    div.addEventListener('click', e => { if (e.target === div) div.remove(); });
    div.querySelector('[data-tp-dev-form]').addEventListener('submit', async e => {
      e.preventDefault();
      if (location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
        div.querySelector('[data-msg]').textContent = 'Dev login is only available on localhost.';
        return;
      }
      const f = new FormData(e.target);
      try {
        TP.user = await TP.api('/api/auth/dev-login', { method: 'POST', body: JSON.stringify({
          userId: Number(f.get('userId')), loginId: f.get('loginId'), role: f.get('role') }) });
        TP.renderAuth();
        window.dispatchEvent(new CustomEvent('tp:login', { detail: TP.user }));
        div.remove();
        if (next) { location.href = next; }
      } catch (err) {
        div.querySelector('[data-msg]').textContent = 'Dev login failed (prd disables it): ' + err.message;
      }
    });
  };

  document.addEventListener('DOMContentLoaded', async () => {
    await TP.loadMe();
    const next = new URLSearchParams(location.search).get('next');
    if (next) {
      if (TP.user) { location.href = next; return; }
      TP.openLoginModal();
    }
  });
})();
