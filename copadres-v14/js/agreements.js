/* CoPadres v14 — agreements.js */
// ═══════════════════════════════════════════
// ACUERDOS
// ═══════════════════════════════════════════
function renderAcuerdos(){
  var list=document.getElementById('acuerdos-list');
  if(!list) return;
  if(!state.acuerdos.length){
    list.innerHTML='<div class="card" style="text-align:center;padding:30px"><div style="margin-bottom:14px"><span class="ic-wrap" style="width:64px;height:64px;background:#f0fdf4;color:#15803d">'+icSprite('scale','ic-lg')+'</span></div><div style="font-weight:700;color:#1B4D3E">Sin acuerdos registrados</div><div style="font-size:13px;color:var(--sub);margin-top:4px">Agrega acuerdos de mediación y compromisos</div><button class="btn btn-green" onclick="openModal(\'modal-acuerdo\')" style="margin-top:16px;width:auto;padding:10px 20px;font-size:13px">+ Agregar acuerdo</button></div>';
    return;
  }
  list.innerHTML=state.acuerdos.map(function(a){
    return '<div class="card">'
      +'<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;margin-bottom:10px">'
      +'<div style="display:flex;align-items:center;gap:10px;flex:1"><span class="ic-wrap" style="width:36px;height:36px;background:#f0fdf4;color:#15803d">'+icSprite('doc','ic-md')+'</span><div style="font-size:16px;font-weight:800">'+a.titulo+'</div></div>'
      +'<span class="chip chip-green" style="display:inline-flex;align-items:center;gap:4px">'+icSprite('check','ic-sm')+a.estado+'</span></div>'
      +'<div style="font-size:13px;color:var(--sub);margin-bottom:12px;line-height:1.5">'+a.descripcion+'</div>'
      +'<div style="display:flex;gap:8px;flex-wrap:wrap">'
      +'<span class="chip chip-purple" style="display:inline-flex;align-items:center;gap:4px">'+icSprite('scale','ic-sm')+a.tipo+'</span>'
      +'<span class="chip chip-gray" style="display:inline-flex;align-items:center;gap:4px">'+icSprite('calendar','ic-sm')+a.fecha+'</span>'
      +'</div></div>';
  }).join('');
}

function addAcuerdo(){
  var titulo=document.getElementById('ac-titulo');
  var tipo=document.getElementById('ac-tipo');
  var desc=document.getElementById('ac-desc');
  if(!titulo||!tipo||!desc) return;
  var t=titulo.value.trim();
  var d=desc.value.trim();
  if(!t||!d) return showToast('Completa el título y la descripción','error');
  var today=new Date().toISOString().split('T')[0];
  state.acuerdos.push({id:Date.now(),titulo:t,tipo:tipo.value,descripcion:d,fecha:today,estado:'Vigente'});
  guardarEstado(['acuerdos']);
  closeModal('modal-acuerdo');
  titulo.value='';
  desc.value='';
  renderAcuerdos();
  renderDashboard();
  showToast('Acuerdo guardado','success');
}

// ═══════════════════════════════════════════
// CONFLICTOS
// ═══════════════════════════════════════════
