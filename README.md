# Conexiones de aprendizaje · Cartilla interactiva sobre dislexia

Cartilla web interactiva para docentes de 1.º a 3.º de primaria: **cómo identificar la dislexia en el aula** y **estrategias didácticas** con 15 actividades jugables.

Reproduce el formato de la presentación de Canva (colores, tipografías, barra superior, insignia del cerebro y numeración) y le agrega movimiento e interacción. Funciona en computador, tablet y celular, y se publica con GitHub Pages.

## Orden de las diapositivas

| N.º | Contenido |
| --- | --- |
| 1–11 | Primera parte (Canva): portada, autores, introducción, ¿qué es la dislexia?, tipos, señales de alerta por edades y emocionales, prevalencia, factores, impacto y enfoque interdisciplinario |
| 12 | Estrategias didácticas («Let's go!») |
| 13 | Presentación de la propuesta: «Cada letra cuenta, cada logro importa» |
| 14 | Tablero de actividades |
| 15–29 | Actividades 1 a 15 (guía para el docente + juego interactivo) |
| 30 | Mi semáforo del aprendizaje |
| 31 | Recomendaciones para docentes y familias |
| 32 | Instrumento para evaluar los avances (se puede marcar, copiar e imprimir) |
| 33 | Cierre |
| 34–35 | Referencias (libros y revistas científicas) |

## Estructura

```text
CARTILLA/
├── index.html     # Diapositivas de Canva, semáforo, recomendaciones, evaluación, cierre y referencias
├── style.css      # Formato de Canva (lienzo 1280 × 720), animaciones, modo celular e impresión
├── script.js      # Navegación, actividades (contenido + juegos) e interacciones
└── assets/
    ├── canva/     # Elementos gráficos tomados de la presentación de Canva
    └── act/       # Ilustraciones de las actividades
```

## Cómo editar

- **Textos de las diapositivas de Canva, semáforo, recomendaciones y referencias:** en `index.html`.
- **Actividades:** en el arreglo `ACTIVIDADES` de `script.js` (título, objetivo, materiales, pasos, ejemplo, adaptación por grado y evaluación). Cada actividad indica qué juego usa (`juego`).

## Navegación

Flechas ◀ ▶, teclado (← →), deslizar en pantallas táctiles, botón **Índice** y enlaces directos (por ejemplo `#actividad-3`). Los botones 🔊 leen en voz alta con la voz del navegador.

## Verla localmente

```bash
python -m http.server
```

Abrir `http://localhost:8000`.
