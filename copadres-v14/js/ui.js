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

// ── PANTALLA DE BIENVENIDA (primera vez) ─────
function showWelcome() {
  var overlay = document.createElement('div');
  overlay.id = 'welcome-overlay';
  overlay.innerHTML = [
    '<div id="welcome-card">',
    '  <div id="welcome-logo"></div>',
    '  <h1>Bienvenido a CoPadres</h1>',
    '  <p>La app para organizar la crianza compartida de tus hijos con respeto y claridad.</p>',
    '  <label for="welcome-nombre">¿Cómo quieres que te llame la app?</label>',
    '  <input id="welcome-nombre" type="text" placeholder="Ej: Mamá, Papá, tu nombre..." maxlength="30" autocomplete="off"/>',
    '  <button id="welcome-btn" onclick="finishWelcome()">Comenzar →</button>',
    '</div>'
  ].join('');
  document.body.appendChild(overlay);
  setTimeout(function(){ document.getElementById('welcome-nombre').focus(); }, 300);
  document.getElementById('welcome-nombre').addEventListener('keydown', function(e){
    if (e.key === 'Enter') finishWelcome();
  });
}

function finishWelcome() {
  var input = document.getElementById('welcome-nombre');
  var nombre = (input ? input.value.trim() : '') || 'Usuario';
  state.usuario = nombre;
  guardarEstado();
  var overlay = document.getElementById('welcome-overlay');
  if (overlay) {
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity .3s';
    setTimeout(function(){ overlay.remove(); }, 300);
  }
  renderSidebar();
  renderDashboard();
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
