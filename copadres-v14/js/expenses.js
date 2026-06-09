/* CoPadres v14 — expenses.js */
// ═══════════════════════════════════════════
// GASTOS
// ═══════════════════════════════════════════
function fmt(n){return '$'+(n/1000).toFixed(0)+'K';}

// ── BOLETA / COMPROBANTE ─────────────────────
function previewBoleta(input) {
  var file = input.files[0];
  if (!file) return;
  var reader = new FileReader();
  reader.onload = function(e) {
    // Comprimir imagen via canvas antes de guardar
    var img = new Image();
    img.onload = function() {
      var MAX = 800;
      var canvas = document.createElement('canvas');
      var ratio = Math.min(MAX / img.width, MAX / img.height, 1);
      canvas.width = Math.round(img.width * ratio);
      canvas.height = Math.round(img.height * ratio);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      var compressed = canvas.toDataURL('image/jpeg', 0.7);
      // Guardar en memoria temporal para cuando se haga addGasto
      window._boletaTemp = compressed;
      // Mostrar preview
      var prev = document.getElementById('g-boleta-preview');
      prev.innerHTML = '<div style="position:relative;display:inline-block;width:100%">'
        + '<img src="' + compressed + '" style="width:100%;max-height:160px;object-fit:cover;border-radius:12px;border:2px solid #52C896"/>'
        + '<button type="button" onclick="quitarBoleta()" style="position:absolute;top:6px;right:6px;background:#ef4444;color:#fff;border:none;border-radius:8px;padding:4px 8px;font-size:12px;font-weight:700;cursor:pointer">✕ Quitar</button>'
        + '</div>';
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function quitarBoleta() {
  window._boletaTemp = null;
  document.getElementById('g-boleta').value = '';
  document.getElementById('g-boleta-preview').innerHTML = '<button type="button" onclick="document.getElementById(\'g-boleta\').click()" style="width:100%;padding:14px;border:2px dashed #d1d5db;border-radius:14px;background:#f9fafb;color:#6b7280;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:8px"><span style="font-size:20px">📎</span> Adjuntar foto de boleta o transferencia</button>';
}

function verBoleta(id) {
  var data = localStorage.getItem('cop_boleta_' + id);
  if (!data) return showToast('Boleta no disponible en este dispositivo','warning');
  document.getElementById('modal-boleta-img').src = data;
  document.getElementById('modal-boleta').style.display = 'flex';
}

function renderGastos(){
  var total=state.gastos.reduce(function(s,g){return s+g.monto},0);
  var mama=state.gastos.filter(function(g){return g.pagador==='Mamá'}).reduce(function(s,g){return s+g.monto},0);
  var papa=state.gastos.filter(function(g){return g.pagador==='Papá'}).reduce(function(s,g){return s+g.monto},0);
  document.getElementById('total-gastos').textContent=fmt(total);
  document.getElementById('total-mama').textContent=fmt(mama);
  document.getElementById('total-papa').textContent=fmt(papa);

  var catColors={Educación:'blue',Salud:'green',Alimentación:'orange',Transporte:'purple',Ropa:'pink',Otro:'gray'};
  var catIcons={Educación:'school',Salud:'health',Alimentación:'food',Transporte:'car',Ropa:'shirt',Otro:'wallet'};
  var list=document.getElementById('gastos-list');
  if(!list) return;
  if(!state.gastos.length){
    list.innerHTML='<div class="card" style="text-align:center;padding:30px"><div style="margin-bottom:14px"><span class="ic-wrap" style="width:64px;height:64px;background:#faf5ff;color:#7c3aed">'+icSprite('wallet','ic-lg')+'</span></div><div style="font-weight:700;color:#1B4D3E">Sin gastos registrados</div><div style="font-size:13px;color:var(--sub);margin-top:4px">Registra los gastos compartidos de los niños</div><button class="btn btn-green" onclick="openModal(\'modal-gasto\')" style="margin-top:16px;width:auto;padding:10px 20px;font-size:13px">+ Registrar gasto</button></div>';
    return;
  }
  list.innerHTML=[...state.gastos].reverse().map(function(g){
    var color=g.pagador==='Mamá'?'#7c3aed':'#2563eb';
    var icName=catIcons[g.categoria]||'wallet';
    var boletaLocal = localStorage.getItem('cop_boleta_'+g.id);
    var boletaBtn = '';
    if (boletaLocal) {
      boletaBtn = '<button onclick="verBoleta('+g.id+')" style="margin-top:5px;background:#e8f5ee;color:#15803d;border:none;border-radius:8px;padding:4px 8px;font-size:11px;font-weight:700;cursor:pointer;display:flex;align-items:center;gap:4px">📎 Ver boleta</button>';
    } else if (g.tieneBoleta) {
      boletaBtn = '<span style="margin-top:5px;font-size:11px;color:#6b7280;display:block">📎 Boleta en otro dispositivo</span>';
    }
    return '<div class="expense-row">'
      +'<div class="avatar" style="width:40px;height:40px;background:'+color+';font-size:14px;font-weight:800">'+g.pagador[0]+'</div>'
      +'<div style="flex:1;min-width:0;padding:0 12px">'
      +'<div style="font-weight:600;font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+g.descripcion+'</div>'
      +'<div style="font-size:11px;color:var(--sub);margin-top:2px">'+g.fecha+' · '+g.pagador+'</div>'
      +boletaBtn
      +'</div>'
      +'<div>'
      +'<div style="font-size:15px;font-weight:800;color:var(--green);text-align:right">$'+g.monto.toLocaleString('es-CL')+'</div>'
      +'<span class="chip chip-'+(catColors[g.categoria]||'gray')+'" style="float:right;margin-top:4px;display:inline-flex;align-items:center;gap:4px">'+icSprite(icName,'ic-sm')+g.categoria+'</span>'
      +'</div></div>';
  }).join('');
}

function addGasto(){
  var desc=document.getElementById('g-desc').value.trim();
  var monto=parseInt(document.getElementById('g-monto').value)||0;
  var cat=document.getElementById('g-cat').value;
  var pag=document.getElementById('g-pag').value;
  if(!desc||!monto) return showToast('Completa descripción y monto','error');
  var today=new Date().toISOString().split('T')[0];
  var id=Date.now();
  var tieneBoleta = !!(window._boletaTemp);
  // Guardar imagen solo en localStorage (no en Firestore — demasiado peso)
  if (window._boletaTemp) {
    try { localStorage.setItem('cop_boleta_'+id, window._boletaTemp); } catch(e) {}
    window._boletaTemp = null;
  }
  state.gastos.push({id:id,categoria:cat,descripcion:desc,monto:monto,pagador:pag,fecha:today,tieneBoleta:tieneBoleta});
  guardarEstado(['gastos']);
  closeModal('modal-gasto');
  document.getElementById('g-desc').value='';
  document.getElementById('g-monto').value='';
  quitarBoleta();
  renderGastos();
  renderDashboard();
  showToast('Gasto guardado'+(tieneBoleta?' con boleta':''),'success');
  if (typeof analyticsEvent === 'function') { try { analyticsEvent('expense_added'); } catch(e) {} }
}

