/* CoPadres v14 — agreements.js */
// ═══════════════════════════════════════════
// ACUERDOS
// ═══════════════════════════════════════════
function renderAcuerdos(){
  var list=document.getElementById('acuerdos-list');
  if(!list) return;
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

// ═══════════════════════════════════════════
// CONFLICTOS
// ═══════════════════════════════════════════
