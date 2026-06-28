# Cartilla Digital Interactiva

Cartilla web estática e interactiva para educación inicial sobre el uso pedagógico de las TIC, el juego, el arte, la literatura, la exploración del medio y la inclusión.

El sitio está pensado para publicarse en GitHub Pages y funciona en celular, tablet y computador. Incluye navegación por páginas, índice interactivo, tarjetas desplegables, glosario, semáforo de la calma y recursos imprimibles.

## Estructura de carpetas

```text
CARTILLA/
├── index.html              # Estructura principal del sitio
├── style.css               # Estilos visuales, responsive, accesibles e impresión
├── script.js               # Motor de navegación e interacciones
├── data/
│   └── contenido.json      # Textos, páginas, actividades y referencias
├── assets/
│   └── imagenes/           # Imágenes usadas por la cartilla
└── README.md               # Documentación del proyecto
```

## Cómo verla localmente

Como el contenido se carga con `fetch`, abre la cartilla desde un servidor estático y no directamente con doble clic sobre `index.html`.

Desde esta carpeta ejecuta:

```bash
python -m http.server
```

Luego abre en el navegador:

```text
http://localhost:8000
```

## Cómo editar el contenido

Todo el texto editable vive en `data/contenido.json`. Allí se definen el título general, el índice y el arreglo `paginas`.

Tipos principales de página:

- `portada`: página inicial con título, lema, botones e imagen.
- `indice`: índice interactivo que navega a las secciones.
- `estandar`: página de contenido con bloques de texto, listas, chips, callouts, tablas o tarjetas.
- `reflexion`: página con contenido y modal de reflexión ampliada.
- `actividad`: página con paneles desplegables de objetivo, descripción, recursos e inclusión.
- `semaforo`: recurso interactivo del semáforo de la calma.
- `glosario`: acordeón de términos y definiciones.
- `imprimible-emociones`: tarjetas recortables de emociones.
- `imprimible-diario`: diario imprimible con líneas, recuadros y opciones.
- `referencias`: listado de referencias en formato visual tipo APA.

Tipos de bloque usados dentro de páginas `estandar` o `reflexion`:

- `p`: párrafo.
- `h`: subtítulo interno.
- `lista`: lista de elementos.
- `chips`: insignias breves.
- `callout`: caja destacada.
- `tarjetas`: tarjetas desplegables.
- `tabla`: tabla con encabezados y filas.

Para agregar imágenes nuevas, guárdalas en `assets/imagenes/` y referencia la ruta desde el campo `imagen` o `imagenSecundaria` del JSON.

## Actualizar cambios en GitHub

Después de editar, revisa el sitio localmente y publica los cambios con:

```bash
git add . && git commit -m "Actualiza cartilla digital" && git push
```

## Accesibilidad y dispositivos

La hoja de estilos usa contraste legible, estados `:focus-visible`, botones con áreas táctiles amplias, diseño mobile-first, soporte para `prefers-reduced-motion` y reglas `@media print` para imprimir los recursos.
