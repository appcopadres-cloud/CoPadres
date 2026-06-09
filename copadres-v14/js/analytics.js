/* CoPadres v14 — analytics.js
 * Privacy-first analytics. NO PII: no names, no phone numbers, no child data.
 * Only anonymous device IDs (first 8 chars), event names, and dates.
 *
 * Firestore rules: the analytics collection needs write access.
 * Since the project uses `allow read, write: if true` it works without auth.
 * Review rules before production to add rate-limiting if needed.
 */

var ANALYTICS = {
  deviceId: null,      // anonymous UUID stored in localStorage
  installDate: null,
  sessionStart: Date.now(),
  _db: null            // Firestore reference (lazy init)
};

// ── HELPERS ──────────────────────────────────────────────────────────────────

function _analyticsToday() {
  var d = new Date();
  var mm = String(d.getMonth() + 1).padStart(2, '0');
  var dd = String(d.getDate()).padStart(2, '0');
  return d.getFullYear() + '-' + mm + '-' + dd;
}

function _analyticsDaysSinceInstall() {
  if (!ANALYTICS.installDate) return 0;
  var ms = Date.now() - new Date(ANALYTICS.installDate).getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function _analyticsGetDb() {
  if (ANALYTICS._db) return ANALYTICS._db;
  try {
    // Try to reuse SYNC.db if available
    if (typeof SYNC !== 'undefined' && SYNC.db) {
      ANALYTICS._db = SYNC.db;
      return ANALYTICS._db;
    }
    // Otherwise initialize our own Firestore connection
    if (typeof FIREBASE_ENABLED !== 'undefined' && FIREBASE_ENABLED &&
        typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length) {
      ANALYTICS._db = firebase.firestore();
      return ANALYTICS._db;
    }
    // Try to initialize if config is available
    if (typeof FIREBASE_ENABLED !== 'undefined' && FIREBASE_ENABLED &&
        typeof FIREBASE_CONFIG !== 'undefined' && typeof firebase !== 'undefined') {
      try {
        var app = firebase.app('analytics');
        ANALYTICS._db = app.firestore();
      } catch(e2) {
        var app2 = firebase.initializeApp(FIREBASE_CONFIG, 'analytics');
        ANALYTICS._db = app2.firestore();
      }
      return ANALYTICS._db;
    }
  } catch(e) { /* silent */ }
  return null;
}

// ── CORE INIT ─────────────────────────────────────────────────────────────────

function analyticsInit() {
  try {
    // Generate or retrieve anonymous device ID
    var did = localStorage.getItem('cop_did');
    if (!did) {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        did = crypto.randomUUID();
      } else {
        // Fallback UUID v4
        did = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          var r = Math.random() * 16 | 0;
          var v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      }
      localStorage.setItem('cop_did', did);
    }
    ANALYTICS.deviceId = did;

    // Store install date if first time
    var installDate = localStorage.getItem('cop_install_date');
    var isNew = false;
    if (!installDate) {
      installDate = new Date().toISOString().split('T')[0];
      localStorage.setItem('cop_install_date', installDate);
      isNew = true;
    }
    ANALYTICS.installDate = installDate;

    var days = _analyticsDaysSinceInstall();

    // Fire session_start event
    analyticsEvent('session_start', { days_since_install: days, is_new: isNew });

    // Update retention/DAU data
    analyticsSession();

  } catch(e) { /* never throw */ }
}

// ── EVENT WRITER ──────────────────────────────────────────────────────────────

function analyticsEvent(eventName, extraData) {
  try {
    var db = _analyticsGetDb();
    if (!db) return;

    var today = _analyticsToday();
    var days = _analyticsDaysSinceInstall();
    var didShort = (ANALYTICS.deviceId || 'unknown').substring(0, 8);

    // Write raw event
    var doc = {
      e: eventName,
      ts: firebase.firestore.FieldValue.serverTimestamp(),
      did: didShort,
      d: today,
      days: days
    };
    // Merge any extra data (already sanitized by callers — no PII)
    if (extraData && typeof extraData === 'object') {
      var keys = Object.keys(extraData);
      for (var i = 0; i < keys.length; i++) {
        doc[keys[i]] = extraData[keys[i]];
      }
    }

    db.collection('analytics').doc('events').collection('log').add(doc).catch(function(){});

    // Increment daily aggregate counter
    var counterField = _eventToCounter(eventName);
    if (counterField) {
      var dailyRef = db.collection('analytics').doc('daily').collection('days').doc(today);
      var inc = {};
      inc[counterField] = firebase.firestore.FieldValue.increment(1);
      dailyRef.set(inc, { merge: true }).catch(function(){});
    }

  } catch(e) { /* never throw, never block UI */ }
}

function _eventToCounter(eventName) {
  var map = {
    'session_start':         'sessions',
    'message_sent':          'messages',
    'event_added':           'events_added',
    'expense_added':         'expenses_added',
    'sos_triggered':         'sos',
    'family_created':        'families_created',
    'family_joined':         'families_joined',
    'child_added':           'children_added',
    'agreement_added':       'agreements_added',
    'conflict_added':        'conflicts_added',
    'registration_complete': 'registrations'
  };
  return map[eventName] || null;
}

// ── PAGE VIEW ─────────────────────────────────────────────────────────────────

function analyticsPage(panel) {
  try {
    analyticsEvent('panel_view', { panel: panel });
  } catch(e) { /* silent */ }
}

// ── RETENTION / DAU ──────────────────────────────────────────────────────────

function analyticsSession() {
  try {
    var db = _analyticsGetDb();
    if (!db) return;

    var today = _analyticsToday();
    var didShort = (ANALYTICS.deviceId || 'unknown').substring(0, 8);

    // Retention: increment session counter for today
    var retRef = db.collection('analytics').doc('retention').collection('days').doc(today);
    retRef.set({ sessions: firebase.firestore.FieldValue.increment(1) }, { merge: true }).catch(function(){});

    // DAU: store one doc per device per day (for counting unique devices)
    var dauRef = db.collection('analytics').doc('dau').collection(today).doc(didShort);
    dauRef.set({ ts: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true }).catch(function(){});

  } catch(e) { /* never throw */ }
}
