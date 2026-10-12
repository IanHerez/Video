import * as THREE from "./vendor/three.module.min.js";
import { crearGalaxia } from "./galaxia.js";

const C = window.CONFIG;
const $ = (id) => document.getElementById(id);
const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ============================================================
//  CALENDARIO + MENSAJES DE ERROR CON CARIÑO (y saña)
// ============================================================
const MESES = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio",
  "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

const hoy = new Date();
let vista = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
let seleccion = null;
let intentos = 0;

const ESPECIALES = {
  "1-1": "Ese es el cumpleaños del AÑO, no el de ella.",
  "14-2": "Eso es San Valentín. Ella no es una tarjeta de Sanborns.",
  "30-4": "Día del niño. Cerca en madurez, lejos en fecha.",
  "10-5": "Eso es el Día de las Madres. Ella es la madre, sí, pero del grupo.",
  "16-9": "Eso es el Grito. El grito te lo va a pegar ella a ti.",
  "31-10": "Halloween. Ella da miedo, pero no tanto.",
  "2-11": "Día de Muertos. Así vas a quedar si no adivinas.",
  "12-12": "Esa es la Virgencita. Ten más respeto.",
  "24-12": "Nochebuena. Ella es buena, pero no tanto.",
  "25-12": "Ella es especial, pero no TAN especial como el niñito Dios.",
};
const CASI = [
  "¡Uy, casi! Pero el 'casi' no apaga velitas.",
  "Tan cerca y tan lejos. Como Vernon de tu casa.",
];
const MES_BIEN = [
  "Vas bien con el mes, mal con el día. Como tu vida.",
  "Octubre sí, pero ese día no. Concéntrate.",
];
const GENERICOS = [
  "Incorrecto. Vernon está decepcionado.",
  "Nayeon acaba de llorar por tu culpa.",
  "Error 404: amistad no encontrada.",
  "¿Segura que te conoces? Ve al psicólogo.",
  "Mina dejó de seguirte.",
  "No. Y Momo ya se comió el pastel mientras pensabas.",
  "Ni Tzuyu con su cara de seria te perdona eso.",
  "Respuesta incorrecta. Se descontará un tamal de tu cuenta.",
  "Ni con Google te sale. Impresionante.",
  "Esa fecha es la del cumple de tu ex. Muy mal.",
];
const PISTAS = [
  "Pista: es en el mes de Halloween, pero antes de los disfraces.",
  "Pista 2: es un número capicúa. Sí, como el 11.",
  "OK ya, te ayudo: 11 de octubre. Nadie se va a enterar. 🤫",
];

const grid = $("calGrid");
const titulo = $("calTitulo");
const mensaje = $("mensaje");
const aceptar = $("aceptar");

function renderCalendario() {
  titulo.textContent = `${MESES[vista.getMonth()]} ${vista.getFullYear()}`;
  grid.innerHTML = "";
  const offset = (vista.getDay() + 6) % 7; // lunes primero
  const diasMes = new Date(vista.getFullYear(), vista.getMonth() + 1, 0).getDate();
  for (let i = 0; i < offset; i++) {
    const v = document.createElement("span");
    v.className = "dia vacio";
    grid.appendChild(v);
  }
  for (let d = 1; d <= diasMes; d++) {
    const b = document.createElement("button");
    b.className = "dia";
    b.textContent = d;
    const fecha = new Date(vista.getFullYear(), vista.getMonth(), d);
    if (seleccion && fecha.getTime() === seleccion.getTime()) b.classList.add("sel");
    b.addEventListener("click", () => {
      seleccion = fecha;
      aceptar.disabled = false;
      mensaje.innerHTML = "&nbsp;";
      renderCalendario();
      anime({ targets: grid.querySelector(".sel"), scale: [0.6, 1], duration: 500, easing: "easeOutElastic(1, .5)" });
    });
    grid.appendChild(b);
  }
}

function cambiarMes(delta) {
  vista = new Date(vista.getFullYear(), vista.getMonth() + delta, 1);
  renderCalendario();
  anime({ targets: grid, translateX: [delta * 30, 0], opacity: [0, 1], duration: 350, easing: "easeOutQuad" });
}
$("prev").addEventListener("click", () => cambiarMes(-1));
$("next").addEventListener("click", () => cambiarMes(1));

function mensajeError(fecha) {
  const d = fecha.getDate();
  const m = fecha.getMonth() + 1;
  intentos++;
  if (intentos >= 4) return PISTAS[Math.min(intentos - 4, PISTAS.length - 1)];
  if (ESPECIALES[`${d}-${m}`]) return ESPECIALES[`${d}-${m}`];
  if (m === C.mes && Math.abs(d - C.dia) <= 1) return pick(CASI);
  if (m === C.mes) return pick(MES_BIEN);
  return pick(GENERICOS);
}

aceptar.addEventListener("click", () => {
  if (!seleccion) return;
  const ok = seleccion.getDate() === C.dia && seleccion.getMonth() + 1 === C.mes;
  if (!ok) {
    mensaje.textContent = mensajeError(seleccion);
    anime({ targets: "#calendario", translateX: [0, -14, 14, -10, 10, -5, 5, 0], duration: 500, easing: "easeInOutSine" });
    anime({ targets: mensaje, scale: [1.25, 1], duration: 400, easing: "easeOutBack" });
    return;
  }
  empezarFiesta();
});

renderCalendario();
anime({
  targets: ["#landing .pregunta", "#landing .sub", "#calendario", "#mensaje", "#aceptar"],
  translateY: [30, 0], opacity: [0, 1], delay: anime.stagger(90), duration: 700, easing: "easeOutCubic",
});

// ============================================================
//  AUDIO: Las Mañanitas (mp3) o kazoo de emergencia
// ============================================================
const cancion = $("cancion");
cancion.src = C.audio;
let ctx = null;
let kazooTimer = null;
let silenciado = false;

function audioCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  return ctx;
}

function boom() {
  const a = audioCtx();
  const len = a.sampleRate * 2.2;
  const buf = a.createBuffer(1, len, a.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
  const src = a.createBufferSource();
  src.buffer = buf;
  const lp = a.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.setValueAtTime(2200, a.currentTime);
  lp.frequency.exponentialRampToValueAtTime(80, a.currentTime + 1.8);
  const g = a.createGain();
  g.gain.value = 1.4;
  src.connect(lp).connect(g).connect(a.destination);
  src.start();
  // golpe grave
  const o = a.createOscillator();
  const og = a.createGain();
  o.frequency.setValueAtTime(140, a.currentTime);
  o.frequency.exponentialRampToValueAtTime(30, a.currentTime + 0.8);
  og.gain.setValueAtTime(1, a.currentTime);
  og.gain.exponentialRampToValueAtTime(0.001, a.currentTime + 0.9);
  o.connect(og).connect(a.destination);
  o.start();
  o.stop(a.currentTime + 1);
}

// Melodía aproximada de "Las Mañanitas" (tradicional), en kazoo digital.
const N = { G4: 392, A4: 440, B4: 493.9, C5: 523.3, D5: 587.3, E5: 659.3, F5: 698.5, G5: 784 };
const MELODIA = [
  ["G4", 1], ["G4", 1], ["C5", 1], ["C5", 1], ["C5", 1], ["E5", 1], ["D5", 1], ["C5", 2],
  ["B4", 1], ["C5", 1], ["D5", 1], ["D5", 1], ["D5", 1], ["E5", 1], ["D5", 3],
  ["E5", 1], ["E5", 1], ["F5", 1], ["G5", 1], ["G5", 1], ["G5", 1], ["F5", 1], ["E5", 1], ["D5", 2],
  ["D5", 1], ["E5", 1], ["F5", 1], ["E5", 1], ["D5", 1], ["B4", 1], ["C5", 3], [null, 2],
];
function tocarKazoo() {
  const a = audioCtx();
  const beat = 0.3;
  let t = a.currentTime + 0.05;
  const master = a.createGain();
  master.gain.value = silenciado ? 0 : 0.18;
  master.connect(a.destination);
  kazoo.master = master;
  for (const [nota, dur] of MELODIA) {
    if (nota) {
      const o = a.createOscillator();
      o.type = "sawtooth";
      o.frequency.value = N[nota];
      const vib = a.createOscillator();
      const vibG = a.createGain();
      vib.frequency.value = 6;
      vibG.gain.value = 7;
      vib.connect(vibG).connect(o.frequency);
      const bp = a.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = 1200;
      bp.Q.value = 1.2;
      const g = a.createGain();
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(1, t + 0.03);
      g.gain.setValueAtTime(1, t + dur * beat - 0.06);
      g.gain.linearRampToValueAtTime(0, t + dur * beat - 0.01);
      o.connect(bp).connect(g).connect(master);
      o.start(t); vib.start(t);
      o.stop(t + dur * beat); vib.stop(t + dur * beat);
    }
    t += dur * beat;
  }
  kazooTimer = setTimeout(tocarKazoo, (t - a.currentTime) * 1000);
}
const kazoo = { activo: false, master: null };

let mp3Listo = Promise.resolve(false);
function ponerCancion() {
  mp3Listo.then((ok) => {
    if (ok) {
      cancion.currentTime = 0;
      cancion.muted = silenciado;
    } else if (!kazoo.activo) {
      kazoo.activo = true;
      tocarKazoo();
    }
  });
}
cancion.addEventListener("error", () => {
  // si el mp3 falla después de haber empezado la fiesta
  if (document.body.classList.contains("fiesta") && !kazoo.activo) {
    kazoo.activo = true;
    tocarKazoo();
  }
});

$("mute").addEventListener("click", () => {
  silenciado = !silenciado;
  cancion.muted = silenciado;
  if (kazoo.master) kazoo.master.gain.value = silenciado ? 0 : 0.18;
  $("mute").textContent = silenciado ? "🔇" : "🔊";
});

// ============================================================
//  THREE.JS: explosión + fuegos artificiales
// ============================================================
const canvas = $("fx");
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(70, 1, 0.1, 1000);
camera.position.z = 80;

function resize() {
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
}
window.addEventListener("resize", resize);
resize();

const sprite = (() => {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const g = c.getContext("2d");
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, "rgba(255,255,255,1)");
  grd.addColorStop(0.25, "rgba(255,255,255,.9)");
  grd.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grd;
  g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
})();

const PALETA = [0xff3d9a, 0xffd23f, 0x2ee6d6, 0xff7a2f, 0xa66bff, 0xffffff, 0x4dff88];
const bursts = [];
const rings = [];

function burst(x, y, z, count, speed, size = 2.2, colores = PALETA) {
  const pos = new Float32Array(count * 3);
  const col = new Float32Array(count * 3);
  const vel = new Float32Array(count * 3);
  const c = new THREE.Color();
  for (let i = 0; i < count; i++) {
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    const s = speed * (0.25 + Math.random() * 0.75);
    vel[i * 3] = Math.sin(ph) * Math.cos(th) * s;
    vel[i * 3 + 1] = Math.sin(ph) * Math.sin(th) * s;
    vel[i * 3 + 2] = Math.cos(ph) * s;
    pos[i * 3] = x; pos[i * 3 + 1] = y; pos[i * 3 + 2] = z;
    c.setHex(pick(colores));
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  const mat = new THREE.PointsMaterial({
    size, map: sprite, vertexColors: true, transparent: true,
    depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const pts = new THREE.Points(geo, mat);
  scene.add(pts);
  bursts.push({ pts, vel, vida: 1, decay: rand(0.006, 0.01) });
}

function onda(color = 0xffffff, velocidad = 1.6) {
  const geo = new THREE.RingGeometry(0.8, 1.6, 96);
  const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.7, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
  const m = new THREE.Mesh(geo, mat);
  scene.add(m);
  rings.push({ m, s: 1, v: velocidad });
}

// Galaxia de fondo (landing) + estrellas lejanas que se quedan para la fiesta
const galaxia = crearGalaxia(scene, renderer, camera);
const reloj = new THREE.Clock();

let shake = 0;
function loop() {
  requestAnimationFrame(loop);
  const dt = Math.min(reloj.getDelta(), 0.05);
  galaxia.update(reloj.elapsedTime, dt);
  for (let i = bursts.length - 1; i >= 0; i--) {
    const b = bursts[i];
    const p = b.pts.geometry.attributes.position.array;
    for (let j = 0; j < p.length; j += 3) {
      p[j] += b.vel[j]; p[j + 1] += b.vel[j + 1]; p[j + 2] += b.vel[j + 2];
      b.vel[j] *= 0.965; b.vel[j + 1] = b.vel[j + 1] * 0.965 - 0.012; b.vel[j + 2] *= 0.965;
    }
    b.pts.geometry.attributes.position.needsUpdate = true;
    b.vida -= b.decay;
    b.pts.material.opacity = Math.max(b.vida, 0);
    if (b.vida <= 0) {
      scene.remove(b.pts); b.pts.geometry.dispose(); b.pts.material.dispose();
      bursts.splice(i, 1);
    }
  }
  for (let i = rings.length - 1; i >= 0; i--) {
    const r = rings[i];
    r.s += r.v; r.v *= 0.985;
    r.m.scale.setScalar(r.s);
    r.m.material.opacity -= 0.02;
    if (r.m.material.opacity <= 0) {
      scene.remove(r.m); r.m.geometry.dispose(); r.m.material.dispose();
      rings.splice(i, 1);
    }
  }
  camera.position.x = (Math.random() - 0.5) * shake;
  camera.position.y = (Math.random() - 0.5) * shake;
  shake *= 0.92;
  renderer.render(scene, camera);
}
loop();

function fuegosArtificiales() {
  setInterval(() => {
    if (document.hidden) return;
    const w = 70 * camera.aspect;
    burst(rand(-w * 0.8, w * 0.8), rand(-10, 45), rand(-40, 0), 260, rand(1.2, 2), 1.8, [pick(PALETA), pick(PALETA), 0xffffff]);
  }, 900);
}

// ============================================================
//  LA FIESTA
// ============================================================
function empezarFiesta() {
  aceptar.disabled = true;
  mensaje.textContent = "⚠️ Nivel de fiesta peligroso detectado...";
  // Desbloquea el audio con este clic (iOS solo deja sonar si empieza dentro del clic):
  // la canción arranca en silencio y se "prende" en la explosión.
  audioCtx().resume();
  cancion.muted = true;
  mp3Listo = cancion.play().then(() => true, () => false);

  // la galaxia se colapsa en un agujero negro mientras tiembla todo
  galaxia.colapsar(1050);
  let n = 0;
  const temblor = setInterval(() => {
    n++;
    const k = 2 + n * 0.9;
    document.getElementById("landing").style.transform =
      `translate(${rand(-k, k)}px, ${rand(-k, k)}px) rotate(${rand(-k / 6, k / 6)}deg) scale(${1 + n * 0.006})`;
    if (n > 22) { clearInterval(temblor); explotar(); }
  }, 45);
}

function explotar() {
  boom();
  shake = 14;
  galaxia.explotar();
  anime({ targets: "#flash", opacity: [1, 0], duration: 1100, easing: "easeOutQuad" });
  anime({
    targets: "#landing",
    scale: [1.1, 4], opacity: [1, 0], rotate: 25, duration: 600, easing: "easeInQuad",
    complete: () => { $("landing").style.display = "none"; },
  });
  // explosión principal
  burst(0, 0, 0, 4000, 4.2, 2.6);
  burst(0, 0, 0, 1500, 2.2, 3.4, [0xffd23f, 0xff7a2f, 0xffffff]);
  onda(0xffffff, 2.4);
  setTimeout(() => onda(0xff3d9a, 1.8), 120);
  setTimeout(() => onda(0x2ee6d6, 1.4), 260);

  document.body.classList.add("fiesta");
  ponerCancion();

  setTimeout(() => {
    $("fiesta").hidden = false;
    animarTitulo();
    fuegosArtificiales();
  }, 450);
  setTimeout(() => soltarCaos(), 1600);
}

function animarTitulo() {
  const t = $("titulo");
  const texto = `¡FELICIDADES ${C.nombre}!`;
  t.innerHTML = texto.split(" ").map((p) =>
    `<span class="palabra">${[...p].map((l) => `<span class="letra">${l}</span>`).join("")}</span>`
  ).join(" ");
  anime.timeline()
    .add({
      targets: "#titulo .letra",
      translateY: () => [anime.random(-900, -400), 0],
      translateX: () => [anime.random(-300, 300), 0],
      rotate: () => [anime.random(-540, 540), 0],
      scale: [0, 1],
      delay: anime.stagger(55),
      duration: 1300,
      easing: "easeOutElastic(1, .55)",
    })
    .add({ targets: "#subtitulo", opacity: [0, 1], scale: [3, 1], duration: 700, easing: "easeOutBack" }, "-=600")
    .add({
      targets: "#titulo .letra",
      translateY: [0, -18],
      rotate: () => anime.random(-8, 8),
      direction: "alternate",
      loop: true,
      delay: anime.stagger(70),
      duration: 450,
      easing: "easeInOutSine",
    });
  setTimeout(rotarChistes, 2200);
}

const CHISTES = [
  "Un año más viejita, pero con el mismo nivel de madurez. Respeto.",
  "Vernon canceló su gira para venir. (Mentira, pero mira cómo brinca.)",
  "Twice vino completo. Las 9. Nadie les pagó. Tal es tu poder.",
  "Hoy no se cuentan calorías. Se cuentan pasteles.",
  "Las arrugas son solo risas guardadas. Tienes muchas risas guardadas. 👀",
  "Momo ya se comió tu pastel. Pero te dejó la vela.",
  "Felicidades por sobrevivir otra vuelta completa al sol sin manual de instrucciones.",
  "Te quiero demasiado. No se lo digas a nadie, tengo reputación.",
  "Pide tu deseo. Si es Vernon, no se puede, ya lo pedí yo.",
  "Dato curioso: hoy eres oficialmente la persona más importante de este sitio web.",
  "Esta página no tiene botón de pausa para el caos. Tú tampoco.",
];
function rotarChistes() {
  const el = $("chiste");
  let i = 0;
  const siguiente = () => {
    el.textContent = CHISTES[i % CHISTES.length];
    i++;
    anime({ targets: el, opacity: [0, 1], translateY: [20, 0], rotate: [anime.random(-6, 6), 0], duration: 600, easing: "easeOutBack" });
  };
  siguiente();
  setInterval(siguiente, 4200);
}

// ------------------------------------------------------------
//  Vernon + Twice brincando por toda la pantalla
// ------------------------------------------------------------
const caos = $("caos");
const bouncers = [];
const MAX = 46;

const FRASES_VERNON = [
  "¿Quién me invitó? Nadie. Aquí estoy.",
  "Hansol vino a cantar 🎤",
  "Feliz cumple, bro",
  "Traje regalo: yo",
  "Seventeen pero yo solito",
  "¡ARRAPETE!",
];
const FRASES_TWICE = [
  "Cheer up, cumpleañera!",
  "¡Feliz cumple! 🍭",
  "Venimos las 9 🫶",
  "¿Y el pastel?",
  "¡Arriba la cumpleañera!",
  "Wooo 🎉",
];

function tamCard() {
  return Math.round(Math.min(150, Math.max(78, window.innerWidth * 0.11)));
}

function placeholder(tipo, nombre) {
  const d = document.createElement("div");
  d.className = "placeholder";
  const emoji = tipo === "vernon" ? pick(["😎", "🕺", "🎤", "🧢"]) : pick(["💖", "🍭", "✨", "🎀"]);
  const nota = tipo === "vernon" ? "foto en camino" : "llegando tarde";
  d.innerHTML = `<span class="emoji">${emoji}</span><span class="nombre"></span><span class="nota">${nota}</span>`;
  d.querySelector(".nombre").textContent = nombre;
  return d;
}

function crearBouncer(tipo, x, y) {
  if (bouncers.length >= MAX) {
    const viejo = bouncers.shift();
    viejo.el.remove();
  }
  const s = Math.round(tamCard() * rand(0.75, 1.25));
  const el = document.createElement("div");
  el.className = `bouncer ${tipo}`;
  const inner = document.createElement("div");
  inner.className = "inner";
  inner.style.setProperty("--s", s + "px");

  let src, nombre;
  if (tipo === "vernon") {
    src = pick(C.vernon);
    nombre = "VERNON";
  } else {
    const m = pick(C.twice);
    src = m.src; nombre = m.nombre.toUpperCase();
  }
  const img = new Image();
  img.alt = nombre;
  img.draggable = false;
  img.onerror = () => img.replaceWith(placeholder(tipo, nombre));
  img.src = src;
  inner.appendChild(img);

  const bur = document.createElement("div");
  bur.className = "burbuja";
  bur.textContent = pick(tipo === "vernon" ? FRASES_VERNON : FRASES_TWICE);
  inner.appendChild(bur);

  el.appendChild(inner);
  caos.appendChild(el);

  const b = {
    el, inner, bur, s,
    x: x ?? rand(0, window.innerWidth - s),
    y: y ?? rand(-s * 2, window.innerHeight * 0.3),
    vx: rand(-7, 7) || 3,
    vy: rand(-14, 2),
    rot: rand(-40, 40),
    vr: rand(-6, 6),
  };
  bouncers.push(b);

  anime({ targets: inner, scale: [0, 1], rotate: [anime.random(-720, 720), 0], duration: 1100, easing: "easeOutElastic(1, .5)" });

  el.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    // al tocarlo: se multiplica y explota
    const r = el.getBoundingClientRect();
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    burstEnPantalla(cx, cy, 500);
    anime({ targets: inner, scale: [1.5, 1], duration: 600, easing: "easeOutElastic(1, .4)" });
    b.vy = -rand(16, 24); b.vx = rand(-12, 12); b.vr = rand(-20, 20);
    crearBouncer(tipo, b.x, b.y);
    crearBouncer(pick(["vernon", "twice"]), b.x, b.y);
  });
  return b;
}

function burstEnPantalla(px, py, n = 400) {
  // pasa coordenadas de pantalla al plano z=0
  const v = new THREE.Vector3((px / window.innerWidth) * 2 - 1, -(py / window.innerHeight) * 2 + 1, 0.5).unproject(camera);
  const dir = v.sub(camera.position).normalize();
  const dist = -camera.position.z / dir.z;
  const p = camera.position.clone().add(dir.multiplyScalar(dist));
  burst(p.x, p.y, 0, n, 1.8, 2);
}

const GRAV = 0.55;
function fisica() {
  requestAnimationFrame(fisica);
  const W = window.innerWidth, H = window.innerHeight;
  for (const b of bouncers) {
    b.vy += GRAV;
    b.x += b.vx; b.y += b.vy; b.rot += b.vr;
    if (b.x < 0) { b.x = 0; b.vx = Math.abs(b.vx); b.vr = rand(-10, 10); }
    if (b.x > W - b.s) { b.x = W - b.s; b.vx = -Math.abs(b.vx); b.vr = rand(-10, 10); }
    if (b.y > H - b.s) {
      b.y = H - b.s;
      // rebota y a veces pega un brinco extra para mantener el caos
      b.vy = -Math.abs(b.vy) * 0.88 - (Math.random() < 0.35 ? rand(6, 14) : 0);
      if (Math.abs(b.vy) < 9) b.vy = -rand(12, 20);
      b.vx += rand(-3, 3);
      b.vx = Math.max(-12, Math.min(12, b.vx));
    }
    b.vr *= 0.99;
    b.el.style.transform = `translate3d(${b.x}px, ${b.y}px, 0) rotate(${b.rot}deg)`;
  }
}

function soltarCaos() {
  fisica();
  let i = 0;
  const inicial = window.innerWidth < 600 ? 12 : 20;
  const t = setInterval(() => {
    crearBouncer(i % 2 === 0 ? "vernon" : "twice");
    if (++i >= inicial) clearInterval(t);
  }, 160);

  // burbujitas que aparecen al azar
  setInterval(() => {
    if (!bouncers.length) return;
    const b = pick(bouncers);
    b.bur.textContent = pick(b.el.classList.contains("vernon") ? FRASES_VERNON : FRASES_TWICE);
    anime({ targets: b.bur, opacity: [0, 1, 1, 0], scale: [0.5, 1], duration: 2200, easing: "easeOutQuad" });
  }, 700);

  // de vez en cuando, Vernon gigante cruza la pantalla
  setInterval(vernonGigante, 9000);
}

function vernonGigante() {
  const b = crearBouncer("vernon", 0, window.innerHeight * 0.2);
  b.s = Math.round(tamCard() * 2.2);
  b.inner.style.setProperty("--s", b.s + "px");
  b.vx = 9; b.vy = -6;
  b.bur.textContent = "¡FELIZ CUMPLE! 🎂";
  anime({ targets: b.bur, opacity: [0, 1], duration: 400 });
}

$("masCaos").addEventListener("click", () => {
  shake = 10;
  boom();
  burst(0, 0, 0, 2500, 3.4, 2.4);
  onda(0xffd23f, 2);
  anime({ targets: "#flash", opacity: [0.7, 0], duration: 600, easing: "easeOutQuad" });
  for (let k = 0; k < 8; k++) setTimeout(() => crearBouncer(k % 2 ? "twice" : "vernon"), k * 80);
  for (const b of bouncers) { b.vy = -rand(15, 28); b.vx = rand(-14, 14); b.vr = rand(-25, 25); }
});
