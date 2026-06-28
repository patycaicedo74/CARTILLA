/* =====================================================================
   CARTILLA DIGITAL INTERACTIVA — motor de la aplicación
   ---------------------------------------------------------------------
   - Carga el contenido desde data/contenido.json
   - Renderiza una "página" a la vez (modelo cartilla)
   - Navegación: Inicio · Índice · Anterior · Siguiente (+ teclado y hash)
   - Interacciones: índice, modal de reflexión, semáforo de la calma,
     glosario desplegable, tarjetas, paneles de actividad e imprimir.
   Todo está comentado para que sea fácil de editar.
   ===================================================================== */

(() => {
  "use strict";

  // ----- Estado global -----------------------------------------------------
  let DATA = null;          // contenido.json completo
  let PAGES = [];           // arreglo de páginas
  let indexById = {};       // id de página -> posición
  let current = 0;          // página visible

  // ----- Utilidades --------------------------------------------------------
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const app = $("#app");

  /** Crea un elemento con clase, atributos e hijos de forma compacta. */
  function el(tag, opts = {}, children = []) {
    const node = document.createElement(tag);
    if (opts.class) node.className = opts.class;
    if (opts.text != null) node.textContent = opts.text;
    if (opts.html != null) node.innerHTML = opts.html;
    if (opts.attrs) for (const [k, v] of Object.entries(opts.attrs)) node.setAttribute(k, v);
    for (const c of [].concat(children)) if (c) node.appendChild(c);
    return node;
  }

  /** Quita acentos y deja un slug simple (para clases CSS de etiquetas). */
  const slug = (s) => (s || "").toString().toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-");

  // =======================================================================
  //  RENDER DE BLOQUES DE CONTENIDO (páginas estándar)
  // =======================================================================
  function renderBloque(b) {
    switch (b.t) {
      case "p":
        return el("p", { class: "texto", text: b.texto });

      case "h":
        return el("h3", { class: "subtitulo", text: b.texto });

      case "lista": {
        const ul = el("ul", { class: "lista" });
        b.items.forEach((it) => ul.appendChild(el("li", { text: it })));
        return ul;
      }

      case "chips": {
        const ul = el("ul", { class: "chips" });
        b.items.forEach((it) => ul.appendChild(el("li", { class: "chip", text: it })));
        return ul;
      }

      case "callout": {
        const box = el("div", { class: "callout" });
        if (b.etiqueta) box.appendChild(el("span", { class: "callout__tag", text: b.etiqueta }));
        box.appendChild(el("p", { class: "callout__text", text: b.texto }));
        return box;
      }

      case "tarjetas": {
        const grid = el("div", { class: "cards" });
        b.items.forEach((it) => {
          const card = el("button", {
            class: "card",
            attrs: { type: "button", "aria-expanded": "false" }
          }, [
            el("h4", { class: "card__title", text: it.titulo }),
            el("p", { class: "card__text", text: it.texto })
          ]);
          // Al hacer clic, la tarjeta se resalta y despliega.
          card.addEventListener("click", () => {
            const open = card.classList.toggle("card--activa");
            card.setAttribute("aria-expanded", String(open));
          });
          grid.appendChild(card);
        });
        return grid;
      }

      case "tabla": {
        const wrap = el("div", { class: "tabla-wrap" });
        const table = el("table", { class: "tabla" });
        const thead = el("thead");
        const trh = el("tr");
        b.encabezados.forEach((h) => trh.appendChild(el("th", { text: h })));
        thead.appendChild(trh);
        const tbody = el("tbody");
        b.filas.forEach((fila) => {
          const tr = el("tr");
          fila.forEach((celda, i) => {
            const td = el("td", { text: celda });
            td.setAttribute("data-col", b.encabezados[i] || "");
            tr.appendChild(td);
          });
          tbody.appendChild(tr);
        });
        table.appendChild(thead);
        table.appendChild(tbody);
        wrap.appendChild(table);
        return wrap;
      }

      default:
        return el("p", { class: "texto", text: b.texto || "" });
    }
  }

  function renderBloques(bloques, parent) {
    (bloques || []).forEach((b) => parent.appendChild(renderBloque(b)));
  }

  // Cabecera común de una página (sección, título, subtítulo).
  function pageHeader(p) {
    const head = el("header", { class: "page__head" });
    if (p.seccion) head.appendChild(el("p", { class: "page__eyebrow", text: p.seccion }));
    head.appendChild(el("h2", { class: "page__title", text: p.titulo }));
    if (p.subtitulo) head.appendChild(el("p", { class: "page__subtitle", text: p.subtitulo }));
    return head;
  }

  // Imagen de página con animación de entrada.
  function pageImage(src, alt) {
    const fig = el("figure", { class: "page__media" });
    const img = el("img", {
      class: "page__img reveal",
      attrs: { src, alt: alt || "", loading: "lazy", decoding: "async" }
    });
    fig.appendChild(img);
    return fig;
  }

  // =======================================================================
  //  RENDER POR TIPO DE PÁGINA
  // =======================================================================
  const RENDERERS = {

    // ---- Portada --------------------------------------------------------
    portada(p) {
      const wrap = el("section", { class: "portada" });
      const art = el("figure", { class: "portada__art reveal" }, [
        el("img", { attrs: { src: p.imagen, alt: "Ilustración de la cartilla", loading: "eager" } })
      ]);
      const body = el("div", { class: "portada__body" }, [
        el("h1", { class: "portada__title", text: p.titulo }),
        el("p", { class: "portada__subtitle", text: p.subtitulo }),
        el("p", { class: "portada__lema", text: p.lema })
      ]);
      const acciones = el("div", { class: "portada__actions" }, [
        botonNav("Comenzar 📖", "next", "btn btn--cta"),
        botonNav("Ver índice 📑", "indice", "btn btn--ghost")
      ]);
      body.appendChild(acciones);
      body.appendChild(el("p", { class: "portada__pie", text: p.pie }));
      wrap.appendChild(art);
      wrap.appendChild(body);
      return wrap;
    },

    // ---- Índice interactivo --------------------------------------------
    indice(p) {
      const frag = document.createDocumentFragment();
      frag.appendChild(pageHeader(p));
      const grid = el("div", { class: "indice-grid" });
      DATA.indice.forEach((sec) => {
        const card = el("button", {
          class: "indice-card",
          attrs: { type: "button", "aria-label": "Ir a " + sec.titulo }
        }, [
          el("span", { class: "indice-card__icon", attrs: { "aria-hidden": "true" }, text: sec.icono }),
          el("span", { class: "indice-card__text", text: sec.titulo })
        ]);
        card.addEventListener("click", () => goToId(sec.id));
        grid.appendChild(card);
      });
      frag.appendChild(grid);
      if (p.nota) frag.appendChild(el("p", { class: "nota", text: p.nota }));
      return frag;
    },

    // ---- Página estándar (bloques) -------------------------------------
    estandar(p) {
      const frag = document.createDocumentFragment();
      frag.appendChild(pageHeader(p));
      if (p.imagen) frag.appendChild(pageImage(p.imagen, p.titulo));
      const body = el("div", { class: "page__body" });
      renderBloques(p.bloques, body);
      // Imagen secundaria opcional (p. ej. tecnopedagogía).
      if (p.imagenSecundaria) body.appendChild(pageImage(p.imagenSecundaria, p.titulo));
      frag.appendChild(body);
      return frag;
    },

    // ---- Reflexión inicial (con modal "Ver reflexión") ------------------
    reflexion(p) {
      const frag = document.createDocumentFragment();
      frag.appendChild(pageHeader(p));
      if (p.imagen) frag.appendChild(pageImage(p.imagen, p.titulo));
      const body = el("div", { class: "page__body" });
      renderBloques(p.bloques, body);
      const btn = el("button", { class: "btn btn--cta", attrs: { type: "button" }, text: "Ver reflexión 💭" });
      btn.addEventListener("click", () => abrirReflexion(p.reflexionAmpliada));
      body.appendChild(btn);
      frag.appendChild(body);
      return frag;
    },

    // ---- Actividad (paneles desplegables) ------------------------------
    actividad(p) {
      const frag = document.createDocumentFragment();
      const head = pageHeader(p);
      head.insertBefore(
        el("span", { class: "badge badge--" + slug(p.etiqueta), text: p.etiqueta }),
        head.firstChild
      );
      frag.appendChild(head);
      if (p.imagen) frag.appendChild(pageImage(p.imagen, p.titulo));

      const paneles = [
        { ic: "🎯", t: "Objetivo", v: p.objetivo, open: true },
        { ic: "📝", t: "Descripción", v: p.descripcion },
        { ic: "🧰", t: "Recursos digitales y físicos", v: p.recursos },
        { ic: "🤝", t: "Atención integral e inclusión", v: p.inclusion }
      ];
      const grid = el("div", { class: "actividad" });
      paneles.forEach((pan) => {
        const panel = el("div", { class: "panel" + (pan.open ? " panel--abierta" : "") });
        const cabeza = el("button", {
          class: "panel__head",
          attrs: { type: "button", "aria-expanded": String(!!pan.open) }
        }, [
          el("span", { class: "panel__icon", attrs: { "aria-hidden": "true" }, text: pan.ic }),
          el("span", { class: "panel__label", text: pan.t }),
          el("span", { class: "panel__chevron", attrs: { "aria-hidden": "true" }, text: "▾" })
        ]);
        const cuerpo = el("div", { class: "panel__body" }, [el("p", { text: pan.v })]);
        cabeza.addEventListener("click", () => {
          const open = panel.classList.toggle("panel--abierta");
          cabeza.setAttribute("aria-expanded", String(open));
        });
        panel.appendChild(cabeza);
        panel.appendChild(cuerpo);
        grid.appendChild(panel);
      });
      frag.appendChild(grid);
      return frag;
    },

    // ---- Semáforo de la calma (interacción especial) -------------------
    semaforo(p) {
      const frag = document.createDocumentFragment();
      frag.appendChild(pageHeader(p));

      const cont = el("div", { class: "semaforo" });
      const poste = el("div", { class: "semaforo__poste", attrs: { role: "group", "aria-label": "Luces del semáforo" } });
      const panel = el("div", { class: "semaforo__panel", attrs: { "aria-live": "polite" } }, [
        el("p", { class: "semaforo__hint", text: "Toca una luz del semáforo 🚦" })
      ]);

      p.luces.forEach((luz) => {
        const b = el("button", {
          class: "luz luz--" + luz.color,
          attrs: { type: "button", "aria-label": luz.color }
        });
        b.addEventListener("click", () => {
          // Cambia el color del panel y muestra el mensaje con animación.
          panel.className = "semaforo__panel semaforo__panel--" + luz.color + " is-active";
          panel.innerHTML = "";
          panel.appendChild(el("p", { class: "semaforo__msg", text: luz.mensaje }));
          poste.querySelectorAll(".luz").forEach((x) => x.classList.remove("luz--on"));
          b.classList.add("luz--on");
          // Reinicia la animación.
          panel.classList.remove("is-active");
          void panel.offsetWidth;
          panel.classList.add("is-active");
        });
        poste.appendChild(b);
      });

      cont.appendChild(poste);
      cont.appendChild(panel);
      frag.appendChild(cont);
      if (p.uso) frag.appendChild(el("p", { class: "nota", text: p.uso }));
      frag.appendChild(botonImprimir());
      return frag;
    },

    // ---- Glosario (acordeón) -------------------------------------------
    glosario(p) {
      const frag = document.createDocumentFragment();
      frag.appendChild(pageHeader(p));
      const lista = el("div", { class: "glosario" });
      p.terminos.forEach((t) => {
        const item = el("div", { class: "glos-item" });
        const term = el("button", {
          class: "glos-item__term", attrs: { type: "button", "aria-expanded": "false" }
        }, [
          el("span", { text: t.termino }),
          el("span", { class: "glos-item__plus", attrs: { "aria-hidden": "true" }, text: "+" })
        ]);
        const def = el("div", { class: "glos-item__def" }, [el("p", { text: t.definicion })]);
        term.addEventListener("click", () => {
          const open = item.classList.toggle("glos-item--abierta");
          term.setAttribute("aria-expanded", String(open));
        });
        item.appendChild(term);
        item.appendChild(def);
        lista.appendChild(item);
      });
      frag.appendChild(lista);
      return frag;
    },

    // ---- Imprimible: tarjetas de emociones -----------------------------
    "imprimible-emociones"(p) {
      const frag = document.createDocumentFragment();
      frag.appendChild(pageHeader(p));
      const grid = el("div", { class: "emociones-grid" });
      p.emociones.forEach((e) => {
        grid.appendChild(el("div", { class: "emo-card" }, [
          el("span", { class: "emo-card__face", attrs: { "aria-hidden": "true" }, text: e.cara }),
          el("span", { class: "emo-card__name", text: e.nombre })
        ]));
      });
      frag.appendChild(grid);
      if (p.pregunta) frag.appendChild(el("p", { class: "nota", text: p.pregunta }));
      frag.appendChild(botonImprimir());
      return frag;
    },

    // ---- Imprimible: diario de exploración -----------------------------
    "imprimible-diario"(p) {
      const frag = document.createDocumentFragment();
      frag.appendChild(pageHeader(p));
      const diario = el("div", { class: "diario" });
      p.campos.forEach((c) => {
        const campo = el("div", { class: "diario__campo" });
        campo.appendChild(el("h4", { class: "diario__label", text: c.etiqueta }));
        if (c.tipo === "lineas") {
          const lns = el("div", { class: "diario__lineas" });
          for (let i = 0; i < (c.alto || 2); i++) lns.appendChild(el("span", { class: "diario__linea" }));
          campo.appendChild(lns);
        } else if (c.tipo === "recuadro") {
          campo.appendChild(el("div", { class: "diario__recuadro", attrs: { style: `--alto:${c.alto || 4}` } }));
        } else if (c.tipo === "opciones") {
          const op = el("div", { class: "diario__opciones" });
          c.opciones.forEach((o) => op.appendChild(el("span", { class: "opcion", text: o })));
          campo.appendChild(op);
        }
        diario.appendChild(campo);
      });
      frag.appendChild(diario);
      frag.appendChild(botonImprimir());
      return frag;
    },

    // ---- Referencias ----------------------------------------------------
    referencias(p) {
      const frag = document.createDocumentFragment();
      frag.appendChild(pageHeader(p));
      const ol = el("ol", { class: "ref-list" });
      p.referencias.forEach((r) => ol.appendChild(el("li", { class: "ref-item", text: r })));
      frag.appendChild(ol);
      return frag;
    }
  };

  // Botón que dispara una acción de navegación (reutilizable en portada).
  function botonNav(texto, accion, clase) {
    const b = el("button", { class: clase, attrs: { type: "button" }, text: texto });
    b.addEventListener("click", () => navegar(accion));
    return b;
  }

  // Botón "Imprimir recurso".
  function botonImprimir() {
    const b = el("button", { class: "btn btn--print", attrs: { type: "button" }, text: "🖨️ Imprimir recurso" });
    b.addEventListener("click", () => window.print());
    return b;
  }

  // =======================================================================
  //  MODAL (reflexión ampliada y contenido genérico)
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
    document.body.classList.add("no-scroll");
    $(".modal__close", modal).focus();
  }

  function cerrarModal() {
    modal.hidden = true;
    document.body.classList.remove("no-scroll");
    if (lastFocus) lastFocus.focus();
  }

  function abrirReflexion(ref) {
    const cont = document.createDocumentFragment();
    ref.secciones.forEach((s) => {
      cont.appendChild(el("h3", { class: "subtitulo", text: s.h }));
      cont.appendChild(el("p", { class: "texto", text: s.p }));
    });
    abrirModal(ref.titulo, cont);
  }

  modal.addEventListener("click", (e) => {
    if (e.target.hasAttribute("data-close-modal")) cerrarModal();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !modal.hidden) cerrarModal();
  });

  // =======================================================================
  //  NAVEGACIÓN
  // =======================================================================
  function render(i) {
    current = Math.max(0, Math.min(i, PAGES.length - 1));
    const p = PAGES[current];
    const article = el("article", { class: "page page--" + p.tipo, attrs: { "aria-label": p.titulo } });
    const renderer = RENDERERS[p.tipo] || RENDERERS.estandar;
    article.appendChild(renderer(p));

    app.innerHTML = "";
    app.appendChild(article);

    // Indicadores y estado de botones.
    actualizarUI();

    // Animaciones de entrada para elementos marcados con .reveal
    requestAnimationFrame(() => {
      article.querySelectorAll(".reveal").forEach((n) => n.classList.add("is-visible"));
    });

    // Foco y desplazamiento al inicio.
    app.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Refleja la página en la URL (deep-link).
    history.replaceState(null, "", "#" + p.id);
  }

  function actualizarUI() {
    const total = PAGES.length;
    $("#pagerCount").textContent = `Página ${current + 1} de ${total}`;
    $("#progressBar").style.width = ((current + 1) / total * 100) + "%";
    document.querySelectorAll('[data-nav="prev"]').forEach((b) => (b.disabled = current === 0));
    document.querySelectorAll('[data-nav="next"]').forEach((b) => (b.disabled = current === total - 1));
  }

  function goToId(id) {
    if (id in indexById) render(indexById[id]);
  }

  function navegar(accion) {
    switch (accion) {
      case "inicio": render(0); break;
      case "indice": goToId("indice"); break;
      case "prev": render(current - 1); break;
      case "next": render(current + 1); break;
    }
  }

  // Delegación de eventos para todos los botones con data-nav.
  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-nav]");
    if (btn) { e.preventDefault(); navegar(btn.getAttribute("data-nav")); }
  });

  // Navegación con teclado (flechas izquierda/derecha).
  document.addEventListener("keydown", (e) => {
    if (!modal.hidden) return;
    const tag = (document.activeElement.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea") return;
    if (e.key === "ArrowRight") navegar("next");
    if (e.key === "ArrowLeft") navegar("prev");
  });

  // =======================================================================
  //  ARRANQUE
  // =======================================================================
  async function init() {
    try {
      const res = await fetch("data/contenido.json", { cache: "no-cache" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      DATA = await res.json();
      PAGES = DATA.paginas;
      PAGES.forEach((p, i) => (indexById[p.id] = i));

      // Si la URL trae un #id válido, abrir esa página; si no, la portada.
      const hashId = decodeURIComponent(location.hash.replace("#", ""));
      render(hashId in indexById ? indexById[hashId] : 0);
    } catch (err) {
      app.innerHTML =
        '<div class="page"><h2 class="page__title">No se pudo cargar la cartilla</h2>' +
        '<p class="texto">Verifica tu conexión o abre el sitio desde GitHub Pages. ' +
        "Detalle técnico: " + err.message + "</p></div>";
      console.error(err);
    }
  }

  document.addEventListener("DOMContentLoaded", init);
})();
