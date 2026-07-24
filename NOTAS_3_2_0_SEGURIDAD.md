# GutiPilot 3.2.0 — Seguridad y confiabilidad

## Cambios principales

- Datos personales predeterminados retirados de `config.js`.
- Validación operacional antes de generar, guardar o volver a generar un PDF.
- Formatos admitidos:
  - Aeródromos: cuatro letras OACI o `ZZZZ`.
  - Hora UTC: `HHMM`, entre `0000` y `2359`.
  - Duraciones: `HHMM`, con minutos entre `00` y `59`.
  - Velocidad: `N`/`K` con cuatro cifras o `M` con tres cifras.
  - Nivel: `A`, `F`, `S`, `M` o `VFR`.
- DEP/ y DEST/ obligatorios en casilla 18 cuando corresponda.
- Exclusión automática de “Ninguno” frente a otras opciones.
- Respaldo y restauración local de perfil e historial.
- Service Worker nuevo para instalación y uso sin conexión.
- Versión unificada en interfaz, scripts y archivo de actualización.
- Mejoras de accesibilidad y navegación móvil.

## Revisión requerida antes de publicar

- Confirmar matrículas, CODE, SUR y equipos de cada aeronave.
- Confirmar teléfonos y correos del directorio con una fuente operacional vigente.
- Probar generación y envío desde un iPhone real.
- Conservar `main` sin cambios hasta aprobar esta versión.
