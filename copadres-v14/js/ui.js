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
    '  <div id="welcome-logo">',
    '    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="80" height="80">',
    '      <rect width="1024" height="1024" rx="220" fill="#52C896"/>',
    '      <rect x="90" y="90" width="844" height="844" rx="160" fill="#FFFFFF"/>',
    '      <circle cx="360" cy="330" r="115" fill="#1B4D3E"/>',
    '      <path d="M160 780 Q160 490 360 490 Q560 490 560 780Z" fill="#1B4D3E"/>',
    '      <circle cx="630" cy="310" r="105" fill="#3AABA6"/>',
    '      <path d="M430 780 Q430 480 630 480 Q830 480 830 780Z" fill="#3AABA6"/>',
    '      <circle cx="500" cy="480" r="78" fill="#3AABA6"/>',
    '      <path d="M340 780 Q340 570 500 570 Q660 570 660 780Z" fill="#3AABA6"/>',
    '    </svg>',
    '  </div>',
    '  <h1>Bienvenido a CoPadres</h1>',
    '  <p>La app para organizar la crianza compartida de tus hijos con respeto y claridad.</p>',
    '  <label for="welcome-nombre">¿Cómo te llamas?</label>',
    '  <input id="welcome-nombre" type="text" placeholder="Ej: Mamá, Papá, tu nombre..." maxlength="30" autocomplete="off"/>',
    '  <button id="welcome-btn" onclick="welcomePaso2()">Continuar →</button>',
    '</div>'
  ].join('');
  document.body.appendChild(overlay);
  setTimeout(function(){ document.getElementById('welcome-nombre').focus(); }, 300);
  document.getElementById('welcome-nombre').addEventListener('keydown', function(e){
    if (e.key === 'Enter') welcomePaso2();
  });
}

function welcomePaso2() {
  var input = document.getElementById('welcome-nombre');
  var nombre = (input ? input.value.trim() : '');
  if (!nombre) { input && input.focus(); return; }
  state.usuario = nombre;
  guardarEstado();

  // Si Firebase no está habilitado, saltar conexión
  if (typeof FIREBASE_ENABLED === 'undefined' || !FIREBASE_ENABLED) {
    finishWelcome(); return;
  }

  // Mostrar paso de conexión
  var card = document.getElementById('welcome-card');
  card.innerHTML = [
    '<div id="welcome-logo">',
    '  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="70" height="70">',
    '    <rect width="1024" height="1024" rx="220" fill="#52C896"/>',
    '    <rect x="90" y="90" width="844" height="844" rx="160" fill="#FFFFFF"/>',
    '    <circle cx="360" cy="330" r="115" fill="#1B4D3E"/>',
    '    <path d="M160 780 Q160 490 360 490 Q560 490 560 780Z" fill="#1B4D3E"/>',
    '    <circle cx="630" cy="310" r="105" fill="#3AABA6"/>',
    '    <path d="M430 780 Q430 480 630 480 Q830 480 830 780Z" fill="#3AABA6"/>',
    '    <circle cx="500" cy="480" r="78" fill="#3AABA6"/>',
    '    <path d="M340 780 Q340 570 500 570 Q660 570 660 780Z" fill="#3AABA6"/>',
    '  </svg>',
    '</div>',
    '<h1>Hola, ' + nombre + ' 👋</h1>',
    '<p>¿Quieres conectarte con el otro padre/madre para compartir datos en tiempo real?</p>',
    '<button class="welcome-btn-green" onclick="welcomeCrearSala()">🏠 Crear sala familiar</button>',
    '<button class="welcome-btn-outline" onclick="welcomeUnirse()">🔑 Tengo un código de sala</button>',
    '<button class="welcome-btn-skip" onclick="finishWelcome()">Omitir por ahora →</button>'
  ].join('');
}

function welcomeCrearSala() {
  var card = document.getElementById('welcome-card');
  card.innerHTML = '<h1>Creando sala...</h1><p style="text-align:center;color:#52C896">⏳ Un momento</p>';
  crearSala(state.usuario, function(codigo, err) {
    if (err) { card.innerHTML = '<h1>Error</h1><p>' + err + '</p><button onclick="finishWelcome()">Continuar sin conexión</button>'; return; }
    card.innerHTML = [
      '<h1>¡Sala creada! 🎉</h1>',
      '<p>Comparte este código con el otro padre/madre:</p>',
      '<div style="font-size:42px;font-weight:900;letter-spacing:8px;color:#1B4D3E;background:#e8f5ee;border-radius:16px;padding:18px 24px;margin:16px 0;text-align:center">' + codigo + '</div>',
      '<p style="font-size:13px;color:#6b7280">Cuando se una con el mismo código, todo se sincronizará automáticamente.</p>',
      '<button class="welcome-btn-green" onclick="finishWelcome()">Entrar a CoPadres →</button>'
    ].join('');
  });
}

function welcomeUnirse() {
  var card = document.getElementById('welcome-card');
  card.innerHTML = [
    '<h1>Unirse a sala</h1>',
    '<p>Ingresa el código que te compartió el otro padre/madre:</p>',
    '<input id="welcome-codigo" type="text" placeholder="Ej: ABC123" maxlength="6" style="text-transform:uppercase;font-size:28px;font-weight:800;letter-spacing:6px;text-align:center"/>',
    '<button class="welcome-btn-green" onclick="welcomeConfirmarUnirse()">Conectarse →</button>',
    '<button class="welcome-btn-skip" onclick="welcomePaso2()">← Volver</button>'
  ].join('');
  setTimeout(function(){
    var el=document.getElementById('welcome-codigo');
    if(el){
      el.focus();
      el.addEventListener('keydown', function(e){ if(e.key==='Enter') welcomeConfirmarUnirse(); });
    }
  }, 200);
}

function welcomeConfirmarUnirse() {
  var input = document.getElementById('welcome-codigo');
  var codigo = input ? input.value.trim().toUpperCase() : '';
  if (codigo.length < 6) { showToast('Ingresa el código de 6 caracteres', 'warning'); return; }
  var card = document.getElementById('welcome-card');
  card.innerHTML = '<h1>Conectando...</h1><p style="text-align:center;color:#52C896">⏳ Un momento</p>';
  unirseASala(codigo, state.usuario, function(ok, err) {
    if (!ok) { card.innerHTML = '<h1>Código no encontrado</h1><p>' + (err||'Verifica el código') + '</p><button onclick="welcomeUnirse()">Intentar de nuevo</button>'; return; }
    card.innerHTML = [
      '<h1>¡Conectado! 🔗</h1>',
      '<p>Ya estás sincronizado/a con la sala <strong>' + codigo + '</strong>.</p>',
      '<p style="font-size:13px;color:#6b7280">Los datos se sincronizarán en tiempo real con el otro padre/madre.</p>',
      '<button class="welcome-btn-green" onclick="finishWelcome()">Entrar a CoPadres →</button>'
    ].join('');
  });
}

function finishWelcome() {
  var overlay = document.getElementById('welcome-overlay');
  if (overlay) {
    overlay.style.opacity = '0';
    overlay.style.transition = 'opacity .3s';
    setTimeout(function(){ overlay.remove(); }, 300);
  }
  renderSidebar();
  renderDashboard();
}

// ── MODAL SALA FAMILIAR (desde ajustes) ──────
function abrirModalSala() {
  var conectado = typeof syncConectado === 'function' && syncConectado();
  var fid = localStorage.getItem('cop_family_id');
  var html;
  if (conectado && fid) {
    html = [
      '<div class="modal-handle"></div>',
      '<div style="font-size:18px;font-weight:800;margin-bottom:6px">Sala Familiar</div>',
      '<p style="color:#6b7280;font-size:13px;margin-bottom:16px">Conectado en tiempo real con el otro padre/madre.</p>',
      '<div style="background:#e8f5ee;border-radius:14px;padding:16px;text-align:center;margin-bottom:16px">',
      '  <div style="font-size:11px;font-weight:700;color:#15803d;text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px">Código de tu sala</div>',
      '  <div style="font-size:36px;font-weight:900;letter-spacing:6px;color:#1B4D3E">' + fid + '</div>',
      '</div>',
      '<button class="btn btn-outline" onclick="syncDesconectar();closeModal(\'modal-sala\')" style="margin-top:8px">Desconectarse de la sala</button>',
      '<button class="btn btn-outline" onclick="closeModal(\'modal-sala\')" style="margin-top:8px">Cerrar</button>'
    ].join('');
  } else {
    html = [
      '<div class="modal-handle"></div>',
      '<div style="font-size:18px;font-weight:800;margin-bottom:6px">Conectar con co-padre/madre</div>',
      '<p style="color:#6b7280;font-size:13px;margin-bottom:16px">Crea una sala o únete a una existente para sincronizar datos en tiempo real.</p>',
      '<button class="btn btn-green" onclick="closeModal(\'modal-sala\');welcomeCrearSala2()" style="margin-bottom:8px">🏠 Crear sala familiar</button>',
      '<button class="btn btn-outline" onclick="closeModal(\'modal-sala\');welcomeUnirseModal()">🔑 Tengo un código</button>',
      '<button class="btn btn-outline" onclick="closeModal(\'modal-sala\')" style="margin-top:8px">Cancelar</button>'
    ].join('');
  }
  var modal = document.getElementById('modal-sala');
  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'modal-sala';
    modal.innerHTML = '<div class="modal"></div>';
    document.body.appendChild(modal);
    modal.addEventListener('click', function(e){ if(e.target===modal) closeModal('modal-sala'); });
  }
  modal.querySelector('.modal').innerHTML = html;
  openModal('modal-sala');
}

function welcomeCrearSala2() {
  // Mostrar mini-overlay para crear sala desde ajustes (no bienvenida)
  crearSala(state.usuario, function(codigo, err) {
    if (err) { showToast('Error al crear sala: ' + err, 'error'); return; }
    showToast('Sala creada: ' + codigo, 'success', 6000);
    // Mostrar código en modal rápido
    var modal = document.getElementById('modal-sala');
    if (!modal) {
      modal = document.createElement('div');
      modal.className = 'modal-overlay';
      modal.id = 'modal-sala';
      modal.innerHTML = '<div class="modal"></div>';
      document.body.appendChild(modal);
    }
    modal.querySelector('.modal').innerHTML = [
      '<div class="modal-handle"></div>',
      '<h2 style="margin-bottom:8px">¡Sala creada! 🎉</h2>',
      '<p style="color:#6b7280;font-size:13px">Comparte este código:</p>',
      '<div style="font-size:42px;font-weight:900;letter-spacing:8px;color:#1B4D3E;background:#e8f5ee;border-radius:16px;padding:18px;text-align:center;margin:12px 0">' + codigo + '</div>',
      '<button class="btn btn-green" onclick="closeModal(\'modal-sala\')">Listo</button>'
    ].join('');
    openModal('modal-sala');
  });
}

function welcomeUnirseModal() {
  var modal = document.getElementById('modal-sala');
  if (!modal) {
    modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.id = 'modal-sala';
    modal.innerHTML = '<div class="modal"></div>';
    document.body.appendChild(modal);
  }
  modal.querySelector('.modal').innerHTML = [
    '<div class="modal-handle"></div>',
    '<div style="font-size:18px;font-weight:800;margin-bottom:12px">Unirse a sala</div>',
    '<input id="modal-codigo-inp" type="text" class="inp" placeholder="Código de 6 caracteres" maxlength="6" style="text-transform:uppercase;font-size:24px;font-weight:800;letter-spacing:6px;text-align:center;margin-bottom:12px"/>',
    '<button class="btn btn-green" onclick="modalConfirmarUnirse()">Conectarse →</button>',
    '<button class="btn btn-outline" onclick="closeModal(\'modal-sala\')" style="margin-top:8px">Cancelar</button>'
  ].join('');
  openModal('modal-sala');
  setTimeout(function(){
    var el=document.getElementById('modal-codigo-inp');
    if(el){
      el.focus();
      el.addEventListener('keydown', function(e){ if(e.key==='Enter') modalConfirmarUnirse(); });
    }
  }, 200);
}

function modalConfirmarUnirse() {
  var input = document.getElementById('modal-codigo-inp');
  var codigo = input ? input.value.trim().toUpperCase() : '';
  if (codigo.length < 6) { showToast('Ingresa el código de 6 caracteres', 'warning'); return; }
  input.disabled = true;
  unirseASala(codigo, state.usuario, function(ok, err) {
    if (!ok) { showToast('Código no encontrado: ' + (err||''), 'error'); if(input) input.disabled=false; return; }
    closeModal('modal-sala');
    showToast('¡Conectado a sala ' + codigo + '!', 'success');
  });
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
