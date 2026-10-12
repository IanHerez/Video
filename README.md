# 🎂 Página de cumpleaños (con caos)

Página estática: la cumpleañera elige su fecha en un calendario que flota sobre una galaxia espiral animada
(three.js, `js/galaxia.js`). Si se equivoca, la página se burla de ella.
Si elige el **11 de octubre** y le da **Enviar**, la galaxia se colapsa en un agujero negro, explota (three.js + anime.js), empiezan a sonar *Las Mañanitas* (y luego *Cómo te voy a olvidar*)
y tus fotos flotan en órbita alrededor del título (al tocar una se ve en grande).

## Archivos de la fiesta

| Qué | Dónde |
| --- | --- |
| Canciones (suenan en orden y se repiten) | `audio/mananitas.mp3`, `audio/como-te-voy-a-olvidar.mp3` |
| Fotos de la galería | `img/fotos/1.jpg` … `img/fotos/5.jpg` |

- Si falta el mp3, suena una versión de emergencia "en kazoo" generada por el navegador.
- Si falta una foto, sale una tarjeta de colores de reemplazo.
- El nombre de la cumpleañera, la fecha y las rutas de las fotos y la canción se cambian en `js/config.js`.
  Si tus fotos son `.png`, tienen otros nombres o agregas más, cambia la lista ahí mismo.
  También puedes ponerle un texto a cada foto: `{ src: "img/fotos/1.jpg", texto: "..." }`.
- Las fotos se ven mejor si son cuadradas y pesan poco (≤ 300 KB cada una).

## Probarla en tu compu

```bash
python3 -m http.server 8000
# abre http://localhost:8000
```

## Subirla a Vercel

1. Entra a [vercel.com](https://vercel.com) → **Add New… → Project** → importa este repositorio de GitHub.
2. Framework Preset: **Other**. No hay que compilar nada; deja vacíos el Build Command y el Output Directory.
3. **Deploy**. Cada vez que hagas push, Vercel la vuelve a publicar sola.

Las librerías (anime.js 3.2.2 y three.js r160) vienen incluidas en `js/vendor/`, así que la página no depende de CDNs.
