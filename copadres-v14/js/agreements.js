/* CoPadres v14 — agreements.js */
// ═══════════════════════════════════════════
// ACUERDOS
// ═══════════════════════════════════════════

// ── PDF / IMAGEN ADJUNTA ─────────────────────
function previewAcuerdoPDF(input) {
  var file = input.files[0];
  if (!file) return;
  var isPDF = file.type === 'application/pdf';
  var isImg = file.type.startsWith('image/');
  if (!isPDF && !isImg) return showToast('Solo se aceptan PDF o imágenes','error');

  var reader = new FileReader();
  reader.onload = function(e) {
    if (isImg) {
      var img = new Image();
      img.onload = function() {
        var MAX = 1200;
        var canvas = document.createElement('canvas');
        var ratio = Math.min(MAX / img.width, MAX / img.height, 1);
        canvas.width = Math.round(img.width * ratio);
        canvas.height = Math.round(img.height * ratio);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        window._pdfTemp = { data: canvas.toDataURL('image/jpeg', 0.8), tipo: 'image', nombre: file.name };
        mostrarPreviewAcuerdo(file.name, 'image');
      };
      img.src = e.target.result;
    } else {
      window._pdfTemp = { data: e.target.result, tipo: 'pdf', nombre: file.name };
      mostrarPreviewAcuerdo(file.name, 'pdf');
    }
  };
  reader.readAsDataURL(file);
}

function mostrarPreviewAcuerdo(nombre, tipo) {
  var prev = document.getElementById('ac-pdf-preview');
  var icono = tipo === 'pdf' ? '📄' : '🖼️';
  prev.innerHTML = '<div style="background:#f0fdf4;border:2px solid #52C896;border-radius:14px;padding:14px;display:flex;align-items:center;gap:12px">'
    + '<span style="font-size:28px">' + icono + '</span>'
    + '<div style="flex:1;min-width:0"><div style="font-weight:700;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + nombre + '</div>'
    + '<div style="font-size:11px;color:#15803d;margin-top:2px">Listo para adjuntar ✓</div></div>'
    + '<button type="button" onclick="quitarAcuerdoPDF()" style="background:#ef4444;color:#fff;border:none;border-radius:8px;padding:4px 10px;font-size:12px;font-weight:700;cursor:pointer">✕</button>'
    + '</div>';
}

function quitarAcuerdoPDF() {
  window._pdfTemp = null;
  document.getElementById('ac-pdf').value = '';
  document.getElementById('ac-pdf-preview').innerHTML = '<button type="button" onclick="document.getElementById(\'ac-pdf\').click()" style="width:100%;padding:14px;border:2px dashed #d1d5db;border-radius:14px;background:#f9fafb;color:#6b7280;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px"><span style="font-size:20px">📄</span> Adjuntar PDF o imagen del acuerdo</button>';
}

function verDocumentoAcuerdo(id) {
  var stored = null;
  try { stored = JSON.parse(localStorage.getItem('cop_pdf_' + id)); } catch(e) {}
  if (!stored) return showToast('Documento no disponible en este dispositivo','warning');

  var viewer = document.getElementById('modal-pdf-viewer');
  var frame  = document.getElementById('modal-pdf-frame');
  var img    = document.getElementById('modal-pdf-img');
  var dlBtn  = document.getElementById('modal-pdf-dl');
  document.getElementById('modal-pdf-nombre').textContent = stored.nombre || 'Documento';

  if (stored.tipo === 'pdf') {
    frame.src = stored.data;
    frame.style.display = 'block';
    img.style.display = 'none';
  } else {
    img.src = stored.data;
    img.style.display = 'block';
    frame.style.display = 'none';
  }

  dlBtn.onclick = function() {
    var a = document.createElement('a');
    a.href = stored.data;
    a.download = stored.nombre || ('acuerdo_' + id + (stored.tipo === 'pdf' ? '.pdf' : '.jpg'));
    a.click();
  };

  viewer.style.display = 'flex';
}

function addAcuerdo() {
  var titulo = document.getElementById('ac-titulo');
  var tipo   = document.getElementById('ac-tipo');
  var estado = document.getElementById('ac-estado');
  var desc   = document.getElementById('ac-desc');
  if (!titulo || !tipo || !desc) return;
  var t = titulo.value.trim();
  if (!t) return showToast('Ingresa un título para el acuerdo','error');
  var today = new Date().toISOString().split('T')[0];
  var id = Date.now();
  var tieneDoc = !!(window._pdfTemp);

  if (window._pdfTemp) {
    try {
      localStorage.setItem('cop_pdf_' + id, JSON.stringify(window._pdfTemp));
    } catch(e) {
      showToast('El archivo es demasiado grande para guardar','warning');
      tieneDoc = false;
    }
    window._pdfTemp = null;
  }

  state.acuerdos.push({
    id: id,
    titulo: t,
    tipo: tipo.value,
    descripcion: desc.value.trim(),
    fecha: today,
    estado: estado ? estado.value : 'Vigente',
    tieneDoc: tieneDoc
  });
  guardarEstado(['acuerdos']);
  closeModal('modal-acuerdo');
  titulo.value = '';
  desc.value = '';
  quitarAcuerdoPDF();
  renderAcuerdos();
  renderDashboard();
  showToast('Acuerdo guardado' + (tieneDoc ? ' con documento ✓' : ''), 'success');
  if (typeof analyticsEvent === 'function') { try { analyticsEvent('agreement_added'); } catch(e) {} }
}

function renderAcuerdos() {
  var list = document.getElementById('acuerdos-list');
  if (!list) return;

  if (!state.acuerdos.length) {
    list.innerHTML = '<div class="card" style="text-align:center;padding:30px">'
      + '<div style="margin-bottom:14px"><span class="ic-wrap" style="width:64px;height:64px;background:#f0fdf4;color:#15803d">' + icSprite('doc','ic-lg') + '</span></div>'
      + '<div style="font-weight:700;color:#1B4D3E">Sin acuerdos registrados</div>'
      + '<div style="font-size:13px;color:var(--sub);margin-top:4px">Registra mediaciones, acuerdos legales o compromisos</div>'
      + '<button class="btn btn-green" onclick="openModal(\'modal-acuerdo\')" style="margin-top:16px;width:auto;padding:10px 20px;font-size:13px">+ Agregar acuerdo</button>'
      + '</div>';
    return;
  }

  var chipColor = { Vigente: 'green', Suspendido: 'orange', Vencido: 'gray' };

  list.innerHTML = state.acuerdos.map(function(a) {
    var docLocal = localStorage.getItem('cop_pdf_' + a.id);
    var docBtn = '';
    if (docLocal) {
      docBtn = '<button onclick="verDocumentoAcuerdo(' + a.id + ')" style="background:#e8f5ee;color:#15803d;border:none;border-radius:8px;padding:6px 12px;font-size:12px;font-weight:700;cursor:pointer;display:inline-flex;align-items:center;gap:6px;margin-top:10px">📄 Ver documento</button>';
    } else if (a.tieneDoc) {
      docBtn = '<span style="font-size:12px;color:#6b7280;margin-top:10px;display:block">📄 Documento guardado en otro dispositivo</span>';
    }

    return '<div class="card">'
      + '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:10px">'
      + '<div style="display:flex;align-items:center;gap:10px;flex:1">'
      + '<span class="ic-wrap" style="width:36px;height:36px;background:#f0fdf4;color:#15803d">' + icSprite('doc','ic-md') + '</span>'
      + '<div style="font-size:16px;font-weight:800">' + a.titulo + '</div></div>'
      + '<span class="chip chip-' + (chipColor[a.estado] || 'green') + '" style="display:inline-flex;align-items:center;gap:4px;flex-shrink:0">'
      + icSprite('check','ic-sm') + a.estado + '</span>'
      + '</div>'
      + '<div style="font-size:13px;color:var(--sub);margin-bottom:12px;line-height:1.5">' + (a.descripcion || '') + '</div>'
      + '<div style="display:flex;gap:8px;flex-wrap:wrap">'
      + '<span class="chip chip-purple" style="display:inline-flex;align-items:center;gap:4px">' + icSprite('scale','ic-sm') + a.tipo + '</span>'
      + '<span class="chip chip-gray" style="display:inline-flex;align-items:center;gap:4px">' + icSprite('calendar','ic-sm') + a.fecha + '</span>'
      + '</div>'
      + docBtn
      + '</div>';
  }).join('');
}

// ═══════════════════════════════════════════
// CONFLICTOS
// ═══════════════════════════════════════════
