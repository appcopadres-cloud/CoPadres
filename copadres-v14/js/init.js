/* CoPadres v14 — init.js */
// ═══════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════

// 1. Cargar estado persistido (mensajes, hijos, eventos, gastos, etc.)
cargarEstado();
cargarAdvertencias();

// 2. Handle deep link shortcuts from manifest
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

// 3. Render initial views
renderSidebar();
renderDashboard();
renderChat();
