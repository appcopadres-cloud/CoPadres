/* CoPadres v14 — chat.js */
// ═══════════════════════════════════════════
// CHAT
// ═══════════════════════════════════════════
function switchUser(u){
  state.usuario=u;
  document.getElementById('pill-mama').classList.toggle('active',u==='Mamá');
  document.getElementById('pill-papa').classList.toggle('active',u==='Papá');
  var lbl=document.getElementById('chat-user-label');
  if(lbl) lbl.textContent=u;
  var av=document.getElementById('chat-avatar');
  if(av){av.textContent=u[0];av.style.background=u==='Mamá'?'#7c3aed':'#2563eb';}
  renderSidebar();
}

function escapeHtml(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}

// ── ADVERTENCIAS ─────────────────────────────
var _advUsuarioActual = 'Mamá';

function actualizarContadoresAdv() {
  var cm = document.getElementById('cnt-adv-mama');
  var cp = document.getElementById('cnt-adv-papa');
  if (cm) cm.textContent = (ADVERTENCIAS['Mamá'] || []).length;
  if (cp) cp.textContent = (ADVERTENCIAS['Papá'] || []).length;
}

function nivelChip(nivel) {
  var map = {
    leve:     {label:'Leve',     bg:'#fffbeb', color:'#92400e', border:'#fde68a'},
    moderado: {label:'Moderado', bg:'#fff7ed', color:'#9a3412', border:'#fed7aa'},
    grave:    {label:'Grave',    bg:'#fef2f2', color:'#991b1b', border:'#fecaca'}
  };
  var d = map[nivel] || map.leve;
  return '<span style="font-size:10px;font-weight:700;padding:2px 8px;border-radius:999px;background:'+d.bg+';color:'+d.color+';border:1px solid '+d.border+'">'+d.label+'</span>';
}

function verAdvertencias(usuario) {
  _advUsuarioActual = usuario;
  var lista = document.getElementById('lista-advertencias');
  if (!lista) return;
  var advs = (ADVERTENCIAS[usuario] || []).slice().reverse();
  if (!advs.length) {
    lista.innerHTML = '<div style="text-align:center;padding:20px;color:var(--sub);font-size:13px">Sin advertencias registradas para '+usuario+'</div>';
    return;
  }
  lista.innerHTML = advs.map(function(a, i) {
    return '<div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:12px;margin-bottom:8px">'
      +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">'
      +nivelChip(a.nivel)
      +'<span style="font-size:11px;color:var(--sub)">'+a.fecha+' '+a.hora+'</span>'
      +'</div>'
      +'<div style="font-size:12px;color:#374151;font-style:italic;background:#fff;border-radius:8px;padding:8px;border:1px solid #e5e7eb;margin-bottom:6px">"'+escapeHtml(a.texto)+'"</div>'
      +'<div style="font-size:11px;color:#6b7280">Detectado: '+a.palabras.slice(0,3).map(function(p){return '"'+p+'"';}).join(', ')+'</div>'
      +'</div>';
  }).join('');
  actualizarContadoresAdv();
}

function renderChat(){
  var box=document.getElementById('chat-messages');
  if(!box) return;
  if(!state.mensajes.length){
    box.innerHTML='<div style="text-align:center;padding:30px;color:var(--sub)"><svg class="ic ic-xl" style="color:#52C896;margin-bottom:10px"><use href="#ic-chat"/></svg><div style="font-weight:700;color:#1B4D3E">Aún no hay mensajes</div><div style="font-size:12px;margin-top:4px">Envía el primero, tus palabras están protegidas</div></div>';
  } else {
    box.innerHTML=state.mensajes.map(function(m){
      var mine=m.emisor===state.usuario;
      var bg=m.emisor==='Mamá'?'#7c3aed':'#2563eb';
      return '<div class="msg-row'+(mine?' mine':'')+'">'
        +'<div class="avatar" style="width:32px;height:32px;background:'+bg+';font-size:13px;border-radius:10px">'+m.emisor[0]+'</div>'
        +'<div style="max-width:80%"><div class="bubble'+(mine?' mine':' theirs')+'">'+escapeHtml(m.texto)+'</div>'
        +'<div class="msg-time">'+m.emisor+' · '+m.fecha+'</div></div></div>';
    }).join('');
  }
  box.scrollTop=box.scrollHeight;
  // update switcher
  document.getElementById('pill-mama').classList.toggle('active',state.usuario==='Mamá');
  document.getElementById('pill-papa').classList.toggle('active',state.usuario==='Papá');
  var lbl=document.getElementById('chat-user-label');
  if(lbl) lbl.textContent=state.usuario;
  var av=document.getElementById('chat-avatar');
  if(av){av.textContent=state.usuario[0];av.style.background=state.usuario==='Mamá'?'#7c3aed':'#2563eb';}
}

function mostrarBannerBloqueo(r) {
  var banner = document.getElementById('blocked-banner');
  var words  = document.getElementById('blocked-words');
  if (!banner) return;
  var nd = r.nivelData;
  banner.style.display = 'flex';
  banner.style.background = nd.colorBg;
  banner.style.borderColor = nd.colorBorder;

  // Título con nivel
  var titulo = document.getElementById('blocked-titulo');
  if (titulo) {
    titulo.textContent = nd.icono + ' ' + nd.etiqueta + ' — mensaje bloqueado';
    titulo.style.color = nd.color;
  }

  // Palabras detectadas
  if (words) {
    words.style.color = nd.color;
    words.textContent = 'Detectado: "' + r.palabras.slice(0, 3).join('", "') + '"';
  }

  // Alternativa neutra
  var altEl = document.getElementById('blocked-alternativa');
  if (altEl) {
    altEl.textContent = '💬 Alternativa: ' + r.alternativa;
  }
}

function ocultarBanner() {
  var banner = document.getElementById('blocked-banner');
  if (banner) banner.style.display = 'none';
}

function usarAlternativa() {
  var altEl = document.getElementById('blocked-alternativa');
  var inp = document.getElementById('chat-input');
  if (!altEl || !inp) return;
  var texto = altEl.textContent.replace('💬 Alternativa: ', '').trim();
  inp.value = texto;
  ocultarBanner();
  inp.classList.remove('inp-blocked');
  var btn = document.getElementById('send-btn');
  if (btn) { btn.innerHTML = '<svg class="ic ic-sm"><use href="#ic-send"/></svg> Enviar mensaje →'; btn.disabled = false; }
  inp.focus();
}

function sendMessage(){
  var inp = document.getElementById('chat-input');
  var txt = inp.value.trim();
  if (!txt) return;
  var r = filtrar(txt);
  if (r.esOfensivo) {
    mostrarBannerBloqueo(r);
    registrarAdvertencia(state.usuario, txt, r.nivel, r.palabras, new Date().toISOString());
    inp.classList.add('inp-blocked');
    setTimeout(function(){ inp.classList.remove('inp-blocked'); }, 500);
    return;
  }
  ocultarBanner();
  var now = new Date();
  var fecha = (now.getDate())+'/'+(now.getMonth()+1)+' '+String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0');
  var msg = {id: Date.now(), emisor: state.usuario, texto: txt, fecha: fecha, ts: Date.now()};
  // Si hay sala activa, enviar por Firestore (el listener actualiza state.mensajes)
  if (typeof syncEnviarMensaje === 'function' && syncConectado()) {
    syncEnviarMensaje(msg);
  } else {
    state.mensajes.push(msg);
    guardarEstado();
    renderChat();
    renderSidebar();
    if (document.getElementById('chat-hero-last')) renderDashboard();
  }
  inp.value = '';
}

// Live filter mientras escribe
document.addEventListener('DOMContentLoaded', function(){
  cargarAdvertencias();
  actualizarContadoresAdv();
  setTimeout(function(){ verAdvertencias('Mamá'); }, 300);
  var inp = document.getElementById('chat-input');
  if (!inp) return;
  inp.addEventListener('keydown', function(e){
    if (e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); sendMessage(); }
  });
  inp.addEventListener('input', function(){
    var txt = inp.value.trim();
    var btn = document.getElementById('send-btn');
    if (!txt) {
      inp.classList.remove('inp-blocked');
      ocultarBanner();
      if (btn){ btn.textContent = 'Enviar mensaje →'; btn.disabled = false; }
      return;
    }
    var r = filtrar(txt);
    if (r.esOfensivo) {
      inp.classList.add('inp-blocked');
      mostrarBannerBloqueo(r);
      if (btn){ btn.innerHTML = '🚫 Bloqueado — usa la alternativa'; btn.disabled = true; }
    } else {
      inp.classList.remove('inp-blocked');
      ocultarBanner();
      if (btn){ btn.innerHTML = '<svg class="ic ic-sm"><use href="#ic-send"/></svg> Enviar mensaje →'; btn.disabled = false; }
    }
  });
});

