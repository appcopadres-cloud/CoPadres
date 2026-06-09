/* CoPadres v14 — init.js */

// 1. Cargar estado persistido
cargarEstado();
cargarAdvertencias();

// 2. Inicializar Firebase si está configurado
if (typeof FIREBASE_ENABLED !== 'undefined' && FIREBASE_ENABLED) {
  syncInit(FIREBASE_CONFIG);
  // Reconectar sala si ya existía
  if (state.usuario) syncReconectar();
}

// 2b. Inicializar analytics (fire-and-forget, nunca bloquea)
if (typeof analyticsInit === 'function') {
  try { analyticsInit(); } catch(e) {}
}

// 3. Handle deep link shortcuts
(function(){
  var params = new URLSearchParams(window.location.search);
  var panel = params.get('panel');
  if (panel) {
    var panels = ['mensajes','calendario','hijos','gastos','acuerdos','conflictos','seguridad'];
    if (panels.indexOf(panel) !== -1) {
      window.addEventListener('DOMContentLoaded', function(){ goTo(panel); });
    }
  }
})();

// 4. Primera vez → mostrar bienvenida
if (!state.usuario) {
  window.addEventListener('DOMContentLoaded', function(){ showWelcome(); });
}

// 5. Render vistas iniciales
renderSidebar();
renderDashboard();
renderChat();
