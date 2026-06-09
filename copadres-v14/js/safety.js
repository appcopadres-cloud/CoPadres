/* CoPadres v14 — safety.js */
// ═══════════════════════════════════════════
// SEGURIDAD — CONTACTO DE EMERGENCIA
// ═══════════════════════════════════════════
function renderEC(){
  var ec=state.contactoEmergencia;
  var nameEl=document.getElementById('ec-name');
  var phoneEl=document.getElementById('ec-phone');
  if(nameEl) nameEl.textContent=ec.nombre||'No configurado';
  if(phoneEl) phoneEl.textContent=ec.telefono||'Configura un contacto de confianza';
  var infoEl=document.getElementById('panic-contact-info');
  if(infoEl) infoEl.textContent=ec.nombre?'Se contactará a '+ec.nombre+' ('+ec.telefono+')':'Configura primero un contacto de emergencia';
}

function saveEC(){
  var nombre=document.getElementById('ec-nombre-inp').value.trim();
  var tel=document.getElementById('ec-tel-inp').value.trim();
  if(!nombre||!tel) return showToast('Completa nombre y teléfono','error');
  if(!/^\+?[\d\s\-]{7,15}$/.test(tel)) return showToast('Teléfono inválido. Ej: +56912345678','error');
  state.contactoEmergencia={nombre:nombre,telefono:tel};
  guardarEstado();
  closeModal('modal-ec');
  renderEC();
  showToast('Contacto guardado: '+nombre,'success');
}

function openPanicOverlay(){
  renderEC();
  document.getElementById('panic-overlay').classList.add('open');
}
function closePanicOverlay(){
  document.getElementById('panic-overlay').classList.remove('open');
}

// Abre enlace externo sin window.open/_blank para evitar "Buscar en sitio web" en iOS PWA
function openExternal(url){
  var a=document.createElement('a');
  a.href=url;
  a.rel='noopener noreferrer';
  a.style.display='none';
  document.body.appendChild(a);
  a.click();
  setTimeout(function(){if(a.parentNode)a.parentNode.removeChild(a);},1000);
}

function triggerPanic(){
  closePanicOverlay();
  var ec=state.contactoEmergencia;
  if(!ec.nombre||!ec.telefono){
    if(currentPanel!=='seguridad') goTo('seguridad');
    setTimeout(function(){openModal('modal-ec');},300);
    showToast('Configura primero tu contacto de emergencia','warning');
    return;
  }
  var tel=ec.telefono.replace(/\s/g,'');
  var msg=encodeURIComponent('🆘 AYUDA — '+state.usuario+' necesita asistencia. Por favor contacta urgente.');
  var loc=lastLocation?encodeURIComponent('\n📍 Ubicación: https://maps.google.com/?q='+lastLocation.lat+','+lastLocation.lng):'';
  var waNum=tel.replace(/^\+/,'');
  // WhatsApp — anchor click evita bug "Buscar en sitio web" en iOS PWA standalone
  openExternal('https://wa.me/'+waNum+'?text='+msg+loc);
  // Llamada — location.href es nativo y no sale del contexto PWA
  setTimeout(function(){window.location.href='tel:'+tel;},800);
  // SMS — mismo patrón anchor click
  setTimeout(function(){
    var smsBody=decodeURIComponent(msg+loc);
    openExternal('sms:'+tel+'?body='+encodeURIComponent(smsBody));
  },1600);
}

// ═══════════════════════════════════════════
// SEGURIDAD — GPS
// ═══════════════════════════════════════════
var leafletMap=null;
var leafletMarker=null;
var lastLocation=null;

function renderSeguridad(){
  renderEC();
  // Pre-fill inputs if already configured
  var ec=state.contactoEmergencia;
  var ni=document.getElementById('ec-nombre-inp');
  var ti=document.getElementById('ec-tel-inp');
  if(ni&&ec.nombre) ni.value=ec.nombre;
  if(ti&&ec.telefono) ti.value=ec.telefono;
  // Init map if not yet
  setTimeout(function(){
    var mapEl=document.getElementById('gps-map');
    if(!mapEl) return;
    if(!leafletMap){
      leafletMap=L.map('gps-map',{zoomControl:true,attributionControl:false}).setView([-33.4569,-70.6483],12);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19}).addTo(leafletMap);
    } else {
      leafletMap.invalidateSize();
    }
  },200);
}

function getLocation(){
  var btn=document.getElementById('gps-locate-btn');
  var status=document.getElementById('gps-status');
  if(!navigator.geolocation){
    if(status) status.textContent='GPS no disponible en este dispositivo';
    return;
  }
  if(btn) btn.textContent='🔄 Obteniendo ubicación...';
  if(status) status.textContent='Buscando señal GPS...';
  navigator.geolocation.getCurrentPosition(function(pos){
    lastLocation={lat:pos.coords.latitude,lng:pos.coords.longitude,acc:Math.round(pos.coords.accuracy)};
    if(status) status.textContent='📍 '+lastLocation.lat.toFixed(5)+', '+lastLocation.lng.toFixed(5)+' (±'+lastLocation.acc+'m)';
    if(btn) btn.textContent='🔄 Actualizar ubicación';
    // Show share buttons
    var sb=document.getElementById('gps-share-btn');
    var ss=document.getElementById('gps-sms-btn');
    if(sb) sb.style.display='flex';
    if(ss) ss.style.display='flex';
    // Update map
    if(leafletMap){
      leafletMap.setView([lastLocation.lat,lastLocation.lng],15);
      if(leafletMarker) leafletMarker.remove();
      leafletMarker=L.circleMarker([lastLocation.lat,lastLocation.lng],{
        radius:14,color:'#2563eb',fillColor:'#3b82f6',fillOpacity:.7,weight:3
      }).addTo(leafletMap).bindPopup('📍 Tu ubicación actual').openPopup();
      // Accuracy circle
      L.circle([lastLocation.lat,lastLocation.lng],{radius:lastLocation.acc,color:'#2563eb',fillColor:'#93c5fd',fillOpacity:.2,weight:1}).addTo(leafletMap);
    }
  },function(err){
    if(status) status.textContent='No se pudo obtener la ubicación. Verifica los permisos.';
    if(btn) btn.textContent='📍 Obtener mi ubicación';
    console.warn('GPS error:',err.message);
  },{enableHighAccuracy:true,timeout:15000,maximumAge:0});
}

function shareLocation(){
  if(!lastLocation) return showToast('Primero obtén tu ubicación','warning');
  var url='https://maps.google.com/?q='+lastLocation.lat+','+lastLocation.lng;
  var msg=encodeURIComponent('📍 Mi ubicación actual: '+url+'\n— Enviado desde Copadres');
  var ec=state.contactoEmergencia;
  if(ec.telefono){
    var waNum=ec.telefono.replace(/^\+/,'').replace(/\s/g,'');
    openExternal('https://wa.me/'+waNum+'?text='+msg);
  } else {
    openExternal('https://wa.me/?text='+msg);
  }
}

function shareLocationSMS(){
  if(!lastLocation) return showToast('Primero obtén tu ubicación','warning');
  var url='https://maps.google.com/?q='+lastLocation.lat+','+lastLocation.lng;
  var msg=encodeURIComponent('📍 Mi ubicación: '+url+' — Copadres');
  var ec=state.contactoEmergencia;
  var tel=ec.telefono||'';
  openExternal('sms:'+tel+'?body='+msg);
}

// Leaflet is loaded in index.html — no dynamic injection needed

