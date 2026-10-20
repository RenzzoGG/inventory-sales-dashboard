# CLAUDE.md

Reglas de trabajo para este repositorio.

## Sobre el proyecto

- Inventory & Sales Dashboard: dashboard de inventario y ventas (filtros, alta de productos, exportar a PDF y Excel).
- Forma parte del portafolio de Renzzo (renzzogg.com). Antes vivía en `public/projects/inventory-dashboard/` del repo del portafolio; se extrajo aquí conservando su historial de git.
- Desplegado en **Railway** como **sitio estático** en **inventory.renzzogg.com** desde la rama `main`.
- **Cada push a `main` se publica en vivo** en inventory.renzzogg.com vía Railway.
- Railway (Railpack) lo detecta como sitio estático porque `index.html` está en la raíz del repo. **Todo lo que esté en el repo es público.**

## Estructura del repo

```
index.html    # Página del dashboard
styles.css    # Estilos
app.js        # Lógica: datos de ejemplo, búsqueda, filtro, modal, exportar PDF/Excel
favicon.svg   # Ícono de la pestaña (caja de inventario)
README.md
CLAUDE.md
.gitignore
```

- Las rutas a recursos propios son **relativas** (`styles.css`, `app.js`); no deben depender de estar dentro del portafolio.

## Cache busting

- Cloudflare sirve `styles.css` y `app.js` con `cache-control: max-age=14400` (4 h), pero `index.html` no se cachea. Si cambia el HTML y no la URL del CSS/JS, el navegador combina HTML nuevo con CSS/JS viejo y la página se rompe.
- En `index.html` se cargan con versión: `styles.css?v=N` y `app.js?v=N`.
- **Cada commit que modifique `styles.css` o `app.js` debe subir `N` en `index.html`** (el mismo número para los dos, en el mismo commit).

## Forma de trabajo

- Soy estudiante de Ingeniería de Software y quiero aprender: **explica las decisiones importantes antes de implementarlas** (qué opciones hay, cuál recomiendas y por qué).

## Git

- Trabajamos directo en la rama `main`, **sin crear ramas nuevas**.
- Haz commits **locales** con mensajes claros en español.
- **NUNCA** hagas `git push` ni ningún otro comando que suba cambios al remoto. El push lo hago yo.

## Stack

- HTML, CSS y JavaScript puro, sin paso de build.
- Librerías desde CDN (cdnjs), **siempre con versión exacta**: jsPDF 2.5.1 y SheetJS (xlsx) 0.18.5.
- Sin frameworks ni dependencias de npm, salvo que yo lo apruebe explícitamente. No crear `package.json` en la raíz: haría que Railpack trate el sitio como app de Node en lugar de estático.
- Probar localmente con `python3 -m http.server 8000` → `http://localhost:8000`.

## Reporte al terminar cada tarea

Al terminar cada tarea, entrega un **REPORTE** con:

1. Qué hiciste.
2. Archivos creados / modificados / borrados.
3. Commits hechos (hash y mensaje).
4. Problemas o dudas.
5. Siguientes pasos sugeridos.
