/* CoPadres v14 — dashboard.js */
// ═══════════════════════════════════════════
// RENDER SIDEBAR
// ═══════════════════════════════════════════
function renderSidebar(){
  var nav=document.getElementById('sidebar-nav');
  nav.innerHTML=NAV_ITEMS.map(function(item){
    return '<button class="nav-btn'+(item.id===currentPanel?' active':'')+'" data-id="'+item.id+'" onclick="goTo(\''+item.id+'\')">'
      +'<span style="display:inline-flex;align-items:center">'+NAV_ICONS[item.icon]+'</span>'+item.label
      +(item.id==='mensajes'&&state.mensajes.length?'<span class="nav-badge">'+state.mensajes.length+'</span>':'')
      +'</button>';
  }).join('');
  var ui=document.getElementById('user-info-sidebar');
  var color=state.usuario==='Mamá'?'#7c3aed':'#2563eb';
  ui.innerHTML='<div class="avatar" style="width:32px;height:32px;background:'+color+';font-size:13px">'+state.usuario[0]+'</div>'
    +'<div><div style="font-size:13px;font-weight:700">'+state.usuario+'</div><div style="font-size:11px;color:var(--sub)">Sesión activa</div></div>';
}

// ═══════════════════════════════════════════
// RENDER DASHBOARD
// ═══════════════════════════════════════════
// icSprite() defined globally in icons.js

function renderDashboard(){
  var greet=document.getElementById('hero-greeting');
  if(greet) greet.textContent='Hola, '+state.usuario;

  // Chat hero: show last message
  var lastMsg=state.mensajes[state.mensajes.length-1];
  var heroLast=document.getElementById('chat-hero-last');
  if(heroLast && lastMsg){
    heroLast.textContent=lastMsg.emisor+': '+lastMsg.texto;
  }
  var heroBadge=document.getElementById('chat-hero-badge');
  if(heroBadge && lastMsg && lastMsg.emisor!==state.usuario){
    heroBadge.style.display='inline-block';
    heroBadge.textContent='Nuevo mensaje';
  } else if(heroBadge){
    heroBadge.style.display='none';
  }

  var total=state.gastos.reduce(function(s,g){return s+g.monto},0);
  var activos=state.conflictos.filter(function(c){return c.estado!=='Resuelto'}).length;
  var grid=document.getElementById('stats-grid');
  if(grid) grid.innerHTML=[
    {l:'Hijos',v:state.hijos.length,i:'kids',c:'#2563eb',s:'hijos'},
    {l:'Eventos',v:state.eventos.length,i:'calendar',c:'#059669',s:'calendario'},
    {l:'Gastos',v:'$'+(total/1000).toFixed(0)+'K',i:'wallet',c:'#7c3aed',s:'gastos'},
    {l:'Conflictos',v:activos,i:'flag',c:'#ea580c',s:'conflictos'}
  ].map(function(s){
    return '<div class="stat-card" onclick="goTo(\''+s.s+'\')">'
      +'<div style="width:40px;height:40px;background:'+s.c+'15;color:'+s.c+';border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:10px">'+icSprite(s.i,'ic-md')+'</div>'
      +'<div style="font-size:26px;font-weight:800;color:'+s.c+'">'+s.v+'</div>'
      +'<div style="font-size:12px;color:var(--sub);font-weight:500;margin-top:3px">'+s.l+'</div></div>';
  }).join('');

  var today=new Date().toISOString().split('T')[0];
  var proximos=state.eventos.filter(function(e){return e.fecha>=today}).sort(function(a,b){return a.fecha.localeCompare(b.fecha)}).slice(0,3);
  var ue=document.getElementById('upcoming-events');
  if(ue) ue.innerHTML=proximos.length?proximos.map(function(e){
    var d=new Date(e.fecha+'T00:00:00');
    var months=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    var chipColor=e.tipo==='Salud'?'green':e.tipo==='Legal'?'purple':'blue';
    return '<div class="list-item"><div style="width:44px;height:44px;background:#2563eb;border-radius:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;flex-shrink:0">'
      +'<span style="font-size:17px;font-weight:800;line-height:1">'+d.getDate()+'</span>'
      +'<span style="font-size:10px;opacity:.7">'+months[d.getMonth()]+'</span></div>'
      +'<div style="flex:1;min-width:0"><div style="font-weight:600;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+e.titulo+'</div>'
      +'<div style="font-size:11px;color:var(--sub);margin-top:2px">'+e.hijo+' · '+e.responsable+'</div></div>'
      +'<span class="chip chip-'+chipColor+'">'+e.tipo+'</span></div>';
  }).join(''):'<p style="color:var(--sub);font-size:13px;text-align:center;padding:16px 0">No hay eventos próximos</p>';

  var ap=document.getElementById('acuerdos-preview');
  if(ap) ap.innerHTML=state.acuerdos.filter(function(a){return a.estado==='Vigente'}).map(function(a){
    return '<div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:#f0fdf4;border-radius:12px;border:1px solid #bbf7d0;margin-bottom:8px">'
      +'<span class="ic-wrap" style="width:28px;height:28px;background:#15803d;color:#fff">'+icSprite('check','ic-sm')+'</span>'
      +'<div style="flex:1;min-width:0"><div style="font-weight:600;font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">'+a.titulo+'</div>'
      +'<div style="font-size:11px;color:var(--sub);margin-top:2px">'+a.tipo+' · '+a.fecha+'</div></div></div>';
  }).join('');
}

