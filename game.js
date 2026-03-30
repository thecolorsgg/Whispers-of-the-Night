let historia = {};
let escribiendo = false;
let intervalo = null;

async function iniciar() {
  const respuesta = await fetch("historia.json");
  historia = await respuesta.json();
  cargarEscena("escena1");
}

function cargarEscena(id) {
  const escena = historia[id];
  if (!escena) return;

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

  if (intervalo) clearInterval(intervalo);

  el.onclick = () => {
    if (escribiendo) {
      clearInterval(intervalo);
      el.textContent = texto;
      el.onclick = null;
      escribiendo = false;
      cursor.style.display = "none";
      if (callback) callback();
    }
  };

  intervalo = setInterval(() => {
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
  }, 18);
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