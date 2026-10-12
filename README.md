# 🎂 Página de cumpleaños (con caos)

Página estática: la cumpleañera elige su fecha en un calendario que flota sobre una galaxia espiral animada
(three.js, `js/galaxia.js`). Si se equivoca, la página se burla de ella.
Si elige el **11 de octubre** y le da **Enviar**, la galaxia se colapsa en un agujero negro, explota (three.js + anime.js), empiezan a sonar *Las Mañanitas*
y Vernon y Twice se ponen a brincar por toda la pantalla.

## Lo que tienes que poner tú

| Qué | Dónde |
| --- | --- |
| Canción (Las Mañanitas de Cepillín, mp3) | `audio/mananitas.mp3` |
| Fotos de Vernon | `img/vernon/1.jpg` … `img/vernon/6.jpg` |
| Fotos de Twice | `img/twice/nayeon.jpg`, `jeongyeon.jpg`, `momo.jpg`, `sana.jpg`, `jihyo.jpg`, `mina.jpg`, `dahyun.jpg`, `chaeyoung.jpg`, `tzuyu.jpg` |

- Si falta el mp3, suena una versión de emergencia "en kazoo" generada por el navegador.
- Si falta una foto, sale una tarjeta de colores con el nombre del integrante.
- El nombre de la cumpleañera, la fecha y las rutas de las fotos y la canción se cambian en `js/config.js`.
  Si tus fotos son `.png` o tienen otros nombres, cambia la lista ahí mismo.
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
