/* CoPadres v14 — modals.js */
// ═══════════════════════════════════════════
// MODALS
// ═══════════════════════════════════════════
function openModal(id){
  var m=document.getElementById(id);
  if(m) m.classList.add('open');
  if(id==='modal-evento'){
    var sel=document.getElementById('ev-hijo');
    if(sel) sel.innerHTML=state.hijos.map(function(h){return '<option>'+h.nombre+'</option>'}).join('')+'<option>Ambos</option>';
    var f=document.getElementById('ev-fecha');
    if(f) f.value=new Date().toISOString().split('T')[0];
  }
}
function closeModal(id){
  var m=document.getElementById(id);
  if(m) m.classList.remove('open');
}
// Close modal on overlay click
document.querySelectorAll('.modal-overlay').forEach(function(overlay){
  overlay.addEventListener('click',function(e){
    if(e.target===overlay) overlay.classList.remove('open');
  });
});

