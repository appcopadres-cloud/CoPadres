/* CoPadres — Configuración Firebase
 * ─────────────────────────────────
 * 1. Ve a https://console.firebase.google.com
 * 2. Crea un proyecto llamado "copadres"
 * 3. Agrega una app Web (ícono </>)
 * 4. Copia los valores de firebaseConfig aquí
 * 5. En Firestore Database → Crear base de datos → modo producción
 * 6. En Reglas de Firestore pega las reglas de LEEME_FIREBASE.txt
 */

var FIREBASE_CONFIG = {
  apiKey:            "TU_API_KEY",
  authDomain:        "TU_PROYECTO.firebaseapp.com",
  projectId:         "TU_PROYECTO_ID",
  storageBucket:     "TU_PROYECTO.appspot.com",
  messagingSenderId: "TU_SENDER_ID",
  appId:             "TU_APP_ID"
};

// NO modificar esta línea — se usa en init.js
var FIREBASE_ENABLED = (FIREBASE_CONFIG.apiKey !== "TU_API_KEY");
