# CoPadres v14.0.0 — Release Stable

**Fecha:** 2026-06-09  
**URL:** https://appcopadres-cloud.github.io/CoPadres/

## Cambios incluidos

- Auditoría completa de seguridad y UX
- Iconos PNG reales con branding CoPadres (192×192, 512×512, 180×180)
- Persistencia de datos con localStorage
- Toast notifications (reemplaza alert())
- Menú "Más" para navegación mobile completa
- Service Worker offline con rutas relativas
- Filtro anti-ofensas en chat
- Módulo S.O.S. con GPS y contacto de emergencia
- Calendario compartido con eventos
- Registro de gastos compartidos
- Gestión de acuerdos y conflictos
- Soporte iOS safe-area-inset (iPhone X+)
- Compatibilidad Android 7+ (ES5)

## Archivos modificados

- `copadres-v14/index.html` — meta tags, viewport, estructura
- `copadres-v14/manifest.json` — iconos separados any/maskable
- `copadres-v14/sw.js` — rutas relativas, offline HTML
- `copadres-v14/css/app.css` — safe-area, toasts, more menu
- `copadres-v14/js/icons.js` — var en lugar de const
- `copadres-v14/js/nav.js` — NAV_ICONS (evita colisión)
- `copadres-v14/js/dashboard.js` — referencia NAV_ICONS
- `copadres-v14/js/data.js` — guardarEstado/cargarEstado
- `copadres-v14/js/ui.js` — showToast, openMoreMenu (nuevo)
- `copadres-v14/js/safety.js` — sin Leaflet duplicado
- `copadres-v14/js/init.js` — carga estado, deep links
- `copadres-v14/assets/icon-192.png` — PNG real 192×192
- `copadres-v14/assets/icon-512.png` — PNG real 512×512
- `copadres-v14/assets/apple-touch-icon.png` — PNG real 180×180
- `netlify.toml` — headers de seguridad
- `.github/workflows/pages.yml` — deploy GitHub Pages
- `.github/workflows/deploy.yml` — deploy Netlify (opcional)
