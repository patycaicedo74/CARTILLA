/* =========================================================================
   Conexiones de aprendizaje · Motor de la cartilla interactiva
   - Navegación por diapositivas (flechas, teclado, gestos, índice, #enlace)
   - Generación de las diapositivas de actividades (15) con su juego
   - Interacciones de las diapositivas de Canva
   ========================================================================= */
(function () {
  "use strict";

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  // Crea un elemento con clase, texto, atributos e hijos.
  function el(tag, opts = {}, children = []) {
    const node = document.createElement(tag);
    if (opts.class) node.className = opts.class;
    if (opts.text != null) node.textContent = opts.text;
    if (opts.html != null) node.innerHTML = opts.html;
    if (opts.attrs) Object.entries(opts.attrs).forEach(([k, v]) => node.setAttribute(k, v));
    if (opts.style) node.setAttribute("style", opts.style);
    if (opts.on) Object.entries(opts.on).forEach(([k, fn]) => node.addEventListener(k, fn));
    [].concat(children).forEach((c) => c != null && node.appendChild(typeof c === "string" ? document.createTextNode(c) : c));
    return node;
  }

  const shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  // =======================================================================
  //  VOZ (lectura en voz alta con la voz del navegador)
  // =======================================================================
  const synth = "speechSynthesis" in window ? window.speechSynthesis : null;
  let voz = null;
  function elegirVoz() {
    if (!synth) return;
    const voces = synth.getVoices();
    voz = voces.find((v) => /es[-_](CO|MX|US|419)/i.test(v.lang)) || voces.find((v) => /^es/i.test(v.lang)) || null;
  }
  if (synth) { elegirVoz(); synth.onvoiceschanged = elegirVoz; }

  function hablar(texto) {
    if (!synth) { toast("Tu navegador no tiene lectura en voz alta"); return; }
    synth.cancel();
    const u = new SpeechSynthesisUtterance(texto);
    u.lang = voz ? voz.lang : "es-ES";
    if (voz) u.voice = voz;
    u.rate = 0.85;
    synth.speak(u);
  }
  const btnVoz = (texto, label = "🔊") =>
    el("button", { class: "btn btn--sm btn--speak", text: label, attrs: { type: "button", "aria-label": "Escuchar" }, on: { click: () => hablar(typeof texto === "function" ? texto() : texto) } });

  // =======================================================================
  //  AVISOS Y CELEBRACIÓN
  // =======================================================================
  let toastT;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("is-on");
    clearTimeout(toastT);
    toastT = setTimeout(() => t.classList.remove("is-on"), 2200);
  }

  function confeti() {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const box = $("#confetti");
    const colores = ["#512885", "#ee717d", "#095fb8", "#ffdb77", "#9dbd65", "#fe9a3a", "#8fdcc0"];
    for (let i = 0; i < 80; i++) {
      const c = el("i");
      c.style.left = Math.random() * 100 + "vw";
      c.style.background = colores[i % colores.length];
      c.style.animationDuration = 1.6 + Math.random() * 1.8 + "s";
      c.style.animationDelay = Math.random() * 0.4 + "s";
      box.appendChild(c);
      setTimeout(() => c.remove(), 4000);
    }
  }

  // =======================================================================
  //  CONTENIDO DE LAS ACTIVIDADES (tomado de la cartilla .docx)
  // =======================================================================
  const G123 = "Grados 1.º, 2.º y 3.º";
  const ACTIVIDADES = [
    {
      titulo: "El detective de las letras", img: "a1-detective", grados: G123, juego: "detective",
      objetivo: "Reconocer las letras y asociarlas con sus sonidos.",
      materiales: ["Tarjetas con letras", "Imágenes de objetos cotidianos", "Colores", "Una mesa de trabajo"],
      pasos: [
        "El docente presenta tres o cuatro letras en tarjetas grandes.",
        "Pronuncia el sonido de cada letra y pide al niño que lo repita.",
        "Muestra imágenes de objetos cuyos nombres comienzan con esos sonidos.",
        "El estudiante selecciona la letra correspondiente y la relaciona con la imagen.",
        "Finalmente, puede repasar la letra con el dedo, dibujarla en el aire o colorearla.",
      ],
      extra: { tab: "💡 Ejemplo", titulo: "Ejemplo práctico", tipo: "imagenes", items: [["a1-manzana", "M – manzana"], ["a1-pelota", "P – pelota"], ["a1-sol", "S – sol"]] },
      grado: ["Identificar letras y sonidos iniciales.", "Encontrar palabras que comiencen o terminen con el sonido trabajado.", "Clasificar palabras según su sonido inicial y escribirlas con apoyo visual."],
      evaluacion: "Observar si el estudiante reconoce la letra, produce su sonido y la relaciona con una imagen.",
    },
    {
      titulo: "Une la imagen con su palabra", img: "a2-une", grados: G123, juego: "unir",
      objetivo: "Relacionar imágenes con palabras escritas y fortalecer el reconocimiento visual del vocabulario.",
      materiales: ["Fichas ilustradas", "Lápiz", "Colores", "Tarjetas con palabras"],
      pasos: [
        "El docente muestra las imágenes de una casa, un árbol, un pez y un gato.",
        "Lee cada palabra lentamente, señalando las letras.",
        "El estudiante observa las imágenes y busca la palabra correspondiente.",
        "Une cada dibujo con su palabra mediante una línea.",
        "Al terminar, pronuncia las palabras con ayuda del docente.",
      ],
      extra: {
        tab: "💡 Plantilla", titulo: "Plantilla para trabajar", tipo: "tabla",
        cab: ["Imagen", "Palabra"], filas: [["Dibujo de una casa", "árbol"], ["Dibujo de un árbol", "pez"], ["Dibujo de un pez", "casa"], ["Dibujo de un gato", "gato"]],
        nota: "El niño debe unir cada imagen con la palabra correcta; las opciones están mezcladas intencionalmente para convertir la tarea en un juego.",
      },
      grado: ["Palabras cortas y conocidas.", "Palabras de dos o tres sílabas.", "Palabras nuevas acompañadas de una oración sencilla."],
      evaluacion: "Comprobar si identifica las palabras y comprende su significado, sin exigir rapidez.",
    },
    {
      titulo: "El tren de las sílabas", img: "a3-tren", grados: G123, juego: "tren",
      objetivo: "Reconocer las sílabas y aprender a unirlas para formar palabras.",
      materiales: ["Tarjetas de sílabas", "Dibujos", "Cartulina", "Pegamento"],
      pasos: [
        "El docente presenta las sílabas en tarjetas separadas.",
        "Pronuncia cada sílaba con claridad.",
        "Invita al estudiante a unir las tarjetas para formar una palabra.",
        "El niño dice la palabra completa y busca el dibujo que la representa.",
        "Puede pegar las sílabas en los vagones de un tren de papel.",
      ],
      extra: { tab: "💡 Ejemplos", titulo: "Ejemplos", tipo: "imagenes", items: [["a3-mesa", "ME + SA = MESA"], ["a3-mano", "MA + NO = MANO"], ["a3-luna", "LU + NA = LUNA"]] },
      grado: ["Formar palabras sencillas de dos sílabas.", "Trabajar palabras de dos y tres sílabas.", "Formar palabras, leerlas y utilizarlas en oraciones."],
      evaluacion: "Identificar si el niño reconoce las sílabas y logra unirlas para formar palabras.",
    },
    {
      titulo: "Leo, observo y comprendo", img: "a4-leo", grados: G123, juego: "oracion",
      objetivo: "Desarrollar la comprensión lectora mediante oraciones breves acompañadas de ilustraciones.",
      materiales: ["Tarjetas con frases", "Dibujos", "Lápices de colores"],
      pasos: [
        "El docente lee una oración en voz alta.",
        "El estudiante sigue la lectura con el dedo mientras escucha.",
        "Observa dos imágenes y selecciona la que corresponde a la oración.",
        "Explica con sus propias palabras lo que entendió.",
        "Colorea la ilustración correcta.",
      ],
      extra: { tab: "💡 Ejercicio", titulo: "Ejercicio para el estudiante", tipo: "imagenes", intro: "Lee con ayuda: “El perro juega con la pelota”. ¿Cuál dibujo representa la oración?", items: [["a4-perro", "A. El perro juega"], ["a4-gato", "B. El gato duerme."]] },
      grado: ["Relacionar una frase con un dibujo.", "Leer oraciones y responder preguntas como quién, qué y dónde.", "Leer pequeños párrafos y explicar la idea principal."],
      evaluacion: "Valorar la comprensión de la oración, aunque el niño necesite que se la lean en voz alta.",
    },
    {
      titulo: "Mi cuaderno de palabras", img: "a5-cuaderno", grados: G123, juego: "trazo",
      objetivo: "Fortalecer la escritura y la relación entre los sonidos y las letras.",
      materiales: ["Cuaderno", "Lápiz", "Tarjetas con palabras", "Dibujos de referencia"],
      pasos: [
        "El docente muestra una palabra y pronuncia sus sonidos.",
        "El estudiante observa cómo se escribe.",
        "Repasa la palabra con el dedo o sigue un modelo punteado.",
        "Copia la palabra en un renglón amplio.",
        "Si está preparado, intenta escribirla sin mirar el modelo.",
      ],
      extra: { tab: "💡 Ficha", titulo: "Ficha de práctica", tipo: "imagenes", items: [["a5-flor", "FLOR: Repasa y escribe."], ["a5-sol", "SOL: Repasa y escribe."], ["a5-casa", "CASA: Repasa y escribe."]] },
      grado: ["Repasar letras y copiar palabras cortas.", "Completar palabras a las que les falten letras.", "Escribir oraciones cortas con palabras conocidas."],
      evaluacion: "Observar el reconocimiento de letras, la direccionalidad del trazo y el progreso individual, sin penalizar cada error ortográfico.",
    },
    {
      titulo: "Encuentra la letra que falta", img: "a6-letra", grados: G123, juego: "falta",
      objetivo: "Identificar los sonidos que faltan en una palabra y completar su escritura.",
      materiales: ["Fichas ilustradas", "Lápices", "Tarjetas de letras"],
      pasos: [
        "El estudiante observa el dibujo.",
        "El docente pronuncia la palabra lentamente.",
        "El niño identifica qué sonido o letra falta.",
        "Escoge la letra entre dos o tres opciones.",
        "Ordena la palabra correctamente y la lee con acompañamiento.",
      ],
      extra: { tab: "💡 Practicar", titulo: "¡Vamos a practicar!", tipo: "tabla", cab: ["Palabra", "Opciones"], filas: [["☀️ S _ L", "A – O – E"], ["🏠 C A _ A", "S – M – T"], ["🐟 P E _", "R – Z – L"], ["🐱 G A _ O", "T – P – M"]] },
      grado: ["Completar palabras con imágenes y opciones.", "Completar palabras sin opciones, usando pistas.", "Completar palabras dentro de oraciones."],
      evaluacion: "Observar si el niño identifica el sonido que falta y puede asociarlo con la letra correcta.",
    },
    {
      titulo: "El juego de las palabras parecidas", img: "a7-parecidas", grados: "Grados 2.º y 3.º; adaptación para 1.º", juego: "parecidas",
      objetivo: "Reconocer semejanzas y diferencias entre los sonidos de las palabras.",
      materiales: ["Tarjetas con palabras", "Imágenes", "Fichas de colores"],
      pasos: [
        "El docente presenta dos palabras conocidas.",
        "Las pronuncia claramente y pide al estudiante que las escuche.",
        "El niño identifica si comienzan igual o diferente.",
        "Después, observa las letras y señala cuál cambia.",
        "Finalmente, relaciona cada palabra con su imagen.",
      ],
      extra: { tab: "💡 Ejemplos", titulo: "Ejemplos", tipo: "lista", items: ["PALA – BALA.", "CASA – MASA.", "PATO – GATO.", "LATA – RATA."] },
      gradoNota: "Para estudiantes de primer grado, se recomienda comenzar con sonidos iniciales y palabras cortas antes de trabajar pares más difíciles.",
      evaluacion: "Reconocer diferencias sonoras y visuales sin exigir que el estudiante lea las palabras con rapidez.",
    },
    {
      titulo: "Construyo una oración", img: "a8-oracion", grados: G123, juego: "ordenar",
      objetivo: "Organizar palabras para formar oraciones con sentido.",
      materiales: ["Tarjetas de palabras", "Dibujos", "Cartulina"],
      pasos: [
        "El docente presenta una imagen y varias tarjetas con palabras.",
        "Lee cada tarjeta en voz alta.",
        "El estudiante organiza las palabras para expresar lo que observa.",
        "Lee la oración formada con apoyo del docente.",
        "Dibuja lo que significa la oración.",
      ],
      extra: { tab: "💡 Ejemplo", titulo: "Ejemplo", tipo: "lista", intro: "Ordena las tarjetas:", items: ["juega", "niño", "El", "fútbol."], nota: "Respuesta: El niño juega fútbol." },
      grado: ["Ordenar tres palabras con apoyo de una imagen.", "Formar oraciones de cuatro o cinco palabras.", "Construir oraciones y añadir detalles sobre quién, dónde o cuándo."],
      evaluacion: "Comprobar si organiza las palabras y comprende la idea expresada.",
    },
    {
      titulo: "Leo y dibujo lo que entiendo", img: "a9-dibujo", grados: G123, juego: "dibujo",
      objetivo: "Fortalecer la comprensión de instrucciones y la asociación entre lenguaje e imágenes.",
      materiales: ["Hoja blanca", "Lápices de colores", "Frases cortas"],
      pasos: [
        "El docente lee una instrucción breve.",
        "El estudiante escucha y repite lo que debe hacer.",
        "Dibuja lo que indica la frase.",
        "Explica su dibujo con sus propias palabras.",
        "Compara su producción con la instrucción inicial.",
      ],
      extra: { tab: "💡 Instrucciones", titulo: "Instrucciones para practicar", tipo: "lista", items: ["Dibuja un sol amarillo.", "Dibuja una casa pequeña.", "Dibuja un árbol verde.", "Dibuja dos flores rojas."] },
      grado: ["Seguir instrucciones de un solo paso.", "Seguir instrucciones con dos elementos.", "Leer pequeños párrafos y representar sus ideas mediante un dibujo."],
      evaluacion: "Observar si comprende la instrucción y representa sus ideas. No es necesario que lea sin ayuda para demostrar comprensión.",
    },
    {
      titulo: "Bingo de palabras", img: "a10-bingo", grados: G123, juego: "bingo",
      objetivo: "Reforzar el reconocimiento de palabras mediante un juego grupal.",
      materiales: ["Tableros con imágenes y palabras", "Fichas", "Tarjetas para sortear"],
      pasos: [
        "Cada estudiante recibe un tablero con imágenes y palabras conocidas.",
        "El docente saca una tarjeta y pronuncia la palabra.",
        "Los niños buscan la palabra o el dibujo correspondiente.",
        "Colocan una ficha sobre la casilla.",
        "Gana quien complete una fila, pero se celebra también el esfuerzo y la participación de todos.",
      ],
      extra: { tab: "💡 Palabras", titulo: "Palabras sugeridas", tipo: "lista", items: ["sol", "casa", "flor", "gato", "pez", "mesa", "luna", "árbol", "pelota"], chips: true },
      grado: ["Buscar imágenes al escuchar palabras.", "Identificar palabras escritas.", "Escuchar definiciones sencillas y reconocer la palabra correspondiente."],
      evaluacion: "Registrar el reconocimiento de vocabulario, la atención auditiva y la participación.",
    },
    {
      titulo: "La estación de la b y la d", img: "a11-bd", grados: G123, juego: "bd",
      objetivo: "Diferenciar las grafías b y d en palabras conocidas, relacionando cada una con su sonido y su escritura.",
      materiales: ["Tarjetas con b y d", "Imágenes de barco, balón, dado y dona", "Dos carteles", "Colores"],
      pasos: [
        "El docente presenta las letras b y d y modela sus sonidos dentro de palabras conocidas.",
        "Muestra las cuatro imágenes y pronuncia sus nombres con claridad.",
        "Invita a leer las palabras y a clasificarlas en dos grupos según la letra inicial.",
        "El estudiante selecciona una palabra de cada grupo, la escribe y revisa su letra inicial.",
      ],
      extra: { tab: "🧭 Orientación", titulo: "Orientación para el docente", tipo: "texto", texto: "Decir: “Escuchemos barco y dado. ¿Qué sonido escuchas al empezar? Busquemos la letra con la que se escribe cada palabra”. Primero se enseña el sonido y después la forma de la letra; no basta con observar si está girada." },
      grado: ["Dos palabras y lectura modelada.", "Cuatro palabras y escritura guiada.", "Emplear cada palabra en una oración corta."],
      evaluacion: "Comprobar si asocia sonido, letra y palabra y si corrige errores mediante una explicación guiada.",
    },
    {
      titulo: "Jugamos con p y q", img: "a12-pq", grados: G123, juego: "pq",
      objetivo: "Reconocer la letra p y la secuencia qu en palabras, atendiendo a sus correspondencias sonido-escritura.",
      materiales: ["Tarjetas ilustradas de pato, pelota, queso y quince", "Fichas móviles p, qu, e, i", "Colores"],
      pasos: [
        "El docente presenta las palabras pato y queso, lee y señala sus letras iniciales.",
        "Explica que p representa /p/ y que qu se utiliza para escribir el sonido /k/ delante de e o i.",
        "Muestra las otras dos imágenes; el grupo lee las palabras con apoyo.",
        "Los estudiantes agrupan las tarjetas en p y qu y construyen una palabra con letras móviles.",
      ],
      extra: { tab: "🧭 Orientación", titulo: "Orientación para el docente", tipo: "texto", texto: "Preguntar: “¿Con qué letras comienza queso? ¿Y pelota?”. Evitar enseñar la q aislada como si tuviera un sonido propio en español: trabajarla acompañada de u en que y qui." },
      grado: ["Clasificar palabras con apoyo oral.", "Completar que/qui en palabras conocidas.", "Leer oraciones y explicar el uso de qu."],
      evaluacion: "Observar la lectura y escritura correcta de p y qu en palabras trabajadas.",
    },
    {
      titulo: "Detectives de oraciones bien escritas", img: "a13-detectives", grados: "Grados 2.º y 3.º; adaptación para 1.º", juego: "detectives",
      objetivo: "Identificar sustituciones de letras en oraciones breves mediante lectura guiada y revisión consciente.",
      materiales: ["Tarjetas con dos versiones de una oración", "Imágenes de un dado y un plato de sopa", "Lápices"],
      pasos: [
        "El docente presenta una imagen y lee en voz alta las dos versiones de una oración.",
        "Acompaña al estudiante a seguir cada palabra con el dedo y a señalar la diferencia.",
        "Le pide seleccionar la oración convencional y explicar qué letra debe corregirse.",
        "Se reescribe la palabra correcta y se lee de nuevo la oración completa.",
      ],
      extra: { tab: "🧭 Orientación", titulo: "Orientación para el docente", tipo: "texto", texto: "Utilizar: “El dado es rojo / El bado es rojo” y “Pepe come sopa / Peqe come soqa”. Guiar la revisión mediante los sonidos y las correspondencias aprendidas, sin pedir que acierte por la apariencia." },
      grado: ["Una pareja de palabras con imagen.", "Elegir entre dos oraciones.", "Corregir una oración y justificar el cambio."],
      evaluacion: "Registrar si detecta la sustitución, corrige la palabra y lee la oración con apoyo progresivamente menor.",
    },
    {
      titulo: "Mi cuadrícula de instrucciones", img: "a14-cuadricula", grados: G123, juego: "cuadricula",
      objetivo: "Seguir consignas espaciales cortas usando referentes visuales de ubicación y orden.",
      materiales: ["Cuadrícula de nueve casillas", "Tarjetas de sol, estrella y libro", "Colores", "Consignas escritas"],
      pasos: [
        "El docente muestra una cuadrícula de tres filas y tres columnas y señala el centro y las esquinas.",
        "Modela la primera indicación: “Coloca el sol arriba a la derecha”.",
        "Da otras dos consignas: “La estrella va en el centro” y “El libro va abajo a la izquierda”.",
        "El estudiante ubica las tarjetas, revisa sus elecciones y vuelve a expresar la instrucción.",
      ],
      extra: { tab: "🧭 Orientación", titulo: "Orientación para el docente", tipo: "texto", texto: "Leer una indicación a la vez, acompañarla con un gesto y conservarla escrita a la vista. Si aparecen confusiones de ubicación, usar referencias físicas del aula. Es una actividad complementaria de organización, no un tratamiento específico de la dislexia." },
      grado: ["Una ubicación con modelo.", "Dos consignas consecutivas.", "Leer tres consignas y explicar el recorrido."],
      evaluacion: "Observar si comprende y ejecuta las indicaciones y si solicita aclaración cuando la necesita.",
    },
    {
      titulo: "La ruta lectora: palabras en el camino", img: "a15-ruta", grados: G123, juego: "ruta",
      objetivo: "Promover la lectura guiada de palabras mientras se realiza un recorrido lúdico con paradas.",
      materiales: ["Lámina del recorrido", "Lápiz borrable", "Tarjetas con palabras", "Fichas de avance"],
      pasos: [
        "El docente muestra el camino desde INICIO hasta META y presenta las paradas de lectura.",
        "Modela cómo leer la primera palabra, sonido por sonido, antes de continuar.",
        "El estudiante sigue la ruta y lee sol, luna, flor y tren en cada parada, con la ayuda necesaria.",
        "Al finalizar, elige dos palabras y dice o escribe una oración sencilla con cada una.",
      ],
      extra: { tab: "🧭 Orientación", titulo: "Orientación para el docente", tipo: "texto", texto: "Explicar: “Para seguir avanzando, vamos a leer la palabra de esta estación. No necesitamos correr: lo importante es leer con atención”. El recorrido motiva la práctica, pero las palabras deben trabajarse con enseñanza explícita." },
      grado: ["Leer sol y luna con modelo.", "Añadir flor y tren.", "Crear oraciones con las cuatro palabras."],
      evaluacion: "Registrar la precisión en la lectura de cada palabra y el grado de apoyo requerido.",
    },
  ];

  const IMG = (n) => "assets/act/" + n + ".jpg";

  // =======================================================================
  //  JUEGOS
  // =======================================================================
  // Utilidad: encabezado de juego con pregunta, mensaje y botón de reinicio.
  function marco(box, pregunta) {
    box.innerHTML = "";
    const g = el("div", { class: "game" });
    const q = el("p", { class: "game__q", text: pregunta });
    const msg = el("p", { class: "game__msg", attrs: { role: "status" } });
    g.append(q);
    box.append(g);
    return {
      g, q, msg,
      ok(t) { msg.className = "game__msg ok"; msg.textContent = t; },
      ko(t) { msg.className = "game__msg ko"; msg.textContent = t; },
      clear() { msg.className = "game__msg"; msg.textContent = ""; },
    };
  }
  const BIEN = ["¡Muy bien!", "¡Excelente!", "¡Lo lograste!", "¡Súper!", "¡Bien hecho!"];
  const bien = () => BIEN[Math.floor(Math.random() * BIEN.length)];
  const otraVez = "Casi… inténtalo otra vez 💪";

  function fin(box, texto, reiniciar) {
    const f = marco(box, "");
    f.q.remove();
    f.g.append(
      el("div", { class: "big-emoji", text: "🏆" }),
      el("p", { class: "game__q", text: texto }),
      el("button", { class: "btn", text: "🔁 Volver a practicar", attrs: { type: "button" }, on: { click: reiniciar } })
    );
    confeti();
    hablar(texto);
  }

  function puntos(total, actual) {
    return el("div", { class: "dots" }, Array.from({ length: total }, (_, i) => el("i", { class: i < actual ? "is-ok" : i === actual ? "is-on" : "" })));
  }

  const JUEGOS = {
    // 1. Detective de las letras
    detective(box) {
      const rondas = shuffle([
        { l: "M", w: "manzana", img: "a1-manzana" },
        { l: "P", w: "pelota", img: "a1-pelota" },
        { l: "S", w: "sol", img: "a1-sol" },
      ]);
      let i = 0;
      const ronda = () => {
        if (i >= rondas.length) return fin(box, "¡Eres un detective de las letras!", () => JUEGOS.detective(box));
        const r = rondas[i];
        const f = marco(box, "¿Con qué letra empieza esta palabra?");
        const pic = el("img", { class: "big-pic", attrs: { src: IMG(r.img), alt: r.w } });
        const opciones = el("div", { class: "game__row" }, shuffle(["M", "P", "S"]).map((l) =>
          el("button", { class: "tile", text: l, attrs: { type: "button" }, on: { click: (e) => {
            if (l === r.l) {
              e.currentTarget.classList.add("is-ok");
              f.ok(`${bien()} ${r.l} de ${r.w}`);
              hablar(`${r.l}. ${r.w}`);
              $$(".tile", opciones).forEach((b) => (b.disabled = true));
              i++; setTimeout(ronda, 1600);
            } else { e.currentTarget.classList.add("is-ko"); setTimeout(() => e.currentTarget.classList.remove("is-ko"), 450); f.ko(otraVez); }
          } } })));
        f.g.append(puntos(rondas.length, i), pic, btnVoz(r.w, "🔊 Escuchar la palabra"), opciones, f.msg);
      };
      ronda();
    },

    // 2. Une la imagen con su palabra
    unir(box) {
      const items = [["🏠", "casa"], ["🌳", "árbol"], ["🐟", "pez"], ["🐱", "gato"]];
      const palabras = ["árbol", "pez", "casa", "gato"]; // orden mezclado como en la plantilla
      const colores = ["#ffe0b3", "#d7e8fb", "#eaefb5", "#f7cad7"];
      const f = marco(box, "Toca un dibujo y luego su palabra");
      let sel = null, hechos = 0;
      const izq = items.map(([e, w]) => el("button", { class: "tile tile--emoji", text: e, attrs: { type: "button", "aria-label": "Dibujo de " + w, "data-w": w }, on: { click: (ev) => {
        const b = ev.currentTarget; if (b.disabled) return;
        $$(".tile--emoji", box).forEach((x) => x.classList.remove("is-sel"));
        b.classList.add("is-sel"); sel = b; hablar(w);
      } } }));
      const der = palabras.map((w) => el("button", { class: "tile tile--word", text: w, attrs: { type: "button" }, on: { click: (ev) => {
        const b = ev.currentTarget; if (b.disabled) return;
        if (!sel) { f.ko("Primero toca un dibujo 👈"); return; }
        if (sel.dataset.w === w) {
          const c = colores[hechos];
          [sel, b].forEach((x) => { x.classList.remove("is-sel"); x.classList.add("is-ok"); x.style.background = c; x.disabled = true; });
          hechos++; sel = null; f.ok(bien() + " " + w); hablar(w);
          if (hechos === items.length) setTimeout(() => fin(box, "¡Uniste todas las palabras!", () => JUEGOS.unir(box)), 1200);
        } else { b.classList.add("is-ko"); setTimeout(() => b.classList.remove("is-ko"), 450); f.ko(otraVez); }
      } } }));
      const grid = el("div", { class: "match" });
      izq.forEach((b, k) => grid.append(b, der[k]));
      f.g.append(grid, f.msg);
    },

    // 3. El tren de las sílabas
    tren(box) {
      const rondas = [
        { s: ["ME", "SA"], w: "MESA", img: "a3-mesa" },
        { s: ["MA", "NO"], w: "MANO", img: "a3-mano" },
        { s: ["LU", "NA"], w: "LUNA", img: "a3-luna" },
      ];
      let i = 0;
      const ronda = () => {
        if (i >= rondas.length) return fin(box, "¡El tren llegó a la estación!", () => JUEGOS.tren(box));
        const r = rondas[i];
        const f = marco(box, "Toca las sílabas en orden para subirlas al tren");
        const distractor = rondas[(i + 1) % rondas.length].s[1];
        const wagons = r.s.map(() => el("div", { class: "wagon" }));
        const train = el("div", { class: "train" }, [el("span", { class: "train__engine", text: "🚂" }), ...wagons]);
        let k = 0;
        const fichas = el("div", { class: "game__row" }, shuffle([...r.s, distractor]).map((s) =>
          el("button", { class: "tile", text: s, attrs: { type: "button" }, on: { click: (e) => {
            const b = e.currentTarget;
            hablar(s.toLowerCase());
            if (s === r.s[k]) {
              wagons[k].textContent = s; wagons[k].classList.add("is-fill"); b.disabled = true; b.classList.add("is-ok"); k++;
              if (k === r.s.length) {
                f.ok(`${r.s.join(" + ")} = ${r.w}`);
                setTimeout(() => hablar(r.w.toLowerCase()), 500);
                $$(".tile", fichas).forEach((x) => (x.disabled = true));
                setTimeout(() => train.classList.add("is-go"), 900);
                i++; setTimeout(ronda, 2600);
              }
            } else { b.classList.add("is-ko"); setTimeout(() => b.classList.remove("is-ko"), 450); f.ko(otraVez); }
          } } })));
        f.g.append(puntos(rondas.length, i), el("img", { class: "big-pic", attrs: { src: IMG(r.img), alt: r.w.toLowerCase() } }), train, fichas, f.msg);
      };
      ronda();
    },

    // 4. Leo, observo y comprendo
    oracion(box) {
      const rondas = [{ t: "El perro juega con la pelota.", ok: "a4-perro" }, { t: "El gato duerme.", ok: "a4-gato" }];
      let i = 0;
      const ronda = () => {
        if (i >= rondas.length) return fin(box, "¡Comprendiste las oraciones!", () => JUEGOS.oracion(box));
        const r = rondas[i];
        const f = marco(box, `Lee con ayuda: “${r.t}”`);
        const opts = el("div", { class: "game__row" }, [["a4-perro", "A. El perro juega"], ["a4-gato", "B. El gato duerme"]].map(([img, cap]) =>
          el("button", { class: "tile tile--img", attrs: { type: "button" }, on: { click: (e) => {
            if (img === r.ok) { e.currentTarget.classList.add("is-ok"); f.ok(bien() + " Ese dibujo representa la oración."); hablar(r.t); i++; setTimeout(ronda, 1800); }
            else { e.currentTarget.classList.add("is-ko"); setTimeout(() => e.currentTarget.classList.remove("is-ko"), 450); f.ko(otraVez); }
          } } }, [el("img", { attrs: { src: IMG(img), alt: "" } }), cap])));
        f.g.append(puntos(rondas.length, i), btnVoz(r.t, "🔊 Escuchar la oración"), el("p", { text: "¿Cuál dibujo representa la oración?" }), opts, f.msg);
      };
      ronda();
    },

    // 5. Mi cuaderno de palabras (trazo sobre modelo punteado)
    trazo(box) {
      const palabras = [["FLOR", "a5-flor"], ["SOL", "a5-sol"], ["CASA", "a5-casa"]];
      let i = 0, modelo = true;
      const f = marco(box, "Repasa la palabra con el dedo o el mouse siguiendo los puntos");
      const head = el("div", { class: "game__row" });
      const canvas = el("canvas", { attrs: { width: 1400, height: 520, "aria-label": "Zona para escribir" } });
      const wrap = el("div", { class: "canvas-wrap" }, canvas);
      const ctx = canvas.getContext("2d");
      const dibujarModelo = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = "#e3dcf3"; ctx.lineWidth = 3;
        [130, 390].forEach((y) => { ctx.beginPath(); ctx.moveTo(30, y); ctx.lineTo(1370, y); ctx.stroke(); });
        ctx.setLineDash([12, 12]); ctx.beginPath(); ctx.moveTo(30, 260); ctx.lineTo(1370, 260); ctx.stroke(); ctx.setLineDash([]);
        if (modelo) {
          ctx.font = "700 300px Quicksand, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "alphabetic";
          ctx.setLineDash([4, 16]); ctx.lineCap = "round"; ctx.lineWidth = 10; ctx.strokeStyle = "#b8a6dc";
          ctx.strokeText(palabras[i][0], 700, 390); ctx.setLineDash([]);
        }
      };
      const pintarHead = () => {
        head.innerHTML = "";
        const [w, img] = palabras[i];
        head.append(
          el("img", { class: "big-pic", attrs: { src: IMG(img), alt: w.toLowerCase() }, style: "width:90px;height:90px" }),
          el("span", { class: "tile tile--word", text: w + ": Repasa y escribe." }),
          btnVoz(() => w.toLowerCase() + ". " + w.toLowerCase().split("").join(", "), "🔊 Sonidos")
        );
      };
      let pintando = false, last = null;
      const pos = (e) => { const r = canvas.getBoundingClientRect(); return { x: (e.clientX - r.left) * canvas.width / r.width, y: (e.clientY - r.top) * canvas.height / r.height }; };
      canvas.addEventListener("pointerdown", (e) => { pintando = true; last = pos(e); canvas.setPointerCapture(e.pointerId); });
      canvas.addEventListener("pointermove", (e) => {
        if (!pintando) return; const p = pos(e);
        ctx.strokeStyle = "#512885"; ctx.lineWidth = 16; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.setLineDash([]);
        ctx.beginPath(); ctx.moveTo(last.x, last.y); ctx.lineTo(p.x, p.y); ctx.stroke(); last = p;
      });
      ["pointerup", "pointercancel", "pointerleave"].forEach((ev) => canvas.addEventListener(ev, () => (pintando = false)));
      const tgl = el("button", { class: "btn btn--ghost btn--sm", text: "🙈 Escribir sin mirar el modelo", attrs: { type: "button" } });
      tgl.addEventListener("click", () => { modelo = !modelo; tgl.textContent = modelo ? "🙈 Escribir sin mirar el modelo" : "👀 Ver el modelo"; dibujarModelo(); });
      const ctrls = el("div", { class: "game__row" }, [
        el("button", { class: "btn btn--ghost btn--sm", text: "🧽 Borrar", attrs: { type: "button" }, on: { click: dibujarModelo } }),
        tgl,
        el("button", { class: "btn btn--sm", text: "Siguiente palabra ➜", attrs: { type: "button" }, on: { click: () => {
          f.ok(bien()); i = (i + 1) % palabras.length; pintarHead(); dibujarModelo();
        } } }),
      ]);
      f.g.append(head, wrap, ctrls, f.msg);
      pintarHead();
      (document.fonts ? document.fonts.ready : Promise.resolve()).then(dibujarModelo);
    },

    // 6. Encuentra la letra que falta
    falta(box) {
      const rondas = [
        { e: "☀️", w: "SOL", hueco: 1, op: ["A", "O", "E"] },
        { e: "🏠", w: "CASA", hueco: 2, op: ["S", "M", "T"] },
        { e: "🐟", w: "PEZ", hueco: 2, op: ["R", "Z", "L"] },
        { e: "🐱", w: "GATO", hueco: 2, op: ["T", "P", "M"] },
      ];
      let i = 0;
      const ronda = () => {
        if (i >= rondas.length) return fin(box, "¡Completaste todas las palabras!", () => JUEGOS.falta(box));
        const r = rondas[i];
        const f = marco(box, "¿Qué letra falta?");
        const slots = el("div", { class: "word-slots" }, r.w.split("").map((c, k) => el("span", { class: "slot" + (k === r.hueco ? "" : " is-fill"), text: k === r.hueco ? "" : c })));
        const opts = el("div", { class: "game__row" }, r.op.map((l) => el("button", { class: "tile", text: l, attrs: { type: "button" }, on: { click: (e) => {
          if (l === r.w[r.hueco]) {
            slots.children[r.hueco].textContent = l; slots.children[r.hueco].classList.add("is-fill");
            e.currentTarget.classList.add("is-ok"); f.ok(bien() + " " + r.w); hablar(r.w.toLowerCase());
            $$(".tile", opts).forEach((b) => (b.disabled = true)); i++; setTimeout(ronda, 1600);
          } else { e.currentTarget.classList.add("is-ko"); setTimeout(() => e.currentTarget.classList.remove("is-ko"), 450); f.ko(otraVez); }
        } } })));
        f.g.append(puntos(rondas.length, i), el("div", { class: "big-emoji", text: r.e }), btnVoz(r.w.toLowerCase(), "🔊 Escuchar"), slots, opts, f.msg);
      };
      ronda();
    },

    // 7. Palabras parecidas
    parecidas(box) {
      const pares = [["PALA", "BALA"], ["CASA", "MASA"], ["PATO", "GATO"], ["LATA", "RATA"]];
      let i = 0;
      const ronda = () => {
        if (i >= pares.length) return fin(box, "¡Tienes oído de detective!", () => JUEGOS.parecidas(box));
        const [a, b] = pares[i];
        const dif = a.split("").findIndex((c, k) => c !== b[k]);
        const f = marco(box, "Escucha las dos palabras. ¿Empiezan igual o diferente?");
        const fila1 = el("div", { class: "word-slots" }, a.split("").map((c) => el("span", { class: "slot is-fill", text: c })));
        const fila2 = el("div", { class: "word-slots" });
        const paso2 = () => {
          f.q.textContent = "Ahora toca la letra que cambia en la segunda palabra";
          fila2.innerHTML = "";
          b.split("").forEach((c, k) => fila2.append(el("button", { class: "tile tile--sm", text: c, attrs: { type: "button" }, on: { click: (e) => {
            if (k === dif) { e.currentTarget.classList.add("is-ok"); f.ok(`${bien()} Cambia ${a[k]} por ${b[k]}.`); hablar(`${a.toLowerCase()}, ${b.toLowerCase()}`); i++; setTimeout(ronda, 1800); }
            else { e.currentTarget.classList.add("is-ko"); setTimeout(() => e.currentTarget.classList.remove("is-ko"), 450); f.ko("Esa letra es igual en las dos palabras. Busca otra."); }
          } } })));
        };
        b.split("").forEach((c) => fila2.append(el("span", { class: "slot is-fill", text: c })));
        const resp = el("div", { class: "game__row" }, [["Igual", false], ["Diferente", true]].map(([t, v]) => el("button", { class: "tile tile--word", text: t, attrs: { type: "button" }, on: { click: (e) => {
          if (v) { e.currentTarget.classList.add("is-ok"); f.ok("¡Sí! Empiezan con un sonido diferente."); resp.remove(); paso2(); }
          else { e.currentTarget.classList.add("is-ko"); setTimeout(() => e.currentTarget.classList.remove("is-ko"), 450); f.ko("Escucha otra vez el primer sonido 👂"); }
        } } })));
        f.g.append(puntos(pares.length, i), btnVoz(`${a.toLowerCase()}. ${b.toLowerCase()}`, "🔊 Escuchar las palabras"), fila1, fila2, resp, f.msg);
      };
      ronda();
    },

    // 8. Construyo una oración
    ordenar(box) {
      const correcta = ["El", "niño", "juega", "fútbol."];
      const f = marco(box, "Toca las tarjetas en orden para formar la oración");
      const linea = el("div", { class: "game__row", style: "min-height:72px;padding:10px;border-radius:16px;border:3px dashed #cbb7d9;width:100%" });
      const fichas = el("div", { class: "game__row" });
      const pintar = (orden) => {
        fichas.innerHTML = "";
        orden.forEach((w) => fichas.append(el("button", { class: "tile tile--word", text: w, attrs: { type: "button" }, on: { click: (e) => {
          const b = e.currentTarget; hablar(w.replace(".", ""));
          linea.append(el("button", { class: "tile tile--word is-sel", text: w, attrs: { type: "button", title: "Quitar" }, on: { click: (ev) => { ev.currentTarget.remove(); b.hidden = false; f.clear(); } } }));
          b.hidden = true;
        } } })));
      };
      pintar(["juega", "niño", "El", "fútbol."]);
      const ctrls = el("div", { class: "game__row" }, [
        el("button", { class: "btn", text: "✔ Revisar", attrs: { type: "button" }, on: { click: () => {
          const actual = $$(".tile", linea).map((b) => b.textContent);
          if (actual.length < correcta.length) { f.ko("Faltan tarjetas por ubicar."); return; }
          if (actual.join(" ") === correcta.join(" ")) {
            $$(".tile", linea).forEach((b) => { b.classList.remove("is-sel"); b.classList.add("is-ok"); b.disabled = true; });
            f.ok("¡Muy bien! El niño juega fútbol. Ahora dibuja lo que significa la oración."); hablar("El niño juega fútbol."); confeti();
          } else { f.ko("Lee la oración en voz alta. ¿Tiene sentido? Toca una tarjeta para quitarla."); }
        } } }),
        el("button", { class: "btn btn--ghost", text: "🔁 Empezar de nuevo", attrs: { type: "button" }, on: { click: () => JUEGOS.ordenar(box) } }),
      ]);
      f.g.append(el("div", { class: "big-emoji", text: "🧒⚽" }), linea, fichas, ctrls, f.msg);
    },

    // 9. Leo y dibujo lo que entiendo
    dibujo(box) {
      const consignas = ["Dibuja un sol amarillo.", "Dibuja una casa pequeña.", "Dibuja un árbol verde.", "Dibuja dos flores rojas."];
      let i = 0, color = "#f7c331";
      const f = marco(box, "");
      const instr = el("span", { class: "tile tile--word" });
      const pintarInstr = () => { instr.textContent = `${i + 1}. ${consignas[i]}`; };
      const canvas = el("canvas", { attrs: { width: 1400, height: 520, "aria-label": "Zona para dibujar" } });
      const ctx = canvas.getContext("2d");
      const limpiar = () => { ctx.fillStyle = "#fffef9"; ctx.fillRect(0, 0, canvas.width, canvas.height); };
      let on = false, last = null;
      const pos = (e) => { const r = canvas.getBoundingClientRect(); return { x: (e.clientX - r.left) * canvas.width / r.width, y: (e.clientY - r.top) * canvas.height / r.height }; };
      canvas.addEventListener("pointerdown", (e) => { on = true; last = pos(e); canvas.setPointerCapture(e.pointerId); });
      canvas.addEventListener("pointermove", (e) => { if (!on) return; const p = pos(e); ctx.strokeStyle = color; ctx.lineWidth = 14; ctx.lineCap = "round"; ctx.beginPath(); ctx.moveTo(last.x, last.y); ctx.lineTo(p.x, p.y); ctx.stroke(); last = p; });
      ["pointerup", "pointercancel", "pointerleave"].forEach((ev) => canvas.addEventListener(ev, () => (on = false)));
      const colores = [["#f7c331", "amarillo"], ["#3fbf4f", "verde"], ["#e53b3b", "rojo"], ["#095fb8", "azul"], ["#8b5a2b", "café"], ["#f490b5", "rosado"], ["#222", "negro"]];
      const pal = el("div", { class: "palette" }, colores.map(([c, n], k) => el("button", { class: k === 0 ? "is-sel" : "", style: `background:${c}`, attrs: { type: "button", "aria-label": "Color " + n }, on: { click: (e) => {
        color = c; $$("button", pal).forEach((b) => b.classList.remove("is-sel")); e.currentTarget.classList.add("is-sel"); hablar(n);
      } } })));
      pintarInstr();
      f.q.replaceWith(el("div", { class: "game__row" }, [instr, btnVoz(() => consignas[i], "🔊 Escuchar")]));
      f.g.append(el("div", { class: "canvas-wrap" }, canvas), pal, el("div", { class: "game__row" }, [
        el("button", { class: "btn btn--ghost btn--sm", text: "🧽 Borrar", attrs: { type: "button" }, on: { click: limpiar } }),
        el("button", { class: "btn btn--sm", text: "✔ ¡Terminé!", attrs: { type: "button" }, on: { click: () => { f.ok("¡Qué buen dibujo! Ahora explícalo con tus propias palabras."); confeti(); } } }),
        el("button", { class: "btn btn--sm", text: "Siguiente instrucción ➜", attrs: { type: "button" }, on: { click: () => { i = (i + 1) % consignas.length; pintarInstr(); limpiar(); f.clear(); hablar(consignas[i]); } } }),
      ]), f.msg);
      limpiar();
    },

    // 10. Bingo de palabras
    bingo(box) {
      const P = [["sol", "☀️"], ["casa", "🏠"], ["flor", "🌸"], ["gato", "🐱"], ["pez", "🐟"], ["mesa", null], ["luna", "🌙"], ["árbol", "🌳"], ["pelota", "⚽"]];
      const tablero = shuffle(P);
      let bolsa = shuffle(P.map((p) => p[0])), cantada = null, modo = "ambos";
      const f = marco(box, "El docente saca una tarjeta; busca la palabra o el dibujo en tu tablero");
      const call = el("div", { class: "call", attrs: { "aria-live": "polite" }, text: "¿?" });
      const board = el("div", { class: "bingo" });
      const marcadas = new Set();
      const lineas = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
      const pintar = () => {
        board.innerHTML = "";
        tablero.forEach(([w, e], k) => {
          const pic = e ? el("em", { text: e }) : el("img", { attrs: { src: IMG("a3-mesa"), alt: "" }, style: "width:44px;height:44px;object-fit:contain" });
          const kids = modo === "imagen" ? [pic] : modo === "palabra" ? [el("span", { text: w, style: "font-size:22px" })] : [pic, el("span", { text: w })];
          const b = el("button", { class: "tile" + (marcadas.has(k) ? " is-ok" : ""), attrs: { type: "button", "aria-label": w }, on: { click: () => {
            if (marcadas.has(k)) return;
            if (w === cantada) {
              marcadas.add(k); b.classList.add("is-ok"); f.ok(bien()); cantada = null;
              if (lineas.some((l) => l.every((x) => marcadas.has(x)))) { f.ok("¡BINGO! 🎉 Celebramos el esfuerzo y la participación de todos."); confeti(); hablar("¡Bingo!"); }
            } else { b.classList.add("is-ko"); setTimeout(() => b.classList.remove("is-ko"), 450); f.ko(cantada ? "Esa no es. Escucha otra vez." : "Primero saca una tarjeta."); }
          } } }, kids);
          board.append(b);
        });
      };
      const sacar = () => {
        if (!bolsa.length) { f.ok("Ya salieron todas las tarjetas. ¡Gracias por jugar!"); return; }
        cantada = bolsa.pop(); call.textContent = modo === "imagen" ? "🔊" : cantada; hablar(cantada); f.clear();
      };
      const modos = el("div", { class: "game__row" }, [["ambos", "Imagen y palabra"], ["imagen", "1.º Solo imagen"], ["palabra", "2.º Solo palabra"]].map(([m, t]) =>
        el("button", { class: "btn btn--sm" + (m === "ambos" ? "" : " btn--ghost"), text: t, attrs: { type: "button" }, on: { click: (e) => {
          modo = m; botonesModo.forEach((b) => b.classList.add("btn--ghost")); e.currentTarget.classList.remove("btn--ghost"); pintar();
          if (cantada) call.textContent = modo === "imagen" ? "🔊" : cantada;
        } } })));
      const botonesModo = Array.from(modos.children);
      f.g.append(el("div", { class: "game__row" }, [
        ...modos.childNodes,
        el("button", { class: "btn", text: "🎴 Sacar tarjeta", attrs: { type: "button" }, on: { click: sacar } }),
        btnVoz(() => cantada || "Saca una tarjeta", "🔊 Repetir"),
        el("button", { class: "btn btn--ghost", text: "🔁 Nuevo tablero", attrs: { type: "button" }, on: { click: () => JUEGOS.bingo(box) } }),
      ]), call, board, f.msg);
      pintar();
    },

    // 11 y 12. Estaciones de clasificación
    estaciones(box, cfg) {
      const f = marco(box, cfg.pregunta);
      let sel = null, hechos = 0;
      const tarjetas = el("div", { class: "game__row" }, shuffle(cfg.palabras).map(([w, e, grupo]) => el("button", { class: "tile tile--img", attrs: { type: "button", "data-g": grupo, "data-w": w }, on: { click: (ev) => {
        const b = ev.currentTarget; if (b.disabled) return;
        $$(".tile", tarjetas).forEach((x) => x.classList.remove("is-sel")); b.classList.add("is-sel"); sel = b; hablar(w);
      } } }, [el("em", { text: e, style: "font-style:normal;font-size:44px" }), w])));
      const st = cfg.grupos.map(([g, t], k) => {
        const zona = el("div", { class: "game__row" });
        const s = el("div", { class: "station " + (k ? "station--b" : "station--a"), attrs: { role: "button", tabindex: "0", "aria-label": "Estación " + t } }, [el("h4", { text: t }), zona]);
        const soltar = () => {
          if (!sel) { f.ko("Primero toca una tarjeta 👆"); return; }
          if (sel.dataset.g === g) {
            sel.classList.remove("is-sel"); sel.classList.add("is-ok"); sel.disabled = true; zona.append(sel); f.ok(`${bien()} “${sel.dataset.w}” se escribe con ${t}.`); sel = null; hechos++;
            if (hechos === cfg.palabras.length) setTimeout(() => fin(box, cfg.final, () => JUEGOS.estaciones(box, cfg)), 1300);
          } else { s.classList.add("tile", "is-ko"); setTimeout(() => s.classList.remove("tile", "is-ko"), 450); f.ko(cfg.pista); }
        };
        s.addEventListener("click", soltar);
        s.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); soltar(); } });
        return s;
      });
      f.g.append(tarjetas, el("div", { class: "stations" }, st), f.msg);
    },
    bd(box) {
      JUEGOS.estaciones(box, {
        pregunta: "Toca una tarjeta, escucha su primer sonido y llévala a su estación",
        palabras: [["barco", "⛵", "b"], ["balón", "⚽", "b"], ["dado", "🎲", "d"], ["dona", "🍩", "d"]],
        grupos: [["b", "b"], ["d", "d"]],
        pista: "Escucha otra vez: ¿qué sonido escuchas al empezar?",
        final: "¡Clasificaste todas las palabras con b y con d!",
      });
    },
    pq(box) {
      JUEGOS.estaciones(box, {
        pregunta: "Toca una tarjeta y llévala a la estación de p o de qu",
        palabras: [["pato", "🦆", "p"], ["pelota", "⚽", "p"], ["queso", "🧀", "qu"], ["quince", "1️⃣5️⃣", "qu"]],
        grupos: [["p", "p → /p/"], ["qu", "qu → /k/"]],
        pista: "Recuerda: qu se usa para el sonido /k/ delante de e o i.",
        final: "¡Muy bien! Ya sabes cuándo usar p y qu.",
      });
    },

    // 13. Detectives de oraciones
    detectives(box) {
      const rondas = [
        { e: "🎲", ok: "El dado es rojo.", mal: "El bado es rojo.", exp: "Se escribe “dado”: empieza con el sonido /d/." },
        { e: "🍲", ok: "Pepe come sopa.", mal: "Peqe come soqa.", exp: "Se escribe “Pepe” y “sopa”: llevan el sonido /p/." },
      ];
      let i = 0;
      const ronda = () => {
        if (i >= rondas.length) return fin(box, "¡Eres detective de oraciones bien escritas!", () => JUEGOS.detectives(box));
        const r = rondas[i];
        const f = marco(box, "¿Cuál de las dos oraciones está bien escrita?");
        const opts = el("div", { class: "game__row", style: "flex-direction:column" }, shuffle([r.ok, r.mal]).map((t) => el("button", { class: "tile tile--word", text: t, attrs: { type: "button" }, on: { click: (e) => {
          if (t === r.ok) { e.currentTarget.classList.add("is-ok"); f.ok(`${bien()} ${r.exp}`); hablar(r.ok); $$(".tile", opts).forEach((b) => (b.disabled = true)); i++; setTimeout(ronda, 2600); }
          else { e.currentTarget.classList.add("is-ko"); setTimeout(() => e.currentTarget.classList.remove("is-ko"), 450); f.ko("Sigue cada palabra con el dedo y escucha sus sonidos."); }
        } } })));
        f.g.append(puntos(rondas.length, i), el("div", { class: "big-emoji", text: r.e }), btnVoz(r.ok, "🔊 Escuchar la oración"), opts, f.msg);
      };
      ronda();
    },

    // 14. Mi cuadrícula de instrucciones
    cuadricula(box) {
      const consignas = [
        { t: "Coloca el sol arriba a la derecha.", e: "☀️", c: 2 },
        { t: "La estrella va en el centro.", e: "⭐", c: 4 },
        { t: "El libro va abajo a la izquierda.", e: "📘", c: 6 },
      ];
      let i = 0;
      const f = marco(box, "");
      const instr = el("span", { class: "tile tile--word" });
      const ficha = el("div", { class: "big-emoji", style: "font-size:46px" });
      const grid = el("div", { class: "grid3" }, Array.from({ length: 9 }, (_, k) => el("button", { attrs: { type: "button", "aria-label": "Casilla " + (k + 1) }, on: { click: (e) => {
        const b = e.currentTarget; if (i >= consignas.length || b.textContent) return;
        const c = consignas[i];
        if (k === c.c) {
          b.textContent = c.e; b.classList.add("is-ok"); f.ok(bien()); i++;
          if (i < consignas.length) setTimeout(pintar, 900);
          else setTimeout(() => { f.ok("¡Ubicaste todo! Ahora cuenta el recorrido con tus palabras."); instr.textContent = "¡Terminaste!"; ficha.textContent = "🎉"; confeti(); }, 600);
        } else { b.classList.add("is-ko"); setTimeout(() => b.classList.remove("is-ko"), 450); f.ko("Revisa: ¿arriba o abajo? ¿derecha o izquierda?"); }
      } } })));
      const pintar = () => { const c = consignas[i]; instr.textContent = c.t; ficha.textContent = c.e; f.clear(); hablar(c.t); };
      f.q.replaceWith(el("div", { class: "game__row", style: "align-items:center" }, [ficha, instr, btnVoz(() => (consignas[i] || consignas[0]).t, "🔊 Escuchar")]));
      f.g.append(grid, el("button", { class: "btn btn--ghost btn--sm", text: "🔁 Empezar de nuevo", attrs: { type: "button" }, on: { click: () => JUEGOS.cuadricula(box) } }), f.msg);
      const c0 = consignas[0]; instr.textContent = c0.t; ficha.textContent = c0.e;
    },

    // 15. La ruta lectora
    ruta(box) {
      const paradas = [["INICIO", 6, 75], ["SOL", 24, 30], ["LUNA", 42, 75], ["FLOR", 60, 30], ["TREN", 78, 75], ["META", 94, 30]];
      let i = 0;
      const f = marco(box, "Lee la palabra de cada parada para avanzar. ¡No necesitamos correr!");
      const route = el("div", { class: "route" });
      route.innerHTML = '<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path d="M6 75 C15 75 15 30 24 30 S33 75 42 75 51 30 60 30 69 75 78 75 87 30 94 30" vector-effect="non-scaling-stroke"/></svg>';
      const stops = paradas.map(([w, x, y], k) => {
        const s = el("span", { class: "stop" + (k === 0 || k === paradas.length - 1 ? " stop--end" : ""), text: w, style: `left:${x}%;top:${y}%` });
        route.append(s); return s;
      });
      const token = el("span", { class: "token", text: "🐞" });
      route.append(token);
      const palabra = el("div", { class: "call" });
      const avanzar = el("button", { class: "btn", text: "✔ ¡La leí! Avanzar", attrs: { type: "button" } });
      const mover = () => {
        const [, x, y] = paradas[i];
        token.style.left = x + "%"; token.style.top = y + "%";
        stops.forEach((s, k) => { s.classList.toggle("is-ok", k < i && k > 0); s.classList.toggle("is-cur", k === i && k > 0 && k < paradas.length - 1); });
        if (i === 0) { palabra.textContent = "¡A empezar!"; avanzar.textContent = "▶ Salir del inicio"; }
        else if (i < paradas.length - 1) { palabra.textContent = paradas[i][0].toLowerCase(); avanzar.textContent = "✔ ¡La leí! Avanzar"; }
        else { palabra.textContent = "¡META!"; avanzar.hidden = true; f.ok("¡Llegaste! Elige dos palabras y di una oración sencilla con cada una."); confeti(); }
      };
      avanzar.addEventListener("click", () => { if (i < paradas.length - 1) { i++; mover(); if (i < paradas.length - 1) f.ok(bien()); } });
      f.g.append(route, palabra, el("div", { class: "game__row" }, [
        btnVoz(() => (i > 0 && i < paradas.length - 1 ? paradas[i][0].toLowerCase().split("").join(", ") + ". " + paradas[i][0].toLowerCase() : "Ruta lectora"), "🔊 Sonido por sonido"),
        avanzar,
        el("button", { class: "btn btn--ghost", text: "🔁 Reiniciar", attrs: { type: "button" }, on: { click: () => JUEGOS.ruta(box) } }),
      ]), f.msg);
      mover();
    },
  };

  // =======================================================================
  //  CONSTRUCCIÓN DE DIAPOSITIVAS DE ACTIVIDADES
  // =======================================================================
  function extraNodo(x) {
    const box = el("div");
    box.append(el("p", { class: "label", text: x.titulo }));
    if (x.intro) box.append(el("p", { text: x.intro }));
    if (x.tipo === "imagenes") {
      box.append(el("div", { class: "game__row" }, x.items.map(([img, cap]) =>
        el("figure", { class: "tile tile--img", style: "margin:0;cursor:default" }, [el("img", { attrs: { src: IMG(img), alt: "" } }), el("figcaption", { text: cap })]))));
    } else if (x.tipo === "tabla") {
      const t = el("table", { class: "ev-table" });
      t.append(el("thead", {}, el("tr", {}, x.cab.map((c) => el("th", { text: c, attrs: { scope: "col" } })))));
      t.append(el("tbody", {}, x.filas.map((f) => el("tr", {}, f.map((c) => el("td", { text: c }))))));
      box.append(t);
    } else if (x.tipo === "lista") {
      box.append(x.chips ? el("div", { class: "mat" }, x.items.map((i) => el("span", { text: i }))) : el("ul", {}, x.items.map((i) => el("li", { text: i }))));
    } else if (x.tipo === "texto") {
      box.append(el("p", { class: "tip", text: x.texto }));
    }
    if (x.nota) box.append(el("p", { class: "callout", text: x.nota }));
    return box;
  }

  function crearActividad(a, n) {
    const id = "actividad-" + n;
    const s = el("section", { class: "slide s-std s-tpl s-act", attrs: { "data-id": id, "data-title": `Actividad ${n}. ${a.titulo}`, "data-section": "Estrategias didácticas" } });
    s.innerHTML = '<svg class="deco scribble" style="left:20px;top:330px;width:300px;height:330px"><use href="#sym-scribble" /></svg>';

    const head = el("div", { class: "blk ac-head an an-down", style: "left:330px;top:70px;width:860px" }, [
      el("span", { class: "chip chip--pink", text: "Actividad " + n }),
      el("span", { class: "chip", text: a.grados }),
    ]);
    const titulo = el("h2", { class: "blk tpl-title an an-down", text: a.titulo, style: "left:330px;top:104px;width:880px;--d:.1s" });

    const lado = el("div", { class: "blk ac-side an an-left", style: "left:40px;top:180px;width:270px;--d:.2s" }, [
      el("figure", { class: "tpl-photo", style: "position:relative" }, el("img", { attrs: { src: IMG(a.img), alt: "Ilustración de la actividad " + a.titulo, loading: "lazy" } })),
      el("button", { class: "btn btn--speak", text: "🔊 Escuchar la actividad", attrs: { type: "button" }, on: { click: () => hablar(`Actividad ${n}. ${a.titulo}. Objetivo: ${a.objetivo} Desarrollo: ${a.pasos.join(" ")}`) } }),
      el("button", { class: "btn btn--ghost", text: "🎮 Ir al juego", attrs: { type: "button" }, on: { click: () => abrirTab("jugar") } }),
    ]);

    // Pestañas
    const tabs = [
      ["obj", "🎯 Objetivo"],
      ["des", "🪜 Desarrollo"],
      ["ext", a.extra.tab],
      ["gra", "🎓 Por grado"],
      ["eva", "✅ Evaluación"],
      ["jugar", "🎮 ¡A jugar!"],
    ];
    const tabBar = el("div", { class: "tabs", attrs: { role: "tablist", "aria-label": "Secciones de la actividad" } });
    const panels = {};
    const box = el("div", { class: "blk tpl-box ac-box an an-up", style: "left:330px;top:180px;width:890px;height:470px;--d:.3s" }, tabBar);

    const crearPanel = (key) => {
      const p = el("div", { class: "panel", attrs: { role: "tabpanel", id: `${id}-${key}`, "aria-labelledby": `${id}-t-${key}` } });
      if (key === "obj") {
        p.append(el("p", { class: "label", text: "Objetivo" }), el("p", { text: a.objetivo }), el("p", { class: "label", text: "Materiales" }), el("div", { class: "mat" }, a.materiales.map((m) => el("span", { text: m }))));
      } else if (key === "des") {
        p.append(el("p", { class: "label", text: "Desarrollo" }), el("p", { class: "tpl-hint", style: "text-align:left;margin-bottom:8px", text: "👆 Toca cada paso para marcarlo como realizado." }),
          el("ol", { class: "steps" }, a.pasos.map((t) => el("li", { text: t, attrs: { tabindex: "0" }, on: { click: (e) => e.currentTarget.classList.toggle("is-done"), keydown: (e) => { if (e.key === "Enter") e.currentTarget.classList.toggle("is-done"); } } }))));
      } else if (key === "ext") {
        p.append(extraNodo(a.extra));
      } else if (key === "gra") {
        p.append(el("p", { class: "label", text: "Adaptación por grado" }));
        if (a.grado) p.append(el("div", { class: "grade" }, a.grado.map((t, k) => el("div", {}, [el("b", { text: `${k + 1}.º` }), t]))));
        else p.append(el("p", { class: "tip", text: a.gradoNota }));
      } else if (key === "eva") {
        p.append(el("p", { class: "label", text: "Evaluación" }), el("p", { text: a.evaluacion }),
          el("p", { class: "callout", text: "Usa el semáforo del aprendizaje y el instrumento de evaluación al final de las actividades para registrar los avances." }));
      } else if (key === "jugar") {
        p.dataset.juego = a.juego;
      }
      return p;
    };

    function abrirTab(key) {
      Object.entries(panels).forEach(([k, p]) => { p.hidden = k !== key; });
      $$(".tab", tabBar).forEach((t) => t.setAttribute("aria-selected", String(t.dataset.k === key)));
      if (key === "jugar" && !panels.jugar.dataset.listo) { panels.jugar.dataset.listo = "1"; JUEGOS[a.juego](panels.jugar); }
    }

    tabs.forEach(([k, t]) => {
      const b = el("button", { class: "tab" + (k === "jugar" ? " tab--play" : ""), text: t, attrs: { type: "button", role: "tab", id: `${id}-t-${k}`, "aria-controls": `${id}-${k}`, "aria-selected": "false", "data-k": k } });
      b.addEventListener("click", () => abrirTab(k));
      tabBar.append(b);
      panels[k] = crearPanel(k);
      box.append(panels[k]);
    });
    abrirTab("obj");

    s.append(head, titulo, lado, box);
    return s;
  }

  // =======================================================================
  //  PREPARACIÓN DEL DOCUMENTO
  // =======================================================================
  const stage = $("#stage");
  const ancla = $('.slide[data-id="semaforo"]');
  ACTIVIDADES.forEach((a, k) => stage.insertBefore(crearActividad(a, k + 1), ancla));

  const SLIDES = $$(".slide", stage);
  const indexById = {};
  SLIDES.forEach((s, i) => (indexById[s.dataset.id] = i));

  // Elementos comunes de Canva: barra superior, insignia, barra inferior y número.
  const LETRAS = [["T", 22, 70, -20, "#f2a7b6"], ["O", 14, 120, 0, "#a6c8ea"], ["W", 40, 160, 15, "#9fd3a4"], ["Y", 85, 190, -10, "#c9b6e4"], ["S", 120, 196, 10, "#f6c7a2"], ["C", 165, 168, -25, "#a6c8ea"], ["W", 195, 130, 30, "#f2a7b6"], ["G", 205, 85, 0, "#9fd3a4"], ["Q", 30, 30, 10, "#f6c7a2"]];
  SLIDES.forEach((s, i) => {
    if (!s.classList.contains("s-std")) return;
    const top = el("div", { class: "chrome-top", attrs: { "aria-hidden": "true" } }, [
      el("span", { text: "Conexiones de aprendizaje" }),
      s.dataset.section ? el("span", { class: "sec-chip", text: s.dataset.section }) : null,
      el("span", { class: "logo-dislexia", html: "D<i>ı</i>S<b>L</b><b>E</b>X<i>ı</i>A" }),
    ]);
    const ins = el("div", { class: "insignia", attrs: { "aria-hidden": "true" } }, [
      el("div", { class: "insignia__ring" }, LETRAS.map(([l, x, y, r, c]) => el("span", { text: l, style: `left:${x}px;top:${y}px;transform:rotate(${r}deg);color:${c}` }))),
      el("div", { class: "insignia__brain" }, el("img", { attrs: { src: "assets/canva/cerebro-grande.png", alt: "" } })),
    ]);
    const bot = el("div", { class: "chrome-bottom" }, el("span", { class: "pg", text: String(i + 1) }));
    // Diapositivas nuevas: misma plantilla de Canva (mancha rosada y garabato lila).
    if (s.classList.contains("s-tpl")) {
      const deco = document.createElement("div");
      deco.innerHTML = '<svg class="deco blob-tl"><use href="#sym-blob" /></svg>' +
        ($(".scribble", s) ? "" : '<svg class="deco scribble" style="left:20px;top:330px;width:300px;height:330px"><use href="#sym-scribble" /></svg>');
      s.prepend(...deco.childNodes);
    }
    s.prepend(top);
    s.append(ins, bot);
  });

  // Tablero de actividades (diapositiva 14)
  const board = $("#board");
  ACTIVIDADES.forEach((a, k) => board.append(el("button", { class: "board__card", attrs: { type: "button", "data-goto": "actividad-" + (k + 1) } }, [
    el("img", { attrs: { src: IMG(a.img), alt: "", loading: "lazy" } }), el("b", { text: String(k + 1) }), el("span", { text: a.titulo }),
  ])));
  [["🚦", "Semáforo del aprendizaje", "semaforo"], ["💜", "Recomendaciones", "recomendaciones"], ["📋", "Instrumento de evaluación", "evaluacion"], ["🌈", "Cierre", "cierre"], ["📚", "Referencias", "referencias"]].forEach(([e, t, id]) =>
    board.append(el("button", { class: "board__card is-extra", attrs: { type: "button", "data-goto": id } }, [e, el("span", { text: t })])));

  // =======================================================================
  //  INTERACCIONES DE LAS DIAPOSITIVAS DE CANVA
  // =======================================================================
  // Mito → realidad
  $$('.mr-panel--mito .mr-pill').forEach((b) => b.addEventListener("click", () => {
    const n = b.dataset.mr;
    b.classList.add("is-done");
    const real = $(`.mr-panel--real .mr-pill[data-mr="${n}"]`);
    $$(".mr-panel--real .mr-pill").forEach((x) => x.classList.remove("is-on"));
    void real.offsetWidth;
    real.classList.add("is-on");
    toast("Realidad: " + real.textContent.replace(/^\d+/, "").trim());
    if ($$('.mr-panel--mito .mr-pill.is-done').length === 4) confeti();
  }));

  // Tipos de dislexia
  $$(".tp-row").forEach((r) => r.addEventListener("click", () => {
    $$(".tp-row").forEach((x) => x !== r && x.classList.remove("is-on"));
    r.classList.toggle("is-on");
    if (r.classList.contains("is-on")) hablar(r.textContent.replace(/\d+/, "").trim());
  }));

  // Prevalencia: calculadora para el aula
  let pvN = 30;
  const pvPintar = () => {
    const r = Math.round(pvN * 0.07);
    $("#pvTotal").textContent = pvN;
    $("#pvRes").textContent = r;
    $("#pvLabel").textContent = r === 1 ? "infante" : "infantes";
  };
  $$("[data-pv]").forEach((b) => b.addEventListener("click", () => { pvN = Math.min(60, Math.max(5, pvN + Number(b.dataset.pv))); pvPintar(); }));

  // Factores
  $$(".fc-list li").forEach((li) => li.addEventListener("click", () => { li.classList.remove("is-on"); void li.offsetWidth; li.classList.add("is-on"); }));

  // Impacto
  const imSel = (n) => {
    $$(".im-row, .im-seg").forEach((x) => x.classList.toggle("is-on", x.dataset.im === n));
  };
  $$(".im-seg").forEach((s) => s.addEventListener("click", () => imSel(s.dataset.im)));
  $$(".im-row").forEach((r) => r.addEventListener("click", () => imSel(r.dataset.im)));

  // Enfoque interdisciplinario
  const efSel = (n) => $$(".ef-seg, .ef-list li").forEach((x) => x.classList.toggle("is-on", x.dataset.ef === n));
  $$(".ef-seg, .ef-list li").forEach((x) => {
    x.addEventListener("click", () => efSel(x.dataset.ef));
    x.addEventListener("mouseenter", () => efSel(x.dataset.ef));
  });

  // Tarjetas que giran / se abren
  $$(".flip, .rec").forEach((c) => c.addEventListener("click", () => c.classList.toggle("is-on")));

  // Semáforo
  const SEM = {
    v: "🟢 ¡Entendí y puedo intentarlo solo!",
    a: "🟡 Necesito un poco de ayuda.",
    r: "🔴 Todavía me cuesta y necesito que me expliquen de otra manera.",
  };
  $$(".sem__b").forEach((b) => b.addEventListener("click", () => {
    $$(".sem__b").forEach((x) => x.classList.toggle("is-on", x === b));
    $("#semMsg").textContent = SEM[b.dataset.sem];
    hablar(SEM[b.dataset.sem].slice(3));
  }));

  // Instrumento de evaluación
  const HABILIDADES = [
    "Reconoce algunas letras y sus sonidos.",
    "Relaciona imágenes con palabras.",
    "Identifica y une sílabas.",
    "Comprende palabras y oraciones breves.",
    "Copia o escribe palabras con apoyo.",
    "Sigue instrucciones sencillas.",
    "Participa y pide ayuda cuando la necesita.",
  ];
  const NIVELES = ["Lo realiza con apoyo", "Está en proceso", "Lo realiza con mayor autonomía"];
  const tbody = $("#evTable tbody");
  HABILIDADES.forEach((h, i) => {
    tbody.append(el("tr", {}, [el("td", { text: `${i + 1}. ${h}` }), ...NIVELES.map((n, k) => el("td", {}, el("input", { attrs: { type: "radio", name: "ev" + i, value: String(k), "aria-label": `${h} — ${n}` } })))]));
  });
  const EV_KEY = "cartilla-dislexia-evaluacion";
  const guardarEv = () => {
    const data = { nombre: $("#evNombre").value, fecha: $("#evFecha").value, r: HABILIDADES.map((_, i) => { const x = $(`input[name="ev${i}"]:checked`); return x ? x.value : null; }) };
    try { localStorage.setItem(EV_KEY, JSON.stringify(data)); } catch (e) { /* almacenamiento no disponible */ }
  };
  try {
    const d = JSON.parse(localStorage.getItem(EV_KEY) || "null");
    if (d) {
      $("#evNombre").value = d.nombre || ""; $("#evFecha").value = d.fecha || "";
      (d.r || []).forEach((v, i) => { if (v != null) { const x = $(`input[name="ev${i}"][value="${v}"]`); if (x) x.checked = true; } });
    }
  } catch (e) { /* sin datos guardados */ }
  $("#evTable").addEventListener("change", guardarEv);
  $("#evNombre").addEventListener("input", guardarEv);
  $("#evFecha").addEventListener("change", guardarEv);
  $("#evCopy").addEventListener("click", async () => {
    const lineas = ["REGISTRO DE EVALUACIÓN — Cartilla Conexiones de aprendizaje", `Estudiante: ${$("#evNombre").value || "________"}`, `Fecha: ${$("#evFecha").value || "________"}`, ""];
    HABILIDADES.forEach((h, i) => { const x = $(`input[name="ev${i}"]:checked`); lineas.push(`${i + 1}. ${h} → ${x ? NIVELES[x.value] : "Sin registrar"}`); });
    const texto = lineas.join("\n");
    let ok = false;
    try { await navigator.clipboard.writeText(texto); ok = true; } catch (e) {
      const ta = el("textarea", { text: texto, style: "position:fixed;opacity:0" }); document.body.append(ta); ta.select();
      try { ok = document.execCommand("copy"); } catch (e2) { ok = false; } ta.remove();
    }
    $("#evStatus").textContent = ok ? "✔ Registro copiado" : "No se pudo copiar";
    setTimeout(() => ($("#evStatus").textContent = ""), 2500);
  });
  $("#evPrint").addEventListener("click", () => window.print());
  $("#evClear").addEventListener("click", () => {
    $$("#evTable input").forEach((x) => (x.checked = false)); $("#evNombre").value = ""; $("#evFecha").value = ""; guardarEv(); $("#evStatus").textContent = "Registro limpio";
  });

  $("#btnConfeti").addEventListener("click", () => { confeti(); hablar("¡Cada niño aprende a su ritmo!"); });

  // =======================================================================
  //  MODAL (reutilizado de la versión anterior)
  // =======================================================================
  const modal = $("#modal");
  let lastFocus = null;
  function abrirModal(titulo, contenidoNode) {
    lastFocus = document.activeElement;
    $("#modalTitle").textContent = titulo;
    const body = $("#modalBody");
    body.innerHTML = "";
    body.appendChild(contenidoNode);
    modal.hidden = false;
    $(".modal__close", modal).focus();
  }
  function cerrarModal() {
    modal.hidden = true;
    if (lastFocus) lastFocus.focus();
  }
  modal.addEventListener("click", (e) => { if (e.target.hasAttribute("data-close-modal")) cerrarModal(); });

  function abrirIndice() {
    const grid = el("div", { class: "menu-grid" });
    const secciones = [[0, "Primera parte"], [indexById.estrategias, "Estrategias didácticas"], [indexById.referencias, "Referencias"]];
    SLIDES.forEach((s, i) => {
      const sec = secciones.find(([k]) => k === i);
      if (sec) grid.append(el("h3", { class: "menu-sec", text: sec[1] }));
      grid.append(el("button", { class: i === current ? "is-cur" : "", attrs: { type: "button" }, on: { click: () => { cerrarModal(); ir(i); } } }, [el("i", { text: String(i + 1) }), s.dataset.title]));
    });
    abrirModal("Índice de la cartilla", grid);
  }

  // =======================================================================
  //  NAVEGACIÓN
  // =======================================================================
  let current = -1;
  function ir(i) {
    i = Math.max(0, Math.min(i, SLIDES.length - 1));
    if (i === current) return;
    if (synth) synth.cancel();
    SLIDES.forEach((s, k) => {
      s.classList.toggle("is-active", k === i);
      s.classList.toggle("is-prev", k < i);
      s.setAttribute("aria-hidden", String(k !== i));
      if ("inert" in s) s.inert = k !== i;
    });
    current = i;
    const s = SLIDES[i];
    $("#pagerCount").textContent = `${i + 1} / ${SLIDES.length}`;
    $("#progressBar").style.width = ((i + 1) / SLIDES.length) * 100 + "%";
    $$('[data-nav="prev"]').forEach((b) => (b.disabled = i === 0));
    $$('[data-nav="next"]').forEach((b) => (b.disabled = i === SLIDES.length - 1));
    document.title = `${s.dataset.title} · Conexiones de aprendizaje`;
    history.replaceState(null, "", "#" + s.dataset.id);
    if (document.body.classList.contains("flow")) window.scrollTo({ top: 0 });
    $$(".tpl-scroll, .panel, .rf-box", s).forEach((x) => (x.scrollTop = 0));
    if (s.dataset.id === "prevalencia") contar();
  }

  function contar() {
    const n = $(".pv-count");
    let v = 0;
    const t = setInterval(() => { v++; n.textContent = v; if (v >= 7) clearInterval(t); }, 120);
  }

  function navegar(accion) {
    switch (accion) {
      case "prev": ir(current - 1); break;
      case "next": ir(current + 1); break;
      case "menu": abrirIndice(); break;
      case "full":
        if (!document.fullscreenElement && document.documentElement.requestFullscreen) document.documentElement.requestFullscreen().catch(() => {});
        else if (document.exitFullscreen) document.exitFullscreen().catch(() => {});
        break;
    }
  }

  document.addEventListener("click", (e) => {
    const nav = e.target.closest("[data-nav]");
    if (nav) { e.preventDefault(); navegar(nav.dataset.nav); return; }
    const go = e.target.closest("[data-goto]");
    if (go && go.dataset.goto in indexById) { e.preventDefault(); ir(indexById[go.dataset.goto]); }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hidden) { cerrarModal(); return; }
    if (!modal.hidden) return;
    const tag = (document.activeElement.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select") return;
    if (e.key === "ArrowRight" || e.key === "PageDown") { e.preventDefault(); navegar("next"); }
    if (e.key === "ArrowLeft" || e.key === "PageUp") { e.preventDefault(); navegar("prev"); }
    if (e.key === "Home") ir(0);
    if (e.key === "End") ir(SLIDES.length - 1);
  });

  // Gestos de deslizamiento en pantallas táctiles (fuera de juegos y lienzos).
  let tx = null, ty = null;
  document.addEventListener("touchstart", (e) => {
    if (e.target.closest("canvas, .game, .tabs, .tpl-scroll, input")) { tx = null; return; }
    tx = e.touches[0].clientX; ty = e.touches[0].clientY;
  }, { passive: true });
  document.addEventListener("touchend", (e) => {
    if (tx == null) return;
    const dx = e.changedTouches[0].clientX - tx, dy = e.changedTouches[0].clientY - ty;
    if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) * 1.5) navegar(dx < 0 ? "next" : "prev");
    tx = null;
  }, { passive: true });

  // =======================================================================
  //  ESCALADO DEL LIENZO 1280 × 720
  // =======================================================================
  function ajustar() {
    const w = window.innerWidth, h = window.innerHeight;
    const flow = w < 800 || (w < 1000 && h > w);
    document.body.classList.toggle("flow", flow);
    if (!flow) {
      const vp = $("#app").getBoundingClientRect();
      const k = Math.min((vp.width - 16) / 1280, (vp.height - 16) / 720);
      stage.style.setProperty("--k", Math.max(0.2, k).toFixed(4));
    }
  }
  window.addEventListener("resize", ajustar);
  window.addEventListener("orientationchange", ajustar);
  ajustar();

  window.addEventListener("hashchange", () => {
    const id = decodeURIComponent(location.hash.slice(1));
    if (id in indexById) ir(indexById[id]);
  });

  const inicial = decodeURIComponent(location.hash.slice(1));
  ir(inicial in indexById ? indexById[inicial] : 0);
})();
