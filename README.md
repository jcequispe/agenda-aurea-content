# agenda-aurea-content

Fuente única de contenido (textos, precios, WhatsApp, fotos) de la landing de **Agenda Renacer 2027 (E·Sencia)**.
La app (`rumbo`, `apps/conversion`) no lleva contenido propio: descarga `content.yml` al abrir la página y arma todo con él.

## Estructura

```
sites/conversion/content.yml     la "receta" de la landing
schema/conversion.schema.json    contrato que valida el YAML (CI + editor)
media/renacer/                   fotos y video: brand/ cover/ interior/ lifestyle/ video/
scripts/validate.mjs             valida YAML + existencia y peso de los archivos
```

Las rutas dentro del YAML son relativas a `media/` (ej. `renacer/cover/cover-real.jpg`).

## Cómo lo consume la app

GitHub Pages publica `sites/`, `media/` y `schema/`:

```
https://jcequispe.github.io/agenda-aurea-content/sites/conversion/content.yml
https://jcequispe.github.io/agenda-aurea-content/media/renacer/cover/cover-real.jpg
```

La app hace `fetch` del YAML, lo parsea con `js-yaml` y resuelve cada imagen con `${BASE}/media/${ruta}`.
Cambiar un texto, precio o foto **no requiere recompilar la app**.

## Editar contenido

1. Rama desde `develop`; edita `sites/conversion/content.yml` y/o sube archivos a `media/`.
2. `npm ci && npm run validate` (el CI corre lo mismo).
3. Merge a `develop` → `master` (GitFlow).
4. Publicar: el push a `master` despliega; si la web no cambia, lanzarlo a mano con
   `gh workflow run publish.yml --ref master`.
5. En el celular puede verse la versión anterior unos minutos por caché: cerrar y reabrir la pestaña.

Reglas de media (las aplica `validate`): imágenes ≤ 600 KB, videos ≤ 15 MB, nombres en minúsculas sin espacios ni tildes.
**Nota:** usar siempre fotos de la agenda real (tapa dura/blanda, lomo plano, sin anillado); no inventar precios, reseñas ni garantías.

## Trampas de YAML

- Un valor con `: ` (dos puntos y espacio) va entre comillas: `a: "Es preventa: pagas hoy"`.
- Números de teléfono entre comillas (`"51900000000"`) para no perder ceros.
- Colores con `#` entre comillas.
- Indenta con 2 espacios, nunca con tabs.
- Los placeholders sin resolver están marcados como `PENDIENTE` o `[xx]`.

## Historial

Antes este repo también servía la landing "imperfecta". Se retiró; sigue en el historial
(tag `pre-limpieza-landings`).
