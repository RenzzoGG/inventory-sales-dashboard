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
og-image.png  # Imagen Open Graph 1200×630 (vista previa al compartir el enlace)
docs/
├── og-image.html  # Plantilla de og-image.png (se publica, pero lleva noindex)
└── screenshots/   # Capturas WebP que usa el README
README.md
CLAUDE.md
.gitignore
```

- Las rutas a recursos propios son **relativas** (`styles.css`, `app.js`); no deben depender de estar dentro del portafolio.

## Cache busting

- Cloudflare sirve `styles.css` y `app.js` con `cache-control: max-age=14400` (4 h), pero `index.html` no se cachea. Si cambia el HTML y no la URL del CSS/JS, el navegador combina HTML nuevo con CSS/JS viejo y la página se rompe.
- En `index.html` se cargan con versión: `styles.css?v=N` y `app.js?v=N`.
- **Si cambias `styles.css` o `app.js`, sube `N` en `index.html` respecto a la versión publicada** (la de `origin/main`), en el primer commit que los toque. El mismo número para los dos archivos.
- Varios commits locales antes de un mismo push comparten ese `N`: no hace falta subirlo en cada commit, porque las versiones intermedias nunca se publican.
- Para comprobarlo antes de avisar que está listo: `git diff origin/main -- index.html | grep '?v='`.

## Imagen OG y capturas

- `og-image.png` se genera desde `docs/og-image.html` con Chrome headless (el comando está en el comentario de la plantilla). Si cambia el nombre, la frase o los colores del proyecto, se regenera.
- Desde WSL se usa el Chrome de Windows (`/mnt/c/Program Files/Google/Chrome/Application/chrome.exe`, con la ruta de salida pasada por `wslpath -w`): el `chrome-headless-shell` de `~/.cache/puppeteer` no arranca porque le falta `libnss3`.
- En headless, Chrome para Windows no baja de unos 492 px de ancho de layout, aunque `--window-size` diga 390. Para capturas de móvil, carga la página dentro de un `<iframe>` de 390×844 en una página auxiliar temporal (que no se commitea).

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
