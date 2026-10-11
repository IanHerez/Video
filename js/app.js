import * as THREE from "./vendor/three.module.min.js";

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
  "1-1": "Lamentamos informarle que el 1 de enero es el cumpleaños del año, no el de la homenajeada.",
  "14-2": "El comité aclara que la homenajeada no es una tarjeta de Sanborns. Fecha rechazada.",
  "30-4": "Día del Niño. Coincide con su nivel de madurez, mas no con su fecha de nacimiento.",
  "10-5": "Día de las Madres. Ella es la madre del grupo, sí, pero esa no es la fecha.",
  "16-9": "Esa fecha es el Grito. El grito se lo pegará ella a usted si no acierta.",
  "31-10": "Halloween. La homenajeada inspira respeto, no miedo. Rechazado.",
  "2-11": "Día de Muertos. Así quedará usted si sigue sin acertar.",
  "12-12": "Esa fecha le pertenece a la Virgencita. Se le ruega más respeto.",
  "24-12": "Nochebuena. Ella es buena, pero no tanto. Rechazado.",
  "25-12": "La homenajeada es especial, pero no tanto como el Niño Dios.",
};
const CASI = [
  "Estuvo cerca. Lamentablemente, el reglamento no contempla el «casi».",
  "A un día de distancia. Como Vernon de su casa: cerca, pero no.",
];
const MES_BIEN = [
  "El mes es correcto. El día, lamentablemente, no. Como su vida.",
  "Octubre, en efecto. El día, sin embargo, deja mucho que desear.",
];
const GENERICOS = [
  "Respuesta incorrecta. Vernon ha sido notificado y se encuentra decepcionado.",
  "El comité lamenta informarle que Nayeon rompió en llanto.",
  "Error 404: amistad no encontrada.",
  "Su respuesta ha sido registrada y enviada a su psicólogo.",
  "Mina ha dejado de seguirle. Lo sentimos mucho.",
  "Incorrecto. Mientras usted dudaba, Momo se comió el pastel.",
  "Ni Tzuyu, con toda su seriedad, puede perdonar esto.",
  "Fecha rechazada. Se descontará un tamal de su cuenta.",
  "Esa es la fecha del cumpleaños de su ex. Muy mal.",
];
const PISTAS = [
  "Pista oficial: es en el mes de Halloween, pero antes de los disfraces.",
  "Segunda pista: el día es capicúa. Como el 11, por ejemplo.",
  "Por compasión: 11 de octubre. Este mensaje se autodestruirá. 🤫",
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
      anime({ targets: grid.querySelector(".sel"), scale: [0.7, 1], duration: 600, easing: "easeOutQuint" });
    });
    grid.appendChild(b);
  }
}

function cambiarMes(delta) {
  vista = new Date(vista.getFullYear(), vista.getMonth() + delta, 1);
  renderCalendario();
  anime({ targets: grid, translateX: [delta * 24, 0], opacity: [0, 1], duration: 500, easing: "easeOutQuint" });
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
    anime({ targets: mensaje, opacity: [0, 1], translateY: [8, 0], duration: 500, easing: "easeOutCubic" });
    return;
  }
  empezarFiesta();
});

renderCalendario();

// ============================================================
//  LANDING: animaciones de entrada, scroll y cursor
// ============================================================
anime.timeline({ easing: "easeOutQuint" })
  .add({ targets: ".nav", translateY: [-30, 0], opacity: [0, 1], duration: 1000 })
  .add({ targets: ".hero .eyebrow", translateY: [16, 0], opacity: [0, 1], duration: 900 }, 150)
  .add({ targets: ".hero-titulo .linea > span", translateY: ["110%", "0%"], duration: 1400, delay: anime.stagger(130) }, 250)
  .add({ targets: ".anim-regla", scaleX: [0, 1], duration: 1400, easing: "easeInOutQuart" }, 800)
  .add({ targets: [".hero-sub", ".hero-acciones", ".scroll-ind"], translateY: [20, 0], opacity: [0, 1], duration: 1000, delay: anime.stagger(120) }, 1000);

const nav = document.querySelector(".nav");
window.addEventListener("scroll", () => nav.classList.toggle("solida", window.scrollY > 40), { passive: true });

const observador = new IntersectionObserver((entradas) => {
  for (const e of entradas) {
    if (!e.isIntersecting) continue;
    observador.unobserve(e.target);
    const hermanos = [...e.target.parentElement.children].filter((x) => x.classList.contains("reveal"));
    anime({
      targets: e.target,
      translateY: [50, 0],
      opacity: [0, 1],
      duration: 1300,
      delay: Math.max(0, hermanos.indexOf(e.target)) * 140,
      easing: "easeOutQuint",
    });
    const num = e.target.querySelector("[data-count]");
    if (num) {
      const o = { v: 0 };
      anime({ targets: o, v: Number(num.dataset.count), round: 1, duration: 2000, easing: "easeOutExpo", update: () => { num.textContent = o.v; } });
    }
  }
}, { threshold: 0.18 });
document.querySelectorAll(".reveal").forEach((el) => observador.observe(el));

const brillo = $("brillo");
let mouseX = 0, mouseY = 0;
window.addEventListener("pointermove", (e) => {
  brillo.style.transform = `translate(${e.clientX}px, ${e.clientY}px)`;
  mouseX = e.clientX / window.innerWidth - 0.5;
  mouseY = e.clientY / window.innerHeight - 0.5;
}, { passive: true });

// ============================================================
//  AUDIO: Las Mañanitas + DEMASIADO RUIDO (todo sintetizado)
// ============================================================
const cancion = $("cancion");
cancion.src = C.audio;
let ctx = null;
let bus = null;      // todo el ruido pasa por aquí
let master = null;   // volumen general (para silenciar)
let silenciado = false;

function audioCtx() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14;
    comp.knee.value = 6;
    comp.ratio.value = 10;
    master = ctx.createGain();
    master.gain.value = 1;
    comp.connect(master).connect(ctx.destination);
    bus = comp;
  }
  return ctx;
}

function ruidoBuffer(seg, curva = 3) {
  const a = audioCtx();
  const len = Math.floor(a.sampleRate * seg);
  const buf = a.createBuffer(1, len, a.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, curva);
  return buf;
}

function env(g, t, pico, ataque, dur) {
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(pico, t + ataque);
  g.gain.setValueAtTime(pico, t + Math.max(ataque, dur - 0.05));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
}

const SFX = {
  boom(vol = 1.4) {
    const a = audioCtx(), t = a.currentTime;
    const src = a.createBufferSource();
    src.buffer = ruidoBuffer(2.2);
    const lp = a.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(2600, t);
    lp.frequency.exponentialRampToValueAtTime(70, t + 1.8);
    const g = a.createGain();
    g.gain.value = vol;
    src.connect(lp).connect(g).connect(bus);
    src.start(t);
    const o = a.createOscillator(), og = a.createGain();
    o.frequency.setValueAtTime(150, t);
    o.frequency.exponentialRampToValueAtTime(28, t + 0.9);
    og.gain.setValueAtTime(vol, t);
    og.gain.exponentialRampToValueAtTime(0.001, t + 1);
    o.connect(og).connect(bus);
    o.start(t); o.stop(t + 1.1);
  },

  // Bocina de estadio: BWAA BWAA BWAAAAA
  airhorn(t0) {
    const a = audioCtx();
    let t = t0 ?? a.currentTime;
    const base = pick([233, 247, 262, 311]);
    for (const dur of [0.16, 0.16, 0.75]) {
      const g = a.createGain();
      env(g, t, 0.35, 0.015, dur);
      const bp = a.createBiquadFilter();
      bp.type = "peaking"; bp.frequency.value = 1400; bp.gain.value = 10;
      g.connect(bp).connect(bus);
      for (const m of [1, 1.008, 2, 2.012, 3]) {
        const o = a.createOscillator();
        o.type = "sawtooth";
        o.frequency.setValueAtTime(base * m * 0.94, t);
        o.frequency.linearRampToValueAtTime(base * m, t + 0.05);
        o.connect(g);
        o.start(t); o.stop(t + dur + 0.02);
      }
      t += dur + 0.06;
    }
  },

  sirena(dur = 3) {
    const a = audioCtx(), t = a.currentTime;
    const o = a.createOscillator();
    o.type = "square";
    const lfo = a.createOscillator(), lg = a.createGain();
    lfo.frequency.value = pick([0.9, 1.6, 4]);
    lg.gain.value = 380;
    o.frequency.value = 900;
    lfo.connect(lg).connect(o.frequency);
    const lp = a.createBiquadFilter();
    lp.type = "lowpass"; lp.frequency.value = 2400;
    const g = a.createGain();
    env(g, t, 0.12, 0.1, dur);
    o.connect(lp).connect(g).connect(bus);
    o.start(t); lfo.start(t);
    o.stop(t + dur); lfo.stop(t + dur);
  },

  // Espantasuegras
  espantasuegras() {
    const a = audioCtx(), t = a.currentTime;
    const dur = rand(0.6, 1.1);
    const o = a.createOscillator();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(rand(330, 420), t);
    o.frequency.linearRampToValueAtTime(rand(440, 560), t + dur * 0.3);
    o.frequency.linearRampToValueAtTime(rand(300, 380), t + dur);
    const vib = a.createOscillator(), vg = a.createGain();
    vib.frequency.value = 22; vg.gain.value = 18;
    vib.connect(vg).connect(o.frequency);
    const bp = a.createBiquadFilter();
    bp.type = "bandpass"; bp.frequency.value = 1500; bp.Q.value = 2;
    const g = a.createGain();
    env(g, t, 0.5, 0.03, dur);
    o.connect(bp).connect(g).connect(bus);
    o.start(t); vib.start(t); o.stop(t + dur); vib.stop(t + dur);
  },

  // Silbido de cohete subiendo
  silbido() {
    const a = audioCtx(), t = a.currentTime;
    const o = a.createOscillator();
    o.type = "sine";
    o.frequency.setValueAtTime(700, t);
    o.frequency.exponentialRampToValueAtTime(rand(2400, 3400), t + 0.45);
    const g = a.createGain();
    env(g, t, 0.1, 0.05, 0.45);
    o.connect(g).connect(bus);
    o.start(t); o.stop(t + 0.5);
  },

  // Tronido + chisporroteo del cohete
  crack() {
    const a = audioCtx(), t = a.currentTime;
    const src = a.createBufferSource();
    src.buffer = ruidoBuffer(0.5, 5);
    const hp = a.createBiquadFilter();
    hp.type = "highpass"; hp.frequency.value = 300;
    const g = a.createGain(); g.gain.value = 0.9;
    src.connect(hp).connect(g).connect(bus);
    src.start(t);
    for (let i = 0; i < 14; i++) {
      const s = a.createBufferSource();
      s.buffer = ruidoBuffer(0.02, 1);
      const sg = a.createGain(); sg.gain.value = rand(0.15, 0.45);
      s.connect(sg).connect(bus);
      s.start(t + 0.12 + Math.random() * 0.8);
    }
  },

  boing() {
    const a = audioCtx(), t = a.currentTime;
    const o = a.createOscillator();
    o.type = "sine";
    const f = rand(180, 420);
    o.frequency.setValueAtTime(f, t);
    o.frequency.exponentialRampToValueAtTime(f * 0.45, t + 0.35);
    const vib = a.createOscillator(), vg = a.createGain();
    vib.frequency.value = 28; vg.gain.value = f * 0.12;
    vib.connect(vg).connect(o.frequency);
    const g = a.createGain();
    env(g, t, 0.22, 0.005, 0.38);
    o.connect(g).connect(bus);
    o.start(t); vib.start(t); o.stop(t + 0.4); vib.stop(t + 0.4);
  },

  pop() {
    const a = audioCtx(), t = a.currentTime;
    const o = a.createOscillator();
    o.frequency.setValueAtTime(900, t);
    o.frequency.exponentialRampToValueAtTime(120, t + 0.12);
    const g = a.createGain();
    env(g, t, 0.6, 0.002, 0.14);
    o.connect(g).connect(bus);
    o.start(t); o.stop(t + 0.15);
  },

  cencerro() {
    const a = audioCtx(), t = a.currentTime;
    const g = a.createGain();
    env(g, t, 0.25, 0.002, 0.3);
    const bp = a.createBiquadFilter();
    bp.type = "bandpass"; bp.frequency.value = 2640; bp.Q.value = 3;
    g.connect(bp).connect(bus);
    for (const f of [587, 845]) {
      const o = a.createOscillator();
      o.type = "square"; o.frequency.value = f;
      o.connect(g); o.start(t); o.stop(t + 0.3);
    }
  },

  // "¡Wuuu!" de multitud (ruido filtrado con formantes que suben)
  multitud(dur = 2) {
    const a = audioCtx(), t = a.currentTime;
    const src = a.createBufferSource();
    src.buffer = ruidoBuffer(dur, 0.6);
    const bp = a.createBiquadFilter();
    bp.type = "bandpass"; bp.Q.value = 1.4;
    bp.frequency.setValueAtTime(500, t);
    bp.frequency.linearRampToValueAtTime(1400, t + dur * 0.4);
    bp.frequency.linearRampToValueAtTime(900, t + dur);
    const g = a.createGain();
    env(g, t, 0.7, 0.25, dur);
    src.connect(bp).connect(g).connect(bus);
    src.start(t);
  },
};

let ultimoBoing = 0;
function boingLimitado() {
  const ahora = performance.now();
  if (ahora - ultimoBoing < 120) return;
  ultimoBoing = ahora;
  SFX.boing();
}

// El escándalo de fondo: cada rato suena algo distinto encima de la canción
function escandalo() {
  const sonidos = [SFX.airhorn, SFX.airhorn, SFX.espantasuegras, SFX.espantasuegras, SFX.cencerro, () => SFX.sirena(2), () => SFX.multitud(1.6)];
  const tick = () => {
    if (!document.hidden) {
      pick(sonidos)();
      if (Math.random() < 0.45) setTimeout(() => pick(sonidos)(), rand(120, 400));
      if (Math.random() < 0.3) shake = Math.max(shake, 5);
    }
    setTimeout(tick, rand(500, 1400));
  };
  tick();
  // cencerro constante, como si alguien no supiera parar
  setInterval(() => { if (!document.hidden && Math.random() < 0.7) SFX.cencerro(); }, 380);
}

// Melodía aproximada de "Las Mañanitas" (tradicional), en kazoo digital.
const N = { G4: 392, A4: 440, B4: 493.9, C5: 523.3, D5: 587.3, E5: 659.3, F5: 698.5, G5: 784 };
const MELODIA = [
  ["G4", 1], ["G4", 1], ["C5", 1], ["C5", 1], ["C5", 1], ["E5", 1], ["D5", 1], ["C5", 2],
  ["B4", 1], ["C5", 1], ["D5", 1], ["D5", 1], ["D5", 1], ["E5", 1], ["D5", 3],
  ["E5", 1], ["E5", 1], ["F5", 1], ["G5", 1], ["G5", 1], ["G5", 1], ["F5", 1], ["E5", 1], ["D5", 2],
  ["D5", 1], ["E5", 1], ["F5", 1], ["E5", 1], ["D5", 1], ["B4", 1], ["C5", 3], [null, 2],
];
const kazoo = { activo: false };
function tocarKazoo() {
  const a = audioCtx();
  const beat = 0.3;
  let t = a.currentTime + 0.05;
  const vol = a.createGain();
  vol.gain.value = 0.3;
  vol.connect(bus);
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
      o.connect(bp).connect(g).connect(vol);
      o.start(t); vib.start(t);
      o.stop(t + dur * beat); vib.stop(t + dur * beat);
    }
    t += dur * beat;
  }
  setTimeout(tocarKazoo, (t - a.currentTime) * 1000);
}

let mp3Listo = Promise.resolve(false);
function ponerCancion() {
  mp3Listo.then((ok) => {
    if (ok) {
      cancion.currentTime = 0;
      cancion.volume = 1;
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
  if (master) master.gain.value = silenciado ? 0 : 1;
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

// Fondo de estrellitas que gira
const estrellas = (() => {
  const n = 1500;
  const pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    pos[i * 3] = rand(-300, 300);
    pos[i * 3 + 1] = rand(-200, 200);
    pos[i * 3 + 2] = rand(-300, 0);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ size: 1.4, map: sprite, color: 0xffe6f5, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
  const p = new THREE.Points(geo, mat);
  scene.add(p);
  return p;
})();

// Polvo dorado flotando en el landing (elegante... por ahora)
const polvo = (() => {
  const n = 900;
  const pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    pos[i * 3] = rand(-160, 160);
    pos[i * 3 + 1] = rand(-90, 90);
    pos[i * 3 + 2] = rand(-120, 30);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({ size: 0.9, map: sprite, color: 0xd9b979, transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending });
  const p = new THREE.Points(geo, mat);
  scene.add(p);
  return p;
})();
let enLanding = true;

let shake = 0;
function loop() {
  requestAnimationFrame(loop);
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
  estrellas.rotation.z += 0.0008;
  estrellas.rotation.y += 0.0003;
  if (polvo.visible) {
    const arr = polvo.geometry.attributes.position.array;
    for (let j = 1; j < arr.length; j += 3) { arr[j] += 0.03; if (arr[j] > 90) arr[j] = -90; }
    polvo.geometry.attributes.position.needsUpdate = true;
    polvo.rotation.y += 0.0004;
  }
  const px = enLanding ? mouseX * 8 : 0, py = enLanding ? -mouseY * 5 : 0;
  camera.position.x += (px - camera.position.x) * 0.04;
  camera.position.y += (py - camera.position.y) * 0.04;
  camera.position.x += (Math.random() - 0.5) * shake;
  camera.position.y += (Math.random() - 0.5) * shake;
  if (!enLanding) { camera.position.x *= 0.8; camera.position.y *= 0.8; }
  shake *= 0.92;
  renderer.render(scene, camera);
}
loop();

function fuegosArtificiales() {
  const uno = () => {
    if (document.hidden) return;
    SFX.silbido();
    setTimeout(() => {
      const w = 70 * camera.aspect;
      burst(rand(-w * 0.8, w * 0.8), rand(-10, 45), rand(-40, 0), 320, rand(1.2, 2.2), 1.8, [pick(PALETA), pick(PALETA), 0xffffff]);
      SFX.crack();
    }, 420);
  };
  setInterval(uno, 650);
  setInterval(() => { if (Math.random() < 0.6) uno(); }, 1100);
}

// Estrobo de colores
function estrobo() {
  const el = $("strobe");
  const colores = ["#ff3d9a", "#ffd23f", "#2ee6d6", "#a66bff", "#ff7a2f", "#4dff88"];
  setInterval(() => {
    if (document.hidden) return;
    el.style.background = `radial-gradient(circle at ${rand(10, 90)}% ${rand(10, 90)}%, ${pick(colores)}, transparent 60%)`;
    anime({ targets: el, opacity: [rand(0.25, 0.5), 0], duration: 420, easing: "easeOutQuad" });
  }, 480);
}

// Lluvia de emojis
const EMOJIS = ["🎉", "🎂", "🎈", "🥳", "📢", "🔥", "💥", "🎊", "🍰", "🪅", "🌮", "💃", "🕺", "✨"];
function lluvia() {
  setInterval(() => {
    if (document.hidden) return;
    const el = document.createElement("div");
    el.className = "lluvia";
    el.textContent = pick(EMOJIS);
    el.style.fontSize = rand(1.6, 3.6) + "rem";
    $("caos").appendChild(el);
    const x = rand(0, window.innerWidth - 40);
    anime({
      targets: el,
      translateX: [x, x + rand(-160, 160)],
      translateY: [-80, window.innerHeight + 80],
      rotate: [0, rand(-720, 720)],
      duration: rand(1800, 3600),
      easing: "easeInQuad",
      complete: () => el.remove(),
    });
  }, 140);
}

// ============================================================
//  LA FIESTA
// ============================================================
function empezarFiesta() {
  aceptar.disabled = true;
  mensaje.textContent = "Verificando credenciales… ⚠️ Se ha detectado un nivel de fiesta no autorizado.";
  // Desbloquea el audio con este clic (iOS solo deja sonar si empieza dentro del clic):
  // la canción arranca en silencio y se "prende" en la explosión.
  audioCtx().resume();
  cancion.muted = true;
  mp3Listo = cancion.play().then(() => true, () => false);

  // tiembla todo antes de explotar
  SFX.sirena(1.2);
  anime({ targets: ".nav", opacity: 0, duration: 300, easing: "linear" });
  const landingEl = $("landing");
  landingEl.style.transformOrigin = `50% ${window.scrollY + window.innerHeight / 2}px`;
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
  SFX.boom(1.8);
  setTimeout(() => SFX.boom(1.2), 180);
  SFX.airhorn();
  SFX.multitud(3);
  SFX.sirena(5);
  setTimeout(() => SFX.airhorn(), 900);
  shake = 16;
  enLanding = false;
  anime({ targets: polvo.material, opacity: 0, duration: 400, easing: "linear", complete: () => { polvo.visible = false; } });
  anime({ targets: "#flash", opacity: [1, 0], duration: 1100, easing: "easeOutQuad" });
  anime({
    targets: "#landing",
    scale: [1.1, 4], opacity: [1, 0], rotate: 25, duration: 600, easing: "easeInQuad",
    complete: () => {
      $("landing").style.display = "none";
      document.querySelector(".nav").style.display = "none";
      window.scrollTo(0, 0);
    },
  });
  // explosión principal
  burst(0, 0, 0, 4000, 4.2, 2.6);
  burst(0, 0, 0, 1500, 2.2, 3.4, [0xffd23f, 0xff7a2f, 0xffffff]);
  onda(0xffffff, 2.4);
  setTimeout(() => onda(0xff3d9a, 1.8), 120);
  setTimeout(() => onda(0x2ee6d6, 1.4), 260);
  anime({ targets: estrellas.material, opacity: [0, 0.8], duration: 2500, easing: "easeOutQuad" });

  document.body.classList.add("fiesta");
  ponerCancion();

  setTimeout(() => {
    $("fiesta").hidden = false;
    animarTitulo();
    fuegosArtificiales();
    estrobo();
    lluvia();
  }, 450);
  setTimeout(() => soltarCaos(), 1600);
  setTimeout(escandalo, 1800);
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
    SFX.pop();
    SFX.espantasuegras();
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
      if (Math.random() < 0.5) boingLimitado();
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
  shake = 14;
  SFX.boom(1.6);
  SFX.airhorn();
  SFX.sirena(2.5);
  SFX.multitud(2);
  burst(0, 0, 0, 2500, 3.4, 2.4);
  onda(0xffd23f, 2);
  anime({ targets: "#flash", opacity: [0.7, 0], duration: 600, easing: "easeOutQuad" });
  for (let k = 0; k < 8; k++) setTimeout(() => crearBouncer(k % 2 ? "twice" : "vernon"), k * 80);
  for (const b of bouncers) { b.vy = -rand(15, 28); b.vx = rand(-14, 14); b.vr = rand(-25, 25); }
});
