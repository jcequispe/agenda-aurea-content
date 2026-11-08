# agenda-aurea-content

Fuente única de contenido (textos, precios, WhatsApp, imágenes, videos) de las landings. Las apps no llevan contenido propio: descargan `content.yml` en runtime y arman la página.

## Estructura

```
sites/<sitio>/content.yml      la "receta" de cada landing (hoy: imperfecta)
schema/content.schema.json     contrato que valida el YAML (CI + editor)
media/
  <sitio>/
    hero/        imagen principal
    editions/    una portada por edición/color
    features/    fotos de las funcionalidades
    collage/     collage / ambiente
    product/     formato, tamaño, regalo, unboxing
    video/
      clips/     .mp4 (H.264) + .webm opcional
      posters/   .jpg del primer frame de cada clip
  shared/
    logos/ icons/              reutilizables entre sitios
scripts/validate.mjs           valida YAML + existencia y peso de archivos
```

Las rutas dentro del YAML son relativas a `media/` (ej. `imperfecta/hero/hero.jpg`).

## Cómo lo consume la app (runtime)

Al hacer push a `master`, GitHub Pages publica `sites/`, `media/` y `schema/`:

```
{BASE}/sites/imperfecta/content.yml
{BASE}/media/imperfecta/hero/hero.jpg
```

La app hace `fetch(`${BASE}/sites/imperfecta/content.yml`)`, lo parsea con `js-yaml` y resuelve cada imagen/video con `${BASE}/media/${ruta}`. `BASE` es una variable de la app (`VITE_CONTENT_BASE_URL`). Pages responde con CORS abierto.

## Editar contenido

1. Rama desde `develop`, edita `content.yml` y/o sube archivos a `media/`.
2. `npm ci && npm run validate` (CI corre lo mismo).
3. Merge a `develop` → `master` (GitFlow). Al desplegar, la web cambia sin redeploy de la app.

Reglas de media (las aplica `validate`): imágenes ≤ 600 KB (JPG/WebP, ancho ≤ 1600 px), videos ≤ 15 MB (MP4 H.264, sin audio salvo necesidad), nombres en minúsculas sin espacios ni tildes.

## Trampas de YAML

- Un valor con `: ` (dos puntos y espacio) debe ir entre comillas: `a: "Es preventa: pagas hoy"`.
- Números de teléfono van entre comillas (`"51900000000"`) para no perder ceros.
- Colores con `#` van entre comillas.
- Indenta con 2 espacios, nunca con tabs.
- Placeholders sin resolver están marcados como `PENDIENTE` o `[xx]`.
