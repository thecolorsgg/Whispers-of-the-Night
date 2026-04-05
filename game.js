let historia = {};
let escribiendo = false;
let intervalo = null;

async function iniciar() {
  const respuesta = await fetch("historia.json");
  historia = await respuesta.json();
  
  // Cargar escena guardada o comenzar desde el principio
  const escenaGuardada = localStorage.getItem("susurros_escena");
  const escenaInicial = escenaGuardada || "escena1";
  
  cargarEscena(escenaInicial);
}

function cargarEscena(id) {
  const escena = historia[id];
  if (!escena) return;

  // Guardar progreso automáticamente
  escenaActual = id;
  localStorage.setItem("susurros_escena", id);

  document.getElementById("speaker").textContent = escena.speaker || "";
  document.getElementById("escena-label").textContent = escena.titulo || "";
  document.getElementById("botones").innerHTML = "";
  document.getElementById("decisiones-label").textContent = "// ELIGE TU ACCIÓN";

  escribirTexto(escena.texto, () => {
    mostrarDecisiones(escena.decisiones);
  });
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
        // Primer clic: acelerar la velocidad 10x
        acelerado = true;
        velocidad = 2;
        clearInterval(intervalo);
        intervalo = setInterval(actualizarTexto, velocidad);
      } else {
        // Segundo clic: mostrar todo el texto
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

let escenaActual = "escena1";

function guardar() {
  localStorage.setItem("susurros_escena", escenaActual);
  const btn = document.getElementById("btn-guardar");
  btn.textContent = "[ GUARDADO ✓ ]";
  setTimeout(() => {
    btn.textContent = "[ GUARDAR ]";
  }, 2000);
}

function reiniciar() {
  if (!confirm("¿Reiniciar desde el principio? Se perderá el progreso guardado.")) return;
  localStorage.removeItem("susurros_escena");
  cargarEscena("escena1");
}

iniciar();
