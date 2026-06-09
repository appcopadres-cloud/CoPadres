/* CoPadres v14 — nav.js */
// ═══════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════
var currentPanel='dashboard';
var NAV_ICONS={
  dashboard:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
  mensajes:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>',
  calendario:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  hijos:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>',
  gastos:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>',
  acuerdos:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',
  conflictos:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
  seguridad:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:18px;height:18px"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>'
};
var NAV_ITEMS=[
  {id:'dashboard',label:'Inicio',icon:'dashboard'},
  {id:'mensajes',label:'Chat',icon:'mensajes'},
  {id:'calendario',label:'Eventos',icon:'calendario'},
  {id:'hijos',label:'Hijos',icon:'hijos'},
  {id:'gastos',label:'Gastos',icon:'gastos'},
  {id:'acuerdos',label:'Acuerdos',icon:'acuerdos'},
  {id:'conflictos',label:'Conflictos',icon:'conflictos'},
  {id:'seguridad',label:'Seguridad',icon:'seguridad'}
];

function goTo(id){
  document.querySelectorAll('.panel').forEach(function(p){p.classList.remove('active')});
  var panel=document.getElementById('panel-'+id);
  if(panel){panel.classList.add('active');panel.classList.add('fade-in')}
  // Update sidebar
  document.querySelectorAll('.nav-btn').forEach(function(b){
    b.classList.toggle('active',b.dataset.id===id);
  });
  // Update bottom nav
  var moreIds = ['hijos','acuerdos','conflictos'];
  var isMore = moreIds.indexOf(id) !== -1;
  ['dashboard','mensajes','calendario','gastos','seguridad'].forEach(function(key){
    var btn=document.getElementById('bn-'+key);
    if(btn){
      btn.classList.toggle('active',key===id);
      var dot=btn.querySelector('.bnav-dot');
      if(dot) dot.style.display=key===id?'block':'none';
    }
  });
  var moreBtn = document.getElementById('bn-more');
  if(moreBtn) moreBtn.classList.toggle('active', isMore);
  currentPanel=id;
  // Render panels
  if(id==='dashboard') renderDashboard();
  if(id==='mensajes') renderChat();
  if(id==='calendario') renderEventos();
  if(id==='hijos') renderHijos();
  if(id==='gastos') renderGastos();
  if(id==='acuerdos') renderAcuerdos();
  if(id==='conflictos') renderConflictos();
  if(id==='seguridad') renderSeguridad();
  window.scrollTo(0,0);
  // Analytics: track panel view
  if (typeof analyticsPage === 'function') { try { analyticsPage(id); } catch(e) {} }
}

