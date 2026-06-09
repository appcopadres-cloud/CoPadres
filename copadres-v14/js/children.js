/* CoPadres v14 — children.js */
// ═══════════════════════════════════════════
// HIJOS
// ═══════════════════════════════════════════
function calcEdad(f){
  if(!f) return '';
  var d=Date.now()-new Date(f).getTime();
  return Math.floor(d/(1000*60*60*24*365.25));
}

function renderHijos(){
  var list=document.getElementById('hijos-list');
  if(!list) return;
  if(!state.hijos.length){
    list.innerHTML='<div class="card" style="text-align:center;padding:30px"><div style="margin-bottom:14px"><span class="ic-wrap" style="width:64px;height:64px;background:#e0f2fe;color:#0369a1">'+icSprite('kids','ic-lg')+'</span></div><div style="font-weight:700;color:#1B4D3E">Sin hijos registrados</div><div style="font-size:13px;color:var(--sub);margin-top:4px">Agrega el perfil de tus hijos</div><button class="btn btn-green" onclick="openModal(\'modal-hijo\')" style="margin-top:16px;width:auto;padding:10px 20px;font-size:13px">+ Agregar hijo</button></div>';
    return;
  }
  var gradients=[['#52C896','#3AA8A0'],['#2563eb','#7c3aed'],['#ea580c','#f59e0b'],['#ec4899','#8b5cf6']];
  list.innerHTML=state.hijos.map(function(h,i){
    var edad=calcEdad(h.fechaNacimiento);
    var g=gradients[i%gradients.length];
    var inicial=h.nombre?h.nombre[0].toUpperCase():'';
    return '<div class="card">'
      +'<div style="display:flex;align-items:center;gap:16px;margin-bottom:14px">'
      +'<div class="avatar" style="width:56px;height:56px;background:linear-gradient(135deg,'+g[0]+','+g[1]+');border-radius:16px;position:relative">'
        +'<svg class="ic ic-md" style="color:rgba(255,255,255,.35);position:absolute;inset:0;margin:auto;width:36px;height:36px"><use href="#ic-kids"/></svg>'
        +'<span style="position:relative;font-size:22px;font-weight:900;color:#fff">'+inicial+'</span>'
      +'</div>'
      +'<div><div style="font-size:18px;font-weight:800">'+h.nombre+'</div>'
      +'<div style="font-size:13px;color:var(--sub);margin-top:3px">'+edad+' años</div></div></div>'
      +'<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">'
      +'<div class="card-sm"><div class="lbl" style="margin-bottom:2px;display:flex;align-items:center;gap:4px">'+icSprite('calendar','ic-sm')+' Fecha nac.</div><div style="font-size:13px;font-weight:600">'+h.fechaNacimiento+'</div></div>'
      +'<div class="card-sm"><div class="lbl" style="margin-bottom:2px;display:flex;align-items:center;gap:4px">'+icSprite('school','ic-sm')+' Colegio</div><div style="font-size:13px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+h.colegio+'</div></div>'
      +'</div></div>';
  }).join('');
}

function addHijo(){
  var nombre=document.getElementById('h-nombre').value.trim();
  var fecha=document.getElementById('h-fecha').value;
  var colegio=document.getElementById('h-colegio').value.trim();
  if(!nombre) return showToast('Ingresa el nombre del hijo/a','error');
  state.hijos.push({id:Date.now(),nombre:nombre,fechaNacimiento:fecha,colegio:colegio});
  guardarEstado(['hijos']);
  closeModal('modal-hijo');
  document.getElementById('h-nombre').value='';
  renderHijos();
  renderDashboard();
  showToast('Hijo/a agregado/a','success');
  // Analytics: child added
  if (typeof analyticsEvent === 'function') { try { analyticsEvent('child_added'); } catch(e) {} }
}

