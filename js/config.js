// ============================================================
//  CONFIGURACIÓN — edita aquí sin miedo
// ============================================================
window.CONFIG = {
  // Cómo se le dice a la cumpleañera en la página
  nombre: "CUMPLEAÑERA",

  // Fecha correcta (día y mes, el año da igual)
  dia: 11,
  mes: 10, // 1 = enero ... 10 = octubre

  // Canciones de la fiesta: suenan en este orden y al terminar la última vuelve a empezar.
  // Si la primera no existe, suena una versión de emergencia "en kazoo" hecha por el navegador.
  canciones: [
    "audio/mananitas.mp3",
    "audio/como-te-voy-a-olvidar.mp3",
  ],

  // Fotos que flotan en órbita alrededor del título durante la fiesta.
  // Pon los archivos en img/fotos/ con estos nombres (o cambia la lista; pueden ser más o menos).
  // Si quieres un texto debajo de una foto, usa { src: "img/fotos/1.jpg", texto: "Aquí va el texto" }.
  // Si una foto no existe, sale una tarjeta de reemplazo.
  fotos: [
    "img/fotos/1.jpg",
    "img/fotos/2.jpg",
    "img/fotos/3.jpg",
    "img/fotos/4.jpg",
    "img/fotos/5.jpg",
  ],
};
