/* CoPadres v14 — ui.js — Toast & More Menu */

// ── TOAST SYSTEM ─────────────────────────────
function showToast(msg, type, duration) {
  var container = document.getElementById('toast-container');
  if (!container) return;
  var t = document.createElement('div');
  t.className = 'toast' + (type ? ' ' + type : '');
  var icon = type === 'success' ? '✅' : type === 'error' ? '❌' : type === 'warning' ? '⚠️' : 'ℹ️';
  t.textContent = icon + ' ' + msg;
  container.appendChild(t);
  setTimeout(function() {
    t.style.transition = 'opacity .3s';
    t.style.opacity = '0';
    setTimeout(function() { t.remove(); }, 300);
  }, duration || 3000);
}

// ── MORE MENU ────────────────────────────────
function openMoreMenu() {
  document.getElementById('more-overlay').classList.add('open');
}
function closeMoreMenu() {
  document.getElementById('more-overlay').classList.remove('open');
}
// Close on back gesture / Escape
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeMoreMenu();
});
