/* CoPadres v14 — conflicts.js */
function renderConflictos(){
  var list=document.getElementById('conflictos-list');
  if(!list) return;
  list.innerHTML=state.conflictos.length?state.conflictos.map(function(c){
    var color=c.estado==='Resuelto'?'green':c.estado==='En resolución'?'orange':'red';
    return '<div class="card">'
      +'<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:10px">'
      +'<div style="display:flex;align-items:center;gap:10px">'
      +'<span class="ic-wrap" style="width:36px;height:36px;background:#fee2e2;color:#dc2626">'+icSprite('flag','ic-md')+'</span>'
      +'<div><div style="font-weight:700;font-size:15px">'+c.tipo+'</div>'
      +'<div style="font-size:11px;color:var(--sub)">'+c.fecha+'</div></div></div>'
      +'<span class="chip chip-'+color+'">'+c.estado+'</span></div>'
      +'<div style="font-size:13px;color:var(--sub);line-height:1.5">'+c.descripcion+'</div></div>';
  }).join(''):'<div class="card" style="text-align:center;padding:30px"><div style="margin-bottom:14px"><span class="ic-wrap" style="width:64px;height:64px;background:#dcfce7;color:#15803d">'+icSprite('check','ic-lg')+'</span></div><div style="font-weight:700;color:var(--green)">Sin conflictos activos</div><div style="font-size:13px;color:var(--sub);margin-top:4px">La comunicación fluye bien</div></div>';
}

function addConflicto(){
  var tipo=document.getElementById('c-tipo').value;
  var desc=document.getElementById('c-desc').value.trim();
  if(!desc) return showToast('Describe el conflicto','error');
  var today=new Date().toISOString().split('T')[0];
  state.conflictos.push({id:Date.now(),tipo:tipo,descripcion:desc,fecha:today,estado:'Abierto'});
  guardarEstado();
  closeModal('modal-conflicto');
  document.getElementById('c-desc').value='';
  renderConflictos();
}

// ═══════════════════════════════════════════
