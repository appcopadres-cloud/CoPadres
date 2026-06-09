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
  apiKey:            "AIzaSyDqC-1Rji6ENEPRYv7hRe-mjL907KJGAKY",
  authDomain:        "copadrestop.firebaseapp.com",
  projectId:         "copadrestop",
  storageBucket:     "copadrestop.firebasestorage.app",
  messagingSenderId: "1046520553995",
  appId:             "1:1046520553995:web:9ce79b63447cac47aadd0e"
};

// NO modificar esta línea — se usa en init.js
var FIREBASE_ENABLED = (FIREBASE_CONFIG.apiKey !== "TU_API_KEY");
