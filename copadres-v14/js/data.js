/* CoPadres v14 — data.js */
// ═══════════════════════════════════════════
// DATA
// ═══════════════════════════════════════════
var state = {
  usuario: '',
  contactoEmergencia: {nombre:'', telefono:''},
  hijos: [],
  mensajes: [],
  eventos: [],
  gastos: [],
  acuerdos: [],
  conflictos: []
};

// ═══════════════════════════════════════════
// ═══════════════════════════════════════════
// FILTRO v13 — SISTEMA MULTICAPA
// Clasificación: leve / moderado / grave
// Categorías: insultos, amenazas, manipulación, pasivo-agresivo
// Alternativas neutras por categoría
// Registro de advertencias por progenitor
// ═══════════════════════════════════════════

// ── DICCIONARIO CLASIFICADO ──────────────────
var DICCIONARIO = {

  // ════════════════════════════════
  // NIVEL 1: LEVE
  // Tensión verbal, lenguaje descortés, reproches leves
  // ════════════════════════════════
  leve: {
    etiqueta: 'Lenguaje inapropiado',
    color: '#f59e0b',
    colorBg: '#fffbeb',
    colorBorder: '#fde68a',
    icono: '⚠️',

    insultos: [
      "tonto","tonta","bruto","bruta","payaso","payasa","ridiculo","ridicula",
      "mediocre","incapaz","inutile","ignorante","patetico","patetica",
      "infantil","irresponsable","egoista","caprichoso","caprichosa",
      "flojo","floja","descuidado","descuidada","malo","mala",
      "desastre","terrible","horrible","pesimo","pesima"
    ],

    pasivo_agresivo: [
      "como siempre","tipico de ti","tipico tuyo","ya me lo imaginaba",
      "que sorpresa","como no","lo que faltaba","perfecto como siempre",
      "claro que si","obvio","obvio que no","para variar",
      "nunca cambias","igual que siempre","que novedad",
      "si tu lo dices","lo que tu digas","como quieras",
      "olvida que te dije","da igual","me da lo mismo",
      "haz lo que quieras","ya se que no te importa",
      "no me sorprende","qué esperaba","pensé que esta vez",
      "supongo que si","si claro","aha","ajam",
      "te aviso por si acaso","por si no lo sabias",
      "no creo que lo recuerdes","ya que no sueles",
      "si es que puedes","cuando puedas claro","si te da la gana",
      "a ver si esta vez","ojalá cumplas"
    ],

    manipulacion_leve: [
      "después no digas","no me vengas","no me hagas reir",
      "ya sé lo que harás","sé cómo eres","ya te conozco",
      "siempre lo mismo","nunca escuchas","no me escuchas",
      "no me entiendes","no puedes entenderme","no me comprendes",
      "lo haces a propósito","lo haces adrede","me haces la vida difícil",
      "todo lo complicas","siempre tienes excusas",
      "nunca tienes tiempo","siempre estás ocupado","siempre estás ocupada"
    ]
  },

  // ════════════════════════════════
  // NIVEL 2: MODERADO
  // Insultos directos, manipulación emocional, descalificaciones como padre/madre
  // ════════════════════════════════
  moderado: {
    etiqueta: 'Conflicto alto',
    color: '#ea580c',
    colorBg: '#fff7ed',
    colorBorder: '#fed7aa',
    icono: '🚨',

    insultos: [
      "idiota","estupido","estupida","imbecil","inutil","animal","bestia",
      "tarado","tarada","retrasado","retrasada","burro","burra",
      "fracasado","fracasada","perdedor","perdedora","loser",
      "inservible","malcriado","malcriada","monstruo","sinverguenza",
      "egocentrico","egocentrica","mentiroso","mentirosa","embustero","embustera",
      "hipocrita","farandulero","farandulera","calculador","calculadora",
      "manipulador","manipuladora","controlador","controladora",
      "toxico","toxica","narcisista","egomaníaco","egomaniaca"
    ],

    descalificacion_parental: [
      "mala madre","mal padre","eres mala madre","eres mal padre",
      "no sirves como madre","no sirves como padre",
      "no eres buena madre","no eres buen padre",
      "eres un fracaso como padre","eres un fracaso como madre",
      "pésima madre","pésimo padre","nefasta madre","nefasto padre",
      "no te mereces a tus hijos","no mereces a tus hijos",
      "tus hijos te odian","tus hijos no te quieren",
      "no eres nada para tus hijos","los niños no te necesitan",
      "eres el peor padre","eres la peor madre",
      "ellos saben cómo eres","los niños me cuentan todo",
      "les voy a decir lo que hiciste","ya saben la verdad de ti",
      "les dije a los niños","les conté a los niños"
    ],

    manipulacion_emocional: [
      "si me quisieras","si te importaran los niños","si de verdad te importara",
      "una buena madre no haría eso","un buen padre no haría eso",
      "por los niños deberías","si fueras mejor persona",
      "deja de ser egoísta","piensa en los niños",
      "estás dañando a los niños","los estás traumando",
      "los niños sufren por tu culpa","eres la causa de todo",
      "todo es culpa tuya","tú tienes la culpa","por tu culpa",
      "arruinas todo","lo arruinas todo siempre",
      "me hiciste daño","me destruiste","me arruinaste la vida",
      "lo que me hiciste no tiene nombre","nunca te lo voy a perdonar",
      "te voy a cobrar todo","me debes todo","me debes una",
      "después me lo agradecerás","te voy a demostrar","ya verás",
      "te vas a dar cuenta","vas a entender cuando sea tarde",
      "un día te vas a arrepentir","te vas a arrepentir de esto",
      "lo que siembras cosechas","al final siempre se sabe la verdad",
      "dios te va a cobrar","lo que haces te lo van a devolver"
    ],

    pasivo_agresivo_moderado: [
      "espero que te salga bien","que te vaya bien con eso",
      "espero que estés contento","espero que estés contenta",
      "sigue así y verás","continúa así y verás",
      "cuando el río suena","todo tiene un límite",
      "la paciencia tiene un límite","hasta aquí llego",
      "hasta cuando voy a aguantar","no voy a aguantar más esto",
      "ya estoy harto","ya estoy harta","ya no doy más",
      "me tienes agotado","me tienes agotada","me agotas",
      "no sé para qué te digo","para qué te aviso si no sirve",
      "es inútil hablar contigo","es imposible hablar contigo",
      "nunca vas a entender","no tienes solución"
    ],

    groseria_moderada: [
      "mierda","culo","puta","puto","joder","chingar",
      "weon","weona","hueon","hueona","cagado","cagada",
      "cresta","la cresta","andate a la cresta",
      "hdp","ctm","ptm","hpta",
      "rajado","rajada","gil","gila"
    ]
  },

  // ════════════════════════════════
  // NIVEL 3: GRAVE
  // Amenazas directas, violencia verbal, groserías extremas
  // ════════════════════════════════
  grave: {
    etiqueta: 'Amenaza o violencia',
    color: '#dc2626',
    colorBg: '#fef2f2',
    colorBorder: '#fecaca',
    icono: '🔴',

    amenazas_directas: [
      "te voy a matar","te mato","te voy a golpear","te voy a pegar","te pego",
      "te destrozo","te destruyo","te arruino","te voy a hacer daño",
      "te voy a partir la cara","te voy a romper","te voy a hundir",
      "te voy a hacer pagar","lo vas a pagar","te vas a arrepentir",
      "te voy a hacer la vida imposible","te voy a hacer sufrir",
      "ojala te mueras","ojala mueras","ojala no existieras",
      "ojala te pase algo","que te pase algo","que te vaya mal",
      "quiero que sufras","espero que sufras","mereces sufrir",
      "mereces lo peor","que te pase lo peor"
    ],

    amenazas_legales_custodia: [
      "te voy a quitar a los niños","te voy a quitar a los hijos",
      "nunca vas a ver a los niños","nunca más vas a ver a tus hijos",
      "voy a hacer que te quiten la custodia","te voy a quitar la custodia",
      "te voy a dejar sin nada","te quedas en la calle",
      "te voy a meter preso","te voy a meter presa",
      "vas a ir a la cárcel","te meto en prisión",
      "voy a llamar a los carabineros","voy a denunciarte",
      "voy a ir al tribunal","voy a hacer una denuncia",
      "voy a pedir orden de alejamiento","te van a sacar de la casa",
      "les voy a decir a los niños que eres un peligro",
      "voy a prohibirte ver a los niños"
    ],

    violencia_verbal_extrema: [
      "hijodeputa","hijo de puta","hijueputa","hijo de la gran puta",
      "malparido","malparida","bastardo","bastarda","desgraciado","desgraciada",
      "conchetumadre","conche tu madre","conchadesumadre","concha de su madre",
      "culiado","culiada","culiao","culiau",
      "saco de weas","saco de hueas","sacowea",
      "zorra","perra","golfa","ramera","furcia",
      "vete a la mierda","al carajo","que te pudras",
      "andate a la mierda","anda a la chucha","la chucha",
      "te odio profundamente","te detesto con toda mi alma",
      "eres lo peor del mundo","eres una basura","eres escoria",
      "no mereces vivir","no deberías existir"
    ],

    manipulacion_grave: [
      "si no haces lo que digo","si no me obedeces","si no cumples",
      "o haces lo que digo o","o te portas bien o","te conviene hacerme caso",
      "ya verás lo que te pasa","ya verás lo que voy a hacer",
      "voy a contarle a todo el mundo","voy a publicar","voy a mostrar",
      "tengo pruebas de todo","voy a usar lo que dijiste",
      "voy a hacer que todos sepan","te voy a exponer",
      "voy a decirle a tu familia","voy a llamar a tus padres",
      "voy a hablar con tu jefe","te voy a perjudicar",
      "si me provocas","si me haces enojar","cuando me haces así"
    ]
  }
};

// ── ALTERNATIVAS NEUTRAS POR CATEGORÍA ───────
var ALTERNATIVAS = {
  insultos: [
    "¿Podemos hablar de esto con calma? Quiero que lleguemos a un acuerdo.",
    "Prefiero que resolvamos esto enfocándonos en los niños.",
    "Me gustaría que pudiéramos comunicarnos sin descalificaciones.",
    "Entiendo que estás frustrado/a. ¿Podemos buscar una solución juntos?"
  ],
  pasivo_agresivo: [
    "Me gustaría ser directo/a: ¿cuándo puedes confirmar el horario?",
    "Necesito una respuesta clara para poder organizar los días con los niños.",
    "Por favor dime qué piensas directamente para poder coordinar bien.",
    "Prefiero que hablemos con claridad. ¿Cuál es tu propuesta?"
  ],
  manipulacion_emocional: [
    "Entiendo que la situación es difícil para los dos. ¿Qué propones?",
    "Me importa el bienestar de los niños. Busquemos una solución.",
    "Prefiero que hablemos de soluciones concretas, no de culpas.",
    "¿Podemos enfocarnos en lo que necesitan los niños ahora?"
  ],
  descalificacion_parental: [
    "Tengo una preocupación sobre [el tema]. ¿Podemos conversarlo?",
    "Me gustaría coordinar mejor esto para el bienestar de los niños.",
    "¿Podemos acordar algo diferente respecto a [el tema]?",
    "Creo que podemos hacer esto de una manera que funcione mejor para todos."
  ],
  amenazas_directas: [
    "Estoy muy molesto/a ahora mismo. Prefiero escribir cuando esté más calmado/a.",
    "Necesito tiempo antes de responder. Te escribo después.",
    "Este tema requiere una conversación más tranquila.",
    "Prefiero tratar este tema con un mediador presente."
  ],
  amenazas_legales_custodia: [
    "Si tenemos diferencias sobre la custodia, sugiero que lo resolvamos con un mediador.",
    "Para temas legales, propongo que consultemos a nuestros abogados.",
    "Podemos resolver esto dentro del marco del acuerdo que ya tenemos.",
    "Propongo una reunión con mediación para hablar de este tema."
  ],
  general: [
    "¿Podemos retomar esta conversación cuando ambos estemos más calmados?",
    "Me gustaría hablar de esto de manera respetuosa por el bien de los niños.",
    "Propongo que busquemos un acuerdo juntos en lugar de discutir.",
    "¿Qué necesitas para que podamos llegar a un acuerdo?"
  ]
};

// ── REGISTRO DE ADVERTENCIAS POR PROGENITOR ──
var ADVERTENCIAS = {
  'Mamá': [],
  'Papá': []
};

function registrarAdvertencia(usuario, texto, nivel, palabras, timestamp) {
  if (!ADVERTENCIAS[usuario]) ADVERTENCIAS[usuario] = [];
  ADVERTENCIAS[usuario].push({
    id: Date.now(),
    texto: texto,
    nivel: nivel,
    palabras: palabras,
    timestamp: timestamp,
    fecha: new Date().toLocaleDateString('es-CL'),
    hora: new Date().toLocaleTimeString('es-CL', {hour:'2-digit',minute:'2-digit'})
  });
  guardarAdvertencias();
  actualizarContadoresAdv();
  verAdvertencias(usuario);
}

function guardarAdvertencias() {
  try { localStorage.setItem('cop_advertencias', JSON.stringify(ADVERTENCIAS)); } catch(e) {}
}

function cargarAdvertencias() {
  try {
    var d = localStorage.getItem('cop_advertencias');
    if (d) ADVERTENCIAS = JSON.parse(d);
  } catch(e) {}
}

function getAlternativa(categorias) {
  var cat = categorias[0] || 'general';
  var lista = ALTERNATIVAS[cat] || ALTERNATIVAS.general;
  return lista[Math.floor(Math.random() * lista.length)];
}

// ── NORMALIZACIÓN ────────────────────────────
function normalizar(t){
  return t.toLowerCase()
    .replace(/[áàä]/g,'a').replace(/[éèë]/g,'e').replace(/[íìï]/g,'i')
    .replace(/[óòö]/g,'o').replace(/[úùü]/g,'u').replace(/ñ/g,'n')
    .replace(/[^a-z0-9\s]/g,'').replace(/\s+/g,' ').trim();
}

// ── MOTOR PRINCIPAL ──────────────────────────
function filtrar(txt) {
  var n = normalizar(txt);
  var ns = n.replace(/\s/g,'');
  var resultado = {
    esOfensivo: false,
    nivel: null,      // 'leve' | 'moderado' | 'grave'
    palabras: [],
    categorias: [],
    alternativa: '',
    nivelData: null
  };

  var niveles = ['grave','moderado','leve'];  // orden de prioridad
  for (var ni = 0; ni < niveles.length; ni++) {
    var nivel = niveles[ni];
    var bloque = DICCIONARIO[nivel];
    var categoriasBloque = Object.keys(bloque).filter(function(k){
      return Array.isArray(bloque[k]);
    });
    for (var ci = 0; ci < categoriasBloque.length; ci++) {
      var cat = categoriasBloque[ci];
      var terminos = bloque[cat];
      for (var ti = 0; ti < terminos.length; ti++) {
        var pn = normalizar(terminos[ti]);
        if (n.includes(pn) || ns.includes(pn.replace(/\s/g,''))) {
          if (resultado.palabras.indexOf(terminos[ti]) === -1)
            resultado.palabras.push(terminos[ti]);
          if (resultado.categorias.indexOf(cat) === -1)
            resultado.categorias.push(cat);
          if (!resultado.nivel || niveles.indexOf(nivel) < niveles.indexOf(resultado.nivel))
            resultado.nivel = nivel;
        }
      }
    }
  }

  if (resultado.palabras.length > 0) {
    resultado.esOfensivo = true;
    resultado.nivelData = DICCIONARIO[resultado.nivel];
    resultado.alternativa = getAlternativa(resultado.categorias);
  }
  return resultado;
}

// ── PERSISTENCIA DE ESTADO ───────────────────
var STATE_KEY = 'cop_state_v14';

function guardarEstado() {
  try {
    var datos = {
      usuario: state.usuario,
      contactoEmergencia: state.contactoEmergencia,
      hijos: state.hijos,
      mensajes: state.mensajes,
      eventos: state.eventos,
      gastos: state.gastos,
      acuerdos: state.acuerdos,
      conflictos: state.conflictos
    };
    localStorage.setItem(STATE_KEY, JSON.stringify(datos));
  } catch(e) {}
}

function cargarEstado() {
  try {
    var raw = localStorage.getItem(STATE_KEY);
    if (!raw) return;
    var datos = JSON.parse(raw);
    if (datos.usuario) state.usuario = datos.usuario;
    if (datos.contactoEmergencia) state.contactoEmergencia = datos.contactoEmergencia;
    if (Array.isArray(datos.hijos) && datos.hijos.length) state.hijos = datos.hijos;
    if (Array.isArray(datos.mensajes) && datos.mensajes.length) state.mensajes = datos.mensajes;
    if (Array.isArray(datos.eventos) && datos.eventos.length) state.eventos = datos.eventos;
    if (Array.isArray(datos.gastos) && datos.gastos.length) state.gastos = datos.gastos;
    if (Array.isArray(datos.acuerdos) && datos.acuerdos.length) state.acuerdos = datos.acuerdos;
    if (Array.isArray(datos.conflictos) && datos.conflictos.length) state.conflictos = datos.conflictos;
  } catch(e) {}
}

