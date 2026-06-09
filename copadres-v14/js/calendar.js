/* CoPadres v14 — calendar.js */
// ═══════════════════════════════════════════
// EVENTOS
// ═══════════════════════════════════════════
function renderEventos(){
  var list=document.getElementById('eventos-list');
  if(!list) return;
  // fill hijo select
  var sel=document.getElementById('ev-hijo');
  if(sel) sel.innerHTML=state.hijos.map(function(h){return '<option>'+h.nombre+'</option>'}).join('')+'<option>Ambos</option>';

  var sorted=[...state.eventos].sort(function(a,b){return a.fecha.localeCompare(b.fecha)});
  if(!sorted.length){
    list.innerHTML='<div class="card" style="text-align:center;padding:30px"><div style="margin-bottom:14px"><span class="ic-wrap" style="width:64px;height:64px;background:#eff6ff;color:#2563eb">'+icSprite('calendar','ic-lg')+'</span></div><div style="font-weight:700;color:#1B4D3E">Sin eventos registrados</div><div style="font-size:13px;color:var(--sub);margin-top:4px">Agrega eventos del calendario compartido</div><button class="btn btn-green" onclick="openModal(\'modal-evento\')" style="margin-top:16px;width:auto;padding:10px 20px;font-size:13px">+ Agregar evento</button></div>';
    return;
  }
  var chipMap={Colegio:'blue',Salud:'green',Legal:'purple',Actividad:'orange',Otro:'gray'};
  var typeIcons={Colegio:'school',Salud:'health',Legal:'gavel',Actividad:'sparkle',Otro:'calendar'};
  list.innerHTML=sorted.map(function(e){
    var d=new Date(e.fecha+'T00:00:00');
    var months=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    var icName=typeIcons[e.tipo]||'calendar';
    var statusIc=e.confirmado?icSprite('check','ic-sm'):'<svg class="ic ic-sm"><use href="#ic-alert"/></svg>';
    var statusTxt=e.confirmado?'Confirmado':'Pendiente';
    var statusColor=e.confirmado?'#15803d':'#ea580c';
    return '<div class="list-item">'
      +'<div style="width:44px;height:44px;background:#2563eb;border-radius:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;flex-shrink:0">'
      +'<span style="font-size:17px;font-weight:800;line-height:1">'+d.getDate()+'</span>'
      +'<span style="font-size:10px;opacity:.7">'+months[d.getMonth()]+'</span></div>'
      +'<div style="flex:1;min-width:0">'
      +'<div style="font-weight:600;font-size:14px">'+e.titulo+'</div>'
      +'<div style="font-size:12px;color:var(--sub);margin-top:3px;display:inline-flex;align-items:center;gap:4px">'+e.hijo+' · '+e.responsable+' · <span style="display:inline-flex;align-items:center;gap:3px;color:'+statusColor+'">'+statusIc+statusTxt+'</span></div></div>'
      +'<span class="chip chip-'+(chipMap[e.tipo]||'gray')+'" style="display:inline-flex;align-items:center;gap:4px">'+icSprite(icName,'ic-sm')+e.tipo+'</span></div>';
  }).join('');
}

function addEvento(){
  var titulo=document.getElementById('ev-titulo').value.trim();
  var fecha=document.getElementById('ev-fecha').value;
  var tipo=document.getElementById('ev-tipo').value;
  var hijo=document.getElementById('ev-hijo').value;
  var resp=document.getElementById('ev-resp').value;
  if(!titulo||!fecha) return showToast('Completa el título y la fecha','error');
  state.eventos.push({id:Date.now(),tipo:tipo,titulo:titulo,fecha:fecha,hijo:hijo,responsable:resp,confirmado:false});
  guardarEstado(['eventos']);
  closeModal('modal-evento');
  document.getElementById('ev-titulo').value='';
  renderEventos();
  renderDashboard();
  showToast('Evento guardado','success');
  // Analytics: event added
  if (typeof analyticsEvent === 'function') { try { analyticsEvent('event_added'); } catch(e) {} }
}

