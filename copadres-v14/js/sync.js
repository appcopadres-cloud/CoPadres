/* CoPadres v14 — sync.js — Sincronización Firebase en tiempo real */

var SYNC = {
  db: null,
  familyId: null,
  userId: null,
  userName: null,
  unsubscribers: [],
  ready: false
};

// ── Inicializar Firebase ──────────────────────
function syncInit(firebaseConfig) {
  if (typeof firebase === 'undefined') return;
  if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
  SYNC.db = firebase.firestore();
  SYNC.ready = true;
}

// ── Generar código de sala (6 caracteres) ────
function generarCodigoSala() {
  var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  var code = '';
  for (var i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

// ── Crear sala familiar (Padre 1) ────────────
function crearSala(nombre, callback) {
  if (!SYNC.ready) { callback && callback(null, 'Firebase no configurado'); return; }
  var codigo = generarCodigoSala();
  var userId = 'u_' + Date.now();
  SYNC.db.collection('familias').doc(codigo).set({
    creadoEn: Date.now(),
    miembros: [{ id: userId, nombre: nombre }],
    hijos: [],
    eventos: [],
    gastos: [],
    acuerdos: [],
    conflictos: []
  }).then(function() {
    SYNC.familyId = codigo;
    SYNC.userId   = userId;
    SYNC.userName = nombre;
    localStorage.setItem('cop_family_id', codigo);
    localStorage.setItem('cop_user_id', userId);
    syncEscuchar();
    callback && callback(codigo, null);
  }).catch(function(e) { callback && callback(null, e.message); });
}

// ── Unirse a sala (Padre 2) ──────────────────
function unirseASala(codigo, nombre, callback) {
  if (!SYNC.ready) { callback && callback(false, 'Firebase no configurado'); return; }
  codigo = codigo.toUpperCase().trim();
  SYNC.db.collection('familias').doc(codigo).get().then(function(doc) {
    if (!doc.exists) { callback && callback(false, 'Código no encontrado'); return; }
    var userId = 'u_' + Date.now();
    var miembros = doc.data().miembros || [];
    // Evitar duplicados por nombre
    var existe = miembros.some(function(m) { return m.nombre === nombre; });
    if (!existe) miembros.push({ id: userId, nombre: nombre });
    return SYNC.db.collection('familias').doc(codigo).update({ miembros: miembros }).then(function() {
      SYNC.familyId = codigo;
      SYNC.userId   = userId;
      SYNC.userName = nombre;
      localStorage.setItem('cop_family_id', codigo);
      localStorage.setItem('cop_user_id', userId);
      syncEscuchar();
      callback && callback(true, null);
    });
  }).catch(function(e) { callback && callback(false, e.message); });
}

// ── Escuchar cambios en tiempo real ─────────
function syncEscuchar() {
  if (!SYNC.db || !SYNC.familyId) return;

  // Desuscribir listeners anteriores
  SYNC.unsubscribers.forEach(function(u) { u(); });
  SYNC.unsubscribers = [];

  // Datos principales (hijos, eventos, gastos, acuerdos, conflictos)
  var unsubData = SYNC.db.collection('familias').doc(SYNC.familyId)
    .onSnapshot(function(doc) {
      if (!doc.exists) return;
      var d = doc.data();
      var changed = false;
      ['hijos','eventos','gastos','acuerdos','conflictos'].forEach(function(k) {
        if (Array.isArray(d[k])) { state[k] = d[k]; changed = true; }
      });
      if (changed) syncRenderAll();
    }, function(e) { console.warn('[Sync] Error datos:', e); });

  // Mensajes en tiempo real (subcolección)
  var unsubMsg = SYNC.db.collection('familias').doc(SYNC.familyId)
    .collection('mensajes').orderBy('ts')
    .onSnapshot(function(snapshot) {
      state.mensajes = snapshot.docs.map(function(d) { return d.data(); });
      if (typeof renderChat === 'function') renderChat();
      if (typeof renderDashboard === 'function') renderDashboard();
    }, function(e) { console.warn('[Sync] Error mensajes:', e); });

  SYNC.unsubscribers.push(unsubData, unsubMsg);
}

// ── Guardar datos compartidos en Firestore ───
function syncGuardar(campos) {
  if (!SYNC.db || !SYNC.familyId) return;
  var update = {};
  campos.forEach(function(k) { update[k] = state[k]; });
  SYNC.db.collection('familias').doc(SYNC.familyId).update(update)
    .catch(function(e) { console.warn('[Sync] Error guardar:', e); });
}

// ── Enviar mensaje al chat compartido ────────
function syncEnviarMensaje(msg) {
  if (!SYNC.db || !SYNC.familyId) return false;
  SYNC.db.collection('familias').doc(SYNC.familyId)
    .collection('mensajes').add(msg)
    .catch(function(e) { console.warn('[Sync] Error mensaje:', e); });
  return true;
}

// ── Re-renderizar todo tras sync ─────────────
function syncRenderAll() {
  if (typeof renderDashboard === 'function') renderDashboard();
  if (typeof renderEventos === 'function') renderEventos();
  if (typeof renderHijos === 'function') renderHijos();
  if (typeof renderGastos === 'function') renderGastos();
  if (typeof renderAcuerdos === 'function') renderAcuerdos();
  if (typeof renderConflictos === 'function') renderConflictos();
}

// ── Reconectar si ya tenía sala guardada ─────
function syncReconectar() {
  var fid = localStorage.getItem('cop_family_id');
  var uid = localStorage.getItem('cop_user_id');
  if (!fid || !uid || !SYNC.ready) return false;
  SYNC.familyId = fid;
  SYNC.userId   = uid;
  SYNC.userName = state.usuario;
  syncEscuchar();
  return true;
}

// ── Desconectarse de la sala ─────────────────
function syncDesconectar() {
  SYNC.unsubscribers.forEach(function(u) { u(); });
  SYNC.unsubscribers = [];
  SYNC.familyId = null;
  SYNC.userId   = null;
  localStorage.removeItem('cop_family_id');
  localStorage.removeItem('cop_user_id');
  showToast('Desconectado de la sala familiar', 'info');
}

// ── Estado de conexión para la UI ────────────
function syncConectado() {
  return !!(SYNC.db && SYNC.familyId);
}
