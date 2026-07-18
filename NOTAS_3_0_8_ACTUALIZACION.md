# GutiPilot 3.0.8

- El botón Verificar actualización consulta `version.json` directamente en GitHub Pages sin usar caché.
- Cuando detecta una versión superior, muestra Actualizar ahora.
- Actualizar ahora elimina Service Workers y cachés antiguos, y abre la versión publicada con una URL única.
- La aplicación comprueba silenciosamente nuevas versiones al abrir.
- Mantiene el traslado de piloto al mando, PCH y copiloto/presentado por a Perfil.
