# Notas de Seguridad — CoPadres

## Panel de Analítica (`analytics.html`)

### Estado actual — Beta interna v1

El panel de analítica es una herramienta **exclusiva para uso interno del equipo CoPadres**.

**Restricciones obligatorias:**
- ✅ La contraseña está hasheada con SHA-256 (no queda en texto plano)
- ⛔ No compartir la URL públicamente con usuarios finales
- ⛔ No mencionar `analytics.html` en ningún material de marketing o soporte
- ✅ No contiene datos sensibles (sin nombres, teléfonos ni datos de menores)
- ✅ Excluido del Service Worker (no se distribuye offline a usuarios)
- ✅ `noindex/nofollow` activo — no aparece en Google ni Bing

**Limitación conocida de v1:**
Un usuario técnico que conozca la URL puede inspeccionar el código fuente
y omitir la verificación de contraseña. Esta es una limitación inherente
de toda protección frontend-only. Para beta interna con equipo reducido
es aceptable, pero no debe usarse como capa de seguridad real.

**La URL del panel NO aparece en:**
- Navegación pública de la app
- Menú lateral (sidebar)
- Menú inferior (bottom nav)
- `manifest.json` (shortcuts)
- Service Worker cache
- Ningún enlace visible para usuarios

---

## Hoja de ruta de seguridad

### v1 Beta (estado actual)
- [x] Contraseña hasheada SHA-256
- [x] Meta noindex/nofollow
- [x] Sin datos PII en Firestore
- [x] Panel excluido de navegación pública
- [ ] Autenticación real (pendiente v2)

### v2 — Implementar autenticación real

Reemplazar el `prompt()` actual con **Firebase Authentication**:

1. Activar "Email/Contraseña" en Firebase Console → Authentication
2. Crear usuario admin: `admin@copadres.app`
3. Actualizar reglas de Firestore:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Datos de familias — acceso por código de sala (sin auth requerida)
    match /familias/{familiaId} {
      allow read, write: if true;
      match /mensajes/{mensajeId} {
        allow read, write: if true;
      }
    }

    // Analytics — solo admins autenticados pueden leer
    match /analytics/{document=**} {
      allow write: if true;         // escritura desde la app (anónima)
      allow read: if request.auth != null; // lectura solo con login
    }
  }
}
```

4. En `analytics.html`, reemplazar el `prompt()` con:

```javascript
firebase.auth().signInWithEmailAndPassword(email, password)
  .then(() => loadAll())
  .catch(() => window.location.href = 'index.html');
```

---

## Datos almacenados en Firestore

### Colección `familias` (datos de usuarios)

| Campo | Tipo | Sensible | Notas |
|-------|------|----------|-------|
| `miembros[].nombre` | string | Bajo | Nombre elegido por el padre (puede ser apodo) |
| `miembros[].id` | string | No | ID interno generado (`u_timestamp`) |
| `mensajes[].texto` | string | Medio | Contenido del chat entre padres |
| `mensajes[].emisor` | string | Bajo | Nombre del padre que envió |
| `hijos[].nombre` | string | **Alto** | Nombre del menor |
| `hijos[].colegio` | string | Medio | Nombre del establecimiento |
| `gastos[].descripcion` | string | Bajo | Descripción libre del gasto |
| `gastos[].monto` | number | Medio | Monto en CLP |
| `contactoEmergencia` | object | **Alto** | Nombre y teléfono — guardado solo en localStorage, NO en Firestore |

> ⚠️ **El contacto de emergencia se almacena exclusivamente en localStorage del dispositivo, nunca en Firestore.** Verificado en `js/safety.js`.

### Colección `analytics` (métricas anónimas)

| Campo | Tipo | Sensible | Notas |
|-------|------|----------|-------|
| `did` | string | No | Primeros 8 chars de UUID anónimo |
| `e` | string | No | Nombre del evento (`session_start`, etc.) |
| `d` | string | No | Fecha en formato `YYYY-MM-DD` |
| `days` | number | No | Días desde instalación |
| `panel` | string | No | Nombre del panel visitado |

**Nunca se almacena en analytics:** nombres, teléfonos, contenido de mensajes, datos de menores, montos ni información geográfica.

---

## Contraseña del panel analytics

La contraseña por defecto es para uso interno del equipo en beta.
**Cambiarla antes de v1 pública** generando un nuevo hash:

```bash
python3 -c "import hashlib; print(hashlib.sha256(b'NUEVA_CONTRASEÑA').hexdigest())"
```

Reemplazar el valor `HASH` en `analytics.html` línea ~107.

---

## Contacto

Proyecto: CoPadres  
Email: appcopadres@gmail.com  
Repositorio: https://github.com/appcopadres-cloud/CoPadres
