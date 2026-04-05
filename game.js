let historia = {};
let escribiendo = false;
let intervalo = null;
let escenaActual = "escena1";

async function iniciar() {
  const respuesta = await fetch("historia.json");
  historia = await respuesta.json();

  const escenaGuardada = localStorage.getItem("susurros_escena");
  const tituloGuardado = localStorage.getItem("susurros_titulo");

  if (escenaGuardada && historia[escenaGuardada]) {
    actualizarLabelGuardado(tituloGuardado, "guardado");
    cargarEscena(escenaGuardada);
  } else {
    actualizarLabelGuardado(null, "ninguno");
    cargarEscena("escena1");
  }
}

function cargarEscena(id) {
  const escena = historia[id];
  if (!escena) return;

  escenaActual = id;

  document.getElementById("speaker").textContent = escena.speaker || "";
  document.getElementById("escena-label").textContent = escena.titulo || "";
  document.getElementById("botones").innerHTML = "";
  document.getElementById("decisiones-label").textContent = "// ELIGE TU ACCIÓN";

  actualizarEstadoGuardado();

  escribirTexto(escena.texto, () => {
    mostrarDecisiones(escena.decisiones);
  });
}

function actualizarLabelGuardado(titulo, estado) {
  const label = document.getElementById("guardado-label");
  label.className = "";

  if (!titulo) {
    label.textContent = "// SIN GUARDADO";
  } else if (estado === "pendiente") {
    label.textContent = `// GUARDADO: ${titulo} — progreso sin guardar`;
    label.className = "pendiente";
  } else {
    label.textContent = `// GUARDADO: ${titulo}`;
    label.className = "activo";
  }
}

function actualizarEstadoGuardado() {
  const escenaGuardada = localStorage.getItem("susurros_escena");
  const tituloGuardado = localStorage.getItem("susurros_titulo");

  if (!tituloGuardado) {
    actualizarLabelGuardado(null, "ninguno");
    return;
  }

  if (escenaGuardada === escenaActual) {
    actualizarLabelGuardado(tituloGuardado, "guardado");
  } else {
    actualizarLabelGuardado(tituloGuardado, "pendiente");
  }
}

function guardar() {
  const escena = historia[escenaActual];
  if (!escena) return;

  localStorage.setItem("susurros_escena", escenaActual);
  localStorage.setItem("susurros_titulo", escena.titulo);

  actualizarLabelGuardado(escena.titulo, "guardado");

  const btn = document.getElementById("btn-guardar");
  btn.textContent = "[ GUARDADO ✓ ]";
  setTimeout(() => {
    btn.textContent = "[ GUARDAR ]";
  }, 2000);
}

function reiniciar() {
  if (!confirm("¿Reiniciar desde el principio? Se perderá el progreso guardado.")) return;
  localStorage.removeItem("susurros_escena");
  localStorage.removeItem("susurros_titulo");
  actualizarLabelGuardado(null, "ninguno");
  cargarEscena("escena1");
}

function escribirTexto(texto, callback) {
  const el = document.getElementById("texto");
  const cursor = document.getElementById("cursor");
  el.textContent = "";
  cursor.style.display = "inline-block";
  escribiendo = true;
  let i = 0;
  let velocidad = 18;
  let acelerado = false;

  if (intervalo) clearInterval(intervalo);

  function actualizarTexto() {
    if (i < texto.length) {
      el.textContent += texto[i];
      i++;
    } else {
      clearInterval(intervalo);
      escribiendo = false;
      cursor.style.display = "none";
      el.onclick = null;
      if (callback) callback();
    }
  }

  el.onclick = () => {
    if (escribiendo) {
      if (!acelerado) {
        acelerado = true;
        velocidad = 2;
        clearInterval(intervalo);
        intervalo = setInterval(actualizarTexto, velocidad);
      } else {
        clearInterval(intervalo);
        el.textContent = texto;
        el.onclick = null;
        escribiendo = false;
        cursor.style.display = "none";
        if (callback) callback();
      }
    }
  };

  intervalo = setInterval(actualizarTexto, velocidad);
}

function mostrarDecisiones(decisiones) {
  if (!decisiones || decisiones.length === 0) return;
  const contenedor = document.getElementById("botones");
  decisiones.forEach((d, i) => {
    const btn = document.createElement("button");
    btn.className = "boton";
    btn.innerHTML = `<span class="idx">[${i + 1}]</span><span>${d.texto}</span>`;
    btn.onclick = () => {
      if (escribiendo) return;
      cargarEscena(d.destino);
    };
    contenedor.appendChild(btn);
  });
}

iniciar();
