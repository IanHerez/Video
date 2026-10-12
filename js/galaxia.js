import * as THREE from "./vendor/three.module.min.js";

// ============================================================
//  GALAXIA ESPIRAL DE FONDO (three.js + shaders propios)
//  - se forma girando al cargar la página
//  - gira, brilla y sigue un poco al dedo / mouse
//  - colapsar(): se la traga un agujero negro
//  - explotar(): revienta en todas direcciones
// ============================================================

const rand = (a, b) => a + Math.random() * (b - a);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const ligero = window.matchMedia("(max-width: 700px)").matches || (navigator.hardwareConcurrency || 8) <= 4;

function texturaRadial(stops, size = 256) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d");
  const h = size / 2;
  const grd = g.createRadialGradient(h, h, 0, h, h, h);
  for (const [p, col] of stops) grd.addColorStop(p, col);
  g.fillStyle = grd;
  g.fillRect(0, 0, size, size);
  return new THREE.CanvasTexture(c);
}

// Nube de nebulosa: muchas manchas suaves encimadas
function texturaNube() {
  const size = 256;
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d");
  for (let i = 0; i < 26; i++) {
    const a = Math.random() * Math.PI * 2;
    const d = Math.pow(Math.random(), 0.7) * size * 0.28;
    const x = size / 2 + Math.cos(a) * d;
    const y = size / 2 + Math.sin(a) * d;
    const r = rand(size * 0.12, size * 0.3);
    const grd = g.createRadialGradient(x, y, 0, x, y, r);
    grd.addColorStop(0, `rgba(255,255,255,${rand(0.08, 0.2)})`);
    grd.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = grd;
    g.fillRect(0, 0, size, size);
  }
  return new THREE.CanvasTexture(c);
}

function texturaFugaz() {
  const c = document.createElement("canvas");
  c.width = 256; c.height = 16;
  const g = c.getContext("2d");
  const grd = g.createLinearGradient(0, 0, 256, 0);
  grd.addColorStop(0, "rgba(255,255,255,0)");
  grd.addColorStop(0.85, "rgba(200,225,255,.55)");
  grd.addColorStop(1, "rgba(255,255,255,1)");
  g.fillStyle = grd;
  g.beginPath();
  g.moveTo(0, 8); g.lineTo(250, 3); g.arc(250, 8, 5, -Math.PI / 2, Math.PI / 2); g.lineTo(0, 8);
  g.fill();
  return new THREE.CanvasTexture(c);
}

const VERT_GALAXIA = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uForm;
  uniform float uImplode;
  uniform float uExplode;
  attribute float aScale;
  attribute vec3 aRandom;
  varying vec3 vColor;
  varying float vAlpha;

  void main() {
    vec3 base = position;
    float r = length(base.xz);
    float ang = atan(base.z, base.x);

    // giro de toda la espiral + cada estrella va y viene a lo largo de su órbita
    ang += uTime * 0.05;
    ang += 0.12 * sin(uTime * (0.25 + 0.2 * aRandom.y) + aRandom.z * 6.2831);
    // remolino del agujero negro: el centro gira muchísimo más rápido
    ang += uImplode * uImplode * 14.0 / (r * 0.05 + 1.0);

    float breathe = 1.0 + 0.025 * sin(uTime * 0.6 + r * 0.15);
    vec3 p = vec3(cos(ang) * r * breathe, base.y, sin(ang) * r * breathe);

    // intro: de una nube revuelta a la espiral
    vec3 revuelto = p * 2.6 + aRandom * 70.0;
    p = mix(revuelto, p, uForm);

    vec3 dir = normalize(p + aRandom * (r * 0.5 + 4.0) + vec3(0.0001));

    // colapso hacia el centro
    p *= 1.0 - uImplode * 0.95;

    // explosión
    float fuerza = (0.3 + 0.7 * fract(aRandom.x * 43.758 + 0.5)) * 340.0;
    p += dir * uExplode * fuerza;

    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;

    float brillo = 0.65 + 0.35 * sin(uTime * (1.2 + aRandom.y * 2.5) + aRandom.z * 50.0);
    float size = uSize * aScale * brillo * (1.0 + uImplode * 1.6 + uExplode * 1.2);
    gl_PointSize = min(size * uPixelRatio * (120.0 / max(-mv.z, 1.0)), 64.0);

    vColor = mix(color, vec3(1.0, 0.95, 0.88), uImplode * 0.7);
    vAlpha = (0.15 + 0.85 * uForm) * (1.0 - smoothstep(0.3, 1.0, uExplode));
  }
`;

const FRAG_PUNTO = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = pow(smoothstep(0.5, 0.0, d), 2.2);
    gl_FragColor = vec4(vColor, a * vAlpha);
    #include <colorspace_fragment>
  }
`;

const VERT_ESTRELLAS = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uOpacity;
  attribute float aScale;
  attribute float aFase;
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    float t = 0.5 + 0.5 * sin(uTime * (0.8 + aFase * 2.0) + aFase * 30.0);
    gl_PointSize = aScale * (0.6 + t) * uPixelRatio * (260.0 / max(-mv.z, 1.0));
    vColor = color;
    vAlpha = uOpacity * (0.35 + 0.65 * t);
  }
`;

export function crearGalaxia(scene, renderer, camera) {
  const pr = renderer.getPixelRatio();

  // vista = rodar en pantalla (z) + inclinación del disco (x)
  const vista = new THREE.Group();
  const disco = new THREE.Group();
  vista.add(disco);
  vista.position.set(0, 2, -12);
  scene.add(vista);
  const pose = { roll: -1.6, tilt: 1.25, zoom: 0.55 };

  // ---------------- estrellas de la galaxia ----------------
  const N = ligero ? 55000 : 130000;
  const R = 58;
  const BRAZOS = 4;
  const pos = new Float32Array(N * 3);
  const col = new Float32Array(N * 3);
  const esc = new Float32Array(N);
  const rnd = new Float32Array(N * 3);

  const cCentro = new THREE.Color("#ffd9a0");
  const cMedio = new THREE.Color("#ff4fa3");
  const cFuera = new THREE.Color("#4a6dff");
  const cCyan = new THREE.Color("#2ee6d6");
  const cMorado = new THREE.Color("#a66bff");
  const c = new THREE.Color();

  for (let i = 0; i < N; i++) {
    const i3 = i * 3;
    const bulbo = Math.random() < 0.14;
    let x, y, z, rr;
    if (bulbo) {
      // bulbo central esférico y brillante
      rr = Math.pow(Math.random(), 2) * 11;
      const th = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      x = rr * Math.sin(ph) * Math.cos(th);
      y = rr * Math.cos(ph) * 0.6;
      z = rr * Math.sin(ph) * Math.sin(th);
    } else {
      rr = Math.pow(Math.random(), 1.5) * R + 2;
      const brazo = ((i % BRAZOS) / BRAZOS) * Math.PI * 2;
      const giro = rr * 0.075;
      const disp = (v) => Math.pow(Math.random(), 3.2) * (Math.random() < 0.5 ? 1 : -1) * v;
      const abre = 0.2 * rr + 1.2;
      x = Math.cos(brazo + giro) * rr + disp(abre);
      z = Math.sin(brazo + giro) * rr + disp(abre);
      y = disp(abre * 0.25) + disp(4) * Math.exp(-rr / 14);
    }
    pos[i3] = x; pos[i3 + 1] = y; pos[i3 + 2] = z;

    const t = Math.min(rr / R, 1);
    if (t < 0.3) c.copy(cCentro).lerp(cMedio, t / 0.3);
    else c.copy(cMedio).lerp(cFuera, (t - 0.3) / 0.7);
    const extra = Math.random();
    if (extra < 0.08) c.lerp(cCyan, 0.7);
    else if (extra < 0.16) c.lerp(cMorado, 0.6);
    else if (extra < 0.2) c.setRGB(1, 1, 1);
    col[i3] = c.r; col[i3 + 1] = c.g; col[i3 + 2] = c.b;

    esc[i] = (bulbo ? rand(0.5, 1.6) : rand(0.25, 1.15)) * (extra < 0.2 && extra >= 0.16 ? 1.8 : 1);
    rnd[i3] = rand(-1, 1); rnd[i3 + 1] = rand(-1, 1); rnd[i3 + 2] = rand(-1, 1);
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("color", new THREE.BufferAttribute(col, 3));
  geo.setAttribute("aScale", new THREE.BufferAttribute(esc, 1));
  geo.setAttribute("aRandom", new THREE.BufferAttribute(rnd, 3));

  const uniforms = {
    uTime: { value: 0 },
    uSize: { value: ligero ? 4 : 3.6 },
    uPixelRatio: { value: pr },
    uForm: { value: 0 },
    uImplode: { value: 0 },
    uExplode: { value: 0 },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms, vertexShader: VERT_GALAXIA, fragmentShader: FRAG_PUNTO,
    vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const puntos = new THREE.Points(geo, mat);
  disco.add(puntos);

  // ---------------- núcleo brillante ----------------
  const texNucleo = texturaRadial([
    [0, "rgba(255,255,255,1)"], [0.08, "rgba(255,245,225,.9)"],
    [0.3, "rgba(255,180,200,.25)"], [1, "rgba(255,120,200,0)"],
  ]);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({
    map: texNucleo, color: 0xff8fc8, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  halo.scale.setScalar(75);
  const nucleo = new THREE.Sprite(new THREE.SpriteMaterial({
    map: texNucleo, color: 0xfff0d8, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  nucleo.scale.setScalar(26);
  disco.add(halo, nucleo);

  // ---------------- nebulosas ----------------
  const nubes = new THREE.Group();
  disco.add(nubes);
  const texNube = texturaNube();
  const COLORES_NUBE = [0xff3d9a, 0xa66bff, 0x2ee6d6, 0x4a6dff, 0xff7a2f, 0xff5fd0];
  const listaNubes = [];
  for (let i = 0; i < (ligero ? 12 : 18); i++) {
    const rr = rand(10, 52);
    const brazo = ((i % BRAZOS) / BRAZOS) * Math.PI * 2 + rr * 0.075 + rand(-0.35, 0.35);
    const m = new THREE.SpriteMaterial({
      map: texNube, color: pick(COLORES_NUBE), transparent: true, opacity: 0,
      depthWrite: false, blending: THREE.AdditiveBlending, rotation: rand(0, Math.PI * 2),
    });
    const s = new THREE.Sprite(m);
    s.position.set(Math.cos(brazo) * rr, rand(-2, 2), Math.sin(brazo) * rr);
    s.scale.setScalar(rand(22, 48));
    nubes.add(s);
    listaNubes.push({ s, op: rand(0.2, 0.38), vr: rand(-0.03, 0.03) });
  }

  // ---------------- estrellas lejanas que titilan ----------------
  const NF = ligero ? 2500 : 5000;
  const fpos = new Float32Array(NF * 3);
  const fcol = new Float32Array(NF * 3);
  const fesc = new Float32Array(NF);
  const ffase = new Float32Array(NF);
  const TONOS = ["#ffffff", "#ffe6f5", "#cfe0ff", "#fff1c9", "#bff6ff"];
  for (let i = 0; i < NF; i++) {
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    const d = rand(260, 520);
    fpos[i * 3] = d * Math.sin(ph) * Math.cos(th);
    fpos[i * 3 + 1] = d * Math.sin(ph) * Math.sin(th);
    fpos[i * 3 + 2] = d * Math.cos(ph) - 120;
    c.set(pick(TONOS));
    fcol[i * 3] = c.r; fcol[i * 3 + 1] = c.g; fcol[i * 3 + 2] = c.b;
    fesc[i] = Math.random() < 0.03 ? rand(3, 4.5) : rand(0.8, 2.2);
    ffase[i] = Math.random();
  }
  const fgeo = new THREE.BufferGeometry();
  fgeo.setAttribute("position", new THREE.BufferAttribute(fpos, 3));
  fgeo.setAttribute("color", new THREE.BufferAttribute(fcol, 3));
  fgeo.setAttribute("aScale", new THREE.BufferAttribute(fesc, 1));
  fgeo.setAttribute("aFase", new THREE.BufferAttribute(ffase, 1));
  const fondoUniforms = { uTime: { value: 0 }, uPixelRatio: { value: pr }, uOpacity: { value: 0 } };
  const fondo = new THREE.Points(fgeo, new THREE.ShaderMaterial({
    uniforms: fondoUniforms, vertexShader: VERT_ESTRELLAS, fragmentShader: FRAG_PUNTO,
    vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  scene.add(fondo);

  // ---------------- estrellas fugaces ----------------
  const texFugaz = texturaFugaz();
  const fugaces = [];
  let siguienteFugaz = 2.5;
  function lanzarFugaz() {
    const m = new THREE.SpriteMaterial({ map: texFugaz, transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending });
    const s = new THREE.Sprite(m);
    const zz = -70;
    const alto = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * (camera.position.z - zz);
    const ancho = alto * camera.aspect;
    const derecha = Math.random() < 0.5;
    const ang = derecha ? rand(-0.75, -0.3) : Math.PI + rand(0.3, 0.75);
    m.rotation = ang;
    s.position.set(rand(-ancho, ancho), rand(alto * 0.1, alto * 0.95), zz);
    s.scale.set(rand(28, 50), 1.1, 1);
    const v = rand(150, 230);
    fugaces.push({ s, vx: Math.cos(ang) * v, vy: Math.sin(ang) * v, vida: 0, dur: rand(0.8, 1.3) });
    scene.add(s);
  }

  // ---------------- seguir al mouse / dedo ----------------
  const ptr = { x: 0, y: 0, tx: 0, ty: 0 };
  window.addEventListener("pointermove", (e) => {
    ptr.tx = (e.clientX / window.innerWidth) * 2 - 1;
    ptr.ty = (e.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  // ---------------- intro: la galaxia se forma girando ----------------
  anime({ targets: uniforms.uForm, value: [0, 1], duration: 5200, easing: "easeOutCubic" });
  anime({ targets: pose, roll: -0.38, tilt: 1.02, zoom: ligero ? 1 : 1.3, duration: 6000, easing: "easeOutQuart" });
  anime({ targets: fondoUniforms.uOpacity, value: [0, 1], duration: 3000, easing: "easeOutQuad" });
  anime({ targets: [halo.material, nucleo.material], opacity: (el, i) => [0, i === 0 ? 0.6 : 1], duration: 3500, delay: 900, easing: "easeOutQuad" });
  listaNubes.forEach((n, i) => anime({ targets: n.s.material, opacity: [0, n.op], duration: 4000, delay: 1200 + i * 120, easing: "easeOutQuad" }));

  let viva = true;
  let fugacesActivas = true;

  function update(t, dt) {
    uniforms.uTime.value = t;
    fondoUniforms.uTime.value = t;

    ptr.x += (ptr.tx - ptr.x) * 0.04;
    ptr.y += (ptr.ty - ptr.y) * 0.04;

    if (viva) {
      vista.rotation.z = pose.roll + Math.sin(t * 0.07) * 0.05 - ptr.x * 0.12;
      disco.rotation.x = pose.tilt + Math.sin(t * 0.11) * 0.06 + ptr.y * 0.18;
      disco.rotation.y = ptr.x * 0.1;
      vista.scale.setScalar(pose.zoom);
      // las nebulosas giran junto con la espiral
      nubes.rotation.y = -t * 0.05;
      for (const n of listaNubes) n.s.material.rotation += n.vr * dt;
      const pulso = 1 + Math.sin(t * 1.3) * 0.04;
      nucleo.scale.setScalar(26 * pulso * (1 + uniforms.uImplode.value * 0.8));
    }
    fondo.rotation.y = t * 0.004 + ptr.x * 0.03;
    fondo.rotation.x = ptr.y * 0.02;

    if (fugacesActivas) {
      siguienteFugaz -= dt;
      if (siguienteFugaz <= 0) { lanzarFugaz(); siguienteFugaz = rand(1.8, 4.5); }
    }
    for (let i = fugaces.length - 1; i >= 0; i--) {
      const f = fugaces[i];
      f.vida += dt;
      f.s.position.x += f.vx * dt;
      f.s.position.y += f.vy * dt;
      const k = f.vida / f.dur;
      f.s.material.opacity = Math.sin(Math.min(k, 1) * Math.PI) * 0.95;
      if (k >= 1) {
        scene.remove(f.s); f.s.material.dispose();
        fugaces.splice(i, 1);
      }
    }
  }

  // El agujero negro se traga todo (dura lo que tiembla el calendario)
  function colapsar(ms) {
    anime.remove([uniforms.uForm]);
    uniforms.uForm.value = 1;
    anime({ targets: uniforms.uImplode, value: 1, duration: ms, easing: "easeInCubic" });
    anime({ targets: halo.material, opacity: 0.9, duration: ms, easing: "easeInQuad" });
    anime({ targets: listaNubes.map((n) => n.s.position), x: 0, y: 0, z: 0, duration: ms, easing: "easeInCubic" });
    anime({ targets: listaNubes.map((n) => n.s.material), opacity: 0.6, duration: ms, easing: "easeInQuad" });
  }

  function explotar() {
    fugacesActivas = false;
    anime({ targets: uniforms.uExplode, value: 1, duration: 3200, easing: "easeOutExpo" });
    anime({ targets: uniforms.uImplode, value: 0, duration: 900, easing: "easeOutQuad" });
    anime({ targets: nucleo.scale, x: 220, y: 220, duration: 500, easing: "easeOutExpo" });
    anime({ targets: halo.scale, x: 400, y: 400, duration: 1400, easing: "easeOutExpo" });
    anime({ targets: [nucleo.material, halo.material], opacity: 0, duration: 1600, easing: "easeOutQuad" });
    listaNubes.forEach((n) => {
      const a = Math.random() * Math.PI * 2;
      const d = rand(120, 260);
      anime({ targets: n.s.position, x: Math.cos(a) * d, y: rand(-60, 60), z: Math.sin(a) * d, duration: 2600, easing: "easeOutExpo" });
      anime({ targets: n.s.scale, x: n.s.scale.x * 3, y: n.s.scale.y * 3, duration: 2600, easing: "easeOutExpo" });
      anime({ targets: n.s.material, opacity: 0, duration: 2600, easing: "easeOutQuad" });
    });
    // las estrellas lejanas se quedan de fondo para la fiesta
    setTimeout(() => {
      viva = false;
      scene.remove(vista);
      geo.dispose(); mat.dispose();
      texNucleo.dispose(); texNube.dispose();
      halo.material.dispose(); nucleo.material.dispose();
      listaNubes.forEach((n) => n.s.material.dispose());
    }, 3400);
  }

  return { update, colapsar, explotar };
}
