/* CoPadres v14 — expenses.js */
// ═══════════════════════════════════════════
// GASTOS
// ═══════════════════════════════════════════
function fmt(n){return '$'+(n/1000).toFixed(0)+'K';}

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
  list.innerHTML=[...state.gastos].reverse().map(function(g){
    var color=g.pagador==='Mamá'?'#7c3aed':'#2563eb';
    var icName=catIcons[g.categoria]||'wallet';
    return '<div class="expense-row">'
      +'<div class="avatar" style="width:40px;height:40px;background:'+color+';font-size:14px;font-weight:800">'+g.pagador[0]+'</div>'
      +'<div style="flex:1;min-width:0;padding:0 12px">'
      +'<div style="font-weight:600;font-size:14px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+g.descripcion+'</div>'
      +'<div style="font-size:11px;color:var(--sub);margin-top:2px">'+g.fecha+' · '+g.pagador+'</div></div>'
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
  state.gastos.push({id:Date.now(),categoria:cat,descripcion:desc,monto:monto,pagador:pag,fecha:today});
  guardarEstado(['gastos']);
  closeModal('modal-gasto');
  document.getElementById('g-desc').value='';
  document.getElementById('g-monto').value='';
  renderGastos();
}

